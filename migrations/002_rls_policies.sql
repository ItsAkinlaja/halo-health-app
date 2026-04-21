-- Row Level Security (RLS) Policies for Halo Health
-- These policies ensure users can only access their own data

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Health Profiles table policies
CREATE POLICY "Users can view own health profiles" ON health_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own health profiles" ON health_profiles
    FOR ALL USING (user_id = auth.uid());

-- Dietary Restrictions table policies
CREATE POLICY "Users can view own dietary restrictions" ON dietary_restrictions
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own dietary restrictions" ON dietary_restrictions
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

-- Allergies & Intolerances table policies
CREATE POLICY "Users can view own allergies" ON allergies_intolerances
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own allergies" ON allergies_intolerances
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

-- Ingredient Preferences table policies
CREATE POLICY "Users can view own ingredient preferences" ON ingredient_preferences
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own ingredient preferences" ON ingredient_preferences
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

-- Health Concerns table policies
CREATE POLICY "Users can view own health concerns" ON health_concerns
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own health concerns" ON health_concerns
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM health_profiles WHERE user_id = auth.uid()
        )
    );

-- Product Scans table policies
CREATE POLICY "Users can view own scans" ON product_scans
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own scans" ON product_scans
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own scans" ON product_scans
    FOR UPDATE USING (user_id = auth.uid());

-- Saved Products table policies
CREATE POLICY "Users can view own saved products" ON saved_products
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own saved products" ON saved_products
    FOR ALL USING (user_id = auth.uid());

-- Meal Plans table policies
CREATE POLICY "Users can view own meal plans" ON meal_plans
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own meal plans" ON meal_plans
    FOR ALL USING (user_id = auth.uid());

-- Shopping Lists table policies
CREATE POLICY "Users can view own shopping lists" ON shopping_lists
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
    FOR ALL USING (user_id = auth.uid());

-- Pantry Items table policies
CREATE POLICY "Users can view own pantry items" ON pantry_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own pantry items" ON pantry_items
    FOR ALL USING (user_id = auth.uid());

-- Social Posts table policies
CREATE POLICY "Users can view public posts" ON social_posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own posts" ON social_posts
    FOR ALL USING (user_id = auth.uid());

-- Community Members table policies
CREATE POLICY "Users can view own community memberships" ON community_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own community memberships" ON community_members
    FOR ALL USING (user_id = auth.uid());

-- User Challenges table policies
CREATE POLICY "Users can view own challenges" ON user_challenges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own challenges" ON user_challenges
    FOR ALL USING (user_id = auth.uid());

-- Health Scores table policies
CREATE POLICY "Users can view own health scores" ON health_scores
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own health scores" ON health_scores
    FOR ALL USING (user_id = auth.uid());

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- User Settings table policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (user_id = auth.uid());

-- Referrals table policies
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY "Users can insert own referrals" ON referrals
    FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- Earnings table policies
CREATE POLICY "Users can view own earnings" ON earnings
    FOR SELECT USING (user_id = auth.uid());

-- Products table policies (public read access)
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (is_active = true);

-- Restaurants table policies (public read access)
CREATE POLICY "Restaurants are publicly readable" ON restaurants
    FOR SELECT USING (is_active = true);

-- Communities table policies (public read access for non-private communities)
CREATE POLICY "Public communities are readable" ON communities
    FOR SELECT USING (is_private = false);

-- Challenges table policies (public read access for active challenges)
CREATE POLICY "Active challenges are readable" ON challenges
    FOR SELECT USING (is_active = true);

-- News Feed table policies (public read access)
CREATE POLICY "News feed is publicly readable" ON news_feed
    FOR SELECT USING (true);

-- Product Recalls table policies (public read access for active recalls)
CREATE POLICY "Active recalls are publicly readable" ON product_recalls
    FOR SELECT USING (is_active = true);
