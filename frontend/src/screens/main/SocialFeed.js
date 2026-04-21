import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HaloCard } from '../../components/common/HaloCard';
import { ScoreBadge } from '../../components/common/HaloBadge';
import { useAppContext } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

// ---------------------------------------------------------------------------
// Mock data — replace with api.get('/api/community/posts') when backend ready
// ---------------------------------------------------------------------------
const MOCK_POSTS = [
  {
    id: '1',
    author: 'Sarah Chen',
    handle: '@sarahclean',
    initials: 'SC',
    avatarColor: '#4A90D9',
    time: '2h ago',
    type: 'scan',
    content: 'Just scanned this cereal my kids have been eating for years. Score: 6/100. Switching to a cleaner alternative immediately. The BHT alone is enough reason.',
    score: 6,
    productName: 'Fruity Protein Cereal',
    likes: 142,
    comments: 38,
    shares: 24,
    liked: false,
    saved: false,
    tags: ['CleanSwap', 'KidsHealth', 'SeedOilFree'],
  },
  {
    id: '2',
    author: 'Mike Johnson',
    handle: '@mikehealthcoach',
    initials: 'MJ',
    avatarColor: '#27AE60',
    time: '5h ago',
    type: 'milestone',
    content: 'My Health Score hit 85 this week. Started at 42 three months ago. The biggest change? Swapping seed oils and cutting processed cereals. Halo made it easy to see what was actually in my food.',
    score: 85,
    likes: 287,
    comments: 64,
    shares: 51,
    liked: false,
    saved: true,
    tags: ['HealthScore', 'CleanLiving', 'Progress'],
  },
  {
    id: '3',
    author: 'Emma Rodriguez',
    handle: '@emmaeats',
    initials: 'ER',
    avatarColor: '#8E44AD',
    time: '1d ago',
    type: 'tip',
    content: 'PSA: "Natural Flavors" on a label can legally mean over 100 different chemical compounds. Halo flags this on every scan. Always tap the ingredient to see what it actually means for your body.',
    likes: 523,
    comments: 89,
    shares: 201,
    liked: false,
    saved: false,
    tags: ['IngredientTruth', 'FoodLabel', 'KnowYourFood'],
  },
  {
    id: '4',
    author: 'David Park',
    handle: '@davidwellness',
    initials: 'DP',
    avatarColor: '#E67E22',
    time: '2d ago',
    type: 'scan',
    content: 'Scanned my protein powder and was surprised — score of 74. Clean ingredient list, no artificial sweeteners. This is my new go-to.',
    score: 74,
    productName: 'Whey Protein Isolate',
    likes: 98,
    comments: 21,
    shares: 15,
    liked: false,
    saved: false,
    tags: ['Fitness', 'CleanProtein'],
  },
];

const MOCK_STORIES = [
  { id: 'own', name: 'Your Story', initials: 'ME', avatarColor: COLORS.primary, isOwn: true },
  { id: '2', name: 'Sarah C.', initials: 'SC', avatarColor: '#4A90D9', hasNew: true },
  { id: '3', name: 'Mike J.', initials: 'MJ', avatarColor: '#27AE60', hasNew: true },
  { id: '4', name: 'Emma R.', initials: 'ER', avatarColor: '#8E44AD', hasNew: false },
  { id: '5', name: 'David P.', initials: 'DP', avatarColor: '#E67E22', hasNew: true },
];
// ---------------------------------------------------------------------------

const TABS = ['Discover', 'Following'];

function Avatar({ initials, color, size = 40 }) {
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function StoryCircle({ story }) {
  return (
    <TouchableOpacity style={styles.storyItem}>
      <View style={[styles.storyRing, story.hasNew && styles.storyRingActive]}>
        <Avatar initials={story.initials} color={story.avatarColor} size={52} />
        {story.isOwn && (
          <View style={styles.storyAddBtn}>
            <Ionicons name="add" size={10} color={COLORS.white} />
          </View>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
    </TouchableOpacity>
  );
}

function PostCard({ post, onLike, onSave }) {
  const scoreColor = post.score >= 60 ? COLORS.scoreExcellent : COLORS.scoreAvoid;

  return (
    <HaloCard style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initials={post.initials} color={post.avatarColor} size={40} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postHandle}>{post.handle} · {post.time}</Text>
        </View>
        <TouchableOpacity style={styles.postMoreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.type === 'scan' && post.score !== undefined && (
        <View style={[styles.scanResult, { borderLeftColor: scoreColor }]}>
          <View style={[styles.scanScoreBox, { backgroundColor: scoreColor + '18' }]}>
            <Text style={[styles.scanScoreNum, { color: scoreColor }]}>{post.score}</Text>
          </View>
          <View style={styles.scanInfo}>
            <Text style={styles.scanProductName}>{post.productName}</Text>
            <ScoreBadge score={post.score} size="sm" />
          </View>
        </View>
      )}

      {post.type === 'milestone' && (
        <View style={styles.milestoneBanner}>
          <Ionicons name="trophy-outline" size={18} color={COLORS.warning} />
          <Text style={styles.milestoneText}>Health Score: {post.score}</Text>
        </View>
      )}

      <View style={styles.tagRow}>
        {post.tags?.map(tag => (
          <TouchableOpacity key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked ? COLORS.error : COLORS.textSecondary}
          />
          <Text style={[styles.actionCount, post.liked && { color: COLORS.error }]}>
            {post.likes + (post.liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="arrow-redo-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionCount}>{post.shares}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onSave(post.id)}>
          <Ionicons
            name={post.saved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={post.saved ? COLORS.primary : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </HaloCard>
  );
}

export default function SocialFeed({ navigation }) {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('Discover');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Replace with real API call when community backend is ready
  // const loadPosts = async () => {
  //   const data = await api.get(`/api/community/posts?tab=${activeTab}`);
  //   setPosts(data.posts);
  // };

  const handleLike = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked } : p));
  }, []);

  const handleSave = useCallback((postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: await loadPosts();
    await new Promise(r => setTimeout(r, 600)); // remove when real API connected
    setRefreshing(false);
  }, [activeTab]);

  const userInitials = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'ME';

  const stories = [
    { ...MOCK_STORIES[0], initials: userInitials },
    ...MOCK_STORIES.slice(1),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbubbles-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Stories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
        >
          {stories.map(s => <StoryCircle key={s.id} story={s} />)}
        </ScrollView>

        {/* Posts */}
        {posts.map(post => (
          <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
        ))}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
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
  },
  tab: {
    flex: 1, paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  scroll: { flex: 1 },

  storiesRow: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    gap: SPACING.base,
  },
  storyItem: { alignItems: 'center', width: 64 },
  storyRing: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: COLORS.border,
    padding: 2, marginBottom: 4,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  storyRingActive: { borderColor: COLORS.primary },
  storyAddBtn: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.background,
  },
  storyName: {
    fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary,
    fontWeight: '500', textAlign: 'center',
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
  postContent: {
    fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary,
    lineHeight: 24, marginBottom: SPACING.md,
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
