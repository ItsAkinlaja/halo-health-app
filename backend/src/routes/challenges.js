const express = require('express');
const { body, query } = require('express-validator');
const challengeController = require('../controllers/challengeController');
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
router.get('/', [
  query('category').optional().isString(),
  query('difficulty').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(challengeController.getChallenges));

router.get('/:challengeId', [
  query('challengeId').isUUID().withMessage('Valid challenge ID is required'),
  validateRequest
], catchAsync(challengeController.getChallenge));

router.post('/:challengeId/join', [
  query('challengeId').isUUID().withMessage('Valid challenge ID is required'),
  validateRequest
], catchAsync(challengeController.joinChallenge));

router.get('/user/active', catchAsync(challengeController.getUserActiveChallenges));

router.get('/user/completed', catchAsync(challengeController.getUserCompletedChallenges));

router.post('/user/:userChallengeId/progress', [
  body('progressPercentage').isInt({ min: 0, max: 100 }),
  validateRequest
], catchAsync(challengeController.updateChallengeProgress));

module.exports = router;
