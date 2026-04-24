import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../styles/theme';

export default function HaloMascot({ mood = 'happy', size = 80, animated = true }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation for halo
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Blink animation
    Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animated]);

  const getMoodColors = () => {
    const moodColors = {
      happy: ['#00F2FE', '#4FACFE', '#007AFF'], // Cyan to Blue (Divine/Futuristic)
      excited: ['#F093FB', '#F5576C', '#FF0844'], // Pink to Red
      concerned: ['#FAD961', '#F76B1C', '#FF9500'], // Gold to Orange
      sad: ['#E2E2E2', '#C9C9C9', '#8E8E93'], // Silver to Gray
      neutral: ['#00B386', '#00D2FF', '#007AFF'], // Emerald to Blue
    };
    return moodColors[mood] || moodColors.happy;
  };

  const colors = getMoodColors();
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const haloRotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size * 1.5, height: size * 1.8 },
        animated && { transform: [{ translateY: floatAnim }] },
      ]}
    >
      {/* 1. Divine Aura / Deep Glow */}
      <Animated.View
        style={[
          styles.aura,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            opacity: glowOpacity,
            backgroundColor: colors[0],
            shadowColor: colors[0],
            shadowRadius: size * 0.4,
            shadowOpacity: 0.8,
          },
        ]}
      />

      {/* 2. Outer Halo Rings */}
      <Animated.View
        style={[
          styles.haloContainer,
          { transform: [{ rotateX: '70deg' }, { rotateZ: haloRotation }] }
        ]}
      >
        <View style={[styles.haloRing, { width: size * 1.4, height: size * 1.4, borderRadius: size * 0.7, borderColor: colors[0] + '40', borderWidth: 2 }]} />
        <View style={[styles.haloRing, { width: size * 1.2, height: size * 1.2, borderRadius: size * 0.6, borderColor: colors[1] + '60', borderWidth: 1, borderStyle: 'dashed' }]} />
      </Animated.View>

      {/* 3. Main Character Body (3D Sphere Simulation) */}
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
        {/* Base Gradient */}
        <LinearGradient
          colors={[colors[0], colors[1], colors[2]]}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
          style={styles.gradient}
        >
          {/* Surface Shine (Top Left) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
            style={[styles.surfaceShine, { width: size, height: size }]}
          />

          {/* Core Face Area */}
          <View style={styles.face}>
            {/* Cybernetic Eyes */}
            <View style={styles.eyesContainer}>
              <View style={[styles.eyeOuter, { width: size * 0.18, height: size * 0.18 }]}>
                <Animated.View
                  style={[
                    styles.eyeInner,
                    { 
                      width: size * 0.08, 
                      height: size * 0.08, 
                      opacity: blinkAnim,
                      backgroundColor: COLORS.white,
                      shadowColor: COLORS.white,
                      shadowRadius: 4,
                      shadowOpacity: 1,
                    },
                  ]}
                />
              </View>
              <View style={[styles.eyeOuter, { width: size * 0.18, height: size * 0.18 }]}>
                <Animated.View
                  style={[
                    styles.eyeInner,
                    { 
                      width: size * 0.08, 
                      height: size * 0.08, 
                      opacity: blinkAnim,
                      backgroundColor: COLORS.white,
                      shadowColor: COLORS.white,
                      shadowRadius: 4,
                      shadowOpacity: 1,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Futuristic Mouth */}
            <View style={styles.mouthContainer}>
              {mood === 'happy' && (
                <View style={[styles.smile, { width: size * 0.3, height: size * 0.1, borderColor: 'rgba(255,255,255,0.8)', borderBottomWidth: 3, borderBottomLeftRadius: size * 0.15, borderBottomRightRadius: size * 0.15 }]} />
              )}
              {mood === 'neutral' && (
                <View style={[styles.neutralMouth, { width: size * 0.2, height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 }]} />
              )}
              {mood === 'concerned' && (
                <View style={[styles.concernedMouth, { width: size * 0.25, height: size * 0.08, borderColor: 'rgba(255,255,255,0.8)', borderTopWidth: 3, borderTopLeftRadius: size * 0.12, borderTopRightRadius: size * 0.12 }]} />
              )}
            </View>
          </View>

          {/* Bottom Shadow (Inside Sphere) */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
            style={[styles.bottomShadow, { width: size, height: size }]}
          />
        </LinearGradient>

        {/* Glassmorphism Overlay */}
        <View style={[styles.glassOverlay, { width: size, height: size, borderRadius: size / 2 }]} />
      </Animated.View>

      {/* 4. Floating Energy Shards */}
      {animated && (
        <View style={styles.shardsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.shard,
                {
                  width: size * 0.06,
                  height: size * 0.06,
                  backgroundColor: colors[0],
                  opacity: glowOpacity,
                  transform: [
                    { rotate: haloRotation },
                    { translateX: size * (0.6 + i * 0.1) }
                  ]
                }
              ]}
            />
          ))}
        </View>
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
  aura: {
    position: 'absolute',
    blurRadius: 20,
  },
  haloContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    position: 'absolute',
  },
  body: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceShine: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  eyeOuter: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  eyeInner: {
    borderRadius: 100,
  },
  mouthContainer: {
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smile: {
    backgroundColor: 'transparent',
  },
  neutralMouth: {
  },
  concernedMouth: {
    backgroundColor: 'transparent',
  },
  shardsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shard: {
    position: 'absolute',
    borderRadius: 2,
    shadowColor: '#fff',
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
});
