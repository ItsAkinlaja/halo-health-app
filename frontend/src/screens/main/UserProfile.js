import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import PostCard from '../../components/social/PostCard';
import { socialService } from '../../services/socialService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function UserProfile({ route, navigation }) {
  const { userId, user: initialUser } = route.params || {};
  const [user, setUser] = useState(initialUser || null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (userId) {
          const result = await socialService.getUserPosts(userId, 20, 0);
          if (active) setPosts(result.posts || []);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [userId]);

  const displayName = user?.username ? `@${user.username}` : user?.halo_health_id || 'Member';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={(
          <View style={styles.headerWrap}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.title}>Profile</Text>
              <View style={{ width: 22 }} />
            </View>

            <Card style={styles.profileCard} variant="elevated">
              <View style={styles.avatarWrap}>
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.bio}>{user?.bio || 'Halo Health community member'}</Text>
            </Card>

            <Text style={styles.sectionTitle}>Recent posts</Text>
          </View>
        )}
        renderItem={({ item }) => <PostCard post={item} onPress={() => navigation.navigate('PostDetails', { postId: item.id, post: item })} />}
        ListEmptyComponent={loading ? (
          <View style={styles.loading}><ActivityIndicator color={COLORS.primary} /></View>
        ) : (
          <View style={styles.empty}><Text style={styles.emptyText}>No posts yet.</Text></View>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  headerWrap: { marginBottom: SPACING.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  profileCard: { alignItems: 'center', paddingVertical: SPACING.xl, marginBottom: SPACING.lg },
  avatarWrap: { marginBottom: SPACING.md },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.surfaceAlt },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: TYPOGRAPHY.xxl, fontWeight: '800', color: COLORS.primary },
  name: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  bio: { marginTop: SPACING.xs, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { marginBottom: SPACING.sm, fontSize: TYPOGRAPHY.sm, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase' },
  loading: { paddingVertical: SPACING.xl },
  empty: { paddingVertical: SPACING.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary },
});
