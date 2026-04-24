import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { useTranslation } from '../../hooks/useTranslation';

export default function Welcome({ navigation }) {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#00B386', '#00D4AA', '#52C9A8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: 'https://ik.imagekit.io/scmchurch/WhatsApp%20Image%202026-04-20%20at%2019.54.45.jpeg' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>{t('welcome.title')}</Text>
              <Text style={styles.subtitle}>
                {t('welcome.subtitle')}
              </Text>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresContainer}>
              <FeatureCard
                icon="scan-outline"
                title="Smart Scanning"
                description="Instant product analysis with AI"
              />
              <FeatureCard
                icon="fitness-outline"
                title="Health Tracking"
                description="Monitor your wellness journey"
              />
              <FeatureCard
                icon="analytics-outline"
                title="Insights & Reports"
                description="Data-driven recommendations"
              />
              <FeatureCard
                icon="people-outline"
                title="Family Profiles"
                description="Manage health for loved ones"
              />
            </View>
          </Animated.View>

          {/* Footer Actions */}
          <Animated.View 
            style={[
              styles.footer,
              { opacity: fadeAnim },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('LanguageSelection')}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>{t('welcome.continue')}</Text>
            </TouchableOpacity>
            
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>{t('welcome.alreadyHaveAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>{t('welcome.signIn')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 24,
    fontWeight: '400',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00B386',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: '#00B386',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signInText: {
    fontSize: TYPOGRAPHY.base,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  signInLink: {
    fontSize: TYPOGRAPHY.base,
    color: '#FFFFFF',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
