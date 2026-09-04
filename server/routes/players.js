import { Router } from 'express';
import { db, genUUID, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { active } = req.query;
  try {
    let query = 'SELECT * FROM player';
    let players;
    if (active === 'true') {
      query += ' WHERE is_active = 1';
      players = db.prepare(query).all();
    } else {
      players = db.prepare(query).all();
    }
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireAuth, loadPlayer, (req, res) => {
  res.json(req.player);
});

router.get('/me/team', requireAuth, loadPlayer, (req, res) => {
  try {
    const teamInfo = db.prepare(`
      SELECT t.*, pt.status as team_status, pt.team
      FROM player_to_team pt
      JOIN team t ON pt.team = t.id
      WHERE pt.player = ? AND pt.status = 'active'
    `).get(req.player?.id);
    res.json(teamInfo || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request to join a team or associate during onboarding
router.post('/me/team', requireAuth, loadPlayer, (req, res) => {
  const { team_id } = req.body;
  if (!team_id) return res.status(400).json({ error: 'team_id is required' });

  try {
    const existing = db.prepare('SELECT id FROM player_to_team WHERE player = ? AND team = ?').get(req.player.id, team_id);
    if (existing) {
      return res.json({ success: true, message: 'Already requested or joined' });
    }

    db.prepare(`
      INSERT INTO player_to_team (id, player, team, status)
      VALUES (?, ?, ?, 'pending')
    `).run(genUUID(), req.player.id, team_id);

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/matches', requireAuth, loadPlayer, (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT * FROM player_to_match 
      WHERE player = ?
    `).all(req.player?.id);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', requireAuth, loadPlayer, (req, res) => {
  const { first_name, last_name, phone, ranking, day_availability, emergency_contact, emergency_phone, notes } = req.body;
  try {
    db.prepare(`
      UPDATE player 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          ranking = COALESCE(?, ranking),
          day_availability = COALESCE(?, day_availability),
          emergency_contact = COALESCE(?, emergency_contact),
          emergency_phone = COALESCE(?, emergency_phone),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(
      first_name ?? null,
      last_name ?? null,
      phone ?? null,
      ranking ?? null,
      day_availability !== undefined ? (typeof day_availability === 'object' ? JSON.stringify(day_availability) : day_availability) : null,
      emergency_contact ?? null,
      emergency_phone ?? null,
      notes ?? null,
      req.player.id
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  // Check if id is 'me' and return early? But /me route handles that since it's defined before
  try {
    const player = db.prepare('SELECT * FROM player WHERE id = ?').get(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
