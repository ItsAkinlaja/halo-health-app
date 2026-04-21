import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [data, setData] = useState({
    goals: [],
    dietaryPreferences: [],
    allergies: [],
    customAllergies: [],
    healthConditions: [],
    familyMembers: [],
    notificationSettings: {},
  });

  const saveData = (key, value) =>
    setData(prev => ({ ...prev, [key]: value }));

  return (
    <OnboardingContext.Provider value={{ data, saveData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
