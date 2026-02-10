#!/bin/bash
set -euo pipefail

# Phase 1: Specification Integrity
# Validate documentation completeness

echo "[Phase 1] Verifying documentation currency..."

# Check agent specification files
AGENT_SPECS=(
  "agent-0-constitution.md"
  "agent-1-product-definition.md"
  "agent-2-system-architecture.md"
  "agent-3-data-modeling.md"
  "agent-4-api-contract.md"
  "agent-5-ui-specification.md"
  "agent-6-implementation-orchestrator.md"
)

MISSING_SPECS=0

for spec in "${AGENT_SPECS[@]}"; do
  if [[ ! -f "$spec" ]]; then
    echo "[⚠️] Missing agent specification: $spec"
    MISSING_SPECS=$((MISSING_SPECS + 1))
  fi
done

if [[ $MISSING_SPECS -gt 0 ]]; then
  echo "[❌] $MISSING_SPECS agent specifications missing"
  exit 1
fi

# Verify README exists
if [[ ! -f "README.md" ]]; then
  echo "[⚠️] README.md not found"
fi

# Verify architecture documentation
if [[ ! -f "02-ARCHITECTURE.md" ]]; then
  echo "[⚠️] Architecture documentation not found"
fi

echo "[✅] Documentation currency validated"
exit 0
