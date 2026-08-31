-- Notifications table for automated alerts (disputes, sub requests, roster invites)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.player(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('dispute', 'sub_request', 'roster_invite')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    is_read BOOLEAN DEFAULT false NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for common access patterns
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications USING btree (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications USING btree (recipient_id, is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications (recipient_id -> player.id -> player.user_id = auth.uid())
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.player
        WHERE public.player.id = public.notifications.recipient_id
          AND public.player.user_id = auth.uid()
    ));

-- Users can mark their own notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.player
        WHERE public.player.id = public.notifications.recipient_id
          AND public.player.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.player
        WHERE public.player.id = public.notifications.recipient_id
          AND public.player.user_id = auth.uid()
    ));

-- Trigger helper: update updated_at on notifications
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_updated_at_trigger
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notification_updated_at();

-- Trigger: notify captains/admins when a match score is disputed
CREATE OR REPLACE FUNCTION public.notify_match_dispute()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (OLD.is_disputed IS NOT TRUE AND NEW.is_disputed = true) THEN
        INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
        SELECT DISTINCT p.id,
               'dispute',
               'Match Disputed',
               'A match involving your team has been flagged for dispute.',
               jsonb_build_object('match_id', NEW.id)
        FROM public.player p
        WHERE (
            p.is_admin = true
            OR (
                p.is_captain = true
                AND EXISTS (
                    SELECT 1 FROM public.player_to_team pt
                    WHERE pt.player = p.id
                      AND pt.team IN (NEW.home_team_id, NEW.away_team_id)
                )
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_notify_match_dispute
    AFTER UPDATE OF is_disputed ON public.team_match
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_match_dispute();

-- Trigger: notify players when a new sub request is posted
CREATE OR REPLACE FUNCTION public.notify_sub_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
    SELECT DISTINCT p.id,
           'sub_request',
           'New Sub Request',
           'A captain is looking for a substitute. Check the Sub Board for details.',
           jsonb_build_object(
               'sub_request_id', NEW.id,
               'team_id', NEW.team_id,
               'match_date', NEW.match_date
           )
    FROM public.player p
    WHERE p.is_active = true
      AND p.id NOT IN (
          SELECT player FROM public.player_to_team WHERE team = NEW.team_id
      );

    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_notify_sub_request
    AFTER INSERT ON public.sub_request
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_sub_request();



-- Trigger: notify a player when they are invited to a team roster
CREATE OR REPLACE FUNCTION public.notify_roster_invite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    team_name_text TEXT;
BEGIN
    IF NEW.status = 'invited' THEN
        SELECT t.name INTO team_name_text
        FROM public.team t
        WHERE t.id = NEW.team;

        INSERT INTO public.notifications (recipient_id, type, title, body, metadata)
        VALUES (
            NEW.player,
            'roster_invite',
            'Roster Invitation',
            'You have been invited to join the roster for ' || COALESCE(team_name_text, 'a team') || '.',
            jsonb_build_object('player_to_team_id', NEW.id, 'team_id', NEW.team)
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_notify_roster_invite
    AFTER INSERT OR UPDATE OF status ON public.player_to_team
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_roster_invite();

-- Grants
GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;

GRANT ALL ON FUNCTION public.notify_match_dispute() TO anon;
GRANT ALL ON FUNCTION public.notify_match_dispute() TO authenticated;
GRANT ALL ON FUNCTION public.notify_match_dispute() TO service_role;

GRANT ALL ON FUNCTION public.notify_sub_request() TO anon;
GRANT ALL ON FUNCTION public.notify_sub_request() TO authenticated;
GRANT ALL ON FUNCTION public.notify_sub_request() TO service_role;

GRANT ALL ON FUNCTION public.notify_roster_invite() TO anon;
GRANT ALL ON FUNCTION public.notify_roster_invite() TO authenticated;
GRANT ALL ON FUNCTION public.notify_roster_invite() TO service_role;
