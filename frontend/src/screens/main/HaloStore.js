import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

const CATEGORIES = ['All', 'Wellness', 'Pets', 'Baby', 'Home', 'Food'];

const PRODUCTS = [
  { id: '1', name: 'Halo Clean Label Multivitamin', category: 'Wellness', price: '$24.00', score: 92, icon: 'fitness-outline' },
  { id: '2', name: 'Pet Digestive Bites', category: 'Pets', price: '$18.00', score: 88, icon: 'paw-outline' },
  { id: '3', name: 'Baby Safe Wipes', category: 'Baby', price: '$14.00', score: 95, icon: 'happy-outline' },
  { id: '4', name: 'Kitchen Air Filter', category: 'Home', price: '$79.00', score: 90, icon: 'home-outline' },
  { id: '5', name: 'Organic Snack Pack', category: 'Food', price: '$12.50', score: 84, icon: 'nutrition-outline' },
  { id: '6', name: 'Skin Support Serum', category: 'Wellness', price: '$32.00', score: 86, icon: 'sparkles-outline' },
];

export default function HaloStore({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const filtered = useMemo(() => PRODUCTS.filter((item) => activeCategory === 'All' || item.category === activeCategory), [activeCategory]);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price.replace('$', '')), 0).toFixed(2);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Halo Official Store</Text>
          <Ionicons name="cart-outline" size={22} color={COLORS.textPrimary} />
        </View>

        <Card style={styles.heroCard} variant="elevated">
          <Text style={styles.heroKicker}>Curated health essentials</Text>
          <Text style={styles.heroTitle}>Shop by family, pets, and lifestyle.</Text>
          <Text style={styles.heroText}>Premium wellness products, household essentials, and clean-label picks in one place.</Text>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryPill, activeCategory === category && styles.categoryPillActive]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map((product) => {
            const inCart = cart.some((item) => item.id === product.id);
            return (
              <Card key={product.id} style={styles.productCard} variant="outlined">
                <View style={styles.productIcon}>
                  <Ionicons name={product.icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreValue}>{product.score}</Text>
                  <Text style={styles.scoreLabel}>clean score</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{product.price}</Text>
                  <Button
                    title={inCart ? 'Added' : 'Add'}
                    size="small"
                    variant={inCart ? 'secondary' : 'primary'}
                    onPress={() => setCart((prev) => inCart ? prev.filter((item) => item.id !== product.id) : [...prev, product])}
                  />
                </View>
              </Card>
            );
          })}
        </View>

        <Card style={styles.checkoutCard} variant="elevated">
          <View>
            <Text style={styles.checkoutTitle}>Cart</Text>
            <Text style={styles.checkoutText}>{cart.length} item{cart.length === 1 ? '' : 's'} · ${subtotal}</Text>
          </View>
          <Button title="Checkout" onPress={() => navigation.navigate('ShoppingList')} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', color: COLORS.textPrimary },
  heroCard: { marginTop: SPACING.sm, marginBottom: SPACING.base, padding: SPACING.lg },
  heroKicker: { color: COLORS.primary, fontWeight: '800', textTransform: 'uppercase', fontSize: TYPOGRAPHY.xs, letterSpacing: 0.8 },
  heroTitle: { marginTop: SPACING.xs, fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 32 },
  heroText: { marginTop: SPACING.sm, color: COLORS.textSecondary, lineHeight: 22 },
  categoryRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  categoryPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { color: COLORS.textSecondary, fontWeight: '700' },
  categoryTextActive: { color: COLORS.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  productCard: { width: '48%', padding: SPACING.md, minHeight: 210 },
  productIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  productName: { fontSize: TYPOGRAPHY.base, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 20 },
  productCategory: { marginTop: 4, color: COLORS.textTertiary, fontSize: TYPOGRAPHY.xs, textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreRow: { marginTop: SPACING.sm, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  scoreValue: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', color: COLORS.primary },
  scoreLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.xs, textTransform: 'uppercase' },
  priceRow: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: TYPOGRAPHY.base, fontWeight: '800', color: COLORS.textPrimary },
  checkoutCard: { marginTop: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkoutTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase' },
  checkoutText: { marginTop: 4, color: COLORS.textPrimary, fontWeight: '700' },
});
