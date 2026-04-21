import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const DIETARY_PREFERENCES = [
  { id: 'none', label: 'No Restrictions', description: 'I eat everything' },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', description: 'No animal products' },
  { id: 'pescatarian', label: 'Pescatarian', description: 'Fish but no meat' },
  { id: 'keto', label: 'Ketogenic', description: 'Low carb, high fat' },
  { id: 'paleo', label: 'Paleo', description: 'Whole foods, no grains' },
  { id: 'gluten_free', label: 'Gluten-Free', description: 'No wheat or gluten' },
  { id: 'dairy_free', label: 'Dairy-Free', description: 'No milk products' },
  { id: 'low_sodium', label: 'Low Sodium', description: 'Reduced salt intake' },
  { id: 'low_sugar', label: 'Low Sugar', description: 'Minimal added sugars' },
  { id: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
  { id: 'kosher', label: 'Kosher', description: 'Jewish dietary laws' },
];

export default function OnboardingStep3({ navigation, nextStep }) {
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const togglePreference = (prefId) => {
    if (prefId === 'none') {
      setSelectedPreferences(['none']);
      return;
    }

    setSelectedPreferences(prev => {
      const filtered = prev.filter(id => id !== 'none');
      return filtered.includes(prefId)
        ? filtered.filter(id => id !== prefId)
        : [...filtered, prefId];
    });
  };

  const handleContinue = () => {
    nextStep(selectedPreferences);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dietary Preferences</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What's your dietary preference?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. We'll use this to filter products and provide relevant recommendations.
        </Text>

        <View style={styles.preferencesGrid}>
          {DIETARY_PREFERENCES.map(pref => (
            <PreferenceCard
              key={pref.id}
              preference={pref}
              selected={selectedPreferences.includes(pref.id)}
              onPress={() => togglePreference(pref.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '37.5%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function PreferenceCard({ preference, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.prefCard, selected && styles.prefCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.prefCardHeader}>
        <Text style={[styles.prefLabel, selected && styles.prefLabelSelected]}>
          {preference.label}
        </Text>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
      </View>
      <Text style={styles.prefDescription}>{preference.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  preferencesGrid: {
    gap: SPACING.md,
  },
  prefCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  prefCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  prefCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  prefLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  prefLabelSelected: {
    color: COLORS.primary,
  },
  prefDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.base,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
