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

    if (action === 'countUsers') {
      // listUsers ne renvoie pas un total direct sans pagination ; on parcourt
      // les pages (perPage max) pour obtenir un compte exact même au-delà de
      // la première page.
      let total = 0;
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) return json({ success: false, error: error.message }, 500);
        total += data.users.length;
        if (data.users.length < perPage) break;
        page += 1;
      }
      return json({ success: true, count: total });
    }

    if (action === 'list') {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true, orders: data });
    }

    if (action === 'listCustomers') {
      let users: any[] = [];
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) return json({ success: false, error: error.message }, 500);
        users = users.concat(data.users);
        if (data.users.length < perPage) break;
        page += 1;
      }

      const customers = users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || '',
        phone: u.user_metadata?.phone || '',
        address: u.user_metadata?.address || '',
        buyerType: u.user_metadata?.buyerType === 'gros' ? 'gros' : 'detail',
        dateCreated: u.created_at,
        emailConfirmed: !!u.email_confirmed_at,
      }));

      return json({ success: true, customers });
    }

    if (action === 'listQuotes') {
      const { data, error } = await supabaseAdmin
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true, quotes: data });
    }

    if (action === 'respondQuote') {
      const { quoteId, adminResponse, adminPrice } = body;
      const { error } = await supabaseAdmin
        .from('quote_requests')
        .update({
          admin_response: adminResponse,
          admin_price: adminPrice ?? null,
          status: 'answered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true });
    }

    if (action === 'listReviews') {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true, reviews: data });
    }

    if (action === 'setReviewFeatured') {
      const { reviewId, featured } = body;

      if (featured) {
        const { count, error: countError } = await supabaseAdmin
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('featured', true);

        if (countError) return json({ success: false, error: countError.message }, 500);
        if ((count || 0) >= 3) {
          return json(
            { success: false, error: "Maximum 3 avis affichés sur le site. Désactivez-en un d'abord." },
            400
          );
        }
      }

      const { error } = await supabaseAdmin
        .from('reviews')
        .update({ featured })
        .eq('id', reviewId);

      if (error) return json({ success: false, error: error.message }, 500);
      return json({ success: true });
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
