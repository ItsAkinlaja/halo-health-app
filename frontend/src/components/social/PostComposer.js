import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { socialService } from '../../services/socialService';
import { api } from '../../services/api';

export default function PostComposer({ onPostCreated, onCancel, initialImages, onAttachImages }) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [images, setImages] = useState(() => (Array.isArray(initialImages) ? initialImages : [])); // [{ uri, caption }]
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!Array.isArray(initialImages)) return;

    // Prevent update loops when parent passes a new array identity on each render.
    setImages((prev) => {
      if (prev.length !== initialImages.length) return initialImages;
      const sameUris = prev.every((img, index) => img?.uri === initialImages[index]?.uri);
      return sameUris ? prev : initialImages;
    });
  }, [initialImages]);

  const handlePost = async () => {
    if (!content.trim() && !overlayText.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add text, a photo, or both');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrls = images.map(img => ({ url: img.uri, caption: img.caption || '' }));

      // If there are local URIs, upload them first
      const needsUpload = imageUrls.some(i => !i.url.startsWith('http'));
      if (needsUpload) {
        try {
          const form = new FormData();
          images.forEach((img, idx) => {
            const uri = img.uri;
            const filename = uri.split('/').pop() || `photo-${Date.now()}-${idx}.jpg`;
            form.append('images', { uri, name: filename, type: 'image/jpeg' });
          });

          const uploadRes = await api.post('/api/social/uploads/images', form);
          const returned = uploadRes?.data?.urls || uploadRes?.urls || [];
          if (!returned.length && images.length > 0) {
            throw new Error('Image upload failed. Please try again.');
          }
          imageUrls = images.map((img, idx) => ({ url: returned[idx] || img.uri }));
        } catch (uploadErr) {
          console.warn('Image upload failed:', uploadErr);
          throw uploadErr;
        }
      }

      const postData = {
        content: [content.trim(), overlayText.trim()].filter(Boolean).join('\n\n'),
        image_urls: imageUrls,
        is_public: isPublic,
        tags: extractHashtags(content),
      };

      const result = await socialService.createPost(postData);
      const createdPost = result?.post || result?.data?.post || result?.data || result;

      // Reset form
      setContent('');
      setOverlayText('');
      setImages([]);

      Alert.alert('Posted', 'Your post was published successfully.', [
        {
          text: 'OK',
          onPress: () => onPostCreated?.(createdPost),
        },
      ]);
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const handleAddImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to add an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType?.Images ?? 'images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (result.canceled) return;

    const nextImages = result.assets.map((asset) => ({ uri: asset.uri }));
    const combined = [...images, ...nextImages].slice(0, 4);
    setImages(combined);
    // notify parent (if present)
    onAttachImages?.(combined);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} disabled={isLoading}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Content Input */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.overlayInput}
          placeholder="Write on your image or add a short story note"
          placeholderTextColor={COLORS.textTertiary}
          multiline
          value={overlayText}
          onChangeText={setOverlayText}
          maxLength={240}
          autoFocus
        />

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textTertiary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={1000}
        />

        {/* Image Preview */}
        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Character Count */}
        <Text style={styles.charCount}>{content.length}/1000</Text>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddImage}>
            <Ionicons name="image-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionText}>Attach</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.privacyPill} onPress={() => setIsPublic(!isPublic)}>
            <Ionicons
              name={isPublic ? 'globe-outline' : 'lock-closed-outline'}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.privacyText}>{isPublic ? 'Public' : 'Private'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.postActionButton,
            (isLoading || (!content.trim() && images.length === 0 && !overlayText.trim())) && styles.postActionButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={isLoading || (!content.trim() && images.length === 0 && !overlayText.trim())}
        >
          <Text style={styles.postActionButtonText}>{isLoading ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    padding: SPACING.base,
  },
  contentContainer: {
    paddingBottom: SPACING.base,
  },
  input: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    minHeight: 120,
    marginTop: SPACING.md,
    textAlignVertical: 'top',
  },
  overlayInput: {
    padding: SPACING.md,
    minHeight: 90,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.base,
  },
  imageWrapper: {
    width: '48%',
    aspectRatio: 1,
    marginRight: '2%',
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  imageOverlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  imageOverlayText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.white,
    fontWeight: '600',
    lineHeight: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 999,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 6,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: '700',
  },
  postActionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minWidth: 96,
    alignItems: 'center',
  },
  postActionButtonDisabled: {
    opacity: 0.5,
  },
  postActionButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
  },
});
