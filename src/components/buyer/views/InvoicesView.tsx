/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Printer } from 'lucide-react';

interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface Props {
  orders: OrderRow[];
  loading: boolean;
}

export const InvoicesView: React.FC<Props> = ({ orders, loading }) => {
  const paidOrders = orders; // toute commande enregistrée peut donner lieu à une facture

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1E3F37]" /> Mes factures
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Téléchargez la facture PDF de chacune de vos commandes (impression navigateur → "Enregistrer en PDF").
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {loading ? (
          <p className="text-xs text-gray-400 font-semibold">Chargement…</p>
        ) : paidOrders.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold py-4">Aucune facture disponible pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {paidOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-2 border border-gray-100 rounded-2xl p-4"
              >
                <div>
                  <p className="text-sm font-black text-gray-800">Facture #{o.order_number}</p>
                  <p className="text-[11px] text-gray-400 font-semibold">
                    {new Date(o.created_at).toLocaleDateString('fr-FR')} · {o.total.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <Link
                  to={`/facture/${o.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#1E3F37] text-white px-3 py-2 rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" /> Voir / Imprimer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
