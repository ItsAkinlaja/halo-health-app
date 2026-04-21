import { api } from './api';

export const productService = {
  /**
   * Search products by name or brand
   */
  async searchProducts(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      limit: options.limit || 20,
      offset: options.offset || 0,
    });
    const res = await api.get(`/api/products/search?${params}`);
    // Backend returns { data: { products: [...] } }
    return res.data?.products ?? res.data ?? res;
  },

  async getProductByBarcode(barcode) {
    const res = await api.get(`/api/products/barcode/${barcode}`);
    return res.data?.product ?? res.data ?? res;
  },

  async getProductDetails(productId) {
    const res = await api.get(`/api/products/${productId}`);
    return res.data?.product ?? res.data ?? res;
  },

  async getProductById(productId) {
    const res = await api.get(`/api/products/${productId}`);
    return res.data?.product ?? res.data ?? res;
  },

  async getAlternatives(productId, profileId) {
    const params = new URLSearchParams({ profileId });
    const res = await api.get(`/api/products/${productId}/alternatives?${params}`);
    return res.data?.alternatives ?? res.data ?? res;
  },

  async saveProduct(userOrProductId, productId) {
    return api.post('/api/scans/save', { productId, listType: 'clean_choices' });
  },

  async unsaveProduct(userOrProductId, productId) {
    return api.delete(`/api/scans/save/${productId}`);
  },

  async getSavedProducts(profileId) {
    const res = await api.get('/api/scans/saved');
    return res.data ?? res;
  },

  async getCategories() {
    const res = await api.get('/api/products/categories');
    return res.data ?? res;
  },

  async getProductsByCategory(category, options = {}) {
    const params = new URLSearchParams({
      category,
      limit: options.limit || 20,
      offset: options.offset || 0,
    });
    const res = await api.get(`/api/products/category?${params}`);
    return res.data?.products ?? res.data ?? res;
  },
};
