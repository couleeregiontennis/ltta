CREATE TABLE IF NOT EXISTS public.season_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    season_id uuid NOT NULL REFERENCES season(id),
    player_id uuid REFERENCES player(id),
    team_id uuid REFERENCES team(id),
    amount_paid numeric(10,2) NOT NULL,
    payment_method text DEFAULT 'zeffy'::text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT season_payments_player_or_team_check CHECK (((player_id IS NOT NULL) OR (team_id IS NOT NULL)))
);

ALTER TABLE public.season_payments OWNER TO postgres;

ALTER TABLE ONLY public.season_payments
    ADD CONSTRAINT season_payments_pkey PRIMARY KEY (id);

CREATE INDEX idx_season_payments_season_id ON public.season_payments USING btree (season_id);
CREATE INDEX idx_season_payments_player_id ON public.season_payments USING btree (player_id);
CREATE INDEX idx_season_payments_team_id ON public.season_payments USING btree (team_id);

-- Apply RLS
ALTER TABLE public.season_payments ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (so they can see their own status or team status)
CREATE POLICY "Allow read access to all authenticated users" ON public.season_payments FOR SELECT TO authenticated USING (true);

-- Allow insert/update/delete only for admins (or individuals if we decide to automate Zeffy later, but for now just admins)
CREATE POLICY "Allow full access to admins" ON public.season_payments FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.player
        WHERE (player.user_id = auth.uid()) AND (player.is_admin = true)
    )
);
