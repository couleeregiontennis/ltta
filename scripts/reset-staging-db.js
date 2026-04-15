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
    
    // The pooler URL in the GitHub secret seems to be routing to the wrong region or is invalid
    // We will forcefully bypass Supavisor and use the direct connection host.
    // GitHub Actions runners support IPv4/IPv6 resolution for the direct db host.
    dbUrlObj.hostname = `db.${stagingProjectId}.supabase.co`;
    dbUrlObj.port = '5432';
    dbUrlObj.username = 'postgres';
    dbUrlObj.searchParams.delete('options');
    
    clientConfig.connectionString = dbUrlObj.toString();
    console.log(`Forced direct connection to db.${stagingProjectId}.supabase.co to bypass Supavisor issues.`);
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
