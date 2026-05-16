import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

const MOCK_GROUPS = [
  { id: '1', name: 'Seed Oil Free Living', members: '12.5k', type: 'Official' },
  { id: '2', name: 'Allergy & Intolerance Support', members: '8.2k', type: 'Official' },
  { id: '3', name: 'NYC Clean Eaters', members: '430', type: 'Community' }
];

export default function CommunityGroups({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="people" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.members}>{item.members} members • {item.type}</Text>
      </View>
      <TouchableOpacity style={styles.joinBtn}>
        <Text style={styles.joinText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Communities</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_GROUPS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  list: { padding: SPACING.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: { flex: 1 },
  name: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', color: COLORS.text },
  members: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, marginTop: 4 },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  joinText: { color: COLORS.white, fontWeight: '600', fontSize: TYPOGRAPHY.sm }
});
