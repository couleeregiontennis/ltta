import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Fetch the URL from the environment
let DB_URL = process.env.STAGING_DB_URL;

if (!DB_URL) {
    console.error("Error: STAGING_DB_URL environment variable is not set.");
    process.exit(1);
}

// Supabase IPv4 Pooler REQUIRES the project reference to be passed in the connection options
// or it will throw "Tenant or user not found".
// GitHub Actions lacks IPv6, so we MUST use the pooler.
const PROJECT_REF = 'shlcqztfdhfwkhijwgue';

try {
    const urlObj = new URL(DB_URL);
    
    // Ensure we are using the port 6543 for the pooler to avoid direct connection conflicts
    if (urlObj.hostname.includes('pooler.supabase.com')) {
        urlObj.port = '6543';
        
        // Append the options parameter. If it exists, append to it, otherwise create it.
        const currentOptions = urlObj.searchParams.get('options');
        if (!currentOptions || !currentOptions.includes('reference=')) {
            const newOptions = currentOptions ? `${currentOptions}&reference=${PROJECT_REF}` : `reference=${PROJECT_REF}`;
            urlObj.searchParams.set('options', newOptions);
        }
    }
    DB_URL = urlObj.toString();
} catch (e) {
    console.error("Invalid database URL provided.");
    process.exit(1);
}

const client = new Client({
    connectionString: DB_URL,
    keepAlive: false
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
