# Agent Instructions

## UI Changes
*   **Screenshots**: Whenever you make a change to a UI page (HTML, CSS, JSX), you must generate and present a screenshot of the "before" state (if possible/relevant) and the "after" state. Use the `frontend_verification_instructions` tool to help with this.

## Git Workflow
*   **Branch Names**: Always use meaningful, descriptive branch names for your submissions (e.g., `jules/feature/add-login-tests`, `jules/fix/mobile-nav-bug`). Avoid generic or generated names.

## Code Comments
*   **Signatures**: Do not include agent signatures (e.g., "🛡️ Sentinel:", "🤖 Bot:") in code comments.

## Testing
*   **Environment**: Running Playwright tests locally requires a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` defined (dummy values are sufficient for mocked tests).
*   **Local Runs**: Use the fast execution command (`npm run test:e2e:fast` or `pnpm run test:e2e:fast`) locally by default to leverage 100% of local CPU threads and target Chromium.
*   **Regression Tests**: Always write or expand E2E tests when implementing code fixes to verify the issue is resolved and to prevent future regressions. Ensure mocks are updated appropriately if endpoints change.

## Task Splitting & Board Management
*   **Epic/Master Tasks**: If you are assigned a card that is marked as a "Master Task", "Epic", or explicitly asks for coordination/planning, your job is to act as the Coordinator. You should run on **`qwen3.7-max`**. Do NOT implement the feature code yourself. Instead:
    1. Break the task down into discrete subtasks (e.g. Design, Database, Frontend logic, QA Tests).
    2. Create a new subtask card in the backlog for each step by running:
       ```bash
       kanban task create --title "[Subtask Title]" --prompt "..." --cline-model "<model-id>"
       ```
       Use the following model mapping for subtasks:
       - **Product Owner tasks** (requirements, stories): Use `--cline-model qwen3.7-plus` or `--cline-model kimi-k2.6`
       - **Architect tasks** (system design, database planning): Use `--cline-model glm-5.2` or `--cline-model deepseek-v4-pro`
       - **Developer tasks** (logic implementation, scripting): Use `--cline-model deepseek-v4-pro` or `--cline-model qwen3.7-plus`. If it is pure UI/frontend implementation, use `--cline-model kimi-k2.7-code`.
       - **QA tasks** (Playwright tests, visual/screenshot validation): Use `--cline-model minimax-m3` or `--cline-model kimi-k2.7-code`
    3. Link the cards in sequential order of execution (if dependencies exist) using:
       ```bash
       kanban task link --parent <parent-task-id> --child <child-task-id>
       ```
    4. Move the Master Task card to 'Done' once the subtasks are spawned.

*   **Creating Kanban Cards via CLI**: When you create cards on the Kanban board using the `kanban task create` command (whether acting as a Coordinator or as a general chat assistant):
    - Always analyze the task content and explicitly append the correct `--cline-model` and `--cline-provider cline-pass` flags:
      - For **UI/Frontend tasks** (prototyping, styling): Use `--cline-model kimi-k2.7-code --cline-provider cline-pass`
      - For **Deep Debugging & Tracing Elusive Bugs** (complex logical errors, nested flows): Use `--cline-model glm-5.2 --cline-provider cline-pass`
      - For **Large-Scale codebase refactors** (multi-directory, structural modifications): Use `--cline-model deepseek-v4-pro --cline-provider cline-pass`
      - For **Extreme Long-Horizon Autonomy** (multi-hour complex refactoring, high tool-use): Use `--cline-model qwen3.7-max --cline-provider cline-pass`
      - For **General Developer/Logic tasks**: Use `--cline-model deepseek-v4-pro --cline-provider cline-pass` or `--cline-model qwen3.7-plus --cline-provider cline-pass`
      - For **Testing/QA tasks** (Playwright tests, visual/screenshot validation): Use `--cline-model minimax-m3 --cline-provider cline-pass` or `--cline-model kimi-k2.7-code --cline-provider cline-pass`
      - For **Simple low-cost edits** (linting, quick documentation, inline fixes): Use `--cline-model deepseek-v4-flash --cline-provider cline-pass`
      - For **Background automation & data parsing**: Use `--cline-model kimi-k2.6 --cline-provider cline-pass` or `--cline-model qwen3.7-plus --cline-provider cline-pass`


