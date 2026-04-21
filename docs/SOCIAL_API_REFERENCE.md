# Social Features API Endpoints Reference

This document outlines the API endpoints needed to support the social features database schema.

## Posts & Feed

### Social Posts
```
GET    /api/social/posts              - Get feed posts (paginated)
GET    /api/social/posts/:id          - Get single post
POST   /api/social/posts              - Create new post
PUT    /api/social/posts/:id          - Update post
DELETE /api/social/posts/:id          - Delete post
GET    /api/social/posts/user/:userId - Get user's posts
GET    /api/social/posts/trending     - Get trending posts
```

### Post Interactions
```
POST   /api/social/posts/:id/like     - Like a post
DELETE /api/social/posts/:id/like     - Unlike a post
GET    /api/social/posts/:id/likes    - Get post likes
POST   /api/social/posts/:id/share    - Share a post
POST   /api/social/posts/:id/report   - Report a post
```

### Comments
```
GET    /api/social/posts/:id/comments           - Get post comments
POST   /api/social/posts/:id/comments           - Add comment
PUT    /api/social/comments/:id                 - Update comment
DELETE /api/social/comments/:id                 - Delete comment
POST   /api/social/comments/:id/like            - Like comment
DELETE /api/social/comments/:id/like            - Unlike comment
GET    /api/social/comments/:id/replies         - Get comment replies
```

## User Relationships

### Follows
```
POST   /api/social/users/:id/follow             - Follow user
DELETE /api/social/users/:id/follow             - Unfollow user
GET    /api/social/users/:id/followers          - Get followers
GET    /api/social/users/:id/following          - Get following
GET    /api/social/users/:id/follow-status      - Check follow status
```

### Blocks
```
POST   /api/social/users/:id/block              - Block user
DELETE /api/social/users/:id/block              - Unblock user
GET    /api/social/users/blocked                - Get blocked users
```

## Communities

### Community Management
```
GET    /api/communities                         - Get all communities
GET    /api/communities/:id                     - Get community details
POST   /api/communities                         - Create community
PUT    /api/communities/:id                     - Update community
DELETE /api/communities/:id                     - Delete community
GET    /api/communities/search                  - Search communities
GET    /api/communities/trending                - Get trending communities
```

### Community Membership
```
POST   /api/communities/:id/join                - Join community
DELETE /api/communities/:id/leave               - Leave community
GET    /api/communities/:id/members             - Get members
PUT    /api/communities/:id/members/:userId     - Update member role
DELETE /api/communities/:id/members/:userId     - Remove member
```

### Community Posts
```
GET    /api/communities/:id/posts               - Get community posts
POST   /api/communities/:id/posts               - Create community post
PUT    /api/communities/:id/posts/:postId       - Update community post
DELETE /api/communities/:id/posts/:postId       - Delete community post
POST   /api/communities/:id/posts/:postId/pin   - Pin post (admin/mod)
DELETE /api/communities/:id/posts/:postId/pin   - Unpin post
```

### Community Post Interactions
```
POST   /api/communities/posts/:id/like          - Like community post
DELETE /api/communities/posts/:id/like          - Unlike community post
GET    /api/communities/posts/:id/comments      - Get comments
POST   /api/communities/posts/:id/comments      - Add comment
```

## Product Reviews

### Reviews
```
GET    /api/products/:id/reviews                - Get product reviews
POST   /api/products/:id/reviews                - Create review
PUT    /api/reviews/:id                         - Update review
DELETE /api/reviews/:id                         - Delete review
GET    /api/reviews/user/:userId                - Get user's reviews
```

### Review Interactions
```
POST   /api/reviews/:id/helpful                 - Mark review helpful
DELETE /api/reviews/:id/helpful                 - Remove helpful mark
GET    /api/reviews/:id/helpful-count           - Get helpful count
```

## Activity & Discovery

### Activity Feed
```
GET    /api/social/activity/feed                - Get personalized feed
GET    /api/social/activity/user/:userId        - Get user activity
POST   /api/social/activity                     - Create activity entry
```

### Hashtags
```
GET    /api/social/hashtags/trending            - Get trending hashtags
GET    /api/social/hashtags/:tag                - Get posts by hashtag
GET    /api/social/hashtags/search              - Search hashtags
```

### Mentions
```
GET    /api/social/mentions                     - Get user mentions
POST   /api/social/mentions                     - Create mention
```

### Search
```
GET    /api/social/search/posts                 - Search posts
GET    /api/social/search/users                 - Search users
GET    /api/social/search/communities           - Search communities
GET    /api/social/search/hashtags              - Search hashtags
```

## Request/Response Examples

### Create Post
```javascript
POST /api/social/posts
{
  "content": "Just scanned this amazing product! #cleanliving",
  "image_urls": ["https://..."],
  "tags": ["health", "wellness"],
  "is_public": true
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "content": "...",
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Like Post
```javascript
POST /api/social/posts/:id/like

Response:
{
  "success": true,
  "data": {
    "liked": true,
    "likes_count": 42
  }
}
```

### Get Feed
```javascript
GET /api/social/posts?page=1&limit=20&filter=following

Response:
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "username": "john_doe",
          "avatar_url": "https://..."
        },
        "content": "...",
        "image_urls": [],
        "likes_count": 42,
        "comments_count": 5,
        "is_liked": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "has_more": true
    }
  }
}
```

### Follow User
```javascript
POST /api/social/users/:id/follow

Response:
{
  "success": true,
  "data": {
    "following": true,
    "followers_count": 150
  }
}
```

### Create Community
```javascript
POST /api/communities
{
  "name": "Clean Living Warriors",
  "description": "A community for people committed to clean living",
  "category": "lifestyle",
  "is_private": false
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Clean Living Warriors",
    "member_count": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Create Product Review
```javascript
POST /api/products/:id/reviews
{
  "rating": 5,
  "title": "Amazing product!",
  "content": "This product changed my life...",
  "verified_purchase": true
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "user_id": "uuid",
    "rating": 5,
    "helpful_count": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## Query Parameters

### Common Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort order (newest, oldest, popular, trending)
- `filter` - Filter type (all, following, public)

### Feed Filters
- `following` - Posts from followed users
- `trending` - Trending posts
- `community` - Posts from joined communities
- `hashtag` - Posts with specific hashtag

## Error Responses

```javascript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to perform this action"
  }
}

{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  }
}

{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to delete this post"
  }
}
```

## Implementation Notes

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Rate Limiting
- Standard endpoints: 100 requests/minute
- Post creation: 10 posts/hour
- Comment creation: 30 comments/hour
- Like/Unlike: 200 actions/minute

### Pagination
Use cursor-based pagination for feeds:
```
GET /api/social/posts?cursor=uuid&limit=20
```

### Real-time Updates
Use WebSocket connections for:
- New likes/comments notifications
- New follower notifications
- Community activity updates
- Mention notifications

### Caching
Implement caching for:
- User profiles (5 minutes)
- Post counts (1 minute)
- Trending hashtags (15 minutes)
- Community lists (10 minutes)

### Content Moderation
- Implement profanity filter
- Auto-flag reported content
- Queue for manual review
- Notify users of violations

## Next Steps

1. Implement backend controllers for each endpoint
2. Add validation middleware
3. Set up WebSocket server for real-time features
4. Implement caching layer with Redis
5. Add rate limiting
6. Create admin moderation dashboard
7. Set up content delivery network for images
8. Implement search with Elasticsearch/Algolia
