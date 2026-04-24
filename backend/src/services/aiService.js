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
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
        logger.warn('OpenAI API key not configured, returning default analysis');
        return this.generateDefaultAnalysis(product, profile);
      }

      const prompt = this.buildProductAnalysisPrompt(product, profile);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are Halo, an intelligent health and nutrition assistant. Provide helpful, personalized analysis of products based on user health profiles. Be encouraging but honest about health impacts. Keep responses concise (2-3 sentences) and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration, completion.usage?.total_tokens);
      
      return completion.choices[0].message.content;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration, null, error);
      logger.error('Error generating product analysis:', error);
      
      // Return default analysis on error
      return this.generateDefaultAnalysis(product, profile);
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
    const scoreData = product.score_data || {};
    const warnings = scoreData.warnings || [];
    const recommendations = scoreData.recommendations || [];

    return `Analyze this product for a user with the following health profile:

Product Information:
- Name: ${product.name}
- Brand: ${product.brand || 'Unknown'}
- Category: ${product.category || 'Unknown'}
- Health Score: ${scoreData.overall_score || product.health_score || 'N/A'}/100
- Processing Level: ${product.processing_level || 'Unknown'}
- Ingredients: ${product.ingredients && product.ingredients.length > 0 ? product.ingredients.slice(0, 5).join(', ') + (product.ingredients.length > 5 ? '...' : '') : 'Not available'}
${product.toxins_detected && product.toxins_detected.length > 0 ? `- Toxins Detected: ${product.toxins_detected.join(', ')}` : ''}
${product.allergens_present && product.allergens_present.length > 0 ? `- Allergens: ${product.allergens_present.join(', ')}` : ''}

User Health Profile:
- Health Goals: ${profile.health_goals && profile.health_goals.length > 0 ? profile.health_goals.join(', ') : 'General health'}
- Dietary Restrictions: ${profile.dietary_restrictions && profile.dietary_restrictions.length > 0 ? profile.dietary_restrictions.join(', ') : 'None'}
- Allergies: ${profile.allergies_intolerances && profile.allergies_intolerances.length > 0 ? profile.allergies_intolerances.join(', ') : 'None'}

Provide a brief, personalized analysis (2-3 sentences) that:
1. Assesses if this product aligns with their health goals
2. Highlights any concerns or benefits
3. Gives actionable advice

Be encouraging but honest.`;
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

  generateDefaultAnalysis(product, profile) {
    const score = product.score_data?.overall_score || product.health_score || 50;
    const warnings = product.score_data?.warnings || [];
    const recommendations = product.score_data?.recommendations || [];

    let analysis = '';

    // Score-based assessment
    if (score >= 80) {
      analysis = `This is an excellent choice! With a health score of ${score}/100, this product aligns well with your health goals. `;
    } else if (score >= 60) {
      analysis = `This is a decent option with a health score of ${score}/100. It has some good qualities but could be improved. `;
    } else if (score >= 40) {
      analysis = `This product has a moderate health score of ${score}/100. Consider consuming in moderation. `;
    } else {
      analysis = `This product has a low health score of ${score}/100. You might want to look for healthier alternatives. `;
    }

    // Add warnings
    if (warnings.length > 0) {
      const allergenWarnings = warnings.filter(w => w.type === 'allergen');
      const dietaryWarnings = warnings.filter(w => w.type === 'dietary');
      
      if (allergenWarnings.length > 0) {
        analysis += `⚠️ Contains allergens that may affect you. `;
      }
      if (dietaryWarnings.length > 0) {
        analysis += `This product may not align with your dietary restrictions. `;
      }
    }

    // Add recommendations
    if (recommendations.length > 0) {
      analysis += recommendations[0];
    }

    return analysis || 'Product analysis is being processed. Check back soon for detailed insights.';
  }
}

module.exports = new AIService();
