const fs = require('fs');

let content = fs.readFileSync('supabase/functions/playoff-scenarios/index.ts', 'utf8');

content = content.replace(
  /\.from\('standings_2026_view'\)/g,
  `.from('standings_view')`
);

fs.writeFileSync('supabase/functions/playoff-scenarios/index.ts', content);
