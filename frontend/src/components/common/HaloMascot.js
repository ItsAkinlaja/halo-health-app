import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/theme';

export default function HaloMascot({ mood = 'happy', size = 80 }) {
  const getMascotStyle = () => {
    const moodColors = {
      happy: { bg: COLORS.success + '20', icon: COLORS.success },
      excited: { bg: COLORS.primary + '20', icon: COLORS.primary },
      concerned: { bg: COLORS.warning + '20', icon: COLORS.warning },
      sad: { bg: COLORS.error + '20', icon: COLORS.error },
      neutral: { bg: COLORS.textSecondary + '20', icon: COLORS.textSecondary },
    };

    return moodColors[mood] || moodColors.happy;
  };

  const getMascotIcon = () => {
    const moodIcons = {
      happy: 'happy-outline',
      excited: 'sparkles',
      concerned: 'alert-circle-outline',
      sad: 'sad-outline',
      neutral: 'ellipse-outline',
    };

    return moodIcons[mood] || 'happy-outline';
  };

  const style = getMascotStyle();

  return (
    <View style={[styles.container, { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      backgroundColor: style.bg 
    }]}>
      <View style={[styles.halo, { 
        width: size * 0.9, 
        height: size * 0.15,
        top: -size * 0.1 
      }]} />
      <Ionicons name={getMascotIcon()} size={size * 0.5} color={style.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 100,
    opacity: 0.6,
  },
});
