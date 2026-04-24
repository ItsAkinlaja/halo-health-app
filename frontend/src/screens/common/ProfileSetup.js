import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { profileService } from '../../services/profileService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import storage, { STORAGE_KEYS } from '../../utils/storage';

const HEALTH_GOALS = [
  { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
  { id: 'muscle_gain', label: 'Build Muscle', icon: 'fitness' },
  { id: 'healthy_eating', label: 'Healthy Eating', icon: 'nutrition' },
  { id: 'manage_allergies', label: 'Manage Allergies', icon: 'medical' },
  { id: 'disease_prevention', label: 'Disease Prevention', icon: 'shield-checkmark' },
  { id: 'general_wellness', label: 'General Wellness', icon: 'heart' },
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'Low-Fat', 'Halal', 'Kosher', 'Pescatarian', 'Other', 'None',
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Other', 'None',
];

export default function ProfileSetup({ navigation }) {
  const { user } = useAuth();
  const { setActiveProfile, setProfiles } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [otherAllergy, setOtherAllergy] = useState('');
  const [otherRestriction, setOtherRestriction] = useState('');

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter your name');
        return;
      }
      if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
        Alert.alert('Required', 'Please enter a valid age');
        return;
      }
      if (!gender) {
        Alert.alert('Required', 'Please select your gender');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedGoals.length === 0) {
        Alert.alert('Required', 'Please select at least one health goal');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handleCreateProfile();
    }
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    try {
      // Get onboarding data from storage
      const onboardingData = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA) || {};

      // Create primary profile
      const profileData = {
        name: name.trim(),
        relationship: 'self',
        age: parseInt(age),
        gender,
        is_primary: true,
        health_goals: selectedGoals,
        dietary_restrictions: [
          ...selectedRestrictions.filter(r => r !== 'None' && r !== 'Other'),
          ...(selectedRestrictions.includes('Other') && otherRestriction.trim() ? [otherRestriction.trim()] : []),
        ],
        allergies: [
          ...selectedAllergies.filter(a => a !== 'None' && a !== 'Other'),
          ...(selectedAllergies.includes('Other') && otherAllergy.trim() ? [otherAllergy.trim()] : []),
        ],
        health_conditions: onboardingData.healthConditions || [],
      };

      const response = await profileService.createProfile(profileData);
      
      if (response.status === 'success' && response.data) {
        // Set as active profile
        setActiveProfile(response.data);
        setProfiles([response.data]);
        
        // Store profile ID in AsyncStorage
        await storage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, response.data.id);
        await storage.setItem(STORAGE_KEYS.PROFILE_SETUP_COMPLETED, true);

        // Navigate to main app
        navigation.replace('MainApp');
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>
        This helps us personalize your health recommendations
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Name *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Age *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderRow}>
          {['male', 'female', 'other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              onPress={() => setGender(g)}
            >
              <Ionicons
                name={g === 'male' ? 'male' : g === 'female' ? 'female' : 'transgender'}
                size={20}
                color={gender === g ? COLORS.white : COLORS.textSecondary}
              />
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What are your health goals?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>

      <View style={styles.goalsGrid}>
        {HEALTH_GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoals.includes(goal.id) && styles.goalCardActive,
            ]}
            onPress={() => toggleSelection(goal.id, selectedGoals, setSelectedGoals)}
          >
            <Ionicons
              name={goal.icon}
              size={28}
              color={selectedGoals.includes(goal.id) ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.goalLabel,
                selectedGoals.includes(goal.id) && styles.goalLabelActive,
              ]}
            >
              {goal.label}
            </Text>
            {selectedGoals.includes(goal.id) && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Any dietary restrictions?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>

      <View style={styles.chipsContainer}>
        {DIETARY_RESTRICTIONS.map((restriction) => (
          <TouchableOpacity
            key={restriction}
            style={[
              styles.chip,
              selectedRestrictions.includes(restriction) && styles.chipActive,
            ]}
            onPress={() => toggleSelection(restriction, selectedRestrictions, setSelectedRestrictions)}
          >
            <Text
              style={[
                styles.chipText,
                selectedRestrictions.includes(restriction) && styles.chipTextActive,
              ]}
            >
              {restriction}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedRestrictions.includes('Other') && (
        <View style={[styles.inputGroup, { marginTop: SPACING.lg }]}>
          <Text style={styles.label}>Please specify other dietary restriction</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="restaurant-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={otherRestriction}
              onChangeText={setOtherRestriction}
              placeholder="e.g. Low Sodium, No Sugar"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Do you have any allergies?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>

      <View style={styles.chipsContainer}>
        {COMMON_ALLERGIES.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            style={[
              styles.chip,
              selectedAllergies.includes(allergy) && styles.chipActive,
            ]}
            onPress={() => toggleSelection(allergy, selectedAllergies, setSelectedAllergies)}
          >
            <Text
              style={[
                styles.chipText,
                selectedAllergies.includes(allergy) && styles.chipTextActive,
              ]}
            >
              {allergy}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedAllergies.includes('Other') && (
        <View style={[styles.inputGroup, { marginTop: SPACING.lg }]}>
          <Text style={styles.label}>Please specify other allergy</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="medical-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={otherAllergy}
              onChangeText={setOtherAllergy}
              placeholder="e.g. Strawberries, Garlic"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Your Profile</Text>
            
            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>Step {step} of 4</Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.card}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </Card>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            )}
            <Button
              title={step === 4 ? 'Complete Setup' : 'Continue'}
              onPress={handleNext}
              loading={loading}
              disabled={loading}
              style={styles.nextButton}
              icon={step === 4 ? 'checkmark' : 'arrow-forward'}
              iconPosition="right"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  progressContainer: { marginTop: SPACING.sm },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  card: { padding: SPACING.xl },
  stepContainer: {},
  stepTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  inputGroup: { marginBottom: SPACING.lg },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  genderBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genderTextActive: { color: COLORS.white },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  goalCard: {
    width: '47%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  goalCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  goalLabelActive: { color: COLORS.primary },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: COLORS.white },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nextButton: { flex: 1 },
});
