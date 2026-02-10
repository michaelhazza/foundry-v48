#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 1 product definition compliance

echo "[Phase 1] Verifying Agent 1 (Product Definition) compliance..."

MANIFEST="scope-manifest.json"

# Verify file exists and is valid JSON
if ! jq empty "$MANIFEST" 2>/dev/null; then
  echo "[❌] Invalid JSON in $MANIFEST"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$MANIFEST")
if [[ "$SCHEMA" != "scope-manifest-v6" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: scope-manifest-v6)"
  exit 1
fi

# Verify required entities
REQUIRED_ENTITIES=(
  "organisations"
  "users"
  "projects"
  "sources"
  "processingJobs"
  "datasets"
  "canonicalSchemas"
)

for entity in "${REQUIRED_ENTITIES[@]}"; do
  if ! jq -e ".requiredEntities | index(\"$entity\")" "$MANIFEST" > /dev/null; then
    echo "[❌] Missing required entity: $entity"
    exit 1
  fi
done

# Verify deferred entities structure
DEFERRED_COUNT=$(jq '.deferredEntities | length' "$MANIFEST")
if [[ $DEFERRED_COUNT -lt 1 ]]; then
  echo "[❌] deferredEntities array must not be empty"
  exit 1
fi

# Verify each deferred entity has required fields
DEFERRED_NAMES=$(jq -r '.deferredEntities[].name' "$MANIFEST")
for name in $DEFERRED_NAMES; do
  if ! jq -e ".deferralDeclarations.\"$name\"" "$MANIFEST" > /dev/null; then
    echo "[❌] Deferred entity '$name' missing deferralDeclarations entry"
    exit 1
  fi
done

# Verify scopeExceptions structure
if ! jq -e '.scopeExceptions | length' "$MANIFEST" > /dev/null; then
  echo "[❌] scopeExceptions array missing or invalid"
  exit 1
fi

echo "[✅] Agent 1 compliance validated"
exit 0
