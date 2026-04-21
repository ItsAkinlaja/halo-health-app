-- Migration 004: Add is_primary flag to health_profiles
-- Run this in your Supabase SQL editor

ALTER TABLE health_profiles
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Mark the first profile per user as primary (for existing data)
UPDATE health_profiles hp
SET is_primary = true
WHERE hp.id = (
  SELECT id FROM health_profiles
  WHERE user_id = hp.user_id
  ORDER BY created_at ASC
  LIMIT 1
);

-- Add age column (numeric) alongside age_group for easier filtering
ALTER TABLE health_profiles
  ADD COLUMN IF NOT EXISTS age INTEGER;

-- Add notification_settings JSONB column
ALTER TABLE health_profiles
  ADD COLUMN IF NOT EXISTS notification_settings JSONB;

-- Index for primary profile lookups
CREATE INDEX IF NOT EXISTS idx_health_profiles_is_primary ON health_profiles(user_id, is_primary);
