import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const CATEGORIES = [
  {
    id: 'supplements',
    name: 'Supplements',
    icon: 'fitness',
    color: '#FF6B6B',
    description: 'Vitamins, minerals, and dietary supplements',
    tips: ['Check for third-party testing', 'Verify ingredient purity', 'Look for certifications'],
  },
  {
    id: 'personal_care',
    name: 'Personal Care',
    icon: 'water',
    color: '#4ECDC4',
    description: 'Skincare, haircare, and beauty products',
    tips: ['Avoid parabens and sulfates', 'Check for fragrance-free options', 'Look for natural ingredients'],
  },
  {
    id: 'household',
    name: 'Household',
    icon: 'home',
    color: '#95E1D3',
    description: 'Cleaning products and home essentials',
    tips: ['Choose eco-friendly options', 'Avoid harsh chemicals', 'Check for biodegradable formulas'],
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    icon: 'restaurant',
    color: '#F38181',
    description: 'Packaged foods and drinks',
    tips: ['Read ingredient lists', 'Check for added sugars', 'Verify nutritional content'],
  },
];

export default function CategoryScanner({ onSelectCategory }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scan by Category</Text>
      <Text style={styles.subtitle}>
        Get specialized analysis for different product types
      </Text>

      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.card, { borderLeftColor: category.color }]}
          onPress={() => onSelectCategory(category)}
        >
          <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
            <Ionicons name={category.icon} size={32} color={category.color} />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.description}>{category.description}</Text>

            <View style={styles.tips}>
              {category.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  tips: {
    marginTop: SPACING.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  tipText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
});
