import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Fetch the URL from the environment
let DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

const PROJECT_REF = 'shlcqztfdhfwkhijwgue';

async function tryConnect(dbUrl) {
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        keepAlive: false
    });
    await client.connect();
    return client;
}

async function run() {
    if (process.env.SUPABASE_ACCESS_TOKEN) {
        try {
            console.log("Fetching projects list from Supabase API...");
            const res = await fetch('https://api.supabase.com/v1/projects', {
                headers: {
                    'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
                }
            });
            const data = await res.json();
            console.log("Supabase Projects API Response:", JSON.stringify(data, null, 2));

            console.log("Fetching database config for shlcqztfdhfwkhijwgue...");
            const dbConfigRes = await fetch('https://api.supabase.com/v1/projects/shlcqztfdhfwkhijwgue/config/database/postgres', {
                headers: {
                    'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
                }
            });
            const dbConfig = await dbConfigRes.json();
            console.log("Database Config API Response:", JSON.stringify(dbConfig, null, 2));
        } catch (e) {
            console.warn("Failed to fetch Supabase details:", e.message);
        }
    }

    let client = null;
    let connected = false;

    // Parse the password and other details from DB_URL
    let password = '';
    let originalHost = '';
    try {
        const u = new URL(DB_URL);
        password = u.password;
        originalHost = u.hostname;
        console.log("Parsed DB_URL details (password masked):");
        console.log(`- protocol: ${u.protocol}`);
        console.log(`- username: ${u.username}`);
        console.log(`- hostname: ${u.hostname}`);
        console.log(`- port: ${u.port}`);
        console.log(`- pathname: ${u.pathname}`);
        console.log(`- search: ${u.search}`);
    } catch (e) {
        console.error("Invalid database URL provided in environment:", e.message);
        process.exit(1);
    }

    // List of hosts to try connection on
    const hostsToTry = [
        'aws-0-us-east-2.pooler.supabase.com',
        'aws-0-us-east-1.pooler.supabase.com'
    ];
    if (originalHost && !hostsToTry.includes(originalHost)) {
        hostsToTry.unshift(originalHost);
    }

    // Try connection permutations
    for (const host of hostsToTry) {
        if (connected) break;

        // Permutation 1: Username postgres with reference option
        try {
            const urlObj = new URL(DB_URL);
            urlObj.hostname = host;
            urlObj.port = '6543';
            urlObj.username = 'postgres';
            urlObj.searchParams.set('options', `reference=${PROJECT_REF}`);
            
            const safeUrl = urlObj.toString().replace(password, '****');
            console.log(`Connecting to ${host} (Format A: postgres user + reference option)...`);
            console.log(`URL: ${safeUrl}`);
            client = await tryConnect(urlObj.toString());
            console.log(`Connected successfully to ${host} (Format A)!`);
            connected = true;
            break;
        } catch (err) {
            console.warn(`Format A connection to ${host} failed:`, err.message || err);
        }

        // Permutation 2: Username postgres.PROJECT_REF with no options
        try {
            const urlObj = new URL(DB_URL);
            urlObj.hostname = host;
            urlObj.port = '6543';
            urlObj.username = `postgres.${PROJECT_REF}`;
            urlObj.searchParams.delete('options');
            
            const safeUrl = urlObj.toString().replace(password, '****');
            console.log(`Connecting to ${host} (Format B: postgres.${PROJECT_REF} user)...`);
            console.log(`URL: ${safeUrl}`);
            client = await tryConnect(urlObj.toString());
            console.log(`Connected successfully to ${host} (Format B)!`);
            connected = true;
            break;
        } catch (err) {
            console.warn(`Format B connection to ${host} failed:`, err.message || err);
        }
    }

    if (!connected || !client) {
        console.error("Error: Could not connect to staging database via any combination.");
        process.exit(1);
    }

    try {
        console.log("Wiping existing public schema...");
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;');
        console.log("Public schema wiped and recreated.");

        console.log("Applying schema...");
        const schema = fs.readFileSync('supabase/staging/schema.sql', 'utf8');
        await client.query(schema);
        console.log("Schema applied.");

        console.log("Applying seed data...");
        const seed = fs.readFileSync('supabase/staging/seed.sql', 'utf8');
        await client.query(seed);
        console.log("Seed data applied successfully! Staging DB is fully recreated.");

    } catch (err) {
        console.error("Database execution error:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
