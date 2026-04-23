import { api } from './api';

export const alternativesService = {
  async getAlternatives(productId, profileId, limit = 5) {
    const response = await api.get(`/alternatives/${productId}`, {
      params: { profileId, limit }
    });
    return response.data.alternatives;
  },
};
