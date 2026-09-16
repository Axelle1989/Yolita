/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useUser } from '../../../UserContext';
import { User, Mail, Phone, Save, MailCheck } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { customer, updateCustomerProfile } = useUser();
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const res = await updateCustomerProfile({ name, phone, email });
    setSubmitting(false);
    if (res.success) {
      if (res.needsEmailConfirmation) setAwaitingEmailConfirm(true);
      else setSuccess('Vos informations ont été mises à jour avec succès !');
    } else {
      setError(res.error || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#1E3F37]" /> Mon profil
        </h2>
        <p className="text-xs text-gray-500 font-semibold mt-1">Nom, téléphone, adresse email de votre compte.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-lg">
        {awaitingEmailConfirm ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-[#F0F7F5] rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <MailCheck className="w-6 h-6 text-[#1E3F37]" />
            </div>
            <p className="text-sm text-gray-600 font-semibold leading-relaxed">
              Un email de confirmation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien reçu pour finaliser
              le changement d'adresse.
            </p>
            <button
              onClick={() => setAwaitingEmailConfirm(false)}
              className="text-xs font-black text-[#1E3F37] uppercase tracking-widest underline"
            >
              Retour au profil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nom complet</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Téléphone (Bénin)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01 40 40 40 40"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Adresse email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                Changer l'email nécessite de cliquer sur un lien de confirmation envoyé à la nouvelle adresse.
              </p>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>
            )}
            {success && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-[#1E3F37] hover:bg-[#1E3F37]/90 text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
