import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stagingDb = path.resolve(__dirname, '../../ltta-staging/server/ltta.db');
const prodDb = path.resolve(__dirname, '../server/ltta.db');

async function main() {
  if (process.argv.includes('--from-prod')) {
    if (!fs.existsSync(prodDb)) {
      console.error(`Production DB not found at: ${prodDb}`);
      process.exit(1);
    }
    console.log(`Cloning production database from ${prodDb} to ${stagingDb}...`);
    const src = new Database(prodDb);
    await src.backup(stagingDb);
    src.close();
    console.log('Staging database cloned from production successfully!');
  } else {
    console.log(`Resetting staging database at: ${stagingDb}...`);
    if (fs.existsSync(stagingDb)) fs.unlinkSync(stagingDb);
    if (fs.existsSync(`${stagingDb}-wal`)) fs.unlinkSync(`${stagingDb}-wal`);
    if (fs.existsSync(`${stagingDb}-shm`)) fs.unlinkSync(`${stagingDb}-shm`);

    process.env.DB_PATH = stagingDb;
    const { seed } = await import('./seed-local-db.js');
    if (typeof seed === 'function') {
      await seed();
    }
    console.log('Staging database reset and seeded successfully!');
  }
}

main().catch(err => {
  console.error('Error resetting staging database:', err);
  process.exit(1);
});
