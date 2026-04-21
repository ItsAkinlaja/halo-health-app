const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const mealController = require('../controllers/mealController');
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

// Meal plans
router.get('/plans', [
  query('profileId').isUUID().withMessage('Valid profile ID required'),
  validate,
], catchAsync(mealController.getMealPlans));

router.get('/plans/:planId', [
  param('planId').isUUID().withMessage('Valid plan ID required'),
  validate,
], catchAsync(mealController.getMealPlan));

router.post('/plans', [
  body('profileId').isUUID().withMessage('Valid profile ID required'),
  body('planName').trim().notEmpty().withMessage('Plan name required'),
  body('durationDays').isInt({ min: 1, max: 30 }).withMessage('Duration must be 1-30 days'),
  validate,
], catchAsync(mealController.createMealPlan));

router.put('/plans/:planId', [
  param('planId').isUUID().withMessage('Valid plan ID required'),
  validate,
], catchAsync(mealController.updateMealPlan));

router.delete('/plans/:planId', [
  param('planId').isUUID().withMessage('Valid plan ID required'),
  validate,
], catchAsync(mealController.deleteMealPlan));

// Shopping list
router.post('/plans/:planId/shopping-list', [
  param('planId').isUUID().withMessage('Valid plan ID required'),
  validate,
], catchAsync(mealController.createShoppingList));

router.get('/shopping-lists', [
  query('profileId').optional().isUUID().withMessage('Valid profile ID required'),
  validate,
], catchAsync(mealController.getShoppingLists));

// Generate meal plan
router.post('/generate', [
  body('profileId').isUUID().withMessage('Valid profile ID required'),
  validate,
], catchAsync(mealController.generateMealPlan));

// Nutrition summary (MUST be before /:mealId)
router.get('/nutrition-summary', [
  query('profileId').notEmpty().withMessage('Profile ID required'),
  query('startDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid start date required (YYYY-MM-DD)'),
  query('endDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid end date required (YYYY-MM-DD)'),
  validate,
], catchAsync(mealController.getNutritionSummary));

// Meal suggestions (MUST be before /:mealId)
router.get('/suggestions', [
  query('profileId').isUUID().withMessage('Valid profile ID required'),
  query('mealType').notEmpty().withMessage('Meal type required'),
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date required (YYYY-MM-DD)'),
  validate,
], catchAsync(mealController.getMealSuggestions));

// Recipes (MUST be before /:mealId)
router.get('/recipes/search', [
  query('q').trim().notEmpty().withMessage('Search query required'),
  validate,
], catchAsync(mealController.searchRecipes));

router.get('/recipes/:recipeId', [
  param('recipeId').isUUID().withMessage('Valid recipe ID required'),
  validate,
], catchAsync(mealController.getRecipe));

// Log meal (MUST be before /:mealId)
router.post('/log', [
  body('mealId').isUUID().withMessage('Valid meal ID required'),
  validate,
], catchAsync(mealController.logMeal));

// Meals by date (MUST be before /:mealId)
router.get('/', [
  query('profileId').notEmpty().withMessage('Profile ID required'),
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date required (YYYY-MM-DD)'),
  validate,
], catchAsync(mealController.getMealsByDate));

// Single meal (MUST be last among GET routes)
router.get('/:mealId', [
  param('mealId').isUUID().withMessage('Valid meal ID required'),
  validate,
], catchAsync(mealController.getMeal));

router.put('/:mealId', [
  param('mealId').isUUID().withMessage('Valid meal ID required'),
  validate,
], catchAsync(mealController.updateMeal));

router.delete('/:mealId', [
  param('mealId').isUUID().withMessage('Valid meal ID required'),
  validate,
], catchAsync(mealController.deleteMeal));

module.exports = router;
