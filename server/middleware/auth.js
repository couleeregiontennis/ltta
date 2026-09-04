import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ltta-local-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Loads user but doesn't require auth (for public routes that optionally use user data)
export function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) { /* ignore invalid tokens */ }
  }
  next();
}

// Requires user to be a captain
export function requireCaptain(req, res, next) {
  // req.player should be set by a previous middleware that fetches the player record
  if (!req.player?.is_captain && !req.player?.is_admin) {
    return res.status(403).json({ error: 'Captain access required' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.player?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Middleware to load the player record after auth
export function loadPlayer(req, res, next) {
  if (!req.user) return next();
  try {
    req.player = db.prepare('SELECT * FROM player WHERE user_id = ?').get(req.user.id);
    next();
  } catch (err) {
    next(err);
  }
}

export { JWT_SECRET };
