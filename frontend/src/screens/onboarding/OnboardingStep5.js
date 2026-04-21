import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes', description: 'Type 1 or Type 2' },
  { id: 'hypertension', label: 'High Blood Pressure', description: 'Hypertension' },
  { id: 'heart_disease', label: 'Heart Disease', description: 'Cardiovascular conditions' },
  { id: 'high_cholesterol', label: 'High Cholesterol', description: 'Elevated lipid levels' },
  { id: 'celiac', label: 'Celiac Disease', description: 'Gluten intolerance' },
  { id: 'ibs', label: 'IBS', description: 'Irritable bowel syndrome' },
  { id: 'crohns', label: 'Crohn\'s Disease', description: 'Inflammatory bowel disease' },
  { id: 'kidney_disease', label: 'Kidney Disease', description: 'Renal conditions' },
  { id: 'thyroid', label: 'Thyroid Disorder', description: 'Hyper or hypothyroidism' },
  { id: 'gout', label: 'Gout', description: 'Uric acid buildup' },
];

export default function OnboardingStep5({ navigation, nextStep }) {
  const [selectedConditions, setSelectedConditions] = useState([]);

  const toggleCondition = (conditionId) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleContinue = () => {
    nextStep(selectedConditions);
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
        <Text style={styles.headerTitle}>Health Conditions</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Any health conditions?</Text>
        <Text style={styles.subtitle}>
          This helps us provide personalized recommendations and flag ingredients that may affect your condition.
        </Text>

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.privacyText}>
            Your health information is private and encrypted
          </Text>
        </View>

        <View style={styles.conditionsGrid}>
          {HEALTH_CONDITIONS.map(condition => (
            <ConditionCard
              key={condition.id}
              condition={condition}
              selected={selectedConditions.includes(condition.id)}
              onPress={() => toggleCondition(condition.id)}
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

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => nextStep(selectedConditions)}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '62.5%' }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ConditionCard({ condition, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.conditionCard, selected && styles.conditionCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.conditionCardHeader}>
        <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>
          {condition.label}
        </Text>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
        </View>
      </View>
      <Text style={styles.conditionDescription}>{condition.description}</Text>
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
    marginBottom: SPACING.base,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  conditionsGrid: {
    gap: SPACING.md,
  },
  conditionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  conditionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  conditionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conditionLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  conditionLabelSelected: {
    color: COLORS.primary,
  },
  conditionDescription: {
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
    marginBottom: SPACING.sm,
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  skipButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
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
