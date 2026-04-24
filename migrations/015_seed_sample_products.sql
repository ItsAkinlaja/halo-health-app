-- Sample Products for Testing
-- This file contains sample product data for development and testing
-- Uses ON CONFLICT to update existing products instead of creating duplicates

-- Sample Product 1: Organic Almond Milk
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active, image_url
) VALUES (
  '012345678901',
  'Organic Unsweetened Almond Milk',
  'Almond Breeze',
  'beverages',
  'plant-based-milk',
  ARRAY['Filtered Water', 'Almonds', 'Sea Salt', 'Sunflower Lecithin', 'Natural Flavors', 'Calcium Carbonate', 'Vitamin E', 'Vitamin D2'],
  '{"serving_size": "240ml", "energy_kcal": 30, "fat": 2.5, "saturated_fat": 0, "carbohydrates": 1, "sugars": 0, "fiber": 1, "proteins": 1, "salt": 0.17, "sodium": 170}'::jsonb,
  ARRAY['tree nuts (almonds)'],
  ARRAY[]::text[],
  85,
  'processed',
  true,
  true,
  'https://images.openfoodfacts.org/images/products/012/345/678/901/front_en.jpg'
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Sample Product 2: Whole Wheat Bread
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678902',
  '100% Whole Wheat Bread',
  'Nature''s Own',
  'bakery',
  'bread',
  ARRAY['Whole Wheat Flour', 'Water', 'Honey', 'Wheat Gluten', 'Yeast', 'Sea Salt', 'Cultured Wheat Flour'],
  '{"serving_size": "43g", "energy_kcal": 110, "fat": 1.5, "saturated_fat": 0, "carbohydrates": 20, "sugars": 4, "fiber": 3, "proteins": 5, "salt": 0.35, "sodium": 140}'::jsonb,
  ARRAY['wheat', 'gluten'],
  ARRAY[]::text[],
  78,
  'processed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 3: Greek Yogurt
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678903',
  'Plain Greek Yogurt',
  'Fage',
  'dairy',
  'yogurt',
  ARRAY['Grade A Pasteurized Milk', 'Live Active Yogurt Cultures'],
  '{"serving_size": "170g", "energy_kcal": 100, "fat": 0, "saturated_fat": 0, "carbohydrates": 7, "sugars": 7, "fiber": 0, "proteins": 18, "salt": 0.15, "sodium": 60}'::jsonb,
  ARRAY['milk'],
  ARRAY[]::text[],
  90,
  'processed_culinary',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 4: Potato Chips (Ultra-processed)
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678904',
  'Classic Potato Chips',
  'Lay''s',
  'snacks',
  'chips',
  ARRAY['Potatoes', 'Vegetable Oil (Sunflower, Corn, and/or Canola Oil)', 'Salt', 'Dextrose', 'Natural Flavors', 'Maltodextrin', 'Monosodium Glutamate', 'Artificial Colors (Yellow 5, Yellow 6)'],
  '{"serving_size": "28g", "energy_kcal": 160, "fat": 10, "saturated_fat": 1.5, "carbohydrates": 15, "sugars": 1, "fiber": 1, "proteins": 2, "salt": 0.43, "sodium": 170}'::jsonb,
  ARRAY[]::text[],
  ARRAY['monosodium glutamate', 'yellow 5', 'yellow 6'],
  35,
  'ultra_processed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 5: Organic Quinoa
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678905',
  'Organic White Quinoa',
  'Bob''s Red Mill',
  'grains',
  'quinoa',
  ARRAY['Organic Quinoa'],
  '{"serving_size": "45g", "energy_kcal": 170, "fat": 2.5, "saturated_fat": 0, "carbohydrates": 30, "sugars": 0, "fiber": 3, "proteins": 6, "salt": 0, "sodium": 5}'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  95,
  'unprocessed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 6: Energy Drink (High toxins)
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678906',
  'Energy Drink Original',
  'Red Bull',
  'beverages',
  'energy-drinks',
  ARRAY['Carbonated Water', 'Sucrose', 'Glucose', 'Citric Acid', 'Taurine', 'Sodium Bicarbonate', 'Magnesium Carbonate', 'Caffeine', 'Niacinamide', 'Calcium Pantothenate', 'Pyridoxine HCl', 'Vitamin B12', 'Natural and Artificial Flavors', 'Colors (Caramel Color)'],
  '{"serving_size": "250ml", "energy_kcal": 110, "fat": 0, "saturated_fat": 0, "carbohydrates": 28, "sugars": 27, "fiber": 0, "proteins": 1, "salt": 0.25, "sodium": 100}'::jsonb,
  ARRAY[]::text[],
  ARRAY['high fructose corn syrup', 'artificial flavors', 'caramel color'],
  25,
  'ultra_processed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 7: Organic Avocado Oil
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678907',
  'Extra Virgin Avocado Oil',
  'Chosen Foods',
  'condiments',
  'oils',
  ARRAY['100% Pure Avocado Oil'],
  '{"serving_size": "14g", "energy_kcal": 120, "fat": 14, "saturated_fat": 2, "carbohydrates": 0, "sugars": 0, "fiber": 0, "proteins": 0, "salt": 0, "sodium": 0}'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  92,
  'processed_culinary',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 8: Frozen Pizza (Processed)
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678908',
  'Pepperoni Pizza',
  'DiGiorno',
  'frozen',
  'pizza',
  ARRAY['Enriched Flour', 'Water', 'Low-Moisture Part-Skim Mozzarella Cheese', 'Pepperoni', 'Tomato Paste', 'Soybean Oil', 'Contains 2% or Less of: Salt', 'Sugar', 'Yeast', 'Modified Food Starch', 'Spices', 'Garlic Powder', 'Sodium Benzoate', 'BHT'],
  '{"serving_size": "140g", "energy_kcal": 320, "fat": 13, "saturated_fat": 6, "carbohydrates": 38, "sugars": 7, "fiber": 2, "proteins": 13, "salt": 1.8, "sodium": 720}'::jsonb,
  ARRAY['wheat', 'milk', 'soy'],
  ARRAY['sodium benzoate', 'bht'],
  42,
  'ultra_processed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 9: Organic Honey
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678909',
  'Raw Organic Honey',
  'Nature Nate''s',
  'condiments',
  'sweeteners',
  ARRAY['100% Pure Raw & Unfiltered Honey'],
  '{"serving_size": "21g", "energy_kcal": 60, "fat": 0, "saturated_fat": 0, "carbohydrates": 17, "sugars": 16, "fiber": 0, "proteins": 0, "salt": 0, "sodium": 0}'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  88,
  'unprocessed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Sample Product 10: Protein Bar
INSERT INTO products (
  barcode, name, brand, category, subcategory,
  ingredients, nutrition_info, allergens_present, toxins_detected,
  health_score, processing_level, is_lab_verified, is_active
) VALUES (
  '012345678910',
  'Chocolate Chip Protein Bar',
  'RXBAR',
  'snacks',
  'protein-bars',
  ARRAY['Dates', 'Egg Whites', 'Almonds', 'Cashews', 'Chocolate', 'Cocoa', 'Natural Flavors', 'Sea Salt'],
  '{"serving_size": "52g", "energy_kcal": 210, "fat": 9, "saturated_fat": 2, "carbohydrates": 23, "sugars": 15, "fiber": 5, "proteins": 12, "salt": 0.38, "sodium": 150}'::jsonb,
  ARRAY['eggs', 'tree nuts (almonds, cashews)'],
  ARRAY[]::text[],
  75,
  'processed',
  true,
  true
)
ON CONFLICT (barcode) 
DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  ingredients = EXCLUDED.ingredients,
  nutrition_info = EXCLUDED.nutrition_info,
  allergens_present = EXCLUDED.allergens_present,
  toxins_detected = EXCLUDED.toxins_detected,
  health_score = EXCLUDED.health_score,
  processing_level = EXCLUDED.processing_level,
  is_lab_verified = EXCLUDED.is_lab_verified,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Enable trigram extension for better text search (must be done before creating indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops);
