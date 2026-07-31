# NOVA WORK OVERVIEW READ MODEL — SPÉCIFICATION CANONIQUE

## 1. Statut

| Attribut | Valeur |
|---|---|
| Mission source | SW-012 |
| Nature | spécification canonique d'un futur lot Runtime read-only |
| État | prête pour ouverture du lot sous réserve des gates d'entrée définis au § 15 |
| Implémentation réalisée | aucune |
| Code, contrat ou endpoint créé | aucun |

Cette spécification fixe le périmètre minimal nécessaire pour alimenter `W01.1 — Work Overview`.
Elle ne crée pas le contrat décrit et n'autorise aucune modification dans SW-012.

## 2. Autorités et preuves

La définition s'appuie sur :

- le PNG canonique
  `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/v7/screens/work-overview.png` ;
- `NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md` produit par SW-009 ;
- `NOVA_SW011_W01_1_WORK_OVERVIEW_REPORT.md` ;
- `NOVA_SW011A_WORK_OVERVIEW_BLOCKER_ANALYSIS.md` ;
- le composant `WorkOverviewPage.tsx` et la forme locale `WorkOverviewFixture` ;
- `# 03 — INFORMATION ARCHITECTURE.txt` et `# 04 — COMPONENT LIBRARY.txt`, qui
  documentent `WorkItem`, `DecisionData`, `DeliverableData` et `PersonData` ;
- `orchestrator-runtime.types.ts`, `orchestrator-runtime.service.ts`,
  `nova-core.service.ts` et `nova-core.http.ts`.

Ordre d'interprétation :

```text
PNG et architecture UX
↓
forme de vue réellement consommée par WorkOverviewPage
↓
contrats Runtime/Core existants
↓
projection read-only minimale
```

Une valeur présente seulement dans une fixture ou une capture constitue une exigence de vue. Elle
ne constitue pas la preuve qu'un producteur Runtime existe.

## 3. Objet du futur lot

Le futur lot devra rendre disponible un seul snapshot read-only, cohérent et traçable, permettant
de remplacer la source `getWorkOverviewFixture(workId)` pour l'onglet Overview.

Chaîne cible :

```text
agrégats métier autoritatifs
        +
lectures mission/observabilité existantes
↓
projection Work Overview
↓
contrat de lecture unique
↓
GET mission overview
↓
W01.1 Work Overview
```

Le lot ne doit ni calculer une nouvelle règle métier, ni inférer une donnée absente depuis un
message libre, ni transformer une donnée technique en donnée métier sans mapping approuvé.

## 4. Informations affichées

Le PNG canonique et le composant existant exigent les groupes suivants :

| Zone | Informations |
|---|---|
| header Work | titre, confiance, phase courante/total, échéance |
| situation NOVA | résumé de situation, recommandation |
| Next Best Action | intitulé, durée, impact, confiance avant/après, justification |
| Later & Background | nombre d'actions différées |
| décision en attente | identifiant, échéance, confiance, titre, conséquence |
| progression | pourcentage, propriétaire, deadline, phase, dernière mise à jour |
| livrables | identifiant, titre, confiance |
| personnes | identifiant, nom, disponibilité, type humain/NOVA, état de présence |
| mise à jour NOVA | message synthétique courant |

Les actions Pause, More, Open, Full analysis et la navigation vers Decision Package sont visibles
ou référencées, mais leur comportement ne fait pas partie du contrat de lecture W01.1.

## 5. Origines métier et agrégats

| Donnée de vue | Origine métier canonique | Agrégat logique | Existence Runtime actuelle |
|---|---|---|---|
| identité et titre | mission active / `WorkItem.id`, `WorkItem.title` | Mission / Work | partielle : `RuntimeMission.missionId`, `objective` |
| confiance Work | `WorkItem.confPct` | Work Intelligence | absente |
| phase courante/total | `WorkItem.phaseNum`, `phaseTotal` | Work Plan / Work | absente ; phase d'observabilité non équivalente |
| échéance | `WorkItem.deadline` | Work Schedule | absente |
| situation et recommandation | `heroSentence`, `heroGain` | Work Intelligence | absente |
| Next Best Action | `nextAction`, `nextActionTime`, `nextActionGain`, `nextActionConfDelta`, `nextActionWhy` | Work Intelligence / Action | absente |
| actions différées | `laterActions`, `backgroundActions` | Work Action | absente |
| décision principale en attente | résumé de `DecisionData` rattaché au Work | Work Decision | absente ; approbation technique non équivalente |
| progression | avancement du Work | Mission Progress / Work | partielle : observabilité technique et modèles internes de progression |
| propriétaire | affectation fonctionnelle du Work | Work Assignment / People | absente ; `assignedAgentId` non équivalent |
| dernière mise à jour | changement le plus récent du Work | Mission / Observability | disponible : `updatedAt` et timestamps |
| livrables résumés | `DeliverableData` du Work | Work Deliverable | partielle : noms textuels seulement |
| personnes résumées | `PersonData` du Work | Work People | absente |
| mise à jour NOVA | synthèse courante NOVA du Work | Work Intelligence | absente ; message technique non équivalent |

Les noms d'agrégats ci-dessus décrivent la propriété sémantique documentée. Ils ne déclarent pas
l'existence de nouvelles classes ou de nouveaux services.

## 6. Services Runtime réutilisables

### 6.1 Services à réutiliser

| Service existant | Méthode | Usage autorisé dans la projection |
|---|---|---|
| `NovaCoreService` | `getMission` | identité, objectif, état, agent assigné, livrables textuels, `updatedAt` |
| `NovaCoreService` | `getReport` | rapport courant, agent technique, livrables et `submittedAt` |
| `NovaCoreService` | `getObservabilityEvents` | progression technique et timestamp le plus récent |
| `NovaCoreService` | `getEvents` | traçabilité technique uniquement ; aucun payload libre ne devient une donnée métier implicite |
| `OrchestratorRuntimeService` | `getMission` | source sous-jacente de la mission |
| `OrchestratorRuntimeService` | `getReport` | source sous-jacente du rapport |
| `OrchestratorRuntimeService` | `getObservabilityEvents` | source sous-jacente de l'observabilité |

`listMissions` reste utilisable par le Frontend pour résoudre `projectId` comme dans W01.3. Le
nouvel endpoint ne doit pas dupliquer cette liste.

### 6.2 Services explicitement non équivalents

- `HumanApprovalWorkflow` ne produit pas une décision métier Work ;
- `RuntimeMissionCertificate` ne produit pas une décision en attente ;
- `RuntimeGateway` et `POST /api/runtime/execute` sont des chemins d'exécution, pas des lectures ;
- le SSE de monitoring n'est pas une dépendance du snapshot Overview ;
- `MissionProgressModel` ne fournit ni phase métier, ni confiance, ni planning, ni personnes.

## 7. Classification des données

Statuts utilisés :

- `DIRECT` : présent dans un contrat Core/Runtime lisible ;
- `COMPOSITION` : calcul mécanique sans règle métier nouvelle ;
- `PROJECTION` : donnée existante dans un agrégat autoritatif, à réduire pour la vue ;
- `ABSENT` : aucun producteur Runtime autoritatif trouvé.

| Champ cible | Statut actuel | Source ou preuve | Traitement futur permis |
|---|---|---|---|
| `projectId` | DIRECT | `RuntimeMission.projectId` | copie |
| `workId` | DIRECT | `RuntimeMission.missionId` | copie ; identité W01.3 conservée |
| `title` | DIRECT | `RuntimeMission.objective` | copie comme titre tant que cette correspondance demeure le contrat validé |
| `confidence` | ABSENT | aucun champ serveur | lecture d'un producteur Work Intelligence obligatoire |
| `phase.current`, `phase.total` | ABSENT | aucune phase métier | lecture d'un producteur Work/Plan obligatoire |
| `dueAt` | ABSENT | aucune échéance métier | lecture d'un producteur Work Schedule obligatoire |
| `insight.*` | ABSENT | aucun résumé/recommandation | lecture d'un producteur Work Intelligence obligatoire |
| `nextAction.*` | ABSENT | aucun NBA | lecture d'un producteur Work Intelligence obligatoire |
| `deferredActionCount` | PROJECTION | nombre de `laterActions + backgroundActions` | comptage seulement après disponibilité des collections |
| `pendingDecision` | ABSENT | aucune décision métier exposée | projection d'une décision principale désignée par sa source |
| `progress.percentage` | COMPOSITION | dernier événement d'observabilité par séquence | copie de `progression`, sans extrapolation |
| `progress.owner` | ABSENT | agent technique non équivalent | lecture d'une affectation fonctionnelle |
| `progress.updatedAt` | COMPOSITION | maximum entre `mission.updatedAt` et timestamp d'observabilité | sélection temporelle déterministe |
| `deliverables[].title` | DIRECT | `RuntimeMission.deliverables` / rapport | copie partielle |
| `deliverables[].id` | ABSENT | chaînes sans identifiant | projection depuis l'agrégat Deliverable |
| `deliverables[].confidence` | ABSENT | aucune confiance | projection depuis l'agrégat Deliverable |
| `people[]` | ABSENT | aucun répertoire/affectation exposé | projection depuis l'agrégat People |
| `novaUpdate` | ABSENT | messages techniques non qualifiés | lecture d'une synthèse Work Intelligence |

## 8. Read Model minimal canonique

Le futur Read Model doit être un snapshot de vue, pas un agrégat métier modifiable.

La forme canonique cible est :

```typescript
interface WorkOverviewReadModel {
  projectId: string;
  workId: string;
  title: string;
  confidence: number;
  phase: {
    current: number;
    total: number;
  };
  dueAt: string | null;
  insight: {
    summary: string;
    recommendation: string;
  } | null;
  nextAction: {
    title: string;
    durationLabel: string;
    impactLabel: string;
    confidenceFrom: number;
    confidenceTo: number;
    why: string;
  } | null;
  deferredActionCount: number;
  pendingDecision: {
    decisionId: string;
    dueAt: string | null;
    confidence: number;
    title: string;
    consequence: string;
  } | null;
  progress: {
    percentage: number;
    owner: {
      id: string;
      label: string;
    } | null;
    updatedAt: string;
  };
  deliverables: readonly {
    id: string;
    title: string;
    confidence: number;
  }[];
  people: readonly {
    id: string;
    name: string;
    availability: string;
    kind: "HUMAN" | "NOVA";
    status: "AVAILABLE" | "BUSY" | "AWAY";
  }[];
  novaUpdate: {
    message: string;
    updatedAt: string;
  } | null;
}
```

Cette forme est documentaire. Aucun type TypeScript n'est créé par SW-012.

### 8.1 Contraintes de valeurs

- tous les identifiants sont non vides ;
- les pourcentages sont des entiers de `0` à `100` inclus ;
- `phase.current >= 1`, `phase.total >= 1` et `phase.current <= phase.total` ;
- `dueAt` est `null` ou une date/heure ISO 8601 ;
- `updatedAt` est une date/heure ISO 8601 ;
- `confidenceTo` et `confidenceFrom` sont des mesures fournies par le producteur, jamais
  recalculées par le projecteur ;
- les listes sont toujours présentes, éventuellement vides ;
- `nextAction`, `pendingDecision`, `owner`, `insight` et `novaUpdate` sont explicitement nullables ;
- l'ordre des personnes et livrables est celui fourni par leur source ; aucun tri métier n'est
  inventé par le projecteur.

### 8.2 Réductions volontaires

Le Read Model n'inclut pas :

- les sources complètes ;
- l'historique Activity ;
- les options et preuves complètes d'une décision ;
- le détail complet des personnes ;
- le détail complet des livrables ;
- les sept scores du drawer Full Analysis ;
- les actions différées elles-mêmes, puisque le PNG n'affiche que leur nombre ;
- une commande Pause, Open, More ou Decision.

## 9. Mapping minimal

| Cible | Mapping canonique |
|---|---|
| `projectId` | `RuntimeMission.projectId` |
| `workId` | `RuntimeMission.missionId` |
| `title` | `RuntimeMission.objective` |
| `confidence` | copie du score Work autoritatif |
| `phase` | copie de `WorkItem.phaseNum/phaseTotal` ; jamais depuis `RuntimeObservabilityEvent.phase` |
| `dueAt` | copie de l'échéance Work autoritative |
| `insight` | copie de `heroSentence/heroGain` |
| `nextAction` | réduction des champs Next Best Action du Work |
| `deferredActionCount` | `laterActions.length + backgroundActions.length` |
| `pendingDecision` | réduction de la décision principale déjà désignée par la source Work Decision |
| `progress.percentage` | dernier `RuntimeObservabilityEvent.progression` par `sequence`, ou score Work autoritatif si la source le désigne explicitement |
| `progress.owner` | affectation fonctionnelle Work ; jamais conversion implicite de `assignedAgentId` |
| `progress.updatedAt` | timestamp le plus récent entre mission et observabilité |
| `deliverables` | réduction des résumés Deliverable autoritatifs |
| `people` | réduction des résumés Person autoritatifs |
| `novaUpdate` | synthèse explicitement qualifiée Work/NOVA ; jamais dernier log technique par défaut |

Si deux sources prétendent produire le même champ, le projecteur doit échouer comme source
ambiguë. Il ne choisit pas silencieusement.

## 10. Contrat de lecture minimal

Le contrat HTTP cible comporte une unique réponse de succès :

```json
{
  "overview": {
    "...": "WorkOverviewReadModel"
  }
}
```

Réponses minimales :

| Statut | Code | Condition |
|---:|---|---|
| `200` | `OK` | projection complète et valide |
| `404` | `MISSION_NOT_FOUND` | couple `projectId/missionId` inconnu |
| `409` | `WORK_OVERVIEW_NOT_READY` | mission existante mais un producteur ou champ obligatoire de projection manque |
| `500` | `WORK_OVERVIEW_PROJECTION_INVALID` | source contradictoire ou projection violant le contrat |

Une réponse `200` ne doit jamais contenir de fixture de secours ni une valeur inventée.

Le `409` doit identifier les groupes manquants parmi :

```text
WORK_IDENTITY
WORK_CONFIDENCE
WORK_PHASE
WORK_SCHEDULE
WORK_INSIGHT
WORK_NEXT_ACTION
WORK_DECISION
WORK_PROGRESS
WORK_DELIVERABLES
WORK_PEOPLE
WORK_NOVA_UPDATE
```

## 11. Endpoint read-only minimal

Endpoint canonique du futur lot :

```text
GET /api/v1/missions/:projectId/:missionId/overview
```

Propriétés obligatoires :

- méthode `GET` uniquement ;
- aucun body ;
- aucune mutation directe ou indirecte ;
- aucun abonnement ;
- aucun SSE ;
- réponse instantanée de snapshot ;
- réutilisation de l'identité mission Core v1 ;
- aucun endpoint BFF supplémentaire ;
- aucun effet sur `GET .../monitor`, `GET .../events` ou le détail mission existant.

Un seul endpoint est suffisant. Le détail mission, le monitoring et les événements ne doivent pas
être appelés séparément par le Frontend après obtention de ce snapshot pour construire Overview.

## 12. Responsabilité du projecteur

Le futur projecteur possède uniquement les responsabilités suivantes :

1. lire la mission et les données techniques existantes ;
2. lire les résumés métier autoritatifs requis ;
3. vérifier l'identité commune `projectId/missionId/workId` ;
4. appliquer les mappings mécaniques du § 9 ;
5. valider les invariants du § 8.1 ;
6. retourner un snapshot immuable ;
7. refuser toute projection incomplète ou ambiguë.

Il ne doit pas :

- calculer la confiance ;
- choisir une Next Best Action ;
- prioriser les décisions ;
- déduire une disponibilité humaine ;
- interpréter un log libre comme insight ;
- produire ou modifier une mission ;
- écrire dans un agrégat métier.

## 13. Dépendances

### 13.1 Dépendances obligatoires

- identité mission valide dans `OrchestratorRuntimeService` ;
- lecture via `NovaCoreService` ;
- producteur autoritatif de la synthèse Work/Intelligence ;
- producteur autoritatif de la phase et de l'échéance Work ;
- producteur autoritatif de la décision principale en attente ;
- producteur autoritatif des résumés Deliverable ;
- producteur autoritatif des résumés People.

Les cinq derniers producteurs ne sont pas présents dans le Runtime exposé audité. Leur
disponibilité est un gate d'entrée, pas une responsabilité de calcul du projecteur.

### 13.2 Absence de dépendance

Le lot ne dépend pas :

- d'un composant React ;
- d'une fixture ;
- du BFF ;
- du SSE ;
- de la route Home ;
- des implémentations des autres onglets Work ;
- du Decision Flow transactionnel ;
- d'un serveur local de smoke test pour définir son contrat.

## 14. Indépendance par rapport aux autres écrans Work

Le lot est **indépendant au niveau Interface et Frontend** :

- il ne modifie aucune route d'un autre onglet ;
- il n'expose que des résumés nécessaires à Overview ;
- il ne remplace pas les futurs Read Models Plan, People, Sources, Decisions ou Deliverables ;
- il ne fournit aucun détail permettant d'implémenter ces écrans par effet de bord.

Le lot n'est pas indépendant de leurs **agrégats métier** lorsque Overview affiche un résumé de
décision, de personne ou de livrable. Cette dépendance est en lecture seule et limitée aux champs
du § 8.

## 15. Gates du futur lot d'implémentation

### 15.1 Gate d'entrée

Le lot peut commencer sans nouvel audit d'architecture si les preuves suivantes sont disponibles :

- la présente spécification est acceptée comme contrat cible ;
- chaque champ `ABSENT` du § 7 possède un producteur métier autoritatif identifié ;
- le producteur de décision désigne explicitement la décision principale à afficher ;
- les identités Work, Mission, Decision, Deliverable et Person sont stables ;
- aucun producteur ne nécessite une mutation déclenchée par le GET ;
- le chemin Core v1 reste `projectId + missionId`.

Si un producteur manque, le lot reste borné mais son implémentation est bloquée par
`WORK_OVERVIEW_NOT_READY` ; aucune valeur de substitution n'est autorisée.

### 15.2 Gate de sortie

- endpoint GET conforme au § 11 ;
- contrat conforme au § 8 ;
- mapping champ par champ prouvé ;
- aucune mutation observée ;
- aucune fixture dans le chemin Runtime ;
- tests de succès, mission absente, projection incomplète, source ambiguë et valeurs invalides ;
- aucun fichier BFF, Frontend ou autre écran Work modifié ;
- endpoints Core existants non régressés.

## 16. Hors périmètre

Sont explicitement hors périmètre :

- mutation ;
- création ;
- suppression ;
- édition ;
- SSE ;
- monitoring avancé ;
- autres écrans Work ;
- Decision Flow ;
- Home ;
- Clarify ;
- Canvas ;
- Plan ;
- Confirm ;
- Full Analysis Drawer ;
- popover de confiance ;
- exécution de la Next Best Action ;
- Pause et More ;
- création ou arbitrage des règles de confiance, recommandation ou priorisation ;
- modification d'un schéma métier existant.

## 17. Limites

- La spécification décrit un snapshot principal Overview, pas tous ses overlays ou états.
- Le PNG prouve les informations visibles, pas leur algorithme de production.
- Les fixtures prouvent une forme et des exemples, pas une source métier Runtime.
- Les valeurs métier absentes ne peuvent pas être obtenues par composition des endpoints Core v1.
- Le projecteur ne rend pas les autres onglets Work opérationnels.
- Le futur raccordement Frontend W01.1 constitue un lot séparé après certification du endpoint.

## 18. Décision

Le Read Model du § 8, le contrat du § 10 et l'endpoint du § 11 constituent le périmètre minimal du
futur lot Runtime Work Overview.

Ils sont suffisants pour alimenter W01.1 sans étendre le lot aux autres écrans, à condition que les
producteurs métier listés au § 13.1 soient disponibles. Aucun nouvel audit d'architecture n'est
requis ; une absence de producteur est un blocage de donnée explicite, pas une ambiguïté
d'architecture.

