/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  ShoppingBag, 
  Clock, 
  Heart, 
  Search, 
  User, 
  Truck, 
  Smile, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  ClipboardCheck,
  Package
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Order, StatusHistoryItem } from '../types';
import { supabase } from '../supabaseClient';

function mapDbOrder(row: any): Order {
  return {
    orderNumber: row.order_number,
    items: row.items,
    total: row.total,
    date: row.created_at,
    location: row.location,
    address: row.address,
    payment: row.payment,
    status: row.status,
    statusHistory: row.status_history || [],
    adminMessage: row.admin_message || '',
    clientMessage: row.client_message || '',
    // @ts-ignore id technique Supabase utile pour les updates
    _id: row.id,
  } as any;
}

export default function Confirmation() {
  const location = useLocation();
  const orderNumberFromState = location.state?.orderNumber;

  // Local state for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [clientComment, setClientComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Load orders on mount (Supabase RLS garantit qu'on ne reçoit QUE les
  // commandes appartenant à l'utilisateur connecté — sécurité par utilisateur)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) {
        setOrders([]);
        return;
      }

      const list = data.map(mapDbOrder);
      setOrders(list);

      if (orderNumberFromState) {
        const found = list.find((o) => o.orderNumber === orderNumberFromState);
        if (found) {
          setActiveOrder(found);
        }
      } else if (list.length > 0) {
        setActiveOrder(list[list.length - 1]);
      }
    })();
  }, [orderNumberFromState]);

  // Handle manual order search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) return;

    const cleanQuery = searchQuery.trim().toUpperCase();
    const found = orders.find((o) => o.orderNumber === cleanQuery || o.orderNumber.replace('YL-', '') === cleanQuery);

    if (found) {
      setActiveOrder(found);
      setFeedbackSent(false);
      setClientComment(found.clientMessage || '');
    } else {
      setSearchError('Aucune commande trouvée sous ce numéro. Réessayez avec un format "YL-XXXXXX".');
    }
  };

  // Select an order from history
  const selectOrder = (order: Order) => {
    setActiveOrder(order);
    setSearchError('');
    setFeedbackSent(false);
    setClientComment(order.clientMessage || '');
  };

  // Client finalizes order reception ("pour de bon")
  const finalizeOrder = async () => {
    if (!activeOrder) return;
    const target = activeOrder as any;

    const now = new Date().toISOString();
    const newHistory: StatusHistoryItem[] = [
      ...target.statusHistory,
      {
        status: 'completed',
        date: now,
        comment: clientComment.trim()
          ? `Le client a achevé sa commande pour de bon avec le message : "${clientComment.trim()}"`
          : "Le client a validé la réception finale et achevé sa commande avec succès ! 🎉",
      },
    ];
    const finalClientMessage = clientComment.trim() || 'Commande reçue parfaitement, merci Yolita !';

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        status_history: newHistory,
        client_message: finalClientMessage,
      })
      .eq('id', target._id);

    if (error) {
      setSearchError("Impossible d'enregistrer votre confirmation pour le moment. Réessayez.");
      return;
    }

    const updatedOrders = orders.map((o) =>
      o.orderNumber === activeOrder.orderNumber
        ? { ...o, status: 'completed' as const, statusHistory: newHistory, clientMessage: finalClientMessage }
        : o
    );
    setOrders(updatedOrders);

    const freshActive = updatedOrders.find((o) => o.orderNumber === activeOrder.orderNumber);
    if (freshActive) {
      setActiveOrder(freshActive);
    }

    setFeedbackSent(true);
  };

  // Helpers to check step states
  const getStepStatus = (step: 'pending' | 'validated' | 'delivered' | 'completed') => {
    if (!activeOrder) return 'inactive';
    
    const statuses = ['pending', 'validated', 'delivered', 'completed'];
    const activeIdx = statuses.indexOf(activeOrder.status);
    const stepIdx = statuses.indexOf(step);

    if (activeIdx >= stepIdx) {
      return 'completed';
    }
    if (activeIdx + 1 === stepIdx) {
      return 'active';
    }
    return 'inactive';
  };

  return (
    <div className="pt-36 pb-24 bg-[#FAFAF8] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Congratulation Banner (only shows when just checked out) */}
        {orderNumberFromState && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-600 rounded-[36px] p-8 md:p-10 text-white shadow-2xl mb-12 relative overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-9 h-9 text-emerald-100" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">
              Commande Confirmée !
            </h1>
            <p className="text-base font-extrabold text-emerald-100 max-w-lg mx-auto leading-relaxed">
              Merci pour votre confiance. Nos pâtissiers yaourtiers préparent votre recette artisanale au Bénin !
            </p>
            <div className="inline-block bg-white/15 px-6 py-2 rounded-full border border-white/20 mt-6 shadow-sm">
              <span className="font-black uppercase text-xs tracking-widest text-[#FFF]">
                N° de suivi : {orderNumberFromState}
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Tracking Panel */}
          <div className="lg:col-span-2 space-y-8">
            {activeOrder ? (
              <motion.div 
                layout
                className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-md text-left"
              >
                {/* Tracker Head */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-3 py-1 rounded-md border border-accent/20">
                      Suivi En Temps Réel
                    </span>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-2">
                      Commande {activeOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      Placée le : {new Date(activeOrder.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold">Montant Total à payer</p>
                    <p className="text-xl font-black text-[#1E3F37] mt-1">
                      {activeOrder.total.toLocaleString('fr-FR')} FCFA
                    </p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full inline-block mt-1 uppercase tracking-wider border border-emerald-100">
                      💰 {activeOrder.payment === 'CARD' ? 'Wave / Mobile Money' : 'PayPal'}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress Indicator (Vertical or Compact Stepper) */}
                <div className="relative pl-8 space-y-8">
                  <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-gray-150"></div>

                  {/* Step 1: Placed */}
                  <div className="relative">
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                      getStepStatus('pending') === 'completed' 
                        ? 'bg-[#1E3F37] border-white text-white shadow-sm' 
                        : 'bg-white border-gray-205 text-gray-400'
                    }`}>
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-extrabold uppercase text-xs tracking-wider text-gray-900 flex items-center gap-2">
                        <span>1. Commande enregistrée</span>
                        <span className="text-[8px] font-bold bg-[#EAFBF5] text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded">Reçue (Atelier)</span>
                      </h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1.5">
                        Votre commande est reçue et est en cours d'analyse pour validation par nos artisans.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Validated by Admin with personalized Message */}
                  <div className="relative">
                    {/* Visual dot */}
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                      getStepStatus('validated') === 'completed'
                        ? 'bg-[#1E3F37] border-white text-white shadow-sm'
                        : getStepStatus('validated') === 'active'
                          ? 'bg-amber-500 border-amber-200 text-white animate-pulse'
                          : 'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {getStepStatus('validated') === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold uppercase text-xs tracking-wider text-gray-900">
                        2. Validation & Message de l'Atelier
                      </h4>
                      
                      {activeOrder.status === 'pending' ? (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50/50 p-3 rounded-2xl border border-amber-100 mt-2">
                          ⏳ En attente de validation par l'administrateur. Restez connecté sur cette page.
                        </p>
                      ) : (
                        <div className="mt-3 bg-[#F0F7F5] rounded-3xl p-4 border border-emerald-150 relative">
                          <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            💬 Message envoyé par Yolita :
                          </p>
                          <p className="text-xs font-semibold text-gray-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-white">
                            "{activeOrder.adminMessage || 'Votre commande a été validée avec succès ! Les mélanges de yaourts moussés s\'annoncent merveilleux. Nous lançons la livraison.'}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Delivered (or transit) */}
                  <div className="relative">
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                      getStepStatus('delivered') === 'completed'
                        ? 'bg-[#1E3F37] border-white text-white'
                        : getStepStatus('delivered') === 'active'
                          ? 'bg-amber-500 border-amber-200 text-white animate-pulse'
                          : 'bg-white border-gray-250 text-gray-300'
                    }`}>
                      {getStepStatus('delivered') === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold uppercase text-xs tracking-wider text-gray-900">
                        3. Expédition & Livraison physique
                      </h4>
                      {getStepStatus('delivered') === 'completed' || activeOrder.status === 'delivered' || activeOrder.status === 'completed' ? (
                        <p className="text-xs text-emerald-800 font-bold bg-[#F4FAF8] border border-emerald-100 p-3 rounded-xl mt-2 flex items-center gap-2">
                          🚚 <span className="font-black">Statut :</span> Le livreur s'est présenté chez vous ou le colis a été distribué.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 font-medium mt-1">
                          Le colis isotherme premium sera envoyé dès que l’atelier aura achevé le brassage et la validation.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Finalize Receipts */}
                  <div className="relative">
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                      getStepStatus('completed') === 'completed'
                        ? 'bg-[#1E3F37] border-white text-white'
                        : 'bg-white border-gray-250 text-gray-300'
                    }`}>
                      {getStepStatus('completed') === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Smile className="w-3 h-3" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold uppercase text-xs tracking-wider text-gray-900">
                        4. Clôture de la Commande
                      </h4>
                      {activeOrder.status === 'completed' ? (
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-150 mt-3 text-left">
                          <div className="flex items-center gap-2 text-emerald-800 mb-1.5">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Achetée et finalisée !</span>
                          </div>
                          <p className="text-xs text-gray-600 font-bold">
                            Vous avez finalisé votre commande pour de bon ! Merci de faire vivre le circuit court local béninois.
                          </p>
                          {activeOrder.clientMessage && (
                            <div className="mt-3 bg-white p-2.5 rounded-lg border border-emerald-100 text-[11px] text-gray-500 italic">
                              Rappel de votre message : "{activeOrder.clientMessage}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 font-bold mt-1 leading-relaxed">
                          Dès réception de vos bocaux frais, cliquez sur le bouton ci-dessous pour achever la commande définitivement.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* INTERACTIVE COMPONENT FOR CLIENT "ACHEVER SA COMMANDE POUR DE BON" */}
                {activeOrder.status === 'delivered' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-10 bg-gradient-to-br from-[#FFF top-0] to-[#FAFAF5] border-2 border-dashed border-emerald-300 rounded-[28px] p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-emerald-800" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                      Achevez Votre Commande Pour De Bon 🎁
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold max-w-md mx-auto mt-1 leading-relaxed">
                      Nos yaourtières et livreurs ont déposé vos créations ! Laissez un dernier message amical ou une remarque pour clore la commande.
                    </p>

                    <div className="mt-5 max-w-md mx-auto space-y-3">
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={clientComment}
                          onChange={(e) => setClientComment(e.target.value)}
                          placeholder="Ex: Yaourt mangue et coco incroyable ! Livraison très rapide, merci Yolita."
                          className="w-full bg-white border border-gray-250 p-3 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37]"
                        />
                      </div>

                      <button
                        onClick={finalizeOrder}
                        className="w-full bg-[#1E3F37] hover:bg-[#1e3f37]/90 text-white font-black py-3 rounded-xl transition-all shadow-md text-xs uppercase tracking-widest"
                      >
                        ✓ Confirmer la réception & Achever la commande
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Recap of ordered items */}
                <div className="mt-10 border-t border-gray-100 pt-8">
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">
                    Contenu de votre panier
                  </h4>
                  <div className="space-y-3">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-extrabold text-gray-900 uppercase tracking-tight">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                              {item.quantity} pot(s) • {item.selectedCapacity || 'Standard'}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-gray-700">
                          {(item.price * item.quantity).toLocaleString('fr-FR')} F
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-md text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Aucune commande sélectionnée</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Saisissez un numéro de commande dans la colonne de droite pour suivre son avancement en direct.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Lookup and Past Orders */}
          <div className="space-y-8 text-left">
            
            {/* Search Panel */}
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-md">
              <h3 className="font-black text-base uppercase text-gray-900 tracking-tight flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-[#1E3F37]" /> Trouver une commande
              </h3>

              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: YL-578415"
                    className="w-full bg-gray-50 border border-gray-200 pl-4 pr-10 py-3 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                  />
                  <button 
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1E3F37]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {searchError && (
                  <p className="text-[10px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">
                    ⚠️ {searchError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#1E3F37] text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-[#1E3F37]/90 transition-all shadow-sm"
                >
                  Suivre la commande
                </button>
              </form>
            </div>

            {/* List of past local orders */}
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-md">
              <h3 className="font-black text-base uppercase text-gray-900 tracking-tight flex items-center gap-2 mb-4">
                <ClipboardCheck className="w-4 h-4 text-[#1E3F37]" /> Vos Commandes ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs font-semibold">
                  Aucune commande enregistrée localement dans votre navigateur.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {orders.map((order) => {
                    const isActive = activeOrder?.orderNumber === order.orderNumber;
                    
                    // Style by status
                    const statusObj = {
                      pending: { label: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                      validated: { label: 'Validée', color: 'bg-emerald-100 text-[#1E3F37] border-emerald-200' },
                      delivered: { label: 'Livrée !', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      completed: { label: 'Terminée ✓', color: 'bg-gray-100 text-gray-600 border-gray-200' }
                    }[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };

                    return (
                      <button
                        key={order.orderNumber}
                        onClick={() => selectOrder(order)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between gap-2 ${
                          isActive 
                            ? 'border-[#1E3F37] bg-emerald-50/20 shadow-xs' 
                            : 'border-border-subtle hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-gray-900">{order.orderNumber}</p>
                          <p className="text-[10px] text-gray-450 mt-1 font-semibold">
                            {order.items.length} pot(s) • {order.total.toLocaleString('fr-FR')} F
                          </p>
                        </div>

                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${statusObj.color}`}>
                          {statusObj.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assistance Card */}
            <div className="bg-[#1E3F37] text-white rounded-[32px] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <h4 className="font-extrabold uppercase text-xs tracking-widest text-accent mb-2">Service Client Yolita</h4>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mb-4">
                Une question sur la livraison pour de bon ou pour modifier un arôme de votre bocal ? Contactez notre standard :
              </p>
              <p className="font-extrabold text-sm tracking-tight text-white">📧 contact@yolita.fr</p>
            </div>

          </div>

        </div>

        {/* Global Redirect buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 bg-white/50 p-6 rounded-[28px] border border-gray-100 max-w-xl mx-auto">
          <Link
            to="/"
            className="w-full sm:w-auto bg-[#1E3F37] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-[#1E3F37]/95 transition-all shadow-md"
          >
            Retour au magasin
          </Link>
          <Link
            to="/produits"
            className="w-full sm:w-auto flex items-center justify-center text-gray-500 font-black uppercase tracking-widest text-xs hover:text-[#1E3F37] transition-all"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Link>
        </div>

      </div>
    </div>
  );
}
