# NOVA SW-011A — WORK OVERVIEW BLOCKER ANALYSIS

## 1. Conclusion exécutive

**Le blocage exact n'est pas un simple raccordement manquant.**

Le Frontend possède une forme de vue locale, `WorkOverviewFixture`, mais NOVA ne possède pas de
projection read-only serveur équivalente, approuvée et alimentée. Les endpoints Core v1 exposent
une partie des données techniques de mission. Ils n'exposent ni les données métier suffisantes, ni
le contrat, ni le mapping nécessaires pour produire fidèlement Work Overview.

La composition des endpoints existants permet une **vue partielle**, pas l'écran complet. W01.1
nécessite donc un lot dédié préalable. Ce constat ne démontre pas qu'une modification de
`OrchestratorRuntimeService` soit obligatoirement nécessaire ; il démontre qu'aucune source
autoritative actuellement exposée ne couvre les champs absents.

## 2. Projection attendue par l'écran

La forme exacte consommée par `WorkOverviewPage` est définie dans :

`apps/nova-web/src/features/work/workOverviewFixture.ts`

Sous le nom :

`WorkOverviewFixture`

Cette forme contient :

| Groupe | Champs attendus |
|---|---|
| identité | `workId`, `title` |
| état synthétique | `confidence`, `phase`, `phaseCount`, `dueLabel` |
| insight NOVA | `insight.summary`, `insight.recommendation` |
| prochaine action | `nextAction.title`, `durationLabel`, `impactLabel`, `confidenceFrom`, `confidenceTo`, `why` |
| actions différées | `laterActionCount` |
| décision en attente | `decisionId`, `dueLabel`, `confidence`, `title`, `consequence` |
| progression | `value`, `owner`, `deadline`, `phaseLabel`, `updatedLabel` |
| livrables | liste de `id`, `title`, `confidence` |
| personnes | liste de `id`, `name`, `availability`, `initials`, `kind`, `active` |
| mise à jour NOVA | `novaUpdate` |

`WorkOverviewPage.tsx` utilise directement ces groupes pour son header, l'insight, la next best
action, la décision, la progression, les livrables, les personnes et la mise à jour NOVA. Ils ne
sont donc pas des champs facultatifs pour conserver le rendu actuel.

`WorkOverviewFixture` est un contrat de fixture Frontend. Aucun élément du dépôt ne le qualifie
comme contrat d'échange Core ou BFF.

## 3. Existence d'une projection équivalente

### 3.1 Runtime

**ABSENTE**

Le Runtime orchestrateur expose les contrats suivants dans
`server/runtime/orchestrator/orchestrator-runtime.types.ts` :

- `RuntimeMission` ;
- `MissionReport` ;
- `RuntimeEvent` ;
- `RuntimeObservabilityEvent` ;
- `RuntimeRunRecord` ;
- `RuntimeMissionCertificate`.

Aucun contrat `WorkOverview`, `OverviewProjection`, `OverviewDto` ou équivalent n'existe dans le
code serveur.

`RuntimeMission` contient l'identité, l'objectif, l'état, l'agent assigné, les livrables textuels et
les horodatages. `RuntimeObservabilityEvent` contient une phase technique, une progression, une
durée et un message. Ces contrats ne contiennent pas la projection attendue.

### 3.2 Services

**ABSENTE dans le service Core v1**

`NovaCoreService`, dans `server/nova-core/nova-core.service.ts`, fournit les lectures :

- `listMissions` ;
- `getMission` ;
- `getReport` ;
- `getCertificate` ;
- `getEvents` ;
- `getObservabilityEvents` ;
- `getIncompleteRuns`.

Il n'existe pas de méthode `getWorkOverview` ni de méthode produisant un agrégat équivalent.

Des modèles internes supplémentaires existent dans le dépôt :

- `MissionBrief` ;
- `MissionTimelineModel` ;
- `MissionProgressModel` ;
- `MissionMetricsModel` ;
- `HumanApprovalRequest` et `HumanApprovalDecision`.

Ils ne constituent pas une projection Work Overview :

- `MissionProgressModel` fournit un pourcentage technique à partir d'événements de progression ;
- `MissionMetricsModel` fournit des métriques d'exécution ;
- `MissionBrief` fournit principalement identité, objectif, classification, contraintes et
  artefacts ;
- `HumanApprovalWorkflow` traite une approbation technique liée à une preuve certifiée, et non la
  décision métier en attente affichée par Work Overview.

Ces modèles ne sont pas exposés par les GET Core v1 et ne couvrent pas les données manquantes.

### 3.3 BFF

**ABSENTE**

Le routeur BFF courant expose :

- `GET /health` ;
- `GET /readiness` ;
- `GET /version` ;
- `GET /session` ;
- `POST /session/login` ;
- `POST /session/logout` ;
- `POST /api/runtime/execute`.

Il n'expose aucune lecture mission et aucun endpoint Work Overview.

`RuntimeGatewayResponseDto` et `RuntimeExecuteSuccessView` contiennent uniquement l'identité de
mission/exécution, le statut d'exécution et la certification. Le mapping
`RuntimeResponseMapper` réduit explicitement sa sortie à ces données. Aucun champ Overview n'y est
présent.

`POST /api/runtime/execute` est un endpoint d'exécution, pas un endpoint read-only de projection.
Il ne peut pas être utilisé comme source de Work Overview dans le périmètre W01.1.

### 3.4 DTO et contrats TypeScript

**ABSENTS côté serveur**

Le seul type portant la forme complète de l'écran est `WorkOverviewFixture`, côté Frontend.

Il n'existe pas :

- de DTO serveur Work Overview ;
- de réponse HTTP typée Work Overview ;
- de contrat BFF Work Overview ;
- de contrat Runtime Work Overview ;
- de mapping serveur vers `WorkOverviewFixture`.

## 4. Données disponibles sans agrégat

Certaines données nécessaires existent déjà, mais sous une forme technique ou incomplète :

| Besoin Work Overview | Source existante | Disponibilité | Limite factuelle |
|---|---|---|---|
| `workId` | `RuntimeMission.missionId` | disponible | le lien `workId → missionId` est utilisé par W01.3, mais aucune projection Overview ne l'encapsule |
| `title` | `RuntimeMission.objective` ; `MissionBrief.title` interne | partielle | aucun champ serveur officiellement nommé titre Work dans la réponse Core v1 |
| état | `RuntimeMission.state` et `canonicalState` HTTP | disponible | ce n'est pas la phase métier numérique de la vue |
| progression | dernier `RuntimeObservabilityEvent.progression` ; `MissionProgressModel.percentage` interne | partielle | le modèle interne n'est pas exposé ; aucune règle Overview approuvée ne choisit la valeur |
| phase | `RuntimeObservabilityEvent.phase` | partielle | phase technique textuelle, sans `phaseCount` |
| propriétaire | `RuntimeMission.assignedAgentId` ; `MissionReport.agentId` | non équivalente | identifiant d'agent Runtime, pas propriétaire fonctionnel/personne de la vue |
| mise à jour | `RuntimeMission.updatedAt` ; timestamps des événements | partielle | aucun `updatedLabel` contractuel |
| livrables | `RuntimeMission.deliverables`, `MissionReport.deliverables` | partielle | chaînes sans identifiant de vue ni confiance |
| message d'activité | `RuntimeObservabilityEvent.message` | partielle | message technique ; aucune règle ne le qualifie comme `novaUpdate` |
| décision technique | certificat et `HumanApprovalWorkflow` interne | non équivalente | certification/approbation technique, pas décision métier Overview |

Les recherches serveur ne trouvent aucune donnée métier équivalente pour :

- `confidence` ;
- échéance ou deadline métier ;
- insight et recommandation ;
- next best action ;
- impact et variation de confiance ;
- compteur d'actions différées ;
- décision métier en attente avec échéance, confiance et conséquence ;
- personnes, disponibilité et présence ;
- confiance individuelle des livrables.

Ces éléments ne sont donc pas simplement « dispersés mais disponibles ». Ils sont absents des
contrats serveur observables.

## 5. Composition des endpoints existants

### 5.1 Composition partielle objectivement possible

La composition minimale des lectures Core v1 est :

```text
GET /api/v1/missions
↓
résolution de projectId + missionId à partir du workId
↓
GET /api/v1/missions/:projectId/:missionId
```

Le second endpoint renvoie déjà :

- `mission` ;
- `report` ;
- `events` ;
- `observabilityEvents` ;
- `incompleteRuns`.

`GET .../monitor` ne complète pas cette réponse pour Overview : il renvoie `mission`,
`observabilityEvents` sous le nom `events`, et `incompleteRuns`, déjà présents dans le détail.

`GET .../events` ne complète pas davantage le détail : les événements Runtime sont déjà présents
dans la réponse détaillée.

`GET .../certificate` ajoute une certification technique finale, pas une décision métier en
attente.

Cette composition peut objectivement fournir :

- l'identité de la mission ;
- son objectif ;
- son état ;
- ses timestamps ;
- une progression technique si un événement d'observabilité existe ;
- les noms textuels des livrables ;
- le rapport et les événements techniques.

### 5.2 Composition complète

**IMPOSSIBLE avec les endpoints existants**

La composition ne peut pas produire les champs absents. Elle ne peut pas non plus convertir
objectivement :

- une phase technique en phase métier numérotée ;
- un agent Runtime en propriétaire fonctionnel ;
- une chaîne de livrable en objet avec identifiant et confiance ;
- un message d'observabilité en insight, recommandation ou mise à jour NOVA ;
- une certification technique en décision métier en attente.

Toute conversion de ce type exigerait une règle non présente dans les contrats. Elle constituerait
donc une hypothèse ou un nouveau mapping normatif.

Les payloads libres de `RuntimeEvent` ne résolvent pas ce point : aucun schéma ne garantit qu'ils
contiennent les champs Overview, ni leur sémantique, ni leur présence.

## 6. Qualification exacte du blocage

Le blocage cumule quatre absences :

| Élément | Statut | Localisation du manque |
|---|---|---|
| source autoritative pour les champs métier absents | **MANQUANTE** | modèle de données producteur non identifié dans le dépôt |
| projection/agrégat Work Overview | **MANQUANT** | aucune couche Runtime, Core ou service ne produit la vue |
| contrat/DTO read-only approuvé | **MANQUANT** | aucun contrat serveur ou BFF ne définit la réponse complète |
| endpoint et mapping de lecture | **MANQUANTS** | aucun GET Core/BFF n'expose une projection Overview |

Le problème n'est donc pas seulement :

- un endpoint absent ;
- un mapping Frontend absent ;
- une agrégation absente.

Même si un endpoint d'agrégation était présent, il ne disposerait pas de sources contractuelles
pour tous les champs attendus.

## 7. Où se situe le blocage ?

Le Frontend et la route existent. Le blocage se situe en amont du raccordement Frontend :

```text
Sources métier autoritatives incomplètes ou non identifiées
↓
Projection Work Overview absente
↓
Contrat read-only absent
↓
Exposition Core/BFF absente
↓
Mapping Frontend impossible sans hypothèse
```

Le Runtime de cycle de vie de mission fournit correctement ses données techniques. Le manque porte
sur la projection de lecture destinée à l'écran et sur les données métier qu'elle devrait exposer.

## 8. Le blocage peut-il être levé sans modifier le Runtime ?

Réponse factuelle :

- **oui pour la partie déjà disponible** : identité, objectif, état, timestamps, progression
  technique et noms de livrables peuvent être lus sans modifier le Runtime ;
- **non avec le dépôt actuel pour l'écran complet** : aucune autre source autoritative exposée ne
  fournit les champs métier absents ;
- **une modification d'`OrchestratorRuntimeService` n'est pas démontrée comme seule solution** :
  le dépôt ne permet pas de conclure que la projection doit appartenir au Runtime ;
- **un lot dédié est néanmoins nécessaire** pour établir la source autoritative, le contrat et
  l'exposition manquants avant de reprendre W01.1.

Ainsi, W01.1 ne peut pas être débloquée par une simple modification Frontend ou une simple
composition BFF des contrats actuels.

## 9. Plus petite évolution nécessaire

La plus petite évolution objectivement nécessaire n'est pas « ajouter un endpoint vide ».

Le minimum requis est un ensemble cohérent et approuvé comprenant :

1. une source autoritative pour chaque champ métier actuellement absent ;
2. une projection read-only complète correspondant aux données réellement utilisées par l'écran ;
3. un contrat d'échange validé pour cette projection ;
4. un mapping traçable depuis les sources ;
5. une exposition de lecture accessible au Frontend.

Ce minimum peut réutiliser sans changement les champs Runtime déjà disponibles. Il ne peut pas
fabriquer les champs restants à partir des endpoints actuels.

Le présent audit ne détermine ni la couche d'implémentation, ni un nom d'endpoint, ni une
architecture cible. Il qualifie uniquement les artefacts absents.

## 10. Décision objective pour W01.1

| Question | Réponse |
|---|---|
| Quel est le blocage exact ? | absence simultanée de sources métier complètes, projection, contrat, mapping et exposition read-only Work Overview |
| Où se situe-t-il ? | entre les données techniques Core/Runtime existantes et la forme de vue consommée par le Frontend |
| Peut-il être levé sans modifier le Runtime ? | partiellement oui ; complètement non démontré avec les sources actuelles |
| Peut-il être levé par composition d'endpoints existants ? | non, seulement une vue partielle est composable |
| Quelle est la plus petite évolution nécessaire ? | rendre disponible une projection read-only approuvée, alimentée par des sources autoritatives et exposée par un contrat de lecture |
| W01.1 peut-elle reprendre immédiatement ? | non |
| Un nouveau lot dédié est-il nécessaire ? | **oui** |

**DÉCISION D'AUDIT : W01.1 RESTE BLOQUÉE — LOT DÉDIÉ PRÉALABLE REQUIS**
