# RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003 — Contre-tests

Date : 2026-07-25

HEAD contrôlé : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`

## Résultat

```text
BLOCKING COUNTERTESTS: 20
PASS: 20
FAIL: 0
NON EXÉCUTABLE: 0
```

| # | Contre-test bloquant | Preuve d’exécution | Résultat |
| ---: | --- | --- | --- |
| 1 | Autorité sans rôle refusée | `authorization is closed by default...` et HTTP `no-role`/`read-only` => 403 | PASS |
| 2 | Autorité inconnue refusée | Route `/certify`, bearer inconnu => 401 | PASS |
| 3 | Recovery, processus actif | Test avec vrai processus Node et `process.kill(pid, 0)` | PASS |
| 4 | Recovery, worktree modifié | Vrai dépôt Git temporaire, modification suivie détectée | PASS |
| 5 | Recovery, état UNKNOWN bloqué | PID invalide et Git indisponible ; `recover` refuse `INSPECTION_UNKNOWN` | PASS |
| 6 | READ_ONLY pré-sali refusé | `READ_ONLY refuses a dirty initial worktree before spawning` | PASS |
| 7 | Écriture READ_ONLY produit FAILED | Test moteur lève `NOVA_CORE_READ_ONLY_VIOLATION`; route HTTP ne soumet pas | PASS |
| 8 | Profil READ_ONLY non surchargeable | Payload `profile=BUILD` refusé ; `changesExpected=true` écrasé à false | PASS |
| 9 | Lock identique malgré casse Windows | `Windows case variants cannot bypass an active scope lock` | PASS |
| 10 | Conflit parent/enfant | `parent and child scopes cannot hold concurrent locks` | PASS |
| 11 | Projection contradictoire rejetée | Store refuse projection CERTIFIED face au replay READY | PASS |
| 12 | Événement supprimé, chaîne recalculée | Ancre externe refuse la troncature re-scellée | PASS |
| 13 | Journal tronqué puis re-signé | `external anchor rejects a re-signed truncation...` | PASS |
| 14 | Prompt modifié rejeté | Route réelle `/certify` => 422 | PASS |
| 15 | Manifest modifié rejeté | Route réelle `/certify` => 422 | PASS |
| 16 | ExecutionRequest modifiée rejetée | Route réelle `/certify` => 422 | PASS |
| 17 | Rapport modifié rejeté | Fingerprint recalculé depuis l’artefact => mismatch, HTTP 422 | PASS |
| 18 | Projection directe rejetée | Constructeur runtime et migration refusent la contradiction journal | PASS |
| 19 | Replay identique à la projection | Store charge/reconstruit la projection depuis le journal ; assertions d’état et d’événements | PASS |
| 20 | Aucune transition interdite après terminal | `ReportSubmitted` après CANCELLED/REJECTED et `ProcessOutput` tardif refusés | PASS |

## Contre-tests supplémentaires

| Domaine | Scénarios | Résultat |
| --- | --- | --- |
| Autorisation | disabled, sujet différent, type non admis, attestation absente, attestation HMAC invalide, double certification | PASS |
| Recovery | processus absent, rapport présent/absent, artefacts valides/absents, journal/snapshot invalides, lock orphelin | PASS |
| READ_ONLY | liste autorisée exacte, chemin `..` rejeté, baseline index persistée, postflight Git indépendant du report | PASS |
| Locks | slash/backslash, `.`/`..`, nova/nova-old, fichiers distincts, deux enfants distincts | PASS |
| Journal | payload altéré, chaîne entièrement recalculée, projection et journal modifiés ensemble, mauvaise ancre | PASS |
| Binding | run-binding local modifié pour suivre un prompt forgé, artefact absent, mauvais run/fingerprint | PASS |
| Processus | stdout/stderr indépendants, timeout, cancel, arbre, processus ignorant le premier signal | PASS |

## Commandes de preuve

| Commande | Code | Résultat |
| --- | ---: | --- |
| `npm.cmd run typecheck:nova-core` | 0 | TypeScript PASS |
| `npm.cmd test` | 0 | 59/59 : orchestrateur 15/15, NOVA Core 44/44 |
| `node.exe --import tsx --test server/runtime/journal/append-only-journal.test.ts server/runtime/orchestrator/canonical-state.test.ts` | 0 | 5/5 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreReporting.ps1` | 0 | 19/19 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreRuntimeE2E.ps1` | 0 | 15/15 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreExceptionCapture.ps1` | 0 | 13/13 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreGovernance.ps1` | 0 | 25/25 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreContextAssembly.ps1` | 0 | 23/23 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreContextRuntime.ps1` | 0 | 10/10 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreSyntax.ps1` | 0 | Syntaxe PASS |
| `npm.cmd ci --ignore-scripts --offline --no-audit --no-fund --prefix <temp>` | 0 | 6 packages, copie jetable supprimée |

Les 47 tests Node et 33 tests PowerShell historiques sont conservés. Les totaux actuels sont supérieurs parce que les contre-tests ont été ajoutés sans désactiver ni remplacer les tests historiques.
