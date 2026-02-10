#!/bin/bash
set -euo pipefail

# Phase 2: Implementation Readiness
# Verify database migration readiness

echo "[Phase 2] Verifying data migration readiness..."

# Verify all tables have schema files
TABLE_COUNT=$(jq '.tables | length' data-relationships.json)
TABLES_WITH_SCHEMA=$(jq '[.tables[] | select(.schemaFile != null)] | length' data-relationships.json)

if [[ $TABLE_COUNT -ne $TABLES_WITH_SCHEMA ]]; then
  MISSING=$((TABLE_COUNT - TABLES_WITH_SCHEMA))
  echo "[❌] $MISSING tables missing schema file specifications"
  exit 1
fi

# Verify tenant architecture
CONTAINER_TABLE=$(jq -r '.tables[] | select(.tenantKey == "container") | .name' data-relationships.json)

if [[ -z "$CONTAINER_TABLE" ]]; then
  echo "[❌] No tenant container table specified"
  exit 1
fi

# Verify foreign key relationships
TABLES_WITH_FKS=$(jq '[.tables[] | select(.foreignKeys != null)] | length' data-relationships.json)

if [[ $TABLES_WITH_FKS -gt 0 ]]; then
  echo "[✅] $TABLES_WITH_FKS tables have foreign key relationships defined"
fi

# Verify soft-delete cascade semantics
TABLES_WITH_CASCADE=$(jq '[.tables[] | select(.cascadeSemantics != null)] | length' data-relationships.json)

if [[ $TABLE_COUNT -ne $TABLES_WITH_CASCADE ]]; then
  MISSING=$((TABLE_COUNT - TABLES_WITH_CASCADE))
  echo "[⚠️] $MISSING tables missing cascade semantics specifications"
fi

echo "[✅] Data migration readiness validated"
exit 0
