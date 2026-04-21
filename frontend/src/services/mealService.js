import { api } from './api';

const transformMeal = (meal) => ({
  ...meal,
  type: meal.meal_type,
  healthScore: meal.health_score,
  time: meal.scheduled_date,
});

export const mealService = {
  /**
   * Get meal plans for profile
   */
  async getMealPlans(profileId, options = {}) {
    const params = new URLSearchParams({
      profileId,
      limit: options.limit || 10,
      offset: options.offset || 0,
    });

    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const res = await api.get(`/api/meals/plans?${params}`);
    return res.data ?? res;
  },

  /**
   * Get meal plan by ID
   */
  async getMealPlan(planId) {
    const res = await api.get(`/api/meals/plans/${planId}`);
    return res.data ?? res;
  },

  /**
   * Generate AI meal plan
   */
  async generateMealPlan(profileId, preferences = {}) {
    const res = await api.post('/api/meals/generate', {
      profileId,
      ...preferences,
    });
    return res.data ?? res;
  },

  /**
   * Create custom meal plan
   */
  async createMealPlan(data) {
    const res = await api.post('/api/meals/plans', data);
    return res.data ?? res;
  },

  /**
   * Update meal plan
   */
  async updateMealPlan(planId, data) {
    const res = await api.put(`/api/meals/plans/${planId}`, data);
    return res.data ?? res;
  },

  /**
   * Delete meal plan
   */
  async deleteMealPlan(planId) {
    const res = await api.delete(`/api/meals/plans/${planId}`);
    return res.data ?? res;
  },

  /**
   * Get meals for a specific date
   */
  async getMealsByDate(profileId, date) {
    const res = await api.get(`/api/meals?profileId=${profileId}&date=${date}`);
    const meals = res.data ?? res;
    return Array.isArray(meals) ? meals.map(transformMeal) : [];
  },

  /**
   * Log a meal
   */
  async logMeal(data) {
    const res = await api.post('/api/meals/log', data);
    return res.data ?? res;
  },

  /**
   * Get meal by ID
   */
  async getMeal(mealId) {
    const res = await api.get(`/api/meals/${mealId}`);
    const meal = res.data ?? res;
    return meal ? transformMeal(meal) : null;
  },

  /**
   * Update meal
   */
  async updateMeal(mealId, data) {
    const res = await api.put(`/api/meals/${mealId}`, data);
    return res.data ?? res;
  },

  /**
   * Delete meal
   */
  async deleteMeal(mealId) {
    const res = await api.delete(`/api/meals/${mealId}`);
    return res.data ?? res;
  },

  /**
   * Get meal suggestions
   */
  async getMealSuggestions(profileId, mealType, date) {
    const params = new URLSearchParams({
      profileId,
      mealType,
      date,
    });

    const res = await api.get(`/api/meals/suggestions?${params}`);
    return res.data ?? res;
  },

  /**
   * Get nutrition summary
   */
  async getNutritionSummary(profileId, startDate, endDate) {
    const params = new URLSearchParams({
      profileId,
      startDate,
      endDate,
    });

    const res = await api.get(`/api/meals/nutrition-summary?${params}`);
    return res.data ?? res;
  },

  /**
   * Generate shopping list
   */
  async generateShoppingList(planId) {
    const res = await api.post(`/api/meals/plans/${planId}/shopping-list`);
    return res.data ?? res;
  },

  /**
   * Search recipes
   */
  async searchRecipes(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });

    const res = await api.get(`/api/meals/recipes/search?${params}`);
    return res.data ?? res;
  },

  /**
   * Get recipe by ID
   */
  async getRecipe(recipeId) {
    const res = await api.get(`/api/meals/recipes/${recipeId}`);
    return res.data ?? res;
  },
};
