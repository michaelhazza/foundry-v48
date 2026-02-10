#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate alignment between agent outputs

echo "[Phase 1] Verifying cross-agent alignment..."

# Verify entity alignment between Agent 1 and Agent 3
MANIFEST_ENTITIES=$(jq -r '.requiredEntities[]' scope-manifest.json | sort)
SCHEMA_TABLES=$(jq -r '.tables[].name' data-relationships.json | sort)

ENTITY_MISMATCH=0
for entity in $MANIFEST_ENTITIES; do
  if ! echo "$SCHEMA_TABLES" | grep -q "^$entity$"; then
    echo "[❌] Entity '$entity' in scope-manifest not found in data-relationships"
    ENTITY_MISMATCH=$((ENTITY_MISMATCH + 1))
  fi
done

if [[ $ENTITY_MISMATCH -gt 0 ]]; then
  echo "[❌] $ENTITY_MISMATCH entity alignment issues"
  exit 1
fi

# Verify API-to-service alignment from Agent 4
ENDPOINT_COUNT=$(jq '.endpoints | length' service-contracts.json)
MISSING_SERVICE_FILES=0

for ((i=0; i<ENDPOINT_COUNT; i++)); do
  STATUS=$(jq -r ".endpoints[$i].status" service-contracts.json)
  
  if [[ "$STATUS" == "required" ]]; then
    SERVICE_FILE=$(jq -r ".endpoints[$i].serviceContract.serviceFile" service-contracts.json)

    if [[ -z "$SERVICE_FILE" || "$SERVICE_FILE" == "null" ]]; then
      ENDPOINT_PATH=$(jq -r ".endpoints[$i].path" service-contracts.json)
      echo "[⚠️] Required endpoint $ENDPOINT_PATH missing service file specification"
      MISSING_SERVICE_FILES=$((MISSING_SERVICE_FILES + 1))
    fi
  fi
done

if [[ $MISSING_SERVICE_FILES -gt 0 ]]; then
  echo "[❌] $MISSING_SERVICE_FILES service file specifications missing"
  exit 1
fi

# Verify UI-to-API alignment from Agent 5
PAGE_COUNT=$(jq '.pages | length' ui-api-deps.json)
API_ENDPOINT_MISMATCHES=0

for ((i=0; i<PAGE_COUNT; i++)); do
  SCOPE=$(jq -r ".pages[$i].scope" ui-api-deps.json)
  
  if [[ "$SCOPE" == "required" ]]; then
    API_CALL_COUNT=$(jq ".pages[$i].apiCalls | length" ui-api-deps.json)
    
    for ((j=0; j<API_CALL_COUNT; j++)); do
      METHOD=$(jq -r ".pages[$i].apiCalls[$j].method" ui-api-deps.json)
      ENDPOINT_PATH=$(jq -r ".pages[$i].apiCalls[$j].path" ui-api-deps.json)

      if ! jq -e ".endpoints[] | select(.method == \"$METHOD\" and .path == \"$ENDPOINT_PATH\")" service-contracts.json > /dev/null; then
        echo "[⚠️] UI references undefined API endpoint: $METHOD $ENDPOINT_PATH"
        API_ENDPOINT_MISMATCHES=$((API_ENDPOINT_MISMATCHES + 1))
      fi
    done
  fi
done

if [[ $API_ENDPOINT_MISMATCHES -gt 0 ]]; then
  echo "[❌] $API_ENDPOINT_MISMATCHES UI-to-API mismatches"
  exit 1
fi

echo "[✅] Cross-agent alignment validated"
exit 0
