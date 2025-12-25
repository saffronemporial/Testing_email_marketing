/**
 * Favorites management utility functions
 */

import { storageUtils } from './storageUtils';

const FAVORITES_KEY = 'favorites';

export const favoritesUtils = {
  /**
   * Get all favorite product IDs
   * @returns {Array<string>} Array of product IDs
   */
  getFavorites: () => {
    return storageUtils.get(FAVORITES_KEY, []);
  },

  /**
   * Add product to favorites
   * @param {string} productId - Product ID to add
   * @returns {boolean} Success status
   */
  addFavorite: (productId) => {
    try {
      const favorites = favoritesUtils.getFavorites();
      
      // Check if already exists
      if (favorites.includes(productId)) {
        console.log('Product already in favorites');
        return true;
      }

      // Add to favorites
      favorites.push(productId);
      return storageUtils.set(FAVORITES_KEY, favorites);
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  },

  /**
   * Remove product from favorites
   * @param {string} productId - Product ID to remove
   * @returns {boolean} Success status
   */
  removeFavorite: (productId) => {
    try {
      const favorites = favoritesUtils.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== productId);
      return storageUtils.set(FAVORITES_KEY, updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  },

  /**
   * Toggle favorite status
   * @param {string} productId - Product ID to toggle
   * @returns {boolean} New favorite status (true if added, false if removed)
   */
  toggleFavorite: (productId) => {
    const isFavorite = favoritesUtils.isFavorite(productId);
    
    if (isFavorite) {
      favoritesUtils.removeFavorite(productId);
      return false;
    } else {
      favoritesUtils.addFavorite(productId);
      return true;
    }
  },

  /**
   * Check if product is in favorites
   * @param {string} productId - Product ID to check
   * @returns {boolean} True if favorite
   */
  isFavorite: (productId) => {
    const favorites = favoritesUtils.getFavorites();
    return favorites.includes(productId);
  },

  /**
   * Get count of favorites
   * @returns {number} Number of favorites
   */
  getFavoritesCount: () => {
    return favoritesUtils.getFavorites().length;
  },

  /**
   * Clear all favorites
   * @returns {boolean} Success status
   */
  clearFavorites: () => {
    return storageUtils.set(FAVORITES_KEY, []);
  }
};