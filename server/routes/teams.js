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

export default router;
