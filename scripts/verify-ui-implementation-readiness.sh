#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify frontend UI implementation readiness

echo "[Phase 2] Verifying UI implementation readiness..."

# Check that all required pages have file paths
REQUIRED_PAGES=$(jq '[.pages[] | select(.scope == "required")] | length' ui-api-deps.json)
PAGES_WITH_FILES=$(jq '[.pages[] | select(.scope == "required" and .filePath != null)] | length' ui-api-deps.json)

if [[ $REQUIRED_PAGES -ne $PAGES_WITH_FILES ]]; then
  MISSING=$((REQUIRED_PAGES - PAGES_WITH_FILES))
  echo "[❌] $MISSING required pages missing file path specifications"
  exit 1
fi

# Verify routing configuration
if ! jq -e '.routingConfig.library' ui-api-deps.json > /dev/null; then
  echo "[❌] Routing configuration missing library specification"
  exit 1
fi

# Verify canonical paths exist
if ! jq -e '.canonicalPaths.apiClient' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing API client canonical path"
  exit 1
fi

if ! jq -e '.canonicalPaths.errorBoundary' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing error boundary canonical path"
  exit 1
fi

# Verify protected route configuration
if ! jq -e '.routingConfig.protectedRoutes' ui-api-deps.json > /dev/null; then
  echo "[❌] Missing protected routes configuration"
  exit 1
fi

echo "[✅] UI implementation readiness validated"
exit 0
