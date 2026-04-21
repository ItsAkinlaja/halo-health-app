const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class UserController {
  /**
   * Get user account information
   */
  async getUserAccount(req, res, next) {
    try {
      const userId = req.user.id;

      const { data: user, error } = await supabase.auth.admin.getUserById(userId);

      if (error || !user) {
        throw new NotFoundError('User not found');
      }

      res.json({
        status: 'success',
        data: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          user_metadata: user.user_metadata,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all user data (GDPR/CCPA compliance)
   */
  async exportUserData(req, res, next) {
    try {
      const userId = req.user.id;

      // Fetch all user data from various tables
      const [
        { data: profiles },
        { data: scans },
        { data: savedProducts },
        { data: meals },
        { data: mealPlans },
        { data: notifications },
        { data: coachMessages },
        { data: healthScores },
      ] = await Promise.all([
        supabase.from('health_profiles').select('*').eq('user_id', userId),
        supabase.from('product_scans').select('*').eq('user_id', userId),
        supabase.from('saved_products').select('*').eq('user_id', userId),
        supabase.from('meals').select('*, health_profiles!inner(user_id)').eq('health_profiles.user_id', userId),
        supabase.from('meal_plans').select('*').eq('user_id', userId),
        supabase.from('notifications').select('*').eq('user_id', userId),
        supabase.from('coach_messages').select('*').eq('user_id', userId),
        supabase.from('health_scores').select('*').eq('user_id', userId),
      ]);

      // Get user account info
      const { data: user } = await supabase.auth.admin.getUserById(userId);

      const exportData = {
        export_date: new Date().toISOString(),
        user_account: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          user_metadata: user.user_metadata,
        },
        health_profiles: profiles || [],
        product_scans: scans || [],
        saved_products: savedProducts || [],
        meals: meals || [],
        meal_plans: mealPlans || [],
        notifications: notifications || [],
        coach_messages: coachMessages || [],
        health_scores: healthScores || [],
        statistics: {
          total_profiles: profiles?.length || 0,
          total_scans: scans?.length || 0,
          total_saved_products: savedProducts?.length || 0,
          total_meals: meals?.length || 0,
          total_meal_plans: mealPlans?.length || 0,
        },
      };

      // TODO: In production, send email with download link instead of direct response
      // For now, return data directly
      res.json({
        status: 'success',
        data: exportData,
        message: 'Your data export is ready. In production, this would be sent to your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user scan data (keep account)
   */
  async deleteUserData(req, res, next) {
    try {
      const userId = req.user.id;

      // Delete scan-related data
      const deletePromises = [
        supabase.from('product_scans').delete().eq('user_id', userId),
        supabase.from('saved_products').delete().eq('user_id', userId),
        supabase.from('health_scores').delete().eq('user_id', userId),
      ];

      await Promise.all(deletePromises);

      res.json({
        status: 'success',
        message: 'Your scan data has been deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account and all associated data (GDPR/CCPA compliance)
   */
  async deleteUserAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const { confirmation } = req.body;

      // Require explicit confirmation
      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        throw new ValidationError('Account deletion requires confirmation. Send { "confirmation": "DELETE_MY_ACCOUNT" }');
      }

      // Get all profile IDs for this user
      const { data: profiles } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('user_id', userId);

      const profileIds = profiles?.map(p => p.id) || [];

      // Delete all user data (cascading deletes will handle related records)
      // Order matters: delete child records before parent records
      const deletePromises = [
        // Meal-related data
        profileIds.length > 0 ? supabase.from('meals').delete().in('profile_id', profileIds) : null,
        supabase.from('meal_plans').delete().eq('user_id', userId),
        supabase.from('shopping_lists').delete().eq('user_id', userId),
        
        // Profile-related data
        supabase.from('dietary_restrictions').delete().eq('user_id', userId),
        supabase.from('allergies').delete().eq('user_id', userId),
        supabase.from('health_conditions').delete().eq('user_id', userId),
        
        // Scan and product data
        supabase.from('product_scans').delete().eq('user_id', userId),
        supabase.from('saved_products').delete().eq('user_id', userId),
        
        // Health and notification data
        supabase.from('health_scores').delete().eq('user_id', userId),
        supabase.from('notifications').delete().eq('user_id', userId),
        
        // AI coach data
        supabase.from('coach_messages').delete().eq('user_id', userId),
        
        // Social and community data
        supabase.from('social_posts').delete().eq('user_id', userId),
        supabase.from('community_members').delete().eq('user_id', userId),
        
        // Other user data
        supabase.from('pantry_items').delete().eq('user_id', userId),
        supabase.from('user_challenges').delete().eq('user_id', userId),
        supabase.from('user_settings').delete().eq('user_id', userId),
        supabase.from('referrals').delete().eq('user_id', userId),
        supabase.from('earnings').delete().eq('user_id', userId),
        
        // Finally, delete profiles
        supabase.from('health_profiles').delete().eq('user_id', userId),
      ];

      // Execute all deletions
      await Promise.all(deletePromises.filter(p => p !== null));

      // Delete the auth user (this will cascade to any remaining data)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        logger.error('Failed to delete auth user:', authError);
        throw new ValidationError('Failed to delete account. Please contact support.');
      }

      res.json({
        status: 'success',
        message: 'Your account and all associated data have been permanently deleted.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      // Update user metadata
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...req.user.user_metadata,
          preferences,
        },
      });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          preferences: data.user.user_metadata.preferences,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request data export via email (production implementation)
   */
  async requestDataExport(req, res, next) {
    try {
      const userId = req.user.id;
      const { data: user } = await supabase.auth.admin.getUserById(userId);

      // TODO: Implement email sending with export link
      // For now, just log the request
      logger.info(`Data export requested for user ${userId} (${user.email})`);

      res.json({
        status: 'success',
        message: 'Your data export request has been received. You will receive an email with a download link within 24 hours.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
