import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const seasons = db.prepare('SELECT * FROM season ORDER BY created_at DESC').all();
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active', (req, res) => {
  try {
    const season = db.prepare('SELECT * FROM season WHERE is_active = 1 LIMIT 1').get();
    if (!season) {
      return res.status(404).json({ error: 'No active season found' });
    }
    res.json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const season = db.prepare('SELECT * FROM season WHERE id = ?').get(req.params.id);
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
