const express = require('express');
const { body, query } = require('express-validator');
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
      status: 'fail',
      errors: errors.array(),
    });
  }
  next();
};

// Routes
router.post('/posts', [
  body('content').notEmpty().withMessage('Content is required'),
  body('isPublic').optional().isBoolean(),
  validateRequest
], catchAsync(socialController.createPost));

router.get('/posts', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getPosts));

router.get('/posts/:postId', [
  query('postId').isUUID().withMessage('Valid post ID is required'),
  validateRequest
], catchAsync(socialController.getPost));

router.post('/posts/:postId/like', [
  query('postId').isUUID().withMessage('Valid post ID is required'),
  validateRequest
], catchAsync(socialController.likePost));

router.post('/posts/:postId/comment', [
  query('postId').isUUID().withMessage('Valid post ID is required'),
  body('content').notEmpty().withMessage('Comment content is required'),
  validateRequest
], catchAsync(socialController.commentPost));

router.post('/posts/:postId/share', [
  query('postId').isUUID().withMessage('Valid post ID is required'),
  validateRequest
], catchAsync(socialController.sharePost));

router.get('/feed', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(socialController.getFeed));

module.exports = router;
