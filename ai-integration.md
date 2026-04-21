# AI Integration for Halo Coach Features

## AI Architecture Overview

### Technology Stack
- **Primary AI**: OpenAI GPT-4/GPT-3.5 for text generation and analysis
- **Speech-to-Text**: OpenAI Whisper for voice input processing
- **Text-to-Speech**: ElevenLabs API for Halo's voice
- **Vector Database**: Pinecone for semantic search and memory
- **Computer Vision**: Google Vision API for OCR and image analysis
- **Knowledge Base**: Custom ingredient and product safety database

## Halo AI Coach Service

### Core AI Service
```javascript
// src/services/aiService.js
const OpenAI = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');
const fs = require('fs').promises;

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.pinecone = new PineconeClient();
    this.pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    
    this.voiceIndex = null;
    this.initializeVectorIndex();
  }

  async initializeVectorIndex() {
    this.voiceIndex = this.pinecone.Index('halo-voice-memory');
  }

  // Product Analysis
  async generateProductAnalysis(product, userProfile) {
    const prompt = this.buildProductAnalysisPrompt(product, userProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.getHaloPersona('product_analysis')
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });

    const analysis = response.choices[0].message.content;
    
    // Store in vector memory for future reference
    await this.storeConversationMemory('product_analysis', {
      product_id: product.id,
      user_profile: userProfile.id,
      analysis,
    });

    return analysis;
  }

  buildProductAnalysisPrompt(product, userProfile) {
    return `
Analyze this product for the user's health profile:

PRODUCT INFORMATION:
Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Ingredients: ${product.ingredients.join(', ')}
Health Score: ${product.health_score}/100
Processing Level: ${product.processing_level}
Lab Verified: ${product.is_lab_verified ? 'Yes' : 'No'}

${product.toxins_detected ? `Detected Toxins: ${product.toxins_detected.join(', ')}` : ''}
${product.allergens_present ? `Allergens: ${product.allergens_present.join(', ')}` : ''}

USER HEALTH PROFILE:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies/Intolerances: ${userProfile.allergies_intolerances?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}
- Age Group: ${userProfile.age_group}
- Special Conditions: ${userProfile.special_conditions?.join(', ') || 'None'}

ANALYSIS REQUIREMENTS:
1. Overall assessment with score explanation
2. Specific problematic ingredients and their health impacts
3. Scientific explanations in accessible language (technical terms followed by bracketed explanations)
4. Personalized recommendations based on user's health profile
5. Clean alternatives if needed

Format your response as Halo - warm, knowledgeable, and scientifically detailed but accessible.
    `;
  }

  // Meal Planning
  async generateMealPlan(preferences, userProfile) {
    const prompt = this.buildMealPlanPrompt(preferences, userProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.getHaloPersona('meal_planning')
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.4,
    });

    const mealPlanText = response.choices[0].message.content;
    const structuredPlan = await this.parseMealPlanResponse(mealPlanText);
    
    // Store meal plan preferences for personalization
    await this.storeUserPreferences(userProfile.id, 'meal_planning', preferences);
    
    return structuredPlan;
  }

  buildMealPlanPrompt(preferences, userProfile) {
    return `
Create a personalized ${preferences.duration}-day meal plan:

USER PROFILE:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies/Intolerances: ${userProfile.allergies_intolerances?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}
- Age Group: ${userProfile.age_group}

MEAL PLAN PREFERENCES:
- Duration: ${preferences.duration} days
- Daily Calories: ${preferences.calorieTarget || 'Auto-calculate'}
- Cuisine Types: ${preferences.cuisinePreferences?.join(', ') || 'Any'}
- Cooking Time Limit: ${preferences.cookingTimeLimit || 'No limit'} minutes
- Budget: $${preferences.budgetWeekly || 'No limit'} per week
- Health Goals: ${preferences.healthGoals?.join(', ') || 'None'}
- Available Ingredients: ${preferences.availableIngredients?.join(', ') || 'None'}

REQUIREMENTS:
1. Create breakfast, lunch, dinner, and snacks for each day
2. Each meal must be compatible with user's dietary restrictions and allergies
3. Include recipes with ingredients, instructions, prep/cook times, and servings
4. Provide nutritional information per serving
5. Generate shopping list organized by store section
6. Focus on clean, whole foods and avoid processed ingredients
7. Consider cooking time and budget constraints

RESPONSE FORMAT:
Return structured JSON with:
{
  "meals": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal Name",
          "description": "Brief description",
          "recipe": {
            "ingredients": [{"name": "ingredient", "quantity": "amount", "notes": "optional"}],
            "instructions": ["step 1", "step 2"],
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4
          },
          "nutrition": {"calories": 350, "protein": 20, "carbs": 30, "fat": 15},
          "dietary_tags": ["gluten_free", "dairy_free"]
        }
      ]
    }
  ],
  "shopping_list": [
    {"category": "Produce", "items": [{"name": "spinach", "quantity": "2 bunches"}]},
    {"category": "Protein", "items": [{"name": "chicken breast", "quantity": "2 lbs"}]}
  ],
  "summary": {
    "daily_averages": {"calories": 1800, "protein": 80},
    "total_unique_ingredients": 45,
    "estimated_cost": 85
  }
}
    `;
  }

  async parseMealPlanResponse(responseText) {
    try {
      // Try to parse as JSON directly
      return JSON.parse(responseText);
    } catch (error) {
      // If not JSON, use AI to structure it
      const structuringPrompt = `
Convert this meal plan text to structured JSON format:
${responseText}

Return only valid JSON.
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON formatter. Convert meal plan text to structured JSON.'
          },
          {
            role: 'user',
            content: structuringPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content);
    }
  }

  // Personalized Tips
  async generatePersonalizedTip(userProfile, recentActivity) {
    const prompt = this.buildTipPrompt(userProfile, recentActivity);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: this.getHaloPersona('daily_tip')
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }

  buildTipPrompt(userProfile, recentActivity) {
    return `
Generate a personalized daily health tip:

USER PROFILE:
- Health Score: ${userProfile.healthScore || 'Not calculated'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}

RECENT ACTIVITY:
- Products Scanned: ${recentActivity.recentScans?.length || 0}
- Clean Swaps Made: ${recentActivity.cleanSwaps || 0}
- Last Scan: ${recentActivity.lastScan?.product_name || 'None'}
- Health Score Trend: ${recentActivity.scoreTrend || 'stable'}

TIP REQUIREMENTS:
1. Actionable and encouraging
2. Specific to recent activity and health goals
3. Scientifically grounded but accessible
4. 2-3 sentences maximum
5. Warm, supportive tone like Halo

Examples:
- "Great job scanning 5 products yesterday! Try swapping one processed snack for fresh fruit today to boost your daily score."
- "Since you're focused on gut health, consider adding fermented foods like kimchi to support your microbiome."
    `;
  }

  // Voice Input Processing
  async transcribeVoiceInput(audioBuffer) {
    try {
      // Convert buffer to file for OpenAI
      const tempFile = `/tmp/voice_${Date.now()}.wav`;
      await fs.writeFile(tempFile, audioBuffer);

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });

      // Clean up temp file
      await fs.unlink(tempFile);

      return transcription;
    } catch (error) {
      console.error('Voice transcription error:', error);
      throw new Error('Failed to transcribe voice input');
    }
  }

  // Voice Response Generation
  async generateVoiceResponse(text, voiceType = 'calm_clear_female') {
    try {
      // Use ElevenLabs for high-quality voice
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + this.getVoiceId(voiceType), {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Voice synthesis failed');
      }

      const audioBuffer = await response.arrayBuffer();
      
      // Store in cache for reuse
      const audioKey = `voice_${Buffer.from(text).toString('base64').slice(0, 20)}`;
      await this.cacheVoiceResponse(audioKey, Buffer.from(audioBuffer));
      
      return {
        audioBuffer: Buffer.from(audioBuffer),
        text,
        voiceType,
      };
    } catch (error) {
      console.error('Voice generation error:', error);
      // Fallback to text-only response
      return {
        text,
        voiceType,
        audioBuffer: null,
      };
    }
  }

  getVoiceId(voiceType) {
    const voiceMap = {
      'calm_clear_female': '21m00Tcm4TlvDq8ikWAM',
      'confident_authoritative_male': 'AZnzlk1XvdvUeBnXmlld',
      'friendly_upbeat_female': 'EXAVITGu4q4bfSDcYiQO',
      'deep_grounding_male': 'ErXwobaJiG0W9zZ8AaWC',
      'warm_nurturing_female': 'MF3mGyEYCl7XYWbV9V6O',
      'young_energetic_neutral': 'TxGEqnHWrfLFT81dX16p',
    };
    
    return voiceMap[voiceType] || voiceMap['calm_clear_female'];
  }

  // Conversational AI
  async processUserMessage(message, conversationHistory, userProfile) {
    const prompt = this.buildConversationPrompt(message, conversationHistory, userProfile);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.getHaloPersona('conversation')
        },
        ...conversationHistory,
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    const aiResponse = response.choices[0].message.content;
    
    // Store conversation in vector memory
    await this.storeConversationMemory('conversation', {
      user_id: userProfile.id,
      user_message: message,
      ai_response: aiResponse,
      timestamp: new Date().toISOString(),
    });

    return aiResponse;
  }

  buildConversationPrompt(message, history, userProfile) {
    return `
User message: "${message}"

User context:
- Health Score: ${userProfile.healthScore || 'Not calculated'}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}
- Recent Scans: ${userProfile.recentScans?.length || 0}

Respond as Halo - warm, knowledgeable, and personalized to their health journey.
    `;
  }

  // Ingredient Education
  async explainIngredient(ingredientName, userProfile) {
    const prompt = `
Explain this ingredient in detail: ${ingredientName}

User Profile Context:
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}

Provide:
1. What it is and how it's made
2. Common uses in food/products
3. Health effects (positive and negative)
4. Scientific mechanism of action
5. Safety concerns and regulations
6. Alternatives if problematic

Use scientific terms followed by bracketed plain-language explanations.
Keep it comprehensive but accessible.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition scientist and toxicologist explaining ingredients to health-conscious consumers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }

  // Menu Analysis
  async generateMenuAnalysis(menuItem, userProfile) {
    const prompt = `
Analyze this restaurant menu item for the user's health profile:

MENU ITEM:
Name: ${menuItem.name}
Description: ${menuItem.description || 'None'}
Ingredients: ${menuItem.ingredients?.join(', ') || 'Unknown'}

USER PROFILE:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies/Intolerances: ${userProfile.allergies_intolerances?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Analyze and provide:
1. Health score (0-100)
2. Status: 'clean', 'caution', or 'avoid'
3. Specific concerns or benefits
4. Reasons for the rating
5. Healthier alternatives if needed

Return as JSON:
{
  "score": 75,
  "status": "clean",
  "reasons": ["Low in processed ingredients", "Contains beneficial nutrients"],
  "alternatives": ["Grilled salmon with vegetables"]
}
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a nutritionist analyzing restaurant menu items for health-conscious diners.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        score: 50,
        status: 'caution',
        reasons: ['Unable to fully analyze ingredients'],
        alternatives: [],
      };
    }
  }

  // Health Trend Analysis
  async analyzeHealthTrends(healthScores, userProfile) {
    const prompt = `
Analyze health score trends and provide insights:

HEALTH SCORE DATA:
${JSON.stringify(healthScores, null, 2)}

USER PROFILE:
- Health Goals: ${userProfile.healthGoals?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Provide analysis:
1. Overall trend direction and significance
2. Key improvements or declines
3. Factors that may be influencing changes
4. Recommendations for continued improvement
5. Areas needing attention

Be encouraging but honest about areas for improvement.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a health coach analyzing trends and providing actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.4,
    });

    return response.choices[0].message.content;
  }

  // Persona Definitions
  getHaloPersona(context) {
    const basePersona = `You are Halo, an AI health coach with these characteristics:
- Warm, knowledgeable, and scientifically rigorous
- Always explains complex topics in accessible language
- Uses technical terms followed immediately by bracketed plain-language explanations
- Empowering and encouraging, never judgmental
- Focused on evidence-based health guidance
- Personalizes advice based on user's specific health profile
- Cares deeply about helping people make informed health choices`;

    const contextSpecific = {
      product_analysis: `${basePersona}
You specialize in analyzing products and explaining their health impacts.
Always provide specific, actionable recommendations.`,
      
      meal_planning: `${basePersona}
You specialize in creating personalized meal plans that are delicious, nutritious, and compatible with dietary restrictions.
Focus on whole foods and practical recipes.`,
      
      daily_tip: `${basePersona}
You provide concise, encouraging daily tips that build on recent user activity.
Keep it positive and actionable.`,
      
      conversation: `${basePersona}
You engage in natural, supportive conversations about health.
Remember previous context and build on it.`,
    };

    return contextSpecific[context] || basePersona;
  }

  // Vector Memory Management
  async storeConversationMemory(type, data) {
    try {
      const vector = await this.createEmbedding(JSON.stringify(data));
      
      await this.voiceIndex.upsert([{
        id: `${type}_${Date.now()}`,
        values: vector,
        metadata: {
          type,
          user_id: data.user_id || null,
          timestamp: new Date().toISOString(),
          ...data,
        },
      }]);
    } catch (error) {
      console.error('Vector memory storage error:', error);
    }
  }

  async createEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  async searchMemory(query, userId, limit = 5) {
    try {
      const queryVector = await this.createEmbedding(query);
      
      const results = await this.voiceIndex.query({
        vector: queryVector,
        filter: {
          user_id: userId,
        },
        topK: limit,
        includeMetadata: true,
      });

      return results.matches.map(match => match.metadata);
    } catch (error) {
      console.error('Memory search error:', error);
      return [];
    }
  }

  async storeUserPreferences(userId, category, preferences) {
    await this.storeConversationMemory('preferences', {
      user_id: userId,
      category,
      preferences,
    });
  }

  async getUserPreferences(userId, category) {
    const memories = await this.searchMemory(`preferences ${category}`, userId, 1);
    return memories[0]?.preferences || {};
  }

  // Voice Response Caching
  async cacheVoiceResponse(key, audioBuffer) {
    // Implement caching logic (Redis, file system, etc.)
    // This prevents regenerating the same voice responses
  }

  async getCachedVoiceResponse(key) {
    // Retrieve cached voice response if exists
    return null;
  }

  // Batch Processing for Efficiency
  async batchGenerateAnalyses(products, userProfile) {
    const batchSize = 5; // Process 5 at a time to avoid rate limits
    const results = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const batchPromises = batch.map(product => 
        this.generateProductAnalysis(product, userProfile)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay to avoid rate limits
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

module.exports = new AIService();
```

## Voice Service Integration

### Voice Input/Output Service
```javascript
// src/services/voiceService.js
const aiService = require('./aiService');
const fs = require('fs').promises;

class VoiceService {
  constructor() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.cache = new Map();
  }

  // Voice Input Processing
  async processVoiceInput(audioBuffer, userProfile) {
    try {
      // Step 1: Transcribe audio to text
      const transcription = await aiService.transcribeVoiceInput(audioBuffer);
      
      // Step 2: Process the transcribed text
      const processedText = await this.processVoiceCommand(transcription, userProfile);
      
      return {
        transcription,
        processedText,
        intent: this.detectIntent(transcription),
      };
    } catch (error) {
      console.error('Voice input processing error:', error);
      throw new Error('Failed to process voice input');
    }
  }

  async processVoiceCommand(transcription, userProfile) {
    const prompt = `
Process this voice command for health profile setup:

Transcription: "${transcription}"

User Context:
- Current step in onboarding
- Existing dietary restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Existing allergies: ${userProfile.allergies_intolerances?.join(', ') || 'None'}

Extract and categorize:
1. Dietary restrictions mentioned
2. Allergies/intolerances mentioned
3. Health concerns mentioned
4. Specific ingredients to avoid/limit
5. Any other health information

Return structured JSON:
{
  "dietary_restrictions": ["gluten_free"],
  "allergies_intolerances": ["peanut_allergy"],
  "health_concerns": ["gut_health"],
  "ingredient_preferences": [
    {"ingredient_name": "sugar", "preference": "avoid"}
  ],
  "confidence": 0.9
}
    `;

    const response = await aiService.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You extract health information from voice commands with high accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.1,
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Voice command parsing error:', error);
      return {
        dietary_restrictions: [],
        allergies_intolerances: [],
        health_concerns: [],
        ingredient_preferences: [],
        confidence: 0,
      };
    }
  }

  detectIntent(transcription) {
    const text = transcription.toLowerCase();
    
    if (text.includes('allergic') || text.includes('allergy')) {
      return 'allergy_report';
    }
    
    if (text.includes('diet') || text.includes('eat') || text.includes('food')) {
      return 'dietary_restriction';
    }
    
    if (text.includes('avoid') || text.includes('can\'t eat')) {
      return 'avoidance';
    }
    
    if (text.includes('health') || text.includes('condition') || text.includes('concern')) {
      return 'health_concern';
    }
    
    return 'general';
  }

  // Voice Output Generation
  async generateVoiceResponse(text, voiceType, options = {}) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(text, voiceType);
      const cached = await this.getCachedVoiceResponse(cacheKey);
      
      if (cached && !options.skipCache) {
        return cached;
      }

      // Generate new voice response
      const voiceData = await aiService.generateVoiceResponse(text, voiceType);
      
      // Cache the response
      await this.cacheVoiceResponse(cacheKey, voiceData);
      
      return voiceData;
    } catch (error) {
      console.error('Voice response generation error:', error);
      throw new Error('Failed to generate voice response');
    }
  }

  generateCacheKey(text, voiceType) {
    const hash = require('crypto')
      .createHash('md5')
      .update(`${text}_${voiceType}`)
      .digest('hex');
    
    return `voice_${hash}`;
  }

  async cacheVoiceResponse(key, voiceData) {
    this.cache.set(key, voiceData);
    
    // Implement persistent caching if needed
    // Could use Redis, file system, or database
  }

  async getCachedVoiceResponse(key) {
    return this.cache.get(key) || null;
  }

  // Queue Management for Sequential Playback
  addToQueue(text, voiceType, priority = 'normal') {
    const item = {
      id: Date.now(),
      text,
      voiceType,
      priority,
      timestamp: new Date(),
    };

    if (priority === 'high') {
      this.audioQueue.unshift(item);
    } else {
      this.audioQueue.push(item);
    }

    this.processQueue();
  }

  async processQueue() {
    if (this.isPlaying || this.audioQueue.length === 0) {
      return;
    }

    this.isPlaying = true;
    
    while (this.audioQueue.length > 0) {
      const item = this.audioQueue.shift();
      
      try {
        await this.playVoiceResponse(item.text, item.voiceType);
      } catch (error) {
        console.error('Queue playback error:', error);
      }
    }
    
    this.isPlaying = false;
  }

  async playVoiceResponse(text, voiceType) {
    const voiceData = await this.generateVoiceResponse(text, voiceType);
    
    if (voiceData.audioBuffer) {
      // Play the audio (implementation depends on platform)
      await this.playAudioBuffer(voiceData.audioBuffer);
    }
  }

  async playAudioBuffer(audioBuffer) {
    // Platform-specific audio playback
    // For Node.js backend, this would stream to client
    // For React Native, would use expo-av
    console.log('Playing audio:', audioBuffer.length, 'bytes');
  }

  clearQueue() {
    this.audioQueue = [];
  }

  // Voice Personalization
  async personalizeVoiceForUser(userId, userProfile) {
    const preferences = await aiService.getUserPreferences(userId, 'voice');
    
    return {
      voiceType: preferences.voice_type || 'calm_clear_female',
      speechRate: preferences.speech_rate || 0.9,
      pitch: preferences.pitch || 1.0,
      volume: preferences.volume || 0.8,
    };
  }

  async updateUserVoicePreferences(userId, preferences) {
    await aiService.storeUserPreferences(userId, 'voice', preferences);
  }
}

module.exports = new VoiceService();
```

## AI-Powered Recommendation Engine

### Recommendation Service
```javascript
// src/services/recommendationEngine.js
const aiService = require('./aiService');
const { supabase } = require('../utils/database');

class RecommendationEngine {
  async getCleanAlternatives(productId, userProfile, limit = 5) {
    try {
      // Get original product
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Find alternatives in same category with higher score
      const { data: alternatives } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .gt('health_score', product.health_score)
        .order('health_score', { ascending: false })
        .limit(limit * 2); // Get more to filter

      // Filter by user profile compatibility
      const compatibleAlternatives = alternatives.filter(alt => 
        this.isCompatibleWithProfile(alt, userProfile)
      ).slice(0, limit);

      // Generate detailed explanations for each alternative
      const detailedAlternatives = await Promise.all(
        compatibleAlternatives.map(async (alt) => {
          const explanation = await this.generateAlternativeExplanation(
            product, 
            alt, 
            userProfile
          );
          
          return {
            ...alt,
            why_better: explanation,
            score_improvement: alt.health_score - product.health_score,
          };
        })
      );

      return detailedAlternatives;
    } catch (error) {
      console.error('Clean alternatives error:', error);
      throw new Error('Failed to get clean alternatives');
    }
  }

  async generateAlternativeExplanation(originalProduct, alternativeProduct, userProfile) {
    const prompt = `
Explain why this alternative is better than the original:

ORIGINAL PRODUCT:
Name: ${originalProduct.name}
Ingredients: ${originalProduct.ingredients.join(', ')}
Health Score: ${originalProduct.health_score}/100
Issues: ${this.identifyProductIssues(originalProduct, userProfile).join(', ')}

ALTERNATIVE PRODUCT:
Name: ${alternativeProduct.name}
Ingredients: ${alternativeProduct.ingredients.join(', ')}
Health Score: ${alternativeProduct.health_score}/100

USER PROFILE:
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Health Concerns: ${userProfile.health_concerns?.join(', ') || 'None'}

Provide a detailed explanation:
1. What harmful ingredients are removed in the alternative
2. What beneficial ingredients are added
3. How this specifically addresses the user's health concerns
4. The measurable health impact difference
5. Any taste or usage considerations

Use scientific terms with bracketed explanations. Be specific and evidence-based.
    `;

    const response = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a nutrition scientist explaining product differences to health-conscious consumers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }

  identifyProductIssues(product, userProfile) {
    const issues = [];
    
    // Check dietary restrictions
    if (userProfile.dietary_restrictions) {
      for (const restriction of userProfile.dietary_restrictions) {
        if (this.violatesRestriction(product, restriction)) {
          issues.push(`Contains ${restriction.replace('_', ' ')} ingredients`);
        }
      }
    }
    
    // Check allergies
    if (userProfile.allergies_intolerances) {
      for (const allergy of userProfile.allergies_intolerances) {
        if (this.containsAllergen(product, allergy)) {
          issues.push(`Contains ${allergy} allergen`);
        }
      }
    }
    
    // Check processing level
    if (product.processing_level === 'high') {
      issues.push('Highly processed');
    }
    
    // Check for concerning ingredients
    const concerningIngredients = this.identifyConcerningIngredients(product);
    if (concerningIngredients.length > 0) {
      issues.push(`Contains concerning ingredients: ${concerningIngredients.join(', ')}`);
    }
    
    return issues;
  }

  violatesRestriction(product, restriction) {
    const restrictionMap = {
      'gluten_free': (product) => this.containsGluten(product),
      'dairy_free': (product) => this.containsDairy(product),
      'vegan': (product) => this.containsAnimalProducts(product),
      'vegetarian': (product) => this.containsMeat(product),
    };

    const rule = restrictionMap[restriction];
    return rule ? rule(product) : false;
  }

  containsGluten(product) {
    const glutenIngredients = ['wheat', 'barley', 'rye', 'oats'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return glutenIngredients.some(ing => ingredients.includes(ing));
  }

  containsDairy(product) {
    const dairyIngredients = ['milk', 'cheese', 'butter', 'cream'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return dairyIngredients.some(ing => ingredients.includes(ing));
  }

  containsAnimalProducts(product) {
    const animalIngredients = ['milk', 'egg', 'meat', 'fish', 'honey'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return animalIngredients.some(ing => ingredients.includes(ing));
  }

  containsMeat(product) {
    const meatIngredients = ['meat', 'chicken', 'beef', 'pork'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return meatIngredients.some(ing => ingredients.includes(ing));
  }

  containsAllergen(product, allergen) {
    return product.allergens_present?.includes(allergen) || 
           product.ingredients.some(ing => 
             ing.toLowerCase().includes(allergen.toLowerCase())
           );
  }

  identifyConcerningIngredients(product) {
    const concerningIngredients = [
      'high fructose corn syrup',
      'hydrogenated oil',
      'artificial flavor',
      'artificial color',
      'msg',
      'sodium nitrite',
      'bha',
      'bht',
      'propylene glycol',
    ];

    return product.ingredients.filter(ingredient =>
      concerningIngredients.some(concerning =>
        ingredient.toLowerCase().includes(concerning)
      )
    );
  }

  isCompatibleWithProfile(product, userProfile) {
    // Check dietary restrictions
    if (userProfile.dietary_restrictions) {
      for (const restriction of userProfile.dietary_restrictions) {
        if (this.violatesRestriction(product, restriction)) {
          return false;
        }
      }
    }
    
    // Check allergies
    if (userProfile.allergies_intolerances) {
      for (const allergy of userProfile.allergies_intolerances) {
        if (this.containsAllergen(product, allergy)) {
          return false;
        }
      }
    }
    
    return true;
  }

  async getPersonalizedRecommendations(userId, profileId, limit = 10) {
    try {
      // Get user profile and preferences
      const { data: profile } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      // Get recent scan history
      const { data: recentScans } = await supabase
        .from('product_scans')
        .select(`
          products (
            category,
            health_score,
            ingredients
          )
        `)
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Analyze patterns and generate recommendations
      const recommendations = await this.generateRecommendations(
        profile, 
        recentScans, 
        limit
      );

      return recommendations;
    } catch (error) {
      console.error('Personalized recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async generateRecommendations(profile, recentScans, limit) {
    const prompt = `
Generate personalized product recommendations based on user data:

USER PROFILE:
- Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Health Concerns: ${profile.health_concerns?.join(', ') || 'None'}
- Age Group: ${profile.age_group}

RECENT SCANS:
${recentScans.slice(0, 10).map(scan => 
  `- ${scan.products.category} (Score: ${scan.products.health_score})`
).join('\n')}

RECOMMENDATION TYPES NEEDED:
1. Products to replace frequently scanned low-scoring items
2. New product discoveries in categories of interest
3. Products specifically targeting user's health concerns
4. Seasonal or trending healthy products

For each recommendation provide:
- Product category
- Key characteristics to look for
- Why it's recommended for this user
- Expected health benefits

Return as structured JSON with 10 recommendations.
    `;

    const response = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a personalized product recommendation specialist for health-conscious consumers.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.4,
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Recommendation parsing error:', error);
      return [];
    }
  }
}

module.exports = new RecommendationEngine();
```

## AI Memory & Learning System

### Learning Service
```javascript
// src/services/learningService.js
const aiService = require('./aiService');
const { supabase } = require('../utils/database');

class LearningService {
  async learnFromUserFeedback(userId, feedback) {
    try {
      // Store feedback for learning
      await this.storeFeedback(userId, feedback);
      
      // Update user preferences based on feedback
      await this.updateUserPreferences(userId, feedback);
      
      // Improve future recommendations
      await this.improveRecommendationModel(userId, feedback);
      
      return true;
    } catch (error) {
      console.error('Learning from feedback error:', error);
      return false;
    }
  }

  async storeFeedback(userId, feedback) {
    const { error } = await supabase
      .from('user_feedback')
      .insert([{
        user_id: userId,
        feedback_type: feedback.type,
        feedback_data: feedback.data,
        context: feedback.context,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async updateUserPreferences(userId, feedback) {
    switch (feedback.type) {
      case 'product_rating':
        await this.updateProductPreferences(userId, feedback.data);
        break;
      case 'voice_feedback':
        await this.updateVoicePreferences(userId, feedback.data);
        break;
      case 'recommendation_feedback':
        await this.updateRecommendationPreferences(userId, feedback.data);
        break;
    }
  }

  async updateProductPreferences(userId, data) {
    // Learn from product ratings and interactions
    const { productId, rating, saved, reasons } = data;
    
    // Update user's implicit preferences
    const preferences = await aiService.getUserPreferences(userId, 'products');
    
    if (!preferences.liked_categories) {
      preferences.liked_categories = {};
    }
    
    if (!preferences.disliked_ingredients) {
      preferences.disliked_ingredients = {};
    }
    
    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('category, ingredients')
      .eq('id', productId)
      .single();

    if (product) {
      // Update category preferences
      if (rating >= 4) {
        preferences.liked_categories[product.category] = 
          (preferences.liked_categories[product.category] || 0) + 1;
      } else if (rating <= 2) {
        if (!preferences.disliked_categories) {
          preferences.disliked_categories = {};
        }
        preferences.disliked_categories[product.category] = 
          (preferences.disliked_categories[product.category] || 0) + 1;
      }
      
      // Update ingredient preferences based on reasons
      if (reasons) {
        reasons.forEach(reason => {
          if (reason.type === 'ingredient') {
            preferences.disliked_ingredients[reason.ingredient] = 
              (preferences.disliked_ingredients[reason.ingredient] || 0) + 1;
          }
        });
      }
    }
    
    await aiService.storeUserPreferences(userId, 'products', preferences);
  }

  async updateVoicePreferences(userId, data) {
    const { voiceType, rating, feedback } = data;
    
    const preferences = await aiService.getUserPreferences(userId, 'voice');
    
    if (!preferences.voice_ratings) {
      preferences.voice_ratings = {};
    }
    
    preferences.voice_ratings[voiceType] = rating;
    
    if (feedback) {
      preferences.voice_feedback = feedback;
    }
    
    await aiService.storeUserPreferences(userId, 'voice', preferences);
  }

  async updateRecommendationPreferences(userId, data) {
    const { recommendationId, action, reason } = data;
    
    const preferences = await aiService.getUserPreferences(userId, 'recommendations');
    
    if (!preferences.recommendation_actions) {
      preferences.recommendation_actions = {};
    }
    
    preferences.recommendation_actions[recommendationId] = {
      action, // 'accepted', 'rejected', 'saved'
      reason,
      timestamp: new Date().toISOString(),
    };
    
    await aiService.storeUserPreferences(userId, 'recommendations', preferences);
  }

  async improveRecommendationModel(userId, feedback) {
    // Analyze feedback patterns to improve recommendations
    const feedbackHistory = await this.getFeedbackHistory(userId);
    
    const patterns = this.analyzeFeedbackPatterns(feedbackHistory);
    
    // Store learning patterns
    await this.storeLearningPatterns(userId, patterns);
  }

  async getFeedbackHistory(userId, limit = 100) {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  analyzeFeedbackPatterns(feedbackHistory) {
    const patterns = {
      preferred_categories: {},
      avoided_ingredients: {},
      preferred_voice_types: {},
      recommendation_acceptance_rate: 0,
    };

    let totalRecommendations = 0;
    let acceptedRecommendations = 0;

    feedbackHistory.forEach(feedback => {
      switch (feedback.feedback_type) {
        case 'product_rating':
          this.analyzeProductFeedback(feedback, patterns);
          break;
        case 'voice_feedback':
          this.analyzeVoiceFeedback(feedback, patterns);
          break;
        case 'recommendation_feedback':
          this.analyzeRecommendationFeedback(feedback, patterns);
          totalRecommendations++;
          if (feedback.feedback_data.action === 'accepted') {
            acceptedRecommendations++;
          }
          break;
      }
    });

    patterns.recommendation_acceptance_rate = 
      totalRecommendations > 0 ? acceptedRecommendations / totalRecommendations : 0;

    return patterns;
  }

  analyzeProductFeedback(feedback, patterns) {
    const { rating, product_category, ingredients } = feedback.feedback_data;
    
    if (rating >= 4) {
      patterns.preferred_categories[product_category] = 
        (patterns.preferred_categories[product_category] || 0) + 1;
    } else if (rating <= 2 && ingredients) {
      ingredients.forEach(ingredient => {
        patterns.avoided_ingredients[ingredient] = 
          (patterns.avoided_ingredients[ingredient] || 0) + 1;
      });
    }
  }

  analyzeVoiceFeedback(feedback, patterns) {
    const { voiceType, rating } = feedback.feedback_data;
    
    if (rating >= 4) {
      patterns.preferred_voice_types[voiceType] = 
        (patterns.preferred_voice_types[voiceType] || 0) + 1;
    }
  }

  analyzeRecommendationFeedback(feedback, patterns) {
    // Analyze recommendation acceptance patterns
    // This could be expanded to track more detailed patterns
  }

  async storeLearningPatterns(userId, patterns) {
    await aiService.storeUserPreferences(userId, 'learning_patterns', patterns);
  }

  async getPersonalizedInsights(userId) {
    try {
      const patterns = await aiService.getUserPreferences(userId, 'learning_patterns');
      
      if (!patterns || Object.keys(patterns).length === 0) {
        return this.getDefaultInsights();
      }

      const insights = await this.generateInsightsFromPatterns(patterns);
      
      return insights;
    } catch (error) {
      console.error('Personalized insights error:', error);
      return this.getDefaultInsights();
    }
  }

  async generateInsightsFromPatterns(patterns) {
    const prompt = `
Generate personalized insights from user learning patterns:

LEARNING PATTERNS:
${JSON.stringify(patterns, null, 2)}

Generate insights about:
1. User's preferred product categories
2. Ingredients they tend to avoid
3. Voice preferences
4. Recommendation acceptance patterns
5. Suggestions for improving their experience

Provide 3-5 actionable insights in a supportive, encouraging tone.
    `;

    const response = await aiService.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning analyst providing insights about user preferences and behavior patterns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  }

  getDefaultInsights() {
    return [
      "Continue scanning products to build your personalized recommendations",
      "Try using voice input for faster profile setup",
      "Save products you like to get better alternatives",
    ];
  }
}

module.exports = new LearningService();
```

This AI integration provides:

1. **Comprehensive AI coaching** with personalized product analysis
2. **Advanced voice capabilities** for input/output with multiple voice options
3. **Intelligent meal planning** based on dietary restrictions and preferences
4. **Smart recommendation engine** that learns from user feedback
5. **Vector memory system** for contextual conversations
6. **Personalized insights** that improve over time
7. **Batch processing** for efficiency and cost management
8. **Caching systems** to optimize performance and reduce API costs

The AI system is designed to be warm, knowledgeable, and scientifically rigorous while remaining accessible to all users.
