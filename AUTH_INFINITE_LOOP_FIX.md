# Auth Infinite Loop Fix

## Issue
The app was stuck in an infinite loop of `SIGNED_IN` events, preventing navigation to the main app.

## Root Cause
1. The `onAuthStateChange` listener was triggering on every state update
2. `syncUser` was causing re-renders that triggered more auth events
3. `initialRouteName` was being recalculated on every render
4. No proper handling of `INITIAL_SESSION` event

## Fixes Applied

### 1. Updated `useAuth` Hook
**File:** `frontend/src/hooks/useAuth.js`

Changes:
- Added `isInitialized` state to track first load
- Skip `INITIAL_SESSION` events (handled by `checkSession`)
- Only process `SIGNED_IN` if user changed or not initialized
- Added `mounted` flag to prevent updates after unmount
- Added dependencies to useEffect: `[isInitialized, user?.id]`
- Enhanced logging for debugging

### 2. Fixed AppNavigator
**File:** `frontend/src/navigation/AppNavigator.js`

Changes:
- Removed `initialRouteName` (was causing re-renders)
- Use conditional rendering with `renderScreens()`
- Proper loading screen with ActivityIndicator
- Only render necessary screens based on auth state

### 3. Better Logging
Added console logs to track:
- Session check start/complete
- User email when session found
- Onboarding and disclaimer status
- Auth state changes (with event type)

## How to Test

### 1. Clear Everything
```javascript
// In Debug screen or console
await storage.clearAll();
```

### 2. Restart App
- Close and reopen the app
- You should see in console:
  ```
  Checking session...
  No session found
  Session check complete
  ```

### 3. Sign In
- Sign in with your credentials
- You should see:
  ```
  Auth state changed: SIGNED_IN
  Checking session...
  Session found for user: your@email.com
  Onboarding completed: true
  Disclaimer accepted: true
  Session check complete
  ```

### 4. Verify Navigation
- If onboarding NOT completed → Onboarding screens
- If disclaimer NOT accepted → Medical Disclaimer
- If both completed → Main App

## Expected Console Output

### First Launch (New User)
```
Checking session...
No session found
Session check complete
```

### After Sign In (First Time)
```
Auth state changed: SIGNED_IN
Checking session...
Session found for user: user@example.com
Onboarding completed: null
Disclaimer accepted: null
Session check complete
```
→ Should show Onboarding

### After Onboarding
```
Onboarding completed: true
Disclaimer accepted: null
```
→ Should show Medical Disclaimer

### After Disclaimer
```
Onboarding completed: true
Disclaimer accepted: true
```
→ Should show Main App

### Subsequent Launches
```
Checking session...
Session found for user: user@example.com
Onboarding completed: true
Disclaimer accepted: true
Session check complete
```
→ Should go straight to Main App

## If Still Having Issues

### Issue: Still seeing infinite SIGNED_IN
**Solution:**
1. Go to Debug screen
2. Tap "Clear All Storage"
3. Force close app
4. Reopen app
5. Sign in again

### Issue: Stuck on loading screen
**Solution:**
1. Check console for errors
2. Verify Supabase connection
3. Check network connectivity
4. Try clearing storage

### Issue: Not navigating after sign in
**Solution:**
1. Check console logs for auth state
2. Verify onboarding/disclaimer flags
3. Use Debug screen to view state
4. Clear auth data and try again

## Debug Commands

### View Current State
```javascript
// In Debug screen, check:
- Auth State section
- AsyncStorage section
```

### Force Sign Out
```javascript
// In Debug screen
Tap "Force Sign Out"
```

### Clear Auth Data
```javascript
// In Debug screen
Tap "Clear Auth Data"
```

### View Console Logs
```javascript
// In terminal where Metro is running
// Look for:
- "Checking session..."
- "Auth state changed:"
- "Session found for user:"
```

## Prevention

To prevent this issue in the future:
1. Always skip `INITIAL_SESSION` events
2. Check if user changed before updating state
3. Use conditional rendering instead of `initialRouteName`
4. Add proper cleanup in useEffect
5. Use `mounted` flag to prevent updates after unmount

## Summary

The infinite loop was caused by:
- ❌ Processing every auth event
- ❌ Re-rendering on every state change
- ❌ Recalculating initialRouteName

Fixed by:
- ✅ Skipping INITIAL_SESSION
- ✅ Only updating when user changes
- ✅ Using conditional rendering
- ✅ Proper cleanup and mounted flag
- ✅ Better logging for debugging

The app should now navigate properly without infinite loops!
