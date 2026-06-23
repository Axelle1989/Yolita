/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSiteConfig } from '../SiteConfigContext';
import ProductCard from '../components/ProductCard';

export default function Store() {
  const { config } = useSiteConfig();
  const products = config.products;

  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-black mb-6 uppercase tracking-tight text-gray-900"
          >
            La Gamme Yolita
          </motion.h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Chaque pot Yolita est préparé avec amour avec du bon lait bio, des fruits frais soigneusement sélectionnés et zéro sucre ajouté.
          </p>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-24 p-12 bg-primary-light border-4 border-primary/40 rounded-[40px] text-gray-800 overflow-hidden relative shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 yolita-pattern opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter text-primary-dark">Expédition & Fraîcheur</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-primary-dark rounded-full mr-4"></div>
                  <span className="font-extrabold text-sm uppercase tracking-wider text-gray-700">Livraison Cotonou (12h-24h) : 500 FCFA</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-primary-dark rounded-full mr-4"></div>
                  <span className="font-extrabold text-sm uppercase tracking-wider text-gray-700">Livraison Hors Cotonou (Calavi, Porto-Novo, etc.) : 1 500 FCFA</span>
                </li>
                <li className="flex items-center font-black text-primary-dark text-xl uppercase tracking-tight">
                  <div className="w-3.5 h-3.5 bg-accent/80 rounded-full mr-4 animate-ping"></div>
                  <span>OFFERTE dès 10 000 FCFA d'achat !</span>
                </li>
              </ul>
              <p className="text-gray-500 font-medium italic text-sm leading-relaxed">
                Afin de vous garantir une onctuosité parfaite, nos commandes sont expédiées sous chaîne du froid rigoureuse (2°C - 4°C). Remise de vos bocaux frais en main propre directement chez vous.
              </p>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600" 
                alt="Livraison Fraîcheur" 
                className="rounded-[32px] shadow-lg border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500 aspect-square object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
