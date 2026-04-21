-- Migration: Update meals table for meal planning
-- Run this in Supabase SQL Editor

-- Drop the old meals table structure
DROP TABLE IF EXISTS meals CASCADE;

-- Recreate with new structure
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  name TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  time TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fats DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  instructions JSONB DEFAULT '[]'::jsonb,
  nutrition JSONB,
  tags TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 1,
  difficulty TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_meals_profile_date ON meals(profile_id, scheduled_date);
CREATE INDEX idx_meals_plan ON meals(meal_plan_id);
CREATE INDEX idx_meals_type ON meals(meal_type);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access meals for their own profiles
CREATE POLICY meals_user_policy ON meals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM health_profiles
      WHERE health_profiles.id = meals.profile_id
      AND health_profiles.user_id = auth.uid()
    )
  );
