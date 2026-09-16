/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSiteConfig } from '../../../SiteConfigContext';
import { useFavorites } from '../../../FavoritesContext';
import { useCart } from '../../../CartContext';

export const FavoritesView: React.FC = () => {
  const { config } = useSiteConfig();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const favoriteProducts = config.products.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" /> Mes produits favoris
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Retrouvez ici vos yaourts préférés pour les recommander en un clic.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <Heart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500 mb-4">Aucun favori pour le moment.</p>
          <Link
            to="/produits"
            className="inline-block bg-[#1E3F37] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteProducts.map((p) => (
            <div key={p.id} className="bg-white flex items-center gap-3 border border-gray-100 rounded-2xl p-4 shadow-sm">
              <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 font-semibold">{p.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <button
                onClick={() => addToCart(p, p.aromas?.[0] || 'Nature', 1, 'Petit (125 ml)', false, undefined, config.capacities)}
                className="text-[10px] font-black uppercase tracking-widest bg-[#1E3F37] text-white px-3 py-2.5 rounded-xl whitespace-nowrap"
              >
                Recommander
              </button>
              <button
                onClick={() => toggleFavorite(p.id)}
                className="text-rose-400 hover:text-rose-600 p-1.5"
                title="Retirer des favoris"
              >
                <Heart className="w-4 h-4" fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
