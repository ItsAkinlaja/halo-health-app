import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const COMMON_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts', severity: 'high' },
  { id: 'tree_nuts', label: 'Tree Nuts', severity: 'high' },
  { id: 'milk', label: 'Milk', severity: 'medium' },
  { id: 'eggs', label: 'Eggs', severity: 'medium' },
  { id: 'wheat', label: 'Wheat', severity: 'medium' },
  { id: 'soy', label: 'Soy', severity: 'medium' },
  { id: 'fish', label: 'Fish', severity: 'high' },
  { id: 'shellfish', label: 'Shellfish', severity: 'high' },
  { id: 'sesame', label: 'Sesame', severity: 'medium' },
  { id: 'mustard', label: 'Mustard', severity: 'low' },
  { id: 'celery', label: 'Celery', severity: 'low' },
  { id: 'sulfites', label: 'Sulfites', severity: 'medium' },
];

export default function OnboardingStep4({ navigation, nextStep }) {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [customAllergies, setCustomAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (trimmed) {
      setCustomAllergies(prev => [...prev, trimmed]);
      setCustomAllergy('');
    }
  };

  const handleContinue = () => {
    nextStep(selectedAllergies, customAllergies);
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
        <Text style={styles.headerTitle}>Allergies</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Do you have any allergies?</Text>
        <Text style={styles.subtitle}>
          Select all allergens you need to avoid. We'll alert you when scanning products.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            This information is critical for your safety. We'll flag products containing these allergens.
          </Text>
        </View>

        <View style={styles.allergiesGrid}>
          {COMMON_ALLERGENS.map(allergen => (
            <AllergyChip
              key={allergen.id}
              allergen={allergen}
              selected={selectedAllergies.includes(allergen.id)}
              onPress={() => toggleAllergy(allergen.id)}
            />
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Other Allergies</Text>
          {customAllergies.length > 0 && (
            <View style={styles.allergiesGrid}>
              {customAllergies.map((name, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.allergyChip, styles.allergyChipSelected]}
                  onPress={() => setCustomAllergies(prev => prev.filter((_, idx) => idx !== i))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.allergyLabel, styles.allergyLabelSelected]}>{name}</Text>
                  <Ionicons name="close-circle" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Enter custom allergen"
              placeholderTextColor={COLORS.textTertiary}
              value={customAllergy}
              onChangeText={setCustomAllergy}
              onSubmitEditing={addCustomAllergy}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomAllergy}
              disabled={!customAllergy.trim()}
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
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
          onPress={() => nextStep(selectedAllergies, customAllergies)}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AllergyChip({ allergen, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.allergyChip, selected && styles.allergyChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.allergyLabel, selected && styles.allergyLabelSelected]}>
        {allergen.label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
      )}
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
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    lineHeight: 20,
  },
  allergiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  allergyChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  allergyLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  allergyLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  customSection: {
    marginTop: SPACING.base,
  },
  customLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
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
