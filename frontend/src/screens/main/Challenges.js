import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ProgressBarAndroid, ProgressViewIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';

const MOCK_CHALLENGES = [
  { id: '1', title: 'Seed Oil Free for 7 Days', progress: 0.7, daysLeft: 2 },
  { id: '2', title: 'Make 3 Clean Swaps', progress: 0.33, daysLeft: 5 },
  { id: '3', title: 'Home Audit Week', progress: 0, daysLeft: 6 },
];

export default function Challenges({ navigation }) {
  const renderProgressBar = (progress) => {
    if (Platform.OS === 'android') {
      return <ProgressBarAndroid styleAttr="Horizontal" progress={progress} color={COLORS.primary} />;
    }
    return <ProgressViewIOS progress={progress} progressTintColor={COLORS.primary} trackTintColor={COLORS.border} />;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.daysLeft}>{item.daysLeft}d left</Text>
      </View>
      <View style={styles.progressContainer}>
        {renderProgressBar(item.progress)}
      </View>
      <Text style={styles.progressText}>{Math.round(item.progress * 100)}% Complete</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Challenges</Text>
      </View>

      <View style={styles.streakCard}>
        <Ionicons name="flame" size={32} color={COLORS.error} />
        <View style={styles.streakInfo}>
          <Text style={styles.streakTitle}>14 Day Streak!</Text>
          <Text style={styles.streakSub}>You're on fire! Keep making clean choices.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Active Challenges</Text>
      <FlatList
        data={MOCK_CHALLENGES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  list: { padding: SPACING.md },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '50',
  },
  streakInfo: { marginLeft: SPACING.md, flex: 1 },
  streakTitle: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', color: COLORS.error },
  streakSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', marginLeft: SPACING.md, color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  challengeTitle: { fontSize: TYPOGRAPHY.md, fontWeight: 'bold', color: COLORS.text },
  daysLeft: { fontSize: TYPOGRAPHY.sm, color: COLORS.warning, fontWeight: '600' },
  progressContainer: { height: 10, marginBottom: 8 },
  progressText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, textAlign: 'right' }
});
