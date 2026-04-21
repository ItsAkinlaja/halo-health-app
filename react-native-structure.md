# React Native App Structure (Expo CLI)

## Project Setup

```bash
npx create-expo-app halo-health --template
cd halo-health
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install @supabase/supabase-js
npm install expo-camera expo-barcode-scanner expo-speech expo-av
npm install expo-notifications expo-permissions
npm install react-native-svg react-native-reanimated
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-maps
```

## App Structure

```
halo-health/
src/
  components/           # Reusable UI components
    common/
      Button/
      Card/
      Input/
      Modal/
      ScoreRing/
      ProfileSelector/
      VoiceInput/
    scanning/
      BarcodeScanner/
      ProductCard/
      IngredientList/
      HealthAnalysis/
    social/
      PostCard/
      UserAvatar/
      CommentSection/
    meal-planning/
      RecipeCard/
      MealPlanCard/
      ShoppingList/
  
  screens/              # Main app screens
    onboarding/
      OnboardingStep1/
      OnboardingStep2/
      ...
      OnboardingStep8/
    
    auth/
      Login/
      Register/
      ForgotPassword/
    
    main/
      HomeDashboard/
      Scanner/
      ProductDetails/
      Profile/
      MealPlanner/
      SocialFeed/
      Communities/
      Settings/
    
    features/
      WaterTesting/
      SupplementTracker/
      PersonalCareScanner/
      HouseholdScanner/
      BabyKidsScanner/
      RestaurantFinder/
      HealthScore/
      Challenges/
      NewsFeed/
      Earnings/
  
  navigation/           # Navigation configuration
    AppNavigator.js
    AuthNavigator.js
    MainNavigator.js
    OnboardingNavigator.js
    TabNavigator.js
  
  services/            # API and external services
    supabase.js
    api.js
    barcodeService.js
    voiceService.js
    notificationService.js
    locationService.js
    cameraService.js
  
  store/               # State management
    slices/
      authSlice.js
      profileSlice.js
      productSlice.js
      scanSlice.js
      mealSlice.js
      socialSlice.js
    store.js
  
  hooks/               # Custom hooks
    useAuth.js
    useProfile.js
    useScanner.js
    useVoice.js
    useNotifications.js
    useLocation.js
  
  utils/               # Utility functions
    constants.js
    helpers.js
    validators.js
    formatters.js
    calculations.js
  
  assets/              # Static assets
    images/
    icons/
    sounds/
    fonts/
  
  styles/              # Styling
    theme.js
    colors.js
    typography.js
    spacing.js
    
  types/               # TypeScript definitions
    api.types.js
    navigation.types.js
    user.types.js
    product.types.js
```

## Key Components Architecture

### 1. Scanner Component
```javascript
// src/components/scanning/BarcodeScanner.js
import React, { useState, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { useScanning } from '../../hooks/useScanning';

export const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { scanProduct } = useScanning();
  
  // Handle barcode scanning
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    await scanProduct(data);
  };
  
  return (
    <CameraView
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: [BarCodeScanner.Constants.BarCodeType],
      }}
    >
      {/* Scanner UI overlay */}
    </CameraView>
  );
};
```

### 2. Product Analysis Component
```javascript
// src/components/scanning/ProductAnalysis.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScoreRing } from '../common/ScoreRing';
import { IngredientList } from './IngredientList';
import { HaloAnalysis } from './HaloAnalysis';

export const ProductAnalysis = ({ product, userProfile, onPlayAudio }) => {
  const calculatePersonalScore = (product, profile) => {
    // Complex scoring algorithm based on user profile
    return personalizedScore;
  };
  
  const personalScore = calculatePersonalScore(product, userProfile);
  
  return (
    <ScrollView>
      <ScoreRing score={personalScore} />
      <HaloAnalysis 
        product={product} 
        profile={userProfile}
        onPlayAudio={onPlayAudio}
      />
      <IngredientList 
        ingredients={product.ingredients}
        userProfile={userProfile}
      />
    </ScrollView>
  );
};
```

### 3. Voice Input Component
```javascript
// src/components/common/VoiceInput.js
import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { useVoiceService } from '../../services/voiceService';

export const VoiceInput = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const { startRecording, stopRecording, transcribeAudio } = useVoiceService();
  
  const handleVoiceInput = async () => {
    if (isRecording) {
      const result = await stopRecording();
      const transcript = await transcribeAudio(result.uri);
      onTranscript(transcript);
    } else {
      await startRecording();
    }
    setIsRecording(!isRecording);
  };
  
  return (
    <TouchableOpacity onPress={handleVoiceInput}>
      <Text>{isRecording ? 'Stop Recording' : 'Start Voice Input'}</Text>
    </TouchableOpacity>
  );
};
```

### 4. Meal Planner Component
```javascript
// src/components/meal-planning/MealPlanner.js
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { MealPlanCard } from './MealPlanCard';
import { RecipeCard } from './RecipeCard';

export const MealPlanner = ({ profileId }) => {
  const [activePlan, setActivePlan] = useState(null);
  const { generateMealPlan, getActivePlan, updateMeal } = useMealPlanning();
  
  const handleGeneratePlan = async (preferences) => {
    const plan = await generateMealPlan(profileId, preferences);
    setActivePlan(plan);
  };
  
  return (
    <ScrollView>
      {activePlan ? (
        <MealPlanCard 
          plan={activePlan}
          onUpdateMeal={updateMeal}
        />
      ) : (
        <MealPlanGenerator onGenerate={handleGeneratePlan} />
      )}
    </ScrollView>
  );
};
```

## Navigation Structure

### Main Navigator
```javascript
// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeDashboard } from '../screens/main/HomeDashboard';
import { Scanner } from '../screens/main/Scanner';
import { SocialFeed } from '../screens/main/SocialFeed';
import { MealPlanner } from '../screens/main/MealPlanner';
import { Profile } from '../screens/main/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeDashboard} />
      <Tab.Screen name="Scanner" component={Scanner} />
      <Tab.Screen name="Social" component={SocialFeed} />
      <Tab.Screen name="Meals" component={MealPlanner} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};
```

## State Management (Redux Toolkit)

### Auth Slice
```javascript
// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    signOut: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      });
  },
});
```

## Theme System

### Colors and Theme
```javascript
// src/styles/theme.js
export const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  
  // Score colors
  excellent: '#4CAF50',
  good: '#8BC34A',
  okay: '#FFC107',
  bad: '#FF9800',
  avoid: '#F44336',
};

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
};
```

## Key Features Implementation

### 1. Voice Integration
```javascript
// src/services/voiceService.js
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export const voiceService = {
  speak: (text, voice = 'default') => {
    const speechOptions = {
      voice: voice,
      rate: 0.9,
      pitch: 1.0,
    };
    return Speech.speak(text, speechOptions);
  },
  
  startRecording: async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    return recording;
  },
  
  stopRecording: async (recording) => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return { uri };
  },
};
```

### 2. Barcode Scanning Service
```javascript
// src/services/barcodeService.js
import { api } from './api';

export const barcodeService = {
  scanProduct: async (barcode) => {
    try {
      const response = await api.post('/products/scan', { barcode });
      return response.data;
    } catch (error) {
      // Handle barcode not found - initiate photo scan
      return { needsPhotoScan: true, barcode };
    }
  },
  
  analyzePhoto: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product-label.jpg',
    });
    
    const response = await api.post('/products/analyze-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};
```

### 3. Notification Service
```javascript
// src/services/notificationService.js
import * as Notifications from 'expo-notifications';

export const notificationService = {
  requestPermissions: async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },
  
  scheduleDailyTip: (tip, time) => {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Health Tip from Halo",
        body: tip,
        sound: 'default',
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });
  },
  
  sendRecallAlert: (product) => {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: "Product Recall Alert",
        body: `${product.name} has been recalled. Check your saved products.`,
        data: { productId: product.id, type: 'recall' },
        sound: 'default',
        priority: 'high',
      },
      trigger: null, // Immediate
    });
  },
};
```

## Performance Optimizations

### 1. Image Caching
```javascript
// src/utils/imageCache.js
import { FileSystem } from 'expo-file-system';

export const imageCache = {
  cacheImage: async (uri) => {
    const filename = uri.split('/').pop();
    const cacheUri = `${FileSystem.cacheDirectory}${filename}`;
    
    try {
      const info = await FileSystem.getInfoAsync(cacheUri);
      if (info.exists) {
        return cacheUri;
      }
      
      await FileSystem.downloadAsync(uri, cacheUri);
      return cacheUri;
    } catch (error) {
      return uri;
    }
  },
};
```

### 2. Data Preloading
```javascript
// src/utils/preloader.js
export const preloader = {
  preloadUserData: async (userId) => {
    // Preload essential user data
    const [profile, savedProducts, recentScans] = await Promise.all([
      api.get(`/profiles/${userId}`),
      api.get(`/saved-products/${userId}`),
      api.get(`/scans/recent/${userId}`),
    ]);
    
    return { profile, savedProducts, recentScans };
  },
};
```

## Testing Strategy

### Component Testing
```javascript
// src/components/__tests__/BarcodeScanner.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BarcodeScanner } from '../scanning/BarcodeScanner';

describe('BarcodeScanner', () => {
  it('should handle barcode scan correctly', () => {
    const mockScanProduct = jest.fn();
    const { getByTestId } = render(<BarcodeScanner onScan={mockScanProduct} />);
    
    // Simulate barcode scan
    fireEvent(getByTestId('barcode-scanner'), 'barcodeScanned', {
      type: 'QR_CODE',
      data: '123456789',
    });
    
    expect(mockScanProduct).toHaveBeenCalledWith('123456789');
  });
});
```

## Deployment Configuration

### App.json
```json
{
  "expo": {
    "name": "Halo Health",
    "slug": "halo-health",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.halohealth.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.halohealth.app",
      "versionCode": 1
    },
    "plugins": [
      ["expo-camera"],
      ["expo-barcode-scanner"],
      ["expo-speech"],
      ["expo-notifications"]
    ]
  }
}
```
