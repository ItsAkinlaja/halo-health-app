import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
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

  // Determine which screen to show
  let initialRouteName;
  if (!user) {
    initialRouteName = isFirstTime ? 'Onboarding' : 'Auth';
  } else if (needsDisclaimer) {
    initialRouteName = 'MedicalDisclaimer';
  } else {
    initialRouteName = 'MainApp';
  }

  return (
    <Stack.Navigator 
      key={initialRouteName}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
      <Stack.Screen name="MainApp" component={MainNavigator} />
    </Stack.Navigator>
  );
}
