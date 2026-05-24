import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PostComposer from '../../components/social/PostComposer';
import { COLORS } from '../../styles/theme';

export default function CreatePost({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <PostComposer
        onCancel={() => navigation.goBack()}
        onPostCreated={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 0 },
});
