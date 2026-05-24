import { supabase } from './supabase';
import storage, { STORAGE_KEYS } from '../utils/storage';

// Use EXPO_PUBLIC_API_URL when set; default to the live Railway backend.
const API_URL = process.env.EXPO_PUBLIC_API_URL ||
  'https://halo-health-app-production.up.railway.app';

console.log('[API] Connecting to:', API_URL);

const REQUEST_TIMEOUT = 15000; // 15 seconds

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getAuthToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;

      // Fallback: recover from locally persisted session to avoid unauthenticated race conditions.
      const storedSession = await storage.getItem(STORAGE_KEYS.USER_SESSION);
      if (storedSession?.access_token) {
        if (storedSession?.refresh_token) {
          try {
            const { data } = await supabase.auth.setSession({
              access_token: storedSession.access_token,
              refresh_token: storedSession.refresh_token,
            });
            if (data?.session?.access_token) {
              await storage.setItem(STORAGE_KEYS.USER_SESSION, data.session);
              return data.session.access_token;
            }
          } catch (rehydrateError) {
            console.warn('Failed to rehydrate Supabase session:', rehydrateError.message);
          }
        }

        return storedSession.access_token;
      }

      return null;
    } catch (error) {
      console.warn('Failed to get auth token:', error.message);
      return null;
    }
  }

  _isFormData(body) {
    if (!body) return false;
    // React Native FormData may not satisfy instanceof across environments
    try {
      if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
    } catch (e) {
      // ignore
    }
    return typeof body.append === 'function';
  }

  async request(endpoint, options = {}, _isRetry = false) {
    const token = await this.getAuthToken();
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    let requestUrl = `${this.baseURL}${endpoint}`;

    if (options.params && typeof options.params === 'object') {
      const searchParams = new URLSearchParams();

      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        requestUrl += `${endpoint.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    // Remove Content-Type for FormData (robust detection)
    if (this._isFormData(options.body)) {
      delete config.headers['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(requestUrl, config);
      clearTimeout(timeoutId);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        // On 401, try to refresh the session once then retry the original request
        if (response.status === 401 && !_isRetry) {
          const { data, error } = await supabase.auth.refreshSession();
          if (!error && data?.session) {
            // Retry with the fresh token
            return this.request(endpoint, options, true);
          }
          // Refresh failed, so sign the user out and return them to login.
          await supabase.auth.signOut();
        }
        
        const error = new Error(responseData.message || responseData.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      }

      if (
        error.message === 'Network request failed' ||
        error.message === 'Failed to fetch' ||
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError'
      ) {
        const errorMsg = `Unable to reach server at ${this.baseURL}. \n\n` +
          `1. Ensure your backend is running.\n` +
          `2. If using a physical device, set EXPO_PUBLIC_API_URL in your .env to your machine's local IP (e.g., http://192.168.1.X:3001).\n` +
          `3. Ensure both device and machine are on the same Wi-Fi.`;
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    // Check cache
    const cacheKey = `GET:${endpoint}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await this.request(endpoint, { ...options, method: 'GET' });
    
    // Cache response
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  async post(endpoint, body, options = {}) {
    const isForm = this._isFormData(body);
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isForm ? body : JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    const isForm = this._isFormData(body);
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isForm ? body : JSON.stringify(body),
    });
  }

  async delete(endpoint, body, options = {}) {
    const isForm = this._isFormData(body);
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
      ...(body && { body: isForm ? body : JSON.stringify(body) }),
    });
  }

  clearCache() {
    this.cache.clear();
  }

  invalidateCache(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const api = new ApiClient();
