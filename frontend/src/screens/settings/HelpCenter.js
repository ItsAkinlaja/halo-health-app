import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

const FAQ = [
  { q: 'How do I scan a product?', a: 'Tap the scan icon and point your camera at the barcode.' },
  { q: 'What do health scores mean?', a: 'Scores range from 0-100 based on ingredients, nutrition, and your health profile.' },
  { q: 'How do I add family members?', a: 'Go to Profile > Family Profiles > Add Member.' },
  { q: 'Can I export my data?', a: 'Yes, go to Settings > Privacy > Download My Data.' },
];

export default function HelpCenter({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.quickCard}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('ContactSupport')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
            <Text style={styles.quickText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ.map((item, idx) => (
          <Card key={idx} style={styles.faqCard}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </Card>
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
  quickCard: { padding: SPACING.base, marginBottom: SPACING.lg },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, justifyContent: 'center' },
  quickText: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.primary },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqCard: { padding: SPACING.base, marginBottom: SPACING.sm },
  question: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  answer: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
