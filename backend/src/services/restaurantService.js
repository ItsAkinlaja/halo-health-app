const ocrService = require('./ocrService');
const aiService = require('./aiService');
const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class RestaurantService {
  async searchRestaurants(filters = {}) {
    try {
      const { latitude, longitude, radius = 10, seedOilFree, organic, glutenFree, vegan, query } = filters;

      let queryBuilder = supabase
        .from('restaurants')
        .select('*');

      if (seedOilFree) {
        queryBuilder = queryBuilder.eq('seed_oil_free', true);
      }

      if (organic) {
        queryBuilder = queryBuilder.eq('organic', true);
      }

      if (glutenFree) {
        queryBuilder = queryBuilder.eq('gluten_free', true);
      }

      if (vegan) {
        queryBuilder = queryBuilder.eq('vegan_options', true);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,cuisine_type.ilike.%${query}%,address.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      if (latitude && longitude) {
        return this.filterByDistance(data, latitude, longitude, radius);
      }

      return data;
    } catch (error) {
      logger.error('Error searching restaurants:', error);
      throw error;
    }
  }

  filterByDistance(restaurants, latitude, longitude, radiusKm) {
    return restaurants
      .map(restaurant => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        return { ...restaurant, distance };
      })
      .filter(restaurant => restaurant.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  async getRestaurantById(id) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting restaurant:', error);
      throw error;
    }
  }

  async addReview(userId, restaurantId, review) {
    try {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .insert({
          user_id: userId,
          restaurant_id: restaurantId,
          rating: review.rating,
          comment: review.comment,
          seed_oil_verified: review.seedOilVerified
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error adding review:', error);
      throw error;
    }
  }

  async getRestaurantReviews(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select(`
          *,
          user:users(id, email)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting reviews:', error);
      throw error;
    }
  }
  async scanMenu(imageUri, profileId) {
    try {
      // Extract text from menu image
      const ocrText = await ocrService.extractText(imageUri);

      // Parse menu items using AI
      const menuItems = await this.parseMenuItems(ocrText);

      // Get user profile for personalization
      const profile = profileId ? await this.getProfile(profileId) : null;

      // Analyze each menu item
      const analyzedItems = await this.analyzeMenuItems(menuItems, profile);

      return {
        restaurantName: menuItems.restaurantName,
        items: analyzedItems,
        rawText: ocrText
      };
    } catch (error) {
      logger.error('Error scanning menu:', error);
      throw error;
    }
  }

  async parseMenuItems(ocrText) {
    const prompt = `Parse this restaurant menu and extract items:

${ocrText}

Return JSON:
{
  "restaurantName": "name if found",
  "items": [
    {
      "name": "item name",
      "description": "description",
      "price": "price",
      "category": "appetizer/entree/dessert/beverage"
    }
  ]
}`;

    const completion = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a menu parser. Extract structured menu data from text.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async analyzeMenuItems(menuData, profile) {
    const prompt = `Analyze these menu items for health:

${profile ? `User Profile:
- Health Goals: ${profile.health_goals?.join(', ') || 'None'}
- Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${profile.allergies_intolerances?.join(', ') || 'None'}
` : ''}

Menu Items:
${menuData.items.map((item, i) => `${i + 1}. ${item.name} - ${item.description || 'No description'}`).join('\n')}

Return JSON array with health analysis for each item:
[
  {
    "name": "item name",
    "healthScore": 0-100,
    "healthRating": "excellent/good/fair/poor",
    "calories": estimated number,
    "concerns": ["concern1", "concern2"],
    "benefits": ["benefit1", "benefit2"],
    "recommendation": "personalized advice"
  }
]`;

    const completion = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a nutrition expert analyzing restaurant menu items.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const analyzed = JSON.parse(completion.choices[0].message.content);
    return menuData.items.map((item, i) => ({
      ...item,
      analysis: analyzed[i]
    }));
  }

  async getProfile(profileId) {
    const { supabase } = require('../utils/database');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = new RestaurantService();
