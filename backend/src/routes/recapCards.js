const express = require('express');
const router = express.Router();
const recapCardService = require('../services/recapCardService');
const { authMiddleware } = require('../middleware/auth');

router.post('/generate/:scanId', authMiddleware, async (req, res, next) => {
  try {
    const card = await recapCardService.generateRecapCard(req.params.scanId, req.user.id);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.get('/:cardId', async (req, res, next) => {
  try {
    const card = await recapCardService.getRecapCard(req.params.cardId);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const cards = await recapCardService.getUserRecapCards(req.user.id, parseInt(limit), parseInt(offset));
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

router.post('/:cardId/share', authMiddleware, async (req, res, next) => {
  try {
    const card = await recapCardService.shareRecapCard(req.params.cardId, req.user.id);
    res.json(card);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
