# TEST AND CERTIFICATION STRATEGY

Status: `PROPOSED`

## 1. Test layers

| Layer | Required proof |
|---|---|
| Domain | aggregate invariants, identities, lifecycle, idempotence, revisions/withdrawals |
| Boundary | forbidden inputs/mutations, source ownership, absence/unavailability, no fallback |
| Persistence | restart recovery, append-only history, uniqueness, deterministic projection |
| Integration | internal ports, WorkReference association/composition, owner resolution |
| Regression | Work/Core/Runtime and certified PEOPLE/PLANNING/ACTIONS where touched or consumed |
| Static | typecheck/build, dependency directions, no forbidden imports, schema whitelist |
| Governance | manifest, scope delta, expected artefacts, registry chain, certificate evidence |

Fixtures are test inputs only and are never accepted as authoritative outputs.

## 2. Phase matrix

| Phase | Positive tests | Mandatory negative/boundary tests | Certification identity |
|---|---|---|---|
| ARCH-EVIDENCE-001 | manifest/files/references/decision completeness | proposed≠certified; no product change | human approval record, no product certificate |
| P3-EVIDENCE-001 | register/resolve/recover/lifecycle | duplicate conflict, prohibited source, payload copy, authority unavailable | EVIDENCE/P3-EVIDENCE-001B |
| WCF-004 | associate/query/unlink/cardinality | Work owns content, copied status, unknown/withdrawn/unavailable | WORK/WCF-004 |
| WORK-AUTHORIZED-STATE-001 | deterministic composition | mirrored store, source mutation, fallback, hidden contradiction | WORK/WORK-AUTHORIZED-STATE-001 |
| P3-INTELLIGENCE-001 | Assessment/results/ranking/history | fact without Evidence, imperative Recommendation, new Action/priority | INTELLIGENCE/P3-INTELLIGENCE-001B |
| P3-SYNTHESIS-001 | current/history/source presentation | created fact, report/fixture substitute, Confidence default | SYNTHESIS/P3-SYNTHESIS-001B |
| P3-CONFIDENCE-001 | bounded evidence-based assessment | readiness/progress/count/default, certification alone, missing context | CONFIDENCE/P3-CONFIDENCE-001B |
| WCF-008 closure | full internal chain and all criteria | missing/rejected/unavailable cert one at a time, unavailable owner, cross-domain write, projection authority; every cross-domain predecessor failure must produce zero certification-writer calls | WORK/WCF-008-CLOSURE |

## 3. Mandatory executable command floor

Each active domain must use its own strict `server/domain/<active-domain>/tsconfig.json`, scoped to that domain and its imports. Work integration also runs the existing `server/domain/work/tsconfig.json`. This keeps configuration inside each Mission Order's exact path scope and prevents a broad root config from silently changing certified domains.

Every TypeScript implementation lot must run all of the following exact command families from repository root, replacing only `<active-domain>` with the Mission Order domain:

```text
node --import tsx --test "server/domain/<active-domain>/**/*.test.ts"
node --import tsx --test "server/domain/people/**/*.test.ts" "server/domain/planning/**/*.test.ts" "server/domain/actions/**/*.test.ts" "server/domain/work/**/*.test.ts" "server/runtime/work/**/*.test.ts"
npm test
npm exec tsc -- -p server/domain/<active-domain>/tsconfig.json --noEmit
npm exec tsc -- -p server/domain/work/tsconfig.json --noEmit  # when Work integration is changed
npm exec tsc -- -p tsconfig.nova-core.json --noEmit
node --import tsx --test server/nova-core/mission-evidence-certifier.test.ts server/os-integration/runtime-evidence-consumption.test.ts
```

Each phase manifest must additionally run a mission-local changed-file coverage validator. It fails when any changed production `.ts` file under `server/domain/**` or `server/runtime/work/**` is absent from the applicable `tsc --listFilesOnly`, or when a changed non-declaration production module has neither an executed adjacent test nor an explicit entry in the reviewed production-to-test mapping. A zero-file glob, skipped test file or compiler config that excludes an active domain is a failure, never a PASS. Phase 7 additionally runs `node --import tsx --test "server/runtime/**/*.test.ts" "server/os-integration/**/*.test.ts"`.

## 4. Determinism requirements

- Fixed authoritative input snapshots produce byte/semantic-equivalent results after canonical ordering.
- Time and identifier generation are injected/controlled in tests.
- Queries preserve declared ordering and do not depend on filesystem enumeration.
- Restart tests recreate projections from the unique durable history.
- Ranking declares candidate set, method and tie handling.
- Absence/unavailability unions are asserted exactly, not via truthy/falsy values.

## 5. Certification evidence

For every B/closure lot, retain:

1. mission/input evidence and preflight hashes;
2. exact command, exit code and machine-readable validation result;
3. after-state/delta and scope decision per changed path;
4. output evidence captured after execution and fingerprint-bound to the official report;
5. regression classification `NONE` or justified canonical non-blocking value;
6. Red Team findings/dispositions;
7. authority decision and final mission state;
8. atomic canonical writer result and registry resolution.

Test counts never establish architecture correctness or Confidence.

## 6. Failure and repair

A failing required check blocks certification. The owning phase may use two repairs for the same proven local cause, recording both. Architecture/source/protected-domain changes are not repair attempts and require the relevant human gate.

## Structured conclusion

**FACT**  
Every phase has positive, negative, regression and governance proof obligations.

**EVIDENCE**  
Wave execution contract and `LOT_CERTIFICATION_CONTRACT.md:145-170`.

**ANALYSIS**  
The strategy tests meaning and authority direction, not only happy-path behavior.

**LIMIT**  
Exact test commands are bound by each future mission manifest.

**DECISION**  
No lot can be certified on documentation, readiness or pass-count evidence alone.

**NEXT ACTION**  
Materialize named commands in each phase manifest immediately before explicit assignment.
