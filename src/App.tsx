/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { SiteConfigProvider } from './SiteConfigContext';
import { UserProvider } from './UserContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SidebarCart from './components/SidebarCart';
import Home from './pages/Home';
import Store from './pages/Store';
import Contact from './pages/Contact';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import AdminDashboard from './pages/AdminDashboard';
import Connexion from './pages/Connexion';
import Profil from './pages/Profil';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SidebarCart />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    // L'espace admin a sa propre interface, totalement séparée du site client
    // (pas de Navbar/Footer/Panier client).
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produits" element={<Store />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/commander" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </CustomerLayout>
  );
}

export default function App() {
  return (
    <SiteConfigProvider>
      <UserProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </UserProvider>
    </SiteConfigProvider>
  );
}
