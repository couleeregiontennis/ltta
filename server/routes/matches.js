import { Router } from 'express';
import { db, genUUID, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { seasonId, teamId, disputed } = req.query;
  try {
    let query = `
      SELECT tm.*, 
        ht.id as home_team_id_ref, ht.name as home_team_name, ht.number as home_team_number,
        at.id as away_team_id_ref, at.name as away_team_name, at.number as away_team_number
      FROM team_match tm
      LEFT JOIN team ht ON tm.home_team_id = ht.id
      LEFT JOIN team at ON tm.away_team_id = at.id
      WHERE 1=1
    `;
    const params = [];
    if (seasonId) { query += ` AND tm.season_id = ?`; params.push(seasonId); }
    if (teamId) { query += ` AND (tm.home_team_id = ? OR tm.away_team_id = ?)`; params.push(teamId, teamId); }
    if (disputed === 'true') { query += ` AND tm.is_disputed = 1`; }
    query += ` ORDER BY tm.date ASC`;

    const matches = db.prepare(query).all(...params);

    const stmt = db.prepare('SELECT home_won FROM line_results WHERE match_id = ?');
    
    const formattedMatches = matches.map(match => {
      const lineResults = stmt.all(match.id);
      return {
        id: match.id,
        date: match.date,
        time: match.time,
        status: match.status,
        courts: match.courts,
        is_disputed: match.is_disputed,
        home_full_roster: match.home_full_roster,
        away_full_roster: match.away_full_roster,
        home_points: match.home_points,
        away_points: match.away_points,
        home_team: {
          id: match.home_team_id_ref,
          name: match.home_team_name,
          number: match.home_team_number
        },
        away_team: {
          id: match.away_team_id_ref,
          name: match.away_team_name,
          number: match.away_team_number
        },
        line_results: lineResults
      };
    });

    res.json(formattedMatches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const match = db.prepare(`
      SELECT tm.*, 
        ht.id as home_team_id_ref, ht.name as home_team_name, ht.number as home_team_number,
        at.id as away_team_id_ref, at.name as away_team_name, at.number as away_team_number
      FROM team_match tm
      LEFT JOIN team ht ON tm.home_team_id = ht.id
      LEFT JOIN team at ON tm.away_team_id = at.id
      WHERE tm.id = ?
    `).get(req.params.id);

    if (!match) return res.status(404).json({ error: 'Match not found' });

    res.json(match);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { status } = req.body;
  try {
    const match = db.prepare('SELECT * FROM team_match WHERE id = ?').get(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // Admins can update any match; captains can only update matches involving their team
    if (!req.player.is_admin) {
      const captainTeam = db.prepare(`
        SELECT team FROM player_to_team WHERE player = ? AND status = 'active'
      `).get(req.player.id);

      if (!captainTeam || (captainTeam.team !== match.home_team_id && captainTeam.team !== match.away_team_id)) {
        return res.status(403).json({ error: 'Forbidden: You can only update matches for your own team' });
      }
    }

    db.prepare(`
      UPDATE team_match 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/flag', requireAuth, (req, res) => {
  try {
    const info = db.prepare(`
      UPDATE team_match 
      SET is_disputed = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(req.params.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Match not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/line-results', (req, res) => {
  try {
    const results = db.prepare(`
      SELECT lr.*, 
        hp1.first_name as hp1_first, hp1.last_name as hp1_last,
        hp2.first_name as hp2_first, hp2.last_name as hp2_last,
        ap1.first_name as ap1_first, ap1.last_name as ap1_last,
        ap2.first_name as ap2_first, ap2.last_name as ap2_last
      FROM line_results lr
      LEFT JOIN player hp1 ON lr.home_player_1_id = hp1.id
      LEFT JOIN player hp2 ON lr.home_player_2_id = hp2.id
      LEFT JOIN player ap1 ON lr.away_player_1_id = ap1.id
      LEFT JOIN player ap2 ON lr.away_player_2_id = ap2.id
      WHERE lr.match_id = ?
      ORDER BY lr.line_number
    `).all(req.params.id);

    const formatted = results.map(r => {
      return {
        ...r,
        home_player_1: r.home_player_1_id ? { first_name: r.hp1_first, last_name: r.hp1_last } : null,
        home_player_2: r.home_player_2_id ? { first_name: r.hp2_first, last_name: r.hp2_last } : null,
        away_player_1: r.away_player_1_id ? { first_name: r.ap1_first, last_name: r.ap1_last } : null,
        away_player_2: r.away_player_2_id ? { first_name: r.ap2_first, last_name: r.ap2_last } : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/line-results', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { line_number, match_type, home_player_1_id, home_player_2_id, away_player_1_id, away_player_2_id, home_set_1, home_set_2, home_set_3, away_set_1, away_set_2, away_set_3, home_won, notes } = req.body;
  try {
    const match = db.prepare('SELECT * FROM team_match WHERE id = ?').get(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (!req.player.is_admin) {
      const captainTeam = db.prepare(`
        SELECT team FROM player_to_team WHERE player = ? AND status = 'active'
      `).get(req.player.id);

      if (!captainTeam || (captainTeam.team !== match.home_team_id && captainTeam.team !== match.away_team_id)) {
        return res.status(403).json({ error: 'Forbidden: You can only report scores for matches involving your team' });
      }
    }

    db.prepare(`
      INSERT INTO line_results (id, match_id, line_number, match_type, home_player_1_id, home_player_2_id, away_player_1_id, away_player_2_id, home_set_1, home_set_2, home_set_3, away_set_1, away_set_2, away_set_3, home_won, submitted_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(match_id, line_number) DO UPDATE SET
        match_type=excluded.match_type,
        home_player_1_id=excluded.home_player_1_id,
        home_player_2_id=excluded.home_player_2_id,
        away_player_1_id=excluded.away_player_1_id,
        away_player_2_id=excluded.away_player_2_id,
        home_set_1=excluded.home_set_1,
        home_set_2=excluded.home_set_2,
        home_set_3=excluded.home_set_3,
        away_set_1=excluded.away_set_1,
        away_set_2=excluded.away_set_2,
        away_set_3=excluded.away_set_3,
        home_won=excluded.home_won,
        submitted_by=excluded.submitted_by,
        notes=excluded.notes
    `).run(
      genUUID(), req.params.id, line_number, match_type || 'doubles',
      home_player_1_id, home_player_2_id, 
      away_player_1_id, away_player_2_id, 
      home_set_1, home_set_2, home_set_3, 
      away_set_1, away_set_2, away_set_3, 
      home_won, req.user.id, notes || null
    );
    addAuditLog('line_results', req.params.id, 'UPSERT', null, req.body, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/roster', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { home_full_roster, away_full_roster } = req.body;
  try {
    const match = db.prepare('SELECT * FROM team_match WHERE id = ?').get(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (!req.player.is_admin) {
      const captainTeam = db.prepare(`
        SELECT team FROM player_to_team WHERE player = ? AND status = 'active'
      `).get(req.player.id);

      if (!captainTeam || (captainTeam.team !== match.home_team_id && captainTeam.team !== match.away_team_id)) {
        return res.status(403).json({ error: 'Forbidden: You can only update roster status for your own team matches' });
      }
    }

    db.prepare(`
      UPDATE team_match 
      SET home_full_roster = ?, away_full_roster = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(home_full_roster, away_full_roster, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch fetch match scores for multiple match IDs
router.post('/batch-scores', requireAuth, (req, res) => {
  const { matchIds } = req.body;
  if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
    return res.json([]);
  }
  try {
    const placeholders = matchIds.map(() => '?').join(',');
    const scores = db.prepare(`
      SELECT match_id, home_lines_won, away_lines_won, home_total_games, away_total_games, home_won
      FROM match_scores WHERE match_id IN (${placeholders})
    `).all(...matchIds);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch fetch line results for multiple match IDs
router.post('/batch-line-results', requireAuth, (req, res) => {
  const { matchIds } = req.body;
  if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
    return res.json([]);
  }
  try {
    const placeholders = matchIds.map(() => '?').join(',');
    const results = db.prepare(`
      SELECT match_id, match_type, home_player_1_id, home_player_2_id, away_player_1_id, away_player_2_id,
        home_set_1, away_set_1, home_set_2, away_set_2, home_set_3, away_set_3, home_won
      FROM line_results WHERE match_id IN (${placeholders})
    `).all(...matchIds);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upsert match scores
router.patch('/:id/scores', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { home_lines_won, away_lines_won, home_total_games, away_total_games, home_won } = req.body;
  try {
    const match = db.prepare('SELECT * FROM team_match WHERE id = ?').get(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (!req.player.is_admin) {
      const captainTeam = db.prepare(`
        SELECT team FROM player_to_team WHERE player = ? AND status = 'active'
      `).get(req.player.id);

      if (!captainTeam || (captainTeam.team !== match.home_team_id && captainTeam.team !== match.away_team_id)) {
        return res.status(403).json({ error: 'Forbidden: You can only update scores for your own team matches' });
      }
    }

    db.prepare(`
      INSERT INTO match_scores (id, match_id, home_lines_won, away_lines_won, home_total_games, away_total_games, home_won)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(match_id) DO UPDATE SET
        home_lines_won=excluded.home_lines_won,
        away_lines_won=excluded.away_lines_won,
        home_total_games=excluded.home_total_games,
        away_total_games=excluded.away_total_games,
        home_won=excluded.home_won,
        updated_at=datetime('now')
    `).run(genUUID(), req.params.id, home_lines_won, away_lines_won, home_total_games, away_total_games, home_won);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
