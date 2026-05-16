const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, newsController.getNewsAndTrends);

module.exports = router;
