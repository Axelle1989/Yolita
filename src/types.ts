/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  category: 'nature' | 'fruit' | 'pack';
  aromas?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedAroma: string;
  cartItemId: string;
  selectedCapacity?: string;
  isDiy?: boolean;
  selectedBase?: string;
  isSweetened?: boolean;
  selectedFruits?: string[];
}

export interface OrderDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  neighborhood: string;
  deliveryMethod: 'home' | 'pickup';
}

export interface StatusHistoryItem {
  status: 'pending' | 'validated' | 'delivered' | 'completed';
  date: string;
  comment: string;
}

export interface Order {
  orderNumber: string;
  items: CartItem[];
  total: number;
  date: string;
  location: [number, number];
  address: string;
  payment: 'CARD' | 'PAYPAL' | string;
  status: 'pending' | 'validated' | 'delivered' | 'completed';
  statusHistory: StatusHistoryItem[];
  adminMessage?: string;
  clientMessage?: string;
}
