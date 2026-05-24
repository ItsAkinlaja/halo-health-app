import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostComposer from '../../components/social/PostComposer';
import { COLORS } from '../../styles/theme';

export default function CreatePost({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}> 
      <PostComposer
        onCancel={() => navigation.goBack()}
        onPostCreated={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
});
