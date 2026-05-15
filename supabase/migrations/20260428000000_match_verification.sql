-- 1. Add tracking columns to team_match
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id);
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- 2. Create the SECURITY DEFINER function to confirm a match score
CREATE OR REPLACE FUNCTION public.confirm_match_score(match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_match record;
BEGIN
    -- Verify the user is authenticated
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Must be logged in to confirm a match score';
    END IF;

    -- Get match details
    SELECT * INTO target_match FROM public.team_match WHERE id = match_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match not found';
    END IF;

    -- Verify the user is NOT the one who originally submitted the score
    IF target_match.submitted_by = auth.uid() THEN
        RAISE EXCEPTION 'You cannot confirm a score you originally submitted';
    END IF;

    -- Verify the user is a captain of one of the involved teams
    -- (We use the user_id from the player table to check against home/away team captains)
    IF NOT EXISTS (
        SELECT 1 FROM public.player_to_team ptt
        JOIN public.player p ON p.id = ptt.player
        WHERE p.user_id = auth.uid()
        AND (ptt.team = target_match.home_team_id OR ptt.team = target_match.away_team_id)
        AND p.is_captain = true
    ) THEN
        RAISE EXCEPTION 'Only captains of the involved teams can confirm a score';
    END IF;

    -- Update the match to be verified
    UPDATE public.team_match
    SET status = 'verified',
        verified_by = auth.uid(),
        is_disputed = false,
        updated_at = now()
    WHERE id = match_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.confirm_match_score(uuid) TO authenticated;
