/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase non configuré : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis dans le fichier .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
