import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

let DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

let clientConfig = {
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
};

try {
    const dbUrlObj = new URL(DB_URL);
    const stagingProjectId = 'shlcqztfdhfwkhijwgue';

    // Honor the hostname and port from the provided DB_URL if it's already a Supavisor URL
    // Otherwise, fallback to the default Supavisor (IPv4) setup.
    if (!dbUrlObj.hostname.includes('pooler.supabase.com')) {
        dbUrlObj.hostname = 'aws-0-us-east-1.pooler.supabase.com';
        dbUrlObj.port = '6543';
    }
    dbUrlObj.username = `postgres.${stagingProjectId}`;
    dbUrlObj.searchParams.delete('options');

    clientConfig.connectionString = dbUrlObj.toString();
    console.log(`Connecting to Supavisor (IPv4) at ${dbUrlObj.hostname}...`);
} catch (e) {
    console.warn("Could not parse URLs:", e.message);
}

const client = new Client(clientConfig);

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
