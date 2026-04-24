const { supabase } = require('../utils/database');
const productService = require('./productService');
const aiService = require('./aiService');
const ocrService = require('./ocrService');
const healthScoreService = require('./healthScoreService');
const productHealthScoreService = require('./productHealthScoreService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger, logAICall } = require('../utils/logger');

class ScanService {
  async scanByBarcode(barcode, userId, profileId) {
    try {
      logger.info(`Starting barcode scan: ${barcode} for user: ${userId}`);

      // Look up product with personalized scoring
      let product = await productService.getProductByBarcode(barcode, profileId);
      
      if (!product) {
        return {
          success: false,
          needsPhotoScan: true,
          barcode,
          message: 'Product not found in our database. Try scanning the ingredient label or searching manually.',
        };
      }

      // Get user profile for analysis
      const profile = await this.getUserProfile(profileId);
      
      // Generate personalized analysis using AI
      const analysis = await this.generateProductAnalysis(product, profile);
      
      // Check for recalls
      const recallInfo = await this.checkProductRecall(product.id);
      
      // Record the scan
      const scanRecord = await this.recordScan(
        userId, 
        profileId, 
        product.id, 
        'barcode', 
        product.score_data?.overall_score || product.health_score || 50
      );
      
      // Update user's health score
      await healthScoreService.updateHealthScore(userId, profileId);
      
      logger.info(`Barcode scan completed: ${barcode}`);
      
      return {
        success: true,
        product: {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          category: product.category,
          image_url: product.image_url,
          ingredients: product.ingredients,
          nutrition_info: product.nutrition_info,
          allergens_present: product.allergens_present,
          toxins_detected: product.toxins_detected,
          health_score: product.health_score,
          score_data: product.score_data,
          halo_analysis: analysis,
          recall_info: recallInfo,
        },
        scan: {
          id: scanRecord.id,
          created_at: scanRecord.created_at,
        },
      };
    } catch (error) {
      logger.error('Barcode scan error:', error);
      throw error;
    }
  }

  async scanByPhoto(imageBuffer, userId, profileId) {
    try {
      logger.info(`Starting photo scan for user: ${userId}`);

      // Extract text using OCR
      const ocrResult = await ocrService.extractText(imageBuffer);
      
      // Parse ingredients and product info
      const parsedData = await this.parseProductData(ocrResult);
      
      // Try to identify product
      let product = await this.identifyProductFromParsedData(parsedData);
      
      if (!product) {
        // Create new product from parsed data
        product = await productService.createProduct({
          name: parsedData.productName || 'Unknown Product',
          brand: parsedData.brand || 'Unknown Brand',
          ingredients: parsedData.ingredients || [],
          category: this.categorizeProduct(parsedData),
          processing_level: this.estimateProcessingLevel(parsedData),
          nutrition_info: parsedData.nutritionInfo || {},
        });
        logger.info(`Created new product from OCR scan`);
      }

      // Get user profile
      const profile = await this.getUserProfile(profileId);
      
      // Generate analysis
      const analysis = await this.generateProductAnalysis(product, profile);
      const personalizedScore = await this.calculatePersonalizedScore(product, profile);
      
      // Record the scan
      await this.recordScan(userId, profileId, product.id, 'photo', personalizedScore);
      
      // Update health score
      await healthScoreService.updateHealthScore(userId, profileId);
      
      logger.info(`Photo scan completed for user: ${userId}`);
      
      return {
        success: true,
        product: {
          ...product,
          personalized_score: personalizedScore,
          halo_analysis: analysis,
          extracted_data: parsedData,
        },
        scan_time: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Photo scan error:', error);
      throw error;
    }
  }

  async searchExternalDatabases(barcode) {
    // Try Open Food Facts API
    let product = await this.searchOpenFoodFacts(barcode);
    
    if (!product) {
      // Try other APIs
      product = await this.searchUPCDatabase(barcode);
    }

    return product;
  }

  async searchOpenFoodFacts(barcode) {
    try {
      const ALLOWED_OFF_HOST = 'world.openfoodfacts.org';
      const baseUrl = process.env.OPEN_FOOD_FACTS_API_URL || `https://${ALLOWED_OFF_HOST}`;
      const parsedBase = new URL(baseUrl);
      if (parsedBase.hostname !== ALLOWED_OFF_HOST) {
        throw new Error(`Disallowed Open Food Facts host: ${parsedBase.hostname}`);
      }
      const response = await fetch(`${parsedBase.origin}/api/v0/product/${encodeURIComponent(barcode)}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        
        return {
          barcode: barcode,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          ingredients: product.ingredients_text ? product.ingredients_text.split(',').map(i => i.trim()) : [],
          category: this.mapOpenFoodFactsCategory(product.categories),
          nutrition_info: product.nutriments || {},
          image_url: product.image_front_url,
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Open Food Facts API error:', error);
      return null;
    }
  }

  async searchUPCDatabase(barcode) {
    try {
      // Implementation for UPC database API
      // This would integrate with UPC database services
      return null;
    } catch (error) {
      logger.error('UPC Database API error:', error);
      return null;
    }
  }

  async parseProductData(ocrResult) {
    // Use AI to parse OCR text into structured product data
    return aiService.parseProductOCR(ocrResult);
  }

  async identifyProductFromParsedData(parsedData) {
    // Try to match parsed data with existing products
    return productService.identifyProduct(parsedData);
  }

  categorizeProduct(parsedData) {
    // Use AI to categorize product based on ingredients and name
    const keywords = {
      food: ['cereal', 'snack', 'pasta', 'rice', 'bread', 'cookie', 'cracker'],
      beverage: ['water', 'juice', 'soda', 'drink', 'tea', 'coffee'],
      supplement: ['vitamin', 'supplement', 'protein', 'mineral'],
      personal_care: ['shampoo', 'soap', 'lotion', 'cream', 'cosmetic'],
      household: ['cleaner', 'detergent', 'soap', 'bleach'],
    };

    const text = (parsedData.productName + ' ' + parsedData.ingredients.join(' ')).toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return category;
      }
    }

    return 'unknown';
  }

  estimateProcessingLevel(parsedData) {
    // Estimate processing level based on ingredients
    const processedKeywords = ['extract', 'hydrogenated', 'modified', 'artificial', 'synthetic'];
    const naturalKeywords = ['organic', 'whole', 'raw', 'natural'];
    
    const ingredients = parsedData.ingredients.join(' ').toLowerCase();
    
    const processedCount = processedKeywords.filter(keyword => ingredients.includes(keyword)).length;
    const naturalCount = naturalKeywords.filter(keyword => ingredients.includes(keyword)).length;
    
    if (processedCount > naturalCount) {
      return 'high';
    } else if (processedCount === 0 && naturalCount > 0) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  mapOpenFoodFactsCategory(categories) {
    // Map Open Food Facts categories to our categories
    const categoryMap = {
      'beverages': 'beverage',
      'snacks': 'food',
      'dairies': 'food',
      'meals': 'food',
      'cosmetics': 'personal_care',
      'household': 'household',
    };

    for (const [offCategory, ourCategory] of Object.entries(categoryMap)) {
      if (categories.toLowerCase().includes(offCategory)) {
        return ourCategory;
      }
    }

    return 'food'; // Default
  }

  async getUserProfile(profileId) {
    const { data: profile, error } = await supabase
      .from('health_profiles')
      .select(`
        *,
        dietary_restrictions (restriction_type),
        allergies_intolerances (allergy_type, severity),
        ingredient_preferences (ingredient_name, preference),
        health_concerns (concern_type, priority)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;

    // Flatten related data
    return {
      ...profile,
      dietary_restrictions: profile.dietary_restrictions?.map(r => r.restriction_type) || [],
      allergies_intolerances: profile.allergies_intolerances?.map(a => a.allergy_type) || [],
      ingredient_preferences: profile.ingredient_preferences || [],
      health_concerns: profile.health_concerns?.map(c => c.concern_type) || [],
    };
  }

  async generateProductAnalysis(product, profile) {
    const startTime = Date.now();
    try {
      const analysis = await aiService.generateProductAnalysis(product, profile);
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration);
      return analysis;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAICall('OpenAI', 'product_analysis', duration, null, error);
      throw error;
    }
  }

  async calculatePersonalizedScore(product, profile) {
    let baseScore = product.health_score || 50;
    
    // Check dietary restrictions
    if (profile.dietary_restrictions) {
      for (const restriction of profile.dietary_restrictions) {
        const penalty = this.checkDietaryRestriction(product, restriction);
        baseScore -= penalty;
      }
    }
    
    // Check allergies
    if (profile.allergies_intolerances) {
      for (const allergy of profile.allergies_intolerances) {
        if (this.containsAllergen(product, allergy)) {
          baseScore -= 30; // Heavy penalty for allergens
        }
      }
    }
    
    // Check ingredient preferences
    if (profile.ingredient_preferences) {
      for (const pref of profile.ingredient_preferences) {
        if (pref.preference === 'avoid' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore -= 20;
        } else if (pref.preference === 'limit' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore -= 10;
        } else if (pref.preference === 'can_eat' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore += 5;
        }
      }
    }
    
    return Math.max(0, Math.min(100, baseScore));
  }

  checkDietaryRestriction(product, restriction) {
    const restrictionRules = {
      'gluten_free': (product) => this.containsGluten(product),
      'dairy_free': (product) => this.containsDairy(product),
      'vegan': (product) => this.containsAnimalProducts(product),
      'vegetarian': (product) => this.containsMeat(product),
      'keto': (product) => this.hasHighCarbs(product),
      'paleo': (product) => this.containsPaleoForbidden(product),
    };

    const rule = restrictionRules[restriction];
    return rule ? (rule(product) ? 25 : 0) : 0;
  }

  containsGluten(product) {
    const glutenIngredients = ['wheat', 'barley', 'rye', 'oats', 'spelt', 'kamut'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return glutenIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsDairy(product) {
    const dairyIngredients = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return dairyIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsAnimalProducts(product) {
    const animalIngredients = ['milk', 'egg', 'meat', 'fish', 'chicken', 'beef', 'pork', 'honey'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return animalIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsMeat(product) {
    const meatIngredients = ['meat', 'chicken', 'beef', 'pork', 'turkey', 'fish'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return meatIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  hasHighCarbs(product) {
    // Check nutrition info for high carb content
    if (product.nutrition_info?.carbohydrates) {
      return product.nutrition_info.carbohydrates > 25; // per serving
    }
    return false;
  }

  containsPaleoForbidden(product) {
    const paleoForbidden = ['grains', 'legumes', 'dairy', 'sugar', 'processed foods'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return paleoForbidden.some(ingredient => ingredients.includes(ingredient));
  }

  containsAllergen(product, allergen) {
    return product.allergens_present?.includes(allergen) || 
           product.ingredients.some(ingredient => 
             ingredient.toLowerCase().includes(allergen.toLowerCase())
           );
  }

  containsIngredient(product, ingredientName) {
    return product.ingredients.some(ingredient => 
      ingredient.toLowerCase().includes(ingredientName.toLowerCase())
    );
  }

  async checkProductRecall(productId) {
    const { data, error } = await supabase
      .from('product_recalls')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // No recall found
    }

    if (error) throw error;

    return data;
  }

  async recordScan(userId, profileId, productId, scanType, score) {
    const { data, error } = await supabase
      .from('product_scans')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        product_id: productId,
        scan_type: scanType,
        score_given: score,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  }

  async saveProduct(userId, productId, listType = 'clean_choices') {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_products')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('list_type', listType)
      .single();

    if (existing) {
      throw new ValidationError('Product already saved');
    }

    const { error } = await supabase
      .from('saved_products')
      .insert([{
        user_id: userId,
        product_id: productId,
        list_type: listType,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async unsaveProduct(userId, productId) {
    const { error } = await supabase
      .from('saved_products')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }
}

module.exports = new ScanService();
