# Shopping Lists, Referrals & Community Groups

## Overview
Implementation of three key features:
1. Shopping List Generation
2. Referral/Earnings System
3. Community Groups

---

## 1. Shopping List Generation

### Backend Implementation

**Service**: `backend/src/services/shoppingListService.js`
- Create and manage shopping lists
- Add/remove/toggle items
- Generate lists from meal plans automatically
- Share lists with family members

**API Endpoints**: `/api/shopping-list`
- `POST /` - Create new shopping list
- `GET /` - Get user's shopping lists
- `GET /:listId/items` - Get items in a list
- `POST /:listId/items` - Add item to list
- `DELETE /items/:itemId` - Remove item
- `PATCH /items/:itemId/toggle` - Toggle item checked status
- `DELETE /:listId` - Delete list
- `POST /generate-from-meal-plan/:mealPlanId` - Auto-generate from meal plan

### Frontend Implementation

**Service**: `frontend/src/services/shoppingListService.js`
- Full CRUD operations for shopping lists
- Item management with check/uncheck
- Meal plan integration

### Features
- Create multiple shopping lists
- Add products or custom items
- Check off items as you shop
- Generate lists from meal plans
- Share lists with family
- Track quantities

---

## 2. Referral/Earnings System

### Backend Implementation

**Service**: `backend/src/services/referralService.js`
- Generate unique referral codes
- Track referrals and earnings
- Process payouts
- Reward system for successful referrals

**API Endpoints**: `/api/referral`
- `GET /code` - Get user's referral code
- `POST /apply` - Apply a referral code
- `GET /stats` - Get referral statistics
- `GET /earnings` - Get earnings history
- `POST /payout` - Request payout

### Frontend Implementation

**Service**: `frontend/src/services/referralService.js`
- Referral code management
- Earnings tracking
- Payout requests

### Features
- Unique referral codes for each user
- $5 reward per successful referral
- Track total, pending, and paid earnings
- Multiple payout methods (PayPal, bank transfer)
- Referral statistics dashboard
- Prevent self-referrals
- One-time referral per user

### Reward Flow
1. User A shares referral code with User B
2. User B signs up and applies code
3. Referral status: "pending"
4. User B completes onboarding/first action
5. Referral status: "completed"
6. User A earns $5 reward
7. User A can request payout when balance ≥ $10

---

## 3. Community Groups

### Backend Implementation

**Service**: `backend/src/services/socialService.js` (Groups section)
- Create and manage community groups
- Member management with roles
- Group posts and discussions
- Public and private groups
- Category-based organization

**API Endpoints**: `/api/social/groups`
- `POST /groups` - Create group
- `GET /groups` - Browse groups (with filters)
- `GET /groups/:groupId` - Get group details
- `PUT /groups/:groupId` - Update group
- `DELETE /groups/:groupId` - Delete group
- `POST /groups/:groupId/join` - Join group
- `DELETE /groups/:groupId/join` - Leave group
- `GET /groups/:groupId/members` - Get members
- `GET /users/:userId/groups` - Get user's groups
- `POST /groups/:groupId/posts` - Create group post
- `GET /groups/:groupId/posts` - Get group posts

### Frontend Implementation

**Service**: `frontend/src/services/socialService.js` (Groups methods)
- Full group management
- Member operations
- Group posts and feed

### Features
- Create public or private groups
- Categories: Health Goals, Dietary Preferences, Challenges, Support
- Member roles: admin, moderator, member
- Group posts with images
- Member directory
- Search and filter groups
- Join/leave groups
- Auto-increment member/post counts

### Group Categories
- **Health Goals**: Weight loss, muscle gain, wellness
- **Dietary Preferences**: Vegan, keto, gluten-free
- **Challenges**: 30-day challenges, competitions
- **Support**: Allergies, conditions, lifestyle

---

## Database Schema

### Shopping Lists
```sql
shopping_lists (id, user_id, name, description, is_shared, created_at, updated_at)
shopping_list_items (id, list_id, product_id, quantity, notes, is_checked, added_at)
```

### Referrals
```sql
referral_codes (id, user_id, code, uses, created_at)
referrals (id, referrer_user_id, referred_user_id, code, status, reward_amount, created_at, completed_at)
earnings (id, user_id, amount, type, reference_id, status, created_at)
payouts (id, user_id, amount, method, details, status, requested_at, processed_at)
```

### Community Groups
```sql
community_groups (id, name, description, is_private, category, created_by, member_count, post_count, created_at, updated_at)
group_members (id, group_id, user_id, role, joined_at)
group_posts (id, group_id, user_id, content, image_urls, like_count, comment_count, created_at, updated_at)
```

---

## Usage Examples

### 1. Shopping Lists

**Create List**
```javascript
import { shoppingListService } from '../services/shoppingListService';

const list = await shoppingListService.createList({
  name: 'Weekly Groceries',
  description: 'Healthy shopping for the week'
});
```

**Add Item**
```javascript
await shoppingListService.addItem(listId, productId, 2, 'Organic preferred');
```

**Generate from Meal Plan**
```javascript
const list = await shoppingListService.generateFromMealPlan(mealPlanId);
```

### 2. Referrals

**Get Referral Code**
```javascript
import { referralService } from '../services/referralService';

const code = await referralService.getReferralCode();
// Share: "Join Halo Health with my code: ABC123"
```

**Apply Code**
```javascript
await referralService.applyReferralCode('ABC123');
```

**Check Earnings**
```javascript
const { earnings, stats } = await referralService.getEarnings();
console.log(`Total: $${stats.total}, Pending: $${stats.pending}`);
```

**Request Payout**
```javascript
await referralService.requestPayout(25.00, 'paypal', {
  email: 'user@example.com'
});
```

### 3. Community Groups

**Create Group**
```javascript
import { socialService } from '../services/socialService';

const group = await socialService.createGroup(
  'Keto Warriors',
  'Support group for keto diet followers',
  false, // public
  'Dietary Preferences'
);
```

**Browse Groups**
```javascript
const { data } = await socialService.getGroups('Health Goals', null, 20, 0);
```

**Join Group**
```javascript
await socialService.joinGroup(groupId);
```

**Create Group Post**
```javascript
await socialService.createGroupPost(
  groupId,
  'Just hit my weight loss goal! 🎉',
  ['image-url.jpg']
);
```

---

## Testing

### Shopping Lists
1. Create a new shopping list
2. Add items manually
3. Generate list from meal plan
4. Check off items
5. Delete items and lists

### Referrals
1. Get your referral code
2. Share with test user
3. Test user applies code
4. Check referral stats
5. Request payout (test mode)

### Community Groups
1. Create a public group
2. Browse and search groups
3. Join a group
4. Post in group
5. View members
6. Leave group

---

## Future Enhancements

### Shopping Lists
- Store location integration
- Price tracking
- Recipe-to-list conversion
- Collaborative lists with real-time sync
- Barcode scanning to add items

### Referrals
- Tiered rewards (more referrals = higher rewards)
- Bonus challenges
- Leaderboards
- Social sharing integration
- Referral analytics dashboard

### Community Groups
- Group challenges
- Events and meetups
- Polls and surveys
- Group chat/messaging
- Moderation tools
- Group badges and achievements
- Featured groups

---

## Notes

- Shopping lists support both products and custom text items
- Referral codes are 8-character alphanumeric (e.g., "A1B2C3D4")
- Minimum payout threshold: $10
- Group creators are automatically admins
- Private groups require approval to join
- All features include proper RLS policies for security
