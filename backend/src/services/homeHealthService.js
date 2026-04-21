const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');

class HomeHealthService {
  async calculateHomeHealthScore(userId) {
    try {
      // Get all scanned products for the user
      const { data: scans, error: scansError } = await supabase
        .from('product_scans')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (scansError) throw scansError;

      if (!scans || scans.length === 0) {
        return {
          overallScore: 0,
          categoryScores: {},
          recommendations: ['Start scanning products to get your home health score'],
          totalProducts: 0,
        };
      }

      // Group by category
      const categories = {
        food: [],
        supplements: [],
        personal_care: [],
        household: [],
        other: [],
      };

      scans.forEach(scan => {
        const category = this.categorizeProduct(scan.product.category);
        categories[category].push(scan);
      });

      // Calculate scores per category
      const categoryScores = {};
      for (const [category, products] of Object.entries(categories)) {
        if (products.length > 0) {
          const avgScore = products.reduce((sum, p) => 
            sum + (p.score_given || p.product.health_score || 0), 0
          ) / products.length;
          categoryScores[category] = Math.round(avgScore);
        }
      }

      // Calculate overall score
      const allScores = Object.values(categoryScores);
      const overallScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(categoryScores, scans);

      // Save score
      await this.saveHomeHealthScore(userId, {
        overall_score: overallScore,
        category_scores: categoryScores,
        total_products: scans.length,
      });

      return {
        overallScore,
        categoryScores,
        recommendations,
        totalProducts: scans.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error calculating home health score:', error);
      throw error;
    }
  }

  categorizeProduct(category) {
    const categoryMap = {
      'Food & Beverages': 'food',
      'Snacks': 'food',
      'Beverages': 'food',
      'Supplements': 'supplements',
      'Vitamins': 'supplements',
      'Personal Care': 'personal_care',
      'Beauty': 'personal_care',
      'Skincare': 'personal_care',
      'Household': 'household',
      'Cleaning': 'household',
    };

    return categoryMap[category] || 'other';
  }

  generateRecommendations(categoryScores, scans) {
    const recommendations = [];

    // Check each category
    if (categoryScores.food && categoryScores.food < 60) {
      recommendations.push('Focus on whole, unprocessed foods');
    }

    if (categoryScores.personal_care && categoryScores.personal_care < 60) {
      recommendations.push('Switch to cleaner personal care products');
    }

    if (categoryScores.household && categoryScores.household < 60) {
      recommendations.push('Consider eco-friendly cleaning products');
    }

    if (categoryScores.supplements && categoryScores.supplements < 70) {
      recommendations.push('Review supplement quality and ingredients');
    }

    // Check for toxins
    const toxinProducts = scans.filter(s => 
      s.product.toxins_detected && s.product.toxins_detected.length > 0
    );

    if (toxinProducts.length > 0) {
      recommendations.push(`${toxinProducts.length} products contain detected toxins`);
    }

    // Check processing levels
    const highlyProcessed = scans.filter(s => 
      s.product.processing_level === 'High'
    );

    if (highlyProcessed.length > scans.length * 0.5) {
      recommendations.push('Reduce highly processed products in your home');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your home health score is excellent');
    }

    return recommendations;
  }

  async saveHomeHealthScore(userId, scoreData) {
    const { error } = await supabase
      .from('home_health_scores')
      .insert([{
        user_id: userId,
        ...scoreData,
        recorded_at: new Date().toISOString(),
      }]);

    if (error) logger.error('Error saving home health score:', error);
  }

  async getHomeHealthHistory(userId, limit = 30) {
    try {
      const { data: history, error } = await supabase
        .from('home_health_scores')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return history;
    } catch (error) {
      logger.error('Error getting home health history:', error);
      throw error;
    }
  }
}

module.exports = new HomeHealthService();
