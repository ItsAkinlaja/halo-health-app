# Onboarding Completion Troubleshooting

## Issue
"Complete Setup" button at the end of onboarding not navigating to next screen.

## Diagnostic Logging Added

### What to Check in Console

When you tap "Complete Setup", you should see:

```
Starting onboarding completion...
OnboardingStep8Wrapper: handleComplete called
User ID: <your-user-id>
Checking for existing profiles...
Existing profiles count: 0 (or more)
Calling completeOnboarding...
completeOnboarding: Setting onboarding as completed
completeOnboarding: Updating state - isFirstTime=false, needsDisclaimer=true
completeOnboarding: Complete
completeOnboarding finished
Onboarding completion successful
```

## Common Issues & Solutions

### Issue 1: Button Disabled (Grayed Out)
**Symptom:** Can't tap the button
**Cause:** Camera permission not granted
**Solution:**
1. Tap "Grant Permission" on Camera Access
2. Allow camera access when prompted
3. Button should become enabled

### Issue 2: Button Does Nothing
**Symptom:** Button taps but nothing happens
**Check Console For:**
- Any error messages
- Whether `handleComplete` is being called
- Whether `completeOnboarding` is being called

**Solutions:**
1. Check if there's an error in console
2. Verify user is authenticated (check user ID in logs)
3. Try restarting the app

### Issue 3: Stuck After Tapping
**Symptom:** Loading spinner shows but never completes
**Check Console For:**
- Profile creation errors
- Storage errors
- Network errors

**Solutions:**
1. Check internet connection
2. Verify Supabase is accessible
3. Check if profile limit reached (should skip creation now)

### Issue 4: Navigation Not Happening
**Symptom:** Completion succeeds but doesn't navigate
**Check Console For:**
```
completeOnboarding: Complete
completeOnboarding finished
Onboarding completion successful
```

**If you see these logs but no navigation:**
1. Check AppNavigator state
2. Verify `needsDisclaimer` is being set to `true`
3. Check if MedicalDisclaimer screen is registered

## Expected Flow

```
User taps "Complete Setup"
    ↓
handleComplete() called
    ↓
Check camera permission
    ↓
Call nextStep()
    ↓
OnboardingStep8Wrapper.handleComplete()
    ↓
Check/Create profiles
    ↓
Call completeOnboarding()
    ↓
Set onboarding completed in storage
    ↓
Update state: isFirstTime=false, needsDisclaimer=true
    ↓
AppNavigator detects state change
    ↓
Navigate to MedicalDisclaimer screen ✅
```

## Debug Steps

### Step 1: Check Console
Tap "Complete Setup" and watch the console. Note where the logs stop.

### Step 2: Check Permissions
Verify camera permission is granted:
- Look for green "Granted" badge
- Button should be blue (not gray)

### Step 3: Check User State
In Debug screen, verify:
- User ID exists
- User is authenticated
- No errors in auth state

### Step 4: Check Storage
In Debug screen, check AsyncStorage:
- `onboardingCompleted` should be `true` after completion
- `medicalDisclaimerAccepted` should be `null` or `false`

### Step 5: Force Navigation
If completion works but navigation doesn't:
1. Go to Debug screen
2. Check auth state
3. Manually set flags if needed

## Manual Fix

If button still not working:

### Option 1: Skip Onboarding
```javascript
// In Debug screen or console
await storage.setItem('onboardingCompleted', true);
// Then restart app
```

### Option 2: Clear and Restart
```javascript
// In Debug screen
1. Tap "Clear All Storage"
2. Restart app
3. Go through onboarding again
```

### Option 3: Direct Navigation
```javascript
// In Debug screen, after tapping Complete Setup
// If it doesn't navigate, manually trigger:
navigation.replace('MedicalDisclaimer');
```

## What the Logs Tell You

### If you see:
```
Starting onboarding completion...
```
But nothing else → Check if `nextStep` prop is passed correctly

### If you see:
```
OnboardingStep8Wrapper: handleComplete called
User ID: undefined
```
→ User not authenticated, sign in again

### If you see:
```
Failed to save onboarding profile: <error>
```
→ Profile creation failed, but should continue anyway

### If you see:
```
completeOnboarding: Complete
```
But no navigation → Check AppNavigator state management

## Testing Checklist

- [ ] Camera permission granted
- [ ] Button is enabled (blue, not gray)
- [ ] Console shows all expected logs
- [ ] No errors in console
- [ ] User is authenticated
- [ ] Storage is accessible
- [ ] Navigation state updates

## Quick Test

1. **Clear everything:**
   ```
   Debug screen → Clear All Storage
   ```

2. **Sign in fresh**

3. **Go through onboarding quickly:**
   - Skip most steps
   - Grant camera permission on last step
   - Tap Complete Setup

4. **Watch console:**
   - Should see all logs
   - Should navigate to disclaimer

5. **If it works:**
   - Issue was with old data
   - Fresh start fixed it

6. **If it doesn't work:**
   - Note where logs stop
   - Check for errors
   - Report with console output

## Summary

The button should work with the added logging. If it doesn't:
1. Check console logs to see where it stops
2. Verify camera permission is granted
3. Try clearing storage and starting fresh
4. Report the console output for further debugging

The logs will tell us exactly what's happening! 🔍
