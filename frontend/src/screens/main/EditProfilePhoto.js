import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../../context/AppContext';
import { profileService } from '../../services/profileService';
import { supabase } from '../../services/supabase';
import storage, { STORAGE_KEYS } from '../../utils/storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

export default function EditProfilePhoto({ navigation }) {
  const { user, setUser } = useAppContext();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAvatarUrl(user?.user_metadata?.avatar_url ?? '');
  }, [user]);

  const getInitials = (name) => name.trim().split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();

  const [initials, setInitials] = React.useState('U');

  useEffect(() => {
    const metaName = user?.user_metadata?.name || user?.user_metadata?.full_name;
    if (metaName) {
      setInitials(getInitials(metaName));
      return;
    }

    const tryStorage = async () => {
      try {
        const onboarding = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA) || {};
        const candidate = onboarding.fullName || onboarding.full_name || onboarding.name;
        if (candidate) setInitials(getInitials(candidate));
        else setInitials((user?.email?.[0] || 'U').toUpperCase());
      } catch (e) {
        setInitials((user?.email?.[0] || 'U').toUpperCase());
      }
    };

    tryStorage();
  }, [user]);

  const syncAvatarInAuth = async (nextAvatarUrl) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        avatar_url: nextAvatarUrl,
      },
    });

    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
    }
  };

  const handleChoosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType?.Images ?? 'images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) return;

    try {
      setLoading(true);
      const imageUri = result.assets[0].uri;
      const response = await profileService.uploadPhoto(user.id, imageUri);
      const nextAvatar = response?.avatar_url || response?.data?.avatar_url || '';

      setAvatarUrl(nextAvatar);
      await syncAvatarInAuth(nextAvatar);
      Alert.alert('Success', 'Profile picture updated.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      await profileService.removePhoto(user.id);
      await syncAvatarInAuth(null);
      setAvatarUrl('');
      Alert.alert('Removed', 'Profile picture removed.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to remove profile picture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Picture</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials || 'U'}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          onPress={handleChoosePhoto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="image-outline" size={18} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</Text>
            </>
          )}
        </TouchableOpacity>

        {avatarUrl ? (
          <TouchableOpacity
            style={[styles.removeButton, loading && styles.removeButtonDisabled]}
            onPress={handleRemovePhoto}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error || '#D64545'} />
            <Text style={styles.removeButtonText}>Remove Photo</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  avatarWrap: { marginBottom: SPACING.xxxl },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: TYPOGRAPHY.xxxl, fontWeight: '700', color: COLORS.white },
  actionButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  actionButtonDisabled: { opacity: 0.7 },
  actionButtonText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  removeButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.error || '#D64545',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  removeButtonDisabled: { opacity: 0.7 },
  removeButtonText: {
    color: COLORS.error || '#D64545',
    fontWeight: '700',
    fontSize: TYPOGRAPHY.base,
  },
});
