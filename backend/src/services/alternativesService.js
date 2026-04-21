const { supabase } = require('../utils/database');
const aiService = require('./aiService');
const { logger } = require('../utils/logger');

class AlternativesService {
  async findHealthierAlternatives(productId, profileId, limit = 5) {
    try {
      const product = await this.getProduct(productId);
      const profile = await this.getProfile(profileId);

      // Get alternatives from database
      const dbAlternatives = await this.findDatabaseAlternatives(product, limit);

      // Use AI to rank and personalize alternatives
      const rankedAlternatives = await this.rankAlternatives(product, dbAlternatives, profile);

      return rankedAlternatives;
    } catch (error) {
      logger.error('Error finding alternatives:', error);
      throw error;
    }
  }

  async findDatabaseAlternatives(product, limit) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id)
      .gte('health_score', product.health_score || 0)
      .eq('is_active', true)
      .order('health_score', { ascending: false })
      .limit(limit * 2);

    if (error) throw error;
    return data || [];
  }

  async rankAlternatives(originalProduct, alternatives, profile) {
    const prompt = `Rank these product alternatives for a user:

Original Product: ${originalProduct.name} (Health Score: ${originalProduct.health_score})

User Profile:
- Health Goals: ${profile.health_goals?.join(', ') || 'None'}
- Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${profile.allergies_intolerances?.join(', ') || 'None'}

Alternatives:
${alternatives.map((p, i) => `${i + 1}. ${p.name} - ${p.brand} (Score: ${p.health_score})`).join('\n')}

Return JSON array with top alternatives, each with:
{
  "productId": "id",
  "reason": "why this is better",
  "keyBenefits": ["benefit1", "benefit2"]
}`;

    const completion = await aiService.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a health product recommendation expert. Rank alternatives based on health benefits.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const ranked = JSON.parse(completion.choices[0].message.content);
    return ranked.map(r => ({
      ...alternatives.find(a => a.id === r.productId),
      recommendation: { reason: r.reason, keyBenefits: r.keyBenefits }
    }));
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
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = new AlternativesService();
