import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants';

interface ProductContextType {
  products: Product[];
  updateProduct: (updatedProduct: Product) => void;
  resetProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('yolita_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const newProducts = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      localStorage.setItem('yolita_products', JSON.stringify(newProducts));
      return newProducts;
    });
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('yolita_products');
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct, resetProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
