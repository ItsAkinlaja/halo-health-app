import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'android' ? 'http://172.20.10.3:3001' : 'http://172.20.10.3:3001'); 
// Using local IP 172.20.10.3 for hotspot connectivity
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
      return session?.access_token;
    } catch (error) {
      console.warn('Failed to get auth token:', error.message);
      return null;
    }
  }

  async request(endpoint, options = {}) {
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

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle specific status codes
        if (response.status === 401) {
          // Optional: handle logout or token refresh
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
          `2. If using a physical device, use your machine's local IP (e.g., http://192.168.1.X:3001) instead of localhost.\n` +
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
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
      ...(body && { body: JSON.stringify(body) }),
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
