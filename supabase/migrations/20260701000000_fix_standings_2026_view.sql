-- Migration: Fix standings_2026_view to include win/loss/games columns
-- The view was missing wins, losses, ties, games_won, games_lost, win_percentage
-- which caused the frontend to display 0% for win rate and 0 for games won.
--
-- Rule: 1 point per set won + 1 participation point if full roster present.
-- Ranking is by total points, then set diff, then game diff.
-- Match wins/losses are determined by who won more sets.

DROP VIEW IF EXISTS public.standings_2026_view;

CREATE OR REPLACE VIEW public.standings_2026_view WITH (security_invoker='on') AS
 WITH match_points AS (
    -- Calculate sets won, games won, and participation points per team per match
    SELECT
        m.id as match_id,
        m.season_id,
        t.play_night,
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
        -- Games won (total games won by this team across all lines)
        (
            SELECT COALESCE(SUM(
                CASE
                    WHEN m.home_team_id = t.id
                    THEN COALESCE(lr.home_set_1, 0) + COALESCE(lr.home_set_2, 0) + COALESCE(lr.home_set_3, 0)
                    ELSE COALESCE(lr.away_set_1, 0) + COALESCE(lr.away_set_2, 0) + COALESCE(lr.away_set_3, 0)
                END
            ), 0)
            FROM line_results lr
            WHERE lr.match_id = m.id
        ) as games_won,
        -- Games lost (total games lost by this team across all lines)
        (
            SELECT COALESCE(SUM(
                CASE
                    WHEN m.home_team_id = t.id
                    THEN COALESCE(lr.away_set_1, 0) + COALESCE(lr.away_set_2, 0) + COALESCE(lr.away_set_3, 0)
                    ELSE COALESCE(lr.home_set_1, 0) + COALESCE(lr.home_set_2, 0) + COALESCE(lr.home_set_3, 0)
                END
            ), 0)
            FROM line_results lr
            WHERE lr.match_id = m.id
        ) as games_lost,
        -- Bonus Point
        CASE
            WHEN (m.home_team_id = t.id AND m.home_full_roster = true) THEN 1
            WHEN (m.away_team_id = t.id AND m.away_full_roster = true) THEN 1
            ELSE 0
        END as bonus_points
    FROM team_match m
    JOIN team t ON (m.home_team_id = t.id OR m.away_team_id = t.id)
    WHERE m.status = 'completed'
 ),
 match_outcomes AS (
    -- Determine match win/loss/tie based on sets won vs sets lost
    SELECT *,
        CASE WHEN sets_won > sets_lost THEN 1 ELSE 0 END as is_win,
        CASE WHEN sets_won < sets_lost THEN 1 ELSE 0 END as is_loss,
        CASE WHEN sets_won = sets_lost THEN 1 ELSE 0 END as is_tie
    FROM match_points
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
    sum(bonus_points) as total_bonus_points,
    sum(games_won) as games_won,
    sum(games_lost) as games_lost,
    sum(is_win) as wins,
    sum(is_loss) as losses,
    sum(is_tie) as ties,
    CASE WHEN COUNT(*) > 0 THEN ROUND((SUM(is_win)::numeric / COUNT(*)) * 100, 1) ELSE 0 END AS win_percentage
 FROM match_outcomes
 GROUP BY team_id, team_number, team_name, play_night;
