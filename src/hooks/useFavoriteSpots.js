import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'calisthenics_favorite_spots';

export function useFavoriteSpots() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (spot, customName) => {
    setFavorites((prev) => {
      if (prev.some((s) => s.id === spot.id)) return prev;
      return [...prev, { ...spot, customName }];
    });
  };

  const removeFavorite = (spotId) => {
    setFavorites((prev) => prev.filter((s) => s.id !== spotId));
  };

  const isFavorite = (spotId) => favorites.some((s) => s.id === spotId);

  return { favorites, addFavorite, removeFavorite, isFavorite };
}