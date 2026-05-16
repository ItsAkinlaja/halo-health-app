const express = require('express');
const router = express.Router();
const productSubmissionController = require('../controllers/productSubmissionController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, productSubmissionController.submitUnknownProduct);

module.exports = router;
