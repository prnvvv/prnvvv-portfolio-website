#!/usr/bin/env bash
# Cleanup tracked generated files and sensitive files before publishing.
# Run from repo root.

set -euo pipefail

echo "Removing tracked generated files and secrets..."
# Remove tracked envs
git rm --cached ghost-protocol/frontend/.env || true

# Remove common generated folders from git index
git rm -r --cached ghost-protocol/frontend/node_modules || true
git rm -r --cached ghost-protocol/frontend/dist || true

# Remove tsbuildinfo
git rm --cached ghost-protocol/frontend/tsconfig.tsbuildinfo || true

# Commit removals
git commit -m "chore: remove tracked generated artifacts and secrets from repo" || true

echo "Cleanup complete. If secrets were ever pushed publicly, rotate them and consider using git filter-repo to purge history." 
