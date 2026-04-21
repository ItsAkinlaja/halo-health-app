const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class RecapCardService {
  async generateRecapCard(scanId, userId) {
    try {
      const { data: scan, error: scanError } = await supabase
        .from('product_scans')
        .select(`
          *,
          product:products(*),
          profile:health_profiles(*)
        `)
        .eq('id', scanId)
        .eq('user_id', userId)
        .single();

      if (scanError) throw scanError;

      const cardData = {
        id: scanId,
        productName: scan.product.name,
        brand: scan.product.brand,
        healthScore: scan.score_given || scan.product.health_score,
        category: scan.product.category,
        scanDate: scan.created_at,
        profileName: scan.profile.name,
        keyInsights: this.extractKeyInsights(scan),
        concerns: this.extractConcerns(scan.product),
        benefits: this.extractBenefits(scan.product),
        recommendation: scan.halo_analysis,
      };

      const { data: card, error } = await supabase
        .from('recap_cards')
        .insert([{
          user_id: userId,
          scan_id: scanId,
          card_data: cardData,
          is_public: false,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return card;
    } catch (error) {
      logger.error('Error generating recap card:', error);
      throw error;
    }
  }

  async getRecapCard(cardId) {
    try {
      const { data: card, error } = await supabase
        .from('recap_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) throw error;
      return card;
    } catch (error) {
      logger.error('Error getting recap card:', error);
      throw error;
    }
  }

  async getUserRecapCards(userId, limit = 20, offset = 0) {
    try {
      const { data: cards, error } = await supabase
        .from('recap_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return cards;
    } catch (error) {
      logger.error('Error getting user recap cards:', error);
      throw error;
    }
  }

  async shareRecapCard(cardId, userId) {
    try {
      const { data: card, error } = await supabase
        .from('recap_cards')
        .update({ is_public: true })
        .eq('id', cardId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return card;
    } catch (error) {
      logger.error('Error sharing recap card:', error);
      throw error;
    }
  }

  extractKeyInsights(scan) {
    const insights = [];
    const score = scan.score_given || scan.product.health_score;

    if (score >= 80) {
      insights.push('Excellent choice for your health');
    } else if (score >= 60) {
      insights.push('Good option with minor concerns');
    } else if (score >= 40) {
      insights.push('Consider healthier alternatives');
    } else {
      insights.push('Not recommended for regular consumption');
    }

    if (scan.product.processing_level === 'Low') {
      insights.push('Minimally processed');
    } else if (scan.product.processing_level === 'High') {
      insights.push('Highly processed product');
    }

    return insights;
  }

  extractConcerns(product) {
    const concerns = [];
    
    if (product.toxins_detected && product.toxins_detected.length > 0) {
      concerns.push(...product.toxins_detected);
    }

    if (product.allergens_present && product.allergens_present.length > 0) {
      concerns.push(`Contains: ${product.allergens_present.join(', ')}`);
    }

    return concerns;
  }

  extractBenefits(product) {
    const benefits = [];
    
    if (product.health_score >= 70) {
      benefits.push('High nutritional value');
    }

    if (product.processing_level === 'Low') {
      benefits.push('Minimal processing');
    }

    if (product.is_lab_verified) {
      benefits.push('Lab verified ingredients');
    }

    return benefits;
  }
}

module.exports = new RecapCardService();
