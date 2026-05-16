const express = require('express');
const router = express.Router();
const pantryController = require('../controllers/pantryController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, pantryController.getPantry);
router.post('/', authMiddleware, pantryController.addPantryItem);
router.delete('/:id', authMiddleware, pantryController.removePantryItem);

module.exports = router;
