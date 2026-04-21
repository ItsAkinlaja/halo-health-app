import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY, getScoreBadgeColor } from '../../styles/theme';

export function ScoreBadge({ score, size = 'md' }) {
  const { bg, text } = getScoreBadgeColor(score);
  const label = score >= 80 ? 'GREAT' : score >= 60 ? 'GOOD' : score >= 40 ? 'OKAY' : score >= 20 ? 'BAD' : 'AVOID';

  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 3, fontSize: TYPOGRAPHY.xs },
    md: { paddingHorizontal: 12, paddingVertical: 5, fontSize: TYPOGRAPHY.sm },
    lg: { paddingHorizontal: 16, paddingVertical: 7, fontSize: TYPOGRAPHY.base },
  };

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: sizeStyles[size].paddingHorizontal, paddingVertical: sizeStyles[size].paddingVertical }]}>
      <Text style={[styles.label, { color: text, fontSize: sizeStyles[size].fontSize }]}>{label}</Text>
    </View>
  );
}

export function StatusBadge({ label, color = COLORS.primary, bgColor }) {
  const bg = bgColor || color + '18';
  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4 }]}>
      <Text style={[styles.label, { color, fontSize: TYPOGRAPHY.xs }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
