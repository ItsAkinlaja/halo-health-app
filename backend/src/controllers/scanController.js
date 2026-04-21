const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const scanService = require('../services/scanService');
const { logger } = require('../utils/logger');

class ScanController {
  async scanByBarcode(req, res, next) {
    try {
      const { barcode, profileId } = req.body;
      const userId = req.user.id;

      // Validate that the profile belongs to the user
      const { data: profile, error: profileError } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new ValidationError('Invalid profile ID');
      }

      // Perform the scan
      const result = await scanService.scanByBarcode(barcode, userId, profileId);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async scanByPhoto(req, res, next) {
    try {
      const { profileId } = req.body;
      const userId = req.user.id;

      // Validate that the profile belongs to the user
      const { data: profile, error: profileError } = await supabase
        .from('health_profiles')
        .select('id')
        .eq('id', profileId)
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new ValidationError('Invalid profile ID');
      }

      // Check if photo was uploaded
      if (!req.file) {
        throw new ValidationError('Photo is required');
      }

      // Perform the scan
      const result = await scanService.scanByPhoto(req.file.buffer, userId, profileId);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getScanHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { profileId, limit = 20, offset = 0, startDate, endDate } = req.query;

      let queryBuilder = supabase
        .from('product_scans')
        .select(`
          id,
          scan_type,
          score_given,
          created_at,
          profile_id,
          products (
            id,
            name,
            brand,
            image_url,
            health_score,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (profileId) queryBuilder = queryBuilder.eq('profile_id', profileId);
      if (startDate) queryBuilder = queryBuilder.gte('created_at', startDate);
      if (endDate) queryBuilder = queryBuilder.lte('created_at', endDate);

      const { data: scans, error } = await queryBuilder;

      if (error) throw new ValidationError(error.message);

      // Flatten product fields onto scan for frontend compatibility
      const normalized = (scans || []).map((s) => ({
        id: s.id,
        product_id: s.products?.id,
        product_name: s.products?.name,
        brand: s.products?.brand,
        category: s.products?.category,
        image_url: s.products?.image_url,
        score: s.score_given,
        scan_type: s.scan_type,
        created_at: s.created_at,
        profile_id: s.profile_id,
      }));

      res.json({ status: 'success', data: normalized });
    } catch (error) {
      next(error);
    }
  }

  async saveProduct(req, res, next) {
    try {
      const { productId, listType = 'clean_choices' } = req.body;
      const userId = req.user.id;

      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        throw new NotFoundError('Product not found');
      }

      // Save product
      await scanService.saveProduct(userId, productId, listType);

      res.json({
        status: 'success',
        message: 'Product saved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async unsaveProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      await scanService.unsaveProduct(userId, productId);

      res.json({
        status: 'success',
        message: 'Product removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getSavedProducts(req, res, next) {
    try {
      const userId = req.user.id;
      const { listType, limit = 50, offset = 0 } = req.query;

      let queryBuilder = supabase
        .from('saved_products')
        .select(`
          id,
          list_type,
          created_at,
          products (
            id,
            name,
            brand,
            image_url,
            health_score,
            category,
            barcode
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (listType) queryBuilder = queryBuilder.eq('list_type', listType);

      const { data: rows, error } = await queryBuilder;

      if (error) throw new ValidationError(error.message);

      // Flatten product fields for frontend compatibility
      const normalized = (rows || []).map((r) => ({
        id: r.products?.id,
        name: r.products?.name,
        brand: r.products?.brand,
        category: r.products?.category,
        image_url: r.products?.image_url,
        score: r.products?.health_score,
        barcode: r.products?.barcode,
        list_type: r.list_type,
        saved_at: r.created_at,
      }));

      res.json({ status: 'success', data: normalized });
    } catch (error) {
      next(error);
    }
  }

  async getScanStats(req, res, next) {
    try {
      const userId = req.user.id;
      const { profileId, period = '30d' } = req.query;

      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      let queryBuilder = supabase
        .from('product_scans')
        .select('score_given, created_at, profile_id')
        .eq('user_id', userId)
        .gte('created_at', since);

      if (profileId) queryBuilder = queryBuilder.eq('profile_id', profileId);

      const { data: scans, error } = await queryBuilder;

      if (error) throw new ValidationError(error.message);

      const total = scans?.length ?? 0;
      const avgScore = total > 0
        ? Math.round(scans.reduce((s, r) => s + (r.score_given || 0), 0) / total)
        : 0;

      // Simple week-over-week trend
      const midpoint = new Date(Date.now() - (days / 2) * 86400000).toISOString();
      const recent = scans.filter((s) => s.created_at >= midpoint);
      const older = scans.filter((s) => s.created_at < midpoint);
      const recentAvg = recent.length > 0 ? recent.reduce((s, r) => s + (r.score_given || 0), 0) / recent.length : 0;
      const olderAvg = older.length > 0 ? older.reduce((s, r) => s + (r.score_given || 0), 0) / older.length : 0;
      const trend = Math.round(recentAvg - olderAvg);

      res.json({
        status: 'success',
        data: { total_scans: total, average_score: avgScore, trend },
      });
    } catch (error) {
      next(error);
    }
  }

  async getScanById(req, res, next) {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const { data: scan, error } = await supabase
        .from('product_scans')
        .select(`*, products (*)`)
        .eq('id', scanId)
        .eq('user_id', userId)
        .single();

      if (error || !scan) throw new NotFoundError('Scan');

      res.json({ status: 'success', data: scan });
    } catch (error) {
      next(error);
    }
  }

  async deleteScan(req, res, next) {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('product_scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', userId);

      if (error) throw new ValidationError(error.message);

      res.json({ status: 'success', message: 'Scan deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScanController();
