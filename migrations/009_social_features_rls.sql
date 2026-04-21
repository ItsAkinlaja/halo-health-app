-- Row Level Security Policies for Social Features
-- Ensures users can only access and modify their own data appropriately

-- Post Likes Policies
CREATE POLICY "Users can view all post likes"
    ON post_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own post likes"
    ON post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Post Comments Policies
CREATE POLICY "Users can view comments on public posts"
    ON post_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = post_comments.post_id 
            AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create comments on public posts"
    ON post_comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = post_comments.post_id 
            AND is_public = true
        )
    );

CREATE POLICY "Users can update their own comments"
    ON post_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Users can view all comment likes"
    ON comment_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own comment likes"
    ON comment_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes"
    ON comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- User Follows Policies
CREATE POLICY "Users can view all follows"
    ON user_follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow other users"
    ON user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow users"
    ON user_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Post Shares Policies
CREATE POLICY "Users can view their own shares"
    ON post_shares FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares"
    ON post_shares FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
    ON post_shares FOR DELETE
    USING (auth.uid() = user_id);

-- Post Reports Policies
CREATE POLICY "Users can view their own reports"
    ON post_reports FOR SELECT
    USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
    ON post_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- User Blocks Policies
CREATE POLICY "Users can view their own blocks"
    ON user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block other users"
    ON user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock users"
    ON user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- Community Posts Policies
CREATE POLICY "Users can view posts in communities they're members of"
    ON community_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM communities 
            WHERE id = community_posts.community_id 
            AND is_private = false
        )
    );

CREATE POLICY "Users can create posts in communities they're members of"
    ON community_posts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own community posts"
    ON community_posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts"
    ON community_posts FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = community_posts.community_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Community Post Likes Policies
CREATE POLICY "Users can view community post likes"
    ON community_post_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like community posts"
    ON community_post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike community posts"
    ON community_post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Community Post Comments Policies
CREATE POLICY "Users can view comments in accessible communities"
    ON community_post_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM community_posts cp
            JOIN community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = community_post_comments.post_id 
            AND cm.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM community_posts cp
            JOIN communities c ON cp.community_id = c.id
            WHERE cp.id = community_post_comments.post_id 
            AND c.is_private = false
        )
    );

CREATE POLICY "Users can comment on community posts"
    ON community_post_comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM community_posts cp
            JOIN community_members cm ON cp.community_id = cm.community_id
            WHERE cp.id = community_post_comments.post_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own community comments"
    ON community_post_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community comments"
    ON community_post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Product Reviews Policies
CREATE POLICY "Users can view all product reviews"
    ON product_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own reviews"
    ON product_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON product_reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON product_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Review Helpful Policies
CREATE POLICY "Users can view review helpful marks"
    ON review_helpful FOR SELECT
    USING (true);

CREATE POLICY "Users can mark reviews as helpful"
    ON review_helpful FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful marks"
    ON review_helpful FOR DELETE
    USING (auth.uid() = user_id);

-- User Activity Feed Policies
CREATE POLICY "Users can view public activity"
    ON user_activity_feed FOR SELECT
    USING (
        is_public = true OR 
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_follows 
            WHERE following_id = user_activity_feed.user_id 
            AND follower_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own activity"
    ON user_activity_feed FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
    ON user_activity_feed FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity"
    ON user_activity_feed FOR DELETE
    USING (auth.uid() = user_id);

-- Hashtags Policies
CREATE POLICY "Anyone can view hashtags"
    ON hashtags FOR SELECT
    USING (true);

CREATE POLICY "System can manage hashtags"
    ON hashtags FOR ALL
    USING (true)
    WITH CHECK (true);

-- Post Hashtags Policies
CREATE POLICY "Anyone can view post hashtags"
    ON post_hashtags FOR SELECT
    USING (true);

CREATE POLICY "Users can add hashtags to their posts"
    ON post_hashtags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = post_hashtags.post_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove hashtags from their posts"
    ON post_hashtags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM social_posts 
            WHERE id = post_hashtags.post_id 
            AND user_id = auth.uid()
        )
    );

-- User Mentions Policies
CREATE POLICY "Users can view mentions"
    ON user_mentions FOR SELECT
    USING (
        auth.uid() = mentioned_user_id OR 
        auth.uid() = mentioning_user_id
    );

CREATE POLICY "Users can create mentions"
    ON user_mentions FOR INSERT
    WITH CHECK (auth.uid() = mentioning_user_id);

CREATE POLICY "Users can delete their own mentions"
    ON user_mentions FOR DELETE
    USING (auth.uid() = mentioning_user_id);
