const express = require('express');
const { body, query, param } = require('express-validator');
const { validationResult } = require('express-validator');
const socialController = require('../controllers/socialController');
const { authMiddleware } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// ==================== POSTS ====================

// Create post
router.post('/posts', [
  body('content').notEmpty().withMessage('Content is required'),
  body('image_urls').optional().isArray(),
  body('tags').optional().isArray(),
  body('is_public').optional().isBoolean(),
  validateRequest
], catchAsync(socialController.createPost));

// Get feed
router.get('/posts', [
  query('filter').optional().isIn(['all', 'following']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getFeed));

// Get single post
router.get('/posts/:postId', [
  param('postId').isUUID(),
  validateRequest
], catchAsync(socialController.getPost));

// Update post
router.put('/posts/:postId', [
  param('postId').isUUID(),
  body('content').optional().notEmpty(),
  body('image_urls').optional().isArray(),
  body('tags').optional().isArray(),
  body('is_public').optional().isBoolean(),
  validateRequest
], catchAsync(socialController.updatePost));

// Delete post
router.delete('/posts/:postId', [
  param('postId').isUUID(),
  validateRequest
], catchAsync(socialController.deletePost));

// Get user posts
router.get('/users/:userId/posts', [
  param('userId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getUserPosts));

// ==================== LIKES ====================

// Like post
router.post('/posts/:postId/like', [
  param('postId').isUUID(),
  validateRequest
], catchAsync(socialController.likePost));

// Unlike post
router.delete('/posts/:postId/like', [
  param('postId').isUUID(),
  validateRequest
], catchAsync(socialController.unlikePost));

// Get post likes
router.get('/posts/:postId/likes', [
  param('postId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getPostLikes));

// ==================== COMMENTS ====================

// Create comment
router.post('/posts/:postId/comments', [
  param('postId').isUUID(),
  body('content').notEmpty().withMessage('Comment content is required'),
  body('parent_comment_id').optional().isUUID(),
  validateRequest
], catchAsync(socialController.createComment));

// Get comments
router.get('/posts/:postId/comments', [
  param('postId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getComments));

// Get comment replies
router.get('/comments/:commentId/replies', [
  param('commentId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getCommentReplies));

// Update comment
router.put('/comments/:commentId', [
  param('commentId').isUUID(),
  body('content').notEmpty(),
  validateRequest
], catchAsync(socialController.updateComment));

// Delete comment
router.delete('/comments/:commentId', [
  param('commentId').isUUID(),
  validateRequest
], catchAsync(socialController.deleteComment));

// Like comment
router.post('/comments/:commentId/like', [
  param('commentId').isUUID(),
  validateRequest
], catchAsync(socialController.likeComment));

// Unlike comment
router.delete('/comments/:commentId/like', [
  param('commentId').isUUID(),
  validateRequest
], catchAsync(socialController.unlikeComment));

// ==================== FOLLOWS ====================

// Follow user
router.post('/users/:targetUserId/follow', [
  param('targetUserId').isUUID(),
  validateRequest
], catchAsync(socialController.followUser));

// Unfollow user
router.delete('/users/:targetUserId/follow', [
  param('targetUserId').isUUID(),
  validateRequest
], catchAsync(socialController.unfollowUser));

// Get followers
router.get('/users/:userId/followers', [
  param('userId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getFollowers));

// Get following
router.get('/users/:userId/following', [
  param('userId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getFollowing));

// Check follow status
router.get('/users/:targetUserId/follow-status', [
  param('targetUserId').isUUID(),
  validateRequest
], catchAsync(socialController.checkFollowStatus));

// ==================== BLOCKS ====================

// Block user
router.post('/users/:targetUserId/block', [
  param('targetUserId').isUUID(),
  validateRequest
], catchAsync(socialController.blockUser));

// Unblock user
router.delete('/users/:targetUserId/block', [
  param('targetUserId').isUUID(),
  validateRequest
], catchAsync(socialController.unblockUser));

// Get blocked users
router.get('/users/blocked', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getBlockedUsers));

// ==================== SHARES & REPORTS ====================

// Share post
router.post('/posts/:postId/share', [
  param('postId').isUUID(),
  body('shared_to').optional().isIn(['feed', 'community', 'external']),
  validateRequest
], catchAsync(socialController.sharePost));

// Report post
router.post('/posts/:postId/report', [
  param('postId').isUUID(),
  body('reason').notEmpty(),
  body('description').optional(),
  validateRequest
], catchAsync(socialController.reportPost));

// ==================== ACTIVITY & DISCOVERY ====================

// Get activity feed
router.get('/activity/feed', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getActivityFeed));

// Get trending hashtags
router.get('/hashtags/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], catchAsync(socialController.getTrendingHashtags));

// Get posts by hashtag
router.get('/hashtags/:tag', [
  param('tag').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getPostsByHashtag));

// Search hashtags
router.get('/hashtags/search', [
  query('q').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], catchAsync(socialController.searchHashtags));

module.exports = router;
