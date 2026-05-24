import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { profileService } from '../services/profileService';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { scheduleDailyNotifications } from '../utils/notifications';

// Initial state
const initialState = {
  user: null,
  activeProfile: null,
  profiles: [],
  recentScans: [],
  savedProducts: [],
  notifications: [],
  isLoading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_ACTIVE_PROFILE: 'SET_ACTIVE_PROFILE',
  SET_PROFILES: 'SET_PROFILES',
  ADD_SCAN: 'ADD_SCAN',
  SET_SAVED_PRODUCTS: 'SET_SAVED_PRODUCTS',
  ADD_SAVED_PRODUCT: 'ADD_SAVED_PRODUCT',
  REMOVE_SAVED_PRODUCT: 'REMOVE_SAVED_PRODUCT',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.SET_ACTIVE_PROFILE:
      return { ...state, activeProfile: action.payload };
    
    case ActionTypes.SET_PROFILES:
      return { ...state, profiles: action.payload };
    
    case ActionTypes.ADD_SCAN:
      return { 
        ...state, 
        recentScans: [action.payload, ...state.recentScans.slice(0, 49)] 
      };
    
    case ActionTypes.SET_SAVED_PRODUCTS:
      return { ...state, savedProducts: action.payload };
    
    case ActionTypes.ADD_SAVED_PRODUCT:
      return { 
        ...state, 
        savedProducts: [action.payload, ...state.savedProducts] 
      };
    
    case ActionTypes.REMOVE_SAVED_PRODUCT:
      return {
        ...state,
        savedProducts: state.savedProducts.filter(
          product => product.id !== action.payload
        ),
      };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 99)],
      };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    let isActive = true;

    const hydrateProfiles = async () => {
      if (!state.user?.id) {
        dispatch({ type: ActionTypes.SET_PROFILES, payload: [] });
        dispatch({ type: ActionTypes.SET_ACTIVE_PROFILE, payload: null });
        return;
      }

      try {
        const response = await profileService.getProfiles(state.user.id);
        if (!isActive) return;

        const nextProfiles = Array.isArray(response)
          ? response
          : response?.data || [];

        dispatch({ type: ActionTypes.SET_PROFILES, payload: nextProfiles });

        const storedActiveProfileId = await storage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
        const storedProfile = nextProfiles.find((profile) => profile.id === storedActiveProfileId) || null;
        const primaryProfile = nextProfiles.find((profile) => profile.is_primary) || nextProfiles[0] || null;
        const nextActiveProfile = storedProfile || primaryProfile || null;

        dispatch({ type: ActionTypes.SET_ACTIVE_PROFILE, payload: nextActiveProfile });

        if (nextActiveProfile?.id) {
          await storage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, nextActiveProfile.id);
        } else {
          await storage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
        }
      } catch (error) {
        console.warn('Failed to hydrate profiles:', error.message);
      }
    };

    hydrateProfiles();

    return () => {
      isActive = false;
    };
  }, [state.user?.id]);

  // Schedule daily notifications whenever activeProfile changes
  useEffect(() => {
    if (state.activeProfile) {
      scheduleDailyNotifications(state.activeProfile);
    }
  }, [state.activeProfile]);

  // Memoize actions so consumers don't re-render when the provider re-renders for unrelated reasons
  const actions = useMemo(() => ({
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    setActiveProfile: (profile) => dispatch({ type: ActionTypes.SET_ACTIVE_PROFILE, payload: profile }),
    setProfiles: (profiles) => dispatch({ type: ActionTypes.SET_PROFILES, payload: profiles }),
    addScan: (scan) => dispatch({ type: ActionTypes.ADD_SCAN, payload: scan }),
    setSavedProducts: (products) => dispatch({ type: ActionTypes.SET_SAVED_PRODUCTS, payload: products }),
    addSavedProduct: (product) => dispatch({ type: ActionTypes.ADD_SAVED_PRODUCT, payload: product }),
    removeSavedProduct: (productId) => dispatch({ type: ActionTypes.REMOVE_SAVED_PRODUCT, payload: productId }),
    setNotifications: (notifications) => dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications }),
    addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
    setLoading: (isLoading) => dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
  }), [dispatch]);

  const value = {
    ...state,
    dispatch,
    ...actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export { AppContext, ActionTypes };
