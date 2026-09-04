import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../server/ltta.db');

function distributeSets(hSets, aSets) {
  const lines = [
    { h: 0, a: 0 },
    { h: 0, a: 0 },
    { h: 0, a: 0 },
    { h: 0, a: 0 }
  ];
  let hRemaining = hSets;
  let aRemaining = aSets;

  for (let i = 0; i < 4 && hRemaining > 0; i++) {
    const give = Math.min(2, hRemaining);
    lines[i].h += give;
    hRemaining -= give;
  }
  for (let i = 3; i >= 0 && aRemaining > 0; i--) {
    const canTake = 2 - lines[i].a;
    const give = Math.min(canTake, aRemaining);
    lines[i].a += give;
    aRemaining -= give;
  }
  for (let i = 0; i < 4 && hRemaining > 0; i++) {
    lines[i].h += 1;
    hRemaining -= 1;
  }
  for (let i = 3; i >= 0 && aRemaining > 0; i--) {
    lines[i].a += 1;
    aRemaining -= 1;
  }

  return lines.map((l, idx) => {
    const homeWon = l.h > l.a ? 1 : 0;
    let s1h = 6, s1a = 4, s2h = 6, s2a = 4, s3h = null, s3a = null;
    if (homeWon) {
      if (l.a === 1) {
        s1h = 6; s1a = 4;
        s2h = 4; s2a = 6;
        s3h = 10; s3a = 7;
      } else {
        s1h = 6; s1a = 3;
        s2h = 6; s2a = 4;
      }
    } else {
      if (l.h === 1) {
        s1h = 4; s1a = 6;
        s2h = 6; s2a = 4;
        s3h = 7; s3a = 10;
      } else {
        s1h = 3; s1a = 6;
        s2h = 4; s2a = 6;
      }
    }
    return { line_number: idx + 1, homeWon, s1h, s1a, s2h, s2a, s3h, s3a };
  });
}

async function seedCRTAData() {
  console.log(`Connecting to database at ${DB_PATH}...`);
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = OFF');

  const passwordHash = await bcrypt.hash('password123', 10);

  const sqlPath = '/tmp/real_seed.sql';
  if (!fs.existsSync(sqlPath)) {
    console.log(`Extracting legacy seed SQL from git history to ${sqlPath}...`);
    try {
      execSync(`git show b37ec66:supabase/staging/seed.sql > ${sqlPath}`, { cwd: path.join(__dirname, '..') });
    } catch (err) {
      throw new Error(`Failed to extract legacy seed SQL: ${err.message}`);
    }
  }

  let sql = fs.readFileSync(sqlPath, 'utf8');

  // Universal SQLite replacements
  sql = sql.replace(/gen_random_uuid\(\)/g, () => `'${crypto.randomUUID()}'`);
  sql = sql.replace(/\bNOW\(\)/gi, "datetime('now')");
  sql = sql.replace(/\btrue\b/gi, '1');
  sql = sql.replace(/\bfalse\b/gi, '0');
  sql = sql.replace(/"public"\./g, '');
  sql = sql.replace(/::jsonb/gi, '');
  sql = sql.replace(/::[a-zA-Z0-9_]+/g, '');
  sql = sql.replace(/ON CONFLICT\s*\([^\)]+\)\s*DO NOTHING/gi, '');

  console.log('Clearing existing records...');
  db.exec(`
    DELETE FROM line_results;
    DELETE FROM team_match;
    DELETE FROM matches;
    DELETE FROM player_to_team;
    DELETE FROM player;
    DELETE FROM users;
    DELETE FROM team_to_season;
    DELETE FROM season;
    DELETE FROM location;
    DELETE FROM team;
  `);

  // 1. Core tables (location, season, team, team_to_season)
  console.log('Inserting core tables (location, season, team, team_to_season)...');
  db.exec(`
    CREATE TEMP TABLE temp_team (id TEXT, number INTEGER, name TEXT, play_night TEXT);
  `);

  const teamInsertMatch = sql.match(/INSERT INTO "team"[\s\S]+?;/i);
  if (teamInsertMatch) {
    const q = teamInsertMatch[0].replace('INSERT INTO "team"', 'INSERT INTO temp_team');
    db.exec(q);
    db.exec(`
      INSERT OR IGNORE INTO team (id, number, name, play_night)
      SELECT id, number, name, play_night FROM temp_team;
    `);
  }

  const locMatch = sql.match(/INSERT INTO "location"[\s\S]+?;/i);
  if (locMatch) {
    db.exec(locMatch[0].replace('INSERT INTO "location"', 'INSERT OR IGNORE INTO location'));
  }

  const seasonMatch = sql.match(/INSERT INTO "season"[\s\S]+?;/i);
  if (seasonMatch) {
    db.exec(seasonMatch[0].replace('INSERT INTO "season"', 'INSERT OR IGNORE INTO season'));
  }

  const ttsMatch = sql.match(/INSERT INTO "team_to_season"[\s\S]+?;/i);
  if (ttsMatch) {
    db.exec(ttsMatch[0].replace('INSERT INTO "team_to_season"', 'INSERT OR IGNORE INTO team_to_season'));
  }

  // 2. Users & Players via temp tables
  console.log('Inserting real users and players...');
  db.exec(`
    CREATE TEMP TABLE temp_auth_users (
      id TEXT, instance_id TEXT, email TEXT, encrypted_password TEXT, email_confirmed_at TEXT,
      raw_app_meta_data TEXT, raw_user_meta_data TEXT, created_at TEXT, updated_at TEXT,
      role TEXT, aud TEXT
    );
  `);

  const authMatch = sql.match(/INSERT INTO "auth"\."users"[\s\S]+?;/i);
  if (authMatch) {
    const q = authMatch[0].replace('INSERT INTO "auth"."users"', 'INSERT INTO temp_auth_users');
    db.exec(q);
    db.exec(`
      INSERT OR IGNORE INTO users (id, email, password_hash)
      SELECT id, email, '${passwordHash}' FROM temp_auth_users;
    `);
  }

  db.exec(`
    CREATE TEMP TABLE temp_player (
      id TEXT, user_id TEXT, first_name TEXT, last_name TEXT, email TEXT, phone TEXT,
      ranking INTEGER, is_captain INTEGER, is_active INTEGER, notes TEXT
    );
  `);

  const playerMatch = sql.match(/INSERT INTO "player"[\s\S]+?;/i);
  if (playerMatch) {
    const q = playerMatch[0].replace('INSERT INTO "player"', 'INSERT INTO temp_player');
    db.exec(q);
    db.exec(`
      INSERT OR IGNORE INTO player (id, user_id, first_name, last_name, email, phone, ranking, is_captain, is_active, is_admin, notes)
      SELECT id, user_id, first_name, last_name, email, phone, ranking, is_captain, is_active,
             CASE WHEN email = 'brett.meddaugh@gmail.com' THEN 1 ELSE 0 END, notes
      FROM temp_player;
    `);
  }

  // Demo accounts
  const demoUsers = [
    { id: '00000000-0000-0000-0000-000000000001', email: 'admin@ltta.local', pid: '00000000-0000-0000-0000-000000000011', fn: 'Admin', ln: 'User', admin: 1, cap: 1 },
    { id: '00000000-0000-0000-0000-000000000002', email: 'captain@ltta.local', pid: '00000000-0000-0000-0000-000000000012', fn: 'Captain', ln: 'Dave', admin: 0, cap: 1 },
    { id: '00000000-0000-0000-0000-000000000003', email: 'player@ltta.local', pid: '00000000-0000-0000-0000-000000000013', fn: 'Johnny', ln: 'Player', admin: 0, cap: 0 }
  ];
  for (let u of demoUsers) {
    db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(u.id, u.email, passwordHash);
    db.prepare(`
      INSERT OR IGNORE INTO player (id, user_id, first_name, last_name, email, ranking, is_captain, is_active, is_admin)
      VALUES (?, ?, ?, ?, ?, 3, ?, 1, ?)
    `).run(u.pid, u.id, u.fn, u.ln, u.email, u.cap, u.admin);
  }

  // 3. Player to Team
  console.log('Inserting player team assignments...');
  const pttMatch = sql.match(/INSERT INTO "player_to_team"[\s\S]+?;/i);
  if (pttMatch) {
    db.exec(pttMatch[0].replace('INSERT INTO "player_to_team"', 'INSERT OR IGNORE INTO player_to_team'));
  }

  // 4. Matches & Team Matches
  console.log('Inserting matches schedule...');
  const matchesMatch = sql.match(/INSERT INTO "matches"[\s\S]+?;/i);
  if (matchesMatch) {
    db.exec(matchesMatch[0].replace('INSERT INTO "matches"', 'INSERT OR IGNORE INTO matches'));
  }

  const tmMatch = sql.match(/INSERT INTO "team_match"[\s\S]+?;/i);
  if (tmMatch) {
    db.exec(tmMatch[0].replace('INSERT INTO "team_match"', 'INSERT OR IGNORE INTO team_match'));
  }

  // 5. Original Match updates from seed
  console.log('Applying base match updates from seed...');
  const updates = sql.match(/UPDATE [^;]+;/g) || [];
  for (let u of updates) {
    db.exec(u.replace(/"matches"/g, 'matches').replace(/"team_match"/g, 'team_match'));
  }

  // 6. Original Line Results from seed (Wednesday weeks 1-3)
  console.log('Inserting original line results from seed...');
  const lineResults = sql.match(/INSERT INTO "line_results"[\s\S]+?;/g) || [];
  for (let lr of lineResults) {
    db.exec(lr.replace('INSERT INTO "line_results"', 'INSERT OR IGNORE INTO line_results'));
  }

  // 7. Full season standings & scores from Google Sheet CSV
  const csvPath = path.join(__dirname, 'crta_standings_2026.csv');
  if (fs.existsSync(csvPath)) {
    console.log(`Applying official full-season CRTA scores from ${csvPath}...`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n').map(l => l.split(','));

    const scoresByNight = { Tuesday: {}, Wednesday: {} };
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const m = row[0].match(/Team\s+(\d+)/i);
      if (!m) continue;
      const teamNum = parseInt(m[1], 10);
      const night = row[1].trim();
      if (!scoresByNight[night]) scoresByNight[night] = {};
      scoresByNight[night][teamNum] = {};
      for (let w = 1; w <= 11; w++) {
        scoresByNight[night][teamNum][w] = row[1 + w]?.trim();
      }
    }

    const allMatches = db.prepare(`
      SELECT m.id, m.week, m.home_team_number, m.away_team_number, m.home_team_night,
             tm.home_team_id, tm.away_team_id
      FROM matches m
      JOIN team_match tm ON m.id = tm.id
      ORDER BY m.week, m.home_team_night, m.home_team_number
    `).all();

    const updateTM = db.prepare(`
      UPDATE team_match
      SET home_points = ?, away_points = ?, status = ?, is_rained_out = ?,
          winner_id = ?, home_full_roster = 1, away_full_roster = 1, updated_at = datetime('now')
      WHERE id = ?
    `);
    const updateM = db.prepare(`UPDATE matches SET status = ?, updated_at = datetime('now') WHERE id = ?`);

    const checkLines = db.prepare(`SELECT count(*) as count FROM line_results WHERE match_id = ?`);
    const insertLine = db.prepare(`
      INSERT INTO line_results (
        id, match_id, line_number, match_type,
        home_set_1, away_set_1, home_set_2, away_set_2, home_set_3, away_set_3,
        home_won, submitted_at
      ) VALUES (?, ?, ?, 'doubles', ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    let completedCount = 0;
    let rainoutCount = 0;
    let generatedLineCount = 0;

    for (let match of allMatches) {
      const night = match.home_team_night === 'tuesday' ? 'Tuesday' : 'Wednesday';
      let hVal = scoresByNight[night]?.[match.home_team_number]?.[match.week];
      let aVal = scoresByNight[night]?.[match.away_team_number]?.[match.week];

      // Handle Serve Aces vs Team 1 on 2026-07-08 (week 6 Wednesday):
      if (match.week === 6 && night === 'Wednesday' && (match.home_team_number === 7 || match.away_team_number === 7)) {
        if (match.home_team_number === 7) hVal = '8';
        if (match.away_team_number === 7) aVal = '8';
      }

      if (hVal === 'WEATHER' || aVal === 'WEATHER') {
        updateTM.run(0, 0, 'rain_cancellation', 1, null, match.id);
        updateM.run('rain_cancellation', match.id);
        rainoutCount++;
      } else if (hVal && aVal && hVal !== '?' && aVal !== '?') {
        const hp = parseInt(hVal, 10);
        const ap = parseInt(aVal, 10);
        const winner = hp > ap ? match.home_team_id : (ap > hp ? match.away_team_id : null);
        updateTM.run(hp, ap, 'completed', 0, winner, match.id);
        updateM.run('completed', match.id);
        completedCount++;

        // If no line results exist yet for this completed match, synthesize them
        const existingLines = checkLines.get(match.id).count;
        if (existingLines === 0) {
          const hSets = Math.max(0, hp - 4);
          const aSets = Math.max(0, ap - 4);
          const linesData = distributeSets(hSets, aSets);
          for (let l of linesData) {
            insertLine.run(
              crypto.randomUUID(), match.id, l.line_number,
              l.s1h, l.s1a, l.s2h, l.s2a, l.s3h, l.s3a,
              l.homeWon
            );
            generatedLineCount++;
          }
        }
      }
    }
    console.log(`Scores updated: ${completedCount} completed, ${rainoutCount} weather cancellations, ${generatedLineCount} synthetic line results added.`);
  }

  // Ensure Brett's account is admin and captain
  db.prepare(`
    UPDATE player 
    SET is_admin = 1, is_captain = 1, is_active = 1 
    WHERE email = 'brett.meddaugh@gmail.com'
  `).run();

  db.pragma('foreign_keys = ON');

  // Verify counts
  const teamsCount = db.prepare('SELECT count(*) as c FROM team').get().c;
  const playersCount = db.prepare('SELECT count(*) as c FROM player').get().c;
  const usersCount = db.prepare('SELECT count(*) as c FROM users').get().c;
  const rosterCount = db.prepare('SELECT count(*) as c FROM player_to_team').get().c;
  const matchesCount = db.prepare('SELECT count(*) as c FROM matches').get().c;
  const completedMatches = db.prepare("SELECT count(*) as c FROM team_match WHERE status = 'completed'").get().c;
  const rainoutMatches = db.prepare("SELECT count(*) as c FROM team_match WHERE status = 'rain_cancellation'").get().c;
  const linesCount = db.prepare('SELECT count(*) as c FROM line_results').get().c;

  console.log('\n--- Seed Verification Summary ---');
  console.log(`Teams: ${teamsCount}`);
  console.log(`Players: ${playersCount}`);
  console.log(`Users: ${usersCount}`);
  console.log(`Roster assignments: ${rosterCount}`);
  console.log(`Total matches: ${matchesCount}`);
  console.log(`Completed matches: ${completedMatches}`);
  console.log(`Rain cancellations: ${rainoutMatches}`);
  console.log(`Total line results: ${linesCount}`);

  console.log('\nCRTA Real Data Seed Completed Successfully!');
  db.close();
}

seedCRTAData().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
