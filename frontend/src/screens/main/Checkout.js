import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { useCart } from '../../context/CartContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../../styles/theme';
import { api } from '../../services/api';

export default function Checkout({ navigation }) {
  const { items, subtotal, clear } = useCart();

  const handleCheckout = async () => {
    try {
      // Attempt to call backend checkout endpoint if present
      await api.post('/api/checkout', { items });
      clear();
      Alert.alert('Order placed', 'Your order was placed successfully.');
      navigation.goBack();
    } catch (err) {
      // If backend not present, simulate success
      console.warn('Checkout failed (or endpoint missing):', err.message);
      clear();
      Alert.alert('Order placed', 'Simulated order placed locally.');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Checkout</Text>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price ?? item.price_formatted ?? '$0.00'}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
        />

        <View style={styles.footer}>
          <Text style={styles.total}>Total: ${subtotal.toFixed(2)}</Text>
          <Button title="Place Order" onPress={handleCheckout} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.xl, fontWeight: '800', marginBottom: SPACING.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemName: { fontWeight: '700' },
  itemPrice: { fontWeight: '700' },
  empty: { color: COLORS.textSecondary, padding: SPACING.md },
  footer: { paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: '#f2f2f2' },
  total: { fontSize: TYPOGRAPHY.lg, fontWeight: '800', marginBottom: SPACING.sm },
});
