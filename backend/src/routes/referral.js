const express = require('express');
const router = express.Router();
const referralService = require('../services/referralService');
const { authMiddleware } = require('../middleware/auth');

router.get('/code', authMiddleware, async (req, res, next) => {
  try {
    const code = await referralService.generateReferralCode(req.user.id);
    res.json({ code });
  } catch (error) {
    next(error);
  }
});

router.post('/apply', authMiddleware, async (req, res, next) => {
  try {
    const { code } = req.body;
    const referral = await referralService.applyReferralCode(req.user.id, code);
    res.json(referral);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const stats = await referralService.getReferralStats(req.user.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/earnings', authMiddleware, async (req, res, next) => {
  try {
    const earnings = await referralService.getUserEarnings(req.user.id);
    res.json(earnings);
  } catch (error) {
    next(error);
  }
});

router.post('/payout', authMiddleware, async (req, res, next) => {
  try {
    const { amount, method, details } = req.body;
    const payout = await referralService.requestPayout(req.user.id, amount, method, details);
    res.json(payout);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
