/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { CAPACITIES } from '../constants';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAroma, setSelectedAroma] = useState(product.aromas?.[0] || 'Nature');
  const [selectedCapacity, setSelectedCapacity] = useState('Petit (125 ml)');
  const [added, setAdded] = useState(false);

  const isPack = product.id.includes('pack');

  const capOption = CAPACITIES.find((c) => c.name === selectedCapacity);
  const factor = capOption ? capOption.priceFactor : 1.0;
  const currentPrice = isPack ? product.price : Math.max(500, Math.round((product.price * factor) / 50) * 50);

  const handleAdd = () => {
    addToCart(product, selectedAroma, quantity, isPack ? 'Standard' : selectedCapacity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card group bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-border-subtle text-center flex flex-col"
    >
      <div className="relative mb-6">
        {product.badge && (
          <span className="bg-primary/20 text-primary-dark text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
            {product.badge}
          </span>
        )}
        <div className="aspect-square w-32 h-32 mx-auto rounded-full bg-primary-light overflow-hidden border-4 border-white shadow-sm mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <h3 className="text-lg font-black text-gray-900 mb-1">{product.name}</h3>
      <p className="text-gray-500 text-xs mb-6 px-2 leading-relaxed">{product.description}</p>

      <div className="mt-auto">
        {!isPack && (
          <div className="mb-4 text-left">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 px-1 tracking-wider">
              Capacité / Format
            </label>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full bg-secondary text-gray-800 text-xs font-extrabold py-3 px-4 rounded-xl border border-border-subtle focus:ring-2 focus:ring-primary-dark outline-none transition-all cursor-pointer shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%231e3f37' stroke-width='3'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat' }}
            >
              {CAPACITIES.map((cap) => (
                <option key={cap.id} className="font-extrabold text-xs" value={cap.name}>
                  {cap.name} - {cap.desc}
                </option>
              ))}
            </select>
          </div>
        )}

        {product.aromas && product.aromas.length > 0 && (
          <div className="mb-6 text-left">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 px-1 tracking-wider">
              Parfum / arôme
            </label>
            <select
              value={selectedAroma}
              onChange={(e) => setSelectedAroma(e.target.value)}
              className="w-full bg-secondary text-gray-800 text-xs font-extrabold py-3 px-4 rounded-xl border border-border-subtle focus:ring-2 focus:ring-primary-dark outline-none transition-all cursor-pointer shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%231e3f37' stroke-width='3'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat' }}
            >
              {product.aromas.map((ar) => (
                <option key={ar} className="font-extrabold" value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-center space-x-4 mb-6">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full border border-border-subtle bg-white flex items-center justify-center text-gray-500 hover:border-primary-dark hover:text-primary-dark transition-all shadow-sm"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-extrabold w-4 text-gray-700">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-full border border-border-subtle bg-white flex items-center justify-center text-gray-500 hover:border-primary-dark hover:text-primary-dark transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 border-t border-border-subtle">
          <p className="text-2xl font-black text-primary-dark mb-4">
            {currentPrice.toLocaleString('fr-FR')} <span className="text-xs uppercase font-black opacity-80">FCFA</span>
          </p>
          <button
            onClick={handleAdd}
            className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-sm ${
              added
                ? 'bg-accent text-mint-dark font-black'
                : 'bg-primary-dark text-white hover:bg-primary-dark/80 hover:shadow-md'
            }`}
          >
            {added ? 'Ajouté ✔' : 'Ajouter au bocal'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
