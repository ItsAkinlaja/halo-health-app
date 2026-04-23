import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function Register({ navigation }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [haloHealthId, setHaloHealthId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idAvailable, setIdAvailable] = useState(null);
  const [suggestedIds, setSuggestedIds] = useState([]);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const { signUp } = useAuth();

  const checkHaloIdAvailability = async (id) => {
    if (!id || id.length < 3) {
      setIdAvailable(null);
      setSuggestedIds([]);
      return;
    }

    setIsCheckingId(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/check-halo-id?haloHealthId=${id}`);
      const data = await response.json();
      
      if (data.available) {
        setIdAvailable(true);
        setSuggestedIds([]);
      } else {
        setIdAvailable(false);
        setSuggestedIds(data.suggestions || []);
      }
    } catch (err) {
      console.error('Error checking ID:', err);
      setIdAvailable(null);
      setSuggestedIds([]);
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleHaloIdChange = (text) => {
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHaloHealthId(sanitized);
    setIdAvailable(null);
    setSuggestedIds([]);
  };

  const handleHaloIdBlur = () => {
    setFocusedField(null);
    if (haloHealthId.length >= 3) {
      checkHaloIdAvailability(haloHealthId);
    }
  };

  const handleRegister = async () => {
    setError(null);

    if (!email || !firstName || !lastName || !password || !confirmPassword || !haloHealthId) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (haloHealthId.length < 3 || haloHealthId.length > 20) {
      setError('Halo Health ID must be 3-20 characters');
      return;
    }

    if (idAvailable === false) {
      setError('This Halo Health ID is already taken. Please choose another.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, {
        halo_health_id: haloHealthId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      });
      
      navigation.navigate('VerifyEmail', { email: email.trim() });
    } catch (err) {
      let errorMsg = err.message;
      
      if (err.status === 429 || errorMsg?.toLowerCase().includes('rate limit')) {
        errorMsg = 'Too many signup attempts. Please wait a few minutes.';
      } else if (errorMsg?.toLowerCase().includes('already registered')) {
        errorMsg = 'An account with this email already exists.';
      } else if (errorMsg?.toLowerCase().includes('halo health id already taken')) {
        errorMsg = 'This Halo Health ID is already taken.';
        setIdAvailable(false);
      } else if (errorMsg?.toLowerCase().includes('invalid')) {
        errorMsg = 'Invalid email or password format.';
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>Halo Health</Text>
              <Text style={styles.tagline}>Create your account</Text>
            </View>

            {/* Form Card */}
            <Card style={styles.formCard} variant="elevated">
              <Text style={styles.formTitle}>Sign Up</Text>
              <Text style={styles.formSubtitle}>Join our health community</Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* First Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'firstName' && styles.inputWrapFocused,
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={focusedField === 'firstName' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setError(null);
                    }}
                    placeholder="John"
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Last Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'lastName' && styles.inputWrapFocused,
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={focusedField === 'lastName' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setError(null);
                    }}
                    placeholder="Doe"
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'email' && styles.inputWrapFocused,
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
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                    }}
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

              {/* Halo Health ID Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Halo Health ID *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'haloId' && styles.inputWrapFocused,
                  idAvailable === true && styles.inputWrapSuccess,
                  idAvailable === false && styles.inputWrapError,
                ]}>
                  <Ionicons
                    name="at-outline"
                    size={18}
                    color={focusedField === 'haloId' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={haloHealthId}
                    onChangeText={handleHaloIdChange}
                    placeholder="Choose your unique ID"
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('haloId')}
                    onBlur={handleHaloIdBlur}
                  />
                  {isCheckingId && (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  )}
                  {!isCheckingId && idAvailable === true && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  )}
                  {!isCheckingId && idAvailable === false && (
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  )}
                </View>
                {idAvailable === true && (
                  <Text style={styles.successHint}>This ID is available!</Text>
                )}
                {idAvailable === false && (
                  <View style={styles.idTakenContainer}>
                    <Text style={styles.errorHint}>This ID is already taken</Text>
                    {suggestedIds.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <Text style={styles.suggestionsLabel}>Try these:</Text>
                        <View style={styles.suggestionsRow}>
                          {suggestedIds.map((suggestion, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={styles.suggestionChip}
                              onPress={() => {
                                setHaloHealthId(suggestion);
                                checkHaloIdAvailability(suggestion);
                              }}
                            >
                              <Text style={styles.suggestionText}>{suggestion}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
                <Text style={styles.hint}>Only lowercase letters, numbers, and underscores</Text>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'password' && styles.inputWrapFocused,
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
                    placeholder="At least 8 characters"
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

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={[
                  styles.inputWrap,
                  focusedField === 'confirmPassword' && styles.inputWrapFocused,
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={focusedField === 'confirmPassword' ? COLORS.primary : COLORS.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                icon="arrow-forward"
                iconPosition="right"
              />

              <View style={styles.terms}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </Card>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Sign In</Text>
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

  // Header
  header: {
    paddingTop: SPACING.base,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  logo: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.5,
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

  // Error Banner
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
  inputWrapSuccess: {
    borderColor: COLORS.success,
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
  hint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  successHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.success,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  errorHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  idTakenContainer: {
    marginTop: SPACING.xs,
  },
  suggestionsContainer: {
    marginTop: SPACING.sm,
  },
  suggestionsLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Terms
  terms: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  termsText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
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
