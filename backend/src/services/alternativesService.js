const { supabase } = require('../utils/database');
const productHealthScoreService = require('./productHealthScoreService');
const { logger } = require('../utils/logger');

class AlternativesService {
  async findHealthierAlternatives(productId, profileId, limit = 5) {
    try {
      const product = await this.getProduct(productId);
      const profile = profileId ? await this.getProfile(profileId) : null;

      // Get alternatives from database
      const dbAlternatives = await this.findDatabaseAlternatives(product, limit * 2);

      // Calculate personalized scores for each alternative
      const scoredAlternatives = await Promise.all(
        dbAlternatives.map(async (alt) => {
          const scoreData = await productHealthScoreService.calculateProductScore(alt, profileId);
          return {
            ...alt,
            personalized_score: scoreData.overall_score,
            score_improvement: scoreData.overall_score - (product.health_score || 50),
            score_data: scoreData,
          };
        })
      );

      // Filter and sort by improvement
      const betterAlternatives = scoredAlternatives
        .filter(alt => alt.score_improvement > 5) // At least 5 points better
        .sort((a, b) => b.score_improvement - a.score_improvement)
        .slice(0, limit);

      // Add reasons for each alternative
      return betterAlternatives.map(alt => ({
        ...alt,
        reason: this.generateAlternativeReason(product, alt, profile),
      }));
    } catch (error) {
      logger.error('Error finding alternatives:', error);
      return []; // Return empty array on error instead of throwing
    }
  }

  async findDatabaseAlternatives(product, limit) {
    try {
      // Find products in same category with similar or better scores
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .eq('is_active', true)
        .order('health_score', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching alternatives from database:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in findDatabaseAlternatives:', error);
      return [];
    }
  }

  generateAlternativeReason(originalProduct, alternative, profile) {
    const reasons = [];

    // Score improvement
    if (alternative.score_improvement >= 20) {
      reasons.push(`Significantly healthier with ${alternative.score_improvement} point improvement`);
    } else if (alternative.score_improvement >= 10) {
      reasons.push(`Healthier option with ${alternative.score_improvement} point improvement`);
    } else {
      reasons.push(`Slightly better with ${alternative.score_improvement} point improvement`);
    }

    // Processing level
    const processingLevels = ['unprocessed', 'processed_culinary', 'processed', 'ultra_processed'];
    const origLevel = processingLevels.indexOf(originalProduct.processing_level || 'processed');
    const altLevel = processingLevels.indexOf(alternative.processing_level || 'processed');
    
    if (altLevel < origLevel) {
      reasons.push('Less processed');
    }

    // Toxins
    const origToxins = originalProduct.toxins_detected?.length || 0;
    const altToxins = alternative.toxins_detected?.length || 0;
    
    if (origToxins > altToxins) {
      if (altToxins === 0) {
        reasons.push('No harmful ingredients');
      } else {
        reasons.push('Fewer harmful ingredients');
      }
    }

    // Allergens (if profile provided)
    if (profile && profile.allergies_intolerances) {
      const origAllergens = originalProduct.allergens_present || [];
      const altAllergens = alternative.allergens_present || [];
      
      const origHasUserAllergen = origAllergens.some(a => 
        profile.allergies_intolerances.some(ua => 
          a.toLowerCase().includes(ua.allergy_type.toLowerCase())
        )
      );
      
      const altHasUserAllergen = altAllergens.some(a => 
        profile.allergies_intolerances.some(ua => 
          a.toLowerCase().includes(ua.allergy_type.toLowerCase())
        )
      );
      
      if (origHasUserAllergen && !altHasUserAllergen) {
        reasons.push('Safe for your allergies');
      }
    }

    // Nutrition
    if (alternative.nutrition_info && originalProduct.nutrition_info) {
      const altNutr = alternative.nutrition_info;
      const origNutr = originalProduct.nutrition_info;
      
      if (altNutr.sugars < origNutr.sugars * 0.7) {
        reasons.push('Lower sugar');
      }
      if (altNutr.sodium < origNutr.sodium * 0.7) {
        reasons.push('Lower sodium');
      }
      if (altNutr.fiber > origNutr.fiber * 1.3) {
        reasons.push('Higher fiber');
      }
      if (altNutr.proteins > origNutr.proteins * 1.3) {
        reasons.push('Higher protein');
      }
    }

    return reasons.slice(0, 3).join(', ') || 'Better overall health profile';
  }

  async getProduct(productId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    if (error) throw error;
    return data;
  }

  async getProfile(profileId) {
    const { data, error } = await supabase
      .from('health_profiles')
      .select(`
        *,
        dietary_restrictions (*),
        allergies_intolerances (*)
      `)
      .eq('id', profileId)
      .single();
    
    if (error) {
      logger.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  }
}

module.exports = new AlternativesService();
