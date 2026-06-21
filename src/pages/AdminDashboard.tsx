/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  Settings, 
  LogOut, 
  Edit3, 
  Save, 
  RefreshCw, 
  Check, 
  X, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  FileText,
  ClipboardList,
  Inbox,
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Trash2,
  Clock,
  ExternalLink,
  Smartphone,
  CheckSquare,
  User
} from 'lucide-react';
import { useProducts } from '../ProductContext';
import { Product, Order, StatusHistoryItem } from '../types';

export default function AdminDashboard() {
  const { products, updateProduct, resetProducts } = useProducts();
  
  // Credentials requested by the user
  const ADMIN_EMAIL = 'axo.hossou@epitech.eu';
  const ADMIN_PASSWORD = 'Alicemom19@';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('yolita_admin_logged') === 'true';
  });

  // Active view: 'orders' or 'products'
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Orders list and filtering
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'validated' | 'delivered' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Custom confirmation and message forms
  const [validationMessage, setValidationMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Product edit states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    description: '',
    badge: ''
  });
  
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load orders and select the first one if available
  useEffect(() => {
    if (isLoggedIn) {
      const list: Order[] = JSON.parse(localStorage.getItem('yolita_orders') || '[]');
      // Sort with newest orders first
      const sorted = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(sorted);
      if (sorted.length > 0 && !selectedOrder) {
        setSelectedOrder(sorted[0]);
      }
    }
  }, [isLoggedIn]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('yolita_admin_logged', 'true');
      triggerToast('Connexion réussie ! Bienvenue Espace Admin Yolita.');
    } else {
      setError('Identifiants admin incorrects. Réessayez.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('yolita_admin_logged');
    triggerToast('Espace administrateur déconnecté.');
  };

  // Status management workflow
  const validateOrder = (orderNum: string) => {
    const defaultMsg = "Votre yaourt moussé Yolita est en cours de brassage traditionnel ! Notre livreur se prépare.";
    const messageToSend = validationMessage.trim() || defaultMsg;

    const list: Order[] = JSON.parse(localStorage.getItem('yolita_orders') || '[]');
    const updated = list.map((o) => {
      if (o.orderNumber === orderNum) {
        const now = new Date().toISOString();
        return {
          ...o,
          status: 'validated' as const,
          adminMessage: messageToSend,
          statusHistory: [
            ...o.statusHistory,
            {
              status: 'validated' as const,
              date: now,
              comment: `Commande validée par l'Atelier. Message client envoyé : "${messageToSend}"`
            }
          ]
        };
      }
      return o;
    });

    localStorage.setItem('yolita_orders', JSON.stringify(updated));
    setOrders(updated);
    
    // Refresh selected order details
    const current = updated.find(o => o.orderNumber === orderNum);
    if (current) {
      setSelectedOrder(current);
    }

    setValidationMessage('');
    triggerToast(`Commande ${orderNum} validée, message envoyé !`);
  };

  const deliverOrder = (orderNum: string) => {
    const list: Order[] = JSON.parse(localStorage.getItem('yolita_orders') || '[]');
    const updated = list.map((o) => {
      if (o.orderNumber === orderNum) {
        const now = new Date().toISOString();
        return {
          ...o,
          status: 'delivered' as const,
          statusHistory: [
            ...o.statusHistory,
            {
              status: 'delivered' as const,
              date: now,
              comment: "Colis confié au service d'expédition express Yolita pour livraison immédiate."
            }
          ]
        };
      }
      return o;
    });

    localStorage.setItem('yolita_orders', JSON.stringify(updated));
    setOrders(updated);

    const current = updated.find(o => o.orderNumber === orderNum);
    if (current) {
      setSelectedOrder(current);
    }

    triggerToast(`Commande ${orderNum} expédiée avec succès !`);
  };

  const deleteOrder = (orderNum: string) => {
    if (!window.confirm(`Voulez-vous supprimer définitivement la commande ${orderNum} ?`)) {
      return;
    }

    const list: Order[] = JSON.parse(localStorage.getItem('yolita_orders') || '[]');
    const updated = list.filter(o => o.orderNumber !== orderNum);
    localStorage.setItem('yolita_orders', JSON.stringify(updated));
    setOrders(updated);

    if (selectedOrder?.orderNumber === orderNum) {
      setSelectedOrder(updated[0] || null);
    }
    triggerToast(`Commande ${orderNum} supprimée.`);
  };

  // Product edits logic
  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      badge: product.badge || ''
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
  };

  const saveEdit = (id: string) => {
    if (!editForm.name || !editForm.price || !editForm.image) {
      triggerToast('Erreur : Renseignez au moins le nom, le prix et l\'image.');
      return;
    }

    setSavingId(id);
    setTimeout(() => {
      const original = products.find(p => p.id === id);
      if (original) {
        const updated: Product = {
          ...original,
          name: editForm.name || original.name,
          price: Number(editForm.price) || original.price,
          image: editForm.image || original.image,
          description: editForm.description || original.description,
          badge: editForm.badge || undefined
        };
        updateProduct(updated);
        setEditingProductId(null);
        triggerToast('Produit mis à jour dans le catalogue !');
      }
      setSavingId(null);
    }, 400);
  };

  const handleReset = () => {
    resetProducts();
    setShowResetConfirm(false);
    triggerToast('Catalogue réinitialisé aux valeurs d\'origine.');
  };

  // Template message picker for fast responses
  const selectQuickMessage = (text: string) => {
    setValidationMessage(text);
  };

  // Filter orders by chosen status
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // KPI Calculations
  const countPending = orders.filter(o => o.status === 'pending').length;
  const countValidated = orders.filter(o => o.status === 'validated').length;
  const countDelivered = orders.filter(o => o.status === 'delivered').length;
  const countCompleted = orders.filter(o => o.status === 'completed').length;

  // Unauthorised view (login screen) with requested neutral email template placeholder
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-gradient-to-br from-[#FAFAF5] to-[#EAECE6] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-[#1E3F37] py-8 px-6 text-center text-white relative">
            <div className="absolute top-4 left-4 bg-white/10 w-9 h-9 rounded-full flex items-center justify-center">
              <span className="text-xl">🇧🇯</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Yolita Admin</h1>
            <p className="text-xs font-semibold text-emerald-100 mt-1">Gérez le catalogue et traitez les commandes</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Identifiant Administrateur</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-email@exemple.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Mot de Passe</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1E3F37] hover:bg-[#1E3F37]/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              <LogIn className="w-4 h-4" /> Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAFAF8]">
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1E3F37] text-white px-6 py-3 rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-emerald-500/20"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Panel */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-md mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#EAFBF5] text-[#1E3F37] flex items-center justify-center text-2xl font-bold border border-emerald-100">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2.5 py-0.5 rounded-md border border-accent/20">
                  Mode Administrateur
                </span>
                <span className="text-xs text-gray-400 font-bold">{email || ADMIN_EMAIL}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mt-1">
                Espace de Gestion Yolita 🇧🇯
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-5 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-orange-200 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" /> Reset Boutique
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-gray-200 shadow-xs"
            >
              <LogOut className="w-4 h-4" /> Quitter
            </button>
          </div>
        </div>

        {/* Global tab Switcher */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-black uppercase text-xs tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders' 
                ? 'border-[#1E3F37] text-[#1E3F37]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Commandes Reçues
            {orders.length > 0 && (
              <span className="bg-[#1E3F37] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 font-black uppercase text-xs tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products' 
                ? 'border-[#1E3F37] text-[#1E3F37]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" /> Catalogue Boutique
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          </button>
        </div>

        {/* Reset Confirmation Dialogue Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100 z-50"
            >
              <span className="text-4xl block mb-4">⚠️</span>
              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">Restaurer les Produits ?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
                Voulez-vous restaurer tous les noms de yaourts, prix et illustrations d’origine ? Cela écrasera toutes vos modifications actuelles.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* TAB 1: ORDERS INTERACTION AND VALIDATION CENTER */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* KPI STATS CARD ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Reçu</span>
                <p className="text-2xl font-black text-gray-900 mt-1">{orders.length}</p>
                <div className="text-[10px] text-gray-550 font-bold mt-1.5 flex items-center gap-1">
                  <Inbox className="w-3.5 h-3.5 text-[#1E3F37]" /> Enregistrées en local
                </div>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">A valider</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{countPending}</p>
                <div className="text-[10px] text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> En attente de message
                </div>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs font-medium">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">En livraison</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{countDelivered + countValidated}</p>
                <div className="text-[10px] text-blue-700 font-bold mt-1.5 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Paquets expédiés
                </div>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider font-semibold">Finalisées</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{countCompleted}</p>
                <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" /> Reçues pour de bon ✓
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Column 1: Filter & Order list */}
              <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-md space-y-6">
                
                {/* Status Switcher Buttons */}
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-3">
                    Filtrer par statut
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'pending', 'validated', 'delivered', 'completed'] as const).map((filter) => {
                      const counts = {
                        all: orders.length,
                        pending: countPending,
                        validated: countValidated,
                        delivered: countDelivered,
                        completed: countCompleted
                      }[filter];

                      const label = {
                        all: 'Toutes',
                        pending: 'Recues',
                        validated: 'Validées',
                        delivered: 'Livrées',
                        completed: 'Terminées'
                      }[filter];

                      return (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                            orderFilter === filter 
                              ? 'bg-[#1E3F37] text-white border-[#1E3F37]' 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {label} ({counts})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Orders scrollable container */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">
                    Sélectionner pour administrer ({filteredOrders.length})
                  </label>
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                      Aucune commande à afficher
                    </div>
                  ) : (
                    filteredOrders.map((o) => {
                      const isActive = selectedOrder?.orderNumber === o.orderNumber;
                      const statusStyles = {
                        pending: 'bg-amber-100 text-amber-800 border-amber-200',
                        validated: 'bg-[#EAFBF5] text-[#1E3F37] border-emerald-150',
                        delivered: 'bg-blue-100 text-blue-800 border-blue-250',
                        completed: 'bg-purple-100 text-purple-800 border-purple-200'
                      }[o.status];

                      return (
                        <button
                          key={o.orderNumber}
                          onClick={() => setSelectedOrder(o)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all ${
                            isActive 
                              ? 'border-[#1E3F37] bg-emerald-50/10 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-gray-950 uppercase">{o.orderNumber}</span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusStyles}`}>
                              {o.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-50">
                            <span className="text-[10px] text-gray-400 font-bold">
                              {o.items.reduce((sum, item) => sum + item.quantity, 0)} pot(s)
                            </span>
                            <span className="font-black text-xs text-[#1E3F37]">
                              {o.total.toLocaleString('fr-FR')} F
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Column 2 & 3: Selected Order Administration view */}
              <div className="lg:col-span-2">
                {selectedOrder ? (
                  <motion.div 
                    layoutId="selected-order-panel"
                    className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-md space-y-8"
                  >
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-6 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-[#1E3F37] text-white font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                            Détails de Commande
                          </span>
                          <span className="text-xs font-semibold text-gray-400">{selectedOrder.orderNumber}</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-1">
                          Commande {selectedOrder.orderNumber}
                        </h2>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteOrder(selectedOrder.orderNumber)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Order Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                      
                      {/* Customer Info Block */}
                      <div className="space-y-2 bg-[#FAFAF8] p-4 rounded-2xl border border-gray-150 text-xs">
                        <p className="font-black text-gray-400 uppercase tracking-widest text-[9px] mb-2 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Client & Livraison
                        </p>
                        <p className="font-bold text-gray-800">
                          <span className="text-gray-400">Adresse :</span> {selectedOrder.address || 'Non spécifiée'}
                        </p>
                        <p className="font-bold text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> 
                          <span className="text-gray-450">Coordonnées GPS :</span> 
                          [{selectedOrder.location[0].toFixed(4)}, {selectedOrder.location[1].toFixed(4)}]
                        </p>
                        <p className="font-bold text-gray-800 mt-2">
                          <span className="text-gray-450">Type paiement :</span> {selectedOrder.payment === 'CARD' ? 'Wave / MTN Mobile Money' : 'PayPal'}
                        </p>                     
                      </div>

                      {/* Timeline Status History */}
                      <div className="space-y-2 bg-[#F6FAF8] p-4 rounded-2xl border border-[#85C0B4]/20 text-xs text-left">
                        <p className="font-black text-gray-400 uppercase tracking-widest text-[9px] mb-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary-dark" /> Journal des Evénements
                        </p>
                        <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                          {selectedOrder.statusHistory && selectedOrder.statusHistory.map((h, i) => (
                            <div key={i} className="border-l-2 border-[#1E3F37] pl-2 py-0.5">
                              <p className="text-[10px] font-black uppercase text-[#1E3F37] flex items-center justify-between">
                                <span>{h.status}</span>
                                <span className="text-[9px] text-gray-400 lowercase">{new Date(h.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </p>
                              <p className="text-[10px] text-gray-600 font-semibold">{h.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Order Basket contents */}
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                        Pots et Formats Commandés
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 p-4 rounded-2xl gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-12 h-12 rounded-xl object-cover shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-tight">{item.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                  Qté : {item.quantity} pot(s) • Format : {item.selectedCapacity || 'Standard'}
                                </p>
                                
                                {/* Custom configuration badges */}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {item.selectedFruits && item.selectedFruits.length > 0 ? (
                                    item.selectedFruits.map((fruit, fIdx) => (
                                      <span key={fIdx} className="text-[8px] bg-orange-50 border border-orange-200 text-orange-850 uppercase font-black px-1.5 py-0.5 rounded">
                                        🍓 Fruit : {fruit}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-850 uppercase font-black px-1.5 py-0.5 rounded">
                                      🌸 Arôme : {item.selectedAroma || 'Aucun'}
                                    </span>
                                  )}
                                  
                                  {item.selectedBase && (
                                    <span className="text-[8px] bg-blue-50 border border-blue-100 text-blue-800 uppercase font-black px-1.5 py-0.5 rounded">
                                      🥣 Base : {item.selectedBase}
                                    </span>
                                  )}

                                  {item.isDiy && (
                                    <span className="text-[8px] bg-pink-50 border border-pink-150 text-pink-700 font-black px-1.5 py-0.5 rounded uppercase">
                                      ✨ Composer son yaourt
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs font-black text-[#1E3F37] self-end sm:self-center">
                              {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-150 mt-4">
                        <span className="text-xs uppercase font-black text-gray-500">Total Facturé</span>
                        <span className="text-lg font-black text-[#1E3F37]">{selectedOrder.total.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    {/* STEP ACTION CONTROLLER (ADMIN WORKFLOW) */}
                    <div className="bg-[#FAFAF5] border border-gray-200 p-6 rounded-[28px] space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#1E3F37] tracking-wider flex items-center gap-1.5">
                        ⚙️ Actions de Traitement du Statut
                      </h4>

                      {/* Order is Pending -> Validation Phase */}
                      {selectedOrder.status === 'pending' && (
                        <div className="space-y-4 text-left">
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            <span className="font-extrabold text-[#1E3F37]">Étape 1 : Valider la commande.</span> Renseignez un message personnalisé ou amical qui sera retourné instantanément au client sur son écran de tracking.
                          </p>

                          {/* Quick answers selection */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-gray-400">Modèles de réponse express :</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                "Votre yaourt moussé Yolita est validé à l'atelier ! Brassage des fruits locaux démarré.",
                                "Excellente recette choisie ! Vos pots de yaourts artisanaux sont prêts, le livreur arrive.",
                                "Standard Yolita : Commande validée pour le Bénin court-circuit. Nous arrivons !"
                              ].map((mText, mIdx) => (
                                <button
                                  key={mIdx}
                                  type="button"
                                  onClick={() => selectQuickMessage(mText)}
                                  className="text-[9px] bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 font-bold px-2.5 py-1 rounded-lg transition-all"
                                >
                                  "{mText.slice(0, 35)}..."
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            rows={3}
                            value={validationMessage}
                            onChange={(e) => setValidationMessage(e.target.value)}
                            placeholder="Tapez un message à destination de l'acheteur... (Ex: Notre Chef commence la préparation avec vos fruits préférés ! À tout de suite.)"
                            className="w-full bg-white border border-gray-250 p-3.5 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                          />

                          <button
                            onClick={() => validateOrder(selectedOrder.orderNumber)}
                            className="w-full bg-[#1E3F37] hover:bg-[#1e3f37]/90 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Valider la Commande & Envoyer le Message
                          </button>
                        </div>
                      )}

                      {/* Order is Validated -> Dispatching to delivery */}
                      {selectedOrder.status === 'validated' && (
                        <div className="space-y-4 text-left">
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            <span className="font-extrabold text-blue-600">Étape 2 : Livraison physique.</span> Les bocaux thermiques Yolita sont moussés et assemblés avec soin. Confiez le paquet au livreur.
                          </p>

                          <div className="bg-[#EAFBF5] p-3 rounded-xl border border-emerald-150 text-[11px] text-[#1E3F37] font-semibold italic">
                            Message au client actif : "{selectedOrder.adminMessage}"
                          </div>

                          <button
                            onClick={() => deliverOrder(selectedOrder.orderNumber)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <Truck className="w-4 h-4" /> Confier au livreur & Déclencher Livraison
                          </button>
                        </div>
                      )}

                      {/* Order is Delivered -> Waiting Customer Finalisation */}
                      {selectedOrder.status === 'delivered' && (
                        <div className="space-y-2 bg-blue-50/50 p-4 border border-blue-200 rounded-2xl text-left">
                          <p className="text-xs text-blue-800 font-bold uppercase tracking-wider flex items-center gap-1">
                            🚚 Commande en cours de distribution chez le client
                          </p>
                          <p className="text-[11px] text-gray-550 font-medium">
                            La commande a été marquée comme livrée. Nous attendons désormais que le client valide la réception finale ("pour de bon") depuis son écran de suivi de commande.
                          </p>
                        </div>
                      )}

                      {/* Order is Completed -> Show Success and Review */}
                      {selectedOrder.status === 'completed' && (
                        <div className="space-y-3 bg-[#EAFBF5] border border-emerald-250 p-4 rounded-2xl text-left">
                          <p className="text-xs text-emerald-800 font-black uppercase tracking-wider flex items-center gap-1.5">
                            <ThumbsUp className="w-4 h-4 text-emerald-500" /> Commande Terminée & Archivée avec succès !
                          </p>
                          <p className="text-xs text-[#1E3F37] font-bold">
                            Le client a confirmé sa satisfaction et achevé sa commande pour de bon !
                          </p>
                          {selectedOrder.clientMessage && (
                            <div className="mt-3 bg-white p-3 rounded-xl border border-emerald-100 text-[11px] text-gray-600 font-semibold italic">
                              📝 Feedback client : "{selectedOrder.clientMessage}"
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </motion.div>
                ) : (
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-md text-center py-16">
                    <img 
                      src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=85" 
                      alt="No order selected"
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 opacity-50 border border-gray-200"
                    />
                    <h3 className="text-lg font-black text-gray-400 uppercase tracking-tight">Aucune commande choisie</h3>
                    <p className="text-xs text-gray-400 mt-1">Sélectionnez une commande dans la colonne pour commencer le traitement.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOGUE EXPERIENCE (PRESERVED) */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {products.map((product) => {
              const isEditing = editingProductId === product.id;

              return (
                <motion.div
                  layout
                  key={product.id}
                  className={`bg-white rounded-[32px] overflow-hidden border transition-all ${
                    isEditing ? 'border-[#1E3F37] shadow-xl ring-2 ring-[#1E3F37]/10' : 'border-gray-200/60 shadow-md hover:shadow-lg'
                  }`}
                >
                  {/* Product head showing badge */}
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={isEditing ? (editForm.image || product.image) : product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                      <span className="bg-white/95 text-gray-800 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        {product.category.toUpperCase()}
                      </span>
                      {(isEditing ? editForm.badge : product.badge) && (
                        <span className="bg-accent text-[#1E3F37] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          {isEditing ? editForm.badge : product.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 px-4 py-2 rounded-2xl shadow-md border border-gray-100">
                      <span className="text-lg font-black text-[#1E3F37]">
                        {isEditing ? Number(editForm.price).toLocaleString('fr-FR') : product.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Form or Info Block */}
                  <div className="p-6 md:p-8 space-y-6 text-left">
                    {isEditing ? (
                      // EDIT MODE FORM
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Nom du produit
                            </label>
                            <input 
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37]"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Prix (FCFA - Min 500)
                            </label>
                            <input 
                              type="number"
                              min="500"
                              value={editForm.price}
                              onChange={(e) => setEditForm(prev => ({ ...prev, price: Math.max(500, Number(e.target.value)) }))}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> URL de la Photo / Image
                          </label>
                          <input 
                            type="url"
                            value={editForm.image}
                            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                              🏷️ Badge Optionnel
                            </label>
                            <input 
                              type="text"
                              value={editForm.badge}
                              placeholder="Ex : Populaire, Nouveauté..."
                              onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                              🥣 Catégorie
                            </label>
                            <div className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 capitalize">
                              {product.category}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Description
                          </label>
                          <textarea 
                            rows={3}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] resize-none"
                          />
                        </div>

                        {/* Editing Actions */}
                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2.5 rounded-xl border border-gray-250 text-gray-650 hover:bg-gray-50 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Annuler
                          </button>
                          <button
                            onClick={() => saveEdit(product.id)}
                            disabled={savingId === product.id}
                            className="px-5 py-2.5 rounded-xl bg-[#1E3F37] text-white hover:bg-[#1E3F37]/90 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                          >
                            {savingId === product.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" /> Enregistrer
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // SHOW INFORMATION MODE
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{product.name}</h2>
                          <p className="text-xs text-gray-400 font-bold mt-1">ID unique : {product.id}</p>
                        </div>

                        <p className="text-xs text-gray-500 font-medium leading-relaxed bg-[#FAFAF5] p-3 rounded-2xl border border-gray-150">
                          {product.description || 'Aucune description disponible.'}
                        </p>

                        <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                          {/* Aroma presets listing */}
                          <div className="flex flex-wrap gap-1">
                            {product.aromas && product.aromas.map((aroma, index) => (
                              <span key={index} className="text-[8px] bg-[#F0F7F5] border border-[#85C0B4]/20 text-[#1E3F37] font-black uppercase px-2 py-0.5 rounded-md">
                                🍃 {aroma}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => startEdit(product)}
                            className="px-4 py-2.5 rounded-xl bg-primary-light hover:bg-[#1E3F37] hover:text-white text-[#1E3F37] text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all border border-[#1E3F37]/10"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Modifier
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
