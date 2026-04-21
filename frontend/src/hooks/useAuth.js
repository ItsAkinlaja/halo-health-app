import { useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { AppContext } from '../context/AppContext';
import storage, { STORAGE_KEYS } from '../utils/storage';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const { dispatch } = useContext(AppContext);
  const [isInitialized, setIsInitialized] = useState(false);

  const syncUser = (supabaseUser) => {
    setUser(supabaseUser);
    dispatch({ type: 'SET_USER', payload: supabaseUser });
  };

  useEffect(() => {
    let mounted = true;
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        // Skip INITIAL_SESSION as it's handled by checkSession
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          // User signed out
          syncUser(null);
          await storage.removeItem(STORAGE_KEYS.USER_SESSION);
          setIsFirstTime(false);
          setNeedsDisclaimer(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN') {
          // User signed in - only update if different user or not initialized
          if (session?.user && (!isInitialized || session.user.id !== user?.id)) {
            syncUser(session.user);
            await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
            
            // Check onboarding status
            const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
            const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
            
            setIsFirstTime(!onboardingCompleted);
            setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
            setIsLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - just update session, don't trigger navigation
          if (session?.user) {
            await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
          }
        } else if (event === 'USER_UPDATED') {
          // User data updated
          if (session?.user) {
            syncUser(session.user);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized, user?.id]);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Session found for user:', session.user.email);
        syncUser(session.user);
        await storage.setItem(STORAGE_KEYS.USER_SESSION, session);
        
        // Check onboarding status only if user is authenticated
        const onboardingCompleted = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        const disclaimerAccepted = await storage.getItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED);
        
        console.log('Onboarding completed:', onboardingCompleted);
        console.log('Disclaimer accepted:', disclaimerAccepted);
        
        setIsFirstTime(!onboardingCompleted);
        setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
      } else {
        console.log('No session found');
        // No session - clear everything
        syncUser(null);
        setIsFirstTime(false);
        setNeedsDisclaimer(false);
      }
    } catch (error) {
      console.warn('Session check error:', error.message);
      syncUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('Session check complete');
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear auth data from storage
      await storage.clearAuthData();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      // Reset local state immediately
      syncUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
      
      console.log('Sign out complete');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear even if there's an error
      await storage.clearAll();
      syncUser(null);
      setIsFirstTime(false);
      setNeedsDisclaimer(false);
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'halohealth://reset-password',
    });
    if (error) throw error;
  };

  const completeOnboarding = async () => {
    console.log('completeOnboarding: Setting onboarding as completed');
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    console.log('completeOnboarding: Updating state - isFirstTime=false, needsDisclaimer=true');
    setIsFirstTime(false);
    setNeedsDisclaimer(true);
    console.log('completeOnboarding: Complete');
  };

  return {
    user,
    isLoading,
    isFirstTime,
    needsDisclaimer,
    signIn,
    signUp,
    signOut,
    resetPassword,
    completeOnboarding,
  };
}
