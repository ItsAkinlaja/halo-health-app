const { supabase } = require('../utils/database');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class ProductController {
  async searchProducts(req, res, next) {
    try {
      const { q, limit = 20, offset = 0 } = req.query;

      // Search products by name, brand, or ingredients
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          product_scans (
            score_given
          )
        `)
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%,ingredients.cs.{${q}}`)
        .eq('is_active', true)
        .order('health_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          products,
          total: products.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductByBarcode(req, res, next) {
    try {
      const { barcode } = req.params;

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_scans (
            score_given,
            created_at
          )
        `)
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single();

      if (error || !product) {
        throw new NotFoundError('Product not found');
      }

      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          product_scans (
            score_given,
            created_at
          )
        `)
        .eq('category', category)
        .eq('is_active', true)
        .order('health_score', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          products,
          total: products.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      // Get user's recent scans and preferences
      const { data: recentScans } = await supabase
        .from('product_scans')
        .select(`
          products (
            category,
            health_score
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get user's saved products
      const { data: savedProducts } = await supabase
        .from('saved_products')
        .select(`
          products (
            category,
            health_score
          )
        `)
        .eq('user_id', userId);

      // Analyze preferences and get recommendations
      const preferences = this.analyzeUserPreferences(recentScans, savedProducts);
      const recommendations = await this.generateRecommendations(preferences, limit);

      res.json({
        status: 'success',
        data: {
          recommendations,
          preferences,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlternatives(req, res, next) {
    try {
      const { productId } = req.params;
      const { limit = 5 } = req.query;

      // Get original product
      const { data: originalProduct, error: originalError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (originalError || !originalProduct) {
        throw new NotFoundError('Product not found');
      }

      // Find alternatives in same category with higher health score
      const { data: alternatives, error } = await supabase
        .from('products')
        .select(`
          *,
          product_scans (
            score_given,
            created_at
          )
        `)
        .eq('category', originalProduct.category)
        .gt('health_score', originalProduct.health_score)
        .eq('is_active', true)
        .order('health_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          originalProduct,
          alternatives,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { productId } = req.params;

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_scans (
            score_given,
            created_at
          ),
          product_recalls (
            recall_reason,
            recall_date,
            severity
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error || !product) {
        throw new NotFoundError('Product not found');
      }

      res.json({
        status: 'success',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  analyzeUserPreferences(recentScans, savedProducts) {
    const preferences = {
      categories: {},
      healthScoreRange: { min: 100, max: 0 },
      avoidIngredients: new Set(),
      preferredIngredients: new Set(),
    };

    // Analyze recent scans
    recentScans.forEach(scan => {
      const product = scan.products;
      if (product) {
        // Track category preferences
        preferences.categories[product.category] = 
          (preferences.categories[product.category] || 0) + 1;

        // Track health score range
        preferences.healthScoreRange.min = Math.min(
          preferences.healthScoreRange.min, 
          product.health_score
        );
        preferences.healthScoreRange.max = Math.max(
          preferences.healthScoreRange.max, 
          product.health_score
        );
      }
    });

    // Analyze saved products
    savedProducts.forEach(saved => {
      const product = saved.products;
      if (product) {
        preferences.categories[product.category] = 
          (preferences.categories[product.category] || 0) + 2; // Weight saved products higher
      }
    });

    return preferences;
  }

  async generateRecommendations(preferences, limit) {
    // Get top categories
    const topCategories = Object.entries(preferences.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    if (topCategories.length === 0) {
      // Return general high-scoring products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gte('health_score', 80)
        .order('health_score', { ascending: false })
        .limit(limit);

      return products;
    }

    // Get products from preferred categories
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('category', topCategories)
      .eq('is_active', true)
      .gte('health_score', preferences.healthScoreRange.max - 10)
      .order('health_score', { ascending: false })
      .limit(limit);

    return products || [];
  }
}

module.exports = new ProductController();
