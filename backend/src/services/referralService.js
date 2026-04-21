const { supabase } = require('../utils/database');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

class ReferralService {
  async generateReferralCode(userId) {
    try {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      const { data: existing, error: checkError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .single();

      if (existing) return existing.code;

      const { data: referral, error } = await supabase
        .from('referral_codes')
        .insert([{
          user_id: userId,
          code,
          uses: 0,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return referral.code;
    } catch (error) {
      logger.error('Error generating referral code:', error);
      throw error;
    }
  }

  async applyReferralCode(newUserId, code) {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (fetchError || !referral) {
        throw new Error('Invalid referral code');
      }

      if (referral.user_id === newUserId) {
        throw new Error('Cannot use your own referral code');
      }

      const { data: existing, error: checkError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', newUserId)
        .single();

      if (existing) {
        throw new Error('Referral code already applied');
      }

      const { data: newReferral, error } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: referral.user_id,
          referred_user_id: newUserId,
          code: code.toUpperCase(),
          status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('referral_codes')
        .update({ uses: referral.uses + 1 })
        .eq('id', referral.id);

      return newReferral;
    } catch (error) {
      logger.error('Error applying referral code:', error);
      throw error;
    }
  }

  async completeReferral(referralId, rewardAmount = 5.00) {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          status: 'completed',
          reward_amount: rewardAmount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', referralId);

      if (updateError) throw updateError;

      await this.addEarnings(referral.referrer_id, rewardAmount, 'referral', referralId);

      return { success: true, rewardAmount };
    } catch (error) {
      logger.error('Error completing referral:', error);
      throw error;
    }
  }

  async addEarnings(userId, amount, type, referenceId = null) {
    try {
      const { data: earning, error } = await supabase
        .from('earnings')
        .insert([{
          user_id: userId,
          amount,
          type,
          reference_id: referenceId,
          status: 'pending',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      await this.updateTotalEarnings(userId);
      return earning;
    } catch (error) {
      logger.error('Error adding earnings:', error);
      throw error;
    }
  }

  async getUserEarnings(userId) {
    try {
      const { data: earnings, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: stats, error: statsError } = await supabase
        .from('earnings')
        .select('amount, status')
        .eq('user_id', userId);

      if (statsError) throw statsError;

      const total = stats.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const pending = stats.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const paid = stats.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.amount), 0);

      return {
        earnings,
        stats: { total, pending, paid }
      };
    } catch (error) {
      logger.error('Error getting user earnings:', error);
      throw error;
    }
  }

  async getReferralStats(userId) {
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId);

      if (error) throw error;

      const total = referrals.length;
      const completed = referrals.filter(r => r.status === 'completed').length;
      const pending = referrals.filter(r => r.status === 'pending').length;
      const totalEarned = referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + parseFloat(r.reward_amount || 0), 0);

      return { total, completed, pending, totalEarned, referrals };
    } catch (error) {
      logger.error('Error getting referral stats:', error);
      throw error;
    }
  }

  async updateTotalEarnings(userId) {
    const { data: stats } = await supabase
      .from('earnings')
      .select('amount')
      .eq('user_id', userId);

    const total = stats?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    await supabase
      .from('users')
      .update({ total_earnings: total })
      .eq('id', userId);
  }

  async requestPayout(userId, amount, method = 'paypal', details = {}) {
    try {
      const { data: earnings } = await this.getUserEarnings(userId);
      
      if (earnings.stats.pending < amount) {
        throw new Error('Insufficient balance');
      }

      const { data: payout, error } = await supabase
        .from('payouts')
        .insert([{
          user_id: userId,
          amount,
          method,
          details,
          status: 'pending',
          requested_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return payout;
    } catch (error) {
      logger.error('Error requesting payout:', error);
      throw error;
    }
  }
}

module.exports = new ReferralService();
