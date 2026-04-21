import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

import restaurantService from '../../services/restaurantService';

const MOCK_RESTAURANTS = [
  {
    id: '1',
    name: 'The Clean Kitchen',
    address: '123 Health St, Downtown',
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.8,
    priceRange: '$$',
    seedOilFree: true,
    organic: true,
    cuisineType: 'American',
    distance: '0.5 mi',
  },
  {
    id: '2',
    name: 'Pure Plate Bistro',
    address: '456 Wellness Ave',
    latitude: 37.7849,
    longitude: -122.4094,
    rating: 4.6,
    priceRange: '$$$',
    seedOilFree: true,
    organic: false,
    cuisineType: 'Mediterranean',
    distance: '1.2 mi',
  },
];

export default function RestaurantFinder({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    seedOilFree: true,
    organic: false,
    glutenFree: false,
    vegan: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.searchRestaurants({
        latitude: region.latitude,
        longitude: region.longitude,
        radius: 10,
        seedOilFree: filters.seedOilFree,
        organic: filters.organic,
        glutenFree: filters.glutenFree,
        vegan: filters.vegan,
        query: searchQuery
      });
      setRestaurants(data.length > 0 ? data : MOCK_RESTAURANTS);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setRestaurants(MOCK_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  };

  const searchHere = () => {
    loadRestaurants();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant Finder</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisine, location"
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              onPress={() => setSelectedRestaurant(restaurant)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Ionicons name="restaurant" size={20} color={COLORS.white} />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        <TouchableOpacity
          style={styles.searchHereButton}
          onPress={searchHere}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="refresh" size={18} color={COLORS.white} />
              <Text style={styles.searchHereText}>Search This Area</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {selectedRestaurant && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsInfo}>
              <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
              <Text style={styles.restaurantAddress}>{selectedRestaurant.address}</Text>
              <View style={styles.restaurantMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.rating}>{selectedRestaurant.rating}</Text>
                </View>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.priceRange}>{selectedRestaurant.priceRange}</Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.distance}>{selectedRestaurant.distance}</Text>
              </View>
              <View style={styles.badges}>
                {selectedRestaurant.seedOilFree && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Seed Oil Free</Text>
                  </View>
                )}
                {selectedRestaurant.organic && (
                  <View style={[styles.badge, styles.badgeSecondary]}>
                    <Text style={styles.badgeTextSecondary}>Organic</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedRestaurant(null)}
            >
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call-outline" size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  searchHereButton: {
    position: 'absolute',
    top: SPACING.base,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  searchHereText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.base,
  },
  detailsInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaSeparator: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
  },
  priceRange: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  distance: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  badgeSecondary: {
    backgroundColor: COLORS.primary + '20',
  },
  badgeTextSecondary: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
