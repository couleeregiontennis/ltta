import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

let DB_URL = process.env.STAGING_DB_URL;
const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

// Supavisor requires the username to be in the format 'user.project'
// We extract the project ID from VITE_SUPABASE_URL and inject it into DB_URL
if (VITE_SUPABASE_URL) {
    try {
        const supabaseUrlObj = new URL(VITE_SUPABASE_URL);
        const projectId = supabaseUrlObj.hostname.split('.')[0];
        
        const dbUrlObj = new URL(DB_URL);
        // Only modify if it doesn't already have the project ID
        if (dbUrlObj.username && !dbUrlObj.username.includes('.')) {
            dbUrlObj.username = `${dbUrlObj.username}.${projectId}`;
            DB_URL = dbUrlObj.toString();
            console.log("Injected project ID into database username for Supavisor compatibility.");
        }
    } catch (e) {
        console.warn("Could not parse URLs to inject project ID:", e.message);
    }
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
