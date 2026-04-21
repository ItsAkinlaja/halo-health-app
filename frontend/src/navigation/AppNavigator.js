import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstTime ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : needsDisclaimer ? (
        <>
          <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
          <Stack.Screen name="MainApp" component={MainNavigator} />
        </>
      ) : (
        <Stack.Screen name="MainApp" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
