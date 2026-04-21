import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

export default function NotificationSettings({ navigation }) {
  const [settings, setSettings] = useState({
    productRecalls: true,
    healthAlerts: true,
    mealReminders: false,
    scanResults: true,
    weeklyReports: true,
    promotions: false,
  });

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const sections = [
    {
      title: 'Health & Safety',
      items: [
        { key: 'productRecalls', icon: 'warning-outline', label: 'Product Recalls', desc: 'Critical safety alerts' },
        { key: 'healthAlerts', icon: 'medical-outline', label: 'Health Alerts', desc: 'Allergy and health warnings' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { key: 'mealReminders', icon: 'restaurant-outline', label: 'Meal Reminders', desc: 'Daily meal plan notifications' },
        { key: 'scanResults', icon: 'scan-outline', label: 'Scan Results', desc: 'Product analysis complete' },
        { key: 'weeklyReports', icon: 'stats-chart-outline', label: 'Weekly Reports', desc: 'Health score summaries' },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { key: 'promotions', icon: 'pricetag-outline', label: 'Promotions', desc: 'Offers and updates' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.card}>
              {section.items.map((item, i) => (
                <View key={item.key} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={styles.rowLeft}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowDesc}>{item.desc}</Text>
                    </View>
                  </View>
                  <Switch value={settings[item.key]} onValueChange={() => toggle(item.key)} />
                </View>
              ))}
            </Card>
          </View>
        ))}
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
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  rowDesc: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
});
