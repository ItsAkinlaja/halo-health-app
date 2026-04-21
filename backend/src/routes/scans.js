const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const scanController = require('../controllers/scanController');
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
router.post('/barcode', [
  body('barcode').notEmpty().withMessage('Barcode is required'),
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  validateRequest
], catchAsync(scanController.scanByBarcode));

router.post('/photo', [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  validateRequest
], catchAsync(scanController.scanByPhoto));

router.get('/history', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], catchAsync(scanController.getScanHistory));

router.post('/save', [
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('listType').optional().isIn(['clean_choices', 'favorites', 'avoid']),
  validateRequest
], catchAsync(scanController.saveProduct));

router.delete('/save/:productId', [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  validateRequest
], catchAsync(scanController.unsaveProduct));

router.get('/saved', [
  query('listType').optional().isIn(['clean_choices', 'favorites', 'avoid']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest
], catchAsync(scanController.getSavedProducts));

router.get('/stats', catchAsync(scanController.getScanStats));

router.get('/:scanId', catchAsync(scanController.getScanById));

router.delete('/:scanId', catchAsync(scanController.deleteScan));

module.exports = router;
