const bcrypt = require('bcryptjs');
const { supabase } = require('../utils/database');
const { AppError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, haloHealthId, username, bio, instagramHandle } = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Check if Halo Health ID is taken
      const { data: existingHaloId } = await supabase
        .from('users')
        .select('id')
        .eq('halo_health_id', haloHealthId)
        .single();

      if (existingHaloId) {
        throw new ConflictError('Halo Health ID already taken');
      }

      // Create user in Supabase Auth with email confirmation required
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            halo_health_id: haloHealthId,
            username: username || null,
          },
          emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`,
        },
      });

      if (authError) {
        throw new AppError(authError.message, 400);
      }

      // Create user profile in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          halo_health_id: haloHealthId,
          username: username || null,
          bio: bio || null,
          instagram_handle: instagramHandle || null,
        }])
        .select()
        .single();

      if (userError) {
        throw new AppError(userError.message, 500);
      }

      // Create default user settings
      await this.createUserDefaultSettings(authData.user.id);

      // Generate JWT tokens
      const tokens = this.generateTokens(authData.user.id);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: userData,
          requiresEmailVerification: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        throw new UnauthorizedError('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        throw new AppError('User profile not found', 500);
      }

      // Update last login
      await supabase
        .from('users')
        .update({ 
          last_login_at: new Date().toISOString(),
          failed_login_attempts: 0
        })
        .eq('id', data.user.id);

      // Generate JWT tokens
      const tokens = this.generateTokens(data.user.id);

      logger.info(`User logged in: ${email}`);

      res.json({
        status: 'success',
        data: {
          user: userData,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token required');
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken);

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);

      res.json({
        status: 'success',
        data: {
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user?.id;
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Supabase logout error:', error);
      }

      if (userId) {
        logger.info(`User logged out: ${userId}`);
      }

      res.json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CLIENT_URL}/reset-password`,
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      res.json({
        status: 'success',
        message: 'Password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { password } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new UnauthorizedError('Invalid reset token');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new AppError(error.message, 400);
      }

      logger.info(`Password reset for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      // This would be protected by auth middleware
      const userId = req.user.id;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  generateTokens(userId) {
    const accessToken = generateToken({ userId });
    const refreshToken = generateRefreshToken({ userId });

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
  }

  async createUserDefaultSettings(userId) {
    const { error } = await supabase
      .from('user_settings')
      .insert([{
        user_id: userId,
        voice_preference: 'calm_clear_female',
        notification_tone: 'motivational_inspirational',
        audio_enabled: true,
        dark_mode: false,
        notification_preferences: {
          recall_alerts: true,
          new_lab_results: true,
          clean_swaps: true,
          daily_tips: true,
          streak_risk: true,
          meal_reminders: true,
          expiry_alerts: true,
        },
        meal_plan_preferences: {
          cuisine_preferences: [],
          cooking_time_limit: null,
          budget_weekly: null,
          dietary_goals: [],
        },
        privacy_settings: {
          public_profile: true,
          share_health_score: false,
          share_scan_history: false,
        },
      }]);

    if (error) {
      logger.error('Failed to create user settings:', error);
    }
  }
}

module.exports = new AuthController();
