import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export function MedicalDisclaimer() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medical-outline" size={24} color={COLORS.warning} />
        <Text style={styles.title}>Medical Disclaimer</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Important:</Text> Halo Health is designed for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
        
        <Text style={styles.text}>
          The information provided by this app, including product analyses, health scores, and dietary recommendations, should not be used as a replacement for consultation with qualified healthcare professionals.
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Always seek the advice of your physician or other qualified health provider</Text> with any questions you may have regarding a medical condition, dietary changes, or health concerns.
        </Text>

        <Text style={styles.text}>
          Never disregard professional medical advice or delay in seeking it because of information you have read or received through this app.
        </Text>

        <Text style={styles.text}>
          If you think you may have a medical emergency, call your doctor or emergency services immediately.
        </Text>

        <Text style={styles.text}>
          Halo Health does not endorse any specific products, treatments, or procedures mentioned in the app. Product information is provided for educational purposes only.
        </Text>

        <Text style={styles.disclaimer}>
          By using this app, you acknowledge that you have read and understood this disclaimer.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: COLORS.warning,
  },
  content: {
    maxHeight: 300,
  },
  text: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
});
