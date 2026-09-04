import { Router } from 'express';
import { db, genUUID, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const teams = db.prepare('SELECT * FROM team ORDER BY name ASC').all();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    let team = db.prepare('SELECT * FROM team WHERE id = ?').get(req.params.id);
    if (!team && !isNaN(parseInt(req.params.id, 10))) {
      team = db.prepare('SELECT * FROM team WHERE number = ?').get(parseInt(req.params.id, 10));
    }
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/roster', (req, res) => {
  try {
    let targetTeamId = req.params.id;
    if (!isNaN(parseInt(req.params.id, 10)) && req.params.id.length < 10) {
      const found = db.prepare('SELECT id FROM team WHERE number = ?').get(parseInt(req.params.id, 10));
      if (found) targetTeamId = found.id;
    }
    const roster = db.prepare(`
      SELECT p.*, pt.status as team_status, pt.id as link_id
      FROM player_to_team pt
      JOIN player p ON pt.player = p.id
      WHERE pt.team = ?
    `).all(targetTeamId);
    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/matches', (req, res) => {
  try {
    let targetTeamId = req.params.id;
    if (!isNaN(parseInt(req.params.id, 10)) && req.params.id.length < 10) {
      const found = db.prepare('SELECT id FROM team WHERE number = ?').get(parseInt(req.params.id, 10));
      if (found) targetTeamId = found.id;
    }
    const matches = db.prepare(`
      SELECT tm.*,
        ht.id as home_team_id_ref, ht.name as home_team_name, ht.number as home_team_number,
        at.id as away_team_id_ref, at.name as away_team_name, at.number as away_team_number
      FROM team_match tm
      LEFT JOIN team ht ON tm.home_team_id = ht.id
      LEFT JOIN team at ON tm.away_team_id = at.id
      WHERE tm.home_team_id = ? OR tm.away_team_id = ?
      ORDER BY tm.date ASC
    `).all(targetTeamId, targetTeamId);

    const formattedMatches = matches.map(match => ({
      ...match,
      home_team: {
        id: match.home_team_id_ref,
        name: match.home_team_name,
        number: match.home_team_number
      },
      away_team: {
        id: match.away_team_id_ref,
        name: match.away_team_name,
        number: match.away_team_number
      }
    }));

    res.json(formattedMatches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Captain invites player to team
router.post('/:id/roster', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { player, status = 'invited' } = req.body;
  const teamId = req.params.id;

  try {
    if (!req.player.is_admin) {
      const captainTeam = db.prepare('SELECT team FROM player_to_team WHERE player = ? AND status = "active"').get(req.player.id);
      if (!captainTeam || captainTeam.team !== teamId) {
        return res.status(403).json({ error: 'Forbidden: You can only manage the roster for your own team' });
      }
    }

    const existing = db.prepare('SELECT id FROM player_to_team WHERE team = ? AND player = ?').get(teamId, player);
    if (existing) {
      db.prepare('UPDATE player_to_team SET status = ? WHERE id = ?').run(status, existing.id);
    } else {
      db.prepare('INSERT INTO player_to_team (id, player, team, status) VALUES (?, ?, ?, ?)').run(genUUID(), player, teamId, status);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Captain approves/updates roster request
router.patch('/:id/roster/:playerId', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const { status = 'active' } = req.body;
  const teamId = req.params.id;
  const playerId = req.params.playerId;

  try {
    if (!req.player.is_admin) {
      const captainTeam = db.prepare('SELECT team FROM player_to_team WHERE player = ? AND status = "active"').get(req.player.id);
      if (!captainTeam || captainTeam.team !== teamId) {
        return res.status(403).json({ error: 'Forbidden: You can only manage the roster for your own team' });
      }
    }

    const info = db.prepare('UPDATE player_to_team SET status = ? WHERE team = ? AND player = ?').run(status, teamId, playerId);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Roster record not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Captain removes player or denies request
router.delete('/:id/roster/:playerId', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  const teamId = req.params.id;
  const playerId = req.params.playerId;

  try {
    if (!req.player.is_admin) {
      const captainTeam = db.prepare('SELECT team FROM player_to_team WHERE player = ? AND status = "active"').get(req.player.id);
      if (!captainTeam || captainTeam.team !== teamId) {
        return res.status(403).json({ error: 'Forbidden: You can only manage the roster for your own team' });
      }
    }

    const info = db.prepare('DELETE FROM player_to_team WHERE team = ? AND player = ?').run(teamId, playerId);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Roster record not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
