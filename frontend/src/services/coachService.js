import { api } from './api';

export const coachService = {
  async sendMessage(userId, message, context = {}) {
    const res = await api.post('/api/coach/chat', {
      userId,
      message,
      context,
    });
    return res.data ?? res;
  },

  async getChatHistory(userId, limit = 50) {
    const res = await api.get(`/api/coach/history?userId=${userId}&limit=${limit}`);
    return res.data ?? res;
  },

  async clearHistory(userId) {
    return api.delete(`/api/coach/history?userId=${userId}`);
  },
};
