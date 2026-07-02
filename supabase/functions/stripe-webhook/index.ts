import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() })
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const player_id = session.client_reference_id
      const season_id = session.metadata?.season_id

      if (player_id && season_id) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update registration status to completed
        const { error: regError } = await supabase
          .from('registrations')
          .update({ status: 'completed' })
          .match({ player_id, season_id })

        if (regError) {
          console.error('Error updating registration:', regError)
          throw regError
        }

        // Find registration ID
        const { data: regData } = await supabase
          .from('registrations')
          .select('id')
          .match({ player_id, season_id })
          .single()

        if (regData) {
            // Insert into payments table
            const { error: payError } = await supabase
            .from('payments')
            .insert({
                registration_id: regData.id,
                stripe_checkout_id: session.id,
                amount_cents: session.amount_total,
                status: 'paid'
            })
            if (payError) {
                console.error('Error inserting payment:', payError)
                throw payError
            }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
