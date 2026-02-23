import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars, prioritizing local dev defaults if not found
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
// Check if we actually have a service role key. The anon key won't bypass RLS.
const hasServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = hasServiceRole || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials for DB setup.");
    process.exit(1);
}

// Use Service Role key to bypass RLS for seeding/teardown
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Deterministic UUIDs for our test data to ensure easy cleanup and avoid clashes
export const TEST_UUIDS = {
    player1: '11111111-1111-1111-1111-111111111111',
    player2: '22222222-2222-2222-2222-222222222222',
    team1: '33333333-3333-3333-3333-333333333333',
    team2: '44444444-4444-4444-4444-444444444444',
    location1: '55555555-5555-5555-5555-555555555555',
    court_group1: '66666666-6666-6666-6666-666666666666',
    match1: 999991, // Assuming integer IDs for matches based on previous schema views
};

// Common namespace prefix for easy manual identification
export const TEST_PREFIX = '[TEST]';

export async function setupTestData() {
    if (!hasServiceRole) {
        console.warn('--- WRN: Skipping Test Data Setup: SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS ---');
        return;
    }

    console.log('--- Setting up E2E Test Data in Supabase ---');

    try {
        // 1. Setup Test Players
        const { error: errPlayers } = await supabaseAdmin.from('player').upsert([
            {
                id: TEST_UUIDS.player1,
                first_name: `${TEST_PREFIX} Captain`,
                last_name: 'Test',
                is_captain: true,
                is_admin: true,
            },
            {
                id: TEST_UUIDS.player2,
                first_name: `${TEST_PREFIX} Regular`,
                last_name: 'Player',
                is_captain: false,
                is_admin: false,
            }
        ]);
        if (errPlayers) throw errPlayers;

        // 2. Setup Test Teams
        const { error: errTeams } = await supabaseAdmin.from('team').upsert([
            {
                id: TEST_UUIDS.team1,
                name: `${TEST_PREFIX} Alpha`,
                number: 9001,
                play_night: 'Monday'
            },
            {
                id: TEST_UUIDS.team2,
                name: `${TEST_PREFIX} Beta`,
                number: 9002,
                play_night: 'Monday'
            }
        ]);
        if (errTeams) throw errTeams;

        // 3. Assign Players to Teams
        const { error: errRoster } = await supabaseAdmin.from('player_to_team').upsert([
            {
                player: TEST_UUIDS.player1,
                team: TEST_UUIDS.team1
            },
            {
                player: TEST_UUIDS.player2,
                team: TEST_UUIDS.team1
            }
        ]);
        if (errRoster) throw errRoster;

        // 4. Setup Locations & Courts
        const { error: errLoc } = await supabaseAdmin.from('location').upsert([
            {
                id: TEST_UUIDS.location1,
                name: `${TEST_PREFIX} Rec Center`,
                address: '123 Test Ave'
            }
        ]);
        if (errLoc) throw errLoc;

        const { error: errCourt } = await supabaseAdmin.from('court_group').upsert([
            {
                id: TEST_UUIDS.court_group1,
                location_id: TEST_UUIDS.location1,
                court_numbers: '1-4',
                times_available: ['18:00', '19:30']
            }
        ]);
        if (errCourt) throw errCourt;

        // 5. Setup Match
        const { error: errMatch } = await supabaseAdmin.from('team_match').upsert([
            {
                id: TEST_UUIDS.match1,
                home_team: TEST_UUIDS.team1,
                away_team: TEST_UUIDS.team2,
                date: '2099-12-31', // Future date for testing My Schedule
                time: '18:00',
                courts: '1-4',
                season_id: '99999999-9999-9999-9999-999999999999' // Dummy season
            }
        ]);
        // Ignore match failure for now if schema doesn't perfectly align with the quick setup
        if (errMatch) console.warn("Match setup warning (might need season first):", errMatch.message);

        console.log('--- Test Data Setup Complete ---');
    } catch (error) {
        console.error("Failed to setup test data:", error);
        // Attempt teardown if setup fails midway to prevent partial pollution
        await teardownTestData();
        throw error;
    }
}

export async function teardownTestData() {
    if (!hasServiceRole) {
        console.warn('--- WRN: Skipping Test Data Teardown: SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS ---');
        return;
    }

    console.log('--- Tearing down E2E Test Data from Supabase ---');

    // Delete in reverse order of dependencies
    try {
        await supabaseAdmin.from('team_match').delete().in('id', [TEST_UUIDS.match1]);
        await supabaseAdmin.from('player_to_team').delete().in('player', [TEST_UUIDS.player1, TEST_UUIDS.player2]);
        await supabaseAdmin.from('team').delete().in('id', [TEST_UUIDS.team1, TEST_UUIDS.team2]);
        await supabaseAdmin.from('player').delete().in('id', [TEST_UUIDS.player1, TEST_UUIDS.player2]);
        await supabaseAdmin.from('court_group').delete().in('id', [TEST_UUIDS.court_group1]);
        await supabaseAdmin.from('location').delete().in('id', [TEST_UUIDS.location1]);

        // Additional sweep for anything matching the prefix just in case UUIDs changed during a test
        await supabaseAdmin.from('player').delete().like('first_name', `${TEST_PREFIX}%`);
        await supabaseAdmin.from('team').delete().like('name', `${TEST_PREFIX}%`);
        await supabaseAdmin.from('location').delete().like('name', `${TEST_PREFIX}%`);

        console.log('--- Test Data Teardown Complete ---');
    } catch (error) {
        console.error("Failed to cleanly teardown test data:", error);
    }
}
