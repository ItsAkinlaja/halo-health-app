import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../styles/theme';
import { socialService } from '../../services/socialService';

export default function FollowButton({ userId, initialFollowing = false, onFollowChange, style }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handlePress = async () => {
    setLoading(true);
    try {
      const newFollowing = !following;
      setFollowing(newFollowing);

      if (newFollowing) {
        await socialService.followUser(userId);
      } else {
        await socialService.unfollowUser(userId);
      }

      onFollowChange?.(userId, newFollowing);
    } catch (error) {
      // Revert on error
      setFollowing(!following);
      console.error('Failed to update follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        following ? styles.followingButton : styles.followButton,
        style,
      ]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={following ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[
          styles.buttonText,
          following ? styles.followingText : styles.followText,
        ]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: COLORS.primary,
  },
  followingButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  followText: {
    color: COLORS.white,
  },
  followingText: {
    color: COLORS.textPrimary,
  },
});
