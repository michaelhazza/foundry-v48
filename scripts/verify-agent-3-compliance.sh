#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate Agent 3 data modeling compliance

echo "[Phase 1] Verifying Agent 3 (Data Modeling) compliance..."

DATA_REL="data-relationships.json"

# Verify file exists and is valid JSON
if ! jq empty "$DATA_REL" 2>/dev/null; then
  echo "[❌] Invalid JSON in $DATA_REL"
  exit 1
fi

# Check schema version
SCHEMA=$(jq -r '."$schema"' "$DATA_REL")
if [[ "$SCHEMA" != "data-relationships-v2" ]]; then
  echo "[❌] Invalid schema version: $SCHEMA (expected: data-relationships-v2)"
  exit 1
fi

# Verify required tables exist
REQUIRED_TABLES=(
  "organisations"
  "users"
  "projects"
  "sources"
  "processingJobs"
  "datasets"
  "canonicalSchemas"
)

for table in "${REQUIRED_TABLES[@]}"; do
  if ! jq -e ".tables[] | select(.name == \"$table\")" "$DATA_REL" > /dev/null; then
    echo "[❌] Missing required table: $table"
    exit 1
  fi
done

# Verify tenant architecture
CONTAINER_COUNT=$(jq '[.tables[] | select(.tenantKey == "container")] | length' "$DATA_REL")
if [[ $CONTAINER_COUNT -ne 1 ]]; then
  echo "[❌] Must have exactly 1 container table (found: $CONTAINER_COUNT)"
  exit 1
fi

CONTAINER_TABLE=$(jq -r '.tables[] | select(.tenantKey == "container") | .name' "$DATA_REL")
if [[ "$CONTAINER_TABLE" != "organisations" ]]; then
  echo "[❌] Container table must be 'organisations' (found: $CONTAINER_TABLE)"
  exit 1
fi

# Verify soft-delete patterns
TABLE_COUNT=$(jq '.tables | length' "$DATA_REL")
TABLES_WITHOUT_SOFT_DELETE=0

for ((i=0; i<TABLE_COUNT; i++)); do
  TABLE_NAME=$(jq -r ".tables[$i].name" "$DATA_REL")
  
  if ! jq -e ".tables[$i].softDeleteColumn" "$DATA_REL" > /dev/null; then
    echo "[⚠️] Table $TABLE_NAME missing soft-delete pattern"
    TABLES_WITHOUT_SOFT_DELETE=$((TABLES_WITHOUT_SOFT_DELETE + 1))
  fi
  
  if ! jq -e ".tables[$i].cascadeSemantics" "$DATA_REL" > /dev/null; then
    echo "[⚠️] Table $TABLE_NAME missing cascade semantics"
  fi
done

if [[ $TABLES_WITHOUT_SOFT_DELETE -gt 0 ]]; then
  echo "[❌] $TABLES_WITHOUT_SOFT_DELETE tables missing soft-delete patterns"
  exit 1
fi

echo "[✅] Agent 3 compliance validated"
exit 0
