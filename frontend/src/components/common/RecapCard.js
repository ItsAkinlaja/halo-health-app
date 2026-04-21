import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HaloMascot from './HaloMascot';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

export default function RecapCard({ cardData, onShare }) {
  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getMood = (score) => {
    if (score >= 80) return 'excited';
    if (score >= 60) return 'happy';
    if (score >= 40) return 'concerned';
    return 'sad';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${cardData.productName} scan on Halo Health! Health Score: ${cardData.healthScore}/100`,
        title: 'Halo Health Scan',
      });
      onShare?.();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <HaloMascot mood={getMood(cardData.healthScore)} size={60} />
        <View style={styles.headerText}>
          <Text style={styles.productName}>{cardData.productName}</Text>
          <Text style={styles.brand}>{cardData.brand}</Text>
        </View>
        <View style={[styles.score, { backgroundColor: getScoreColor(cardData.healthScore) }]}>
          <Text style={styles.scoreText}>{cardData.healthScore}</Text>
        </View>
      </View>

      {cardData.keyInsights && cardData.keyInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {cardData.keyInsights.map((insight, idx) => (
            <View key={idx} style={styles.insightRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {cardData.concerns && cardData.concerns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concerns</Text>
          {cardData.concerns.map((concern, idx) => (
            <View key={idx} style={styles.concernRow}>
              <Ionicons name="warning" size={16} color={COLORS.warning} />
              <Text style={styles.concernText}>{concern}</Text>
            </View>
          ))}
        </View>
      )}

      {cardData.recommendation && (
        <View style={styles.recommendation}>
          <Text style={styles.recommendationText}>{cardData.recommendation}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color={COLORS.white} />
        <Text style={styles.shareButtonText}>Share Results</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Scanned with Halo Health</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brand: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  score: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  section: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  concernRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  concernText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  recommendation: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.base,
  },
  recommendationText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
