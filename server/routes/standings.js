import { Router } from 'express';
import { db, genUUID, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const query = `
      WITH match_points AS (
        SELECT 
          tm.id as match_id,
          t.id as team_id, t.number as team_number, t.name as team_name, t.play_night,
          (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_1 > lr.away_set_1) OR
              (tm.away_team_id = t.id AND lr.away_set_1 > lr.home_set_1)
            )
          ) + (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_2 > lr.away_set_2) OR
              (tm.away_team_id = t.id AND lr.away_set_2 > lr.home_set_2)
            )
          ) + (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_3 > lr.away_set_3) OR
              (tm.away_team_id = t.id AND lr.away_set_3 > lr.home_set_3)
            )
          ) as sets_won,
          (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_1 < lr.away_set_1) OR
              (tm.away_team_id = t.id AND lr.away_set_1 < lr.home_set_1)
            )
          ) + (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_2 < lr.away_set_2) OR
              (tm.away_team_id = t.id AND lr.away_set_2 < lr.home_set_2)
            )
          ) + (
            SELECT count(*) FROM line_results lr WHERE lr.match_id = tm.id AND (
              (tm.home_team_id = t.id AND lr.home_set_3 < lr.away_set_3) OR
              (tm.away_team_id = t.id AND lr.away_set_3 < lr.home_set_3)
            )
          ) as sets_lost,
          CASE
            WHEN tm.home_team_id = t.id AND tm.home_full_roster = 1 THEN 1
            WHEN tm.away_team_id = t.id AND tm.away_full_roster = 1 THEN 1
            ELSE 0
          END as bonus_points
        FROM team_match tm
        JOIN team t ON (tm.home_team_id = t.id OR tm.away_team_id = t.id)
        WHERE tm.status = 'completed'
      )
      SELECT
        team_id, team_number, team_name, play_night,
        sum(sets_won) + sum(bonus_points) as total_points,
        count(*) as matches_played,
        sum(sets_won) as total_sets_won,
        sum(sets_lost) as total_sets_lost,
        sum(bonus_points) as total_bonus_points
      FROM match_points
      GROUP BY team_id, team_number, team_name, play_night
      ORDER BY total_points DESC
    `;
    const standings = db.prepare(query).all();
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent-matches', (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT tm.*, 
        ht.name as home_team_name, ht.number as home_team_number,
        at.name as away_team_name, at.number as away_team_number
      FROM team_match tm
      LEFT JOIN team ht ON tm.home_team_id = ht.id
      LEFT JOIN team at ON tm.away_team_id = at.id
      WHERE tm.status = 'completed'
      ORDER BY tm.date DESC, tm.time DESC
      LIMIT 6
    `).all();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/overview', (req, res) => {
  try {
    const totalMatches = db.prepare("SELECT count(*) as count FROM team_match").get().count;
    const totalTeams = db.prepare("SELECT count(*) as count FROM team").get().count;
    const totalPlayers = db.prepare("SELECT count(*) as count FROM player").get().count;
    
    res.json({
      total_matches: totalMatches,
      total_teams: totalTeams,
      total_players: totalPlayers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
