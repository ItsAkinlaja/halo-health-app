import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function Subscription({ navigation }) {
  const features = [
    'Unlimited product scans',
    'AI health coach access',
    'Personalized meal plans',
    'Family profiles (up to 5)',
    'Priority support',
    'Advanced analytics',
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.currentCard}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
            <Text style={styles.badgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.planName}>Premium Plan</Text>
          <Text style={styles.planPrice}>$9.99/month</Text>
          <Text style={styles.planDesc}>Active until Dec 31, 2024</Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Included Features</Text>
          <Card style={styles.featuresCard}>
            {features.map((feature, idx) => (
              <View key={idx} style={[styles.featureRow, idx > 0 && styles.featureRowBorder]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Card>
        </View>

        <Button
          title="Manage Subscription"
          variant="secondary"
          size="large"
          fullWidth
          icon="settings-outline"
          iconPosition="left"
          onPress={() => {}}
        />

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Subscription</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },
  currentCard: { padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.base },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  badgeText: { fontSize: TYPOGRAPHY.xs, fontWeight: '700', color: COLORS.white },
  planName: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  planPrice: { fontSize: TYPOGRAPHY.lg, fontWeight: '600', color: COLORS.primary, marginBottom: SPACING.xs },
  planDesc: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuresCard: { padding: 0 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.base },
  featureRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  featureText: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, flex: 1 },
  cancelBtn: { padding: SPACING.base, alignItems: 'center', marginTop: SPACING.md },
  cancelText: { fontSize: TYPOGRAPHY.sm, color: COLORS.error, fontWeight: '600' },
});
