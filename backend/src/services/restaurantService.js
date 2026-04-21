const ocrService = require('./ocrService');
const aiService = require('./aiService');
const { logger } = require('../utils/logger');

class RestaurantService {
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
