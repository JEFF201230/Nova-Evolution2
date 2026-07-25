# RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003 — Matrice de travail initiale

Créée avant toute correction du runtime le 2026-07-25.

Référence autoritative : `RUNTIME_NOVA_FINAL_CERTIFICATION_MATRIX_002.md`.

| NRA | Statut audit 002 | Cause exacte | Contre-test en échec | Fichiers concernés | Correction minimale attendue |
| --- | --- | --- | --- | --- | --- |
| NRA-001 | PARTIAL | Le principal authentifié n’a ni rôle, ni état actif, ni politique d’autorisation ; tout bearer configuré peut certifier. | Une autorité `READ_ONLY_VIEWER` authentifiée est autorisée à certifier. | `server/nova-core/mission-certification.ts`, `server/nova-core/nova-core.http.ts`, tests HTTP/certification. | Séparer authentification et autorisation, fermer par défaut, exiger autorité active, identité concordante, rôle/type admis et attestation valide. |
| NRA-007 | PARTIAL | `recoverMission` force `processAlive=false` et `worktreeModified=false`, et déduit le rapport de la seule projection. | Processus actif, worktree modifié et inspection impossible ne sont pas distingués. | `server/runtime/journal/append-only-journal.ts`, `server/runtime/orchestrator/orchestrator-runtime.service.ts`, `server/nova-core/nova-core.execution.ts`, `server/nova-core/nova-core.service.ts`. | Collecter des signaux tri-état réels depuis PID, Git, artefacts et store ; bloquer resume/recover si un signal critique est UNKNOWN ou invalide. |
| NRA-009 | PARTIAL | Les artefacts prompt/manifest/ExecutionRequest persistés ne sont pas relus au moment de certifier. | Altérer l’un de ces fichiers après le run n’empêche pas la certification. | `server/nova-core/nova-core.execution.ts`, `server/nova-core/nova-core.types.ts`, `server/nova-core/nova-core.service.ts`, `server/nova-core/run-binding.ts`. | Persister les chemins, relire les octets, recalculer les hashes et comparer au binding et à l’événement journalisé avant certification. |
| NRA-011 | PARTIAL | Le runner Node partage un plafond global et aucun test dédié ne prouve l’arrêt d’un processus ignorant un premier signal. | Processus ignorant la terminaison gracieuse : preuve manquante ; stdout peut consommer le plafond de stderr. | `server/nova-core/nova-core.execution.ts`, `server/nova-core/process-runner.test.ts`. | Plafonds indépendants stdout/stderr et escalade de terminaison testée jusqu’au kill forcé de l’arbre. |
| NRA-013 | PARTIAL | READ_ONLY accepte un worktree pré-sali et transforme une écriture en blocker sans échec d’exécution. | Worktree pré-sali accepté ; création de fichier résolue avec `scopeConfirmed=true`. | `server/nova-core/nova-core.execution.ts`, `server/runtime/orchestrator/orchestrator-runtime.service.ts`, tests execution/HTTP. | Refuser avant spawn tout delta initial ; lever une erreur terminale sur tout delta final non explicitement autorisé ; maintenir profil et `changesExpected=false` côté serveur. |
| NRA-014 | PARTIAL | L’état détaillé persisté reste une vérité concurrente de l’état canonique dérivé. | Projection détaillée incompatible modifiable indépendamment du journal. | `server/runtime/orchestrator/canonical-state.ts`, `server/runtime/orchestrator/orchestrator-runtime.service.ts`, `server/nova-core/runtime-migration.ts`, store et tests. | Déclarer le journal autoritatif, reconstruire/vérifier la projection après chaque transition et au chargement, interdire toute transition hors de la porte canonique unique. |
| NRA-015 | PARTIAL | Journal et projection peuvent être réécrits ensemble et rendus valides par recalcul local des checksums. | Projection contradictoire et événement terminal supprimé puis re-signé sont acceptés. | `server/nova-core/nova-core.store.ts`, `server/nova-core/runtime-migration.ts`, `server/runtime/journal/append-only-journal.ts`. | Ajouter une ancre HMAC distincte avec clé externe au flux de données, vérifier séquence/eventId/hash terminaux, et comparer la projection au replay. |
| NRA-017 | PARTIAL | `scopesOverlap` compare les segments avec une casse sensible sous Windows. | Même chemin Windows avec casse différente ne crée aucun conflit. | `server/nova-core/scope-validation.ts`, orchestrateur et tests. | Canonicalisation commune tenant compte de la plateforme avant toute comparaison de lock. |
| NRA-018 | PARTIAL | TypeScript est sensible à la casse alors que PowerShell utilise `IgnoreCase`. | Corpus Windows de casse échoue en parité. | `server/nova-core/scope-validation.ts`, `tools/nova-core-runtime/NovaCore.Reporting.psm1`, tests des deux langages. | Une seule sémantique : insensible à la casse sous Windows, sensible sur les systèmes concernés, avec séparateurs et segments normalisés. |
| NRA-021 | PARTIAL | Les campagnes historiques ne couvrent pas les contournements actifs de rôle, recovery, READ_ONLY, locks et journal. | Les contre-tests indépendants échouent malgré 47/47 et 33/33. | Tests ciblés des composants corrigés. | Ajouter des tests non simulés couvrant chaque voie de contournement sans supprimer ni désactiver les tests historiques. |
| NRA-022 | PARTIAL | L’équivalent NOVA journal/replay/recovery reste dépendant de `runtime.json` et de signaux synthétiques. | Drift, processus vivant, artefact physique et autorité du journal ne sont pas prouvés bout-en-bout. | Store, execution engine, service, orchestrateur, HTTP et tests d’intégration. | Brancher ancre externe, inspection réelle, replay vérifié et recovery gouverné dans le chemin service/HTTP actif. |
| NRA-023 | PARTIAL | Le launcher impose `npm ci`, mais la documentation active recommande encore `npm install`. | Contradiction documentaire du parcours bootstrap. | `server/nova-core/README.md`, test bootstrap. | Remplacer l’instruction par `npm ci` et tester l’absence de recommandation `npm install`. |

## Baseline avant correction

```text
Top-level : C:/DEV/NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)/nova-core-mvp
Branche : main
HEAD : d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
Remote : aucun
git diff --check : code 0
Node : v24.16.0
npm : 11.13.0
pwsh : absent
Windows PowerShell : 5.1.26100.8894
Codex : codex-cli 0.145.0
Worktree : préexistant non propre, 19 fichiers suivis modifiés avant mission
```

Cette section constitue la matrice exigée avant modification. Les résultats après correction seront ajoutés sans réécrire les constats initiaux.

## Matrice finale des corrections proposées

Les résultats initiaux ci-dessous correspondent aux contournements directement reproduits pendant l’audit 002 et confirmés par inspection du code actif avant correction. Les résultats finaux proviennent des commandes exécutées sur le runtime corrigé.

| NRA | Cause | Correction minimale branchée | Tests exécutés | Résultat | Risque résiduel | Statut proposé |
| --- | --- | --- | --- | --- | --- | --- |
| NRA-001 | Un bearer configuré suffisait, sans permission de certification. | Séparation authentification/autorisation ; politique fermée par défaut ; contrôle `enabled`, sujet, type, rôle `CERTIFY` et attestation HMAC liée à l’autorité, au projet, à la mission, au run et au fingerprint. | `mission-certification.test.ts`, route HTTP réelle dans `nova-core.http.test.ts`. | Sans authentification 401 ; inconnue 401 ; sans rôle/type/sujet/disabled 403 ; attestation invalide 403 ; autorité valide 201 ; double certification 409. | La sécurité de la clé HMAC reste une responsabilité opérateur ; aucune valeur par défaut n’est fournie. | CLOSED |
| NRA-007 | Recovery alimenté par deux constantes `false`. | Inspection réelle du PID et de ses descendants, Git réel, rapport physique et hashes des artefacts ; signaux tri-état ; intégrité journal/snapshot collectée par le store ; reprise bloquée sur `UNKNOWN` ou signal invalide. | Test d’intégration avec vrai processus et vrai dépôt Git ; tests recovery orchestrateur/journal/HTTP. | Processus actif/absent, worktree propre/modifié, Git/PID impossible, rapport présent/absent et `UNKNOWN` observés ; reprise dangereuse refusée. | Une inspection OS peut légitimement retourner `UNKNOWN` ; le comportement est alors fermé et requiert reconciliation. | CLOSED |
| NRA-009 | Les artefacts persistés n’étaient pas relus lors de `/certify`. | Chemins des quatre artefacts liés au report ; relecture des octets de `prompt.md`, `manifest.json`, `execution-request.json` et `run-binding.json` ; re-hash et comparaison au report et au journal. | Contre-tests HTTP prompt, manifest, ExecutionRequest, artefact absent et hash local re-signé. | Toute dérive retourne 422 et la mission reste `HUMAN_VALIDATION`. | Les erreurs de lecture sont volontairement traitées comme refus de certification. | CLOSED |
| NRA-011 | Plafond de sortie partagé et preuve absente pour un processus ignorant le signal initial. | Compteurs et plafonds stdout/stderr indépendants ; terminaison arbre Windows ; escalade POSIX SIGTERM puis SIGKILL ; test avec processus résistant. | `process-runner.test.ts`, tests TIMEOUT/CANCELLED orchestrateur et E2E PowerShell. | Flux indépendamment bornés ; processus principal et descendants arrêtés ; statuts et libération de lock préservés. | Sous Windows, `taskkill /T /F` est directement forcé ; sous POSIX l’escalade est temporisée. | CLOSED |
| NRA-013 | READ_ONLY acceptait un worktree sale et une écriture pouvait seulement devenir blocker. | Worktree propre requis avant spawn ; profil et `changesExpected=false` imposés ; snapshot initial de l’index Git ; contrôle Git réel post-run indépendant du rapport ; liste serveur de chemins exacts canoniques ; violation convertie en erreur terminale. | Tests moteur et HTTP : dirty initial, override profile/changes, écriture interdite, chemin `..`, écriture explicitement autorisée. | Dirty initial refusé avant spawn ; écriture interdite produit `FAILED`, n’est pas certifiable ; surcharge HTTP refusée. | Les chemins autorisés sont une configuration serveur explicite ; une mauvaise configuration opérateur reste visible dans le snapshot de baseline. | CLOSED |
| NRA-014 | Projection persistée modifiable indépendamment de l’état dérivé. | Journal déclaré autoritatif ; mutation de l’état uniquement dans l’EventBus ; projection vérifiée contre le dernier `targetState` à l’ouverture et à l’export ; transitions centralisées ; événements non-audit refusés après terminal. | Projection forgée, `ReportSubmitted` après CANCELLED/REJECTED, événement tardif, replay et reconstruction. | Projection contradictoire rejetée ; transitions tardives refusées ; replay identique. | Les états workflow détaillés subsistent uniquement comme projection reconstruisible du journal, pas comme seconde autorité. | CLOSED |
| NRA-015 | Journal et projection pouvaient être tronqués/re-signés avec des checksums locaux. | Ancre HMAC distincte du runtime JSON, clé externe obligatoire, dernier eventId/sequence/hash et checksum journal scellés ; projection comparée au replay. | Projection contradictoire ; suppression terminale puis chaîne recalculée ; payload et chaîne entièrement recalculés. | Les trois falsifications sont rejetées (`PROJECTION_JOURNAL_MISMATCH` ou `JOURNAL_ANCHOR_INVALID`). | Une perte de l’ancre ou de sa clé rend l’ouverture impossible, ce qui est le comportement fail-closed attendu. | CLOSED |
| NRA-017 | Locks Windows sensibles à la casse. | Canonicalisation unique TypeScript : absolu, séparateurs, `.`/`..`, drive, segments, casse Windows ; overlap segment-aware. | Même chemin en casse différente, parent/enfant dans les deux sens, fichiers distincts, frères préfixés, verrou runtime actif. | Conflits logiques détectés ; frères et enfants distincts compatibles quand attendu. | Sur plateforme sensible à la casse, la comparaison native reste volontairement sensible. | CLOSED |
| NRA-018 | Sémantique TypeScript différente de PowerShell. | Canonicalisation PowerShell alignée sur les segments et séparateurs ; comparaison `IgnoreCase` Windows ; corpus commun étendu. | `scope-validation.test.ts`, `Test-NovaCoreReporting.ps1` 19/19. | Casse, slash/backslash, `.`/`..`, parent/enfant et dossiers frères passent dans les deux runtimes. | Aucun second canonicaliseur TypeScript concurrent n’a été introduit. | CLOSED |
| NRA-021 | Les suites vertes ne couvraient pas les contournements critiques. | Ajout de contre-tests sur route réelle, filesystem, processus, Git, store ancré et EventBus ; aucun skip ni suppression historique. | 59/59 Node, 34/34 PowerShell obligatoires actuels, 71/71 complémentaires, 5/5 Node complémentaires. | Tous les contre-tests bloquants passent. | Les tests opérateur externes de conservation des clés restent hors dépôt et ne remplacent pas les tests runtime. | CLOSED |
| NRA-022 | Recovery/replay restaient synthétiques et dépendants de `runtime.json`. | Inspection OS/Git physique, ancre externe adjacente, validation store avant recovery/certification, replay autoritatif et preuves HTTP branchées. | Processus/Git réels, store rechargé, anchor tamper, recovery HTTP, verrou orphelin et replay. | Les signaux réels gouvernent la reprise ; aucun défaut silencieux en `false`. | L’ancre adjacente doit être sauvegardée avec sa politique de clé ; son absence bloque au lieu de reconstruire silencieusement. | CLOSED |
| NRA-023 | README recommandait `npm install`. | Parcours documenté remplacé par `npm ci` et contre-test bootstrap. | `nova-core.bootstrap.test.ts` et installation offline jetable. | README sans `npm install` ; `npm ci --offline` réussit avec lockfile. | Le cache npm doit contenir les dépendances en mode offline ; l’échec est explicite autrement. | CLOSED |

## Fiches exigées par NRA

### NRA-001

```text
NRA : NRA-001
Criticité : P0
Cause confirmée : authentification confondue avec autorisation.
Contre-test initial : autorité READ_ONLY_VIEWER avec bearer valide.
Résultat initial : certification acceptée.
Fichiers modifiés : mission-certification.ts, nova-core.http.ts, nova-core.service.ts, nova-core.server.ts et tests.
Correction appliquée : policy deny-by-default, rôle/type/état/sujet et attestation HMAC.
Branchement runtime vérifié : POST /api/v1/missions/:project/:mission/certify.
Contre-test après correction : bearer valide sans CERTIFY et attestation arbitraire.
Résultat après correction : HTTP 403, aucun certificat, état HUMAN_VALIDATION.
Tests de non-régression : certificat valide/vérifiable, mauvais run/fingerprint, double certification.
Risque résiduel : protection opérationnelle des clés.
Statut proposé : CLOSED
```

### NRA-007

```text
NRA : NRA-007
Criticité : P1
Cause confirmée : processAlive/worktreeModified forcés à false.
Contre-test initial : processus vivant et worktree modifié non distingués.
Résultat initial : preuves absentes.
Fichiers modifiés : nova-core.execution.ts, nova-core.service.ts, append-only-journal.ts, orchestrator-runtime.service.ts et tests.
Correction appliquée : inspection PID/arbre/Git/rapport/artefacts tri-état.
Branchement runtime vérifié : NovaCoreService.recoverMission -> engine/store -> runtime.recoverMission.
Contre-test après correction : vrai processus, vrai dépôt Git, PID/Git invalides.
Résultat après correction : TRUE/FALSE/UNKNOWN observés ; UNKNOWN bloque recover/resume.
Tests de non-régression : abandon, quarantine, lock release, replay.
Risque résiduel : inspection OS non disponible => reconciliation explicite.
Statut proposé : CLOSED
```

### NRA-009

```text
NRA : NRA-009
Criticité : P1
Cause confirmée : hashes stockés réutilisés sans relecture disque.
Contre-test initial : prompt/manifest/ExecutionRequest modifié après run.
Résultat initial : certification non bloquée.
Fichiers modifiés : nova-core.execution.ts, nova-core.service.ts, run-binding.ts, orchestrator-runtime.types.ts et tests HTTP.
Correction appliquée : relecture/re-hash exact des octets et comparaison au binding/report/journal.
Branchement runtime vérifié : NovaCoreService.certifyMission avant issueMissionCertificate.
Contre-test après correction : chaque artefact modifié, absent ou re-signé localement.
Résultat après correction : HTTP 422, aucun certificat.
Tests de non-régression : tous artefacts valides => certificat vérifiable.
Risque résiduel : aucun contournement équivalent observé.
Statut proposé : CLOSED
```

### NRA-011

```text
NRA : NRA-011
Criticité : P1
Cause confirmée : plafond global et fallback de signal non testé.
Contre-test initial : processus ignorant le premier signal NON EXÉCUTABLE.
Résultat initial : preuve manquante.
Fichiers modifiés : nova-core.execution.ts, process-runner.test.ts.
Correction appliquée : plafonds séparés et kill forcé de l’arbre.
Branchement runtime vérifié : runCommand utilisé par NovaCoreExecutionEngine.
Contre-test après correction : processus résistant avec marqueur descendant.
Résultat après correction : TIMEOUT et marqueur jamais créé.
Tests de non-régression : CANCELLED, gros stdout, gros stderr.
Risque résiduel : différence d’implémentation Windows/POSIX explicitement testée selon plateforme.
Statut proposé : CLOSED
```

### NRA-013

```text
NRA : NRA-013
Criticité : P1
Cause confirmée : READ_ONLY était une validation documentaire.
Contre-test initial : worktree pré-sali et création acceptés.
Résultat initial : SUBMITTED possible.
Fichiers modifiés : nova-core.execution.ts et tests execution/HTTP.
Correction appliquée : preflight propre, baseline index, postflight Git, chemins serveur exacts, erreur terminale.
Branchement runtime vérifié : executeWithNovaCore et route /execute.
Contre-test après correction : dirty initial, création, override profile/changesExpected, chemin ..
Résultat après correction : refus avant spawn ou FAILED ; certification inéligible.
Tests de non-régression : READ_ONLY propre et seul rapport explicitement autorisé accepté.
Risque résiduel : autorisations serveur volontairement explicites.
Statut proposé : CLOSED
```

### NRA-014

```text
NRA : NRA-014
Criticité : P1
Cause confirmée : projection et état canonique pouvaient diverger.
Contre-test initial : projection CERTIFIED face à journal READY.
Résultat initial : chargement accepté.
Fichiers modifiés : orchestrator-runtime.service.ts, runtime-migration.ts et tests.
Correction appliquée : journal autoritatif, projection reconstruite/vérifiée, transition centralisée.
Branchement runtime vérifié : EventBus.publish et store.load/exportSnapshot.
Contre-test après correction : projection directe et événements après terminal.
Résultat après correction : rejet explicite.
Tests de non-régression : workflow nominal et replay complet.
Risque résiduel : état détaillé conservé comme projection uniquement.
Statut proposé : CLOSED
```

### NRA-015

```text
NRA : NRA-015
Criticité : P1
Cause confirmée : checksums recalculables par le même fichier.
Contre-test initial : suppression terminale et recalcul complet.
Résultat initial : journal tronqué accepté.
Fichiers modifiés : nova-core.store.ts, runtime-migration.ts et tests migration/store.
Correction appliquée : ancre HMAC externe au runtime.json, clé obligatoire, terminal attendu scellé.
Branchement runtime vérifié : save/load/verifyAuthority/inspectIntegritySignals.
Contre-test après correction : troncature, payload modifié, chaîne/projection re-signées.
Résultat après correction : JOURNAL_ANCHOR_INVALID.
Tests de non-régression : journal/ancre valides et migration idempotente.
Risque résiduel : gestion opérationnelle de l’ancre et de la clé.
Statut proposé : CLOSED
```

### NRA-017

```text
NRA : NRA-017
Criticité : P2
Cause confirmée : casse Windows non normalisée dans scopesOverlap.
Contre-test initial : C:\DEV\NOVA contre c:\dev\nova sans conflit.
Résultat initial : false.
Fichiers modifiés : scope-validation.ts, orchestrator-runtime.test.ts.
Correction appliquée : représentation canonique plateforme-aware et comparaison segmentaire.
Branchement runtime vérifié : acquireLock appelle scopesOverlap sur tous les locks actifs.
Contre-test après correction : même chemin avec casse/slash différents.
Résultat après correction : conflit détecté.
Tests de non-régression : nova vs nova-old, enfants/fichiers distincts compatibles.
Risque résiduel : aucun contournement Windows observé.
Statut proposé : CLOSED
```

### NRA-018

```text
NRA : NRA-018
Criticité : P2
Cause confirmée : grammaires TS/PowerShell divergentes.
Contre-test initial : corpus de casse Windows.
Résultat initial : TypeScript false, PowerShell true.
Fichiers modifiés : scope-validation.ts, NovaCore.Reporting.psm1 et tests.
Correction appliquée : segments, séparateurs, . et .. alignés ; IgnoreCase Windows.
Branchement runtime vérifié : locks TypeScript et validation scope PowerShell.
Contre-test après correction : corpus commun.
Résultat après correction : Node et PowerShell PASS.
Tests de non-régression : exact/glob/récursif/frère préfixé.
Risque résiduel : aucun.
Statut proposé : CLOSED
```

### NRA-021

```text
NRA : NRA-021
Criticité : P2
Cause confirmée : risques critiques absents des suites historiques.
Contre-test initial : 47/47 et 33/33 malgré contournements actifs.
Résultat initial : couverture insuffisante.
Fichiers modifiés : tests existants Node et PowerShell concernés.
Correction appliquée : contre-tests route/runtime/filesystem/processus/Git/store, sans mock exclusif.
Branchement runtime vérifié : suites lancées depuis package.json et scripts PowerShell réels.
Contre-test après correction : 20 scénarios bloquants.
Résultat après correction : 20 PASS.
Tests de non-régression : 59/59 Node, 34/34 PS obligatoires, 71/71 PS complémentaires.
Risque résiduel : aucun test skip ; environnement pwsh absent compensé par Windows PowerShell 5.1.
Statut proposé : CLOSED
```

### NRA-022

```text
NRA : NRA-022
Criticité : P2
Cause confirmée : recovery/replay dépendaient de signaux synthétiques et du snapshot seul.
Contre-test initial : processus, Git et rapport physique non observés.
Résultat initial : preuve bout-en-bout absente.
Fichiers modifiés : engine, service, store, journal, orchestrateur, HTTP et tests.
Correction appliquée : preuves physiques tri-état, ancre, replay et contrôle avant actions.
Branchement runtime vérifié : routes recovery -> service -> engine/store -> orchestrateur.
Contre-test après correction : processus/Git/rapport/ancre réels et inconnus.
Résultat après correction : classification factuelle et reprise dangereuse refusée.
Tests de non-régression : restart, abandon, quarantine, attempt et lock.
Risque résiduel : UNKNOWN exige une autorité de reconciliation, par conception.
Statut proposé : CLOSED
```

### NRA-023

```text
NRA : NRA-023
Criticité : P3
Cause confirmée : documentation npm install contradictoire.
Contre-test initial : README contient npm install.
Résultat initial : contradiction.
Fichiers modifiés : server/nova-core/README.md, nova-core.bootstrap.test.ts.
Correction appliquée : npm ci uniquement.
Branchement runtime vérifié : launcher et README convergent.
Contre-test après correction : assertion documentaire et npm ci offline jetable.
Résultat après correction : PASS.
Tests de non-régression : Node >=22, Git/Codex absents.
Risque résiduel : aucun.
Statut proposé : CLOSED
```

## Synthèse proposée pour le prochain audit

```text
NRA TOTAL: 23
CLOSED: 23
PARTIAL: 0
OPEN: 0
```

Cette synthèse est une proposition de clôture technique. Elle n’est ni une décision de certification ni un certificat.
