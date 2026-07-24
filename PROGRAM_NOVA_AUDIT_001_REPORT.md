# PROGRAM-NOVA-AUDIT-001 — Audit probatoire de NOVA

Date d'observation : 2026-07-18  
Dépôt audité : `C:\DEV\nova-orchestrator`  
Commit : `be6ae5a785b3487384882a69d3a5cc6e03c05419`  
État Git au début de l'audit : propre (`git status --short` sans sortie)  
Mode : STRICT — une documentation de conception n'est pas une preuve d'implémentation.

## 0. Décision

**NO GO** pour utiliser NOVA, dans l'état observé, comme moteur d'audit de code, constructeur automatique du Digital Twin VEEDDA ou générateur DPDS complet.

Cette décision ne nie pas les capacités démontrées de runtime de mission. Elle est fondée sur les faits suivants :

1. Le runtime de mission en mémoire est implémenté et testé : `OrchestratorRuntimeService`, file, verrous, événements, transitions, exécution par callback et validations dans `server/runtime/orchestrator/`.
2. Les 354 tests serveur passent; les 41 tests web passent; le typage et le build web passent.
3. Aucun code de production audité ne lit un repository, Git, SQL, Supabase, PostgreSQL ou une API externe. Les occurrences de `readFileSync`/`readdirSync` dans `server/` sont dans des fichiers `*.test.ts`.
4. Il n'existe aucun fichier SQL, aucune dépendance Express/Supabase/PostgreSQL, aucun endpoint serveur et aucun schéma de persistance dans le dépôt.
5. Les 24 capacités de reconstruction de code, les 23 capacités d'analyse d'architecture et les 17 cartographies automatiques demandées ne sont pas implémentées.
6. Le Context Engine annoncé par `Docs/06_REFERENCE/CEREBRAU_CONTEXT_ENGINE_MVP_V1.md:275-276` renvoie à `server/cerebrau-context`; ce dossier est absent du commit audité.
7. Le code source VEEDDA et son Digital Twin ne sont pas présents. Une comparaison factuelle de contenu est donc impossible.

Décision secondaire limitée : le runtime NOVA peut être évalué comme **candidat de contrôle d'exécution en mémoire**, pas comme analyseur ou Digital Twin. Cette limitation est prouvée par les magasins `Map`/tableaux de `server/runtime/orchestrator/orchestrator-runtime.service.ts:120-128` et l'absence d'adaptateur de persistance/réseau.

## 1. Méthode et barème

### 1.1 Statuts

| Statut | Signification stricte |
| --- | --- |
| OUI | Implémentation trouvée, consommable, et test ou exécution concluante observé. |
| PARTIEL | Sous-ensemble exact implémenté; le reste demandé ne l'est pas. |
| NON | Recherche exhaustive dans le périmètre audité et absence d'implémentation correspondante. |
| NON PROUVÉ | Affirmation documentaire ou conceptuelle sans artefact exécutable vérifiable dans ce commit. |

### 1.2 Commandes de preuve exécutées

| Contrôle | Résultat observé |
| --- | --- |
| `rg --files -g '!node_modules' -g '!dist' -g '!build'` | 1 389 fichiers |
| Extensions | 1 031 `.md`, 160 `.ts`, 57 `.tsx`, 34 `.css`, 75 `.png`, 22 `.txt`, 7 `.json`, 2 `.html`, 2 `.js`, 1 `.yaml`, 1 `.cjs` |
| Sources serveur | 72 fichiers de production, 69 fichiers de test |
| Sources web | 58 fichiers TS/TSX de production, 14 fichiers de test |
| Tous les tests serveur via `tsx --test` | 354 succès, 0 échec, 0 ignoré |
| Couverture serveur via `--experimental-test-coverage` | lignes 82,33 %, branches 86,49 %, fonctions 76,97 % |
| `npm test -- --run` dans `apps/nova-web` | 41 succès dans 14 fichiers, 0 échec |
| `npm run typecheck` | succès |
| `npm run build` | succès; bundle JS 183,17 kB, CSS 32,34 kB |
| `npm test -- --coverage` | lignes 93,99 %, branches 76,74 %, fonctions 78,65 % |
| `npm run lint` | échec, 239 erreurs |
| Fichiers `*.sql`, `*.prisma`, `*.graphql`, Dockerfile | 0 |
| Terme exact `Digital Twin` dans le dépôt | 0 fichier |
| Terme autonome `DPDS` | 0 implémentation; les correspondances brutes proviennent de `completedPdsCount` |

La documentation baseline annonce encore 68 fichiers de test et 348 succès dans `Docs/21_BASELINES/NOVA_v1.0.0/COMPONENT_CATALOG.md:71-73`; l'observation courante est 69/354. Le catalogue est donc désynchronisé sur ces deux mesures.

Commandes de reproduction PowerShell :

```powershell
git rev-parse HEAD
git status --short
rg --files -g '!node_modules' -g '!dist' -g '!build'
$tests = Get-ChildItem server -Recurse -Filter '*.test.ts' | ForEach-Object FullName
& .\node_modules\.bin\tsx.cmd --test $tests
& .\node_modules\.bin\tsx.cmd --test --experimental-test-coverage $tests
Set-Location apps/nova-web
npm.cmd test -- --run
npm.cmd test -- --coverage
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
Get-ChildItem -Recurse -File -Filter '*.sql'
rg -n 'express|supabase|postgres|readFile|readdir|createServer|listen\(' server ../apps/nova-web/src -g '*.ts' -g '*.tsx' -i
```

## 2. Inventaire complet des composants exécutables

### 2.1 Runtimes et moteurs serveur

Toutes les lignes ci-dessous ont pour runtime Node.js/TypeScript exécuté par `tsx`. Le manifeste racine ne déclare qu'un script ciblé et `tsx` (`package.json:3-7`); il n'existe ni script de build serveur global, ni serveur HTTP déclaré.

| Nom | Rôle démontré | Emplacement | Dépendances de production | Entrées | Sorties | État / preuve |
| --- | --- | --- | --- | --- | --- | --- |
| Orchestrator Runtime | Missions, file projet, agents, verrous de périmètre, événements, audits, exécution callback, validation | `server/runtime/orchestrator/` | Bibliothèque standard uniquement | `MissionDefinition`, `RuntimeAgent`, callback `RuntimeExecutionHandler` | `RuntimeMission`, rapport, événements, audit, snapshots | OUI; classes à `orchestrator-runtime.service.ts:131-323`, méthodes à `:350-577`, tests `orchestrator-runtime.test.ts` |
| OS Runtime Core | Agrégation déterministe de composition, contexte, lifecycle, scheduler et state | `server/runtime/os-runtime/` | Sous-modules du même dossier | preuves/composants/références préconstruits | objets `Result`/`Evidence` gelés | OUI pour vérification en mémoire; 6 sources + 6 tests |
| Mission Runtime | Vérification de readiness mission | `server/runtime/mission-runtime/` | OS Runtime + 4 sous-modules | résultats de readiness | `MissionRuntimeResult` | OUI comme vérificateur; 5 sources + 5 tests |
| Workflow Runtime | Vérification de readiness workflow | `server/runtime/workflow-runtime/` | OS Runtime, Mission Runtime + sous-modules | résultats de readiness | `WorkflowRuntimeResult` | OUI comme vérificateur; 5 sources + 5 tests |
| Agent Runtime | Vérification de readiness agent | `server/runtime/agent-runtime/` | OS, Mission, Workflow + sous-modules | résultats de readiness | `AgentRuntimeResult` | OUI comme vérificateur; 5 sources + 5 tests |
| Execution Engine | Agrège les quatre runtimes et ses contrôles internes | `server/runtime/execution-engine/` | OS, Mission, Workflow, Agent | résultats de readiness | `ExecutionEngineResult` | OUI comme vérificateur; 5 sources + 5 tests |
| Runtime Traceability | Graphe fermé de liens entre nœuds runtime connus | `server/runtime/runtime-traceability/` | cinq runtimes | listes de liens et résultats de readiness | couverture `COMPLETE/PARTIAL`, preuves | OUI pour topologie interne prédéfinie; `runtime-traceability.ts`, test associé |
| Kernel Service Catalog | Catalogue fermé de 11 services | `server/runtime/kernel/kernel-service-catalog.ts` | aucune | identifiants de service | catalogue/validation | OUI; `KERNEL_SERVICE_COUNT`, tests catalogue/bootstrap |
| Kernel Bootstrap/Readiness Gate | Vérifie catalogue, phases et contrôles KRG | `kernel-bootstrap-readiness.ts`, `kernel-readiness-gate.ts` | catalogue | primitives et preuves | décision READY/NOT_READY | OUI; API exportée et tests |
| 20 modules Kernel internes | Intake, mission, workflow, runtime, décision, reporting, traceability, compositions | autres fichiers `server/runtime/kernel/*.ts` | aucune importation/exportation de production | objets internes injectés par tests | objets internes | PARTIEL : implémentations présentes, mais aucune API publique et aucun consommateur production; les tests lisent le source, ajoutent des exports via `globalThis`, transpilent avec esbuild et exécutent en VM (`kernel-mission-order-intake.test.ts:1-89`) |
| OS Integration Foundation | Vérifie les preuves Execution Engine et Runtime Traceability | `server/os-integration/os-integration-foundation.ts` | runtime | résultats de readiness | résultat d'intégration | OUI comme vérificateur |
| Runtime Evidence Consumption | Transforme une chaîne fermée de faits/liens runtime en preuves de gouvernance | `server/os-integration/runtime-evidence-consumption.ts` | OS integration + traceability | faits et liens typés | preuves de gouvernance | OUI sur vocabulaire fermé |
| Mission Control Capability | DTO/factory et registre mémoire | `server/os-integration/mission-control-capability*.ts` | `Map` local | valeurs de capacité | capacité/listing | OUI en mémoire; registre non consommé en production |
| Mission Control Integration | Factory d'un enregistrement d'intégration | `server/os-integration/mission-control-integration.ts` | aucune | valeurs fournies | objet gelé | OUI; aucun consommateur production |
| Governance | Approbations, campagnes, décisions, ordres de mission, lifecycle, agrégateur core | `server/governance/` | OS Integration | listes/gates/résultats fournis | preuves/readiness | OUI comme règles déterministes en mémoire; 6 sources + 6 tests |
| Portfolio | Readiness de portfolio | `server/portfolio/portfolio-management.ts` | Governance Core | résultat + composants | `PortfolioManagementResult` | OUI comme vérificateur |
| Scheduler (PROGRAM-008) | Readiness du scheduler documentaire | `server/scheduler/scheduler.ts` | Portfolio | résultat + composants | `SchedulerResult` | OUI comme vérificateur; distinct du scheduler réel de missions |
| Resource Manager | Readiness des composants ressources | `server/resource-manager/resource-manager.ts` | Scheduler | résultat + composants | `ResourceManagerResult` | OUI comme vérificateur; aucune allocation de ressource externe |
| Risk Engine | Conjonction de readiness et références de preuve | `server/risk-engine/risk-engine.ts` | Governance, Portfolio | deux résultats + 5 composants | `RiskEngineResult` | PARTIEL par rapport à un moteur de risques : les 5 composants par défaut sont codés `ready: true` (`:50-73`); aucune matrice/calcul de risque |
| KPI Engine | Conjonction de readiness | `server/kpi-engine/kpi-engine.ts` | Portfolio, Risk | résultats + composants | `KpiEngineResult` | PARTIEL : readiness, pas ingestion/calcul de KPI externe |
| Dashboard Evidence | Conjonction de readiness | `server/dashboard/dashboard.ts` | Scheduler, Resource, Portfolio, Risk, KPI | résultats + composants | `DashboardResult` | PARTIEL : preuve backend, pas endpoint/dashboard alimenté |
| Final Certification | Conjonction de sept résultats et sept drapeaux | `server/final-certification/final-certification.ts` | chaîne Governance→Dashboard | résultats + composants | `FinalCertificationResult` | PARTIEL : composants par défaut `ready: true` (`:90-124`); ne vérifie pas le contenu des fichiers référencés |
| Parallel Orchestration | Simulation synchrone de PDS, dépendances déclarées, conflits d'artefacts et échecs forcés | `server/parallel-orchestration/parallel-orchestration.ts` | Final Certification | tableau de simulations PDS + options | enregistrements, métriques, GO/STOP | OUI comme simulateur; limite codée 16 (`:8`), cœur `:337-425`; aucun lancement de processus/agent réel |

### 2.2 Inventaire des modules Kernel internes sans API

`kernel-composition-foundation`, `kernel-decision-flow`, `kernel-decision-reporting-composition`, `kernel-decision-reporting-integration`, `kernel-execution-flow-control`, `kernel-execution-traceability`, `kernel-mission-composition`, `kernel-mission-order-cycle`, `kernel-mission-order-intake`, `kernel-primitive-control`, `kernel-reporting-flow`, `kernel-runtime-composition`, `kernel-runtime-context`, `kernel-runtime-execution`, `kernel-traceability-composition`, `kernel-traceability-integration`, `kernel-traceability`, `kernel-workflow-composition`, `kernel-workflow-execution`, `kernel-workflow-state-handling`.

Preuve commune : chaque test correspondant contient « exposes no public API » et charge les fonctions par lecture/transformation VM. Aucun de ces vingt fichiers n'a d'import, d'export ou de consommateur de production.

### 2.3 Frontend

Runtime : React 18 + Vite (`apps/nova-web/package.json:15-37`). Entrée : URL navigateur et interactions locales. Sortie : DOM. Aucune dépendance de client HTTP ou SDK backend n'est déclarée.

| Groupe | Composants | Emplacement | Entrées / sorties | État |
| --- | --- | --- | --- | --- |
| Entrée application | `App`, `main` | `apps/nova-web/src/` | pathname → surface React | OUI, build/test |
| Navigation | `NavigationController`, `NavigationProvider`, `RouteDefinition`, `RouteRegistry`, `routeResolver`, `routeState`, hooks | `src/routes`, `src/app`, `src/hooks` | History API/URL → route courante | OUI, tests unitaires |
| Shell | `AppShell`, `ContentArea`, `ContentViewport`, `NavigationItem`, `NavigationSection`, `NavigationShell`, `ShellDivider`, `ShellFooter`, `ShellLogo`, `SideNavigation`, `TopBar`, `ShellPlayground` | `src/components/shell` | props/clics → DOM | OUI, tests composants |
| UI partagée | `Badge`, `Button`, `Progress`, `Skeleton`, `Spinner`, `Status` | `src/components/shared` | props → DOM | OUI, tests |
| Surfaces | `Card`, `EmptyState`, `PageContainer`, `Panel`, `Section`, `Surface` | `src/components/surfaces` | props → DOM | OUI, tests |
| Routes | `HomeSurface`, `WorkSurface`, `DecisionsSurface`, `DeliverablesSurface`, `RouteSurface`, titres/descriptions/placeholders | `src/components/routes` | route → surface | PARTIEL : les routes déclarent explicitement être réservées à de futurs workflows (`RouteRegistry.ts:14-26`, `DecisionsSurface.tsx:11-15`) |
| Home | 12 composants `features/home` | `src/features/home` | fixture locale/callbacks → DOM | PARTIEL : toutes les données viennent de `homeFixture.ts`; aucune API |
| Lab | `NOVAUIPlayground`, tests | `src/components/lab` | aucune donnée métier | OUI comme démonstrateur UI |
| Design system | 34 CSS dont tokens | `src/styles`, CSS modules | CSS → rendu | OUI; tests tokens |
| E2E | configuration Playwright | `playwright.config.ts` | — | NON : script présent, aucun fichier e2e/spec Playwright trouvé |
| Lint | ESLint | `eslint.config.js` | sources + `dist` | NON OPÉRATIONNEL : 239 erreurs; parseur TS/TSX absent et `dist` non ignoré |

### 2.4 Corpus documentaire

| Composant | Volume / emplacement | Rôle observable | État |
| --- | --- | --- | --- |
| Documentation NOVA/CEREBRAU | 1 031 Markdown sous `Docs/` et racine | spécifications, programmes, rapports, registres, baselines | PRÉSENT; ne prouve pas l'exécution |
| Knowledge Index | `Docs/06_REFERENCE/KNOWLEDGE_INDEX*.md` | index statiques par type/statut/tag/module/relation/etc. | PRÉSENT; aucun générateur courant trouvé |
| Programmes | `Docs/19_PROGRAMS/PROGRAM-*` | gouvernance et rapports de PROGRAM-002 à PROGRAM-052 | PRÉSENT; plusieurs programmes n'ont aucun code homonyme |
| Baseline NOVA 1.0 | `Docs/21_BASELINES/NOVA_v1.0.0/` | catalogue, interface, matrice | PRÉSENT mais métriques de tests désynchronisées |
| Context Engine CEREBRAU | `Docs/06_REFERENCE/CEREBRAU_CONTEXT_ENGINE_MVP_V1.md` | décrit 10 providers et `reconstructContext()` | NON PROUVÉ : dossier de code annoncé absent |
| Validator V2 | `Docs/01_CORE/VALIDATOR_*.md` | architecture/classification/reporting/metrics | NON PROUVÉ : aucun module serveur Validator |
| API/Persistence/Identity | `Docs/19_PROGRAMS/PROGRAM-016_*`, un OpenAPI YAML | contrats documentaires | NON PROUVÉ : aucun serveur/endpoints/persistance implémentés |
| Mission Control Platform, Change Governance, Visual Certification, Strategic Intelligence, NEVIS | PROGRAM-018/033/037/050/052 | conception et rapports | NON PROUVÉ hors composants explicitement inventoriés ci-dessus |

## 3. Cartographie des dépendances et workflows

### 3.1 Chaîne de readiness effectivement importée

```text
Kernel (majoritairement isolé)

OS Runtime
  -> Mission Runtime
  -> Workflow Runtime
  -> Agent Runtime
  -> Execution Engine
  -> Runtime Traceability
  -> OS Integration
  -> Governance Core
  -> Portfolio
  -> Scheduler
  -> Resource Manager
  -> Risk Engine
  -> KPI Engine
  -> Dashboard
  -> Final Certification
  -> Parallel Orchestration
```

La chaîne est confirmée par les imports des fichiers correspondants et documentée à `Docs/21_BASELINES/NOVA_v1.0.0/COMPONENT_CATALOG.md:51-63`. Il ne s'agit pas d'un graphe reconstruit automatiquement : ce sont des imports codés manuellement.

### 3.2 Workflow de mission réellement exécutable

```text
createMission (DRAFT)
  -> acceptMission (READY + queue)
  -> assignMission (ASSIGNED)
  -> acquireLock (LOCKED)
  -> buildContext
  -> executeMission callback (RUNNING -> SUBMITTED)
  -> technical/documentary/human validation
  -> approve/reject
  -> release lock
```

Preuves : table `TRANSITIONS` à `orchestrator-runtime.service.ts:21`, méthodes publiques à `:350-577`, scénario complet dans `orchestrator-runtime.test.ts:66-121`.

Limites prouvées : magasins uniquement en mémoire (`Map`, tableaux), horodatages locaux, handler d'exécution fourni par l'appelant, aucune reprise après processus, aucun transport, aucune authentification, aucune persistance.

### 3.3 Workflow de simulation PDS

Tri des squads → vérification des identifiants de dépendance → sélection des squads prêtes → limite de concurrence → détection de conflit d'artefacts → enregistrement COMPLETE/FAILED/STOPPED → métriques. Preuve : `parallel-orchestration.ts:337-425`. Il s'agit d'une boucle synchrone de simulation; aucun PDS externe n'est lancé.

## 4. Matrice des moteurs demandés

| Moteur | Existe ? | Fonctionne ? | Utilisé en production interne ? | Consommateur / preuve |
| --- | --- | --- | --- | --- |
| Context Engine CEREBRAU | NON PROUVÉ | NON PROUVÉ | NON | Documentation `CEREBRAU_CONTEXT_ENGINE_MVP_V1.md`; code `server/cerebrau-context` absent |
| Runtime OS | OUI | OUI en mémoire | OUI dans chaîne de readiness | `server/runtime/os-runtime/`, tests |
| Orchestrator Runtime | OUI | OUI en mémoire | Aucun host/app consommateur | `server/runtime/orchestrator/`, 6 tests |
| Mission Engine/Runtime | OUI | OUI comme readiness + runtime mission | OUI dans Execution Engine; runtime mission testé directement | dossiers mission/orchestrator |
| Workflow Runtime | OUI | OUI comme readiness | OUI dans Agent/Execution | `server/runtime/workflow-runtime/` |
| Agent Runtime | OUI | OUI comme readiness | OUI dans Execution | `server/runtime/agent-runtime/` |
| Execution Engine | OUI | OUI comme agrégateur | OUI dans OS Integration | `server/runtime/execution-engine/` |
| Dependency Engine | NON | — | NON | aucune classe/module; seulement dépendances déclarées dans simulateur PDS |
| Scanner | NON | — | NON | aucune lecture production du filesystem/Git |
| Register Builder | NON | — | NON | registres Markdown statiques, aucun builder |
| Validator | NON PROUVÉ | — | NON | documents `VALIDATOR_*`, aucun code homonyme |
| Publisher | NON | — | NON | aucun transport; EventBus stocke dans tableau mémoire |
| Decision Engine | PARTIEL | OUI pour transitions/règles fermées | OUI dans gouvernance/runtime | `decision-workflow.ts`; aucune décision métier VEEDDA |
| Knowledge Engine | NON | — | NON | Knowledge Index statique uniquement |
| Classification Engine | NON PROUVÉ | — | NON | documentation Validator/PROGRAM-033, aucun code |
| Graph Engine | PARTIEL | OUI pour graphe runtime fermé | OUI dans OS integration | `runtime-traceability.ts`; pas de graphe de repository |
| Risk Engine | PARTIEL | OUI comme gate | OUI dans chaîne | `risk-engine.ts:50-85` |
| KPI Engine | PARTIEL | OUI comme gate | OUI dans chaîne | `kpi-engine.ts` |
| Certification Engine | PARTIEL | OUI comme conjonction de drapeaux | OUI dans parallèle | `final-certification.ts:90-181` |

## 5. Analyse de code : 24 verdicts

Le verbe « reconstruire » est évalué comme une capacité appliquée à un repository fourni, pas comme la présence de modèles internes NOVA.

| Capacité | Verdict | Preuve |
| --- | --- | --- |
| Scanner un repository | NON | aucune lecture filesystem en production; lectures seulement dans tests |
| Comprendre l'architecture | NON | aucun analyseur/parser; documents statiques seulement |
| Reconstruire les dépendances | NON | aucun resolver; le simulateur reçoit `dependsOn` déjà fourni |
| Détecter les imports | NON | aucun parser TS/JS/AST |
| Reconstruire les appels | NON | aucun call graph |
| Reconstruire les flux | NON | aucun analyseur de contrôle/données |
| Reconstruire les workflows | NON | modèles internes codés, aucune extraction externe |
| Reconstruire les bounded contexts | NON | terme absent, aucun modèle DDD correspondant |
| Reconstruire les agrégats | NON | aucun analyseur/registre d'agrégats |
| Reconstruire les sources de vérité | NON | mentions documentaires, aucun détecteur |
| Reconstruire les projections | NON | aucun analyseur de projection |
| Reconstruire les DTO | NON | interfaces internes présentes, aucune extraction |
| Reconstruire les événements | NON | événements NOVA codés dans `orchestrator-runtime.types.ts`, aucune extraction externe |
| Reconstruire les machines d'état | NON | machine NOVA codée à la main, aucun reconstructeur |
| Reconstruire les contrats | NON | un OpenAPI documentaire, aucun analyseur |
| Reconstruire les API | NON | aucun scanner/endpoint |
| Reconstruire les Edge Functions | NON | aucune implémentation ou scanner Edge |
| Reconstruire les RPC | NON | aucune implémentation ou scanner RPC |
| Reconstruire les triggers | NON | 0 SQL, 0 `CREATE TRIGGER` |
| Reconstruire PostgreSQL | NON | 0 SQL et aucune dépendance `pg`/ORM |
| Reconstruire Supabase | NON | mentions documentaires seulement, aucune dépendance SDK |
| Reconstruire React | NON | NOVA contient React, mais ne l'analyse pas |
| Reconstruire Express | NON | aucune dépendance Express et aucun analyseur |
| Reconstruire les chaînes métier | NON | aucune ingestion de code/données VEEDDA |

## 6. Analyse d'architecture : 23 verdicts

| Détection demandée | Verdict | Preuve |
| --- | --- | --- |
| Doubles sources de vérité | NON | aucun scanner ni modèle de SOT |
| Workflows concurrents | NON | simulateur de squads, pas détecteur de workflows existants |
| Projections concurrentes | NON | aucune notion exécutable de projection |
| Doubles écritures | NON | aucune analyse de writes |
| Lectures concurrentes | NON | aucune analyse de reads |
| Composants morts | NON | aucun graphe de reachability; l'audit manuel a trouvé des modules sans consommateur |
| Composants orphelins | NON | idem |
| Cycles | NON | aucun algorithme SCC/toposort de repository |
| Dépendances circulaires | NON | idem |
| Violations DDD | NON | aucune règle DDD implémentée |
| Violations Clean Architecture | NON | aucune règle implémentée |
| Violations hexagonales | NON | aucune règle implémentée |
| Violations CQRS | NON | aucune règle implémentée |
| Violations Event Sourcing | NON | replay interne présent, aucun audit de conformité ES |
| Violations SOLID | NON | aucune analyse statique SOLID |
| Dette technique | NON | aucun moteur de métriques/dette |
| Code legacy | NON | aucun classifieur |
| Code dormant | NON | aucun graphe d'usage/couverture croisé |
| Fonctionnalités non consommées | NON | aucun détecteur; constat manuel possible seulement |
| Modules incomplets | NON | aucun critère/extracteur automatique |
| Runtime incomplet | NON | readiness sur listes fermées, pas audit d'un runtime externe |
| Tests manquants | NON | aucun mapping exigences→tests |
| Couverture | PARTIEL | mesure exécutable pour ce dépôt via Node/Vitest; aucun moteur NOVA qui analyse un projet tiers |

Constats manuels sur NOVA, non capacités de NOVA :

- 20 modules Kernel ne sont pas importables publiquement et n'ont pas de consommateur de production.
- `mission-control-capability-registry.ts` et `mission-control-integration.ts` n'ont pas de consommateur production.
- le frontend dépend de fixtures et contient des routes explicitement réservées.
- la chaîne lint échoue.
- aucun host serveur/persistance n'est livré.

## 7. Digital Twin

### 7.1 Cartographies automatiques

| Cartographie | Verdict | Preuve |
| --- | --- | --- |
| Composants | NON | catalogue Markdown statique; aucun générateur |
| Workflows | NON | aucun extracteur |
| Flux | NON | aucun extracteur |
| Données | NON | aucun schéma/parser |
| SQL | NON | 0 fichier SQL |
| API | NON | OpenAPI documentaire unique, aucun reconstructeur |
| Runtime | PARTIEL | graphe fermé NOVA dans `runtime-traceability.ts`, non généré depuis le code |
| Edge | NON | aucune implémentation |
| RPC | NON | aucune implémentation |
| Events | NON | liste interne codée, pas cartographie automatique |
| Projections | NON | aucune implémentation |
| Tests | NON | rapports/couverture par outils externes, aucun twin |
| Sources de vérité | NON | aucune extraction |
| États | NON | modèles internes codés, aucun extracteur |
| Dépendances | NON | imports manuels, aucun générateur |
| Chaînes métier | NON | code VEEDDA absent |
| Graphe Digital Twin unifié | NON | terme `Digital Twin` absent du dépôt |

### 7.2 Comparaison avec le Digital Twin VEEDDA

| Question | Verdict strict |
| --- | --- |
| Ce qui existe déjà dans le Digital Twin VEEDDA | NON PROUVÉ — artefact non fourni dans le dépôt audité |
| Ce qui manque dans le Digital Twin VEEDDA | NON PROUVÉ |
| Ce que NOVA fait mieux | NON PROUVÉ — comparaison impossible |
| Ce que NOVA fait moins bien | NON PROUVÉ — comparaison impossible |

Le Knowledge Index CEREBRAU est observable comme corpus de tables Markdown. Il ne peut pas être assimilé à un Digital Twin automatique sans définition et artefact de référence fournis.

## 8. DPDS

| Capacité | Verdict | Preuve |
| --- | --- | --- |
| Registre automatique des incohérences | NON | aucun module |
| Analyse d'impact | NON | aucun graphe de code/données |
| Matrice des risques | NON | Risk Engine = conjonction de readiness, pas matrice |
| Matrice des dépendances | NON | dépendances PDS fournies en entrée, pas matrice générée |
| Priorisation | PARTIEL | queue mission trie un entier `priority`; aucune méthode de calcul |
| Génération DPDS | NON | aucun type/module DPDS |
| Génération des missions | PARTIEL | `createMission` matérialise une définition fournie; ne la génère pas |
| Génération des tests | NON | aucun générateur |
| Génération des preuves | PARTIEL | nombreuses factories `create*Evidence` sur entrées fermées |
| Génération de certification | PARTIEL | `verifyFinalCertification` produit un résultat depuis drapeaux/résultats fournis |

## 9. Rôle réel et doublons CEREBRAU

### 9.1 Qualification factuelle de NOVA

| Rôle | Verdict | Limite prouvée |
| --- | --- | --- |
| Orchestrateur | OUI, en mémoire | pas de host, persistance, bus externe ni agent launcher |
| Analyseur | NON | aucune ingestion/analyse de repository |
| Moteur documentaire | PARTIEL | corpus et références; pas de lecture/génération runtime |
| Moteur de certification | PARTIEL | agrégation de drapeaux et références non relues |
| Moteur de dépendances | PARTIEL | dépendances PDS explicites et chaîne d'imports codée |
| Moteur de décision | PARTIEL | transitions/gates fermés; aucune décision métier VEEDDA |
| Moteur d'exécution | OUI pour callback local | le callback est fourni par l'appelant; aucun Codex/worker intégré |

### 9.2 Doublon observable

Le document CEREBRAU attribue à son Context Engine l'orchestration de 10 providers et l'agrégation, sans décision métier (`CEREBRAU_CONTEXT_ENGINE_MVP_V1.md:5-20, 246-255`). NOVA possède un autre orchestrateur, consacré aux missions et transitions. Le mot « orchestrer » recouvre donc deux responsabilités différentes dans les documents.

Aucun doublon d'implémentation ne peut être prouvé, car le Context Engine CEREBRAU documenté n'est pas présent en code dans ce commit.

## 10. Connexion à VEEDDA

### 10.1 Ce qui peut être déterminé

NOVA accepte aujourd'hui uniquement des objets en mémoire : mission, agents, références, composants, preuves et simulations. Une connexion VEEDDA nécessite donc des adaptateurs nouveaux; aucun n'existe.

Contrat minimal proposé, explicitement **cible et non capacité existante** :

| Flux cible | Données à fournir | Producteur cible | Consommateur cible |
| --- | --- | --- | --- |
| Snapshot repository | commit SHA, chemins, langages, manifests | adaptateur read-only VEEDDA | analyse CEREBRAU |
| Graphe code | modules, imports, symboles, appels | analyse CEREBRAU | Digital Twin |
| Graphe données | schémas, tables, vues, fonctions, RPC, triggers, policies | adaptateur DB read-only | Digital Twin |
| Graphe runtime | routes, endpoints, jobs, Edge Functions, événements | analyse CEREBRAU | Digital Twin |
| Registres | incohérences, impacts, risques, dépendances | moteurs CEREBRAU à construire | DPDS/validation |
| Mission spec | objectif, scope autorisé/interdit, livrables, stop criteria, références | CEREBRAU | `OrchestratorRuntimeService.createMission` |
| Evidence retour | fichiers changés, checks, blockers, erreurs | worker Codex | NOVA puis CEREBRAU |

### 10.2 Éléments exacts NON PROUVÉS faute de dépôt VEEDDA

Les répertoires à scanner, documents d'autorité, bases, schémas, URLs/API, modules React/Express, Edge Functions, RPC, triggers, index et sources de vérité de VEEDDA sont **NON PROUVÉS**. Les nommer précisément sans accès au dépôt, au catalogue DB et aux contrats déployés serait une supposition interdite.

### 10.3 Prérequis probatoires de connexion

1. Fournir le ou les commits VEEDDA à auditer.
2. Fournir un manifest signé des racines autorisées et exclusions.
3. Fournir un dump de schéma PostgreSQL/Supabase sans données ni secrets, ou un rôle metadata read-only.
4. Fournir les spécifications OpenAPI/Edge/RPC déployées et leur version.
5. Fournir la définition et l'export courant du Digital Twin VEEDDA.
6. Fournir l'autorité des documents CEREBRAU et le modèle DPDS attendu.

## 11. Architecture cible sans doublon

Cette section est une **proposition d'architecture**, pas une description de capacité actuelle.

```text
VEEDDA (sources métier et runtime, lecture seule)
   -> Adaptateurs d'inventaire CEREBRAU
   -> Analyseurs + Digital Twin + registres CEREBRAU
   -> Décision humaine/policy + génération de MissionSpec
   -> NOVA Mission Control (queue, assignment, lock, transitions, audit)
   -> Worker Codex (exécution dans scope)
   -> preuves NOVA
   -> validation/certification CEREBRAU + humain
   -> mise à jour transactionnelle Twin/registres
```

| Question | Responsable cible | Frontière stricte |
| --- | --- | --- |
| Qui orchestre ? | NOVA pour l'exécution des missions | CEREBRAU orchestre seulement ses providers/analyseurs |
| Qui analyse ? | CEREBRAU | NOVA ne parse pas le code métier |
| Qui décide ? | CEREBRAU + autorité humaine | NOVA applique une décision/transition, ne décide pas le métier |
| Qui construit le Digital Twin ? | CEREBRAU | VEEDDA reste source observée; NOVA n'en possède pas une copie canonique |
| Qui génère les missions DPDS ? | CEREBRAU | NOVA reçoit une `MissionDefinition` validée |
| Qui prépare Codex ? | CEREBRAU prépare le contexte; NOVA assigne/verrouille | le worker ne découvre pas seul son autorité |
| Qui contrôle les preuves ? | CEREBRAU Validator + humain | NOVA collecte et trace, sans auto-certifier le fond |
| Qui met à jour le Twin ? | CEREBRAU après acceptation | mise à jour depuis preuves acceptées, pas depuis simple soumission |
| Qui met à jour les registres ? | CEREBRAU | NOVA conserve seulement états/audits de mission |
| Qui certifie ? | Autorité CEREBRAU/humaine | NOVA fournit la chaîne de preuve et applique l'état final |

Justification observable : cette séparation conserve le rôle démontré de NOVA (`createMission`, queue, locks, transitions, audits) et n'attribue pas à NOVA les analyseurs absents.

## 12. Roadmap d'intégration conditionnelle

Les charges calendaires/personnes sont **NON ESTIMABLES factuellement** avec les seules preuves disponibles : dépôt VEEDDA, volumétrie, langages, schémas, contraintes de sécurité et définition DPDS manquent. Une estimation chiffrée serait une supposition. La colonne « estimation » indique donc le critère mesurable permettant de la produire après LOT 0.

| LOT | Objectif | Périmètre / composants | Dépendances | Estimation | Risques observables | Réussite / certification |
| --- | --- | --- | --- | --- | --- | --- |
| LOT 0 — Evidence Intake | Rendre VEEDDA auditable | commits, manifest racines, schéma DB, API, Twin, DPDS | accès read-only | À calculer après comptage fichiers/LOC/schémas | périmètre absent aujourd'hui | hash et inventaire reproductibles; zéro secret collecté |
| LOT 1 — Durcissement NOVA Runtime | Rendre le runtime hébergeable | API interne, persistance, migrations, idempotence, auth, reprise | choix de host/DB approuvé | NON ESTIMABLE avant choix | runtime actuel mémoire; aucun serveur | tests crash/replay/concurrence; stockage durable; API contractuelle |
| LOT 2 — Scanner | Inventorier repository | walker, exclusions, manifests, Git snapshot, hashing | LOT 0 | Après volumétrie LOT 0 | symlinks, monorepo, fichiers générés | inventaire identique sur même commit; erreurs explicites |
| LOT 3 — Analyse code | Imports/symboles/appels/API React/Express | parsers par langage, résolveurs, call graph | LOT 2, langages prouvés | Après registre des langages | résolution dynamique | corpus golden + précision/rappel mesurés |
| LOT 4 — Analyse SQL/Supabase | Schéma, RPC, triggers, policies, Edge | parser/dump adapters | dump metadata LOT 0 | Après nombre d'objets DB | introspection incomplète | graphe DB réconcilié au dump; écarts explicités |
| LOT 5 — Digital Twin | Unifier composants/flux/données/états/tests | graph store, identité, provenance, versioning | LOT 3-4 | Après taille des graphes | collisions d'identité, obsolescence | chaque nœud/lien porte source+commit; rebuild déterministe |
| LOT 6 — Analyse architecture | incohérences, cycles, dead/orphans, règles | rule engine + registre findings | LOT 5 + règles autorisées | Après nombre de règles | faux positifs | chaque finding reproductible avec règle et preuve; benchmark labellisé |
| LOT 7 — DPDS | impact, risque, priorité, missions | modèles DPDS, générateur MissionDefinition | LOT 6 + modèle DPDS fourni | Après définition DPDS | priorité opaque | décision explicable; mission bornée; validation humaine |
| LOT 8 — Codex Adapter | exécuter missions bornées | worker, sandbox, locks, report adapter | LOT 1, 7 | Après environnement cible | collision, dépassement scope | aucun write hors scope; rapport exhaustif; reprise sûre |
| LOT 9 — Certification | contrôler preuves et mettre à jour Twin | validator, gates, human approval, transactional update | LOT 5-8 | Après politique de certification | auto-certification circulaire | séparation producteur/validateur; audit immuable; rollback |
| LOT 10 — Pilote VEEDDA | une chaîne métier bornée | sélection après LOT 0 | tous lots utiles | Après sélection factuelle | couverture partielle | comparaison au ground truth; critères signés; aucun écart silencieux |

## 13. Couverture des besoins

### 13.1 Formule

Périmètre : les 74 capacités automatiques explicitement énumérées par la demande :

- 24 analyse de code;
- 23 analyse d'architecture;
- 17 cartographies Digital Twin;
- 10 capacités DPDS.

Barème : OUI = 1, PARTIEL = 0,5, NON/NON PROUVÉ = 0.

Résultat :

- Analyse code : 0/24;
- Analyse architecture : 0,5/23 (couverture partielle locale);
- Digital Twin : 0,5/17 (graphe runtime fermé, non automatique);
- DPDS : 2/10 (quatre capacités partielles);
- Total pondéré : **3/74 = 4,1 %**.

Ce pourcentage ne mesure pas la qualité du runtime NOVA. Il mesure exclusivement la couverture des capacités d'audit, Twin et DPDS demandées. Les deux périmètres ne doivent pas être confondus.

### 13.2 Capacités manquantes

1. Ingestion repository/Git.
2. Parsers et résolution multi-langages.
3. Graphe imports/symboles/appels/flux.
4. Extracteurs DDD, workflows, états, événements, DTO et contrats.
5. Introspection PostgreSQL/Supabase/Edge/RPC/triggers/policies.
6. Digital Twin versionné avec provenance.
7. Détecteurs d'incohérences et règles d'architecture.
8. Analyse d'impact, risque, priorité et DPDS.
9. Génération de tests et preuves liées aux exigences.
10. Validation indépendante du contenu des preuves.
11. Host API, persistance, sécurité, idempotence et reprise du runtime NOVA.
12. Adaptateur worker Codex.
13. Connexion réelle frontend/backend; suppression des fixtures.
14. E2E réel et lint opérationnel.

## 14. Conditions minimales pour réexaminer le NO GO

1. LOT 0 certifié avec dépôt et artefacts VEEDDA.
2. Scanner reproductible démontré sur un commit figé.
3. Digital Twin reconstruit avec provenance ligne/objet/commit.
4. Ground truth VEEDDA disponible pour mesurer précision et rappel.
5. Modèle DPDS canonique fourni et missions générées validées humainement.
6. Runtime NOVA persistant, sécurisé et récupérable après crash.
7. Preuves vérifiées par un composant distinct de leur producteur.
8. Tests complets, lint, typecheck, build, E2E et couverture tous verts.

Tant que ces conditions ne sont pas démontrées, la décision reste **NO GO** pour le rôle complet demandé.
