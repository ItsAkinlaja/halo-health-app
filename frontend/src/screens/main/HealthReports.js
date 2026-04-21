import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ScoreRing } from '../../components/common/ScoreRing';
import { profileService } from '../../services/profileService';
import { scanService } from '../../services/scanService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor, getScoreLabel } from '../../styles/theme';

const { width: W } = Dimensions.get('window');

const PERIODS = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
];

const CATEGORIES = [
  { key: 'food', label: 'Food', icon: 'nutrition-outline' },
  { key: 'beverages', label: 'Beverages', icon: 'water-outline' },
  { key: 'personal_care', label: 'Personal Care', icon: 'sparkles-outline' },
  { key: 'household', label: 'Household', icon: 'home-outline' },
  { key: 'supplements', label: 'Supplements', icon: 'fitness-outline' },
];

export default function HealthReports({ navigation }) {
  const { user, activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [scanStats, setScanStats] = useState(null);

  useEffect(() => {
    load();
  }, [activeProfile, period]);

  const load = async () => {
    const profileId = activeProfile?.id || user?.id;
    if (!profileId) { setLoading(false); return; }

    try {
      setLoading(true);
      const [analyticsData, statsData] = await Promise.all([
        profileService.getAnalytics(profileId, period),
        scanService.getScanStats(profileId, period),
      ]);
      setAnalytics(analyticsData);
      setScanStats(statsData);
    } catch (error) {
      console.warn('Failed to load health reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const overallScore = analytics?.overall_score ?? scanStats?.average_score ?? 0;
  const totalScans = scanStats?.total_scans ?? analytics?.total_scans ?? 0;
  const trend = analytics?.trend ?? scanStats?.trend ?? 0;
  const categoryScores = analytics?.category_scores ?? scanStats?.categoryScores ?? {};
  const scoreHistory = analytics?.score_history ?? [];
  const topIngredients = analytics?.top_flagged_ingredients ?? [];
  const improvements = analytics?.improvements ?? [];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Reports</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.periodBtn, period === p.id && styles.periodBtnActive]}
              onPress={() => setPeriod(p.id)}
            >
              <Text style={[styles.periodText, period === p.id && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Score Card */}
        <Card style={styles.scoreCard} variant="elevated">
          <View style={styles.scoreTop}>
            <View style={styles.scoreLeft}>
              <Text style={styles.scoreCardTitle}>Overall Health Score</Text>
              <Text style={styles.scoreCardSub}>
                Based on {totalScans} scan{totalScans !== 1 ? 's' : ''}
              </Text>
              {trend !== 0 && (
                <View style={styles.trendRow}>
                  <Ionicons
                    name={trend > 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={trend > 0 ? COLORS.success : COLORS.error}
                  />
                  <Text style={[styles.trendText, { color: trend > 0 ? COLORS.success : COLORS.error }]}>
                    {trend > 0 ? '+' : ''}{trend} pts vs previous period
                  </Text>
                </View>
              )}
              <View style={[styles.scoreLabelBadge, { backgroundColor: getScoreColor(overallScore) + '15' }]}>
                <Text style={[styles.scoreLabelText, { color: getScoreColor(overallScore) }]}>
                  {getScoreLabel(overallScore)}
                </Text>
              </View>
            </View>
            <ScoreRing score={overallScore} size={120} strokeWidth={10} />
          </View>

          {/* Mini stats */}
          <View style={styles.miniStats}>
            {[
              { label: 'Scans', value: totalScans, icon: 'scan-outline' },
              { label: 'Clean Products', value: analytics?.clean_count ?? 0, icon: 'checkmark-circle-outline' },
              { label: 'Flagged', value: analytics?.flagged_count ?? 0, icon: 'warning-outline' },
            ].map((s) => (
              <View key={s.label} style={styles.miniStat}>
                <Ionicons name={s.icon} size={18} color={COLORS.primary} />
                <Text style={styles.miniStatValue}>{s.value}</Text>
                <Text style={styles.miniStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Score History Bar Chart */}
        {scoreHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Score History</Text>
            <Card style={styles.chartCard}>
              <View style={styles.barChart}>
                {scoreHistory.slice(-10).map((entry, i) => {
                  const barH = Math.max(4, (entry.score / 100) * 80);
                  const color = getScoreColor(entry.score);
                  return (
                    <View key={i} style={styles.barCol}>
                      <Text style={styles.barValue}>{entry.score}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: barH, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {entry.label ?? `W${i + 1}`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <Card style={styles.categoryCard}>
          {CATEGORIES.map((cat, i) => {
            const score = categoryScores[cat.key] ?? categoryScores[cat.label] ?? 0;
            const color = getScoreColor(score);
            return (
              <View key={cat.key} style={[styles.categoryRow, i < CATEGORIES.length - 1 && styles.categoryRowBorder]}>
                <View style={[styles.catIconWrap, { backgroundColor: color + '15' }]}>
                  <Ionicons name={cat.icon} size={18} color={color} />
                </View>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <Text style={[styles.catScore, { color }]}>{score}</Text>
                  </View>
                  <View style={styles.catBar}>
                    <View style={[styles.catBarFill, { width: `${score}%`, backgroundColor: color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Top Flagged Ingredients */}
        {topIngredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Most Flagged Ingredients</Text>
            <Card style={styles.flaggedCard}>
              {topIngredients.slice(0, 5).map((item, i) => (
                <View key={i} style={[styles.flaggedRow, i < topIngredients.length - 1 && styles.flaggedRowBorder]}>
                  <View style={styles.flaggedLeft}>
                    <View style={styles.flaggedRank}>
                      <Text style={styles.flaggedRankText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.flaggedName}>{item.name ?? item}</Text>
                  </View>
                  {item.count && (
                    <Text style={styles.flaggedCount}>{item.count}x</Text>
                  )}
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Improvement Tips */}
        {improvements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {improvements.slice(0, 3).map((tip, i) => (
              <Card key={i} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.tipTitle}>{tip.title ?? `Tip ${i + 1}`}</Text>
                </View>
                <Text style={styles.tipBody}>{tip.description ?? tip}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Empty state when no data */}
        {totalScans === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Start scanning products to generate your health report
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Scanner')}>
              <Text style={styles.emptyBtnText}>Scan a Product</Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={{ height: SPACING.xxxl }} />
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.base },
  loadingText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500' },

  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.base,
    alignSelf: 'center',
    gap: 2,
    ...SHADOWS.xs,
  },
  periodBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { fontSize: TYPOGRAPHY.sm, fontWeight: '600', color: COLORS.textSecondary },
  periodTextActive: { color: COLORS.white },

  scoreCard: { marginBottom: SPACING.base, padding: SPACING.lg },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.base },
  scoreLeft: { flex: 1, paddingRight: SPACING.base, gap: SPACING.sm },
  scoreCardTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  scoreCardSub: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { fontSize: TYPOGRAPHY.sm, fontWeight: '600' },
  scoreLabelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  scoreLabelText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700' },

  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  miniStat: { alignItems: 'center', gap: 4 },
  miniStatValue: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary },
  miniStatLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '500' },

  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.base,
  },

  chartCard: { marginBottom: SPACING.base, padding: SPACING.base },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary },
  barTrack: { width: '60%', height: 80, justifyContent: 'flex-end', backgroundColor: COLORS.border, borderRadius: RADIUS.xs, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: RADIUS.xs },
  barLabel: { fontSize: 9, color: COLORS.textTertiary, fontWeight: '500' },

  categoryCard: { marginBottom: SPACING.base, padding: SPACING.base, gap: SPACING.md },
  categoryRow: { paddingBottom: SPACING.md },
  categoryRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.md },
  catIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  catInfo: { gap: SPACING.xs },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  catScore: { fontSize: TYPOGRAPHY.base, fontWeight: '700' },
  catBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },

  flaggedCard: { marginBottom: SPACING.base, padding: 0 },
  flaggedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base },
  flaggedRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  flaggedLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  flaggedRank: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.error + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  flaggedRankText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.error },
  flaggedName: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  flaggedCount: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.textSecondary },

  tipCard: { marginBottom: SPACING.sm, padding: SPACING.base },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tipTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  tipBody: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20 },

  emptyCard: { alignItems: 'center', padding: SPACING.xxl, gap: SPACING.sm, marginTop: SPACING.base },
  emptyTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  emptyBtnText: { fontSize: TYPOGRAPHY.sm, fontWeight: '600', color: COLORS.white },
});

