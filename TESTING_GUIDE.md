# Testing Guide - Profile System Implementation

## 🧪 COMPLETE TESTING CHECKLIST

### Prerequisites
- [ ] Backend server running on `http://localhost:3001`
- [ ] Frontend app running on Expo
- [ ] Supabase database accessible
- [ ] Test device/emulator ready

---

## TEST SUITE 1: New User Registration Flow

### Test 1.1: Complete Registration
**Steps:**
1. Open app (should show Welcome screen)
2. Tap "Continue"
3. Select language (e.g., English)
4. Tap "Done"
5. View onboarding preview
6. Tap "Get Started"
7. Complete all 8 onboarding steps
8. Tap "Continue to Registration"
9. Fill in registration form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@test.com"
   - Halo Health ID: "johndoe123"
   - Password: "Test1234!"
   - Confirm Password: "Test1234!"
10. Tap "Create Account"

**Expected Result:**
✅ Navigate to VerifyEmail screen
✅ Email sent with 6-digit OTP

**Actual Result:** _____________

---

### Test 1.2: Email Verification
**Steps:**
1. Check email for OTP code
2. Enter 6-digit code
3. Tap "Verify Email"

**Expected Result:**
✅ Show "Email verified successfully!" message
✅ Navigate to Medical Disclaimer screen

**Actual Result:** _____________

---

### Test 1.3: Medical Disclaimer
**Steps:**
1. Scroll through disclaimer content
2. Check "I have read and understand" checkbox
3. Tap "Accept and Continue"

**Expected Result:**
✅ Navigate to ProfileSetup screen (NEW)

**Actual Result:** _____________

---

## TEST SUITE 2: Profile Setup (CRITICAL NEW FEATURE)

### Test 2.1: Profile Setup - Step 1 (Basic Info)
**Steps:**
1. Verify ProfileSetup screen appears
2. Check progress shows "Step 1 of 4"
3. Enter name: "John Doe"
4. Enter age: "30"
5. Select gender: "Male"
6. Tap "Continue"

**Expected Result:**
✅ Form validation passes
✅ Navigate to Step 2

**Actual Result:** _____________

---

### Test 2.2: Profile Setup - Step 2 (Health Goals)
**Steps:**
1. Verify "What are your health goals?" screen
2. Check progress shows "Step 2 of 4"
3. Select multiple goals:
   - Weight Loss
   - Healthy Eating
   - General Wellness
4. Tap "Continue"

**Expected Result:**
✅ At least one goal must be selected
✅ Navigate to Step 3

**Actual Result:** _____________

---

### Test 2.3: Profile Setup - Step 3 (Dietary Restrictions)
**Steps:**
1. Verify "Any dietary restrictions?" screen
2. Check progress shows "Step 3 of 4"
3. Select restrictions (optional):
   - Gluten-Free
   - Dairy-Free
4. Tap "Continue"

**Expected Result:**
✅ Can skip (no selection required)
✅ Navigate to Step 4

**Actual Result:** _____________

---

### Test 2.4: Profile Setup - Step 4 (Allergies)
**Steps:**
1. Verify "Do you have any allergies?" screen
2. Check progress shows "Step 4 of 4"
3. Select allergies (optional):
   - Peanuts
   - Shellfish
4. Tap "Complete Setup"

**Expected Result:**
✅ Show loading indicator
✅ Profile created in database
✅ Navigate to Home Dashboard

**Actual Result:** _____________

---

### Test 2.5: Profile Creation Validation
**Steps:**
1. Open Supabase dashboard
2. Navigate to `health_profiles` table
3. Find newly created profile

**Expected Result:**
✅ Profile exists with correct data:
   - user_id matches authenticated user
   - name = "John Doe"
   - age = 30
   - gender = "male"
   - is_primary = true
   - health_goals array contains selected goals

**Actual Result:** _____________

---

## TEST SUITE 3: Home Dashboard with Profiles

### Test 3.1: Profile Loading
**Steps:**
1. Verify Home Dashboard loads
2. Check ProfileSelector appears below header

**Expected Result:**
✅ ProfileSelector shows "John Doe" profile
✅ Profile is marked as active (highlighted)
✅ "Add Profile" button visible

**Actual Result:** _____________

---

### Test 3.2: Profile Selection Persistence
**Steps:**
1. Note active profile
2. Close app completely
3. Reopen app
4. Navigate to Home Dashboard

**Expected Result:**
✅ Same profile is active
✅ Profile selection persisted

**Actual Result:** _____________

---

### Test 3.3: Health Score Display
**Steps:**
1. Check Health Score card on dashboard
2. Verify score shows "0" (no scans yet)
3. Check subtitle text

**Expected Result:**
✅ Score ring shows 0
✅ Subtitle: "Start scanning to see your score"

**Actual Result:** _____________

---

## TEST SUITE 4: Scanner Integration (CRITICAL FIX)

### Test 4.1: Scanner Access
**Steps:**
1. From Home Dashboard, tap "Scan Product" button
2. Grant camera permission if prompted

**Expected Result:**
✅ Scanner opens successfully
✅ Camera view visible
✅ NO "No Profile Selected" error

**Actual Result:** _____________

---

### Test 4.2: Barcode Scanning
**Steps:**
1. Point camera at product barcode
2. Wait for scan to complete

**Expected Result:**
✅ Barcode detected
✅ Loading indicator shows
✅ API call made with profileId
✅ Navigate to ProductDetails OR show error if product not found

**Actual Result:** _____________

---

### Test 4.3: Scan History
**Steps:**
1. After scanning, go back to Home Dashboard
2. Check "Recent Scans" section

**Expected Result:**
✅ Scanned product appears in list
✅ Shows product name, brand, score
✅ Shows scan timestamp

**Actual Result:** _____________

---

## TEST SUITE 5: Multiple Profiles (Family Profiles)

### Test 5.1: Add Second Profile
**Steps:**
1. From Home Dashboard, tap "Add Profile" in ProfileSelector
2. Navigate to FamilyProfiles screen
3. Tap "Add Profile"
4. Fill in details:
   - Name: "Jane Doe"
   - Relationship: "Spouse"
   - Age: 28
   - Gender: Female
5. Save profile

**Expected Result:**
✅ Profile created
✅ Appears in ProfileSelector
✅ Can switch between profiles

**Actual Result:** _____________

---

### Test 5.2: Profile Switching
**Steps:**
1. From Home Dashboard, tap "Jane Doe" in ProfileSelector
2. Wait for data to reload

**Expected Result:**
✅ Active profile changes to "Jane Doe"
✅ Health score updates (shows 0 for new profile)
✅ Recent scans empty (no scans for this profile)
✅ Selection persisted to AsyncStorage

**Actual Result:** _____________

---

### Test 5.3: Profile-Specific Scans
**Steps:**
1. With "Jane Doe" active, scan a product
2. Go back to Home Dashboard
3. Switch to "John Doe" profile
4. Check Recent Scans

**Expected Result:**
✅ Jane's scan NOT visible in John's history
✅ Scans are profile-specific

**Actual Result:** _____________

---

## TEST SUITE 6: Error Handling

### Test 6.1: Network Error During Profile Creation
**Steps:**
1. Stop backend server
2. Complete profile setup steps
3. Tap "Complete Setup"

**Expected Result:**
✅ Show error alert
✅ "Unable to reach server" message
✅ User can retry

**Actual Result:** _____________

---

### Test 6.2: Invalid Profile Data
**Steps:**
1. In ProfileSetup Step 1, enter:
   - Name: "" (empty)
   - Age: "999"
   - Gender: not selected
2. Tap "Continue"

**Expected Result:**
✅ Show validation errors
✅ "Please enter your name"
✅ "Please enter a valid age"
✅ "Please select your gender"

**Actual Result:** _____________

---

### Test 6.3: Scanner Without Active Profile
**Steps:**
1. Manually clear AsyncStorage
2. Open Scanner

**Expected Result:**
✅ Show "No Profile Selected" alert
✅ Prompt to select profile from home

**Actual Result:** _____________

---

## TEST SUITE 7: Backend API Testing

### Test 7.1: GET /api/profiles
**Request:**
```bash
curl -X GET "http://localhost:3001/api/profiles?userId={userId}" \
  -H "Authorization: Bearer {token}"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "is_primary": true,
      "health_goals": ["weight_loss", "healthy_eating"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Actual Response:** _____________

---

### Test 7.2: POST /api/profiles
**Request:**
```bash
curl -X POST "http://localhost:3001/api/profiles" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Profile",
    "age": 25,
    "gender": "female",
    "is_primary": false,
    "health_goals": ["general_wellness"],
    "dietary_restrictions": ["vegan"],
    "allergies": ["peanuts"]
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Test Profile",
    ...
  }
}
```

**Actual Response:** _____________

---

## TEST SUITE 8: Edge Cases

### Test 8.1: Back Button During Profile Setup
**Steps:**
1. Complete Step 1 and 2
2. On Step 3, tap "Back" button
3. Verify Step 2 data is preserved
4. Tap "Continue" again

**Expected Result:**
✅ Previous selections preserved
✅ Can navigate back and forth
✅ Data not lost

**Actual Result:** _____________

---

### Test 8.2: App Backgrounding During Setup
**Steps:**
1. Start profile setup
2. Complete Step 1
3. Background app (home button)
4. Wait 30 seconds
5. Reopen app

**Expected Result:**
✅ Returns to ProfileSetup screen
✅ Progress preserved OR starts over (acceptable)

**Actual Result:** _____________

---

### Test 8.3: Maximum Profiles Limit
**Steps:**
1. Create 10 profiles
2. Try to create 11th profile

**Expected Result:**
✅ Show error: "Maximum 10 profiles allowed"

**Actual Result:** _____________

---

## 🎯 CRITICAL SUCCESS CRITERIA

### Must Pass:
- [ ] Profile creation completes successfully
- [ ] Profile appears in HomeDashboard
- [ ] Scanner opens without "No Profile Selected" error
- [ ] Scans are saved with correct profile_id
- [ ] Profile selection persists across app restarts

### Should Pass:
- [ ] All form validations work
- [ ] Error messages are user-friendly
- [ ] Loading states show properly
- [ ] Back navigation works
- [ ] Multiple profiles can be created

### Nice to Have:
- [ ] Smooth animations
- [ ] Instant profile switching
- [ ] Offline mode handling

---

## 📊 TEST RESULTS SUMMARY

| Test Suite | Total Tests | Passed | Failed | Skipped |
|------------|-------------|--------|--------|---------|
| Suite 1: Registration | 3 | ___ | ___ | ___ |
| Suite 2: Profile Setup | 5 | ___ | ___ | ___ |
| Suite 3: Home Dashboard | 3 | ___ | ___ | ___ |
| Suite 4: Scanner | 3 | ___ | ___ | ___ |
| Suite 5: Multiple Profiles | 3 | ___ | ___ | ___ |
| Suite 6: Error Handling | 3 | ___ | ___ | ___ |
| Suite 7: Backend API | 2 | ___ | ___ | ___ |
| Suite 8: Edge Cases | 3 | ___ | ___ | ___ |
| **TOTAL** | **25** | **___** | **___** | **___** |

---

## 🐛 BUG REPORT TEMPLATE

If any test fails, use this template:

```
**Test ID:** [e.g., Test 2.1]
**Test Name:** [e.g., Profile Setup - Step 1]
**Status:** FAILED
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Steps to Reproduce:**
1. 
2. 
3. 

**Error Message:** [If any]
**Screenshots:** [If applicable]
**Device:** [iOS/Android/Web]
**App Version:** [Version number]
**Backend Status:** [Running/Not Running]
```

---

## ✅ SIGN-OFF

**Tester Name:** _____________
**Date:** _____________
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] NEEDS REVIEW

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
