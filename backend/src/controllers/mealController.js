const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');

class MealController {
  async createMealPlan(req, res, next) {
    try {
      const { profileId, planName, durationDays, cuisinePreferences, dietaryGoals, dailyCalories } = req.body;
      const userId = req.user.id;

      // Validate that the profile belongs to the user
      const { data: profile, error: profileError } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new ValidationError('Invalid profile ID');
      }

      // Generate meal plan using AI
      const preferences = {
        duration: durationDays,
        cuisinePreferences: cuisinePreferences || [],
        dietaryGoals: dietaryGoals || [],
        dailyCalories: dailyCalories,
      };

      const aiMealPlan = await aiService.generateMealPlan(profile, preferences);

      // Save meal plan to database
      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .insert([{
          user_id: userId,
          profile_id: profileId,
          plan_name: planName,
          duration_days: durationDays,
          cuisine_preferences: cuisinePreferences || [],
          dietary_goals: dietaryGoals || [],
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      // Save individual meals
      const meals = [];
      if (aiMealPlan.mealPlan) {
        for (const day of aiMealPlan.mealPlan) {
          for (const meal of day.meals) {
            const { data: mealData } = await supabase
              .from('meals')
              .insert([{
                meal_plan_id: mealPlan.id,
                day_number: day.day,
                meal_type: meal.type,
                name: meal.name,
                description: meal.description,
                recipe: meal,
                nutrition_info: {
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                  fat: meal.fat,
                },
                dietary_tags: [],
                created_at: new Date().toISOString(),
              }])
              .select()
              .single();

            meals.push(mealData);
          }
        }
      }

      res.json({
        status: 'success',
        data: {
          mealPlan,
          meals,
          aiGenerated: aiMealPlan,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMealPlans(req, res, next) {
    try {
      const userId = req.user.id;
      const { profileId } = req.query;

      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            day_number,
            meal_type,
            name,
            nutrition_info
          )
        `)
        .eq('user_id', userId);

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data: mealPlans, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { mealPlans },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMealPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.id;

      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            day_number,
            meal_type,
            name,
            description,
            recipe,
            nutrition_info,
            dietary_tags
          )
        `)
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (error || !mealPlan) {
        throw new NotFoundError('Meal plan not found');
      }

      res.json({
        status: 'success',
        data: { mealPlan },
      });
    } catch (error) {
      next(error);
    }
  }

  async generateMealPlan(req, res, next) {
    try {
      const { profileId, startDate, days = 7 } = req.body;
      const userId = req.user.id;

      let actualProfileId = profileId;
      const { data: existingProfile } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('health_profiles')
          .insert([{
            user_id: userId,
            name: 'My Profile',
            relationship: 'self',
            is_primary: true,
          }])
          .select()
          .single();

        if (createError) {
          throw new ValidationError('Failed to create profile: ' + createError.message);
        }
        actualProfileId = newProfile.id;
      }

      const mockMeals = [];
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
      const start = new Date(startDate || Date.now());

      for (let day = 0; day < days; day++) {
        const date = new Date(start);
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];

        for (const type of mealTypes) {
          const { data: meal, error } = await supabase
            .from('meals')
            .insert([{
              profile_id: actualProfileId,
              meal_type: type,
              name: `${type} Day ${day + 1}`,
              scheduled_date: dateStr,
              calories: 400 + Math.floor(Math.random() * 200),
              protein: 20 + Math.floor(Math.random() * 20),
              carbs: 40 + Math.floor(Math.random() * 30),
              fats: 10 + Math.floor(Math.random() * 15),
              health_score: 60 + Math.floor(Math.random() * 30),
            }])
            .select()
            .single();

          if (!error) mockMeals.push(meal);
        }
      }

      res.json({ status: 'success', data: { meals: mockMeals, message: 'Meal plan generated' } });
    } catch (error) {
      next(error);
    }
  }

  async createShoppingList(req, res, next) {
    try {
      const { profileId, planId } = req.body;
      const userId = req.user.id;

      // Get meal plan with ingredients
      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            recipe
          )
        `)
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (error || !mealPlan) {
        throw new NotFoundError('Meal plan not found');
      }

      // Extract all ingredients from meals
      const allIngredients = new Set();
      mealPlan.meals.forEach(meal => {
        if (meal.recipe && meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach(ingredient => {
            allIngredients.add(ingredient);
          });
        }
      });

      // Create shopping list
      const items = Array.from(allIngredients).map(ingredient => ({
        name: ingredient,
        quantity: 1,
        unit: 'item',
        checked: false,
      }));

      const { data: shoppingList, error: listError } = await supabase
        .from('shopping_lists')
        .insert([{
          user_id: userId,
          profile_id: profileId,
          list_name: `${mealPlan.plan_name} Shopping List`,
          items: items,
          is_completed: false,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (listError) {
        throw new ValidationError(listError.message);
      }

      res.json({
        status: 'success',
        data: { shoppingList },
      });
    } catch (error) {
      next(error);
    }
  }

  async getShoppingLists(req, res, next) {
    try {
      const userId = req.user.id;
      const { profileId } = req.query;

      let query = supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId);

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data: shoppingLists, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { shoppingLists },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMealsByDate(req, res, next) {
    try {
      const { profileId, date } = req.query;
      const userId = req.user.id;

      let actualProfileId = profileId;
      if (profileId === userId) {
        const { data: primaryProfile } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .maybeSingle();
        
        if (primaryProfile) {
          actualProfileId = primaryProfile.id;
        } else {
          const { data: anyProfile } = await supabase
            .from('health_profiles')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
          
          if (anyProfile) actualProfileId = anyProfile.id;
        }
      } else {
        const { data: profile } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('id', profileId)
          .eq('user_id', userId)
          .maybeSingle();

        if (!profile) throw new ValidationError('Invalid profile ID');
      }

      const { data: meals, error } = await supabase
        .from('meals')
        .select('*')
        .eq('profile_id', actualProfileId)
        .eq('scheduled_date', date)
        .order('meal_type');

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', data: meals || [] });
    } catch (error) {
      next(error);
    }
  }

  async getMeal(req, res, next) {
    try {
      const { mealId } = req.params;
      const userId = req.user.id;

      const { data: meal, error } = await supabase
        .from('meals')
        .select('*, health_profiles!inner(user_id)')
        .eq('id', mealId)
        .eq('health_profiles.user_id', userId)
        .single();

      if (error || !meal) throw new NotFoundError('Meal not found');

      res.json({ status: 'success', data: meal });
    } catch (error) {
      next(error);
    }
  }

  async updateMeal(req, res, next) {
    try {
      const { mealId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('meals')
        .select('*, health_profiles!inner(user_id)')
        .eq('id', mealId)
        .eq('health_profiles.user_id', userId)
        .single();

      if (!existing) throw new NotFoundError('Meal not found');

      const { data: meal, error } = await supabase
        .from('meals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', data: meal });
    } catch (error) {
      next(error);
    }
  }

  async deleteMeal(req, res, next) {
    try {
      const { mealId } = req.params;
      const userId = req.user.id;

      const { data: existing } = await supabase
        .from('meals')
        .select('*, health_profiles!inner(user_id)')
        .eq('id', mealId)
        .eq('health_profiles.user_id', userId)
        .single();

      if (!existing) throw new NotFoundError('Meal not found');

      const { error } = await supabase.from('meals').delete().eq('id', mealId);

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', message: 'Meal deleted' });
    } catch (error) {
      next(error);
    }
  }

  async logMeal(req, res, next) {
    try {
      const { mealId, completed = true } = req.body;
      const userId = req.user.id;

      const { data: meal } = await supabase
        .from('meals')
        .select('*, health_profiles!inner(user_id)')
        .eq('id', mealId)
        .eq('health_profiles.user_id', userId)
        .single();

      if (!meal) throw new NotFoundError('Meal not found');

      const { data, error } = await supabase
        .from('meals')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getNutritionSummary(req, res, next) {
    try {
      const { profileId, startDate, endDate } = req.query;
      const userId = req.user.id;

      let actualProfileId = profileId;
      if (profileId === userId) {
        const { data: primaryProfile } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('user_id', userId)
          .eq('is_primary', true)
          .maybeSingle();
        
        if (primaryProfile) {
          actualProfileId = primaryProfile.id;
        } else {
          const { data: anyProfile } = await supabase
            .from('health_profiles')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
          
          if (anyProfile) actualProfileId = anyProfile.id;
        }
      } else {
        const { data: profile } = await supabase
          .from('health_profiles')
          .select('id')
          .eq('id', profileId)
          .eq('user_id', userId)
          .maybeSingle();

        if (!profile) throw new ValidationError('Invalid profile ID');
      }

      const { data: meals, error } = await supabase
        .from('meals')
        .select('calories, protein, carbs, fats, completed')
        .eq('profile_id', actualProfileId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      if (error) throw new ValidationError(error.message);

      const current = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      const target = { calories: 2000, protein: 150, carbs: 200, fats: 65 };

      meals?.forEach((m) => {
        if (m.completed) {
          current.calories += m.calories || 0;
          current.protein += m.protein || 0;
          current.carbs += m.carbs || 0;
          current.fats += m.fats || 0;
        }
      });

      res.json({ status: 'success', data: { current, target } });
    } catch (error) {
      next(error);
    }
  }

  async updateMealPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (!existing) throw new NotFoundError('Meal plan not found');

      const { data, error } = await supabase
        .from('meal_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async deleteMealPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.id;

      const { data: existing } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

      if (!existing) throw new NotFoundError('Meal plan not found');

      const { error } = await supabase.from('meal_plans').delete().eq('id', planId);

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', message: 'Meal plan deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getMealSuggestions(req, res, next) {
    try {
      const { profileId, mealType, date } = req.query;

      // TODO: AI-powered suggestions based on profile
      // For now return empty array
      res.json({ status: 'success', data: [] });
    } catch (error) {
      next(error);
    }
  }

  async searchRecipes(req, res, next) {
    try {
      const { q } = req.query;

      // TODO: Search recipe database or external API
      res.json({ status: 'success', data: [] });
    } catch (error) {
      next(error);
    }
  }

  async getRecipe(req, res, next) {
    try {
      const { recipeId } = req.params;

      // TODO: Fetch from recipe database
      throw new NotFoundError('Recipe not found');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MealController();
