import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { socialService } from '../../services/socialService';

export default function PostComposer({ onPostCreated, onCancel }) {
  const [content, setContent] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [images, setImages] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !overlayText.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add text, a photo, or both');
      return;
    }

    setIsLoading(true);
    try {
      const postData = {
        content: [content.trim(), overlayText.trim()].filter(Boolean).join('\n\n'),
        image_urls: images,
        is_public: isPublic,
        tags: extractHashtags(content),
      };

      const result = await socialService.createPost(postData);
      onPostCreated?.(result.data.post);
      
      // Reset form
      setContent('');
            setOverlayText('');
      setImages([]);
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (result.canceled) return;

    const nextImages = result.assets.map((asset) => asset.uri);
    setImages((prev) => [...prev, ...nextImages].slice(0, 4));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} disabled={isLoading}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePost} 
          disabled={isLoading || !content.trim()}
        >
          <Text style={[
            styles.postButton,
            (!content.trim() || isLoading) && styles.postButtonDisabled
          ]}>
            {isLoading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Input */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textTertiary}
          multiline
          value={content}
          onChangeText={setContent}
          maxLength={1000}
          autoFocus
        />

        <TextInput
          style={styles.overlayInput}
          placeholder="Write on your image or add a short story note"
          placeholderTextColor={COLORS.textTertiary}
          multiline
          value={overlayText}
          onChangeText={setOverlayText}
          maxLength={240}
        />

        {/* Image Preview */}
        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                {overlayText.trim() ? (
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageOverlayText} numberOfLines={3}>{overlayText.trim()}</Text>
                  </View>
                ) : null}
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
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleAddImage}
        >
          <Ionicons name="image-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsPublic(!isPublic)}
        >
          <Ionicons 
            name={isPublic ? 'globe-outline' : 'lock-closed-outline'} 
            size={24} 
            color={COLORS.primary} 
          />
          <Text style={styles.actionText}>
            {isPublic ? 'Public' : 'Private'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  postButton: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  postButtonDisabled: {
    color: COLORS.textTertiary,
  },
  content: {
    flex: 1,
    padding: SPACING.base,
  },
  input: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  overlayInput: {
    marginTop: SPACING.md,
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
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.xl,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
});
