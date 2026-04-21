import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SkeletonMealCard } from '../../components/common/Skeleton';
import { mealService } from '../../services/mealService';
import { api } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const { width: W } = Dimensions.get('window');

export default function MealPlanner({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  useEffect(() => {
    if (activeProfile?.id) {
      loadMeals();
    } else {
      setLoading(false);
    }
  }, [activeProfile, selectedDate]);

  const loadMeals = async () => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [mealsData, nutritionData] = await Promise.all([
        mealService.getMealsByDate(activeProfile.id, dateStr),
        mealService.getNutritionSummary(activeProfile.id, dateStr, dateStr),
      ]);
      setMeals(mealsData || []);
      setNutritionSummary(nutritionData);
    } catch (error) {
      console.warn('Failed to load meals:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleGeneratePlan = async () => {
    if (!activeProfile?.id) return;

    try {
      setGenerating(true);
      await mealService.generateMealPlan(activeProfile.id, {
        startDate: selectedDate.toISOString().split('T')[0],
        days: 7,
      });
      api.clearCache();
      await loadMeals();
      Alert.alert('Success', 'Meal plan generated successfully!');
    } catch (error) {
      console.warn('Failed to generate meal plan:', error.message);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMealComplete = async (mealId, completed) => {
    try {
      await mealService.logMeal({ mealId, completed: !completed });
      setMeals(prev => prev.map(m => 
        m.id === mealId ? { ...m, completed: !completed } : m
      ));
    } catch (error) {
      console.warn('Failed to toggle meal:', error.message);
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const todaysMeals = meals;
  const defaultNutrition = {
    target: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
    current: { calories: 0, protein: 0, carbs: 0, fats: 0 },
  };
  const nutrition = nutritionSummary || defaultNutrition;
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDay = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Meal Planner</Text>
            <Text style={styles.headerSubtitle}>Personalized nutrition plan</Text>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.dateCard}>
            <View style={{ height: 80 }} />
          </View>
          <View style={styles.nutritionCard}>
            <View style={{ height: 200 }} />
          </View>
          <SkeletonMealCard />
          <SkeletonMealCard />
          <SkeletonMealCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Meal Planner</Text>
          <Text style={styles.headerSubtitle}>Personalized nutrition plan</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Date Selector */}
        <Card style={styles.dateCard}>
          <View style={styles.dateHeader}>
            <TouchableOpacity style={styles.dateNavBtn} onPress={() => changeDate(-1)}>
              <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.dateCenter}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Text style={styles.dateSubtext}>
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity style={styles.dateNavBtn} onPress={() => changeDate(1)}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Week View */}
          <View style={styles.weekRow}>
            {weekDays.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayChip,
                  idx === currentDay && styles.dayChipActive,
                ]}
                onPress={() => {}}
              >
                <Text
                  style={[
                    styles.dayText,
                    idx === currentDay && styles.dayTextActive,
                  ]}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dayDot,
                    idx === currentDay && styles.dayDotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Nutrition Summary */}
        <Card style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionTitle}>Daily Nutrition</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.macrosGrid}>
            {[
              { label: 'Calories', current: nutrition.current.calories, target: nutrition.target.calories, unit: 'kcal', color: COLORS.primary },
              { label: 'Protein', current: nutrition.current.protein, target: nutrition.target.protein, unit: 'g', color: COLORS.accent },
              { label: 'Carbs', current: nutrition.current.carbs, target: nutrition.target.carbs, unit: 'g', color: COLORS.info },
              { label: 'Fats', current: nutrition.current.fats, target: nutrition.target.fats, unit: 'g', color: COLORS.warning },
            ].map((macro, idx) => {
              const percentage = (macro.current / macro.target) * 100;
              return (
                <View key={idx} style={styles.macroItem}>
                  <View style={styles.macroHeader}>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                    <Text style={styles.macroValue}>
                      {macro.current}/{macro.target}
                      <Text style={styles.macroUnit}> {macro.unit}</Text>
                    </Text>
                  </View>
                  <View style={styles.macroBar}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { width: `${Math.min(percentage, 100)}%`, backgroundColor: macro.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Button
            title={generating ? 'Generating...' : 'Generate Plan'}
            variant="primary"
            size="medium"
            icon={generating ? undefined : 'sparkles-outline'}
            iconPosition="left"
            onPress={handleGeneratePlan}
            style={{ flex: 1 }}
            disabled={generating}
            loading={generating}
          />
          <Button
            title="Add Meal"
            variant="secondary"
            size="medium"
            icon="add-outline"
            iconPosition="left"
            onPress={() => Alert.alert('Add Meal', 'Manual meal entry coming soon!')}
            style={{ flex: 1 }}
          />
        </View>

        {/* Meals List */}
        {todaysMeals.length > 0 && (
          <View style={styles.mealsSection}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>

            {todaysMeals.map((meal) => (
              <Card
                key={meal.id}
                style={styles.mealCard}
                onPress={() => navigation.navigate('MealDetails', { meal })}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealLeft}>
                    <View style={styles.mealTypeWrap}>
                      <Ionicons
                        name={
                          meal.type === 'Breakfast' ? 'sunny-outline' :
                          meal.type === 'Lunch' ? 'partly-sunny-outline' :
                          meal.type === 'Dinner' ? 'moon-outline' :
                          'nutrition-outline'
                        }
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View>
                      <View style={styles.mealTypeRow}>
                        <Text style={styles.mealType}>{meal.type}</Text>
                        <Text style={styles.mealTime}>{meal.time}</Text>
                      </View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.checkBtn,
                      meal.completed && styles.checkBtnCompleted,
                    ]}
                    onPress={(e) => { e.stopPropagation(); handleToggleMealComplete(meal.id, meal.completed); }}
                  >
                    {meal.completed && (
                      <Ionicons name="checkmark" size={18} color={COLORS.white} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.mealDivider} />

                <View style={styles.mealStats}>
                  <View style={styles.mealStat}>
                    <Text style={styles.mealStatLabel}>Calories</Text>
                    <Text style={styles.mealStatValue}>{meal.calories}</Text>
                  </View>
                  <View style={styles.mealStatDivider} />
                  <View style={styles.mealStat}>
                    <Text style={styles.mealStatLabel}>Protein</Text>
                    <Text style={styles.mealStatValue}>{meal.protein}g</Text>
                  </View>
                  <View style={styles.mealStatDivider} />
                  <View style={styles.mealStat}>
                    <Text style={styles.mealStatLabel}>Carbs</Text>
                    <Text style={styles.mealStatValue}>{meal.carbs}g</Text>
                  </View>
                  <View style={styles.mealStatDivider} />
                  <View style={styles.mealStat}>
                    <Text style={styles.mealStatLabel}>Fats</Text>
                    <Text style={styles.mealStatValue}>{meal.fats}g</Text>
                  </View>
                </View>

                <View style={styles.mealFooter}>
                  <View style={styles.healthScoreBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                    <Text style={styles.healthScoreText}>Health Score: {meal.healthScore}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewRecipeBtn}
                    onPress={() => navigation.navigate('MealDetails', { meal })}
                  >
                    <Text style={styles.viewRecipeText}>View Recipe</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Empty State for No Plan */}
        {todaysMeals.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Meal Plan Yet</Text>
            <Text style={styles.emptyText}>
              Generate a personalized meal plan based on your health profile and dietary preferences
            </Text>
            <Button
              title={generating ? 'Generating...' : 'Generate Meal Plan'}
              variant="primary"
              size="medium"
              icon={generating ? undefined : 'sparkles-outline'}
              iconPosition="left"
              onPress={handleGeneratePlan}
              style={{ marginTop: SPACING.base }}
              disabled={generating}
              loading={generating}
            />
          </Card>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base },
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date Card
  dateCard: {
    marginTop: SPACING.base,
    marginBottom: SPACING.base,
    padding: SPACING.base,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dateSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Week Row
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
  },
  dayChipActive: {},
  dayText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dayTextActive: {
    color: COLORS.primary,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dayDotActive: {
    backgroundColor: COLORS.primary,
  },

  // Nutrition Card
  nutritionCard: {
    marginBottom: SPACING.base,
    padding: SPACING.base,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  nutritionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewDetailsText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Macros Grid
  macrosGrid: {
    gap: SPACING.md,
  },
  macroItem: {
    gap: SPACING.xs,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  macroValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  macroUnit: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  macroBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },

  // Meals Section
  mealsSection: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Meal Card
  mealCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.base,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  mealTypeWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  mealType: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  mealName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  mealDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },

  // Meal Stats
  mealStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealStat: {
    flex: 1,
    alignItems: 'center',
  },
  mealStatLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mealStatValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mealStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  // Meal Footer
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  healthScoreText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  viewRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewRecipeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Empty State
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

