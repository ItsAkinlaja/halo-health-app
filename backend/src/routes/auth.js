const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

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
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('haloHealthId').isLength({ min: 3, max: 20 }).withMessage('Halo Health ID must be 3-20 characters'),
  validateRequest
], catchAsync(authController.register));

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], catchAsync(authController.login));

router.post('/refresh-token', catchAsync(authController.refreshToken));
router.post('/logout', catchAsync(authController.logout));
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  validateRequest
], catchAsync(authController.forgotPassword));
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  validateRequest
], catchAsync(authController.resetPassword));

router.get('/me', catchAsync(authController.getCurrentUser));

module.exports = router;
