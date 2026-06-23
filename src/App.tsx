/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <SiteConfigProvider>
      <UserProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <SidebarCart />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/produits" element={<Store />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/panier" element={<CartPage />} />
                <Route path="/commander" element={<Checkout />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/connexion" element={<Connexion />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </UserProvider>
    </SiteConfigProvider>
  );
}
