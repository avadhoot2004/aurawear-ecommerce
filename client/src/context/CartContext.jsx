import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState({
    items: [],
    summary: {
      totalItems: 0,
      totalOriginalPrice: 0,
      discountSavings: 0,
      subtotal: 0,
      shippingPrice: 0,
      taxPrice: 0,
      grandTotal: 0
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({
        items: [],
        summary: {
          totalItems: 0,
          totalOriginalPrice: 0,
          discountSavings: 0,
          subtotal: 0,
          shippingPrice: 0,
          taxPrice: 0,
          grandTotal: 0
        }
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCart(response.data.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, size, color, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your bag.');
      return false;
    }

    try {
      const response = await api.post('/cart', { productId, size, color, quantity });
      if (response.data.success) {
        setCart(response.data.data.cart);
        toast.success('Item added to your shopping bag.');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Could not add item to bag.');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/${itemId}`, { quantity });
      if (response.data.success) {
        setCart(response.data.data.cart);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Could not update item quantity.');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/${itemId}`);
      if (response.data.success) {
        setCart(response.data.data.cart);
        toast.info('Item removed from shopping bag.');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Could not remove item.');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart');
      if (response.data.success) {
        setCart(response.data.data.cart);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Could not clear shopping bag.');
      return false;
    }
  };

  const cartCount = cart?.summary?.totalItems || 0;

  const value = {
    cart,
    loading,
    cartCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
