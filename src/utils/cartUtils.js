/**
 * Shopping cart management utility functions
 */

import { storageUtils } from './storageUtils';

const CART_KEY = 'cart';

export const cartUtils = {
  /**
   * Get all cart items
   * @returns {Array<Object>} Array of cart items
   */
  getCart: () => {
    return storageUtils.get(CART_KEY, []);
  },

  /**
   * Add product to cart
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to add (default: 1)
   * @returns {Object} Updated cart item
   */
  addToCart: (product, quantity = 1) => {
    try {
      const cart = cartUtils.getCart();
      
      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => item.id === product.id);

      if (existingItemIndex !== -1) {
        // Update quantity if exists
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].updatedAt = new Date().toISOString();
      } else {
        // Add new item
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.base_price || product.price || 0,
          quantity: quantity,
          image: product.image || product.images?.[0] || '',
          sku: product.sku || '',
          category: product.category || '',
          unit: product.unit || 'piece',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        cart.push(cartItem);
      }

      storageUtils.set(CART_KEY, cart);
      return cart.find(item => item.id === product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  },

  /**
   * Update cart item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {boolean} Success status
   */
  updateQuantity: (productId, quantity) => {
    try {
      const cart = cartUtils.getCart();
      const itemIndex = cart.findIndex(item => item.id === productId);

      if (itemIndex === -1) {
        console.error('Product not found in cart');
        return false;
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartUtils.removeFromCart(productId);
      }

      cart[itemIndex].quantity = quantity;
      cart[itemIndex].updatedAt = new Date().toISOString();
      
      return storageUtils.set(CART_KEY, cart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  },

  /**
   * Remove product from cart
   * @param {string} productId - Product ID to remove
   * @returns {boolean} Success status
   */
  removeFromCart: (productId) => {
    try {
      const cart = cartUtils.getCart();
      const updatedCart = cart.filter(item => item.id !== productId);
      return storageUtils.set(CART_KEY, updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  },

  /**
   * Check if product is in cart
   * @param {string} productId - Product ID to check
   * @returns {boolean} True if in cart
   */
  isInCart: (productId) => {
    const cart = cartUtils.getCart();
    return cart.some(item => item.id === productId);
  },

  /**
   * Get cart item by product ID
   * @param {string} productId - Product ID
   * @returns {Object|null} Cart item or null
   */
  getCartItem: (productId) => {
    const cart = cartUtils.getCart();
    return cart.find(item => item.id === productId) || null;
  },

  /**
   * Get total number of items in cart
   * @returns {number} Total items count
   */
  getCartCount: () => {
    const cart = cartUtils.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  /**
   * Get total price of cart
   * @returns {number} Total price
   */
  getCartTotal: () => {
    const cart = cartUtils.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  /**
   * Clear entire cart
   * @returns {boolean} Success status
   */
  clearCart: () => {
    return storageUtils.set(CART_KEY, []);
  },

  /**
   * Increment cart item quantity
   * @param {string} productId - Product ID
   * @returns {boolean} Success status
   */
  incrementQuantity: (productId) => {
    const item = cartUtils.getCartItem(productId);
    if (!item) return false;
    return cartUtils.updateQuantity(productId, item.quantity + 1);
  },

  /**
   * Decrement cart item quantity
   * @param {string} productId - Product ID
   * @returns {boolean} Success status
   */
  decrementQuantity: (productId) => {
    const item = cartUtils.getCartItem(productId);
    if (!item) return false;
    return cartUtils.updateQuantity(productId, item.quantity - 1);
  }
};

