import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import { HaloCard } from '../../components/common/HaloCard';
import { HaloAvatar } from '../../components/common/HaloAvatar';
import { ScoreBadge, StatusBadge } from '../../components/common/HaloBadge';
import { productService } from '../../services/productService';
import AudioPlayer from '../../components/common/AudioPlayer';
import AlternativesList from '../../components/alternatives/AlternativesList';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor } from '../../styles/theme';

const { width: W } = Dimensions.get('window');

const INGREDIENT_STATUS = {
  can_eat: { color: COLORS.scoreExcellent, bg: '#E6FAF5', label: 'Safe', icon: 'checkmark-circle' },
  limit: { color: COLORS.scoreOkay, bg: '#FFFBE6', label: 'Limit', icon: 'warning' },
  avoid: { color: COLORS.scoreAvoid, bg: '#FFF1F0', label: 'Avoid', icon: 'close-circle' },
};

const IMPACT_COLORS = { Low: COLORS.scoreExcellent, Medium: COLORS.scoreOkay, High: COLORS.scoreAvoid };

export default function ProductDetails({ route, navigation }) {
  const { user, activeProfile } = useAppContext();
  const { productId, barcode } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProduct();
  }, [productId, barcode]);

  const loadProduct = async () => {
    if (!productId && !barcode) {
      Alert.alert('Error', 'No product information provided');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      let data;
      
      if (productId) {
        data = await productService.getProductById(productId);
      } else if (barcode) {
        data = await productService.getProductByBarcode(barcode);
      }

      if (!data) {
        Alert.alert('Not Found', 'Product not found');
        navigation.goBack();
        return;
      }

      // Normalize product data structure
      const normalizedProduct = {
        id: data.id,
        barcode: data.barcode,
        name: data.name || 'Unknown Product',
        brand: data.brand || 'Unknown Brand',
        category: data.category || 'Product',
        image_url: data.image_url,
        health_score: data.score_data?.overall_score || data.health_score || 50,
        score_data: data.score_data,
        processing_level: data.processing_level,
        allergens: data.allergens_present || [],
        ingredients: (data.ingredients || []).map(ing => 
          typeof ing === 'string' ? { name: ing, status: 'can_eat', note: '' } : ing
        ),
        nutrition_facts: data.nutrition_info ? {
          calories: data.nutrition_info.energy_kcal,
          protein: data.nutrition_info.proteins,
          carbs: data.nutrition_info.carbohydrates,
          fat: data.nutrition_info.fat,
          fiber: data.nutrition_info.fiber,
          sugar: data.nutrition_info.sugars,
          sodium: data.nutrition_info.sodium,
        } : null,
        toxins: (data.toxins_detected || []).map(toxin => ({
          name: toxin,
          level: 'Detected',
          limit: 'Should be avoided',
          risk: 'Medium',
          detail: 'This ingredient may have negative health effects.',
        })),
        ai_analysis: data.halo_analysis || data.score_data?.recommendations?.join(' ') || 'Product analysis in progress.',
        manufacturer: data.brand,
        is_saved: data.is_saved || false,
      };

      setProduct(normalizedProduct);
      setSaved(normalizedProduct.is_saved);
    } catch (error) {
      console.warn('Failed to load product:', error.message);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user?.id || !product?.id) return;

    try {
      setSaving(true);
      
      if (saved) {
        await productService.unsaveProduct(user.id, product.id);
        setSaved(false);
      } else {
        await productService.saveProduct(user.id, product.id);
        setSaved(true);
      }
    } catch (error) {
      console.warn('Failed to toggle save:', error.message);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return null;
  }

  const headerBg = scrollY.interpolate({ inputRange: [0, 120], outputRange: ['transparent', COLORS.background], extrapolate: 'clamp' });

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'alternatives', label: 'Alternatives' },
  ];

  const scoreColor = getScoreColor(product.score);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating header */}
      <Animated.View style={[styles.floatingHeader, { backgroundColor: headerBg }]}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="volume-medium-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleToggleSave} disabled={saving}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? COLORS.primary : COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <View style={[styles.hero, { backgroundColor: scoreColor + '12' }]}>
          <SafeAreaView edges={['top']} style={{ paddingTop: 56 }}>
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <ScoreBadge score={product.health_score || 0} size="lg" />
                <Text style={styles.productName}>{product.name || 'Unknown Product'}</Text>
                <Text style={styles.productBrand}>{product.brand || 'Unknown Brand'}</Text>
                <View style={styles.heroMeta}>
                  <StatusBadge label={product.category || 'Product'} color={COLORS.accent} />
                  {product.processing_level && (
                    <StatusBadge 
                      label={`${product.processing_level} Processing`} 
                      color={product.processing_level === 'High' ? COLORS.error : product.processing_level === 'Medium' ? COLORS.warning : COLORS.success} 
                    />
                  )}
                </View>
              </View>
              <ScoreRing score={product.health_score || 0} size={120} strokeWidth={11} />
            </View>

            {/* Allergen strip */}
            {product.allergens && product.allergens.length > 0 && (
              <View style={styles.allergenStrip}>
                <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                <Text style={styles.allergenText}>Contains: {product.allergens.join(', ')}</Text>
              </View>
            )}
          </SafeAreaView>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.body}>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Halo Says */}
              {product.ai_analysis && (
                <HaloCard style={styles.haloCard}>
                  <View style={styles.haloHeader}>
                    <HaloAvatar size={40} mood={(product.health_score || 0) >= 60 ? 'happy' : 'concerned'} />
                    <View style={styles.haloHeaderText}>
                      <Text style={styles.haloFrom}>Halo Says</Text>
                      <Text style={styles.haloSubtitle}>Personalized analysis</Text>
                    </View>
                  </View>
                  <Text style={styles.haloBody}>{product.ai_analysis}</Text>
                  <View style={{ marginTop: SPACING.base }}>
                    <AudioPlayer analysis={{ summary: product.ai_analysis, healthScore: product.health_score, productName: product.name }} />
                  </View>
                </HaloCard>
              )}

              {/* Health Impact */}
              {product.health_impact && Object.keys(product.health_impact).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Health Impact Ratings</Text>
                  <HaloCard style={styles.impactCard}>
                    {Object.entries(product.health_impact).map(([key, val]) => {
                      const labels = { 
                        hair_skin: 'Hair & Skin', 
                        immune_system: 'Immune System', 
                        cellular_stress: 'Cellular Stress', 
                        hormonal_disruption: 'Hormonal Disruption', 
                        carcinogen_risk: 'Carcinogen Risk' 
                      };
                      const color = IMPACT_COLORS[val];
                      return (
                        <View key={key} style={styles.impactRow}>
                          <Text style={styles.impactLabel}>{labels[key] || key}</Text>
                          <View style={styles.impactRight}>
                            <View style={[styles.impactBar, { backgroundColor: color + '20' }]}>
                              <View style={[styles.impactFill, { backgroundColor: color, width: val === 'Low' ? '33%' : val === 'Medium' ? '66%' : '100%' }]} />
                            </View>
                            <Text style={[styles.impactVal, { color }]}>{val}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </HaloCard>
                </>
              )}

              {/* Toxins */}
              {product.toxins && product.toxins.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Detected Toxins</Text>
                  {product.toxins.map((toxin, i) => (
                    <HaloCard key={i} style={styles.toxinCard}>
                      <View style={styles.toxinHeader}>
                        <View style={styles.toxinIconWrap}>
                          <Ionicons name="skull-outline" size={18} color={COLORS.error} />
                        </View>
                        <View style={styles.toxinInfo}>
                          <Text style={styles.toxinName}>{toxin.name}</Text>
                          <Text style={styles.toxinLevel}>{toxin.level} · {toxin.limit}</Text>
                        </View>
                        <StatusBadge label={toxin.risk + ' Risk'} color={IMPACT_COLORS[toxin.risk]} />
                      </View>
                      <Text style={styles.toxinDetail}>{toxin.detail}</Text>
                    </HaloCard>
                  ))}
                </>
              )}

              {/* Ownership */}
              {product.manufacturer && (
                <HaloCard style={styles.ownerCard} variant="ghost">
                  <View style={styles.ownerHeader}>
                    <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.ownerTitle}>Manufacturer</Text>
                  </View>
                  <Text style={styles.ownerText}>{product.manufacturer}</Text>
                </HaloCard>
              )}
            </>
          )}

          {/* ── INGREDIENTS TAB ── */}
          {activeTab === 'ingredients' && (
            <>
              <View style={styles.ingredientLegend}>
                {Object.entries(INGREDIENT_STATUS).map(([key, val]) => (
                  <View key={key} style={styles.legendItem}>
                    <Ionicons name={val.icon} size={14} color={val.color} />
                    <Text style={[styles.legendText, { color: val.color }]}>{val.label}</Text>
                  </View>
                ))}
              </View>
              {product.ingredients && product.ingredients.length > 0 ? product.ingredients.map((ing, i) => {
                const status = INGREDIENT_STATUS[ing.status];
                const isExpanded = expandedIngredient === i;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.ingredientRow, { borderLeftColor: status.color }]}
                    onPress={() => setExpandedIngredient(isExpanded ? null : i)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.ingredientStatus, { backgroundColor: status.bg }]}>
                      <Ionicons name={status.icon} size={16} color={status.color} />
                    </View>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                      {isExpanded && <Text style={styles.ingredientNote}>{ing.note}</Text>}
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                );
              }) : (
                <Text style={styles.emptyText}>No ingredient information available</Text>
              )}
            </>
          )}

          {/* ── NUTRITION TAB ── */}
          {activeTab === 'nutrition' && (
            <>
              {product.nutrition_facts ? (
                <HaloCard style={styles.nutritionCard}>
                  <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
                  <Text style={styles.nutritionServing}>Per serving</Text>
                  <View style={styles.nutritionDivider} />
                  {[
                    { label: 'Calories', value: product.nutrition_facts.calories, unit: 'kcal', highlight: true },
                    { label: 'Protein', value: product.nutrition_facts.protein, unit: 'g' },
                    { label: 'Carbohydrates', value: product.nutrition_facts.carbs, unit: 'g' },
                    { label: 'Fat', value: product.nutrition_facts.fat, unit: 'g' },
                    { label: 'Fiber', value: product.nutrition_facts.fiber, unit: 'g' },
                    { label: 'Sugar', value: product.nutrition_facts.sugar, unit: 'g' },
                    { label: 'Sodium', value: product.nutrition_facts.sodium, unit: 'mg' },
                  ].filter(item => item.value !== undefined && item.value !== null).map((item) => (
                    <View key={item.label} style={[styles.nutritionRow, item.highlight && styles.nutritionRowHighlight]}>
                      <Text style={[styles.nutritionLabel, item.highlight && styles.nutritionLabelBold]}>{item.label}</Text>
                      <Text style={[styles.nutritionValue, item.highlight && styles.nutritionLabelBold]}>{item.value}{item.unit}</Text>
                    </View>
                  ))}
                </HaloCard>
              ) : (
                <Text style={styles.emptyText}>No nutrition information available</Text>
              )}
            </>
          )}

          {/* ── ALTERNATIVES TAB ── */}
          {activeTab === 'alternatives' && (
            <AlternativesList
              productId={product.id}
              profileId={activeProfile?.id}
              onSelectAlternative={(alt) => navigation.push('ProductDetails', { productId: alt.id })}
            />
          )}
        </View>

        {/* Save button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSaved]}
            onPress={handleToggleSave}
            disabled={saving}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? COLORS.white : COLORS.primary} />
            <Text style={[styles.saveBtnText, saved && styles.saveBtnTextSaved]}>
              {saved ? 'Saved to Clean Choices' : 'Save to Clean Choices'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
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
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.xl,
  },

  // Floating header
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.xs },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary, marginHorizontal: SPACING.sm },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.xs },

  // Hero
  hero: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.lg },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  heroLeft: { flex: 1, paddingRight: SPACING.base, gap: SPACING.sm },
  productName: { fontSize: TYPOGRAPHY.xxl, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, lineHeight: 32 },
  productBrand: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500' },
  heroMeta: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  allergenStrip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.error + '12', borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  allergenText: { fontSize: TYPOGRAPHY.sm, color: COLORS.error, fontWeight: '600' },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  body: { padding: SPACING.base },
  sectionTitle: { fontSize: TYPOGRAPHY.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.base },

  // Halo card
  haloCard: { marginBottom: SPACING.base, padding: SPACING.base },
  haloHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  haloHeaderText: { flex: 1 },
  haloFrom: { fontSize: TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  haloSubtitle: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '500' },
  audioBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  audioBtnText: { fontSize: TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '700' },
  haloBody: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 22 },

  // Health impact
  impactCard: { marginBottom: SPACING.base, padding: SPACING.base, gap: SPACING.md },
  impactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  impactLabel: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '500', flex: 1 },
  impactRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  impactBar: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  impactFill: { height: '100%', borderRadius: 3 },
  impactVal: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', width: 52, textAlign: 'right' },

  // Toxins
  toxinCard: { marginBottom: SPACING.sm, padding: SPACING.base },
  toxinHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  toxinIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.error + '15', alignItems: 'center', justifyContent: 'center' },
  toxinInfo: { flex: 1 },
  toxinName: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  toxinLevel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary },
  toxinDetail: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20 },

  // Ownership
  ownerCard: { marginBottom: SPACING.base, padding: SPACING.base },
  ownerHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  ownerTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.textSecondary },
  ownerText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary, lineHeight: 20 },

  // Ingredients
  ingredientLegend: { flexDirection: 'row', gap: SPACING.base, marginBottom: SPACING.base },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: TYPOGRAPHY.xs, fontWeight: '600' },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, gap: SPACING.sm, ...SHADOWS.xs },
  ingredientStatus: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ingredientInfo: { flex: 1 },
  ingredientName: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  ingredientNote: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },

  // Nutrition
  nutritionCard: { padding: SPACING.base },
  nutritionTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  nutritionServing: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
  nutritionDivider: { height: 2, backgroundColor: COLORS.textPrimary, marginVertical: SPACING.sm },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  nutritionRowHighlight: { borderBottomWidth: 2, borderBottomColor: COLORS.textPrimary },
  nutritionLabel: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary },
  nutritionValue: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  nutritionLabelBold: { fontWeight: '800', color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md },

  // Alternatives
  altHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.base },
  altHeaderText: { flex: 1, fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 22 },
  altCard: { marginBottom: SPACING.base, padding: SPACING.base },
  altTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  altInfo: { flex: 1, paddingRight: SPACING.base },
  altName: { fontSize: TYPOGRAPHY.md, fontWeight: '700', color: COLORS.textPrimary },
  altBrand: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
  altImprovement: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  altImprovementText: { fontSize: TYPOGRAPHY.sm, color: COLORS.primary, fontWeight: '600' },
  altReason: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  altBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  altBtnText: { fontSize: TYPOGRAPHY.sm, color: COLORS.primary, fontWeight: '700' },

  // Save button
  saveContainer: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.base },
  saveBtnSaved: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  saveBtnText: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.primary },
  saveBtnTextSaved: { color: COLORS.white },
});

