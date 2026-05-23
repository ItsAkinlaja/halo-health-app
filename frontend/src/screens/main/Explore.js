import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const featuredActions = [
  { title: 'Shop & Scan', subtitle: 'Healthy shopping on-the-go', icon: 'scan-outline', screen: 'Scanner', accent: COLORS.primary },
  { title: 'Book a Doctor', subtitle: 'Verified doctors, family + pet consults', icon: 'medkit-outline', screen: 'BookDoctor', accent: COLORS.info },
  { title: 'Household & Profiles', subtitle: 'People, pets, allergies, conditions', icon: 'people-outline', screen: 'FamilyProfiles', accent: COLORS.secondary },
];

const planActions = [
  { title: 'Meal Planner', subtitle: 'Personalized clean plans', icon: 'restaurant-outline', screen: 'Meals', accent: COLORS.warning },
  { title: 'Shopping List', subtitle: 'Auto-built from your plan', icon: 'list-outline', screen: 'ShoppingList', accent: COLORS.success },
];

const discoverActions = [
  { title: 'Restaurants & Menus', icon: 'restaurant-outline', screen: 'RestaurantFinder' },
  { title: 'Top Rated Products', icon: 'star-outline', screen: 'GroceryExplorer' },
  { title: 'News & Trends', icon: 'newspaper-outline', screen: 'NewsFeed' },
  { title: 'Water & Filters', icon: 'water-outline', screen: 'WaterAnalysis' },
  { title: 'Food Ingredients & Snacks', icon: 'grid-outline', screen: 'PantryTracker' },
  { title: 'Supplements', icon: 'fitness-outline', screen: 'SupplementTracker' },
  { title: 'Personal Care', icon: 'sparkles-outline', screen: 'PersonalCare' },
  { title: 'Household', icon: 'home-outline', screen: 'HomeEnvironmentAudit' },
  { title: 'Baby & Kids', icon: 'happy-outline', screen: 'BabyKids' },
  { title: 'Pet Food', icon: 'paw-outline', screen: 'PetFood' },
];

const utilityActions = [
  { title: 'Recaps & Wrapped', subtitle: 'Weekly & yearly', icon: 'albums-outline', screen: 'RecapsWrapped', accent: COLORS.primaryLight },
  { title: 'Earnings & Referrals', subtitle: 'Invite & earn', icon: 'gift-outline', screen: 'Referrals', accent: COLORS.accent },
  { title: 'Challenges', subtitle: 'Keep streaks alive', icon: 'trophy-outline', screen: 'Challenges', accent: COLORS.secondary },
  { title: 'Wallet', subtitle: 'Rewards and balance', icon: 'wallet-outline', screen: 'Wallet', accent: COLORS.info },
];

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function ActionCard({ navigation, item, compact = false }) {
  const onPress = () => navigation.navigate(item.screen);

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[styles.actionCard, compact && styles.actionCardCompact]}>
      <View style={[styles.actionIconWrap, item.accent ? { backgroundColor: item.accent } : null]}>
        <Ionicons name={item.icon} size={20} color={COLORS.white} />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.actionSubtitle}>{item.subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

function GridCard({ navigation, item }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate(item.screen)} style={styles.gridCard}>
      <View style={styles.gridIconWrap}>
        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );
}

export default function Explore({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />
          <Card style={styles.heroCard} variant="elevated">
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.kicker}>Everything Halo Health</Text>
                <Text style={styles.heroTitle}>Explore</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.heroText}>
              Clean shopping, family profiles, meals, home health, and discovery tools in one calm place.
            </Text>
          </Card>
        </View>

        <SectionHeader title="Featured" subtitle="Quick access to your most-used tools" />
        <View style={styles.featuredList}>
          {featuredActions.map((item) => (
            <ActionCard key={item.title} navigation={navigation} item={item} />
          ))}
        </View>

        <SectionHeader title="Plan & shop" subtitle="Personalized tools for daily life" />
        <View style={styles.planRow}>
          {planActions.map((item) => (
            <TouchableOpacity key={item.title} activeOpacity={0.88} onPress={() => navigation.navigate(item.screen)} style={styles.planCard}>
              <View style={[styles.planIconWrap, { backgroundColor: item.accent }]}>
                <Ionicons name={item.icon} size={20} color={COLORS.white} />
              </View>
              <Text style={styles.planTitle}>{item.title}</Text>
              <Text style={styles.planSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Discover" subtitle="Browse the cleanest options" />
        <View style={styles.grid}>
          {discoverActions.map((item) => (
            <GridCard key={item.title} navigation={navigation} item={item} />
          ))}
        </View>

        <SectionHeader title="Categories" subtitle="Deep links into the app's health areas" />
        <View style={styles.categoryList}>
          {utilityActions.map((item) => (
            <ActionCard key={item.title} navigation={navigation} item={item} compact />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  heroWrap: { marginTop: SPACING.sm, marginBottom: SPACING.lg, position: 'relative' },
  heroGlow: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    height: 180,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.28,
  },
  heroCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  kicker: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 34, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  heroBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  heroText: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.base, lineHeight: 24, color: COLORS.textSecondary },
  sectionHeader: { marginTop: SPACING.lg, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  sectionSubtitle: { marginTop: 4, fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary },
  featuredList: { gap: SPACING.sm },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  actionCardCompact: { paddingVertical: SPACING.sm },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  actionTextWrap: { flex: 1, minWidth: 0 },
  actionTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  actionSubtitle: { marginTop: 2, fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 19 },
  planRow: { flexDirection: 'row', gap: SPACING.sm },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 132,
    ...SHADOWS.sm,
  },
  planIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  planTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '800', color: COLORS.textPrimary },
  planSubtitle: { marginTop: 6, fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 106,
  },
  gridIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  gridTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 19 },
  categoryList: { gap: SPACING.sm },
  bottomSpacer: { height: SPACING.xl },
});
