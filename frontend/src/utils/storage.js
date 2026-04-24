import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_SESSION: 'userSession',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  MEDICAL_DISCLAIMER_ACCEPTED: 'medicalDisclaimerAccepted',
  ACTIVE_PROFILE: 'activeProfile',
  APP_SETTINGS: 'appSettings',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  BIOMETRIC_EMAIL: 'biometricEmail',
  BIOMETRIC_PASSWORD: 'biometricPassword',
  LANGUAGE: 'language',
  ONBOARDING_DATA: 'onboardingData',
};

// Get item from storage
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

// Set item in storage
export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
};

// Remove item from storage
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

// Clear all storage
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Clear auth-related storage
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_SESSION,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED,
      STORAGE_KEYS.ACTIVE_PROFILE,
      STORAGE_KEYS.BIOMETRIC_ENABLED,
      STORAGE_KEYS.BIOMETRIC_EMAIL,
      STORAGE_KEYS.BIOMETRIC_PASSWORD,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Get all keys
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

// Debug: Log all storage contents
export const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log('=== AsyncStorage Debug ===');
    items.forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.log('========================');
  } catch (error) {
    console.error('Error debugging storage:', error);
  }
};

export default {
  getItem,
  setItem,
  removeItem,
  clearAll,
  clearAuthData,
  getAllKeys,
  debugStorage,
  STORAGE_KEYS,
};
