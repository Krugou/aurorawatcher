---
description: Always synchronize the entire workspace when finishing a task
---

When finishing a task or after making significant changes, follow these steps to ensure the workspace is fully synchronized:

1. **Run Full Test Suite**: Before committing, run `npm test -w aurorawatcher-web` and `npm run build` to ensure local stability.
2. **Check Status**: Run `git status` to identify all modified, new, or deleted files.
3. **Stage Everything**: Run `git add .` to stage all changes.
   // turbo
4. **Commit with Husky**: Run `git commit -m "feat/fix: descriptive message"`. Husky will automatically run Lint, Prettier, TSC, and Vitest.
   - If Husky fails, resolve the issues and restart from step 1.
     // turbo
5. **Final Sync**: Run `git push` to synchronize with the remote.
6. **Verify Persistence**: Run `git status` to confirm everything is clean.
