import { Router } from 'express';
import { db, genUUID } from '../db.js';
import { requireAuth, loadPlayer, requireCaptain } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  try {
    const subRequests = db.prepare(`
      SELECT sr.*, t.name as team_name, t.number as team_number, l.name as location_name
      FROM sub_request sr
      LEFT JOIN team t ON sr.team_id = t.id
      LEFT JOIN location l ON sr.location_id = l.id
      ORDER BY sr.created_at DESC
    `).all();
    res.json(subRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, loadPlayer, requireCaptain, (req, res) => {
  try {
    const { team_id, match_date, match_time, location_id, required_ranking, notes } = req.body;
    const id = genUUID();
    db.prepare(`
      INSERT INTO sub_request (id, team_id, match_date, match_time, location_id, required_ranking, notes, captain_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, team_id, match_date, match_time, location_id, required_ranking, notes, req.user.id);
    res.status(201).json({ id, message: 'Sub request created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/claim', requireAuth, (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE sub_request
      SET sub_user_id = ?, status = 'filled'
      WHERE id = ? AND status != 'filled'
    `).run(req.user.id, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Sub request not found or already filled' });
    }
    res.json({ message: 'Sub request claimed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/cancel', requireAuth, (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE sub_request
      SET status = 'canceled'
      WHERE id = ? AND captain_user_id = ?
    `).run(req.params.id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(403).json({ error: 'Not authorized or sub request not found' });
    }
    res.json({ message: 'Sub request canceled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  try {
    const result = db.prepare(`
      DELETE FROM sub_request
      WHERE id = ? AND captain_user_id = ?
    `).run(req.params.id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(403).json({ error: 'Not authorized or sub request not found' });
    }
    res.json({ message: 'Sub request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
