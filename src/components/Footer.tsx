/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8 border-t-4 border-primary/20 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 w-full h-full yolita-pattern opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter flex items-center gap-2 text-white">
              🌸 Yolita
            </h3>
            <p className="text-primary-light/80 mb-6 leading-relaxed text-sm font-medium">
              Le yaourt biologique et de jeunesse, fait avec passion. Une douceur crémeuse, saine et éco-responsable pour régaler les papilles de toute la famille.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-accent hover:text-mint-dark transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-xl hover:bg-accent hover:text-mint-dark transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-extrabold mb-6 uppercase tracking-wider text-accent text-sm">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold tracking-wide">
              <li><Link to="/" className="text-primary-light hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/produits" className="text-primary-light hover:text-white transition-colors">La Boutique</Link></li>
              <li><Link to="/#histoire" className="text-primary-light hover:text-white transition-colors">Notre Histoire</Link></li>
              <li><Link to="/contact" className="text-primary-light hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-extrabold mb-6 uppercase tracking-wider text-accent text-sm">Nous trouver</h4>
            <ul className="space-y-4 text-sm font-bold text-primary-light/90">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-accent shrink-0" />
                <span>Haie Vive, Cotonou, Bénin</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-accent shrink-0" />
                <span>+229 97 00 11 22</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-accent shrink-0" />
                <span>hello@yolita.bj</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-extrabold mb-6 uppercase tracking-wider text-accent text-sm">Informations</h4>
            <ul className="space-y-4 text-xs font-bold text-primary-light/80 text-left">
              <li><Link to="#" className="hover:text-white transition-colors">Mentions Légales</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Conditions Générales de Vente</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Politique de Confidentialité</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Garantie Fraîcheur</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p className="text-primary-light/60 font-medium">
            © {new Date().getFullYear()} Yolita. Fait avec amour et onctuosité au Bénin 🇧🇯
          </p>
          <div className="flex space-x-6 text-primary-light/60 font-bold uppercase tracking-wider">
            <span>MTN MoMo, Moov Money, CB</span>
            <span>Sécurisé SSL</span>
            <span className="flex items-center gap-1 text-accent">Sans sucre ajouté <Heart className="w-3 h-3 fill-current" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
