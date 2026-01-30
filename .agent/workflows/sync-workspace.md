---
description: Always synchronize the entire workspace when finishing a task
---

When finishing a task or after making significant changes, follow these steps to ensure the workspace is fully synchronized:

1. **Check Status**: Run `git status` to identify all modified, new, or deleted files.
2. **Stage Everything**: Run `git add .` to stage all changes across the entire monorepo.
3. **Commit with Husky**: Run `git commit -m "commit message"`. Wait for Husky hooks (TSC, Lint, Prettier) to complete.
   - If Husky fails, fix the reported errors and repeat from step 2.
4. **Final Sync**: Run `git push` to synchronize with the remote repository.
   - If the push is rejected, run `git pull --rebase` and then `git push` again.

// turbo-all 5. Verify clean state: Run `git status` one last time to confirm 'nothing to commit, working tree clean'.
