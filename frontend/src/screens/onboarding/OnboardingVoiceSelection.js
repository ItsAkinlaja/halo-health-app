import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import HaloMascot from '../../components/common/HaloMascot';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const VOICE_OPTIONS = [
  {
    id: 'calm_clear_female',
    name: 'Calm & Clear',
    gender: 'Female',
    description: 'Warm, measured, and reassuring. Like a trusted health professional.',
    icon: 'woman-outline',
    color: '#4ECDC4',
    sampleText: 'Hello, I\'m Halo. I\'m here to help you make healthier choices every day.',
  },
  {
    id: 'confident_male',
    name: 'Confident & Authoritative',
    gender: 'Male',
    description: 'Strong, clear, and trustworthy. Like a knowledgeable doctor.',
    icon: 'man-outline',
    color: '#3498DB',
    sampleText: 'Hello, I\'m Halo. Let me guide you to better health decisions.',
  },
  {
    id: 'friendly_female',
    name: 'Friendly & Upbeat',
    gender: 'Female',
    description: 'Light, energetic, and encouraging. Like a health-conscious friend.',
    icon: 'happy-outline',
    color: '#F39C12',
    sampleText: 'Hey there! I\'m Halo, and I\'m so excited to help you live healthier!',
  },
  {
    id: 'deep_male',
    name: 'Deep & Grounding',
    gender: 'Male',
    description: 'Deep, slow, and calming. Ideal for measured, serious delivery.',
    icon: 'shield-checkmark-outline',
    color: '#34495E',
    sampleText: 'Greetings. I am Halo, your trusted health companion.',
  },
  {
    id: 'warm_nurturing_female',
    name: 'Warm & Nurturing',
    gender: 'Female',
    description: 'Soft, caring, and gentle. Perfect for family health guidance.',
    icon: 'heart-outline',
    color: '#E74C3C',
    sampleText: 'Hi sweetie, I\'m Halo. Let\'s take care of your family\'s health together.',
  },
  {
    id: 'young_energetic',
    name: 'Young & Energetic',
    gender: 'Neutral',
    description: 'Bright, modern, and fast-paced. Perfect for quick, snappy delivery.',
    icon: 'flash-outline',
    color: '#9B59B6',
    sampleText: 'Yo! I\'m Halo. Ready to scan some products and level up your health?',
  },
];

export default function OnboardingVoiceSelection({ navigation, nextStep }) {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [sound, setSound] = useState(null);

  const playVoiceSample = async (voice) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.unloadAsync();
      }

      setPlayingVoice(voice.id);

      // In production, load actual voice sample audio file
      // For now, just simulate playback
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);

    } catch (error) {
      console.error('Error playing voice sample:', error);
      setPlayingVoice(null);
    }
  };

  const handleContinue = () => {
    if (selectedVoice) {
      nextStep(selectedVoice);
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
        <Text style={styles.headerTitle}>Halo's Voice</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotWrapper}>
          <HaloMascot mood={playingVoice ? 'excited' : 'happy'} size={120} animated={true} />
        </View>

        <Text style={styles.title}>Choose Halo's Voice</Text>
        <Text style={styles.subtitle}>
          Select the voice that Halo will use when speaking scan results, tips, and health coaching messages.
        </Text>

        <View style={styles.voicesContainer}>
          {VOICE_OPTIONS.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              selected={selectedVoice === voice.id}
              playing={playingVoice === voice.id}
              onSelect={() => setSelectedVoice(voice.id)}
              onPlay={() => playVoiceSample(voice)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedVoice && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedVoice}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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

function VoiceCard({ voice, selected, playing, onSelect, onPlay }) {
  return (
    <TouchableOpacity
      style={[styles.voiceCard, selected && styles.voiceCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.voiceIcon, { backgroundColor: voice.color + '20' }]}>
        <Ionicons name={voice.icon} size={32} color={voice.color} />
      </View>

      <View style={styles.voiceInfo}>
        <View style={styles.voiceHeader}>
          <Text style={[styles.voiceName, selected && styles.voiceNameSelected]}>
            {voice.name}
          </Text>
          <Text style={styles.voiceGender}>{voice.gender}</Text>
        </View>
        <Text style={styles.voiceDescription}>{voice.description}</Text>
        <Text style={styles.voiceSample}>"{voice.sampleText}"</Text>
      </View>

      <TouchableOpacity
        style={[styles.playButton, playing && styles.playButtonPlaying]}
        onPress={(e) => {
          e.stopPropagation();
          onPlay();
        }}
      >
        <Ionicons
          name={playing ? 'stop' : 'play'}
          size={20}
          color={playing ? COLORS.error : COLORS.primary}
        />
      </TouchableOpacity>

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
    paddingTop: SPACING.base,
    paddingBottom: SPACING.xxl,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    height: 160,
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
  voicesContainer: {
    gap: SPACING.md,
  },
  voiceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    position: 'relative',
  },
  voiceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  voiceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  voiceName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  voiceNameSelected: {
    color: COLORS.primary,
  },
  voiceGender: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  voiceDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  voiceSample: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  playButtonPlaying: {
    backgroundColor: COLORS.error + '20',
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
