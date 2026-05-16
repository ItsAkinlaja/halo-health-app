import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';
import api from '../../services/api';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/news');
      if (res.data && res.data.data) {
        setNews(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch news', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, item.type === 'recall' ? styles.badgeRecall : styles.badgeTrend]}>
          <Text style={styles.badgeText}>{item.type === 'recall' ? 'RECALL' : 'TREND'}</Text>
        </View>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.haloBox}>
        <Ionicons name="sparkles" size={16} color={COLORS.primary} style={styles.haloIcon} />
        <Text style={styles.haloCommentary}>
          <Text style={{fontWeight: 'bold'}}>Halo Says: </Text>
          {item.haloCommentary}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.readMore}
        onPress={() => item.url && item.url !== '#' && Linking.openURL(item.url)}
      >
        <Text style={styles.readMoreText}>Read Full Source</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Ingredient Trends & News</Text>
        <Text style={styles.headerSubtitle}>Curated based on your health profile</Text>
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeRecall: {
    backgroundColor: COLORS.error + '20',
  },
  badgeTrend: {
    backgroundColor: COLORS.info + '20',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  date: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  haloBox: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  haloIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  haloCommentary: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  }
});
