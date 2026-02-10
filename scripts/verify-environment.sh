#!/bin/bash
set -euo pipefail

# Phase 0: Preflight
# Check required tools and permissions

echo "[Phase 0] Verifying build environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "[❌] Node.js not found"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
  echo "[❌] Node.js version must be 18 or higher (found: $NODE_VERSION)"
  exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "[❌] npm not found"
  exit 1
fi

# Check jq for JSON validation
if ! command -v jq &> /dev/null; then
  echo "[⚠️] jq not found - JSON validation limited"
fi

# Check bash version
BASH_VERSION_MAJOR=${BASH_VERSION%%.*}
if [[ $BASH_VERSION_MAJOR -lt 4 ]]; then
  echo "[❌] Bash version must be 4 or higher"
  exit 1
fi

# Check write permissions
if [[ ! -w "docs" ]]; then
  echo "[❌] No write permission to docs directory"
  exit 1
fi

echo "[✅] Build environment ready"
exit 0
