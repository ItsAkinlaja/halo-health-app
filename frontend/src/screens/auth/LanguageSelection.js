import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { useTranslation } from '../../hooks/useTranslation';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

export default function LanguageSelection({ navigation }) {
  const { t, locale, changeLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(locale || 'en');

  useEffect(() => {
    setSelectedLanguage(locale);
  }, [locale]);

  const handleLanguageSelect = async (languageCode) => {
    setSelectedLanguage(languageCode);
    // Change language instantly across the entire app
    await changeLanguage(languageCode);
  };

  const handleDone = () => {
    // Language is already changed, just navigate
    navigation.navigate('OnboardingPreview');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedLanguage === language.code && styles.languageCardSelected,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageText}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNative}>{language.nativeName}</Text>
                </View>
              </View>
              
              {selectedLanguage === language.code && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('language.done')}
            onPress={handleDone}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  languageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  flag: {
    fontSize: 32,
  },
  languageText: {
    gap: SPACING.xs,
  },
  languageName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  languageNative: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
});
