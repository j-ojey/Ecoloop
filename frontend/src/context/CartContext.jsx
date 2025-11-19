import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const STORAGE_KEY = 'ecoloop_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCart(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  const addToCart = (item) => {
    // Only allow items that are for sale and available
    if (item.priceType !== 'Sell' || item.status !== 'available') {
      toast.error('This item cannot be added to cart');
      return;
    }

    const existingItem = cart.find(i => i._id === item._id);
    if (existingItem) {
      toast.info('Item already in cart');
      return;
    }

    const newCart = [...cart, { ...item, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCart));
    toast.success('Added to cart! 🛒');
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(i => i._id !== itemId);
    setCart(newCart);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCart));
    toast.success('Removed from cart');
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    const newCart = cart.map(i => i._id === itemId ? { ...i, quantity } : i);
    setCart(newCart);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Cart cleared');
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    itemCount: cart.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
