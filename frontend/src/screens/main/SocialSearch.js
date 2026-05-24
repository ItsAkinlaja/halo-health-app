import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import PostCard from '../../components/social/PostCard';
import { socialService } from '../../services/socialService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

function PersonRow({ item, onPress }) {
  const initials = (item.username || item.halo_health_id || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.personRow} onPress={onPress} activeOpacity={0.8}>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.personAvatar} />
      ) : (
        <View style={styles.personAvatarFallback}>
          <Text style={styles.personAvatarText}>{initials}</Text>
        </View>
      )}
      <View style={styles.personInfo}>
        <Text style={styles.personName}>@{item.username || item.halo_health_id}</Text>
        <Text style={styles.personMeta}>{item.bio || 'Halo Health member'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

export default function SocialSearch({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [], groups: [] });
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const term = query.trim();
    if (!term) return;

    setLoading(true);
    try {
      const data = await socialService.searchDirectory(term, 20, 0);
      setResults(data);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Search</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, posts, hashtags, groups"
            placeholderTextColor={COLORS.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.searchButtonText}>Search Halo</Text>
              )}
            </TouchableOpacity>

            {!searched && !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles-outline" size={48} color={COLORS.primary} />
                <Text style={styles.emptyTitle}>Search the Halo directory</Text>
                <Text style={styles.emptyText}>
                  Look up a username, Halo Health ID, post keyword, hashtag, or group name.
                </Text>
              </View>
            ) : null}

            {results.users.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>People</Text>
                <Card style={styles.sectionCard}>
                  {results.users.map((item) => (
                    <PersonRow
                      key={item.id}
                      item={item}
                      onPress={() => navigation.navigate('UserProfile', { userId: item.id, user: item })}
                    />
                  ))}
                </Card>
              </View>
            ) : null}

            {results.posts.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Posts</Text>
                {results.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPress={() => navigation.navigate('PostDetails', { postId: post.id, post })}
                  />
                ))}
              </View>
            ) : null}

            {results.hashtags.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hashtags</Text>
                <View style={styles.tagRow}>
                  {results.hashtags.map((tag) => (
                    <View key={tag.id} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{tag.tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {results.groups.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Groups</Text>
                <Card style={styles.sectionCard}>
                  {results.groups.map((group) => (
                    <View key={group.id} style={styles.groupRow}>
                      <View style={styles.groupIcon}>
                        <Ionicons name="people" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{group.name}</Text>
                        <Text style={styles.personMeta}>{group.description || 'Community group'}</Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </View>
            ) : null}

            {searched && !loading && !results.users.length && !results.posts.length && !results.hashtags.length && !results.groups.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>Nothing found</Text>
                <Text style={styles.emptyText}>Try a different username, keyword, or hashtag.</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  iconBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  searchBar: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  content: { paddingHorizontal: SPACING.base },
  searchButton: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  searchButtonText: { color: COLORS.white, fontWeight: '800', fontSize: TYPOGRAPHY.base },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.base,
  },
  emptyTitle: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  emptyText: { marginTop: SPACING.xs, textAlign: 'center', color: COLORS.textSecondary, lineHeight: 22 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: '800', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.4 },
  sectionCard: { padding: 0 },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  personAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surfaceAlt },
  personAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: { color: COLORS.primary, fontWeight: '800' },
  personInfo: { flex: 1, marginLeft: SPACING.sm },
  personName: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
  personMeta: { marginTop: 2, fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary },
  postsWrap: { paddingHorizontal: SPACING.base },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tagPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
  },
  tagText: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.primary },
  groupRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  groupIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: SPACING.xl },
});
