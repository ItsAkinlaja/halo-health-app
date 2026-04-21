import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (
        error.message === 'Network request failed' ||
        error.message === 'Failed to fetch' ||
        error.message?.includes('NetworkError') ||
        error.name === 'TypeError'
      ) {
        throw new Error('Unable to reach server. Make sure the backend is running.');
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
