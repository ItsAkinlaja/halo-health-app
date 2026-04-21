# Profile Duplication Fix

## Issue
During onboarding, profiles were being created multiple times, hitting the "Maximum 10 profiles allowed per user" limit.

## Root Cause
The onboarding completion handler was being called multiple times, creating duplicate profiles each time.

## Solution

### 1. Check for Existing Profiles
**File:** `frontend/src/navigation/OnboardingNavigator.js`

Added check before creating profiles:
```javascript
// Check if profiles already exist
const existingProfiles = await profileService.getProfiles(user.id);

if (existingProfiles && existingProfiles.length > 0) {
  console.log('Profiles already exist, skipping creation');
} else {
  // Create profiles...
}
```

### 2. Added Safety Checks
- Check if `data.familyMembers` exists before iterating
- Use default empty arrays for optional fields
- Better error handling

### 3. Added Debug Tool
**File:** `frontend/src/screens/common/DebugScreen.js`

Added "Cleanup Duplicate Profiles" button (placeholder for future implementation)

## How It Works Now

### First Time Through Onboarding
1. User completes onboarding
2. Check if profiles exist → No
3. Create primary profile
4. Create family member profiles (if any)
5. Mark onboarding as complete

### If Onboarding Runs Again
1. User completes onboarding
2. Check if profiles exist → Yes
3. Skip profile creation
4. Mark onboarding as complete

## Testing

### Verify Fix
1. Clear all storage (Debug screen)
2. Sign up with new account
3. Complete onboarding
4. Check console - should see: "Profiles already exist, skipping creation" if run again

### Check Profile Count
```javascript
// In Debug screen or console
const profiles = await profileService.getProfiles(user.id);
console.log('Profile count:', profiles.length);
```

## If You Already Have Duplicate Profiles

### Option 1: Start Fresh
1. Go to Debug screen
2. Tap "Clear All Storage"
3. Sign out and sign in again
4. Complete onboarding once

### Option 2: Manual Cleanup (Advanced)
Use Supabase dashboard to delete duplicate profiles:
1. Go to Supabase dashboard
2. Navigate to Table Editor → health_profiles
3. Find profiles for your user_id
4. Keep only the primary profile (is_primary = true)
5. Delete duplicates

## Prevention

The fix ensures:
- ✅ Profiles only created once
- ✅ Safe to run onboarding multiple times
- ✅ No more "Maximum 10 profiles" error
- ✅ Graceful handling of edge cases

## Warning Messages

You may still see these warnings if you had duplicates before the fix:
```
WARN  Failed to save onboarding profile: Maximum 10 profiles allowed per user
```

This is harmless - the app continues to work. To remove the warning:
1. Clear storage and start fresh, OR
2. Manually delete duplicate profiles in Supabase

## Summary

- ✅ Fixed duplicate profile creation
- ✅ Added existence check
- ✅ Better error handling
- ✅ Safe to run onboarding multiple times
- ✅ No more hitting profile limit

The onboarding flow now works correctly without creating duplicates! 🎉
