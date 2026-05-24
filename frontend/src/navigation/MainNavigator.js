import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeDashboard from '../screens/main/HomeDashboard';
import Scanner from '../screens/main/Scanner';
import Explore from '../screens/main/Explore';
import SocialFeed from '../screens/main/SocialFeed';
import SocialSearch from '../screens/main/SocialSearch';
import CreatePost from '../screens/main/CreatePost';
import PostDetails from '../screens/main/PostDetails';
import UserProfile from '../screens/main/UserProfile';
import HaloStore from '../screens/main/HaloStore';
import HouseholdHub from '../screens/main/HouseholdHub';
import MealPlanner from '../screens/main/MealPlanner';
import Profile from '../screens/main/Profile';
import ProductDetails from '../screens/main/ProductDetails';
import Settings from '../screens/main/Settings';
import Notifications from '../screens/main/Notifications';
import ScanHistory from '../screens/main/ScanHistory';
import PlaceholderScreen from '../screens/common/PlaceholderScreen';
import DebugScreen from '../screens/common/DebugScreen';
import Allergies from '../screens/profile/Allergies';
import DietaryRestrictions from '../screens/profile/DietaryRestrictions';
import PersonalInfo from '../screens/profile/PersonalInfo';
import FamilyProfiles from '../screens/profile/FamilyProfiles';
import SavedProducts from '../screens/profile/SavedProducts';
import HealthReports from '../screens/main/HealthReports';
import MealDetails from '../screens/main/MealDetails';
import EditProfile from '../screens/main/EditProfile';
import AICoach from '../screens/main/AICoach';
import RestaurantMenuScanner from '../screens/main/RestaurantMenuScanner';
import RestaurantFinder from '../screens/main/RestaurantFinder';
import WaterAnalysis from '../screens/main/WaterAnalysis';
import SupplementTracker from '../screens/main/SupplementTracker';
import Appearance from '../screens/settings/Appearance';
import Language from '../screens/settings/Language';
import NotificationSettings from '../screens/settings/NotificationSettings';
import Subscription from '../screens/settings/Subscription';
import Privacy from '../screens/settings/Privacy';
import HelpCenter from '../screens/settings/HelpCenter';
import ContactSupport from '../screens/settings/ContactSupport';
import Terms from '../screens/settings/Terms';
import NewsFeed from '../screens/main/NewsFeed';
import GroceryExplorer from '../screens/main/GroceryExplorer';
import PantryTracker from '../screens/main/PantryTracker';
import ProductSubmission from '../screens/main/ProductSubmission';
import CommunityGroups from '../screens/main/CommunityGroups';
import Wallet from '../screens/profile/Wallet';
import HomeEnvironmentAudit from '../screens/main/HomeEnvironmentAudit';
import Challenges from '../screens/main/Challenges';
import ShoppingListUI from '../screens/main/ShoppingListUI';
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
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: styles.tabBar.height + insets.bottom,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10),
          },
        ],
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
        name="ExploreTab"
        component={Explore}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
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
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="SocialSearch" component={SocialSearch} />
      <Stack.Screen name="PostDetails" component={PostDetails} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Meals" component={MealPlanner} />
      <Stack.Screen name="HaloStore" component={HaloStore} />
      <Stack.Screen name="HouseholdHub" component={HouseholdHub} />
      <Stack.Screen name="BookDoctor" component={PlaceholderScreen} />
      <Stack.Screen name="PersonalCare" component={PlaceholderScreen} />
      <Stack.Screen name="BabyKids" component={PlaceholderScreen} />
      <Stack.Screen name="PetFood" component={PlaceholderScreen} />
      <Stack.Screen name="RecapsWrapped" component={PlaceholderScreen} />
      <Stack.Screen name="Referrals" component={PlaceholderScreen} />
      <Stack.Screen name="Debug" component={DebugScreen} />
      
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
      <Stack.Screen name="RestaurantMenuScanner" component={RestaurantMenuScanner} />
      <Stack.Screen name="RestaurantFinder" component={RestaurantFinder} />
      <Stack.Screen name="WaterAnalysis" component={WaterAnalysis} />
      <Stack.Screen name="SupplementTracker" component={SupplementTracker} />
      
      {/* Meal Planner Screens */}
      <Stack.Screen name="MealDetails" component={MealDetails} />
      
      {/* Newly Added Screens */}
      <Stack.Screen name="NewsFeed" component={NewsFeed} />
      <Stack.Screen name="GroceryExplorer" component={GroceryExplorer} />
      <Stack.Screen name="PantryTracker" component={PantryTracker} />
      <Stack.Screen name="ProductSubmission" component={ProductSubmission} />
      <Stack.Screen name="CommunityGroups" component={CommunityGroups} />
      <Stack.Screen name="Wallet" component={Wallet} />
      <Stack.Screen name="HomeEnvironmentAudit" component={HomeEnvironmentAudit} />
      <Stack.Screen name="Challenges" component={Challenges} />
      <Stack.Screen name="ShoppingList" component={ShoppingListUI} />
    </Stack.Navigator>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 88 : 76,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 10,
    ...SHADOWS.lg,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 2,
  },
  scanTabItem: {
    paddingTop: 0,
    marginTop: -10,
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
