import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM location ORDER BY name').all();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const location = db.prepare('SELECT * FROM location WHERE id = ?').get(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
