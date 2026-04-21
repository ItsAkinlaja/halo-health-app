import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { productService } from '../../services/productService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor } from '../../styles/theme';

export default function SavedProducts({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, excellent, good, avoid

  useEffect(() => {
    loadSavedProducts();
  }, [activeProfile]);

  const loadSavedProducts = async () => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await productService.getSavedProducts(activeProfile.id);
      setProducts(data || []);
    } catch (error) {
      console.warn('Failed to load saved products:', error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedProducts();
    setRefreshing(false);
  }, [activeProfile]);

  const handleUnsave = async (productId) => {
    try {
      await productService.unsaveProduct(productId, activeProfile.id);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.warn('Failed to unsave product:', error.message);
    }
  };

  const getFilteredProducts = () => {
    if (filter === 'all') return products;
    if (filter === 'excellent') return products.filter(p => p.score >= 80);
    if (filter === 'good') return products.filter(p => p.score >= 60 && p.score < 80);
    if (filter === 'avoid') return products.filter(p => p.score < 40);
    return products;
  };

  const filteredProducts = getFilteredProducts();

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { 
        productId: item.id,
        barcode: item.barcode 
      })}
      activeOpacity={0.7}
    >
      <View style={styles.productLeft}>
        <View
          style={[
            styles.scoreBox,
            { backgroundColor: getScoreColor(item.score || 0) + '15' },
          ]}
        >
          <Text style={[styles.scoreNum, { color: getScoreColor(item.score || 0) }]}>
            {item.score || 0}
          </Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || 'Unknown Product'}
          </Text>
          <Text style={styles.productBrand}>
            {item.brand || 'Unknown'} · {item.category || 'Product'}
          </Text>
          <View
            style={[
              styles.scoreBadge,
              { backgroundColor: getScoreColor(item.score || 0) + '15' },
            ]}
          >
            <Text style={[styles.scoreBadgeText, { color: getScoreColor(item.score || 0) }]}>
              {(item.score || 0) >= 80 ? 'Excellent' : (item.score || 0) >= 60 ? 'Good' : (item.score || 0) >= 40 ? 'Okay' : 'Avoid'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unsaveButton}
        onPress={() => handleUnsave(item.id)}
      >
        <Ionicons name="bookmark" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading saved products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Products</Text>
        <View style={styles.backButton} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { id: 'all', label: 'All', count: products.length },
          { id: 'excellent', label: 'Excellent', count: products.filter(p => p.score >= 80).length },
          { id: 'good', label: 'Good', count: products.filter(p => p.score >= 60 && p.score < 80).length },
          { id: 'avoid', label: 'Avoid', count: products.filter(p => p.score < 40).length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              filter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => setFilter(tab.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View
                style={[
                  styles.filterBadge,
                  filter === tab.id && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === tab.id && styles.filterBadgeTextActive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Products List */}
      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>No saved products yet</Text>
          <Text style={styles.emptyText}>
            Save products while scanning to quickly access them later
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.emptyButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="filter-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>No products in this category</Text>
          <Text style={styles.emptyText}>
            Try selecting a different filter
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterBadgeTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.xxl,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.xs,
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  scoreBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  scoreBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  unsaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
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
    marginTop: SPACING.base,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});

