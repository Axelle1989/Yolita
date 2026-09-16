/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ExternalLink } from 'lucide-react';
import { useUser } from '../UserContext';
import { useFavorites } from '../FavoritesContext';
import { supabase } from '../supabaseClient';
import { BuyerSidebar } from '../components/buyer/BuyerSidebar';
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
  const { customer, loading, logoutCustomer } = useUser();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<BuyerTab>('dashboard');

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

  if (!customer) return null;

  const isGros = customer.buyerType === 'gros';
  const pendingQuotesCount = quotes.filter((q) => q.status !== 'answered').length;

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
          <Link to="/tableau-de-bord" className="flex items-center gap-2 font-black tracking-tight text-lg">
            🌸 Yolita <span className="text-[10px] font-black uppercase tracking-widest text-white/50 hidden sm:inline">Espace Acheteur</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Voir le site</span>
            </a>
            <button
              onClick={logoutCustomer}
              className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
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
