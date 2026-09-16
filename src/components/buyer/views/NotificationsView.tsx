/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, CheckCircle2, Truck, PackageCheck, Clock } from 'lucide-react';

interface StatusHistoryItem {
  status: string;
  date: string;
  comment?: string;
}

interface OrderRow {
  id: string;
  order_number: string;
  status_history: StatusHistoryItem[];
}

interface Props {
  orders: OrderRow[];
  loading: boolean;
}

const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Commande reçue', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  validated: { label: 'Commande validée', icon: CheckCircle2, color: 'bg-sky-100 text-sky-700' },
  delivered: { label: 'Commande en livraison', icon: Truck, color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Commande livrée', icon: PackageCheck, color: 'bg-emerald-100 text-emerald-700' },
};

export const NotificationsView: React.FC<Props> = ({ orders, loading }) => {
  const events = orders
    .flatMap((o) =>
      (o.status_history || []).map((h) => ({
        orderNumber: o.order_number,
        status: h.status,
        date: h.date,
        comment: h.comment,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#1E3F37]" /> Notifications
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Suivi des étapes de vos commandes (validation, livraison…) et promotions à venir.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {loading ? (
          <p className="text-xs text-gray-400 font-semibold">Chargement…</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold py-4">
            Aucune notification pour le moment. Elles apparaîtront ici dès qu'une de vos commandes change de statut.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((ev, i) => {
              const meta = STATUS_META[ev.status] || { label: ev.status, icon: Bell, color: 'bg-gray-100 text-gray-600' };
              const Icon = meta.icon;
              return (
                <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-2xl p-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-gray-800">
                      {meta.label} · #{ev.orderNumber}
                    </p>
                    {ev.comment && <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{ev.comment}</p>}
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      {new Date(ev.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
