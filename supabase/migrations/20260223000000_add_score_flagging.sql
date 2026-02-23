-- 1. Add is_disputed column to team_match
ALTER TABLE public.team_match ADD COLUMN is_disputed BOOLEAN DEFAULT false;

-- 2. Create the SECURITY DEFINER function to allow any authenticated user to flag a match
CREATE OR REPLACE FUNCTION public.flag_match_score(match_id uuid)
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
  SET is_disputed = true
  WHERE id = match_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.flag_match_score(uuid) TO authenticated;
