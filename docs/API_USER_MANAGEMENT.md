# User Management API Documentation

## Overview
User management endpoints for account operations, data export, and GDPR/CCPA compliance.

## Base URL
```
http://localhost:3001/api/users
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### 1. Get User Account
Get current user's account information.

**Endpoint:** `GET /account`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z",
    "last_sign_in_at": "2026-01-15T10:30:00Z",
    "user_metadata": {
      "name": "John Doe",
      "preferences": {}
    }
  }
}
```

---

### 2. Export User Data
Export all user data (GDPR/CCPA compliance).

**Endpoint:** `GET /export`

**Response:**
```json
{
  "status": "success",
  "data": {
    "export_date": "2026-01-15T10:30:00Z",
    "user_account": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2026-01-01T00:00:00Z"
    },
    "health_profiles": [...],
    "product_scans": [...],
    "saved_products": [...],
    "meals": [...],
    "meal_plans": [...],
    "notifications": [...],
    "coach_messages": [...],
    "health_scores": [...],
    "statistics": {
      "total_profiles": 2,
      "total_scans": 150,
      "total_saved_products": 25,
      "total_meals": 84,
      "total_meal_plans": 3
    }
  },
  "message": "Your data export is ready. In production, this would be sent to your email."
}
```

---

### 3. Request Data Export via Email
Request data export to be sent via email (production implementation).

**Endpoint:** `POST /export/request`

**Response:**
```json
{
  "status": "success",
  "message": "Your data export request has been received. You will receive an email with a download link within 24 hours."
}
```

---

### 4. Delete User Data
Delete user's scan data while keeping the account active.

**Endpoint:** `DELETE /data`

**Response:**
```json
{
  "status": "success",
  "message": "Your scan data has been deleted successfully."
}
```

**What gets deleted:**
- Product scans
- Saved products
- Health scores

**What remains:**
- User account
- Health profiles
- Meal plans
- Notifications

---

### 5. Delete User Account
Permanently delete user account and all associated data (GDPR/CCPA compliance).

**Endpoint:** `DELETE /account`

**Request Body:**
```json
{
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Your account and all associated data have been permanently deleted."
}
```

**What gets deleted:**
- User account (auth)
- All health profiles
- All product scans
- All saved products
- All meals and meal plans
- All notifications
- All coach messages
- All health scores
- All social posts
- All community memberships
- All settings and preferences
- Everything associated with the user

**Note:** This action is irreversible. The user will be signed out immediately.

---

### 6. Update User Preferences
Update user preferences and settings.

**Endpoint:** `PUT /preferences`

**Request Body:**
```json
{
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true
    },
    "language": "en"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true
      },
      "language": "en"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "errors": [
    {
      "msg": "Confirmation must be \"DELETE_MY_ACCOUNT\"",
      "param": "confirmation",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## GDPR/CCPA Compliance

### Right to Access
Users can access all their data via `GET /export`.

### Right to Deletion
Users can delete their account via `DELETE /account`.

### Right to Data Portability
Users can export their data in JSON format via `GET /export`.

### Right to Rectification
Users can update their data via profile and settings endpoints.

---

## Security Considerations

1. **Account Deletion Confirmation**
   - Requires explicit confirmation string to prevent accidental deletion
   - Irreversible action with clear warnings

2. **Data Export**
   - Only returns data for authenticated user
   - No access to other users' data

3. **Rate Limiting**
   - All endpoints are rate-limited to prevent abuse
   - 100 requests per 15 minutes per IP

4. **Authentication**
   - All endpoints require valid JWT token
   - Tokens expire after session timeout

---

## Frontend Integration

### Example: Delete Account
```javascript
import { userService } from './services/userService';

const handleDeleteAccount = async () => {
  try {
    await userService.deleteUserAccount();
    await signOut();
    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
  } catch (error) {
    Alert.alert('Error', 'Failed to delete account.');
  }
};
```

### Example: Export Data
```javascript
import { userService } from './services/userService';

const handleExportData = async () => {
  try {
    const data = await userService.exportUserData();
    // Handle exported data
    console.log('Exported data:', data);
  } catch (error) {
    Alert.alert('Error', 'Failed to export data.');
  }
};
```

---

## Testing

### Test Account Deletion
```bash
curl -X DELETE http://localhost:3001/api/users/account \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "DELETE_MY_ACCOUNT"}'
```

### Test Data Export
```bash
curl -X GET http://localhost:3001/api/users/export \
  -H "Authorization: Bearer <token>"
```

### Test Data Deletion
```bash
curl -X DELETE http://localhost:3001/api/users/data \
  -H "Authorization: Bearer <token>"
```

---

## Production Considerations

1. **Email Integration**
   - Implement email service for data export links
   - Send confirmation emails for account deletion
   - Use secure, expiring download links

2. **Background Jobs**
   - Process data exports asynchronously
   - Queue account deletions for batch processing
   - Clean up orphaned data

3. **Audit Logging**
   - Log all account deletions
   - Log data export requests
   - Maintain compliance records

4. **Data Retention**
   - Define retention policies
   - Implement soft deletes where required
   - Archive data before permanent deletion

---

## Support

For issues or questions:
- Email: support@halohealth.com
- Documentation: https://docs.halohealth.com
- API Status: https://status.halohealth.com
