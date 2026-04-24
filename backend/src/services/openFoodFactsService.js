const axios = require('axios');
const { logger } = require('../utils/logger');

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2';
const OFF_USER_AGENT = 'HaloHealth/1.0.0 (contact@halohealth.app)';

class OpenFoodFactsService {
  constructor() {
    this.client = axios.create({
      baseURL: OFF_API_BASE,
      headers: {
        'User-Agent': OFF_USER_AGENT,
      },
      timeout: 10000,
    });
  }

  async getProductByBarcode(barcode) {
    try {
      const response = await this.client.get(`/product/${barcode}.json`);
      
      if (response.data.status === 0) {
        return null; // Product not found
      }

      const product = response.data.product;
      return this.normalizeProduct(product, barcode);
    } catch (error) {
      logger.error('Error fetching from Open Food Facts:', error.message);
      return null;
    }
  }

  normalizeProduct(offProduct, barcode) {
    return {
      barcode: barcode,
      name: offProduct.product_name || offProduct.product_name_en || 'Unknown Product',
      brand: offProduct.brands || null,
      category: this.mapCategory(offProduct.categories_tags),
      subcategory: offProduct.categories_tags?.[1] || null,
      ingredients: this.extractIngredients(offProduct),
      nutrition_info: this.extractNutrition(offProduct),
      allergens_present: this.extractAllergens(offProduct),
      toxins_detected: this.detectToxins(offProduct),
      processing_level: this.determineProcessingLevel(offProduct),
      image_url: offProduct.image_url || offProduct.image_front_url || null,
      source: 'open_food_facts',
      raw_data: {
        nutriscore: offProduct.nutriscore_grade,
        nova_group: offProduct.nova_group,
        ecoscore: offProduct.ecoscore_grade,
      }
    };
  }

  extractIngredients(product) {
    if (product.ingredients_text) {
      return product.ingredients_text
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);
    }
    
    if (product.ingredients) {
      return product.ingredients.map(i => i.text || i.id).filter(Boolean);
    }
    
    return [];
  }

  extractNutrition(product) {
    const nutriments = product.nutriments || {};
    
    return {
      serving_size: product.serving_size || null,
      energy_kcal: nutriments['energy-kcal_100g'] || nutriments.energy_100g / 4.184 || null,
      fat: nutriments.fat_100g || null,
      saturated_fat: nutriments['saturated-fat_100g'] || null,
      carbohydrates: nutriments.carbohydrates_100g || null,
      sugars: nutriments.sugars_100g || null,
      fiber: nutriments.fiber_100g || null,
      proteins: nutriments.proteins_100g || null,
      salt: nutriments.salt_100g || null,
      sodium: nutriments.sodium_100g || null,
    };
  }

  extractAllergens(product) {
    const allergens = [];
    
    if (product.allergens_tags) {
      allergens.push(...product.allergens_tags.map(tag => 
        tag.replace('en:', '').replace(/-/g, ' ')
      ));
    }
    
    if (product.traces_tags) {
      allergens.push(...product.traces_tags.map(tag => 
        tag.replace('en:', '').replace(/-/g, ' ') + ' (traces)'
      ));
    }
    
    return [...new Set(allergens)];
  }

  detectToxins(product) {
    const toxins = [];
    const ingredients = (product.ingredients_text || '').toLowerCase();
    
    // Common toxins and harmful ingredients
    const toxinKeywords = [
      'high fructose corn syrup',
      'artificial sweetener',
      'aspartame',
      'sucralose',
      'acesulfame',
      'msg',
      'monosodium glutamate',
      'sodium benzoate',
      'potassium benzoate',
      'bha',
      'bht',
      'tbhq',
      'propyl gallate',
      'sodium nitrite',
      'sodium nitrate',
      'artificial color',
      'red 40',
      'yellow 5',
      'yellow 6',
      'blue 1',
      'blue 2',
      'caramel color',
      'carrageenan',
      'polysorbate',
    ];
    
    toxinKeywords.forEach(toxin => {
      if (ingredients.includes(toxin)) {
        toxins.push(toxin);
      }
    });
    
    return toxins;
  }

  determineProcessingLevel(product) {
    const novaGroup = product.nova_group;
    
    if (novaGroup === 1) return 'unprocessed';
    if (novaGroup === 2) return 'processed_culinary';
    if (novaGroup === 3) return 'processed';
    if (novaGroup === 4) return 'ultra_processed';
    
    return 'unknown';
  }

  mapCategory(categoriesTags) {
    if (!categoriesTags || categoriesTags.length === 0) {
      return 'other';
    }
    
    const mainCategory = categoriesTags[0].replace('en:', '');
    
    const categoryMap = {
      'beverages': 'beverages',
      'snacks': 'snacks',
      'dairy': 'dairy',
      'meat': 'meat',
      'seafood': 'seafood',
      'fruits': 'produce',
      'vegetables': 'produce',
      'cereals': 'grains',
      'bread': 'bakery',
      'pasta': 'grains',
      'condiments': 'condiments',
      'sauces': 'condiments',
      'desserts': 'desserts',
      'frozen': 'frozen',
      'canned': 'canned',
    };
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (mainCategory.includes(key)) {
        return value;
      }
    }
    
    return 'other';
  }

  async searchProducts(query, limit = 20) {
    try {
      const response = await this.client.get('/search', {
        params: {
          search_terms: query,
          page_size: limit,
          fields: 'code,product_name,brands,image_url,nutriscore_grade,nova_group',
        },
      });
      
      if (!response.data.products) {
        return [];
      }
      
      return response.data.products.map(p => ({
        barcode: p.code,
        name: p.product_name,
        brand: p.brands,
        image_url: p.image_url,
        nutriscore: p.nutriscore_grade,
        nova_group: p.nova_group,
      }));
    } catch (error) {
      logger.error('Error searching Open Food Facts:', error.message);
      return [];
    }
  }
}

module.exports = new OpenFoodFactsService();
