# Master Build Prompt

## Version Reference
- **This Document**: master-build-prompt.md v47
- **Linked Documents**:
  - agent-0-constitution.md
  - agent-6-implementation-orchestrator.md
  - agent-8-code-review.md

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 47 | 2026-02 | **Agent 6 Pattern Validation (BLOCKING):** Added AGENT 6 PATTERN COMPLIANCE section to validate critical v97 fixes in Step 0. (1) Heredoc variable expansion validation: Detects quoted heredoc delimiters when variables present (prevents literal timestamp bugs in build-transcript.md). (2) Exact script count validation: Ensures gate-splitter.sh uses `-ne` equality check, not `-lt` threshold (prevents silent overcounts). (3) Clarified artifact count description for readability (line 714). Without these validations, Agent 6 outputs can pass gate-splitter.sh extraction but produce broken scripts with non-expanding variables and incorrect file counts. Aligns MBP validation with Agent 6 v97 production quality requirements. |
| 46 | 2026-02 | **Exit Code Compliance Enforcement (CRITICAL):** Added GATE EXIT CODE ENFORCEMENT section requiring Agent 6-generated gates to implement the v45 exit code scheme (0/1/2/3). Added validation script (validate-gate-exit-codes.sh) to check exit code compliance before gate execution. Added MANDATORY requirement that gates using `exit` without explicit code are violations. Added integration point in Phase 2 to validate gates before execution. Prevents exit code mismatch where Agent 6 v116 only uses exit 0/1, defeating smart failure handling introduced in v45. Without exit 2/3, all failures treated as BLOCKING (build stops at 51%). With exit codes: only critical failures block, warnings continue (85-90% pass rate). Addresses external audit BLOCKING feedback identifying disconnect between MBP v45 expectations and Agent 6 v116 implementation. |
| 45 | 2026-02 | **Intelligent Gate Failure Handling (Production Build Resilience):** Added smart failure classification to distinguish between code errors vs framework issues. (1) Added GATE FAILURE CLASSIFICATION section with 3 severity levels: BLOCKING (code/security/data issues), WARNING (spec format mismatches, gate bugs), INFORMATIONAL (optimization suggestions). (2) Added Gate Exit Code Convention: exit 0 (pass), exit 1 (blocking), exit 2 (warning), exit 3 (informational). (3) Updated Phase 3 Gate Execution logic: continue with warnings if no blocking failures, stop only on blocking failures. (4) Added categorized failure reporting in build-gate-results.json. (5) Updated gate failure criteria to distinguish "ANY gate fails" (v44) from "ANY BLOCKING failure" (v45). Addresses Issue #16 from Foundry v47 build: 112 gate failures blocked build despite functional code because ~40 failures were spec/gate bugs not code issues. Enables builds to proceed with framework warnings while still blocking on real code problems. |
| 44 | 2026-02 | **Agent 6 Alignment (Script Count Update):** Updated all script count references to match Agent 6 v115. Total scripts: 28 → 33 (1 orchestrator + 32 verification). Updated: Step 0 verification count, gate extraction expectations, and all related count references. Aligned with Agent 6's evolution through v115 that added 5 additional verification gates. |
| 43 | 2026-02 | Structural repair: (1) Moved orphaned v40-42 changelog entries into VERSION HISTORY table. (2) Replaced all mojibake box-drawing characters with ASCII across repo structure diagrams. (3) Updated 02-ARCHITECTURE.md annotation from "optional" to "mandatory" to match v42 promotion directive and IMPLEMENTATION DIRECTIVES section. |
| 42 | 2026-02 | Added IMPLEMENTATION DIRECTIVES section -- mandatory patterns Claude Code must follow (dual-driver, schema imports, middleware stack, error handling, dependency versions). Promoted 02-ARCHITECTURE.md from optional to mandatory pre-implementation read. Updated script counts to 28 (was 26). |
| 41 | 2026-02 | Added Dependency Security Audit section. Includes security audit expectations for dependency installation phase, version conflict resolution procedures, and deployment notes documentation requirements. Ensures secure dependency installation before code generation begins. |
| 40 | 2026-02 | Added File Operation Patterns section. Includes patterns for creating new files (scaffolding phase) vs modifying existing files (enhancement phase), verification procedures, and error recovery protocols. Eliminates read-before-write errors during code generation. |
| 39 | 2026-02 | Pre-build review fixes: Added Agent 7 QA outputs (qa-scripts-reference.md, qa-splitter.sh) to after-build repo structure diagram. Expanded QA phase descriptions in both build flows to show splitter step (parity with Step 0 gate extraction). Corrected scripts/ annotations to show QA scripts as extracted by qa-splitter.sh. |
| 38 | 2026-02 | Added STEP 0: EXTRACT GATE SCRIPTS phase. Claude Code runs gate-splitter.sh before implementation to extract scripts from gate-scripts-reference.md. Updated repo structure diagrams and artifact counts to reflect consolidated approach. |
| 37 | 2026-02 | Added POST-BUILD FILE ORGANISATION phase. After successful build, moves 11 prompt files to `prompts/` folder. |
| 36 | 2026-02 | Governance reform: Adopted standard Linked Documents format per Constitution v7.0 Section Y. |
| 35 | 2026-02 | Converted to runtime-resolved dependencies. Removed all agent version pins. |

---

## EXPECTED REPO STRUCTURE

This prompt lives at the **repo root**. Claude Code reads it from there.

**Before build starts (committed by user after running Agents 1-6 as GPTs):**

```
/
|-- master-build-prompt.md          <- THIS FILE (Claude Code entry point)
|-- agent-0-constitution.md         <- Framework governance
|-- agent-1-product-definition.md   <- Agent 1 prompt
|-- agent-2-system-architecture.md  <- Agent 2 prompt
|-- agent-3-data-modeling.md        <- Agent 3 prompt
|-- agent-4-api-contract.md         <- Agent 4 prompt
|-- agent-5-ui-specification.md     <- Agent 5 prompt
|-- agent-6-implementation-orchestrator.md <- Agent 6 prompt
|-- agent-7-qa-deployment.md        <- Agent 7 prompt
|-- agent-8-code-review.md          <- Agent 8 prompt
|-- replit-environment-setup.md     <- Post-deployment prompt (used in Replit)
\-- docs/
    |-- 02-ARCHITECTURE.md          <- Agent 2 (mandatory, implementation patterns and ADRs)
    |-- scope-manifest.json         <- Agent 1
    |-- env-manifest.json           <- Agent 2
    |-- data-relationships.json     <- Agent 3
    |-- service-contracts.json      <- Agent 4
    |-- ui-api-deps.json            <- Agent 5
    |-- gate-scripts-reference.md   <- Agent 6 (contains ALL scripts)
    |-- gate-splitter.sh            <- Agent 6 (extraction utility)
    |-- build-gate-results.json     <- Agent 6 (template)
    \-- build-transcript.md         <- Agent 6 (template)
```

**After Step 0 (gate-splitter.sh extracts scripts):**

```
/
|-- (all files above, unchanged)
\-- scripts/
    |-- run-all-gates.sh            <- Extracted from gate-scripts-reference.md
    \-- verify-*.sh (32 files)      <- Extracted from gate-scripts-reference.md
```

**After build completes (generated by Claude Code):**

```
/
|-- prompts/                        <- Prompt files moved here after successful build
|   |-- agent-0-constitution.md
|   |-- agent-1-product-definition.md
|   |-- agent-2-system-architecture.md
|   |-- agent-3-data-modeling.md
|   |-- agent-4-api-contract.md
|   |-- agent-5-ui-specification.md
|   |-- agent-6-implementation-orchestrator.md
|   |-- agent-7-qa-deployment.md
|   |-- agent-8-code-review.md
|   |-- master-build-prompt.md
|   \-- replit-environment-setup.md
|-- docs/
|   |-- (all spec files above, unchanged)
|   |-- build-gate-results.json     <- Populated with actual results
|   |-- build-transcript.md         <- Populated with actual results
|   |-- qa-scripts-reference.md     <- Agent 7 (QA scripts source)
|   |-- qa-splitter.sh              <- Agent 7 (QA extraction utility)
|   |-- health-check-spec.json      <- Agent 7 (optional)
|   \-- 08-CODE-REVIEW.md           <- Agent 8 (if invoked)
|-- scripts/
|   |-- run-all-gates.sh            <- Extracted by gate-splitter.sh
|   |-- verify-*.sh (32 files)      <- Extracted by gate-splitter.sh
|   |-- run-all-qa-tests.sh         <- Extracted by qa-splitter.sh
|   \-- qa-*.sh                     <- Extracted by qa-splitter.sh
|-- server/                         <- Claude Code (generated application code)
|-- client/                         <- Claude Code (generated application code)
|-- package.json                    <- Claude Code
\-- tsconfig.json                   <- Claude Code
```

**AUTHORITATIVE PRE-IMPLEMENTATION INPUTS (EXHAUSTIVE LIST):**

Claude Code MUST treat **only** these files as pre-implementation specification inputs:

1. `docs/scope-manifest.json` - entity scope (Agent 1)
2. `docs/env-manifest.json` - environment variables (Agent 2)
3. `docs/data-relationships.json` - data model + cascades (Agent 3)
4. `docs/service-contracts.json` - API endpoints + route mappings (Agent 4)
5. `docs/ui-api-deps.json` - UI pages + API dependencies (Agent 5)

**Mandatory implementation guidance (non-authoritative for spec but required reading):**
- `docs/02-ARCHITECTURE.md` - ADRs, config templates, and implementation patterns. Claude Code MUST read this before starting Phase 2 implementation. Contains code templates for database drivers, middleware stack, and other patterns referenced by the Implementation Directives below.

**Everything else in `docs/` is either build output or non-authoritative.** Claude Code MUST ignore any other files in `docs/` during spec loading. The forbidden artifacts gate (verify-no-forbidden-artifacts.sh) enforces that deprecated files are not present.

---

## IMPLEMENTATION DIRECTIVES (MANDATORY)

Claude Code MUST implement these patterns. Violations will be caught by gates but are cheaper to prevent than to fix. See `docs/02-ARCHITECTURE.md` and `docs/gate-scripts-reference.md` for full code templates.

1. **Database driver:** Must support both Neon (serverless) and pg (local) via runtime detection of the DATABASE_URL scheme. See `docs/02-ARCHITECTURE.md` Dual-Driver Pattern section. `pg` is required at runtime for local development and QA, not just as a devDependency.
2. **Schema imports:** No `.js` extensions in `server/db/schema/` relative imports. Breaks drizzle-kit CJS resolution. Gate: `verify-schema-imports.sh`.
3. **Middleware stack:** Every Express app MUST include, in order: (a) JSON body parser with parse error handler that returns JSON 400 (not HTML), (b) UUID parameter validation middleware for all `:id` route params, (c) route-specific middleware (auth, RBAC, project-scoping), (d) global error handler (4-param `err, req, res, next`) that returns JSON error responses. Gate: `verify-error-handlers.sh`.
4. **Route handler error patterns:** Catch blocks MUST differentiate error types via `instanceof` or `.name` checks. Never catch-all to 500 -- this swallows service-layer HTTP status codes (e.g., 404, 409 become 500). See Agent 6 Error Response Standards - Anti-Pattern 4. Gate: `verify-route-service-alignment.sh`.
5. **Service layer errors:** Use typed error classes (ValidationError, NotFoundError, ConflictError) that carry appropriate HTTP status codes. Route handlers propagate these; the global error handler is the safety net for uncaught errors only.
6. **Dependency versions:** Read `docs/02-ARCHITECTURE.md` Dependency Requirements section before installing. `@neondatabase/serverless` must be ^0.10.0 (drizzle-orm peer requirement). `pg` must be installed (not just as devDependency) for local QA.

---

## BUILD CONFIGURATION FLAGS

| Flag | Default | Purpose |
|------|---------|---------|
| `AGENT8_AUTO_RUN` | `false` | When `true`, Agent 8 runs after gates pass but BEFORE QA. Audits codebase, fixes CRITICAL/HIGH findings, re-runs gates, then QA validates post-fix code. When `false`, Agent 8 is not invoked - run manually afterwards. |

### How to Enable Agent 8 Auto-Fix

```bash
# Default: Agent 8 does NOT run
# Enabled: Agent 8 runs automatically
export AGENT8_AUTO_RUN=true
```

---

## FULLY AUTOMATED BUILD FLOW

### When AGENT8_AUTO_RUN=false (default)

```
Phase 0: Extract Gate Scripts (Step 0 - MANDATORY FIRST STEP)
  |-- Run: bash docs/gate-splitter.sh
  |-- Verify: ls scripts/*.sh | wc -l (should equal 33)
  |-- Creates scripts/run-all-gates.sh + 32 verify-*.sh scripts
  |
  v
Phase 1: Pre-Flight Validation
  |-- Validate all 5 pre-implementation JSON artifacts exist
  |
  v
Phase 2: Implementation
  |-- Code generation phase by phase
  |
  v
Phase 3: Gate Execution (Smart Failure Handling)
  |-- bash scripts/run-all-gates.sh
  |-- 99+ gates executed (structural + per-entity expansion)
  |-- Categorize failures: BLOCKING vs WARNING vs INFO
  |-- If BLOCKING failures -> fix and re-run automatically
  |-- If ONLY warnings/info -> continue with notification
  |-- Produces docs/build-gate-results.json (categorized)
  |
  v
Phase 4: Build Proof
  |-- Validate build-gate-results.json
  |-- Report: blocking/warnings/info breakdown
  |-- Update docs/build-transcript.md with actual results
  |
  v
Phase 5: QA (Agent 7)
  |-- Generate qa-scripts-reference.md + qa-splitter.sh
  |-- Run: bash docs/qa-splitter.sh (extracts QA scripts)
  |-- Execute QA suite against live application
  |
  v
Phase 6: Post-Build File Organisation
  |-- Move prompt files to prompts/ folder
  |
  v
BUILD COMPLETE
```

### When AGENT8_AUTO_RUN=true

```
Phase 0-4: (same as above)
  |
  v
Phase 5: Code Review + Auto-Fix (Agent 8)
  |-- Audit codebase -> 08-CODE-REVIEW.md
  |-- Fix all CRITICAL and HIGH findings
  |-- Re-run: bash scripts/run-all-gates.sh
  |-- Re-audit -> 08-CODE-REVIEW-POST-FIX.md
  |
  v
Phase 6: QA (Agent 7) - validates POST-FIX code
  |-- Generate qa-scripts-reference.md + qa-splitter.sh
  |-- Run: bash docs/qa-splitter.sh (extracts QA scripts)
  |-- Execute QA suite against live application
  |
  v
Phase 7: Post-Build File Organisation
  |-- Move prompt files to prompts/ folder
  |
  v
BUILD COMPLETE
```

**CRITICAL:** When auto-fix is enabled, QA MUST run AFTER Agent 8 completes all fixes.

---

## GATE FAILURE CLASSIFICATION

Gate failures are NOT created equal. The framework distinguishes between real code problems vs framework evolution issues.

### Severity Levels

**BLOCKING** - Build MUST stop (exit 1):
- Code implementation errors (missing functions, wrong logic)
- Security violations (password exposure, SQL injection)
- Data integrity issues (missing FK constraints, wrong cascade rules)
- Missing required functionality (deferred endpoints with `required:true`)
- Authentication/authorization bypasses
- Type safety violations

**WARNING** - Build CAN proceed with notification (exit 2):
- Spec format mismatches (gates check fields agents don't provide yet)
- Gate script bugs (bash syntax errors, wrong validation logic)
- Infrastructure assumptions (hardcoded localhost, missing tools)
- Cross-agent version drift (Agent 3 v44 gates vs Agent 4 v99 output)
- Non-critical structural inconsistencies

**INFORMATIONAL** - Continue silently (exit 3):
- Optimization suggestions (missing indexes on low-traffic tables)
- Style violations (inconsistent naming that doesn't break functionality)
- Documentation gaps (missing JSDoc comments)
- Performance hints (N+1 query patterns in non-critical paths)

### Gate Exit Code Convention

All verification gates MUST use these exit codes:

```bash
# Gate script pattern
if [[ $CRITICAL_ISSUE -eq 1 ]]; then
  echo "[X] BLOCKING: Critical issue found"
  exit 1  # Stops build
fi

if [[ $FORMAT_ISSUE -eq 1 ]]; then
  echo "[!] WARNING: Spec format mismatch"
  exit 2  # Continues with warning
fi

if [[ $OPTIMIZATION_HINT -eq 1 ]]; then
  echo "[i] INFO: Consider optimization"
  exit 3  # Continues silently
fi

echo "[OK] All checks passed"
exit 0
```

### Smart Failure Handling

**Phase 3: Gate Execution Logic**

```bash
# Run all gates and collect results
bash scripts/run-all-gates.sh

# Analyze build-gate-results.json
BLOCKING=$(jq '.summary.blocking // 0' docs/build-gate-results.json)
WARNINGS=$(jq '.summary.warnings // 0' docs/build-gate-results.json)
INFO=$(jq '.summary.informational // 0' docs/build-gate-results.json)

if [[ $BLOCKING -gt 0 ]]; then
  echo "[X] BUILD FAILED: $BLOCKING blocking failures"
  echo "Fix blocking issues and re-run gates"
  exit 1
fi

if [[ $WARNINGS -gt 0 ]]; then
  echo "[!] BUILD SUCCEEDED WITH WARNINGS: $WARNINGS non-blocking issues"
  echo "Review warnings - may indicate framework version drift"
  # Continue to next phase
fi

if [[ $INFO -gt 0 ]]; then
  echo "[i] $INFO optimization suggestions available"
  # Continue silently
fi

echo "[OK] All critical gates passed"
```

### Categorized Failure Reporting

`docs/build-gate-results.json` structure:

```json
{
  "summary": {
    "total": 112,
    "passed": 57,
    "blocking": 15,
    "warnings": 30,
    "informational": 10,
    "failed": 55
  },
  "blocking": [
    {
      "gate": "verify-schema-imports.sh",
      "issue": "Missing schemaFile field in users table",
      "severity": "BLOCKING",
      "reason": "Code generation will fail without schema file specification"
    }
  ],
  "warnings": [
    {
      "gate": "verify-route-service-alignment.sh",
      "issue": "serviceFile field not found",
      "severity": "WARNING",
      "reason": "Agent 4 v98 doesn't generate serviceFile (added in v99)"
    }
  ],
  "informational": [
    {
      "gate": "verify-index-optimization.sh",
      "issue": "Consider index on users.lastLoginAt",
      "severity": "INFO",
      "reason": "Query performance optimization suggestion"
    }
  ]
}
```

### Why This Matters

**Real-world example (Foundry v47):**
- 112 total gate failures
- 15 actual code bugs (BLOCKING)
- 30 spec/gate version mismatches (WARNING)
- 20 gate script bugs (WARNING)
- 10 bash syntax errors in gates (WARNING)
- 10 optimization hints (INFO)
- 27 other non-blocking issues

**Old behavior (v44):** Build stops at 51% pass rate despite functional code
**New behavior (v45):** Build continues with 15 BLOCKING fixes needed, 67 framework warnings noted

This allows rapid iteration on real code problems while framework versions align over time.

## GATE EXIT CODE ENFORCEMENT (v46 - MANDATORY)

**CRITICAL:** Agent 6-generated gate scripts MUST implement the exit code scheme defined in GATE FAILURE CLASSIFICATION above. This requirement is non-negotiable - without proper exit codes throughout all gate scripts, the smart failure handling system cannot function.

### Compliance Requirements

All verification gates (scripts/verify-*.sh) MUST follow these rules:

1. **Every gate script MUST use explicit exit codes:**
   - `exit 0` for passing checks
   - `exit 1` for BLOCKING failures only
   - `exit 2` for WARNING failures only
   - `exit 3` for INFO suggestions only

2. **Prohibited patterns:**
   - ❌ `exit` without explicit code
   - ❌ `exit $SOME_VAR` without sanitization
   - ❌ Using only exit 0/1 (missing 2/3 classifications)

3. **Every gate MUST include severity decision logic:**

```bash
# Required pattern for exit code classification
if [[ $CRITICAL_ISSUE -eq 1 ]]; then
  echo "[X] BLOCKING: Critical failure description"
  echo "    Impact: Prevents app from building/running"
  echo "    Fix: Concrete remediation steps"
  exit 1
elif [[ $SPEC_MISMATCH -eq 1 ]]; then
  echo "[!] WARNING: Spec format or version mismatch"
  echo "    Likely cause: Agent version drift"
  echo "    Fix: Regenerate specs with current agent versions"
  exit 2
elif [[ $OPTIMIZATION_HINT -eq 1 ]]; then
  echo "[i] INFO: Optimization suggestion"
  echo "    Benefit: Performance or maintainability improvement"
  exit 3
else
  echo "[OK] Check passed"
  exit 0
fi
```

### Validation Script

Create `scripts/validate-gate-exit-codes.sh` to verify compliance before gate execution:

```bash
#!/bin/bash
set -euo pipefail

echo "=== Validating Gate Exit Code Compliance ==="

VIOLATIONS=0
WARNINGS=0

for gate in scripts/verify-*.sh; do
  [ -f "$gate" ] || continue
  
  # Check for exit 1 (blocking) - should exist in most gates
  if ! grep -q "exit 1" "$gate"; then
    echo "[!] WARNING: $gate has no blocking exit (exit 1)"
    ((WARNINGS++))
  fi
  
  # Check for exit 2 (warning) - should exist in gates that check specs
  if ! grep -q "exit 2" "$gate"; then
    echo "[!] INFO: $gate has no warning exit (exit 2) - may be intentional"
  fi
  
  # Check for raw exit without code (VIOLATION)
  if grep -qE "^\s*exit\s*$" "$gate"; then
    echo "[X] VIOLATION: $gate uses 'exit' without explicit code"
    echo "    This prevents severity classification"
    echo "    Fix: Change 'exit' to 'exit 1' (or 2/3 as appropriate)"
    ((VIOLATIONS++))
  fi
  
  # Check for unsanitized exit with variable (RISKY)
  if grep -qE "exit \\\$" "$gate" && ! grep -q "# sanitized exit code" "$gate"; then
    echo "[!] WARNING: $gate may have unsanitized exit code variable"
    echo "    Risk: Variable could contain unexpected value"
    ((WARNINGS++))
  fi
done

if [[ $VIOLATIONS -gt 0 ]]; then
  echo ""
  echo "[X] BLOCKING: $VIOLATIONS gates violate exit code requirements"
  echo "    Impact: Smart failure handling will not work correctly"
  echo "    Fix: Agent 6 must regenerate gates following v45 exit code scheme"
  exit 1
fi

if [[ $WARNINGS -gt 0 ]]; then
  echo ""
  echo "[!] $WARNINGS potential issues found - review recommended"
fi

echo "[OK] All gates follow exit code conventions"
exit 0
```

### Integration with Build Pipeline

Add validation to **Phase 2** (after script extraction, before implementation):

```bash
# After gate extraction in Phase 2...

# Validate gate exit code compliance
echo "=== Validating Gate Exit Codes ==="
if [ -f "scripts/validate-gate-exit-codes.sh" ]; then
  bash scripts/validate-gate-exit-codes.sh || {
    echo "[X] Gate exit code validation failed"
    echo "    Agent 6 gates do not follow v45 exit code scheme"
    echo "    All gates must use exit 0/1/2/3 for proper severity classification"
    echo "    Fix: Update Agent 6 to v117+ and regenerate gate-scripts-reference.md"
    exit 1
  }
  echo "[OK] Gate exit codes validated"
else
  echo "[!] WARNING: validate-gate-exit-codes.sh not found"
  echo "    Skipping exit code validation (not critical but recommended)"
fi
```

### Why This Enforcement Is Critical

**Without exit code compliance, the v45 smart failure handling cannot work:**

| Issue | Without exit 2/3 | With exit 2/3 |
|-------|------------------|---------------|
| All failures treated as... | BLOCKING | BLOCKING/WARNING/INFO |
| Build stops when... | Any gate fails | Only blocking failures |
| Framework drift causes... | Hard stop | Warning (continue) |
| Gate script bugs cause... | Hard stop | Warning (continue) |
| **Result** | 51% pass rate | 85-90% pass rate |

**Real-world impact (Foundry v47):**
- 112 total failures
  - 15 code bugs (should be BLOCKING)
  - 97 spec/gate/framework issues (should be WARNING/INFO)

**Without enforcement:**
- All 112 treated as BLOCKING
- Build stops at 51% pass rate
- Cannot distinguish code issues from tooling issues

**With enforcement:**
- 15 BLOCKING, 97 WARNING/INFO
- Build continues with warnings
- Can iterate on real code while framework aligns

### Common Exit Code Anti-Patterns

Agent 6 MUST NOT generate these patterns:

```bash
# ❌ WRONG: Exit without code
if [ ! -f "$FILE" ]; then
  echo "Error: File not found"
  exit  # <-- NO CODE
fi

# ❌ WRONG: Only exit 0 and 1
exit 0  # pass
exit 1  # fail (no distinction between blocking vs warning)

# ❌ WRONG: Unsanitized variable
EXIT_CODE=$SOME_CALCULATION
exit $EXIT_CODE  # <-- Could be anything

# ✅ CORRECT: Explicit codes with severity logic
if [ ! -f "$FILE" ]; then
  echo "[X] BLOCKING: Required file missing"
  exit 1
elif [ -z "$FIELD" ]; then
  echo "[!] WARNING: Optional field missing (spec version drift)"
  exit 2
else
  echo "[OK] Check passed"
  exit 0
fi
```

---

## AGENT 6 PATTERN COMPLIANCE (v47 - BLOCKING)

**CRITICAL:** Agent 6-generated outputs MUST comply with v97 pattern requirements. These patterns prevent runtime bugs in gate execution (literal timestamps) and silent extraction failures (incorrect script counts).

### Pattern Requirements

All Agent 6 outputs (gate-scripts-reference.md, gate-splitter.sh) MUST follow these rules:

1. **Heredoc Variable Expansion (BLOCKING):**
   - Unquoted heredoc delimiters REQUIRED when variables present
   - Prevents literal `$(date)` strings in output files
   - Critical for build-transcript.md timestamp generation

```bash
# ✅ CORRECT - Variables will expand
cat > "$TRANSCRIPT_FILE" << EOF
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Status: $BUILD_STATUS
EOF

# ❌ WRONG - Variables stay literal
cat > "$TRANSCRIPT_FILE" << 'EOF'
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  # Won't expand!
Status: $BUILD_STATUS                        # Won't expand!
EOF
```

2. **Exact Script Count Validation (BLOCKING):**
   - gate-splitter.sh MUST use `-ne` equality check
   - Prevents silent overcounts in script extraction
   - Critical for detecting duplicate FILE blocks

```bash
# ✅ CORRECT - Exact count enforcement
EXPECTED_SCRIPTS=33
if [[ $file_count -ne $EXPECTED_SCRIPTS ]]; then
  echo "[X] Expected exactly $EXPECTED_SCRIPTS scripts, created $file_count"
  exit 1
fi

# ❌ WRONG - Allows more than expected
if [[ $file_count -lt $EXPECTED_SCRIPTS ]]; then
  echo "[X] Expected $EXPECTED_SCRIPTS scripts, created $file_count"
  exit 1  # Silent overcount - 40 scripts would pass!
fi
```

### Validation in Step 0

Add validation AFTER gate-splitter.sh runs but BEFORE using extracted scripts:

```bash
#!/bin/bash
set -euo pipefail

echo "=== Validating Agent 6 Pattern Compliance ==="

VIOLATIONS=0

# Check 1: Heredoc variable expansion in gate-scripts-reference.md
echo "Checking heredoc patterns..."
if grep -q "<< 'EOF'" docs/gate-scripts-reference.md; then
  echo "[X] BLOCKING: Found quoted heredoc delimiter in gate-scripts-reference.md"
  echo "    Pattern: << 'EOF' prevents variable expansion"
  echo "    Impact: Timestamps and variables will be literal strings"
  echo "    Fix: Change << 'EOF' to << EOF (unquoted) when variables present"
  ((VIOLATIONS++))
fi

# Check 2: Exact script count validation in gate-splitter.sh
echo "Checking script count validation..."
if grep -q "file_count -lt" docs/gate-splitter.sh; then
  echo "[X] BLOCKING: gate-splitter.sh uses loose validation (-lt)"
  echo "    Pattern: -lt allows overcounts (silent failure)"
  echo "    Impact: 40 scripts would pass when expecting 33"
  echo "    Fix: Change 'file_count -lt' to 'file_count -ne'"
  ((VIOLATIONS++))
fi

if ! grep -q "file_count -ne" docs/gate-splitter.sh; then
  echo "[X] BLOCKING: gate-splitter.sh missing exact count validation"
  echo "    Required pattern: if [[ \$file_count -ne \$EXPECTED_SCRIPTS ]]"
  ((VIOLATIONS++))
fi

if [[ $VIOLATIONS -gt 0 ]]; then
  echo ""
  echo "[X] BLOCKING: $VIOLATIONS Agent 6 pattern violation(s) found"
  echo "    Impact: Gate extraction or execution will produce incorrect results"
  echo "    Fix: Update Agent 6 to v97+ and regenerate gate-scripts-reference.md"
  exit 1
fi

echo "[OK] Agent 6 pattern compliance verified"
exit 0
```

### Why This Enforcement Is Critical

**Without heredoc pattern compliance:**
- build-transcript.md contains literal `$(date -u +"%Y-%m-%dT%H:%M:%SZ")` strings
- Build timestamps never populate
- Audit logs show "Generated: $(date)" instead of actual timestamps

**Without exact count validation:**
- gate-splitter.sh can create 35, 40, or 50 scripts and pass
- Duplicate FILE blocks silently accepted
- No detection of malformed gate-scripts-reference.md

**Real-world impact:**
- Agent 6 v96 generated gates with `<< 'EOF'` → all builds had literal timestamps
- Agent 6 v115 used `-lt` validation → 37-script extraction passed with no error
- Both issues required emergency patches and spec regeneration

### Integration with Step 0

Pattern validation runs IMMEDIATELY after gate-splitter.sh:

```bash
# Run gate extraction
bash docs/gate-splitter.sh || {
  echo "[X] Gate extraction failed"
  exit 1
}

# Validate Agent 6 patterns (NEW in v47)
bash scripts/validate-agent6-patterns.sh || {
  echo "[X] Agent 6 pattern validation failed"
  echo "    See validation output above for specific violations"
  exit 1
}

# Continue with script count verification...
```

---

## STEP 0: EXTRACT GATE SCRIPTS (MANDATORY FIRST STEP)

Before ANY implementation begins, Claude Code MUST extract individual scripts from the consolidated reference file.

```bash
#!/bin/bash
set -euo pipefail

echo "=== Step 0: Extract Gate Scripts ==="

# Verify gate-splitter.sh exists
if [[ ! -f "docs/gate-splitter.sh" ]]; then
  echo "[X] ERROR: docs/gate-splitter.sh not found"
  echo "This file should have been generated by Agent 6."
  exit 1
fi

# Verify gate-scripts-reference.md exists
if [[ ! -f "docs/gate-scripts-reference.md" ]]; then
  echo "[X] ERROR: docs/gate-scripts-reference.md not found"
  echo "This file should have been generated by Agent 6."
  exit 1
fi

# Run the splitter
bash docs/gate-splitter.sh

# Verify extraction
SCRIPT_COUNT=$(ls -1 scripts/*.sh 2>/dev/null | wc -l)
EXPECTED_COUNT=34

if [[ $SCRIPT_COUNT -lt $EXPECTED_COUNT ]]; then
  echo "[X] ERROR: Expected $EXPECTED_COUNT scripts, found $SCRIPT_COUNT"
  exit 1
fi

echo "[OK] Step 0 complete: $SCRIPT_COUNT scripts extracted"
```

**CRITICAL:** Do NOT proceed with implementation until Step 0 completes successfully.

---

## POST-BUILD FILE ORGANISATION

After all critical gates pass and build proof is generated, move specification prompts out of the root directory to reduce clutter.

**Trigger:** No BLOCKING failures, `docs/build-gate-results.json` exists with `summary.blocking === 0`

**Note:** Build can proceed to file organisation even with warnings/info present. Warnings indicate framework version drift that should be addressed in future updates.

**Action:** Create `prompts/` directory and move prompt files:

```bash
#!/bin/bash
set -euo pipefail

echo "=== Post-Build: Organising Prompt Files ==="

# Only run if build succeeded
if [ ! -f "docs/build-gate-results.json" ]; then
  echo "[SKIP] No build proof found - skipping file organisation"
  exit 0
fi

BLOCKING=$(jq -r '.summary.blocking // 0' docs/build-gate-results.json)
if [ "$BLOCKING" != "0" ]; then
  echo "[SKIP] Build has $BLOCKING blocking failures - skipping file organisation"
  exit 0
fi

WARNINGS=$(jq -r '.summary.warnings // 0' docs/build-gate-results.json)
if [ "$WARNINGS" != "0" ]; then
  echo "[NOTE] Build has $WARNINGS warnings (non-blocking) - proceeding with file organisation"
fi

# Create prompts directory
mkdir -p prompts

# Move agent GPTs
for agent in agent-0-constitution agent-1-product-definition agent-2-system-architecture \
             agent-3-data-modeling agent-4-api-contract agent-5-ui-specification \
             agent-6-implementation-orchestrator agent-7-qa-deployment agent-8-code-review; do
  if [ -f "${agent}.md" ]; then
    mv "${agent}.md" prompts/
    echo "[MOVED] ${agent}.md -> prompts/"
  fi
done

# Move master build prompt
if [ -f "master-build-prompt.md" ]; then
  mv master-build-prompt.md prompts/
  echo "[MOVED] master-build-prompt.md -> prompts/"
fi

# Move Replit environment setup
if [ -f "replit-environment-setup.md" ]; then
  mv replit-environment-setup.md prompts/
  echo "[MOVED] replit-environment-setup.md -> prompts/"
fi

echo "[OK] Prompt files organised into prompts/"
```

**Files Moved (11 total):**

| File | Purpose Post-Build |
|------|-------------------|
| agent-0-constitution.md | Reference only |
| agent-1-product-definition.md | Reference only |
| agent-2-system-architecture.md | Reference only |
| agent-3-data-modeling.md | Reference only |
| agent-4-api-contract.md | Reference only |
| agent-5-ui-specification.md | Reference only |
| agent-6-implementation-orchestrator.md | Reference only |
| agent-7-qa-deployment.md | May be re-run for QA |
| agent-8-code-review.md | May be re-run for audits |
| master-build-prompt.md | Reference only |
| replit-environment-setup.md | Used in Replit after GitHub import |

**Files NOT Moved:**

| Location | Reason |
|----------|--------|
| docs/*.json | Active build artifacts referenced by code |
| docs/*.md | Build documentation |
| docs/gate-splitter.sh | May be needed for re-extraction |
| scripts/*.sh | Executable verification gates |

---

## SINGLE SOURCE OF TRUTH: ARTIFACT LISTS

### Pre-Implementation Required Artifacts (5 JSON + 4 Agent 6 outputs)

MUST exist BEFORE Claude Code begins implementation:

**From Agents 1-5 (spec phase):**
1. docs/scope-manifest.json (Agent 1)
2. docs/env-manifest.json (Agent 2)
3. docs/data-relationships.json (Agent 3)
4. docs/service-contracts.json (Agent 4)
5. docs/ui-api-deps.json (Agent 5)

**From Agent 6 (spec phase):**
6. docs/gate-scripts-reference.md (Agent 6 - contains all scripts)
7. docs/gate-splitter.sh (Agent 6 - extraction utility)
8. docs/build-gate-results.json (Agent 6 - template)
9. docs/build-transcript.md (Agent 6 - template)

### Generated by Step 0 (NOT pre-existing)

- scripts/run-all-gates.sh (EXTRACTED by gate-splitter.sh)
- scripts/verify-*.sh (EXTRACTED by gate-splitter.sh)

### Total Pre-Implementation Artifacts: 9 (5 spec JSONs + 4 Agent 6 outputs)

---

## PLACEHOLDER ALLOWLIST (CANONICAL)

Check for placeholders ONLY in these 5 pre-implementation files:
- docs/scope-manifest.json
- docs/env-manifest.json
- docs/data-relationships.json
- docs/service-contracts.json
- docs/ui-api-deps.json

DO NOT check:
- docs/build-gate-results.json (template with GENERATED_AT_RUNTIME)
- docs/build-transcript.md (template with GENERATED_AT_RUNTIME)
- docs/gate-scripts-reference.md (contains script content)

---

## STOP CONDITIONS (BLOCKING)

Build MUST stop if:
1. Any of 5 pre-implementation JSON artifacts missing
2. docs/gate-scripts-reference.md missing
3. docs/gate-splitter.sh missing
4. Step 0 (script extraction) fails
5. Any forbidden artifact exists in `docs/` (verify-no-forbidden-artifacts.sh)
6. Any gate returns BLOCKING failure (exit 1) via run-all-gates.sh
7. build-gate-results.json shows summary.blocking > 0
8. JSON contains placeholders (allowlist files only)

**Build CAN proceed if:**
- Gates return WARNING (exit 2) or INFO (exit 3) only
- summary.blocking === 0 even if summary.warnings > 0
- Framework version drift detected but code is functional

---

## GATE EXECUTION (ONLY VALID METHOD)

```bash
# STEP 0 (extract scripts):
bash docs/gate-splitter.sh

# GATE EXECUTION (after implementation):
bash scripts/run-all-gates.sh

# FORBIDDEN:
bash scripts/verify-*.sh
for gate in scripts/*.sh; do bash "$gate"; done
```

---

## AGENT 8 AUTO-FIX PROTOCOL

**When `AGENT8_AUTO_RUN=true`:**

1. Agent 8 runs AFTER gates pass but BEFORE QA
2. Generates 08-CODE-REVIEW.md
3. Claude Code fixes all CRITICAL and HIGH findings
4. Re-runs gates to verify fixes
5. Generates 08-CODE-REVIEW-POST-FIX.md
6. If CRITICAL findings remain, build requires manual intervention
7. QA then validates post-fix code

**Auto-fix boundaries:**
- MUST NOT change JSON artifacts, modify schema contradictions, add unlisted endpoints, or remove gates
- MAY create missing files, fix signatures/middleware/imports, correct cascades

**When `AGENT8_AUTO_RUN=false` (default):**
Agent 8 is not invoked. Run manually for report-only audit.

---

## SCOPE BOUNDARY

This prompt governs the Claude Code build pipeline only.

**Not covered:** Replit environment setup, Git/GitHub, CI/CD, production deployment.

---

## AUTHORITATIVE FILE RULE

When version conflicts exist: attached agent file > prompt reference

---

## HYGIENE GATE

- [OK] Version Reference block present with Linked Documents (no agent version pins)
- [OK] No dependency version pins outside Version Reference and VERSION HISTORY (Section Y compliant)
- [OK] STEP 0: EXTRACT GATE SCRIPTS section added (mandatory first step)
- [OK] Repo structure updated (shows gate-scripts-reference.md, gate-splitter.sh, qa-scripts-reference.md, qa-splitter.sh)
- [OK] Authoritative inputs: explicit allowlist (not "read all docs")
- [OK] 02-ARCHITECTURE.md promoted to mandatory pre-implementation read
- [OK] IMPLEMENTATION DIRECTIVES section (6 mandatory patterns with gate references)
- [OK] 9 pre-implementation artifacts (5 spec JSONs + 4 Agent 6 outputs)
- [OK] AGENT 6 PATTERN COMPLIANCE section (validates heredoc and exact count patterns)
- [OK] Forbidden artifacts in stop conditions
- [OK] Stop conditions include Step 0 failure
- [OK] Agent 8 toggle preserved (AGENT8_AUTO_RUN, default false)
- [OK] QA runs after Agent 8 when auto-fix enabled
- [OK] QA phase shows splitter step (parity with Step 0 gate extraction)
- [OK] Placeholder allowlist: 5 files (excludes templates)
- [OK] Post-build file organisation phase preserved
- [OK] Script counts: 34 total (1 orchestrator + 33 verification)

**Status:** Production Ready
