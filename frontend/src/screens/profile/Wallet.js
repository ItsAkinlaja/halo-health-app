import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';
import { useAppContext } from '../../context/AppContext';
import { referralService } from '../../services/referralService';

export default function Wallet({ navigation }) {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalEarned: 0 });
  const [earnings, setEarnings] = useState({ stats: { total: 0, pending: 0, paid: 0 } });
  const [referralCode, setReferralCode] = useState('');

  const username = useMemo(() => {
    return user?.user_metadata?.username
      || user?.user_metadata?.halo_health_id
      || user?.user_metadata?.name?.replace(/\s+/g, '').toLowerCase()
      || user?.email?.split('@')[0]
      || 'user';
  }, [user]);

  const inviteLink = useMemo(() => {
    const base = `https://halohealth.app/invite/${encodeURIComponent(username)}`;
    return referralCode ? `${base}?ref=${encodeURIComponent(referralCode)}` : base;
  }, [username, referralCode]);

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        setLoading(true);
        const [codeRes, statsRes, earningsRes] = await Promise.allSettled([
          referralService.getReferralCode(),
          referralService.getReferralStats(),
          referralService.getEarnings(),
        ]);

        if (codeRes.status === 'fulfilled') {
          setReferralCode(codeRes.value || '');
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value || { total: 0, completed: 0, pending: 0, totalEarned: 0 });
        }

        if (earningsRes.status === 'fulfilled') {
          setEarnings(earningsRes.value || { stats: { total: 0, pending: 0, paid: 0 } });
        }

        const failed = [codeRes, statsRes, earningsRes].filter((res) => res.status === 'rejected');
        if (failed.length > 0) {
          console.warn('One or more referral endpoints failed to load.');
        }
      } catch (error) {
        console.warn('Failed to load referral data:', error.message);
        Alert.alert('Error', error.message || 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, []);

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join me on Halo Health using my invite link: ${inviteLink}`,
        url: inviteLink,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share invite link right now.');
    }
  };

  const handleWithdraw = async () => {
    const available = Number(earnings?.stats?.pending || 0);
    if (!Number.isFinite(available) || available <= 0) {
      Alert.alert('No funds available', 'You need available earnings before requesting a withdrawal.');
      return;
    }

    try {
      setLoading(true);
      await referralService.requestPayout(available, 'manual', {
        source: 'wallet',
        note: 'Manual admin payout processing',
      });

      Alert.alert(
        'Withdrawal request submitted',
        'Your request is now pending admin review. You will receive a confirmation once payment is processed.'
      );

      const nextEarnings = await referralService.getEarnings();
      setEarnings(nextEarnings || { stats: { total: 0, pending: 0, paid: 0 } });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.balanceAmount}>${Number(earnings?.stats?.pending || 0).toFixed(2)}</Text>
          )}
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} disabled={loading}>
            <Text style={styles.withdrawText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Invite Link</Text>
        <View style={styles.linkCard}>
          <Text style={styles.linkText}>{inviteLink}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleShareInvite}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {referralCode ? (
          <Text style={styles.codeText}>Referral code: {referralCode}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{loading ? '...' : stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Invited</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{loading ? '...' : stats?.completed || 0}</Text>
            <Text style={styles.statLabel}>Completed Referrals</Text>
          </View>
        </View>

        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How Earnings Work</Text>
          <Text style={styles.howItWorksText}>1. Share your invite link.</Text>
          <Text style={styles.howItWorksText}>2. A new user signs up with your referral code.</Text>
          <Text style={styles.howItWorksText}>3. After their first successful scan, you earn $1.</Text>
          <Text style={styles.howItWorksText}>4. Withdraw requests are reviewed and processed manually by Halo Health admin.</Text>
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
  codeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
  },
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
  ,
  howItWorksCard: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  howItWorksTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  howItWorksText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  }
});
