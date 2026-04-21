-- Seed Data for Halo Health Application
-- This file contains initial data for testing and development

-- Insert sample users (for development only)
INSERT INTO users (id, email, halo_health_id, username, bio) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'johndoe', 'John Doe', 'Health enthusiast and clean living advocate'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'janesmith', 'Jane Smith', 'Nutritionist and wellness coach'),
('550e8400-e29b-41d4-a716-446655440003', 'mike.johnson@example.com', 'mikej', 'Mike Johnson', 'Fitness trainer and meal prep expert');

-- Insert sample health profiles
INSERT INTO health_profiles (id, user_id, name, relationship, age_group, gender, health_goals) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'self', '30-39', 'male', ARRAY['weight_loss', 'muscle_gain', 'clean_eating']),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Doe', 'spouse', '30-39', 'female', ARRAY['weight_loss', 'hormonal_balance']),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Emma Doe', 'child', '5-9', 'female', ARRAY['healthy_growth', 'allergy_management']),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'self', '40-49', 'female', ARRAY['energy_boost', 'anti_aging', 'gut_health']);

-- Insert sample dietary restrictions
INSERT INTO dietary_restrictions (profile_id, restriction_type, severity) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'gluten_free', 'strict'),
('660e8400-e29b-41d4-a716-446655440002', 'dairy_free', 'moderate'),
('660e8400-e29b-41d4-a716-446655440003', 'nut_free', 'strict');

-- Insert sample allergies
INSERT INTO allergies_intolerances (profile_id, allergy_type, severity, reaction_description) VALUES
('660e8400-e29b-41d4-a716-446655440003', 'peanut_allergy', 'severe', 'Anaphylactic reaction, requires immediate medical attention'),
('660e8400-e29b-41d4-a716-446655440002', 'lactose_intolerance', 'mild', 'Digestive discomfort, bloating'),
('660e8400-e29b-41d4-a716-446655440001', 'shellfish_allergy', 'moderate', 'Hives and swelling');

-- Insert sample ingredient preferences
INSERT INTO ingredient_preferences (profile_id, ingredient_name, preference) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'sugar', 'avoid'),
('660e8400-e29b-41d4-a716-446655440001', 'quinoa', 'can_eat'),
('660e8400-e29b-41d4-a716-446655440002', 'processed_meats', 'avoid'),
('660e8400-e29b-41d4-a716-446655440002', 'kale', 'can_eat');

-- Insert sample health concerns
INSERT INTO health_concerns (profile_id, concern_type, priority, notes) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'high_blood_pressure', 'high', 'Family history, needs monitoring'),
('660e8400-e29b-41d4-a716-446655440002', 'gut_health', 'medium', 'Occasional digestive issues'),
('660e8400-e29b-41d4-a716-446655440003', 'eczema', 'low', 'Mild skin irritation, diet-related');

-- Insert sample products
INSERT INTO products (id, barcode, name, brand, category, ingredients, health_score, processing_level, is_lab_verified) VALUES
('770e8400-e29b-41d4-a716-446655440001', '012345678901', 'Organic Quinoa', 'Nature''s Best', 'food', ARRAY['organic quinoa'], 95, 'low', true),
('770e8400-e29b-41d4-a716-446655440002', '012345678902', 'Whole Grain Bread', 'Artisan Bakery', 'food', ARRAY['whole wheat flour', 'water', 'yeast', 'salt'], 85, 'medium', true),
('770e8400-e29b-41d4-a716-446655440003', '012345678903', 'Protein Bar', 'FitFuel', 'food', ARRAY['whey protein', 'sugar', 'corn syrup', 'artificial flavors'], 45, 'high', false),
('770e8400-e29b-41d4-a716-446655440004', '012345678904', 'Organic Spinach', 'Fresh Farms', 'food', ARRAY['organic spinach'], 98, 'low', true),
('770e8400-e29b-41d4-a716-446655440005', '012345678905', 'Natural Shampoo', 'Clean Beauty', 'personal_care', ARRAY['water', 'sodium laureth sulfate', 'coconut oil', 'essential oils'], 75, 'medium', true),
('770e8400-e29b-41d4-a716-446655440006', '012345678906', 'All-Purpose Cleaner', 'EcoClean', 'household', ARRAY['water', 'citric acid', 'essential oils'], 88, 'low', true);

-- Insert sample product scans
INSERT INTO product_scans (user_id, profile_id, product_id, scan_type, score_given, halo_analysis) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'barcode', 92, 'Excellent choice! Organic quinoa is a complete protein with all essential amino acids. Perfect for your gluten-free diet and muscle building goals.'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'barcode', 78, 'Good whole grain option, but contains gluten which may not be ideal for your dietary restriction. Consider gluten-free alternatives.'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'photo', 95, 'Perfect for your gut health goals! Organic spinach is rich in iron, vitamins A, C, and K, and contains beneficial fiber.');

-- Insert sample saved products
INSERT INTO saved_products (user_id, product_id, list_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'clean_choices'),
('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 'clean_choices'),
('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', 'clean_choices'),
('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'avoid');

-- Insert sample health scores
INSERT INTO health_scores (user_id, profile_id, overall_score, nutrition_score, safety_score, lifestyle_score) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 85, 88, 82, 84),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 92, 95, 90, 91),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 78, 80, 75, 79),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 88, 90, 85, 89);

-- Insert sample user settings
INSERT INTO user_settings (user_id, voice_preference, notification_tone, audio_enabled, dark_mode, notification_preferences, meal_plan_preferences, privacy_settings) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'calm_clear_female', 'motivational_inspirational', true, false, 
 '{"recall_alerts": true, "new_lab_results": true, "clean_swaps": true, "daily_tips": true, "streak_risk": true, "meal_reminders": true, "expiry_alerts": true}',
 '{"cuisine_preferences": ["mediterranean", "asian"], "cooking_time_limit": 45, "budget_weekly": 150, "dietary_goals": ["weight_loss", "muscle_gain"]}',
 '{"public_profile": true, "share_health_score": false, "share_scan_history": false}'),
('550e8400-e29b-41d4-a716-446655440002', 'confident_authoritative_male', 'educational_informative', true, false,
 '{"recall_alerts": true, "new_lab_results": true, "clean_swaps": false, "daily_tips": true, "streak_risk": false, "meal_reminders": true, "expiry_alerts": true}',
 '{"cuisine_preferences": ["plant_based", "whole_foods"], "cooking_time_limit": 30, "budget_weekly": 120, "dietary_goals": ["gut_health", "energy_boost"]}',
 '{"public_profile": true, "share_health_score": true, "share_scan_history": true}');

-- Insert sample communities
INSERT INTO communities (id, name, description, category, is_private, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Clean Living Enthusiasts', 'A community for people passionate about clean eating and healthy living', 'lifestyle', false, '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440002', 'Gluten-Free Warriors', 'Support and recipes for gluten-free living', 'dietary', false, '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440003', 'Family Health Journey', 'Private group for families on their health journey together', 'family', true, '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample community members
INSERT INTO community_members (community_id, user_id, role) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'member'),
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'admin'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'member');

-- Insert sample challenges
INSERT INTO challenges (id, title, description, challenge_type, duration_days, difficulty_level, reward_points, start_date, end_date, is_active) VALUES
('990e8400-e29b-41d4-a716-446655440001', '30-Day Clean Eating Challenge', 'Transform your diet with 30 days of clean, whole foods', 'clean_living', 30, 'medium', 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('990e8400-e29b-41d4-a716-446655440002', '7-Day Meal Prep Marathon', 'Prepare all your meals for a full week', 'meal_planning', 7, 'easy', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
('990e8400-e29b-41d4-a716-446655440003', 'Scanner Streak Challenge', 'Scan at least one product every day for 21 days', 'scanning', 21, 'hard', 300, CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', true);

-- Insert sample user challenges
INSERT INTO user_challenges (user_id, challenge_id, status, progress_percentage, started_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'active', 35, CURRENT_DATE - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'completed', 100, CURRENT_DATE - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'active', 15, CURRENT_DATE - INTERVAL '3 days');

-- Insert sample social posts
INSERT INTO social_posts (user_id, content, image_urls, tags, likes_count, comments_count, shares_count, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Just discovered this amazing organic quinoa! Perfect for meal prep this week. What are your favorite clean eating discoveries?', ARRAY['https://example.com/quinoa.jpg'], ARRAY['clean_eating', 'meal_prep', 'organic'], 12, 3, 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Day 5 of the 30-day clean eating challenge and I feel amazing! More energy and clearer skin. Who''s with me?', ARRAY['https://example.com/progress.jpg'], ARRAY['challenge', 'clean_eating', 'transformation'], 25, 8, 4, true),
('550e8400-e29b-41d4-a716-446655440001', 'Found this great gluten-free bread that actually tastes good! Finally a win for the texture department.', ARRAY['https://example.com/bread.jpg'], ARRAY['gluten_free', 'product_review'], 8, 2, 0, true);

-- Insert sample news feed items
INSERT INTO news_feed (id, title, content, summary, author, source, category, tags, image_url, published_at) VALUES
('111e8400-e29b-41d4-a716-446655440001', 'New Study Reveals Benefits of Organic Food', 'A comprehensive study published in the Journal of Nutrition found that organic foods contain significantly higher levels of antioxidants and lower levels of pesticide residues compared to conventionally grown foods.', 'Recent research confirms what health advocates have been saying for years - organic food offers superior nutritional benefits.', 'Dr. Sarah Johnson', 'Journal of Nutrition', 'research', ARRAY['organic', 'nutrition', 'study', 'antioxidants'], 'https://example.com/organic-study.jpg', CURRENT_DATE - INTERVAL '2 days'),
('111e8400-e29b-41d4-a716-446655440002', 'Top 10 Superfoods for 2024', 'Nutritionists reveal the must-have superfoods that should be in every health-conscious consumer''s pantry this year.', 'From ancient grains to exotic berries, discover the nutrient powerhouses that are trending in wellness circles.', 'Nutrition Today', 'Wellness Magazine', 'trends', ARRAY['superfoods', 'nutrition', 'trends', 'wellness'], 'https://example.com/superfoods.jpg', CURRENT_DATE - INTERVAL '5 days'),
('111e8400-e29b-41d4-a716-446655440003', 'Understanding Food Labels: A Complete Guide', 'Learn how to read and understand food labels to make healthier choices at the grocery store.', 'Decode the confusing world of nutrition labels, ingredients lists, and health claims to become a more informed consumer.', 'Food Safety Institute', 'Food Safety', 'education', ARRAY['food_labels', 'nutrition', 'education', 'shopping'], 'https://example.com/labels.jpg', CURRENT_DATE - INTERVAL '1 week');

-- Insert sample restaurants
INSERT INTO restaurants (id, name, address, city, state, postal_code, latitude, longitude, phone, cuisine_types, price_range, rating, seed_oil_free, gluten_free_options, vegan_options) VALUES
('222e8400-e29b-41d4-a716-446655440001', 'Green Garden Cafe', '123 Health Street', 'Wellness City', 'CA', '90210', 34.0522, -118.2437, '(555) 123-4567', ARRAY['vegetarian', 'vegan', 'organic'], '$$', 4.5, true, true, true),
('222e8400-e29b-41d4-a716-446655440002', 'Fresh Kitchen', '456 Nutrition Ave', 'Health Town', 'NY', '10001', 40.7128, -74.0060, '(555) 234-5678', ARRAY['american', 'farm_to_table', 'organic'], '$$$', 4.2, true, true, false),
('222e8400-e29b-41d4-a716-446655440003', 'Pure Eats', '789 Wellness Blvd', 'Clean Living City', 'TX', '75001', 32.7767, -96.7970, '(555) 345-6789', ARRAY['paleo', 'keto', 'gluten_free'], '$$', 4.7, true, true, true);

-- Update community member counts
UPDATE communities SET member_count = 2 WHERE id = '880e8400-e29b-41d4-a716-446655440001';
UPDATE communities SET member_count = 1 WHERE id = '880e8400-e29b-41d4-a716-446655440002';
UPDATE communities SET member_count = 2 WHERE id = '880e8400-e29b-41d4-a716-446655440003';
