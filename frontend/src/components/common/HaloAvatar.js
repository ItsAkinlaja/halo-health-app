import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SHADOWS } from '../../styles/theme';

export function HaloAvatar({ size = 56, mood = 'happy', style }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const face = {
    happy: '😊', concerned: '😟', excited: '🤩',
    neutral: '😐', celebrating: '🎉', thinking: '🤔',
  };

  const glowColor =
    mood === 'concerned' ? COLORS.warning :
    mood === 'excited' || mood === 'celebrating' ? COLORS.accent :
    COLORS.primary;

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size * 1.8,
          height: size * 1.8,
          borderRadius: size * 0.9,
          backgroundColor: glowColor,
          opacity: glowAnim,
        }}
      />
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: glowColor + '22',
            borderWidth: 1.5,
            borderColor: glowColor + '60',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.48 }}>{face[mood] || face.happy}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
});
