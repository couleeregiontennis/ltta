import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Fetch the URL from the environment
const DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

const PROJECT_REF = 'shlcqztfdhfwkhijwgue';
let config = {};

try {
    const urlObj = new URL(DB_URL);
    
    config = {
        user: decodeURIComponent(urlObj.username),
        password: decodeURIComponent(urlObj.password),
        host: urlObj.hostname,
        port: parseInt(urlObj.port || '5432', 10),
        database: urlObj.pathname.split('/')[1],
        keepAlive: false,
    };

    // If using the pooler, we must explicitly pass the reference
    if (urlObj.hostname.includes('pooler.supabase.com')) {
        config.port = 6543; // Force pooler port
        config.options = `project=${PROJECT_REF}`; // The correct option format for pg
    }
} catch (e) {
    console.error("Invalid database URL provided.", e);
    process.exit(1);
}

const client = new Client(config);

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
