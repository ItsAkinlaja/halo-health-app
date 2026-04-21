import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import storage from '../../utils/storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function DebugScreen({ navigation }) {
  const { user, isLoading, isFirstTime, needsDisclaimer, signOut } = useAuth();
  const appContext = useAppContext();
  const [storageData, setStorageData] = useState({});

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    const keys = await storage.getAllKeys();
    const data = {};
    
    for (const key of keys) {
      const value = await storage.getItem(key);
      data[key] = value;
    }
    
    setStorageData(data);
  };

  const handleClearStorage = async () => {
    Alert.alert(
      'Clear Storage',
      'This will clear all app data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            await loadStorageData();
            Alert.alert('Success', 'Storage cleared');
          },
        },
      ]
    );
  };

  const handleClearAuthData = async () => {
    Alert.alert(
      'Clear Auth Data',
      'This will clear authentication data only. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAuthData();
            await loadStorageData();
            Alert.alert('Success', 'Auth data cleared');
          },
        },
      ]
    );
  };

  const handleForceSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDebugLog = async () => {
    await storage.debugStorage();
    Alert.alert('Success', 'Check console for storage contents');
  };

  const handleCleanupProfiles = async () => {
    Alert.alert(
      'Cleanup Profiles',
      'This will remove duplicate profiles. Keep only the primary profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cleanup',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would need to be implemented in profileService
              Alert.alert('Info', 'Profile cleanup feature coming soon');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Info</Text>
        <TouchableOpacity onPress={loadStorageData} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Auth State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth State</Text>
          <View style={styles.card}>
            <InfoRow label="User ID" value={user?.id || 'null'} />
            <InfoRow label="Email" value={user?.email || 'null'} />
            <InfoRow label="Is Loading" value={isLoading.toString()} />
            <InfoRow label="Is First Time" value={isFirstTime.toString()} />
            <InfoRow label="Needs Disclaimer" value={needsDisclaimer.toString()} />
          </View>
        </View>

        {/* App Context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Context</Text>
          <View style={styles.card}>
            <InfoRow label="Context User" value={appContext.user?.id || 'null'} />
            <InfoRow label="Active Profile" value={appContext.activeProfile?.name || 'null'} />
            <InfoRow label="Profiles Count" value={appContext.profiles?.length?.toString() || '0'} />
          </View>
        </View>

        {/* Storage Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage</Text>
          <View style={styles.card}>
            {Object.keys(storageData).length === 0 ? (
              <Text style={styles.emptyText}>No data in storage</Text>
            ) : (
              Object.entries(storageData).map(([key, value]) => (
                <InfoRow
                  key={key}
                  label={key}
                  value={typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : String(value)}
                />
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDebugLog}>
            <Ionicons name="bug-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Log Storage to Console</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCleanupProfiles}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Cleanup Duplicate Profiles</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleForceSignOut}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.warning} />
            <Text style={[styles.actionButtonText, { color: COLORS.warning }]}>Force Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearAuthData}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Clear Auth Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleClearStorage}>
            <Ionicons name="nuclear-outline" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Clear All Storage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value ?? 'null'}</Text>
    </View>
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
  refreshButton: {
    padding: SPACING.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingVertical: SPACING.base,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
