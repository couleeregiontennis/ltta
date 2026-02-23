#!/bin/bash

# Fix UUIDs in admin-score-override.spec.js
sed -i '' 's/season-1/d290f1ee-6c54-4b01-90e6-d701748f0001/g' tests/e2e/admin-score-override.spec.js
sed -i '' 's/admin-user-id/d290f1ee-6c54-4b01-90e6-d701748f0301/g' tests/e2e/admin-score-override.spec.js
sed -i '' 's/team-1/d290f1ee-6c54-4b01-90e6-d701748f0101/g' tests/e2e/admin-score-override.spec.js
sed -i '' 's/team-2/d290f1ee-6c54-4b01-90e6-d701748f0102/g' tests/e2e/admin-score-override.spec.js
sed -i '' 's/match-1/d290f1ee-6c54-4b01-90e6-d701748f0201/g' tests/e2e/admin-score-override.spec.js
sed -i '' 's/reg-user/d290f1ee-6c54-4b01-90e6-d701748f0302/g' tests/e2e/admin-score-override.spec.js

# Fix UUIDs in captain-dashboard-actions.spec.js
sed -i '' 's/fake-captain-id/d290f1ee-6c54-4b01-90e6-d701748f0301/g' tests/e2e/captain-dashboard-actions.spec.js
sed -i '' 's/team-1/d290f1ee-6c54-4b01-90e6-d701748f0101/g' tests/e2e/captain-dashboard-actions.spec.js
sed -i '' 's/player-2/d290f1ee-6c54-4b01-90e6-d701748f0302/g' tests/e2e/captain-dashboard-actions.spec.js

# Fix UUIDs in player-profile-edit.spec.js
sed -i '' 's/regular-user-id/d290f1ee-6c54-4b01-90e6-d701748f0302/g' tests/e2e/player-profile-edit.spec.js

