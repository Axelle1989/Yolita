/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../CartContext';
import { useUser } from '../UserContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount, setCartOpen } = useCart();
  const { customer, logoutCustomer } = useUser();

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Produits', path: '/produits' },
    { name: 'Notre histoire', path: '/#histoire' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b-4 border-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl font-black text-primary-dark tracking-tighter flex items-center">
              🌸 Aliyota
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-gray-700 font-extrabold hover:text-primary-dark transition-colors uppercase text-xs tracking-widest"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 font-extrabold hover:text-primary-dark transition-colors uppercase text-xs tracking-widest font-sans"
                >
                  {link.name}
                </Link>
              )
            ))}

            {/* Customer Auth Profile Status (Desktop) */}
            {customer ? (
              <div className="flex items-center space-x-4 border-l pl-6 border-gray-150">
                <Link 
                  to="/connexion" 
                  className="text-xs font-black uppercase text-primary-dark tracking-wider flex items-center gap-1 hover:opacity-85"
                >
                  <User className="w-4 h-4 text-accent" />
                  <span>{customer.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logoutCustomer}
                  className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/connexion"
                className="text-gray-750 font-black hover:text-primary-dark transition-colors uppercase text-xs tracking-widest border border-gray-250 px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <span>👤 Connexion</span>
              </Link>
            )}

            <button onClick={() => setCartOpen(true)} className="relative p-2 text-gray-650 hover:text-primary-dark transition-colors cursor-pointer outline-none">
              <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-primary-dark" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-dark text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-gray-650 cursor-pointer outline-none">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-dark text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                link.path.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-4 text-sm font-extrabold text-gray-700 hover:text-primary-dark hover:bg-primary-light rounded-lg transition-all"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-4 text-sm font-extrabold text-gray-700 hover:text-primary-dark hover:bg-primary-light rounded-lg transition-all"
                  >
                    {link.name}
                  </Link>
                )
              ))}

              {/* Customer Auth Profile Status (Mobile) */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                {customer ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                    <Link
                      to="/connexion"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-extrabold text-[#1E3F37] flex items-center gap-1.5"
                    >
                      <User className="w-4 h-4 text-accent" />
                      <span>{customer.name} (Bénin 🇧🇯)</span>
                    </Link>
                    <button
                      onClick={() => {
                        logoutCustomer();
                        setIsOpen(false);
                      }}
                      className="text-gray-400 hover:text-rose-600 p-1 flex items-center gap-1"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/connexion"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-3 bg-gray-50 border border-gray-200 text-sm font-black text-[#1E3F37] rounded-xl hover:bg-gray-100 transition-all uppercase tracking-wider"
                  >
                    👤 S'inscrire / Se connecter 🇧🇯
                  </Link>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
