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
