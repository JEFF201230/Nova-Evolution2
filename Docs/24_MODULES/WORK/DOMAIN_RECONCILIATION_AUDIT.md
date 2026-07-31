# DOMAIN-AUDIT-002 — Legacy Domain Reconciliation

## 1. Verdict

**GO**

Les dix domaines canoniques ont été rattachés à une implémentation réelle, à
un candidat technique explicitement qualifié ou à un producteur manquant
démontré après exploration ciblée. Le prochain domaine à intégrer est
**Deliverables** : ses données existent déjà dans le Runtime et sont reliées à
Mission ; elles doivent être associées à Work plutôt que recréées.

## 2. Méthode économique appliquée

### Phase 1 — index des dossiers

Racines demandées :

| Racine | État |
|---|---|
| `server/` | présente |
| `modules/` | absente |
| `packages/` | absente |
| `legacy/` | absente |
| `runtime/` | absente à la racine |
| `core/` | absente à la racine |
| `engines/` | absente à la racine |
| `shared/` | absente |
| `common/` | absente |

Les dossiers `node_modules`, `dist`, `build`, `coverage`, `.git`,
`.snapshots`, les rapports générés et les artefacts ont été exclus.

L'index utile est limité à :

- `server/runtime/` et ses sous-domaines ;
- `server/nova-core/` ;
- `server/nova-bff/` ;
- les moteurs de premier niveau `governance`, `scheduler`, `resource-manager`,
  `risk-engine`, `kpi-engine`, `portfolio` et `parallel-orchestration`.

### Phase 2 — sélection des candidats

La recherche par noms de fichiers et symboles a retenu uniquement les zones
portant les concepts demandés. L'absence de racine `legacy/` empêche de
qualifier une implémentation `ACTIVE_LEGACY` sans preuve supplémentaire. Les
moteurs de premier niveau sont donc qualifiés selon leur comportement réel
(`ENGINE_ONLY`, `RULE_ENGINE` ou `ORCHESTRATOR_ONLY`), pas déclarés legacy par
supposition.

### Phase 3 — lecture ciblée

Seuls les fichiers nécessaires à la qualification des producteurs,
consommateurs, connexions Mission/Runtime et persistances ont été lus.

## 3. Synthèse des domaines

| Domaine | Implémentation principale trouvée | Statut | Produit des données métier | Mission | Runtime | Réutilisabilité |
|---|---|---|---|---|---|---|
| Work | `WorkCoreFoundation`, `WorkLifecycleProducer` | `ACTIVE_RUNTIME` | oui | oui | oui | immédiate, telle quelle |
| Objective | `WorkObjectiveService`, `WorkObjectiveQuery` | `ACTIVE_RUNTIME` | oui | oui, via Work | oui | immédiate, telle quelle |
| Planning | `OrchestratorQueue`, Runtime Scheduler et Program Scheduler | `ORCHESTRATOR_ONLY` | non pour Work Planning | queue Mission seulement | oui techniquement | mécaniques seulement |
| Actions | `RuntimeRecoveryAction`, `AuditEntry.action`, actions de migration | `ORCHESTRATOR_ONLY` | non pour Work Actions | oui techniquement | oui | aucune donnée métier Work |
| Deliverables | `MissionDefinition.deliverables`, `MissionReport`, `deliverableEvidence` | `PARTIAL_RUNTIME` | oui, partiellement | oui | oui | forte, avec association Work |
| Decisions | `HumanApprovalWorkflow`; workflows Governance | `PARTIAL_RUNTIME` | oui pour l'approbation | oui | oui lorsque activé | forte, avec adaptation |
| People | `UserIdentity`, `BffPrincipal`, `LocalIdentityContext`, `RuntimeAgent` | `READ_ONLY` | identité/roles et agents, pas People Work | partiel | BFF et Runtime | moyenne, frontières à adapter |
| Confidence | moteurs Risk/KPI | `ENGINE_ONLY` | non : aucune mesure de confiance | non | hors Runtime métier | faible |
| Intelligence | `ProgramKnowledgeResolver`, `MissionPipeline`, résolveurs d'autorité/UX | `ENGINE_ONLY` | connaissance et résolution, pas intelligence Work | oui | chaîne moteur distincte | moyenne, avec adaptation |
| Synthesis | `MissionBriefBuilder`, `MissionBrief`, `MissionReport` | `PARTIAL_RUNTIME` | synthèses de préparation/exécution, pas synthèse Work | oui | report actif et chaîne moteur distincte | moyenne, avec adaptation |

Répartition :

- `ACTIVE_RUNTIME` : 2 domaines ;
- `PARTIAL_RUNTIME` : 3 domaines ;
- `ORCHESTRATOR_ONLY` : 2 domaines ;
- `READ_ONLY` : 1 domaine ;
- `ENGINE_ONLY` : 2 domaines ;
- `ACTIVE_LEGACY` : 0 domaine démontré.

## 4. Analyse par domaine

### 4.1 Work

- Nom trouvé : Work Core Foundation.
- Chemin :
  `server/runtime/work/work-core-foundation.ts`,
  `work-core.types.ts`, `work-lifecycle.ts`.
- Producteurs : `WorkCoreFoundation` et `WorkLifecycleProducer`.
- Consommateurs :
  `server/nova-core/home-active-work.query.ts` et Work Objective.
- Données : identité Work, Mission, lifecycle, progression, timestamps,
  provenance.
- Connexion : active dans `NovaCoreService` via `HomeActiveWorkQuery`.
- Décision : conserver sans refactoring de domaine.

### 4.2 Objective

- Nom trouvé : Work Objective.
- Chemin : `server/runtime/work/work-objective.*.ts`.
- Producteur : `WorkObjectiveService`.
- Consommateur : `WorkObjectiveQuery`; aucun transport public.
- Source : objectif de Mission propagé par Work Core.
- Données : rattachement Work, libellé, date disponible, provenance ;
  absence explicite des champs non produits.
- Décision : conserver ; domaine interne déjà réutilisable.

### 4.3 Planning

Implémentations trouvées :

- `OrchestratorQueue` et `scheduleNext` pour le dispatch de Missions ;
- `server/runtime/os-runtime/runtime-scheduler.ts` pour l'ordre de readiness
  des composants Runtime ;
- `server/scheduler/scheduler.ts` pour la gouvernance des Programs ;
- `server/parallel-orchestration/parallel-orchestration.ts` pour des
  simulations de PDS.

Aucune ne produit un plan Work, une phase métier, un jalon, une échéance ou une
dépendance métier rattachée à Work. Elles sont réutilisables comme mécaniques
d'orchestration, pas comme producteur Planning.

### 4.4 Actions

Les seules actions structurées sont :

- `RuntimeRecoveryAction` ;
- `AuditEntry.action` ;
- les actions de migration de snapshot ;
- les transitions et commandes d'exécution.

Ce sont des commandes ou traces techniques. Elles ne produisent ni action
suivante Work, ni action différée, ni action métier. Aucun producteur Work
Actions n'est donc masqué par ces occurrences.

### 4.5 Deliverables

Les primitives existent à plusieurs étapes :

- déclaration attendue : `MissionDefinition.deliverables` ;
- propagation d'exécution : `RuntimeContext.deliverables` ;
- sortie réelle : `MissionReport.deliverables` ;
- preuve : `MissionReport.deliverableEvidence` ;
- collecte et validation :
  `server/nova-core/nova-core.execution.ts` et
  `server/nova-core/nova-core.service.ts`.

Le Runtime exige des deliverables non vides, persiste le report dans le
snapshot et relie le report à la Mission. La lacune est l'identité métier
Deliverable et l'association explicite à Work, pas l'absence de toute donnée.

### 4.6 Decisions

Deux périmètres coexistent :

1. `server/nova-core/human-approval-workflow.ts` produit et persiste des
   décisions `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`, `BLOCKED`, liées à
   Mission et Run.
2. `server/governance/decision-workflow.ts` et
   `approval-workflow.ts` vérifient des décisions de gouvernance Program
   construites dans `governance-core.ts`.

Le premier est réutilisable pour les décisions d'approbation ; le second est
un moteur de règles de gouvernance, pas une source Work Decisions. Aucune
association Work ni décision principale Work n'existe.

### 4.7 People

Trois identités distinctes existent :

- utilisateur BFF : `UserIdentity`, `BffPrincipal`, session et rôles ;
- identité locale d'approbation : `LocalIdentityContext` ;
- agent technique : `RuntimeAgent`.

`resource-manager.ts` ne gère pas de personnes : il vérifie des composants de
capacité Program par références documentaires. Les identités existantes sont
réelles et réutilisables, mais aucune ne constitue encore un domaine People
avec personnes, rôles métier, disponibilités et associations Work.

### 4.8 Confidence

Aucun symbole `Confidence` ni champ de confiance n'existe dans les sources
sélectionnées. Les candidats proches sont :

- `risk-engine.ts` : vérification de readiness de composants Risk ;
- `kpi-engine.ts` : vérification de readiness de composants KPI.

Ils retournent des preuves de disponibilité et des booléens `ready/passed`,
pas une mesure de confiance métier. Ils ne peuvent pas être promus en
producteur Confidence.

### 4.9 Intelligence

Le patrimoine contient :

- `ProgramKnowledgeResolver` ;
- `AuthorityResolver` ;
- adaptateurs CEREBRAU et NOVA UX ;
- `MissionContextBuilder` ;
- `MissionPipeline`.

Cette chaîne résout des métadonnées autoritatives pour préparer une Mission.
Elle produit connaissance, dépendances, artefacts manquants et statut de
résolution. Elle ne produit ni insight, recommandation, priorité ni résultat
d'intelligence Work. La chaîne est réutilisable comme source en entrée d'une
future intégration, pas comme équivalent direct.

### 4.10 Synthesis

`MissionBriefBuilder` produit un brief immuable de préparation ; `MissionReport`
porte les résultats d'exécution. Ces objets sont liés à Mission et consommés
par les pipelines de prompt, validation, métriques et certification.

Ils constituent un patrimoine de synthèse réutilisable, mais leurs frontières
sont Mission et exécution. Aucun producteur de synthèse Work courante,
indépendante d'une projection UI, n'est présent.

## 5. Dette de réconciliation

### 5.1 Chevauchements

Cinq grappes de représentations concurrentes ou recouvrantes sont identifiées :

1. Deliverables dans Mission, RuntimeContext, MissionReport et Evidence.
2. Décisions dans Human Approval, Governance Decision et Governance Approval.
3. Identités dans BFF, Human Approval et Agent Registry.
4. Scheduling dans OrchestratorQueue, Runtime Scheduler et Program Scheduler.
5. Synthèse dans MissionBrief, MissionReport et contenu de prompt.

Ce sont principalement des frontières différentes, pas cinq duplications
fonctionnelles exactes. La dette vient de l'absence de mapping canonique entre
ces frontières.

### 5.2 Moteurs isolés

- Scheduler, Resource Manager, Risk Engine et KPI Engine exposent des preuves
  de readiness documentaires, pas des agrégats métier.
- MissionPipeline et NovaOrchestrationBridge forment une chaîne moteur
  cohérente, mais distincte du chemin Runtime autonome de `NovaCoreService`.
- HumanApprovalWorkflow possède une persistance réelle, mais dépend d'une
  composition activée explicitement.

### 5.3 Producteurs réellement disponibles

- Work Core ;
- Work Objective ;
- progression Mission/Monitoring ;
- déclaration et preuve de Deliverables ;
- décision d'approbation humaine ;
- identité BFF et identité technique d'agent ;
- résolution de connaissances Program/UX ;
- brief et report Mission.

### 5.4 Producteurs restant à créer

- Planning métier Work ;
- Actions métier Work ;
- affectations People métier Work ;
- Confidence Work ;
- résultats Intelligence Work ;
- synthèse Work courante.

Decisions et Deliverables nécessitent une association Work et une adaptation,
pas la recréation de leurs producteurs existants.

## 6. Priorité de réintégration

1. **Deliverables** — producteur et preuves Runtime déjà présents, lien Mission
   démontré, forte réutilisabilité.
2. **Decisions** — producteur d'approbation persistant disponible, sémantique
   Work à borner.
3. **People** — identités réelles disponibles, modèle métier et associations
   Work absents.
4. **Intelligence / Synthesis** — moteurs de connaissance et briefs
   réutilisables après séparation explicite de leur sémantique Mission.
5. **Planning / Actions / Confidence** — aucun producteur métier réutilisable
   actuellement.

## 7. Conclusion

Le patrimoine ne justifie ni une reconstruction globale ni l'affirmation que
tous les domaines sont absents. Work et Objective sont actifs. Deliverables et
Decisions disposent déjà de producteurs partiels. People, Intelligence et
Synthesis possèdent des actifs réutilisables sous d'autres frontières.
Planning, Actions et Confidence ne disposent que de mécanismes voisins qui ne
doivent pas être requalifiés artificiellement.

**NEXT DOMAIN TO INTEGRATE: DELIVERABLES**
