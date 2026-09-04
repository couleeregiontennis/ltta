import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { db, genUUID } from '../db.js';
import { generateToken, requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// 1. POST /api/auth/signup - Create a new user account
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const id = genUUID ? genUUID() : crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertUser = db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)');
    const insertPlayer = db.prepare('INSERT INTO player (id, first_name, last_name, email, user_id) VALUES (?, ?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      insertUser.run(id, email, hashedPassword);
      const playerId = genUUID ? genUUID() : crypto.randomUUID();
      // Insert associated player record
      insertPlayer.run(playerId, '', '', email, id);
    });

    transaction();

    const user = { id, email };
    const token = generateToken(user);
    
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    res.status(201).json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. POST /api/auth/login - Sign in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRecord = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);
    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, userRecord.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = { id: userRecord.id, email: userRecord.email };
    const token = generateToken(user);

    const player = db.prepare('SELECT * FROM player WHERE user_id = ?').get(user.id);

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    res.json({ user, player });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/auth/logout - Sign out
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true });
});

// 4. GET /api/auth/session - Get current session
router.get('/session', optionalAuth, (req, res) => {
  try {
    const user = req.user || null;
    const player = user ? db.prepare('SELECT * FROM player WHERE user_id = ?').get(user.id) : null;
    const season = db.prepare('SELECT * FROM season WHERE is_active = 1 LIMIT 1').get() || null;

    res.json({
      session: user ? { user } : null,
      player: player || null,
      season: season || null
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST /api/auth/reset-password - Request password reset
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  // Local-only app: log the request, no real email sending
  console.log(`Password reset requested for: ${email}`);
  res.json({ success: true, message: 'Password reset request received.' });
});

// 6. PUT /api/auth/update-password - Update password
router.put('/update-password', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, req.user.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
