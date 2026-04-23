const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 'error',
    message: 'Too many attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    status: 'error',
    message: 'Too many password reset attempts. Please try again in 1 hour.'
  },
});

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
router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('haloHealthId').isLength({ min: 3, max: 20 }).withMessage('Halo Health ID must be 3-20 characters'),
  validateRequest
], catchAsync(authController.register));

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], catchAsync(authController.login));

router.post('/refresh-token', catchAsync(authController.refreshToken));
router.post('/logout', authMiddleware, catchAsync(authController.logout));
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validateRequest
], catchAsync(authController.forgotPassword));
router.post('/reset-password', authMiddleware, [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validateRequest
], catchAsync(authController.resetPassword));

router.get('/me', authMiddleware, catchAsync(authController.getCurrentUser));
router.get('/check-halo-id', catchAsync(authController.checkHaloIdAvailability));
router.delete('/delete-account', authMiddleware, catchAsync(authController.deleteAccount));

module.exports = router;
