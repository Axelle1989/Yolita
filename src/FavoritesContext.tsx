/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './UserContext';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { customer } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!customer) {
      setFavoriteIds([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', customer.id);

    if (!error && data) {
      setFavoriteIds(data.map((f) => f.product_id));
    }
    setLoading(false);
  }, [customer]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  const toggleFavorite = async (productId: string) => {
    if (!customer) return;

    const alreadyFavorite = favoriteIds.includes(productId);

    // Mise à jour optimiste de l'affichage
    setFavoriteIds((prev) =>
      alreadyFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    if (alreadyFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', customer.id)
        .eq('product_id', productId);
      if (error) await loadFavorites(); // rollback en cas d'échec
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: customer.id, product_id: productId });
      if (error) await loadFavorites(); // rollback en cas d'échec
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
