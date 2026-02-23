CREATE TABLE IF NOT EXISTS public.sub_request (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    captain_user_id uuid NOT NULL,
    team_id uuid NOT NULL REFERENCES public.team(id) ON DELETE CASCADE,
    match_date date NOT NULL,
    match_time text,
    location_id uuid REFERENCES public.location(id) ON DELETE SET NULL,
    required_ranking integer DEFAULT 3,
    status text DEFAULT 'open' CHECK (status IN ('open', 'filled', 'canceled')),
    sub_user_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sub_request ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sub requests are viewable by all authenticated users"
ON public.sub_request FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Captains can insert their own sub requests"
ON public.sub_request FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = captain_user_id);

CREATE POLICY "Captains can update/cancel their own sub requests"
ON public.sub_request FOR UPDATE
TO authenticated
USING (auth.uid() = captain_user_id);

CREATE POLICY "Players can accept open sub requests"
ON public.sub_request FOR UPDATE
TO authenticated
USING (status = 'open' AND auth.uid() IS NOT NULL AND auth.uid() != captain_user_id)
WITH CHECK (sub_user_id = auth.uid() AND status = 'filled');

CREATE POLICY "Captains can delete their own sub requests"
ON public.sub_request FOR DELETE
TO authenticated
USING (auth.uid() = captain_user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_sub_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sub_request_updated_at_trigger
    BEFORE UPDATE ON public.sub_request
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sub_request_updated_at();
