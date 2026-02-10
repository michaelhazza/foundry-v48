# Agent 0: Agent Constitution

## Version Reference
- **This Document**: agent-0-constitution.md v7.3
- **Linked Documents**:
  - None (Agent 0 is the root authority; all other documents depend on it)

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 7.3 | 2026-02 | Added Section AN: Cross-Document Consistency for file upload functionality. Requires coordinated specifications across Agent 3 (storage entity), Agent 4 (endpoint structure), and Agent 6 (middleware). Updated Global Rule #12. |
| 7.2 | 2026-02 | Added Section AM: Semantic Consistency requirement - business rule prose must align with relationship structure declarations within same entity. Added Global Rule #11. Updated Prompt Hygiene Gate. |
| 7.1 | 2026-02 | Updated Section AK: Agent 6 now runs as GPT (not Claude Code), outputs to docs/ only. Agent 6 produces gate-scripts-reference.md (consolidated scripts) + gate-splitter.sh (extraction utility). Claude Code runs gate-splitter.sh as Step 0 to extract individual scripts. Updated repo structure diagrams. |
| 7.0 | 2026-02 | MAJOR GOVERNANCE CHANGE: Replaced version-pinned dependencies with file-linked references. Section Y rewritten: documents now list Linked Documents by filename only - no version pins, no cascade updates. Internal version numbers retained for evolution tracking. Git commits provide the version snapshot. Removed all dependency pin cascade requirements. Updated Global Rules and Prompt Hygiene Gate. |
| 6.2 | 2026-02 | Section AK: Added FILE DELIVERY REQUIREMENT - all manifest files must be prepared as downloadable files, not inline code blocks. |
| 6.1 | 2026-02 | Schema ID exception (Section Y Rule 5). Forbidden artifacts list (Section Z). Rewording: "7 required minimum" replaces "exactly 7". Spec size budget gate spec added. |
| 6.0 | 2026-02 | MAJOR RESTRUCTURE: Consolidated output artifacts from 9 to 7. New Section AL (Minimal Artifact Set). Merged route-service-contracts into service-contracts, soft-delete-cascade into data-relationships, routes-pages-manifest into ui-api-deps. Dropped mandatory markdown specs (01, 03, 04, 05). Retained 02-ARCHITECTURE.md as sole human-readable spec. Updated Sections Z, AH, AK, Global Rules. |

---

## SECTION Y: CROSS-DOCUMENT VERSIONING (FILE-LINKED REFERENCES)

**Problem (v1-v6):** Version pins in dependency blocks caused cascading maintenance burden. Every change to one agent required pin updates in every downstream agent - often 6+ documents for a single-line fix. The majority of version history entries were pure pin-bump noise, obscuring substantive changes.

**Solution (v7+):** File-linked references by name only. All framework documents coexist in the same directory (Claude Projects, Claude Code workspace, GitHub repo, Replit project). Git commits provide the "tested together" version snapshot. Internal version numbers are retained for evolution tracking and historical reference.

### Rule 1: Every Document MUST Include a Version Reference Block

Every agent document and framework document MUST include a `## Version Reference` block immediately after the document title.

**Required format:**

```markdown
## Version Reference  <!-- template -->
- **This Document**: [filename] v[X.Y]
- **Linked Documents**:
  - [linked-file-1]
  - [linked-file-2]
```

The **This Document** line carries the document's own version number for evolution tracking. The **Linked Documents** section lists files this document reads or depends on - by filename only, never with version numbers.

### Rule 2: Body Text MUST Use Document Names Only

Version numbers MUST NOT appear in body text, section references, hygiene gates, verification scripts, or downstream handoff sections.

### Rule 3: Version Numbers Live In Two Places Only

1. The **This Document** line in the Version Reference block (this document's own version)
2. The **VERSION HISTORY** section (changelog only)

Nowhere else. This includes document title lines, which must not contain version numbers. Linked Documents entries must not contain version numbers.

### Rule 4: Update Protocol

When updating a document's version:
1. Update the document's own Version Reference block (This Document line only)
2. Add a VERSION HISTORY entry describing the change
3. No other documents require updates - there are no dependency pins to cascade

### Rule 5: Schema Identifiers Are Not Document Version Pins

`$schema` values inside JSON artifacts (e.g., `"scope-manifest-v3"`, `"service-contracts-v2"`) and gate schema strings (e.g., `"build-gate-results-v1"`) are **machine protocol identifiers**, not document version references. They MAY contain version suffixes (`-v1`, `-v2`, etc.) without violating Rules 2 or 3.

These schema IDs serve a different purpose: they signal the structure a consumer should expect when parsing the file. They evolve independently of document versions and are governed by the agent that owns the artifact, not by the Version Reference block.

### Dependency Map (Canonical)

This map defines which documents each agent reads. It is the canonical source for Linked Documents entries.

| Document | Depends On |
|----------|-----------|
| Agent 0 (Constitution) | None (root authority) |
| Agent 1 (Product Definition) | Agent 0 |
| Agent 2 (System Architecture) | Agent 0 |
| Agent 3 (Data Modelling) | Agent 0, Agent 1 |
| Agent 4 (API Contract) | Agent 0, Agent 1, Agent 3 |
| Agent 5 (UI Specification) | Agent 0, Agent 1, Agent 4 |
| Agent 6 (Implementation) | Agent 0, Agent 1, Agent 2, Agent 3, Agent 4, Agent 5 |
| Agent 7 (QA & Deployment) | Agent 0, Agent 4, Agent 6 |
| Agent 8 (Code Review) | Agent 0, Agent 3, Agent 4, Agent 6 |
| Master Build Prompt | Agent 0, Agent 6, Agent 8 |
| Replit Environment Setup | Agent 0, Agent 2, Agent 4, Agent 5, Agent 6, Agent 7 |

**NOTE:** Replit Environment Setup is not part of the Claude Code build pipeline. It is a post-deployment prompt run inside Replit after code has been committed to GitHub and imported.

---

## SECTION Z: REQUIRED ARTIFACTS, FORBIDDEN ARTIFACTS & STOP CONDITIONS

### Required Artifacts (7 MINIMUM)

Every build MUST produce **at least these 7 artifacts:**

**Pre-Implementation (5 JSON):**
1. **docs/scope-manifest.json** (from Agent 1)
2. **docs/env-manifest.json** (from Agent 2)
3. **docs/data-relationships.json** (from Agent 3)
4. **docs/service-contracts.json** (from Agent 4)
5. **docs/ui-api-deps.json** (from Agent 5)

**Build Proof (2 files):**
6. **docs/build-gate-results.json** (from Agent 6 as template, populated by run-all-gates.sh)
7. **docs/build-transcript.md** (from Agent 6 as template, populated by run-all-gates.sh)

**Total required: 7 (5 JSON + 1 JSON + 1 MD)**

**Agent 6 Additional Outputs (required for build, not counted in minimum):**
- docs/gate-scripts-reference.md (contains all scripts with split markers)
- docs/gate-splitter.sh (extracts individual scripts)

**Non-Required Artifacts (permitted but not build-blocking):**
- docs/02-ARCHITECTURE.md (Agent 2 - human-readable, kept for ADRs and config templates)
- docs/health-check-spec.json (Agent 7 - optional QA artifact)
- docs/08-CODE-REVIEW.md (Agent 8 - optional audit report)
- docs/08-CODE-REVIEW-POST-FIX.md (Agent 8 - optional post-fix report)

Additional non-required artifacts are permitted only if they are NOT in the Forbidden Artifacts list below.

### Forbidden Artifacts (MUST NOT EXIST)

Build MUST fail if any of these deprecated files exist in `docs/`. Their presence indicates an incomplete migration or stale repo state, and risks inflating Claude Code's context window with redundant data.

| Forbidden File | Reason |
|----------------|--------|
| docs/01-PRODUCT-DEFINITION.md | Replaced by scope-manifest.json |
| docs/03-DATA-MODEL.md | Replaced by data-relationships.json |
| docs/04-API-CONTRACT.md | Replaced by service-contracts.json |
| docs/05-UI-SPECIFICATION.md | Replaced by ui-api-deps.json |
| docs/route-service-contracts.json | Merged into service-contracts.json |
| docs/routes-pages-manifest.json | Merged into ui-api-deps.json |
| docs/soft-delete-cascade.json | Merged into data-relationships.json |

### Stop Conditions (BLOCKING)

Build MUST stop immediately if:
1. Any of **7 required artifacts** missing
2. docs/gate-scripts-reference.md missing (Agent 6 output)
3. docs/gate-splitter.sh missing (Agent 6 output)
4. Any **forbidden artifact** exists in `docs/`
5. Any gate returns FAIL
6. build-gate-results.json shows any FAIL
7. JSON contains placeholders

---

## SECTION AH: ARTIFACT ENFORCEMENT MATRIX (7 ROWS)

| Artifact | Produced By | Validated By Gate | Failure Mode |
|----------|-------------|-------------------|--------------|
| scope-manifest.json | Agent 1 | verify-scope-invariants.sh | Build stops - no scope definition |
| env-manifest.json | Agent 2 | verify-env-manifest-schema.sh | Build stops - no env validation |
| data-relationships.json | Agent 3 | verify-data-relationships.sh | Build stops - no cascade/schema rules |
| service-contracts.json | Agent 4 | verify-service-contracts.sh | Build stops - no API spec |
| ui-api-deps.json | Agent 5 | verify-ui-api-alignment.sh | Build stops - no UI-API mapping |
| build-gate-results.json | Agent 6 (template) / run-all-gates.sh (populated) | verify-gate-results-structure.sh | Build stops - no gate proof |
| build-transcript.md | Agent 6 (template) / run-all-gates.sh (populated) | verify-build-transcript.sh | Build stops - no build log |

**All 7 required artifacts are MANDATORY. Non-required artifacts are permitted if not forbidden.**

---

## SECTION AJ: ENV VAR USAGE PROOF REQUIREMENT (SCHEMA LOCKED)

### Required env-manifest.json Schema (EXACT - 6 FIELDS)

Each env var in `required[]` MUST include ALL these fields. The variable name below is illustrative - actual variables depend on the application.

```json
{
  "required": [
    {
      "name": "DATABASE_URL",
      "usage": "PostgreSQL connection string",
      "validation": "Must start with postgresql://",
      "validatedInFile": "server/lib/env.ts",
      "usedInFiles": [
        "server/db/index.ts"
      ],
      "whyRequired": "Core database connectivity required for all operations"
    }
  ]
}
```

### Required Fields (ALL mandatory - 6 total)

1. **name** (string): Environment variable name
2. **usage** (string): What the variable is for
3. **validation** (string): Validation rules/format
4. **validatedInFile** (string): Where env var is checked at startup
5. **usedInFiles** (array): Files where var is actually used (minimum 1)
6. **whyRequired** (string): Business/compliance justification

---

## SECTION AK: FILE OUTPUT MANIFEST STANDARD

Every agent MUST include a `## FILE OUTPUT MANIFEST` section listing every file it produces.

### Required Columns

| Column | Description |
|--------|-------------|
| File | Human-readable description |
| Path | Exact path relative to repo root |
| Type | `Human-readable` or `Machine artifact` or `Verification gate` or `Build proof` or `QA script` |
| Required | `YES` or `NO` or `CONDITIONAL` |

### Execution Context Rules

**Agents 1-5 (Specification Agents - run as GPTs):**
- Output ONLY to `docs/` directory
- MUST NOT create script files
- Gate scripts defined in body text are **specifications for Agent 6 to embed** in gate-scripts-reference.md
- Any file not in the FILE OUTPUT MANIFEST MUST NOT be created
- Every file in the manifest MUST be prepared as a downloadable file and presented to the user for download - do NOT output file contents as inline code blocks in the chat

**Agent 6 (Implementation Orchestrator - run as GPT):**
- Output ONLY to `docs/` directory
- Produces gate-scripts-reference.md (contains ALL scripts with split markers)
- Produces gate-splitter.sh (utility to extract individual scripts)
- Produces build-gate-results.json (template)
- Produces build-transcript.md (template)
- MUST NOT create individual script files in `scripts/` - that is done by gate-splitter.sh

**Agents 7-8 (Build Agents - run by Claude Code):**
- Output to both `docs/` and `scripts/` directories
- Agent 7 generates QA scripts
- Agent 8 generates code review reports

**Claude Code (Build Phase):**
- Runs `bash docs/gate-splitter.sh` as Step 0 to extract scripts
- Extracts scripts from gate-scripts-reference.md to `scripts/` directory
- Generates application code in `server/` and `client/`
- Runs `bash scripts/run-all-gates.sh` to execute verification

### Repository Structure

**Before build (spec repo - committed to GitHub after running Agents 1-6 as GPTs):**
```
/
+-- master-build-prompt.md
+-- docs/
    +-- 02-ARCHITECTURE.md          <- Agent 2 (human-readable, non-mandatory)
    +-- scope-manifest.json         <- Agent 1
    +-- env-manifest.json           <- Agent 2
    +-- data-relationships.json     <- Agent 3
    +-- service-contracts.json      <- Agent 4
    +-- ui-api-deps.json            <- Agent 5
    +-- gate-scripts-reference.md   <- Agent 6 (contains ALL scripts)
    +-- gate-splitter.sh            <- Agent 6 (extraction utility)
    +-- build-gate-results.json     <- Agent 6 (template)
    +-- build-transcript.md         <- Agent 6 (template)
```

**After Step 0 (Claude Code runs gate-splitter.sh):**
```
/
+-- (all files above)
+-- scripts/
    +-- run-all-gates.sh            <- Extracted from gate-scripts-reference.md
    +-- verify-*.sh (25 files)      <- Extracted from gate-scripts-reference.md
```

**After build (Claude Code generates application code):**
```
/
+-- master-build-prompt.md
+-- docs/
|   +-- (all spec files above)
|   +-- build-gate-results.json     <- Populated with actual results
|   +-- build-transcript.md         <- Populated with actual results
|   +-- health-check-spec.json      <- Agent 7 (optional)
+-- scripts/
|   +-- run-all-gates.sh            <- Extracted by gate-splitter.sh
|   +-- verify-*.sh                 <- Extracted by gate-splitter.sh
|   +-- run-all-qa-tests.sh         <- Agent 7
|   +-- qa-*.sh                     <- Agent 7
+-- server/                         <- Claude Code (generated application code)
+-- client/                         <- Claude Code (generated application code)
```

---

## SECTION AL: MINIMAL ARTIFACT SET (NO REDUNDANT OUTPUTS)

**Problem:** Agents 1-5 previously produced both human-readable markdown AND machine-readable JSON for the same information. Additionally, multiple JSON files contained overlapping data (e.g., route-service-contracts.json was a 100% subset of service-contracts.json). This caused ~40% token waste in the Claude Code context window, leading to context overflow on moderately complex applications.

**Solution:** Each agent produces the minimum set of output files. No information duplication across artifacts.

### Rule 1: JSON Is the Primary Output

Agents 1-5 produce JSON artifacts as their primary output. These are the files Claude Code reads. Human-readable markdown is permitted only when the content does not map well to JSON (e.g., ADRs, architectural narratives, config templates).

### Rule 2: No Overlapping JSON Files

If two JSON files share overlapping data, they MUST be merged into a single file with the broader scope. The following merges are mandatory:

| Removed File | Merged Into | Rationale |
|-------------|-------------|-----------|
| route-service-contracts.json | service-contracts.json | 100% data subset - routeFile and middleware added to each endpoint |
| soft-delete-cascade.json | data-relationships.json | Cascade data is a property of the data model |
| routes-pages-manifest.json | ui-api-deps.json | Page routing is a property of the UI dependency map |

### Rule 3: No Companion Markdown for JSON Content

If an agent produces a JSON artifact, it MUST NOT also produce a markdown file restating the same information. The JSON artifact IS the specification.

**Exception:** Agent 2 produces both 02-ARCHITECTURE.md and env-manifest.json because the architecture document contains ADRs, directory structure, and configuration templates that do not map to JSON.

### Rule 4: Upstream Agents Must Not Restate Downstream Data

Each agent must avoid restating information already captured by another agent's artifact. If Agent 4 defines endpoint contracts, Agent 1 must not duplicate endpoint lists in scope-manifest.json. Scope-manifest tracks entity-level scope; service-contracts.json tracks endpoint-level scope.

### Rule 5: Consolidated Script Reference (Agent 6)

Agent 6 MUST embed all gate scripts in a single `gate-scripts-reference.md` file with split markers. This eliminates duplicate content between individual scripts and documentation. The `gate-splitter.sh` utility extracts individual scripts when Claude Code runs it as Step 0.

---

## SECTION AM: SEMANTIC CONSISTENCY (BUSINESS RULES ↔ RELATIONSHIPS)

**Problem:** entityContracts entries contain both `businessRules` (prose) and `relationships` (structural declarations). These can contradict each other if not validated together. Example: a business rule stating "reusable across projects" while a relationship declares `belongs-to projectId` (which means belongs to exactly one project).

**Solution:** Business rule semantics MUST align with relationship structure declarations within the same entity.

### Semantic Mapping Rules

When an entity's business rules describe its relationship to another entity, the relationship type declared in the same entityContracts entry MUST structurally match:

| Business Rule Language | Required Relationship Type | Example |
|---|---|---|
| "belongs to exactly one X" | `belongs-to` with field `XId` | User belongs to exactly one org → `{"entity": "organisations", "type": "belongs-to", "field": "organisationId"}` |
| "reusable across X", "shared between X" | `many-to-many` with X | Asset reusable across projects → `{"entity": "projects", "type": "many-to-many"}` |
| "has multiple X", "contains many X" | `has-many` | Organisation contains many users → `{"entity": "users", "type": "has-many"}` |
| "optionally links to X" | `belongs-to` with nullable field | Invoice optionally links to PO → `{"entity": "purchaseOrders", "type": "belongs-to", "field": "purchaseOrderId", "nullable": true}` |

### Enforcement

Agent 1's verification gate MUST include a semantic consistency check that:
1. Extracts business rule text
2. Detects relationship ownership language ("belongs to", "reusable across", "shared between", "scoped to")
3. Validates the declared relationship type matches the semantic claim

### Examples of Violations

**FAIL:**
```json
"businessRules": ["Templates are reusable across projects"],
"relationships": [
  {"entity": "projects", "type": "belongs-to", "field": "projectId"}
]
```
→ Business rule says "reusable across" but `belongs-to` makes it owned by one project.

**PASS:**
```json
"businessRules": ["Templates are reusable across projects within same organisation"],
"relationships": [
  {"entity": "organisations", "type": "belongs-to", "field": "organisationId"},
  {"entity": "projects", "type": "many-to-many"}
]
```

---

## SECTION AN: CROSS-DOCUMENT CONSISTENCY - FILE UPLOAD FUNCTIONALITY

When any agent specifies file upload functionality, all related agents must provide coordinated specifications to ensure complete implementation.

### Required Agent Coordination

**Agent 3 (Data Modelling) Must Declare**:

1. **File Storage Entity**:
   ```json
   {
     "name": "UploadedFile",
     "fields": [
       {"name": "id", "type": "uuid", "primaryKey": true},
       {"name": "filename", "type": "string"},
       {"name": "originalFilename", "type": "string"},
       {"name": "mimeType", "type": "string"},
       {"name": "size", "type": "integer"},
       {"name": "storageKey", "type": "string"},
       {"name": "uploadedBy", "type": "uuid", "foreignKey": {"table": "users", "column": "id"}},
       {"name": "uploadedAt", "type": "timestamp", "default": "now()"}
     ]
   }
   ```

2. **Relationship to Owning Entity**:
   - Foreign key or reference field linking uploaded files to their context
   - Example: Project has attachments, User has profile picture

3. **Required Indexes**:
   - Index on `uploadedBy` for user-based queries
   - Index on `uploadedAt` for time-based queries
   - Composite indexes for multi-tenant systems

---

**Agent 4 (API Contract) Must Declare**:

1. **Upload Endpoint Structure**:
   ```json
   {
     "path": "/api/[resource]/upload",
     "allowedMimeTypes": [...],  // At endpoint level
     "maxSizeMb": 10,             // At endpoint level
     "requestBody": {
       "type": "multipart/form-data"
     }
   }
   ```

2. **Property Placement**:
   - `allowedMimeTypes` at endpoint level (NOT nested)
   - `maxSizeMb` at endpoint level (NOT nested)

3. **Response Schema**:
   - Must include: `fileId`, `url`, `filename`, `size`, `mimeType`

---

**Agent 6 (Implementation Orchestrator) Must Implement**:

1. **Multer or Equivalent Middleware**:
   - Configured from Agent 4's `allowedMimeTypes` and `maxSizeMb`
   - File validation logic matching allowed types and size limits

2. **Storage Service Integration**:
   - Local filesystem, S3, or other storage backend
   - Generates storage keys, handles streams
   - Records metadata in database per Agent 3 schema

3. **Route Implementation**:
   ```typescript
   router.post('/upload',
     authenticate,
     authorize(permissions),
     uploadMiddleware,
     async (req, res) => {
       // Store file, create database record
     }
   );
   ```

---

### Consistency Verification

**Gate Scripts Must Validate**:

1. **Agent 3 ↔ Agent 4 Consistency**:
   - If Agent 4 declares upload endpoint, Agent 3 must have file storage entity
   - File storage entity schema matches Agent 4's response schema

2. **Agent 4 ↔ Agent 6 Consistency**:
   - Middleware configuration uses Agent 4's `allowedMimeTypes` and `maxSizeMb`
   - Route implementation matches Agent 4's path and authentication requirements

3. **End-to-End Upload Flow**:
   - File arrives via Agent 4's endpoint
   - Validated by Agent 6's middleware
   - Stored per Agent 3's schema
   - Response matches Agent 4's contract

---

### Common Inconsistency Patterns

**Anti-Pattern 1: Missing Storage Entity**
- ❌ Agent 4 declares `/upload` endpoint
- ❌ Agent 3 has no `UploadedFile` entity
- ✅ Fix: Add file storage entity to Agent 3

**Anti-Pattern 2: Property Nesting Mismatch**
- ❌ Agent 4 nests `allowedMimeTypes` in `serviceContract`
- ❌ Gate script expects it at endpoint level
- ✅ Fix: Move properties to endpoint level per standard

**Anti-Pattern 3: Middleware Configuration Drift**
- ❌ Agent 4 specifies `maxSizeMb: 10`
- ❌ Agent 6 implements with hardcoded `100MB` limit
- ✅ Fix: Configure middleware from Agent 4 specification

**Anti-Pattern 4: Response Schema Mismatch**
- ❌ Agent 4 promises `{fileId, url}`
- ❌ Agent 6 returns `{id, path}`
- ✅ Fix: Align Agent 6 response with Agent 4 schema

---

### Application-Agnostic Principles

These consistency rules apply regardless of:
- Upload use case (images, documents, data files)
- Storage backend (local, S3, Azure Blob)
- File size limits
- Allowed MIME types

The structural requirements remain constant; only the values change per application.

---

## GLOBAL RULE SUMMARY

**All agents MUST:**
1. Include Version Reference block with this document's version and linked document filenames (Section Y)
2. Use document names only in body text - no inline version numbers (Section Y)
3. Output **at least 7 required artifacts** across the full pipeline; no forbidden artifacts may exist (Section Z, AH)
4. Ensure JSON manifests have no placeholders (Section Z)
5. Respect scope manifest for required vs deferred entities (Section Z)
6. Declare environment variables with ALL 6 required fields (Section AJ)
7. Follow authoritative file rule when version conflicts exist
8. Respect canonical path freeze
9. Include FILE OUTPUT MANIFEST listing every file produced (Section AK)
10. Produce minimal artifact set with no redundant outputs (Section AL)
11. Ensure business rule prose aligns with relationship structure declarations within same entity (Section AM)
12. Coordinate file upload specifications across Agent 3 (storage), Agent 4 (endpoint), and Agent 6 (middleware) (Section AN)

---

## PROMPT HYGIENE GATE

- [OK] Framework: Production Final
- [OK] Version Reference block present (Section Y compliant - file-linked, no version pins)
- [OK] Schema ID exception documented (Section Y Rule 5)
- [OK] Dependency map canonical
- [OK] Required artifacts: 7 minimum, 7 listed, 7 in matrix
- [OK] Agent 6 additional outputs documented (gate-scripts-reference.md, gate-splitter.sh)
- [OK] Forbidden artifacts: 7 listed (Section Z)
- [OK] Section AK: Updated execution context (Agent 6 now GPT, outputs to docs/ only)
- [OK] Section AK: Repository structure shows Step 0 extraction
- [OK] Section AL: Rule 5 added (Consolidated Script Reference)
- [OK] Section AM: Semantic consistency rules defined (business rules ↔ relationships)
- [OK] Section AN: Cross-document consistency rules for file upload functionality
- [OK] env-manifest schema locked (6 required fields)
- [OK] No version numbers outside This Document line and VERSION HISTORY (Section Y compliant)
- [OK] Global Rules #11 and #12 added (semantic consistency, upload coordination)

**Validation Date:** 2026-02-05
**Status:** Production Ready - Locked
