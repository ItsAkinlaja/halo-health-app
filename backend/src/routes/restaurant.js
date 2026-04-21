const express = require('express');
const router = express.Router();
const restaurantService = require('../services/restaurantService');
const ttsService = require('../services/ttsService');
const { authMiddleware } = require('../middleware/auth');

router.post('/scan-menu', authMiddleware, async (req, res, next) => {
  try {
    const { imageUri, profileId } = req.body;

    const menuAnalysis = await restaurantService.scanMenu(
      imageUri,
      profileId || req.user.activeProfileId
    );

    res.json(menuAnalysis);
  } catch (error) {
    next(error);
  }
});

router.post('/scan-menu/audio', authMiddleware, async (req, res, next) => {
  try {
    const { menuAnalysis } = req.body;

    const audio = await ttsService.generateMenuAnalysisAudio(menuAnalysis);

    if (!audio) {
      return res.status(503).json({ error: 'TTS service not available' });
    }

    res.set('Content-Type', audio.contentType);
    res.send(audio.audio);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
