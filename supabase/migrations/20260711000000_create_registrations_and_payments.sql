-- Add dues_amount_cents to season table
ALTER TABLE public.season ADD COLUMN IF NOT EXISTS dues_amount_cents INTEGER DEFAULT 2500;

CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.player(id) ON DELETE CASCADE,
    season_id UUID REFERENCES public.season(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(player_id, season_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_season_id ON public.registrations(season_id);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    stripe_checkout_id VARCHAR(255) UNIQUE,
    amount_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON public.payments(registration_id);

-- RLS Policies
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON public.registrations FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.player WHERE id = player_id));
CREATE POLICY "Users can insert own registrations" ON public.registrations FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.player WHERE id = player_id));
CREATE POLICY "Users can update own registrations" ON public.registrations FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.player WHERE id = player_id));

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.player p ON r.player_id = p.id
    WHERE r.id = registration_id AND p.user_id = auth.uid()
));

-- Service role policies for webhooks
CREATE POLICY "Service role can manage registrations" ON public.registrations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage payments" ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RPC for processing checkout completion atomically
CREATE OR REPLACE FUNCTION process_checkout_completion(
    p_player_id UUID,
    p_season_id UUID,
    p_stripe_checkout_id VARCHAR(255),
    p_amount_cents INTEGER
) RETURNS void AS $$
DECLARE
    v_registration_id UUID;
BEGIN
    -- Update registration status
    UPDATE public.registrations
    SET status = 'completed'
    WHERE player_id = p_player_id AND season_id = p_season_id
    RETURNING id INTO v_registration_id;

    IF v_registration_id IS NULL THEN
        RAISE EXCEPTION 'Registration not found for player % and season %', p_player_id, p_season_id;
    END IF;

    -- Insert payment
    BEGIN
        INSERT INTO public.payments (registration_id, stripe_checkout_id, amount_cents, status)
        VALUES (v_registration_id, p_stripe_checkout_id, p_amount_cents, 'paid');
    EXCEPTION WHEN unique_violation THEN
        -- Idempotency check: If stripe_checkout_id already exists, ignore the insert (and implicitly ignore registration update since it is in same transaction and already updated before).
        -- We just return to avoid erroring out so Stripe stops retrying.
        RETURN;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
