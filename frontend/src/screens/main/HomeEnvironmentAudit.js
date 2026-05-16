import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

const ROOMS = [
  { id: '1', name: 'Kitchen & Food', icon: 'restaurant-outline', scanned: 12, score: 85 },
  { id: '2', name: 'Bathroom & Personal Care', icon: 'water-outline', scanned: 5, score: 60 },
  { id: '3', name: 'Cleaning & Household', icon: 'home-outline', scanned: 0, score: null },
];

export default function HomeEnvironmentAudit({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Home Audit</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Overall Home Score</Text>
          <Text style={styles.scoreValue}>72</Text>
          <Text style={styles.scoreSubtext}>Out of 100 based on 17 products</Text>
        </View>

        <Text style={styles.sectionTitle}>Rooms to Audit</Text>
        {ROOMS.map(room => (
          <TouchableOpacity key={room.id} style={styles.roomCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={room.icon} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomStats}>
                {room.scanned} products scanned
              </Text>
            </View>
            <View style={[styles.roomScoreBadge, !room.score && { backgroundColor: COLORS.border }]}>
              <Text style={styles.roomScoreText}>{room.score || '-'}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.startBtn}>
          <Ionicons name="scan-circle" size={24} color={COLORS.white} style={{marginRight: 8}} />
          <Text style={styles.startText}>Start Scanning New Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  content: { padding: SPACING.md },
  scoreCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  scoreLabel: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  scoreValue: { fontSize: 48, fontWeight: 'bold', color: COLORS.warning },
  scoreSubtext: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: SPACING.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', marginBottom: SPACING.sm, color: COLORS.text },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  roomInfo: { flex: 1 },
  roomName: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', color: COLORS.text },
  roomStats: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 4 },
  roomScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomScoreText: { color: COLORS.white, fontWeight: 'bold' },
  startBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  startText: { color: COLORS.white, fontWeight: 'bold', fontSize: TYPOGRAPHY.md }
});
