const express = require('express');
const router = express.Router();
const restaurantService = require('../services/restaurantService');
const ttsService = require('../services/ttsService');
const { authMiddleware } = require('../middleware/auth');

router.get('/search', async (req, res, next) => {
  try {
    const filters = {
      latitude: req.query.latitude ? parseFloat(req.query.latitude) : null,
      longitude: req.query.longitude ? parseFloat(req.query.longitude) : null,
      radius: req.query.radius ? parseFloat(req.query.radius) : 10,
      seedOilFree: req.query.seedOilFree === 'true',
      organic: req.query.organic === 'true',
      glutenFree: req.query.glutenFree === 'true',
      vegan: req.query.vegan === 'true',
      query: req.query.query || ''
    };

    const restaurants = await restaurantService.searchRestaurants(filters);
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await restaurantService.getRestaurantReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/reviews', authMiddleware, async (req, res, next) => {
  try {
    const review = await restaurantService.addReview(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(review);
  } catch (error) {
    next(error);
  }
});

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
