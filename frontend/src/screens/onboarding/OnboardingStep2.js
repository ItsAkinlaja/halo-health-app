import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const HEALTH_GOALS = [
  { id: 'clean_eating', label: 'Clean Eating', description: 'Avoid processed foods and additives' },
  { id: 'weight_management', label: 'Weight Management', description: 'Maintain healthy weight goals' },
  { id: 'allergy_safety', label: 'Allergy Safety', description: 'Avoid allergens and triggers' },
  { id: 'family_health', label: 'Family Health', description: 'Protect your family\'s wellbeing' },
  { id: 'disease_prevention', label: 'Disease Prevention', description: 'Reduce health risk factors' },
  { id: 'athletic_performance', label: 'Athletic Performance', description: 'Optimize nutrition for fitness' },
  { id: 'digestive_health', label: 'Digestive Health', description: 'Support gut health and digestion' },
  { id: 'heart_health', label: 'Heart Health', description: 'Maintain cardiovascular wellness' },
];

export default function OnboardingStep2({ navigation, nextStep }) {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;
    nextStep(selectedGoals);
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
        <Text style={styles.headerTitle}>Health Goals</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What are your health goals?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. This helps us personalize your experience.
        </Text>

        <View style={styles.goalsGrid}>
          {HEALTH_GOALS.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              selected={selectedGoals.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedGoals.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            Continue {selectedGoals.length > 0 && `(${selectedGoals.length})`}
          </Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function GoalCard({ goal, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.goalCard, selected && styles.goalCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.goalCardHeader}>
        <Text style={[styles.goalLabel, selected && styles.goalLabelSelected]}>
          {goal.label}
        </Text>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
      </View>
      <Text style={styles.goalDescription}>{goal.description}</Text>
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
  goalsGrid: {
    gap: SPACING.md,
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  goalLabelSelected: {
    color: COLORS.primary,
  },
  goalDescription: {
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
  continueButtonDisabled: {
    backgroundColor: COLORS.border,
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
