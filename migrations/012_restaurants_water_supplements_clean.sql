-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS supplement_scans CASCADE;
DROP TABLE IF EXISTS user_supplements CASCADE;
DROP TABLE IF EXISTS supplements CASCADE;
DROP TABLE IF EXISTS water_scans CASCADE;
DROP TABLE IF EXISTS water_products CASCADE;
DROP TABLE IF EXISTS restaurant_reviews CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(50),
  website TEXT,
  cuisine_type VARCHAR(100),
  price_range VARCHAR(10),
  rating DECIMAL(3, 2),
  seed_oil_free BOOLEAN DEFAULT false,
  organic BOOLEAN DEFAULT false,
  gluten_free BOOLEAN DEFAULT false,
  vegan_options BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  seed_oil_verified BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water Products
CREATE TABLE water_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bottled', 'filters', 'purifiers')),
  barcode VARCHAR(50),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  purity_score INTEGER CHECK (purity_score >= 0 AND purity_score <= 100),
  contaminants TEXT,
  microplastics TEXT,
  pfas TEXT,
  minerals TEXT,
  ph_level DECIMAL(3, 1),
  removal_rate VARCHAR(20),
  contaminants_removed TEXT[],
  certified BOOLEAN DEFAULT false,
  lab_tested BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE water_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES water_products(id) ON DELETE SET NULL,
  barcode VARCHAR(50),
  scan_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplements
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  barcode VARCHAR(50),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  purity_score INTEGER CHECK (purity_score >= 0 AND purity_score <= 100),
  heavy_metals TEXT,
  fillers TEXT,
  third_party_tested BOOLEAN DEFAULT false,
  certifications TEXT[],
  ingredients JSONB,
  serving_size TEXT,
  servings_per_container INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
  dosage TEXT,
  frequency TEXT,
  notes TEXT,
  last_scanned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, supplement_id)
);

CREATE TABLE supplement_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES supplements(id) ON DELETE SET NULL,
  barcode VARCHAR(50),
  scan_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_latitude ON restaurants(latitude);
CREATE INDEX idx_restaurants_longitude ON restaurants(longitude);
CREATE INDEX idx_restaurants_seed_oil ON restaurants(seed_oil_free);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX idx_restaurant_reviews_user ON restaurant_reviews(user_id);

CREATE INDEX idx_water_products_category ON water_products(category);
CREATE INDEX idx_water_products_barcode ON water_products(barcode);
CREATE INDEX idx_water_products_score ON water_products(score DESC);
CREATE INDEX idx_water_scans_user ON water_scans(user_id);

CREATE INDEX idx_supplements_category ON supplements(category);
CREATE INDEX idx_supplements_barcode ON supplements(barcode);
CREATE INDEX idx_supplements_score ON supplements(score DESC);
CREATE INDEX idx_user_supplements_user ON user_supplements(user_id);
CREATE INDEX idx_supplement_scans_user ON supplement_scans(user_id);

-- RLS Policies
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_scans ENABLE ROW LEVEL SECURITY;

-- Restaurants (public read)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Restaurant Reviews
CREATE POLICY "Anyone can view reviews"
  ON restaurant_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON restaurant_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON restaurant_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON restaurant_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Water Products (public read)
CREATE POLICY "Anyone can view water products"
  ON water_products FOR SELECT
  USING (true);

-- Water Scans
CREATE POLICY "Users can view their own water scans"
  ON water_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water scans"
  ON water_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Supplements (public read)
CREATE POLICY "Anyone can view supplements"
  ON supplements FOR SELECT
  USING (true);

-- User Supplements
CREATE POLICY "Users can view their own supplements"
  ON user_supplements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own supplements"
  ON user_supplements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplements"
  ON user_supplements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplements"
  ON user_supplements FOR DELETE
  USING (auth.uid() = user_id);

-- Supplement Scans
CREATE POLICY "Users can view their own supplement scans"
  ON supplement_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement scans"
  ON supplement_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
