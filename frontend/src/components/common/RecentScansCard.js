import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export function RecentScansCard({ scans, onViewAll, onScanPress }) {
  const renderScanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scanItem}
      onPress={() => onScanPress(item)}
    >
      <View style={styles.scanInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product?.name || 'Unknown Product'}
        </Text>
        <Text style={styles.scanTime}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[
          styles.score,
          item.score_given >= 80 ? styles.highScore :
          item.score_given >= 60 ? styles.mediumScore :
          styles.lowScore
        ]}>
          {item.score_given || 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Scans</Text>
        {scans.length > 3 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={scans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scanInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  scanTime: {
    fontSize: 12,
    color: '#666',
  },
  scoreContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  score: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  highScore: {
    color: '#4CAF50',
  },
  mediumScore: {
    color: '#FF9800',
  },
  lowScore: {
    color: '#F44336',
  },
});
