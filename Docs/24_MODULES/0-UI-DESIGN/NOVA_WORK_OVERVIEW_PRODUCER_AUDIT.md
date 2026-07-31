# NOVA WORK OVERVIEW — AUDIT DES PRODUCTEURS MÉTIER

## 1. Verdict

**CAUSE RACINE : ABSENCE D'UNE CAPACITÉ MÉTIER RUNTIME WORK COMPLÈTE**

Le blocage n'est pas principalement une non-exposition.

Quelques données techniques sont exposées et plusieurs composants internes portent des noms
proches — Progress, Decision, Scheduler, Resource Manager, Dashboard — mais aucun ensemble
Runtime ne possède la sémantique autoritative nécessaire à Work Overview.

Le résultat détaillé est consigné dans
`NOVA_WORK_OVERVIEW_PRODUCER_MATRIX.md`.

## 2. Périmètre et méthode

### 2.1 Sources documentaires lues

- `NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md` ;
- `NOVA_WORK_OVERVIEW_RUNTIME_GAP_REPORT.md` ;
- `NOVA_SW013_WORK_OVERVIEW_READMODEL_IMPLEMENTATION_REPORT.md` ;
- `NOVA_RUNTIME_REGISTRY.md` ;
- `NOVA_CAPABILITY_REGISTRY.md` ;
- `NOVA_RUNTIME_TRACEABILITY_MATRIX.md` ;
- `PROGRAM_036_PROGRAM_ARCHITECTURE.md`.

### 2.2 Code audité

L'audit a couvert :

- les 55 fichiers TypeScript Runtime de production sous `server/runtime/` ;
- les 157 fichiers TypeScript serveur de production sous `server/` ;
- les services Core et Orchestrator ;
- les contrats Runtime ;
- les repositories et la persistance ;
- les modèles internes de timeline, progression et métriques ;
- les producteurs d'événements ;
- les workflows de décision et d'approbation ;
- les schedulers ;
- les composants Resource Manager, KPI, Risk, Portfolio et Dashboard ;
- les routes de lecture Core et BFF.

Les recherches exactes dans le code serveur de production donnent zéro occurrence pour
`WorkOverview`, `WorkItem`, `confPct`, `phaseNum`, `phaseTotal`, `heroSentence`, `heroGain`,
`nextAction`, `laterActions`, `backgroundActions`, `PersonData`, `DeliverableData`,
`DecisionData` et `availability`.

Cette absence a ensuite été contrôlée par inspection des composants aux noms fonctionnellement
proches afin d'écarter les faux négatifs dus au nommage.

## 3. Réponse synthétique par nature de producteur

### 3.1 Producteurs réellement existants et exposés

| Donnée | Producteur | Fichiers | Capability |
|---|---|---|---|
| identité mission, objectif/titre | `OrchestratorRuntimeService` puis `NovaCoreService` | `server/runtime/orchestrator/orchestrator-runtime.types.ts`, `orchestrator-runtime.service.ts`, `server/nova-core/nova-core.service.ts`, `nova-core.http.ts` | `CAP-CORE-MISSION-MANAGEMENT` |
| progression technique | `OrchestratorRuntimeService.getObservabilityEvents` | mêmes contrats Runtime, service Orchestrator, service et HTTP Core | `CAP-CORE-MISSION-MONITORING` |
| dernière mise à jour | `RuntimeMission.updatedAt` et `RuntimeObservabilityEvent.timestamp` | contrats Runtime et lectures Core | `CAP-CORE-MISSION-MANAGEMENT`, `CAP-CORE-MISSION-MONITORING` |
| titres de livrables seulement | `RuntimeMission` et `MissionReport` | contrats Runtime, Orchestrator, Core | `CAP-CORE-MISSION-MANAGEMENT`, `CAP-CORE-EVIDENCE-SUBMISSION` |

Les livrables restent partiels : le Runtime ne produit ni identifiant métier Deliverable ni
confiance Deliverable.

### 3.2 Producteurs uniquement internes

**Aucun producteur interne n'est sémantiquement compatible avec un groupe Work manquant.**

Des composants internes existent, mais dans d'autres responsabilités :

- `MissionProgress` et `MissionMetrics` : exécution et timeline ;
- `MissionEventPublisher` : publication de données déjà fournies ;
- `HumanApprovalWorkflow` : validation humaine d'un bundle technique ;
- `IntegrationRuntimeRepository` : persistance d'intégration limitée à cinq kinds techniques ;
- `DecisionWorkflow` : gouvernance des Programs ;
- `Scheduler` et `RuntimeScheduler` : ordre d'exécution ;
- `ResourceManager` : preuve de readiness Program ;
- `Dashboard` : agrégation de readiness Program ;
- `MissionControlCapability` : indicateur de readiness.

Leur exposition ne produirait pas les données Work attendues.

### 3.3 Producteurs totalement absents

| Domaine métier | Producteurs absents |
|---|---|
| Work Intelligence | confiance Work, situation, recommandation, Next Best Action, synthèse NOVA |
| Work Schedule / Plan | phase Work et échéance Work |
| Work Action | collections Later et Background |
| Work Decision | décision métier principale avec confiance, échéance, titre et conséquence |
| Work Assignment / People | propriétaire fonctionnel, personnes, disponibilité et statut |
| Work Deliverable | identifiants métier et confiance des livrables |

## 4. Analyse des composants proches

### 4.1 Mission Progress et Mission Metrics

`MissionProgress` calcule `completed`, `total` et `percentage` depuis le dernier snapshot d'une
timeline d'exécution. `MissionMetrics` agrège des événements, durées et artefacts manquants.

Ils sont internes, désactivés par défaut et non exposés. Surtout, ils ne produisent ni confiance,
ni phase métier Work, ni planning, ni personnes. La progression Work Overview peut déjà utiliser
l'observabilité exposée autorisée par SW-012 ; exposer ces modèles ne résout aucun autre gap.

### 4.2 Decision et Approval

Trois familles existent :

- décisions de gouvernance Program ;
- décisions Kernel d'acceptation d'intake ;
- approbation humaine d'un résultat technique certifié.

Elles appartiennent respectivement aux domaines Execution Governance, Kernel et Human
Validation/Certification. Aucune ne produit une `DecisionData` Work ou ne désigne une décision
principale d'un Work.

### 4.3 Scheduler et Resource Manager

Le Scheduler Program vérifie des composants de séquencement et le Runtime Scheduler ordonne des
identifiants techniques. Aucun ne possède une échéance Work ou les collections Later/Background.

Le Resource Manager vérifie cinq composants documentaires, dont
`mission-squad-assignment`, mais ne maintient aucun enregistrement d'affectation ni catalogue
People. Il ne peut donc pas produire le propriétaire ou la disponibilité.

### 4.4 Dashboard

Le Dashboard agrège les verdicts Portfolio, Scheduler, Resource Manager, Risk et KPI pour
certifier leur readiness. Il n'est ni un repository de Work, ni une projection d'une mission
utilisateur.

### 4.5 Repository d'intégration

`IntegrationRuntimeRepository` est un repository réel, mais ses kinds sont exclusivement :

```text
SESSION
EVIDENCE
CERTIFICATION
HUMAN_APPROVAL
LOG
```

Il ne contient aucun enregistrement Work, Plan, Action, People, Decision métier ou Deliverable
métier. Il est par ailleurs désactivé par défaut. Il ne s'agit pas d'un producteur non exposé.

## 5. Lecture des registres de gouvernance

### 5.1 Capability Registry

Le registre qualifie :

- `CAP-UI-WORK-OVERVIEW` en `STUB` ;
- les autres surfaces Work en `STUB` ;
- Mission Management et Monitoring comme capabilities Core actives ou implémentées ;
- Scheduling, Resource Management, Decision Workflow et Dashboard comme capabilities internes.

Aucune capability Runtime Work Management ou Work Intelligence n'est enregistrée.

### 5.2 Runtime Registry et Traceability Matrix

Ces registres prouvent que les composants techniques sont documentés, testés et traçables.
`FULLY_TRACED` signifie que le composant possède une chaîne de gouvernance ; ce statut ne prouve
pas qu'il produit les données fonctionnelles de Work Overview.

La fixture Frontend et `WorkOverviewPage` sont entièrement traçables comme composants
PROGRAM-036, mais leur source de données reste une fixture.

### 5.3 PROGRAM-036

PROGRAM-036 définit explicitement une capability **frontend-only** et place les règles métier,
la persistance et les APIs backend au-delà de ses responsabilités.

Ses lots séparent Work Overview, Plan, People, Decisions et Deliverables, avec des conditions
bloquantes lorsque les modèles ou contrats sources sont absents. PROGRAM-036 décrit donc la
demande fonctionnelle et les écrans ; il n'est pas le producteur métier manquant.

## 6. Cause racine

La cause racine est systémique :

```text
Work existe comme domaine UX documenté
↓
Work existe comme capability UI STUB
↓
aucun agrégat ou état autoritatif Work n'existe dans le Runtime
↓
aucun producteur Work Intelligence / Plan / Action / People / Decision / Deliverable
↓
la projection Work Overview ne peut pas être calculée
↓
l'endpoint SW-012 ne peut pas retourner un 200 conforme
```

Ce n'est pas :

- un problème local de route ;
- un endpoint oublié ;
- un service existant simplement non injecté ;
- une absence de BFF ;
- un Read Model mal défini.

## 7. Caractère local ou systémique

**SYSTÉMIQUE.**

Les gaps traversent six responsabilités métier et ne se concentrent pas dans un seul mapper.
Ils apparaissent aussi dans les autres surfaces :

- Work Plan dépend des phases et échéances ;
- Work People dépend du catalogue et des affectations ;
- Work Decisions dépend des décisions métier ;
- Work Deliverables dépend des objets Deliverable enrichis ;
- Home dépend également de l'insight et de la Next Best Action.

Un raccordement limité à Overview peut rester isolé au niveau UI et endpoint, mais les producteurs
eux-mêmes constituent une fondation partagée.

## 8. Qualification du futur lot

### 8.1 Choix parmi A à E

| Option | Verdict | Justification factuelle |
|---|---|---|
| A — créer uniquement des producteurs | insuffisant seul | les sources autoritatives et leur propriété métier n'existent pas ; il ne s'agit pas de simples adapters |
| B — exposer des producteurs existants | non | aucun producteur Work compatible n'est caché en interne |
| C — créer une nouvelle capability | **oui** | le registre ne contient aucune capability Runtime possédant l'état et les productions Work nécessaires |
| D — créer un nouveau domaine métier | non | le domaine Work est déjà défini par l'UX et PROGRAM-036 ; son incarnation Runtime manque |
| E — autre | non retenu | aucune autre cause n'est étayée |

La catégorie factuelle est donc **C**.

Cette conclusion ne nomme pas une architecture d'implémentation. Elle constate qu'une capability
Runtime métier doit exister avant qu'un producteur puisse être autoritatif.

### 8.2 Plus petit lot permettant de débloquer Work Overview

Le plus petit lot est un lot de **capability métier Runtime Work**, limité à la production
autoritative des groupes obligatoires SW-012 qui sont absents ou non équivalents :

- confiance et intelligence Work ;
- phase et échéance Work ;
- Next Best Action et actions différées ;
- décision principale Work ;
- propriétaire et résumés People ;
- résumés Deliverable enrichis ;
- synthèse NOVA qualifiée.

Ce lot ne doit pas inclure le Read Model ou l'endpoint, déjà spécifiés dans SW-012 et réservés à
la reprise de SW-013. Il ne doit pas inclure les écrans.

### 8.3 Impact sur les autres écrans

**Oui, au niveau des données partagées ; non, comme obligation de modification UI.**

Les producteurs attendus sont également des prérequis naturels de Plan, People, Decisions,
Deliverables et partiellement Home. Leur création modifierait la disponibilité des données de
ces écrans, mais le lot minimal n'exige pas de raccorder ou modifier ces surfaces.

## 9. Réponses explicites

### 1. Quels producteurs existent réellement ?

Mission Identity, mission/report delivery strings, observability progression et timestamps.

### 2. Quels producteurs sont uniquement internes ?

Aucun producteur Work compatible. Les composants internes identifiés produisent des données
d'exécution, de gouvernance ou de certification appartenant à d'autres domaines.

### 3. Quels producteurs sont totalement absents ?

Work Intelligence, Work Schedule/Plan métier, Work Action, Work Decision, Work
Assignment/People et les enrichissements Work Deliverable.

### 4. Dans quels fichiers sont-ils localisés ?

Les producteurs réellement utilisables sont localisés dans :

- `server/runtime/orchestrator/orchestrator-runtime.types.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.service.ts` ;
- `server/nova-core/nova-core.service.ts` ;
- `server/nova-core/nova-core.http.ts`.

Les analogues internes écartés sont listés avec leurs chemins dans la matrice.

### 5. Le blocage est-il local ou systémique ?

Systémique : il concerne l'absence d'état et de responsabilités métier Work dans le Runtime.

### 6. Quel est le plus petit lot permettant de débloquer Work Overview ?

Un lot borné de capability Runtime Work produisant exclusivement les groupes autoritatifs requis
par SW-012, avant reprise du lot de projection SW-013.

### 7. Ce lot impacte-t-il d'autres écrans ?

Il partage leurs futures sources de données, mais ne requiert aucune modification de leurs
Interfaces dans son périmètre minimal.

### 8. Une nouvelle Capability est-elle réellement nécessaire ?

**Oui.** La capability UI `CAP-UI-WORK-OVERVIEW` est un `STUB` et aucune capability Runtime
existante ne possède la sémantique Work requise. Un nouveau domaine n'est pas nécessaire, car
Work est déjà documenté ; sa capability Runtime manque.

## 10. Décision finale

La cause racine est **l'absence d'une capacité métier Runtime Work complète**, matérialisée par
l'absence de plusieurs producteurs autoritatifs. La non-exposition est secondaire et ne permet
pas, à elle seule, de débloquer Work Overview.

**SW-013A : GO POUR QUALIFICATION DE LA CAUSE RACINE — AUCUNE IMPLÉMENTATION AUTORISÉE.**
