import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function MenuItemCard({ item }) {
  const { analysis } = item;

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return COLORS.success;
      case 'good': return '#4CAF50';
      case 'fair': return COLORS.warning;
      case 'poor': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.price && <Text style={styles.price}>{item.price}</Text>}
          {item.description && <Text style={styles.description}>{item.description}</Text>}
        </View>
        {analysis && (
          <View style={[styles.score, { backgroundColor: getRatingColor(analysis.healthRating) }]}>
            <Text style={styles.scoreText}>{analysis.healthScore}</Text>
          </View>
        )}
      </View>

      {analysis && (
        <>
          {analysis.calories && (
            <Text style={styles.calories}>~{analysis.calories} calories</Text>
          )}

          {analysis.concerns && analysis.concerns.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
                <Text style={styles.sectionTitle}>Concerns</Text>
              </View>
              {analysis.concerns.map((concern, idx) => (
                <Text key={idx} style={styles.item}>• {concern}</Text>
              ))}
            </View>
          )}

          {analysis.benefits && analysis.benefits.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                <Text style={styles.sectionTitle}>Benefits</Text>
              </View>
              {analysis.benefits.map((benefit, idx) => (
                <Text key={idx} style={styles.item}>• {benefit}</Text>
              ))}
            </View>
          )}

          {analysis.recommendation && (
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  score: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  calories: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  item: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.base,
  },
  recommendation: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  recommendationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
  },
});
