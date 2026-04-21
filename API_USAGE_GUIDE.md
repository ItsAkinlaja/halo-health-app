# 🚀 Quick Reference Guide - Using What We Built

## API Services - How to Use

### 1. Product Service

```javascript
import { productService } from '../services/productService';

// Search products
const searchProducts = async (query) => {
  try {
    const results = await productService.searchProducts(query, {
      limit: 20,
      offset: 0
    });
    console.log('Found products:', results);
  } catch (error) {
    console.error('Search failed:', error.message);
  }
};

// Get product by barcode
const scanBarcode = async (barcode) => {
  try {
    const product = await productService.getProductByBarcode(barcode);
    console.log('Product:', product);
  } catch (error) {
    console.error('Barcode scan failed:', error.message);
  }
};

// Save product
const saveProduct = async (productId, profileId) => {
  try {
    await productService.saveProduct(productId, profileId);
    console.log('Product saved!');
  } catch (error) {
    console.error('Save failed:', error.message);
  }
};

// Get saved products
const getSavedProducts = async (profileId) => {
  try {
    const products = await productService.getSavedProducts(profileId);
    console.log('Saved products:', products);
  } catch (error) {
    console.error('Failed to load saved products:', error.message);
  }
};
```

---

### 2. Scan Service

```javascript
import { scanService } from '../services/scanService';

// Scan barcode
const scanBarcode = async (barcode, profileId) => {
  try {
    const result = await scanService.scanBarcode(barcode, profileId);
    console.log('Scan result:', result);
    // Navigate to product details
    navigation.navigate('ProductDetails', { 
      productId: result.product.id,
      scanId: result.scan.id 
    });
  } catch (error) {
    Alert.alert('Scan Failed', error.message);
  }
};

// Scan photo (OCR)
const scanPhoto = async (imageUri, profileId) => {
  try {
    const result = await scanService.scanPhoto(imageUri, profileId);
    console.log('OCR result:', result);
  } catch (error) {
    Alert.alert('Photo Scan Failed', error.message);
  }
};

// Get scan history
const loadScanHistory = async (profileId) => {
  try {
    const scans = await scanService.getScanHistory(profileId, {
      limit: 50,
      offset: 0
    });
    console.log('Scan history:', scans);
  } catch (error) {
    console.error('Failed to load history:', error.message);
  }
};

// Get scan statistics
const loadStats = async (profileId) => {
  try {
    const stats = await scanService.getScanStats(profileId, '30d');
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Failed to load stats:', error.message);
  }
};
```

---

### 3. Profile Service

```javascript
import { profileService } from '../services/profileService';

// Get user profile
const loadUserProfile = async (userId) => {
  try {
    const profile = await profileService.getUserProfile(userId);
    console.log('User profile:', profile);
  } catch (error) {
    console.error('Failed to load profile:', error.message);
  }
};

// Update profile
const updateProfile = async (profileId, data) => {
  try {
    await profileService.updateProfile(profileId, {
      name: 'John Doe',
      age: 30,
      // ... other fields
    });
    console.log('Profile updated!');
  } catch (error) {
    Alert.alert('Update Failed', error.message);
  }
};

// Get family profiles
const loadFamilyProfiles = async (userId) => {
  try {
    const profiles = await profileService.getProfiles(userId);
    console.log('Family profiles:', profiles);
  } catch (error) {
    console.error('Failed to load profiles:', error.message);
  }
};

// Create family member
const addFamilyMember = async (data) => {
  try {
    const newProfile = await profileService.createProfile({
      userId: currentUserId,
      name: 'Jane Doe',
      age: 8,
      relationship: 'Daughter',
      // ... other fields
    });
    console.log('Family member added:', newProfile);
  } catch (error) {
    Alert.alert('Failed to Add Member', error.message);
  }
};

// Update dietary restrictions
const updateDietaryRestrictions = async (profileId, restrictions) => {
  try {
    await profileService.updateDietaryRestrictions(profileId, restrictions);
    console.log('Restrictions updated!');
  } catch (error) {
    Alert.alert('Update Failed', error.message);
  }
};

// Update allergies
const updateAllergies = async (profileId, allergies) => {
  try {
    await profileService.updateAllergies(profileId, allergies);
    console.log('Allergies updated!');
  } catch (error) {
    Alert.alert('Update Failed', error.message);
  }
};
```

---

### 4. Meal Service

```javascript
import { mealService } from '../services/mealService';

// Get meal plans
const loadMealPlans = async (profileId) => {
  try {
    const plans = await mealService.getMealPlans(profileId, {
      limit: 10,
      offset: 0
    });
    console.log('Meal plans:', plans);
  } catch (error) {
    console.error('Failed to load meal plans:', error.message);
  }
};

// Generate AI meal plan
const generateMealPlan = async (profileId) => {
  try {
    const plan = await mealService.generateMealPlan(profileId, {
      days: 7,
      calorieTarget: 2000,
      preferences: ['vegetarian'],
    });
    console.log('Generated plan:', plan);
  } catch (error) {
    Alert.alert('Generation Failed', error.message);
  }
};

// Log a meal
const logMeal = async (data) => {
  try {
    await mealService.logMeal({
      profileId: currentProfileId,
      date: new Date().toISOString(),
      mealType: 'breakfast',
      name: 'Oatmeal with berries',
      calories: 350,
      // ... other fields
    });
    console.log('Meal logged!');
  } catch (error) {
    Alert.alert('Failed to Log Meal', error.message);
  }
};

// Get meals for date
const loadMealsForDate = async (profileId, date) => {
  try {
    const meals = await mealService.getMealsByDate(profileId, date);
    console.log('Meals:', meals);
  } catch (error) {
    console.error('Failed to load meals:', error.message);
  }
};
```

---

### 5. Notification Service

```javascript
import { notificationService } from '../services/notificationService';

// Get notifications
const loadNotifications = async (userId) => {
  try {
    const notifications = await notificationService.getNotifications(userId, {
      limit: 50,
      offset: 0,
      unreadOnly: false
    });
    console.log('Notifications:', notifications);
  } catch (error) {
    console.error('Failed to load notifications:', error.message);
  }
};

// Mark as read
const markNotificationRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId);
    console.log('Marked as read!');
  } catch (error) {
    console.error('Failed to mark as read:', error.message);
  }
};

// Get unread count
const loadUnreadCount = async (userId) => {
  try {
    const { count } = await notificationService.getUnreadCount(userId);
    console.log('Unread count:', count);
  } catch (error) {
    console.error('Failed to load count:', error.message);
  }
};

// Register push token
const registerPushToken = async (userId, token) => {
  try {
    await notificationService.registerPushToken(
      userId,
      token,
      Platform.OS
    );
    console.log('Push token registered!');
  } catch (error) {
    console.error('Failed to register token:', error.message);
  }
};
```

---

## Onboarding Flow - How to Use

### Navigation Setup (Already Done)
The onboarding flow is already set up in `OnboardingNavigator.js`:

```javascript
// Flow:
OnboardingStep1 → OnboardingStep2 → ... → OnboardingStep8 → Complete

// Each step calls nextStep() to move forward
// Each step can go back with navigation.goBack()
```

### Storing Onboarding Data

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In each onboarding step, store the data:

// Step 2 - Health Goals
const handleContinue = async () => {
  await AsyncStorage.setItem('healthGoals', JSON.stringify(selectedGoals));
  nextStep();
};

// Step 3 - Dietary Preferences
const handleContinue = async () => {
  await AsyncStorage.setItem('dietaryPreferences', JSON.stringify(selectedPreferences));
  nextStep();
};

// Step 4 - Allergies
const handleContinue = async () => {
  await AsyncStorage.setItem('allergies', JSON.stringify(selectedAllergies));
  nextStep();
};

// Step 5 - Health Conditions
const handleContinue = async () => {
  await AsyncStorage.setItem('healthConditions', JSON.stringify(selectedConditions));
  nextStep();
};

// Step 6 - Family Members
const handleContinue = async () => {
  await AsyncStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  nextStep();
};

// Step 7 - Notification Settings
const handleContinue = async () => {
  await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
  nextStep();
};

// Step 8 - Complete
const handleComplete = async () => {
  // Save all data to backend
  const healthGoals = JSON.parse(await AsyncStorage.getItem('healthGoals'));
  const dietaryPreferences = JSON.parse(await AsyncStorage.getItem('dietaryPreferences'));
  // ... get all other data
  
  // Create user profile
  await profileService.updateUserProfile(userId, {
    healthGoals,
    dietaryPreferences,
    allergies,
    healthConditions,
    // ... other fields
  });
  
  // Create family profiles
  for (const member of familyMembers) {
    await profileService.createProfile({
      userId,
      ...member
    });
  }
  
  // Complete onboarding
  await completeOnboarding();
};
```

---

## Error Handling Pattern

```javascript
// All API calls should follow this pattern:

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const loadData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await someService.someMethod();
    // Handle success
    setData(data);
  } catch (error) {
    // Handle error
    setError(error.message);
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};

// In render:
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

---

## Loading States

```javascript
// Show loading spinner while fetching data:

{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
) : (
  // Show data
)}
```

---

## Empty States

```javascript
// Show empty state when no data:

{data.length === 0 ? (
  <View style={styles.emptyContainer}>
    <Ionicons name="folder-open-outline" size={48} color={COLORS.textTertiary} />
    <Text style={styles.emptyTitle}>No items yet</Text>
    <Text style={styles.emptyDescription}>
      Start by scanning your first product
    </Text>
  </View>
) : (
  // Show data list
)}
```

---

## Cache Management

```javascript
import { api } from '../services/api';

// Clear all cache
api.clearCache();

// Invalidate specific cache
api.invalidateCache('products'); // Clears all product-related cache
api.invalidateCache('scans');    // Clears all scan-related cache
```

---

## Environment Variables

```bash
# frontend/.env

# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
EXPO_PUBLIC_API_URL=http://localhost:3001

# For production:
# EXPO_PUBLIC_API_URL=https://api.halohealth.com
```

---

## Testing API Services

```javascript
// Test in a screen or component:

import { productService } from '../services/productService';

useEffect(() => {
  testAPI();
}, []);

const testAPI = async () => {
  try {
    // Test product search
    const products = await productService.searchProducts('cereal');
    console.log('✅ Product search works:', products);
    
    // Test barcode scan
    const product = await productService.getProductByBarcode('038000845024');
    console.log('✅ Barcode scan works:', product);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};
```

---

## Common Patterns

### 1. Fetch Data on Mount
```javascript
useEffect(() => {
  loadData();
}, []);
```

### 2. Refresh Data
```javascript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};

// In ScrollView:
<ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
```

### 3. Pagination
```javascript
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || loading) return;
  
  const newData = await someService.getData({
    limit: 20,
    offset: page * 20
  });
  
  if (newData.length < 20) {
    setHasMore(false);
  }
  
  setData(prev => [...prev, ...newData]);
  setPage(prev => prev + 1);
};
```

---

## Next Steps

### 1. Connect Scanner
Update `Scanner.js` to use `scanService`:
```javascript
const handleBarCodeScanned = async ({ data }) => {
  const result = await scanService.scanBarcode(data, activeProfile.id);
  navigation.navigate('ProductDetails', { productId: result.product.id });
};
```

### 2. Connect HomeDashboard
Update `HomeDashboard.js` to use real data:
```javascript
const loadDashboardData = async () => {
  const scans = await scanService.getScanHistory(activeProfile.id);
  const stats = await scanService.getScanStats(activeProfile.id);
  // Update state
};
```

### 3. Connect ProductDetails
Update `ProductDetails.js` to fetch real product data:
```javascript
const loadProductDetails = async (productId) => {
  const product = await productService.getProductDetails(productId);
  // Update state
};
```

---

**🎉 You're all set! Start integrating these services into your screens.**
