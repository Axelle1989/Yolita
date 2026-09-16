/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUser } from '../UserContext';
import { supabase } from '../supabaseClient';
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  PackageCheck,
  User as UserIcon,
  Heart,
  FileText,
  MessageSquareText,
  Bell,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface OrderRow {
  id: string;
  order_number: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  validated: 'En préparation',
  delivered: 'En livraison',
  completed: 'Livrée',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  validated: 'bg-sky-100 text-sky-800',
  delivered: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

export default function Dashboard() {
  const { customer, loading } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!loading && !customer) {
      navigate('/connexion?redirect=/tableau-de-bord');
    }
  }, [loading, customer, navigate]);

  useEffect(() => {
    if (!customer) return;

    let cancelled = false;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, items, total, status, created_at')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        setOrdersError("Impossible de charger vos commandes pour le moment.");
      } else {
        setOrders(data || []);
      }
      setOrdersLoading(false);
    };

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [customer]);

  if (!customer) return null;

  const isGros = customer.buyerType === 'gros';
  const ongoingOrders = orders.filter((o) => o.status !== 'completed');
  const lastOrder = orders[0];

  const stats = [
    { label: 'Commandes passées', value: orders.length, icon: ShoppingBag },
    { label: 'Commandes en cours', value: ongoingOrders.length, icon: Clock },
    {
      label: 'Dernière commande',
      value: lastOrder ? new Date(lastOrder.created_at).toLocaleDateString('fr-FR') : '—',
      icon: PackageCheck,
      isText: true,
    },
  ];

  const menuLinks = [
    { label: 'Catalogue', to: '/produits', icon: Sparkles, always: true },
    { label: 'Favoris', to: '#', icon: Heart, comingSoon: true, always: true },
    { label: 'Mes commandes', to: '/tableau-de-bord#commandes', icon: ShoppingBag, always: true },
    { label: 'Mes factures', to: '#', icon: FileText, comingSoon: true, grosOnly: true },
    { label: 'Demandes de devis', to: '#', icon: MessageSquareText, comingSoon: true, grosOnly: true },
    { label: 'Notifications', to: '#', icon: Bell, comingSoon: true, always: true },
    { label: 'Mon profil', to: '/profil', icon: UserIcon, always: true },
  ].filter((l) => l.always || (isGros && l.grosOnly));

  return (
    <div className="pt-36 pb-24 bg-[#FAFAF8] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E3F37] rounded-[32px] p-8 sm:p-10 text-white mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-white/60 flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5" /> Espace Acheteur
            </p>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Bonjour {customer.name.split(' ')[0]} 👋
            </h1>
            <p className="text-white/70 text-sm font-semibold mt-1">
              Heureux de vous revoir sur Aliyota.
            </p>
          </div>
          <span
            className={`self-start sm:self-auto px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
              isGros ? 'bg-amber-400 text-amber-950' : 'bg-white/15 text-white'
            }`}
          >
            {isGros ? '📦 Acheteur en gros' : '🏪 Acheteur en détail'}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Menu latéral */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sticky top-28">
              {menuLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.comingSoon ? '#' : link.to}
                  onClick={(e) => link.comingSoon && e.preventDefault()}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    link.comingSoon
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-[#1E3F37]/5 hover:text-[#1E3F37]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </span>
                  {link.comingSoon ? (
                    <span className="text-[9px] uppercase font-black tracking-widest bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-9 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <s.icon className="w-5 h-5 text-[#1E3F37] mb-3" />
                  <p className={`font-black text-[#1E3F37] ${s.isText ? 'text-lg' : 'text-3xl'}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Commandes */}
            <div id="commandes" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-5">
                Mes commandes
              </h2>

              {ordersError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl p-4 mb-4">
                  ⚠️ {ordersError}
                </div>
              )}

              {ordersLoading ? (
                <p className="text-xs text-gray-400 font-semibold">Chargement…</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-gray-500 mb-4">
                    Vous n'avez pas encore passé de commande.
                  </p>
                  <Link
                    to="/produits"
                    className="inline-block bg-[#1E3F37] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Découvrir le catalogue
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-100 rounded-2xl p-4"
                    >
                      <div>
                        <p className="text-sm font-black text-gray-800">#{o.order_number}</p>
                        <p className="text-[11px] text-gray-400 font-semibold">
                          {new Date(o.created_at).toLocaleDateString('fr-FR')} · {o.items?.length || 0} article(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#1E3F37]">
                          {o.total.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {STATUS_LABEL[o.status] || o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isGros && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-widest text-amber-800 mb-1">
                  Espace Grossiste
                </p>
                <p className="text-sm text-amber-900 font-semibold">
                  Les demandes de devis, prix grossiste automatique et factures téléchargeables
                  arrivent bientôt sur votre espace.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
