import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

export default function Privacy({ navigation }) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownloadData = async () => {
    try {
      setLoading(true);
      await userService.requestDataExport();
      Alert.alert(
        'Export Requested',
        'Your data export has been requested. You will receive an email with a download link within 24 hours.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request data export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Data',
      'This will delete all your scan history and saved products. Your account will remain active. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userService.deleteUserData();
              Alert.alert('Success', 'Your data has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted and you will be signed out. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userService.deleteUserAccount();
              await signOut();
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        <Card style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Terms')}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={handleDownloadData}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Download my data"
            accessibilityHint="Request a copy of your personal data"
          >
            <View style={styles.rowLeft}>
              <Ionicons name="download-outline" size={20} color={COLORS.primary} />
              <Text style={styles.rowLabel}>Download My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleDeleteData} disabled={loading}>
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={20} color={COLORS.warning} />
              <Text style={[styles.rowLabel, { color: COLORS.warning }]}>Delete Scan Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleDeleteAccount} disabled={loading}>
            <View style={styles.rowLeft}>
              <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
              <Text style={[styles.rowLabel, { color: COLORS.error }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </Card>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { flex: 1 },
  content: { padding: SPACING.base, gap: SPACING.base },
  card: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
