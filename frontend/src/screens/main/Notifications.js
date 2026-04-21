import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { notificationService } from '../../services/notificationService';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';

export default function Notifications({ navigation }) {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data || []);
    } catch (error) {
      console.warn('Failed to load notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      await loadNotifications();
    } catch (error) {
      console.warn('Failed to mark all as read:', error.message);
    }
  };

  const handleNotificationPress = async (notif) => {
    if (!user?.id) return;

    try {
      if (!notif.is_read) {
        await notificationService.markAsRead(user.id, notif.id);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
      }

      if (notif.action_url) {
        // Navigate based on action_url
      }
    } catch (error) {
      console.warn('Failed to mark as read:', error.message);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'recall': return { icon: 'warning', color: COLORS.error };
      case 'insight': return { icon: 'bulb', color: COLORS.primary };
      case 'score': return { icon: 'trending-up', color: COLORS.success };
      case 'recommendation': return { icon: 'star', color: COLORS.accent };
      default: return { icon: 'notifications', color: COLORS.primary };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const iconData = getNotificationIcon(notif.type);
            return (
              <Card 
                key={notif.id} 
                style={styles.notifCard}
                onPress={() => handleNotificationPress(notif)}
              >
                <View style={styles.notifContent}>
                  <View style={[styles.iconWrap, { backgroundColor: iconData.color + '15' }]}>
                    <Ionicons name={iconData.icon} size={20} color={iconData.color} />
                  </View>
                  <View style={styles.notifText}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <Text style={styles.notifTime}>{formatTime(notif.created_at)}</Text>
                  </View>
                  {!notif.is_read && <View style={styles.unreadDot} />}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  markAllBtn: {
    paddingHorizontal: SPACING.sm,
  },
  markAllText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },
  notifCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.base,
  },
  notifContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    flex: 1,
  },
  notifTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.base,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.base,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
});

