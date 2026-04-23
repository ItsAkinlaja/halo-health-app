import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../styles/theme';

export default function HaloMascot({ mood = 'happy', size = 80, animated = true }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Blink animation
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animated]);

  const getMoodColors = () => {
    const moodColors = {
      happy: ['#4A90E2', '#5BA3F5', '#6BB6FF'],
      excited: ['#9B59B6', '#AF7AC5', '#C39BD3'],
      concerned: ['#F39C12', '#F5AB35', '#F7BA58'],
      sad: ['#95A5A6', '#AAB7B8', '#BDC3C7'],
      neutral: ['#3498DB', '#5DADE2', '#85C1E9'],
    };
    return moodColors[mood] || moodColors.happy;
  };

  const colors = getMoodColors();
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size * 1.3 },
        animated && { transform: [{ translateY: floatAnim }] },
      ]}
    >
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size * 0.65,
            opacity: glowOpacity,
            backgroundColor: colors[0] + '20',
          },
        ]}
      />

      {/* Character body */}
      <Animated.View
        style={[
          styles.body,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Face */}
          <View style={styles.face}>
            {/* Eyes */}
            <View style={styles.eyesContainer}>
              <Animated.View
                style={[
                  styles.eye,
                  { width: size * 0.12, height: size * 0.12, opacity: blinkAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.eye,
                  { width: size * 0.12, height: size * 0.12, opacity: blinkAnim },
                ]}
              />
            </View>

            {/* Smile */}
            {mood === 'happy' && (
              <View
                style={[
                  styles.smile,
                  {
                    width: size * 0.35,
                    height: size * 0.2,
                    borderBottomLeftRadius: size * 0.175,
                    borderBottomRightRadius: size * 0.175,
                    borderWidth: size * 0.04,
                  },
                ]}
              />
            )}

            {/* Neutral mouth */}
            {mood === 'neutral' && (
              <View
                style={[
                  styles.neutralMouth,
                  { width: size * 0.25, height: size * 0.04, borderRadius: size * 0.02 },
                ]}
              />
            )}

            {/* Concerned mouth */}
            {mood === 'concerned' && (
              <View
                style={[
                  styles.concernedMouth,
                  {
                    width: size * 0.3,
                    height: size * 0.15,
                    borderTopLeftRadius: size * 0.15,
                    borderTopRightRadius: size * 0.15,
                    borderWidth: size * 0.04,
                  },
                ]}
              />
            )}
          </View>

          {/* Inner shine */}
          <View
            style={[
              styles.shine,
              {
                width: size * 0.3,
                height: size * 0.3,
                borderRadius: size * 0.15,
                top: size * 0.15,
                left: size * 0.15,
              },
            ]}
          />
        </LinearGradient>
      </Animated.View>

      {/* Halo ring */}
      <Animated.View
        style={[
          styles.haloRing,
          {
            width: size * 0.75,
            height: size * 0.18,
            borderRadius: size * 0.375,
            top: -size * 0.1,
            borderColor: colors[2],
            borderWidth: size * 0.04,
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Sparkles */}
      {animated && (
        <>
          <Animated.View
            style={[
              styles.sparkle,
              {
                width: size * 0.08,
                height: size * 0.08,
                top: size * 0.1,
                right: -size * 0.05,
                opacity: glowOpacity,
              },
            ]}
          >
            <View style={[styles.sparkleH, { backgroundColor: colors[1] }]} />
            <View style={[styles.sparkleV, { backgroundColor: colors[1] }]} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkle,
              {
                width: size * 0.06,
                height: size * 0.06,
                bottom: size * 0.15,
                left: -size * 0.03,
                opacity: glowOpacity,
              },
            ]}
          >
            <View style={[styles.sparkleH, { backgroundColor: colors[2] }]} />
            <View style={[styles.sparkleV, { backgroundColor: colors[2] }]} />
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
  },
  body: {
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  eye: {
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  smile: {
    borderColor: COLORS.white,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  neutralMouth: {
    backgroundColor: COLORS.white,
    marginTop: 4,
  },
  concernedMouth: {
    borderColor: COLORS.white,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  shine: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
  haloRing: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleH: {
    position: 'absolute',
    width: '100%',
    height: '20%',
    borderRadius: 100,
  },
  sparkleV: {
    position: 'absolute',
    width: '20%',
    height: '100%',
    borderRadius: 100,
  },
});
