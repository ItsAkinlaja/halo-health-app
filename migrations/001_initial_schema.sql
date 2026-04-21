-- Initial Halo Health Database Schema
-- This file contains the complete database schema for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    halo_health_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50),
    bio TEXT,
    instagram_handle VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Profiles table (for family members)
CREATE TABLE health_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    age_group VARCHAR(20),
    gender VARCHAR(10),
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    activity_level VARCHAR(20),
    health_goals TEXT[],
    special_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dietary Restrictions table
CREATE TABLE dietary_restrictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    restriction_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'strict',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allergies & Intolerances table
CREATE TABLE allergies_intolerances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    allergy_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reaction_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredient Preferences table
CREATE TABLE ingredient_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    preference VARCHAR(20) NOT NULL, -- 'avoid', 'limit', 'can_eat'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Concerns table
CREATE TABLE health_concerns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    concern_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(50),
    subcategory VARCHAR(50),
    ingredients TEXT[],
    nutrition_info JSONB,
    allergens_present TEXT[],
    toxins_detected TEXT[],
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    processing_level VARCHAR(20),
    is_lab_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Scans table
CREATE TABLE product_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    scan_type VARCHAR(20) NOT NULL, -- 'barcode', 'photo', 'manual'
    score_given INTEGER CHECK (score_given >= 0 AND score_given <= 100),
    halo_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Products table
CREATE TABLE saved_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    list_type VARCHAR(20) DEFAULT 'clean_choices', -- 'clean_choices', 'favorites', 'avoid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clean Swaps table
CREATE TABLE clean_swaps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    original_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alternative_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    swap_reason TEXT,
    score_improvement INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plans table
CREATE TABLE meal_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    duration_days INTEGER NOT NULL,
    daily_calories INTEGER,
    cuisine_preferences TEXT[],
    dietary_goals TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals table
CREATE TABLE meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recipe JSONB,
    nutrition_info JSONB,
    dietary_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT[],
    ingredients JSONB,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER,
    difficulty_level VARCHAR(20),
    dietary_tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping Lists table
CREATE TABLE shopping_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    list_name VARCHAR(255) NOT NULL,
    items JSONB,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pantry Items table
CREATE TABLE pantry_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    quantity DECIMAL(10,2),
    unit VARCHAR(20),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    website TEXT,
    cuisine_types TEXT[],
    price_range VARCHAR(10), -- '$', '$$', '$$$', '$$$$'
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    seed_oil_free BOOLEAN DEFAULT false,
    gluten_free_options BOOLEAN DEFAULT false,
    vegan_options BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Posts table
CREATE TABLE social_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT[],
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities table
CREATE TABLE communities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_private BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Members table
CREATE TABLE community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- 'clean_living', 'meal_planning', 'scanning', 'social'
    duration_days INTEGER NOT NULL,
    difficulty_level VARCHAR(20),
    reward_points INTEGER,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Challenges table
CREATE TABLE user_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Health Scores table
CREATE TABLE health_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES health_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
    safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
    lifestyle_score INTEGER CHECK (lifestyle_score >= 0 AND lifestyle_score <= 100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_preference VARCHAR(50) DEFAULT 'calm_clear_female',
    notification_tone VARCHAR(50) DEFAULT 'motivational_inspirational',
    audio_enabled BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT false,
    notification_preferences JSONB,
    meal_plan_preferences JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Feed table
CREATE TABLE news_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author VARCHAR(255),
    source VARCHAR(255),
    category VARCHAR(50),
    tags TEXT[],
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_email VARCHAR(255) NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
    reward_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earnings table
CREATE TABLE earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'referral', 'scan_bonus', 'challenge_complete', etc.
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Recalls table
CREATE TABLE product_recalls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    recall_reason TEXT NOT NULL,
    recall_date DATE NOT NULL,
    severity VARCHAR(20) NOT NULL,
    details TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_halo_health_id ON users(halo_health_id);
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_health_score ON products(health_score);
CREATE INDEX idx_product_scans_user_id ON product_scans(user_id);
CREATE INDEX idx_product_scans_product_id ON product_scans(product_id);
CREATE INDEX idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX idx_health_scores_user_id ON health_scores(user_id);
CREATE INDEX idx_health_scores_recorded_at ON health_scores(recorded_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietary_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies_intolerances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON health_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
