#!/bin/bash
set -e

# Configuration
USER_NAME="Aleksin Aurora Bot"
USER_EMAIL="bot@aurorawatcher.com"
COMMIT_MESSAGE="chore: save aurora images [skip ci]"
HISTORY_DIR="web/public/data/history/"
HISTORY_JSON="web/public/data/history_index.json"

echo "Setup git configuration..."
git config --global user.name "$USER_NAME"
git config --global user.email "$USER_EMAIL"

echo "Adding files to staging..."
# Check if files exist to avoid erroring out if directory is empty (unlikely but safe)
if [ -d "$HISTORY_DIR" ] || [ -f "$HISTORY_JSON" ]; then
    git add "$HISTORY_DIR" "$HISTORY_JSON"
else
    echo "No history files found to add."
    exit 0
fi

echo "Checking for changes..."
if git diff --staged --quiet; then
    echo "No changes to commit."
    exit 0
else
    echo "Changes detected. Committing..."
    git commit -m "$COMMIT_MESSAGE" --no-verify

    echo "Pulling latest changes (rebase)..."
    # Try to pull with rebase. If conflicts arise, this will fail and stop the script (set -e).
    # In a more advanced version, we might want to handle merge strategies, but for data files, rebase is usually best.
    git pull --rebase --autostash

    echo "Pushing changes..."
    git push
    echo "Successfully pushed changes."

    if [ -n "$GITHUB_STEP_SUMMARY" ]; then
        echo "## 📸 Aurora Images Saved" >> "$GITHUB_STEP_SUMMARY"
        echo "The bot successfully collected and saved new aurora images. 🌌" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Status**: Saved & Pushed" >> "$GITHUB_STEP_SUMMARY"
        echo "- **Time**: $(date)" >> "$GITHUB_STEP_SUMMARY"
    fi
fi
