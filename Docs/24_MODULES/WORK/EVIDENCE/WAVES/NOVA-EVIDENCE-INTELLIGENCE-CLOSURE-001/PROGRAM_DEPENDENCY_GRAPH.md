# PROGRAM DEPENDENCY GRAPH

Status: `PROPOSED — DETERMINISTIC`

## Governing graph

```text
ARCH-EVIDENCE-001 [human final approval + D-005 semantic decision + provenance reconciliation]
  -> P3-EVIDENCE-001 [certified Evidence authority]
    -> WCF-004 [certified WorkReference <-> EvidenceId]
      -> WORK-AUTHORIZED-STATE-001 [certified read-only composition]
        -> P3-INTELLIGENCE-001 [certified Intelligence]
          -> P3-SYNTHESIS-001 [certified Synthesis]
            -> P3-CONFIDENCE-001 [certified Confidence]
              -> WCF-008-CLOSURE [closure certification]
```

The Synthesis-before-Confidence ordering is a governance sequence. Both consume Intelligence; Synthesis must not require a fabricated Confidence value.

## Dependency truth table

| Consumer | Required upstream state | Invalid substitute |
|---|---|---|
| P3-EVIDENCE-001 | approved Evidence architecture | audit proposal alone |
| WCF-004 | certified Evidence producer/query | technical Mission or Runtime evidence |
| WORK-AUTHORIZED-STATE-001 | certified WCF-004 and existing certified Work queries | copied aggregate snapshot store |
| P3-INTELLIGENCE-001 | certified authorized Work state and Evidence | fixtures, logs, readiness, unqualified Knowledge |
| P3-SYNTHESIS-001 | certified Intelligence | Mission report or generated UX text |
| P3-CONFIDENCE-001 | certified Synthesis in program order and certified Intelligence/Evidence dependencies | progress, readiness, pass counts |
| WCF-008-CLOSURE | all prior phase certificates and closure evidence | partial implementation or UI projection |

## Auto-transition rule

The orchestration decision is a pure gate evaluation:

```text
if upstream certificate resolves to CERTIFIED
and current exit checks are PASS
and Red Team has no open CRITICAL/HIGH blocker
and scoped diff is clean:
    next phase = AUTO_ACTIVATE_BY_EXPLICIT_ASSIGNMENT
else:
    next phase = BLOCKED_BY_DEPENDENCY
```

No readiness percentage, test count or documentation status may substitute for a certificate. CEREBRAU performs the explicit assignment/activation automatically through the existing orchestration mechanism; this is not a human gate and it never skips the immediate successor. Phase 1 remains the sole preparation exception until final program approval is recorded.

## Structured conclusion

**FACT**  
The canonical order is fixed and no product implementation can safely run in parallel across phases.

**EVIDENCE**  
`WORK_PHASE2_CERTIFICATION.md:152-174` and the primary audit sections 5 and 9.

**ANALYSIS**  
Every phase has one immediate predecessor, eliminating ambiguous partial openings.

**LIMIT**  
Final certificate identifiers will be created only by their authorized certification missions.

**DECISION**  
Graph classification: `PROPOSED`, structurally validated.

**NEXT ACTION**  
After the human decision and provenance reconciliation, evaluate only the immediate authoritative successor; never infer later eligibility from the dirty registry projection.
