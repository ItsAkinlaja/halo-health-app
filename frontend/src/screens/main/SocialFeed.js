import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Alert,
  FlatList,
  Image,
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

const getPostImages = (post) => {
  if (!Array.isArray(post.image_urls)) return [];

  return post.image_urls
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter(Boolean);
};

// Memoized Avatar component for better performance in lists
const Avatar = React.memo(({ initials, color, size = 40 }) => (
  <View style={[
    styles.avatar,
    { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
  ]}>
    <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
  </View>
));

// Memoized PostCard for optimized list rendering
const PostCard = React.memo(({ post, activeTab, currentUserId, onLike, onSave, onComment, onFollowChange }) => {
  const scoreColor = post.score >= 60 ? COLORS.scoreExcellent : COLORS.scoreAvoid;
  const author = post.author || post.user || {};
  const authorName = author.name || author.username || 'User';
  const authorId = author.id || post.user_id;
  const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarColor = author.avatar_color || COLORS.primary;
  const postImages = getPostImages(post);
  const canFollowAuthor = activeTab === 'Discover' && authorId && authorId !== currentUserId;

  return (
    <HaloCard style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initials={initials} color={avatarColor} size={40} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{authorName}</Text>
          <Text style={styles.postHandle}>@{author.username || 'user'} - {post.time_ago || 'now'}</Text>
        </View>
        {canFollowAuthor ? (
          <FollowButton
            userId={authorId}
            initialFollowing={!!post.is_following}
            onFollowChange={onFollowChange}
            style={styles.followButton}
          />
        ) : null}
        <TouchableOpacity style={styles.postMoreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content || ''}</Text>

      {postImages.length > 0 ? (
        <View style={styles.postImages}>
          {postImages.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={[
                styles.postImage,
                postImages.length === 1 ? styles.postImageSingle : styles.postImageGrid,
              ]}
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
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment(post.id)}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
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
  const PAGE_SIZE = 10;

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadPosts = useCallback(async (isInitial = true) => {
    if (!isInitial && (!hasMore || loadingMore)) return;

    try {
      if (isInitial) {
        if (isMounted.current) {
          setLoading(true);
          setOffset(0);
        }
      } else {
        if (isMounted.current) setLoadingMore(true);
      }

      const filter = activeTab === 'Following' ? 'following' : 'all';
      const currentOffset = isInitial ? 0 : offset;
      
      const response = await socialService.getFeed(filter, PAGE_SIZE, currentOffset);
      const newPosts = response.posts || [];
      
      if (!isMounted.current) return;

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === PAGE_SIZE);
      setOffset(currentOffset + PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load posts:', error);
      if (isInitial && isMounted.current) Alert.alert('Error', 'Failed to load community posts');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [activeTab, offset, hasMore, loadingMore]);

  useEffect(() => {
    loadPosts(true);
  }, [activeTab]);

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

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostDetails', { postId });
  }, [navigation]);

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
    if (tab === activeTab) return;

    setActiveTab(tab);
    setPosts([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);
  }, [activeTab]);

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
