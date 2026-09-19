/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Heart,
  TrendingUp,
  ClipboardList,
  ShoppingCart,
  Sparkles,
  FileText,
  MessageCircle,
  Send,
  Bike,
  Wallet,
  Gift,
  Plus,
} from 'lucide-react';
import { Customer } from '../../../UserContext';
import { BuyerTab } from '../../../pages/BuyerSpace';
import { supabase } from '../../../supabaseClient';
import { useSiteConfig } from '../../../SiteConfigContext';
import { useCart } from '../../../CartContext';

interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface Props {
  customer: Customer;
  orders: OrderRow[];
  favoritesCount: number;
  pendingQuotesCount: number;
  setActiveTab: (tab: BuyerTab) => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  validated: 'En préparation',
  delivered: 'En livraison',
  completed: 'Livrée',
};

export const DashboardView: React.FC<Props> = ({ customer, orders, favoritesCount, pendingQuotesCount, setActiveTab }) => {
  const isGros = customer.buyerType === 'gros';
  const ongoingOrders = orders.filter((o) => o.status !== 'completed');
  const latestOrder = orders[0] || null;
  const hasHistory = orders.length > 0;

  const { config } = useSiteConfig();
  const { addToCart } = useCart();

  const bestSellers = config.products
    .filter((p) => p.category !== 'pack')
    .filter((p) => p.badge === 'Populaire' || p.badge === 'Best-Seller' || p.badge)
    .slice(0, 4);
  const fallbackPicks = bestSellers.length > 0 ? bestSellers : config.products.slice(0, 4);

  const [myReviews, setMyReviews] = useState<{ id: string; message: string; featured: boolean }[]>([]);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const loadMyReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, message, featured')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });
    if (!error) setMyReviews(data || []);
  };

  useEffect(() => {
    loadMyReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMessage.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    const { error } = await supabase.from('reviews').insert({
      user_id: customer.id,
      name: customer.name,
      message: reviewMessage.trim(),
    });
    setReviewSubmitting(false);
    if (error) {
      setReviewError("Impossible d'envoyer votre avis pour le moment.");
    } else {
      setReviewMessage('');
      setReviewSuccess("Merci ! Votre avis a été envoyé et sera examiné par l'équipe Yolita.");
      loadMyReviews();
    }
  };

  const now = new Date();
  const monthlyTotal = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12241f] via-[#1E3F37] to-[#12241f] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            {isGros ? 'Espace B2B • Compte Grossiste' : 'Espace Particulier'}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Bonjour {customer.name.split(' ')[0]} {isGros ? '🏢' : '👋'}
          </h1>

          <p className="text-white/70 text-sm leading-relaxed font-semibold">
            {isGros
              ? 'Gérez vos approvisionnements en gros, téléchargez vos factures et sollicitez des devis sur-mesure.'
              : 'Retrouvez vos yaourts Yolita préférés et commandez en quelques clics avec livraison à domicile.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-widest transition-colors shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Commander au catalogue</span>
            </button>

            {isGros ? (
              <button
                onClick={() => setActiveTab('quotes')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-colors border border-white/20"
              >
                <ClipboardList className="w-4 h-4 text-amber-300" />
                <span>Nouvelle demande de devis</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('orders')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest transition-colors border border-white/20"
              >
                <Package className="w-4 h-4" />
                <span>Mes commandes</span>
              </button>
            )}
          </div>

          <p className="text-white/50 text-[11px] font-bold mt-4 flex items-center gap-1.5 flex-wrap">
            🚚 Livraison Abomey-Calavi, Cotonou, Godomey &nbsp;|&nbsp; 💳 Paiement Mobile Money ou à la livraison
          </p>
        </div>
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI, ou cartes utiles si le compte est tout neuf */}
      {hasHistory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E3F37]/10 text-[#1E3F37] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{orders.length}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Commandes passées</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{ongoingOrders.length}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Commandes en cours</div>
            </div>
          </div>

          {isGros ? (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-black text-gray-900">{monthlyTotal.toLocaleString('fr-FR')} FCFA</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Achats ce mois-ci</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">{favoritesCount}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Produits favoris</div>
              </div>
            </div>
          )}

          {isGros ? (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">{pendingQuotesCount}</div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Devis en attente</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-gray-900">
                  {latestOrder ? new Date(latestOrder.created_at).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Dernière commande</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3F37]/10 text-[#1E3F37] flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-800">Livraison rapide</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                24h à Abomey-Calavi, Cotonou et Godomey
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-800">Paiement facile</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Mobile Money ou paiement à la livraison
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-800">Pack Duo Fruité</p>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">2 pots à partager — 3 000 FCFA</p>
            </div>
          </div>
        </div>
      )}

      {/* On a pensé à vous */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-4">On a pensé à vous</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fallbackPicks.map((p) => (
            <div key={p.id} className="border border-gray-100 rounded-2xl p-3 flex flex-col">
              <img src={p.image} alt={p.name} className="w-full aspect-square rounded-xl object-cover mb-2" referrerPolicy="no-referrer" />
              <p className="text-[11px] font-black text-gray-800 leading-tight line-clamp-2">{p.name}</p>
              <p className="text-[10px] text-gray-400 font-semibold mb-2">{p.price.toLocaleString('fr-FR')} FCFA</p>
              <button
                onClick={() => addToCart(p, p.aromas?.[0] || 'Nature', 1, 'Petit (125 ml)', false, undefined, config.capacities)}
                className="mt-auto inline-flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#1E3F37] text-white py-2 rounded-lg"
              >
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dernière commande */}
      {latestOrder && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">Dernière commande</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] font-black uppercase tracking-widest text-[#1E3F37] flex items-center gap-1"
            >
              Voir tout <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-4">
            <div>
              <p className="text-sm font-black text-gray-800">#{latestOrder.order_number}</p>
              <p className="text-[11px] text-gray-400 font-semibold">
                {new Date(latestOrder.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <span className="text-sm font-black text-[#1E3F37]">{latestOrder.total.toLocaleString('fr-FR')} FCFA</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
              {STATUS_LABEL[latestOrder.status] || latestOrder.status}
            </span>
          </div>
        </div>
      )}

      {/* Laisser un avis */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 mb-1 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#1E3F37]" /> Laisser un avis sur Yolita
        </h3>
        <p className="text-[11px] text-gray-400 font-semibold mb-4">
          Votre avis peut être mis en avant sur la page d'accueil du site par notre équipe.
        </p>
        <form onSubmit={submitReview} className="space-y-3 mb-6">
          <textarea
            value={reviewMessage}
            onChange={(e) => setReviewMessage(e.target.value)}
            placeholder="Qu'avez-vous pensé de vos yaourts Yolita ?"
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
          />
          {reviewError && <p className="text-rose-600 text-xs font-bold">⚠️ {reviewError}</p>}
          {reviewSuccess && <p className="text-emerald-700 text-xs font-bold">✓ {reviewSuccess}</p>}
          <button
            type="submit"
            disabled={reviewSubmitting || !reviewMessage.trim()}
            className="inline-flex items-center gap-2 bg-[#1E3F37] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" /> {reviewSubmitting ? 'Envoi...' : 'Envoyer mon avis'}
          </button>
        </form>

        {myReviews.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Mes avis envoyés</p>
            {myReviews.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 font-semibold truncate">{r.message}</p>
                <span
                  className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    r.featured ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {r.featured ? 'Affiché sur le site' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
