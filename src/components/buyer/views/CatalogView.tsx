/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSiteConfig } from '../../../SiteConfigContext';
import ProductCard from '../../ProductCard';

export const CatalogView: React.FC = () => {
  const { config } = useSiteConfig();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900">Catalogue Yolita</h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Tous les yaourts disponibles — cliquez sur le cœur pour ajouter à vos favoris.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {config.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
