/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Home,
  ShoppingBag,
  Heart,
  Package,
  FileText,
  ClipboardList,
  Bell,
  User,
} from 'lucide-react';
import { BuyerTab } from '../../pages/BuyerSpace';
import { BuyerType } from '../../UserContext';

export interface BuyerMenuItem {
  id: BuyerTab;
  label: string;
  icon: any;
  badge: string | null;
  visible: boolean;
}

export function getBuyerMenuItems({
  buyerType,
  favoritesCount,
  pendingQuotesCount,
  unreadNotificationsCount,
}: {
  buyerType: BuyerType;
  favoritesCount: number;
  pendingQuotesCount: number;
  unreadNotificationsCount: number;
}): BuyerMenuItem[] {
  const isGros = buyerType === 'gros';

  return [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, badge: null, visible: true },
    { id: 'catalog', label: 'Catalogue', icon: ShoppingBag, badge: null, visible: true },
    { id: 'favorites', label: 'Favoris', icon: Heart, badge: favoritesCount > 0 ? `${favoritesCount}` : null, visible: true },
    { id: 'orders', label: 'Mes commandes', icon: Package, badge: null, visible: true },
    { id: 'invoices', label: 'Mes factures', icon: FileText, badge: 'B2B', visible: isGros },
    {
      id: 'quotes',
      label: 'Demandes de devis',
      icon: ClipboardList,
      badge: pendingQuotesCount > 0 ? `${pendingQuotesCount}` : 'B2B',
      visible: isGros,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
      visible: true,
    },
    { id: 'profile', label: 'Mon profil', icon: User, badge: null, visible: true },
  ];
}
