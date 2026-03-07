const fs = require('fs');
const path = require('path');

function replaceMocks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. schedule-standings: split season intercept
    content = content.replace(
        /await page\.route\('\*\*\/rest\/v1\/season\*', async \(route\) => {\n\s*await route\.fulfill\({\n\s*status: 200,\n\s*contentType: 'application\/json',\n\s*body: JSON\.stringify\({([\s\S]*?)}\)\n\s*}\);\n\s*}\);/,
        `await page.route('**/rest/v1/season*', async (route) => {
      const url = route.request().url();
      const seasonObj = {$1};
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(url.includes('is_current=eq.true') || url.includes('id=eq') ? seasonObj : [seasonObj])
      });
    });`
    );

    // 2. admin-score-override: split season intercept
    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);([^]*?)JSON\.stringify\(isSingle \? seasonObj : \[seasonObj\]\)/g,
        `const url = route.request().url();
      const isSingle = url.includes('is_current=eq.true') || url.includes('id=eq');$1JSON.stringify(isSingle ? seasonObj : [seasonObj])`
    );

    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);([^]*?)JSON\.stringify\(isSingle \? pObj : \[pObj\]\)/g,
        `const url = route.request().url();
      const isSingle = url.includes('id=eq');$1JSON.stringify(isSingle ? pObj : [pObj])`
    );

    // 3. captain-dashboard: split player and team intercept
    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);([^]*?)JSON\.stringify\(isSingle \? playerObj : \[playerObj\]\)/g,
        `const url = route.request().url();
            const isSingle = url.includes('id=eq');$1JSON.stringify(isSingle ? playerObj : [playerObj])`
    );
    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);([^]*?)JSON\.stringify\(isSingle \? teamLink : \[teamLink\]\)/g,
        `const url = route.request().url();
            const isSingle = url.includes('team=eq') || url.includes('player=eq');$1JSON.stringify(isSingle ? teamLink : [teamLink])`
    );
    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);([^]*?)JSON\.stringify\(isSingle \? teamObj : \[teamObj\]\)/g,
        `const url = route.request().url();
            const isSingle = url.includes('id=eq') || url.includes('number=eq');$1JSON.stringify(isSingle ? teamObj : [teamObj])`
    );

    // 4. player-profile: player
    content = content.replace(
        /const isSingle = route\.request\(\)\.headers\(\)\['accept'\]\?.includes\('vnd\.pgrst\.object'\);/g,
        `const url = route.request().url();
            const isSingle = url.includes('id=eq');`
    );

    fs.writeFileSync(filePath, content);
}

replaceMocks('tests/e2e/schedule-standings.spec.js');
replaceMocks('tests/e2e/admin-score-override.spec.js');
replaceMocks('tests/e2e/captain-dashboard-actions.spec.js');
replaceMocks('tests/e2e/player-profile-edit.spec.js');
