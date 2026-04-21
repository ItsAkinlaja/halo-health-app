# Halo Health Database Schema (Supabase)

## Core Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  halo_health_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  instagram_handle TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### health_profiles
```sql
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT CHECK (relationship IN ('self', 'partner', 'child', 'elderly_parent', 'other_family', 'caregiver', 'pet')),
  age_group TEXT CHECK (age_group IN ('baby_0_2', 'toddler_3_5', 'child_6_12', 'teen_13_17', 'adult_18_64', 'senior_65+', 'puppy_kitten', 'adult_pet', 'senior_pet')),
  special_conditions TEXT[],
  pet_type TEXT CHECK (pet_type IN ('dog', 'cat', 'bird', 'rabbit', 'fish', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### dietary_restrictions
```sql
CREATE TABLE dietary_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  restriction_type TEXT NOT NULL, -- 'gluten_free', 'dairy_free', 'vegan', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### allergies_intolerances
```sql
CREATE TABLE allergies_intolerances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  allergy_type TEXT NOT NULL, -- 'peanut_allergy', 'lactose_intolerance', etc.
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ingredient_preferences
```sql
CREATE TABLE ingredient_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  preference TEXT CHECK (preference IN ('can_eat', 'limit', 'avoid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### health_concerns
```sql
CREATE TABLE health_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  concern_type TEXT NOT NULL, -- 'inflammation', 'gut_health', 'heart_health', etc.
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL, -- 'food', 'beverage', 'supplement', 'personal_care', etc.
  subcategory TEXT,
  image_url TEXT,
  ingredients TEXT[],
  nutrition_info JSONB,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  processing_level TEXT CHECK (processing_level IN ('low', 'medium', 'high')),
  is_lab_verified BOOLEAN DEFAULT false,
  lab_results JSONB,
  toxins_detected JSONB,
  allergens_present TEXT[],
  beneficial_ingredients TEXT[],
  parent_company TEXT,
  recall_status TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### product_scans
```sql
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  scan_type TEXT CHECK (scan_type IN ('barcode', 'photo', 'search', 'menu')),
  location_lat DECIMAL,
  location_lng DECIMAL,
  score_given INTEGER,
  flagged_ingredients TEXT[],
  halo_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### saved_products
```sql
CREATE TABLE saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  list_type TEXT CHECK (list_type IN ('clean_choices', 'avoid_list', 'favorites')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### clean_swaps
```sql
CREATE TABLE clean_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  replacement_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  score_improvement INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### meal_plans
```sql
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  calorie_target INTEGER,
  cuisine_preferences TEXT[],
  cooking_time_limit INTEGER, -- minutes
  budget_weekly DECIMAL,
  health_goals TEXT[],
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### meals
```sql
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
  recipe_id UUID REFERENCES recipes(id),
  is_logged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### recipes
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  instructions TEXT[],
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER,
  ingredients JSONB, -- [{"name": "flour", "quantity": "2 cups", "notes": "organic"}]
  nutrition_per_serving JSONB,
  dietary_badges TEXT[], -- ['gluten_free', 'dairy_free', 'vegan', 'seed_oil_free']
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### shopping_lists
```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### shopping_list_items
```sql
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  notes TEXT,
  recommended_brand TEXT,
  recommended_product_id UUID REFERENCES products(id),
  is_purchased BOOLEAN DEFAULT false,
  store_section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### pantry_items
```sql
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  expiry_date DATE,
  storage_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### restaurants
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL,
  lng DECIMAL,
  phone TEXT,
  website TEXT,
  cuisine_types TEXT[],
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  rating DECIMAL(3,2),
  review_count INTEGER,
  seed_oil_free BOOLEAN DEFAULT false,
  gluten_free_options BOOLEAN DEFAULT false,
  vegan_options BOOLEAN DEFAULT false,
  allergy_friendly BOOLEAN DEFAULT false,
  opening_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### restaurant_menus
```sql
CREATE TABLE restaurant_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  ingredients TEXT[],
  allergens TEXT[],
  dietary_tags TEXT[], -- ['gluten_free', 'vegan', 'dairy_free']
  health_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### social_posts
```sql
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[],
  post_type TEXT CHECK (post_type IN ('text', 'photo', 'video', 'product_scan', 'clean_swap', 'recipe_share')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### communities
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  membership_type TEXT CHECK (membership_type IN ('free', 'paid')),
  price_monthly DECIMAL(10,2),
  member_count INTEGER DEFAULT 0,
  screening_questions TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### community_members
```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level INTEGER DEFAULT 1
);
```

### challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('app_wide', 'community_specific')),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  requirements JSONB, -- {"scans_required": 7, "clean_swaps_required": 3}
  badge_url TEXT,
  points_awarded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### challenge_participants
```sql
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress JSONB, -- {"scans_completed": 3, "clean_swaps_completed": 1}
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### health_scores
```sql
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  food_score INTEGER,
  water_score INTEGER,
  supplement_score INTEGER,
  personal_care_score INTEGER,
  household_score INTEGER,
  home_environment_score INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('recall_alert', 'new_lab_results', 'clean_swap', 'daily_tip', 'streak_risk', 'meal_reminder', 'expiry_alert')),
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- Additional data for specific notification types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  voice_preference TEXT CHECK (voice_preference IN ('calm_clear_female', 'confident_authoritative_male', 'friendly_upbeat_female', 'deep_grounding_male', 'warm_nurturing_female', 'young_energetic_neutral')),
  notification_tone TEXT CHECK (notification_tone IN ('funny_playful', 'motivational_inspirational', 'girl_talk', 'youre_amazing', 'doctor_level', 'calm_gentle', 'straight_talker', 'parent_mode')),
  audio_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  notification_preferences JSONB,
  meal_plan_preferences JSONB,
  privacy_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### news_feed
```sql
CREATE TABLE news_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  source TEXT,
  news_type TEXT CHECK (news_type IN ('recall_alert', 'scientific_study', 'toxin_discovery', 'industry_investigation', 'ingredient_trend', 'lab_results')),
  relevant_ingredients TEXT[],
  relevant_categories TEXT[],
  is_public BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_news_relevance
```sql
CREATE TABLE user_news_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES news_feed(id) ON DELETE CASCADE,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### referrals
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'converted')),
  commission_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE
);
```

### earnings
```sql
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT CHECK (source IN ('referral', 'community_subscription')),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'available', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_scans_user_id ON product_scans(user_id);
CREATE INDEX idx_product_scans_created_at ON product_scans(created_at);
CREATE INDEX idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);
CREATE INDEX idx_communities_tags ON communities USING GIN(tags);
CREATE INDEX idx_challenges_active ON challenges(start_date, end_date);
CREATE INDEX idx_health_scores_recorded_at ON health_scores(recorded_at);
```

## Row Level Security (RLS) Policies

```sql
-- Users can only access their own data
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health profiles" ON health_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own health profiles" ON health_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own health profiles" ON health_profiles FOR UPDATE USING (user_id = auth.uid());

-- Similar policies for all user-specific tables
```
