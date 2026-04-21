import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
        
        console.log('Auth state changed:', event);
        
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
          setUser(session.user);
          await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
          
          const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
          const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
          
          setIsFirstTime(!onboardingCompleted);
          setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
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
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: 'halohealth://auth/callback',
      },
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    return data;
  };

  const resendOtp = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      await storage.clearAuthData();
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase sign out error:', error);
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
    } catch (error) {
      console.error('Sign out error:', error);
      await storage.clearAll();
      setUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
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
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setIsFirstTime(false);
    setNeedsDisclaimer(true);
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
