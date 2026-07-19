import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() })
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
// Fail closed when unset: never silently redirect payers to a wrong origin.
const siteUrl = Deno.env.get('SITE_URL') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!siteUrl) {
      console.error('SITE_URL environment variable is not configured')
      return jsonResponse({ error: 'Checkout is not configured.' }, 500)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header.' }, 401)
    }

    const { player_id, season_id } = await req.json()
    if (!player_id || !season_id) {
      return jsonResponse({ error: 'player_id and season_id are required.' }, 400)
    }

    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Verify player_id belongs to the authenticated user
    const { data: player, error: playerError } = await supabase
      .from('player')
      .select('id')
      .eq('id', player_id)
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return jsonResponse({ error: 'Player not found or not owned by user.' }, 403)
    }

    // Duplicate-payment guard: never create a session for a paid registration.
    const { data: registration } = await supabase
      .from('registrations')
      .select('status')
      .eq('player_id', player_id)
      .eq('season_id', season_id)
      .maybeSingle()

    if (registration?.status === 'completed') {
      return jsonResponse({ error: 'Dues for this season have already been paid.' }, 409)
    }

    // Fetch actual dues amount from season
    const { data: season, error: seasonError } = await supabase
      .from('season')
      .select('dues_amount_cents')
      .eq('id', season_id)
      .single()

    if (seasonError || !season) {
      return jsonResponse({ error: 'Season not found.' }, 400)
    }

    const amount_cents = season.dues_amount_cents ?? 2500

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email, // verified email from the auth token
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'LTTA Season Roster Dues' },
          unit_amount: amount_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${siteUrl}/pay-dues?success=true`,
      cancel_url: `${siteUrl}/pay-dues?canceled=true`,
      client_reference_id: player_id,
      metadata: { season_id }
    });

    return jsonResponse({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return jsonResponse({ error: 'Failed to create checkout session.' }, 500)
  }
});
