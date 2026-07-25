# RUNTIME-NOVA-FINAL-INDEPENDENT-CERTIFICATION-002

## 1. Résumé exécutif

Décision proposée : **NO GO**.

L’audit a été exécuté sur le dépôt réel, sans reprendre la conclusion de la mission de clôture. Le HEAD attendu est présent et n’a pas changé. Les suites annoncées sont reproductibles et réussissent : 47/47 tests Node, 33/33 tests PowerShell et typecheck. Les suites complémentaires réussissent également.

La conclusion de clôture « 23 NRA CLOSED » est toutefois contredite par le runtime actif et par des contre-tests indépendants. Cinq comportements critiques échouent : enforcement READ_ONLY, worktree READ_ONLY pré-sali, casse Windows des locks, autorité du journal face à une projection contradictoire, et détection d’un événement terminal supprimé puis re-signé. L’autorisation HTTP ne modélise en outre aucun rôle/permission, et le recovery utilise deux valeurs constantes au lieu de sonder le processus et le worktree.

Résultat NRA : **11 CLOSED, 12 PARTIAL, 0 OPEN**. Les critères du GO exigent 23 CLOSED et aucun PARTIAL.

## 2. Baseline

Baseline enregistrée avant création des présents livrables :

```text
git rev-parse --show-toplevel
C:/DEV/NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)/nova-core-mvp

git branch --show-current
main

git rev-parse HEAD
d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7

git remote -v
<aucune sortie>

git diff --check
code retour 0 ; warnings de conversion LF/CRLF uniquement

node --version
v24.16.0

npm --version
11.13.0

git --version
git version 2.54.0.windows.1

pwsh --version
commande absente

powershell $PSVersionTable.PSVersion
5.1.26100.8894

codex --version
codex-cli 0.145.0
```

Le worktree était déjà non propre. Il contenait 19 fichiers suivis modifiés et des fichiers non suivis issus des missions précédentes. Cette situation interdit d’attribuer les changements au seul diff de HEAD, mais n’empêche pas l’inspection de l’état courant. Aucun des trois livrables `002` n’existait lors de cette baseline.

## 3. Méthodologie

1. Lecture intégrale des six documents obligatoires.
2. Reconstruction des causes et criticités depuis le premier audit indépendant.
3. Inspection des imports, routes montées, services appelés, stores, runners et tests.
4. Exécution indépendante des commandes réelles du dépôt.
5. Contre-tests en ligne sur des répertoires temporaires, sans créer de source ou de test dans le dépôt.
6. Contrôle des dépendances CEREBRAU, des chemins Pixel Perfect, des marqueurs de tests désactivés et de motifs de secrets.
7. Comparaison des preuves avec les cinq critères de fermeture imposés.

Les rapports de clôture ont été utilisés comme affirmations à vérifier, jamais comme preuve autonome.

## 4. Fichiers examinés

Documents lus intégralement :

- `RUNTIME_NOVA_FINAL_CERTIFICATION_AUDIT_001_REPORT.md`
- `RUNTIME_NOVA_FINAL_GO_NO_GO.md`
- `RUNTIME_NOVA_CERTIFICATION_MATRIX.md`
- `RUNTIME_NOVA_CERTIFICATION_CLOSURE_REPORT.md`
- `RUNTIME_NOVA_CERTIFICATION_FIX_MATRIX.md`
- `RUNTIME_NOVA_REGRESSION_REPORT.md`

Principaux chemins actifs examinés :

- `server/nova-core/nova-core.server.ts`
- `server/nova-core/nova-core.http.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.execution.ts`
- `server/nova-core/nova-core.store.ts`
- `server/nova-core/runtime-migration.ts`
- `server/nova-core/mission-certification.ts`
- `server/nova-core/run-binding.ts`
- `server/nova-core/git-preflight.ts`
- `server/nova-core/scope-validation.ts`
- `server/nova-core/validation-matrix.ts`
- `server/runtime/orchestrator/orchestrator-runtime.service.ts`
- `server/runtime/orchestrator/orchestrator-runtime.types.ts`
- `server/runtime/orchestrator/canonical-state.ts`
- `server/runtime/journal/append-only-journal.ts`
- `tools/nova-core-runtime/Invoke-NovaCoreMission.ps1`
- `tools/nova-core-runtime/NovaCore.Reporting.psm1`
- `tools/nova-core-runtime/NovaCore.Governance.psm1`
- `DEMARRER_NOVA.bat`
- les tests associés à ces composants.

## 5. Commandes exécutées

| Commande exacte | Répertoire | Code retour | Tests exécutés | Réussis | Échoués | Durée observée | Preuve |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `npm.cmd run typecheck:nova-core` | racine | 0 | n/a | n/a | 0 | 1,654 s | sortie `tsc -p tsconfig.nova-core.json` |
| `npm.cmd test` | racine | 0 | 47 | 47 | 0 | 3,857 s | orchestrateur 12/12, NOVA Core 35/35 |
| `powershell.exe ... Test-NovaCoreReporting.ps1` | racine | 0 | 18 | 18 | 0 | 1,991 s | résumé PowerShell |
| `powershell.exe ... Test-NovaCoreRuntimeE2E.ps1` | racine | 0 | 15 | 15 | 0 | 18,776 s | résumé PowerShell |
| `powershell.exe ... Test-NovaCoreSyntax.ps1` | racine | 0 | n/a | n/a | 0 | 0,559 s | aucune erreur de parsing |
| `powershell.exe ... Test-NovaCoreExceptionCapture.ps1` | racine | 0 | 13 | 13 | 0 | 0,881 s | résumé PowerShell |
| `powershell.exe ... Test-NovaCoreGovernance.ps1` | racine | 0 | 25 | 25 | 0 | 2,036 s | résumé PowerShell |
| `powershell.exe ... Test-NovaCoreContextAssembly.ps1` | racine | 0 | 23 | 23 | 0 | 1,511 s | résumé PowerShell |
| `powershell.exe ... Test-NovaCoreContextRuntime.ps1` | racine | 0 | 10 | 10 | 0 | 5,845 s | résumé PowerShell |
| `node --import tsx --test server/runtime/journal/append-only-journal.test.ts server/runtime/orchestrator/canonical-state.test.ts` | racine | 0 | 5 | 5 | 0 | 0,190 s | TAP |
| `npm.cmd ci --ignore-scripts --offline --no-audit --no-fund --prefix <temp>` | copie jetable | 0 | n/a | n/a | 0 | 2,887 s | 6 packages ; lockfile SHA-256 inchangé |
| contre-test scopes + autorité | racine, données en mémoire | 2 attendu | 7 assertions | 5 | 2 | 0,193 s | casse Windows `false`; rôle insuffisant accepté |
| contre-test READ_ONLY avec création | copie jetable | 2 attendu | 1 | 0 | 1 | 0,963 s | exécution résolue avec blocker |
| contre-test READ_ONLY pré-sali | copie jetable | 2 attendu | 1 | 0 | 1 | 0,158 s | exécution résolue sans blocker |
| contre-test journal/projection | copie jetable | 2 attendu | 1 | 0 | 1 | 1,048 s | état `CERTIFIED` accepté face à journal `READY` |
| contre-test événement terminal supprimé | copie jetable | 2 attendu | 1 | 0 | 1 | 0,870 s | journal tronqué et re-signé accepté |
| `git diff --check` | racine | 0 | n/a | n/a | 0 | n/a | aucun défaut de whitespace |

Les codes `2 attendu` sont produits volontairement par les harnais d’audit lorsqu’un contournement est reproduit.

## 6. Résultats des tests indépendants

### Résultats positifs

- typecheck : PASS ;
- Node annoncé : 47/47 PASS ;
- PowerShell obligatoire : 33/33 PASS ;
- PowerShell complémentaire : 71/71 PASS et syntaxe PASS ;
- journal et état canoniques, primitives : 5/5 PASS ;
- migrations v0/v1/v2, projection corrompue, journal naïvement corrompu, interruption et rollback : PASS ;
- bootstrap temporaire `npm ci --offline` : PASS, lockfile inchangé ;
- HTTP : route `/certify`, absence de jeton, mauvais run, mauvais fingerprint, rapport/livrable altéré, double certification et vérification du certificat : PASS ;
- SSE : stdout et stderr observés pendant le run : PASS ;
- Git preflight : detached, unborn, submodule et drift entre captures : PASS ;
- timeout, cancel, kill d’un descendant et gros flux : PASS.

### Résultats bloquants

1. `authenticateCertificationAuthority` accepte une autorité `READ_ONLY_VIEWER` dès que son bearer token correspond. Aucun rôle ou droit `certify` n’existe dans le modèle.
2. `recoverMission` appelle `classifyRunRecovery` avec `processAlive:false` et `worktreeModified:false`. Il ne peut donc pas distinguer les cas requis.
3. Une mission READ_ONLY qui crée `audit.txt` retourne normalement un rapport avec `scopeConfirmed:true` et un blocker. L’orchestrateur soumet tout rapport qui confirme scope et livrables ; il ne rejette pas les blockers dans `submitReport`.
4. Une mission READ_ONLY lancée sur un worktree déjà modifié réussit sans blocker.
5. `scopesOverlap("Server/Nova-Core/**", "server/nova-core/http/**")` retourne `false` sous Windows, alors que PowerShell fait une comparaison insensible à la casse.
6. Un `runtime.json` avec journal terminant en `READY`, projection `CERTIFIED` et checksums recalculés est déclaré intègre et chargé en `CERTIFIED`.
7. Le dernier événement peut être supprimé, journal et projection ajustés, puis les checksums recalculés ; le store charge l’historique tronqué sans ancrage externe.

## 7. Tests négatifs minimaux

| # | Scénario | Résultat | Preuve / justification |
| ---: | --- | --- | --- |
| 1 | Ancien rapport présent | PASS | recherche bornée au dossier du run ; binding stale refusé |
| 2 | Rapport d’un autre run | PASS | mismatch `runId` |
| 3 | Prompt modifié après run | FAIL | artefact non relu lors de `/certify` |
| 4 | Manifest modifié après run | FAIL | artefact non relu lors de `/certify` |
| 5 | ExecutionRequest modifiée après run | FAIL | artefact non relu lors de `/certify` |
| 6 | Fingerprint modifié | PASS | HTTP 422 |
| 7 | Processus bloqué | PASS | timeout configurable |
| 8 | Timeout | PASS | état TIMEOUT et verrou libéré |
| 9 | Annulation | PASS | état CANCELLED et verrou libéré |
| 10 | Processus ignorant le premier signal | NON EXÉCUTABLE | aucun scénario dédié ; Windows utilise directement `/F` |
| 11 | stdout volumineux | PASS | bornage Node/PowerShell |
| 12 | stderr volumineux | PASS | bornage Node/PowerShell |
| 13 | Codex absent | PASS | bootstrap refuse |
| 14 | Version Codex incompatible | PASS | `0.143.9` refusée |
| 15 | Detached HEAD | PASS | preflight refuse |
| 16 | Unborn branch | PASS | preflight refuse |
| 17 | Worktree modifié entre preflights | PASS | fingerprint drift refusé |
| 18 | READ_ONLY modifiant un fichier | FAIL | contre-test : exécution résolue avec blocker |
| 19 | Contournement READ_ONLY via HTTP | PASS partiel | override BUILD refusé ; l’écriture reste contournable selon #18 |
| 20 | Conflit parent/enfant | FAIL | même casse refusée, variation de casse acceptée |
| 21 | Dossier frère avec préfixe identique | PASS | comparaison segment-aware |
| 22 | Verrou orphelin | PASS partiel | lock actif classé ORPHAN_LOCK, sans sonde processus/worktree |
| 23 | Snapshot corrompu | PASS | reconstruction si checksum projection invalide |
| 24 | Journal corrompu | PASS | altération naïve détectée |
| 25 | Événement manquant | FAIL | suppression terminale re-signée acceptée |
| 26 | Séquence dupliquée | PASS | rejet `SEQUENCE_GAP` |
| 27 | Crash pendant RUNNING | FAIL | processus forcé à `false`, pas de détection réelle |
| 28 | Rapport absent après crash | FAIL | absence déduite de la projection, pas de l’artefact |
| 29 | Rapport présent après crash | FAIL | test existant injecte le rapport dans le snapshot |
| 30 | Certification sans authentification | PASS | HTTP 401 |
| 31 | Autorité inconnue | PASS | bearer inconnu refusé |
| 32 | Mauvais runId | PASS | HTTP 422 |
| 33 | Mauvais fingerprint | PASS | HTTP 422 |
| 34 | Rapport modifié | PASS | dérive de fingerprint refusée |
| 35 | Double certification | PASS | HTTP 409 |
| 36 | Migration interrompue | PASS | fichier temporaire incomplet ignoré, source migrée |
| 37 | Rollback de migration | PASS | restauration v0 observée |

Un scénario critique `NON EXÉCUTABLE` est une preuve manquante conformément à la mission.

## 8. Matrice des 23 NRA

La matrice détaillée est dans `RUNTIME_NOVA_FINAL_CERTIFICATION_MATRIX_002.md`.

| Statut | Nombre |
| --- | ---: |
| CLOSED | 11 |
| PARTIAL | 12 |
| OPEN | 0 |

Les NRA P0/P1 non fermées sont `NRA-001`, `NRA-007`, `NRA-009`, `NRA-011`, `NRA-013`, `NRA-014` et `NRA-015`.

## 9. Contradictions code/rapports

- Le rapport de clôture annonce un recovery distinguant process, rapport et worktree ; le code fixe deux de ces entrées à `false`.
- Il annonce READ_ONLY non contournable ; les deux contre-tests montrent une exécution résolue sur worktree pré-sali et après création de fichier.
- Il annonce des locks Windows cohérents ; le matcher TypeScript est sensible à la casse alors que le matcher PowerShell est insensible à la casse.
- Il annonce un journal autoritatif ; `openCurrentEnvelope` retourne directement la projection si ses deux checksums internes sont valides, sans la comparer au replay.
- Il annonce une couverture complète ; aucun test annoncé ne couvre ces quatre contournements, ni l’autorisation par rôle.
- Il annonce des plafonds séparés ; le runner Node comptabilise stdout et stderr dans `outputBytes` commun.
- Le launcher demande bien une installation séparée par `npm ci`, mais `server/nova-core/README.md` recommande encore `npm install`.

## 10. Régressions et contrôles de périmètre

- Aucun fichier dont le chemin contient `CEREBRAU` ou `apps/nova-web`/Pixel Perfect n’est modifié dans l’état audité.
- Les seules occurrences actives de `CEREBRAU` examinées sont une constante de faits à `false` et un commentaire déclarant l’absence de dépendance ; aucun import runtime actif n’a été trouvé.
- Aucun marqueur explicite `test.skip`, `describe.skip`, `it.skip` ou `.only` n’a été identifié dans les suites ciblées.
- Scan ciblé : aucune clé privée, aucun token OpenAI/GitHub/AWS et aucun JWT détecté.
- Aucun remote Git n’est configuré.
- Aucun commit ni push n’a été réalisé par cet audit.
- `git diff --check` : PASS.

Le worktree reste préexistant et non propre ; l’audit n’a modifié que les trois livrables autorisés.

## 11. Risques résiduels

Risques bloquants :

- certification possible par une autorité configurée mais non habilitée ;
- classification recovery incorrecte lorsque le processus vit encore ou lorsque le worktree a dérivé ;
- mission READ_ONLY techniquement terminée et soumise malgré violation ;
- double lock sur la même zone Windows par variation de casse ;
- projection forgeable ou perte terminale d’événements non détectable sans ancrage indépendant ;
- certification ne revalidant pas tous les artefacts persistés de la chaîne ;
- double représentation d’état active.

## 12. Limitations de l’audit

- `pwsh` n’est pas installé ; les suites PowerShell ont été exécutées avec Windows PowerShell 5.1, qui est aussi l’interpréteur configuré par les scripts du dépôt.
- Le worktree était déjà très modifié et non suivi par rapport au HEAD. L’audit certifie l’état courant observé, pas l’auteur ni la chronologie de chaque changement.
- Aucun processus Codex de production ni certificat runtime de production n’a été lancé.
- Le scénario d’un processus POSIX ignorant `SIGTERM` n’était pas exécutable sur cette plateforme Windows et n’a pas de test dédié dans le dépôt.
- Les altérations journal/projection ont été réalisées uniquement sur des fichiers temporaires jetables.

## 13. Conclusion

La chaîne comporte des améliorations substantielles et les campagnes standard sont vertes, mais les conditions critiques du GO ne sont pas toutes prouvées. En particulier, READ_ONLY, recovery, locks Windows, autorisation HTTP et autorité du journal restent partiels.

Conclusion factuelle : **NO GO**.

Cette mission est une autorité d’audit uniquement et n’a produit aucun certificat runtime.
