-- Migration: Fix health_profiles foreign key to reference auth.users
-- Run this in Supabase SQL Editor

-- Step 1: Delete orphaned rows that reference non-existent users
DELETE FROM health_profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM meal_plans 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM shopping_lists 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM product_scans 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM saved_products 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM health_scores 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM notifications 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM pantry_items 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM social_posts 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM community_members 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM communities 
WHERE created_by NOT IN (SELECT id FROM auth.users);

DELETE FROM user_challenges 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM user_settings 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM referrals 
WHERE referrer_id NOT IN (SELECT id FROM auth.users);

DELETE FROM earnings 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 2: Drop the old foreign key constraints
ALTER TABLE health_profiles 
DROP CONSTRAINT IF EXISTS health_profiles_user_id_fkey;

ALTER TABLE meal_plans 
DROP CONSTRAINT IF EXISTS meal_plans_user_id_fkey;

ALTER TABLE shopping_lists 
DROP CONSTRAINT IF EXISTS shopping_lists_user_id_fkey;

ALTER TABLE product_scans 
DROP CONSTRAINT IF EXISTS product_scans_user_id_fkey;

ALTER TABLE saved_products 
DROP CONSTRAINT IF EXISTS saved_products_user_id_fkey;

ALTER TABLE health_scores 
DROP CONSTRAINT IF EXISTS health_scores_user_id_fkey;

ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE pantry_items 
DROP CONSTRAINT IF EXISTS pantry_items_user_id_fkey;

ALTER TABLE social_posts 
DROP CONSTRAINT IF EXISTS social_posts_user_id_fkey;

ALTER TABLE community_members 
DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;

ALTER TABLE communities 
DROP CONSTRAINT IF EXISTS communities_created_by_fkey;

ALTER TABLE user_challenges 
DROP CONSTRAINT IF EXISTS user_challenges_user_id_fkey;

ALTER TABLE user_settings 
DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;

ALTER TABLE referrals 
DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;

ALTER TABLE earnings 
DROP CONSTRAINT IF EXISTS earnings_user_id_fkey;

-- Step 3: Add new foreign key constraints referencing auth.users
ALTER TABLE health_profiles 
ADD CONSTRAINT health_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE meal_plans 
ADD CONSTRAINT meal_plans_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE shopping_lists 
ADD CONSTRAINT shopping_lists_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE product_scans 
ADD CONSTRAINT product_scans_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE saved_products 
ADD CONSTRAINT saved_products_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE health_scores 
ADD CONSTRAINT health_scores_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE pantry_items 
ADD CONSTRAINT pantry_items_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE social_posts 
ADD CONSTRAINT social_posts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE community_members 
ADD CONSTRAINT community_members_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE communities 
ADD CONSTRAINT communities_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE user_challenges 
ADD CONSTRAINT user_challenges_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE user_settings 
ADD CONSTRAINT user_settings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE earnings 
ADD CONSTRAINT earnings_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
