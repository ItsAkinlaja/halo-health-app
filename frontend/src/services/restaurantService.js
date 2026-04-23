import { api } from './api';

export const restaurantService = {
  async scanMenu(imageUri, profileId) {
    const response = await api.post('/restaurant/scan-menu', {
      imageUri,
      profileId
    });
    return response.data;
  },

  async getMenuAudio(menuAnalysis) {
    const response = await api.post('/restaurant/scan-menu/audio', {
      menuAnalysis
    }, {
      responseType: 'blob'
    });
    return response.data;
  },
};
