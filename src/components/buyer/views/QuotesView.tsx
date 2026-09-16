/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList, Send } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { Customer } from '../../../UserContext';

interface QuoteRow {
  id: string;
  message: string;
  status: string;
  admin_response: string;
  admin_price: number | null;
  created_at: string;
}

interface Props {
  customer: Customer;
  quotes: QuoteRow[];
  loading: boolean;
  onSubmitted: () => void;
}

export const QuotesView: React.FC<Props> = ({ customer, quotes, loading, onSubmitted }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    const { error: insertError } = await supabase.from('quote_requests').insert({
      user_id: customer.id,
      client_name: customer.name,
      client_email: customer.email,
      message: message.trim(),
    });
    setSubmitting(false);
    if (insertError) {
      setError("Impossible d'envoyer votre demande pour le moment.");
    } else {
      setMessage('');
      setSuccess('Votre demande de devis a été envoyée. Nous vous répondons rapidement.');
      onSubmitted();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-700" /> Demandes de devis
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Ex : "Je veux 500 pots de 250 ml." L'admin vous répond avec un prix grossiste sur-mesure.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8">
        <form onSubmit={submit} className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre besoin : quantité, format, fréquence de livraison…"
            rows={3}
            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
          />
          {error && <p className="text-rose-600 text-xs font-bold mb-2">⚠️ {error}</p>}
          {success && <p className="text-emerald-700 text-xs font-bold mb-2">✓ {success}</p>}
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="inline-flex items-center gap-2 bg-amber-900 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" /> {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>

        <h3 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-3">Mes demandes précédentes</h3>
        {loading ? (
          <p className="text-xs text-amber-700 font-semibold">Chargement…</p>
        ) : quotes.length === 0 ? (
          <p className="text-xs text-amber-700 font-semibold">Aucune demande envoyée pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <div key={q.id} className="bg-white border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-gray-400 font-semibold">
                    {new Date(q.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      q.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.status === 'answered' ? 'Répondu' : 'En attente'}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-semibold mb-2">{q.message}</p>
                {q.status === 'answered' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-2">
                    {q.admin_price != null && (
                      <p className="text-sm font-black text-emerald-800 mb-1">
                        Prix proposé : {q.admin_price.toLocaleString('fr-FR')} FCFA
                      </p>
                    )}
                    <p className="text-xs text-emerald-800 font-semibold">{q.admin_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
