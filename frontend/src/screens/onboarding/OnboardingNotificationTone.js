import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const NOTIFICATION_TONES = [
  {
    id: 'funny_playful',
    name: 'Funny & Playful',
    icon: 'happy-outline',
    color: '#F39C12',
    description: 'Humor, wit, and lighthearted language. Fun and entertaining.',
    example: '🎉 Nice! You just dodged a bullet with that scan. That product had more red flags than a bullfighting convention!',
  },
  {
    id: 'motivational',
    name: 'Motivational & Inspirational',
    icon: 'trophy-outline',
    color: '#E74C3C',
    description: 'Energizing, uplifting language that celebrates every clean choice.',
    example: '💪 You\'re crushing it! Every clean swap you make is a step toward a healthier, stronger you. Keep going!',
  },
  {
    id: 'girl_talk',
    name: 'Girl Talk',
    icon: 'chatbubbles-outline',
    color: '#FF69B4',
    description: 'Warm, honest, and real. The way a close girlfriend speaks. Direct, caring, no fluff.',
    example: '👯 Girl, that product is a hard pass. Trust me on this one. I found you something way better.',
  },
  {
    id: 'youre_amazing',
    name: 'You\'re Amazing',
    icon: 'star-outline',
    color: '#FFD700',
    description: 'Celebratory and affirming. Every notification reminds you how impressive you are.',
    example: '⭐ The fact that you even care about what\'s in your food puts you ahead of 95% of people. You\'re amazing!',
  },
  {
    id: 'doctor_level',
    name: 'Doctor Level',
    icon: 'medical-outline',
    color: '#3498DB',
    description: 'Clinical, precise, and factual. Science-first language with medical authority.',
    example: '🔬 Analysis complete. This product contains 3 ingredients linked to systemic inflammation. Recommendation: avoid.',
  },
  {
    id: 'calm_gentle',
    name: 'Calm & Gentle',
    icon: 'leaf-outline',
    color: '#4ECDC4',
    description: 'Soft, non-pressuring, and supportive. No urgency or excitement.',
    example: '🌿 Just a gentle reminder: this product may not align with your health goals. Take your time deciding.',
  },
  {
    id: 'straight_talker',
    name: 'Straight Talker',
    icon: 'megaphone-outline',
    color: '#E67E22',
    description: 'No sugarcoating, no fluff. Direct and honest. If something is bad, Halo says it plainly.',
    example: '🚨 This product is garbage. High seed oils, artificial sweeteners, and 4 red-flag ingredients. Don\'t buy it.',
  },
  {
    id: 'parent_mode',
    name: 'Parent Mode',
    icon: 'heart-circle-outline',
    color: '#9B59B6',
    description: 'Nurturing, family-focused language. Every notification framed around protecting loved ones.',
    example: '👨‍👩‍👧 This product isn\'t safe for your little ones. Let me show you something better for your family.',
  },
];

export default function OnboardingNotificationTone({ navigation, nextStep }) {
  const [selectedTone, setSelectedTone] = useState(null);

  const handleContinue = () => {
    if (selectedTone) {
      nextStep(selectedTone);
    }
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
        <Text style={styles.headerTitle}>Notification Tone</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How should Halo talk to you?</Text>
        <Text style={styles.subtitle}>
          Choose the personality and tone for all notifications, tips, and messages from Halo.
        </Text>

        <View style={styles.tonesContainer}>
          {NOTIFICATION_TONES.map((tone) => (
            <ToneCard
              key={tone.id}
              tone={tone}
              selected={selectedTone === tone.id}
              onSelect={() => setSelectedTone(tone.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedTone && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedTone}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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

function ToneCard({ tone, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.toneCard, selected && styles.toneCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.toneIcon, { backgroundColor: tone.color + '20' }]}>
        <Ionicons name={tone.icon} size={28} color={tone.color} />
      </View>

      <View style={styles.toneInfo}>
        <Text style={[styles.toneName, selected && styles.toneNameSelected]}>
          {tone.name}
        </Text>
        <Text style={styles.toneDescription}>{tone.description}</Text>
        
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.exampleText}>{tone.example}</Text>
        </View>
      </View>

      {selected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        </View>
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
    marginBottom: SPACING.xl,
  },
  tonesContainer: {
    gap: SPACING.md,
  },
  toneCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    position: 'relative',
  },
  toneCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  toneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  toneInfo: {
    flex: 1,
  },
  toneName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  toneNameSelected: {
    color: COLORS.primary,
  },
  toneDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exampleLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
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
