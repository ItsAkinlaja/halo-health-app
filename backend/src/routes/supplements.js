const express = require('express');
const router = express.Router();
const supplementController = require('../controllers/supplementController');
const { authMiddleware } = require('../middleware/auth');

router.get('/search', supplementController.searchSupplements);
router.get('/top-rated', supplementController.getTopRated);
router.get('/barcode/:barcode', supplementController.getSupplementByBarcode);
router.post('/scan', authMiddleware, supplementController.scanSupplement);
router.get('/my-supplements', authMiddleware, supplementController.getUserSupplements);
router.post('/my-supplements', authMiddleware, supplementController.addUserSupplement);
router.delete('/my-supplements/:supplementId', authMiddleware, supplementController.removeUserSupplement);

module.exports = router;
