import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { curatedFaqs } from './data/curatedFaqs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'ltta.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  -- users table (replaces Supabase auth.users)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- season
  CREATE TABLE IF NOT EXISTS season (
    id TEXT PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    location_id TEXT REFERENCES location(id),
    is_active INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- location
  CREATE TABLE IF NOT EXISTS location (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    map_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_person TEXT,
    number_of_courts INTEGER DEFAULT 0,
    facility_type TEXT CHECK(facility_type IN ('outdoor', 'indoor', 'mixed')),
    lighting_info TEXT,
    parking_info TEXT,
    restroom_access INTEGER DEFAULT 0,
    open_year_round INTEGER DEFAULT 0,
    opening_date TEXT,
    amenities TEXT, -- JSON string
    photos TEXT, -- JSON array string
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- team
  CREATE TABLE IF NOT EXISTS team (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    play_night TEXT NOT NULL CHECK(play_night IN ('tuesday', 'wednesday')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- player
  CREATE TABLE IF NOT EXISTS player (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    ranking INTEGER DEFAULT 3 NOT NULL,
    is_captain INTEGER DEFAULT 0 NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    is_admin INTEGER DEFAULT 0,
    notes TEXT,
    day_availability TEXT DEFAULT '{}', -- JSON string
    emergency_contact TEXT,
    emergency_phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- player_to_team
  CREATE TABLE IF NOT EXISTS player_to_team (
    id TEXT PRIMARY KEY,
    player TEXT REFERENCES player(id),
    team TEXT REFERENCES team(id),
    status TEXT DEFAULT 'active' CHECK(status IN ('pending', 'active', 'invited', 'declined')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- player_to_match
  CREATE TABLE IF NOT EXISTS player_to_match (
    id TEXT PRIMARY KEY,
    player TEXT REFERENCES player(id),
    match TEXT REFERENCES match(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- match (the legacy match table)
  CREATE TABLE IF NOT EXISTS match (
    id TEXT PRIMARY KEY,
    winning_team TEXT REFERENCES team(id),
    match_date TEXT DEFAULT (datetime('now')),
    team_1_points INTEGER,
    team_2_points INTEGER
  );

  -- matches (the schedule-based matches table with team names)
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    week INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    courts TEXT NOT NULL,
    home_team_number INTEGER NOT NULL,
    home_team_name TEXT NOT NULL,
    home_team_night TEXT NOT NULL,
    away_team_number INTEGER NOT NULL,
    away_team_name TEXT NOT NULL,
    away_team_night TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'postponed', 'heat_cancellation', 'rain_cancellation')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- match_scores
  CREATE TABLE IF NOT EXISTS match_scores (
    id TEXT PRIMARY KEY,
    match_id TEXT UNIQUE REFERENCES matches(id),
    home_lines_won INTEGER DEFAULT 0,
    away_lines_won INTEGER DEFAULT 0,
    home_total_games INTEGER DEFAULT 0,
    away_total_games INTEGER DEFAULT 0,
    home_won INTEGER, -- boolean as int
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- match_to_team_match
  CREATE TABLE IF NOT EXISTS match_to_team_match (
    id TEXT PRIMARY KEY,
    match TEXT NOT NULL REFERENCES match(id),
    team_match TEXT REFERENCES team_match(id)
  );

  -- team_match
  CREATE TABLE IF NOT EXISTS team_match (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    courts TEXT NOT NULL,
    home_team_id TEXT REFERENCES team(id),
    away_team_id TEXT REFERENCES team(id),
    home_points REAL DEFAULT 0,
    away_points REAL DEFAULT 0,
    winner_id TEXT REFERENCES team(id),
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'postponed', 'heat_cancellation', 'rain_cancellation')),
    season_id TEXT REFERENCES season(id),
    location_id TEXT REFERENCES location(id),
    is_rained_out INTEGER DEFAULT 0,
    is_disputed INTEGER DEFAULT 0,
    home_full_roster INTEGER DEFAULT 0,
    away_full_roster INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- team_to_season
  CREATE TABLE IF NOT EXISTS team_to_season (
    id TEXT PRIMARY KEY,
    team TEXT REFERENCES team(id),
    season TEXT REFERENCES season(id)
  );

  -- line_results
  CREATE TABLE IF NOT EXISTS line_results (
    id TEXT PRIMARY KEY,
    match_id TEXT REFERENCES team_match(id),
    line_number INTEGER NOT NULL CHECK(line_number IN (1, 2, 3, 4)),
    match_type TEXT NOT NULL CHECK(match_type IN ('singles', 'doubles')),
    home_player_1_id TEXT REFERENCES player(id),
    home_player_2_id TEXT REFERENCES player(id),
    away_player_1_id TEXT REFERENCES player(id),
    away_player_2_id TEXT REFERENCES player(id),
    home_set_1 INTEGER,
    away_set_1 INTEGER,
    home_set_2 INTEGER,
    away_set_2 INTEGER,
    home_set_3 INTEGER,
    away_set_3 INTEGER,
    home_won INTEGER, -- boolean
    submitted_by TEXT REFERENCES users(id),
    submitted_at TEXT DEFAULT (datetime('now')),
    notes TEXT,
    UNIQUE(match_id, line_number)
  );

  -- set
  CREATE TABLE IF NOT EXISTS "set" (
    id TEXT PRIMARY KEY,
    set_number INTEGER NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    winner TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- set_to_match
  CREATE TABLE IF NOT EXISTS set_to_match (
    id TEXT PRIMARY KEY,
    match_id TEXT REFERENCES match(id),
    set_id TEXT REFERENCES "set"(id)
  );

  -- court_group
  CREATE TABLE IF NOT EXISTS court_group (
    id TEXT PRIMARY KEY,
    group_name TEXT NOT NULL,
    court_numbers TEXT NOT NULL, -- JSON array string
    location_id TEXT REFERENCES location(id),
    is_active INTEGER DEFAULT 1,
    preferred_time TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- player_fee
  CREATE TABLE IF NOT EXISTS player_fee (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL REFERENCES season(id),
    amount REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- suggestions
  CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'archived')),
    ip_hash TEXT,
    jules_response TEXT, -- JSON string
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- sub_request
  CREATE TABLE IF NOT EXISTS sub_request (
    id TEXT PRIMARY KEY,
    captain_user_id TEXT NOT NULL REFERENCES users(id),
    team_id TEXT NOT NULL REFERENCES team(id),
    match_date TEXT NOT NULL,
    match_time TEXT,
    location_id TEXT REFERENCES location(id),
    required_ranking INTEGER DEFAULT 3,
    status TEXT DEFAULT 'open' CHECK(status IN ('open', 'filled', 'canceled')),
    sub_user_id TEXT REFERENCES users(id),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- season_payments
  CREATE TABLE IF NOT EXISTS season_payments (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL REFERENCES season(id),
    player_id TEXT REFERENCES player(id),
    team_id TEXT REFERENCES team(id),
    amount_paid REAL NOT NULL,
    payment_method TEXT DEFAULT 'zeffy',
    status TEXT DEFAULT 'verified' CHECK(status IN ('pending', 'verified')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    CHECK(player_id IS NOT NULL OR team_id IS NOT NULL)
  );

  -- audit_logs
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT,
    operation TEXT NOT NULL,
    old_data TEXT, -- JSON string
    new_data TEXT, -- JSON string
    changed_by TEXT REFERENCES users(id),
    changed_at TEXT DEFAULT (datetime('now'))
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_player_user_id ON player(user_id);
  CREATE INDEX IF NOT EXISTS idx_player_email ON player(email);
  CREATE INDEX IF NOT EXISTS idx_player_is_active ON player(is_active);

  CREATE INDEX IF NOT EXISTS idx_p2t_player ON player_to_team(player);
  CREATE INDEX IF NOT EXISTS idx_p2t_team ON player_to_team(team);

  CREATE INDEX IF NOT EXISTS idx_team_num_night ON team(number, play_night);
  CREATE INDEX IF NOT EXISTS idx_team_night ON team(play_night);

  CREATE INDEX IF NOT EXISTS idx_team_match_season ON team_match(season_id);
  CREATE INDEX IF NOT EXISTS idx_team_match_home ON team_match(home_team_id);
  CREATE INDEX IF NOT EXISTS idx_team_match_away ON team_match(away_team_id);

  CREATE INDEX IF NOT EXISTS idx_line_results_match ON line_results(match_id);
  CREATE INDEX IF NOT EXISTS idx_line_results_submitted ON line_results(submitted_by);

  CREATE INDEX IF NOT EXISTS idx_match_scores_match ON match_scores(match_id);

  CREATE INDEX IF NOT EXISTS idx_season_payments_season ON season_payments(season_id);
  CREATE INDEX IF NOT EXISTS idx_season_payments_player ON season_payments(player_id);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
  CREATE INDEX IF NOT EXISTS idx_audit_logs_changed ON audit_logs(changed_at);

  -- Full Text Search virtual table for local rules assistant (priority 10 for local rules, 1 for national)
  CREATE VIRTUAL TABLE IF NOT EXISTS rules_fts USING fts5(content, source, priority);

  -- Instant rules FAQ table for zero-latency direct hits
  CREATE TABLE IF NOT EXISTS rules_faq (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    keywords TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    priority INTEGER DEFAULT 0
  );
  CREATE VIRTUAL TABLE IF NOT EXISTS rules_faq_fts USING fts5(keywords, question, answer, content=rules_faq, content_rowid=rowid);

  -- Log umpire queries to monitor player questions, confidence, and blindspots
  CREATE TABLE IF NOT EXISTS umpire_queries (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    matched_faq INTEGER DEFAULT 0,
    matched_rule INTEGER DEFAULT 0,
    answer TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_umpire_queries_created ON umpire_queries(created_at);
`);

/**
 * Generate a new UUID using Node's crypto module
 * @returns {string} UUIDv4 string
 */
export function genUUID() {
  return crypto.randomUUID();
}

/**
 * Helper to record audit logs
 * @param {string} tableName 
 * @param {string} recordId 
 * @param {string} operation 
 * @param {any} oldData 
 * @param {any} newData 
 * @param {string} changedBy 
 */
export function addAuditLog(tableName, recordId, operation, oldData, newData, changedBy) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, table_name, record_id, operation, old_data, new_data, changed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    genUUID(),
    tableName,
    recordId,
    operation,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    changedBy || null
  );
}

export function ensureRulesIndexed() {
  try {
    // 1. Ensure curated FAQs are seeded into rules_faq and rules_faq_fts
    const faqCount = db.prepare('SELECT count(*) as count FROM rules_faq').get();
    if (!faqCount || faqCount.count === 0) {
      const insertFaq = db.prepare(`
        INSERT INTO rules_faq (id, topic, keywords, question, answer, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertFaqFts = db.prepare(`
        INSERT INTO rules_faq_fts (rowid, keywords, question, answer)
        VALUES (?, ?, ?, ?)
      `);

      const seedTx = db.transaction(() => {
        for (const item of curatedFaqs) {
          const id = genUUID();
          const info = insertFaq.run(id, item.topic, item.keywords, item.question, item.answer, 1);
          insertFaqFts.run(info.lastInsertRowid, item.keywords, item.question, item.answer);
        }
      });
      seedTx();
    }

    // 2. Index rules into rules_fts in bite-sized snippets (<350 chars)
    const row = db.prepare('SELECT count(*) as count FROM rules_fts').get();
    if (row && row.count > 0) return;

    const rulesPath = path.join(__dirname, '../public/rules_context.md');
    const facPath = path.join(__dirname, '../public/friend_at_court.md');

    const insert = db.prepare('INSERT INTO rules_fts (content, source, priority) VALUES (?, ?, ?)');

    const indexFile = (filePath, sourceName, priority = 1) => {
      if (!fs.existsSync(filePath)) return;
      let content = fs.readFileSync(filePath, 'utf-8');

      // Exclude medical/emergency guidelines (Part 4) from Friend at Court to prevent medical hallucinations
      if (sourceName === 'friend_at_court.md') {
        const part4Index = content.indexOf('PART 4—USTA EMERGENCY CARE GUIDELINES');
        const part5Index = content.indexOf('PART 5—UMPIRE ASSIGNMENT');
        if (part4Index !== -1) {
          if (part5Index !== -1 && part5Index > part4Index) {
            content = content.slice(0, part4Index) + '\n\n' + content.slice(part5Index);
          } else {
            content = content.slice(0, part4Index);
          }
        }
      }

      const paragraphs = content.split(/\n\s*\n/);
      for (const para of paragraphs) {
        const clean = para.trim().replace(/\s+/g, ' ');
        if (!clean || clean.length < 20) continue;

        // Keep snippets small (100 to 400 chars) for weak models
        if (clean.length <= 450) {
          insert.run(clean, sourceName, priority.toString());
        } else {
          // Break longer paragraphs by sentences
          const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g) || [clean];
          let currentChunk = '';
          for (const s of sentences) {
            if ((currentChunk + ' ' + s).length > 350) {
              if (currentChunk.trim()) insert.run(currentChunk.trim(), sourceName, priority.toString());
              currentChunk = s;
            } else {
              currentChunk = currentChunk ? currentChunk + ' ' + s : s;
            }
          }
          if (currentChunk.trim()) insert.run(currentChunk.trim(), sourceName, priority.toString());
        }
      }
    };

    const tx = db.transaction(() => {
      indexFile(rulesPath, 'rules_context.md', 10);
      indexFile(facPath, 'friend_at_court.md', 1);
    });
    tx();
  } catch (err) {
    console.error('Failed to index rules into FTS:', err);
  }
}

export { db };

