import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Fetch the URL from the environment
const DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

// Ensure the connection uses IPv4 by explicitly appending the query parameter
// This is the most reliable way to force the pg client to use IPv4 with Supabase
const urlObj = new URL(DB_URL);
if (urlObj.hostname.includes('pooler.supabase.com')) {
    urlObj.searchParams.set('options', 'reference=shlcqztfdhfwkhijwgue');
}
const finalUrl = urlObj.toString();

const client = new Client({
    connectionString: finalUrl,
    keepAlive: false // Helps prevent hanging connections in CI
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
