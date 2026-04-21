const express = require('express');
const router = express.Router();
const shoppingListService = require('../services/shoppingListService');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const list = await shoppingListService.createList(req.user.id, req.body);
    res.json(list);
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const lists = await shoppingListService.getUserLists(req.user.id);
    res.json(lists);
  } catch (error) {
    next(error);
  }
});

router.get('/:listId/items', authMiddleware, async (req, res, next) => {
  try {
    const items = await shoppingListService.getListItems(req.params.listId, req.user.id);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/:listId/items', authMiddleware, async (req, res, next) => {
  try {
    const { productId, quantity, notes } = req.body;
    const item = await shoppingListService.addItem(
      req.params.listId,
      req.user.id,
      productId,
      quantity,
      notes
    );
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:itemId', authMiddleware, async (req, res, next) => {
  try {
    await shoppingListService.removeItem(req.params.itemId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.patch('/items/:itemId/toggle', authMiddleware, async (req, res, next) => {
  try {
    const item = await shoppingListService.toggleItem(req.params.itemId, req.user.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:listId', authMiddleware, async (req, res, next) => {
  try {
    await shoppingListService.deleteList(req.params.listId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-from-meal-plan/:mealPlanId', authMiddleware, async (req, res, next) => {
  try {
    const list = await shoppingListService.generateFromMealPlan(req.user.id, req.params.mealPlanId);
    res.json(list);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
