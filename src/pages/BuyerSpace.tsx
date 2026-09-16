/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ExternalLink, Menu, X, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { useUser } from '../UserContext';
import { useFavorites } from '../FavoritesContext';
import { supabase } from '../supabaseClient';
import { BuyerSidebar } from '../components/buyer/BuyerSidebar';
import { getBuyerMenuItems } from '../components/buyer/menuItems';
import { DashboardView } from '../components/buyer/views/DashboardView';
import { CatalogView } from '../components/buyer/views/CatalogView';
import { FavoritesView } from '../components/buyer/views/FavoritesView';
import { OrdersView } from '../components/buyer/views/OrdersView';
import { InvoicesView } from '../components/buyer/views/InvoicesView';
import { QuotesView } from '../components/buyer/views/QuotesView';
import { NotificationsView } from '../components/buyer/views/NotificationsView';
import { ProfileView } from '../components/buyer/views/ProfileView';

export type BuyerTab =
  | 'dashboard'
  | 'catalog'
  | 'favorites'
  | 'orders'
  | 'invoices'
  | 'quotes'
  | 'notifications'
  | 'profile';

interface OrderRow {
  id: string;
  order_number: string;
  items: any[];
  total: number;
  status: string;
  status_history: any[];
  created_at: string;
}

interface QuoteRow {
  id: string;
  message: string;
  status: string;
  admin_response: string;
  admin_price: number | null;
  created_at: string;
}

export default function BuyerSpace() {
  const { customer, loading, logoutCustomer, deleteOwnAccount } = useUser();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<BuyerTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      navigate('/connexion?redirect=/tableau-de-bord');
    }
  }, [loading, customer, navigate]);

  useEffect(() => {
    if (!customer) return;
    let cancelled = false;

    (async () => {
      setOrdersLoading(true);
      setOrdersError('');
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, items, total, status, status_history, created_at')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) setOrdersError('Impossible de charger vos commandes pour le moment.');
      else setOrders(data || []);
      setOrdersLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [customer]);

  const loadQuotes = async () => {
    if (!customer) return;
    setQuotesLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('id, message, status, admin_response, admin_price, created_at')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });
    if (!error) setQuotes(data || []);
    setQuotesLoading(false);
  };

  useEffect(() => {
    if (customer?.buyerType === 'gros') loadQuotes();
    else setQuotesLoading(false);
  }, [customer]);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    const res = await deleteOwnAccount();
    setDeletingAccount(false);
    if (res.success) {
      navigate('/');
    } else {
      setConfirmDeleteAccount(false);
      setLogoutMenuOpen(false);
      // En cas d'échec, on laisse simplement l'utilisateur réessayer plus tard.
    }
  };

  if (!customer) return null;

  const isGros = customer.buyerType === 'gros';
  const pendingQuotesCount = quotes.filter((q) => q.status !== 'answered').length;
  const menuItems = getBuyerMenuItems({
    buyerType: customer.buyerType,
    favoritesCount: favoriteIds.length,
    pendingQuotesCount,
    unreadNotificationsCount: 0,
  });

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            customer={customer}
            orders={orders}
            favoritesCount={favoriteIds.length}
            pendingQuotesCount={pendingQuotesCount}
            setActiveTab={setActiveTab}
          />
        );
      case 'catalog':
        return <CatalogView />;
      case 'favorites':
        return <FavoritesView />;
      case 'orders':
        return <OrdersView orders={orders} loading={ordersLoading} error={ordersError} isGros={isGros} />;
      case 'invoices':
        return isGros ? <InvoicesView orders={orders} loading={ordersLoading} /> : null;
      case 'quotes':
        return isGros ? (
          <QuotesView customer={customer} quotes={quotes} loading={quotesLoading} onSubmitted={loadQuotes} />
        ) : null;
      case 'notifications':
        return <NotificationsView orders={orders} loading={ordersLoading} />;
      case 'profile':
        return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* En-tête propre à l'espace acheteur — interface détachée du site vitrine */}
      <header className="bg-[#1E3F37] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden text-white/90 hover:text-white p-1 -ml-1"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/tableau-de-bord" className="flex items-center gap-2 font-black tracking-tight text-lg">
              🌸 Yolita <span className="text-[10px] font-black uppercase tracking-widest text-white/50 hidden sm:inline">Espace Acheteur</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Voir le site</span>
            </a>
            <div className="relative">
              <button
                onClick={() => setLogoutMenuOpen((v) => !v)}
                className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Compte</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${logoutMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {logoutMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 text-left z-50"
                  >
                    {!confirmDeleteAccount ? (
                      <>
                        <button
                          onClick={() => {
                            setLogoutMenuOpen(false);
                            logoutCustomer();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="w-4 h-4 text-gray-400" /> Déconnexion
                        </button>
                        <button
                          onClick={() => setConfirmDeleteAccount(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" /> Déconnexion définitive (supprimer mon compte)
                        </button>
                      </>
                    ) : (
                      <div className="p-2">
                        <p className="text-[11px] font-bold text-gray-600 flex items-start gap-1.5 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          Ceci supprime définitivement votre compte et vos données. Confirmer ?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteAccount(false)}
                            className="flex-1 text-[11px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 rounded-xl py-2"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount}
                            className="flex-1 text-[11px] font-black uppercase tracking-widest text-white bg-rose-600 rounded-xl py-2 disabled:opacity-60"
                          >
                            {deletingAccount ? '...' : 'Confirmer'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Menu burger — mobile / tablette uniquement */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#173029] border-t border-white/10 overflow-hidden"
            >
              <nav className="px-4 py-3 space-y-1">
                {menuItems
                  .filter((item) => item.visible)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-amber-950">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <BuyerSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              buyerType={customer.buyerType}
              favoritesCount={favoriteIds.length}
              pendingQuotesCount={pendingQuotesCount}
              unreadNotificationsCount={0}
            />
            <div className="flex-1 min-w-0">{renderView()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
