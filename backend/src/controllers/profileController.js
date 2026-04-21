const { supabase } = require('../utils/database');
const { NotFoundError, ValidationError, ForbiddenError } = require('../middleware/errorHandler');

// Helper — verify profile belongs to requesting user
async function assertProfileOwner(profileId, userId) {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', userId)
    .single();
  if (error || !data) throw new ForbiddenError('Profile not found or access denied');
}

class ProfileController {
  // GET /api/profiles/user/:userId
  async getUserProfile(req, res, next) {
    try {
      const { userId } = req.params;
      if (userId !== req.user.id) throw new ForbiddenError();

      const { data, error } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw new ValidationError(error.message);

      // Also pull from users table for email / display fields
      const { data: userRow } = await supabase
        .from('users')
        .select('email, username, avatar_url, bio')
        .eq('id', userId)
        .maybeSingle();

      res.json({ status: 'success', data: { ...data, email: userRow?.email, username: userRow?.username, avatar_url: userRow?.avatar_url } });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/profiles/user/:userId
  async updateUserProfile(req, res, next) {
    try {
      const { userId } = req.params;
      if (userId !== req.user.id) throw new ForbiddenError();

      const { name, phone, date_of_birth, gender, height, weight, blood_type } = req.body;

      // Upsert primary profile
      const { data: existing } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('health_profiles')
          .update({ name, gender, weight_kg: weight, height_cm: height, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw new ValidationError(error.message);
        result = data;
      } else {
        const { data, error } = await supabase
          .from('health_profiles')
          .insert([{ user_id: userId, name: name || 'My Profile', relationship: 'self', gender, weight_kg: weight, height_cm: height, is_primary: true }])
          .select()
          .single();
        if (error) throw new ValidationError(error.message);
        result = data;
      }

      // Update users table for phone / dob / blood_type if columns exist
      await supabase.from('users').update({ updated_at: new Date().toISOString() }).eq('id', userId);

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles?userId=
  async getProfiles(req, res, next) {
    try {
      const userId = req.query.userId || req.user.id;
      if (userId !== req.user.id) throw new ForbiddenError();

      const { data, error } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data: data || [] });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/profiles
  async createProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        name, relationship = 'self', age, gender, is_primary = false,
        health_goals, dietary_restrictions, allergies, health_conditions,
        notification_settings,
      } = req.body;

      if (!name?.trim()) throw new ValidationError('Name is required');

      // Check profile limit (max 10 profiles per user)
      const { count } = await supabase
        .from('health_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count >= 10) throw new ValidationError('Maximum 10 profiles allowed per user');

      // If creating primary, unset any existing primary
      if (is_primary) {
        await supabase
          .from('health_profiles')
          .update({ is_primary: false })
          .eq('user_id', userId)
          .eq('is_primary', true);
      }

      const { data: profile, error } = await supabase
        .from('health_profiles')
        .insert([{
          user_id: userId,
          name: name.trim(),
          relationship,
          age_group: age ? (age < 13 ? 'child' : age < 18 ? 'teen' : age < 65 ? 'adult' : 'senior') : null,
          gender,
          health_goals: health_goals || [],
          is_primary,
        }])
        .select()
        .single();

      if (error) throw new ValidationError(error.message);

      // Insert dietary restrictions
      if (dietary_restrictions?.length) {
        if (dietary_restrictions.length > 50) throw new ValidationError('Maximum 50 dietary restrictions');
        await supabase.from('dietary_restrictions').insert(
          dietary_restrictions.map((r) => ({ profile_id: profile.id, restriction_type: r, severity: 'strict' }))
        );
      }

      // Insert allergies
      if (allergies?.length) {
        if (allergies.length > 100) throw new ValidationError('Maximum 100 allergies');
        await supabase.from('allergies_intolerances').insert(
          allergies.map((a) => ({ profile_id: profile.id, allergy_type: a, severity: 'medium' }))
        );
      }

      // Insert health conditions as health_concerns
      if (health_conditions?.length) {
        if (health_conditions.length > 50) throw new ValidationError('Maximum 50 health conditions');
        await supabase.from('health_concerns').insert(
          health_conditions.map((c) => ({ profile_id: profile.id, concern_type: c, priority: 'medium' }))
        );
      }

      res.status(201).json({ status: 'success', data: profile });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/profiles/:profileId
  async updateProfile(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { name, relationship, age, gender, health_goals } = req.body;

      const { data, error } = await supabase
        .from('health_profiles')
        .update({
          ...(name && { name: name.trim() }),
          ...(relationship && { relationship }),
          ...(gender && { gender }),
          ...(health_goals && { health_goals }),
          ...(age && { age_group: age < 13 ? 'child' : age < 18 ? 'teen' : age < 65 ? 'adult' : 'senior' }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/profiles/:profileId
  async deleteProfile(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      // Prevent deleting primary profile
      const { data: profile } = await supabase
        .from('health_profiles')
        .select('is_primary')
        .eq('id', profileId)
        .single();

      if (profile?.is_primary) throw new ValidationError('Cannot delete primary profile');

      const { error } = await supabase
        .from('health_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', message: 'Profile deleted' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles/:profileId/health-score
  async getHealthScore(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('profile_id', profileId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data: data || { overall_score: 0 } });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles/:profileId/dietary-restrictions
  async getDietaryRestrictions(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { data, error } = await supabase
        .from('dietary_restrictions')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data: data || [] });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/profiles/:profileId/dietary-restrictions
  async updateDietaryRestrictions(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { restrictions } = req.body;
      if (!Array.isArray(restrictions)) throw new ValidationError('restrictions must be an array');
      if (restrictions.length > 50) throw new ValidationError('Maximum 50 dietary restrictions allowed');

      // Replace all restrictions for this profile
      await supabase.from('dietary_restrictions').delete().eq('profile_id', profileId);

      if (restrictions.length) {
        const { error } = await supabase.from('dietary_restrictions').insert(
          restrictions.map((r) => ({ profile_id: profileId, restriction_type: r, severity: 'strict' }))
        );
        if (error) throw new ValidationError(error.message);
      }

      res.json({ status: 'success', message: 'Dietary restrictions updated' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles/:profileId/allergies
  async getAllergies(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { data, error } = await supabase
        .from('allergies_intolerances')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data: data || [] });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/profiles/:profileId/allergies
  async updateAllergies(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { allergies } = req.body;
      if (!Array.isArray(allergies)) throw new ValidationError('allergies must be an array');
      if (allergies.length > 100) throw new ValidationError('Maximum 100 allergies allowed');

      await supabase.from('allergies_intolerances').delete().eq('profile_id', profileId);

      if (allergies.length) {
        const { error } = await supabase.from('allergies_intolerances').insert(
          allergies.map((a) => ({ profile_id: profileId, allergy_type: a, severity: 'medium' }))
        );
        if (error) throw new ValidationError(error.message);
      }

      res.json({ status: 'success', message: 'Allergies updated' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles/:profileId/health-conditions
  async getHealthConditions(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { data, error } = await supabase
        .from('health_concerns')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw new ValidationError(error.message);
      res.json({ status: 'success', data: data || [] });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/profiles/:profileId/health-conditions
  async updateHealthConditions(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { conditions } = req.body;
      if (!Array.isArray(conditions)) throw new ValidationError('conditions must be an array');
      if (conditions.length > 50) throw new ValidationError('Maximum 50 health conditions allowed');

      await supabase.from('health_concerns').delete().eq('profile_id', profileId);

      if (conditions.length) {
        const { error } = await supabase.from('health_concerns').insert(
          conditions.map((c) => ({ profile_id: profileId, concern_type: c, priority: 'medium' }))
        );
        if (error) throw new ValidationError(error.message);
      }

      res.json({ status: 'success', message: 'Health conditions updated' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/profiles/:profileId/analytics
  async getAnalytics(req, res, next) {
    try {
      const { profileId } = req.params;
      await assertProfileOwner(profileId, req.user.id);

      const { period = '30d' } = req.query;
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const { data: scans, error } = await supabase
        .from('product_scans')
        .select('score_given, created_at, products(category)')
        .eq('profile_id', profileId)
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      if (error) throw new ValidationError(error.message);

      const total = scans?.length ?? 0;
      const avgScore = total > 0
        ? Math.round(scans.reduce((s, r) => s + (r.score_given || 0), 0) / total)
        : 0;

      // Trend
      const midpoint = new Date(Date.now() - (days / 2) * 86400000).toISOString();
      const recent = scans.filter((s) => s.created_at >= midpoint);
      const older = scans.filter((s) => s.created_at < midpoint);
      const recentAvg = recent.length ? recent.reduce((s, r) => s + (r.score_given || 0), 0) / recent.length : 0;
      const olderAvg = older.length ? older.reduce((s, r) => s + (r.score_given || 0), 0) / older.length : 0;
      const trend = Math.round(recentAvg - olderAvg);

      // Category scores
      const categoryScores = {};
      for (const scan of scans) {
        const cat = scan.products?.category || 'unknown';
        if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };
        categoryScores[cat].total += scan.score_given || 0;
        categoryScores[cat].count += 1;
      }
      const categoryAverages = Object.fromEntries(
        Object.entries(categoryScores).map(([k, v]) => [k, Math.round(v.total / v.count)])
      );

      // Score history — bucket by week
      const bucketSize = days <= 7 ? 1 : days <= 30 ? 7 : 14;
      const history = [];
      for (let i = 0; i < days; i += bucketSize) {
        const start = new Date(Date.now() - (days - i) * 86400000).toISOString();
        const end = new Date(Date.now() - (days - i - bucketSize) * 86400000).toISOString();
        const bucket = scans.filter((s) => s.created_at >= start && s.created_at < end);
        if (bucket.length) {
          history.push({
            label: `W${Math.floor(i / bucketSize) + 1}`,
            score: Math.round(bucket.reduce((s, r) => s + (r.score_given || 0), 0) / bucket.length),
          });
        }
      }

      const cleanCount = scans.filter((s) => (s.score_given || 0) >= 60).length;
      const flaggedCount = scans.filter((s) => (s.score_given || 0) < 40).length;

      res.json({
        status: 'success',
        data: {
          overall_score: avgScore,
          total_scans: total,
          trend,
          clean_count: cleanCount,
          flagged_count: flaggedCount,
          category_scores: categoryAverages,
          score_history: history,
          top_flagged_ingredients: [],
          improvements: [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
