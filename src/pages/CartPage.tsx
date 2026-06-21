/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { DELIVERY_FEES } from '../constants';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-24 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner">
            <ShoppingBag className="w-12 h-12 text-primary-dark opacity-40" />
          </div>
          <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter text-gray-900">Votre panier est vide</h1>
          <p className="text-gray-500 mb-10 font-medium">Il semble que vous n'ayez pas encore choisi vos délicieux yaourts bio Yolita.</p>
          <Link
            to="/produits"
            className="inline-flex items-center bg-primary-dark text-white px-10 py-5 rounded-full font-extrabold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20 animate-bounce"
          >
            Découvrir la boutique
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter text-gray-900 text-left">Votre Panier</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  layout
                  key={item.cartItemId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-[24px] shadow-sm border border-border-subtle flex items-center gap-6"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-primary-light">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">{item.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.selectedFruits && item.selectedFruits.length > 0 ? (
                        item.selectedFruits.map((fruit, idx) => (
                          <span key={idx} className="inline-block bg-[#FFF5F0] text-[#1E3F37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#E58C65]/20">
                            🍓 Fruit : {fruit.split(' ')[0]}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block bg-accent/20 text-[#1E3F37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-accent/25">
                          🌸 Arôme : {item.selectedAroma}
                        </span>
                      )}
                      {item.selectedCapacity && (
                        <span className="inline-block bg-primary/25 text-[#1E3F37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/30">
                          🥛 Format : {item.selectedCapacity}
                        </span>
                      )}
                      {item.isDiy && (
                        <>
                          <span className="inline-block bg-[#F0F7F5] text-[#1E3F37] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#85C0B4]/30">
                            🥣 Base : {item.selectedBase}
                          </span>
                          <span className="inline-block bg-[#FFF9E6] text-amber-850 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                            {item.isSweetened ? '🍯 Douceur : Sucré' : '🍃 Aucun sucre ajouté'}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-primary-dark font-black mb-4">{item.price.toLocaleString('fr-FR')} FCFA <span className="text-[10px] opacity-40">/ pot</span></p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-border-subtle">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-primary-dark rounded-lg transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-primary-dark rounded-lg transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-cart-bg p-8 rounded-[32px] shadow-sm border border-border-subtle sticky top-32 overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 yolita-pattern opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tight relative z-10 text-gray-900">Récapitulatif</h2>
              
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Sous-total</span>
                  <span className="text-gray-900 font-black">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Livraison</span>
                  <span className="italic opacity-60">Calculée à l'étape suivante</span>
                </div>
                <div className="cart-dash-border pt-8 mt-8 flex justify-between items-end border-t border-border-subtle">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total estimé</p>
                    <p className="text-3xl font-black text-primary-dark">{cartTotal.toLocaleString('fr-FR')} <span className="text-xs uppercase opacity-80 font-black">FCFA</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/commander')}
                className="w-full bg-primary-dark text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center relative z-10"
              >
                Valider la commande <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <Link
                to="/produits"
                className="block text-center mt-6 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors relative z-10"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
