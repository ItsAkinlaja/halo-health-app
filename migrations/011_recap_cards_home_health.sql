-- Recap Cards
CREATE TABLE IF NOT EXISTS recap_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE CASCADE,
  card_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Home Health Scores
CREATE TABLE IF NOT EXISTS home_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  category_scores JSONB,
  total_products INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recap_cards_user ON recap_cards(user_id);
CREATE INDEX idx_recap_cards_scan ON recap_cards(scan_id);
CREATE INDEX idx_recap_cards_public ON recap_cards(is_public);
CREATE INDEX idx_home_health_scores_user ON home_health_scores(user_id);
CREATE INDEX idx_home_health_scores_recorded ON home_health_scores(recorded_at);

-- RLS Policies
ALTER TABLE recap_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_health_scores ENABLE ROW LEVEL SECURITY;

-- Recap Cards Policies
CREATE POLICY "Users can view their own recap cards"
  ON recap_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public recap cards"
  ON recap_cards FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own recap cards"
  ON recap_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recap cards"
  ON recap_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recap cards"
  ON recap_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Home Health Scores Policies
CREATE POLICY "Users can view their own home health scores"
  ON home_health_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own home health scores"
  ON home_health_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);
