import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { scanService } from '../../services/scanService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, getScoreColor } from '../../styles/theme';

export default function ScanHistory({ navigation }) {
  const { activeProfile } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeProfile?.id) {
      loadScanHistory();
    } else {
      setLoading(false);
    }
  }, [activeProfile]);

  const loadScanHistory = async () => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [scansData, statsData] = await Promise.all([
        scanService.getScanHistory(activeProfile.id, { limit: 50, offset: 0 }),
        scanService.getScanStats(activeProfile.id, '30d'),
      ]);
      setScans(scansData || []);
      setStats(statsData);
    } catch (error) {
      console.warn('Failed to load scan history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScanHistory();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={22} color={COLORS.textPrimary} />
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
            <Text style={styles.loadingText}>Loading scan history...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.total_scans || scans.length}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  {stats?.average_score || (scans.length > 0 ? Math.round(scans.reduce((sum, s) => sum + (s.score || 0), 0) / scans.length) : 0)}
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </Card>
            </View>

            {scans.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="scan-outline" size={64} color={COLORS.textTertiary} />
                <Text style={styles.emptyTitle}>No scans yet</Text>
                <Text style={styles.emptyText}>Start scanning products to see your history</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('Scanner')}
                >
                  <Text style={styles.emptyButtonText}>Scan Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              scans.map((scan) => (
                <Card
                  key={scan.id}
                  style={styles.scanCard}
                  onPress={() => navigation.navigate('ProductDetails', { 
                    productId: scan.product_id,
                    scanId: scan.id 
                  })}
                >
                  <View style={styles.scanContent}>
                    <View
                      style={[
                        styles.scoreCircle,
                        { backgroundColor: getScoreColor(scan.score || 0) + '15' },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: getScoreColor(scan.score || 0) }]}>
                        {scan.score || 0}
                      </Text>
                    </View>
                    <View style={styles.scanInfo}>
                      <Text style={styles.scanName}>{scan.product_name || 'Unknown Product'}</Text>
                      <Text style={styles.scanBrand}>
                        {scan.brand || 'Unknown'} · {scan.category || 'Product'}
                      </Text>
                      <Text style={styles.scanDate}>{formatDate(scan.created_at)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                  </View>
                </Card>
              ))
            )}
          </>
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
  filterBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  statCard: {
    flex: 1,
    padding: SPACING.base,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scanCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.base,
  },
  scanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  scanBrand: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  scanDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
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
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
});

