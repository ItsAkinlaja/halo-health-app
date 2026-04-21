# 🚀 Quick Start Guide - Make Halo Health Functional

## 🎯 Current Situation

**Good News:**
- ✅ Professional design system is complete
- ✅ Navigation structure is solid
- ✅ Main screens are beautifully designed
- ✅ Backend API is ready

**The Problem:**
- ❌ All screens use MOCK DATA (no real API calls)
- ❌ Onboarding screens are empty placeholders
- ❌ Many profile/settings screens are placeholders
- ❌ No state management connected

**Result:** App looks great but doesn't actually work with real data.

---

## 🔥 Top 5 Critical Tasks (Do These First)

### 1. Build Onboarding Screens (HIGHEST PRIORITY)
**Why:** Users can't complete onboarding, so they can't use the app.

**Files to Create:**
```
frontend/src/screens/onboarding/
  ├── OnboardingStep1.js  ← Welcome screen
  ├── OnboardingStep2.js  ← Health goals
  ├── OnboardingStep3.js  ← Dietary preferences
  ├── OnboardingStep4.js  ← Allergies
  ├── OnboardingStep5.js  ← Health conditions
  ├── OnboardingStep6.js  ← Family profiles
  ├── OnboardingStep7.js  ← Notifications
  └── OnboardingStep8.js  ← Permissions
```

**Time Estimate:** 2-3 days

---

### 2. Create API Service Layer
**Why:** Foundation for all real data. Currently everything is mocked.

**Files to Create:**
```javascript
// frontend/src/services/api.js
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  // Get auth token
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  },

  // Base request
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  },

  // GET request
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
```

**Then create specific services:**
```javascript
// frontend/src/services/productService.js
import { api } from './api';

export const productService = {
  searchProducts(query) {
    return api.get(`/api/products/search?q=${query}`);
  },

  getProductByBarcode(barcode) {
    return api.get(`/api/products/barcode/${barcode}`);
  },

  getProductDetails(productId) {
    return api.get(`/api/products/${productId}`);
  },
};

// frontend/src/services/scanService.js
import { api } from './api';

export const scanService = {
  scanBarcode(barcode, profileId) {
    return api.post('/api/scans/barcode', { barcode, profileId });
  },

  scanPhoto(imageUri, profileId) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    });
    formData.append('profileId', profileId);

    return api.request('/api/scans/photo', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getScanHistory(profileId) {
    return api.get(`/api/scans/history?profileId=${profileId}`);
  },
};
```

**Time Estimate:** 1-2 days

---

### 3. Connect Scanner to Backend
**Why:** Core feature of the app.

**Update Scanner.js:**
```javascript
// In handleBarCodeScanned function
import { scanService } from '../../services/scanService';
import { useAppContext } from '../../context/AppContext';

const { activeProfile } = useAppContext();

const handleBarCodeScanned = useCallback(async ({ data, type }) => {
  if (scanned) return;
  setScanned(true);
  
  try {
    // Call real API
    const result = await scanService.scanBarcode(data, activeProfile?.id);
    
    // Navigate with real data
    navigation.navigate('ProductDetails', { 
      productId: result.product.id,
      scanId: result.scan.id 
    });
  } catch (error) {
    Alert.alert('Scan Failed', error.message);
  } finally {
    setScanned(false);
  }
}, [scanned, navigation, activeProfile]);
```

**Time Estimate:** 1 day

---

### 4. Connect HomeDashboard to Real Data
**Why:** First screen users see after login.

**Update HomeDashboard.js:**
```javascript
import { useState, useEffect } from 'react';
import { scanService } from '../../services/scanService';
import { useAppContext } from '../../context/AppContext';

export default function HomeDashboard({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [activeProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data
      const scans = await scanService.getScanHistory(activeProfile?.id);
      setRecentScans(scans.slice(0, 5));
      
      // Calculate health score from scans
      const avgScore = scans.reduce((sum, s) => sum + s.score, 0) / scans.length;
      setHealthScore(Math.round(avgScore));
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Rest of component...
}
```

**Time Estimate:** 1 day

---

### 5. Build Essential Profile Screens
**Why:** Users need to manage their profile and family.

**Priority screens to build:**
1. **PersonalInfo** - Edit name, email, photo
2. **FamilyProfiles** - Add/edit family members
3. **SavedProducts** - View bookmarked products

**Time Estimate:** 2-3 days

---

## 📋 Week 1 Action Plan

### Monday-Tuesday: Onboarding Screens
- Build all 8 onboarding screens
- Use existing design system
- Follow professional medical aesthetic
- Test complete onboarding flow

### Wednesday: API Service Layer
- Create base API client
- Create productService
- Create scanService
- Create profileService

### Thursday: Connect Scanner
- Integrate scanService
- Add error handling
- Add loading states
- Test barcode scanning

### Friday: Connect HomeDashboard
- Fetch real scan history
- Calculate real health score
- Add pull-to-refresh
- Add error states

---

## 🛠️ Setup Instructions

### 1. Environment Variables

**Backend (.env):**
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# JWT
JWT_SECRET=your_jwt_secret

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development
```

**Frontend (.env):**
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Test Backend
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T...",
  "uptime": 123.45,
  "environment": "development"
}
```

---

## 🎨 Design Guidelines (Keep These in Mind)

### ✅ DO:
- Use theme.js for all colors, spacing, typography
- Follow 8pt spacing grid
- Use professional medical aesthetic
- Keep it clean and minimal
- Use soft greens, blues, whites
- Add loading states
- Add error handling
- Add empty states

### ❌ DON'T:
- Use emojis in UI (only in user content)
- Use childish icons or colors
- Use bright, loud colors
- Skip loading states
- Skip error handling
- Use inline styles (use StyleSheet)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:** 
- Check backend is running on port 3001
- Check EXPO_PUBLIC_API_URL in .env
- Use your computer's IP address, not localhost (for mobile)

### Issue: "Supabase auth not working"
**Solution:**
- Check Supabase URL and keys in .env
- Verify Supabase project is active
- Check RLS policies in Supabase

### Issue: "Camera not working"
**Solution:**
- Request camera permissions
- Check expo-camera is installed
- Test on real device (not simulator)

### Issue: "Onboarding not completing"
**Solution:**
- Check completeOnboarding() in useAuth
- Verify AsyncStorage is working
- Check navigation flow

---

## 📊 Progress Tracking

Use this checklist to track your progress:

### Week 1
- [ ] All 8 onboarding screens built
- [ ] API service layer created
- [ ] Scanner connected to backend
- [ ] HomeDashboard shows real data
- [ ] PersonalInfo screen built

### Week 2
- [ ] FamilyProfiles screen built
- [ ] SavedProducts screen built
- [ ] Allergies screen built
- [ ] State management connected
- [ ] Error handling added

### Week 3
- [ ] MealDetails screen built
- [ ] MealPlanner connected to backend
- [ ] NotificationSettings built
- [ ] Privacy screen built
- [ ] HelpCenter built

### Week 4
- [ ] All placeholder screens replaced
- [ ] Offline support added
- [ ] Push notifications working
- [ ] App fully functional
- [ ] Ready for testing

---

## 🎯 Definition of "Functional"

The app is considered functional when:

1. ✅ User can complete onboarding
2. ✅ User can scan a product barcode
3. ✅ User can view real product details
4. ✅ User can save products
5. ✅ User can view scan history
6. ✅ User can edit their profile
7. ✅ User can add family members
8. ✅ User can view meal plans
9. ✅ App handles errors gracefully
10. ✅ App works without crashes

---

## 💡 Pro Tips

1. **Start with onboarding** - Users can't use the app without it
2. **Use mock data initially** - Get UI working, then connect APIs
3. **Test on real device** - Camera and notifications need real device
4. **Add loading states everywhere** - Better UX
5. **Handle errors gracefully** - Show user-friendly messages
6. **Use AsyncStorage** - Cache data for offline use
7. **Test edge cases** - Empty states, no internet, etc.
8. **Follow the design system** - Consistency is key
9. **Commit often** - Small, focused commits
10. **Test as you build** - Don't wait until the end

---

## 📞 Need Help?

If you get stuck:
1. Check the IMPLEMENTATION_ROADMAP.md for detailed info
2. Review existing screens for patterns
3. Check backend API documentation
4. Test API endpoints with Postman/curl
5. Check console logs for errors

---

**Ready to start? Begin with Task #1: Build Onboarding Screens!**
