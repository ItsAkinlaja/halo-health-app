import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/auth/Welcome';
import OnboardingFlow from '../screens/onboarding/OnboardingFlow';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyEmail from '../screens/auth/VerifyEmail';
import ResetPasswordOtp from '../screens/auth/ResetPasswordOtp';
import { OnboardingProvider } from '../context/OnboardingContext';
import storage, { STORAGE_KEYS } from '../utils/storage';

const Stack = createNativeStackNavigator();

function AuthStack({ initialRoute }) {
  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlow} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
      <Stack.Screen name="ResetPasswordOtp" component={ResetPasswordOtp} />
    </Stack.Navigator>
  );
}

export default function AuthNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setInitialRoute(completed ? 'Login' : 'Welcome');
    };
    checkOnboarding();
  }, []);

  if (!initialRoute) return null;

  return (
    <OnboardingProvider>
      <AuthStack initialRoute={initialRoute} />
    </OnboardingProvider>
  );
}
