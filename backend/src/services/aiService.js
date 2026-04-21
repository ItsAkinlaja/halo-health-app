const OpenAI = require('openai');
const { logger, logAICall } = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateProductAnalysis(product, profile) {
    const startTime = Date.now();
    try {
      const prompt = this.buildProductAnalysisPrompt(product, profile);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are Halo, an intelligent health and nutrition assistant. Provide helpful, personalized analysis of products based on user health profiles. Be encouraging but honest about health impacts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration, completion.usage?.total_tokens);
      
      return completion.choices[0].message.content;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration, null, error);
      logger.error('Error generating product analysis:', error);
      throw error;
    }
  }

  async parseProductOCR(ocrText) {
    const startTime = Date.now();
    try {
      const prompt = this.buildOCRParsingPrompt(ocrText);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a specialized OCR parser for product labels. Extract structured information from OCR text and return it as JSON. Focus on product name, brand, ingredients, and any nutritional information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
      });

      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'ocr_parsing', duration, completion.usage?.total_tokens);

      const responseText = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid JSON response from AI for OCR parsing');
      }
      if (!parsed || typeof parsed !== 'object') throw new Error('Unexpected OCR response shape');
      return parsed;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'ocr_parsing', duration, null, error);
      logger.error('Error parsing OCR text:', error);
      throw error;
    }
  }

  async generateMealPlan(profile, preferences) {
    const startTime = Date.now();
    try {
      const prompt = this.buildMealPlanPrompt(profile, preferences);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a nutritionist and meal planning expert. Create personalized meal plans based on health profiles and preferences. Return structured JSON with meals for the specified duration.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      });

      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'meal_planning', duration, completion.usage?.total_tokens);
      
      const responseText = completion.choices[0].message.content;
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid JSON response from AI for meal planning');
      }
      if (!parsed || !Array.isArray(parsed.mealPlan)) throw new Error('Unexpected meal plan response shape');
      return parsed;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'meal_planning', duration, null, error);
      logger.error('Error generating meal plan:', error);
      throw error;
    }
  }

  buildProductAnalysisPrompt(product, profile) {
    return `Analyze this product for a user with the following health profile:

Product Information:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category}
- Ingredients: ${product.ingredients ? product.ingredients.join(', ') : 'Not available'}
- Health Score: ${product.health_score || 'Not available'}
- Processing Level: ${product.processing_level || 'Not available'}

User Health Profile:
- Name: ${profile.name}
- Age Group: ${profile.age_group}
- Gender: ${profile.gender}
- Health Goals: ${profile.health_goals ? profile.health_goals.join(', ') : 'Not specified'}
- Dietary Restrictions: ${profile.dietary_restrictions ? profile.dietary_restrictions.join(', ') : 'None'}
- Allergies: ${profile.allergies_intolerances ? profile.allergies_intolerances.join(', ') : 'None'}
- Health Concerns: ${profile.health_concerns ? profile.health_concerns.join(', ') : 'None'}

Please provide:
1. Personalized health assessment
2. Potential benefits or risks
3. Recommendations for this user
4. Alternative suggestions if needed

Keep it concise, encouraging, and actionable.`;
  }

  buildOCRParsingPrompt(ocrText) {
    return `Parse the following OCR text from a product label and extract structured information:

OCR Text:
${ocrText}

Please return a JSON object with:
{
  "productName": "extracted product name",
  "brand": "extracted brand name",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "nutritionInfo": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number
  },
  "servingSize": "extracted serving size",
  "allergens": ["allergen1", "allergen2", ...]
}

If any field cannot be extracted, use null or empty array. Be as accurate as possible.`;
  }

  buildMealPlanPrompt(profile, preferences) {
    return `Create a personalized meal plan for:

User Profile:
- Name: ${profile.name}
- Age Group: ${profile.age_group}
- Gender: ${profile.gender}
- Health Goals: ${profile.health_goals ? profile.health_goals.join(', ') : 'Not specified'}
- Dietary Restrictions: ${profile.dietary_restrictions ? profile.dietary_restrictions.join(', ') : 'None'}
- Allergies: ${profile.allergies_intolerances ? profile.allergies_intolerances.join(', ') : 'None'}

Preferences:
- Duration: ${preferences.duration || 7} days
- Cuisine Preferences: ${preferences.cuisinePreferences ? preferences.cuisinePreferences.join(', ') : 'Any'}
- Cooking Time Limit: ${preferences.cookingTimeLimit || 'No limit'} minutes
- Budget: ${preferences.budgetWeekly ? `$${preferences.budgetWeekly}/week` : 'No budget constraint'}

Please return a JSON object with:
{
  "mealPlan": [
    {
      "day": 1,
      "meals": [
        {
          "type": "breakfast",
          "name": "meal name",
          "description": "brief description",
          "ingredients": ["ingredient1", "ingredient2", ...],
          "prepTime": 15,
          "cookTime": 20,
          "calories": 400,
          "protein": 20,
          "carbs": 40,
          "fat": 15
        }
      ]
    }
  ]
}

Include 3 meals per day (breakfast, lunch, dinner) and optionally 1 snack. Focus on whole foods and balanced nutrition.`;
  }
}

module.exports = new AIService();
