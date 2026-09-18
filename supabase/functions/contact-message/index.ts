// Edge Function: contact-message
// Reçoit les messages du formulaire "Nous contacter" du site public.
// 1) Les enregistre dans la table contact_messages (visible ensuite par
//    l'admin dans son dashboard, via admin-orders).
// 2) Tente en plus d'envoyer un email direct à l'adresse admin (best effort :
//    si l'envoi SMTP échoue, le message reste quand même enregistré et visible
//    dans l'admin, donc rien n'est perdu).

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

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
    const { name, phone, email, message } = await req.json();

    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof message !== 'string' || !message.trim()
    ) {
      return json({ success: false, error: 'Merci de remplir tous les champs obligatoires.' }, 400);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    // 1) Toujours enregistrer en base — c'est la garantie que rien n'est perdu.
    const { error: insertError } = await supabaseAdmin.from('contact_messages').insert({
      name: name.trim(),
      phone: (phone || '').trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (insertError) {
      return json({ success: false, error: "Impossible d'enregistrer votre message pour le moment." }, 500);
    }

    // 2) Tentative d'envoi email à l'admin (ne bloque pas la réponse si ça échoue).
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    const SMTP_HOST = Deno.env.get('SMTP_HOST');
    const SMTP_PORT = Deno.env.get('SMTP_PORT');
    const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME');
    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');

    if (ADMIN_EMAIL && SMTP_HOST && SMTP_PORT && SMTP_USERNAME && SMTP_PASSWORD) {
      try {
        const client = new SMTPClient({
          connection: {
            hostname: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10),
            tls: true,
            auth: { username: SMTP_USERNAME, password: SMTP_PASSWORD },
          },
        });

        await client.send({
          from: `Yolita — Site <${SMTP_USERNAME}>`,
          to: ADMIN_EMAIL,
          replyTo: email.trim(),
          subject: `Nouveau message du site — ${name.trim()}`,
          content: 'auto',
          html: `
            <p><strong>Nom :</strong> ${name.trim()}</p>
            <p><strong>Téléphone :</strong> ${(phone || '—').trim()}</p>
            <p><strong>Email :</strong> ${email.trim()}</p>
            <p><strong>Message :</strong></p>
            <p>${message.trim().replace(/\n/g, '<br/>')}</p>
          `,
        });

        await client.close();
      } catch (emailError) {
        // On ignore volontairement : le message est déjà en base, donc pas perdu.
        console.error('Envoi email admin échoué :', emailError);
      }
    }

    return json({ success: true });
  } catch (e) {
    return json({ success: false, error: 'Requête invalide.' }, 400);
  }
});
