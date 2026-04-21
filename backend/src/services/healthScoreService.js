const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class HealthScoreService {
  async updateHealthScore(userId, profileId) {
    try {
      // Calculate new health scores based on recent scans and activities
      const scores = await this.calculateHealthScores(userId, profileId);
      
      // Save the scores to database
      const { data, error } = await supabase
        .from('health_scores')
        .insert([{
          user_id: userId,
          profile_id: profileId,
          overall_score: scores.overall,
          nutrition_score: scores.nutrition,
          safety_score: scores.safety,
          lifestyle_score: scores.lifestyle,
          recorded_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error saving health score:', error);
        throw error;
      }

      logger.info(`Health score updated for user ${userId}, profile ${profileId}`);
      return data;
    } catch (error) {
      logger.error('Error updating health score:', error);
      throw error;
    }
  }

  async calculateHealthScores(userId, profileId) {
    try {
      // Get recent scans (last 30 days)
      const { data: recentScans } = await supabase
        .from('product_scans')
        .select('score_given, created_at')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get saved products
      const { data: savedProducts } = await supabase
        .from('saved_products')
        .select(`
          products (
            health_score,
            category
          )
        `)
        .eq('user_id', userId)
        .eq('list_type', 'clean_choices');

      // Calculate scores
      const nutritionScore = this.calculateNutritionScore(recentScans, savedProducts);
      const safetyScore = this.calculateSafetyScore(recentScans);
      const lifestyleScore = this.calculateLifestyleScore(recentScans, savedProducts);
      const overallScore = Math.round((nutritionScore + safetyScore + lifestyleScore) / 3);

      return {
        overall: overallScore,
        nutrition: nutritionScore,
        safety: safetyScore,
        lifestyle: lifestyleScore,
      };
    } catch (error) {
      logger.error('Error calculating health scores:', error);
      throw error;
    }
  }

  calculateNutritionScore(scans, savedProducts) {
    if (!scans || scans.length === 0) {
      return 75; // Default score for new users
    }

    const scanScores = scans.map(scan => scan.score_given || 50);
    const avgScanScore = scanScores.reduce((sum, score) => sum + score, 0) / scanScores.length;

    // Bonus points for having clean choices saved
    const cleanChoicesBonus = Math.min(savedProducts ? savedProducts.length * 2 : 0, 20);

    return Math.min(100, Math.round(avgScanScore + cleanChoicesBonus));
  }

  calculateSafetyScore(scans) {
    if (!scans || scans.length === 0) {
      return 85; // Default safety score
    }

    // Safety score based on avoiding products with recalls/toxins
    // For now, use a simplified calculation
    const highScoreScans = scans.filter(scan => (scan.score_given || 50) >= 80).length;
    const safetyPercentage = scans.length > 0 ? (highScoreScans / scans.length) : 0.5;

    return Math.round(50 + (safetyPercentage * 50)); // Scale to 50-100 range
  }

  calculateLifestyleScore(scans, savedProducts) {
    if (!scans || scans.length === 0) {
      return 70; // Default lifestyle score
    }

    // Lifestyle score based on consistency and variety
    const scanFrequency = scans.length; // More scans = more engaged
    const frequencyScore = Math.min(scanFrequency * 5, 30); // Max 30 points for frequency

    // Variety bonus based on different product categories in saved products
    const categories = savedProducts ? 
      new Set(savedProducts.map(sp => sp.products?.category).filter(Boolean)) : 
      new Set();
    const varietyBonus = Math.min(categories.size * 3, 20); // Max 20 points for variety

    // Base score + frequency + variety
    return Math.min(100, 50 + frequencyScore + varietyBonus);
  }

  async getHealthScoreHistory(userId, profileId, days = 30) {
    try {
      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error getting health score history:', error);
      throw error;
    }
  }

  async getLatestHealthScore(userId, profileId) {
    try {
      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No scores yet
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error getting latest health score:', error);
      throw error;
    }
  }

  async compareWithCommunity(userId, profileId) {
    try {
      // Get user's latest score
      const userScore = await this.getLatestHealthScore(userId, profileId);
      
      if (!userScore) {
        return null;
      }

      // Get community averages
      const { data: communityScores } = await supabase
        .from('health_scores')
        .select('overall_score, nutrition_score, safety_score, lifestyle_score')
        .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!communityScores || communityScores.length === 0) {
        return null;
      }

      const averages = {
        overall: communityScores.reduce((sum, s) => sum + s.overall_score, 0) / communityScores.length,
        nutrition: communityScores.reduce((sum, s) => sum + s.nutrition_score, 0) / communityScores.length,
        safety: communityScores.reduce((sum, s) => sum + s.safety_score, 0) / communityScores.length,
        lifestyle: communityScores.reduce((sum, s) => sum + s.lifestyle_score, 0) / communityScores.length,
      };

      return {
        userScore: userScore,
        communityAverage: averages,
        percentile: this.calculatePercentile(userScore.overall_score, communityScores.map(s => s.overall_score)),
      };
    } catch (error) {
      logger.error('Error comparing with community:', error);
      throw error;
    }
  }

  calculatePercentile(userScore, allScores) {
    if (!allScores || allScores.length === 0) {
      return 50; // Default percentile
    }

    const sortedScores = allScores.sort((a, b) => a - b);
    const index = sortedScores.findIndex(score => score >= userScore);
    
    if (index === -1) {
      return 100; // User is above all scores
    }
    
    return Math.round((index / sortedScores.length) * 100);
  }
}

module.exports = new HealthScoreService();
