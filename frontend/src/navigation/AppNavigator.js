import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer } = useAuth();

  useEffect(() => {
    console.log('AppNavigator state:', { 
      hasUser: !!user, 
      isLoading, 
      isFirstTime, 
      needsDisclaimer,
      userEmail: user?.email 
    });
  }, [user, isLoading, isFirstTime, needsDisclaimer]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!user) return 'Auth';
    if (isFirstTime) return 'Onboarding';
    if (needsDisclaimer) return 'MedicalDisclaimer';
    return 'MainApp';
  };

  const initialRouteName = getInitialRoute();
  console.log('Rendering AppNavigator with initialRoute:', initialRouteName);

  return (
    <Stack.Navigator 
      key={`nav-${initialRouteName}-${user?.id || 'no-user'}`}
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
