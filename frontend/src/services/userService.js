import { api } from './api';

export const userService = {
  /**
   * Get user account information
   */
  async getUserAccount() {
    const res = await api.get('/api/users/account');
    return res.data ?? res;
  },

  /**
   * Export all user data (GDPR/CCPA compliance)
   */
  async exportUserData() {
    const res = await api.get('/api/users/export');
    return res.data ?? res;
  },

  /**
   * Request data export via email
   */
  async requestDataExport() {
    const res = await api.post('/api/users/export/request');
    return res.data ?? res;
  },

  /**
   * Delete user scan data (keep account)
   */
  async deleteUserData() {
    const res = await api.delete('/api/users/data');
    return res.data ?? res;
  },

  /**
   * Delete user account and all data (GDPR/CCPA compliance)
   */
  async deleteUserAccount() {
    const res = await api.delete('/api/users/account', {
      confirmation: 'DELETE_MY_ACCOUNT',
    });
    return res.data ?? res;
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences) {
    const res = await api.put('/api/users/preferences', { preferences });
    return res.data ?? res;
  },
};
