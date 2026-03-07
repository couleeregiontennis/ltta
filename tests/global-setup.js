import { setupTestData } from './utils/db-setup.js';

export default async function globalSetup(config) {
    // Only insert data if we are running the local DB integration (which we assume if not skipping it)
    // For now, let's always inject so the new tests have data
    await setupTestData();
}
