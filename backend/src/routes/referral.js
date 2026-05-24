const express = require('express');
const router = express.Router();
const referralService = require('../services/referralService');
const { authMiddleware } = require('../middleware/auth');

const assertReferralAdmin = (req) => {
  const raw = process.env.REFERRAL_ADMIN_USER_IDS || '';
  const adminIds = raw.split(',').map((id) => id.trim()).filter(Boolean);
  return adminIds.includes(req.user.id);
};

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

router.get('/payout/pending', authMiddleware, async (req, res, next) => {
  try {
    if (!assertReferralAdmin(req)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const limit = Number(req.query.limit || 100);
    const offset = Number(req.query.offset || 0);
    const payouts = await referralService.getPendingPayoutRequests(limit, offset);
    res.json({ payouts });
  } catch (error) {
    next(error);
  }
});

router.put('/payout/:payoutId/status', authMiddleware, async (req, res, next) => {
  try {
    if (!assertReferralAdmin(req)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { payoutId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    const payout = await referralService.updatePayoutStatus(payoutId, status);
    res.json({ payout });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
