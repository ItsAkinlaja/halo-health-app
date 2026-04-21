import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import { Card } from '../../components/common/Card';
import { scanService } from '../../services/scanService';
import { notificationService } from '../../services/notificationService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor } from '../../styles/theme';

const { width: W } = Dimensions.get('window');

const formatTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  
  const now = new Date();
  const scanTime = new Date(timestamp);
  const diffMs = now - scanTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return scanTime.toLocaleDateString();
};

export default function HomeDashboard({ navigation }) {
  const { user, activeProfile, profiles, setActiveProfile } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(0);
  const [recentScans, setRecentScans] = useState([]);
  const [scanStats, setScanStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDisclaimerBanner, setShowDisclaimerBanner] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-set user as active profile if none selected
    if (!activeProfile && user) {
      setActiveProfile({ id: user.id, name: user.user_metadata?.name || user.email?.split('@')[0] || 'Me' });
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
    checkDisclaimerStatus();
  }, [activeProfile]);

  const loadDashboardData = async () => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const scansData = await scanService.getScanHistory(activeProfile.id, {
        limit: 5,
        offset: 0,
      });
      setRecentScans(scansData || []);

      const statsData = await scanService.getScanStats(activeProfile.id, '30d');
      setScanStats(statsData);

      if (scansData && scansData.length > 0) {
        const avgScore = scansData.reduce((sum, scan) => sum + (scan.score || 0), 0) / scansData.length;
        setHealthScore(Math.round(avgScore));
      } else {
        setHealthScore(0);
      }

      if (user?.id) {
        const { count } = await notificationService.getUnreadCount(user.id);
        setUnreadCount(count || 0);
      }

    } catch (error) {
      console.warn('Failed to load dashboard data:', error.message);
      setHealthScore(0);
      setRecentScans([]);
    } finally {
      setLoading(false);
    }
  };

  const checkDisclaimerStatus = async () => {
    try {
      const disclaimerAccepted = await AsyncStorage.getItem('medicalDisclaimerAccepted');
      setShowDisclaimerBanner(!disclaimerAccepted);
    } catch (error) {
      console.warn('Failed to check disclaimer status:', error);
    }
  };

  const getGreeting = useCallback(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [activeProfile]);

  const displayName = activeProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
              {unreadCount > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medical Disclaimer Banner */}
        {showDisclaimerBanner && (
          <TouchableOpacity
            style={styles.disclaimerBanner}
            onPress={() => navigation.navigate('MedicalDisclaimer')}
            activeOpacity={0.8}
          >
            <View style={styles.disclaimerIcon}>
              <Ionicons name="medical" size={20} color={COLORS.warning} />
            </View>
            <View style={styles.disclaimerContent}>
              <Text style={styles.disclaimerTitle}>Important Medical Disclaimer</Text>
              <Text style={styles.disclaimerText}>Tap to read before using health features</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.warning} />
          </TouchableOpacity>
        )}

        {/* Profile Selector */}
        {profiles.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.profileRow}
            contentContainerStyle={styles.profileRowContent}
          >
            {[{ id: 'self', name: 'Me' }, ...profiles].map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.profileChip,
                  activeProfile?.id === p.id && styles.profileChipActive,
                ]}
                onPress={() => setActiveProfile(p)}
              >
                <View style={[
                  styles.profileDot,
                  activeProfile?.id === p.id && styles.profileDotActive,
                ]} />
                <Text
                  style={[
                    styles.profileName,
                    activeProfile?.id === p.id && styles.profileNameActive,
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Health Score Hero */}
        <Card style={styles.heroCard} variant="elevated">
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Health Score</Text>
              <Text style={styles.heroSub}>
                {recentScans.length > 0 
                  ? `Based on ${recentScans.length} recent scans`
                  : 'Start scanning to see your score'
                }
              </Text>
              {scanStats?.trend && (
                <View style={styles.trendRow}>
                  <Ionicons 
                    name={scanStats.trend > 0 ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={scanStats.trend > 0 ? COLORS.success : COLORS.error} 
                  />
                  <Text style={[styles.trendText, { color: scanStats.trend > 0 ? COLORS.success : COLORS.error }]}>
                    {scanStats.trend > 0 ? '+' : ''}{scanStats.trend} points this week
                  </Text>
                </View>
              )}
            </View>
            <ScoreRing score={healthScore} size={110} strokeWidth={9} />
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            {scanStats?.categoryScores ? (
              Object.entries(scanStats.categoryScores).slice(0, 3).map(([category, score]) => (
                <View key={category} style={styles.heroStat}>
                  <Text style={[styles.heroStatScore, { color: getScoreColor(score) }]}>
                    {score}
                  </Text>
                  <Text style={styles.heroStatLabel}>{category}</Text>
                </View>
              ))
            ) : (
              [
                { label: 'Food', score: healthScore },
                { label: 'Beverages', score: healthScore },
                { label: 'Personal Care', score: healthScore },
              ].map((item) => (
                <View key={item.label} style={styles.heroStat}>
                  <Text style={[styles.heroStatScore, { color: getScoreColor(item.score) }]}>
                    {item.score}
                  </Text>
                  <Text style={styles.heroStatLabel}>{item.label}</Text>
                </View>
              ))
            )}
          </View>
        </Card>

        {/* Scan Now CTA */}
        <TouchableOpacity
          style={styles.scanCTA}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.8}
        >
          <View style={styles.scanCTALeft}>
            <View style={styles.scanIconWrap}>
              <Ionicons name="scan" size={24} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.scanCTATitle}>Scan Product</Text>
              <Text style={styles.scanCTASub}>Instant ingredient analysis</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Daily Insight */}
        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.insightTitle}>Today's Health Insight</Text>
          </View>
          <Text style={styles.insightBody}>
            Start scanning products to receive personalized health insights based on your dietary preferences and health goals.
          </Text>
          <TouchableOpacity 
            style={styles.insightAction}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.insightActionText}>Scan your first product</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </Card>

        {/* Today's Meals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Meals')}>
            <Text style={styles.sectionLink}>View plan</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mealsRow}
        >
          {[
            { meal: 'Breakfast', name: 'Overnight Oats', cal: 380, done: true },
            { meal: 'Lunch', name: 'Grilled Salmon Bowl', cal: 520, done: false },
            { meal: 'Dinner', name: 'Lentil Curry', cal: 460, done: false },
          ].map((item) => (
            <Card
              key={item.meal}
              style={styles.mealCard}
              onPress={() => navigation.navigate('Meals')}
            >
              <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{item.meal}</Text>
                {item.done && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                )}
              </View>
              <Text style={styles.mealName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.mealCal}>{item.cal} kcal</Text>
            </Card>
          ))}
          <Card
            style={[styles.mealCard, styles.mealAddCard]}
            onPress={() => navigation.navigate('Meals')}
          >
            <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
            <Text style={styles.mealAddText}>Plan meals</Text>
          </Card>
        </ScrollView>

        {/* Recent Scans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ScanHistory')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentScans.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="scan-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>Start scanning products to see your health insights</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.emptyButtonText}>Scan Now</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          recentScans.map((scan) => (
            <Card
              key={scan.id}
              style={styles.scanItem}
              onPress={() => navigation.navigate('ProductDetails', { 
                productId: scan.product_id,
                scanId: scan.id 
              })}
            >
              <View
                style={[
                  styles.scanScore,
                  { backgroundColor: getScoreColor(scan.score || 0) + '15' },
                ]}
              >
                <Text style={[styles.scanScoreNum, { color: getScoreColor(scan.score || 0) }]}>
                  {scan.score || 0}
                </Text>
              </View>
              <View style={styles.scanInfo}>
                <Text style={styles.scanName}>{scan.product_name || 'Unknown Product'}</Text>
                <Text style={styles.scanBrand}>
                  {scan.brand || 'Unknown'} · {scan.category || 'Product'}
                </Text>
              </View>
              <View style={styles.scanRight}>
                <View
                  style={[
                    styles.scanBadge,
                    { backgroundColor: getScoreColor(scan.score || 0) + '15' },
                  ]}
                >
                  <Text style={[styles.scanBadgeText, { color: getScoreColor(scan.score || 0) }]}>
                    {(scan.score || 0) >= 80 ? 'Excellent' : (scan.score || 0) >= 60 ? 'Good' : (scan.score || 0) >= 40 ? 'Okay' : 'Avoid'}
                  </Text>
                </View>
                <Text style={styles.scanTime}>{formatTime(scan.created_at)}</Text>
              </View>
            </Card>
          ))
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'restaurant-outline', label: 'Restaurants', color: COLORS.accent, screen: 'Scanner' },
            { icon: 'water-outline', label: 'Water & Filters', color: COLORS.info, screen: 'Scanner' },
            { icon: 'fitness-outline', label: 'Supplements', color: COLORS.primary, screen: 'Scanner' },
            { icon: 'home-outline', label: 'Home Audit', color: COLORS.warning, screen: 'Scanner' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.actionTile}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </Animated.ScrollView>

      {/* Floating AI Coach Button */}
      <TouchableOpacity
        style={styles.floatingCoachBtn}
        onPress={() => navigation.navigate('AICoach')}
        activeOpacity={0.9}
      >
        <Ionicons name="sparkles" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.base,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerText: {},
  greeting: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xs,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifCount: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },

  profileRow: { marginBottom: SPACING.base },
  profileRowContent: { paddingRight: SPACING.base, gap: SPACING.sm },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  profileChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  profileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textTertiary,
  },
  profileDotActive: {
    backgroundColor: COLORS.primary,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  profileNameActive: {
    color: COLORS.primary,
  },

  heroCard: { marginBottom: SPACING.base, padding: SPACING.lg },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: { flex: 1, paddingRight: SPACING.base },
  heroLabel: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  trendText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.base,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heroStat: { alignItems: 'center', gap: 4 },
  heroStatScore: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
  },
  heroStatLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  scanCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOWS.md,
  },
  scanCTALeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scanIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCTATitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  scanCTASub: {
    fontSize: TYPOGRAPHY.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  insightCard: { marginBottom: SPACING.base, padding: SPACING.base },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  insightBody: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  insightActionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  mealsRow: {
    paddingRight: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  mealCard: { width: 140, padding: SPACING.md, gap: 6 },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  mealCal: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  mealAddCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  mealAddText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },

  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  scanScore: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanScoreNum: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
  },
  scanInfo: { flex: 1 },
  scanName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scanBrand: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scanRight: { alignItems: 'flex-end', gap: 4 },
  scanBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  scanBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  scanTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  actionTile: {
    width: (W - SPACING.base * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.xs,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.white,
  },

  floatingCoachBtn: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },

  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    gap: SPACING.md,
  },
  disclaimerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.warning,
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
