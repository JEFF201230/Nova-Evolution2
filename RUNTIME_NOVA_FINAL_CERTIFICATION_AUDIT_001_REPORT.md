# RUNTIME NOVA — Audit final indépendant de certification

Mission : `RUNTIME-NOVA-FINAL-CERTIFICATION-AUDIT-001`
Date : 2026-07-25
Mode : lecture seule stricte, hors création des trois livrables d'audit autorisés
Décision : **NO GO**

## 1. Résumé exécutif

Le runtime NOVA n'est pas éligible à la certification finale dans son état réel audité.

Les résultats positifs annoncés sont reproductibles :

- le HEAD est exactement `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7` ;
- 47/47 tests Node passent ;
- les 18 tests PowerShell de reporting et les 15 scénarios E2E passent, soit les 33/33 annoncés ;
- le typecheck passe ;
- `git diff --check` passe ;
- `npm ci --ignore-scripts --offline` passe sur une copie jetable et ne modifie pas le lockfile ;
- aucun remote Git n'est configuré, aucun commit n'a été créé et aucune preuve de push n'existe ;
- aucun fichier CEREBRAU ni interface Pixel Perfect n'est modifié.

Ces résultats ne suffisent pas à établir la certification. Les conditions critiques suivantes échouent :

1. Le journal append-only hash-chaîné n'est importé ni utilisé par le runtime actif. Le journal actif est un tableau inclus dans `runtime.json`, protégé seulement par un checksum global.
2. La machine d'état dite canonique n'est pas branchée. Le runtime actif utilise une seconde machine legacy distincte.
3. Le recovery n'offre aucune commande active `reconcile`, `resume`, `abandon`, `quarantine` ou `recover`.
4. Une mission AUDIT automatiquement classée `READ_ONLY` peut être forcée en `BUILD` via la requête d'exécution.
5. Les verrous parent/enfant ne se recouvrent pas dans le lock manager actif : deux verrous concurrents ont été obtenus sur `server/nova-core/**` et `server/nova-core/http.ts`.
6. La certification authentifiée existe, mais un endpoint `/approve` anonyme reste une voie finale parallèle; un second appel de certification retourne le certificat existant au lieu d'être refusé; un `runId` client erroné n'est pas validé.
7. Le chemin/version/hash du binaire Codex ne sont pas inclus dans le binding effectif et la configuration utilisateur/environnement n'est pas isolée.
8. Les migrations v0/v1/v2 sont testées, mais l'interruption de migration et le rollback effectif ne le sont pas.

Sur 23 anomalies : 5 sont `CLOSED`, 12 sont `PARTIAL` et 6 sont `OPEN`. Plusieurs anomalies P0/P1 sont non fermées. La règle de décision imposée conduit donc obligatoirement à **NO GO**.

## 2. Baseline exacte

### 2.1 Dépôt et outils

Commandes et sorties utiles capturées avant création des livrables :

```text
> git branch --show-current
main

> git rev-parse HEAD
d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7

> git rev-parse --show-toplevel
C:/DEV/NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)/nova-core-mvp

> git remote -v
<aucune sortie>

> node --version
v24.16.0

> npm --version
11.13.0

> git --version
git version 2.54.0.windows.1

> pwsh --version
échec : pwsh est introuvable

> powershell.exe -NoProfile -Command '$PSVersionTable.PSVersion.ToString()'
5.1.26100.8894

> codex --version
échec : l'exécution de C:\Users\JEFF1\AppData\Roaming\npm\codex.ps1 est bloquée par la stratégie d'exécution PowerShell

> codex.cmd --version
codex-cli 0.145.0
```

Le dépôt est un worktree Git valide, sur `main`, non detached et avec un HEAD existant. Aucun sous-module n'est déclaré dans la sortie du preflight. Aucun remote n'est configuré.

### 2.2 Worktree initial

Le worktree n'était pas propre avant l'audit : 62 entrées, soit 16 fichiers suivis modifiés et 46 fichiers non suivis. Ces changements correspondent au release train non commité et aux documents antérieurs; ils ont été traités comme état d'entrée, pas comme preuves automatiquement fiables.

Hash canonique de la sortie initiale `git status --short` : `13906a2f6519a01f9ee2bb46ac5549d7b4b7049e8a9a3ad16b65e6d45bba656b`.

```text
 M server/nova-core/nova-core.execution.test.ts
 M server/nova-core/nova-core.execution.ts
 M server/nova-core/nova-core.http.test.ts
 M server/nova-core/nova-core.http.ts
 M server/nova-core/nova-core.server.ts
 M server/nova-core/nova-core.service.test.ts
 M server/nova-core/nova-core.service.ts
 M server/nova-core/nova-core.store.ts
 M server/nova-core/nova-core.types.ts
 M server/runtime/orchestrator/orchestrator-runtime.service.ts
 M server/runtime/orchestrator/orchestrator-runtime.test.ts
 M server/runtime/orchestrator/orchestrator-runtime.ts
 M server/runtime/orchestrator/orchestrator-runtime.types.ts
 M tools/nova-core-runtime/Invoke-NovaCoreMission.ps1
 M tools/nova-core-runtime/NovaCore.Reporting.psm1
 M tools/nova-core-runtime/Test-NovaCoreReporting.ps1
?? LOCK_LIFECYCLE_SPEC.md
?? MISSION_EVENT_SCHEMA.md
?? MISSION_MONITOR_DATA_FLOW.md
?? RUNTIME_ACTION_PLAN.md
?? RUNTIME_NOVA_AGENT_A_FINDINGS.md
?? RUNTIME_NOVA_AGENT_C_FINDINGS.md
?? RUNTIME_NOVA_AGENT_D_FINDINGS.md
?? RUNTIME_NOVA_AUDIT_001_REPORT.md
?? RUNTIME_NOVA_CANONICAL_STATE_MACHINE.md
?? RUNTIME_NOVA_CERTIFICATE_SPEC.md
?? RUNTIME_NOVA_CERTIFICATION_SPEC.md
?? RUNTIME_NOVA_EVENT_JOURNAL_SPEC.md
?? RUNTIME_NOVA_MIGRATION_AND_ROLLBACK_PLAN.md
?? RUNTIME_NOVA_MIGRATION_VALIDATION.md
?? RUNTIME_NOVA_OBSERVABILITY_001_REPORT.md
?? RUNTIME_NOVA_RECOVERY_SPEC.md
?? RUNTIME_NOVA_RELEASE_WAVE_1_REPORT.md
?? RUNTIME_NOVA_RELEASE_WAVE_2_REPORT.md
?? RUNTIME_NOVA_RELEASE_WAVE_3_REPORT.md
?? RUNTIME_NOVA_REMAINING_ANOMALIES_MATRIX.md
?? RUNTIME_NOVA_REPORT_BINDING_SPEC.md
?? RUNTIME_NOVA_SCOPE_AND_LOCK_SPEC.md
?? RUNTIME_NOVA_SQUAD_BASELINE.md
?? RUNTIME_NOVA_SQUAD_REMEDIATION_001_REPORT.md
?? RUNTIME_NOVA_TEST_COVERAGE_MATRIX.md
?? RUNTIME_NOVA_TRANSACTION_INTEGRITY_001_REPORT.md
?? RUNTIME_RECONCILIATION_MATRIX.md
?? TRANSACTION_STATE_MACHINE.md
?? server/nova-core/git-preflight.test.ts
?? server/nova-core/git-preflight.ts
?? server/nova-core/mission-certification.test.ts
?? server/nova-core/mission-certification.ts
?? server/nova-core/nova-core.bootstrap.test.ts
?? server/nova-core/nova-core.bootstrap.ts
?? server/nova-core/process-runner.test.ts
?? server/nova-core/run-binding.test.ts
?? server/nova-core/run-binding.ts
?? server/nova-core/runtime-migration.test.ts
?? server/nova-core/runtime-migration.ts
?? server/nova-core/scope-validation.test.ts
?? server/nova-core/scope-validation.ts
?? server/nova-core/validation-matrix.test.ts
?? server/nova-core/validation-matrix.ts
?? server/runtime/journal/
?? server/runtime/orchestrator/canonical-state.test.ts
?? server/runtime/orchestrator/canonical-state.ts
```

Le reflog ne contient que le commit initial attendu. Il n'existe aucune ref distante et donc aucune preuve locale de push.

## 3. Méthode d'audit

L'audit a suivi cinq règles :

1. les rapports précédents ont servi uniquement d'index de prétentions ;
2. chaque prétention a été comparée aux imports, routes et appels du chemin actif ;
3. les suites ont été exécutées depuis le dépôt réel, sans réutiliser leurs résultats documentés ;
4. les migrations et installations ont été testées uniquement sur des copies jetables sous le répertoire temporaire du système ;
5. aucun code, rapport antérieur, fichier CEREBRAU, commit, remote ou donnée de runtime existante n'a été modifié.

La vérification d'une primitive isolée n'a pas été assimilée à son câblage. Cette distinction est déterminante pour le journal, le recovery et la machine d'état.

## 4. Inventaire des livrables

Tous les 25 livrables demandés existent. Les dates sont en UTC.

| Livrable | Octets | Dernière écriture UTC | SHA-256 | Cohérence avec le runtime réel |
|---|---:|---|---|---|
| `RUNTIME_NOVA_AUDIT_001_REPORT.md` | 25016 | 2026-07-24T20:54:47.8368046Z | `71098d3f2fe4f8e4f8971a9decf3178abe0e2cb99b399677e6b17112d47656c6` | Cohérent comme état initial; conclusions non utilisables comme preuve finale. |
| `RUNTIME_RECONCILIATION_MATRIX.md` | 8585 | 2026-07-24T20:54:49.2931705Z | `82f30406273b43353c98599b8f119130496ad84fd64b2c1e51531523a29f2570` | Cohérent avec les écarts initiaux. |
| `RUNTIME_ACTION_PLAN.md` | 8254 | 2026-07-24T20:54:50.7343461Z | `f64e6e35832e336eb5754cee09f0990348c71f67e275f2bcca18e0703aaca531` | Critères précis; plusieurs ne sont pas satisfaits par le code final. |
| `RUNTIME_NOVA_OBSERVABILITY_001_REPORT.md` | 2198 | 2026-07-24T21:17:46.4548652Z | `a7129180b196c662dfe6a0c7ae8600e9046b83f098e57581464055294cf9d70a` | SSE et diagnostics présents; absence de test SSE et de streaming stdout/stderr. |
| `MISSION_EVENT_SCHEMA.md` | 1346 | 2026-07-24T21:16:44.3040588Z | `c9fef250af7277af835b08f783ff820724b6d90d2ce17f4d5cc8a691bb2d4523` | Incomplet face aux phases CANCELLED/TIMEOUT ajoutées ensuite. |
| `MISSION_MONITOR_DATA_FLOW.md` | 1344 | 2026-07-24T21:16:44.9475092Z | `2934a6f19e093ff62719b28a9f24b4a7e69101f487ed77ff90e8043de0e869b0` | Route montée; comportement live non testé. |
| `RUNTIME_NOVA_TRANSACTION_INTEGRITY_001_REPORT.md` | 1643 | 2026-07-24T21:27:18.8969164Z | `3921d078b5a523613637e90897518cfaa3d7746644db8ced0c5b8a471e8099c7` | Rollback service et sauvegarde atomique confirmés. |
| `TRANSACTION_STATE_MACHINE.md` | 1055 | 2026-07-24T21:26:34.2720525Z | `d9a771a3de0e65c5dde6fc2c69f59e289461560feed0763ace719c1d0b8b5e6f` | Cohérent pour les transactions, pas pour l'unicité globale d'état. |
| `LOCK_LIFECYCLE_SPEC.md` | 982 | 2026-07-24T21:26:34.9085340Z | `9631bdda971825cb153fd2f015152b095986b78c31f68d2769cbf439908476c7` | Libération terminale présente; recouvrement parent/enfant absent. |
| `RUNTIME_NOVA_SQUAD_BASELINE.md` | 2487 | 2026-07-24T21:35:52.6116023Z | `e86bdfbe8696632fbf54082cf1d2fe236b484076a9be660deb8d14afa7e7daad` | Baseline informative. |
| `RUNTIME_NOVA_SQUAD_REMEDIATION_001_REPORT.md` | 3336 | 2026-07-24T21:43:08.3978267Z | `33b8950381bc11f8c117afef51e203d4e658a87a23a91359642c958ade234dfd` | Reconnaît correctement plusieurs primitives isolées et écarts ouverts. |
| `RUNTIME_NOVA_REMAINING_ANOMALIES_MATRIX.md` | 1532 | 2026-07-24T21:43:09.0415922Z | `03eaabf31d9e07176b3068e89083832f312b531c2a610597016fe2fc9a8dabc4` | Devenue partiellement obsolète après les vagues, mais ses alertes journal/recovery restent valides. |
| `RUNTIME_NOVA_CANONICAL_STATE_MACHINE.md` | 617 | 2026-07-24T21:43:09.6688413Z | `8851eb5709c3d4d4191a85f4872cad15c97b7d8d70689e9ed39c6502d80aeb29` | Décrit une cible non branchée; la machine legacy reste active. |
| `RUNTIME_NOVA_EVENT_JOURNAL_SPEC.md` | 588 | 2026-07-24T21:43:10.3198314Z | `cd81edad2a31c42c37c35740e3e639670fc685bb2aa2f608a91c17eb0963f186` | Dit explicitement que la persistance append-only est en attente; conforme au constat. |
| `RUNTIME_NOVA_REPORT_BINDING_SPEC.md` | 543 | 2026-07-24T21:43:10.9691925Z | `ae0792be83143c5322138b26d358b3b4b836ac3b7a8e57d557a957dde178bb77` | Partiellement dépassé : liaison PowerShell ajoutée, champs Codex encore absents. |
| `RUNTIME_NOVA_CERTIFICATION_SPEC.md` | 503 | 2026-07-24T21:43:11.6067465Z | `43f1631969f8c7187d9cd0b22a70af41601880fabc394c956d76656ce033ccd7` | Primitive exacte; documente lui-même que l'API/double-certification étaient ouvertes. |
| `RUNTIME_NOVA_RECOVERY_SPEC.md` | 427 | 2026-07-24T21:43:12.2400946Z | `ee815409375e39d89096ab338758c6b28208e720dc4766c76a0a8e5e0a8ae0f0` | Confirme que les commandes de recovery sont futures. |
| `RUNTIME_NOVA_SCOPE_AND_LOCK_SPEC.md` | 480 | 2026-07-24T21:43:29.2198693Z | `c364fd8266d27a40da63b830e1c2896666d9035bce8ea74088565567b42dc6b4` | Primitives scope présentes, lock manager non raccordé. |
| `RUNTIME_NOVA_TEST_COVERAGE_MATRIX.md` | 643 | 2026-07-24T21:43:44.6808769Z | `496d403282078ec01382755850aea6188959a555bd42d49ed22bf9a6f1e00227` | Obsolète sur timeout/preflight, encore exacte sur replay durable/SSE manquants. |
| `RUNTIME_NOVA_MIGRATION_AND_ROLLBACK_PLAN.md` | 2791 | 2026-07-24T22:59:09.4612161Z | `5ffa2d1a20ec692f30085eddd6f292fd9819896ef0f7ea19fa5205864feee9f5` | Plan documenté; rollback non exécuté par les tests. |
| `RUNTIME_NOVA_RELEASE_WAVE_1_REPORT.md` | 3963 | 2026-07-24T22:48:48.4492127Z | `2f2daffc2c89029673e24f5322dad957a52672effdd1cca33b734d8928e53177` | Sur-déclare « anomalies d'exécution CLOSED » : chemin PowerShell secondaire non borné et validations de livrables incomplètes. |
| `RUNTIME_NOVA_RELEASE_WAVE_2_REPORT.md` | 2390 | 2026-07-24T23:00:47.4891009Z | `900005312ce9950f08ecd2bc0cb39de8acc7eedc58d510a842e6f8de07e5c724` | API réelle et authentifiée, mais double certification non refusée et voie `/approve` parallèle. |
| `RUNTIME_NOVA_CERTIFICATE_SPEC.md` | 3854 | 2026-07-24T22:53:57.1816054Z | `ccee146e7422bd081d642b5eb59638047d61e2025a7d6e91adb1a778b0accf54` | Liaison HMAC vérifiable; ne prouve pas les contrôles HTTP manquants. |
| `RUNTIME_NOVA_RELEASE_WAVE_3_REPORT.md` | 1852 | 2026-07-24T23:00:48.1645878Z | `6ffada05eda204b6b3b570e751a385952b5a73cead85ac70dee9dc01acea4826` | Migrations présentes; assimile à tort le journal isolé au journal actif. |
| `RUNTIME_NOVA_MIGRATION_VALIDATION.md` | 2778 | 2026-07-24T22:59:10.1368111Z | `db1013c39d6dedfe4bc7a411d5e775f9c9882b60904ae5b420a8439370ae8aa0` | Tests v0/v1/v2 reproductibles; indique explicitement qu'aucun rollback n'a été exécuté. |

## 5. Audit du runtime effectif

| Domaine | Résultat | Preuve déterminante |
|---|---|---|
| A. Observabilité | PARTIAL | Diagnostics et SSE branchés, runs persistés; aucune couverture SSE et aucun flux stdout/stderr live. |
| B. Transactions et verrous | PARTIAL | Rollback, sérialisation et rename atomique passent; lock parent/enfant échoue et recovery orphelin absent. |
| C. Déterminisme/report binding | PARTIAL | Dossier/run/hashes/HEAD/branche présents; chemin/version/hash Codex non renseignés et deux définitions de fingerprint subsistent. |
| D. Timeout/annulation | PARTIAL | Runner TypeScript robuste et testé; runner PowerShell de validations lit les flux séquentiellement sans timeout. |
| E. Machine d'état | FAIL | `canonical-state.ts` n'est pas importé; `MissionState` et `TRANSITIONS` legacy gouvernent le runtime actif. |
| F. Journal append-only | FAIL | `AppendOnlyJournal` n'est pas importé; événements actifs sans `previousHash`, `eventHash`, `schemaVersion`. |
| G. Recovery | FAIL | Détection passive de runs incomplets, aucune commande de recovery/reconciliation active. |
| H. READ_ONLY | FAIL | Override API `profile=BUILD` reproduit sur une mission AUDIT. |
| I. Git preflight | PASS | Contrôles complets et deuxième vérification immédiatement avant spawn, tests négatifs inclus. |
| J. Scopes | FAIL | Primitives TS correctes, mais lock manager non branché sur `scopesOverlap`, PowerShell utilise une autre grammaire et `safeName` reste actif pour les dossiers mission. |
| K. Validation par fichiers | PARTIAL | Sélection dynamique réelle; livrables non vérifiés par existence/hash/taille/date/rattachement. |
| L. Certification | PARTIAL | Endpoint authentifié, HMAC et persistance réels; mauvais `runId` non validé, double certification non refusée, `/approve` anonyme parallèle. |
| M. Migrations | PARTIAL | v0/v1/v2, idempotence et corruption testés sur copies; interruption et rollback non testés. |
| N. Bootstrap | PARTIAL | Node >=22 et lockfile présents; launcher utilise `npm install`, couple installation/démarrage et ne bloque pas Git/Codex absents. |

### 5.1 Doubles vérités critiques

Machine d'état :

- cible isolée : `server/runtime/orchestrator/canonical-state.ts` ;
- source active : `server/runtime/orchestrator/orchestrator-runtime.types.ts` et `orchestrator-runtime.service.ts:26-97`.

Journal :

- cible isolée : `server/runtime/journal/append-only-journal.ts` ;
- source active : `OrchestratorEventBus` puis enveloppe `runtime.json` dans `runtime-migration.ts`.

Fingerprint :

- PowerShell : `Get-NovaCoreOfficialReportFingerprint`, qui neutralise `ReportFingerprint` avant hash ;
- TypeScript : `fingerprintReport(report)`, qui hash l'objet officiel complet, y compris son champ PowerShell.

Les trois couples ne sont pas des projections démontrées d'une même vérité; ils sont des implémentations concurrentes.

## 6. Tests indépendants

### 6.1 Suites principales

| Commande exacte | Exit | Résultat | Durée mesurée |
|---|---:|---|---:|
| `npm.cmd run typecheck:nova-core` | 0 | TypeScript sans erreur | 1388 ms |
| `npm.cmd run test:runtime` | 0 | 10/10 réussis | 657 ms mur; 221.7959 ms Node |
| `npm.cmd run test:core` | 0 | 32/32 réussis | 2274 ms mur; 1856.1207 ms Node |
| `node --import tsx --test server/runtime/journal/append-only-journal.test.ts server/runtime/orchestrator/canonical-state.test.ts` | 0 | 5/5 réussis | 246 ms mur; 196.7009 ms Node |

Total Node : **47 réussis, 0 échoué**.

### 6.2 Suites PowerShell

Les suites supplémentaires ont été exécutées depuis une copie jetable structurée comme un dépôt. Le premier essai de `Test-NovaCoreContextAssembly.ps1` avait copié le dossier à une profondeur incorrecte et a été écarté comme erreur de harnais; le rerun avec l'arborescence correcte passe 23/23.

| Suite | Exit | Réussis/total | Durée |
|---|---:|---:|---:|
| `Test-NovaCoreSyntax.ps1` | 0 | 13 fichiers parsés, 0 erreur | 552 ms |
| `Test-NovaCoreReporting.ps1` | 0 | 18/18 | 871 ms |
| `Test-NovaCoreRuntimeE2E.ps1` | 0 | 15/15 | 12953 ms |
| `Test-NovaCoreExceptionCapture.ps1` | 0 | 13/13 | 640 ms |
| `Test-NovaCoreGovernance.ps1` | 0 | 25/25 | 1595 ms |
| `Test-NovaCoreContextAssembly.ps1` | 0 | 23/23 | 1024 ms |
| `Test-NovaCoreContextRuntime.ps1` | 0 | 10/10 | 3742 ms |

Les 33 annoncés correspondent exactement à Reporting 18 + E2E 15. L'ensemble étendu représente 104 assertions réussies, plus le parse syntaxique.

`Test-NovaCoreMission.ps1` lancé sans argument termine avec exit 1 et `NOVA_CORE_MISSION_FILE_NOT_FOUND`, car aucun `tools/nova-core-runtime/mission.json` par défaut n'existe. Ce script est un validateur paramétré, pas une suite autonome; le résultat n'est pas compté comme test échoué du runtime.

### 6.3 Installation reproductible

```text
Commande : npm.cmd ci --ignore-scripts --offline --prefix <copie-jetable>
Exit : 0
Résultat : 6 packages ajoutés, 0 vulnérabilité
Durée : 1245 ms
SHA-256 package-lock avant/après :
c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f
```

Le lockfile est immuable sous `npm ci`. Le launcher livré n'utilise toutefois pas cette commande.

## 7. Tests négatifs obligatoires

`PASS` signifie que le refus/comportement demandé a été exécuté ou directement exercé par une suite. `FAIL` signifie que le chemin actif accepte le scénario interdit ou n'offre pas la capacité. `NOT PROVEN` signifie qu'aucun scénario exécutable pertinent n'existe dans les suites disponibles.

| # | Scénario | Résultat | Preuve |
|---:|---|---|---|
| 1 | Ancien rapport présent, nouveau run échoué | NOT PROVEN | Isolation par dossier correcte, mais aucun test exact combinant ces deux conditions. |
| 2 | Rapport d'un autre run | PASS | Test d'exécution avec binding `RUN-STALE`, rejet `NOVA_CORE_REPORT_BINDING_MISMATCH`. |
| 3 | Prompt modifié | PASS | Certificat avec `promptHash` altéré non vérifiable. |
| 4 | Manifest modifié | PASS | `reportBindingMismatches` refuse `manifestHash` altéré. |
| 5 | Fingerprint modifié | PASS | Primitive et HTTP rejettent le fingerprint erroné. |
| 6 | Processus bloqué | PASS | Le test timeout termine le runner bloqué. |
| 7 | Timeout | PASS | TIMEOUT explicite dans moteur et orchestrateur. |
| 8 | Annulation | PASS | CANCELLED explicite et verrou libéré. |
| 9 | Processus ignorant un signal | NOT PROVEN | Escalade de kill codée, mais le test n'installe pas de handler ignorant explicitement le premier signal. |
| 10 | stdout volumineux | PASS | Test de sortie combinée bornée. |
| 11 | stderr volumineux | PASS | Même test écrit 5000 octets sur stderr et respecte le plafond combiné. |
| 12 | Codex absent | NOT PROVEN | Erreur `NOVA_CORE_CODEX_NOT_FOUND` codée; aucun test dédié exécuté. |
| 13 | Mauvaise version Codex | NOT PROVEN | Version minimale codée; aucun test négatif dédié. |
| 14 | Detached HEAD | PASS | Test preflight dédié. |
| 15 | Unborn branch | PASS | Test preflight dédié. |
| 16 | Worktree modifié entre preflight et spawn | PASS | `assertStableGitPreflight` teste le drift et le moteur appelle deux preflights. |
| 17 | Scope parent/enfant concurrent | FAIL | Test ciblé actif : deux verrous obtenus simultanément. |
| 18 | Dossier frère avec préfixe identique | PASS | Primitive de containment segment-aware testée. |
| 19 | Mission READ_ONLY modifiant un fichier | FAIL | Test ciblé : override `BUILD` accepté et `changesExpected=true`; la protection READ_ONLY est contournée avant contrôle du delta. |
| 20 | Snapshot runtime corrompu | PASS | Projection altérée reconstruite depuis le journal de l'enveloppe sur copie. |
| 21 | Journal corrompu | PASS | Checksum erroné refusé sans réécriture. |
| 22 | Événement manquant | FAIL | Journal isolé le détecte, mais le journal actif n'a pas de hash-chaîne/contrôle de séquence autoritatif. |
| 23 | Sequence dupliquée | FAIL | Même divergence : contrôle isolé, non branché au runtime actif. |
| 24 | Crash pendant RUNNING | FAIL | Aucun test kill/redémarrage et aucune commande recovery active. |
| 25 | Rapport présent après crash | FAIL | Classification pure seulement, non branchée. |
| 26 | Rapport absent après crash | FAIL | Classification pure seulement, non branchée. |
| 27 | Certification sans autorité | PASS | HTTP `401`. |
| 28 | Certification avec mauvais runId | FAIL | Le payload `/certify` ne valide pas de `runId`; un champ supplémentaire est ignoré et le run courant est utilisé. |
| 29 | Certification avec mauvais fingerprint | PASS | HTTP `422`. |
| 30 | Double certification | FAIL | `nova-core.service.ts:259-263` retourne le certificat existant au lieu de refuser. |
| 31 | Migration interrompue | NOT PROVEN | Aucun test de crash entre backup, fichier temporaire et rename. |
| 32 | Rollback de migration | NOT PROVEN | Plan et backup présents; aucun rollback exécuté. |

Synthèse : 17 `PASS`, 9 `FAIL`, 6 `NOT PROVEN`.

## 8. Vérification des 23 anomalies

La preuve détaillée figure dans `RUNTIME_NOVA_CERTIFICATION_MATRIX.md`.

| Anomalie | Priorité initiale | Statut final |
|---|---|---|
| NRA-001 | P0 | PARTIAL |
| NRA-002 | P1 | CLOSED |
| NRA-003 | P1 | CLOSED |
| NRA-004 | P1 | CLOSED |
| NRA-005 | P1 | PARTIAL |
| NRA-006 | P1 | PARTIAL |
| NRA-007 | P1 | OPEN |
| NRA-008 | P1 | CLOSED |
| NRA-009 | P1 | PARTIAL |
| NRA-010 | P1 | OPEN |
| NRA-011 | P1 | PARTIAL |
| NRA-012 | P1 | PARTIAL |
| NRA-013 | P1 | PARTIAL |
| NRA-014 | P1 | OPEN |
| NRA-015 | P1 | OPEN |
| NRA-016 | P2 | CLOSED |
| NRA-017 | P2 | OPEN |
| NRA-018 | P2 | PARTIAL |
| NRA-019 | P2 | PARTIAL |
| NRA-020 | P2 | PARTIAL |
| NRA-021 | P2 | PARTIAL |
| NRA-022 | P2 | OPEN |
| NRA-023 | P3 | PARTIAL |

## 9. Recherche de régressions

### 9.1 Git et périmètre

Avant création des livrables :

```text
git diff --check                 exit 0
git diff --cached --check        exit 0
git rev-parse HEAD               d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
git branch --show-current        main
git remote -v                    <aucune sortie>
git status --short               62 entrées, identiques à la baseline
```

Aucun fichier suivi n'est staged. Le reflog contient uniquement le commit initial attendu. L'absence de remote rend un push impossible depuis cette configuration.

### 9.2 CEREBRAU, métier et interfaces

- aucune dépendance/import actif vers CEREBRAU n'est trouvé ;
- une seule occurrence non-test existe dans un commentaire de `append-only-journal.ts`, qui précise l'absence de dépendance CEREBRAU ;
- aucune entrée Git modifiée ne contient `CEREBRAU` ;
- aucun fichier `apps/nova-web`, CSS, TSX ou HTML n'est modifié ;
- aucune fonction métier ou page Pixel Perfect n'apparaît dans le diff.

Les fixtures de tests historiques utilisent encore `CEREBRAU` comme valeur de `projectId`; ce n'est pas une dépendance runtime.

### 9.3 Secrets

Le scan des fichiers modifiés et non suivis ne trouve aucun secret à haute confiance : aucune clef privée PEM, clef AWS, token GitHub ou token OpenAI.

Quatre chaînes correspondent aux motifs bearer/signing-key, toutes dans des tests et explicitement factices :

- `authority-token-at-least-16` ;
- `authority-signing-key-at-least-16` ;
- `release-authority-token-2026` ;
- `release-authority-signing-key-2026`.

Elles ne sont ni des secrets réels ni utilisées par le serveur de production.

### 9.4 Régressions ou doubles définitions détectées

- double machine d'état : canonique isolée + legacy active ;
- double fingerprint : PowerShell et TypeScript avec domaines de hash différents ;
- double journal : hash-chaîne isolée + tableau/checksum actif ;
- double voie finale : `/approve` vers `ACCEPTED` et `/certify` vers `CERTIFIED` ;
- contrôle de scope non réutilisé par le lock manager ;
- chemin mission encore construit avec `safeName` malgré le slug hashé des runs ;
- `DEMARRER_NOVA.bat` conserve `npm install`.

La sauvegarde active utilise bien un fichier temporaire puis `rename`; aucune sauvegarde directe non atomique n'a été trouvée dans `JsonRuntimeSnapshotStore`.

## 10. Contradictions document/code

1. `RUNTIME_NOVA_RELEASE_WAVE_1_REPORT.md` déclare toutes les anomalies d'exécution `CLOSED`, alors que le runner PowerShell des validations n'a ni timeout ni lecture concurrente sûre, et que les livrables ne sont pas hashés/vérifiés.
2. `RUNTIME_NOVA_RELEASE_WAVE_2_REPORT.md` présente la certification comme complète, alors que la double certification n'est pas refusée, le mauvais runId client n'est pas validé et `/approve` reste une autorité parallèle anonyme.
3. `RUNTIME_NOVA_RELEASE_WAVE_3_REPORT.md` cite le journal append-only/replay comme preuve de migration; ce journal est un module isolé, distinct du journal réellement persisté.
4. `RUNTIME_NOVA_CANONICAL_STATE_MACHINE.md` décrit la cible canonique; aucun import actif ne l'applique.
5. `RUNTIME_NOVA_EVENT_JOURNAL_SPEC.md` et `RUNTIME_NOVA_RECOVERY_SPEC.md` sont cohérents et reconnaissent explicitement que la persistance append-only et les commandes recovery restent futures. Ils contredisent donc les formulations de clôture globale du release train.
6. `RUNTIME_NOVA_MIGRATION_VALIDATION.md` indique qu'aucun rollback n'a été exécuté, ce qui contredit le critère de vague demandant un rollback validé.
7. `RUNTIME_NOVA_TEST_COVERAGE_MATRIX.md` est devenu obsolète pour timeout/preflight, mais reste exacte sur l'absence de SSE et replay durable intégrés.

## 11. Risques résiduels

Risques bloquants :

- impossibilité de prouver une chaîne événementielle append-only inviolable ;
- reconstruction/replay non autoritatifs après altération ou perte d'événement ;
- reprise d'un run interrompu non gouvernée ;
- divergence possible entre états canoniques, états API et états persistés ;
- mission read-only exécutable en profil d'écriture ;
- exécutions concurrentes possibles sur scopes parent/enfant ;
- certification ambiguë entre acceptation anonyme et certificat authentifié ;
- reproductibilité Codex non démontrée ;
- rollback de migration non qualifié.

Risques non bloquants mais à traiter :

- absence de `pwsh` alors que la baseline demandait cette commande ;
- `codex --version` dépend de la stratégie PowerShell, même si `codex.cmd` fonctionne ;
- worktree de livraison entièrement non commité, donc artefact audité non identifié par le seul HEAD ;
- warnings Git de conversion LF/CRLF ;
- absence de schéma runtime complet pour les payloads HTTP.

## 12. Conclusion

Le runtime montre des progrès vérifiables : transactions, libération de verrou terminal, binding de run, preflight Git, timeout/cancel TypeScript, certification HMAC et migrations de base sont réels et testés.

La certification finale reste interdite parce que des conditions explicites de GO ne sont pas prouvées et que plusieurs scénarios interdits sont reproductibles. En particulier, le journal, la machine d'état et le recovery ne sont pas branchés comme sources canoniques; READ_ONLY et les locks parent/enfant sont contournables; la chaîne HTTP de certification conserve des voies concurrentes.

Décision factuelle :

**NO GO**
