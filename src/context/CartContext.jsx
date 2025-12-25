import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartUtils } from '../utils/cartUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadedCart = cartUtils.getCart();
    setCart(loadedCart);
  }, []);

  // Refresh cart from localStorage
  const refreshCart = () => {
    setCart(cartUtils.getCart());
  };

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    const updatedItem = cartUtils.addToCart(product, quantity);
    if (updatedItem) {
      refreshCart();
    }
    return updatedItem;
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    const success = cartUtils.updateQuantity(productId, quantity);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    const success = cartUtils.removeFromCart(productId);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // Increment quantity
  const incrementQuantity = (productId) => {
    const success = cartUtils.incrementQuantity(productId);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // Decrement quantity
  const decrementQuantity = (productId) => {
    const success = cartUtils.decrementQuantity(productId);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // Check if in cart
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Get cart item
  const getCartItem = (productId) => {
    return cart.find(item => item.id === productId) || null;
  };

  // Get cart count
  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Clear cart
  const clearCart = () => {
    const success = cartUtils.clearCart();
    if (success) {
      setCart([]);
    }
    return success;
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    isInCart,
    getCartItem,
    getCartCount,
    getCartTotal,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};