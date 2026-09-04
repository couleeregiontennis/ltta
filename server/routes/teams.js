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
    const team = db.prepare('SELECT * FROM team WHERE id = ?').get(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/roster', (req, res) => {
  try {
    const roster = db.prepare(`
      SELECT p.*, pt.status as team_status, pt.id as link_id
      FROM player_to_team pt
      JOIN player p ON pt.player = p.id
      WHERE pt.team = ?
    `).all(req.params.id);
    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/matches', (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT * FROM team_match 
      WHERE home_team_id = ? OR away_team_id = ?
      ORDER BY date ASC
    `).all(req.params.id, req.params.id);
    res.json(matches);
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
