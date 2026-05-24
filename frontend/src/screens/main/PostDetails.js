import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  Image, TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { socialService } from '../../services/socialService';
import { useAppContext } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

// ─── helpers ────────────────────────────────────────────────────────────────

const getPostImages = (post) => {
  const raw = post?.image_urls || post?.images || [];
  let images = raw;

  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t.startsWith('[')) {
      try { images = JSON.parse(t); } catch { images = [t]; }
    } else if (t.startsWith('{') && t.endsWith('}')) {
      images = t.slice(1, -1).split(',').map(u => u.replace(/^"|"$/g, '').trim());
    } else {
      images = [t];
    }
  }

  if (!Array.isArray(images)) return [];
  return images
    .map(img => (typeof img === 'string' ? img : img?.url))
    .filter(url => typeof url === 'string' && /^https?:\/\//i.test(url));
};

const getAuthor = (post) => {
  const a = post?.author || post?.user || {};
  return {
    name: a.name || a.display_name || a.full_name || a.username || a.halo_health_id || 'Halo Member',
    handle: a.halo_health_id || a.username || 'halo-member',
    avatarUrl: a.avatar_url || null,
  };
};

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
};

// ─── CommentItem ─────────────────────────────────────────────────────────────

function CommentItem({ comment, onReply, onDelete, currentUserId }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const author = comment.user || {};
  const name = author.name || author.username || author.halo_health_id || 'User';
  const handle = author.halo_health_id || author.username || '';

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount(c => next ? c + 1 : c - 1);
    try {
      next ? await socialService.likeComment(comment.id) : await socialService.unlikeComment(comment.id);
    } catch {
      setLiked(!next);
      setLikesCount(c => next ? c - 1 : c + 1);
    }
  };

  return (
    <View style={styles.commentRow}>
      {author.avatar_url ? (
        <Image source={{ uri: author.avatar_url }} style={styles.commentAvatar} />
      ) : (
        <View style={[styles.commentAvatar, styles.commentAvatarFallback]}>
          <Text style={styles.commentAvatarText}>{name[0]?.toUpperCase() || 'U'}</Text>
        </View>
      )}
      <View style={styles.commentBody}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentName}>{name}{handle ? <Text style={styles.commentHandle}> @{handle}</Text> : null}</Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{timeAgo(comment.created_at)}</Text>
          <TouchableOpacity onPress={handleLike} style={styles.commentAction}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? COLORS.error : COLORS.textTertiary} />
            {likesCount > 0 && <Text style={[styles.commentActionText, liked && { color: COLORS.error }]}>{likesCount}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onReply(comment)} style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
          {currentUserId === comment.user_id && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.commentAction}>
              <Text style={[styles.commentActionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function PostDetails({ route, navigation }) {
  const { postId, post: initialPost } = route.params || {};
  const { user } = useAppContext();

  const [post, setPost] = useState(initialPost || null);
  const [loadingPost, setLoadingPost] = useState(!initialPost);
  const [liked, setLiked] = useState(initialPost?.is_liked || false);
  const [likesCount, setLikesCount] = useState(initialPost?.likes_count || 0);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [posting, setPosting] = useState(false);

  // Load post
  useEffect(() => {
    if (initialPost) {
      setLiked(initialPost.is_liked || false);
      setLikesCount(initialPost.likes_count || 0);
      return;
    }
    let active = true;
    (async () => {
      try {
        const result = await socialService.getPost(postId);
        const p = result?.post || result?.data?.post || result;
        if (active && p) {
          setPost(p);
          setLiked(p.is_liked || false);
          setLikesCount(p.likes_count || 0);
        }
      } catch (e) {
        console.error('Failed to load post:', e);
      } finally {
        if (active) setLoadingPost(false);
      }
    })();
    return () => { active = false; };
  }, [postId, initialPost]);

  // Load comments
  const loadComments = useCallback(async () => {
    const id = postId || initialPost?.id;
    if (!id) return;
    try {
      const result = await socialService.getComments(id);
      const list = result?.data?.comments || result?.comments || [];
      setComments(list);
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoadingComments(false);
    }
  }, [postId, initialPost?.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  // Like
  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount(c => next ? c + 1 : c - 1);
    try {
      next ? await socialService.likePost(post?.id || postId) : await socialService.unlikePost(post?.id || postId);
    } catch {
      setLiked(!next);
      setLikesCount(c => next ? c - 1 : c + 1);
    }
  };

  // Share
  const handleShare = async () => {
    try {
      await Share.share({
        message: post?.content || 'Check out this post on Halo Health!',
        title: 'Halo Health Post',
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  // Post comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const id = post?.id || postId;
      const result = await socialService.createComment(id, newComment.trim(), replyingTo?.id || null);
      const created = result?.data?.comment || result?.comment || result;
      if (replyingTo) {
        await loadComments();
      } else {
        setComments(prev => [created, ...prev]);
      }
      setNewComment('');
      setReplyingTo(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to post comment.');
      console.error('Failed to post comment:', e);
    } finally {
      setPosting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await socialService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) {
      console.error('Failed to delete comment:', e);
    }
  };

  const postImages = getPostImages(post);
  const author = getAuthor(post || {});
  const initials = author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {loadingPost ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !post ? (
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>Post unavailable</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Post card ── */}
            <View style={styles.postCard}>
              {/* Author row */}
              <View style={styles.authorRow}>
                {author.avatarUrl ? (
                  <Image source={{ uri: author.avatarUrl }} style={styles.authorAvatar} />
                ) : (
                  <View style={[styles.authorAvatar, styles.authorAvatarFallback]}>
                    <Text style={styles.authorAvatarText}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName}>{author.name}</Text>
                  <Text style={styles.authorHandle}>@{author.handle} · {timeAgo(post.created_at)}</Text>
                </View>
              </View>

              {/* Content */}
              {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}

              {/* Images */}
              {postImages.length > 0 && (
                <View style={styles.imagesContainer}>
                  {postImages.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri: encodeURI(uri) }}
                      style={[
                        styles.postImage,
                        postImages.length === 1 ? styles.imageSingle : styles.imageGrid,
                      ]}
                      resizeMode="cover"
                      onError={() => console.warn('Image load failed:', uri)}
                    />
                  ))}
                </View>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <View style={styles.tagsRow}>
                  {post.tags.map(tag => (
                    <Text key={tag} style={styles.tag}>#{tag}</Text>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={liked ? COLORS.error : COLORS.textSecondary}
                  />
                  <Text style={[styles.actionCount, liked && { color: COLORS.error }]}>
                    {likesCount > 0 ? likesCount : ''}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.actionCount}>
                    {comments.length > 0 ? comments.length : ''}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                  <Ionicons name="arrow-redo-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Comments ── */}
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments {comments.length > 0 ? `(${comments.length})` : ''}
              </Text>

              {loadingComments ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
              ) : comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubbles-outline" size={40} color={COLORS.textTertiary} />
                  <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
                </View>
              ) : (
                comments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={setReplyingTo}
                    onDelete={handleDeleteComment}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </View>
          </ScrollView>
        )}

        {/* ── Comment input ── */}
        {!loadingPost && post && (
          <View style={styles.inputWrapper}>
            {replyingTo && (
              <View style={styles.replyBanner}>
                <Text style={styles.replyBannerText}>
                  Replying to @{replyingTo.user?.halo_health_id || replyingTo.user?.username || 'user'}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
                placeholderTextColor={COLORS.textTertiary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!newComment.trim() || posting) && styles.sendBtnDisabled]}
                onPress={handlePostComment}
                disabled={!newComment.trim() || posting}
              >
                {posting
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Ionicons name="send" size={18} color={COLORS.white} />
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },

  scrollContent: { paddingBottom: SPACING.xl },

  // Post card
  postCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.base,
  },
  authorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  authorAvatar: { width: 44, height: 44, borderRadius: 22 },
  authorAvatarFallback: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  authorAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  authorName: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  authorHandle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: 2 },

  postContent: {
    fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary,
    lineHeight: 24, paddingHorizontal: SPACING.base, marginBottom: SPACING.sm,
  },

  imagesContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.base, gap: SPACING.xs, marginBottom: SPACING.sm,
  },
  postImage: { borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  imageSingle: { width: '100%', aspectRatio: 1.4 },
  imageGrid: { width: '48.5%', aspectRatio: 1 },

  tagsRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.base, gap: SPACING.xs, marginBottom: SPACING.sm,
  },
  tag: { fontSize: TYPOGRAPHY.sm, color: COLORS.primary, fontWeight: '600' },

  actionsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.lg,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: SPACING.xs },
  actionCount: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '600' },

  // Comments section
  commentsSection: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base },
  commentsTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.base },

  emptyComments: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyCommentsText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textTertiary },

  // Comment row
  commentRow: { flexDirection: 'row', marginBottom: SPACING.base, gap: SPACING.sm },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginTop: 2 },
  commentAvatarFallback: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.sm },
  commentBody: { flex: 1 },
  commentBubble: {
    backgroundColor: COLORS.surfaceAlt || COLORS.border + '40',
    borderRadius: RADIUS.md, padding: SPACING.sm,
    marginBottom: 4,
  },
  commentName: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  commentHandle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '400' },
  commentText: { fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary, lineHeight: 20 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.base, paddingLeft: SPACING.xs },
  commentTime: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  commentActionText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '500' },

  // Input
  inputWrapper: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: SPACING.sm,
  },
  replyBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 6,
    marginBottom: SPACING.xs,
  },
  replyBannerText: { fontSize: TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  input: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },
});
