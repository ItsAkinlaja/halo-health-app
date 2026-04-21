import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

export default function Appearance({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="moon-outline" size={20} color={COLORS.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowDesc}>Coming soon</Text>
              </View>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} disabled />
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <Ionicons name="contract-outline" size={20} color={COLORS.primary} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Compact View</Text>
                <Text style={styles.rowDesc}>Reduce spacing</Text>
              </View>
            </View>
            <Switch value={compactView} onValueChange={setCompactView} />
          </View>
        </Card>
      </ScrollView>
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
  card: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  rowDesc: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
});
