# RUNTIME-NOVA-CERTIFICATION-VALIDATION-003 — Rapport de validation indépendante

Date : 2026-07-25

## Résumé

La mission a vérifié exclusivement les corrections et preuves de `RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003`. Elle n’a pas recherché de nouvelles familles d’anomalies.

Résultat observé :

```text
NRA anciennement PARTIAL vérifiées : 12
CLOSED : 12
PARTIAL : 0
OPEN : 0
Contre-tests critiques : 20/20 PASS
```

En tenant compte des onze NRA déjà `CLOSED` et figées par l’audit 002, l’état validé est :

```text
NRA TOTAL: 23
CLOSED: 23
PARTIAL: 0
OPEN: 0
```

## Baseline indépendante

```text
Top-level : C:/DEV/NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)/nova-core-mvp
Branche : main
HEAD initial : d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
Remote : aucun
git diff --check initial : code 0
Node : v24.16.0
npm : 11.13.0
Windows PowerShell : 5.1.26100.8894
Codex : codex-cli 0.145.0
```

Le worktree était non propre au début de la validation. Cet état correspondait aux corrections non commitées et aux livrables déjà annoncés. Aucun nettoyage, commit, checkout, migration ou correction n’a été réalisé pendant cette mission.

## Références lues intégralement

- `RUNTIME_NOVA_FINAL_CERTIFICATION_DECISION_002.md`
- `RUNTIME_NOVA_FINAL_CERTIFICATION_MATRIX_002.md`
- `RUNTIME_NOVA_CRITICAL_PARTIAL_CLOSURE_003_REPORT.md`
- `RUNTIME_NOVA_CRITICAL_PARTIAL_FIX_MATRIX_003.md`
- `RUNTIME_NOVA_CRITICAL_COUNTERTESTS_003.md`
- `RUNTIME_NOVA_CRITICAL_REGRESSION_003.md`

Les rapports de clôture ont été traités comme des affirmations à vérifier. La validation repose sur le code actif, les routes montées, les assertions présentes et les commandes directement exécutées.

## Validation des douze NRA

| NRA | Cause audit 002 | Correction active vérifiée | Preuve indépendante | Statut |
| --- | --- | --- | --- | --- |
| NRA-001 | Authentification sans autorisation de certifier. | Politique fermée par défaut ; contrôles `enabled`, sujet, type, rôle `CERTIFY` et attestation HMAC ; route `/certify` utilise authentification puis autorisation. | Tests certification et HTTP : autorité inconnue 401 ; rôles/types/identités interdits 403 ; attestation invalide 403 ; double certification 409. | CLOSED |
| NRA-007 | Recovery fondé sur `processAlive=false` et `worktreeModified=false`. | Inspection réelle du PID, descendants, Git, rapport et artefacts ; signaux `TRUE/FALSE/UNKNOWN`; reprise bloquée sur signal dangereux. | Test avec vrai processus Node et vrai dépôt Git ; processus actif/absent, worktree propre/modifié et inspections impossibles observés. | CLOSED |
| NRA-009 | Artefacts du run non relus lors de la certification. | `verifyRunArtifacts` relit prompt, manifest, ExecutionRequest et run-binding, recalcule les hashes et vérifie l’événement `ReportSubmitted`. | Altération de chacun des artefacts, artefact absent et hash local re-signé : HTTP 422. | CLOSED |
| NRA-011 | Plafond partagé et absence de preuve du kill forcé. | Limites stdout/stderr indépendantes ; arbre Windows forcé ; escalade POSIX ; statuts TIMEOUT/CANCELLED. | Tests du runner : flux séparément bornés et processus ignorant SIGTERM forcé à s’arrêter. | CLOSED |
| NRA-013 | READ_ONLY contournable et worktree pré-sali accepté. | Preflight propre, profil serveur, `changesExpected=false`, baseline Git, postflight Git et erreur terminale sur écriture non autorisée. | Worktree sale refusé ; création, suppression et renommage réels détectés ; override et chemin `..` refusés. | CLOSED |
| NRA-014 | Projection et état canonique concurrents. | Journal autoritatif ; projection contrôlée contre le journal au chargement et à l’export ; mutations via EventBus. | Projection forgée rejetée ; `ReportSubmitted` après CANCELLED/REJECTED et événement tardif refusés. | CLOSED |
| NRA-015 | Journal tronquable puis re-signable par checksums locaux. | Ancre HMAC distincte de `runtime.json`, clé externe obligatoire, terminal et checksum scellés ; projection comparée au replay. | Projection contradictoire, troncature re-scellée et chaîne entièrement recalculée rejetées. | CLOSED |
| NRA-017 | Locks Windows sensibles à la casse. | Canonicalisation plateforme-aware utilisée par `scopesOverlap` dans l’acquisition des locks. | Même chemin Windows avec casse différente et conflits parent/enfant détectés. | CLOSED |
| NRA-018 | Grammaires TypeScript et PowerShell divergentes. | Segments, séparateurs, `.`/`..` et casse Windows alignés ; PowerShell utilise `IgnoreCase`. | Tests Node scopes et Reporting PowerShell 19/19. | CLOSED |
| NRA-021 | Couverture historique insuffisante. | Contre-tests ajoutés sur route, filesystem, processus, Git, store et EventBus ; aucun skip/todo. | 59/59 Node, 34/34 PowerShell obligatoires et 71/71 complémentaires. | CLOSED |
| NRA-022 | Recovery/replay synthétiques et dépendants du snapshot seul. | Inspection physique, intégrité store, ancre externe, replay et routes recovery branchés ensemble. | Processus/Git réels, verrou orphelin, rapport physique, anchor tamper et `UNKNOWN` bloquant. | CLOSED |
| NRA-023 | README recommandant `npm install`. | README actif utilise `npm ci`; test bootstrap vérifie la contradiction supprimée. | Suite bootstrap incluse dans les 44 tests NOVA Core et réussie. | CLOSED |

## Validation des vingt contre-tests critiques

| # | Scénario | Résultat directement observé |
| ---: | --- | --- |
| 1 | Autorité sans rôle refusée | PASS |
| 2 | Autorité inconnue refusée | PASS |
| 3 | Recovery avec processus actif | PASS |
| 4 | Recovery avec worktree modifié | PASS |
| 5 | Recovery avec `UNKNOWN` bloqué | PASS |
| 6 | READ_ONLY avec worktree pré-sali refusé | PASS |
| 7 | Écriture READ_ONLY provoquant l’échec | PASS |
| 8 | Profil READ_ONLY non surchargeable | PASS |
| 9 | Lock identique malgré variation de casse Windows | PASS |
| 10 | Conflit parent/enfant détecté | PASS |
| 11 | Projection contradictoire rejetée | PASS |
| 12 | Événement supprimé et chaîne recalculée rejetés | PASS |
| 13 | Journal tronqué puis re-signé rejeté | PASS |
| 14 | Prompt modifié rejeté | PASS |
| 15 | Manifest modifié rejeté | PASS |
| 16 | ExecutionRequest modifiée rejetée | PASS |
| 17 | Rapport modifié rejeté | PASS |
| 18 | Modification directe de projection rejetée | PASS |
| 19 | Replay identique à la projection | PASS |
| 20 | Transition interdite après terminal refusée | PASS |

```text
PASS: 20
FAIL: 0
NON EXÉCUTABLE: 0
```

## Commandes réexécutées

| Commande | Code retour | Résultat |
| --- | ---: | --- |
| `npm.cmd run typecheck:nova-core` | 0 | Typecheck PASS |
| `npm.cmd test` | 0 | 59/59 : orchestrateur 15/15, NOVA Core 44/44 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreReporting.ps1` | 0 | 19/19 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreRuntimeE2E.ps1` | 0 | 15/15 |
| Total PowerShell obligatoire | 0 | 34/34 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreExceptionCapture.ps1` | 0 | 13/13 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreGovernance.ps1` | 0 | 25/25 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreContextAssembly.ps1` | 0 | 23/23 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreContextRuntime.ps1` | 0 | 10/10 |
| Total PowerShell complémentaire | 0 | 71/71 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreSyntax.ps1` | 0 | Syntaxe PASS |
| `node.exe --import tsx --test server/runtime/journal/append-only-journal.test.ts server/runtime/orchestrator/canonical-state.test.ts` | 0 | 5/5 |

## Contrôles de périmètre et régression

| Contrôle | Résultat |
| --- | --- |
| HEAD | `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`, inchangé |
| Branche | `main` |
| Remote | Aucun |
| `git diff --check` | PASS, code 0 |
| Chemin CEREBRAU modifié | 0 |
| Chemin Pixel Perfect / `apps/nova-web` modifié | 0 |
| Motif de secret, token connu, clé privée ou JWT | 0 |
| Test désactivé, skip ou todo | 0 |
| Régression dans les suites exécutées | Aucune |
| Commit ou push pendant la mission | Aucun |
| Certificat runtime émis | Aucun |

## Limite de la validation

La décision porte sur l’état réel non commité présent dans le worktree au HEAD indiqué. Elle confirme les douze corrections demandées et leurs preuves ; elle ne constitue pas un nouvel audit général et ne recherche pas d’autres familles d’anomalies.

## Conclusion

Les affirmations de `RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003` sont confirmées dans le périmètre demandé. Les douze NRA anciennement `PARTIAL` satisfont les critères de fermeture, les vingt contre-tests critiques passent et aucune régression n’est observée dans les campagnes imposées.

Aucun certificat runtime n’a été créé.
