import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function DailyTipCard({ tip }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}> Halo </Text>
        <Text style={styles.title}>Daily Tip from Halo</Text>
      </View>
      
      <Text style={styles.tip}>{tip}</Text>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tip: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
