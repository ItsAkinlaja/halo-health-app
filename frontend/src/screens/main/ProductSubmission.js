import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, RADIUS, SPACING } from '../../styles/theme';
import api from '../../services/api';

export default function ProductSubmission({ navigation }) {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');

  const handleSubmit = async () => {
    if (!productName || !brand) {
      Alert.alert('Error', 'Please fill in the product name and brand.');
      return;
    }
    
    try {
      const res = await api.post('/api/product-submissions', { productName, brand, barcode });
      Alert.alert('Success', 'Product submitted for review!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit product.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Submit a Product</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoUpload}>
          <Ionicons name="camera" size={48} color={COLORS.textTertiary} />
          <Text style={styles.photoText}>Tap to add photos of the product</Text>
          <Text style={styles.photoSubtext}>(Front label, ingredients list, and nutrition facts)</Text>
        </View>

        <Text style={styles.label}>Product Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Organic O-Ears"
          value={productName}
          onChangeText={setProductName}
        />

        <Text style={styles.label}>Brand</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Nature's Path"
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={styles.label}>Barcode (Optional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Scan or type barcode"
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit for Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: 'bold' },
  content: { padding: SPACING.md },
  photoUpload: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  photoText: { fontSize: TYPOGRAPHY.md, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },
  photoSubtext: { fontSize: TYPOGRAPHY.xs, color: COLORS.textTertiary, marginTop: SPACING.xs },
  label: { fontSize: TYPOGRAPHY.sm, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    fontSize: TYPOGRAPHY.md,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitText: { color: COLORS.white, fontWeight: 'bold', fontSize: TYPOGRAPHY.md }
});
