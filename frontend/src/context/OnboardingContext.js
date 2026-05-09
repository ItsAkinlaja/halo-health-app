import React, { createContext, useContext, useState } from 'react';
import storage, { STORAGE_KEYS } from '../utils/storage';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [data, setData] = useState({
    goals: [],
    dietaryPreferences: [],
    haloVoice: null,
    notificationTone: null,
    allergies: [],
    customAllergies: [],
    healthConditions: [],
    familyMembers: [],
    notificationSettings: {},
  });

  const saveData = (key, value) =>
    setData(prev => ({ ...prev, [key]: value }));

  // Persist entire onboarding data to AsyncStorage
  const persistData = async (extraData = {}) => {
    const merged = { ...data, ...extraData };
    await storage.setItem(STORAGE_KEYS.ONBOARDING_DATA, merged);
    return merged;
  };

  return (
    <OnboardingContext.Provider value={{ data, saveData, persistData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
