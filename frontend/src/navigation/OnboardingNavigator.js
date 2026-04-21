import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingStep1 from '../screens/onboarding/OnboardingStep1';
import OnboardingStep2 from '../screens/onboarding/OnboardingStep2';
import OnboardingStep3 from '../screens/onboarding/OnboardingStep3';
import OnboardingStep4 from '../screens/onboarding/OnboardingStep4';
import OnboardingStep5 from '../screens/onboarding/OnboardingStep5';
import OnboardingStep6 from '../screens/onboarding/OnboardingStep6';
import OnboardingStep7 from '../screens/onboarding/OnboardingStep7';
import OnboardingStep8 from '../screens/onboarding/OnboardingStep8';
import { useAuth } from '../hooks/useAuth';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';
import { AppContext } from '../context/AppContext';
import { profileService } from '../services/profileService';

const Stack = createNativeStackNavigator();

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
      nextStep={(prefs) => { saveData('dietaryPreferences', prefs); navigation.navigate('OnboardingStep4'); }}
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
  const { completeOnboarding } = useAuth();
  const { data } = useOnboarding();
  const { user } = useContext(AppContext);

  const handleComplete = async () => {
    console.log('OnboardingStep8Wrapper: handleComplete called');
    console.log('User ID:', user?.id);
    
    try {
      if (user?.id) {
        console.log('Checking for existing profiles...');
        // Check if profiles already exist
        const existingProfiles = await profileService.getProfiles(user.id);
        console.log('Existing profiles count:', existingProfiles?.length || 0);
        
        if (existingProfiles && existingProfiles.length > 0) {
          console.log('Profiles already exist, skipping creation');
        } else {
          console.log('Creating primary profile...');
          // Create the primary health profile with all collected data
          await profileService.createProfile({
            user_id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || 'My Profile',
            is_primary: true,
            health_goals: data.goals || [],
            dietary_restrictions: data.dietaryPreferences || [],
            allergies: [...(data.allergies || []), ...(data.customAllergies || [])],
            health_conditions: data.healthConditions || [],
            notification_settings: data.notificationSettings || {},
          });
          console.log('Primary profile created');

          // Create family member profiles (if any)
          if (data.familyMembers && data.familyMembers.length > 0) {
            console.log('Creating family member profiles:', data.familyMembers.length);
            for (const member of data.familyMembers) {
              await profileService.createProfile({
                user_id: user.id,
                name: member.name,
                age: member.age ? parseInt(member.age, 10) : null,
                relationship: member.relationship,
                is_primary: false,
              });
            }
            console.log('Family member profiles created');
          }
        }
      }
    } catch (error) {
      console.warn('Failed to save onboarding profile:', error.message);
      // Don't block completion — user can update profile later
    }

    console.log('Calling completeOnboarding...');
    await completeOnboarding();
    console.log('completeOnboarding finished');
  };

  return <OnboardingStep8 navigation={navigation} nextStep={handleComplete} />;
};

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Wrapper} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Wrapper} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Wrapper} />
      <Stack.Screen name="OnboardingStep4" component={OnboardingStep4Wrapper} />
      <Stack.Screen name="OnboardingStep5" component={OnboardingStep5Wrapper} />
      <Stack.Screen name="OnboardingStep6" component={OnboardingStep6Wrapper} />
      <Stack.Screen name="OnboardingStep7" component={OnboardingStep7Wrapper} />
      <Stack.Screen name="OnboardingStep8" component={OnboardingStep8Wrapper} />
    </Stack.Navigator>
  );
}

export default function OnboardingNavigator() {
  return (
    <OnboardingProvider>
      <OnboardingStack />
    </OnboardingProvider>
  );
}
