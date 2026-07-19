-- Harden registration/payment security (follow-up to PR #83 review)
--
-- Issues addressed:
--   1) process_checkout_completion was SECURITY DEFINER with the default
--      EXECUTE grant to PUBLIC, exposing it via PostgREST to any
--      authenticated user (self-mark a registration 'completed' without paying).
--   2) The registrations RLS policies allowed a player to INSERT a row with
--      an arbitrary status (e.g. 'completed') and to UPDATE their own row,
--      so payment could be self-certified with plain REST calls.
--   3) No database backstop against multiple paid payments per registration.

-- Auditable status transitions.
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Recreate the RPC with a pinned search_path (SECURITY DEFINER best practice)
-- and an explicit idempotency pre-check.
CREATE OR REPLACE FUNCTION public.process_checkout_completion(
    p_player_id UUID,
    p_season_id UUID,
    p_stripe_checkout_id VARCHAR(255),
    p_amount_cents INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' AS $$
DECLARE
    v_registration_id UUID;
BEGIN
    -- Idempotent fast-path: this checkout session was already recorded
    -- (Stripe retries webhook events routinely).
    IF EXISTS (SELECT 1 FROM public.payments WHERE stripe_checkout_id = p_stripe_checkout_id) THEN
        RETURN;
    END IF;

    UPDATE public.registrations
    SET status = 'completed', updated_at = timezone('utc'::text, now())
    WHERE player_id = p_player_id AND season_id = p_season_id
    RETURNING id INTO v_registration_id;

    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'Registration not found for player % and season %', p_player_id, p_season_id;
    END IF;

    -- A unique_violation here means the registration was already paid via a
    -- different checkout session (double charge) -- surfaced as an RPC error
    -- so the webhook returns 400 and the failure is visible in Stripe.
    INSERT INTO public.payments (registration_id, stripe_checkout_id, amount_cents, status)
    VALUES (v_registration_id, p_stripe_checkout_id, p_amount_cents, 'paid');
END;
$$;

-- Only the service role (the Stripe webhook) may execute it.
REVOKE EXECUTE ON FUNCTION public.process_checkout_completion(UUID, UUID, VARCHAR, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_checkout_completion(UUID, UUID, VARCHAR, INTEGER) TO service_role;

-- Backstop: at most one paid payment per registration.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_paid_per_registration
    ON public.payments(registration_id) WHERE status = 'paid';

-- Players may only create their own registration as 'pending'. All status
-- transitions happen via the service role (webhook), so the player-facing
-- UPDATE policy is removed entirely.
DROP POLICY IF EXISTS "Users can update own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can insert own registrations" ON public.registrations;

CREATE POLICY "Users can insert own pending registrations" ON public.registrations
    FOR INSERT WITH CHECK (
        status = 'pending'
        AND auth.uid() IN (SELECT user_id FROM public.player WHERE id = player_id)
    );
