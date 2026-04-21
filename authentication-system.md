# Authentication & User Management System

## Authentication Architecture

### Technology Stack
- **Primary Auth**: Supabase Auth (built on top of GoTrue)
- **JWT Tokens**: For API authentication
- **OAuth Providers**: Apple, Google, Facebook (optional)
- **Biometric Auth**: Device fingerprinting and biometrics
- **Session Management**: Redis for token storage

### Supabase Auth Configuration

```javascript
// src/services/authService.js
import { supabase } from '../utils/database';

class AuthService {
  async signUp(email, password, haloHealthId, additionalData = {}) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            halo_health_id: haloHealthId,
            username: additionalData.username || null,
          },
        },
      });

      if (authError) throw authError;

      // Create user profile in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          halo_health_id: haloHealthId,
          username: additionalData.username || null,
          bio: additionalData.bio || null,
          instagram_handle: additionalData.instagramHandle || null,
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Create default user settings
      await this.createUserDefaultSettings(authData.user.id);

      return {
        user: userData,
        session: authData.session,
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: userData,
        session: data.session,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async signInWithOAuth(provider, options = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.CLIENT_URL}/auth/callback`,
          ...options,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`OAuth login failed: ${error.message}`);
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  async refreshToken(refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    // Get full user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return userData;
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

    if (error) throw error;
  }
}

export default new AuthService();
```

### JWT Middleware

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/database';

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET env var is required'); })(); = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without auth
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (user) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

export const requirePremium = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.is_premium) {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }

  next();
};
```

### Auth Controller

```javascript
// src/controllers/authController.js
import authService from '../services/authService';
import { generateTokens } from '../utils/jwt';
import { validateRequest } from '../middleware/validation';

class AuthController {
  async register(req, res) {
    try {
      const { email, password, haloHealthId, username, bio, instagramHandle } = req.body;

      // Check if halo_health_id is already taken
      const existingUser = await authService.getUserByHaloId(haloHealthId);
      if (existingUser) {
        return res.status(400).json({ error: 'Halo Health ID already taken' });
      }

      const result = await authService.signUp(email, password, haloHealthId, {
        username,
        bio,
        instagramHandle,
      });

      // Generate JWT tokens
      const tokens = generateTokens(result.user.id);

      res.status(201).json({
        user: result.user,
        tokens,
        session: result.session,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.signIn(email, password);

      // Generate JWT tokens
      const tokens = generateTokens(result.user.id);

      res.json({
        user: result.user,
        tokens,
        session: result.session,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async oauthLogin(req, res) {
    try {
      const { provider } = req.params;
      const result = await authService.signInWithOAuth(provider);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async logout(req, res) {
    try {
      await authService.signOut();
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      
      // Generate new JWT tokens
      const tokens = generateTokens(result.user.id);

      res.json({
        user: result.user,
        tokens,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.resetPassword(email);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { newPassword } = req.body;
      await authService.updatePassword(newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser();
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new AuthController();
```

### User Profile Management

```javascript
// src/services/userService.js
import { supabase } from '../utils/database';

class UserService {
  async updateProfile(userId, updates) {
    const allowedFields = [
      'username',
      'bio',
      'avatar_url',
      'instagram_handle',
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        health_profiles (
          id,
          name,
          relationship,
          age_group,
          is_active
        ),
        user_settings (
          voice_preference,
          notification_tone,
          dark_mode
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async searchUsers(query, limit = 20) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar_url, bio, halo_health_id')
      .or(`username.ilike.%${query}%,halo_health_id.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async followUser(userId, targetUserId) {
    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', userId)
      .eq('following_id', targetUserId)
      .single();

    if (existing) {
      throw new Error('Already following this user');
    }

    const { error } = await supabase
      .from('user_follows')
      .insert([{
        follower_id: userId,
        following_id: targetUserId,
      }]);

    if (error) throw error;
  }

  async unfollowUser(userId, targetUserId) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId);

    if (error) throw error;
  }

  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        follower:users!user_follows_follower_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('following_id', userId);

    if (error) throw error;
    return data.map(follow => follow.follower);
  }

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data.map(follow => follow.following);
  }

  async updateSettings(userId, settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSettings(userId) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async uploadAvatar(userId, imageBuffer) {
    // Upload to Supabase Storage
    const fileName = `avatars/${userId}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile
    await this.updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  }

  async deleteAccount(userId) {
    // This is a sensitive operation - implement with care
    // 1. Delete user data (or mark for deletion)
    // 2. Cancel subscriptions
    // 3. Delete auth account
    
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    // Delete from Supabase Auth
    await supabase.auth.admin.deleteUser(userId);
  }
}

export default new UserService();
```

### Health Profile Management

```javascript
// src/services/healthProfileService.js
import { supabase } from '../utils/database';

class HealthProfileService {
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('health_profiles')
      .insert([{
        user_id: userId,
        ...profileData,
      }])
      .select()
      .single();

    if (error) throw error;

    // Add dietary restrictions
    if (profileData.dietary_restrictions?.length > 0) {
      await this.addDietaryRestrictions(data.id, profileData.dietary_restrictions);
    }

    // Add allergies
    if (profileData.allergies_intolerances?.length > 0) {
      await this.addAllergies(data.id, profileData.allergies_intolerances);
    }

    // Add ingredient preferences
    if (profileData.ingredient_preferences?.length > 0) {
      await this.addIngredientPreferences(data.id, profileData.ingredient_preferences);
    }

    // Add health concerns
    if (profileData.health_concerns?.length > 0) {
      await this.addHealthConcerns(data.id, profileData.health_concerns);
    }

    return data;
  }

  async updateProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('health_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfile(profileId) {
    const { data, error } = await supabase
      .from('health_profiles')
      .select(`
        *,
        dietary_restrictions (restriction_type),
        allergies_intolerances (allergy_type, severity),
        ingredient_preferences (ingredient_name, preference),
        health_concerns (concern_type, priority)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;

    // Flatten related data
    return {
      ...data,
      dietary_restrictions: data.dietary_restrictions?.map(r => r.restriction_type) || [],
      allergies_intolerances: data.allergies_intolerances?.map(a => a.allergy_type) || [],
      ingredient_preferences: data.ingredient_preferences || [],
      health_concerns: data.health_concerns?.map(c => c.concern_type) || [],
    };
  }

  async getUserProfiles(userId) {
    const { data, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async setActiveProfile(userId, profileId) {
    // Deactivate all profiles for user
    await supabase
      .from('health_profiles')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Activate selected profile
    const { data, error } = await supabase
      .from('health_profiles')
      .update({ is_active: true })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addDietaryRestrictions(profileId, restrictions) {
    const restrictionsData = restrictions.map(restriction => ({
      profile_id: profileId,
      restriction_type: restriction,
    }));

    const { error } = await supabase
      .from('dietary_restrictions')
      .insert(restrictionsData);

    if (error) throw error;
  }

  async addAllergies(profileId, allergies) {
    const allergiesData = allergies.map(allergy => ({
      profile_id: profileId,
      allergy_type: allergy.allergy_type || allergy,
      severity: allergy.severity || 'moderate',
    }));

    const { error } = await supabase
      .from('allergies_intolerances')
      .insert(allergiesData);

    if (error) throw error;
  }

  async addIngredientPreferences(profileId, preferences) {
    const preferencesData = preferences.map(pref => ({
      profile_id: profileId,
      ingredient_name: pref.ingredient_name || pref,
      preference: pref.preference || pref.preference_type,
    }));

    const { error } = await supabase
      .from('ingredient_preferences')
      .insert(preferencesData);

    if (error) throw error;
  }

  async addHealthConcerns(profileId, concerns) {
    const concernsData = concerns.map(concern => ({
      profile_id: profileId,
      concern_type: concern.concern_type || concern,
      priority: concern.priority || 'medium',
    }));

    const { error } = await supabase
      .from('health_concerns')
      .insert(concernsData);

    if (error) throw error;
  }

  async deleteProfile(profileId) {
    const { error } = await supabase
      .from('health_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
  }

  async duplicateProfile(profileId, newName) {
    const originalProfile = await this.getProfile(profileId);
    
    const newProfile = await this.createProfile(originalProfile.user_id, {
      name: newName,
      relationship: originalProfile.relationship,
      age_group: originalProfile.age_group,
      special_conditions: originalProfile.special_conditions,
      pet_type: originalProfile.pet_type,
      dietary_restrictions: originalProfile.dietary_restrictions,
      allergies_intolerances: originalProfile.allergies_intolerances.map(a => ({
        allergy_type: a,
        severity: 'moderate',
      })),
      ingredient_preferences: originalProfile.ingredient_preferences,
      health_concerns: originalProfile.health_concerns.map(c => ({
        concern_type: c,
        priority: 'medium',
      })),
    });

    return newProfile;
  }
}

export default new HealthProfileService();
```

### JWT Utilities

```javascript
// src/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET env var is required'); })();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    { userId, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};
```

### Session Management

```javascript
// src/services/sessionService.js
import Redis from 'ioredis';
import { generateTokens, verifyToken } from '../utils/jwt';

const redis = new Redis(process.env.REDIS_URL);

class SessionService {
  async createSession(userId, deviceInfo = {}) {
    const tokens = generateTokens(userId);
    const sessionId = `session:${userId}:${Date.now()}`;
    
    // Store session in Redis
    await redis.hset(sessionId, {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      deviceInfo: JSON.stringify(deviceInfo),
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    });

    // Set expiry
    await redis.expire(sessionId, 30 * 24 * 60 * 60); // 30 days

    return {
      sessionId,
      ...tokens,
    };
  }

  async getSession(sessionId) {
    const session = await redis.hgetall(sessionId);
    if (!session || Object.keys(session).length === 0) {
      return null;
    }

    // Update last accessed
    await redis.hset(sessionId, 'lastAccessed', new Date().toISOString());

    return {
      ...session,
      deviceInfo: JSON.parse(session.deviceInfo),
    };
  }

  async refreshSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Verify refresh token
    try {
      const decoded = verifyToken(session.refreshToken);
      if (decoded.userId !== session.userId) {
        throw new Error('Invalid session');
      }
    } catch (error) {
      await this.deleteSession(sessionId);
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(session.userId);

    // Update session
    await redis.hset(sessionId, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      lastAccessed: new Date().toISOString(),
    });

    return tokens;
  }

  async deleteSession(sessionId) {
    await redis.del(sessionId);
  }

  async deleteAllUserSessions(userId) {
    const pattern = `session:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getUserSessions(userId) {
    const pattern = `session:${userId}:*`;
    const keys = await redis.keys(pattern);
    
    const sessions = [];
    for (const key of keys) {
      const session = await this.getSession(key);
      if (session) {
        sessions.push({
          sessionId: key,
          ...session,
        });
      }
    }

    return sessions;
  }
}

export default new SessionService();
```

### Biometric Authentication (React Native)

```javascript
// src/services/biometricService.js
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BiometricService {
  async isSupported() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  async authenticate(reason = 'Authenticate to access Halo Health') {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async enableBiometric(userId) {
    const supported = await this.isSupported();
    if (!supported) {
      throw new Error('Biometric authentication not supported');
    }

    const authenticated = await this.authenticate('Enable biometric login');
    if (!authenticated) {
      throw new Error('Authentication failed');
    }

    // Store biometric preference
    await AsyncStorage.setItem(`biometric_${userId}`, 'enabled');
  }

  async isBiometricEnabled(userId) {
    const enabled = await AsyncStorage.getItem(`biometric_${userId}`);
    return enabled === 'enabled';
  }

  async disableBiometric(userId) {
    await AsyncStorage.removeItem(`biometric_${userId}`);
  }

  async authenticateWithBiometric(userId) {
    const enabled = await this.isBiometricEnabled(userId);
    if (!enabled) {
      return false;
    }

    return await this.authenticate('Login with biometrics');
  }
}

export default new BiometricService();
```

### Security Features

```javascript
// src/services/securityService.js
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class SecurityService {
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  generateApiKey(userId) {
    const keyId = crypto.randomBytes(8).toString('hex');
    const keySecret = crypto.randomBytes(32).toString('hex');
    
    return {
      keyId,
      keySecret,
      apiKey: `hk_${keyId}_${keySecret}`,
    };
  }

  async rateLimitCheck(userId, action, limit = 10, windowMs = 60000) {
    // Implement rate limiting using Redis
    const key = `rate_limit:${userId}:${action}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    return current <= limit;
  }

  async detectSuspiciousActivity(userId, activity) {
    // Implement suspicious activity detection
    // - Unusual login locations
    - Multiple failed attempts
    - Rapid API calls
    // Return true if suspicious
    return false;
  }

  async lockAccount(userId, reason, duration = 3600000) { // 1 hour default
    const lockKey = `account_lock:${userId}`;
    await redis.setex(lockKey, Math.ceil(duration / 1000), JSON.stringify({
      reason,
      lockedAt: new Date().toISOString(),
      duration,
    }));
  }

  async isAccountLocked(userId) {
    const lockKey = `account_lock:${userId}`;
    const lockData = await redis.get(lockKey);
    return lockData ? JSON.parse(lockData) : null;
  }

  async unlockAccount(userId) {
    const lockKey = `account_lock:${userId}`;
    await redis.del(lockKey);
  }
}

export default new SecurityService();
```

This authentication system provides:

1. **Secure user registration and login** with Supabase Auth
2. **JWT token management** with refresh tokens
3. **Multi-profile support** for family members
4. **Biometric authentication** for mobile devices
5. **Session management** with Redis
6. **Security features** including rate limiting and account locking
7. **OAuth integration** for social login options
8. **Comprehensive user profile management**
