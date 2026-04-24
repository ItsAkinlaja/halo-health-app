const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class ProductHealthScoreService {
  async calculateProductScore(product, profileId = null) {
    try {
      let profile = null;
      
      if (profileId) {
        const { data } = await supabase
          .from('health_profiles')
          .select(`
            *,
            dietary_restrictions (*),
            allergies_intolerances (*),
            health_concerns (*)
          `)
          .eq('id', profileId)
          .single();
        
        profile = data;
      }
      
      const baseScore = this.calculateBaseScore(product);
      const personalizedScore = profile 
        ? this.applyPersonalization(baseScore, product, profile)
        : baseScore;
      
      return {
        overall_score: Math.round(personalizedScore),
        base_score: Math.round(baseScore),
        breakdown: this.getScoreBreakdown(product, profile),
        warnings: this.generateWarnings(product, profile),
        recommendations: this.generateRecommendations(product, profile),
      };
    } catch (error) {
      logger.error('Error calculating product score:', error);
      return {
        overall_score: 50,
        base_score: 50,
        breakdown: {},
        warnings: [],
        recommendations: [],
      };
    }
  }

  calculateBaseScore(product) {
    let score = 100;
    
    // Processing level penalty
    const processingPenalty = {
      'unprocessed': 0,
      'processed_culinary': -5,
      'processed': -15,
      'ultra_processed': -30,
      'unknown': -10,
    };
    score += processingPenalty[product.processing_level] || -10;
    
    // Toxins penalty
    if (product.toxins_detected && product.toxins_detected.length > 0) {
      score -= product.toxins_detected.length * 5;
    }
    
    // Nutrition analysis
    if (product.nutrition_info) {
      const nutrition = product.nutrition_info;
      
      // High sugar penalty
      if (nutrition.sugars > 15) score -= 10;
      else if (nutrition.sugars > 10) score -= 5;
      
      // High saturated fat penalty
      if (nutrition.saturated_fat > 5) score -= 10;
      else if (nutrition.saturated_fat > 3) score -= 5;
      
      // High sodium penalty
      if (nutrition.sodium > 1.5) score -= 10;
      else if (nutrition.sodium > 1.0) score -= 5;
      
      // Fiber bonus
      if (nutrition.fiber > 5) score += 5;
      else if (nutrition.fiber > 3) score += 3;
      
      // Protein bonus
      if (nutrition.proteins > 10) score += 5;
      else if (nutrition.proteins > 5) score += 3;
    }
    
    // Nutriscore integration
    if (product.raw_data?.nutriscore) {
      const nutriscoreBonus = {
        'a': 10,
        'b': 5,
        'c': 0,
        'd': -5,
        'e': -10,
      };
      score += nutriscoreBonus[product.raw_data.nutriscore.toLowerCase()] || 0;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  applyPersonalization(baseScore, product, profile) {
    let score = baseScore;
    
    // Check dietary restrictions
    if (profile.dietary_restrictions) {
      profile.dietary_restrictions.forEach(restriction => {
        if (this.violatesDietaryRestriction(product, restriction)) {
          score -= 20;
        }
      });
    }
    
    // Check allergens
    if (profile.allergies_intolerances && product.allergens_present) {
      profile.allergies_intolerances.forEach(allergy => {
        const allergyName = allergy.allergy_type.toLowerCase();
        const hasAllergen = product.allergens_present.some(a => 
          a.toLowerCase().includes(allergyName)
        );
        
        if (hasAllergen) {
          if (allergy.severity === 'severe') score -= 50;
          else if (allergy.severity === 'moderate') score -= 30;
          else score -= 15;
        }
      });
    }
    
    // Health goals alignment
    if (profile.health_goals) {
      const goals = profile.health_goals;
      
      if (goals.includes('weight_loss')) {
        if (product.nutrition_info?.energy_kcal > 300) score -= 5;
        if (product.nutrition_info?.sugars > 10) score -= 5;
      }
      
      if (goals.includes('muscle_gain')) {
        if (product.nutrition_info?.proteins > 10) score += 5;
      }
      
      if (goals.includes('heart_health')) {
        if (product.nutrition_info?.saturated_fat > 3) score -= 10;
        if (product.nutrition_info?.sodium > 1.0) score -= 10;
      }
      
      if (goals.includes('digestive_health')) {
        if (product.nutrition_info?.fiber > 5) score += 5;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  violatesDietaryRestriction(product, restriction) {
    const restrictionType = restriction.restriction_type.toLowerCase();
    const ingredients = (product.ingredients || []).join(' ').toLowerCase();
    
    const restrictionMap = {
      'vegan': ['milk', 'egg', 'honey', 'gelatin', 'whey', 'casein'],
      'vegetarian': ['meat', 'fish', 'poultry', 'gelatin'],
      'gluten_free': ['wheat', 'barley', 'rye', 'gluten'],
      'dairy_free': ['milk', 'cheese', 'butter', 'cream', 'whey', 'casein'],
      'sugar_free': ['sugar', 'glucose', 'fructose', 'sucrose'],
      'keto': ['sugar', 'wheat', 'rice', 'potato', 'corn'],
      'paleo': ['grain', 'dairy', 'legume', 'processed'],
      'halal': ['pork', 'alcohol', 'gelatin'],
      'kosher': ['pork', 'shellfish'],
    };
    
    const forbiddenIngredients = restrictionMap[restrictionType] || [];
    
    return forbiddenIngredients.some(forbidden => 
      ingredients.includes(forbidden)
    );
  }

  getScoreBreakdown(product, profile) {
    const breakdown = {
      processing: this.getProcessingScore(product),
      nutrition: this.getNutritionScore(product),
      ingredients: this.getIngredientsScore(product),
      safety: this.getSafetyScore(product),
    };
    
    if (profile) {
      breakdown.personalization = this.getPersonalizationScore(product, profile);
    }
    
    return breakdown;
  }

  getProcessingScore(product) {
    const scores = {
      'unprocessed': 100,
      'processed_culinary': 90,
      'processed': 70,
      'ultra_processed': 40,
      'unknown': 60,
    };
    return scores[product.processing_level] || 60;
  }

  getNutritionScore(product) {
    if (!product.nutrition_info) return 50;
    
    let score = 100;
    const n = product.nutrition_info;
    
    if (n.sugars > 15) score -= 30;
    else if (n.sugars > 10) score -= 15;
    
    if (n.saturated_fat > 5) score -= 20;
    else if (n.saturated_fat > 3) score -= 10;
    
    if (n.sodium > 1.5) score -= 20;
    else if (n.sodium > 1.0) score -= 10;
    
    if (n.fiber > 5) score += 10;
    if (n.proteins > 10) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  getIngredientsScore(product) {
    let score = 100;
    
    const ingredientCount = product.ingredients?.length || 0;
    if (ingredientCount > 20) score -= 20;
    else if (ingredientCount > 10) score -= 10;
    
    if (product.toxins_detected?.length > 0) {
      score -= product.toxins_detected.length * 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  getSafetyScore(product) {
    let score = 100;
    
    if (product.toxins_detected?.length > 0) {
      score -= product.toxins_detected.length * 15;
    }
    
    if (!product.is_lab_verified) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  getPersonalizationScore(product, profile) {
    let score = 100;
    
    if (profile.dietary_restrictions) {
      profile.dietary_restrictions.forEach(restriction => {
        if (this.violatesDietaryRestriction(product, restriction)) {
          score -= 30;
        }
      });
    }
    
    if (profile.allergies_intolerances && product.allergens_present) {
      profile.allergies_intolerances.forEach(allergy => {
        const allergyName = allergy.allergy_type.toLowerCase();
        const hasAllergen = product.allergens_present.some(a => 
          a.toLowerCase().includes(allergyName)
        );
        if (hasAllergen) score -= 40;
      });
    }
    
    return Math.max(0, Math.min(100, score));
  }

  generateWarnings(product, profile) {
    const warnings = [];
    
    // Allergen warnings
    if (profile?.allergies_intolerances && product.allergens_present) {
      profile.allergies_intolerances.forEach(allergy => {
        const allergyName = allergy.allergy_type.toLowerCase();
        const hasAllergen = product.allergens_present.some(a => 
          a.toLowerCase().includes(allergyName)
        );
        
        if (hasAllergen) {
          warnings.push({
            type: 'allergen',
            severity: allergy.severity,
            message: `Contains ${allergy.allergy_type} - ${allergy.severity} allergy`,
          });
        }
      });
    }
    
    // Dietary restriction warnings
    if (profile?.dietary_restrictions) {
      profile.dietary_restrictions.forEach(restriction => {
        if (this.violatesDietaryRestriction(product, restriction)) {
          warnings.push({
            type: 'dietary',
            severity: 'high',
            message: `Not suitable for ${restriction.restriction_type} diet`,
          });
        }
      });
    }
    
    // Toxin warnings
    if (product.toxins_detected?.length > 0) {
      warnings.push({
        type: 'toxin',
        severity: 'medium',
        message: `Contains ${product.toxins_detected.length} potentially harmful ingredient(s)`,
        details: product.toxins_detected,
      });
    }
    
    // Ultra-processed warning
    if (product.processing_level === 'ultra_processed') {
      warnings.push({
        type: 'processing',
        severity: 'medium',
        message: 'Ultra-processed food - consider healthier alternatives',
      });
    }
    
    // High sugar warning
    if (product.nutrition_info?.sugars > 15) {
      warnings.push({
        type: 'nutrition',
        severity: 'medium',
        message: `High sugar content: ${product.nutrition_info.sugars}g per 100g`,
      });
    }
    
    return warnings;
  }

  generateRecommendations(product, profile) {
    const recommendations = [];
    
    if (product.processing_level === 'ultra_processed') {
      recommendations.push('Look for less processed alternatives');
    }
    
    if (product.nutrition_info?.sugars > 10) {
      recommendations.push('Consider products with lower sugar content');
    }
    
    if (product.nutrition_info?.sodium > 1.0) {
      recommendations.push('High sodium - look for low-sodium options');
    }
    
    if (product.toxins_detected?.length > 0) {
      recommendations.push('Choose products with cleaner ingredient lists');
    }
    
    if (profile?.health_goals?.includes('weight_loss') && product.nutrition_info?.energy_kcal > 300) {
      recommendations.push('For weight loss, consider lower calorie options');
    }
    
    return recommendations;
  }
}

module.exports = new ProductHealthScoreService();
