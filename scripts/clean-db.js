import { teardownTestData } from '../tests/utils/db-setup.js';

console.log("Running manual test data cleanup sweep...");

teardownTestData().then(() => {
    console.log("Cleanup script finished.");
    process.exit(0);
}).catch((err) => {
    console.error("Error running cleanup script:", err);
    process.exit(1);
});
