import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export function ProfileSelector({ profiles, activeProfile, onProfileChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Active Profile:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.profilesContainer}
      >
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={[
              styles.profileButton,
              activeProfile?.id === profile.id && styles.activeProfile,
            ]}
            onPress={() => onProfileChange(profile)}
          >
            <Text style={[
              styles.profileName,
              activeProfile?.id === profile.id && styles.activeProfileText,
            ]}>
              {profile.name || profile.first_name}
            </Text>
            <Text style={[
              styles.profileRelation,
              activeProfile?.id === profile.id && styles.activeProfileText,
            ]}>
              {profile.relationship}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  profilesContainer: {
    paddingRight: 16,
  },
  profileButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 80,
  },
  activeProfile: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileRelation: {
    fontSize: 12,
    color: '#666',
  },
  activeProfileText: {
    color: '#fff',
  },
});
