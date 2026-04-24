import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MedicalDisclaimerScreen from '../screens/common/MedicalDisclaimerScreen';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../styles/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading, isFirstTime, needsDisclaimer } = useAuth();
  const { setUser } = useAppContext();
  const [navigationKey, setNavigationKey] = React.useState(0);

  // Sync user from AuthContext to AppContext
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      setNavigationKey(prev => prev + 1);
    }
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
    // Skip onboarding since it was done before registration
    if (needsDisclaimer) return 'MedicalDisclaimer';
    return 'MainApp';
  };

  const initialRouteName = getInitialRoute();

  return (
    <Stack.Navigator 
      key={`nav-${navigationKey}-${initialRouteName}-${user?.id || 'no-user'}`}
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
