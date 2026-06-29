/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Check, Sparkles, CreditCard, ShoppingBag } from 'lucide-react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

export default function SidebarCart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setCartOpen, clearCart } = useCart();
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [receipt, setReceipt] = useState<any | null>(null);
  const navigate = useNavigate();

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate order placement
    const orderNumber = 'YL-' + Math.floor(Math.random() * 900000 + 100000);
    const orderReceipt = {
      orderNumber,
      items: [...cart],
      total: cartTotal,
      tax: cartTotal * 0.05,
      date: new Date().toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: { ...orderDetails }
    };

    setReceipt(orderReceipt);
    setIsSimulatingOrder(false);
    clearCart();
  };

  const closeSidebar = () => {
    setCartOpen(false);
    // Reset simulation details on close
    setTimeout(() => {
      setIsSimulatingOrder(false);
      setReceipt(null);
    }, 400);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-gray-900 z-50 cursor-pointer backdrop-blur-[2px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-subtle bg-primary-light/40 flex justify-between items-center relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  🌸 Votre panier Aliyota
                </h3>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">
                  Fraîcheur & Onctuosité locale
                </p>
              </div>
              <button
                onClick={closeSidebar}
                className="w-10 h-10 rounded-full border border-border-subtle bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-primary-dark transition-all cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {receipt ? (
                /* Interactive Simulated Success Receipt View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="w-16 h-16 bg-accent/30 text-mint-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/50 shadow-inner">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 pb-2 border-b border-dashed border-gray-200 uppercase tracking-tight">Commande validée !</h4>
                  
                  <div className="bg-secondary p-5 rounded-2xl text-left border border-border-subtle space-y-3 font-medium text-xs text-gray-600">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>N° Commande:</span>
                      <span className="text-primary-dark font-black">{receipt.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date de livraison:</span>
                      <span>Aujourd'hui, sous 24h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client:</span>
                      <span className="font-bold text-gray-800">{receipt.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Téléphone:</span>
                      <span>{receipt.customer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Destination:</span>
                      <span className="font-bold text-gray-800 text-right max-w-[180px] truncate" title={receipt.customer.address}>{receipt.customer.address}</span>
                    </div>
                  </div>

                  {/* Summary of what they bought */}
                  <div className="text-left space-y-2 border-t border-dashed border-gray-200 pt-4">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">Recapitulatif des flacons</p>
                    {receipt.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.quantity}x {item.name} ({item.selectedAroma})</span>
                        <span>{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-end">
                    <span className="text-xs text-gray-500 font-black uppercase tracking-widest">Total réglé (Simulé)</span>
                    <span className="text-2xl font-black text-primary-dark">{receipt.total.toLocaleString('fr-FR')} FCFA</span>
                  </div>

                  <div className="bg-primary-light/50 p-4 rounded-xl border border-primary/20 text-[10px] text-gray-550 leading-relaxed font-semibold italic text-left">
                    🌱 Merci pour votre achat ! Votre yaourt frais Aliyota est à présent de route sous température dirigée. Portez-vous bien !
                  </div>

                  <button
                    onClick={closeSidebar}
                    className="w-full bg-primary-dark text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary-dark/85 shadow-md flex items-center justify-center cursor-pointer"
                  >
                    Fermer le panier
                  </button>
                </motion.div>
              ) : isSimulatingOrder ? (
                /* Interactive Form View inside slide-over */
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleOrderSubmit}
                  className="space-y-6"
                >
                  <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Détails de simulation</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Saisissez vos coordonnées de livraison ci-dessous pour simuler instantanément la finalisation de votre commande Aliyota.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">Votre nom complet</label>
                      <input
                        type="text"
                        required
                        value={orderDetails.name}
                        onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border-input bg-white text-xs font-medium focus:ring-2 focus:ring-primary-dark outline-none"
                        placeholder="Mélanie Bernard"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">Téléphone de livraison</label>
                      <input
                        type="tel"
                        required
                        value={orderDetails.phone}
                        onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-border-input bg-white text-xs font-medium focus:ring-2 focus:ring-primary-dark outline-none"
                        placeholder="97 00 11 22"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">Adresse complète</label>
                      <textarea
                        required
                        rows={2}
                        value={orderDetails.address}
                        onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-border-input bg-white text-xs font-medium focus:ring-2 focus:ring-primary-dark outline-none resize-none"
                        placeholder="Quartier Fidjrossè, Cotonou, Bénin"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary p-4 rounded-xl border border-border-subtle flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary-dark" />
                    <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Mode : Simulation de paiement sécurisé
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border-subtle">
                    <button
                      type="submit"
                      className="w-full bg-primary-dark text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary-dark/85 shadow-md flex items-center justify-center cursor-pointer"
                    >
                      Valider ma commande ({cartTotal.toLocaleString('fr-FR')} FCFA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSimulatingOrder(false)}
                      className="w-full bg-white text-gray-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-gray-700 transition-colors text-center cursor-pointer"
                    >
                      Retour au panier
                    </button>
                  </div>
                </motion.form>
              ) : cart.length === 0 ? (
                /* Empty Basket */
                <div className="h-full flex flex-col justify-center items-center text-center py-20 space-y-4">
                  <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-primary-dark opacity-30" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-gray-800 tracking-tight">Votre bocal est vide</h4>
                  <p className="text-gray-400 text-xs font-medium max-w-xs leading-relaxed">
                    Parcourez notre gamme de yaourts bio veloutés aux vraies fraises et herbes sauvages pour y glisser un pot !
                  </p>
                </div>
              ) : (
                /* Cart Items List Area */
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider px-1">Articles ajoutés</p>
                  {cart.map((item) => (
                    <motion.div
                      layout
                      key={item.cartItemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-4 relative"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-primary-light border border-primary/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info & Subtotal details */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h5 className="font-extrabold text-sm text-gray-950 truncate uppercase tracking-tight">
                          {item.name}
                        </h5>
                        
                        {/* Selected Aroma block */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedFruits && item.selectedFruits.length > 0 ? (
                            item.selectedFruits.map((fruit, idx) => (
                              <span key={idx} className="inline-block bg-[#FFF5F0] text-[#1E3F37] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#E58C65]/20">
                                🍓 {fruit.split(' ')[0]}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block bg-accent/20 text-[#1E3F37] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-accent/25">
                              🌸 {item.selectedAroma}
                            </span>
                          )}
                          {item.selectedCapacity && (
                            <span className="inline-block bg-primary/25 text-[#1E3F37] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                              🥛 {item.selectedCapacity}
                            </span>
                          )}
                          {item.isDiy && (
                            <>
                              <span className="inline-block bg-[#F0F7F5] text-[#1E3F37] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#85C0B4]/30">
                                🥣 {item.selectedBase}
                              </span>
                              <span className="inline-block bg-[#FFF9E6] text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                                {item.isSweetened ? '🍯 Sucré Miel' : '🍃 Non Sucré'}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Stepper controls */}
                          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-border-subtle">
                            <button
                              onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white text-gray-500 rounded-md transition-all cursor-pointer hover:shadow-sm"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white text-gray-500 rounded-md transition-all cursor-pointer hover:shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-gray-800">
                              {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold">
                              {item.price.toLocaleString('fr-FR')} FCFA /u
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-350 hover:text-red-500 p-2 absolute top-2 right-2 transition-colors cursor-pointer"
                        title="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary (Sticky at bottom) */}
            {!receipt && cart.length > 0 && (
              <div className="p-6 border-t border-border-subtle bg-secondary/80 backdrop-blur-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                    <span>Sous-total</span>
                    <span className="text-gray-900 font-extrabold">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-black uppercase text-gray-900 tracking-tight">Total général</span>
                    <span className="text-2xl font-black text-primary-dark">
                      {cartTotal.toLocaleString('fr-FR')} <span className="text-xs font-black uppercase opacity-80">FCFA</span>
                    </span>
                  </div>
                </div>

                {isSimulatingOrder ? null : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => navigate('/commander') || closeSidebar()}
                      className="w-full py-4 border-2 border-primary-dark text-primary-dark font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary-light/50 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      En route (Livraison)
                    </button>
                    <button
                      onClick={() => setIsSimulatingOrder(true)}
                      className="w-full bg-primary-dark text-white py-4 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary-dark/85 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Simuler achat
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
