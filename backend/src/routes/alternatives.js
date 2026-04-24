const express = require('express');
const router = express.Router();
const alternativesService = require('../services/alternativesService');
const { authMiddleware } = require('../middleware/auth');
const { param, query, validationResult } = require('express-validator');

router.get('/:productId', [
  authMiddleware,
  param('productId').isUUID().withMessage('Valid product ID required'),
  query('profileId').optional().isUUID().withMessage('Valid profile ID required'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { productId } = req.params;
    const { profileId, limit = 5 } = req.query;

    const alternatives = await alternativesService.findHealthierAlternatives(
      productId,
      profileId,
      parseInt(limit)
    );

    res.json({ 
      status: 'success',
      data: { alternatives }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
