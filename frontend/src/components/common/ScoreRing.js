import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, getScoreColor, getScoreLabel } from '../../styles/theme';

export function ScoreRing({ score = 0, size = 120, strokeWidth = 8, showLabel = true }) {
  const animatedScore = useRef(new Animated.Value(0)).current;
  const [dashOffset, setDashOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const id = animatedScore.addListener(({ value }) => {
      setDashOffset(circumference - (value / 100) * circumference);
    });
    return () => animatedScore.removeListener(id);
  }, [score]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color, fontSize: size * 0.28 }]}>{score}</Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: size * 0.11 }]}>{label}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
    letterSpacing: -1,
  },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
});
