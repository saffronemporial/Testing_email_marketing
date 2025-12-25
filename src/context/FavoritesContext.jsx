import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesUtils } from '../utils/favoritesUtils';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadedFavorites = favoritesUtils.getFavorites();
    setFavorites(loadedFavorites);
  }, []);

  // Add to favorites
  const addFavorite = (productId) => {
    const success = favoritesUtils.addFavorite(productId);
    if (success) {
      setFavorites(favoritesUtils.getFavorites());
    }
    return success;
  };

  // Remove from favorites
  const removeFavorite = (productId) => {
    const success = favoritesUtils.removeFavorite(productId);
    if (success) {
      setFavorites(favoritesUtils.getFavorites());
    }
    return success;
  };

  // Toggle favorite
  const toggleFavorite = (productId) => {
    const isNowFavorite = favoritesUtils.toggleFavorite(productId);
    setFavorites(favoritesUtils.getFavorites());
    return isNowFavorite;
  };

  // Check if favorite
  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Get favorites count
  const getFavoritesCount = () => {
    return favorites.length;
  };

  // Clear all favorites
  const clearFavorites = () => {
    const success = favoritesUtils.clearFavorites();
    if (success) {
      setFavorites([]);
    }
    return success;
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    clearFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};