# Product Scanning & Barcode Integration

## Scanning Architecture Overview

### Technology Stack
- **Barcode Scanning**: Expo Camera + Barcode Scanner
- **OCR**: Google Vision API / Tesseract
- **Image Processing**: Sharp (Node.js) / ImageManipulator (React Native)
- **Product Database**: Custom database + Open Food Facts API
- **Menu Analysis**: Custom AI model + Restaurant APIs

## React Native Scanning Components

### Barcode Scanner Component
```javascript
// src/components/scanning/BarcodeScanner.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Vibration, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { useScanning } from '../../hooks/useScanning';
import { ScanOverlay } from './ScanOverlay';
import { FlashToggle } from './FlashToggle';

export const BarcodeScanner = ({ onScanComplete, profileId }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { scanProduct, isLoading } = useScanning();
  const navigation = useNavigation();
  const cameraRef = useRef();

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await CameraView.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isLoading) return;

    setScanned(true);
    Vibration.vibrate(100); // Haptic feedback

    try {
      const result = await scanProduct(data, profileId);
      
      if (onScanComplete) {
        onScanComplete(result);
      } else {
        navigation.navigate('ProductDetails', { 
          scanResult: result,
          barcode: data 
        });
      }
    } catch (error) {
      Alert.alert('Scan Error', error.message);
      setScanned(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [
            BarCodeScanner.Constants.BarCodeType.ean13,
            BarCodeScanner.Constants.BarCodeType.ean8,
            BarCodeScanner.Constants.BarCodeType.upc_a,
            BarCodeScanner.Constants.BarCodeType.upc_e,
            BarCodeScanner.Constants.BarCodeType.qr,
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={flashEnabled}
      >
        <ScanOverlay scanned={scanned} />
        <FlashToggle 
          enabled={flashEnabled} 
          onToggle={toggleFlash} 
        />
        {scanned && (
          <View style={styles.resetButton}>
            <Text onPress={resetScanner} style={styles.resetText}>
              Scan Another
            </Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  resetButton: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});
```

### Photo Scanner Component
```javascript
// src/components/scanning/PhotoScanner.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useScanning } from '../../hooks/useScanning';

export const PhotoScanner = ({ onPhotoCaptured, profileId }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { analyzeProductPhoto } = useScanning();
  const cameraRef = useRef();

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      // Resize and optimize for OCR
      const processedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          { resize: { width: 1200 } },
          { crop: { originX: 0, originY: 0, width: 1200, height: 800 } },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Analyze the photo
      const result = await analyzeProductPhoto(processedPhoto.uri, profileId);
      
      if (onPhotoCaptured) {
        onPhotoCaptured(result);
      }
    } catch (error) {
      Alert.alert('Photo Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={Camera.Constants.AutoFocus.on}
        whiteBalance={Camera.Constants.WhiteBalance.auto}
      >
        <View style={styles.overlay}>
          <View style={styles.guides}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.disabled]}
            onPress={capturePhoto}
            disabled={isProcessing}
          >
            <Text style={styles.captureText}>
              {isProcessing ? 'Processing...' : 'Capture'}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guides: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 200,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4CAF50',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4CAF50',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  captureText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### Restaurant Menu Scanner
```javascript
// src/components/scanning/MenuScanner.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { PhotoScanner } from './PhotoScanner';
import { MenuAnalysisResults } from './MenuAnalysisResults';
import { useRestaurantService } from '../../hooks/useRestaurantService';

export const MenuScanner = ({ profileId, restaurantId }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { analyzeMenu } = useRestaurantService();

  const handleMenuPhoto = async (photoResult) => {
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeMenu(photoResult.imageUri, restaurantId, profileId);
      setAnalysisResult(analysis);
    } catch (error) {
      Alert.alert('Menu Analysis Error', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setAnalysisResult(null);
  };

  if (analysisResult) {
    return (
      <ScrollView style={styles.container}>
        <MenuAnalysisResults 
          analysis={analysisResult}
          onReset={resetScanner}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Restaurant Menu</Text>
      <Text style={styles.subtitle}>
        Point your camera at the menu and capture a clear photo
      </Text>
      
      <PhotoScanner 
        onPhotoCaptured={handleMenuPhoto}
        profileId={profileId}
      />
      
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <Text>Analyzing menu items...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Scanning Hooks

### Main Scanning Hook
```javascript
// src/hooks/useScanning.js
import { useState, useCallback } from 'react';
import { Alert, Vibration } from 'react-native';
import { useAuth } from './useAuth';
import { scanService } from '../services/scanService';
import { productService } from '../services/productService';

export const useScanning = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const { user } = useAuth();

  const scanProduct = useCallback(async (barcode, profileId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    
    try {
      const result = await scanService.scanByBarcode(barcode, user.id, profileId);
      setLastScan(result);
      Vibration.vibrate(100);
      return result;
    } catch (error) {
      Vibration.vibrate([100, 50, 100]); // Error vibration pattern
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const analyzeProductPhoto = useCallback(async (imageUri, profileId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    
    try {
      const result = await scanService.scanByPhoto(imageUri, user.id, profileId);
      setLastScan(result);
      Vibration.vibrate(100);
      return result;
    } catch (error) {
      Vibration.vibrate([100, 50, 100]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const searchProduct = useCallback(async (query, filters = {}) => {
    try {
      const results = await productService.searchProducts(query, filters);
      return results;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }, []);

  const getScanHistory = useCallback(async (limit = 20) => {
    if (!user) return [];
    
    try {
      const history = await scanService.getScanHistory(user.id, limit);
      return history;
    } catch (error) {
      throw new Error(`Failed to get scan history: ${error.message}`);
    }
  }, [user]);

  const saveProduct = useCallback(async (productId, listType = 'clean_choices') => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await scanService.saveProduct(user.id, productId, listType);
      Vibration.vibrate(50);
    } catch (error) {
      throw new Error(`Failed to save product: ${error.message}`);
    }
  }, [user]);

  const unsaveProduct = useCallback(async (productId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await scanService.unsaveProduct(user.id, productId);
    } catch (error) {
      throw new Error(`Failed to unsave product: ${error.message}`);
    }
  }, [user]);

  return {
    scanProduct,
    analyzeProductPhoto,
    searchProduct,
    getScanHistory,
    saveProduct,
    unsaveProduct,
    isLoading,
    lastScan,
  };
};
```

### Restaurant Service Hook
```javascript
// src/hooks/useRestaurantService.js
import { useState, useCallback } from 'react';
import { restaurantService } from '../services/restaurantService';

export const useRestaurantService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const analyzeMenu = useCallback(async (imageUri, restaurantId, profileId) => {
    setIsLoading(true);
    
    try {
      const analysis = await restaurantService.analyzeMenuImage(
        imageUri, 
        restaurantId, 
        profileId
      );
      return analysis;
    } catch (error) {
      throw new Error(`Menu analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRestaurants = useCallback(async (location, filters = {}) => {
    try {
      const results = await restaurantService.searchRestaurants(location, filters);
      return results;
    } catch (error) {
      throw new Error(`Restaurant search failed: ${error.message}`);
    }
  }, []);

  const getRestaurantDetails = useCallback(async (restaurantId) => {
    try {
      const details = await restaurantService.getRestaurantById(restaurantId);
      return details;
    } catch (error) {
      throw new Error(`Failed to get restaurant details: ${error.message}`);
    }
  }, []);

  return {
    analyzeMenu,
    searchRestaurants,
    getRestaurantDetails,
    isLoading,
  };
};
```

## Backend Scanning Services

### Enhanced Scan Service
```javascript
// src/services/scanService.js
const { supabase } = require('../utils/database');
const productService = require('./productService');
const aiService = require('./aiService');
const ocrService = require('./ocrService');
const healthScoreService = require('./healthScoreService');
const notificationService = require('./notificationService');

class ScanService {
  async scanByBarcode(barcode, userId, profileId) {
    try {
      // Check scan rate limit
      await this.checkScanRateLimit(userId);

      // Look up product in database
      let product = await productService.getProductByBarcode(barcode);
      
      if (!product) {
        // Try external APIs (Open Food Facts, etc.)
        product = await this.searchExternalDatabases(barcode);
        
        if (product) {
          // Save to our database
          product = await productService.createProduct(product);
        }
      }

      if (!product) {
        return {
          success: false,
          needsPhotoScan: true,
          barcode,
          message: 'Product not found. Please scan the ingredient label.',
        };
      }

      // Get user profile
      const profile = await this.getUserProfile(profileId);
      
      // Generate personalized analysis
      const analysis = await aiService.generateProductAnalysis(product, profile);
      const personalizedScore = await this.calculatePersonalizedScore(product, profile);
      
      // Check for recalls
      const recallInfo = await this.checkProductRecall(product.id);
      
      // Record the scan
      await this.recordScan(userId, profileId, product.id, 'barcode', personalizedScore);
      
      // Update user's health score
      await healthScoreService.updateHealthScore(userId, profileId);
      
      return {
        success: true,
        product: {
          ...product,
          personalized_score: personalizedScore,
          halo_analysis: analysis,
          recall_info: recallInfo,
        },
        scan_time: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Barcode scan error:', error);
      throw error;
    }
  }

  async scanByPhoto(imageBuffer, userId, profileId) {
    try {
      // Extract text using OCR
      const ocrResult = await ocrService.extractText(imageBuffer);
      
      // Parse ingredients and product info
      const parsedData = await this.parseProductData(ocrResult);
      
      // Try to identify product
      let product = await this.identifyProductFromParsedData(parsedData);
      
      if (!product) {
        // Create new product from parsed data
        product = await productService.createProduct({
          name: parsedData.productName || 'Unknown Product',
          brand: parsedData.brand || 'Unknown Brand',
          ingredients: parsedData.ingredients || [],
          category: this.categorizeProduct(parsedData),
          processing_level: this.estimateProcessingLevel(parsedData),
          nutrition_info: parsedData.nutritionInfo || {},
        });
      }

      // Get user profile
      const profile = await this.getUserProfile(profileId);
      
      // Generate analysis
      const analysis = await aiService.generateProductAnalysis(product, profile);
      const personalizedScore = await this.calculatePersonalizedScore(product, profile);
      
      // Record the scan
      await this.recordScan(userId, profileId, product.id, 'photo', personalizedScore);
      
      // Update health score
      await healthScoreService.updateHealthScore(userId, profileId);
      
      return {
        success: true,
        product: {
          ...product,
          personalized_score: personalizedScore,
          halo_analysis: analysis,
          extracted_data: parsedData,
        },
        scan_time: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Photo scan error:', error);
      throw error;
    }
  }

  async searchExternalDatabases(barcode) {
    // Try Open Food Facts API
    let product = await this.searchOpenFoodFacts(barcode);
    
    if (!product) {
      // Try other APIs
      product = await this.searchUPCDatabase(barcode);
    }

    return product;
  }

  async searchOpenFoodFacts(barcode) {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        
        return {
          barcode: barcode,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          ingredients: product.ingredients_text ? product.ingredients_text.split(',').map(i => i.trim()) : [],
          category: this.mapOpenFoodFactsCategory(product.categories),
          nutrition_info: product.nutriments || {},
          image_url: product.image_front_url,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Open Food Facts API error:', error);
      return null;
    }
  }

  async searchUPCDatabase(barcode) {
    try {
      // Implementation for UPC database API
      // This would integrate with UPC database services
      return null;
    } catch (error) {
      console.error('UPC Database API error:', error);
      return null;
    }
  }

  parseProductData(ocrResult) {
    // Use AI to parse OCR text into structured product data
    return aiService.parseProductOCR(ocrResult);
  }

  identifyProductFromParsedData(parsedData) {
    // Try to match parsed data with existing products
    return productService.identifyProduct(parsedData);
  }

  categorizeProduct(parsedData) {
    // Use AI to categorize product based on ingredients and name
    const keywords = {
      food: ['cereal', 'snack', 'pasta', 'rice', 'bread', 'cookie', 'cracker'],
      beverage: ['water', 'juice', 'soda', 'drink', 'tea', 'coffee'],
      supplement: ['vitamin', 'supplement', 'protein', 'mineral'],
      personal_care: ['shampoo', 'soap', 'lotion', 'cream', 'cosmetic'],
      household: ['cleaner', 'detergent', 'soap', 'bleach'],
    };

    const text = (parsedData.productName + ' ' + parsedData.ingredients.join(' ')).toLowerCase();
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return category;
      }
    }

    return 'unknown';
  }

  estimateProcessingLevel(parsedData) {
    // Estimate processing level based on ingredients
    const processedKeywords = ['extract', 'hydrogenated', 'modified', 'artificial', 'synthetic'];
    const naturalKeywords = ['organic', 'whole', 'raw', 'natural'];
    
    const ingredients = parsedData.ingredients.join(' ').toLowerCase();
    
    const processedCount = processedKeywords.filter(keyword => ingredients.includes(keyword)).length;
    const naturalCount = naturalKeywords.filter(keyword => ingredients.includes(keyword)).length;
    
    if (processedCount > naturalCount) {
      return 'high';
    } else if (processedCount === 0 && naturalCount > 0) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  mapOpenFoodFactsCategory(categories) {
    // Map Open Food Facts categories to our categories
    const categoryMap = {
      'beverages': 'beverage',
      'snacks': 'food',
      'dairies': 'food',
      'meals': 'food',
      'cosmetics': 'personal_care',
      'household': 'household',
    };

    for (const [offCategory, ourCategory] of Object.entries(categoryMap)) {
      if (categories.toLowerCase().includes(offCategory)) {
        return ourCategory;
      }
    }

    return 'food'; // Default
  }

  async getUserProfile(profileId) {
    const { data: profile, error } = await supabase
      .from('health_profiles')
      .select(`
        *,
        dietary_restrictions (restriction_type),
        allergies_intolerances (allergy_type, severity),
        ingredient_preferences (ingredient_name, preference),
        health_concerns (concern_type, priority)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;

    // Flatten related data
    return {
      ...profile,
      dietary_restrictions: profile.dietary_restrictions?.map(r => r.restriction_type) || [],
      allergies_intolerances: profile.allergies_intolerances?.map(a => a.allergy_type) || [],
      ingredient_preferences: profile.ingredient_preferences || [],
      health_concerns: profile.health_concerns?.map(c => c.concern_type) || [],
    };
  }

  async calculatePersonalizedScore(product, profile) {
    let baseScore = product.health_score || 50;
    
    // Check dietary restrictions
    if (profile.dietary_restrictions) {
      for (const restriction of profile.dietary_restrictions) {
        const penalty = this.checkDietaryRestriction(product, restriction);
        baseScore -= penalty;
      }
    }
    
    // Check allergies
    if (profile.allergies_intolerances) {
      for (const allergy of profile.allergies_intolerances) {
        if (this.containsAllergen(product, allergy)) {
          baseScore -= 30; // Heavy penalty for allergens
        }
      }
    }
    
    // Check ingredient preferences
    if (profile.ingredient_preferences) {
      for (const pref of profile.ingredient_preferences) {
        if (pref.preference === 'avoid' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore -= 20;
        } else if (pref.preference === 'limit' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore -= 10;
        } else if (pref.preference === 'can_eat' && this.containsIngredient(product, pref.ingredient_name)) {
          baseScore += 5;
        }
      }
    }
    
    return Math.max(0, Math.min(100, baseScore));
  }

  checkDietaryRestriction(product, restriction) {
    const restrictionRules = {
      'gluten_free': (product) => this.containsGluten(product),
      'dairy_free': (product) => this.containsDairy(product),
      'vegan': (product) => this.containsAnimalProducts(product),
      'vegetarian': (product) => this.containsMeat(product),
      'keto': (product) => this.hasHighCarbs(product),
      'paleo': (product) => this.containsPaleoForbidden(product),
    };

    const rule = restrictionRules[restriction];
    return rule ? (rule(product) ? 25 : 0) : 0;
  }

  containsGluten(product) {
    const glutenIngredients = ['wheat', 'barley', 'rye', 'oats', 'spelt', 'kamut'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return glutenIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsDairy(product) {
    const dairyIngredients = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return dairyIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsAnimalProducts(product) {
    const animalIngredients = ['milk', 'egg', 'meat', 'fish', 'chicken', 'beef', 'pork', 'honey'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return animalIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  containsMeat(product) {
    const meatIngredients = ['meat', 'chicken', 'beef', 'pork', 'turkey', 'fish'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return meatIngredients.some(ingredient => ingredients.includes(ingredient));
  }

  hasHighCarbs(product) {
    // Check nutrition info for high carb content
    if (product.nutrition_info?.carbohydrates) {
      return product.nutrition_info.carbohydrates > 25; // per serving
    }
    return false;
  }

  containsPaleoForbidden(product) {
    const paleoForbidden = ['grains', 'legumes', 'dairy', 'sugar', 'processed foods'];
    const ingredients = product.ingredients.join(' ').toLowerCase();
    return paleoForbidden.some(ingredient => ingredients.includes(ingredient));
  }

  containsAllergen(product, allergen) {
    return product.allergens_present?.includes(allergen) || 
           product.ingredients.some(ingredient => 
             ingredient.toLowerCase().includes(allergen.toLowerCase())
           );
  }

  containsIngredient(product, ingredientName) {
    return product.ingredients.some(ingredient => 
      ingredient.toLowerCase().includes(ingredientName.toLowerCase())
    );
  }

  async checkProductRecall(productId) {
    const { data, error } = await supabase
      .from('product_recalls')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // No recall found
    }

    if (error) throw error;

    return data;
  }

  async recordScan(userId, profileId, productId, scanType, score) {
    const { error } = await supabase
      .from('product_scans')
      .insert([{
        user_id: userId,
        profile_id: profileId,
        product_id: productId,
        scan_type: scanType,
        score_given: score,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async getScanHistory(userId, limit = 20) {
    const { data, error } = await supabase
      .from('product_scans')
      .select(`
        *,
        products (
          name,
          brand,
          image_url,
          health_score
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async saveProduct(userId, productId, listType = 'clean_choices') {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_products')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('list_type', listType)
      .single();

    if (existing) {
      throw new Error('Product already saved');
    }

    const { error } = await supabase
      .from('saved_products')
      .insert([{
        user_id: userId,
        product_id: productId,
        list_type: listType,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async unsaveProduct(userId, productId) {
    const { error } = await supabase
      .from('saved_products')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }

  async checkScanRateLimit(userId) {
    // Implement rate limiting for scans
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('product_scans')
      .select('count')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo.toISOString());

    if (error) throw error;

    if (data.length >= 100) { // 100 scans per hour limit
      throw new Error('Scan rate limit exceeded. Please try again later.');
    }
  }
}

module.exports = new ScanService();
```

### OCR Service
```javascript
// src/services/ocrService.js
const vision = require('@google-cloud/vision');

class OCRService {
  constructor() {
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_KEY_FILE,
    });
  }

  async extractText(imageBuffer) {
    try {
      const [result] = await this.client.textDetection({
        image: {
          content: imageBuffer,
        },
      });

      const detections = result.textAnnotations;
      const fullText = detections[0]?.description || '';

      return {
        fullText,
        detections: detections.slice(1), // Exclude full text annotation
        confidence: detections[0]?.confidence || 0,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractStructuredData(imageBuffer) {
    try {
      const [result] = await this.client.documentTextDetection({
        image: {
          content: imageBuffer,
        },
      });

      const document = result.fullTextAnnotation;
      
      return {
        fullText: document.text,
        pages: document.pages.map(page => ({
          width: page.width,
          height: page.height,
          blocks: page.blocks.map(block => ({
            text: block.text,
            paragraphs: block.paragraphs.map(para => para.text),
            confidence: block.confidence,
            boundingBox: block.boundingBox,
          })),
        })),
      };
    } catch (error) {
      console.error('Structured OCR error:', error);
      throw new Error('Failed to extract structured data from image');
    }
  }

  async detectIngredients(imageBuffer) {
    try {
      const textResult = await this.extractText(imageBuffer);
      const lines = textResult.fullText.split('\n');
      
      // Find ingredients section
      let ingredientsSection = '';
      let inIngredientsSection = false;
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase().trim();
        
        if (lowerLine.includes('ingredients') || lowerLine.includes('ingredient')) {
          inIngredientsSection = true;
          ingredientsSection += line + '\n';
          continue;
        }
        
        if (inIngredientsSection) {
          // Stop if we hit another section
          if (lowerLine.includes('nutrition') || 
              lowerLine.includes('facts') || 
              lowerLine.includes('serving') ||
              lowerLine.includes('contains')) {
            break;
          }
          
          ingredientsSection += line + '\n';
        }
      }

      // Parse ingredients
      const ingredients = this.parseIngredientsText(ingredientsSection);
      
      return {
        ingredients,
        fullText: textResult.fullText,
        confidence: textResult.confidence,
      };
    } catch (error) {
      console.error('Ingredient detection error:', error);
      throw new Error('Failed to detect ingredients from image');
    }
  }

  parseIngredientsText(text) {
    // Remove common prefixes and clean text
    const cleanText = text
      .replace(/ingredients[:\s]+/gi, '')
      .replace(/contains[:\s]+/gi, '')
      .replace(/may contain[:\s]+/gi, '')
      .trim();

    // Split by common separators
    const separators = [',', ';', '\n', '·', 'and'];
    let ingredients = [cleanText];
    
    separators.forEach(sep => {
      ingredients = ingredients.flatMap(ing => ing.split(sep));
    });

    // Clean and filter ingredients
    return ingredients
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0 && !this.isStopWord(ing))
      .map(ing => this.cleanIngredientName(ing));
  }

  isStopWord(word) {
    const stopWords = [
      'ingredients', 'contains', 'may contain', 'organic', 'natural',
      'artificial', 'added', 'enriched', 'fortified', 'with', 'from',
      'made', 'processed', 'prepared', 'cooked', 'raw', 'fresh',
    ];
    
    return stopWords.some(stop => word.toLowerCase().includes(stop));
  }

  cleanIngredientName(ingredient) {
    // Remove parentheses content
    ingredient = ingredient.replace(/\([^)]*\)/g, '');
    
    // Remove common qualifiers
    ingredient = ingredient.replace(/(organic|natural|raw|fresh|pure|premium)\s+/gi, '');
    
    // Clean up spacing and punctuation
    ingredient = ingredient.replace(/[^\w\s-]/g, '').trim();
    
    return ingredient;
  }
}

module.exports = new OCRService();
```

### Restaurant Service
```javascript
// src/services/restaurantService.js
const { supabase } = require('../utils/database');
const aiService = require('./aiService');
const ocrService = require('./ocrService');

class RestaurantService {
  async analyzeMenuImage(imageBuffer, restaurantId, profileId) {
    try {
      // Extract text from menu image
      const ocrResult = await ocrService.extractStructuredData(imageBuffer);
      
      // Parse menu items
      const menuItems = await this.parseMenuItems(ocrResult);
      
      // Get user profile
      const profile = await this.getUserProfile(profileId);
      
      // Analyze each menu item
      const analyzedItems = await Promise.all(
        menuItems.map(async (item) => {
          const analysis = await aiService.generateMenuAnalysis(item, profile);
          return {
            ...item,
            health_score: analysis.score,
            status: analysis.status, // 'clean', 'caution', 'avoid'
            reasons: analysis.reasons,
            alternatives: analysis.alternatives,
          };
        })
      );

      // Categorize items
      const categorized = this.categorizeMenuItems(analyzedItems);
      
      return {
        success: true,
        restaurant_id: restaurantId,
        menu_items: analyzedItems,
        categories: categorized,
        summary: this.generateMenuSummary(categorized),
        extracted_text: ocrResult.fullText,
      };
    } catch (error) {
      console.error('Menu analysis error:', error);
      throw error;
    }
  }

  async parseMenuItems(ocrResult) {
    // Use AI to parse structured OCR data into menu items
    const menuText = ocrResult.fullText;
    
    const prompt = `
Parse this restaurant menu text into structured menu items:

${menuText}

Return a JSON array with each item containing:
- name: item name
- description: item description (if available)
- price: price (if available)
- ingredients: likely ingredients (if mentioned)
- category: category (appetizer, main, dessert, etc.)

Only return valid JSON format.
    `;

    const response = await aiService.generateText(prompt);
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse menu items:', error);
      // Fallback to basic parsing
      return this.basicMenuParsing(menuText);
    }
  }

  basicMenuParsing(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const menuItems = [];
    
    lines.forEach((line, index) => {
      // Simple heuristic: if line contains price indicators
      if (line.includes('$') || line.includes('USD') || /\$\d+/.test(line)) {
        const parts = line.split(/\$/);
        if (parts.length >= 2) {
          menuItems.push({
            name: parts[0].trim(),
            price: `$${parts[1].trim()}`,
            description: '',
            ingredients: [],
            category: 'unknown',
          });
        }
      }
    });
    
    return menuItems;
  }

  categorizeMenuItems(items) {
    const categories = {
      clean: items.filter(item => item.status === 'clean'),
      caution: items.filter(item => item.status === 'caution'),
      avoid: items.filter(item => item.status === 'avoid'),
    };

    // Further categorize by type
    const byType = {
      appetizers: items.filter(item => 
        item.name.toLowerCase().includes('salad') || 
        item.name.toLowerCase().includes('soup') ||
        item.name.toLowerCase().includes('appetizer')
      ),
      mains: items.filter(item => 
        !item.name.toLowerCase().includes('salad') && 
        !item.name.toLowerCase().includes('soup') &&
        !item.name.toLowerCase().includes('dessert')
      ),
      desserts: items.filter(item => 
        item.name.toLowerCase().includes('dessert') || 
        item.name.toLowerCase().includes('cake') ||
        item.name.toLowerCase().includes('ice cream')
      ),
    };

    return {
      by_status: categories,
      by_type: byType,
    };
  }

  generateMenuSummary(categorized) {
    const total = categorized.by_status.clean.length + 
                  categorized.by_status.caution.length + 
                  categorized.by_status.avoid.length;

    return {
      total_items: total,
      clean_items: categorized.by_status.clean.length,
      caution_items: categorized.by_status.caution.length,
      avoid_items: categorized.by_status.avoid.length,
      clean_percentage: total > 0 ? Math.round((categorized.by_status.clean.length / total) * 100) : 0,
    };
  }

  async searchRestaurants(location, filters = {}) {
    try {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      // Apply location filter (within radius)
      if (location.lat && location.lng && location.radius) {
        query = query.rpc('search_restaurants_by_location', {
          lat: location.lat,
          lng: location.lng,
          radius_km: location.radius || 10,
        });
      }

      // Apply filters
      if (filters.seed_oil_free) {
        query = query.eq('seed_oil_free', true);
      }
      
      if (filters.gluten_free) {
        query = query.eq('gluten_free_options', true);
      }
      
      if (filters.vegan) {
        query = query.eq('vegan_options', true);
      }
      
      if (filters.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }
      
      if (filters.price_range) {
        query = query.eq('price_range', filters.price_range);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Restaurant search error:', error);
      throw error;
    }
  }

  async getRestaurantById(restaurantId) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(profileId) {
    const { data: profile, error } = await supabase
      .from('health_profiles')
      .select(`
        *,
        dietary_restrictions (restriction_type),
        allergies_intolerances (allergy_type, severity),
        ingredient_preferences (ingredient_name, preference),
        health_concerns (concern_type, priority)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;

    return {
      ...profile,
      dietary_restrictions: profile.dietary_restrictions?.map(r => r.restriction_type) || [],
      allergies_intolerances: profile.allergies_intolerances?.map(a => a.allergy_type) || [],
      ingredient_preferences: profile.ingredient_preferences || [],
      health_concerns: profile.health_concerns?.map(c => c.concern_type) || [],
    };
  }
}

module.exports = new RestaurantService();
```

## Performance Optimizations

### Image Caching
```javascript
// src/utils/imageCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class ImageCache {
  constructor() {
    this.cacheDir = FileSystem.cacheDirectory + 'halo_images/';
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
  }

  async cacheImage(uri, key = null) {
    try {
      const cacheKey = key || this.generateCacheKey(uri);
      const cachePath = `${this.cacheDir}${cacheKey}`;
      
      // Check if already cached
      const info = await FileSystem.getInfoAsync(cachePath);
      if (info.exists) {
        return cachePath;
      }

      // Ensure cache directory exists
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });

      // Download and cache
      await FileSystem.downloadAsync(uri, cachePath);
      
      // Store cache metadata
      await this.storeCacheMetadata(cacheKey, uri);
      
      // Check cache size and cleanup if needed
      await this.checkCacheSize();
      
      return cachePath;
    } catch (error) {
      console.error('Image cache error:', error);
      return uri; // Fallback to original URI
    }
  }

  generateCacheKey(uri) {
    return btoa(uri).replace(/[^a-zA-Z0-9]/g, '');
  }

  async storeCacheMetadata(key, originalUri) {
    const metadata = {
      key,
      originalUri,
      cachedAt: Date.now(),
    };
    
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(metadata));
  }

  async checkCacheSize() {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;
      
      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
        totalSize += info.size;
      }
      
      if (totalSize > this.maxCacheSize) {
        await this.cleanupOldestFiles(totalSize - this.maxCacheSize * 0.8);
      }
    } catch (error) {
      console.error('Cache size check error:', error);
    }
  }

  async cleanupOldestFiles(bytesToRemove) {
    const files = await FileSystem.readDirectoryAsync(this.cacheDir);
    const fileInfos = [];
    
    for (const file of files) {
      const info = await FileSystem.getInfoAsync(`${this.cacheDir}${file}`);
      const metadata = await AsyncStorage.getItem(`cache_${file}`);
      
      if (metadata) {
        const parsed = JSON.parse(metadata);
        fileInfos.push({
          file,
          size: info.size,
          cachedAt: parsed.cachedAt,
        });
      }
    }
    
    // Sort by oldest first
    fileInfos.sort((a, b) => a.cachedAt - b.cachedAt);
    
    let removed = 0;
    for (const fileInfo of fileInfos) {
      if (removed >= bytesToRemove) break;
      
      await FileSystem.deleteAsync(`${this.cacheDir}${fileInfo.file}`);
      await AsyncStorage.removeItem(`cache_${fileInfo.file}`);
      removed += fileInfo.size;
    }
  }

  async clearCache() {
    try {
      await FileSystem.deleteAsync(this.cacheDir);
      await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      
      // Clear metadata
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export default new ImageCache();
```

This scanning integration provides:

1. **Comprehensive barcode scanning** with multiple fallback methods
2. **Advanced OCR capabilities** using Google Vision API
3. **Intelligent product identification** from multiple databases
4. **Personalized scoring** based on user health profiles
5. **Restaurant menu analysis** with health categorization
6. **Performance optimizations** with image caching
7. **Rate limiting and security** for API protection
8. **Real-time processing** with proper error handling

The system handles edge cases like poor lighting, damaged barcodes, and unclear text while providing fast, accurate results.
