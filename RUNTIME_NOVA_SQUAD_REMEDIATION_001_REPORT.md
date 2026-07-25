# RUNTIME-NOVA-SQUAD-REMEDIATION-001 — Rapport final

## Résultat

La squad a produit des corrections ciblées et des primitives isolées, sans toucher CEREBRAU. Les changements des missions observabilité et transaction-intégrité sont conservés. La sortie est `PARTIAL` : plusieurs anomalies nécessitent encore une intégration profonde (journal durable, contrôle Codex/processus, certification dans l’API).

## Matrice synthétique

| Anomalie | État initial / cause | Solution et fichiers | Tests / statut |
|---|---|---|---|
| NRA-001 | États runtime internes non alignés avec canonique certification | `canonical-state.ts` versionne une machine et les transitions | tests mapping; PARTIAL |
| NRA-002 | mapping PowerShell limité | `mapPowerShellStatus` explicite les statuts | tests; PARTIAL |
| NRA-008 | rapport choisi par mtime | dossier exact `runs/<runId>`, recherche bornée au run | exécution/core; CLOSED pour isolation de chemin |
| NRA-009 | safeName et absence de hashes | `run-binding.ts`, prompt/request/manifest/binding/fingerprint | tests binding; PARTIAL (rapport officiel non encore enrichi côté PowerShell) |
| NRA-010 | config Codex non liée/versionnée | binding persiste champs Codex prévus | tests utilitaires; OPEN (détection binaire/version à intégrer) |
| NRA-011 | pas timeout/annulation/limites | diagnostic existant conservé | aucune implémentation process; OPEN |
| NRA-012 | audit/inspection classés FAST | `selectProfile` route AUDIT/INSPECTION/REVIEW/ANALYSIS vers READ_ONLY | tests core; CLOSED |
| NRA-013 | changements READ_ONLY non interdits | `changesExpected=false` forcé et fichiers modifiés bloquants | tests à renforcer; PARTIAL |
| NRA-014 | approbation non structurée | `mission-certification.ts` fournit décision/certificat lié | tests certification; PARTIAL (API non branchée) |
| NRA-015 | aucun journal autoritatif | `AppendOnlyJournal` hash-chain/replay | 3 tests journal; PARTIAL (non persisté) |
| NRA-016 | validations par préfixe autorisé | primitives scope disponibles | OPEN (matrice fichiers→tests non branchée) |
| NRA-017 | preflight Git incomplet | diagnostic Git conservé | OPEN |
| NRA-018 | scopes non récursifs/non normalisés | `scope-validation.ts`, normalisation HTTP et manifeste | tests scope; PARTIAL |
| NRA-019 | collisions safeName | slug hashé dans run-binding | tests slug; CLOSED pour runs |
| NRA-020 | JSON sans schéma | validation scope versionnée à la création HTTP | tests scope; PARTIAL |
| NRA-021 | qualification incomplète | tests unitaires supplémentaires et bootstrap | 29 tests ciblés; PARTIAL |
| NRA-022 | reprise limitée à incompleteRuns | classification recovery dans journal | tests recovery; PARTIAL |
| NRA-023 | bootstrap implicite | vérification Node >=22, chemins runtime/repository | tests bootstrap; CLOSED |

## Validations exécutées

- `npm.cmd run typecheck:nova-core` — PASS
- `npm.cmd test` — PASS (8 runtime, 18 NOVA Core)
- journal dédié — PASS (3 tests)
- `npm.cmd run test:nova-runtime:syntax` — PASS
- `git diff --check` — PASS

Les smoke tests Codex réels, timeout/annulation, replay depuis fichier durable, certification HTTP complète et preflight Git avancé restent explicitement ouverts; aucun faux test n’est présenté comme preuve réelle Codex.
