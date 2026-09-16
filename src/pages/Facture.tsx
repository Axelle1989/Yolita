/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import { supabase } from '../supabaseClient';
import { Printer, ArrowLeft } from 'lucide-react';

interface OrderRow {
  id: string;
  order_number: string;
  items: any[];
  total: number;
  address: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  created_at: string;
}

export default function Facture() {
  const { orderId } = useParams();
  const { customer, loading } = useUser();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      navigate(`/connexion?redirect=/facture/${orderId}`);
    }
  }, [loading, customer, navigate, orderId]);

  useEffect(() => {
    if (!customer || !orderId) return;
    (async () => {
      setFetching(true);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_number, items, total, address, client_name, client_email, client_phone, created_at')
        .eq('id', orderId)
        .eq('user_id', customer.id) // la RLS l'impose déjà, mais on le garde explicite
        .maybeSingle();

      if (fetchError || !data) {
        setError("Facture introuvable ou vous n'avez pas accès à cette commande.");
      } else {
        setOrder(data);
      }
      setFetching(false);
    })();
  }, [customer, orderId]);

  if (!customer) return null;

  return (
    <div className="pt-32 pb-24 bg-[#FAFAF8] min-h-screen print:pt-0 print:bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to="/tableau-de-bord" className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au tableau de bord
          </Link>
          {order && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-[#1E3F37] text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl"
            >
              <Printer className="w-4 h-4" /> Imprimer / Enregistrer en PDF
            </button>
          )}
        </div>

        {fetching ? (
          <p className="text-xs text-gray-400 font-semibold">Chargement…</p>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl p-4">
            ⚠️ {error}
          </div>
        ) : order ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 print:shadow-none print:border-0 print:rounded-none">
            <div className="flex items-start justify-between mb-10">
              <div>
                <p className="text-2xl font-black text-[#1E3F37]">🌸 Yolita</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">Haie Vive, Cotonou, Bénin</p>
                <p className="text-xs text-gray-400 font-semibold">+229 97 00 11 22</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-900">FACTURE</p>
                <p className="text-xs text-gray-400 font-semibold">#{order.order_number}</p>
                <p className="text-xs text-gray-400 font-semibold">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Facturé à</p>
              <p className="text-sm font-black text-gray-800">{order.client_name}</p>
              <p className="text-xs text-gray-500 font-semibold">{order.client_email}</p>
              <p className="text-xs text-gray-500 font-semibold">{order.client_phone}</p>
              {order.address && <p className="text-xs text-gray-500 font-semibold">{order.address}</p>}
            </div>

            <table className="w-full text-xs mb-8">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  <th className="py-2">Article</th>
                  <th className="py-2 text-center">Qté</th>
                  <th className="py-2 text-right">Prix unitaire</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 font-bold text-gray-800">
                      {item.name} {item.selectedAroma ? `— ${item.selectedAroma}` : ''}{' '}
                      {item.selectedCapacity ? `(${item.selectedCapacity})` : ''}
                    </td>
                    <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{item.price.toLocaleString('fr-FR')} FCFA</td>
                    <td className="py-3 text-right font-black text-gray-800">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total payé</span>
                  <span>{order.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-semibold mt-12 text-center">
              Merci pour votre confiance — Yolita, le yaourt qui te veut du bien.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
