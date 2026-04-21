import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { supabase } from '../../services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function Settings({ navigation }) {
  const { user } = useAppContext();
  const [signingOut, setSigningOut] = useState(false);

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
              setSigningOut(true);
              await supabase.auth.signOut();
              // Navigation will be handled by auth state listener
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setSigningOut(false);
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
                  onPress={() => navigation.navigate(item.screen)}
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
          style={styles.logoutBtn}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Text style={styles.logoutText}>{signingOut ? 'Signing Out...' : 'Sign Out'}</Text>
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
  logoutBtn: {
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  logoutText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
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
