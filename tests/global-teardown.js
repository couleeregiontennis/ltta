import { teardownTestData } from './utils/db-setup.js';

export default async function globalTeardown(config) {
    // Always clean up our test data after the suite completes
    await teardownTestData();
}
