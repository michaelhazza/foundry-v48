#!/bin/bash
set -euo pipefail

# Phase 3: Integration Verification
# Verify logging and audit trail integration

echo "[Phase 3] Verifying logging integration..."

# Verify audit timestamp columns
TABLES_WITH_TIMESTAMPS=$(jq '[.tables[] | select(.columns[] | select(.name == "createdAt" or .name == "updatedAt"))] | length' data-relationships.json)
TOTAL_TABLES=$(jq '.tables | length' data-relationships.json)

if [[ $TABLES_WITH_TIMESTAMPS -ne $TOTAL_TABLES ]]; then
  MISSING=$((TOTAL_TABLES - TABLES_WITH_TIMESTAMPS))
  echo "[⚠️] $MISSING tables missing audit timestamp columns"
fi

# Check for soft-delete tracking
TABLES_WITH_DELETED_AT=$(jq '[.tables[] | select(.columns[] | select(.name == "deletedAt"))] | length' data-relationships.json)

echo "[ℹ️] $TABLES_WITH_DELETED_AT tables have soft-delete audit trails"

# Verify user tracking for audit purposes
USER_TABLE_HAS_AUDIT=$(jq '.tables[] | select(.name == "users") | .columns[] | select(.name == "createdAt" or .name == "updatedAt")' data-relationships.json)

if [[ -z "$USER_TABLE_HAS_AUDIT" ]]; then
  echo "[⚠️] Users table should have audit timestamp columns"
fi

echo "[✅] Logging integration requirements identified"
exit 0
