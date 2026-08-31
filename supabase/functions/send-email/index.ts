import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const payload = await req.json();
    const record = payload.record || payload;

    if (!record || !record.recipient_id || !record.title || !record.body) {
      return new Response(
        JSON.stringify({ error: 'Missing notification fields.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not set; skipping email dispatch.');
      return new Response(
        JSON.stringify({ success: false, message: 'RESEND_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase service configuration missing.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Look up recipient email from the player record using service role to bypass RLS
    const { data: player, error: playerError } = await supabaseAdmin
      .from('player')
      .select('email')
      .eq('id', record.recipient_id)
      .single();

    if (playerError || !player?.email) {
      console.error('Could not find recipient email:', playerError);

      await supabaseAdmin
        .from('notifications')
        .update({ status: 'failed' })
        .eq('id', record.id);

      return new Response(
        JSON.stringify({ success: false, error: 'Recipient email not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'LTTA <notifications@couleeregiontennis.org>',
        to: [player.email],
        subject: record.title,
        html: `<p>${record.body}</p>`,
      }),
    });

    const newStatus = resendResponse.ok ? 'sent' : 'failed';

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errorText);
    }

    await supabaseAdmin
      .from('notifications')
      .update({ status: newStatus })
      .eq('id', record.id);

    return new Response(
      JSON.stringify({ success: resendResponse.ok, status: newStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('send-email edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
