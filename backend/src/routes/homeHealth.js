const express = require('express');
const router = express.Router();
const homeHealthService = require('../services/homeHealthService');
const { authMiddleware } = require('../middleware/auth');

router.get('/score', authMiddleware, async (req, res, next) => {
  try {
    const score = await homeHealthService.calculateHomeHealthScore(req.user.id);
    res.json(score);
  } catch (error) {
    next(error);
  }
});

router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const history = await homeHealthService.getHomeHealthHistory(req.user.id, parseInt(limit));
    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
