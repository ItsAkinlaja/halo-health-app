import { api } from './api';

export const alternativesService = {
  async getAlternatives(productId, profileId, limit = 5) {
    try {
      const params = { limit };
      if (profileId) {
        params.profileId = profileId;
      }
      
      const response = await api.get(`/api/alternatives/${productId}`, { params });
      return response.data?.alternatives || response.data?.data?.alternatives || [];
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      return [];
    }
  },
};
