import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() })
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Service-role client; safe to share across requests at module scope.
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    // constructEventAsync is the variant supported in the Deno runtime
    // (HMAC verification uses async Web Crypto there).
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Only fulfill once the payment has actually cleared; Checkout can
      // report completion with an unpaid status for async payment methods.
      if (session.payment_status !== 'paid') {
        console.log(`checkout.session.completed with payment_status=${session.payment_status}; awaiting payment (session ${session.id})`)
        return jsonResponse({ received: true })
      }

      const player_id = session.client_reference_id
      const season_id = session.metadata?.season_id

      if (player_id && season_id) {
        // amount_total is nullable on a Checkout Session; fall back to the
        // season's configured dues rather than a hardcoded literal.
        let amount_cents = session.amount_total
        if (amount_cents == null) {
          const { data: season } = await supabase
            .from('season')
            .select('dues_amount_cents')
            .eq('id', season_id)
            .single()
          amount_cents = season?.dues_amount_cents ?? 2500
        }

        const { error: rpcError } = await supabase.rpc('process_checkout_completion', {
          p_player_id: player_id,
          p_season_id: season_id,
          p_stripe_checkout_id: session.id,
          p_amount_cents: amount_cents
        })

        if (rpcError) {
          // Non-transient: the session did not originate from our checkout
          // flow, so retrying can never succeed. Acknowledge with 200 to stop
          // Stripe retrying for days; the event is logged for review.
          if (rpcError.message?.includes('Registration not found')) {
            console.warn(`Ignoring checkout session ${session.id}: ${rpcError.message}`)
            return jsonResponse({ received: true })
          }
          console.error('Error processing checkout completion:', rpcError)
          throw new Error(rpcError.message)
        }
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const player_id = session.client_reference_id
      const season_id = session.metadata?.season_id

      if (player_id && season_id) {
        // Only cancel a registration that is still awaiting payment.
        const { error: regError } = await supabase
          .from('registrations')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .match({ player_id, season_id, status: 'pending' })

        if (regError) {
          console.error('Error updating registration to canceled:', regError)
          throw new Error(regError.message)
        }
      }
    }

    return jsonResponse({ received: true })
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
