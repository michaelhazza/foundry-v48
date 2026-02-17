#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 5 UI specification compliance

echo "[Phase 1] Verifying Agent 5 (UI Specification) compliance..."

UI_SPEC="ui-api-deps.json"

# Verify file exists and is valid JSON
if ! jq empty "$UI_SPEC" 2>/dev/null; then
  echo "[❌] Invalid JSON in $UI_SPEC"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$UI_SPEC")
if [[ "$SCHEMA" != "ui-api-deps-v2" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: ui-api-deps-v2)"
  exit 1
fi

# Verify required pages exist
REQUIRED_PAGES=(
  "/login"
  "/register"
  "/"
  "/projects"
  "/projects/:projectId"
  "/sources"
  "/datasets"
)

for path in "${REQUIRED_PAGES[@]}"; do
  if ! jq -e ".pages[] | select(.routePath == \"$path\")" "$UI_SPEC" > /dev/null; then
    echo "[❌] Missing required page: $path"
    exit 1
  fi
done

# Verify page-API alignment
PAGE_COUNT=$(jq '.pages | length' "$UI_SPEC")
PAGES_WITHOUT_API_CALLS=0

for ((i=0; i<PAGE_COUNT; i++)); do
  PAGE_PATH=$(jq -r ".pages[$i].routePath" "$UI_SPEC")
  SCOPE=$(jq -r ".pages[$i].scope" "$UI_SPEC")
  
  if [[ "$SCOPE" == "required" ]]; then
    API_CALLS=$(jq ".pages[$i].apiCalls | length" "$UI_SPEC")
    
    if [[ $API_CALLS -eq 0 ]]; then
      echo "[⚠️] Required page $PAGE_PATH has no API calls defined"
      PAGES_WITHOUT_API_CALLS=$((PAGES_WITHOUT_API_CALLS + 1))
    fi
  fi
done

if [[ $PAGES_WITHOUT_API_CALLS -gt 0 ]]; then
  echo "[❌] $PAGES_WITHOUT_API_CALLS required pages missing API calls"
  exit 1
fi

# Verify canonical paths
if ! jq -e '.canonicalPaths.apiClient' "$UI_SPEC" > /dev/null; then
  echo "[❌] Missing canonical path: apiClient"
  exit 1
fi

if ! jq -e '.canonicalPaths.errorBoundary' "$UI_SPEC" > /dev/null; then
  echo "[❌] Missing canonical path: errorBoundary"
  exit 1
fi

# Verify total page count matches
DECLARED_TOTAL=$(jq -r '.totalPages' "$UI_SPEC")
ACTUAL_TOTAL=$(jq '.pages | length' "$UI_SPEC")

if [[ "$DECLARED_TOTAL" != "$ACTUAL_TOTAL" ]]; then
  echo "[❌] Page count mismatch: declared=$DECLARED_TOTAL, actual=$ACTUAL_TOTAL"
  exit 1
fi

echo "[✅] Agent 5 compliance validated"
exit 0
