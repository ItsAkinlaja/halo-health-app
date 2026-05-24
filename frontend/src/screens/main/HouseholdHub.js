import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { useAppContext } from '../../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';

export default function HouseholdHub({ navigation }) {
  const { profiles, activeProfile } = useAppContext();

  const totalMembers = profiles?.length || 0;
  const pets = (profiles || []).filter((profile) => profile.member_type === 'pet').length;
  const people = totalMembers - pets;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Household</Text>
          <View style={{ width: 22 }} />
        </View>

        <Card style={styles.hero} variant="elevated">
          <Text style={styles.heroKicker}>Your shared health space</Text>
          <Text style={styles.heroTitle}>{activeProfile?.name || 'Household overview'}</Text>
          <Text style={styles.heroText}>Track people, pets, and the habits that keep everyone safer.</Text>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statValue}>{people}</Text>
            <Text style={styles.statLabel}>people</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statValue}>{pets}</Text>
            <Text style={styles.statLabel}>pets</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statValue}>{totalMembers}</Text>
            <Text style={styles.statLabel}>members</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.memberList}>
          {(profiles || []).map((profile) => {
            const initials = (profile.name || 'U')
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card key={profile.id} style={styles.memberCard} variant="outlined">
                <View style={styles.memberAvatar}>
                  {profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.memberAvatarText}>{initials}</Text>
                  )}
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{profile.name}</Text>
                  <Text style={styles.memberMeta}>
                    {profile.member_type === 'pet' ? 'Pet profile' : profile.relationship || 'Family profile'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('FamilyProfiles')}>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Quick links</Text>
        <View style={styles.linkGrid}>
          {[
            { title: 'Family Profiles', icon: 'people-outline', screen: 'FamilyProfiles' },
            { title: 'Health Reports', icon: 'document-text-outline', screen: 'HealthReports' },
            { title: 'Home Audit', icon: 'home-outline', screen: 'HomeEnvironmentAudit' },
            { title: 'Scan History', icon: 'scan-outline', screen: 'ScanHistory' },
          ].map((item) => (
            <TouchableOpacity key={item.title} style={styles.linkCard} onPress={() => navigation.navigate(item.screen)}>
              <View style={styles.linkIcon}><Ionicons name={item.icon} size={18} color={COLORS.primary} /></View>
              <Text style={styles.linkTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  hero: { marginTop: SPACING.sm, marginBottom: SPACING.base, padding: SPACING.lg },
  heroKicker: { fontSize: TYPOGRAPHY.xs, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle: { marginTop: SPACING.xs, fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  heroText: { marginTop: SPACING.sm, color: COLORS.textSecondary, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
  statValue: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { marginTop: 4, color: COLORS.textSecondary, textTransform: 'uppercase', fontSize: TYPOGRAPHY.xs },
  sectionTitle: { marginTop: SPACING.sm, marginBottom: SPACING.sm, fontSize: TYPOGRAPHY.sm, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase' },
  memberList: { gap: SPACING.sm },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  memberAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 46, height: 46, borderRadius: 23 },
  memberAvatarText: { color: COLORS.primary, fontWeight: '800' },
  memberInfo: { flex: 1, marginLeft: SPACING.md },
  memberName: { fontSize: TYPOGRAPHY.base, fontWeight: '800', color: COLORS.textPrimary },
  memberMeta: { marginTop: 4, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm },
  linkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  linkCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  linkIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  linkTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.textPrimary },
});
