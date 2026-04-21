import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function RestaurantMenuScanner({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.empty}>
          <Ionicons name="restaurant-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>Menu Scanner</Text>
          <Text style={styles.emptyText}>
            Install expo-image-picker to enable menu scanning:
          </Text>
          <Text style={styles.codeText}>
            cd frontend && npm install expo-image-picker expo-av
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  codeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontFamily: 'monospace',
    backgroundColor: COLORS.surface,
    padding: SPACING.base,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.base,
  },
});
