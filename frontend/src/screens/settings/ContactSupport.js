import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function ContactSupport({ navigation }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert('Success', 'Your message has been sent. We will respond within 24 hours.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <Ionicons name="mail-outline" size={32} color={COLORS.primary} />
          <Text style={styles.infoText}>support@halohealth.com</Text>
          <Text style={styles.infoSubtext}>We typically respond within 24 hours</Text>
        </Card>

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief description of your issue"
          placeholderTextColor={COLORS.textTertiary}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue in detail..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Button
          title={sending ? 'Sending...' : 'Send Message'}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSubmit}
          disabled={sending}
        />
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
  infoCard: { padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  infoText: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary, marginTop: SPACING.sm },
  infoSubtext: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 4 },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
  },
  textArea: { height: 120 },
});
