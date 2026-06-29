/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from './types';
import { CAPACITIES as STATIC_CAPACITIES, CapacityOption } from './constants';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    aroma: string,
    quantity?: number,
    capacity?: string,
    isDiy?: boolean,
    diyDetails?: { base: string; isSweetened: boolean; price: number; fruits?: string[] },
    capacitiesList?: CapacityOption[]
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('yahouth_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('yahouth_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product,
    aroma: string,
    quantity = 1,
    capacity = 'Petit (125 ml)',
    isDiy = false,
    diyDetails?: { base: string; isSweetened: boolean; price: number; fruits?: string[] },
    capacitiesList: CapacityOption[] = STATIC_CAPACITIES
  ) => {
    const fruitsKeyPart = diyDetails?.fruits && diyDetails.fruits.length > 0
      ? diyDetails.fruits.join('-')
      : '';
    const key = isDiy
      ? `diy-${diyDetails?.base}-${aroma}-${fruitsKeyPart}-${capacity}-${diyDetails?.isSweetened ? 'sucre' : 'naturel'}`.toLowerCase().replace(/\s+/g, '-')
      : `${product.id}-${aroma}-${capacity}`.toLowerCase().replace(/\s+/g, '-');

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === key);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      let finalProduct = { ...product };
      
      if (isDiy && diyDetails) {
        const fruitsStr = diyDetails.fruits && diyDetails.fruits.length > 0
          ? `Mélange : ${diyDetails.fruits.join(' + ')}`
          : `Arôme ${aroma}`;
        finalProduct = {
          id: `diy-${Date.now()}`,
          name: `Yaourt Récré Aliyota (Création)`,
          price: diyDetails.price,
          description: `Base ${diyDetails.base}, ${fruitsStr}, ${diyDetails.isSweetened ? 'Sucré' : 'Non sucré'}.`,
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
          category: 'nature',
        };
      } else {
        // Adjust product price based on capacity option
        const capOption = capacitiesList.find((c) => c.name === capacity);
        if (capOption) {
          const rawPrice = product.price * capOption.priceFactor;
          // Round to nearest 50 for clean FCFA values and clamp to minimum of 500 FCFA
          finalProduct.price = Math.max(500, Math.round(rawPrice / 50) * 50);
        }
      }

      return [
        ...prev,
        {
          ...finalProduct,
          quantity,
          selectedAroma: aroma,
          cartItemId: key,
          selectedCapacity: capacity,
          isDiy,
          selectedBase: isDiy ? diyDetails?.base : undefined,
          isSweetened: isDiy ? diyDetails?.isSweetened : undefined,
          selectedFruits: isDiy ? diyDetails?.fruits : undefined,
        },
      ];
    });
    setCartOpen(true); // Open sidebar automatically for beautiful user response
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, setCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
