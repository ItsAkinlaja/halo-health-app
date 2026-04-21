import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ttsService } from '../../services/ttsService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function AudioPlayer({ analysis }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        ttsService.stopAudio(sound);
      }
    };
  }, [sound]);

  const handlePlay = async () => {
    try {
      if (playing && sound) {
        await ttsService.stopAudio(sound);
        setSound(null);
        setPlaying(false);
        return;
      }

      setLoading(true);
      const audioBlob = await ttsService.getProductAudio(analysis);
      const newSound = await ttsService.playAudio(audioBlob);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlaying(false);
          setSound(null);
        }
      });

      setSound(newSound);
      setPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePlay}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons
          name={playing ? 'stop-circle' : 'play-circle'}
          size={24}
          color={COLORS.primary}
        />
      )}
      <Text style={styles.text}>
        {loading ? 'Loading...' : playing ? 'Stop' : 'Listen to Results'}
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
