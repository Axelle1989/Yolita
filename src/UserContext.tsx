/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateCreated: string;
  emailConfirmed: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface UserContextType {
  customer: Customer | null;
  loading: boolean;
  registerCustomer: (
    name: string,
    email: string,
    phone: string,
    password: string,
    address?: string
  ) => Promise<AuthResult>;
  loginCustomer: (email: string, password: string) => Promise<AuthResult>;
  resendConfirmationEmail: (email: string) => Promise<AuthResult>;
  logoutCustomer: () => Promise<void>;
  updateCustomerAddress: (address: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function validateBeninPhone(phone: string): { isValid: boolean; message: string; formatted: string } {
  const digitsOnly = phone.replace(/[^0-9+]/g, '');
  let rawDigits = digitsOnly;

  if (digitsOnly.startsWith('+229')) {
    rawDigits = digitsOnly.slice(4);
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

  if (rawDigits.length !== 10) {
    return {
      isValid: false,
      message: `Le numéro doit comporter exactement 10 chiffres (au format 01 XX XX XX XX). Actuellement : ${rawDigits.length} chiffres.`,
      formatted: phone
    };
  }

  const part1 = rawDigits.slice(0, 2);
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

function mapSupabaseError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes('Email not confirmed')) {
    return "Votre email n'est pas encore confirmé. Vérifiez votre boîte mail (et vos spams) pour le lien de confirmation.";
  }
  if (message.includes('User already registered') || message.includes('already registered')) {
    return "Cette adresse email est déjà enregistrée. Connectez-vous plutôt !";
  }
  if (message.includes('Password should be at least')) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return message;
}

function buildCustomerFromUser(user: any): Customer {
  const meta = user.user_metadata || {};
  return {
    name: meta.name || '',
    email: user.email || '',
    phone: meta.phone || '',
    address: meta.address || '',
    dateCreated: user.created_at || new Date().toISOString(),
    emailConfirmed: !!user.email_confirmed_at
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setCustomer(buildCustomerFromUser(data.session.user));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCustomer(buildCustomerFromUser(session.user));
      } else {
        setCustomer(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    address?: string
  ): Promise<AuthResult> => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
    }

    const phoneValidation = validateBeninPhone(phone);
    if (!phoneValidation.isValid) {
      return { success: false, error: phoneValidation.message };
    }

    if (password.length < 6) {
      return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phoneValidation.formatted,
          address: address?.trim() || ''
        }
      }
    });

    if (error) {
      return { success: false, error: mapSupabaseError(error.message) };
    }

    const needsConfirmation = !data.session;

    if (data.user && data.session) {
      setCustomer(buildCustomerFromUser(data.user));
    }

    return { success: true, needsEmailConfirmation: needsConfirmation };
  };

  const loginCustomer = async (email: string, password: string): Promise<AuthResult> => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: "Veuillez saisir votre email et votre mot de passe." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      const needsEmailConfirmation = error.message.includes('Email not confirmed');
      return { success: false, error: mapSupabaseError(error.message), needsEmailConfirmation };
    }

    if (data.user) {
      setCustomer(buildCustomerFromUser(data.user));
    }

    return { success: true };
  };

  const resendConfirmationEmail = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase()
    });
    if (error) {
      return { success: false, error: mapSupabaseError(error.message) };
    }
    return { success: true };
  };

  const logoutCustomer = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  const updateCustomerAddress = async (address: string) => {
    if (!customer) return;
    const { data, error } = await supabase.auth.updateUser({
      data: { address }
    });
    if (!error && data.user) {
      setCustomer(buildCustomerFromUser(data.user));
    }
  };

  return (
    <UserContext.Provider
      value={{
        customer,
        loading,
        registerCustomer,
        loginCustomer,
        resendConfirmationEmail,
        logoutCustomer,
        updateCustomerAddress
      }}
    >
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
