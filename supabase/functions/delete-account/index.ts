// Edge Function: delete-account
// Permet à un utilisateur connecté de supprimer DÉFINITIVEMENT son propre
// compte et toutes ses données (ses commandes sont supprimées automatiquement
// grâce à "on delete cascade" sur la table orders).
//
// Sécurité : on vérifie le token JWT envoyé par le navigateur (celui de la
// session active) pour identifier QUI fait la demande, puis on utilise la clé
// de service uniquement pour supprimer CET utilisateur précis — jamais un
// autre. Un utilisateur ne peut donc jamais supprimer le compte de quelqu'un
// d'autre.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Non authentifié.' }, 401);
    }

    // Client "anon" avec le token de l'utilisateur : sert uniquement à
    // vérifier QUI fait la demande (on ne fait confiance qu'à Supabase pour ça).
    const supabaseAsUser = createClient(SUPABASE_URL!, ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseAsUser.auth.getUser();

    if (userError || !userData.user) {
      return json({ success: false, error: 'Session invalide ou expirée.' }, 401);
    }

    const userId = userData.user.id;

    // Client avec la clé de service, pour effectuer la suppression réelle
    const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return json({ success: false, error: deleteError.message }, 500);
    }

    return json({ success: true });
  } catch (e) {
    return json({ success: false, error: 'Requête invalide.' }, 400);
  }
});
