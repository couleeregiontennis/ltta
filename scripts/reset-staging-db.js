import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Use the IPv4 Supabase Connection Pooler to bypass local IPv6 Node.js restrictions
const DB_URL = process.env.STAGING_DB_URL || 'postgresql://postgres.shlcqztfdhfwkhijwgue.pooler:UOBONmkm4SFLvDau@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: DB_URL
});

async function run() {
    try {
        console.log("Connecting to Staging Database (IPv4 Pooler)...");
        await client.connect();
        console.log("Connected successfully!");

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
