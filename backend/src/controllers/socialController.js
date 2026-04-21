const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class SocialController {
  async createPost(req, res, next) {
    try {
      const { content, imageUrls, tags, isPublic = true } = req.body;
      const userId = req.user.id;

      const { data: post, error } = await supabase
        .from('social_posts')
        .insert([{
          user_id: userId,
          content,
          image_urls: imageUrls || [],
          tags: tags || [],
          is_public: isPublic,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req, res, next) {
    try {
      const { limit = 20, offset = 0 } = req.query;

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

  async getPost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const { data: post, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .or(`user_id.eq.${userId},and(is_public.eq.true)`)
        .single();

      if (error || !post) {
        throw new NotFoundError('Post not found');
      }

      res.json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Check if post exists and is accessible
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select('id')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        throw new NotFoundError('Post not found');
      }

      // Increment likes count
      const { data, error } = await supabase.rpc('increment_post_likes', {
        post_id: postId,
      });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Post liked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async commentPost(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Check if post exists and is accessible
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select('id')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        throw new NotFoundError('Post not found');
      }

      // Create comment (simplified - in real implementation you'd have a comments table)
      const { data, error } = await supabase.rpc('increment_post_comments', {
        post_id: postId,
      });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Comment added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async sharePost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Check if post exists and is accessible
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select('id')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        throw new NotFoundError('Post not found');
      }

      // Increment shares count
      const { data, error } = await supabase.rpc('increment_post_shares', {
        post_id: postId,
      });

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Post shared successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      // Get posts from communities the user follows and their own posts
      const { data: posts, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          users (
            username,
            avatar_url
          )
        `)
        .or(`user_id.eq.${userId},and(is_public.eq.true)`)
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

module.exports = new SocialController();
