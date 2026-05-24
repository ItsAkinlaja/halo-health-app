import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../../components/social/PostCard';
import { socialService } from '../../services/socialService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

const getPostImages = (post) => {
  const rawImages = post?.image_urls || post?.images || [];
  let images = rawImages;

  if (typeof rawImages === 'string') {
    const trimmed = rawImages.trim();

    if (trimmed.startsWith('[')) {
      try {
        images = JSON.parse(trimmed);
      } catch (error) {
        images = [trimmed];
      }
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      images = trimmed
        .slice(1, -1)
        .split(',')
        .map((url) => url.replace(/^"|"$/g, '').trim());
    } else {
      images = [trimmed];
    }
  }

  if (!Array.isArray(images)) return [];

  return images
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url));
};

export default function PostDetails({ route, navigation }) {
  const { postId, post: initialPost } = route.params || {};
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!postId || initialPost) return;
      try {
        const result = await socialService.getPost(postId);
        if (active) setPost(result.post || result);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [postId, initialPost]);

  const postImages = getPostImages(post);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Post</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : post ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PostCard post={post} />
          {postImages.length ? (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Media</Text>
              <View style={styles.mediaGrid}>
                {postImages.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    resizeMode="cover"
                    onError={(error) => console.warn('Failed to load post detail image:', uri, error.nativeEvent)}
                    style={styles.mediaImage}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>Post unavailable</Text>
          <Text style={styles.emptyText}>This post may have been removed or is no longer accessible.</Text>
        </View>
      )}
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
    paddingVertical: SPACING.sm,
  },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: SPACING.xl },
  mediaSection: { marginTop: SPACING.base, paddingHorizontal: SPACING.base },
  sectionTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: '800', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase' },
  mediaGrid: { gap: SPACING.sm },
  mediaImage: { width: '100%', height: 240, borderRadius: RADIUS.lg, backgroundColor: COLORS.surfaceAlt },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyTitle: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  emptyText: { marginTop: SPACING.xs, textAlign: 'center', color: COLORS.textSecondary, lineHeight: 22 },
});
