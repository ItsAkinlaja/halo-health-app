import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function AudioPlayer({ analysis }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handlePlay = async () => {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      
      if (isSpeaking) {
        await Speech.stop();
        setPlaying(false);
        return;
      }

      const textToSpeak = analysis?.summary || "No analysis available.";
      
      setPlaying(true);
      Speech.speak(textToSpeak, {
        language: 'en-US',
        pitch: 1.0,
        rate: 1.0,
        onDone: () => setPlaying(false),
        onStopped: () => setPlaying(false),
        onError: () => setPlaying(false),
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      setPlaying(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePlay}
    >
      <Ionicons
        name={playing ? 'stop-circle' : 'play-circle'}
        size={24}
        color={COLORS.primary}
      />
      <Text style={styles.text}>
        {playing ? 'Stop Listening' : 'Listen to Results'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
