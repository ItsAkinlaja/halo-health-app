import api from './api';

class WaterService {
  async searchProducts(category = 'all', query = '') {
    try {
      const response = await api.get('/water/search', {
        params: { category, query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching water products:', error);
      throw error;
    }
  }

  async getTopRated(category = 'all', limit = 10) {
    try {
      const response = await api.get('/water/top-rated', {
        params: { category, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top rated water products:', error);
      throw error;
    }
  }

  async getProductByBarcode(barcode) {
    try {
      const response = await api.get(`/water/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting water product by barcode:', error);
      throw error;
    }
  }

  async scanProduct(barcode) {
    try {
      const response = await api.post('/water/scan', { barcode });
      return response.data;
    } catch (error) {
      console.error('Error scanning water product:', error);
      throw error;
    }
  }

  async getUserScans(limit = 20) {
    try {
      const response = await api.get('/water/scans', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user water scans:', error);
      throw error;
    }
  }
}

export default new WaterService();
