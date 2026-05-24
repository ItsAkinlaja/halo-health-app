import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Alert,
  FlatList, Image, Share, Dimensions, Modal,
  TouchableWithoutFeedback, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HaloCard } from '../../components/common/HaloCard';
import { ScoreBadge } from '../../components/common/HaloBadge';
import FollowButton from '../../components/social/FollowButton';
import { useAppContext } from '../../context/AppContext';
import { socialService } from '../../services/socialService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const TABS = ['Discover', 'Following'];
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16; // SPACING.base on each side + card padding
const IMAGE_WIDTH = SCREEN_WIDTH - CARD_PADDING * 4; // account for card margins + padding
const IMAGE_WIDTH_GRID = (IMAGE_WIDTH - 4) / 2; // 4px gap between grid images

const timeAgo = (ts) => {
  if (!ts) return 'now';
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

const getPostImages = (post) => {
  const rawImages = post.image_urls || post.images || [];
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

  const result = images
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url));

  return result;
};

const getAuthor = (post) => {
  const author = post.author || post.user || {};
  const name = author.name || author.display_name || author.full_name || author.username || author.halo_health_id || 'Halo Member';
  const handle = author.halo_health_id || author.username || 'halo-member';

  return {
    id: author.id || post.user_id,
    name,
    handle,
    avatarUrl: author.avatar_url || null,
    avatarColor: author.avatar_color || COLORS.primary,
  };
};

// Memoized Avatar component for better performance in lists
const Avatar = React.memo(({ initials, color, avatarUrl, size = 40 }) => {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
});

// ─── Apple-style action sheet ────────────────────────────────────────────────
const PostActionSheet = ({ visible, isOwn, onClose, onAction }) => {
  const ownActions = [
    { key: 'edit',   icon: 'create-outline',       label: 'Edit Post',    destructive: false },
    { key: 'delete', icon: 'trash-outline',         label: 'Delete Post',  destructive: true  },
    { key: 'share',  icon: 'arrow-redo-outline',    label: 'Share',        destructive: false },
  ];
  const otherActions = [
    { key: 'report', icon: 'flag-outline',          label: 'Report Post',  destructive: true  },
    { key: 'block',  icon: 'ban-outline',           label: 'Block User',   destructive: true  },
    { key: 'share',  icon: 'arrow-redo-outline',    label: 'Share',        destructive: false },
  ];
  const actions = isOwn ? ownActions : otherActions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>

      <View style={sheet.container}>
        {/* Action group */}
        <View style={sheet.group}>
          {actions.map((action, index) => (
            <React.Fragment key={action.key}>
              {index > 0 && <View style={sheet.separator} />}
              <TouchableOpacity
                style={sheet.row}
                onPress={() => { onClose(); onAction(action.key); }}
                activeOpacity={0.6}
              >
                <Text style={[sheet.rowLabel, action.destructive && sheet.rowLabelDestructive]}>
                  {action.label}
                </Text>
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={action.destructive ? COLORS.error : COLORS.textPrimary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Cancel */}
        <TouchableOpacity style={[sheet.group, sheet.cancelRow]} onPress={onClose} activeOpacity={0.6}>
          <Text style={sheet.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const sheet = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.base,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
  },
  group: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 17,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  rowLabel: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  rowLabelDestructive: {
    color: COLORS.error,
    fontWeight: '400',
  },
  cancelRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },
  cancelLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

// Image with error fallback
const PostImage = React.memo(({ uri, single }) => {
  const [error, setError] = useState(false);
  const imgStyle = single
    ? { width: IMAGE_WIDTH, height: Math.round(IMAGE_WIDTH / 1.25) }
    : { width: IMAGE_WIDTH_GRID, height: IMAGE_WIDTH_GRID };

  if (error) {
    return (
      <View style={[styles.postImage, imgStyle, styles.postImageError]}>
        <Ionicons name="image-outline" size={32} color={COLORS.textTertiary} />
        <Text style={styles.postImageErrorText}>Image unavailable</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      onError={(e) => {
        console.warn('[PostImage] Failed to load:', uri, e.nativeEvent?.error);
        setError(true);
      }}
      style={[styles.postImage, imgStyle]}
    />
  );
});

// Memoized PostCard for optimized list rendering
const PostCard = React.memo(({ post, activeTab, currentUserId, onLike, onSave, onComment, onShare, onMore, onFollowChange }) => {
  const scoreColor = post.score >= 60 ? COLORS.scoreExcellent : COLORS.scoreAvoid;
  const author = getAuthor(post);
  const initials = author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const postImages = getPostImages(post);
  const canFollowAuthor = activeTab === 'Discover' && author.id && author.id !== currentUserId;

  return (
    <HaloCard style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initials={initials} color={author.avatarColor} avatarUrl={author.avatarUrl} size={40} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{author.name}</Text>
          <Text style={styles.postHandle}>@{author.handle} · {timeAgo(post.created_at)}</Text>
        </View>
        {canFollowAuthor ? (
          <FollowButton
            userId={author.id}
            initialFollowing={!!post.is_following}
            onFollowChange={onFollowChange}
            style={styles.followButton}
          />
        ) : null}
        <TouchableOpacity style={styles.postMoreBtn} onPress={() => onMore(post)}>
          <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}

      {postImages.length > 0 ? (
        <View style={styles.postImages}>
          {postImages.map((uri, index) => (
            <PostImage
              key={`${index}`}
              uri={uri}
              single={postImages.length === 1}
            />
          ))}
        </View>
      ) : null}

      {post.post_type === 'scan' && post.product_score !== undefined && post.product_score !== null ? (
        <View style={[styles.scanResult, { borderLeftColor: scoreColor }]}>
          <View style={[styles.scanScoreBox, { backgroundColor: scoreColor + '18' }]}>
            <Text style={[styles.scanScoreNum, { color: scoreColor }]}>{post.product_score}</Text>
          </View>
          <View style={styles.scanInfo}>
            <Text style={styles.scanProductName}>{post.product_name || 'Product'}</Text>
            <ScoreBadge score={post.product_score} size="sm" />
          </View>
        </View>
      ) : null}

      {post.post_type === 'milestone' && post.health_score ? (
        <View style={styles.milestoneBanner}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.warning} />
          <Text style={styles.milestoneText}>Health Score: {post.health_score}</Text>
        </View>
      ) : null}

      {post.hashtags && post.hashtags.length > 0 ? (
        <View style={styles.tagRow}>
          {post.hashtags.map(tag => (
            <TouchableOpacity key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons
            name={post.is_liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.is_liked ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={[styles.actionCount, post.is_liked && { color: COLORS.error }]}>
            {post.likes_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(post)}>
          <Ionicons name="arrow-redo-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.shares_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onSave(post.id)}>
          <Ionicons
            name={post.is_saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={post.is_saved ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </HaloCard>
  );
});

export default function SocialFeed({ navigation }) {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('Discover');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [actionSheet, setActionSheet] = useState({ visible: false, post: null });
  const PAGE_SIZE = 10;

  const isMounted = React.useRef(true);
  const activeTabRef = React.useRef(activeTab);
  const offsetRef = React.useRef(0);
  const hasMoreRef = React.useRef(true);
  const loadingMoreRef = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Keep refs in sync so loadPosts always reads fresh values
  React.useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  React.useEffect(() => { offsetRef.current = offset; }, [offset]);
  React.useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  React.useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  const loadPosts = useCallback(async (isInitial = true) => {
    if (!isInitial && (!hasMoreRef.current || loadingMoreRef.current)) return;

    try {
      if (isInitial) {
        if (isMounted.current) {
          setLoading(true);
          setOffset(0);
          offsetRef.current = 0;
        }
      } else {
        if (isMounted.current) setLoadingMore(true);
      }

      const filter = activeTabRef.current === 'Following' ? 'following' : 'all';
      const currentOffset = isInitial ? 0 : offsetRef.current;

      const response = await socialService.getFeed(filter, PAGE_SIZE, currentOffset);
      const newPosts = response?.posts || [];

      if (!isMounted.current) return;

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === PAGE_SIZE);
      hasMoreRef.current = newPosts.length === PAGE_SIZE;
      const nextOffset = currentOffset + PAGE_SIZE;
      setOffset(nextOffset);
      offsetRef.current = nextOffset;
    } catch (error) {
      console.error('Failed to load posts:', error?.message || error);
      if (isInitial && isMounted.current) Alert.alert('Error', 'Failed to load community posts. Pull down to retry.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
        setRefreshing(false);
      }
    }
  }, []); // stable — reads from refs

  useEffect(() => {
    loadPosts(true);
  }, [activeTab]);

  // Reload feed when screen comes back into focus (e.g. after creating a post)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only reload if we already have data (i.e. not the initial load)
      if (!loading) {
        loadPosts(true);
      }
    });
    return unsubscribe;
  }, [navigation, loading]);

  const handleLike = useCallback(async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));

    try {
      if (post.is_liked) {
        await socialService.unlikePost(postId);
      } else {
        await socialService.likePost(postId);
      }
    } catch (error) {
      // Revert on error
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, is_liked: post.is_liked, likes_count: post.likes_count }
          : p
      ));
      console.error('Failed to like post:', error);
    }
  }, [posts]);

  const handleSave = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: !p.is_saved } : p));
  }, []);

  const handleComment = useCallback((post) => {
    navigation.navigate('PostDetails', { postId: post.id, post });
  }, [navigation]);

  const handleShare = useCallback(async (post) => {
    try {
      await Share.share({
        message: post.content || 'Check out this post on Halo Health!',
        title: 'Halo Health Post',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, []);

  const handleMore = useCallback((post) => {
    setActionSheet({ visible: true, post });
  }, []);

  const handleMoreAction = useCallback(async (key) => {
    const post = actionSheet.post;
    if (!post) return;
    const isOwn = post.user_id === user?.id || post.author?.id === user?.id || post.user?.id === user?.id;

    if (key === 'share') {
      handleShare(post);
    } else if (key === 'edit') {
      navigation.getParent()?.navigate('CreatePost', { editPost: post });
    } else if (key === 'delete') {
      Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await socialService.deletePost(post.id);
              setPosts(prev => prev.filter(p => p.id !== post.id));
            } catch {
              Alert.alert('Error', 'Failed to delete post.');
            }
          },
        },
      ]);
    } else if (key === 'report') {
      Alert.alert('Report Post', 'Why are you reporting this post?', [
        { text: 'Spam', onPress: () => submitReport(post.id, 'spam') },
        { text: 'Inappropriate content', onPress: () => submitReport(post.id, 'inappropriate') },
        { text: 'Misinformation', onPress: () => submitReport(post.id, 'misinformation') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (key === 'block') {
      const authorId = post.user_id || post.author?.id || post.user?.id;
      Alert.alert('Block User', "Block this user? You won't see their posts anymore.", [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block', style: 'destructive',
          onPress: async () => {
            try {
              await socialService.blockUser(authorId);
              setPosts(prev => prev.filter(p =>
                p.user_id !== authorId && p.author?.id !== authorId && p.user?.id !== authorId
              ));
              Alert.alert('Blocked', 'User has been blocked.');
            } catch {
              Alert.alert('Error', 'Failed to block user.');
            }
          },
        },
      ]);
    }
  }, [actionSheet.post, user, navigation, handleShare]);

  const submitReport = async (postId, reason) => {
    try {
      await socialService.reportPost(postId, reason);
      Alert.alert('Reported', "Thank you. We'll review this post.");
    } catch {
      Alert.alert('Error', 'Failed to submit report.');
    }
  };

  const handleFollowChange = useCallback((userId, following) => {
    setPosts(prev => prev.map(post => (
      post.user_id === userId || post.user?.id === userId || post.author?.id === userId
        ? { ...post, is_following: following }
        : post
    )));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(true);
  }, [loadPosts]);

  const onEndReached = useCallback(() => {
    loadPosts(false);
  }, [loadPosts]);

  const handleTabPress = useCallback((tab) => {
    if (tab === activeTabRef.current) return;
    activeTabRef.current = tab;
    setActiveTab(tab);
    setPosts([]);
    setOffset(0);
    offsetRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    setLoading(true);
    // Trigger load with new tab
    setTimeout(() => loadPosts(true), 0);
  }, [loadPosts]);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SocialSearch')}>
            <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.getParent()?.navigate('CreatePost')}>
            <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab ? styles.tabActive : null]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab ? styles.tabTextActive : null]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: SPACING.xxxl }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.textTertiary} />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>
          {activeTab === 'Following' 
            ? 'Follow users to see their posts here'
            : 'Be the first to share with the community'
          }
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {loading && !refreshing && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard 
              post={item} 
              activeTab={activeTab}
              currentUserId={user?.id}
              onLike={handleLike} 
              onSave={handleSave}
              onComment={handleComment}
              onShare={handleShare}
              onMore={handleMore}
              onFollowChange={handleFollowChange}
            />
          )}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
          ListEmptyComponent={renderEmpty()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.getParent()?.navigate('CreatePost')}>
        <Ionicons name="add" size={26} color={COLORS.white} />
      </TouchableOpacity>

      <PostActionSheet
        visible={actionSheet.visible}
        isOwn={
          actionSheet.post?.user_id === user?.id ||
          actionSheet.post?.author?.id === user?.id ||
          actionSheet.post?.user?.id === user?.id
        }
        onClose={() => setActionSheet({ visible: false, post: null })}
        onAction={handleMoreAction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.xs,
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1, paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '700' },

  postCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.base, padding: SPACING.base },
  postHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginBottom: SPACING.md,
  },
  postAuthorInfo: { flex: 1 },
  postAuthor: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  postHandle: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary },
  postMoreBtn: { padding: SPACING.xs },
  followButton: {
    minWidth: 86,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  postContent: {
    fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary,
    lineHeight: 24, marginBottom: SPACING.md,
  },
  postImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  postImage: {
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  postImageError: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postImageErrorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  postImageSingle: {
    width: '100%',
    aspectRatio: 1.25,
  },
  postImageGrid: {
    width: '48%',
    aspectRatio: 1,
  },

  scanResult: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
    borderLeftWidth: 3, gap: SPACING.md,
  },
  scanScoreBox: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  scanScoreNum: { fontSize: TYPOGRAPHY.lg, fontWeight: '800' },
  scanInfo: { flex: 1, gap: 4 },
  scanProductName: { fontSize: TYPOGRAPHY.base, fontWeight: '600', color: COLORS.textPrimary },

  milestoneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  milestoneText: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.warning },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  tag: { paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  tagText: { fontSize: TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '600' },

  postActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, padding: SPACING.sm,
  },
  actionCount: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.base,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.colored?.(COLORS.primary),
  },
});
