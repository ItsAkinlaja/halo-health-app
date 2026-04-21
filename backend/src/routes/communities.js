const express = require('express');
const { body, query } = require('express-validator');
const communityController = require('../controllers/communityController');
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
router.post('/', [
  body('name').notEmpty().withMessage('Community name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('isPrivate').optional().isBoolean(),
  validateRequest
], catchAsync(communityController.createCommunity));

router.get('/', [
  query('category').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(communityController.getCommunities));

router.get('/:communityId', [
  query('communityId').isUUID().withMessage('Valid community ID is required'),
  validateRequest
], catchAsync(communityController.getCommunity));

router.post('/:communityId/join', [
  query('communityId').isUUID().withMessage('Valid community ID is required'),
  validateRequest
], catchAsync(communityController.joinCommunity));

router.post('/:communityId/leave', [
  query('communityId').isUUID().withMessage('Valid community ID is required'),
  validateRequest
], catchAsync(communityController.leaveCommunity));

router.get('/:communityId/posts', [
  query('communityId').isUUID().withMessage('Valid community ID is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(communityController.getCommunityPosts));

module.exports = router;
