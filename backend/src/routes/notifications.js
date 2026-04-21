const express = require('express');
const { query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array(),
    });
  }
  next();
};

// Routes
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('isRead').optional().isBoolean(),
  validateRequest
], catchAsync(notificationController.getNotifications));

router.put('/:notificationId/read', [
  query('notificationId').isUUID().withMessage('Valid notification ID is required'),
  validateRequest
], catchAsync(notificationController.markAsRead));

router.put('/mark-all-read', catchAsync(notificationController.markAllAsRead));

router.delete('/:notificationId', [
  query('notificationId').isUUID().withMessage('Valid notification ID is required'),
  validateRequest
], catchAsync(notificationController.deleteNotification));

router.get('/unread-count', catchAsync(notificationController.getUnreadCount));

module.exports = router;
