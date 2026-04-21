const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class ShoppingListService {
  async createList(userId, data) {
    try {
      const { data: list, error } = await supabase
        .from('shopping_lists')
        .insert([{
          user_id: userId,
          name: data.name || 'My Shopping List',
          description: data.description,
          is_shared: data.isShared || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return list;
    } catch (error) {
      logger.error('Error creating shopping list:', error);
      throw error;
    }
  }

  async addItem(listId, userId, productId, quantity = 1, notes = null) {
    try {
      const { data: item, error } = await supabase
        .from('shopping_list_items')
        .insert([{
          list_id: listId,
          product_id: productId,
          quantity,
          notes,
          is_checked: false,
          added_at: new Date().toISOString(),
        }])
        .select('*, products(*)')
        .single();

      if (error) throw error;

      await this.updateListTimestamp(listId);
      return item;
    } catch (error) {
      logger.error('Error adding item to shopping list:', error);
      throw error;
    }
  }

  async removeItem(itemId, userId) {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error removing item from shopping list:', error);
      throw error;
    }
  }

  async toggleItem(itemId, userId) {
    try {
      const { data: item, error: fetchError } = await supabase
        .from('shopping_list_items')
        .select('is_checked')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      const { data: updated, error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: !item.is_checked })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } catch (error) {
      logger.error('Error toggling item:', error);
      throw error;
    }
  }

  async getUserLists(userId) {
    try {
      const { data: lists, error } = await supabase
        .from('shopping_lists')
        .select('*, shopping_list_items(count)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return lists;
    } catch (error) {
      logger.error('Error getting user lists:', error);
      throw error;
    }
  }

  async getListItems(listId, userId) {
    try {
      const { data: items, error } = await supabase
        .from('shopping_list_items')
        .select('*, products(*)')
        .eq('list_id', listId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return items;
    } catch (error) {
      logger.error('Error getting list items:', error);
      throw error;
    }
  }

  async deleteList(listId, userId) {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting list:', error);
      throw error;
    }
  }

  async updateListTimestamp(listId) {
    await supabase
      .from('shopping_lists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', listId);
  }

  async generateFromMealPlan(userId, mealPlanId) {
    try {
      const { data: mealPlan, error: mealError } = await supabase
        .from('meal_plans')
        .select('*, meal_plan_meals(*, meals(*, meal_ingredients(*)))')
        .eq('id', mealPlanId)
        .single();

      if (mealError) throw mealError;

      const list = await this.createList(userId, {
        name: `Shopping for ${mealPlan.name}`,
        description: 'Auto-generated from meal plan',
      });

      const ingredients = new Map();
      mealPlan.meal_plan_meals.forEach(mpm => {
        mpm.meals.meal_ingredients.forEach(ing => {
          const key = ing.ingredient_name;
          if (ingredients.has(key)) {
            ingredients.set(key, ingredients.get(key) + (ing.quantity || 1));
          } else {
            ingredients.set(key, ing.quantity || 1);
          }
        });
      });

      for (const [name, quantity] of ingredients) {
        await supabase.from('shopping_list_items').insert([{
          list_id: list.id,
          product_id: null,
          quantity,
          notes: name,
          is_checked: false,
        }]);
      }

      return list;
    } catch (error) {
      logger.error('Error generating shopping list from meal plan:', error);
      throw error;
    }
  }
}

module.exports = new ShoppingListService();
