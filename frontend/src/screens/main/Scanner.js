import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';
import { scanService } from '../../services/scanService';
import { productService } from '../../services/productService';
import { useAppContext } from '../../context/AppContext';

const { width: W, height: H } = Dimensions.get('window');
const FRAME_SIZE = W * 0.72;

const SCAN_MODES = [
  { id: 'barcode', label: 'Barcode', icon: 'barcode-outline' },
  { id: 'photo', label: 'Photo', icon: 'camera-outline' },
  { id: 'search', label: 'Search', icon: 'search-outline' },
  { id: 'menu', label: 'Menu', icon: 'restaurant-outline' },
];

export default function Scanner({ navigation }) {
  const { activeProfile, profiles, setActiveProfile } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mode, setMode] = useState('barcode');
  const [searchQuery, setSearchQuery] = useState('');
  const [torch, setTorch] = useState(false);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode !== 'barcode') return undefined;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [mode, scanLineAnim]);

  useEffect(() => {
    if (!scanned) return undefined;

    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    return undefined;
  }, [scanned, pulseAnim]);

  const resolveScanProfile = useCallback(() => {
    if (activeProfile?.id) return activeProfile;
    return profiles.find((profile) => profile.is_primary) || profiles[0] || null;
  }, [activeProfile, profiles]);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    if (scanned || scanning) return;

    if (!data || data.startsWith('exp://') || data.startsWith('http://') || data.startsWith('https://')) {
      return;
    }

    setScanned(true);
    setScanning(true);
    Speech.speak('Analyzing product...', { language: 'en-US', pitch: 1.1, rate: 1.1 });

    try {
      if (data.length < 8) {
        Alert.alert('Invalid Barcode', 'Please try scanning again.');
        setScanned(false);
        setScanning(false);
        return;
      }

      const scanProfile = resolveScanProfile();

      if (!scanProfile?.id) {
        Alert.alert(
          'No Profile Available',
          'Create a family profile first so scans can be personalized.',
          [
            { text: 'Set Up Profile', onPress: () => navigation.navigate('FamilyProfiles') },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setScanned(false);
                setScanning(false);
              },
            },
          ]
        );
        return;
      }

      if (!activeProfile?.id) {
        setActiveProfile(scanProfile);
      }

      const result = await scanService.scanBarcode(data, scanProfile.id);

      setTimeout(() => {
        navigation.navigate('ProductDetails', {
          productId: result.product?.id,
          barcode: data,
          scanId: result.scan?.id,
        });
        setScanned(false);
        setScanning(false);
      }, 400);
    } catch (error) {
      console.warn('Barcode scan error:', error.message);
      Speech.speak('Unable to scan product.', { language: 'en-US' });
      Alert.alert('Scan Failed', error.message || 'Unable to scan product. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            setScanned(false);
            setScanning(false);
          },
        },
      ]);
    }
  }, [activeProfile, navigation, resolveScanProfile, scanned, scanning, setActiveProfile]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setScanning(true);
    Speech.speak('Searching...', { language: 'en-US', pitch: 1.1, rate: 1.1 });

    try {
      const results = await productService.searchProducts(searchQuery.trim());

      if (!results.length) {
        Speech.speak('No results found.', { language: 'en-US' });
        Alert.alert('No Results', 'No products found matching your search.');
        setScanning(false);
        return;
      }

      navigation.navigate('ProductDetails', {
        productId: results[0].id,
        barcode: results[0].barcode,
      });
      setSearchQuery('');
      setScanning(false);
    } catch (error) {
      console.warn('Search error:', error.message);
      Alert.alert('Search Failed', error.message || 'Unable to search products.');
      setScanning(false);
    }
  }, [navigation, searchQuery]);

  const handleMenuScan = useCallback(() => {
    navigation.navigate('RestaurantMenuScanner');
  }, [navigation]);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  const fallbackProfile = resolveScanProfile();
  const memberLabel = fallbackProfile?.member_type === 'pet'
    ? `${fallbackProfile.pet_type || 'Pet'} · ${fallbackProfile.name || 'Selected pet'}`
    : fallbackProfile?.name || 'Selected profile';
  const memberStatus = fallbackProfile
    ? 'Scan results will use this member\'s saved allergies and conditions.'
    : 'Add a family profile first so scans can be personalized.';

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={48} color={COLORS.textTertiary} />
        <Text style={styles.permissionText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={48} color={COLORS.error} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>Halo needs camera access to scan product barcodes and labels.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionBtn, { backgroundColor: COLORS.surfaceAlt, marginTop: SPACING.sm }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.permissionBtnText, { color: COLORS.textSecondary }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {(mode === 'barcode' || mode === 'photo' || mode === 'menu') && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={mode === 'barcode' ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'] } : undefined}
          onBarcodeScanned={mode === 'barcode' ? handleBarCodeScanned : undefined}
        />
      )}

      {mode !== 'search' && (
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
              {[
                { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
                { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
                { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
                { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
              ].map((corner, index) => (
                <View key={index} style={[styles.corner, corner]} />
              ))}
              {mode === 'barcode' && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]} />
              )}
              <View style={styles.centerDot} />
            </Animated.View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom} />
        </View>
      )}

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {mode === 'barcode' ? 'Scan Barcode' : mode === 'photo' ? 'Scan Label' : mode === 'menu' ? 'Scan Menu' : 'Search Product'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setTorch(!torch)}>
          <Ionicons name={torch ? 'flash' : 'flash-outline'} size={22} color={torch ? COLORS.warning : COLORS.white} />
        </TouchableOpacity>
      </SafeAreaView>

      {mode !== 'search' && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {mode === 'barcode'
              ? 'Point at any product barcode'
              : mode === 'photo'
                ? 'Photograph the ingredient label'
                : 'Point at the restaurant menu'}
          </Text>
        </View>
      )}

      <View style={styles.scanContextCard}>
        <View style={styles.scanContextHeader}>
          <View style={styles.scanContextIconWrap}>
            <Ionicons name={fallbackProfile?.member_type === 'pet' ? 'paw' : 'person'} size={16} color={COLORS.primary} />
          </View>
          <View style={styles.scanContextTextWrap}>
            <Text style={styles.scanContextLabel}>Scanning for</Text>
            <Text style={styles.scanContextTitle} numberOfLines={1}>{memberLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.scanContextAction}
            onPress={() => navigation.navigate('FamilyProfiles')}
            activeOpacity={0.85}
          >
            <Text style={styles.scanContextActionText}>Change</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.scanContextSub} numberOfLines={2}>{memberStatus}</Text>
      </View>

      {mode === 'search' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search product name or brand..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
              editable={!scanning}
            />
            {searchQuery.length > 0 && !scanning && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            )}
            {scanning && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={[styles.searchBtn, scanning && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={scanning}
            >
              {scanning ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.searchBtnText}>Search</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      )}

      <View style={styles.modeBar}>
        <View style={styles.modePill}>
          {SCAN_MODES.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modeBtn, mode === m.id && styles.modeBtnActive]}
              onPress={() => {
                if (m.id === 'menu') {
                  handleMenuScan();
                } else {
                  setMode(m.id);
                }
              }}
            >
              <Ionicons name={m.icon} size={16} color={mode === m.id ? COLORS.primary : COLORS.white} />
              <Text style={[styles.modeBtnText, mode === m.id && styles.modeBtnTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  permissionTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  permissionText: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  permissionBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full, marginTop: SPACING.base },
  permissionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },

  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayMiddle: { flexDirection: 'row', height: FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayBottom: { flex: 1.2, backgroundColor: 'rgba(0,0,0,0.65)' },

  scanFrame: { width: FRAME_SIZE, height: FRAME_SIZE, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: COLORS.primary },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: COLORS.primary, opacity: 0.9, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6 },
  centerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, opacity: 0.6 },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: TYPOGRAPHY.base, fontWeight: '700', color: COLORS.white },

  hintContainer: { position: 'absolute', top: H * 0.18, left: 0, right: 0, alignItems: 'center' },
  hintText: { fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '500', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },

  scanContextCard: {
    position: 'absolute',
    left: SPACING.base,
    right: SPACING.base,
    top: H * 0.14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.md,
  },
  scanContextHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  scanContextIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  scanContextTextWrap: { flex: 1 },
  scanContextLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  scanContextTitle: { fontSize: TYPOGRAPHY.md, color: COLORS.textPrimary, fontWeight: '700', marginTop: 1 },
  scanContextSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, lineHeight: 14, marginTop: 4, marginLeft: 46, marginRight: SPACING.xs },
  scanContextAction: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryLight },
  scanContextActionText: { fontSize: TYPOGRAPHY.xs, fontWeight: '700', color: COLORS.primary },

  searchContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.background, paddingTop: 100, paddingHorizontal: SPACING.base },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, gap: SPACING.sm, ...SHADOWS.sm },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.base, gap: SPACING.sm },
  searchBtnDisabled: { backgroundColor: COLORS.border },
  searchBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },

  modeBar: { position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' },
  modePill: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: RADIUS.full, padding: 4, gap: 2 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: 5 },
  modeBtnActive: { backgroundColor: COLORS.white },
  modeBtnText: { fontSize: TYPOGRAPHY.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  modeBtnTextActive: { color: COLORS.primary },
});
