/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../CartContext';
import { useUser } from '../UserContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { DELIVERY_FEES } from '../constants';
import { ChevronLeft, Info, CheckCircle2, Navigation, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
let DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer, updateCustomerAddress } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationType, setLocationType] = useState<'COTONOU' | 'OUTSIDE'>('COTONOU'); // mapped to Standard vs Express
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PAYPAL'>('CARD');
  const [markerPos, setMarkerPos] = useState<[number, number]>([6.3676, 2.4252]); // Default: Cotonou, Benin
  const [addressRef, setAddressRef] = useState('');

  // Sync default customer address
  useEffect(() => {
    if (customer?.address) {
      setAddressRef(customer.address);
    }
  }, [customer]);

  const deliveryFee = cartTotal >= DELIVERY_FEES.THRESHOLD_FREE ? 0 : DELIVERY_FEES[locationType];
  const finalTotal = cartTotal + deliveryFee;

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setMarkerPos([pos.coords.latitude, pos.coords.longitude]);
      }, () => {
        alert("Géolocalisation refusée ou indisponible. Vous pouvez cliquer sur la carte.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setLoading(true);

    // Generate organic order number
    const orderNumber = 'YL-' + Math.floor(Math.random() * 1000000);

    // Save default address if they filled a new one
    if (addressRef && (!customer.address || customer.address !== addressRef)) {
      updateCustomerAddress(addressRef);
    }

    // Récupérer l'utilisateur Supabase actuel pour lier la commande (sécurité par utilisateur)
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setLoading(false);
      alert("Votre session a expiré. Reconnectez-vous pour finaliser la commande.");
      navigate('/connexion');
      return;
    }

    const orderRow = {
      user_id: userId,
      order_number: orderNumber,
      items: cart,
      total: finalTotal,
      location: markerPos,
      address: addressRef,
      payment: paymentMethod,
      status: 'pending',
      status_history: [
        {
          status: 'pending',
          date: new Date().toISOString(),
          comment: 'Commande enregistrée avec succès. Notre atelier prépare la validation.',
        },
      ],
      admin_message: '',
      client_message: '',
      client_email: customer.email,
      client_name: customer.name,
      client_phone: customer.phone,
    };

    const { error: insertError } = await supabase.from('orders').insert(orderRow);

    if (insertError) {
      setLoading(false);
      alert("Erreur lors de l'enregistrement de la commande. Réessayez. (" + insertError.message + ")");
      return;
    }

    setTimeout(() => {
      setLoading(false);
      clearCart();
      navigate('/confirmation', { state: { orderNumber } });
    }, 1200);
  };

  if (cart.length === 0) {
    navigate('/produits');
    return null;
  }

  // Mandatory Authentication Interceptor for Yolita ordering
  if (!customer) {
    return (
      <div className="pt-36 pb-24 bg-gradient-to-br from-[#FAFAF5] to-[#eaece6] min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[36px] p-8 md:p-10 border border-gray-100 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-amber-100">
            🔒
          </div>
          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            Connexion Obligatoire
          </span>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-4">
            Compte client requis
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-3 leading-relaxed">
            Pour finaliser votre commande de yaourts artisanaux Yolita, veuillez vous connecter ou créer un compte client en quelques secondes. 
          </p>

          <div className="mt-6 bg-[#FAFAF6] rounded-2xl p-4 border border-gray-150 text-xs text-left text-gray-600 space-y-2 font-semibold">
            <p className="flex items-center gap-2">🇧🇯 <span className="text-[#1E3F37]">Numéro béninois vérifié (commençant par 01)</span></p>
            <p className="flex items-center gap-2">📦 <span className="text-[#1E3F37]">Suivi en temps réel de votre statut de livraison</span></p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate('/connexion?redirect=/commander')}
              className="w-full bg-[#1E3F37] cursor-pointer text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1E3F37]/90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              Se connecter ou S'inscrire <ArrowRight className="w-4 h-4 text-accent" />
            </button>
            <button
              onClick={() => navigate('/produits')}
              className="w-full bg-gray-50 cursor-pointer text-gray-500 py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center justify-center gap-1"
            >
              Retourner aux produits
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/panier')}
          className="flex items-center text-gray-400 hover:text-primary-dark mb-8 font-black uppercase text-xs tracking-widest transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Retour au panier
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-left">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black mb-12 uppercase tracking-tighter text-gray-900">Finaliser la commande</h1>
            <form onSubmit={handleSubmit} className="space-y-12">
              
              <section className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center text-primary-dark">
                    <span className="w-10 h-10 bg-primary/20 text-primary-dark rounded-xl flex items-center justify-center mr-4 text-sm border border-primary/30">1</span>
                    Vos coordonnées
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-1 rounded-md flex items-center gap-1">
                    🟢 Client connecté
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Nom complet</label>
                    <input 
                      type="text" 
                      required 
                      readOnly 
                      value={customer.name}
                      className="w-full px-5 py-4 rounded-2xl border border-border-input bg-gray-50 font-bold text-gray-400 cursor-not-allowed outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Téléphone</label>
                    <input 
                      type="tel" 
                      required 
                      readOnly 
                      value={customer.phone}
                      className="w-full px-5 py-4 rounded-2xl border border-border-input bg-gray-50 font-bold text-gray-400 cursor-not-allowed outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Adresse email</label>
                  <input 
                    type="email" 
                    required 
                    readOnly 
                    value={customer.email}
                    className="w-full px-5 py-4 rounded-2xl border border-border-input bg-gray-50 font-bold text-gray-400 cursor-not-allowed outline-none" 
                  />
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center text-primary-dark">
                  <span className="w-10 h-10 bg-primary/20 text-primary-dark rounded-xl flex items-center justify-center mr-4 text-sm border border-primary/30">2</span>
                  Mode d'expédition
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLocationType('COTONOU')}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all ${
                      locationType === 'COTONOU' ? 'border-primary-dark bg-primary-light' : 'border-border-subtle bg-white hover:border-gray-200'
                    }`}
                  >
                    <p className="font-extrabold uppercase text-xs tracking-wider mb-1">Cotonou (Intra-muros)</p>
                    <p className="text-sm font-black text-primary-dark">{DELIVERY_FEES.COTONOU.toLocaleString('fr-FR')} FCFA</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('OUTSIDE')}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all ${
                      locationType === 'OUTSIDE' ? 'border-primary-dark bg-primary-light' : 'border-border-subtle bg-white hover:border-gray-200'
                    }`}
                  >
                    <p className="font-extrabold uppercase text-xs tracking-wider mb-1">Hors Cotonou (Calavi, Porto-Novo)</p>
                    <p className="text-sm font-black text-primary-dark">{DELIVERY_FEES.OUTSIDE.toLocaleString('fr-FR')} FCFA</p>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs font-black uppercase text-gray-400">Position de livraison</label>
                      <button 
                        type="button"
                        onClick={handleGeolocation}
                        className="flex items-center text-xs font-black text-primary-dark uppercase tracking-widest hover:underline"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Ma position actuelle
                      </button>
                    </div>
                    <div className="h-64 w-full rounded-[32px] overflow-hidden border-4 border-white shadow-sm relative z-0">
                      <MapContainer center={markerPos} zoom={12} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker position={markerPos} setPosition={setMarkerPos} />
                        <MapRecenter position={markerPos} />
                      </MapContainer>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                      Facultatif : Cliquez sur la carte pour affiner l'adresse de livraison
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">Adresse de livraison & Précisions</label>
                    <textarea 
                      required 
                      value={addressRef}
                      onChange={(e) => setAddressRef(e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl border border-border-input bg-white focus:ring-2 focus:ring-primary-dark outline-none transition-all resize-none font-medium text-gray-800" 
                      placeholder="Ex: Quartier Fidjrossè, Cotonou, en face de la pharmacie, Maison numéro 12"
                    ></textarea>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center text-primary-dark">
                  <span className="w-10 h-10 bg-primary/20 text-primary-dark rounded-xl flex items-center justify-center mr-4 text-sm border border-primary/30">3</span>
                  Paiement sécurisé
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all flex items-center ${
                      paymentMethod === 'CARD' ? 'border-primary-dark bg-primary-light' : 'border-border-subtle bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${paymentMethod === 'CARD' ? 'bg-primary-dark text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold uppercase text-[11px] tracking-wider text-gray-800">MTN Mobile Money</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Payer par MTN MoMo</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all flex items-center ${
                      paymentMethod === 'PAYPAL' ? 'border-primary-dark bg-primary-light' : 'border-border-subtle bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${paymentMethod === 'PAYPAL' ? 'bg-primary-dark text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold uppercase text-[11px] tracking-wider text-gray-800">Moov Money / Flooz</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Paiement Mobile Flooz</p>
                    </div>
                  </button>
                </div>
              </section>

              <button
                disabled={loading}
                className="w-full bg-primary-dark text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Sécurisation de la commande...' : 'Confirmer et Payer'}
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-cart-bg p-8 rounded-[40px] shadow-sm border border-border-subtle sticky top-32 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 yolita-pattern opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tight relative z-10 text-gray-900">Récapitulatif</h2>
              <ul className="space-y-5 mb-8 relative z-10">
                {cart.map((item) => (
                  <li key={item.cartItemId} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 font-medium text-left pr-4">
                      <span className="font-black text-primary-dark mr-1.5">{item.quantity}x</span> 
                      <span className="font-extrabold text-gray-800 block text-xs uppercase tracking-tight">{item.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedFruits && item.selectedFruits.length > 0 ? (
                          item.selectedFruits.map((fruit, idx) => (
                            <span key={idx} className="text-[9px] text-[#1E3F37] font-black bg-[#FFF5F0] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#E58C65]/20">
                              🍓 {fruit.split(' ')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-[#1E3F37] font-black bg-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider border border-accent/20">
                            🌸 {item.selectedAroma}
                          </span>
                        )}
                        {item.selectedCapacity && (
                          <span className="text-[9px] text-[#1E3F37] font-black bg-primary/25 px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/30">
                            🥛 {item.selectedCapacity}
                          </span>
                        )}
                        {item.isDiy && (
                          <>
                            <span className="text-[9px] text-[#1E3F37] font-black bg-[#F0F7F5] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#85C0B4]/30">
                              🥣 {item.selectedBase}
                            </span>
                            <span className="text-[9px] text-amber-800 font-black bg-[#FFF9E6] px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                              {item.isSweetened ? '🍯 Sucré' : '🍃 Nature'}
                            </span>
                          </>
                        )}
                      </div>
                    </span>
                    <span className="font-black text-gray-800 shrink-0 text-right">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} <span className="text-[10px] opacity-80 uppercase font-black">FCFA</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 pt-8 cart-dash-border mt-8 relative z-10 border-t border-border-subtle">
                <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Sous-total</span>
                  <span className="text-gray-900 font-black">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Frais de Livraison</span>
                  <span className="text-gray-900 font-black text-right">
                    {deliveryFee === 0 ? <span className="text-accent bg-accent/20 px-2 py-1 rounded-full text-[10px] font-black border border-accent/40">OFFERTS</span> : `${deliveryFee.toLocaleString('fr-FR')} FCFA`}
                  </span>
                </div>
                <div className="pt-8 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total à régler</p>
                    <p className="text-3xl font-black text-primary-dark">{finalTotal.toLocaleString('fr-FR')} <span className="text-xs uppercase font-black opacity-80">FCFA</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-white rounded-[32px] border border-primary/20 flex items-start shadow-sm relative z-10 text-left">
                <Info className="w-5 h-5 text-primary-dark mr-4 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Votre santé est notre priorité absolue. Nos pots sont scellés hermétiquement et livrés frais sous atmosphère contrôlée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
