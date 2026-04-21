import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../styles/theme';

export function Skeleton({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={16} style={{ marginBottom: SPACING.sm }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: SPACING.xs }} />
      <Skeleton width="80%" height={14} />
    </View>
  );
}

export function SkeletonProductCard({ style }) {
  return (
    <View style={[styles.productCard, style]}>
      <Skeleton width={80} height={80} borderRadius={RADIUS.md} />
      <View style={styles.productInfo}>
        <Skeleton width="70%" height={16} style={{ marginBottom: SPACING.xs }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: SPACING.xs }} />
        <Skeleton width="40%" height={20} borderRadius={RADIUS.full} />
      </View>
    </View>
  );
}

export function SkeletonMealCard({ style }) {
  return (
    <View style={[styles.mealCard, style]}>
      <View style={styles.mealHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: SPACING.md }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="40%" height={12} style={{ marginBottom: SPACING.xs }} />
            <Skeleton width="60%" height={14} />
          </View>
        </View>
        <Skeleton width={32} height={32} borderRadius={16} />
      </View>
      <View style={styles.mealStats}>
        <Skeleton width="20%" height={14} />
        <Skeleton width="20%" height={14} />
        <Skeleton width="20%" height={14} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
