#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify API-UI integration alignment

echo "[Phase 3] Verifying API-UI integration..."

# Cross-check that all UI API calls map to defined endpoints
PAGE_COUNT=$(jq '.pages | length' ui-api-deps.json)
UNMATCHED_CALLS=0

for ((i=0; i<PAGE_COUNT; i++)); do
  API_CALL_COUNT=$(jq ".pages[$i].apiCalls | length" ui-api-deps.json)
  
  for ((j=0; j<API_CALL_COUNT; j++)); do
    METHOD=$(jq -r ".pages[$i].apiCalls[$j].method" ui-api-deps.json)
    API_PATH=$(jq -r ".pages[$i].apiCalls[$j].path" ui-api-deps.json)

    if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$API_PATH\")" service-contracts.json > /dev/null; then
      PAGE_PATH=$(jq -r ".pages[$i].routePath" ui-api-deps.json)
      echo "[❌] Page $PAGE_PATH references undefined endpoint: $METHOD $API_PATH"
      UNMATCHED_CALLS=$((UNMATCHED_CALLS + 1))
    fi
  done
done

if [[ $UNMATCHED_CALLS -gt 0 ]]; then
  echo "[❌] $UNMATCHED_CALLS UI-to-API integration mismatches"
  exit 1
fi

# Verify authentication alignment
PROTECTED_PAGES=$(jq '[.pages[] | select(.authenticated == true)] | length' ui-api-deps.json)
PROTECTED_ENDPOINTS=$(jq '[.endpoints[] | select(.authentication == "jwt")] | length' service-contracts.json)

echo "[ℹ️] $PROTECTED_PAGES protected pages, $PROTECTED_ENDPOINTS protected endpoints"

echo "[✅] API-UI integration validated"
exit 0
