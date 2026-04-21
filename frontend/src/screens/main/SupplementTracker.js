import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';
import supplementService from '../../services/supplementService';

const SUPPLEMENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'protein', label: 'Protein' },
  { id: 'vitamins', label: 'Vitamins' },
  { id: 'minerals', label: 'Minerals' },
  { id: 'omega3', label: 'Omega-3' },
  { id: 'preworkout', label: 'Pre-Workout' },
];

const MY_SUPPLEMENTS = [
  {
    id: '1',
    name: 'Whey Protein Isolate',
    brand: 'Pure Performance',
    category: 'protein',
    score: 92,
    purityScore: 95,
    thirdPartyTested: true,
    heavyMetals: 'Not detected',
    fillers: 'None',
    lastScanned: '2 days ago',
  },
  {
    id: '2',
    name: 'Vitamin D3 5000 IU',
    brand: 'Essential Health',
    category: 'vitamins',
    score: 88,
    purityScore: 90,
    thirdPartyTested: true,
    heavyMetals: 'Below threshold',
    fillers: 'Minimal',
    lastScanned: '1 week ago',
  },
];

export default function SupplementTracker({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my_supplements');
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSupplements();
  }, [activeTab, activeCategory]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my_supplements') {
        const data = await supplementService.getUserSupplements();
        const filtered = activeCategory === 'all' 
          ? data 
          : data.filter(item => item.supplement.category === activeCategory);
        setSupplements(filtered.map(item => ({
          ...item.supplement,
          lastScanned: item.last_scanned,
          dosage: item.dosage,
          frequency: item.frequency
        })));
      } else {
        const data = await supplementService.getTopRated(activeCategory, 10);
        setSupplements(data.length > 0 ? data : MY_SUPPLEMENTS.filter(s => activeCategory === 'all' || s.category === activeCategory));
      }
    } catch (error) {
      console.error('Error loading supplements:', error);
      setSupplements(MY_SUPPLEMENTS.filter(s => activeCategory === 'all' || s.category === activeCategory));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSupplements();
      return;
    }

    try {
      setLoading(true);
      const data = await supplementService.searchSupplements(activeCategory, searchQuery);
      setSupplements(data);
    } catch (error) {
      console.error('Error searching supplements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplements = supplements;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplement Tracker</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Ionicons name="scan" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search supplements or brands"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.mainTabs}>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'my_supplements' && styles.mainTabActive]}
          onPress={() => setActiveTab('my_supplements')}
        >
          <Text
            style={[
              styles.mainTabText,
              activeTab === 'my_supplements' && styles.mainTabTextActive,
            ]}
          >
            My Supplements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'top_rated' && styles.mainTabActive]}
          onPress={() => setActiveTab('top_rated')}
        >
          <Text
            style={[styles.mainTabText, activeTab === 'top_rated' && styles.mainTabTextActive]}
          >
            Top Rated
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {SUPPLEMENT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              activeCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                activeCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredSupplements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No Supplements Yet</Text>
            <Text style={styles.emptyText}>
              Scan your first supplement to start tracking quality and purity
            </Text>
            <TouchableOpacity
              style={styles.scanNowButton}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Ionicons name="scan" size={20} color={COLORS.white} />
              <Text style={styles.scanNowText}>Scan Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredSupplements.map((supplement) => (
              <SupplementCard key={supplement.id} supplement={supplement} />
            ))}
          </>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>What We Analyze</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem icon="flask-outline" label="Ingredient Purity" />
            <InfoItem icon="warning-outline" label="Heavy Metals" />
            <InfoItem icon="checkmark-circle-outline" label="Third-Party Testing" />
            <InfoItem icon="close-circle-outline" label="Filler Detection" />
            <InfoItem icon="ribbon-outline" label="Label Accuracy" />
            <InfoItem icon="nutrition-outline" label="Bioavailability" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SupplementCard({ supplement }) {
  const getScoreColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.supplementCard}>
      <View style={styles.supplementHeader}>
        <View style={styles.supplementInfo}>
          <Text style={styles.supplementName}>{supplement.name}</Text>
          <Text style={styles.supplementBrand}>{supplement.brand}</Text>
        </View>
        <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(supplement.score) }]}>
          <Text style={styles.scoreText}>{supplement.score}</Text>
        </View>
      </View>

      <View style={styles.supplementMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Purity</Text>
          <Text style={styles.metaValue}>{supplement.purityScore}%</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Heavy Metals</Text>
          <Text style={styles.metaValue}>{supplement.heavyMetals}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Fillers</Text>
          <Text style={styles.metaValue}>{supplement.fillers}</Text>
        </View>
      </View>

      {supplement.thirdPartyTested && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={styles.verifiedText}>Third-Party Tested</Text>
        </View>
      )}

      <View style={styles.supplementFooter}>
        <Text style={styles.lastScanned}>Last scanned {supplement.lastScanned}</Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoItem({ icon, label }) {
  return (
    <View style={styles.infoGridItem}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.infoGridLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scanButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: COLORS.primary,
  },
  mainTabText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  mainTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryScroll: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  scanNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderRadius: RADIUS.md,
  },
  scanNowText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  supplementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  supplementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  supplementBrand: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  supplementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  supplementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastScanned: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginTop: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
  },
  infoGridItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  infoGridLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
});
