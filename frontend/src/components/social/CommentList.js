import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { socialService } from '../../services/socialService';

function CommentItem({ comment, onReply, onLike, onDelete, currentUserId }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleLike = async () => {
    try {
      const newLiked = !liked;
      setLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

      if (newLiked) {
        await socialService.likeComment(comment.id);
      } else {
        await socialService.unlikeComment(comment.id);
      }

      onLike?.(comment.id, newLiked);
    } catch (error) {
      setLiked(!liked);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
      console.error('Failed to like comment:', error);
    }
  };

  const loadReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    setLoadingReplies(true);
    try {
      const result = await socialService.getCommentReplies(comment.id);
      setReplies(result.data.replies);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(false);
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
    <View style={styles.commentItem}>
      <Image
        source={{ uri: comment.user?.avatar_url || 'https://via.placeholder.com/32' }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.user?.username || 'User'}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={handleLike} style={styles.commentAction}>
            <Ionicons 
              name={liked ? 'heart' : 'heart-outline'} 
              size={16} 
              color={liked ? COLORS.error : COLORS.textTertiary} 
            />
            {likesCount > 0 && (
              <Text style={[styles.commentActionText, liked && styles.likedText]}>
                {likesCount}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onReply(comment)} style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>

          {currentUserId === comment.user_id && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.commentAction}>
              <Text style={[styles.commentActionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Replies */}
        {comment.replies_count > 0 && (
          <TouchableOpacity onPress={loadReplies} style={styles.viewRepliesButton}>
            {loadingReplies ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.viewRepliesText}>
                {showReplies ? 'Hide' : 'View'} {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {showReplies && replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                currentUserId={currentUserId}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function CommentList({ postId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const result = await socialService.getComments(postId);
      setComments(result.data.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const result = await socialService.createComment(
        postId,
        newComment.trim(),
        replyingTo?.id
      );

      if (replyingTo) {
        // Refresh to show new reply
        await loadComments();
      } else {
        setComments(prev => [...prev, result.data.comment]);
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await socialService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onReply={setReplyingTo}
            onDelete={handleDeleteComment}
            currentUserId={currentUserId}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to @{replyingTo.user?.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.textTertiary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newComment.trim() || posting) && styles.sendButtonDisabled]}
            onPress={handlePostComment}
            disabled={!newComment.trim() || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.base,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SPACING.base,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  commentContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  commentUsername: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  commentTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  commentText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  commentActionText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  likedText: {
    color: COLORS.error,
  },
  deleteText: {
    color: COLORS.error,
  },
  viewRepliesButton: {
    marginTop: SPACING.xs,
  },
  viewRepliesText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: SPACING.sm,
    marginLeft: SPACING.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.base,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.base,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  replyingToText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
});
