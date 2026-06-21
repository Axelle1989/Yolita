/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Heart, Send } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Merci ! Votre message a bien été envoyé. L\'équipe Yolita vous répondra dans les plus brefs délais.');
  };

  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black mb-6 uppercase tracking-tight text-gray-900"
          >
            Nous Contacter
          </motion.h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Une question sur nos recettes bio ou envie d'un partenariat de fraîcheur ? Écrivez-nous, nous adorons échanger !
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] shadow-sm border border-border-subtle"
          >
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter text-primary-dark">Nous écrire un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Prénom & Nom</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border-input bg-white focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all font-medium text-gray-800"
                    placeholder="Sena Tossou"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border-input bg-white focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all font-medium text-gray-800"
                    placeholder="97 00 11 22"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-input bg-white focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all font-medium text-gray-800"
                  placeholder="sena@exemple.bj"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Votre Message</label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border-input bg-white focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all resize-none font-medium text-gray-800"
                  placeholder="Bonjour ! Dites-nous tout..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Envoyer le message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full justify-between"
          >
            <div className="space-y-8 mb-12">
              <div className="flex items-start">
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mr-6 shrink-0 shadow-sm border border-primary/20">
                  <MapPin className="w-6 h-6 text-primary-dark" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-primary-dark mb-1">Nos Adresses</h4>
                  <p className="text-gray-900 font-bold text-sm">Boutique : Haie Vive, Cotonou, Bénin</p>
                  <p className="text-gray-500 font-medium text-xs mt-1">Atelier : Zone Industrielle, Calavi, Bénin</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mr-6 shrink-0 shadow-sm border border-accent/30">
                  <Mail className="w-6 h-6 text-mint-dark" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-mint-dark mb-1">Écrivez-nous</h4>
                  <p className="text-gray-900 font-bold text-sm">hello@yolita.bj</p>
                  <p className="text-gray-500 font-medium text-xs mt-1">Notre équipe d'onctuosité vous répond sous 24h.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mr-6 shrink-0 shadow-sm border border-primary/20">
                  <Phone className="w-6 h-6 text-primary-dark" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-primary-dark mb-1">Téléphone</h4>
                  <p className="text-gray-900 font-bold text-sm">+229 97 00 11 22</p>
                  <p className="text-gray-500 font-medium text-xs mt-1">Du lundi au samedi de 8h à 19h.</p>
                </div>
              </div>
            </div>

            {/* Map/Illustration Placeholder */}
            <div className="w-full aspect-video bg-primary-light rounded-[40px] overflow-hidden relative border-4 border-white shadow-lg flex items-center justify-center p-6">
              <div className="absolute inset-0 yolita-pattern opacity-10"></div>
              <div className="relative text-center space-y-3 z-10 max-w-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-xl shadow-sm">
                  🌸
                </div>
                <h4 className="font-extrabold text-gray-900 font-sans">Yolita — Conçu au Bénin 🇧🇯</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Des ingrédients de première fraîcheur collectés avec le plus grand soin auprès de producteurs locaux engagés pour une qualité onctueuse et saine.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
