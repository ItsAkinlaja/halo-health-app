import { api } from './api';

export const shoppingListService = {
  async createList(data) {
    const response = await api.post('/api/shopping-list', data);
    return response.data ?? response;
  },

  async getLists() {
    const response = await api.get('/api/shopping-list');
    return response.data ?? response;
  },

  async getListItems(listId) {
    const response = await api.get(`/api/shopping-list/${listId}/items`);
    return response.data ?? response;
  },

  async addItem(listId, productId, quantity = 1, notes = null) {
    const response = await api.post(`/api/shopping-list/${listId}/items`, {
      productId,
      quantity,
      notes
    });
    return response.data ?? response;
  },

  async removeItem(itemId) {
    const response = await api.delete(`/api/shopping-list/items/${itemId}`);
    return response.data ?? response;
  },

  async toggleItem(itemId) {
    const response = await api.patch(`/api/shopping-list/items/${itemId}/toggle`);
    return response.data ?? response;
  },

  async deleteList(listId) {
    const response = await api.delete(`/api/shopping-list/${listId}`);
    return response.data ?? response;
  },

  async generateFromMealPlan(mealPlanId) {
    const response = await api.post(`/api/shopping-list/generate-from-meal-plan/${mealPlanId}`);
    return response.data ?? response;
  },
};
