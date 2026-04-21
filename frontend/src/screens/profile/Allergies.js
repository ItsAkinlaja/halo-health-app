import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { profileService } from '../../services/profileService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

const ALLERGIES = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree-nuts', label: 'Tree Nuts' },
  { id: 'milk', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'sesame', label: 'Sesame' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'corn', label: 'Corn' },
  { id: 'sulfites', label: 'Sulfites' },
  { id: 'mustard', label: 'Mustard' },
  { id: 'celery', label: 'Celery' },
  { id: 'lupin', label: 'Lupin' },
  { id: 'molluscs', label: 'Molluscs' },
];

export default function Allergies({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (activeProfile?.id) {
      loadAllergies();
    } else {
      setLoading(false);
    }
  }, [activeProfile]);

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAllergies(activeProfile.id);
      setSelected(data || []);
    } catch (error) {
      console.warn('Failed to load allergies:', error.message);
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
      await profileService.updateAllergies(activeProfile.id, selected);
      Alert.alert('Success', 'Allergies updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.warn('Failed to save allergies:', error.message);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const filtered = ALLERGIES.filter(a =>
    a.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading allergies...</Text>
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
        <Text style={styles.headerTitle}>Allergies & Intolerances</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Select all allergies and intolerances that apply to you. We will flag any matching ingredients in products you scan.
        </Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search allergies..."
            placeholderTextColor={COLORS.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {selected.length > 0 && (
          <View style={styles.selectedBanner}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.selectedText}>
              {selected.length} allerg{selected.length !== 1 ? 'ies' : 'y'} selected
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          {filtered.map((allergy) => {
            const isSelected = selected.includes(allergy.id);
            return (
              <TouchableOpacity
                key={allergy.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggle(allergy.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {allergy.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No allergies found</Text>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
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
  selectedText: { fontSize: TYPOGRAPHY.sm, fontWeight: '600', color: COLORS.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  card: {
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
  cardSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cardLabel: { fontSize: TYPOGRAPHY.sm, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  cardLabelSelected: { color: COLORS.primary },
  emptyCard: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary },
  footer: {
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.base },
  loadingText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '500' },
});
