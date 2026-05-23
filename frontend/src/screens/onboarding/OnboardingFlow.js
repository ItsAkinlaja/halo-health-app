import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, SafeAreaView, Platform, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '../../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- DATA ---
const ONBOARDING_STEPS = [
  { id: 'welcome', type: 'welcome' },
  { id: 'goals', type: 'multi-select', title: 'What are your health goals?', subtitle: 'Select all that apply', dataKey: 'goals', options: [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
    { id: 'muscle_gain', label: 'Build Muscle', icon: 'fitness' },
    { id: 'healthy_eating', label: 'Healthy Eating', icon: 'nutrition' },
    { id: 'manage_allergies', label: 'Manage Allergies', icon: 'medical' },
    { id: 'disease_prevention', label: 'Disease Prevention', icon: 'shield-checkmark' },
    { id: 'general_wellness', label: 'General Wellness', icon: 'heart' }
  ]},
  { id: 'diet', type: 'multi-select', title: 'Any dietary restrictions?', subtitle: 'Select all that apply', dataKey: 'dietaryPreferences', options: [
    { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
    { id: 'vegan', label: 'Vegan', icon: 'leaf-outline' },
    { id: 'gluten_free', label: 'Gluten-Free', icon: 'nutrition' },
    { id: 'dairy_free', label: 'Dairy-Free', icon: 'water' },
    { id: 'keto', label: 'Keto', icon: 'fish' },
    { id: 'none', label: 'None', icon: 'checkmark-circle' }
  ]},
  { id: 'allergies', type: 'multi-select', title: 'Do you have any allergies?', subtitle: 'Select all that apply', dataKey: 'allergies', options: [
    { id: 'peanuts', label: 'Peanuts', icon: 'nutrition' },
    { id: 'tree_nuts', label: 'Tree Nuts', icon: 'leaf' },
    { id: 'milk', label: 'Milk', icon: 'water' },
    { id: 'eggs', label: 'Eggs', icon: 'egg' },
    { id: 'wheat', label: 'Wheat', icon: 'cafe' },
    { id: 'soy', label: 'Soy', icon: 'cube' },
    { id: 'fish', label: 'Fish', icon: 'fish' },
    { id: 'none', label: 'None', icon: 'checkmark-circle' }
  ]},
  { id: 'voice', type: 'single-select', title: 'Choose Halo\'s Voice', subtitle: 'How should your AI companion sound?', dataKey: 'haloVoice', options: [
    { id: 'calm_clear_female', label: 'Calm & Clear (Female)', icon: 'person' },
    { id: 'warm_friendly_female', label: 'Warm & Friendly (Female)', icon: 'happy' },
    { id: 'professional_male', label: 'Professional (Male)', icon: 'briefcase' },
    { id: 'energetic_male', label: 'Energetic (Male)', icon: 'flash' },
  ]},
  { id: 'ready', type: 'ready' }
];

export default function OnboardingFlow({ navigation }) {
  const { saveData, persistData } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Local state for current selections
  const [selections, setSelections] = useState({
    goals: [],
    dietaryPreferences: [],
    allergies: [],
    haloVoice: 'calm_clear_female'
  });

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Save all local state to context, then persist
      saveData('goals', selections.goals);
      saveData('dietaryPreferences', selections.dietaryPreferences);
      saveData('allergies', selections.allergies);
      saveData('haloVoice', selections.haloVoice);
      
      await persistData();
      navigation.navigate('Register');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const toggleSelection = (stepKey, optionId, isSingle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSelections(prev => {
      if (isSingle) {
        return { ...prev, [stepKey]: optionId };
      }
      
      const currentList = prev[stepKey];
      if (optionId === 'none') {
        return { ...prev, [stepKey]: ['none'] };
      }
      
      let newList;
      if (currentList.includes(optionId)) {
        newList = currentList.filter(id => id !== optionId);
      } else {
        newList = [...currentList.filter(id => id !== 'none'), optionId];
      }
      return { ...prev, [stepKey]: newList };
    });
  };

  const renderItem = ({ item, index }) => {
    if (item.type === 'welcome') {
      return (
        <View style={styles.page}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.centerContent}>
            <View style={styles.iconRing}>
              <Ionicons name="sparkles" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Meet Halo Health</Text>
            <Text style={styles.welcomeSubtitle}>
              Your intelligent companion for living cleaner, safer, and healthier. Let's personalize your experience.
            </Text>
          </Animated.View>
        </View>
      );
    }

    if (item.type === 'ready') {
      return (
        <View style={styles.page}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.centerContent}>
            <View style={styles.iconRing}>
              <Ionicons name="checkmark-circle" size={60} color={COLORS.success} />
            </View>
            <Text style={styles.welcomeTitle}>You're all set!</Text>
            <Text style={styles.welcomeSubtitle}>
              We've tailored Halo to your preferences. Create an account to save your profile.
            </Text>
          </Animated.View>
        </View>
      );
    }

    // Options grid (Multi or Single select)
    return (
      <View style={styles.page}>
        <View style={styles.pageHeader}>
          <Animated.Text entering={FadeInDown.delay(100)} style={styles.pageTitle}>{item.title}</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.pageSubtitle}>{item.subtitle}</Animated.Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {item.options.map((opt, i) => {
            const isSingle = item.type === 'single-select';
            const isSelected = isSingle 
              ? selections[item.dataKey] === opt.id 
              : selections[item.dataKey].includes(opt.id);

            return (
              <Animated.View key={opt.id} entering={FadeInDown.delay(200 + (i * 50)).springify()}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => toggleSelection(item.dataKey, opt.id, isSingle)}
                >
                  <Ionicons name={opt.icon} size={32} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      
      {/* Top Progress & Back */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, SPACING.sm) }] }>
        {currentIndex > 0 ? (
          <TouchableOpacity onPress={handleBack} hitSlop={{top:20,bottom:20,left:20,right:20}}>
            <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : <View style={{ width: 28 }} />}
        
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex) / (ONBOARDING_STEPS.length - 1)) * 100}%` }
            ]} 
          />
        </View>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {currentIndex === 0 ? "Let's Go" : currentIndex === ONBOARDING_STEPS.length - 1 ? "Create Account" : "Continue"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginHorizontal: SPACING.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  grid: {
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 84,
  },
  optionCard: {
    width: (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.md) / 2,
    aspectRatio: 0.92,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
});
