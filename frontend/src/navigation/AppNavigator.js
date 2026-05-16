import React, { useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';
import { OnboardingProvider } from '../context/OnboardingContext';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import ProfileSetupScreen from '../screens/common/ProfileSetup';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

const OnboardingWrapper = (props) => (
  <OnboardingProvider>
    <OnboardingFlow {...props} />
  </OnboardingProvider>
);

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer, needsProfileSetup } = useAuth();
  const { setUser } = useAppContext();
  const [navigationKey, setNavigationKey] = useState(0);
  // Track previous route so we only remount the navigator when the destination actually changes
  const prevRouteRef = useRef(null);

  // Sync user from AuthContext to AppContext
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  // Only remount the navigator when the TARGET ROUTE changes — not on every loading tick
  useEffect(() => {
    if (isLoading) return; // wait until loading is settled
    const nextRoute = !user
      ? 'Auth'
      : isFirstTime
      ? 'Onboarding'
      : needsDisclaimer
      ? 'MedicalDisclaimer'
      : needsProfileSetup
      ? 'ProfileSetup'
      : 'MainApp';
    
    if (prevRouteRef.current !== null && prevRouteRef.current !== nextRoute) {
      setNavigationKey(prev => prev + 1);
    }
    prevRouteRef.current = nextRoute;
  }, [user?.id, isLoading, isFirstTime, needsDisclaimer, needsProfileSetup]);

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
    if (needsProfileSetup) return 'ProfileSetup';
    return 'MainApp';
  };

  const initialRouteName = getInitialRoute();

  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        animation: 'fade_from_bottom'
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{ animationTypeForReplace: 'pop' }}
        />
      ) : isFirstTime ? (
        <Stack.Screen name="Onboarding" component={OnboardingWrapper} />
      ) : needsDisclaimer ? (
        <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
      ) : needsProfileSetup ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <Stack.Screen name="MainApp" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
