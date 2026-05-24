import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

export default function Profile({ navigation }) {
  const { user, activeProfile } = useAppContext();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = activeProfile?.name || 
    (user?.user_metadata?.first_name && user?.user_metadata?.last_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User');
  const displayEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  const stats = [
    { label: 'Products Scanned', value: '0', icon: 'scan-outline' },
    { label: 'Clean Swaps Made', value: '0', icon: 'swap-horizontal-outline' },
    { label: 'Days Active', value: '0', icon: 'calendar-outline' },
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
        <Card style={styles.headerCard} variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('EditProfilePhoto')}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate('EditProfilePhoto')}>
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
  headerCard: { marginBottom: SPACING.base, padding: SPACING.lg },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatarContainer: { position: 'relative' },
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
  avatarImage: { width: '100%', height: '100%', borderRadius: 36 },
  avatarText: { fontSize: TYPOGRAPHY.xxl, fontWeight: '700', color: COLORS.white },
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
  profileInfo: { flex: 1 },
  profileName: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  profileEmail: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
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
  memberText: { fontSize: TYPOGRAPHY.xs, fontWeight: '600', color: COLORS.primary },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.base },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 6 },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, textAlign: 'center' },
  menuSection: { marginBottom: SPACING.base },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: { padding: 0 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  badgeText: { fontSize: TYPOGRAPHY.xs, fontWeight: '700', color: COLORS.white },
});
