import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../styles/theme';

export function HaloCard({ children, style, onPress, variant = 'default', padding = SPACING.base }) {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'ghost' && styles.ghost,
    variant === 'glow' && styles.glow,
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  elevated: {
    backgroundColor: COLORS.surfaceAlt,
    ...SHADOWS.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.none,
  },
  ghost: {
    backgroundColor: COLORS.surfaceHigh,
    borderColor: 'transparent',
    ...SHADOWS.none,
  },
  glow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.2)',
    ...SHADOWS.colored(COLORS.primary),
  },
});
