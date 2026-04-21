import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { socialService } from '../../services/socialService';

export default function PostCard({ post, onLike, onComment, onShare, onPress }) {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

      if (newLiked) {
        await socialService.likePost(post.id);
      } else {
        await socialService.unlikePost(post.id);
      }

      onLike?.(post.id, newLiked);
    } catch (error) {
      // Revert on error
      setLiked(!liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
      console.error('Failed to like post:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return past.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(post)}
      activeOpacity={0.95}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: post.user?.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{post.user?.username || 'User'}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <View style={styles.imagesContainer}>
          {post.image_urls.slice(0, 4).map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={[
                styles.postImage,
                post.image_urls.length === 1 && styles.singleImage,
                post.image_urls.length === 2 && styles.doubleImage,
                post.image_urls.length > 2 && styles.gridImage,
              ]}
              resizeMode="cover"
            />
          ))}
          {post.image_urls.length > 4 && (
            <View style={styles.moreImagesOverlay}>
              <Text style={styles.moreImagesText}>+{post.image_urls.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={liked ? 'heart' : 'heart-outline'} 
            size={22} 
            color={liked ? COLORS.error : COLORS.textSecondary} 
          />
          <Text style={[styles.actionText, liked && styles.likedText]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onComment?.(post)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onShare?.(post)}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.shares_count || 0}</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  username: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  content: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  postImage: {
    backgroundColor: COLORS.border,
  },
  singleImage: {
    width: '100%',
    height: 300,
  },
  doubleImage: {
    width: '50%',
    height: 200,
  },
  gridImage: {
    width: '50%',
    height: 150,
  },
  moreImagesOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '50%',
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  tag: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  likedText: {
    color: COLORS.error,
  },
  spacer: {
    flex: 1,
  },
});
