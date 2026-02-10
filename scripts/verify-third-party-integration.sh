#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify third-party service integration requirements

echo "[Phase 3] Verifying third-party integration..."

# Check for external API configurations in environment
THIRD_PARTY_VARS=$(jq '[.variables[] | select(.purpose | contains("API") or contains("third-party") or contains("external"))] | length' env-manifest.json)

if [[ $THIRD_PARTY_VARS -gt 0 ]]; then
  echo "[ℹ️] $THIRD_PARTY_VARS third-party API configurations found"
fi

# Verify file upload handling
UPLOAD_ENDPOINTS=$(jq '[.endpoints[] | select(.serviceContract.fileUpload == true)] | length' service-contracts.json)

if [[ $UPLOAD_ENDPOINTS -gt 0 ]]; then
  echo "[ℹ️] $UPLOAD_ENDPOINTS file upload endpoints may require storage service integration"
fi

# Check for webhook configurations
if jq -e '.deferredEntities[] | select(.name == "webhooks")' scope-manifest.json > /dev/null; then
  echo "[ℹ️] Webhook integration deferred to post-MVP"
fi

echo "[✅] Third-party integration requirements identified"
exit 0
