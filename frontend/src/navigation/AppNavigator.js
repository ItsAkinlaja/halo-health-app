import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import ProfileSetupScreen from '../screens/common/ProfileSetup';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import storage, { STORAGE_KEYS } from '../utils/storage';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer } = useAuth();
  const { setUser } = useAppContext();
  const [navigationKey, setNavigationKey] = React.useState(0);
  const [needsProfileSetup, setNeedsProfileSetup] = React.useState(false);
  // Track previous route so we only remount the navigator when the destination actually changes
  const prevRouteRef = React.useRef(null);

  // Sync user from AuthContext to AppContext
  useEffect(() => {
    setUser(user);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if profile setup is needed (only when user changes and loading is done)
  useEffect(() => {
    if (!user || isLoading) return;
    let cancelled = false;
    const checkProfileSetup = async () => {
      const profileSetupCompleted = await storage.getItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED);
      if (!cancelled) setNeedsProfileSetup(!profileSetupCompleted);
    };
    checkProfileSetup();
    return () => { cancelled = true; };
  }, [user?.id, isLoading]); // depend on user.id, not the whole object

  // Only remount the navigator when the TARGET ROUTE changes — not on every loading tick
  useEffect(() => {
    if (isLoading) return; // wait until loading is settled
    const nextRoute = !user
      ? 'Auth'
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
    if (needsDisclaimer) return 'MedicalDisclaimer';
    if (needsProfileSetup) return 'ProfileSetup';
    return 'MainApp';
  };

  const initialRouteName = getInitialRoute();

  return (
    <Stack.Navigator
      key={`nav-${navigationKey}-${user?.id || 'guest'}`}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="MedicalDisclaimer" component={MedicalDisclaimerScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="MainApp" component={MainNavigator} />
    </Stack.Navigator>
  );
}
