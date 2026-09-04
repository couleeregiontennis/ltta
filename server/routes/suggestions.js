import { Router } from 'express';
import { db, genUUID } from '../db.js';
import { requireAuth, loadPlayer, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, loadPlayer, (req, res) => {
  try {
    let suggestions;
    if (req.player?.is_admin) {
      suggestions = db.prepare('SELECT * FROM suggestions ORDER BY created_at DESC').all();
    } else {
      suggestions = db.prepare('SELECT * FROM suggestions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    }
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const id = genUUID();
    db.prepare('INSERT INTO suggestions (id, user_id, content) VALUES (?, ?, ?)').run(id, req.user.id, content);
    res.status(201).json({ id, user_id: req.user.id, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireAuth, loadPlayer, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const result = db.prepare('UPDATE suggestions SET status = ? WHERE id = ?').run(status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Suggestion status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
