// Edge Function: admin-login
// Vérifie les identifiants admin côté serveur (jamais exposés au navigateur).
// Les vraies valeurs sont stockées comme "secrets" Supabase (variables d'environnement
// de la fonction), pas dans ce fichier, pas dans le code du site.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (
      typeof email === 'string' &&
      typeof password === 'string' &&
      email.trim().toLowerCase() === (ADMIN_EMAIL || '').toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Identifiants admin incorrects.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: 'Requête invalide.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
