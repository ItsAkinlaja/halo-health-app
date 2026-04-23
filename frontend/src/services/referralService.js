import { api } from './api';

export const referralService = {
  async getReferralCode() {
    const response = await api.get('/referral/code');
    return response.data.code;
  },

  async applyReferralCode(code) {
    const response = await api.post('/referral/apply', { code });
    return response.data;
  },

  async getReferralStats() {
    const response = await api.get('/referral/stats');
    return response.data;
  },

  async getEarnings() {
    const response = await api.get('/referral/earnings');
    return response.data;
  },

  async requestPayout(amount, method, details) {
    const response = await api.post('/referral/payout', {
      amount,
      method,
      details
    });
    return response.data;
  },
};
