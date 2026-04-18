-- Migration: 2026 Season Operations
-- 1. Expand line_results to 4 lines
ALTER TABLE public.line_results DROP CONSTRAINT IF EXISTS line_results_line_number_check;
ALTER TABLE public.line_results ADD CONSTRAINT line_results_line_number_check CHECK (line_number = ANY (ARRAY[1, 2, 3, 4]));

-- 2. Add participation bonus columns to team_match
-- Note: We track this per match, but for which team? 
-- Requirements say "bonus point to that team's standings".
-- Usually, both captains confirm or the submitter marks their own.
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS home_full_roster boolean DEFAULT false;
ALTER TABLE public.team_match ADD COLUMN IF NOT EXISTS away_full_roster boolean DEFAULT false;

-- 3. Update match status options for weather
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_status_check CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'postponed'::text, 'heat_cancellation'::text, 'rain_cancellation'::text]));

ALTER TABLE public.team_match DROP CONSTRAINT IF EXISTS team_match_status_check;
ALTER TABLE public.team_match ADD CONSTRAINT team_match_status_check CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'postponed'::text, 'heat_cancellation'::text, 'rain_cancellation'::text]));

-- 4. Point-Per-Set Standings View (2026 Logic)
-- Rule: 1 point per set won + 1 participation point if full roster present.
-- Ranking is by total points, then set diff, then game diff.

DROP VIEW IF EXISTS public.standings_2026_view;
CREATE OR REPLACE VIEW public.standings_2026_view WITH (security_invoker='on') AS
 WITH match_points AS (
    -- Calculate sets won and participation points per team per match
    SELECT 
        m.id as match_id,
        m.season_id,
        m.play_night,
        t.id as team_id,
        t.number as team_number,
        t.name as team_name,
        -- Sets won in this match
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_1 > lr.away_set_1) OR
                (m.away_team_id = t.id AND lr.away_set_1 > lr.home_set_1)
            )
        ) + 
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_2 > lr.away_set_2) OR
                (m.away_team_id = t.id AND lr.away_set_2 > lr.home_set_2)
            )
        ) +
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_3 > lr.away_set_3) OR
                (m.away_team_id = t.id AND lr.away_set_3 > lr.home_set_3)
            )
        ) as sets_won,
        -- Sets lost
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_1 < lr.away_set_1) OR
                (m.away_team_id = t.id AND lr.away_set_1 < lr.home_set_1)
            )
        ) + 
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_2 < lr.away_set_2) OR
                (m.away_team_id = t.id AND lr.away_set_2 < lr.home_set_2)
            )
        ) +
        (
            SELECT count(*) 
            FROM line_results lr 
            WHERE lr.match_id = m.id 
            AND (
                (m.home_team_id = t.id AND lr.home_set_3 < lr.away_set_3) OR
                (m.away_team_id = t.id AND lr.away_set_3 < lr.home_set_3)
            )
        ) as sets_lost,
        -- Bonus Point
        CASE 
            WHEN (m.home_team_id = t.id AND m.home_full_roster = true) THEN 1
            WHEN (m.away_team_id = t.id AND m.away_full_roster = true) THEN 1
            ELSE 0
        END as bonus_points
    FROM team_match m
    JOIN team t ON (m.home_team_id = t.id OR m.away_team_id = t.id)
    WHERE m.status = 'completed'
 )
 SELECT 
    team_id,
    team_number,
    team_name,
    play_night,
    sum(sets_won) + sum(bonus_points) as total_points,
    count(*) as matches_played,
    sum(sets_won) as total_sets_won,
    sum(sets_lost) as total_sets_lost,
    sum(bonus_points) as total_bonus_points
 FROM match_points
 GROUP BY team_id, team_number, team_name, play_night;
