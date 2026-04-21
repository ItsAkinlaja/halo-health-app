const supplementService = require('../services/supplementService');

class SupplementController {
  async searchSupplements(req, res, next) {
    try {
      const { category = 'all', query = '' } = req.query;
      const supplements = await supplementService.searchSupplements(category, query);
      res.json(supplements);
    } catch (error) {
      next(error);
    }
  }

  async getSupplementByBarcode(req, res, next) {
    try {
      const { barcode } = req.params;
      const supplement = await supplementService.getSupplementByBarcode(barcode);
      
      if (!supplement) {
        return res.status(404).json({ error: 'Supplement not found' });
      }
      
      res.json(supplement);
    } catch (error) {
      next(error);
    }
  }

  async scanSupplement(req, res, next) {
    try {
      const { barcode } = req.body;
      const userId = req.user.id;

      const supplement = await supplementService.scanSupplement(userId, barcode);
      res.json(supplement);
    } catch (error) {
      next(error);
    }
  }

  async getUserSupplements(req, res, next) {
    try {
      const userId = req.user.id;
      const supplements = await supplementService.getUserSupplements(userId);
      res.json(supplements);
    } catch (error) {
      next(error);
    }
  }

  async addUserSupplement(req, res, next) {
    try {
      const userId = req.user.id;
      const { supplementId, dosage, frequency, notes } = req.body;

      const userSupplement = await supplementService.addUserSupplement(userId, supplementId, {
        dosage,
        frequency,
        notes
      });

      res.json(userSupplement);
    } catch (error) {
      next(error);
    }
  }

  async removeUserSupplement(req, res, next) {
    try {
      const userId = req.user.id;
      const { supplementId } = req.params;

      await supplementService.removeUserSupplement(userId, supplementId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const { category = 'all', limit = 10 } = req.query;
      const supplements = await supplementService.getTopRated(category, parseInt(limit));
      res.json(supplements);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupplementController();
