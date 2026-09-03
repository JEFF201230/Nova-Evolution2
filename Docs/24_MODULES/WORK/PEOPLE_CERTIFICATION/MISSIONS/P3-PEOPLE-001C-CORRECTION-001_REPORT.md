# P3-PEOPLE-001C-CORRECTION-001 — TECHNICAL CORRECTION REPORT

## 1. Objective

This mission corrected only the two present-time P3-PEOPLE-001C blockers:

1. `resumeWorkAssignment` silently reactivated roles revoked before suspension;
2. accepted PEOPLE event `Date` payloads remained runtime-mutable.

It did not execute authority recertification, P3-PEOPLE-001H, or Planning.

## 2. Git preflight

`git status --short` was executed before any write. The initial worktree contained 63 pre-existing status entries: 26 modified and 37 untracked. In particular, `server/domain/people/people-authority.ts` already contained uncommitted suspension/resume changes. Those changes are not attributed to this mission.

Initial tracked modifications:

```text
 M Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json
 M Docs/12_CERTIFICATION/certification-registry.json
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/00_PEOPLE_PERSISTENCE_ARCHITECTURE_EXECUTIVE_DECISION.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/01_PEOPLE_CANONICAL_SOURCE_OF_TRUTH.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/02_PEOPLE_REPOSITORY_PORTS_CONTRACT.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/03_PEOPLE_DURABLE_DATA_MODEL.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/04_PEOPLE_ATOMIC_COMMIT_AND_CONCURRENCY.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/05_PEOPLE_EVENT_HISTORY_AND_REHYDRATION.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/06_PEOPLE_IDEMPOTENCE_CAUSALITY_AND_UNIQUENESS.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/07_PEOPLE_MIGRATION_AND_RECOVERY_STRATEGY.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/08_PEOPLE_PERSISTENCE_TEST_STRATEGY.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/09_PEOPLE_DEPENDENCY_BOUNDARIES.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/10_PEOPLE_IMPLEMENTATION_MISSION_PLAN.md
 M Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/PEOPLE_PERSISTENCE_ARCHITECTURE_MASTER_REPORT.md
 M server/domain/people/people-authority.ts
 M server/domain/people/people-persistence-aggregate-store.test.ts
 M server/domain/people/people-persistence-aggregate-store.ts
 M server/domain/people/people-persistence-history.test.ts
 M server/domain/people/people-persistence-history.ts
 M server/domain/people/people-persistence-idempotence.test.ts
 M server/domain/people/people-persistence-ports.ts
 M server/domain/people/people-persistence-schema.test.ts
 M server/domain/people/people-persistence-schema.ts
 M server/domain/people/people-persistence-sqlite-adapter.test.ts
 M server/domain/people/people-persistence-sqlite-adapter.ts
 M server/runtime/work/work-core.ts
```

Initial untracked entries:

```text
?? DOMAIN-LOT-CRITERIA-EVALUATOR-001_REPORT.md
?? DOMAIN-V2-MISSION-CERTIFICATION-INTEGRATION-001_REPORT.md
?? DOMAIN-V2-MISSION-INTAKE-BRIDGE-001_REPORT.md
?? Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001E.certification.json
?? Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json
?? Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001G.certification.json
?? Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/
?? Docs/24_MODULES/WORK/PEOPLE_COMMANDS/
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/MISSIONS/
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_BLOCKING_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D1_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D2_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D3_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D4_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D5_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_D6_CERTIFICATION_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-001D-SUPER-WAVE-001_FINAL_REPORT.md
?? Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/P3-PEOPLE-PERSISTENCE-ARCHITECTURE-001_PROMPT.md
?? Docs/24_MODULES/WORK/PEOPLE_QUERIES/
?? Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/
?? GIT_PACKAGING_REPORT.md
?? PDS_FRAMEWORK_FINAL_DEPENDENCY_REPORT.md
?? PDS_FRAMEWORK_FINAL_REPORT.md
?? RUNTIME-MISSION-BOOTSTRAP-DISCOVERY-001_REPORT.md
?? server/domain/people/people-command-service.test.ts
?? server/domain/people/people-command-service.ts
?? server/domain/people/people-persistence-migrations.test.ts
?? server/domain/people/people-persistence-migrations.ts
?? server/domain/people/people-persistence-recovery.ts
?? server/domain/people/people-query-service.test.ts
?? server/domain/people/people-query-service.ts
?? server/runtime/work/work-people.query.ts
?? server/runtime/work/work-people.test.ts
?? server/runtime/work/work-people.types.ts
?? tools/cerebrau/
?? tools/nova-core-runtime/mission.json
?? tools/nova-core-runtime/reports/
```

No reset, restore, checkout, clean, stash, destructive Git operation, unrelated formatting, or unrelated refactor was performed.

## 3. Canonical sources

All four mandatory sources were read in full before source or test changes:

| Source | SHA-256 during mission |
|---|---|
| `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md` | `53704B4AC254DE07E872E707C8233630BFAA33F7EE15198473527F57DEBFC4AF` |
| `Docs/24_MODULES/WORK/PEOPLE_DOMAIN_BLUEPRINT.md` | `6A57C1CA6C76E096A9182B0139278BE0931373788ABC6255648EDD4215784851` |
| `Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/P3-PEOPLE-001C_AUTHORITY_RECERTIFICATION_REPORT.md` | `A3E1B00213E9989EE8671AD5C83DF1ABF4F74BD4EB334D01F393F0E0ED3EA994` |
| `Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/MISSIONS/P3-PEOPLE-001BC-AUTHORITY-RECERTIFICATION_REPORT.md` | `548A356F48CD51899F271B564616B1668639BCA41182403CBCED693D9D9A02AC` |

The canonical contract, Blueprint, certification JSON, and certification registry were not changed by this mission.

## 4. Defect C-001 root cause

The pre-existing suspension change correctly closed roles effective at the suspension instant. The corresponding resume change then mapped every historical `assignment.roleAssignments` entry through `upsertRolePeriod`. A historical `RoleAssignment` therefore acted as sufficient authority to create a new effective period, even when its last effective period had ended under an earlier explicit revocation.

This conflated “role exists historically” with “role was effective immediately before suspension” and made resume an implicit role-grant path.

## 5. Defect C-002 root cause

`event(...)` copied an `effectiveAt: Date` reference into the event and froze only the outer object. JavaScript `Date` mutator methods remain effective on a frozen `Date`, so a consumer could change the accepted fact's business timestamp. TypeScript `Readonly` did not alter that runtime behavior.

The event union audit found direct `Date` payloads only in the nine event variants carrying `effectiveAt`. `AssignmentPeriod` and `PeopleProvenance` already store epoch values and return defensive `Date` copies. No generic deep-freeze facility or event type change was needed.

## 6. Files modified by this mission

1. `server/domain/people/people-authority.ts` — minimal role-resume selection and local accepted-event Date isolation. This file was already modified at preflight; only the correction-specific deltas are attributed here.
2. `server/domain/people/people-authority.test.ts` — two focused regression tests and serialization assertion.
3. `Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/MISSIONS/P3-PEOPLE-001C-CORRECTION-001_REPORT.md` — this report.

`people-authority.events.ts`, persistence files, downstream code, contracts, certification JSON, registry, Runtime, tools, apps, and client files were not changed by this mission.

## 7. Exact correction

### C-001

On resume, the Authority reads the last authoritative assignment provenance, which for a valid `SUSPENDED` assignment is the suspension provenance. A historical role is reopened only when:

- one of its periods was closed at the suspension instant; and
- the role's last provenance equals that exact suspension provenance.

An explicit revocation has different provenance and is therefore not reopened, including when it shares the same timestamp. Resumable roles receive a new bounded period through the existing `RoleAssignment` periods/provenance model. Historical periods are retained and no parallel status field or `ROLE_GRANTED` event is introduced. Owner uses the same selection and retains the canonical `ASSIGNMENT_RESUMED`, `OWNER_CHANGED`, `PARTICIPANT_ADDED` ordering when it was active at suspension.

### C-002

At event acceptance, `event(...)` snapshots `effectiveAt.getTime()`. It defines an enumerable, read-only accessor that returns a fresh `Date` for that epoch on each access, then freezes the event object. Consumers may mutate the returned runtime `Date`, but subsequent reads and JSON serialization retain the accepted epoch. Existing `effectiveAt: Date` types remain compatible.

## 8. Regression tests added

`resume restores only roles effective immediately before suspension` performs assignment with `CONTRIBUTOR` and `REVIEWER`, explicit `REVIEWER` revocation, suspension, and resume. It proves:

- `REVIEWER` remains ineffective;
- `CONTRIBUTOR` resumes;
- resume emits no `ROLE_GRANTED`;
- the complete event order is `PEOPLE_ASSIGNED`, `PARTICIPANT_ADDED`, `ROLE_REVOKED`, `ASSIGNMENT_SUSPENDED`, `PARTICIPANT_REMOVED`, `ASSIGNMENT_RESUMED`, `PARTICIPANT_ADDED`.

`accepted event effectiveAt is isolated from runtime Date mutation` mutates both the event-exposed `Date` and the caller-owned source `Date`, then proves the accepted timestamp and provenance remain unchanged. It also proves JSON serialization retains the canonical ISO timestamp.

Red/green evidence:

| Command | Result |
|---|---|
| `node --import tsx --test --test-name-pattern "resume restores only roles|accepted event effectiveAt" server/domain/people/people-authority.test.ts` before implementation correction | Expected RED — 0/2 pass, 2/2 fail, exit 1; observed revoked role `true !== false` and mutated epoch mismatch. |
| Same command after implementation correction | PASS — 2/2, 0 fail, exit 0. |

## 9. PEOPLE tests

Command:

```text
node --import tsx --test server/domain/people/*.test.ts
```

Final result after the complete test edit: **PASS — 39 tests, 39 pass, 0 fail, exit 0**.

This includes Authority, durable command delegation, persistence replay/rehydration/history/idempotence/migrations/schema/SQLite, queries, Owner resume, temporal role periods, and event persistence paths.

## 10. PEOPLE typecheck

Command:

```powershell
$peopleFiles = (Get-ChildItem -LiteralPath 'server/domain/people' -Filter '*.ts' -File).FullName; node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node $peopleFiles
```

Final result: **PASS — no diagnostics, exit 0**.

## 11. NOVA Core typecheck

Command: `npm.cmd run typecheck:nova-core`

Result: **PASS — `tsc -p tsconfig.nova-core.json`, exit 0**.

## 12. Work tests

Command: `node --import tsx --test server/runtime/work/*.test.ts`

Result: **PASS — 51 tests, 51 pass, 0 fail, exit 0**.

The eight PEOPLE/Work integration tests passed without downstream modification.

## 13. Runtime tests

| Command | Result |
|---|---|
| `npm.cmd run test:runtime` | PASS — 24/24, 0 fail, exit 0. |
| `npm.cmd run test:nova-runtime:syntax` | PASS — exit 0. |
| `npm.cmd run test:nova-runtime:e2e` | PASS — SUCCESS, 15/15, 0 fail, exit 0. |

## 14. Core tests

Command: `npm.cmd run test:core`

Result: **PASS — 541 tests, 541 pass, 0 fail, exit 0**.

## 15. CEREBRAU checks

| Command | Result |
|---|---|
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-CerebrauCertification.ps1` | PASS — 24/24, 0 fail, exit 0. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-CerebrauDomainOrchestration.ps1` | **FAIL — 50/51, 1 fail, exit 1**. Failing case: `people-pilot-resolves-current-lot`. |
| `Import-Module ./tools/nova-core-runtime/Cerebrau.Certification.psm1 -Force; Read-LotCertification ... -DomainId PEOPLE -LotId P3-PEOPLE-001D` | PASS — actual status `CERTIFIED`, materialized `true`. |
| `Invoke-DomainLot <repository> PEOPLE -DryRun` under execution-policy bypass | Read-only result: last certified `P3-PEOPLE-001G`, current lot `P3-PEOPLE-001H`, status `ABSENT`, mode `IMPLEMENTATION`, writes `false`. |

The failing Domain V2 test hard-codes the earlier expected state `last certified P3-PEOPLE-001C`, `current P3-PEOPLE-001D`, `PENDING_EVIDENCE`, `BACKFILL` at `Test-CerebrauDomainOrchestration.ps1:876-879`. The current repository legitimately resolves the later G/H state above. This mismatch is independent of the Authority correction and was present in the pre-existing later-layer certification/tool state. Fixing it requires a `tools/` change, which this mission expressly forbids. No attempt was made to force PASS.

## 16. `git diff --check`

`git diff --check` before report writing: **PASS — exit 0**. It emitted only pre-existing LF-to-CRLF warnings and no whitespace error.

Final post-report execution: **PASS — exit 0**; only the same pre-existing LF-to-CRLF warnings were emitted.

## 17. Downstream D–G non-regression

| Layer/concern | Evidence | Result |
|---|---|---|
| D persistence replay/rehydration | Full PEOPLE suite: restart rehydration, bounded history, role-period suspend/resume, backup/restore, SQLite serialization | PASS |
| E command service delegation | Real durable command lifecycle and replay tests; Owner suspend/resume assertions and canonical resume event order | PASS |
| F PEOPLE queries | Nine-query inventory, temporal role qualification, history, restart safety, read-only behavior | PASS |
| G Work read integration | Work suite 51/51, including eight PEOPLE integration tests | PASS |
| Role temporal semantics | New selective-resume regression plus existing persistence role-period test | PASS |
| Owner resume behavior | Existing command-service test proves one active Owner and `ASSIGNMENT_RESUMED`, `OWNER_CHANGED`, `PARTICIPANT_ADDED` order | PASS |
| Event serialization assumptions | New JSON assertion and durable command/event persistence tests | PASS |
| Runtime/Core | Runtime 24/24, Core 541/541, NOVA Runtime E2E 15/15 | PASS |

No downstream code was modified to obtain these results.

## 18. Residual risks

- The two technical blockers are corrected and no related downstream regression was detected.
- The pre-existing worktree remains heavily dirty. Mission attribution relies on the recorded preflight and the correction-specific diff.
- The established CEREBRAU Domain V2 suite is stale relative to the repository's current certified PEOPLE chain and fails 1/51. Resolving it requires a separate, explicitly authorized mission because `tools/` is forbidden here.
- Because a required established check failed, this mission cannot return GO even though the targeted implementation and all PEOPLE/downstream product checks passed.

## 19. Readiness for authority recertification

From the PEOPLE implementation perspective, both recertification blockers are no longer reproducible and the required product/downstream validations pass. From this mission's complete gate perspective, C is **not yet ready to be declared ready for authority recertification**, because the applicable CEREBRAU Domain V2 command did not pass and repairing that check would widen into a forbidden file scope.

No recertification mission, P3-PEOPLE-001H, or Planning work was executed.

## 20. Terminal verdict

NO GO ??? P3-PEOPLE-001C-CORRECTION-001 ??? C NOT READY FOR AUTHORITY RECERTIFICATION
