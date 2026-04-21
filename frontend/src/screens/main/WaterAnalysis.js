import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';
import waterService from '../../services/waterService';

const WATER_CATEGORIES = [
  { id: 'bottled', label: 'Bottled Water', icon: 'water-outline' },
  { id: 'filters', label: 'Water Filters', icon: 'filter-outline' },
  { id: 'purifiers', label: 'Purifiers', icon: 'shield-checkmark-outline' },
];

const TOP_RATED_WATER = [
  {
    id: '1',
    name: 'Mountain Spring Natural',
    brand: 'Pure Source',
    score: 95,
    category: 'bottled',
    contaminants: 'None detected',
    microplastics: 'Below detection limit',
    pfas: 'Not detected',
    minerals: 'High',
  },
  {
    id: '2',
    name: 'ProFilter Max',
    brand: 'AquaTech',
    score: 92,
    category: 'filters',
    removalRate: '99.9%',
    contaminantsRemoved: ['Lead', 'Chlorine', 'PFAS', 'Microplastics'],
    certified: true,
  },
];

export default function WaterAnalysis({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('bottled');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await waterService.getTopRated(activeCategory, 10);
      setProducts(data.length > 0 ? data : TOP_RATED_WATER.filter(p => p.category === activeCategory));
    } catch (error) {
      console.error('Error loading water products:', error);
      setProducts(TOP_RATED_WATER.filter(p => p.category === activeCategory));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await waterService.searchProducts(activeCategory, searchQuery);
      setProducts(data);
    } catch (error) {
      console.error('Error searching water products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Analysis</Text>
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
            placeholder="Search water brands or filters"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.categoryTabs}>
        {WATER_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={20}
              color={activeCategory === category.id ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.categoryTabText,
                activeCategory === category.id && styles.categoryTabTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Rated</Text>
          <Text style={styles.sectionSubtitle}>
            Independently tested and verified for safety
          </Text>
        </View>

        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} category={activeCategory} />
        ))}

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>What We Test For</Text>
          </View>
          <View style={styles.infoList}>
            <InfoItem label="Contaminants" value="Heavy metals, bacteria, chemicals" />
            <InfoItem label="Microplastics" value="Particle count and size analysis" />
            <InfoItem label="PFAS" value="Forever chemicals detection" />
            <InfoItem label="Minerals" value="Beneficial mineral content" />
            <InfoItem label="pH Level" value="Acidity and alkalinity balance" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ product, category }) {
  const getScoreColor = (score) => {
    if (score >= 90) return COLORS.success;
    if (score >= 70) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
        </View>
        <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(product.score) }]}>
          <Text style={styles.scoreText}>{product.score}</Text>
        </View>
      </View>

      {category === 'bottled' && (
        <View style={styles.productDetails}>
          <DetailRow icon="flask-outline" label="Contaminants" value={product.contaminants} />
          <DetailRow icon="water-outline" label="Microplastics" value={product.microplastics} />
          <DetailRow icon="shield-checkmark-outline" label="PFAS" value={product.pfas} />
          <DetailRow icon="nutrition-outline" label="Minerals" value={product.minerals} />
        </View>
      )}

      {category === 'filters' && (
        <View style={styles.productDetails}>
          <DetailRow icon="checkmark-circle-outline" label="Removal Rate" value={product.removalRate} />
          {product.certified && (
            <View style={styles.certifiedBadge}>
              <Ionicons name="ribbon-outline" size={16} color={COLORS.primary} />
              <Text style={styles.certifiedText}>Lab Verified</Text>
            </View>
          )}
          <View style={styles.removedList}>
            <Text style={styles.removedLabel}>Removes:</Text>
            <View style={styles.removedTags}>
              {product.contaminantsRemoved.map((item, idx) => (
                <View key={idx} style={styles.removedTag}>
                  <Text style={styles.removedTagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Full Analysis</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
        <Text style={styles.detailLabelText}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoItemLabel}>{label}</Text>
      <Text style={styles.infoItemValue}>{value}</Text>
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
  categoryTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.base,
  },
  section: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productBrand: {
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
  productDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailLabelText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  certifiedText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  removedList: {
    marginTop: SPACING.xs,
  },
  removedLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  removedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  removedTag: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  removedTagText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '500',
    color: COLORS.success,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  viewDetailsText: {
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
  infoList: {
    gap: SPACING.sm,
  },
  infoItem: {
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoItemLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
