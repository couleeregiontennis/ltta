import { Router } from 'express';
import { db, addAuditLog } from '../db.js';
import { requireAuth, loadPlayer, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/audit-logs', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const { tableName } = req.query;

    let query = `
      SELECT al.*, p.first_name, p.last_name
      FROM audit_logs al
      LEFT JOIN player p ON al.changed_by = p.user_id
    `;
    const params = [];

    if (tableName) {
      query += ' WHERE al.table_name = ?';
      params.push(tableName);
    }

    query += ' ORDER BY al.changed_at DESC LIMIT ?';
    params.push(limit);

    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/players', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const players = db.prepare(`
      SELECT p.*, t.name as team_name, t.number as team_number, pt.status as team_status
      FROM player p
      LEFT JOIN player_to_team pt ON pt.player = p.id AND pt.status = 'active'
      LEFT JOIN team t ON pt.team = t.id
      ORDER BY p.last_name, p.first_name
    `).all();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/players/:id', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const playerId = req.params.id;
    const body = req.body;
    
    // Retrieve previous state for audit log
    const prevPlayer = db.prepare('SELECT * FROM player WHERE id = ?').get(playerId);
    if (!prevPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Build the update query dynamically
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => body[f]);
    
    db.prepare(`UPDATE player SET ${setClause} WHERE id = ?`).run(...values, playerId);
    
    // Add audit log
    addAuditLog('player', playerId, 'UPDATE', req.user.id, prevPlayer, { ...prevPlayer, ...body });
    
    res.json({ message: 'Player updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/players/:id/role', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const playerId = req.params.id;
    const { is_captain, is_admin } = req.body;

    const prevPlayer = db.prepare('SELECT * FROM player WHERE id = ?').get(playerId);
    if (!prevPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const updates = {};
    if (typeof is_captain !== 'undefined') updates.is_captain = is_captain;
    if (typeof is_admin !== 'undefined') updates.is_admin = is_admin;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No role fields to update' });
    }

    const setClause = Object.keys(updates).map(f => `${f} = ?`).join(', ');
    const values = Object.values(updates);
    
    db.prepare(`UPDATE player SET ${setClause} WHERE id = ?`).run(...values, playerId);
    
    addAuditLog('player', playerId, 'UPDATE', req.user.id, prevPlayer, { ...prevPlayer, ...updates });

    res.json({ message: 'Player role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
