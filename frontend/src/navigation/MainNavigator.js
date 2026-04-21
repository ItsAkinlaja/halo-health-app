import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeDashboard from '../screens/main/HomeDashboard';
import Scanner from '../screens/main/Scanner';
import SocialFeed from '../screens/main/SocialFeed';
import MealPlanner from '../screens/main/MealPlanner';
import Profile from '../screens/main/Profile';
import ProductDetails from '../screens/main/ProductDetails';
import Settings from '../screens/main/Settings';
import Notifications from '../screens/main/Notifications';
import ScanHistory from '../screens/main/ScanHistory';
import PlaceholderScreen from '../screens/common/PlaceholderScreen';
import Allergies from '../screens/profile/Allergies';
import DietaryRestrictions from '../screens/profile/DietaryRestrictions';
import PersonalInfo from '../screens/profile/PersonalInfo';
import FamilyProfiles from '../screens/profile/FamilyProfiles';
import SavedProducts from '../screens/profile/SavedProducts';
import HealthReports from '../screens/main/HealthReports';
import MealDetails from '../screens/main/MealDetails';
import EditProfile from '../screens/main/EditProfile';
import AICoach from '../screens/main/AICoach';
import Appearance from '../screens/settings/Appearance';
import Language from '../screens/settings/Language';
import NotificationSettings from '../screens/settings/NotificationSettings';
import Subscription from '../screens/settings/Subscription';
import Privacy from '../screens/settings/Privacy';
import HelpCenter from '../screens/settings/HelpCenter';
import ContactSupport from '../screens/settings/ContactSupport';
import Terms from '../screens/settings/Terms';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ScanTabIcon({ focused }) {
  return (
    <View style={[styles.scanTabBtn, focused && styles.scanTabBtnActive]}>
      <Ionicons name="scan" size={24} color={COLORS.white} />
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MealsTab"
        component={MealPlanner}
        options={{
          tabBarLabel: 'Meals',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScannerTab"
        component={Scanner}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <ScanTabIcon focused={focused} />,
          tabBarItemStyle: styles.scanTabItem,
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={SocialFeed}
        options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="ScanHistory" component={ScanHistory} />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Meals" component={MealPlanner} />
      
      {/* Settings Screens */}
      <Stack.Screen name="ProfileInfo" component={PersonalInfo} />
      <Stack.Screen name="Dietary" component={DietaryRestrictions} />
      <Stack.Screen name="Appearance" component={Appearance} />
      <Stack.Screen name="Language" component={Language} />
      <Stack.Screen name="Support" component={HelpCenter} />
      
      {/* Profile Screens */}
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="DietaryRestrictions" component={DietaryRestrictions} />
      <Stack.Screen name="Allergies" component={Allergies} />
      <Stack.Screen name="FamilyProfiles" component={FamilyProfiles} />
      <Stack.Screen name="SavedProducts" component={SavedProducts} />
      <Stack.Screen name="MealPlans" component={PlaceholderScreen} />
      <Stack.Screen name="HealthReports" component={HealthReports} />
      <Stack.Screen name="Subscription" component={Subscription} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="HelpCenter" component={HelpCenter} />
      <Stack.Screen name="ContactSupport" component={ContactSupport} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="AICoach" component={AICoach} />
      
      {/* Meal Planner Screens */}
      <Stack.Screen name="MealDetails" component={MealDetails} />
    </Stack.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 12,
    ...SHADOWS.lg,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    marginTop: 4,
  },
  tabItem: {
    paddingTop: 4,
  },
  scanTabItem: {
    paddingTop: 0,
    marginTop: -12,
  },
  scanTabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  scanTabBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
});
