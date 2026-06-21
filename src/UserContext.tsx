/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateCreated: string;
}

interface UserContextType {
  customer: Customer | null;
  registerCustomer: (name: string, email: string, phone: string, address?: string) => { success: boolean; error?: string };
  loginCustomer: (email: string, phone: string) => { success: boolean; error?: string };
  logoutCustomer: () => void;
  updateCustomerAddress: (address: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function validateBeninPhone(phone: string): { isValid: boolean; message: string; formatted: string } {
  const digitsOnly = phone.replace(/[^0-9+]/g, ''); // keep numbers and optional +
  let rawDigits = digitsOnly;
  
  if (digitsOnly.startsWith('+229')) {
    rawDigits = digitsOnly.slice(4); // Remove prefix
    if (!rawDigits.startsWith('01')) {
      return {
        isValid: false,
        message: "Les numéros béninois sous format international (+229) doivent commencer par +229 01.",
        formatted: phone
      };
    }
  } else if (digitsOnly.startsWith('229')) {
    rawDigits = digitsOnly.slice(3);
    if (!rawDigits.startsWith('01')) {
      return {
        isValid: false,
        message: "Les numéros béninois doivent commencer par 01 après l'indicatif 229.",
        formatted: phone
      };
    }
  } else {
    if (!digitsOnly.startsWith('01')) {
      return {
        isValid: false,
        message: "Au Bénin, tous les numéros de téléphone mobiles doivent obligatoirement commencer par 01 !",
        formatted: phone
      };
    }
  }

  // The remaining digits (or the phone if no 229 prefix) should match the 10-digit plan starting with 01.
  if (rawDigits.length !== 10) {
    return {
      isValid: false,
      message: `Le numéro doit comporter exactement 10 chiffres (au format 01 XX XX XX XX). Actuellement : ${rawDigits.length} chiffres.`,
      formatted: phone
    };
  }

  // Format it nicely for Benin: 01 XX XX XX XX
  const part1 = rawDigits.slice(0, 2); // 01
  const part2 = rawDigits.slice(2, 4);
  const part3 = rawDigits.slice(4, 6);
  const part4 = rawDigits.slice(6, 8);
  const part5 = rawDigits.slice(8, 10);
  const formatted = `${part1} ${part2} ${part3} ${part4} ${part5}`;

  return {
    isValid: true,
    message: "Numéro béninois valide ! 🇧🇯",
    formatted: `+229 ${formatted}`
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load logged in state on mount
  useEffect(() => {
    const saved = localStorage.getItem('yolita_logged_customer');
    if (saved) {
      try {
        setCustomer(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('yolita_logged_customer');
      }
    }
  }, []);

  const registerCustomer = (name: string, email: string, phone: string, address?: string) => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
    }

    // Benin phone rule: first digit must start with 01
    const validation = validateBeninPhone(phone);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    const customersList: Customer[] = JSON.parse(localStorage.getItem('yolita_registered_customers') || '[]');
    
    // Check if email already registered
    const exists = customersList.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { success: false, error: "Cette adresse email est déjà enregistrée. Connectez-vous plutôt !" };
    }

    const newCustomer: Customer = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: validation.formatted,
      address: address?.trim() || '',
      dateCreated: new Date().toISOString()
    };

    // Save user list and session
    localStorage.setItem('yolita_registered_customers', JSON.stringify([...customersList, newCustomer]));
    localStorage.setItem('yolita_logged_customer', JSON.stringify(newCustomer));
    setCustomer(newCustomer);

    return { success: true };
  };

  const loginCustomer = (email: string, phone: string) => {
    if (!email.trim() || !phone.trim()) {
      return { success: false, error: "Veuillez saisir votre email et votre numéro de téléphone pour vous connecter." };
    }

    const customersList: Customer[] = JSON.parse(localStorage.getItem('yolita_registered_customers') || '[]');
    const cleanEmail = email.trim().toLowerCase();
    
    // Support loose phone validation matches
    const validation = validateBeninPhone(phone);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    const found = customersList.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    if (!found) {
      return { 
        success: false, 
        error: "Aucun compte client trouvé avec cet email. Veuillez créer un compte (S'inscrire) !" 
      };
    }

    // Connect user
    localStorage.setItem('yolita_logged_customer', JSON.stringify(found));
    setCustomer(found);
    return { success: true };
  };

  const logoutCustomer = () => {
    localStorage.removeItem('yolita_logged_customer');
    setCustomer(null);
  };

  const updateCustomerAddress = (address: string) => {
    if (!customer) return;
    const updated = { ...customer, address };
    setCustomer(updated);
    localStorage.setItem('yolita_logged_customer', JSON.stringify(updated));

    // Also update in registered list
    const customersList: Customer[] = JSON.parse(localStorage.getItem('yolita_registered_customers') || '[]');
    const updatedList = customersList.map((c) => c.email === customer.email ? { ...c, address } : c);
    localStorage.setItem('yolita_registered_customers', JSON.stringify(updatedList));
  };

  return (
    <UserContext.Provider value={{ customer, registerCustomer, loginCustomer, logoutCustomer, updateCustomerAddress }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
