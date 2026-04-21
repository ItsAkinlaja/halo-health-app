const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class CommunityController {
  async createCommunity(req, res, next) {
    try {
      const { name, description, category, isPrivate = false } = req.body;
      const userId = req.user.id;

      const { data: community, error } = await supabase
        .from('communities')
        .insert([{
          name,
          description,
          category,
          is_private: isPrivate,
          created_by: userId,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      // Add creator as admin member
      await supabase
        .from('community_members')
        .insert([{
          community_id: community.id,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString(),
        }]);

      // Update member count
      await supabase
        .from('communities')
        .update({ member_count: 1 })
        .eq('id', community.id);

      res.json({
        status: 'success',
        data: { community },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommunities(req, res, next) {
    try {
      const { category, limit = 20, offset = 0 } = req.query;

      let query = supabase
        .from('communities')
        .select('*')
        .eq('is_private', false);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: communities, error } = await query
        .order('member_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          communities,
          total: communities.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommunity(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;

      const { data: community, error } = await supabase
        .from('communities')
        .select(`
          *,
          community_members (
            user_id,
            role,
            joined_at
          ),
          users (
            username,
            avatar_url
          )
        `)
        .eq('id', communityId)
        .or(`is_private.eq.false,and(created_by.eq.${userId})`)
        .single();

      if (error || !community) {
        throw new NotFoundError('Community not found');
      }

      // Check if user is a member
      const isMember = community.community_members.some(member => member.user_id === userId);

      res.json({
        status: 'success',
        data: { community, isMember },
      });
    } catch (error) {
      next(error);
    }
  }

  async joinCommunity(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;

      // Check if community exists and is joinable
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id, is_private')
        .eq('id', communityId)
        .single();

      if (communityError || !community) {
        throw new NotFoundError('Community not found');
      }

      // Check if already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new ValidationError('Already a member of this community');
      }

      // Join community
      const { data, error } = await supabase
        .from('community_members')
        .insert([{
          community_id: communityId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      // Update member count
      await supabase.rpc('increment_community_members', {
        community_id: communityId,
      });

      res.json({
        status: 'success',
        message: 'Joined community successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveCommunity(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;

      // Remove from community
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) {
        throw new ValidationError(error.message);
      }

      // Update member count
      await supabase.rpc('decrement_community_members', {
        community_id: communityId,
      });

      res.json({
        status: 'success',
        message: 'Left community successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommunityPosts(req, res, next) {
    try {
      const { communityId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const userId = req.user.id;

      // Check if user is a member or community is public
      const { data: membership, error: membershipError } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

      if (membershipError && membershipError.code === 'PGRST116') {
        // Not a member, check if community is public
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('is_private')
          .eq('id', communityId)
          .single();

        if (communityError || community.is_private) {
          throw new ValidationError('Access denied to private community');
        }
      }

      // Get posts (simplified - would normally have community_posts table)
      const { data: posts, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          posts,
          total: posts.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunityController();
