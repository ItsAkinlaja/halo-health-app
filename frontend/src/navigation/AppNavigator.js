import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer } = useAuth();

  if (isLoading) {
    return null; // Show loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstTime ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : needsDisclaimer ? (
        <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
      ) : !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainApp" component={MainNavigator} />
          <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
