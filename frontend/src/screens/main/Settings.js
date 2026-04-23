import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { supabase } from '../../services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function Settings({ navigation }) {
  const { user } = useAppContext();
  const { signOut, checkBiometricSupport, authenticateWithBiometrics, enableBiometricLogin, disableBiometricLogin, getBiometricCredentials, deleteAccount } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  React.useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const credentials = await getBiometricCredentials();
    setBiometricEnabled(!!credentials);
  };

  const handleToggleBiometric = async () => {
    const { compatible, enrolled } = await checkBiometricSupport();
    
    if (!compatible || !enrolled) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }

    if (biometricEnabled) {
      Alert.alert(
        'Disable Biometric Login',
        'Are you sure you want to disable biometric login?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableBiometricLogin();
              setBiometricEnabled(false);
              Alert.alert('Success', 'Biometric login has been disabled');
            },
          },
        ]
      );
    } else {
      const success = await authenticateWithBiometrics();
      if (success) {
        Alert.prompt(
          'Enable Biometric Login',
          'Enter your password to enable biometric authentication',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: async (password) => {
                if (password && user?.email) {
                  await enableBiometricLogin(user.email, password);
                  setBiometricEnabled(true);
                  Alert.alert('Success', 'Biometric login has been enabled');
                } else {
                  Alert.alert('Error', 'Password is required');
                }
              },
            },
          ],
          'secure-text'
        );
      } else {
        Alert.alert('Authentication Failed', 'Could not verify your identity');
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', screen: 'PersonalInfo' },
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
        { icon: 'finger-print', label: biometricEnabled ? 'Disable Biometric Login' : 'Enable Biometric Login', action: handleToggleBiometric },
      ],
    },
    {
      title: 'Health Profile',
      items: [
        { icon: 'restaurant-outline', label: 'Dietary Restrictions', screen: 'DietaryRestrictions' },
        { icon: 'people-outline', label: 'Family Profiles', screen: 'FamilyProfiles' },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { icon: 'bookmark-outline', label: 'Saved Products', screen: 'SavedProducts' },
        { icon: 'time-outline', label: 'Scan History', screen: 'ScanHistory' },
      ],
    },
    {
      title: 'Developer',
      items: [
        { icon: 'bug-outline', label: 'Debug Info', screen: 'Debug' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {settingsSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.settingItem,
                    itemIdx !== section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={() => item.action ? item.action() : navigation.navigate(item.screen)}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconWrap}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Halo Health v1.0.0</Text>
          {user?.email && (
            <Text style={styles.emailText}>{user.email}</Text>
          )}
        </View>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { padding: 0 },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    backgroundColor: COLORS.error + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  deleteText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  versionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  emailText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
});
