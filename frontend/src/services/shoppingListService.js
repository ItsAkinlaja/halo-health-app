import { api } from './api';

export const shoppingListService = {
  async createList(data) {
    const response = await api.post('/shopping-list', data);
    return response.data;
  },

  async getLists() {
    const response = await api.get('/shopping-list');
    return response.data;
  },

  async getListItems(listId) {
    const response = await api.get(`/shopping-list/${listId}/items`);
    return response.data;
  },

  async addItem(listId, productId, quantity = 1, notes = null) {
    const response = await api.post(`/shopping-list/${listId}/items`, {
      productId,
      quantity,
      notes
    });
    return response.data;
  },

  async removeItem(itemId) {
    const response = await api.delete(`/shopping-list/items/${itemId}`);
    return response.data;
  },

  async toggleItem(itemId) {
    const response = await api.patch(`/shopping-list/items/${itemId}/toggle`);
    return response.data;
  },

  async deleteList(listId) {
    const response = await api.delete(`/shopping-list/${listId}`);
    return response.data;
  },

  async generateFromMealPlan(mealPlanId) {
    const response = await api.post(`/shopping-list/generate-from-meal-plan/${mealPlanId}`);
    return response.data;
  },
};
