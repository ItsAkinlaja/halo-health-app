const express = require('express');
const router = express.Router();
const pantryController = require('../controllers/pantryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, pantryController.getPantry);
router.post('/', protect, pantryController.addPantryItem);
router.delete('/:id', protect, pantryController.removePantryItem);

module.exports = router;
