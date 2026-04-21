import { api } from './api';

export const profileService = {
  async getUserProfile(userId) {
    const res = await api.get(`/api/profiles/user/${userId}`);
    return res.data ?? res;
  },

  async updateUserProfile(userId, data) {
    const res = await api.put(`/api/profiles/user/${userId}`, data);
    return res.data ?? res;
  },

  async getProfiles(userId) {
    const res = await api.get(`/api/profiles?userId=${userId}`);
    return res.data ?? res;
  },

  async createProfile(data) {
    const res = await api.post('/api/profiles', data);
    return res.data ?? res;
  },

  async updateProfile(profileId, data) {
    const res = await api.put(`/api/profiles/${profileId}`, data);
    return res.data ?? res;
  },

  async deleteProfile(profileId) {
    return api.delete(`/api/profiles/${profileId}`);
  },

  async getHealthScore(profileId) {
    const res = await api.get(`/api/profiles/${profileId}/health-score`);
    return res.data ?? res;
  },

  async getDietaryRestrictions(profileId) {
    const res = await api.get(`/api/profiles/${profileId}/dietary-restrictions`);
    return res.data ?? res;
  },

  async updateDietaryRestrictions(profileId, restrictions) {
    const res = await api.put(`/api/profiles/${profileId}/dietary-restrictions`, { restrictions });
    return res.data ?? res;
  },

  async getAllergies(profileId) {
    const res = await api.get(`/api/profiles/${profileId}/allergies`);
    return res.data ?? res;
  },

  async updateAllergies(profileId, allergies) {
    const res = await api.put(`/api/profiles/${profileId}/allergies`, { allergies });
    return res.data ?? res;
  },

  async getHealthConditions(profileId) {
    const res = await api.get(`/api/profiles/${profileId}/health-conditions`);
    return res.data ?? res;
  },

  async updateHealthConditions(profileId, conditions) {
    const res = await api.put(`/api/profiles/${profileId}/health-conditions`, { conditions });
    return res.data ?? res;
  },

  async uploadPhoto(profileId, imageUri) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('photo', { uri: imageUri, type, name: filename || 'profile.jpg' });
    const res = await api.post(`/api/profiles/${profileId}/photo`, formData);
    return res.data ?? res;
  },

  async getAnalytics(profileId, period = '30d') {
    const res = await api.get(`/api/profiles/${profileId}/analytics?period=${period}`);
    return res.data ?? res;
  },
};
