/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'yolita-fraise',
    name: 'Yolita Fraise Sauvage',
    price: 1500,
    description: 'Une onctuosité incomparable mariée aux éclats de fraises des bois bio cultivées localement.',
    image: '/images/yolita-fraise.jpeg',
    badge: 'Populaire',
    category: 'fruit',
    aromas: ['Fraise Sauvage', 'Nature', 'Framboise', 'Vanille Bio', 'Mangue'],
  },
  {
    id: 'yolita-framboise',
    name: 'Yolita Framboise & Rose',
    price: 1800,
    description: 'Une recette subtile mêlant framboises de saison gorgées de soleil et un délicat soupçon d\'eau de rose bio.',
    image: '/images/yolita-framboise.jpeg',
    badge: 'Nouveauté',
    category: 'fruit',
    aromas: ['Framboise & Rose', 'Nature', 'Fraise Sauvage', 'Vanille Bio', 'Mangue'],
  },
  {
    id: 'yolita-nature',
    name: 'Yolita Velouté Nature',
    price: 1200,
    description: 'Le goût pur d\'un yaourt brassé bio, issu de lait de pâturage sain, incroyablement doux et crémeux.',
    image: '/images/yolita-nature.jpeg',
    category: 'nature',
    aromas: ['Nature Étoilée', 'Vanille Bio', 'Fraise Sauvage', 'Framboise', 'Mangue'],
  },
  {
    id: 'yolita-menthe',
    name: 'Yolita Menthe Douce',
    price: 1500,
    description: 'La fraîcheur végétale inédite de feuilles de menthe douce doucement infusées dans notre crème de yaourt.',
    image: '/images/yolita-menthe.jpeg',
    badge: 'Édition Limitée',
    category: 'nature',
    aromas: ['Menthe Douce', 'Menthe-Fraise', 'Menthe-Citron'],
  },
  {
    id: 'pack-duo',
    name: 'Pack Duo Fruité (2 pots)',
    price: 3000,
    description: 'Un assortiment gourmand d\'un pot Fraise Sauvage et d\'un pot Framboise Rose pour doubler le plaisir velouté.',
    image: '/images/pack-duo.jpeg',
    badge: 'Offre Duo',
    category: 'pack',
    aromas: ['Duo Original (Fraise + Framboise)', 'Duo Pur Fruits', 'Duo Personnalisé'],
  },
  {
    id: 'pack-famille',
    name: 'La Collection Yolita (6 pots)',
    price: 8000,
    description: 'Notre collection d\'onctuosité : 2 Fraise, 2 Framboise Rose, 1 Menthe Douce et 1 Velouté Nature. Idéal pour partager.',
    image: '/images/pack-famille.jpeg',
    badge: 'Best-Seller',
    category: 'pack',
    aromas: ['Mélange Classique', '100% Fruits Sauvages', 'Sélection Chef', 'Sur-mesure'],
  },
];

export interface CapacityOption {
  id: string;
  name: string;
  volume: string;
  desc: string;
  priceFactor: number;
  customBasePrice: number;
}

export const CAPACITIES: CapacityOption[] = [
  { id: 'mini', name: 'Mini (10 ml)', volume: '10 ml', desc: 'idéal pour goûter enfant / dégustation', priceFactor: 0.15, customBasePrice: 500 },
  { id: 'petit', name: 'Petit (125 ml)', volume: '125 ml', desc: 'format individuel classique', priceFactor: 1.0, customBasePrice: 1200 },
  { id: 'moyen', name: 'Moyen (250 ml)', volume: '250 ml', desc: 'format snacking', priceFactor: 1.8, customBasePrice: 2200 },
  { id: 'grand', name: 'Grand (500 ml)', volume: '500 ml', desc: 'format familial / partage', priceFactor: 3.2, customBasePrice: 4000 },
  { id: 'tres_grand', name: 'Très grand (1 L)', volume: '1 L', desc: 'format économique / cuisine', priceFactor: 6.0, customBasePrice: 7500 },
];

export const DIY_BASES = [
  { id: 'nature', name: 'Nature classique', priceAdd: 0, desc: 'Velouté traditionnel sain' },
  { id: 'vegetal', name: 'Végétal local', priceAdd: 300, desc: 'Lait de coco ou soja régional' },
  { id: 'proteine', name: 'Protéiné vitalité', priceAdd: 400, desc: 'Enrichi pour enfants & sportifs' },
];

export const DIY_AROMAS = [
  { id: 'fraise', name: 'Fraise sauvage', priceAdd: 100 },
  { id: 'framboise', name: 'Framboise douce', priceAdd: 150 },
  { id: 'mangue', name: 'Mangue de Cotonou', priceAdd: 0 },
  { id: 'vanille', name: 'Vanille parfumée', priceAdd: 50 },
  { id: 'coco', name: 'Noix de Coco fraîche', priceAdd: 100 },
  { id: 'peche', name: 'Pêche veloutée', priceAdd: 100 },
  { id: 'citron', name: 'Citron vert pétillant', priceAdd: 50 },
];

export const DELIVERY_FEES = {
  COTONOU: 500,
  OUTSIDE: 1500,
  THRESHOLD_FREE: 10000,
};

