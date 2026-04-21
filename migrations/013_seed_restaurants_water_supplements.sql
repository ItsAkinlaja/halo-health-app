-- Seed Restaurants
INSERT INTO restaurants (name, address, latitude, longitude, phone, cuisine_type, price_range, rating, seed_oil_free, organic, gluten_free, vegan_options, verified) VALUES
('The Clean Kitchen', '123 Health St, San Francisco, CA', 37.7749, -122.4194, '(415) 555-0100', 'American', '$$', 4.8, true, true, true, true, true),
('Pure Plate Bistro', '456 Wellness Ave, San Francisco, CA', 37.7849, -122.4094, '(415) 555-0101', 'Mediterranean', '$$$', 4.6, true, false, true, true, true),
('Organic Harvest', '789 Green Blvd, San Francisco, CA', 37.7649, -122.4294, '(415) 555-0102', 'Farm-to-Table', '$$', 4.7, true, true, true, false, true),
('Vital Eats', '321 Nutrition Way, San Francisco, CA', 37.7949, -122.3994, '(415) 555-0103', 'Health Food', '$', 4.5, true, false, true, true, true),
('Nourish Cafe', '654 Vitality Ln, San Francisco, CA', 37.7549, -122.4394, '(415) 555-0104', 'Cafe', '$$', 4.9, true, true, false, true, true);

-- Seed Water Products
INSERT INTO water_products (name, brand, category, barcode, score, purity_score, contaminants, microplastics, pfas, minerals, ph_level, certified, lab_tested) VALUES
('Mountain Spring Natural', 'Pure Source', 'bottled', '012345678901', 95, 98, 'None detected', 'Below detection limit', 'Not detected', 'High', 7.4, true, true),
('Alpine Pure Water', 'Crystal Springs', 'bottled', '012345678902', 92, 95, 'None detected', 'Below detection limit', 'Not detected', 'Medium', 7.2, true, true),
('Glacier Fresh', 'Nature''s Best', 'bottled', '012345678903', 88, 90, 'Trace amounts', 'Low', 'Not detected', 'High', 7.6, false, true),
('ProFilter Max', 'AquaTech', 'filters', '012345678904', 92, 94, NULL, NULL, NULL, NULL, NULL, true, true),
('UltraClean Filter', 'PureWater Systems', 'filters', '012345678905', 90, 92, NULL, NULL, NULL, NULL, NULL, true, true),
('HomePure Purifier', 'CleanH2O', 'purifiers', '012345678906', 96, 98, NULL, NULL, NULL, NULL, NULL, true, true);

UPDATE water_products SET 
  removal_rate = '99.9%',
  contaminants_removed = ARRAY['Lead', 'Chlorine', 'PFAS', 'Microplastics', 'Heavy Metals']
WHERE category IN ('filters', 'purifiers');

-- Seed Supplements
INSERT INTO supplements (name, brand, category, barcode, score, purity_score, heavy_metals, fillers, third_party_tested, certifications, serving_size, servings_per_container) VALUES
('Whey Protein Isolate', 'Pure Performance', 'protein', '123456789001', 92, 95, 'Not detected', 'None', true, ARRAY['NSF Certified', 'Informed Sport'], '30g', 30),
('Vitamin D3 5000 IU', 'Essential Health', 'vitamins', '123456789002', 88, 90, 'Below threshold', 'Minimal', true, ARRAY['USP Verified'], '1 capsule', 120),
('Omega-3 Fish Oil', 'Nordic Pure', 'omega3', '123456789003', 94, 96, 'Not detected', 'None', true, ARRAY['IFOS 5-Star', 'NSF Certified'], '2 softgels', 60),
('Magnesium Glycinate', 'Vital Minerals', 'minerals', '123456789004', 90, 93, 'Not detected', 'None', true, ARRAY['USP Verified'], '2 capsules', 90),
('Pre-Workout Elite', 'Performance Labs', 'preworkout', '123456789005', 85, 87, 'Below threshold', 'Minimal', true, ARRAY['Informed Choice'], '1 scoop', 30),
('Multivitamin Complete', 'Daily Essentials', 'vitamins', '123456789006', 87, 89, 'Not detected', 'Minimal', true, ARRAY['USP Verified'], '2 tablets', 60);
