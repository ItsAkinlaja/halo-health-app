const express = require('express');
const router = express.Router();
const productSubmissionController = require('../controllers/productSubmissionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, productSubmissionController.submitUnknownProduct);

module.exports = router;
