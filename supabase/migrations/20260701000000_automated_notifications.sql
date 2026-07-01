CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.player(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.player p
            WHERE p.id = notifications.recipient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.player p
            WHERE p.id = notifications.recipient_id AND p.user_id = auth.uid()
        )
    );

-- Match Dispute Trigger
CREATE OR REPLACE FUNCTION notify_match_dispute()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_disputed = true AND OLD.is_disputed = false THEN
        INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
        SELECT
            p.id,
            'dispute',
            'Match Disputed',
            'A match played by your team has been flagged for dispute.',
            jsonb_build_object('match_id', NEW.id)
        FROM public.player p
        INNER JOIN public.player_to_team ptt ON ptt.player = p.id
        WHERE (ptt.team = NEW.home_team_id OR ptt.team = NEW.away_team_id) AND p.is_captain = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_match_dispute ON public.team_match;
CREATE TRIGGER tr_notify_match_dispute
    AFTER UPDATE ON public.team_match
    FOR EACH ROW
    EXECUTE FUNCTION notify_match_dispute();

-- Sub Request Trigger
CREATE OR REPLACE FUNCTION notify_sub_request()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
    SELECT
        id,
        'sub_request',
        'New Substitute Request',
        'A team is looking for a substitute player on ' || NEW.match_date || '.',
        jsonb_build_object('sub_request_id', NEW.id)
    FROM public.player
    WHERE is_active = true AND id != (SELECT id FROM public.player WHERE user_id = NEW.captain_user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_sub_request ON public.sub_request;
CREATE TRIGGER tr_notify_sub_request
    AFTER INSERT ON public.sub_request
    FOR EACH ROW
    EXECUTE FUNCTION notify_sub_request();

-- Roster Invite Trigger
CREATE OR REPLACE FUNCTION notify_roster_invite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'invited' THEN
        INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
        VALUES (
            NEW.player,
            'roster_invite',
            'Team Invitation',
            'You have been invited to join a team.',
            jsonb_build_object('team_id', NEW.team)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_roster_invite ON public.player_to_team;
CREATE TRIGGER tr_notify_roster_invite
    AFTER INSERT OR UPDATE ON public.player_to_team
    FOR EACH ROW
    WHEN (NEW.status = 'invited' AND (TG_OP = 'INSERT' OR OLD.status != 'invited'))
    EXECUTE FUNCTION notify_roster_invite();
