import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/auth/Welcome';
import LanguageSelection from '../screens/auth/LanguageSelection';
import OnboardingPreview from '../screens/auth/OnboardingPreview';
import OnboardingStep1 from '../screens/onboarding/OnboardingStep1';
import OnboardingStep2 from '../screens/onboarding/OnboardingStep2';
import OnboardingStep3 from '../screens/onboarding/OnboardingStep3';
import OnboardingVoiceSelection from '../screens/onboarding/OnboardingVoiceSelection';
import OnboardingNotificationTone from '../screens/onboarding/OnboardingNotificationTone';
import OnboardingStep4 from '../screens/onboarding/OnboardingStep4';
import OnboardingStep5 from '../screens/onboarding/OnboardingStep5';
import OnboardingStep6 from '../screens/onboarding/OnboardingStep6';
import OnboardingStep7 from '../screens/onboarding/OnboardingStep7';
import OnboardingStep8 from '../screens/onboarding/OnboardingStep8';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyEmail from '../screens/auth/VerifyEmail';
import ResetPasswordOtp from '../screens/auth/ResetPasswordOtp';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import storage, { STORAGE_KEYS } from '../utils/storage';

const Stack = createNativeStackNavigator();

// Wrapper components for onboarding steps
const OnboardingStep1Wrapper = ({ navigation }) => (
  <OnboardingStep1 navigation={navigation} nextStep={() => navigation.navigate('OnboardingStep2')} />
);

const OnboardingStep2Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep2
      navigation={navigation}
      nextStep={(goals) => { saveData('goals', goals); navigation.navigate('OnboardingStep3'); }}
    />
  );
};

const OnboardingStep3Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep3
      navigation={navigation}
      nextStep={(prefs) => { saveData('dietaryPreferences', prefs); navigation.navigate('OnboardingVoiceSelection'); }}
    />
  );
};

const OnboardingVoiceSelectionWrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingVoiceSelection
      navigation={navigation}
      nextStep={(voice) => { saveData('haloVoice', voice); navigation.navigate('OnboardingNotificationTone'); }}
    />
  );
};

const OnboardingNotificationToneWrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingNotificationTone
      navigation={navigation}
      nextStep={(tone) => { saveData('notificationTone', tone); navigation.navigate('OnboardingStep4'); }}
    />
  );
};

const OnboardingStep4Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep4
      navigation={navigation}
      nextStep={(allergies, custom) => { saveData('allergies', allergies); saveData('customAllergies', custom); navigation.navigate('OnboardingStep5'); }}
    />
  );
};

const OnboardingStep5Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep5
      navigation={navigation}
      nextStep={(conditions) => { saveData('healthConditions', conditions); navigation.navigate('OnboardingStep6'); }}
    />
  );
};

const OnboardingStep6Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep6
      navigation={navigation}
      nextStep={(members) => { saveData('familyMembers', members); navigation.navigate('OnboardingStep7'); }}
    />
  );
};

const OnboardingStep7Wrapper = ({ navigation }) => {
  const { saveData } = useOnboarding();
  return (
    <OnboardingStep7
      navigation={navigation}
      nextStep={(settings) => { saveData('notificationSettings', settings); navigation.navigate('OnboardingStep8'); }}
    />
  );
};

const OnboardingStep8Wrapper = ({ navigation }) => {
  const { data } = useOnboarding();

  const handleComplete = async () => {
    // Save onboarding data to storage for later use after registration
    await storage.setItem(STORAGE_KEYS.ONBOARDING_DATA, data);
    // Navigate to registration
    navigation.navigate('Register');
  };

  return <OnboardingStep8 navigation={navigation} nextStep={handleComplete} />;
};

function AuthStack({ initialRoute }) {
  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
      <Stack.Screen name="OnboardingPreview" component={OnboardingPreview} />
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Wrapper} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Wrapper} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Wrapper} />
      <Stack.Screen name="OnboardingVoiceSelection" component={OnboardingVoiceSelectionWrapper} />
      <Stack.Screen name="OnboardingNotificationTone" component={OnboardingNotificationToneWrapper} />
      <Stack.Screen name="OnboardingStep4" component={OnboardingStep4Wrapper} />
      <Stack.Screen name="OnboardingStep5" component={OnboardingStep5Wrapper} />
      <Stack.Screen name="OnboardingStep6" component={OnboardingStep6Wrapper} />
      <Stack.Screen name="OnboardingStep7" component={OnboardingStep7Wrapper} />
      <Stack.Screen name="OnboardingStep8" component={OnboardingStep8Wrapper} />
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
