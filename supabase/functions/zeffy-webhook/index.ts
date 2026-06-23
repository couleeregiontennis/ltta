import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()
    console.log('Received Zeffy webhook event:', JSON.stringify(payload))

    const { type, data } = payload

    if (type !== 'payment.completed') {
      return new Response(JSON.stringify({ message: `Ignored event type: ${type}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'Missing data in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { id: zeffyPaymentId, status, amount, campaign_id: campaignId, buyer } = data

    if (status !== 'succeeded') {
      return new Response(JSON.stringify({ message: `Ignored payment status: ${status}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payerEmail = buyer?.email
    if (!payerEmail) {
      return new Response(JSON.stringify({ error: 'Missing buyer email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Find matching season by campaign_id
    if (!campaignId) {
      return new Response(JSON.stringify({ error: 'Missing campaign_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: season, error: seasonError } = await supabase
      .from('season')
      .select('id')
      .eq('zeffy_campaign_id', campaignId)
      .maybeSingle()

    if (seasonError) {
      console.error('Error searching season:', seasonError)
      throw seasonError
    }

    if (!season) {
      console.warn(`No season found with zeffy_campaign_id = ${campaignId}`)
      return new Response(JSON.stringify({ error: `No season mapped to campaign ID: ${campaignId}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Find matching player by email
    const { data: player, error: playerError } = await supabase
      .from('player')
      .select('id')
      .ilike('email', payerEmail)
      .maybeSingle()

    if (playerError) {
      console.error('Error searching player:', playerError)
    }

    const playerId = player?.id || null
    if (!playerId) {
      console.warn(`No player found matching email: ${payerEmail}. Recording payment with player_id = null.`)
    }

    // 4. Upsert payment record (convert amount from cents to dollars)
    const amountInDollars = typeof amount === 'number' ? amount / 100 : 0
    const paymentRecord = {
      player_id: playerId,
      season_id: season.id,
      zeffy_payment_id: zeffyPaymentId,
      amount: amountInDollars,
      payer_email: payerEmail.toLowerCase(),
      raw_payload: payload
    }

    const { data: insertedPayment, error: insertError } = await supabase
      .from('player_payment')
      .upsert(paymentRecord, { onConflict: 'zeffy_payment_id' })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting player payment:', insertError)
      throw insertError
    }

    console.log(`Successfully recorded payment ${zeffyPaymentId} for player_id = ${playerId}, season_id = ${season.id}`)

    return new Response(JSON.stringify({ success: true, paymentId: insertedPayment.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error handling zeffy webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
