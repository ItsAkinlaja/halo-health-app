import { api } from './api';

const unwrap = (response) => response?.data ?? response;

export const referralService = {
  async getReferralCode() {
    const response = await api.get('/api/referral/code');
    const data = unwrap(response);
    return data?.code;
  },

  async applyReferralCode(code) {
    const response = await api.post('/api/referral/apply', { code });
    return unwrap(response);
  },

  async getReferralStats() {
    const response = await api.get('/api/referral/stats');
    return unwrap(response);
  },

  async getEarnings() {
    const response = await api.get('/api/referral/earnings');
    return unwrap(response);
  },

  async requestPayout(amount, method, details) {
    const response = await api.post('/api/referral/payout', {
      amount,
      method,
      details
    });
    return unwrap(response);
  },

  async getPendingPayoutRequests(limit = 100, offset = 0) {
    const response = await api.get(`/api/referral/payout/pending?limit=${limit}&offset=${offset}`);
    return unwrap(response);
  },

  async updatePayoutStatus(payoutId, status) {
    const response = await api.put(`/api/referral/payout/${payoutId}/status`, { status });
    return unwrap(response);
  },
};
