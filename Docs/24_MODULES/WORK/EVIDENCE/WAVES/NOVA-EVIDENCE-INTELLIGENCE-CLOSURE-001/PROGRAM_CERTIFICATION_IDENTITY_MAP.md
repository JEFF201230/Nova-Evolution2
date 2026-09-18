# PROGRAM CERTIFICATION IDENTITY MAP

Status: `PROPOSED — NO REGISTRY WRITE AUTHORIZED IN THIS WAVE`

## Canonical registration plan

| DomainId | LotId | PreviousLot | NextAuthorizedLot | CertificationPath |
|---|---|---|---|---|
| EVIDENCE | P3-EVIDENCE-001A | `null` | P3-EVIDENCE-001B | `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/EVIDENCE_IMPLEMENTATION_CONTRACT.md` |
| EVIDENCE | P3-EVIDENCE-001B | P3-EVIDENCE-001A | `null` | `Docs/12_CERTIFICATION/EVIDENCE/P3-EVIDENCE-001B.certification.json` |
| WORK | WCF-004A | `null` | WCF-004 | `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/WORK_IMPLEMENTATION_CONTRACT.md` |
| WORK | WCF-004 | WCF-004A | WORK-AUTHORIZED-STATE-001 | `Docs/12_CERTIFICATION/WORK/WCF-004.certification.json` |
| WORK | WORK-AUTHORIZED-STATE-001 | WCF-004 | WCF-008-CLOSURE | `Docs/12_CERTIFICATION/WORK/WORK-AUTHORIZED-STATE-001.certification.json` |
| WORK | WCF-008-CLOSURE | WORK-AUTHORIZED-STATE-001 | `null` | `Docs/12_CERTIFICATION/WORK/WCF-008-CLOSURE.certification.json` |
| INTELLIGENCE | P3-INTELLIGENCE-001A | `null` | P3-INTELLIGENCE-001B | `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/INTELLIGENCE_IMPLEMENTATION_CONTRACT.md` |
| INTELLIGENCE | P3-INTELLIGENCE-001B | P3-INTELLIGENCE-001A | `null` | `Docs/12_CERTIFICATION/INTELLIGENCE/P3-INTELLIGENCE-001B.certification.json` |
| SYNTHESIS | P3-SYNTHESIS-001A | `null` | P3-SYNTHESIS-001B | `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/SYNTHESIS_IMPLEMENTATION_CONTRACT.md` |
| SYNTHESIS | P3-SYNTHESIS-001B | P3-SYNTHESIS-001A | `null` | `Docs/12_CERTIFICATION/SYNTHESIS/P3-SYNTHESIS-001B.certification.json` |
| CONFIDENCE | P3-CONFIDENCE-001A | `null` | P3-CONFIDENCE-001B | `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/CONFIDENCE_IMPLEMENTATION_CONTRACT.md` |
| CONFIDENCE | P3-CONFIDENCE-001B | P3-CONFIDENCE-001A | `null` | `Docs/12_CERTIFICATION/CONFIDENCE/P3-CONFIDENCE-001B.certification.json` |

The WORK chain covers only this closure program. Its entry gate separately resolves the already certified semantic capabilities WCF-001/2/3/5/6/7 from their current authoritative evidence; this Wave does not backfill or rewrite them.

## Bootstrap protocol after human approval

1. Revalidate `Docs/12_CERTIFICATION/certification-registry.json` and `LOT_CERTIFICATION_CONTRACT.md` for drift.
2. The one Phase 0 final program decision preauthorizes the exact bounded two-file admission for each of EVIDENCE, WORK, INTELLIGENCE, SYNTHESIS and CONFIDENCE: transition the active `A` contract from `PROPOSED` to contract-only `CERTIFIED` and add its legacy marker `**VERDICT : GO**`; add exactly one canonical registry row with `Status=CERTIFIED`, `PreviousLot=null`, the declared `NextAuthorizedLot`, and the contract Markdown `CertificationPath`. EVIDENCE may be admitted immediately after approval. WORK/WCF-004A remains dormant until Evidence certification; every later domain remains dormant until its predecessor certificate resolves and its protected inputs show no structural drift. The current writer intentionally writes JSON only, so it cannot perform this first legacy-contract admission.
3. At each dependency gate, apply both preauthorized changes in one reviewed mechanical changeset without requesting a routine human transition approval. Fail closed until all postconditions pass: `Read-LotCertification(A)=CERTIFIED/Legacy=true`; `Resolve-DomainContext` selects exactly the intended contract and Blueprint; `Read-LotImplementationContract(B).Complete=true`; `Resolve-CurrentLot.CurrentLot=B`. Roll back the entire uncommitted changeset on any failure. Any contract, Blueprint, identity or registry drift is structural and requires a new HUMAN_GATE. After these checks, use only the canonical writer governed by `Docs/12_CERTIFICATION/LOT_CERTIFICATION_CONTRACT.md` for the `B` implementation lot and later transitions. The phase label remains the mandated `P3-…-001`; A/B are registry packaging, not extra program phases.
4. For a Domain V2 mission, ensure the registry points to exactly one `# <DOMAIN> IMPLEMENTATION CONTRACT`, and that contract references exactly one canonical Blueprint. For WORK only, the program-approved resolver compatibility accepts the existing unique H1 `# WD-001 — Work Domain Blueprint`; all other domain H1 matching remains exact.
5. Execute and certify only the immediate lot through the existing Domain V2 approval/policy/writer path. No direct writer bypass is permitted.
6. Treat `NextAuthorizedLot` as eligibility inside that DomainId, never as automatic mission start or as satisfaction of cross-domain program gates.

The A/B split follows the existing certified domain pattern: each program-approved, dependency-gated contract and registry row forms one legacy contract certification; the writer records implementation certification in immutable JSON. No two entries for a DomainId point to the same implementation-contract Markdown. A contract intentionally contains no GO marker while `PROPOSED`; therefore merely adding a registry row cannot accidentally admit it. The absence of an automated first-contract registrar is why all five exact conditional bootstraps are included in the one Phase 0 final program gate rather than falsely attributed to `Write-LotCertification` or deferred to routine human gates.

## Resolver readiness

| Domain | Blueprint | Implementation contract | Registry entry now | Result now |
|---|---|---|---|---|
| EVIDENCE | prepared in Wave | parser-complete contract prepared | absent | `DOMAIN_UNKNOWN` until final program approval and contract-row bootstrap; then Domain V2 resolves B |
| WORK | existing canonical `# WD-001 — Work Domain Blueprint` | parser-complete contract prepared | absent | `DOMAIN_BLUEPRINT_MISSING` until program-approved resolver compatibility and WCF-004A contract-row admission; then Domain V2 resolves WCF-004 without Blueprint duplication |
| INTELLIGENCE | existing certified Blueprint | parser-complete contract prepared | absent | `DOMAIN_UNKNOWN` until its program-preauthorized, dependency-gated contract-row bootstrap |
| SYNTHESIS | existing certified Blueprint | parser-complete contract prepared | absent | `DOMAIN_UNKNOWN` until its program-preauthorized, dependency-gated contract-row bootstrap |
| CONFIDENCE | existing certified Blueprint | parser-complete contract prepared | absent | `DOMAIN_UNKNOWN` until its program-preauthorized, dependency-gated contract-row bootstrap |

`PROGRAM_STATUS.md` is a projection only. It is not a registry and cannot open a lot.

## Structured conclusion

**FACT**  
The canonical registry currently has no entries for these DomainIds, and the generic resolver fails closed on an unknown domain.

**EVIDENCE**  
`LOT_CERTIFICATION_CONTRACT.md:55-103,145-170` and `Cerebrau.DomainOrchestration.psm1:149-230`.

**ANALYSIS**  
Exact identities and contract/Blueprint paths remove ambiguity for all five domains. WORK uses the same Domain V2 approval/policy/writer route after the bounded resolver compatibility repair, so the existing certified Work Blueprint is neither renamed nor duplicated and the canonical writer remains the only certification mutation authority.

**LIMIT**  
No registry entry or certificate is created in this preparation Wave.

**DECISION**  
Downstream Mission Orders and parser contracts are prepared. Their exact first contract-row admissions were designed for conditional preauthorization by the single final program decision and are mechanical dependency transitions, not new human gates. The current dirty workspace now contains some later admissions without a matching approval record in this Wave; those observations are fail-closed until provenance reconciliation and do not authorize further transition.

**NEXT ACTION**  
After the Program Owner gate, reconcile the existing EVIDENCE/WORK admissions against the approval record and all four resolver postconditions. Retain or correct them only through the governed certification path, then activate no phase beyond the immediate authoritative successor.
