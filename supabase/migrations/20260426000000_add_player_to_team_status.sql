-- Add status column to player_to_team to support pending requests and invitations
ALTER TABLE public.player_to_team
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'invited', 'declined'));

-- RLS Policies for player_to_team
-- 1. Anyone authenticated can view (already exists)

-- 2. Players can request to join a team (insert pending)
DROP POLICY IF EXISTS "Players can request to join a team" ON public.player_to_team;
CREATE POLICY "Players can request to join a team"
ON public.player_to_team
FOR INSERT TO authenticated
WITH CHECK (
    player = (SELECT id FROM public.player WHERE user_id = auth.uid())
    AND status = 'pending'
);

-- 3. Captains can invite players (insert invited)
DROP POLICY IF EXISTS "Captains can invite players to their team" ON public.player_to_team;
CREATE POLICY "Captains can invite players to their team"
ON public.player_to_team
FOR INSERT TO authenticated
WITH CHECK (
    status = 'invited'
    AND team IN (
        SELECT pt.team 
        FROM public.player_to_team pt
        JOIN public.player p ON p.id = pt.player
        WHERE p.user_id = auth.uid() AND p.is_captain = true
    )
);

-- 4. Captains can update requests for their team (e.g. approve pending -> active)
DROP POLICY IF EXISTS "Captains can update requests for their team" ON public.player_to_team;
CREATE POLICY "Captains can update requests for their team"
ON public.player_to_team
FOR UPDATE TO authenticated
USING (
    team IN (
        SELECT pt.team 
        FROM public.player_to_team pt
        JOIN public.player p ON p.id = pt.player
        WHERE p.user_id = auth.uid() AND p.is_captain = true
    )
)
WITH CHECK (
    team IN (
        SELECT pt.team 
        FROM public.player_to_team pt
        JOIN public.player p ON p.id = pt.player
        WHERE p.user_id = auth.uid() AND p.is_captain = true
    )
);

-- 5. Players can update their own invitations (e.g. accept invited -> active)
DROP POLICY IF EXISTS "Players can update their own invitations" ON public.player_to_team;
CREATE POLICY "Players can update their own invitations"
ON public.player_to_team
FOR UPDATE TO authenticated
USING (
    player = (SELECT id FROM public.player WHERE user_id = auth.uid())
)
WITH CHECK (
    player = (SELECT id FROM public.player WHERE user_id = auth.uid())
);

-- 6. Admins have full access
DROP POLICY IF EXISTS "Admins have full access to player_to_team" ON public.player_to_team;
CREATE POLICY "Admins have full access to player_to_team"
ON public.player_to_team
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.player WHERE user_id = auth.uid() AND is_admin = true)
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.player WHERE user_id = auth.uid() AND is_admin = true)
);

-- 7. Captains can delete requests for their team (e.g. deny pending)
DROP POLICY IF EXISTS "Captains can delete requests for their team" ON public.player_to_team;
CREATE POLICY "Captains can delete requests for their team"
ON public.player_to_team
FOR DELETE TO authenticated
USING (
    team IN (
        SELECT pt.team 
        FROM public.player_to_team pt
        JOIN public.player p ON p.id = pt.player
        WHERE p.user_id = auth.uid() AND p.is_captain = true
    )
);

-- 8. Players can delete their own requests/invites
DROP POLICY IF EXISTS "Players can delete their own requests" ON public.player_to_team;
CREATE POLICY "Players can delete their own requests"
ON public.player_to_team
FOR DELETE TO authenticated
USING (
    player = (SELECT id FROM public.player WHERE user_id = auth.uid())
);
