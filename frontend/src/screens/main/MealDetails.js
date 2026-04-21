import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { mealService } from '../../services/mealService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, getScoreColor } from '../../styles/theme';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'steps', label: 'Steps' },
  { id: 'nutrition', label: 'Nutrition' },
];

const MEAL_TYPE_ICONS = {
  Breakfast: 'sunny-outline',
  Lunch: 'partly-sunny-outline',
  Dinner: 'moon-outline',
  Snack: 'nutrition-outline',
};

export default function MealDetails({ route, navigation }) {
  const { meal: routeMeal, mealId } = route.params || {};
  const [loading, setLoading] = useState(!routeMeal);
  const [meal, setMeal] = useState(routeMeal ?? null);
  const [activeTab, setActiveTab] = useState('overview');
  const [completing, setCompleting] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!routeMeal && mealId) {
      loadMeal();
    }
  }, [mealId]);

  const loadMeal = async () => {
    try {
      setLoading(true);
      const data = await mealService.getMeal(mealId);
      setMeal(data);
    } catch (error) {
      console.warn('Failed to load meal:', error.message);
      Alert.alert('Error', 'Failed to load meal details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!meal?.id) return;
    try {
      setCompleting(true);
      await mealService.logMeal({ mealId: meal.id, completed: !meal.completed });
      setMeal(prev => ({ ...prev, completed: !prev.completed }));
    } catch (error) {
      console.warn('Failed to update meal:', error.message);
      Alert.alert('Error', 'Failed to update meal status');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading meal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!meal) return null;

  const scoreColor = getScoreColor(meal.healthScore ?? meal.health_score ?? 0);
  const headerBg = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['transparent', COLORS.background],
    extrapolate: 'clamp',
  });

  const ingredients = meal.ingredients ?? [];
  const steps = meal.steps ?? meal.instructions ?? [];
  const nutrition = meal.nutrition ?? {
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fats: meal.fats,
    fiber: meal.fiber,
    sugar: meal.sugar,
  };

  return (
    <View style={styles.safe}>
      {/* Floating header */}
      <Animated.View style={[styles.floatingHeader, { backgroundColor: headerBg }]}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{meal.name}</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: scoreColor + '12' }]}>
          <SafeAreaView edges={['top']} style={{ paddingTop: 60 }}>
            <View style={styles.heroContent}>
              <View style={[styles.mealTypeIcon, { backgroundColor: scoreColor + '20' }]}>
                <Ionicons
                  name={MEAL_TYPE_ICONS[meal.type] ?? 'restaurant-outline'}
                  size={32}
                  color={scoreColor}
                />
              </View>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.heroMeta}>
                {meal.type && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>{meal.type}</Text>
                  </View>
                )}
                {meal.time && (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaChipText}>{meal.time}</Text>
                  </View>
                )}
                {meal.prep_time && (
                  <View style={styles.metaChip}>
                    <Ionicons name="timer-outline" size={12} color={COLORS.textSecondary} />
                    <Text style={styles.metaChipText}>{meal.prep_time} min</Text>
                  </View>
                )}
              </View>

              {/* Macro strip */}
              <View style={styles.macroStrip}>
                {[
                  { label: 'Cal', value: meal.calories ?? nutrition.calories },
                  { label: 'Protein', value: meal.protein ?? nutrition.protein, unit: 'g' },
                  { label: 'Carbs', value: meal.carbs ?? nutrition.carbs, unit: 'g' },
                  { label: 'Fats', value: meal.fats ?? nutrition.fats, unit: 'g' },
                ].map((m, i) => (
                  <View key={m.label} style={[styles.macroItem, i < 3 && styles.macroItemBorder]}>
                    <Text style={styles.macroValue}>{m.value ?? '—'}{m.unit ?? ''}</Text>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
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
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.body}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {meal.description && (
                <Card style={styles.descCard}>
                  <Text style={styles.descText}>{meal.description}</Text>
                </Card>
              )}

              {/* Health score */}
              <Card style={styles.scoreCard}>
                <View style={styles.scoreRow}>
                  <View>
                    <Text style={styles.scoreLabel}>Health Score</Text>
                    <Text style={styles.scoreSubLabel}>Based on ingredients</Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
                    <Text style={[styles.scoreNum, { color: scoreColor }]}>
                      {meal.healthScore ?? meal.health_score ?? 0}
                    </Text>
                  </View>
                </View>
                {meal.health_notes && (
                  <Text style={styles.healthNotes}>{meal.health_notes}</Text>
                )}
              </Card>

              {/* Quick stats */}
              <View style={styles.statsGrid}>
                {[
                  { icon: 'people-outline', label: 'Servings', value: meal.servings ?? 1 },
                  { icon: 'timer-outline', label: 'Prep Time', value: meal.prep_time ? `${meal.prep_time}m` : 'N/A' },
                  { icon: 'flame-outline', label: 'Cook Time', value: meal.cook_time ? `${meal.cook_time}m` : 'N/A' },
                  { icon: 'bar-chart-outline', label: 'Difficulty', value: meal.difficulty ?? 'Easy' },
                ].map((s) => (
                  <Card key={s.label} style={styles.statCard}>
                    <Ionicons name={s.icon} size={20} color={COLORS.primary} />
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </Card>
                ))}
              </View>

              {meal.tags && meal.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {meal.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <>
              {ingredients.length === 0 ? (
                <Text style={styles.emptyTabText}>No ingredient information available</Text>
              ) : (
                <>
                  <Text style={styles.ingredientCount}>{ingredients.length} ingredients</Text>
                  {ingredients.map((ing, i) => (
                    <View key={i} style={styles.ingredientRow}>
                      <View style={styles.ingredientDot} />
                      <Text style={styles.ingredientName}>
                        {typeof ing === 'string' ? ing : ing.name}
                      </Text>
                      {ing.amount && (
                        <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}
            </>
          )}

          {/* STEPS */}
          {activeTab === 'steps' && (
            <>
              {steps.length === 0 ? (
                <Text style={styles.emptyTabText}>No cooking instructions available</Text>
              ) : (
                steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      {step.title && <Text style={styles.stepTitle}>{step.title}</Text>}
                      <Text style={styles.stepText}>
                        {typeof step === 'string' ? step : step.description ?? step.text}
                      </Text>
                      {step.duration && (
                        <View style={styles.stepDuration}>
                          <Ionicons name="timer-outline" size={12} color={COLORS.textTertiary} />
                          <Text style={styles.stepDurationText}>{step.duration}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* NUTRITION */}
          {activeTab === 'nutrition' && (
            <Card style={styles.nutritionCard}>
              <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
              <Text style={styles.nutritionServing}>Per serving</Text>
              <View style={styles.nutritionDivider} />
              {[
                { label: 'Calories', value: nutrition.calories, unit: 'kcal', bold: true },
                { label: 'Protein', value: nutrition.protein, unit: 'g' },
                { label: 'Carbohydrates', value: nutrition.carbs, unit: 'g' },
                { label: 'Fat', value: nutrition.fats, unit: 'g' },
                { label: 'Fiber', value: nutrition.fiber, unit: 'g' },
                { label: 'Sugar', value: nutrition.sugar, unit: 'g' },
                { label: 'Sodium', value: nutrition.sodium, unit: 'mg' },
              ].filter((n) => n.value != null).map((n) => (
                <View key={n.label} style={[styles.nutritionRow, n.bold && styles.nutritionRowBold]}>
                  <Text style={[styles.nutritionLabel, n.bold && styles.nutritionLabelBold]}>{n.label}</Text>
                  <Text style={[styles.nutritionValue, n.bold && styles.nutritionLabelBold]}>
                    {n.value}{n.unit}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Complete button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeBtn, meal.completed && styles.completeBtnDone]}
          onPress={handleToggleComplete}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator size="small" color={meal.completed ? COLORS.primary : COLORS.white} />
          ) : (
            <>
              <Ionicons
                name={meal.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={meal.completed ? COLORS.primary : COLORS.white}
              />
              <Text style={[styles.completeBtnText, meal.completed && styles.completeBtnTextDone]}>
                {meal.completed ? 'Completed' : 'Mark as Complete'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.base },
  loadingText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500' },

  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface + 'CC',
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.xs,
  },
  headerTitle: {
    flex: 1, fontSize: TYPOGRAPHY.base, fontWeight: '700',
    color: COLORS.textPrimary, marginHorizontal: SPACING.sm,
  },

  hero: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.lg },
  heroContent: { paddingTop: SPACING.sm, alignItems: 'flex-start' },
  mealTypeIcon: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  mealName: {
    fontSize: TYPOGRAPHY.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: SPACING.sm,
  },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.base },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    ...SHADOWS.xs,
  },
  metaChipText: { fontSize: TYPOGRAPHY.xs, fontWeight: '600', color: COLORS.textSecondary },

  macroStrip: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.xs,
  },
  macroItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  macroItemBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },
  macroValue: { fontSize: TYPOGRAPHY.md, fontWeight: '700', color: COLORS.textPrimary },
  macroLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 },

  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1, paddingVertical: SPACING.md, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  body: { padding: SPACING.base },

  descCard: { marginBottom: SPACING.base, padding: SPACING.base },
  descText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, lineHeight: 24 },

  scoreCard: { marginBottom: SPACING.base, padding: SPACING.base },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  scoreSubLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, marginTop: 2 },
  scoreBadge: { width: 56, height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: TYPOGRAPHY.xl, fontWeight: '700' },
  healthNotes: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20, marginTop: SPACING.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.base },
  statCard: { width: '47%', padding: SPACING.md, alignItems: 'center', gap: SPACING.xs },
  statValue: { fontSize: TYPOGRAPHY.md, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: '500' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.base },
  tag: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  tagText: { fontSize: TYPOGRAPHY.xs, fontWeight: '600', color: COLORS.primary },

  ingredientCount: {
    fontSize: TYPOGRAPHY.sm, fontWeight: '600',
    color: COLORS.textSecondary, marginBottom: SPACING.md,
  },
  ingredientRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  ingredientDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  ingredientName: { flex: 1, fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, fontWeight: '500' },
  ingredientAmount: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '600' },

  stepRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 2,
  },
  stepNumText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.white },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  stepText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, lineHeight: 22 },
  stepDuration: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs },
  stepDurationText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary },

  nutritionCard: { padding: SPACING.base },
  nutritionTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  nutritionServing: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
  nutritionDivider: { height: 2, backgroundColor: COLORS.textPrimary, marginVertical: SPACING.sm },
  nutritionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  nutritionRowBold: { borderBottomWidth: 2, borderBottomColor: COLORS.textPrimary },
  nutritionLabel: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary },
  nutritionValue: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  nutritionLabelBold: { fontWeight: '800', color: COLORS.textPrimary, fontSize: TYPOGRAPHY.md },

  emptyTabText: {
    fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary,
    textAlign: 'center', padding: SPACING.xl,
  },

  footer: {
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg, paddingVertical: SPACING.base,
  },
  completeBtnDone: { backgroundColor: COLORS.primaryLight, borderWidth: 1.5, borderColor: COLORS.primary },
  completeBtnText: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.white },
  completeBtnTextDone: { color: COLORS.primary },
});

