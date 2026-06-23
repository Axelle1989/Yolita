// Edge Function: admin-orders
// Permet à l'admin (et seulement l'admin) de voir et modifier TOUTES les commandes,
// en passant par la clé de service (jamais exposée au navigateur).
// Le mot de passe admin est revérifié à chaque appel (même secrets que admin-login).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isAdmin(email: string, password: string) {
  return (
    typeof email === 'string' &&
    typeof password === 'string' &&
    email.trim().toLowerCase() === (ADMIN_EMAIL || '').toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

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
    const body = await req.json();
    const { adminEmail, adminPassword, action } = body;

    if (!isAdmin(adminEmail, adminPassword)) {
      return json({ success: false, error: 'Accès admin refusé.' }, 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    if (action === 'list') {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true, orders: data });
    }

    if (action === 'updateStatus') {
      const { orderId, status, statusHistory, adminMessage } = body;
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status, status_history: statusHistory, admin_message: adminMessage })
        .eq('id', orderId);

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true });
    }

    if (action === 'delete') {
      const { orderId } = body;
      const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId);
      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true });
    }

    return json({ success: false, error: 'Action inconnue.' }, 400);
  } catch (e) {
    return json({ success: false, error: 'Requête invalide.' }, 400);
  }
});
