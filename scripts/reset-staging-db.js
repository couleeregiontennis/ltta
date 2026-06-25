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
    let apiPoolerHost = null;

    if (process.env.SUPABASE_ACCESS_TOKEN) {
        try {
            console.log("Fetching database pooler config for shlcqztfdhfwkhijwgue...");
            const poolerConfigRes = await fetch('https://api.supabase.com/v1/projects/shlcqztfdhfwkhijwgue/config/database/pooler', {
                headers: {
                    'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
                }
            });
            const poolerConfig = await poolerConfigRes.json();

            if (Array.isArray(poolerConfig) && poolerConfig.length > 0 && poolerConfig[0].db_host) {
                apiPoolerHost = poolerConfig[0].db_host;
                console.log(`Discovered pooler host from API: ${apiPoolerHost}`);
            }
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
        'aws-1-us-east-2.pooler.supabase.com',
        'aws-1-us-east-1.pooler.supabase.com',
        'aws-0-us-east-2.pooler.supabase.com',
        'aws-0-us-east-1.pooler.supabase.com'
    ];
    if (apiPoolerHost && !hostsToTry.includes(apiPoolerHost)) {
        hostsToTry.unshift(apiPoolerHost);
    }
    if (originalHost && !hostsToTry.includes(originalHost)) {
        hostsToTry.unshift(originalHost);
    }

    // Try connection permutations
    for (const host of hostsToTry) {
        if (connected) break;

        for (const port of ['6543', '5432']) {
            if (connected) break;

            // Format A: postgres user + reference option
            try {
                const urlObj = new URL(DB_URL);
                urlObj.hostname = host;
                urlObj.port = port;
                urlObj.username = 'postgres';
                urlObj.searchParams.set('options', `reference=${PROJECT_REF}`);
                
                const safeUrl = urlObj.toString().replace(password, '****');
                console.log(`Connecting to ${host}:${port} (Format A: postgres user + reference option)...`);
                console.log(`URL: ${safeUrl}`);
                client = await tryConnect(urlObj.toString());
                console.log(`Connected successfully to ${host}:${port} (Format A)!`);
                connected = true;
                break;
            } catch (err) {
                console.warn(`Format A connection to ${host}:${port} failed:`, err.message || err);
            }

            // Format B: postgres.PROJECT_REF user
            try {
                const urlObj = new URL(DB_URL);
                urlObj.hostname = host;
                urlObj.port = port;
                urlObj.username = `postgres.${PROJECT_REF}`;
                urlObj.searchParams.delete('options');
                
                const safeUrl = urlObj.toString().replace(password, '****');
                console.log(`Connecting to ${host}:${port} (Format B: postgres.${PROJECT_REF} user)...`);
                console.log(`URL: ${safeUrl}`);
                client = await tryConnect(urlObj.toString());
                console.log(`Connected successfully to ${host}:${port} (Format B)!`);
                connected = true;
                break;
            } catch (err) {
                console.warn(`Format B connection to ${host}:${port} failed:`, err.message || err);
            }
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

        console.log("Clearing auth.users table...");
        try {
            await client.query('TRUNCATE auth.users CASCADE;');
            console.log("auth.users table truncated.");
        } catch (authErr) {
            console.warn("Truncate failed, trying delete:", authErr.message);
            try {
                await client.query('DELETE FROM auth.users;');
                console.log("auth.users table deleted.");
            } catch (deleteErr) {
                console.warn("Could not clear auth.users table:", deleteErr.message);
            }
        }

        console.log("Applying migrations...");
        const migrationsDir = 'supabase/migrations';
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
        
        console.log(`Found ${files.length} migrations to apply.`);
        for (const file of files) {
            console.log(`Applying migration: ${file}`);
            const migrationSql = fs.readFileSync(`${migrationsDir}/${file}`, 'utf8');
            await client.query(migrationSql);
        }
        console.log("Migrations applied.");

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
