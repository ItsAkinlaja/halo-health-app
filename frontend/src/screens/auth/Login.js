import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

export default function Login({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const { signIn } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('invalid') || err?.status === 400 || err?.status === 401) {
        setError('Incorrect email or password');
      } else if (msg.includes('network')) {
        setError('No internet connection');
      } else {
        setError('Something went wrong. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, signIn]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoImageContainer}>
                <Image
                  source={{ uri: 'https://ik.imagekit.io/scmchurch/WhatsApp%20Image%202026-04-20%20at%2019.54.45.jpeg' }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.tagline}>Professional Product Safety Analysis</Text>
            </View>

            {/* Form Card */}
            <Card style={styles.formCard} variant="elevated">
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>Access your health profile</Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {route?.params?.successMessage && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                  <Text style={styles.successText}>{route.params.successMessage}</Text>
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'email' && styles.inputWrapFocused,
                  error && styles.inputWrapError,
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={focusedField === 'email' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'password' && styles.inputWrapFocused,
                  error && styles.inputWrapError,
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusedField === 'password' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                icon="arrow-forward"
                iconPosition="right"
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                  <Ionicons name="logo-google" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                  <Ionicons name="logo-apple" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </Card>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}> Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
  },
  logoImageContainer: {
    width: 300,
    height: 200,
    marginBottom: SPACING.base,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Form Card
  formCard: {
    padding: SPACING.xl,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },

  // Error/Success Banners
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success + '10',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  successText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: '500',
  },

  // Input Fields
  inputGroup: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  inputWrapError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  eyeBtn: {
    padding: SPACING.sm,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
  },

  // Social Buttons
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
