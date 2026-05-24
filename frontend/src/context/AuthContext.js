import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../services/supabase';
import storage, { STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const isProcessing = useRef(false);

  const syncOnboardingFromMetadata = async (authUser) => {
    const metadataOnboarding = authUser?.user_metadata?.onboarding_data;
    if (!metadataOnboarding || typeof metadataOnboarding !== 'object') return;

    const localOnboarding = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
    const hasLocalOnboarding = localOnboarding && Object.keys(localOnboarding).length > 0;

    if (!hasLocalOnboarding) {
      await storage.setItem(STORAGE_KEYS.ONBOARDING_DATA, metadataOnboarding);
    }

    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  };

  useEffect(() => {
    let mounted = true;
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'INITIAL_SESSION') {
          return;
        }

        if (isProcessing.current) {
          return;
        }

        try {
          if (event === 'SIGNED_OUT') {
            isProcessing.current = true;
            setUser(null);
            await storage.removeItem(STORAGE_KEYS.USER_SESSION);
            setIsFirstTime(false);
            setNeedsDisclaimer(false);
            setNeedsProfileSetup(false);
            setIsLoading(false);
          } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
            isProcessing.current = true;
            
            await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
            await syncOnboardingFromMetadata(session.user);
            
            let onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
            let disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
            let profileSetupCompleted = await storage.getItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED);
            
            // If local storage says they haven't finished setup, verify with backend
            if (!profileSetupCompleted) {
              try {
                // profileService is imported at top
                const { profileService } = require('../services/profileService');
                const profiles = await profileService.getProfiles(session.user.id);
                if (profiles && profiles.length > 0) {
                  onboardingCompleted = true;
                  disclaimerAccepted = true;
                  profileSetupCompleted = true;
                  await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
                  await storage.setItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED, true);
                  await storage.setItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED, true);
                }
              } catch (err) {
                console.warn('[AuthContext] Failed to fetch backend profiles on login', err.message);
              }
            }

            setIsFirstTime(!onboardingCompleted);
            setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
            setNeedsProfileSetup(onboardingCompleted && disclaimerAccepted && !profileSetupCompleted);
            setUser(session.user);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsLoading(false);
          }
        } catch (error) {
          console.error('[AuthContext] Error in onAuthStateChange:', error);
        } finally {
          isProcessing.current = false;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
        await syncOnboardingFromMetadata(session.user);
        
        let onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        let disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
        let profileSetupCompleted = await storage.getItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED);
        
        if (!profileSetupCompleted) {
          try {
            const { profileService } = require('../services/profileService');
            const profiles = await profileService.getProfiles(session.user.id);
            if (profiles && profiles.length > 0) {
              onboardingCompleted = true;
              disclaimerAccepted = true;
              profileSetupCompleted = true;
              await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
              await storage.setItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED, true);
              await storage.setItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED, true);
            }
          } catch (err) {
            console.warn('[AuthContext] Failed to fetch backend profiles on checkSession', err.message);
          }
        }

        setIsFirstTime(!onboardingCompleted);
        setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
        setNeedsProfileSetup(onboardingCompleted && disclaimerAccepted && !profileSetupCompleted);
      } else {
        setUser(null);
        setIsFirstTime(false);
        setNeedsDisclaimer(false);
        setNeedsProfileSetup(false);
      }
    } catch (error) {
      console.warn('Session check error:', error.message);
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
      setNeedsProfileSetup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    console.log('[AuthContext] Attempting sign-in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.log('[AuthContext] Sign-in error:', error.message);
      // Provide clear error messages
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email first. Check your inbox for the verification code.');
      }
      if (error.message?.toLowerCase().includes('invalid login')) {
        throw new Error('Incorrect email or password. Please try again.');
      }
      throw error;
    }
    
    console.log('[AuthContext] Sign-in successful for:', data.user?.email);
    return data;
  };

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: 'halohealth://auth/callback',
        channel: 'email',
      },
    });
    if (error) throw error;
    
    // Mark onboarding as completed since it was done before registration
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    
    return data;
  };

  const verifyOtp = async (email, token) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ 
      email, 
      token, 
      type: 'signup' 
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // onAuthStateChange SIGNED_IN event will handle state updates.
    // Just return the data; loading will be cleared by the listener.
    return data;
  };

  const resendOtp = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Preserve ONBOARDING_COMPLETED so returning users go to Login
      const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      
      await storage.clearAuthData();
      
      if (onboardingCompleted) {
        await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase sign out error:', error);
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Sign out error:', error);
      await storage.clearAll();
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
      setIsLoading(false);
    }
  };

  // Resets ALL local storage including onboarding — used for testing
  const resetAppState = async () => {
    await storage.clearAll();
    await supabase.auth.signOut();
    setUser(null);
    setIsFirstTime(true);
    setNeedsDisclaimer(false);
    setIsLoading(false);
  };

  const sendPasswordResetOtp = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'halohealth://auth/callback',
    });
    if (error) throw error;
  };

  const resetPasswordWithOtp = async (email, token, newPassword) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    if (error) throw error;
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setIsFirstTime(false);
    setNeedsDisclaimer(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsLoading(false);
  };

  const completeProfileSetup = async () => {
    setIsLoading(true);
    await storage.setItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED, true);
    setNeedsProfileSetup(false);
    setIsLoading(false);
  };

  const completeMedicalDisclaimer = async () => {
    setIsLoading(true);
    await storage.setItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED, true);
    setNeedsDisclaimer(false);
    
    // After disclaimer, check if profile setup is needed
    const profileSetupCompleted = await storage.getItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED);
    setNeedsProfileSetup(!profileSetupCompleted);
    
    setIsLoading(false);
  };

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return { compatible, enrolled, types };
  };

  const authenticateWithBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  };

  const enableBiometricLogin = async (email, password) => {
    await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
    await storage.setItem(STORAGE_KEYS.BIOMETRIC_EMAIL, email);
    await storage.setItem(STORAGE_KEYS.BIOMETRIC_PASSWORD, password);
  };

  const disableBiometricLogin = async () => {
    await storage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    await storage.removeItem(STORAGE_KEYS.BIOMETRIC_EMAIL);
    await storage.removeItem(STORAGE_KEYS.BIOMETRIC_PASSWORD);
  };

  const getBiometricCredentials = async () => {
    const enabled = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    if (!enabled) return null;
    const email = await storage.getItem(STORAGE_KEYS.BIOMETRIC_EMAIL);
    const password = await storage.getItem(STORAGE_KEYS.BIOMETRIC_PASSWORD);
    return { email, password };
  };

  const deleteAccount = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');
      const response = await fetch(`${baseUrl}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      // Sign out and clear local data
      await signOut();
    } catch (error) {
      console.error('Delete account error:', error);
      // Still sign out even if backend fails
      await signOut();
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isFirstTime,
    needsDisclaimer,
    needsProfileSetup,
    signIn,
    signUp,
    signOut,
    resetAppState,
    verifyOtp,
    resendOtp,
    sendPasswordResetOtp,
    resetPasswordWithOtp,
    completeOnboarding,
    completeProfileSetup,
    completeMedicalDisclaimer,
    checkBiometricSupport,
    authenticateWithBiometrics,
    enableBiometricLogin,
    disableBiometricLogin,
    getBiometricCredentials,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
