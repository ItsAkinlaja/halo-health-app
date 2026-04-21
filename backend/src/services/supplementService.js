const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');
const aiService = require('./aiService');

class SupplementService {
  async searchSupplements(category = 'all', query = '') {
    try {
      let queryBuilder = supabase
        .from('supplements')
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
      logger.error('Error searching supplements:', error);
      throw error;
    }
  }

  async getSupplementByBarcode(barcode) {
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error getting supplement by barcode:', error);
      throw error;
    }
  }

  async scanSupplement(userId, barcode) {
    try {
      let supplement = await this.getSupplementByBarcode(barcode);

      if (!supplement) {
        supplement = await this.analyzeNewSupplement(barcode);
      }

      await supabase.from('supplement_scans').insert({
        user_id: userId,
        supplement_id: supplement?.id,
        barcode,
        scan_type: 'barcode'
      });

      await supabase
        .from('user_supplements')
        .upsert({
          user_id: userId,
          supplement_id: supplement.id,
          last_scanned: new Date().toISOString()
        }, {
          onConflict: 'user_id,supplement_id'
        });

      return supplement;
    } catch (error) {
      logger.error('Error scanning supplement:', error);
      throw error;
    }
  }

  async analyzeNewSupplement(barcode) {
    const prompt = `Analyze this supplement with barcode ${barcode}. Provide a comprehensive quality and purity assessment.

Return JSON:
{
  "name": "supplement name",
  "brand": "brand name",
  "category": "protein/vitamins/minerals/omega3/preworkout",
  "score": 0-100,
  "purity_score": 0-100,
  "heavy_metals": "assessment",
  "fillers": "assessment",
  "third_party_tested": true/false,
  "certifications": ["cert1", "cert2"],
  "serving_size": "amount",
  "servings_per_container": number
}`;

    const completion = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a supplement quality expert.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    const { data, error } = await supabase
      .from('supplements')
      .insert({
        ...analysis,
        barcode
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSupplements(userId) {
    try {
      const { data, error } = await supabase
        .from('user_supplements')
        .select(`
          *,
          supplement:supplements(*)
        `)
        .eq('user_id', userId)
        .order('last_scanned', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user supplements:', error);
      throw error;
    }
  }

  async addUserSupplement(userId, supplementId, details) {
    try {
      const { data, error } = await supabase
        .from('user_supplements')
        .upsert({
          user_id: userId,
          supplement_id: supplementId,
          dosage: details.dosage,
          frequency: details.frequency,
          notes: details.notes,
          last_scanned: new Date().toISOString()
        }, {
          onConflict: 'user_id,supplement_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error adding user supplement:', error);
      throw error;
    }
  }

  async removeUserSupplement(userId, supplementId) {
    try {
      const { error } = await supabase
        .from('user_supplements')
        .delete()
        .eq('user_id', userId)
        .eq('supplement_id', supplementId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Error removing user supplement:', error);
      throw error;
    }
  }

  async getTopRated(category = 'all', limit = 10) {
    try {
      let queryBuilder = supabase
        .from('supplements')
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
      logger.error('Error getting top rated supplements:', error);
      throw error;
    }
  }
}

module.exports = new SupplementService();
