import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../../context/AppContext';
import storage, { STORAGE_KEYS } from '../../utils/storage';
import { profileService } from '../../services/profileService';
import { supabase } from '../../services/supabase';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

export default function EditProfile({ navigation }) {
  const { user, setUser } = useAppContext();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      // Prefer explicit name fields, then onboarding data saved in user metadata, then persisted onboarding storage
      const meta = user.user_metadata || {};
      const onboardingMeta = meta.onboarding_data || {};
      const fallbackName = onboardingMeta.fullName || onboardingMeta.full_name || onboardingMeta.name || '';
      const initialName = meta.name || meta.full_name || fallbackName || '';
      setName(initialName);
      setUsername(user.user_metadata?.username ?? user.user_metadata?.halo_health_id ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? '');
    }
  }, [user]);

  // If user metadata lacked name, try to load from local onboarding storage
  useEffect(() => {
    const fillFromStorage = async () => {
      if (name && name.length > 0) return;
      try {
        const onboardingData = await storage.getItem(STORAGE_KEYS.ONBOARDING_DATA) || {};
        const candidate = onboardingData.fullName || onboardingData.full_name || onboardingData.name;
        if (candidate) setName(candidate);
      } catch (e) {
        // ignore
      }
    };
    fillFromStorage();
  }, []);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType?.Images ?? 'images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) return;

    const imageUri = result.assets[0].uri;

    try {
      setUploadingPhoto(true);
      const response = await profileService.uploadPhoto(user.id, imageUri);
      const nextAvatar = response?.avatar_url || response?.data?.avatar_url;

      if (nextAvatar) {
        setAvatarUrl(nextAvatar);
        const { data, error } = await supabase.auth.updateUser({
          data: {
            avatar_url: nextAvatar,
          },
        });

        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.warn('Failed to update profile photo:', error.message);
      Alert.alert('Error', error.message || 'Failed to update photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your display name');
      return;
    }

    try {
      setSaving(true);

      // Update Supabase auth user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          full_name: name.trim(),
          username: username.trim() || undefined,
        },
      });

      if (error) throw error;

      // Sync updated user into AppContext
      if (data?.user) {
        setUser(data.user);
      }

      // Also update backend profile if profileId available
      if (user?.id) {
        await profileService.updateUserProfile(user.id, {
          name: name.trim(),
        }).catch(() => {}); // non-blocking — backend may not have profile yet
      }

      Alert.alert('Saved', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.warn('Failed to update profile:', error.message);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = name.trim()
    ? name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity style={styles.avatar} onPress={handlePickPhoto} disabled={uploadingPhoto}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickPhoto} disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="camera" size={16} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text style={styles.fieldHint}>Used for your public profile</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{user?.email ?? '—'}</Text>
            </View>
            <Text style={styles.fieldHint}>Email cannot be changed here</Text>
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.privacyText}>
            Your information is encrypted and never shared without your consent
          </Text>
        </View>

        <View style={{ height: SPACING.xxxl }} />
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
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: COLORS.border },
  saveBtnText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.white },

  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.base, paddingTop: SPACING.xl },

  avatarSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 44 },
  avatarText: { fontSize: TYPOGRAPHY.xxl, fontWeight: '700', color: COLORS.white },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.background,
  },
  avatarHint: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '500' },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  field: { marginBottom: SPACING.base },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputDisabled: {
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  inputDisabledText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textTertiary,
  },
  fieldHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  privacyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

