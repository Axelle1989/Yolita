/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Product } from './types';
import {
  PRODUCTS as INITIAL_PRODUCTS,
  CAPACITIES as INITIAL_CAPACITIES,
  DIY_BASES as INITIAL_DIY_BASES,
  DIY_AROMAS as INITIAL_DIY_AROMAS,
  CapacityOption,
} from './constants';

export interface DiyBase {
  id: string;
  name: string;
  priceAdd: number;
  desc: string;
}

export interface DiyAroma {
  id: string;
  name: string;
  priceAdd: number;
}

interface SiteConfigData {
  products: Product[];
  capacities: CapacityOption[];
  diyBases: DiyBase[];
  diyAromas: DiyAroma[];
}

const DEFAULT_CONFIG: SiteConfigData = {
  products: INITIAL_PRODUCTS,
  capacities: INITIAL_CAPACITIES,
  diyBases: INITIAL_DIY_BASES,
  diyAromas: INITIAL_DIY_AROMAS,
};

interface SiteConfigContextType {
  config: SiteConfigData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateProduct: (updated: Product) => Promise<void>;
  updateCapacities: (capacities: CapacityOption[]) => Promise<void>;
  updateDiyBases: (bases: DiyBase[]) => Promise<void>;
  updateDiyAromas: (aromas: DiyAroma[]) => Promise<void>;
  resetAll: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

const ROW_ID = 'main';

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfigData>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', ROW_ID)
      .maybeSingle();

    if (fetchError) {
      // Si la table n'existe pas encore ou erreur réseau, on retombe sur les valeurs par défaut.
      setError("Impossible de charger la configuration partagée (table Supabase non créée ?). Valeurs par défaut utilisées.");
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
      return;
    }

    const remote = (data?.data || {}) as Partial<SiteConfigData>;
    const merged: SiteConfigData = {
      products: remote.products && remote.products.length > 0 ? remote.products : INITIAL_PRODUCTS,
      capacities: remote.capacities && remote.capacities.length > 0 ? remote.capacities : INITIAL_CAPACITIES,
      diyBases: remote.diyBases && remote.diyBases.length > 0 ? remote.diyBases : INITIAL_DIY_BASES,
      diyAromas: remote.diyAromas && remote.diyAromas.length > 0 ? remote.diyAromas : INITIAL_DIY_AROMAS,
    };

    setConfig(merged);
    setError(null);
    setLoading(false);

    // Si la ligne n'existait pas du tout, on la crée avec les valeurs par défaut.
    if (!data) {
      await supabase.from('site_config').upsert({ id: ROW_ID, data: merged });
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const persist = async (next: SiteConfigData) => {
    setSaving(true);
    setConfig(next);
    const { error: saveError } = await supabase
      .from('site_config')
      .upsert({ id: ROW_ID, data: next, updated_at: new Date().toISOString() });
    setSaving(false);
    if (saveError) {
      setError("Erreur lors de la sauvegarde sur Supabase. Vérifiez que la table 'site_config' existe.");
      throw saveError;
    }
    setError(null);
  };

  const updateProduct = async (updated: Product) => {
    const next = {
      ...config,
      products: config.products.map((p) => (p.id === updated.id ? updated : p)),
    };
    await persist(next);
  };

  const updateCapacities = async (capacities: CapacityOption[]) => {
    await persist({ ...config, capacities });
  };

  const updateDiyBases = async (diyBases: DiyBase[]) => {
    await persist({ ...config, diyBases });
  };

  const updateDiyAromas = async (diyAromas: DiyAroma[]) => {
    await persist({ ...config, diyAromas });
  };

  const resetAll = async () => {
    await persist(DEFAULT_CONFIG);
  };

  return (
    <SiteConfigContext.Provider
      value={{ config, loading, saving, error, updateProduct, updateCapacities, updateDiyBases, updateDiyAromas, resetAll }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
