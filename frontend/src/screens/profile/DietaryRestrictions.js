import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { profileService } from '../../services/profileService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function DietaryRestrictions({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [otherRestriction, setOtherRestriction] = useState('');

  useEffect(() => {
    if (activeProfile?.id) {
      loadRestrictions();
    } else {
      setLoading(false);
    }
  }, [activeProfile]);

  const loadRestrictions = async () => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await profileService.getDietaryRestrictions(activeProfile.id);
      setSelected(data || []);
    } catch (error) {
      console.warn('Failed to load dietary restrictions:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeProfile?.id) {
      Alert.alert('Error', 'No profile selected');
      return;
    }

    try {
      setSaving(true);
      const finalRestrictions = [
        ...selected.filter(id => id !== 'other'),
        ...(selected.includes('other') && otherRestriction.trim() ? [otherRestriction.trim()] : [])
      ];
      await profileService.updateDietaryRestrictions(activeProfile.id, finalRestrictions);
      Alert.alert('Success', 'Dietary restrictions updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.warn('Failed to save dietary restrictions:', error.message);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const restrictions = [
    { id: 'gluten-free', label: 'Gluten Free' },
    { id: 'dairy-free', label: 'Dairy Free' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'paleo', label: 'Paleo' },
    { id: 'keto', label: 'Ketogenic' },
    { id: 'low-carb', label: 'Low Carb' },
    { id: 'low-fodmap', label: 'Low FODMAP' },
    { id: 'low-sodium', label: 'Low Sodium' },
    { id: 'low-sugar', label: 'Low Sugar' },
    { id: 'diabetic', label: 'Diabetic-Friendly' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'mediterranean', label: 'Mediterranean' },
    { id: 'whole30', label: 'Whole30' },
    { id: 'other', label: 'Other' },
  ];

  const toggleRestriction = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredRestrictions = restrictions.filter(r =>
    r.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading restrictions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dietary Restrictions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Select all dietary restrictions that apply to you. This helps us provide personalized product recommendations.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search restrictions..."
            placeholderTextColor={COLORS.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Count */}
        {selected.length > 0 && (
          <View style={styles.selectedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.selectedText}>{selected.length} restriction{selected.length !== 1 ? 's' : ''} selected</Text>
          </View>
        )}

        {/* Restrictions Grid */}
        <View style={styles.grid}>
          {filteredRestrictions.map((restriction) => {
            const isSelected = selected.includes(restriction.id);
            return (
              <TouchableOpacity
                key={restriction.id}
                style={[styles.restrictionCard, isSelected && styles.restrictionCardSelected]}
                onPress={() => toggleRestriction(restriction.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
                <Text style={[styles.restrictionLabel, isSelected && styles.restrictionLabelSelected]}>
                  {restriction.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected.includes('other') && (
          <View style={styles.otherInputWrap}>
            <Text style={styles.label}>Please specify other dietary restriction</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="restaurant-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={otherRestriction}
                onChangeText={setOtherRestriction}
                placeholder="e.g. Low Sodium, No Sugar"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {filteredRestrictions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No restrictions found</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSave}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },
  description: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.base,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  clearBtn: { padding: SPACING.sm },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  selectedText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  restrictionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: '47%',
  },
  restrictionCardSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  restrictionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  restrictionLabelSelected: {
    color: COLORS.primary,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  otherInputWrap: {
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
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
});

