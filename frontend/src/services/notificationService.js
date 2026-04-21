import { api } from './api';

export const notificationService = {
  /**
   * Get notifications for user
   */
  async getNotifications(userId, options = {}) {
    const params = new URLSearchParams({
      userId,
      limit: options.limit || 50,
      offset: options.offset || 0,
    });

    if (options.unreadOnly) {
      params.append('unreadOnly', 'true');
    }

    return api.get(`/api/notifications?${params}`);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return api.put(`/api/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return api.put(`/api/notifications/read-all`, { userId });
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    return api.delete(`/api/notifications/${notificationId}`);
  },

  /**
   * Get notification settings
   */
  async getSettings(userId) {
    return api.get(`/api/notifications/settings?userId=${userId}`);
  },

  /**
   * Update notification settings
   */
  async updateSettings(userId, settings) {
    return api.put('/api/notifications/settings', { userId, settings });
  },

  /**
   * Register push token
   */
  async registerPushToken(userId, token, platform) {
    return api.post('/api/notifications/push-token', {
      userId,
      token,
      platform,
    });
  },

  /**
   * Unregister push token
   */
  async unregisterPushToken(userId, token) {
    return api.delete('/api/notifications/push-token', {
      body: JSON.stringify({ userId, token }),
    });
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return api.get(`/api/notifications/unread-count?userId=${userId}`);
  },

  /**
   * Test notification
   */
  async sendTestNotification(userId) {
    return api.post('/api/notifications/test', { userId });
  },
};
