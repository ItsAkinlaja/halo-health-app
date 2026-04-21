# Database Migrations

This directory contains SQL migration files for the Halo Health database schema.

## Migration Files

### Core Schema
- **001_initial_schema.sql** - Initial database schema with all core tables
- **002_rls_policies.sql** - Row Level Security policies for core tables
- **003_seed_data.sql** - Seed data for testing and development
- **004_add_profile_primary_flag.sql** - Adds primary profile flag
- **005_add_coach_messages.sql** - Adds AI coach messages table
- **006_add_meals_table.sql** - Adds meals table structure
- **007_fix_user_foreign_keys.sql** - Fixes foreign key constraints

### Social Features (NEW)
- **008_social_features.sql** - Comprehensive social networking tables
  - Post likes, comments, and shares
  - User follows and blocks
  - Community posts and interactions
  - Product reviews
  - Activity feed
  - Hashtags and mentions
  
- **009_social_features_rls.sql** - Row Level Security policies for social features
  - Ensures proper data access control
  - Protects user privacy
  - Manages community permissions

## How to Apply Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file
4. Paste and execute in order (001, 002, 003, etc.)
5. Verify each migration completes successfully before proceeding

### Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Using psql (Direct PostgreSQL Connection)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration file
\i migrations/001_initial_schema.sql
\i migrations/002_rls_policies.sql
\i migrations/003_seed_data.sql
\i migrations/004_add_profile_primary_flag.sql
\i migrations/005_add_coach_messages.sql
\i migrations/006_add_meals_table.sql
\i migrations/007_fix_user_foreign_keys.sql
\i migrations/008_social_features.sql
\i migrations/009_social_features_rls.sql
```

## Social Features Overview

### New Tables Added

#### Post Interactions
- `post_likes` - Track likes on social posts
- `post_comments` - Comments on posts with threading support
- `comment_likes` - Likes on comments
- `post_shares` - Track post shares
- `post_reports` - Report inappropriate content

#### User Relationships
- `user_follows` - Follow/follower relationships
- `user_blocks` - Block users

#### Community Features
- `community_posts` - Posts within communities
- `community_post_likes` - Likes on community posts
- `community_post_comments` - Comments on community posts

#### Product Reviews
- `product_reviews` - User reviews for products
- `review_helpful` - Mark reviews as helpful

#### Activity & Discovery
- `user_activity_feed` - Track user activities
- `hashtags` - Hashtag management
- `post_hashtags` - Link posts to hashtags
- `user_mentions` - Track user mentions in posts/comments

### Automatic Counters

The migrations include triggers that automatically maintain counts:
- Post likes count
- Post comments count
- Comment likes count
- Community member count
- User followers/following count
- User posts count
- Hashtag usage count
- Review helpful count

### Security Features

All social tables have Row Level Security (RLS) enabled with policies that:
- Allow users to view public content
- Restrict editing to content owners
- Protect private community content
- Prevent unauthorized access to blocked users
- Ensure proper community membership checks

## Verification

After applying migrations, verify the tables exist:

```sql
-- Check if all social tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'post_likes', 'post_comments', 'comment_likes',
    'user_follows', 'post_shares', 'user_blocks',
    'community_posts', 'product_reviews', 'hashtags'
)
ORDER BY table_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%post%' OR tablename LIKE '%comment%'
ORDER BY tablename;

-- Check if triggers are created
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

## Rollback

If you need to rollback the social features:

```sql
-- Drop social feature tables (in reverse dependency order)
DROP TABLE IF EXISTS user_mentions CASCADE;
DROP TABLE IF EXISTS post_hashtags CASCADE;
DROP TABLE IF EXISTS hashtags CASCADE;
DROP TABLE IF EXISTS user_activity_feed CASCADE;
DROP TABLE IF EXISTS review_helpful CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS community_post_comments CASCADE;
DROP TABLE IF EXISTS community_post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS post_reports CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;

-- Remove added columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS followers_count;
ALTER TABLE users DROP COLUMN IF EXISTS following_count;
ALTER TABLE users DROP COLUMN IF EXISTS posts_count;
```

## Support

For issues or questions about migrations:
1. Check the Supabase logs for error messages
2. Verify your database user has sufficient permissions
3. Ensure migrations are applied in the correct order
4. Review the RLS policies if you encounter access issues

## Next Steps

After applying these migrations:
1. Update your backend API to use the new social tables
2. Implement social features in the frontend
3. Test the RLS policies with different user scenarios
4. Monitor database performance and add indexes as needed
