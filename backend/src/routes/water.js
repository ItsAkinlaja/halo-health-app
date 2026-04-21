const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const { authMiddleware } = require('../middleware/auth');

router.get('/search', waterController.searchProducts);
router.get('/top-rated', waterController.getTopRated);
router.get('/barcode/:barcode', waterController.getProductByBarcode);
router.post('/scan', authMiddleware, waterController.scanProduct);
router.get('/scans', authMiddleware, waterController.getUserScans);

module.exports = router;
