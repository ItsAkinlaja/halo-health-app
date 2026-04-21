import { useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const { dispatch } = useContext(AppContext);

  const syncUser = (supabaseUser) => {
    setUser(supabaseUser);
    dispatch({ type: 'SET_USER', payload: supabaseUser });
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          syncUser(session.user);
          await AsyncStorage.setItem('userSession', JSON.stringify(session));
        } else {
          syncUser(null);
          await AsyncStorage.removeItem('userSession');
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        syncUser(session.user);
        await AsyncStorage.setItem('userSession', JSON.stringify(session));
      } else {
        // Fallback: check AsyncStorage
        const sessionData = await AsyncStorage.getItem('userSession');
        if (sessionData) {
          const stored = JSON.parse(sessionData);
          syncUser(stored.user);
        }
      }

      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      const disclaimerAccepted = await AsyncStorage.getItem('medicalDisclaimerAccepted');
      
      setIsFirstTime(!onboardingCompleted);
      setNeedsDisclaimer(onboardingCompleted && !disclaimerAccepted);
    } catch (error) {
      console.warn('Session check error:', error.message);
    } finally {
      setIsLoading(false);
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'halohealth://reset-password',
    });
    if (error) throw error;
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    setIsFirstTime(false);
    setNeedsDisclaimer(true);
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
