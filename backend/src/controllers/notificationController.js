const { supabase } = require('../utils/database');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0, isRead } = req.query;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (isRead !== undefined) {
        query = query.eq('is_read', isRead === 'true');
      }

      const { data: notifications, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: {
          notifications,
          total: notifications.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      // Check if notification belongs to user
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .select('id')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();

      if (notificationError || !notification) {
        throw new NotFoundError('Notification not found');
      }

      // Mark as read
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Notification marked as read',
        data: { notification: data },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: `Marked ${data.length} notifications as read`,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      // Check if notification belongs to user
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .select('id')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();

      if (notificationError || !notification) {
        throw new NotFoundError('Notification not found');
      }

      // Delete notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw new ValidationError(error.message);
      }

      res.json({
        status: 'success',
        data: { unreadCount: data.length },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
