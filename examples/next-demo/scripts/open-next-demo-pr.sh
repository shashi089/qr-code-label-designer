#!/usr/bin/env bash
# Run after forking https://github.com/shashi089/qr-code-label-designer on GitHub.
# Replace YOUR_USERNAME with your GitHub username.

set -euo pipefail

GITHUB_USER="${1:-YOUR_USERNAME}"

if [ "$GITHUB_USER" = "YOUR_USERNAME" ]; then
  echo "Usage: ./scripts/open-next-demo-pr.sh <your-github-username>"
  echo "Fork the repo first: https://github.com/shashi089/qr-code-label-designer/fork"
  exit 1
fi

git remote remove fork 2>/dev/null || true
git remote add fork "https://github.com/${GITHUB_USER}/qr-code-label-designer.git"

git push -u fork feature/nextjs-event-demo

echo ""
echo "Open a PR at:"
echo "https://github.com/shashi089/qr-code-label-designer/compare/main...${GITHUB_USER}:qr-code-label-designer:feature/nextjs-event-demo?expand=1"
