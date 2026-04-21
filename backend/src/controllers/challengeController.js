const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class ChallengeController {
  async getChallenges(req, res, next) {
    try {
      const { category, difficulty, limit = 20, offset = 0 } = req.query;

      let query = supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('challenge_type', category);
      }

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }

      const { data: challenges, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          challenges,
          total: challenges.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;

      const { data: challenge, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('is_active', true)
        .single();

      if (error || !challenge) {
        throw new NotFoundError('Challenge not found');
      }

      res.json({
        status: 'success',
        data: { challenge },
      });
    } catch (error) {
      next(error);
    }
  }

  async joinChallenge(req, res, next) {
    try {
      const { challengeId } = req.params;
      const userId = req.user.id;

      // Check if challenge exists and is active
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('id, start_date, end_date')
        .eq('id', challengeId)
        .eq('is_active', true)
        .single();

      if (challengeError || !challenge) {
        throw new NotFoundError('Challenge not found');
      }

      // Check if already joined
      const { data: existing, error: existingError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        throw new ValidationError('Already joined this challenge');
      }

      // Join challenge
      const { data, error } = await supabase
        .from('user_challenges')
        .insert([{
          user_id: userId,
          challenge_id: challengeId,
          status: 'active',
          progress_percentage: 0,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Joined challenge successfully',
        data: { userChallenge: data },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserActiveChallenges(req, res, next) {
    try {
      const userId = req.user.id;

      const { data: userChallenges, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges (
            id,
            title,
            description,
            challenge_type,
            duration_days,
            difficulty_level,
            reward_points,
            start_date,
            end_date
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { userChallenges },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCompletedChallenges(req, res, next) {
    try {
      const userId = req.user.id;

      const { data: userChallenges, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges (
            id,
            title,
            description,
            challenge_type,
            duration_days,
            difficulty_level,
            reward_points
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { userChallenges },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChallengeProgress(req, res, next) {
    try {
      const { userChallengeId } = req.params;
      const { progressPercentage } = req.body;
      const userId = req.user.id;

      // Validate progress
      if (progressPercentage < 0 || progressPercentage > 100) {
        throw new ValidationError('Progress must be between 0 and 100');
      }

      // Check if user challenge belongs to user
      const { data: userChallenge, error: challengeError } = await supabase
        .from('user_challenges')
        .select('id, status, challenge_id')
        .eq('id', userChallengeId)
        .eq('user_id', userId)
        .single();

      if (challengeError || !userChallenge) {
        throw new NotFoundError('User challenge not found');
      }

      // Update progress
      const updateData = {
        progress_percentage: progressPercentage,
      };

      // Mark as completed if 100%
      if (progressPercentage === 100 && userChallenge.status === 'active') {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_challenges')
        .update(updateData)
        .eq('id', userChallengeId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      // If completed, add reward points (simplified)
      if (updateData.status === 'completed') {
        await supabase
          .from('earnings')
          .insert([{
            user_id: userId,
            amount: 50, // Default reward
            source: 'challenge_complete',
            description: `Completed challenge: ${userChallenge.challenge_id}`,
            status: 'pending',
            created_at: new Date().toISOString(),
          }]);
      }

      res.json({
        status: 'success',
        message: 'Progress updated successfully',
        data: { userChallenge: data },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChallengeController();
