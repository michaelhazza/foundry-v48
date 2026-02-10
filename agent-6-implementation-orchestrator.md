# Agent 6: Implementation Orchestrator

## Version Reference
- **This Document**: agent-6-implementation-orchestrator.md v97
- **Linked Documents**: agent-0-constitution.md, agent-1-product-definition.md, agent-2-system-architecture.md, agent-3-data-modeling.md, agent-4-api-contract.md, agent-5-ui-specification.md

## Purpose

**Orchestrator of prevention-first quality gates.** Generate comprehensive validation scripts that enforce Agent 0-5 specification compliance throughout the build pipeline, preventing specification-implementation drift.

## Core Functions

### 1. Gate Script Generation
- **Comprehensive validation suite**: 33 scripts covering all specification dimensions
- **Prevention-first enforcement**: Block implementation when specifications incomplete/inconsistent  
- **Fail-fast feedback loops**: Immediate detection of contract violations
- **Cross-agent verification**: Validate alignment between all agent outputs

### 2. Build Pipeline Integration
- **Pre-implementation gates**: Run before code generation begins
- **Continuous validation**: Check compliance at every build step
- **Deployment readiness**: Final verification before production release
- **Audit trail generation**: Complete build transcript with timestamps and results

## Critical Framework Rules

### Heredoc Variable Expansion (CRITICAL FIX)
**MANDATORY PATTERN**: Unquoted heredoc delimiters for variable expansion
```bash
# CORRECT - Variables expand
cat > "$TRANSCRIPT_FILE" << EOF
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Status: $BUILD_STATUS
EOF

# INCORRECT - Variables stay literal  
cat > "$TRANSCRIPT_FILE" << 'EOF'
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  # This won't expand!
Status: $BUILD_STATUS                        # This won't expand!
EOF
```

**BLOCKING VIOLATION**: Any heredoc with variables MUST use unquoted delimiter.

### Exact Script Count Validation (CRITICAL FIX)
**MANDATORY PATTERN**: Exact count validation, not minimum threshold
```bash
# CORRECT - Exactly 33 scripts required
EXPECTED_SCRIPTS=33
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

**BLOCKING VIOLATION**: Script count validation must enforce exact equality.

## Agent Input Dependencies

### Agent 1: Product Definition (scope-manifest.json)
- Entity hierarchy for data validation gates
- Feature scope boundaries for requirement verification
- User story completeness checks

### Agent 2: System Architecture (architecture-blueprint.json)  
- Technology stack validation gates
- Infrastructure readiness checks
- Deployment pipeline verification

### Agent 3: Data Modeling (data-relationships.json)
- Schema integrity validation gates
- Database migration verification
- Data consistency checks

### Agent 4: API Contract (service-contracts.json)
- Endpoint implementation verification gates
- Authentication/authorization validation
- API documentation currency checks

### Agent 5: UI Specification (ui-api-deps.json)
- Component implementation validation gates
- API integration verification
- User experience completeness checks

## Output Artifacts

### 1. Gate Scripts Reference (`docs/gate-scripts-reference.md`)
**Splittable master file** containing all 33 validation scripts as extractable FILE blocks.

**Structure:**
```markdown
# Gate Scripts Reference
Total Scripts: 33
[metadata and overview]

#===== FILE: scripts/run-all-gates.sh =====#
#!/bin/bash
[main orchestrator script - MUST use unquoted heredocs]
#===== END FILE =====#

#===== FILE: scripts/verify-agent-1-compliance.sh =====#
#!/bin/bash
[Agent 1 validation script]
#===== END FILE =====#

[... remaining 31 scripts ...]
```

### 2. Gate Splitter (`docs/gate-splitter.sh`)
**Extraction utility** that converts the reference file into individual executable scripts.

**Key Features:**
- **Exact count validation**: `if [[ $file_count -ne $EXPECTED_SCRIPTS ]]`
- **Duplicate detection**: Fail on FILE block duplicates
- **Post-split verification**: Check shebang, syntax, executability
- **Strict mode**: `set -euo pipefail` for fail-fast execution

### 3. Build Transcript Template (`docs/build-transcript.md`)
**Execution log placeholder** populated by `run-all-gates.sh` during builds.

```markdown
# Build Transcript

Generated: [Populated by run-all-gates.sh]

## Gate Results

[Populated by run-all-gates.sh during build execution]
```

### 4. Results Schema Template (`docs/build-gate-results.json`)
**Structured results format** written by gate execution with build status and metrics.

```json
{
  "$schema": "build-gate-results-v1",
  "timestamp": "",
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "blocking": 0,
    "warnings": 0,
    "informational": 0
  },
  "conclusion": {
    "buildStatus": "",
    "deployable": false
  }
}
```

## Gate Categories

### Phase 0: Preflight (3 scripts)
- **verify-dependencies.sh**: Check all linked agent outputs exist
- **verify-file-structure.sh**: Validate expected project structure  
- **verify-environment.sh**: Check required tools and permissions

### Phase 1: Specification Integrity (10 scripts)
- **verify-agent-1-compliance.sh**: Product definition completeness
- **verify-agent-2-compliance.sh**: Architecture specification validity
- **verify-agent-3-compliance.sh**: Data model integrity
- **verify-agent-4-compliance.sh**: API contract completeness  
- **verify-agent-5-compliance.sh**: UI specification validity
- **verify-cross-agent-alignment.sh**: Inter-agent consistency
- **verify-constitution-compliance.sh**: Framework rule adherence
- **verify-version-hygiene.sh**: Version reference standards
- **verify-schema-validity.sh**: JSON schema compliance
- **verify-documentation-currency.sh**: Documentation completeness

### Phase 2: Implementation Readiness (10 scripts)
- **verify-api-implementation-readiness.sh**: Backend endpoints ready
- **verify-ui-implementation-readiness.sh**: Frontend components ready
- **verify-data-migration-readiness.sh**: Database changes ready
- **verify-authentication-implementation.sh**: Security implementation ready
- **verify-deployment-readiness.sh**: Infrastructure ready
- **verify-testing-coverage.sh**: Test plans complete
- **verify-monitoring-setup.sh**: Observability ready
- **verify-security-compliance.sh**: Security requirements met
- **verify-performance-requirements.sh**: Performance criteria defined
- **verify-accessibility-compliance.sh**: Accessibility requirements met

### Phase 3: Integration Verification (10 scripts)
- **verify-api-ui-integration.sh**: Frontend-backend alignment
- **verify-database-integration.sh**: Data layer integration
- **verify-authentication-integration.sh**: Security integration
- **verify-third-party-integration.sh**: External service integration
- **verify-error-handling-integration.sh**: Error handling completeness
- **verify-logging-integration.sh**: Audit trail completeness
- **verify-configuration-integration.sh**: Environment configuration
- **verify-performance-integration.sh**: Performance monitoring
- **verify-backup-recovery-integration.sh**: Data protection
- **verify-deployment-integration.sh**: CI/CD pipeline validation

## Validation Gates

### Script Content Validation
```bash
# Verify each script has proper structure
for script in scripts/*.sh; do
  # Check shebang
  if [[ "$(head -1 "$script")" != "#!/bin/bash" ]]; then
    echo "[❌] $script: Missing bash shebang"
    exit 1
  fi
  
  # Check syntax
  if ! bash -n "$script"; then
    echo "[❌] $script: Syntax error"
    exit 1
  fi
  
  # Check executability
  if [[ ! -x "$script" ]]; then
    echo "[❌] $script: Not executable"
    exit 1
  fi
done
```

### Reference File Validation
```bash
# Verify gate-scripts-reference.md structure
script_count=$(grep -c "^#===== FILE:" docs/gate-scripts-reference.md)
if [[ $script_count -ne 33 ]]; then
  echo "[❌] Expected exactly 33 FILE blocks, found $script_count"
  exit 1
fi

# Check declared total matches actual
declared_total=$(grep "^Total Scripts:" docs/gate-scripts-reference.md | cut -d: -f2 | tr -d ' ')
if [[ "$declared_total" != "33" ]]; then
  echo "[❌] Declared total ($declared_total) doesn't match expected (33)"
  exit 1
fi
```

### Splitter Validation
```bash
# Verify gate-splitter.sh uses exact count validation
if ! grep -q "file_count -ne \$EXPECTED_SCRIPTS" docs/gate-splitter.sh; then
  echo "[❌] gate-splitter.sh must use exact count validation (-ne)"
  exit 1
fi

# Verify no loose validation patterns
if grep -q "file_count -lt \$EXPECTED_SCRIPTS" docs/gate-splitter.sh; then
  echo "[❌] gate-splitter.sh uses loose validation (-lt) - must use exact (-ne)"
  exit 1
fi
```

## Implementation Instructions

### Step 1: Generate Gate Scripts Reference
Create the master file containing all 33 scripts as FILE blocks:

1. **Header with metadata**
   - Total script count declaration
   - Purpose and usage instructions
   - Extraction command examples

2. **Script generation**
   - Use Agent 1-5 outputs to generate specific validation logic
   - Implement prevention-first validation patterns
   - Ensure each script is self-contained and executable

3. **Critical pattern compliance**
   - **MANDATORY**: Unquoted heredocs for variable expansion
   - **MANDATORY**: Exact script count validation in splitter
   - **MANDATORY**: Fail-fast error handling throughout

### Step 2: Generate Supporting Files
Create the three supporting artifacts:

1. **gate-splitter.sh**: Extraction utility with exact count validation
2. **build-transcript.md**: Placeholder for execution logs
3. **build-gate-results.json**: Template for structured results

### Step 3: Cross-Validation
Verify all artifacts work together:

1. **Splitter extraction test**: Run gate-splitter.sh and verify 33 scripts created
2. **Script execution test**: Run sample scripts to verify functionality  
3. **Result generation test**: Verify transcript and results populate correctly

## FILE OUTPUT MANIFEST

```json
{
  "gateScriptsReference": "docs/gate-scripts-reference.md",
  "gateSplitter": "docs/gate-splitter.sh", 
  "buildTranscript": "docs/build-transcript.md",
  "buildResults": "docs/build-gate-results.json"
}
```

**Verification Command:**
```bash
# Validate Agent 6 output
python3 -c "
import json
import os
import re

# Check all files exist
files = ['docs/gate-scripts-reference.md', 'docs/gate-splitter.sh', 'docs/build-transcript.md', 'docs/build-gate-results.json']
for file in files:
    if not os.path.exists(file):
        print(f'[❌] Missing file: {file}')
        exit(1)

# Check script count in reference
with open('docs/gate-scripts-reference.md', 'r') as f:
    content = f.read()
    file_blocks = len(re.findall(r'^#===== FILE:', content, re.MULTILINE))
    declared = re.search(r'Total Scripts: (\d+)', content)
    if not declared or int(declared.group(1)) != 33:
        print('[❌] Incorrect declared script count')
        exit(1)
    if file_blocks != 33:
        print(f'[❌] Expected 33 FILE blocks, found {file_blocks}')
        exit(1)

# Check for heredoc quoting bugs
if \"<< 'EOF'\" in content:
    print('[❌] Found quoted heredoc delimiter - variables will not expand')
    exit(1)

# Check splitter exact validation
with open('docs/gate-splitter.sh', 'r') as f:
    splitter = f.read()
    if 'file_count -lt' in splitter:
        print('[❌] gate-splitter uses loose validation (-lt) instead of exact (-ne)')
        exit(1)
    if 'file_count -ne' not in splitter:
        print('[❌] gate-splitter missing exact count validation')
        exit(1)

print('[✅] Agent 6: All validation checks PASS')
"
```

## VERSION HISTORY

| Version | Changes | Type |
|---------|---------|------|
| v97 | Heredoc Variable Expansion and Exact Validation Fixes (Production Quality): Fixed critical bugs preventing correct gate execution. (1) Heredoc pattern enforcement: MANDATORY unquoted delimiters for variable expansion to prevent literal timestamp bugs. (2) Exact script count validation: MANDATORY -ne comparison instead of -lt to prevent silent overcounts in gate-splitter.sh. (3) Comprehensive validation gates: Added script content, reference file, and splitter validation checks. (4) Implementation instruction clarity: Step-by-step generation process with critical pattern compliance requirements. | Major |
