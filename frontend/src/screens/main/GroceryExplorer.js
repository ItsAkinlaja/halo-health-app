import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

const STORES = [
  { id: '1', name: 'Whole Foods Market', logo: 'https://via.placeholder.com/100', tags: ['Organic', 'Clean'] },
  { id: '2', name: 'Trader Joe\'s', logo: 'https://via.placeholder.com/100', tags: ['Affordable', 'Snacks'] },
  { id: '3', name: 'Target', logo: 'https://via.placeholder.com/100', tags: ['Household', 'Groceries'] },
  { id: '4', name: 'Walmart', logo: 'https://via.placeholder.com/100', tags: ['Value', 'Variety'] },
];

export default function GroceryExplorer({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.logo }} style={styles.logo} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.tagContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Grocery Explorer</Text>
      </View>
      
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
        <Text style={styles.searchText}>Search products across all stores...</Text>
      </View>

      <Text style={styles.sectionTitle}>Browse by Store</Text>
      <FlatList
        data={STORES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
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
    padding: SPACING.md,
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  searchText: {
    marginLeft: SPACING.sm,
    color: COLORS.textTertiary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: 6,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.xs,
  }
});
