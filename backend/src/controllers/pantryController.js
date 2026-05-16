// Mock in-memory store for now
let pantryItems = [
  { id: '1', name: 'Almond Milk', category: 'Dairy Alternatives', expiryDate: '2026-06-01', barcode: '123456789' },
  { id: '2', name: 'Organic Oats', category: 'Grains', expiryDate: '2026-12-01', barcode: '987654321' }
];

exports.getPantry = async (req, res, next) => {
  try {
    // In a real app, filter by req.user.id
    res.json({
      success: true,
      data: pantryItems
    });
  } catch (error) {
    next(error);
  }
};

exports.addPantryItem = async (req, res, next) => {
  try {
    const { name, category, expiryDate, barcode } = req.body;
    const newItem = {
      id: Date.now().toString(),
      name,
      category: category || 'Other',
      expiryDate,
      barcode
    };
    pantryItems.push(newItem);
    
    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

exports.removePantryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    pantryItems = pantryItems.filter(item => item.id !== id);
    
    res.json({
      success: true,
      message: 'Item removed from pantry'
    });
  } catch (error) {
    next(error);
  }
};
