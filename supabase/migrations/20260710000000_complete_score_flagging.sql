-- 1. Add dispute reason tracking columns to team_match
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS dispute_reported_by UUID REFERENCES public.player(id);

-- 2. Update match status options to include 'disputed'
ALTER TABLE public.team_match DROP CONSTRAINT IF EXISTS team_match_status_check;
ALTER TABLE public.team_match ADD CONSTRAINT team_match_status_check CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'disputed'::text, 'verified'::text, 'cancelled'::text, 'postponed'::text, 'heat_cancellation'::text, 'rain_cancellation'::text]));

-- 3. Replace the flag_match_score function to accept reason and update status
CREATE OR REPLACE FUNCTION public.flag_match_score(match_id uuid, reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user is authenticated
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Must be logged in to flag a match score';
  END IF;

  -- Update the match to be disputed
  UPDATE public.team_match
  SET is_disputed = true,
      status = 'disputed',
      dispute_reason = reason,
      dispute_reported_by = (SELECT id FROM public.player WHERE user_id = auth.uid() LIMIT 1)
  WHERE id = match_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.flag_match_score(uuid, text) TO authenticated;
