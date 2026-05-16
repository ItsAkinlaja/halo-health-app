const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, newsController.getNewsAndTrends);

module.exports = router;
