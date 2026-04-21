const socialService = require('../services/socialService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

class SocialController {
  async getFeed(req, res, next) {
    try {
      const userId = req.user.id;
      const { filter = 'all', limit = 20, offset = 0 } = req.query;
      
      const posts = await socialService.getFeed(userId, { filter, limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  async createPost(req, res, next) {
    try {
      const userId = req.user.id;
      const post = await socialService.createPost(userId, req.body);
      res.json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const post = await socialService.getPost(postId, userId);
      res.json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const post = await socialService.updatePost(postId, userId, req.body);
      res.json({ success: true, data: { post } });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      await socialService.deletePost(postId, userId);
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(req, res, next) {
    try {
      const currentUserId = req.user.id;
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const posts = await socialService.getUserPosts(userId, currentUserId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const result = await socialService.likePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unlikePost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const result = await socialService.unlikePost(postId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPostLikes(req, res, next) {
    try {
      const { postId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const likes = await socialService.getPostLikes(postId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { likes } });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { content, parent_comment_id } = req.body;
      const comment = await socialService.createComment(postId, userId, content, parent_comment_id);
      res.json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const comments = await socialService.getComments(postId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async getCommentReplies(req, res, next) {
    try {
      const { commentId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const replies = await socialService.getCommentReplies(commentId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { replies } });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await socialService.updateComment(commentId, userId, content);
      res.json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      await socialService.deleteComment(commentId, userId);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }

  async likeComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const result = await socialService.likeComment(commentId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unlikeComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const result = await socialService.unlikeComment(commentId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sharePost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { shared_to } = req.body;
      const share = await socialService.sharePost(postId, userId, shared_to);
      res.json({ success: true, data: { share } });
    } catch (error) {
      next(error);
    }
  }

  async reportPost(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { reason, description } = req.body;
      const report = await socialService.reportPost(postId, userId, reason, description);
      res.json({ success: true, data: { report } });
    } catch (error) {
      next(error);
    }
  }

  async followUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;
      const result = await socialService.followUser(userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;
      const result = await socialService.unfollowUser(userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const followers = await socialService.getFollowers(userId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { followers } });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const following = await socialService.getFollowing(userId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { following } });
    } catch (error) {
      next(error);
    }
  }

  async checkFollowStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;
      const result = await socialService.checkFollowStatus(userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;
      const result = await socialService.blockUser(userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;
      const result = await socialService.unblockUser(userId, targetUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBlockedUsers(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;
      const blocked = await socialService.getBlockedUsers(userId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { blocked } });
    } catch (error) {
      next(error);
    }
  }

  async getActivityFeed(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;
      const activities = await socialService.getActivityFeed(userId, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { activities } });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingHashtags(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const hashtags = await socialService.getTrendingHashtags(parseInt(limit));
      res.json({ success: true, data: { hashtags } });
    } catch (error) {
      next(error);
    }
  }

  async getPostsByHashtag(req, res, next) {
    try {
      const { tag } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const posts = await socialService.getPostsByHashtag(tag, { limit: parseInt(limit), offset: parseInt(offset) });
      res.json({ success: true, data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  async searchHashtags(req, res, next) {
    try {
      const { q } = req.query;
      const { limit = 20 } = req.query;
      const hashtags = await socialService.searchHashtags(q, parseInt(limit));
      res.json({ success: true, data: { hashtags } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SocialController();
