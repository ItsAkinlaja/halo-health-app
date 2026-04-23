import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor } from '../../styles/theme';

const { width: W } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const { user, activeProfile } = useAppContext();
  const { signOut } = useAuth();
  const [healthScore] = useState(72);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = activeProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@halohealth.com';
  const memberSince = 'January 2024';

  const stats = [
    { label: 'Products Scanned', value: '247', icon: 'scan-outline' },
    { label: 'Clean Swaps Made', value: '38', icon: 'swap-horizontal-outline' },
    { label: 'Days Active', value: '45', icon: 'calendar-outline' },
  ];

  const healthMetrics = [
    { label: 'Food Score', value: 78, color: getScoreColor(78) },
    { label: 'Water Quality', value: 65, color: getScoreColor(65) },
    { label: 'Personal Care', value: 58, color: getScoreColor(58) },
    { label: 'Household', value: 82, color: getScoreColor(82) },
  ];

  const menuSections = [
    {
      title: 'Health Profile',
      items: [
        { icon: 'person-outline', label: 'Personal Information', screen: 'PersonalInfo' },
        { icon: 'fitness-outline', label: 'Dietary Restrictions', screen: 'DietaryRestrictions' },
        { icon: 'people-outline', label: 'Family Profiles', screen: 'FamilyProfiles' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: 'time-outline', label: 'Scan History', screen: 'ScanHistory' },
        { icon: 'bookmark-outline', label: 'Saved Products', screen: 'SavedProducts' },
        { icon: 'restaurant-outline', label: 'Meal Plans', screen: 'Meals' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
        { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
        { icon: 'log-out-outline', label: 'Sign Out', action: handleSignOut },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card style={styles.headerCard} variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
              <View style={styles.memberBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.memberText}>Premium Member</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
              <View key={idx} style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Ionicons name={stat.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Health Score Card */}
        <Card style={styles.scoreCard} variant="elevated">
          <View style={styles.scoreHeader}>
            <View>
              <Text style={styles.scoreTitle}>Overall Health Score</Text>
              <Text style={styles.scoreSubtitle}>Last updated today</Text>
            </View>
            <ScoreRing score={healthScore} size={90} strokeWidth={8} showLabel={false} />
          </View>

          <View style={styles.divider} />

          {/* Health Metrics */}
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, idx) => (
              <View key={idx} style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={[styles.metricValue, { color: metric.color }]}>
                    {metric.value}
                  </Text>
                </View>
                <View style={styles.metricBar}>
                  <View
                    style={[
                      styles.metricBarFill,
                      { width: `${metric.value}%`, backgroundColor: metric.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <Button
            title="View Detailed Report"
            variant="secondary"
            size="medium"
            icon="arrow-forward"
            iconPosition="right"
            onPress={() => navigation.navigate('HealthReports')}
            style={{ marginTop: SPACING.base }}
          />
        </Card>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuItem,
                    itemIdx !== section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => item.action ? item.action() : navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },

  // Header Card
  headerCard: { marginBottom: SPACING.base, padding: SPACING.lg },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.base,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Score Card
  scoreCard: { marginBottom: SPACING.base, padding: SPACING.lg },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scoreSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Metrics Grid
  metricsGrid: {
    gap: SPACING.md,
  },
  metricItem: {
    gap: SPACING.xs,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
  },
  metricBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Menu Sections
  menuSection: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
});
