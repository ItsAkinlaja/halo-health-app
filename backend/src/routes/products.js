const express = require('express');
const { query, param, validationResult } = require('express-validator');
const productController = require('../controllers/productController');
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
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(productController.searchProducts));

router.get('/barcode/:barcode', [
  param('barcode').notEmpty().withMessage('Barcode is required'),
  validateRequest
], catchAsync(productController.getProductByBarcode));

router.get('/category/:category', [
  param('category').notEmpty().withMessage('Category is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(productController.getProductsByCategory));

router.get('/recommendations/:userId', [
  param('userId').isUUID().withMessage('Valid user ID is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validateRequest
], catchAsync(productController.getRecommendations));

router.get('/alternatives/:productId', [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  query('limit').optional().isInt({ min: 1, max: 10 }),
  validateRequest
], catchAsync(productController.getAlternatives));

router.get('/:productId', [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  validateRequest
], catchAsync(productController.getProductById));

module.exports = router;
