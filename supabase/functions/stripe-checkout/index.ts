import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() })
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { player_id, season_id, email } = await req.json();

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify player_id belongs to the authenticated user
    const { data: player, error: playerError } = await supabase
      .from('player')
      .select('id')
      .eq('id', player_id)
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      throw new Error('Player not found or not owned by user')
    }

    // Fetch actual dues amount from season
    const { data: season, error: seasonError } = await supabase
      .from('season')
      .select('dues_amount_cents')
      .eq('id', season_id)
      .single()

    if (seasonError || !season) {
      throw new Error('Season not found')
    }

    const amount_cents = season.dues_amount_cents ?? 2500;

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://new.couleeregiontennis.org'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email, // use the destructured email
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

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(JSON.stringify({ error: 'Failed to create checkout session.' }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
