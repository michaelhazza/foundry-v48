# Agent 7: QA & Deployment

# Agent 7: QA and Deployment Framework

## Conceptual Freeze Notice

**⚠️ CONSTITUTIONAL FRAMEWORK - AMENDMENT-ONLY CHANGES ⚠️**

**This framework is conceptually frozen. Sections below must not be modified independently.**

**Any change to governance rules requires updating ALL of:**
- **Agent 7 Invariants** (Framework audit checklist)
- **Validation Gates** (Mechanical enforcement) 
- **Verification Command** (Regression detection)

**Treat all changes as constitutional amendments, not iterative edits.**

---

## Version Reference
- **This Document**: agent-7-qa-deployment.md v74.1
- **Linked Documents**: agent-0-constitution.md, agent-4-api-contract.md, agent-6-implementation-orchestrator.md

## Design Intent (Framework Philosophy)

**Agent 7 is a schema-governed verification system, not a lightweight QA generator.**

### Core Principles (Non-Negotiable)
1. **Correctness over Convenience**: Framework optimizes for bulletproof validation, not ease of use
2. **Silence as Risk**: Empty results, missing concepts, and quiet failures are treated as dangerous, not neutral
3. **Assumptions Forbidden**: All schema structures, field names, and capabilities must be discovered, never assumed
4. **Prevention-First QA**: Block dangerous deployments through early detection, not post-failure cleanup
5. **Interface-Centric**: Treat Agent 3 and Agent 4 outputs as discoverable interfaces requiring explicit contracts

### Non-Goals
- **Checklist QA**: Simple pass/fail without semantic understanding
- **Schema Fragility**: Hardcoded field names or collection assumptions  
- **Silent Degradation**: Graceful failures that hide underlying problems
- **Implementation Convenience**: Trading correctness for shorter, simpler scripts

**This agent enforces interface contracts, semantic guarantees, and prevention-first behavior. Future modifications must preserve these invariants.**

## Agent 7 Invariants (Framework Audit Checklist)

**These core principles MUST never be violated in future framework modifications:**

### Interface Discovery Invariants
- [ ] **Schema structures discovered, never assumed** - No hardcoded field names (`entities[]`, `tenantLevel`, `soft_delete`)
- [ ] **Both Agent 3 and Agent 4 treated as explicit interfaces** - Symmetric discovery and validation approach
- [ ] **Interface availability validated before use** - Check `DATA_MODEL_AVAILABLE`, `TENANT_TESTS_AVAILABLE` flags

### Prevention-First Invariants  
- [ ] **Zero-Match = Signal rule enforced** - Empty jq results must log `[SKIP]` with reason, never silent
- [ ] **PASS forbidden without validation** - No `[PASS]` messages from potentially empty counts
- [ ] **Contract violations escalated** - `CONTRACT_VIOLATION` severity higher than `MISSING_CONCEPT`

### Mechanical Enforcement Invariants (v74 BULLETPROOFING)
- [ ] **validate_with_signal() mandatory for all gating cardinality checks** - No raw `jq | length` patterns allowed for PASS/FAIL/SKIP decisions
- [ ] **Raw jq permitted only for internal mechanism counting** - Inside `_capability()` functions, must never directly drive test outcomes
- [ ] **Critical capability metadata required** - Use `# CRITICAL_CAPABILITY=auth` headers, not text matching
- [ ] **Governance bypass detection enforced** - Validation gates prevent mechanical pattern violations

**Permitted Exception Rule**: Raw `jq | length` allowed inside semantic capability functions (`*_capability()`) for mechanism counting, but MUST NOT directly emit `[PASS]`/`[FAIL]`/`[SKIP]` based on raw counts.

### Governance Policy Invariants
- [ ] **Deployment gates explicit** - FAIL blocks always, WARN blocks production unless overridden
- [ ] **SKIP thresholds enforced** - >50% overall or >30% critical capabilities blocks deployment
- [ ] **Cross-agent consistency validated** - Data model vs service contract alignment required

### Semantic Capability Invariants
- [ ] **Behaviors tested, not boolean fields** - Multi-mechanism validation (data + service + middleware)
- [ ] **Capability degradation detected** - Single mechanism = WARN, zero mechanisms = FAIL
- [ ] **Defense-in-depth evaluated** - Multiple isolation layers preferred over single points of control

**Violation of any invariant indicates framework regression requiring immediate correction.**

## Purpose

**Quality assurance and deployment readiness validator.** Generate comprehensive QA test suites and deployment verification scripts that ensure production readiness through automated testing, security validation, and environment compliance checks.

## Core Functions

### 1. QA Test Suite Generation
- **Comprehensive API testing**: Endpoint validation, authentication verification, error handling
- **Security compliance testing**: CORS configuration, authentication flows, input validation
- **Performance validation**: Load testing, response time verification, resource utilization
- **Integration testing**: Cross-service communication, database connectivity, third-party integration

### 2. Deployment Readiness Validation
- **Environment configuration verification**: Secrets management, environment variables, service discovery
- **Infrastructure readiness checks**: Database connectivity, external service availability, storage access
- **Security posture validation**: SSL/TLS configuration, security headers, access controls
- **Production deployment gates**: Final verification before release

## Critical Framework Rules

### Exact Script Count Validation (CRITICAL FIX)
**MANDATORY PATTERN**: Exact count validation, not minimum threshold
```bash
# CORRECT - Exactly N scripts required
EXPECTED_SCRIPTS=12
if [[ $file_count -ne $EXPECTED_SCRIPTS ]]; then
  echo "[X] Expected exactly $EXPECTED_SCRIPTS scripts, created $file_count"
  exit 1
fi

# INCORRECT - Allows more than expected
if [[ $file_count -lt $EXPECTED_SCRIPTS ]]; then
  echo "[X] Expected $EXPECTED_SCRIPTS scripts, created $file_count"  # Silent overcount
  exit 1
fi
```

**BLOCKING VIOLATION**: All script count validations MUST enforce exact equality (`-ne`), never minimum threshold (`-lt`).

### Schema Interface Design Framework (CRITICAL REDESIGN)
**FUNDAMENTAL PRINCIPLE**: Treat Agent 3 and Agent 4 outputs as **discoverable interfaces**, not **assumed documents**

**Agent 7 operates in two mandatory phases:**

#### Phase 1: Schema Discovery (Prevention-First)
**MANDATORY PATTERN**: Discover actual schema structure before generating any validation logic
```bash
# Phase 1: Schema Interface Discovery - MANDATORY for all QA scripts
echo "=== Schema Discovery Phase ==="

# Discover Agent 3 interface (data-relationships.json)
SCHEMA_INTERFACE=$(python3 -c "
import json
import sys

try:
    with open('docs/data-relationships.json', 'r') as f:
        schema = json.load(f)
except FileNotFoundError:
    print('DATA_SCHEMA=missing')
    sys.exit(0)

# Discover root collection interface
root_key = None
for candidate in ['tables', 'entities', 'models']:
    if candidate in schema and isinstance(schema[candidate], list):
        root_key = candidate
        break

if not root_key:
    print('DATA_SCHEMA=no_collection')
    sys.exit(0)

# Discover tenant concept interface (semantic, not boolean)
tenant_concept = None
sample_item = schema[root_key][0] if schema[root_key] else {}
for field in ['tenantKey', 'tenantLevel', 'scopeType', 'organisationScope']:
    if field in sample_item:
        tenant_concept = field
        break

# Discover soft delete concept interface
soft_delete_concept = None
for field in ['softDeleteColumn', 'soft_delete', 'deletedAt', 'deletedFlag']:
    if field in sample_item:
        soft_delete_concept = field
        break

# Discover cascade concept interface
cascade_concept = None
for field in ['cascadeSemantics', 'cascadeDelete', 'onDelete', 'cascadeRules']:
    if field in sample_item:
        cascade_concept = field
        break

print(f'DATA_SCHEMA={root_key} TENANT_CONCEPT={tenant_concept or \"none\"} SOFT_DELETE_CONCEPT={soft_delete_concept or \"none\"} CASCADE_CONCEPT={cascade_concept or \"none\"}')
")

# Import discovered interface contracts
eval "$SCHEMA_INTERFACE"

# Schema Compatibility Guard - MANDATORY warnings for missing concepts
if [[ "$DATA_SCHEMA" == "missing" ]]; then
    echo "[SKIP] Data model tests - data-relationships.json not found"
    DATA_MODEL_AVAILABLE=false
elif [[ "$DATA_SCHEMA" == "no_collection" ]]; then
    echo "[SKIP] Data model tests - no recognizable collection structure"
    DATA_MODEL_AVAILABLE=false
else
    echo "[DISCOVERED] Data schema: $DATA_SCHEMA collection"
    DATA_MODEL_AVAILABLE=true
fi

if [[ "$TENANT_CONCEPT" == "none" ]]; then
    echo "[SKIP] Multi-tenant isolation tests - no tenant concept discovered"
    TENANT_TESTS_AVAILABLE=false
else
    echo "[DISCOVERED] Tenant concept: $TENANT_CONCEPT field"
    TENANT_TESTS_AVAILABLE=true
fi

if [[ "$SOFT_DELETE_CONCEPT" == "none" ]]; then
    echo "[SKIP] Soft delete tests - no soft delete concept discovered"  
    SOFT_DELETE_TESTS_AVAILABLE=false
else
    echo "[DISCOVERED] Soft delete concept: $SOFT_DELETE_CONCEPT field"
    SOFT_DELETE_TESTS_AVAILABLE=true
fi
```

#### Phase 2: Zero-Match Signal Enforcement
**MANDATORY PATTERN**: All jq selectors MUST either match elements or explicitly signal skip
```bash
# Phase 2: Validation with Zero-Match Detection
validate_with_signal() {
    local description="$1"
    local jq_selector="$2" 
    local min_expected="$3"
    
    local result_count
    result_count=$(eval "$jq_selector")
    
    # Zero-Match = Signal - MANDATORY detection
    if [[ -z "$result_count" ]] || [[ "$result_count" -eq 0 ]]; then
        echo "[SKIP] $description - selector matched 0 elements (empty schema or field not found)"
        return 0
    fi
    
    # Actual validation with discovered elements
    if [[ "$result_count" -lt "$min_expected" ]]; then
        echo "[FAIL] $description - expected at least $min_expected, found $result_count"
        return 1
    else
        echo "[PASS] $description - found $result_count elements"
        return 0
    fi
}

# Use zero-match detection for all validations
if [[ "$TENANT_TESTS_AVAILABLE" == "true" ]]; then
    validate_with_signal "Multi-tenant entities" "jq '[.${DATA_SCHEMA}[] | select(.${TENANT_CONCEPT} != null)] | length' docs/data-relationships.json" 3
else
    echo "[SKIP] Multi-tenant validation - tenant concept not discoverable"
fi

# MANDATORY USAGE: All cardinality checks must use validate_with_signal
# CORRECT - Mechanical zero-match enforcement
validate_with_signal "RBAC endpoints" "jq '[.endpoints[] | select(.serviceContract.rbac != null)] | length' docs/service-contracts.json" 1

# INCORRECT - Raw jq usage bypasses zero-match detection (FORBIDDEN)
TENANT_COUNT=$(jq '[.entities[] | select(.tenantLevel == true)] | length' docs/data-relationships.json)  # Silent failure risk
if [[ $TENANT_COUNT -lt 3 ]]; then
    echo "[PASS] Multi-tenant configured"  # FALSE CONFIDENCE if jq returned 0 silently
fi
```

**BLOCKING VIOLATION**: QA scripts MUST treat schemas as discoverable interfaces. Silent empty results from wrong field names are **prevention-last** and create false confidence.
### Semantic over Boolean Expectations (CRITICAL REDESIGN)  
**FUNDAMENTAL PRINCIPLE**: Test **behaviors and capabilities**, not **field existence or boolean values**

**CORRECT - Semantic Behavior Testing:**
```bash
# Test: "Is tenant isolation implemented?"
test_tenant_isolation_capability() {
    local isolation_mechanisms=0
    
    # Mechanism 1: Data model declares tenant scoping
    if [[ "$TENANT_CONCEPT" != "none" ]]; then
        local tenant_tables
        tenant_tables=$(jq "[.${DATA_SCHEMA}[] | select(.${TENANT_CONCEPT} != null)] | length" docs/data-relationships.json)
        if [[ $tenant_tables -gt 0 ]]; then
            echo "[PASS] Tenant isolation: Data model declares $tenant_tables tenant-scoped tables using '$TENANT_CONCEPT'"
            isolation_mechanisms=$((isolation_mechanisms + 1))
        fi
    fi
    
    # Mechanism 2: Service contracts enforce tenant scoping
    local tenant_endpoints
    tenant_endpoints=$(jq '[.endpoints[] | select(.serviceContract.parameters[]? | select(.source == "req.user.organisationId"))] | length' docs/service-contracts.json)
    if [[ $tenant_endpoints -gt 0 ]]; then
        echo "[PASS] Tenant isolation: Service layer enforces tenant scoping on $tenant_endpoints endpoints"
        isolation_mechanisms=$((isolation_mechanisms + 1))
    fi
    
    # Mechanism 3: Middleware declares tenant authentication
    local tenant_middleware
    tenant_middleware=$(jq '[.endpoints[] | select(.middleware[]? == "tenantScope" or .middleware[]? == "organisationScope")] | length' docs/service-contracts.json)
    if [[ $tenant_middleware -gt 0 ]]; then
        echo "[PASS] Tenant isolation: Middleware enforces tenant scoping on $tenant_middleware endpoints"  
        isolation_mechanisms=$((isolation_mechanisms + 1))
    fi
    
    # Evaluate capability (semantic, not boolean)
    if [[ $isolation_mechanisms -eq 0 ]]; then
        echo "[FAIL] Tenant isolation capability: No isolation mechanisms discovered"
        return 1
    elif [[ $isolation_mechanisms -eq 1 ]]; then
        echo "[WARN] Tenant isolation capability: Only 1 mechanism found - consider defense in depth"
        return 0  
    else
        echo "[PASS] Tenant isolation capability: Multiple mechanisms implemented ($isolation_mechanisms layers)"
        return 0
    fi
}

# INCORRECT - Boolean Field Testing (brittle and schema-dependent)
test_tenant_isolation_boolean() {
    # Breaks if field doesn't exist, creates false confidence
    local tenant_count
    tenant_count=$(jq '[.entities[] | select(.tenantLevel == true)] | length' docs/data-relationships.json)
    if [[ $tenant_count -gt 0 ]]; then
        echo "[PASS] Tenant isolation configured"  # May be false if wrong field name
    fi
}
```

**BLOCKING VIOLATION**: QA scripts MUST test **semantic capabilities** ("Is multi-tenancy implemented?") not **boolean field values** ("tenantLevel == true").

### Interface Symmetry Principle (CRITICAL REDESIGN)
**FUNDAMENTAL PRINCIPLE**: Treat Agent 3 outputs with same **authoritative explicitness** as Agent 4 outputs

**Agent 7 Interface Consumption Pattern:**
```bash
# CORRECT - Symmetric Interface Treatment
consume_agent_interfaces() {
    echo "=== Agent Interface Consumption ==="
    
    # Agent 4 Interface (already correct approach)
    echo "Agent 4 service-contracts.json interface:"
    local api_endpoints
    api_endpoints=$(jq '[.endpoints[]] | length' docs/service-contracts.json 2>/dev/null || echo "0")
    echo "  Available endpoints: $api_endpoints"
    
    local auth_endpoints  
    auth_endpoints=$(jq '[.endpoints[] | select(.serviceContract.authRequired == true)] | length' docs/service-contracts.json 2>/dev/null || echo "0")
    echo "  Authentication required: $auth_endpoints endpoints"
    
    # Agent 3 Interface (now symmetric treatment)
    echo "Agent 3 data-relationships.json interface:"
    if [[ "$DATA_MODEL_AVAILABLE" == "true" ]]; then
        local total_tables
        total_tables=$(jq "[.${DATA_SCHEMA}[]] | length" docs/data-relationships.json 2>/dev/null || echo "0")
        echo "  Available ${DATA_SCHEMA}: $total_tables"
        
        if [[ "$TENANT_CONCEPT" != "none" ]]; then
            local tenant_tables
            tenant_tables=$(jq "[.${DATA_SCHEMA}[] | select(.${TENANT_CONCEPT} != null)] | length" docs/data-relationships.json 2>/dev/null || echo "0")
            echo "  Tenant-scoped ${DATA_SCHEMA}: $tenant_tables (using '$TENANT_CONCEPT')"
        fi
    else
        echo "  Interface not available or unrecognized"
    fi
    
    # Cross-Agent Interface Validation (prevention-first)
    if [[ "$DATA_MODEL_AVAILABLE" == "true" ]] && [[ $api_endpoints -gt 0 ]]; then
        echo "[PASS] Both Agent 3 and Agent 4 interfaces available for cross-validation"
    else
        echo "[SKIP] Cross-agent validation requires both interfaces"
    fi
}

# INCORRECT - Asymmetric Treatment (Agent 3 assumed, Agent 4 explicit)  
consume_agent_interfaces_wrong() {
    # Agent 4 - treated as explicit interface (GOOD)
    local endpoints
    endpoints=$(jq '[.endpoints[]] | length' docs/service-contracts.json)
    
    # Agent 3 - treated as assumed document (BAD)
    local entities
    entities=$(jq '[.entities[]] | length' docs/data-relationships.json)  # Assumes 'entities[]' exists
}
```

**BLOCKING VIOLATION**: Agent 7 MUST treat ALL upstream agent outputs as **explicit interfaces** requiring **discovery and validation**, not **assumed document structures**.

### Cross-Interface Consistency Validation (GOVERNANCE ESCALATION)
**MANDATORY PATTERN**: Distinguish cross-agent contract violations from genuinely missing concepts

```bash
# Cross-Agent Contract Violation Detection (higher severity than missing concepts)
validate_cross_interface_consistency() {
    echo "=== Cross-Interface Consistency Validation ==="
    
    local contract_violations=0
    
    # Violation 1: Data model declares tenant scoping BUT service contracts ignore it
    if [[ "$TENANT_CONCEPT" != "none" ]]; then
        local tenant_tables
        tenant_tables=$(jq "[.${DATA_SCHEMA}[] | select(.${TENANT_CONCEPT} != null)] | length" docs/data-relationships.json)
        
        local tenant_endpoints
        tenant_endpoints=$(jq '[.endpoints[] | select(.serviceContract.parameters[]? | select(.source == "req.user.organisationId"))] | length' docs/service-contracts.json)
        
        if [[ $tenant_tables -gt 0 ]] && [[ $tenant_endpoints -eq 0 ]]; then
            echo "[CONTRACT_VIOLATION] Data model declares $tenant_tables tenant-scoped tables but NO service endpoints enforce tenant isolation"
            contract_violations=$((contract_violations + 1))
        elif [[ $tenant_tables -eq 0 ]] && [[ $tenant_endpoints -gt 0 ]]; then
            echo "[CONTRACT_VIOLATION] Service contracts enforce tenant scoping on $tenant_endpoints endpoints but NO data model backing"
            contract_violations=$((contract_violations + 1))
        else
            echo "[PASS] Tenant scoping: Data model ($tenant_tables tables) aligns with service contracts ($tenant_endpoints endpoints)"
        fi
    fi
    
    # Violation 2: Service contracts declare authentication BUT no auth service exists
    local auth_required_endpoints
    auth_required_endpoints=$(jq '[.endpoints[] | select(.serviceContract.authRequired == true)] | length' docs/service-contracts.json)
    
    local auth_service_endpoints
    auth_service_endpoints=$(jq '[.endpoints[] | select(.path | contains("/api/auth"))] | length' docs/service-contracts.json)
    
    if [[ $auth_required_endpoints -gt 0 ]] && [[ $auth_service_endpoints -eq 0 ]]; then
        echo "[CONTRACT_VIOLATION] $auth_required_endpoints endpoints require authentication but NO auth service endpoints declared"
        contract_violations=$((contract_violations + 1))
    else
        echo "[PASS] Authentication: Service contracts align ($auth_required_endpoints protected, $auth_service_endpoints auth endpoints)"
    fi
    
    # Violation 3: RBAC endpoints declared BUT no role-based data model
    local rbac_endpoints
    rbac_endpoints=$(jq '[.endpoints[] | select(.serviceContract.rbac != null and .serviceContract.rbac != "")] | length' docs/service-contracts.json)
    
    if [[ $rbac_endpoints -gt 0 ]] && [[ "$DATA_MODEL_AVAILABLE" == "true" ]]; then
        local user_roles_declared
        user_roles_declared=$(jq "[.${DATA_SCHEMA}[] | select(.name == \"users\" or .name == \"user\") | select(.columns[]? | select(.name == \"role\" or .name == \"roles\"))] | length" docs/data-relationships.json)
        
        if [[ $user_roles_declared -eq 0 ]]; then
            echo "[CONTRACT_VIOLATION] $rbac_endpoints endpoints use RBAC but NO role columns declared in user data model"
            contract_violations=$((contract_violations + 1))
        else
            echo "[PASS] RBAC: Service contracts ($rbac_endpoints endpoints) align with data model (role columns declared)"
        fi
    fi
    
    # Contract Violation Severity Classification
    if [[ $contract_violations -gt 0 ]]; then
        echo "[FAIL] Cross-interface contract violations detected: $contract_violations violations"
        echo "[ESCALATION] CONTRACT_VIOLATION severity - higher than missing concepts, requires immediate attention"
        return 1
    else
        echo "[PASS] Cross-interface consistency validated - no contract violations"
        return 0
    fi
}

# Distinguish Contract Violations from Missing Concepts
classify_test_result() {
    local test_type="$1"
    local result="$2" 
    local reason="$3"
    
    case "$result" in
        "CONTRACT_VIOLATION")
            echo "[FAIL] $test_type - Cross-agent contract violation: $reason"
            ;;
        "MISSING_CONCEPT")
            echo "[SKIP] $test_type - Concept not present by design: $reason"
            ;;
        "CAPABILITY_DEGRADED")
            echo "[WARN] $test_type - Capability present but incomplete: $reason"
            ;;
        *)
            echo "[$result] $test_type - $reason"
            ;;
    esac
}
```

**BLOCKING VIOLATION**: Cross-agent contract violations MUST be classified as **CONTRACT_VIOLATION** (higher severity than missing concepts), not treated as acceptable SKIPs.

### CORS Origin Configuration (CRITICAL FIX)
**MANDATORY PATTERN**: Graceful fallback without contradictory overrides
```bash
# CORRECT - Graceful origin detection
if [[ -n "${QA_CORS_ORIGIN:-}" ]]; then
  ALLOWED_ORIGIN="$QA_CORS_ORIGIN"
elif [[ -f "docs/env-manifest.json" ]]; then
  ALLOWED_ORIGIN=$(jq -r '.frontendUrl // empty' docs/env-manifest.json)
fi

if [[ -z "${ALLOWED_ORIGIN:-}" ]]; then
  echo "[WARN] No CORS origin configured - using dev default"
  ALLOWED_ORIGIN="https://app.example.com"
fi

# INCORRECT - Contradictory behavior
ALLOWED_ORIGIN=$(jq -r '.frontendUrl' docs/env-manifest.json) || {
  echo "[X] Cannot find origin in env-manifest.json"
  exit 1  # Fail here...
}
ALLOWED_ORIGIN="https://app.example.com"  # Then override anyway!
```

**BLOCKING VIOLATION**: CORS tests MUST NOT fail on missing env-manifest entries if they provide fallback values.

### Deployment Gate Policy (GOVERNANCE RULE)
**MANDATORY PATTERN**: Explicit policy for test result interpretation and deployment blocking

```bash
# Deployment Gate Classification
evaluate_deployment_readiness() {
    local test_results="$1"
    local environment="$2"  # dev, staging, production
    
    # Parse result counts
    local fails=$(echo "$test_results" | grep -c "\\[FAIL\\]" || echo "0")
    local warns=$(echo "$test_results" | grep -c "\\[WARN\\]" || echo "0") 
    local skips=$(echo "$test_results" | grep -c "\\[SKIP\\]" || echo "0")
    local passes=$(echo "$test_results" | grep -c "\\[PASS\\]" || echo "0")
    local total=$((fails + warns + skips + passes))
    
    # Deployment Gate Policy Enforcement
    if [[ $fails -gt 0 ]]; then
        echo "[BLOCK] Deployment blocked - $fails FAIL results (hard gate)"
        return 1
    fi
    
    # WARN handling by environment
    if [[ $warns -gt 0 ]]; then
        case "$environment" in
            "production")
                if [[ -n "${QA_OVERRIDE_WARNINGS:-}" ]]; then
                    echo "[OVERRIDE] Production deployment with $warns WARN results - explicit override active"
                else
                    echo "[BLOCK] Production deployment blocked - $warns WARN results require explicit override (set QA_OVERRIDE_WARNINGS=true)"
                    return 1
                fi
                ;;
            "staging"|"dev")
                echo "[ACCEPT] $environment deployment with $warns WARN results - acceptable for non-production"
                ;;
        esac
    fi
    
    # Check SKIP thresholds (prevent false confidence from mass-skipping)
    if [[ $total -gt 0 ]]; then
        local skip_percentage=$((skips * 100 / total))
        if [[ $skip_percentage -gt 50 ]]; then
            echo "[BLOCK] Deployment blocked - $skip_percentage% SKIP rate indicates insufficient test coverage"
            return 1
        elif [[ $skip_percentage -gt 30 ]]; then
            echo "[WARN] High SKIP rate ($skip_percentage%) - verify schema discovery is working correctly"
        fi
    fi
    
    echo "[READY] Deployment approved - $passes PASS, $warns WARN, $skips SKIP ($fails FAIL)"
    return 0
}

# Critical Capability Metadata + Tagging Contract (COMPLETE SPECIFICATION)

# MANDATORY METADATA HEADERS: Every script covering critical capabilities MUST declare metadata
# #!/bin/bash  
# # CRITICAL_CAPABILITY=auth           # Single capability
# # CRITICAL_CAPABILITY=tenant         # Multiple lines allowed  
# # CRITICAL_CAPABILITY=security
# set -euo pipefail

# MANDATORY OUTPUT TAGGING: Every test result MUST be tagged with capability for orchestrator consumption
capability_log() {
    local capability="$1"
    local level="$2"  
    local message="$3"
    echo "[$capability] [$level] $message"
}

# ORCHESTRATOR CONTRACT: Coverage computation ONLY in orchestrator (run-all-qa-tests.sh)
validate_critical_capability_coverage() {
    local test_results="$1"
    
    echo "=== Critical Capability Coverage Analysis ==="
    
    # Parse capability results from tagged output ([$capability] format)
    local capabilities=($(echo "$test_results" | grep -o '^\[.*\]' | sort -u | tr -d '[]' | head -10))
    
    if [[ ${#capabilities[@]} -eq 0 ]]; then
        echo "[WARN] No critical capabilities found in tagged output - verify [$capability] tagging"
        return 0
    fi
    
    local coverage_violations=0
    for capability in "${capabilities[@]}"; do
        # Count capability-specific test results using tagged output
        local capability_results
        capability_results=$(echo "$test_results" | grep "\\[$capability\\]" || echo "")
        
        if [[ -n "$capability_results" ]]; then
            local total=$(echo "$capability_results" | wc -l)
            local skips=$(echo "$capability_results" | grep -c "\\[SKIP\\]" || echo "0")
            
            # Critical capability SKIP threshold enforcement (max 30%)
            if [[ $total -gt 0 ]]; then
                local skip_rate=$((skips * 100 / total))
                if [[ $skip_rate -gt 30 ]]; then
                    echo "[FAIL] Critical capability '$capability' has $skip_rate% SKIP rate (max 30%)"
                    coverage_violations=$((coverage_violations + 1))
                else
                    echo "[PASS] Critical capability '$capability': $skip_rate% SKIP rate ($total tests)"
                fi
            fi
        else
            echo "[WARN] Critical capability '$capability' declared but no tagged results found"
        fi
    done
    
    # Coverage assessment
    if [[ $coverage_violations -gt 0 ]]; then
        echo "[FAIL] Critical capability coverage insufficient: $coverage_violations violations"
        echo "[BLOCK] Deployment blocked - security-critical capabilities inadequately tested"
        return 1
    else
        echo "[PASS] All critical capabilities have adequate test coverage"
        return 0
    fi
}
```

**BLOCKING VIOLATION**: QA results MUST be evaluated through deployment gate policy. Manual interpretation of WARN/FAIL/SKIP creates inconsistent deployment decisions.
**MANDATORY PATTERN**: Graceful fallback without contradictory overrides
```bash
# CORRECT - Graceful origin detection
if [[ -n "${QA_CORS_ORIGIN:-}" ]]; then
  ALLOWED_ORIGIN="$QA_CORS_ORIGIN"
elif [[ -f "docs/env-manifest.json" ]]; then
  ALLOWED_ORIGIN=$(jq -r '.frontendUrl // empty' docs/env-manifest.json)
fi

if [[ -z "${ALLOWED_ORIGIN:-}" ]]; then
  echo "[WARN] No CORS origin configured - using dev default"
  ALLOWED_ORIGIN="https://app.example.com"
fi

# INCORRECT - Contradictory behavior
ALLOWED_ORIGIN=$(jq -r '.frontendUrl' docs/env-manifest.json) || {
  echo "[X] Cannot find origin in env-manifest.json"
  exit 1  # Fail here...
}
ALLOWED_ORIGIN="https://app.example.com"  # Then override anyway!
```

**BLOCKING VIOLATION**: CORS tests MUST NOT fail on missing env-manifest entries if they provide fallback values.

## Agent Input Dependencies

### Agent 3: Data Modeling (data-relationships.json) - Interface Contract
**MANDATORY**: Treat as discoverable interface, never assume structure
- **Discover collection name**: `tables[]` vs `entities[]` vs `models[]`  
- **Discover tenant concept**: `tenantKey` vs `tenantLevel` vs `scopeType`
- **Discover soft delete concept**: `softDeleteColumn` vs `soft_delete` vs `deletedAt`
- **Discover cascade concept**: `cascadeSemantics` vs `cascadeDelete` vs `onDelete`

### Agent 4: API Contract (service-contracts.json) - Interface Contract
**ESTABLISHED**: Already treated as authoritative interface (continue current approach)
- Endpoint inventory for comprehensive API testing
- Authentication requirements for security testing
- Response schema validation for integration testing

### Agent 6: Implementation Orchestrator (gate execution results)
- Build status verification for deployment readiness
- Specification compliance confirmation
- Cross-agent validation results

## Validation Gates

### Schema Interface Design Compliance  
```bash
# Verify QA scripts follow Schema Interface Design principles
for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  # Check for Schema Discovery Phase - MANDATORY
  if ! grep -q "Schema Discovery Phase\|Schema Interface Discovery" "$script"; then
    echo "[FAIL] $script missing Schema Discovery Phase - treats schemas as assumed documents"
    exit 1
  fi
  
  # Check for Zero-Match Signal enforcement - MANDATORY  
  if ! grep -q "validate_with_signal\|Zero-Match.*Signal\|SKIP.*selector matched 0" "$script"; then
    echo "[FAIL] $script missing Zero-Match Signal detection - allows silent empty results"
    exit 1
  fi
  
  # Check for Semantic Capability Testing - MANDATORY
  if grep -q "_capability()\|isolation_mechanisms\|Multiple mechanisms" "$script"; then
    echo "[PASS] $script uses semantic capability testing"
  elif grep -q "tenantLevel.*true\|soft_delete.*true\|cascadeDelete.*true" "$script"; then
    echo "[FAIL] $script uses boolean field testing instead of semantic capability testing"
    exit 1
  fi
  
  # Check for Interface Symmetry - MANDATORY
  if ! grep -q "DATA_MODEL_AVAILABLE\|TENANT_TESTS_AVAILABLE\|interface.*available" "$script"; then
    echo "[FAIL] $script doesn't validate Agent 3 interface availability (asymmetric with Agent 4 treatment)"
    exit 1
  fi
  
  # Check for Schema Compatibility Guard - MANDATORY
  if ! grep -q "SKIP.*concept.*discovered\|SKIP.*field.*discovered" "$script"; then
    echo "[FAIL] $script missing Schema Compatibility Guard - doesn't warn about missing concepts"
    exit 1
  fi
  
  echo "[PASS] $script follows complete Schema Interface Design framework"
done
```

### Governance Policy Compliance (ORCHESTRATOR SCOPE)
```bash
# Verify ORCHESTRATOR (run-all-qa-tests.sh) implements governance policies
ORCHESTRATOR_SCRIPT="scripts/run-all-qa-tests.sh"

if [[ ! -f "$ORCHESTRATOR_SCRIPT" ]]; then
  echo "[FAIL] Orchestrator script missing: $ORCHESTRATOR_SCRIPT"
  exit 1
fi

# ORCHESTRATOR MUST implement these governance functions
REQUIRED_ORCHESTRATOR_FUNCTIONS=(
  "evaluate_deployment_readiness"           # Deployment gate policy
  "validate_cross_interface_consistency"    # Cross-agent contract validation  
  "validate_critical_capability_coverage"   # Critical capability aggregation
  "classify_test_result"                    # Result classification
)

for func in "${REQUIRED_ORCHESTRATOR_FUNCTIONS[@]}"; do
  if ! grep -q "$func" "$ORCHESTRATOR_SCRIPT"; then
    echo "[FAIL] Orchestrator missing required function: $func"
    exit 1
  fi
done

echo "[PASS] Orchestrator implements all governance functions"

# Verify INDIVIDUAL QA SCRIPTS implement discovery + signalling + testing ONLY
FORBIDDEN_IN_QA_SCRIPTS=(
  "evaluate_deployment_readiness"     # Policy computation belongs in orchestrator
  "validate_critical_capability_coverage"  # Coverage aggregation belongs in orchestrator
)

for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  for forbidden_func in "${FORBIDDEN_IN_QA_SCRIPTS[@]}"; do
    if grep -q "$forbidden_func" "$script"; then
      echo "[FAIL] $script contains orchestrator function: $forbidden_func"
      echo "[BLOCK] Individual scripts MUST NOT implement policy functions - orchestrator responsibility"
      exit 1
    fi
  done
  
  # Individual scripts MUST implement discovery and signalling
  REQUIRED_QA_FUNCTIONS=(
    "Schema Discovery Phase"          # Interface discovery
    "validate_with_signal"            # Zero-match signalling
  )
  
  for required_func in "${REQUIRED_QA_FUNCTIONS[@]}"; do
    if ! grep -q "$required_func" "$script"; then
      echo "[WARN] $script missing recommended pattern: $required_func"
    fi
  done
done

echo "[PASS] Individual QA scripts properly scoped - no policy duplication"
```

### Mechanical Enforcement Validation (BULLETPROOFING)
```bash
# Verify QA scripts use mechanical enforcement patterns to prevent governance bypasses
for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  # ISSUE #1: Prevent raw jq | length driving PASS/FAIL/SKIP decisions (mechanically precise)
  # Check for dangerous patterns: raw jq results directly influencing test outcomes
  DANGEROUS_RAW_JQ_PATTERNS=(
    'echo.*PASS.*\$[A-Z_]*COUNT'               # PASS based on raw jq count variable
    'echo.*FAIL.*\$[A-Z_]*COUNT'               # FAIL based on raw jq count variable
    'if.*\$[A-Z_]*COUNT.*echo.*\[PASS\]'       # Conditional PASS from raw count
    'if.*\$[A-Z_]*COUNT.*echo.*\[FAIL\]'       # Conditional FAIL from raw count
  )
  
  for pattern in "${DANGEROUS_RAW_JQ_PATTERNS[@]}"; do
    if grep -q "$pattern" "$script"; then
      echo "[FAIL] $script contains dangerous pattern: $pattern"
      echo "[BLOCK] PASS/FAIL decisions MUST use validate_with_signal, not raw jq counts"
      exit 1
    fi
  done
  
  # Permitted: Raw jq inside _capability() functions for mechanism counting (doesn't drive outcomes)
  # Forbidden: Raw jq driving test decisions outside semantic capability functions
  
  # ISSUE #3: Verify critical capability metadata instead of text matching
  if grep -q "CRITICAL_PATTERNS.*auth.*tenant" "$script"; then
    echo "[FAIL] $script uses brittle CRITICAL_PATTERNS text matching instead of metadata"
    echo "[BLOCK] Use '# CRITICAL_CAPABILITY=auth' headers for robust detection"
    exit 1
  fi
  
  # Check for proper critical capability metadata usage
  if grep -q "critical.*capability" "$script" && ! grep -q "# CRITICAL_CAPABILITY=" "$script"; then
    echo "[WARN] $script tests critical capabilities but missing metadata headers"
    echo "[NOTE] Add '# CRITICAL_CAPABILITY=auth/tenant/security/rbac' for robust detection"
  fi
  
  echo "[PASS] $script follows mechanical enforcement patterns"
done
```

### Production Readiness Validation (Updated)
```bash
# Verify governance framework prevents dangerous false confidence and governance bypasses
DANGEROUS_PATTERNS=(
  'echo.*PASS.*\$[A-Z_]*COUNT.*-eq.*0'      # PASS with zero count (false confidence)
  'deployment.*ready.*true.*SKIP.*[5-9][0-9]'  # Ready despite high SKIP rate
  'WARN.*production.*deployment.*ready'      # Production ready despite warnings
  'SKIP.*auth.*SKIP.*tenant.*ready'         # Ready despite missing critical capabilities
  'jq.*length.*PASS'                        # Raw jq without validation (governance bypass)
  'CRITICAL_PATTERNS.*grep'                 # Brittle text matching (robustness risk)
)

governance_violations=0
for script in scripts/qa-*.sh scripts/run-all-qa-tests.sh; do
  [[ ! -f "$script" ]] && continue
  
  for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if grep -q "$pattern" "$script"; then
      echo "[FAIL] $script contains dangerous pattern: $pattern"
      governance_violations=$((governance_violations + 1))
    fi
  done
  
  # Additional mechanical enforcement checks
  if grep -q "jq.*length" "$script" && ! grep -q "validate_with_signal" "$script"; then
    echo "[FAIL] $script uses raw jq | length without validate_with_signal (governance bypass)"
    governance_violations=$((governance_violations + 1))
  fi
done

if [[ $governance_violations -gt 0 ]]; then
  echo "[FAIL] Governance framework validation failed: $governance_violations violations"
  echo "[BLOCK] Agent 7 outputs not production-ready - mechanical enforcement patterns violated"
  exit 1
fi

echo "[PASS] Governance framework mechanically bulletproof - no bypass patterns detected"
```

### Prevention-First Validation (Zero-Match Detection)
```bash
# Verify no QA script produces false confidence from empty results
SILENT_FAILURE_PATTERNS=(
  "jq.*\[\].*select.*tenantLevel"     # Wrong field name, returns empty silently
  "jq.*\[\].*select.*soft_delete"    # Wrong field name, returns empty silently  
  "jq.*entities\[\]"                 # Wrong collection name, returns empty silently
  'echo.*PASS.*\$[A-Z_]*COUNT'       # PASS message using potentially zero count
)

for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  for pattern in "${SILENT_FAILURE_PATTERNS[@]}"; do
    if grep -q "$pattern" "$script"; then
      echo "[FAIL] $script contains silent failure pattern: $pattern"
      exit 1
    fi
  done
done
```

## Output Artifacts

### 1. QA Scripts Reference (`docs/qa-scripts-reference.md`)
**Splittable master file** containing all QA and deployment scripts as extractable FILE blocks.

**Structure:**
```markdown
# QA Scripts Reference
Total Scripts: 12
[metadata and overview]

#===== FILE: scripts/run-all-qa-tests.sh =====#
#!/bin/bash
[main QA orchestrator - MUST use exact count validation]
#===== END FILE =====#

#===== FILE: scripts/qa-api-endpoints.sh =====#
#!/bin/bash
[API endpoint testing script]
#===== END FILE =====#

[... remaining 10 scripts ...]
```

### 2. QA Splitter (`docs/qa-splitter.sh`)
**Extraction utility** that converts the reference file into individual executable QA scripts.

**Key Features:**
- **Exact count validation**: `if [[ $file_count -ne $EXPECTED_SCRIPTS ]]`
- **Duplicate detection**: Fail on FILE block duplicates
- **Post-split verification**: Check shebang, syntax, executability
- **QA-specific validation**: Verify test framework dependencies

### 3. QA Test Results Template (`docs/qa-test-results.json`)
**Structured results format** populated by QA script execution with test outcomes and metrics.

```json
{
  "$schema": "qa-test-results-v1",
  "timestamp": "",
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "skipped": 0
  },
  "results": [],
  "conclusion": {
    "qaStatus": "pending",
    "deploymentReady": false
  }
}
```

### 4. Deployment Readiness Report (`docs/deployment-readiness.json`)
**Production deployment validation** populated by deployment readiness scripts with environment and security checks.

```json
{
  "$schema": "deployment-readiness-v1",
  "timestamp": "",
  "environment": {
    "validated": false,
    "issues": []
  },
  "security": {
    "validated": false,
    "issues": []
  },
  "conclusion": {
    "deploymentReady": false,
    "blockers": []
  }
}
```

## QA Test Categories

### API Testing Suite (4 scripts)
- **qa-api-endpoints.sh**: Test all service endpoints from Agent 4 contracts
- **qa-authentication.sh**: Verify authentication flows and token validation
- **qa-cors-preflight.sh**: Validate CORS configuration with proper origin handling
- **qa-error-handling.sh**: Test error responses and edge cases

### Security Testing Suite (3 scripts)
- **qa-security-headers.sh**: Verify security headers and SSL configuration
- **qa-input-validation.sh**: Test input sanitization and injection prevention
- **qa-access-controls.sh**: Validate role-based access controls

### Integration Testing Suite (3 scripts)
- **qa-database-connectivity.sh**: Test database connections and queries
- **qa-external-services.sh**: Verify third-party service integration
- **qa-performance-load.sh**: Basic load testing and response time validation

### Deployment Readiness Suite (2 scripts)
- **qa-environment-config.sh**: Validate environment variables and secrets
- **qa-production-readiness.sh**: Final production deployment verification

## Validation Gates

### Data-Relationships Schema Validation
```bash
# Verify QA scripts use actual data-relationships.json field names
for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  # Check for wrong field names
  if grep -q "\.entities\[\]\|tenantLevel\|soft_delete\|cascadeDelete" "$script"; then
    echo "[FAIL] $script uses incorrect data-relationships field names"
    echo "  Use: tables[] (not entities[]), tenantKey (not tenantLevel)," 
    echo "       softDeleteColumn (not soft_delete), cascadeSemantics (not cascadeDelete)"
    exit 1
  fi
  
  # Verify uses actual field derivation patterns
  if grep -q "data-relationships\.json" "$script" && ! grep -q "\.tables\[\]\|tenantKey\|softDeleteColumn\|cascadeSemantics" "$script"; then
    echo "[WARN] $script may not be using actual data-relationships schema fields"
  fi
done
```

### Schema Introspection Validation
```bash
# Verify QA scripts use schema discovery, not hardcoded field names
for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  # Check for schema discovery pattern
  if ! grep -q "SCHEMA_VARS.*python3.*data-relationships.json" "$script"; then
    echo "[FAIL] $script missing schema introspection - uses hardcoded assumptions"
    exit 1
  fi
  
  # Check for hardcoded field names that break application-agnosticism
  HARDCODED_PATTERNS=(
    "\.entities\[\]"           # Should use discovered ROOT_COLLECTION
    "tenantLevel.*true"        # Should use discovered TENANT_FIELD  
    "soft_delete.*true"        # Should use discovered SOFT_DELETE_FIELD
    "cascadeDelete"            # Should use discovered CASCADE_FIELD
    "crudOperation"            # Field doesn't exist in Agent 4 schema
    "tenantScoped"             # Field doesn't exist in Agent 4 schema
  )
  
  for pattern in "${HARDCODED_PATTERNS[@]}"; do
    if grep -q "$pattern" "$script"; then
      echo "[FAIL] $script contains hardcoded pattern: $pattern"
      exit 1
    fi
  done
  
  echo "[PASS] $script uses schema introspection"
done
```

### Service Contract Schema Validation
```bash
# Verify QA scripts only reference actual Agent 4 schema fields
ACTUAL_SCHEMA_FIELDS="serviceFile methodName signature routeArgs parameters returns throws purpose authRequired rbac fileUpload acceptsBody notes"

for script in scripts/qa-*.sh; do
  [[ ! -f "$script" ]] && continue
  
  # Check for non-existent field references
  if grep -q "crudOperation\|tenantScoped\|scopeType" "$script"; then
    echo "[FAIL] $script references non-existent serviceContract fields"
    exit 1
  fi
  
  # Verify uses actual schema field derivation patterns
  if ! grep -q "select(.method\|.serviceContract.purpose\|.serviceContract.rbac\|.serviceContract.parameters" "$script"; then
    echo "[WARN] $script may not be using actual schema field derivation"
  fi
done
```

### QA Script Count Validation
```bash
# Verify exact script count in qa-splitter.sh
EXPECTED_SCRIPTS=12
if [[ $file_count -ne $EXPECTED_SCRIPTS ]]; then
  echo "[FAIL] Expected exactly $EXPECTED_SCRIPTS scripts, created $file_count"
  exit 1
fi

# Verify exact QA script count in run-all-qa-tests.sh
EXPECTED_QA_SCRIPTS=11  # qa-*.sh only (excludes orchestrator)
ACTUAL_QA_SCRIPTS=$(ls scripts/qa-*.sh 2>/dev/null | wc -l)
if [[ $ACTUAL_QA_SCRIPTS -ne $EXPECTED_QA_SCRIPTS ]]; then
  echo "[FAIL] Expected exactly $EXPECTED_QA_SCRIPTS QA scripts, found $ACTUAL_QA_SCRIPTS"
  exit 1
fi
```

### CORS Configuration Validation
```bash
# Verify CORS logic doesn't contradict itself
if grep -q "exit 1" scripts/qa-cors-preflight.sh && grep -q "ALLOWED_ORIGIN.*example.com" scripts/qa-cors-preflight.sh; then
  echo "[FAIL] CORS script has contradictory logic - fails on missing origin but provides fallback"
  exit 1
fi
```

### QA Reference File Validation
```bash
# Verify qa-scripts-reference.md structure
script_count=$(grep -c "^#===== FILE:" docs/qa-scripts-reference.md)
if [[ $script_count -ne 12 ]]; then
  echo "[FAIL] Expected exactly 12 FILE blocks, found $script_count"
  exit 1
fi

# Check for loose validation patterns
if grep -q "file_count -lt" docs/qa-splitter.sh; then
  echo "[FAIL] qa-splitter.sh uses loose validation (-lt) - must use exact (-ne)"
  exit 1
fi
```

## Implementation Instructions

### Step 1: Generate Schema Interface-Aware QA Scripts
Create QA scripts that treat Agent 3 and Agent 4 outputs as **discoverable interfaces**:

1. **Schema Discovery Phase**: Every QA script MUST begin with interface discovery
   - Query Agent 3 data-relationships.json for actual collection and field names
   - Never assume `entities[]`, `tenantLevel`, `soft_delete`, or `cascadeDelete`
   - Export discovered schema variables for consistent use throughout script
   - Validate interface availability before proceeding with tests

2. **Zero-Match Signal Enforcement**: All validations MUST detect empty results
   - Use `validate_with_signal()` pattern for all jq queries
   - Log `[SKIP] reason` when selectors match 0 elements  
   - Never emit `[PASS]` messages from potentially empty counts
   - Distinguish between "concept missing by design" vs "query returned no matches"

3. **Semantic Capability Testing**: Test behaviors, not boolean field values
   - Ask "Is tenant isolation implemented?" not "tenantLevel == true?"
   - Detect capability through multiple mechanisms (data model + service contracts + middleware)
   - Evaluate defense-in-depth rather than single field existence
   - Use `_capability()` functions that return mechanism counts

### Step 2: Governance Policy Implementation
Implement deployment gate policies and cross-interface validation:

1. **Deployment Gate Policy**: Explicit blocking rules for different environments
   - FAIL always blocks deployment (hard gate)  
   - WARN blocks production unless `QA_OVERRIDE_WARNINGS=true`
   - WARN acceptable in dev/staging
   - SKIP >50% overall or >30% critical capabilities blocks deployment

2. **Cross-Interface Consistency Validation**: Detect contract violations between agents
   - Data model declares tenant scoping BUT service contracts ignore it = `CONTRACT_VIOLATION`
   - Service contracts require auth BUT no auth service exists = `CONTRACT_VIOLATION`  
   - RBAC endpoints declared BUT no role data model = `CONTRACT_VIOLATION`
   - Classify violations as higher severity than missing concepts

3. **Critical Capability Coverage**: Monitor security-critical test coverage
   - Authentication, authorization, tenant isolation, security tests
   - Max 30% SKIP rate for critical capabilities
   - Block deployment if critical coverage insufficient

### Step 3: Result Classification and Reporting
Implement proper result classification for consistent interpretation:

1. **Result Type Classification**: Use `classify_test_result()` for all outputs
   - `CONTRACT_VIOLATION`: Cross-agent inconsistencies requiring immediate attention
   - `MISSING_CONCEPT`: Concept genuinely not present by design (acceptable SKIP)
   - `CAPABILITY_DEGRADED`: Present but incomplete (WARN for review)

2. **Governance Reporting**: Generate deployment readiness assessment
   - Evaluate results through `evaluate_deployment_readiness()` function
   - Include SKIP analysis and critical capability coverage
   - Provide explicit deployment recommendation with reasoning
Apply the exact validation patterns throughout:

1. **qa-splitter.sh**: Change `file_count -lt` to `file_count -ne`
2. **run-all-qa-tests.sh**: Change `ACTUAL_QA_SCRIPTS -lt` to `ACTUAL_QA_SCRIPTS -ne`
3. **qa-cors-preflight.sh**: Implement graceful origin fallback without contradictions

### Step 3: QA-Specific Features
Implement QA testing capabilities:

1. **Test result aggregation**: Collect pass/fail status from all scripts
2. **Mutation safety guards**: Prevent destructive operations in production
3. **Environment detection**: Adapt tests based on deployment environment
4. **Dependency verification**: Check required testing tools and services

## FILE OUTPUT MANIFEST

```json
{
  "qaScriptsReference": "docs/qa-scripts-reference.md",
  "qaSplitter": "docs/qa-splitter.sh",
  "qaResults": "docs/qa-test-results.json",
  "deploymentReadiness": "docs/deployment-readiness.json"
}
```

**Verification Command:**
```bash
# Validate Agent 7 output with comprehensive governance framework compliance
python3 -c "
import json
import os
import re

# Check all files exist
files = ['docs/qa-scripts-reference.md', 'docs/qa-splitter.sh', 'docs/qa-test-results.json', 'docs/deployment-readiness.json']
for file in files:
    if not os.path.exists(file):
        print(f'[FAIL] Missing file: {file}')
        exit(1)

# Check exact script count in reference
with open('docs/qa-scripts-reference.md', 'r') as f:
    content = f.read()
    file_blocks = len(re.findall(r'^#===== FILE:', content, re.MULTILINE))
    if file_blocks != 12:
        print(f'[FAIL] Expected exactly 12 FILE blocks, found {file_blocks}')
        exit(1)

# Agent 7 Invariants Validation (Framework Audit Checklist)
invariant_patterns = [
    # Interface Discovery Invariants
    (r'Schema Discovery Phase|Schema Interface Discovery', 'Schema structures discovered, never assumed'),
    (r'DATA_MODEL_AVAILABLE.*TENANT_TESTS_AVAILABLE', 'Interface availability validated before use'),
    (r'evaluate.*discovered.*schema', 'Both Agent 3 and Agent 4 treated as explicit interfaces'),
    
    # Prevention-First Invariants  
    (r'validate_with_signal.*SKIP.*selector matched 0', 'Zero-Match = Signal rule enforced'),
    (r'CONTRACT_VIOLATION.*MISSING_CONCEPT', 'Contract violations escalated above missing concepts'),
    
    # Governance Policy Invariants
    (r'evaluate_deployment_readiness.*QA_OVERRIDE_WARNINGS', 'Deployment gates explicit'),
    (r'validate_critical_capability_coverage.*30%', 'SKIP thresholds enforced'),
    (r'validate_cross_interface_consistency.*contract.*violations', 'Cross-agent consistency validated'),
    
    # Semantic Capability Invariants
    (r'_capability.*isolation_mechanisms.*Multiple mechanisms', 'Behaviors tested, not boolean fields'),
    (r'mechanisms.*0.*FAIL.*mechanisms.*1.*WARN', 'Capability degradation detected'),
]

missing_invariants = []
for pattern, description in invariant_patterns:
    if not re.search(pattern, content, re.IGNORECASE):
        missing_invariants.append(description)

if missing_invariants:
    print(f'[FAIL] Agent 7 Invariants violated: {len(missing_invariants)} invariants missing')
    for invariant in missing_invariants:
        print(f'  - {invariant}')
    exit(1)

# Governance Policy Compliance Validation
governance_patterns = [
    r'evaluate_deployment_readiness.*environment.*production',  # Deployment gate policy
    r'validate_cross_interface_consistency.*CONTRACT_VIOLATION',  # Cross-interface consistency
    r'validate_critical_capability_coverage.*critical.*SKIP',   # Critical capability coverage
    r'classify_test_result.*CONTRACT_VIOLATION.*MISSING_CONCEPT',  # Result classification
]

missing_governance = []
for pattern in governance_patterns:
    if not re.search(pattern, content):
        missing_governance.append(pattern)

if missing_governance:
    print(f'[FAIL] Governance Policy compliance failed: {len(missing_governance)} policies missing')
    exit(1)

# Framework Regression Detection (Dangerous Patterns)
dangerous_patterns = [
    (r'\.entities\[', 'Hardcoded schema assumption: entities[] instead of discovered collection'),
    (r'tenantLevel.*==.*true', 'Boolean field testing instead of semantic capability testing'),
    (r'soft_delete.*==.*true', 'Boolean field testing instead of semantic capability testing'),  
    (r'echo.*PASS.*\$[A-Z_]*COUNT.*0', 'PASS message from potentially zero count (false confidence)'),
    (r'deployment.*ready.*true.*SKIP.*[5-9][0-9]', 'Ready despite high SKIP rate (false confidence)'),
    (r'jq.*length.*no.*validation', 'jq query without zero-match validation (silent failure)'),
]

regressions = []
for pattern, description in dangerous_patterns:
    if re.search(pattern, content):
        regressions.append(description)

if regressions:
    print(f'[FAIL] Framework regression detected: {len(regressions)} dangerous patterns found')
    for regression in regressions:
        print(f'  - {regression}')
    exit(1)

# Check for exact count validation in splitter
with open('docs/qa-splitter.sh', 'r') as f:
    splitter = f.read()
    if 'file_count -lt' in splitter:
        print('[FAIL] qa-splitter uses loose validation (-lt) instead of exact (-ne)')
        exit(1)
    if 'file_count -ne' not in splitter:
        print('[FAIL] qa-splitter missing exact count validation')
        exit(1)

# Production Readiness Assessment
print('[PASS] Agent 7 Invariants: All framework invariants validated')
print('[PASS] Governance Policies: Deployment gates, consistency validation, and coverage thresholds enforced') 
print('[PASS] Regression Prevention: No dangerous patterns or framework violations detected')
print('[PASS] Schema Interface Design: Complete discoverable interface framework implemented')
print('[READY] Agent 7 v74.1: Production-stable with mechanical enforcement bulletproofing')
"
```

## VERSION HISTORY

| Version | Changes | Type |
|---------|---------|------|
| v74 | Mechanical Enforcement Bulletproofing (Final Hardening): Closed last governance bypass mechanisms to achieve truly unbreakable framework. Addresses Issues #1 and #3 from production audit - mechanical enforcement of core patterns prevents regression. (1) validate_with_signal() Mechanical Enforcement: All jq cardinality checks MUST use validate_with_signal() - raw "jq | length" patterns detected and blocked by validation gates to prevent silent failure reintroduction. (2) Critical Capability Metadata Robustness: Replaced brittle text matching CRITICAL_PATTERNS with robust script metadata "# CRITICAL_CAPABILITY=auth" headers - prevents false positives/negatives from renamed headings. (3) Governance Bypass Detection: Enhanced validation gates detect and block patterns that could circumvent core governance rules (raw jq usage, text matching, PASS from zero counts). (4) Mechanical Enforcement Invariants: Added to invariant checklist - validate_with_signal mandatory, metadata required for critical capabilities, governance bypass detection enforced. Framework now mechanically bulletproof against accidental or intentional policy violations. | Final |
| v73 | Governance Framework (Production-Stable): Comprehensive governance policies addressing framework sharp edges identified in audit. Agent 7 now production-bulletproof through explicit policy enforcement. (1) Design Intent documentation: Framework philosophy and non-negotiable principles explicitly stated - correctness over convenience, silence as risk, assumptions forbidden, prevention-first QA. (2) Agent 7 Invariants Checklist: Framework audit protection with invariant validation for interface discovery, prevention-first behavior, governance policies, and semantic capabilities. (3) Deployment Gate Policy: Explicit blocking rules - FAIL always blocks, WARN blocks production unless overridden, SKIP thresholds enforced (>50% overall, >30% critical). (4) Cross-Interface Consistency Validation: CONTRACT_VIOLATION severity classification for cross-agent inconsistencies (data model vs service contracts vs middleware alignment). (5) Critical Capability Coverage: Security-critical test coverage monitoring with deployment blocking for insufficient auth/tenant/security validation. (6) Result Classification Framework: Distinguish CONTRACT_VIOLATION vs MISSING_CONCEPT vs CAPABILITY_DEGRADED for consistent interpretation. Addresses all four framework sharp edges from governance audit. | Framework |
| v72 | Schema Interface Design Framework (Framework Redesign): Fixed fundamental design flaw where Agent 7 treated Agent 3 as assumed document vs Agent 4 as discoverable interface. (1) Two-Phase Architecture: MANDATORY Schema Discovery Phase discovers actual field names before generating validation logic, followed by Interface-Aware QA Generation that adapts to discovered schema. (2) Zero-Match Signal Enforcement: All jq selectors MUST either match elements or explicitly log [SKIP] reason - silent empty results forbidden to prevent false confidence. (3) Semantic Capability Testing: Test behaviors ("Is tenant isolation implemented?") not boolean fields ("tenantLevel == true") through multi-mechanism validation (data model + service contracts + middleware). (4) Interface Symmetry: Agent 3 now treated with same authoritative explicitness as Agent 4 - both require discovery and validation, not assumptions. (5) Schema Compatibility Guard: MANDATORY warnings when schema concepts cannot be discovered, preventing silent test skips. | Framework |
| v71 | Schema Introspection Framework (Application-Agnostic): Fixed critical framework defect preventing true application-agnosticism. (1) Schema discovery framework: MANDATORY Python-based introspection of actual Agent 3 data-relationships.json to discover field names (tables vs entities, tenantKey vs tenantLevel, softDeleteColumn vs soft_delete, cascadeSemantics vs cascadeDelete) instead of hardcoding assumptions. (2) Adaptive validation patterns: QA scripts MUST discover schema structure and adapt validation logic to actual field names, gracefully skipping validations when fields don't exist. (3) Hardcoded assumption elimination: Added validation gates to detect and prevent hardcoded schema patterns that break with different SaaS applications. (4) Prevention-first schema awareness: Agent 7 now reads actual Agent outputs rather than assuming field names, ensuring generated QA scripts work with ANY schema structure. | Major |
| v70 | Internal Consistency and Artifact Alignment Fixes (Production Quality): Fixed framework-level inconsistencies causing drift and false confidence. (1) Output artifact manifest alignment: Expanded Output Artifacts section to include all 4 declared artifacts (qa-test-results.json, deployment-readiness.json) with proper templates and schemas for consistency with FILE OUTPUT MANIFEST. (2) Verification command messaging fix: Corrected contradictory messaging from "apply fixes before production" to "validate compliance" to reflect that fixes are already implemented in framework. (3) Complete artifact documentation: All 4 outputs now properly documented with structure, purpose, and validation requirements. | Major |
| v69 | ASCII Compliance and Validation Pattern Fixes (Production Quality): Fixed framework governance violations and ineffective validation. (1) ASCII-only character compliance: Replaced all emoji markers with ASCII equivalents [FAIL], [PASS], [WARN], [NOTE] to comply with framework working standards. (2) CORS contradiction detection fix: Corrected Python verification command to use proper regex matching re.search() instead of literal string matching for pattern detection. (3) Complete Unicode removal: Eliminated all non-ASCII characters to ensure framework consistency and compliance. | Major |
| v68 | Exact Count Validation and CORS Logic Fixes (Production Quality): Fixed critical validation bugs preventing proper QA execution. (1) Exact count validation enforcement: MANDATORY -ne comparison instead of -lt in qa-splitter.sh and run-all-qa-tests.sh to prevent silent script overcounts. (2) CORS origin handling correction: MANDATORY graceful fallback pattern without contradictory fail-then-override logic. (3) Comprehensive QA validation gates: Added script count, CORS logic, and reference file validation checks. (4) QA-specific implementation patterns: Test result aggregation, mutation safety, environment detection capabilities. | Major |
