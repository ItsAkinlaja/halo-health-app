const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');
const aiService = require('./aiService');

class WaterService {
  async searchProducts(category = 'all', query = '') {
    try {
      let queryBuilder = supabase
        .from('water_products')
        .select('*')
        .order('score', { ascending: false });

      if (category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error searching water products:', error);
      throw error;
    }
  }

  async getProductByBarcode(barcode) {
    try {
      const { data, error } = await supabase
        .from('water_products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error getting water product by barcode:', error);
      throw error;
    }
  }

  async scanWaterProduct(userId, barcode) {
    try {
      let product = await this.getProductByBarcode(barcode);

      if (!product) {
        product = await this.analyzeNewWaterProduct(barcode);
      }

      await supabase.from('water_scans').insert({
        user_id: userId,
        product_id: product?.id,
        barcode,
        scan_type: 'barcode'
      });

      return product;
    } catch (error) {
      logger.error('Error scanning water product:', error);
      throw error;
    }
  }

  async analyzeNewWaterProduct(barcode) {
    const prompt = `Analyze this water product with barcode ${barcode}. Provide a health and purity assessment.

Return JSON:
{
  "name": "product name",
  "brand": "brand name",
  "category": "bottled/filters/purifiers",
  "score": 0-100,
  "purity_score": 0-100,
  "contaminants": "assessment",
  "microplastics": "assessment",
  "pfas": "assessment",
  "minerals": "High/Medium/Low",
  "ph_level": 7.0
}`;

    const completion = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a water quality expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    const { data, error } = await supabase
      .from('water_products')
      .insert({
        ...analysis,
        barcode,
        lab_tested: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTopRated(category = 'all', limit = 10) {
    try {
      let queryBuilder = supabase
        .from('water_products')
        .select('*')
        .gte('score', 85)
        .order('score', { ascending: false })
        .limit(limit);

      if (category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting top rated water products:', error);
      throw error;
    }
  }

  async getUserScans(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('water_scans')
        .select(`
          *,
          product:water_products(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user water scans:', error);
      throw error;
    }
  }
}

module.exports = new WaterService();
