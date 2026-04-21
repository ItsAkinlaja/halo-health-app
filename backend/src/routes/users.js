const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authMiddleware);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

// Get user account information
router.get('/account', catchAsync(userController.getUserAccount));

// Export all user data (GDPR/CCPA compliance)
router.get('/export', catchAsync(userController.exportUserData));

// Request data export via email
router.post('/export/request', catchAsync(userController.requestDataExport));

// Delete user scan data (keep account)
router.delete('/data', catchAsync(userController.deleteUserData));

// Delete user account and all data (GDPR/CCPA compliance)
router.delete('/account', [
  body('confirmation')
    .equals('DELETE_MY_ACCOUNT')
    .withMessage('Confirmation must be "DELETE_MY_ACCOUNT"'),
  validate,
], catchAsync(userController.deleteUserAccount));

// Update user preferences
router.put('/preferences', [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  validate,
], catchAsync(userController.updateUserPreferences));

module.exports = router;
