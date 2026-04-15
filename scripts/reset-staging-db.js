import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

let DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

try {
    const dbUrlObj = new URL(DB_URL);
    
    // Extract from VITE_SUPABASE_URL first
    let projectId = null;
    if (process.env.VITE_SUPABASE_URL) {
        const supabaseUrlObj = new URL(process.env.VITE_SUPABASE_URL);
        projectId = supabaseUrlObj.hostname.split('.')[0];
    }
    
    // If not found, try to extract from ?options=reference=... in DB_URL
    if (!projectId && dbUrlObj.searchParams.has('options')) {
        const options = dbUrlObj.searchParams.get('options');
        if (options.includes('reference=')) {
            projectId = options.split('reference=')[1];
        }
        // Also remove the options parameter as pg doesn't always support it properly in the connection string
        dbUrlObj.searchParams.delete('options');
    }
    
    // Fallback: If DB_URL host is db.[project-ref].supabase.co
    if (!projectId && dbUrlObj.hostname.startsWith('db.') && dbUrlObj.hostname.includes('.supabase.co')) {
        projectId = dbUrlObj.hostname.split('.')[1];
    }
    
    // Ultimate fallback for LTTA staging environment
    if (!projectId) {
        projectId = 'shlcqztfdhfwkhijwgue';
    }

    if (projectId && dbUrlObj.username && !dbUrlObj.username.includes('.')) {
        dbUrlObj.username = `${dbUrlObj.username}.${projectId}`;
        DB_URL = dbUrlObj.toString();
        console.log(`Injected project ID (${projectId}) into database username for Supavisor compatibility.`);
    }
} catch (e) {
    console.warn("Could not parse URLs to inject project ID:", e.message);
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
