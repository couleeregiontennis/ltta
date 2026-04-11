import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

let DB_URL = process.env.STAGING_DB_URL;
let PROJECT_REF = 'shlcqztfdhfwkhijwgue';

if (process.env.VITE_SUPABASE_URL) {
    try {
        const viteUrl = new URL(process.env.VITE_SUPABASE_URL);
        const hostParts = viteUrl.hostname.split('.');
        if (hostParts.length > 0) {
            PROJECT_REF = hostParts[0];
        }
    } catch (e) {}
}

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

let config = {};

try {
    const urlObj = new URL(DB_URL);
    
    // We construct a specific config object for the pg client
    config = {
        user: decodeURIComponent(urlObj.username),
        password: decodeURIComponent(urlObj.password),
        host: urlObj.hostname,
        port: parseInt(urlObj.port || '5432', 10),
        database: urlObj.pathname.split('/')[1] || 'postgres',
        ssl: { rejectUnauthorized: false }
    };

    // If using the Supabase pooler (Supavisor)
    if (urlObj.hostname.includes('pooler.supabase.com')) {
        config.port = 6543;
        
        // Supavisor accepts the tenant either via user.tenant or via the options param
        // If the username already has a dot, we leave it alone.
        if (!config.user.includes('.')) {
            // Some pg versions fail to parse options from string, so we pass it explicitly
            config.options = `reference=${PROJECT_REF}`;
        }
    }
} catch (e) {
    console.error("Invalid database URL format.", e);
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
