import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { db, genUUID } from '../../server/db.js';
import adminRouter from '../../server/routes/admin.js';
import { generateToken } from '../../server/middleware/auth.js';

describe('Admin Player Update Mass Assignment & SQL Injection Protection', () => {
  let app;
  let server;
  let baseUrl;
  let testPlayerId;
  let adminUserId;
  let authToken;

  before(async () => {
    // Set up dummy test player and admin user
    adminUserId = genUUID();
    testPlayerId = genUUID();

    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(
      adminUserId,
      `admin-${adminUserId}@test.com`,
      'hash'
    );

    db.prepare(`
      INSERT INTO player (id, user_id, first_name, last_name, email, is_admin, ranking)
      VALUES (?, ?, 'Test', 'Player', ?, 1, 3)
    `).run(testPlayerId, adminUserId, `player-${testPlayerId}@test.com`);

    authToken = generateToken({ id: adminUserId, email: `admin-${adminUserId}@test.com` });

    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRouter);

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
    // Clean up test data
    db.prepare('DELETE FROM audit_logs WHERE record_id = ?').run(testPlayerId);
    db.prepare('DELETE FROM player WHERE id = ?').run(testPlayerId);
    db.prepare('DELETE FROM users WHERE id = ?').run(adminUserId);
  });

  test('successfully updates allowed player fields', async () => {
    const res = await fetch(`${baseUrl}/api/admin/players/${testPlayerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        first_name: 'UpdatedName',
        ranking: 4,
        notes: 'Updated notes'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.message, 'Player updated successfully');

    const updatedPlayer = db.prepare('SELECT * FROM player WHERE id = ?').get(testPlayerId);
    assert.equal(updatedPlayer.first_name, 'UpdatedName');
    assert.equal(updatedPlayer.ranking, 4);
    assert.equal(updatedPlayer.notes, 'Updated notes');
  });

  test('ignores disallowed fields and SQL injection payload keys', async () => {
    const originalUser = db.prepare('SELECT user_id FROM player WHERE id = ?').get(testPlayerId);

    const res = await fetch(`${baseUrl}/api/admin/players/${testPlayerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        first_name: 'SafeName',
        user_id: 'malicious-user-id-override',
        'is_admin = 1 --': 'hacked'
      })
    });

    assert.equal(res.status, 200);

    const updatedPlayer = db.prepare('SELECT * FROM player WHERE id = ?').get(testPlayerId);
    assert.equal(updatedPlayer.first_name, 'SafeName');
    assert.equal(updatedPlayer.user_id, originalUser.user_id);
  });

  test('returns 400 when only disallowed fields are supplied', async () => {
    const res = await fetch(`${baseUrl}/api/admin/players/${testPlayerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        user_id: 'hacked-id',
        created_at: '2020-01-01'
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, 'No valid fields to update');
  });
});
