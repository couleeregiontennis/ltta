import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Fetch the URL from the environment
let DB_URL = process.env.STAGING_DB_URL;
const PROJECT_REF = 'shlcqztfdhfwkhijwgue';

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

try {
    const urlObj = new URL(DB_URL);
    // If using the Supabase pooler, ensure the username has the project ref (Supavisor format)
    if (urlObj.hostname.includes('pooler.supabase.com')) {
        let user = decodeURIComponent(urlObj.username);
        // Supavisor requires user.tenant format
        if (!user.includes('.')) {
            urlObj.username = encodeURIComponent(`${user}.${PROJECT_REF}`);
        }
        // It's safest to use the session/transaction pooler port
        urlObj.port = '6543'; 
        DB_URL = urlObj.toString();
    }
} catch (e) {
    console.error("Invalid database URL format.", e);
    process.exit(1);
}

const client = new Client({
    connectionString: DB_URL,
    // Add SSL to prevent connection rejections on managed databases
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        console.log("Connecting to Staging Database (IPv4 Pooler)...");
        await client.connect();
        console.log("Connected successfully!");

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
        console.error("Database connection or execution error:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
// Trigger workflow run - $(date)
