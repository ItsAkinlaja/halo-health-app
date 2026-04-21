import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import storage, { STORAGE_KEYS } from '../../utils/storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function MedicalDisclaimerScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    try {
      await storage.setItem(STORAGE_KEYS.MEDICAL_DISCLAIMER_ACCEPTED, true);
      navigation.replace('MainApp');
    } catch (error) {
      console.warn('Failed to save disclaimer acceptance:', error);
      // Navigate anyway
      navigation.replace('MainApp');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={48} color={COLORS.warning} />
          </View>
          <Text style={styles.title}>Important Medical Disclaimer</Text>
          <Text style={styles.subtitle}>Please read carefully before using Halo Health</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.disclaimerBox}>
            <Text style={styles.sectionTitle}>For Informational Purposes Only</Text>
            <Text style={styles.text}>
              Halo Health is designed for <Text style={styles.bold}>informational and educational purposes only</Text>. 
              It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
            </Text>

            <Text style={styles.sectionTitle}>Not Medical Advice</Text>
            <Text style={styles.text}>
              The information provided by this app, including product analyses, health scores, and dietary recommendations, 
              should not be used as a replacement for consultation with qualified healthcare professionals.
            </Text>

            <Text style={styles.sectionTitle}>Consult Your Doctor</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Always seek the advice of your physician or other qualified health provider</Text> with 
              any questions you may have regarding a medical condition, dietary changes, allergies, or health concerns.
            </Text>

            <Text style={styles.sectionTitle}>Do Not Ignore Medical Advice</Text>
            <Text style={styles.text}>
              Never disregard professional medical advice or delay in seeking it because of information you have read or 
              received through this app.
            </Text>

            <Text style={styles.sectionTitle}>Emergency Situations</Text>
            <Text style={styles.text}>
              If you think you may have a medical emergency, call your doctor, go to the emergency department, or call 
              emergency services immediately.
            </Text>

            <Text style={styles.sectionTitle}>No Endorsements</Text>
            <Text style={styles.text}>
              Halo Health does not endorse any specific products, treatments, or procedures mentioned in the app. 
              Product information is provided for educational purposes only.
            </Text>

            <Text style={styles.sectionTitle}>Accuracy of Information</Text>
            <Text style={styles.text}>
              While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness or 
              accuracy of all product data. Always verify information with product labels and manufacturers.
            </Text>

            <Text style={styles.sectionTitle}>Individual Results May Vary</Text>
            <Text style={styles.text}>
              Health recommendations are general in nature. Individual results and experiences may vary. What works for 
              one person may not work for another.
            </Text>
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAccepted(!accepted)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            accessibilityLabel="I have read and understand this medical disclaimer"
          >
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <Ionicons name="checkmark" size={20} color={COLORS.white} />}
            </View>
            <Text style={styles.checkboxText}>
              I have read and understand this medical disclaimer. I acknowledge that Halo Health is for informational 
              purposes only and is not a substitute for professional medical advice.
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !accepted && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!accepted}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Accept and continue"
            accessibilityState={{ disabled: !accepted }}
          >
            <Text style={[styles.buttonText, !accepted && styles.buttonTextDisabled]}>
              Accept and Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  disclaimerBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonTextDisabled: {
    color: COLORS.textTertiary,
  },
});
