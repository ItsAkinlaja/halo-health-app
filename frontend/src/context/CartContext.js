import React, { createContext, useContext, useEffect, useState } from 'react';
import storage, { STORAGE_KEYS } from '../utils/storage';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const stored = await storage.getItem(STORAGE_KEYS.CART);
      if (!mounted) return;
      setItems(stored || []);
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    storage.setItem(STORAGE_KEYS.CART, items);
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((p) => p.id !== productId));

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, it) => s + Number((it.price || '0').toString().replace('$', '')), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
