/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, Sparkles, Sprout, ShieldCheck, Smile, Check, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';
import ProductCard from '../components/ProductCard';
import { useCart } from '../CartContext';

const aromaVisuals: Record<string, { emoji: string, bg: string, accent: string }> = {
  'Fraise sauvage': { emoji: '🍓', bg: '#FDF0F2', accent: '#E58C65' },
  'Framboise douce': { emoji: '🍇', bg: '#FBF0F5', accent: '#D4798F' },
  'Mangue de Cotonou': { emoji: '🥭', bg: '#FFF9E6', accent: '#F5B041' },
  'Vanille parfumée': { emoji: '🍦', bg: '#FAF9F5', accent: '#F4D03F' },
  'Noix de Coco fraîche': { emoji: '🥥', bg: '#F4FAF8', accent: '#85C0B4' },
  'Pêche veloutée': { emoji: '🍑', bg: '#FFF5F0', accent: '#E58C65' },
  'Citron vert pétillant': { emoji: '🍋', bg: '#F5FCF2', accent: '#2ECC71' },
};

export default function Home() {
  const { addToCart } = useCart();
  const { config } = useSiteConfig();
  const products = config.products;
  const CAPACITIES = config.capacities;
  const DIY_BASES = config.diyBases;
  const DIY_AROMAS = config.diyAromas;
  
  // Custom Yogurt Builder state (Option B - Multiple Fruits support)
  const [diyBase, setDiyBase] = useState(DIY_BASES[0]);
  const [diyCapacity, setDiyCapacity] = useState(CAPACITIES[1]); // Default Petit (125 ml)
  const [diyFruits, setDiyFruits] = useState<string[]>(['Mangue de Cotonou']);
  const [diyIsSweet, setDiyIsSweet] = useState(false);
  const [diyQuantity, setDiyQuantity] = useState(1);
  const [diyAdded, setDiyAdded] = useState(false);

  const toggleDiyFruit = (fruitName: string) => {
    setDiyFruits((prev) => {
      if (prev.includes(fruitName)) {
        if (prev.length === 1) return prev; // Require at least one fruit
        return prev.filter((f) => f !== fruitName);
      } else {
        if (prev.length >= 3) return prev; // Limit to max 3 fruits for tasty blending
        return [...prev, fruitName];
      }
    });
  };

  const fruitsPriceAdd = diyFruits.reduce((sum, fruitName) => {
    const aromaObj = DIY_AROMAS.find((a) => a.name === fruitName);
    return sum + (aromaObj ? aromaObj.priceAdd : 0);
  }, 0);
  const mixerFee = diyFruits.length > 1 ? 150 : 0; // Extra work for delicious mixed recipes
  const singleDiyPrice = Math.max(500, diyCapacity.customBasePrice + diyBase.priceAdd + fruitsPriceAdd + (diyIsSweet ? 100 : 0) + mixerFee);
  const totalDiyPrice = singleDiyPrice * diyQuantity;

  const handleAddDiy = () => {
    const fruitsStr = diyFruits.join(' + ');
    const isMixed = diyFruits.length > 1;
    const virtualProduct = {
      id: 'diy-yogurt',
      name: isMixed ? `Yolita Duo/Mixte Tropical` : `Mon Yaourt Récré Yolita`,
      price: singleDiyPrice,
      description: `Création personnalisée : Base ${diyBase.name}, fruits : ${fruitsStr}, ${diyIsSweet ? 'légèrement sucré au miel' : 'sans sucre ajouté (nature)'}.`,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
      category: 'nature' as const
    };
    
    addToCart(
      virtualProduct,
      fruitsStr,
      diyQuantity,
      diyCapacity.name,
      true, // isDiy
      {
        base: diyBase.name,
        isSweetened: diyIsSweet,
        price: singleDiyPrice,
        fruits: diyFruits
      }
    );
    
    setDiyAdded(true);
    setTimeout(() => setDiyAdded(false), 2000);
  };

  const testimonials = [
    { name: 'Koffi', location: 'Cotonou', text: 'Une texture onctueuse divine et un vrai goût de fruit frais. Yolita, c\'est mon plaisir sain après le travail ou le sport !', stars: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Sena', location: 'Calavi', text: 'J\'adore le fait qu\'il n\'y ait aucun sucre ajouté. Mes enfants l\'adorent pour le goûter, c\'est ultra frais, léger et très sain.', stars: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { name: 'Farida', location: 'Parakou', text: 'Une douceur absolue. Mention spéciale pour le parfum Mangue et de fruits tropicaux locaux, un véritable régal !', stars: 5, avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200' },
  ];

  const valueProps = [
    { 
      icon: <Sprout className="w-6 h-6 text-mint-dark" />, 
      title: "100% Naturel & Bio", 
      desc: "Des ingrédients savamment dosés, sans aucun colorant artificiel ni conservateur." 
    },
    { 
      icon: <Heart className="w-6 h-6 text-primary-dark" />, 
      title: "Sans Sucres Ajoutés", 
      desc: "Juste la sucrosité naturelle et douce des délicieux fruits tropicaux mûrs." 
    },
    { 
      icon: <ShieldCheck className="w-6 h-6 text-primary-dark" />, 
      title: "Conçu au Bénin 🇧🇯", 
      desc: "Fabriqué avec passion à Cotonou avec des ingrédients frais issus de coopératives locales." 
    },
  ];

  return (
    <div className="pt-20 bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-8 pb-20 md:py-24 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text content */}
          <div className="lg:col-span-7 space-y-8 relative z-10 text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/20 text-primary-dark px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/30"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Nouveau : Pack Duo Fruité disponible !
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05]"
            >
              Yolita <span className="text-primary-dark block font-black">– Le yaourt qui te veut du bien</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-xl font-medium"
            >
              Découvrez l'onctuosité d'un yaourt bio brassé aux vraies fraises des bois et framboises sauvages. Un flacon de pure fraîcheur pour rayonner toute la journée !
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <Link
                to="/produits"
                className="bg-primary-dark text-white px-10 py-5 rounded-full font-extrabold uppercase tracking-widest text-sm hover:bg-primary-dark/80 active:scale-95 transition-all shadow-xl shadow-primary/40 flex items-center group"
              >
                Découvrir la gamme <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#histoire"
                className="bg-white/90 backdrop-blur-sm text-gray-700 hover:text-primary-dark border-2 border-primary-dark/20 px-10 py-5 rounded-full font-extrabold uppercase tracking-widest text-xs hover:bg-primary-light transition-all shadow-sm"
              >
                Notre Histoire
              </a>
            </motion.div>

            {/* Micro Badges in Hero */}
            <div className="pt-8 border-t border-primary/20 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent"></span> 100% Bio & Sain
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-dark"></span> Sans sucre ajouté
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-dark"></span> Recette Locale 🇧🇯
              </div>
            </div>
          </div>

          {/* Interactive Centerpiece Mockup (Stylized Pink Yogurt Jar) */}
          <div className="lg:col-span-5 relative h-[320px] sm:h-[400px] lg:h-[450px] flex items-center justify-center mt-8 lg:mt-0">
            
            {/* Soft pink ambient circles */}
            <div className="absolute w-72 h-72 bg-primary/30 rounded-full blur-[60px] animate-pulse"></div>
            <div className="absolute w-48 h-48 bg-accent/20 rounded-full blur-[45px] -translate-x-10 translate-y-10"></div>
            
            {/* Main stylized pot container */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="relative w-60 h-[280px] sm:w-72 sm:h-[340px] bg-white rounded-[60px] shadow-[0_20px_60px_rgba(212,121,143,0.15)] border-[8px] border-primary-light p-6 flex flex-col justify-between items-center text-center overflow-hidden"
            >
              {/* Top soft lid accent */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-primary rounded-t-[40px]"></div>
              
              {/* Content of the jar */}
              <div className="pt-6">
                <span className="bg-accent text-mint-dark px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                  BIO & CRÉMEUX
                </span>
              </div>

              {/* Yolita Label Design */}
              <div className="my-auto space-y-2">
                <h2 className="text-4xl font-extrabold text-primary-dark tracking-tighter uppercase">
                  Yolita
                </h2>
                <div className="h-0.5 w-12 bg-primary-dark mx-auto rounded-full"></div>
                <p className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">
                  Fraise Sauvage
                </p>
              </div>

              {/* Illustrated Strawberry in Jar */}
              <div className="relative pb-6">
                <div className="text-4xl animate-bounce">🍓</div>
              </div>

              {/* Bottom tag */}
              <div className="pb-2 text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                Lait de pâturage • 150g
              </div>
            </motion.div>

            {/* Floating elements (fruits, leaves) */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-16 right-8 text-4xl cursor-pointer"
              title="Fraise des bois"
            >
              🍓
            </motion.div>

            <motion.div 
              animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-12 left-12 text-3xl cursor-pointer"
              title="Framboise sauvage"
            >
              🍇
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 left-4 text-2xl"
              title="Menthe fraîche"
            >
              🌿
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute bottom-16 right-16 text-2xl"
            >
              ✨
            </motion.div>
          </div>
          
        </div>
      </section>

      {/* Fresh Young Women eating yogurt (Grid Section) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-[40px] overflow-hidden aspect-[4/5] shadow-lg border-4 border-primary-light"
              >
                <img 
                  src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500" 
                  alt="Yaourt Artisanal Fruitier Yolita" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="space-y-4 pt-12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-[40px] overflow-hidden aspect-square shadow-lg border-4 border-accent/20"
                >
                  <img 
                    src="/images/yolita-pots-bocaux.jpeg" 
                    alt="Pots de yaourt Yolita en bocaux" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <div className="bg-primary-light p-6 rounded-[32px] border border-primary/20 text-center">
                  <p className="text-2xl font-black text-primary-dark">100%</p>
                  <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest mt-1">Énergie Naturelle</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-8 text-left">
              <span className="bg-primary text-primary-dark px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                LA YOLITA ATTITUDE
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Une fraîcheur pétillante pour rayonner au naturel
              </h2>
              <p className="text-gray-600 text-lg font-medium leading-relaxed">
                Yolita est faite pour tous ceux et celles qui croquent la vie à pleines dents. Nous croyons que la joie de vivre passe par une alimentation sincère, colorée et naturelle. C'est pourquoi nous créons des recettes réconfortantes, douces comme des nuages, à consommer n'importe où, n'importe quand !
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-5 bg-secondary rounded-[24px] border border-border-subtle">
                  <h4 className="font-extrabold text-gray-900 mb-1">Sans additif</h4>
                  <p className="text-xs text-gray-500 font-medium">Zéro conservateur, juste le goût originel cultivé sainement.</p>
                </div>
                <div className="p-5 bg-secondary rounded-[24px] border border-border-subtle">
                  <h4 className="font-extrabold text-gray-900 mb-1">Bocaux recyclés</h4>
                  <p className="text-xs text-gray-500 font-medium">Nos flacons en verre sont recyclables et upcyclables à l'infini.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Value Prop Banner */}
      <section className="py-16 bg-secondary border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="flex gap-4 items-start text-left">
                <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle flex items-center justify-center shrink-0">
                  {prop.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-1 text-sm uppercase tracking-wider">{prop.title}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div className="text-left">
              <span className="text-xs font-black text-primary-dark uppercase tracking-widest bg-primary/20 px-3 py-1 rounded-full mb-2 inline-block">
                NOTRE COLLECTION FRAÎCHE
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Nos Recettes Onctueuses</h2>
            </div>
            <Link 
              to="/produits" 
              className="text-primary-dark font-black uppercase text-xs tracking-widest hover:underline flex items-center group"
            >
              Voir toute la boutique <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Option B: Composer son Yaourt */}
      <section className="py-24 bg-white border-t border-border-subtle relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 yolita-pattern opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-accent bg-accent/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-accent/20 inline-block mb-3">
              🌸 OPTION B : COMPOSITION UNIQUE OU MIXTE
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">
              Compose Ton Yaourt Sur-Mesure !
            </h2>
            <p className="text-gray-500 font-medium text-base mt-2 max-w-xl mx-auto">
              Chaque cuillère est une aventure. Choisis ta base, ta capacité, un ou plusieurs fruits tropicaux à mixer ensemble, et ton niveau de douceur.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Beautiful live illustration of the user's custom jar */}
            <div className="lg:col-span-5 sticky top-28 bg-secondary p-8 rounded-[40px] border border-border-subtle text-center flex flex-col items-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#1E3F37] mb-6 bg-white border border-border-subtle px-4 py-1.5 rounded-full shadow-sm">
                Visualisation de ta création
              </span>
              
              {/* Custom Animated Pot */}
              <div 
                className="relative w-56 h-[280px] rounded-[52px] border-8 border-white shadow-xl transition-all duration-500 flex flex-col justify-between items-center text-center overflow-hidden mb-6"
                style={{
                  backgroundColor: aromaVisuals[diyFruits[0]]?.bg || '#FFF',
                  borderColor: aromaVisuals[diyFruits[0]]?.accent || '#85C0B4',
                }}
              >
                {/* Lid indicating size */}
                <div 
                  className="w-full py-1.5 text-[8px] font-black text-white uppercase tracking-widest text-center transition-all duration-300"
                  style={{ backgroundColor: aromaVisuals[diyFruits[0]]?.accent || '#85C0B4' }}
                >
                  {diyCapacity.volume}
                </div>

                {/* Base badge in container */}
                <div className="pt-2">
                  <span className="bg-white/80 backdrop-blur-sm text-gray-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-gray-100">
                    {diyBase.name}
                  </span>
                </div>

                {/* Main Label */}
                <div className="my-auto space-y-1.5 px-4 w-full">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    Yolita
                  </h3>
                  <div className="h-0.5 w-12 bg-gray-900/20 mx-auto rounded-full"></div>
                  <p className="text-[10px] text-gray-700 font-extrabold uppercase tracking-tight leading-tight line-clamp-2 px-1">
                    {diyFruits.length > 1 ? `Mixte : ${diyFruits.map(f => f.split(' ')[0]).join(' + ')}` : diyFruits[0]}
                  </p>
                  <p className="text-[8px] bg-white/60 text-gray-500 font-bold px-2 py-0.5 rounded-full inline-block">
                    {diyIsSweet ? '🍯 Sucre de Miel' : '🍃 Aucun sucre ajouté'}
                  </p>
                </div>

                {/* Flavor Emojis */}
                <div className="pb-4 text-3xl select-none animate-bounce flex items-center justify-center gap-1">
                  {diyFruits.map((f) => aromaVisuals[f]?.emoji || '🥛').join(' ')}
                </div>

                {/* Slogan */}
                <div className="pb-2 text-[6px] text-gray-400 font-bold uppercase tracking-widest">
                  Fait avec amour au Bénin 🇧🇯
                </div>
              </div>

              {/* Dynamic pricing and action */}
              <div className="w-full space-y-4 pt-4 border-t border-border-subtle">
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Prix unitaire</p>
                    <p className="text-2xl font-black text-[#1E3F37]">
                      {singleDiyPrice.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total ({diyQuantity}x)</p>
                    <p className="text-3xl font-black text-[#1E3F37]">
                      {totalDiyPrice.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                    </p>
                  </div>
                </div>

                {diyFruits.length > 1 && (
                  <div className="text-left bg-[#F0F7F5] rounded-xl p-2.5 border border-emerald-150 text-[10px] font-medium text-emerald-800 flex items-center gap-1.5 leading-snug">
                    ✨ <span className="font-bold">Mélange mixte activé :</span> Supplément de 150 FCFA inclus pour la préparation artisanale de vos fruits combinés.
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <div className="flex items-center bg-white rounded-xl p-1 border border-border-subtle shadow-sm shrink-0">
                    <button 
                      onClick={() => setDiyQuantity(Math.max(1, diyQuantity - 1))}
                      className="w-8 h-8 rounded-lg bg-secondary text-gray-600 hover:text-primary-dark flex items-center justify-center font-black"
                    >
                      -
                    </button>
                    <span className="font-extrabold px-3 text-sm text-gray-700">{diyQuantity}</span>
                    <button 
                      onClick={() => setDiyQuantity(diyQuantity + 1)}
                      className="w-8 h-8 rounded-lg bg-secondary text-gray-600 hover:text-primary-dark flex items-center justify-center font-black"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddDiy}
                    className={`flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                      diyAdded 
                        ? 'bg-accent text-[#1E3F37]' 
                        : 'bg-[#1E3F37] text-white hover:bg-[#1E3F37]/85'
                    }`}
                  >
                    {diyAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Ajouté !
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Ajouter ma création
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Step-by-step customization panel */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Step 1: Base selection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#1E3F37] text-white text-xs font-black flex items-center justify-center">1</span>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Choisis ta Base de Yaourt</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DIY_BASES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setDiyBase(b)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        diyBase.id === b.id 
                          ? 'border-[#1E3F37] bg-[#F0F7F5] shadow-sm' 
                          : 'border-border-subtle bg-white hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-extrabold text-xs uppercase tracking-tight text-gray-900 mb-1">{b.name}</h4>
                      <p className="text-[10px] text-gray-400 leading-snug mb-3 font-medium">{b.desc}</p>
                      <span className="text-[10px] font-black text-[#1E3F37] bg-white px-2 py-1 rounded-md border border-border-subtle">
                        {b.priceAdd === 0 ? 'Inclus' : `+${b.priceAdd} FCFA`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Capacity selection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#1E3F37] text-white text-xs font-black flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Sélectionne la Capacité / Format</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {CAPACITIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setDiyCapacity(c)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        diyCapacity.id === c.id 
                          ? 'border-[#1E3F37] bg-[#F0F7F5] shadow-sm' 
                          : 'border-border-subtle bg-white hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-black text-gray-900 block">{c.volume}</span>
                      <span className="text-[9px] text-gray-400 block font-bold leading-tight my-1.5 h-6 overflow-hidden uppercase">{c.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-black text-[#1E3F37] block">
                        {c.customBasePrice} FCFA
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Mixed Aroma selection */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E3F37] text-white text-xs font-black flex items-center justify-center">3</span>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Arômes & Fruits (Compose ton mélange !)</h3>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-4 italic">
                  💡 Astuce : Choisis de <span className="font-bold text-[#1E3F37]">1 à 3 fruits</span> pour créer une alliance unique de fruits mixtes !
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DIY_AROMAS.map((a) => {
                    const isSelected = diyFruits.includes(a.name);
                    const visual = aromaVisuals[a.name] || { emoji: '🥛', bg: '#FFF' };
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggleDiyFruit(a.name)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 relative overflow-hidden ${
                          isSelected 
                            ? 'border-[#1E3F37] shadow-sm' 
                            : 'border-border-subtle hover:border-gray-200 bg-white'
                        }`}
                        style={{ backgroundColor: isSelected ? visual.bg : '#FFF' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{visual.emoji}</span>
                          <div>
                            <p className="text-[11px] font-extrabold text-gray-900 leading-tight">{a.name.split(' ')[0]}</p>
                            <p className="text-[9px] text-gray-400 font-bold">
                              {a.priceAdd === 0 ? 'Gratuit' : `+${a.priceAdd} F`}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 w-4 h-4 bg-[#1E3F37] rounded-full flex items-center justify-center text-white text-[8px] font-black">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Sweetener preference */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#1E3F37] text-white text-xs font-black flex items-center justify-center">4</span>
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider">Douceur & Sucrosité</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDiyIsSweet(false)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      !diyIsSweet 
                        ? 'border-[#1E3F37] bg-[#F0F7F5] shadow-sm' 
                        : 'border-border-subtle bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-extrabold text-xs uppercase tracking-tight text-gray-900">🍃 Aucun sucre ajouté (100% Naturel)</h4>
                      {!diyIsSweet && <Check className="w-4 h-4 text-[#1E3F37]" />}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      Zéro sucre blanc, zéro miel. Juste la fraîcheur des fruits tropicaux mûrs. Moins calorique et ultra-sain !
                    </p>
                  </button>
                  <button
                    onClick={() => setDiyIsSweet(true)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      diyIsSweet 
                        ? 'border-[#1E3F37] bg-[#F0F7F5] shadow-sm' 
                        : 'border-border-subtle bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-extrabold text-xs uppercase tracking-tight text-gray-900">🍯 Légèrement Sucré (+100 FCFA)</h4>
                      {diyIsSweet && <Check className="w-4 h-4 text-[#1E3F37]" />}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      Sucré en douceur avec du miel naturel doré récolté localement par des coopératives béninoises engagées.
                    </p>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Slogan big section with pink jar pattern */}
      <section id="histoire" className="py-24 bg-primary-light relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 yolita-pattern"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full text-xl mb-6 shadow-sm">
            🌸
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 uppercase mb-6 leading-tight">
            Notre Histoire
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed text-left">
            Yolita est née d'une passion toute simple : mon amour pour le yaourt.
          </p>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed text-left">
            Depuis toujours, j'ai aimé le yaourt, mais celui qui m'a vraiment marquée est celui que préparait ma mère. Contrairement à beaucoup de yaourts que l'on trouve dans le commerce, souvent très liquides et parfois trop sucrés, le sien était naturellement doux, onctueux et généreux. Chaque gorgée avait le goût du fait maison, de la qualité et du savoir-faire.
          </p>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed text-left">
            En grandissant, j'ai réalisé que beaucoup de personnes recherchaient cette même authenticité : un yaourt plus épais, plus gourmand, préparé avec soin et sans excès de sucre. C'est cette envie qui a donné naissance à Yolita.
          </p>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed text-left">
            Mais je voulais aller encore plus loin. J'aime créer, expérimenter et découvrir de nouvelles saveurs. L'idée d'intégrer des fruits est venue naturellement. Les fruits apportent de la fraîcheur, de la couleur et permettent à chacun de vivre une expérience unique.
          </p>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-6 leading-relaxed text-left">
            Chez Yolita, nous croyons que chaque personne a ses propres goûts. C'est pourquoi nous proposons la possibilité de composer son yaourt selon ses envies, en choisissant les saveurs et les fruits qui lui correspondent le mieux.
          </p>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-left">
            Yolita, c'est donc bien plus qu'un simple yaourt : c'est le mélange d'un souvenir d'enfance, d'une passion pour les saveurs authentiques et d'une envie de laisser chaque client créer son propre moment de plaisir.
          </p>
          <Link
            to="/produits"
            className="inline-flex items-center bg-primary-dark text-white px-10 py-5 rounded-full font-extrabold uppercase tracking-widest text-xs hover:bg-primary-dark/80 transition-all shadow-xl shadow-primary/30"
          >
            Découvrir la gamme de bocaux
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white text-gray-900 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-primary-dark uppercase tracking-widest bg-primary/20 px-3 py-1 rounded-full mb-3 inline-block">
              LA COMMUNAUTÉ GOURMANDE
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight">Tout le monde adore Yolita !</h2>
            <p className="text-gray-500 font-medium mt-1">Le coup de foudre velouté partagé par toute la maisonnée.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-secondary p-8 rounded-[36px] border border-border-subtle flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex text-primary-dark mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 font-medium mb-6 italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-primary">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
