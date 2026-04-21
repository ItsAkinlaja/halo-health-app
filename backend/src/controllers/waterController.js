const waterService = require('../services/waterService');

class WaterController {
  async searchProducts(req, res, next) {
    try {
      const { category = 'all', query = '' } = req.query;
      const products = await waterService.searchProducts(category, query);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getProductByBarcode(req, res, next) {
    try {
      const { barcode } = req.params;
      const product = await waterService.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ error: 'Water product not found' });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async scanProduct(req, res, next) {
    try {
      const { barcode } = req.body;
      const userId = req.user.id;

      const product = await waterService.scanWaterProduct(userId, barcode);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const { category = 'all', limit = 10 } = req.query;
      const products = await waterService.getTopRated(category, parseInt(limit));
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getUserScans(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;
      const scans = await waterService.getUserScans(userId, parseInt(limit));
      res.json(scans);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WaterController();
