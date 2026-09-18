# PROGRAM EVIDENCE INDEX

Status: `PROVEN BASELINE / PROPOSED PROGRAM OUTPUTS`  
Baseline commit: `190752cd7f3983e6d40bf72f11627db07886d3ba`  
Baseline branch: `feature/nova-runtime-foundation`  
Captured: 2026-09-14

## Authoritative inputs

| Evidence | SHA-256 | Classification | Supports |
|---|---|---|---|
| `Docs/24_MODULES/WORK/INTELLIGENCE/MISSIONS/NOVA-EVIDENCE-WORK-INTELLIGENCE-ARCHITECTURE-AUDIT-001/NOVA_EVIDENCE_WORK_INTELLIGENCE_ARCHITECTURE_AUDIT_001_REPORT.md` | `39aa1b1a1fc683526787d73c17a7ab4338265ff59dea3afa48e5dc60e0309d46` | PROVEN audit | starting state and root gap |
| `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md` | `06ca0711718b1b8a1b9c83a994fcde21a61bbec6a578a45a028154f9322a14f7` | CERTIFIED design input | Work ownership/invariants |
| `Docs/24_MODULES/WORK/INTELLIGENCE_DOMAIN_BLUEPRINT.md` | `b12182df2ddb2f0b12b0fab94cfc9a56a6667f4922df6839f66f59dd0dc05718` | CERTIFIED design input | Intelligence boundaries |
| `Docs/24_MODULES/WORK/SYNTHESIS_DOMAIN_BLUEPRINT.md` | `bb27c48cb71183f3503c516638b8a98872634239cc7f977482a8c64c7005cf15` | CERTIFIED design input | Synthesis contract |
| `Docs/24_MODULES/WORK/CONFIDENCE_DOMAIN_BLUEPRINT.md` | `db1387e5d5f46b430fec43311884bc16ad3f3f3e8499fc1db6d6552103d0fa45` | CERTIFIED design input | Confidence contract |
| `Docs/24_MODULES/WORK/WORK_PHASE2_CERTIFICATION.md` | `0c56fcb7d73771e9352d3435d8b6121f2077a8df5ae0bde9e46bb288fc49ee3d` | CERTIFIED | order and implementation gates |
| `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_CAPABILITY_ROADMAP.md` | `05e4000733c0976deb9a607004d4336cdd8fd273c4ff17dbe8fa2f6382069ab6` | canonical roadmap input | WCF dependencies/outputs |
| `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md` | `b9ce1a2a7340d139b098c9b5bd4b9b9070c3b10b7bab88cc493dafc5be6f892c` | canonical matrix input | owners/directions |
| `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001H.certification.json` | `7c0d4c8bc951eddda170186aa1071db4894c59a7d6be29643b3c4d6f817315e3` | CERTIFIED | PEOPLE protected state |
| `Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001G.certification.json` | `64261a9a85b8dd27fccfa0b43fdbc915f540918c411f6c723b1454b276bd187f` | CERTIFIED | PLANNING protected state |
| `Docs/12_CERTIFICATION/ACTIONS/P3-ACTIONS-001G.certification.json` | `79879161174aeba54e635f5068295098f712c8aaca21eeb3740f8b6460ccace4` | CERTIFIED | ACTIONS protected state |
| `Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md` | `d4fa3db887f800cad69feb9dc14021b3054f24a0740bbacb44457fde83726e2d` | CERTIFIED design input | initial source owner and Result semantics |
| `server/domain/actions/actions-internal-access.ts` | `a91fa3297ced83bc3405b5ec74cbfd65c24376d19cb08d4a22c6bf39e3940f12` | CERTIFIED implementation input | read-only Action history resolver |
| `server/domain/actions/action-authority.events.ts` | `1094136c99312e6e70b10f49b39bf16f8923df60a816a65ac1705f689c3263bd` | CERTIFIED implementation input | `ResultRecorded` occurrence identity |
| `server/domain/actions/action.entities.ts` | `946cf23b5637dba299b4b43894a35f0172dd876eb5d0725f3b38ab9f66298cf5` | CERTIFIED implementation input | ResultId, provenance and payload boundary |

## Wave outputs

All files in this Wave directory other than the prompt and `mission.json` are governance outputs and remain `PROPOSED` unless explicitly labelled `PROVEN`. They are not Business Evidence and must never be consumed by NOVA Runtime.

## Baseline limits

The worktree contained unrelated untracked files before this preparation, including the Evidence/Intelligence mission directories and other reports/build outputs. A clean-worktree claim is therefore prohibited. Scope verification must compare only this Wave directory and preserve all unrelated user artefacts.

## 2026-09-16 fail-closed revalidation observations

| Observation | Classification | Program effect |
|---|---|---|
| Modified registry and untracked certificates claim Evidence, WCF-004 and authorized Work state certification | `PROVEN FILE STATE / AUTHORITY UNKNOWN` | preserve; require approval-provenance reconciliation |
| Architecture decision, Evidence Blueprint and decision log still require final human approval | `PROVEN` | Phase-0 closure is not established by this package |
| Intelligence, Synthesis and Confidence have no current registry domain entries | `PROVEN` | WCF-008 pending state cannot authorize closure |
| Candidate Evidence authority accepts arbitrary non-empty CertificationReference despite no admitted Business Certification owner | `PROVEN IMPLEMENTATION GAP` | owning-phase repair and recertification before reliance |

These observations are governance evidence only. They neither revoke nor validate a product certificate and are not Business Evidence.

## Structured conclusion

**FACT**  
Every input listed in the authoritative-input table is hash-pinned to the captured workspace state; other cited governance files remain path-and-line references and must be revalidated before execution.

**EVIDENCE**  
Local SHA-256 calculation and Git baseline above.

**ANALYSIS**  
Hash pinning makes later drift detectable without reclassifying these governance files as Business Evidence.

**LIMIT**  
Hashes establish file identity, not truth or certification beyond each source’s own status.

**DECISION**  
Future lots must recalculate and compare hashes before relying on these inputs.

**NEXT ACTION**  
If a protected input changes, stop and classify whether the change is certified before continuing.
