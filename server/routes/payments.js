import { Router } from 'express';
import { db, genUUID } from '../db.js';
import { requireAuth, loadPlayer, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, loadPlayer, (req, res) => {
  try {
    const { seasonId } = req.query;
    
    let query = `
      SELECT sp.*, p.first_name, p.last_name, p.email as player_email, t.name as team_name
      FROM season_payments sp
      LEFT JOIN player p ON sp.player_id = p.id
      LEFT JOIN team t ON sp.team_id = t.id
      WHERE sp.season_id = ?
    `;
    const params = [seasonId];

    if (!req.player?.is_admin) {
      query += ' AND sp.player_id = ?';
      params.push(req.player.id);
    }
    
    query += ' ORDER BY sp.created_at DESC';

    const payments = db.prepare(query).all(...params);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, loadPlayer, (req, res) => {
  try {
    const { season_id, player_id, team_id, amount_paid, payment_method, notes, status } = req.body;
    
    let targetPlayerId = player_id;
    if (!req.player?.is_admin) {
      targetPlayerId = req.player.id;
    }

    const id = genUUID();
    db.prepare(`
      INSERT INTO season_payments (id, season_id, player_id, team_id, amount_paid, payment_method, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, season_id, targetPlayerId, team_id, amount_paid, payment_method, notes, status);
    
    res.status(201).json({ id, message: 'Payment created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const { amount_paid, payment_method, notes, status } = req.body;
    const result = db.prepare(`
      UPDATE season_payments
      SET amount_paid = ?, payment_method = ?, notes = ?, status = ?
      WHERE id = ?
    `).run(amount_paid, payment_method, notes, status, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM season_payments WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
