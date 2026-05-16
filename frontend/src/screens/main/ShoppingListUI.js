import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, CheckBox, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

const MOCK_LIST = [
  { id: '1', name: 'Organic Spinach', category: 'Produce', checked: false },
  { id: '2', name: 'Almond Milk (Unsweetened)', category: 'Dairy Alternatives', checked: true },
  { id: '3', name: 'Grass-fed Ground Beef', category: 'Protein', checked: false },
];

export default function ShoppingListUI({ navigation }) {
  const [items, setItems] = useState(MOCK_LIST);

  const toggleItem = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemRow} onPress={() => toggleItem(item.id)}>
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping List</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  list: { padding: SPACING.md },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: TYPOGRAPHY.md, color: COLORS.text, fontWeight: '500' },
  itemNameChecked: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  itemCategory: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  }
});
