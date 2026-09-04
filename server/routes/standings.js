import { Router } from 'express';
import { db, genUUID, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const query = `
      WITH team_match_stats AS (
        SELECT 
          tm.id as match_id,
          t.id as team_id,
          t.number as team_number,
          t.name as team_name,
          t.play_night,
          CASE 
            WHEN tm.home_team_id = t.id THEN tm.home_points
            ELSE tm.away_points
          END as points,
          CASE 
            WHEN (tm.home_team_id = t.id AND tm.home_points > tm.away_points) OR (tm.away_team_id = t.id AND tm.away_points > tm.home_points) THEN 1
            ELSE 0
          END as is_win,
          CASE 
            WHEN (tm.home_team_id = t.id AND tm.home_points < tm.away_points) OR (tm.away_team_id = t.id AND tm.away_points < tm.home_points) THEN 1
            ELSE 0
          END as is_loss,
          CASE 
            WHEN tm.home_points = tm.away_points THEN 1
            ELSE 0
          END as is_tie,
          CASE 
            WHEN tm.home_team_id = t.id THEN 
              CASE WHEN tm.home_points >= 4 THEN tm.home_points - 4 ELSE 0 END
            ELSE 
              CASE WHEN tm.away_points >= 4 THEN tm.away_points - 4 ELSE 0 END
          END as sets_won,
          CASE 
            WHEN tm.home_team_id = t.id THEN 
              CASE WHEN tm.away_points >= 4 THEN tm.away_points - 4 ELSE 0 END
            ELSE 
              CASE WHEN tm.home_points >= 4 THEN tm.home_points - 4 ELSE 0 END
          END as sets_lost,
          CASE 
            WHEN tm.home_team_id = t.id THEN 
              CASE WHEN tm.home_points >= 4 THEN 4 ELSE tm.home_points END
            ELSE 
              CASE WHEN tm.away_points >= 4 THEN 4 ELSE tm.away_points END
          END as bonus_points
        FROM team t
        JOIN team_match tm ON (tm.home_team_id = t.id OR tm.away_team_id = t.id) AND tm.status = 'completed'
      )
      SELECT
        t.id as team_id,
        t.number as team_number,
        t.name as team_name,
        t.play_night,
        COALESCE(sum(s.points), 0) as total_points,
        count(s.match_id) as matches_played,
        COALESCE(sum(s.sets_won), 0) as total_sets_won,
        COALESCE(sum(s.sets_lost), 0) as total_sets_lost,
        COALESCE(sum(s.bonus_points), 0) as total_bonus_points,
        COALESCE(sum(s.is_win), 0) as wins,
        COALESCE(sum(s.is_loss), 0) as losses,
        COALESCE(sum(s.is_tie), 0) as ties
      FROM team t
      LEFT JOIN team_match_stats s ON t.id = s.team_id
      GROUP BY t.id, t.number, t.name, t.play_night
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
