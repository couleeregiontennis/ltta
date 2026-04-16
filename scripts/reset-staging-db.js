import pkg from 'pg';
import fs from 'fs';
import dns from 'node:dns';

// Force IPv4 resolution to avoid ENETUNREACH issues with Supabase's IPv6 direct hosts in GitHub Actions
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const { Client } = pkg;

let DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

try {
    const dbUrlObj = new URL(DB_URL);
    const stagingProjectId = 'shlcqztfdhfwkhijwgue';
    
    // Force the direct connection host (db.[ref].supabase.co)
    // Combined with the IPv4 preference above, this is the most reliable way to connect in CI
    dbUrlObj.hostname = `db.${stagingProjectId}.supabase.co`;
    dbUrlObj.port = '5432';
    dbUrlObj.username = 'postgres';
    dbUrlObj.searchParams.delete('options');
    
    DB_URL = dbUrlObj.toString();
    console.log(`Attempting direct connection to ${dbUrlObj.hostname} (IPv4 preferred)...`);
} catch (e) {
    console.warn("Could not parse DB_URL, using as provided:", e.message);
}

const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Connecting to Staging Database...");
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
