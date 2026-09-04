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

export const courtsRouter = Router();

courtsRouter.get('/', (req, res) => {
  try {
    const groups = db.prepare(`
      SELECT cg.*, l.name as location_name, l.address as location_address
      FROM court_group cg
      LEFT JOIN location l ON cg.location_id = l.id
      WHERE cg.is_active = 1
      ORDER BY cg.group_name
    `).all();

    const formatted = groups.map(g => {
      let courtNumbers = [];
      try {
        courtNumbers = JSON.parse(g.court_numbers);
      } catch (e) {
        courtNumbers = g.court_numbers ? [g.court_numbers] : [];
      }
      return {
        id: g.id,
        group_name: g.group_name,
        court_numbers: courtNumbers,
        preferred_time: g.preferred_time,
        location: g.location_name ? {
          name: g.location_name,
          address: g.location_address
        } : null
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


