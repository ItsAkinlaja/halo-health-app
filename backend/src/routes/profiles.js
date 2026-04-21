const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const profileController = require('../controllers/profileController');
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

// User profile (primary)
router.get('/user/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID format'),
  validate,
], catchAsync(profileController.getUserProfile));

router.put('/user/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID format'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('phone').optional().trim().matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Invalid phone format'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender value'),
  body('height').optional().isFloat({ min: 50, max: 300 }).withMessage('Height must be between 50-300 cm'),
  body('weight').optional().isFloat({ min: 2, max: 500 }).withMessage('Weight must be between 2-500 kg'),
  body('blood_type').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  validate,
], catchAsync(profileController.updateUserProfile));

// Family profiles list + create
router.get('/', [
  query('userId').optional().isUUID().withMessage('Invalid user ID format'),
  validate,
], catchAsync(profileController.getProfiles));

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('relationship').optional().isIn(['self', 'spouse', 'child', 'parent', 'sibling', 'other']).withMessage('Invalid relationship'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be 0-150'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be boolean'),
  body('health_goals').optional().isArray().withMessage('health_goals must be an array'),
  body('dietary_restrictions').optional().isArray().withMessage('dietary_restrictions must be an array'),
  body('allergies').optional().isArray().withMessage('allergies must be an array'),
  body('health_conditions').optional().isArray().withMessage('health_conditions must be an array'),
  validate,
], catchAsync(profileController.createProfile));

// Single profile CRUD
router.put('/:profileId', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('relationship').optional().isIn(['self', 'spouse', 'child', 'parent', 'sibling', 'other']).withMessage('Invalid relationship'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be 0-150'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('health_goals').optional().isArray().withMessage('health_goals must be an array'),
  validate,
], catchAsync(profileController.updateProfile));

router.delete('/:profileId', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  validate,
], catchAsync(profileController.deleteProfile));

// Sub-resources
router.get('/:profileId/health-score', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  validate,
], catchAsync(profileController.getHealthScore));

router.get('/:profileId/dietary-restrictions', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  validate,
], catchAsync(profileController.getDietaryRestrictions));

router.put('/:profileId/dietary-restrictions', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  body('restrictions').isArray().withMessage('restrictions must be an array'),
  body('restrictions.*').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Each restriction must be 1-50 characters'),
  validate,
], catchAsync(profileController.updateDietaryRestrictions));

router.get('/:profileId/allergies', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  validate,
], catchAsync(profileController.getAllergies));

router.put('/:profileId/allergies', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  body('allergies').isArray().withMessage('allergies must be an array'),
  body('allergies.*').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Each allergy must be 1-50 characters'),
  validate,
], catchAsync(profileController.updateAllergies));

router.get('/:profileId/health-conditions', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  validate,
], catchAsync(profileController.getHealthConditions));

router.put('/:profileId/health-conditions', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  body('conditions').isArray().withMessage('conditions must be an array'),
  body('conditions.*').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Each condition must be 1-100 characters'),
  validate,
], catchAsync(profileController.updateHealthConditions));

router.get('/:profileId/analytics', [
  param('profileId').isUUID().withMessage('Invalid profile ID format'),
  query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Period must be 7d, 30d, or 90d'),
  validate,
], catchAsync(profileController.getAnalytics));

module.exports = router;
