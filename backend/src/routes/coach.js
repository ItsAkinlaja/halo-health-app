const express = require('express');
const { body, query, validationResult } = require('express-validator');
const coachController = require('../controllers/coachController');
const { authMiddleware } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

router.post('/chat', [
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message too long'),
  body('context').optional().isObject().withMessage('Context must be an object'),
  validate,
], catchAsync(coachController.sendMessage));

router.get('/history', [
  query('userId').isUUID().withMessage('Invalid user ID'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be 1-200'),
  validate,
], catchAsync(coachController.getChatHistory));

router.delete('/history', [
  query('userId').isUUID().withMessage('Invalid user ID'),
  validate,
], catchAsync(coachController.clearHistory));

module.exports = router;
