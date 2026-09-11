import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { db, genUUID } from '../../server/db.js';
import matchesRouter from '../../server/routes/matches.js';

describe('GET /api/matches Line Results Batching & Performance', () => {
  let app;
  let server;
  let baseUrl;
  let testSeasonId;
  let homeTeamId;
  let awayTeamId;
  const matchIds = [];

  before(async () => {
    testSeasonId = genUUID();
    homeTeamId = genUUID();
    awayTeamId = genUUID();

    db.prepare("INSERT INTO season (id, number, start_date, end_date) VALUES (?, 999, '2026-05-01', '2026-08-01')").run(testSeasonId);
    db.prepare("INSERT INTO team (id, number, name, play_night) VALUES (?, 901, 'Test Home Team', 'tuesday')").run(homeTeamId);
    db.prepare("INSERT INTO team (id, number, name, play_night) VALUES (?, 902, 'Test Away Team', 'tuesday')").run(awayTeamId);

    // Seed 100 matches with line_results
    const insertMatch = db.prepare(`
      INSERT INTO team_match (id, date, time, courts, home_team_id, away_team_id, season_id, status)
      VALUES (?, '2026-05-01', '18:00', '1,2', ?, ?, ?, 'scheduled')
    `);
    const insertLine = db.prepare(`
      INSERT INTO line_results (id, match_id, line_number, match_type, home_won)
      VALUES (?, ?, ?, 'doubles', ?)
    `);

    db.transaction(() => {
      for (let i = 0; i < 100; i++) {
        const mId = genUUID();
        matchIds.push(mId);
        insertMatch.run(mId, homeTeamId, awayTeamId, testSeasonId);
        for (let l = 1; l <= 4; l++) {
          insertLine.run(genUUID(), mId, l, l % 2);
        }
      }
    })();

    app = express();
    app.use(express.json());
    app.use('/api/matches', matchesRouter);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    db.transaction(() => {
      for (const mId of matchIds) {
        db.prepare('DELETE FROM line_results WHERE match_id = ?').run(mId);
        db.prepare('DELETE FROM team_match WHERE id = ?').run(mId);
      }
      db.prepare('DELETE FROM team WHERE id IN (?, ?)').run(homeTeamId, awayTeamId);
      db.prepare('DELETE FROM season WHERE id = ?').run(testSeasonId);
    })();
  });

  test('returns formatted matches with correct line_results', async () => {
    const res = await fetch(`${baseUrl}/api/matches?seasonId=${testSeasonId}`);
    assert.equal(res.status, 200);

    const matches = await res.json();
    assert.equal(matches.length, 100);

    const sample = matches[0];
    assert.equal(sample.home_team.name, 'Test Home Team');
    assert.equal(sample.away_team.name, 'Test Away Team');
    assert.ok(Array.isArray(sample.line_results));
    assert.equal(sample.line_results.length, 4);
    assert.ok('home_won' in sample.line_results[0]);
  });

  test('handles empty match list gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/matches?seasonId=nonexistent-season-id`);
    assert.equal(res.status, 200);
    const matches = await res.json();
    assert.deepEqual(matches, []);
  });

  test('benchmark response time across 50 requests', async () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      const res = await fetch(`${baseUrl}/api/matches?seasonId=${testSeasonId}`);
      assert.equal(res.status, 200);
    }
    const duration = performance.now() - start;
    console.log(`\n[BENCHMARK] 50 requests elapsed time: ${duration.toFixed(2)}ms (Avg: ${(duration / 50).toFixed(2)}ms/req)`);
  });
});
