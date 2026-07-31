# NOVA WORK OVERVIEW — RUNTIME GAP REPORT

## 1. Verdict

**GAP CONFIRMÉ — LOT RUNTIME READ-MODEL DÉDIÉ REQUIS**

La cible architecturale est désormais définie par
`NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md`.

Le futur lot est borné à :

- un projecteur read-only ;
- un contrat `WorkOverviewReadModel` ;
- un endpoint `GET /api/v1/missions/:projectId/:missionId/overview` ;
- la réutilisation des lectures mission, rapport et observabilité ;
- la consommation de résumés métier autoritatifs.

Il ne peut pas commencer son implémentation complète tant que les producteurs des données métier
absentes ne sont pas identifiés et disponibles.

## 2. Sources auditées

- PNG canonique `work-overview.png` ;
- `NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md` ;
- `NOVA_FRONT_RUNTIME_INTEGRATION_PLAN.md` ;
- `NOVA_SW011_W01_1_WORK_OVERVIEW_REPORT.md` ;
- `NOVA_SW011A_WORK_OVERVIEW_BLOCKER_ANALYSIS.md` ;
- sources UX documentant `WorkItem`, `DecisionData`, `DeliverableData` et `PersonData` ;
- `WorkOverviewPage.tsx` ;
- `workOverviewFixture.ts` ;
- contrats et services Orchestrator Runtime ;
- service et routes NOVA Core v1 ;
- contrats et routes BFF.

## 3. État actuel par couche

| Couche | État |
|---|---|
| PNG / UX | complet pour l'état de référence Overview |
| composant Frontend | présent, alimenté par fixture |
| forme locale Frontend | `WorkOverviewFixture` présente |
| agrégat UX documentaire | `WorkItem` documenté |
| agrégat Runtime Work | absent |
| projection Runtime Overview | absente |
| contrat read-only serveur | absent |
| service de projection | absent |
| endpoint Core Overview | absent |
| endpoint BFF Overview | absent et non requis par la cible minimale |
| données mission techniques | disponibles |
| données métier Overview | partielles ou absentes |

## 4. Données déjà disponibles

| Donnée | Source existante | Réutilisable sans évolution du cycle de vie Runtime |
|---|---|---|
| `projectId` | `RuntimeMission.projectId` | oui |
| `missionId/workId` | `RuntimeMission.missionId` | oui |
| objectif utilisé comme titre | `RuntimeMission.objective` | oui |
| état technique | `RuntimeMission.state`, `canonicalState` HTTP | oui, non affiché directement par le contrat minimal |
| agent technique assigné | `RuntimeMission.assignedAgentId` | oui, mais non équivalent au propriétaire fonctionnel |
| mise à jour mission | `RuntimeMission.updatedAt` | oui |
| noms de livrables | `RuntimeMission.deliverables`, `MissionReport.deliverables` | oui, partiellement |
| rapport courant | `MissionReport` | oui |
| événements | `RuntimeEvent[]` | oui |
| progression technique | `RuntimeObservabilityEvent.progression` | oui |
| timestamp d'observabilité | `RuntimeObservabilityEvent.timestamp` | oui |
| phase technique | `RuntimeObservabilityEvent.phase` | oui, mais non équivalente à la phase Work |

## 5. Données nécessitant une projection

| Donnée cible | Nature du gap | Producteur attendu |
|---|---|---|
| titre Work si distinct de l'objectif | mapping à confirmer | Work/Mission |
| confiance Work | donnée absente | Work Intelligence |
| phase courante et total | donnée absente | Work/Plan |
| échéance Work | donnée absente | Work Schedule |
| résumé de situation | donnée absente | Work Intelligence |
| recommandation | donnée absente | Work Intelligence |
| Next Best Action complète | donnée absente | Work Intelligence/Action |
| nombre Later & Background | agrégation mécanique après disponibilité des collections | Work Action |
| décision principale en attente | donnée et sélection absentes | Work Decision |
| propriétaire fonctionnel | donnée absente | Work Assignment/People |
| identifiants et confiance des livrables | enrichissement absent | Work Deliverable |
| personnes et disponibilité | donnée absente | Work People |
| mise à jour NOVA qualifiée | donnée absente | Work Intelligence |

Le mot « producteur » désigne ici une responsabilité métier. Il ne déclare pas une nouvelle classe
ou un service existant.

## 6. Matrice complète de couverture

| Zone PNG | Champ du Read Model | DIRECT | COMPOSITION | PROJECTION | ABSENT actuellement |
|---|---|:---:|:---:|:---:|:---:|
| header | `projectId`, `workId`, `title` | ✓ |  |  |  |
| header | `confidence` |  |  | ✓ | ✓ |
| header | `phase.current/total` |  |  | ✓ | ✓ |
| header | `dueAt` |  |  | ✓ | ✓ |
| insight | `summary`, `recommendation` |  |  | ✓ | ✓ |
| NBA | titre, durée, impact, confiance, why |  |  | ✓ | ✓ |
| Later | `deferredActionCount` |  | ✓ | ✓ | collections absentes |
| décision | résumé décision principale |  |  | ✓ | ✓ |
| progress | `percentage` |  | ✓ |  |  |
| progress | `owner` |  |  | ✓ | ✓ |
| progress | `updatedAt` |  | ✓ |  |  |
| livrables | titres | ✓ |  |  |  |
| livrables | identifiants, confiance |  |  | ✓ | ✓ |
| people | résumés personnes |  |  | ✓ | ✓ |
| NOVA | mise à jour qualifiée |  |  | ✓ | ✓ |

## 7. Services réutilisés

Le futur lot réutilise sans modification fonctionnelle :

- `NovaCoreService.getMission` ;
- `NovaCoreService.getReport` ;
- `NovaCoreService.getObservabilityEvents` ;
- `NovaCoreService.getEvents` uniquement pour la traçabilité ;
- `OrchestratorRuntimeService.getMission` ;
- `OrchestratorRuntimeService.getReport` ;
- `OrchestratorRuntimeService.getObservabilityEvents`.

Ne sont pas retenus comme sources métier Overview :

- `HumanApprovalWorkflow` ;
- `RuntimeMissionCertificate` ;
- `RuntimeGateway` ;
- `POST /api/runtime/execute` ;
- les payloads libres d'événements ;
- le SSE.

## 8. Gap technique exact

Quatre artefacts manquent :

1. les producteurs autoritatifs pour les champs métier absents ;
2. le projecteur Work Overview ;
3. le contrat de réponse Work Overview ;
4. le endpoint GET Work Overview.

Le gap n'est pas résolu par l'ajout du seul endpoint. Sans producteurs autoritatifs, cet endpoint
ne pourrait retourner qu'une vue partielle ou inventée.

## 9. Endpoint futur

```text
GET /api/v1/missions/:projectId/:missionId/overview
```

Ce endpoint :

- retourne un snapshot ;
- ne reçoit aucun body ;
- ne déclenche aucune mutation ;
- ne dépend pas du SSE ;
- ne remplace aucun endpoint existant ;
- ne nécessite pas un nouveau endpoint BFF ;
- retourne `409 WORK_OVERVIEW_NOT_READY` plutôt qu'une donnée de substitution si une source manque.

## 10. Absence de mutation

La projection cible est compatible avec une exécution entièrement read-only :

```text
getMission
+ getReport
+ getObservabilityEvents
+ lectures des résumés métier
↓
validation
↓
snapshot immuable
```

Aucune opération create, update, delete, assign, execute, evidence, certify, recovery ou approve
n'est nécessaire.

La maintenance ou la production des agrégats métier sources n'appartient pas à ce endpoint et ne
doit jamais être déclenchée par son GET.

## 11. Dépendances et indépendance

### Indépendance confirmée

- aucune dépendance au code des autres écrans Work ;
- aucune modification de Home ou Work Setup ;
- aucune dépendance au Decision Flow transactionnel ;
- aucune dépendance au BFF ;
- aucune dépendance au SSE ;
- aucune extension du monitoring ;
- aucune mutation.

### Dépendances de données conservées

Overview affiche des résumés issus des domaines Work, Decision, Deliverable et People. Le futur lot
ne peut donc pas être indépendant de leurs données autoritatives.

Cette dépendance n'autorise pas l'implémentation de leurs écrans, de leurs mutations ou de leurs
contrats détaillés. Seuls les champs réduits du `WorkOverviewReadModel` sont consommés.

## 12. Limites du futur lot

Hors périmètre :

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
- drawers, overlays et popovers ;
- comportements Pause, More, Open et Full analysis ;
- définition des algorithmes de confiance, recommandation, NBA ou priorité décisionnelle ;
- modification des contrats métier sources.

## 13. Risques bornés

| Risque | Gate |
|---|---|
| utilisation d'une fixture comme secours | interdiction de toute réponse `200` avec données de fixture |
| conversion phase technique → phase Work | mapping interdit |
| conversion agent Runtime → propriétaire humain | mapping interdit |
| dernier log utilisé comme recommandation | mapping interdit |
| première décision arbitrairement sélectionnée | la source doit désigner la décision principale |
| collision `workId` entre projets | endpoint lié au couple `projectId/missionId` |
| données partielles servies comme complètes | `409 WORK_OVERVIEW_NOT_READY` |
| extension aux autres onglets | contrat limité aux champs du snapshot Overview |

## 14. Critères d'ouverture du futur lot

Le lot peut être ouvert sans nouvel audit d'architecture lorsque :

- `NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md` est accepté ;
- les producteurs des champs marqués absents sont nommés et accessibles en lecture ;
- leurs identifiants sont compatibles avec `projectId/missionId` ;
- la décision principale est désignée par son producteur ;
- aucune lecture ne déclenche une mutation ;
- les données sont suffisamment complètes pour satisfaire les invariants du contrat.

La vérification de ces points est une readiness check du lot, pas un nouvel arbitrage
d'architecture.

## 15. Critères de sortie du futur lot

- un endpoint GET unique ;
- un snapshot conforme au Read Model canonique ;
- toutes les données traçables vers une source ;
- aucun calcul métier nouveau ;
- aucun fallback fixture ;
- aucune mutation ;
- BFF, Frontend et autres écrans inchangés ;
- tests du projecteur et de l'API passants ;
- non-régression des lectures Core v1.

## 16. Conclusion

### Données existantes

Identité mission, objectif, état, timestamps, progression technique, rapport et noms textuels des
livrables.

### Données à projeter

Confiance, phase Work, échéance, insight, recommandation, Next Best Action, actions différées,
décision principale, propriétaire fonctionnel, livrables enrichis, personnes et mise à jour NOVA.

### Read Model minimal

Le snapshot `WorkOverviewReadModel` défini dans la spécification canonique.

### Contrat minimal

Une réponse `{ overview: WorkOverviewReadModel }`, avec refus explicite des projections
incomplètes.

### Endpoint minimal

`GET /api/v1/missions/:projectId/:missionId/overview`.

### Services Runtime réutilisés

Les lectures mission, rapport, événements et observabilité de `NovaCoreService` et
`OrchestratorRuntimeService`.

### Suffisance

Le snapshot regroupe exactement les informations nécessaires à l'écran principal, sans détail
d'autres domaines et sans mutation. Aucun second endpoint, BFF, SSE ou monitoring avancé n'est
nécessaire.

### Décision finale

**GO POUR OUVERTURE D'UN LOT RUNTIME READ-MODEL DÉDIÉ, SOUS GATES DE PRODUCTEURS
AUTORITATIFS.**

