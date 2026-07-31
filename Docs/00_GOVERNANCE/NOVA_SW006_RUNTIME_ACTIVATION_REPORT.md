# NOVA — SW-006 Runtime Activation Report

| Champ | Valeur |
|---|---|
| Mission | `SUPER WAVE SW-006 — RUNTIME ACTIVATION` |
| Mode | Production Activation / Zero Regression |
| Date d'exécution | 2026-07-29 |
| Source de périmètre | [`NOVA_PLATFORM_ACTIVATION_MATRIX.md`](NOVA_PLATFORM_ACTIVATION_MATRIX.md) |
| Composants ciblés | 12 entrées qualifiées `IMPLEMENTED` par SW-005 |
| Décision | **GO** |

## 1. Verrou de périmètre

La mission a été limitée aux douze composants déclarés activables immédiatement par SW-005. Une activation signifie ici que le point d'entrée déclaré atteint effectivement les composants de production existants, sans fixture sur cette chaîne et sans création d'une nouvelle Interface.

Les composants `STUB`, `INTERNAL`, `PARTIAL` et `DEPRECATED` ont été exclus avant toute action. Aucun Runtime Gateway, Production Entrypoint, écran frontend ou endpoint `approve` n'a été modifié.

## 2. Résultat par composant

| Capability | Contrat et point d'entrée vérifiés | Raccordement de production constaté | Interface vérifiée | Preuve d'exécution | Résultat |
|---|---|---|---|---|---|
| `CAP-BFF-SESSION-READ` | `GET /session` | route BFF → RBAC/session → `SessionManager` → serveur BFF | API HTTP déclarée ; aucune Interface React requise par SW-005 | suites BFF : session anonyme et authentifiée, contrat public et cookie durci | **ACTIVÉ** |
| `CAP-BFF-SESSION-LOGIN` | `POST /session/login` | route BFF → `LocalIdentityProvider` → `SessionManager` → serveur BFF | API HTTP déclarée ; aucune Interface React existante | suites BFF : login valide, rotation de session, CSRF, limitation et erreurs contrôlées | **ACTIVÉ** |
| `CAP-BFF-SESSION-LOGOUT` | `POST /session/logout` | route BFF → RBAC/session → révocation par `SessionManager` | API HTTP déclarée ; aucune Interface React existante | suites BFF : révocation, suppression, effacement du cookie et rejeu idempotent | **ACTIVÉ** |
| `CAP-BFF-OPERATIONAL-PROBES` | `GET /health`, `/readiness`, `/version` | routeur/configuration → serveur BFF | Interface technique HTTP attendue | module d'entrée BFF démarré ; liveness, readiness et version validées | **ACTIVÉ** |
| `CAP-CORE-HEALTH` | `GET /health` | contrat HTTP → serveur NOVA Core | Interface technique HTTP attendue | serveur de production isolé : HTTP 200 | **ACTIVÉ** |
| `CAP-CORE-GIT-PREFLIGHT` | `GET /api/v1/projects/:projectId/preflight` | HTTP → `NovaCoreService.inspectProjectTarget` → moteur/preflight Git | API HTTP déclarée ; aucune Interface humaine existante | serveur de production isolé sur le dépôt réel : HTTP 200 ; tests Git nominaux et fail-closed | **ACTIVÉ** |
| `CAP-CORE-MISSION-ASSIGNMENT` | `POST .../assign` | HTTP → `NovaCoreService.assignAndLock` → `OrchestratorRuntimeService` | API HTTP déclarée ; aucune Interface humaine existante | mission temporaire créée puis assignée ; HTTP 200, état `LOCKED`, 4 événements persistés | **ACTIVÉ** |
| `CAP-CORE-EXECUTION-CANCEL` | `POST .../cancel` | HTTP → `NovaCoreService.cancelExecution` → `NovaCoreExecutionEngine.cancel` → Runtime | API HTTP déclarée ; aucune Interface humaine existante | serveur isolé : garde d'état atteinte, HTTP 409 attendu hors exécution ; suites complètes : annulation contrôlée `CANCELLED` et libération du verrou | **ACTIVÉ** |
| `CAP-CORE-MISSION-CERTIFICATION` | `POST .../certify` | HTTP authentifié → autorité → `NovaCoreService.certifyMission` → certificat Runtime | API HTTP déclarée ; aucune Interface compatible avec l'attestation | serveur isolé : garde d'authentification HTTP 401 attendue ; parcours HTTP complet : certification HTTP 201 et certificat vérifié | **ACTIVÉ** |
| `CAP-CORE-MISSION-RECOVERY` | `POST .../recovery/:action` | HTTP gouverné → `NovaCoreService.recoverMission` → moteur/journal → Runtime | API HTTP déclarée ; aucune Interface humaine existante | serveur isolé : garde d'authentification HTTP 401 attendue ; parcours HTTP complet : recovery HTTP 200 ; tests de classifications et migrations | **ACTIVÉ** |
| `CAP-CORE-MISSION-MONITORING` | `GET .../monitor`, `/monitor/stream`, `/events` | HTTP/SSE → observabilité service → Event Bus/Runtime | API HTTP et SSE déclarées ; aucune Interface humaine existante | serveur isolé : trois points d'entrée HTTP 200 ; test HTTP : flux SSE contenant les sorties d'exécution ; 4 événements relus | **ACTIVÉ** |
| `CAP-CORE-CERTIFICATE-READ` | `GET .../certificate` | HTTP → `NovaCoreService.getCertificate` → rapport/certificat Runtime persisté | API HTTP déclarée ; aucune Interface humaine existante | serveur isolé : garde d'absence HTTP 404 attendue ; parcours complet : certificat certifié retrouvé après réouverture du Runtime | **ACTIVÉ** |

**Bilan : 12 activés, 0 bloqué dans le périmètre.**

## 3. Raccordements et fixtures

Aucun raccordement manquant n'a été détecté dans les douze chaînes. Le code de production existant reliait déjà les contrats, routes, services et composants Runtime déclarés par SW-005.

En application du principe de zéro régression :

- aucun code n'a été modifié ;
- aucune fixture n'a été supprimée, car aucune fixture n'est située sur les douze chaînes ciblées ;
- aucune Interface absente n'a été créée ;
- aucun Program, Module, Rule ou Doctrine n'a été modifié.

## 4. Preuves d'exécution

### 4.1 Contrôles TypeScript

| Commande | Résultat |
|---|---|
| `npm.cmd run lint:bff` | PASS — 0 erreur |
| `npm.cmd run typecheck:nova-core` | PASS — 0 erreur |

### 4.2 Tests ciblés

| Périmètre | Commande | Résultat |
|---|---|---|
| Routes, sessions et sécurité BFF | `node --import tsx --test server/nova-bff/nova-bff.http.test.ts server/nova-bff/nova-bff.session-identity.test.ts server/nova-bff/nova-bff.security.test.ts` | PASS — 29/29 |
| HTTP Core, service, Git, certification, événements, recovery et journal | `node --import tsx --test server/nova-core/nova-core.http.test.ts server/nova-core/nova-core.service.test.ts server/nova-core/git-preflight.test.ts server/nova-core/mission-certification.test.ts server/nova-core/mission-event-publisher.test.ts server/nova-core/runtime-migration.test.ts server/runtime/journal/append-only-journal.test.ts` | PASS — 31/31 |

### 4.3 Suites complètes de non-régression

| Suite | Résultat |
|---|---|
| `npm.cmd run test:bff` | PASS — 54/54 |
| `npm.cmd test` — Runtime | PASS — 15/15 |
| `npm.cmd test` — NOVA Core | PASS — 503/503 |
| Total complet non redondant | **PASS — 572/572** |

### 4.4 Smoke test du vrai serveur Core

Le module `server/nova-core/nova-core.server.ts` a été démarré avec le Runtime officiel `tools/nova-core-runtime`. L'état, le journal et les sorties d'exécution ont été dirigés vers un répertoire temporaire hors dépôt, puis le processus et ce répertoire ont été supprimés après la preuve.

| Contrôle | Résultat observé |
|---|---|
| Démarrage du serveur de production | PASS |
| `GET /health` | 200 |
| préflight Git du projet `NOVA_CORE` | 200 |
| création de la mission de preuve | 201 |
| assignation et verrou | 200, état `LOCKED` |
| snapshot monitoring | 200 |
| événements | 200, 4 événements |
| flux SSE monitoring | 200 |
| annulation hors état `RUNNING` | 409 attendu, garde Runtime atteinte |
| certification sans autorité | 401 attendu, garde d'authentification atteinte |
| recovery sans autorité | 401 attendu, garde d'authentification atteinte |
| lecture avant émission d'un certificat | 404 attendu, garde métier atteinte |

Les codes 409, 401 et 404 ci-dessus sont les résultats contractuels attendus pour les préconditions volontairement absentes ; les chemins nominaux correspondants sont validés par les suites complètes.

## 5. Composants restant bloqués

Aucun des douze composants ciblés ne reste bloqué.

Les blocages globaux suivants subsistent sans changement parce qu'ils sont explicitement hors périmètre SW-006 :

| Blocage global | Qualification SW-005 | Traitement SW-006 |
|---|---|---|
| Frontend utilisant des fixtures | chaînes `STUB` | non traité |
| Runtime Gateway non injecté au démarrage BFF | `CAP-BFF-RUNTIME-EXECUTE` — `PARTIAL` | non traité |
| Production Entrypoint désactivé dans cette chaîne | lié à la capability `PARTIAL` | non traité |
| route dashboard `approve` | `CAP-CORE-LEGACY-APPROVAL` — `DEPRECATED` | non traité |

## 6. Fichiers réellement modifiés

Un seul fichier a été créé :

- `Docs/00_GOVERNANCE/NOVA_SW006_RUNTIME_ACTIVATION_REPORT.md`

Aucun fichier source, Runtime, Program, Module, Agent, Rule, Doctrine, Service, API, BFF ou Interface n'a été modifié par SW-006.

## 7. Régressions

- Régression fonctionnelle détectée : **0**
- Régression documentaire détectée : **0**
- Échec de test : **0**
- Composant hors périmètre modifié : **0**
- Fixture supprimée : **0**

## 8. Décision

Les douze composants `IMPLEMENTED` désignés par SW-005 sont déjà raccordés aux composants de production existants et leur activation est démontrée par exécution. Aucune construction, réécriture ou correction de code n'était nécessaire.

**GO — SW-006 RUNTIME ACTIVATION**
