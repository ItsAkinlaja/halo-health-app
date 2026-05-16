import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

export default function Wallet({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Earnings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>$120.00</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Invite Link</Text>
        <View style={styles.linkCard}>
          <Text style={styles.linkText}>halohealth.app/invite/user123</Text>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Invited</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Paid Plans</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  content: { padding: SPACING.md },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  balanceLabel: { color: COLORS.white, opacity: 0.8, fontSize: TYPOGRAPHY.sm, marginBottom: SPACING.xs },
  balanceAmount: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginBottom: SPACING.lg },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  withdrawText: { color: COLORS.primary, fontWeight: 'bold', fontSize: TYPOGRAPHY.md },
  sectionTitle: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', marginBottom: SPACING.sm, color: COLORS.text },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  linkText: { flex: 1, fontSize: TYPOGRAPHY.md, color: COLORS.textSecondary },
  copyBtn: { padding: SPACING.xs },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    ...SHADOWS.sm,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary }
});
