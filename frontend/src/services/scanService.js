import { api } from './api';

export const scanService = {
  /**
   * Scan product by barcode
   */
  async scanBarcode(barcode, profileId) {
    const res = await api.post('/api/scans/barcode', { barcode, profileId });
    return res.data ?? res;
  },

  /**
   * Scan product by photo (OCR)
   */
  async scanPhoto(imageUri, profileId) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri: imageUri, type, name: filename || 'scan.jpg' });
    formData.append('profileId', profileId);
    const res = await api.post('/api/scans/photo', formData);
    return res.data ?? res;
  },

  /**
   * Scan restaurant menu
   */
  async scanMenu(imageUri, profileId) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri: imageUri, type, name: filename || 'menu.jpg' });
    formData.append('profileId', profileId);
    formData.append('type', 'menu');
    const res = await api.post('/api/scans/menu', formData);
    return res.data ?? res;
  },

  /**
   * Get scan history — returns flat array
   */
  async getScanHistory(profileId, options = {}) {
    const params = new URLSearchParams({
      profileId,
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    const res = await api.get(`/api/scans/history?${params}`);
    return res.data ?? res;
  },

  /**
   * Get scan by ID
   */
  async getScanById(scanId) {
    const res = await api.get(`/api/scans/${scanId}`);
    return res.data ?? res;
  },

  /**
   * Delete scan
   */
  async deleteScan(scanId) {
    return api.delete(`/api/scans/${scanId}`);
  },

  /**
   * Get scan statistics — returns { total_scans, average_score, trend }
   */
  async getScanStats(profileId, period = '30d') {
    const res = await api.get(`/api/scans/stats?profileId=${profileId}&period=${period}`);
    return res.data ?? res;
  },

  /**
   * Export scan history
   */
  async exportHistory(profileId, format = 'csv') {
    return api.get(`/api/scans/export?profileId=${profileId}&format=${format}`);
  },
};
