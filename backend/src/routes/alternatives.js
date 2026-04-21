const express = require('express');
const router = express.Router();
const alternativesService = require('../services/alternativesService');
const { authMiddleware } = require('../middleware/auth');

router.get('/:productId', authMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { profileId, limit = 5 } = req.query;

    const alternatives = await alternativesService.findHealthierAlternatives(
      productId,
      profileId || req.user.activeProfileId,
      parseInt(limit)
    );

    res.json({ alternatives });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
