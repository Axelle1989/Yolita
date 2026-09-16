/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Printer } from 'lucide-react';

interface OrderRow {
  id: string;
  order_number: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

interface Props {
  orders: OrderRow[];
  loading: boolean;
  error: string;
  isGros: boolean;
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

export const OrdersView: React.FC<Props> = ({ orders, loading, error, isGros }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#1E3F37]" /> Mes commandes
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">Historique complet et statut de chaque commande.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl p-4 mb-4">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p className="text-xs text-gray-400 font-semibold">Chargement…</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-gray-500 mb-4">Vous n'avez pas encore passé de commande.</p>
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
                  <span className="text-sm font-black text-[#1E3F37]">{o.total.toLocaleString('fr-FR')} FCFA</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                  {isGros && (
                    <Link
                      to={`/facture/${o.id}`}
                      target="_blank"
                      className="text-gray-400 hover:text-[#1E3F37] p-1.5 border border-gray-200 rounded-lg"
                      title="Voir / imprimer la facture"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
