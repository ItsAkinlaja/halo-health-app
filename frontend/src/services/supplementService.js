import api from './api';

class SupplementService {
  async searchSupplements(category = 'all', query = '') {
    try {
      const response = await api.get('/supplements/search', {
        params: { category, query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching supplements:', error);
      throw error;
    }
  }

  async getTopRated(category = 'all', limit = 10) {
    try {
      const response = await api.get('/supplements/top-rated', {
        params: { category, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top rated supplements:', error);
      throw error;
    }
  }

  async getSupplementByBarcode(barcode) {
    try {
      const response = await api.get(`/supplements/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting supplement by barcode:', error);
      throw error;
    }
  }

  async scanSupplement(barcode) {
    try {
      const response = await api.post('/supplements/scan', { barcode });
      return response.data;
    } catch (error) {
      console.error('Error scanning supplement:', error);
      throw error;
    }
  }

  async getUserSupplements() {
    try {
      const response = await api.get('/supplements/my-supplements');
      return response.data;
    } catch (error) {
      console.error('Error getting user supplements:', error);
      throw error;
    }
  }

  async addUserSupplement(supplementId, details) {
    try {
      const response = await api.post('/supplements/my-supplements', {
        supplementId,
        ...details
      });
      return response.data;
    } catch (error) {
      console.error('Error adding user supplement:', error);
      throw error;
    }
  }

  async removeUserSupplement(supplementId) {
    try {
      const response = await api.delete(`/supplements/my-supplements/${supplementId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing user supplement:', error);
      throw error;
    }
  }
}

export default new SupplementService();
