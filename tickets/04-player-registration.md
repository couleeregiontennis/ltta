# Ticket: Player Registration & Stripe Payment Integration

## Why (Product Goal & Value)
Every season, league admins spend dozens of hours manually tracking who has registered and who has paid their league dues ($30/player). This feature automates registration and billing. Players can register for a season and pay immediately via credit card using a Stripe Checkout overlay. The system locks their active roster status until payment is confirmed.

---

## Technical Architecture & Implementation Plan ("How")

### 1. Database Schema
Create `registrations` and `payments` tables:
```sql
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.player(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.season(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(player_id, season_id)
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    stripe_checkout_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'paid', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON public.registrations FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.registrations r WHERE r.id = registration_id AND r.player_id = auth.uid()
));
```

### 2. Stripe Checkout Integration
*   **Checkout Creation Flow:**
    When a player logs in and has an unpaid status for the current season, redirect them or display a banner to `/pay-dues`.
    Clicking "Pay Roster Dues" triggers a call to a Supabase Edge Function `/functions/stripe-checkout`.
*   **Stripe Webhook Flow:**
    Create a second Supabase Edge Function `/functions/stripe-webhook`. When Stripe receives a successful checkout payment, it calls this endpoint to update the `registrations` status to `completed` and `payments` status to `paid`.

### 3. Frontend Component
*   **File to Modify/Implement:** [PayDues.jsx](file:///home/brett/Code/ltta/src/components/PayDues.jsx)
*   **Behavior:**
    *   Query the current player's registration status.
    *   If unpaid, display details of the fee and a button to initiate payment.
    *   Redirect the user to the Stripe Checkout URL returned by the edge function.
    *   If paid, display a confirmation screen.

---

## Step-by-Step Code Walkthrough for the Intern
1.  **Stripe Edge Function (`stripe-checkout`):**
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { httpClient: Stripe.createFetchHttpClient() })

    serve(async (req) => {
      const { player_id, season_id, email } = await req.json();
      
      // 1. Create registration row in pending status
      // 2. Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'LTTA Season Roster Dues' },
            unit_amount: 3000, // $30.00
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/pay-dues?success=true`,
        cancel_url: `${req.headers.get('origin')}/pay-dues?canceled=true`,
        client_reference_id: player_id,
        metadata: { season_id }
      });

      return new Response(JSON.stringify({ url: session.url }), { headers: { "Content-Type": "application/json" } });
    });
    ```
2.  **Stripe Webhook Edge Function (`stripe-webhook`):**
    This function listens for `checkout.session.completed` events. It parses `client_reference_id` (player) and `metadata.season_id` to insert the payment and mark the registration as completed.

---

## Testing Plan (Acceptance Criteria)
1.  **Playwright Test File:** [payment-management.spec.js](file:///home/brett/Code/ltta/tests/e2e/payment-management.spec.js)
2.  **Mocks:** Intercept the Stripe Checkout API call and redirect to a mock success page.
3.  **UI Verification:**
    *   Verify player profile displays a badge indicating registration fee status (Paid / Unpaid).
    *   Ensure the player cannot see the My Schedule page if their payment status is not completed.

---

## Potential Gotchas & Intern Traps
*   **Stripe Webhook Signature Verification:** Remember to verify the `Stripe-Signature` header in the webhook function to prevent malicious actors from spoofing payments.
*   **Race Conditions:** A user might click checkout twice. Ensure the registration check uses a `UPSERT` or handles unique constraint violations gracefully.
