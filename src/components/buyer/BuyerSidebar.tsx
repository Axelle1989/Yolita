/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { BuyerTab } from '../../pages/BuyerSpace';
import { BuyerType } from '../../UserContext';
import { getBuyerMenuItems } from './menuItems';

interface Props {
  activeTab: BuyerTab;
  setActiveTab: (tab: BuyerTab) => void;
  buyerType: BuyerType;
  favoritesCount: number;
  pendingQuotesCount: number;
  unreadNotificationsCount: number;
}

export const BuyerSidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  buyerType,
  favoritesCount,
  pendingQuotesCount,
  unreadNotificationsCount,
}) => {
  const isGros = buyerType === 'gros';
  const menuItems = getBuyerMenuItems({ buyerType, favoritesCount, pendingQuotesCount, unreadNotificationsCount });

  return (
    // Visible uniquement à partir de lg: — sur mobile/tablette, ce menu passe
    // par le bouton burger dans l'en-tête de l'espace acheteur (voir BuyerSpace.tsx).
    <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-gray-100 rounded-[28px] p-4 flex-col justify-between shadow-sm">
      <div>
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Menu Acheteur Yolita
        </div>

        <nav className="mt-1 space-y-1">
          {menuItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#1E3F37]/10 text-[#1E3F37]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E3F37]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#1E3F37] text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
          <div className="flex items-center gap-2 mb-1.5">
            {isGros ? (
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-700" />
                Compte Grossiste
              </span>
            ) : (
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                Compte Particulier
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-950/80 leading-relaxed mb-3 font-semibold">
            {isGros
              ? 'Vous commandez par gros volumes : demandez un devis sur-mesure et retrouvez vos factures ici.'
              : 'Vous achetez pour votre consommation. Pour commander par cartons ou palettes en tant que revendeur, contactez-nous pour passer en compte Grossiste.'}
          </p>
          {!isGros && (
            <a
              href="/contact"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <span>Devenir revendeur</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Frais 100% garanti • Chaîne du froid</span>
        </div>
      </div>
    </aside>
  );
};
