import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../services/supabase';
import storage, { STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || isProcessing.current) return;
        
        if (event === 'INITIAL_SESSION') return;
        
        if (event === 'SIGNED_OUT') {
          isProcessing.current = true;
          setUser(null);
          await storage.removeItem(STORAGE_KEYS.USER_SESSION);
          setIsFirstTime(false);
          setNeedsDisclaimer(false);
          setIsLoading(false);
          isProcessing.current = false;
        } else if (event === 'SIGNED_IN' && session?.user) {
          isProcessing.current = true;
          await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
          
          const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
          const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
          
          setIsFirstTime(!onboardingCompleted);
          setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
          setUser(session.user);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsLoading(false);
          isProcessing.current = false;
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user);
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
        
        const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
        
        setIsFirstTime(!onboardingCompleted);
        setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
      } else {
        setUser(null);
        setIsFirstTime(false);
        setNeedsDisclaimer(false);
      }
    } catch (error) {
      console.warn('Session check error:', error.message);
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('signIn error:', error);
      throw error;
    }
    
    if (data?.user) {
      const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
      
      // Update all states in correct order
      setIsLoading(true); // Set loading first
      await storage.setItem(STORAGE_KEYS.USER_SESSION, data.session);
      
      // Set states
      setIsFirstTime(onboardingCompleted !== true);
      setNeedsDisclaimer(onboardingCompleted === true && disclaimerAccepted !== true);
      setUser(data.user);
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    }
    
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
    const { data, error } = await supabase.auth.verifyOtp({ 
      email, 
      token, 
      type: 'signup' 
    });
    if (error) throw error;
    return data;
  };

  const resendOtp = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await storage.clearAuthData();
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
    if (!user) throw new Error('No user logged in');
    
    // Call backend API to delete account
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
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
    signIn,
    signUp,
    signOut,
    verifyOtp,
    resendOtp,
    sendPasswordResetOtp,
    resetPasswordWithOtp,
    completeOnboarding,
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
