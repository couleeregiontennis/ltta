import bcrypt from 'bcrypt';
import { db, genUUID } from '../server/db.js';

async function seed() {
  console.log('Seeding SQLite database at server/ltta.db...');

  // Compute password hash ahead of synchronous better-sqlite3 transaction
  const passwordHash = await bcrypt.hash('password123', 10);

  const transaction = db.transaction(() => {
    // 1. Create admin and demo users
    const adminUserId = genUUID();
    const captainUserId = genUUID();
    const playerUserId = genUUID();

    db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      .run(adminUserId, 'admin@ltta.local', passwordHash);
    db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      .run(captainUserId, 'captain@ltta.local', passwordHash);
    db.prepare('INSERT OR IGNORE INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      .run(playerUserId, 'player@ltta.local', passwordHash);

    // 2. Location
    const locId = '11111111-1111-1111-1111-111111111111';
    db.prepare(`
      INSERT OR IGNORE INTO location (id, name, address, number_of_courts, facility_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(locId, 'Coulee Region Tennis Center', '123 Main St, La Crosse, WI', 6, 'outdoor');

    // 3. Season (Active)
    const seasonId = '22222222-2222-2222-2222-222222222222';
    db.prepare(`
      INSERT OR IGNORE INTO season (id, number, start_date, end_date, location_id, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(seasonId, 1, '2026-05-01', '2026-08-31', locId);

    // 4. Teams
    const teams = [
      { id: '33333333-3333-3333-3333-333333333331', number: 1, name: 'Aces', play_night: 'tuesday' },
      { id: '33333333-3333-3333-3333-333333333332', number: 2, name: 'Faults', play_night: 'tuesday' },
      { id: '33333333-3333-3333-3333-333333333333', number: 3, name: 'Netters', play_night: 'wednesday' },
      { id: '33333333-3333-3333-3333-333333333334', number: 4, name: 'Lobbers', play_night: 'wednesday' },
    ];

    const insertTeam = db.prepare(`
      INSERT OR IGNORE INTO team (id, number, name, play_night) VALUES (?, ?, ?, ?)
    `);
    const insertTeamSeason = db.prepare(`
      INSERT OR IGNORE INTO team_to_season (id, team, season) VALUES (?, ?, ?)
    `);

    for (const t of teams) {
      insertTeam.run(t.id, t.number, t.name, t.play_night);
      insertTeamSeason.run(genUUID(), t.id, seasonId);
    }

    // 5. Players
    const adminPlayerId = genUUID();
    const captainPlayerId = genUUID();
    const regularPlayerId = genUUID();

    const insertPlayer = db.prepare(`
      INSERT OR IGNORE INTO player (id, user_id, first_name, last_name, email, phone, ranking, is_captain, is_admin, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insertPlayer.run(adminPlayerId, adminUserId, 'Admin', 'User', 'admin@ltta.local', '555-0101', 4, 1, 1);
    insertPlayer.run(captainPlayerId, captainUserId, 'Captain', 'Dave', 'captain@ltta.local', '555-0102', 4, 1, 0);
    insertPlayer.run(regularPlayerId, playerUserId, 'John', 'Player', 'player@ltta.local', '555-0103', 3, 0, 0);

    // Assign captain to Team 1 (Aces) and regular player to Team 1
    const insertPlayerTeam = db.prepare(`
      INSERT OR IGNORE INTO player_to_team (id, player, team, status) VALUES (?, ?, ?, 'active')
    `);
    insertPlayerTeam.run(genUUID(), captainPlayerId, teams[0].id);
    insertPlayerTeam.run(genUUID(), regularPlayerId, teams[0].id);
    insertPlayerTeam.run(genUUID(), adminPlayerId, teams[1].id);

    // 6. Matches (team_match and legacy matches)
    const match1Id = '66666666-6666-6666-6666-666666666661';
    const match2Id = '66666666-6666-6666-6666-666666666662';

    db.prepare(`
      INSERT OR IGNORE INTO team_match (id, date, time, courts, home_team_id, away_team_id, status, season_id, location_id, home_full_roster, away_full_roster)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `).run(match1Id, '2026-05-05', '18:00', '1, 2, 3', teams[0].id, teams[1].id, 'completed', seasonId, locId);

    db.prepare(`
      INSERT OR IGNORE INTO team_match (id, date, time, courts, home_team_id, away_team_id, status, season_id, location_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(match2Id, '2026-05-06', '18:00', '4, 5, 6', teams[2].id, teams[3].id, 'scheduled', seasonId, locId);

    // Legacy matches table for compatibility
    db.prepare(`
      INSERT OR IGNORE INTO matches (id, week, date, time, courts, home_team_number, home_team_name, home_team_night, away_team_number, away_team_name, away_team_night, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(match1Id, 1, '2026-05-05', '18:00', '1, 2, 3', 1, 'Aces', 'tuesday', 2, 'Faults', 'tuesday', 'completed');

    db.prepare(`
      INSERT OR IGNORE INTO matches (id, week, date, time, courts, home_team_number, home_team_name, home_team_night, away_team_number, away_team_name, away_team_night, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(match2Id, 1, '2026-05-06', '18:00', '4, 5, 6', 3, 'Netters', 'wednesday', 4, 'Lobbers', 'wednesday', 'scheduled');

    // 7. Match scores & Line results
    db.prepare(`
      INSERT OR IGNORE INTO match_scores (id, match_id, home_lines_won, away_lines_won, home_total_games, away_total_games, home_won)
      VALUES (?, ?, 2, 1, 30, 25, 1)
    `).run(genUUID(), match1Id);

    const insertLine = db.prepare(`
      INSERT OR IGNORE INTO line_results (id, match_id, line_number, match_type, home_set_1, away_set_1, home_set_2, away_set_2, home_set_3, away_set_3, home_won)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertLine.run(genUUID(), match1Id, 1, 'singles', 6, 4, 6, 2, null, null, 1);
    insertLine.run(genUUID(), match1Id, 2, 'singles', 3, 6, 4, 6, null, null, 0);
    insertLine.run(genUUID(), match1Id, 3, 'doubles', 6, 3, 5, 7, 7, 5, 1);

    console.log('Seeding complete! Default login credentials:');
    console.log('Admin:   admin@ltta.local / password123');
    console.log('Captain: captain@ltta.local / password123');
    console.log('Player:  player@ltta.local / password123');
  });

  await transaction();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
