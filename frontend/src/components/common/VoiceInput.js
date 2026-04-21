import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function VoiceInput({ onTranscript, placeholder = "Tap to speak" }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for voice input');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // In production, send audio to backend for transcription
      // For now, simulate transcription
      setTimeout(() => {
        const mockTranscript = "I'm lactose intolerant and my son is allergic to peanuts";
        onTranscript(mockTranscript);
        setIsProcessing(false);
      }, 1500);

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRecording && styles.containerRecording,
        isProcessing && styles.containerProcessing
      ]}
      onPress={handlePress}
      disabled={isProcessing}
      activeOpacity={0.7}
    >
      {isProcessing ? (
        <>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.text}>Processing...</Text>
        </>
      ) : isRecording ? (
        <>
          <View style={styles.recordingPulse}>
            <Ionicons name="mic" size={20} color={COLORS.error} />
          </View>
          <Text style={[styles.text, styles.textRecording]}>Tap to stop</Text>
        </>
      ) : (
        <>
          <Ionicons name="mic-outline" size={20} color={COLORS.primary} />
          <Text style={styles.text}>{placeholder}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  containerRecording: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  containerProcessing: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.border,
  },
  recordingPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  textRecording: {
    color: COLORS.error,
  },
});
