import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alternativesService } from '../../services/alternativesService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function AlternativesList({ productId, profileId, onSelectAlternative }) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlternatives();
  }, [productId, profileId]);

  const loadAlternatives = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const data = await alternativesService.getAlternatives(productId, profileId);
      setAlternatives(data || []);
    } catch (error) {
      console.error('Error loading alternatives:', error);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (alternatives.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="leaf-outline" size={48} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No healthier alternatives found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={alternatives}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectAlternative?.(item)}
        >
          <View style={styles.header}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.brand}>{item.brand || 'Unknown Brand'}</Text>
            </View>
            <View style={[styles.score, { backgroundColor: getScoreColor(item.personalized_score || item.health_score || 50) }]}>
              <Text style={styles.scoreText}>{Math.round(item.personalized_score || item.health_score || 50)}</Text>
            </View>
          </View>

          {item.score_improvement && (
            <View style={styles.improvement}>
              <Ionicons name="trending-up" size={14} color={COLORS.success} />
              <Text style={styles.improvementText}>+{Math.round(item.score_improvement)} points better</Text>
            </View>
          )}

          {item.reason && (
            <View style={styles.recommendation}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const getScoreColor = (score) => {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.error;
};

const styles = StyleSheet.create({
  loading: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  list: {
    padding: SPACING.base,
  },
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
  brand: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  reasonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  improvement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  improvementText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: '600',
  },

});
