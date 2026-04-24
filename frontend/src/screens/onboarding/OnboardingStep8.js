import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useCameraPermissions } from 'expo-camera';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const PERMISSIONS = [
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'Required to scan product barcodes and ingredient labels',
    icon: 'camera-outline',
    required: true,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Stay informed about product recalls and health alerts',
    icon: 'notifications-outline',
    required: false,
  },
];

export default function OnboardingStep8({ navigation, nextStep }) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [notifGranted, setNotifGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const cameraGranted = cameraPermission?.granted ?? false;

  const handleRequestCamera = async () => {
    setRequesting(true);
    try {
      await requestCameraPermission();
    } finally {
      setRequesting(false);
    }
  };

  const handleRequestNotifications = async () => {
    setRequesting(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifGranted(status === 'granted');
    } catch (error) {
      console.warn('Notification permission error:', error.message);
    } finally {
      setRequesting(false);
    }
  };

  const requestPermission = (id) => {
    if (id === 'camera') return handleRequestCamera();
    return handleRequestNotifications();
  };

  const handleComplete = async () => {
    if (!cameraGranted) {
      Alert.alert('Camera Required', 'Camera access is required to scan products. Please grant permission to continue.');
      return;
    }
    
    setCompleting(true);
    
    try {
      await nextStep();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const requestAllPermissions = async () => {
    setRequesting(true);
    try {
      await requestCameraPermission();
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifGranted(status === 'granted');
    } catch (error) {
      console.warn('Permission request error:', error.message);
    } finally {
      setRequesting(false);
    }
  };

  const permissions = { camera: cameraGranted, notifications: notifGranted };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permissions</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Almost there!</Text>
        <Text style={styles.subtitle}>
          To provide the best experience, we need a few permissions. Your privacy is our priority.
        </Text>

        <View style={styles.permissionsList}>
          {PERMISSIONS.map(permission => (
            <View key={permission.id} style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                <Ionicons name={permission.icon} size={28} color={COLORS.primary} />
              </View>
              
              <View style={styles.permissionContent}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  {permission.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.permissionDescription}>{permission.description}</Text>

                {permissions[permission.id] ? (
                  <View style={styles.grantedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.grantedText}>Granted</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.grantButton}
                    onPress={() => requestPermission(permission.id)}
                    disabled={requesting}
                  >
                    <Text style={styles.grantButtonText}>
                      {requesting ? 'Requesting...' : 'Grant Permission'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
          <Text style={styles.privacyText}>
            We respect your privacy. Your data is encrypted and never shared without your consent.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!permissions.camera && !permissions.notifications && (
          <TouchableOpacity
            style={styles.grantAllButton}
            onPress={requestAllPermissions}
            disabled={requesting}
          >
            <Text style={styles.grantAllButtonText}>
              {requesting ? 'Requesting...' : 'Grant All Permissions'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.completeButton,
            (!permissions.camera || completing) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!permissions.camera || completing}
          activeOpacity={0.8}
        >
          {completing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.completeButtonText}>Complete Setup</Text>
          )}
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 8 of 8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  permissionsList: {
    gap: SPACING.base,
    marginBottom: SPACING.xl,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  requiredBadge: {
    backgroundColor: COLORS.error + '15',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  requiredText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.error,
  },
  permissionDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  grantButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  grantButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  grantedText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  privacyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.base,
  },
  grantAllButton: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  grantAllButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  completeButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  completeButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
