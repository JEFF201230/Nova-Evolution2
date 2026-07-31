# ACTIONS DOMAIN BLUEPRINT

## 1. Définition métier

Le domaine **Actions** définit les unités intentionnelles de travail par lesquelles un Work cherche à produire un changement ou un résultat métier observable.

Une Action répond aux questions suivantes :

- que doit-il être fait ;
- dans quel but métier ;
- dans quel état se trouve cette intention ;
- quelles activités ont réellement eu lieu ;
- quel résultat autoritatif en découle ;
- de quelles autres Actions dépend-elle.

Actions distingue strictement l'intention, l'instruction, l'exécution observée et le résultat. Une commande technique, une transition Runtime, une trace d'audit ou une action de recovery ne devient pas une Action métier par similitude de nom.

## 2. Frontières

### Appartient à Actions

- l'identité métier d'une Action ;
- son but explicite dans le contexte du Work ;
- son statut métier courant ;
- sa décomposition éventuelle en Tasks ;
- ses dépendances avec d'autres Actions ;
- les Commands métier qui demandent un changement ;
- les Activities qui attestent ce qui a été réalisé ;
- les Executions métier rattachées à l'Action ;
- le Result autoritatif de l'Action ;
- la provenance et l'histoire de ces éléments.

### N'appartient pas à Actions

- l'objectif global du Work ;
- les Phases, Milestones, échéances et priorités Planning ;
- les identités et Affectations People ;
- les décisions d'autorisation ou d'approbation ;
- l'exécution technique de Mission ;
- les commandes, transitions, logs et traces Runtime ;
- la création ou la certification des Deliverables ;
- les recommandations Intelligence ;
- la mesure Confidence ;
- la Synthesis du Work.

Une Action ne peut pas être déduite :

- d'un événement technique ;
- d'une commande d'orchestration ;
- d'une entrée d'audit ;
- d'une transition de statut Mission ;
- d'une fixture ;
- d'un bouton ou d'un CTA d'interface.

## 3. Responsabilités

Actions est responsable de :

1. identifier chaque Action dans le contexte d'un Work ;
2. exprimer son but métier sans remplacer l'Objective du Work ;
3. maintenir exactement un statut métier courant ;
4. contrôler les transitions de statut autorisées ;
5. rattacher explicitement les Tasks qui composent l'Action ;
6. distinguer Command, Activity, Execution et Result ;
7. maintenir les dépendances entre Actions ;
8. conserver la provenance de toute évolution ;
9. préserver l'histoire des activités et résultats ;
10. signaler l'absence d'information sans la simuler.

Actions ne décide pas :

- de l'ordre temporel global du Work ;
- de la personne autorisée à agir ;
- de l'approbation d'un résultat ;
- de la confiance accordée au résultat ;
- de la recommandation à suivre.

## 4. Agrégats

### Agrégat Action

La racine d'agrégat est l'**Action**.

Elle garantit la cohérence entre :

- son identité ;
- le Work auquel elle appartient ;
- son but ;
- son statut courant ;
- ses Tasks éventuelles ;
- ses Commands métier ;
- ses Activities observées ;
- ses Executions métier ;
- son Result éventuel ;
- ses dépendances ;
- sa provenance ;
- son historique.

Un Work peut posséder zéro, une ou plusieurs Actions. Chaque Action appartient à exactement un Work.

### Composition conceptuelle

- une **Task** est une unité de travail subordonnée à l'Action ;
- une **Command** exprime une demande métier d'agir ou de changer l'état de l'Action ;
- une **Activity** atteste un fait de travail observé ;
- une **Execution** regroupe la réalisation effective d'une Action ou d'une Task dans un contexte métier ;
- un **Result** exprime l'issue autoritative d'une Action.

Une Task n'est pas une seconde racine concurrente lorsqu'elle ne possède pas de cycle de vie autonome hors de son Action.

## 5. Concepts

### Action

Intention métier identifiée visant un changement ou un résultat utile au Work.

### Task

Décomposition bornée d'une Action. Une Task précise une part du travail sans redéfinir le but de l'Action.

### Command

Instruction métier explicite demandant l'initiation, la poursuite, la suspension, la reprise ou l'arrêt d'une Action. Une Command n'est ni la preuve de son acceptation, ni la preuve de son exécution.

### Activity

Fait métier observé pendant la réalisation d'une Action. Une Activity est historique ; elle ne remplace pas le statut courant.

### Execution

Occurrence effective au cours de laquelle une Action ou une Task est réalisée. Elle reste distincte d'une exécution Runtime ou Mission.

### Statut

État métier courant de l'Action :

| Statut | Sens |
|---|---|
| `PROPOSED` | L'Action est formulée mais pas encore admise à être réalisée. |
| `READY` | L'Action est admise et peut commencer. |
| `IN_PROGRESS` | La réalisation métier de l'Action est en cours. |
| `BLOCKED` | Une condition explicite empêche temporairement la poursuite. |
| `COMPLETED` | Le résultat attendu de l'Action est constaté. |
| `FAILED` | La réalisation n'a pas produit une issue acceptable. |
| `CANCELLED` | L'Action est arrêtée définitivement sans achèvement. |

Transitions autorisées :

- `PROPOSED` vers `READY` ou `CANCELLED` ;
- `READY` vers `IN_PROGRESS` ou `CANCELLED` ;
- `IN_PROGRESS` vers `BLOCKED`, `COMPLETED`, `FAILED` ou `CANCELLED` ;
- `BLOCKED` vers `READY`, `IN_PROGRESS`, `FAILED` ou `CANCELLED` ;
- `FAILED` vers `READY` ou `CANCELLED` ;
- `COMPLETED` et `CANCELLED` sont terminaux.

### Result

Issue métier autoritative de l'Action. Le Result peut référencer un Deliverable, une Decision ou un autre fait autoritatif, sans en devenir propriétaire.

### Dependency

Relation orientée selon laquelle une Action nécessite explicitement la satisfaction d'une condition portée par une autre Action.

## 6. Relations

| Domaine | Relation | Qualification | Frontière |
|---|---|---|---|
| Work | Chaque Action appartient à exactement un Work. | Obligatoire | Work conserve l'association ; Actions possède l'Action. |
| Objective | Le but d'une Action contribue à l'Objective. | Obligatoire en cohérence | Une Action ne reformule jamais l'Objective autoritatif. |
| Lifecycle | L'état Work borne le contexte possible des Actions. | Optionnelle en lecture | Le statut Action n'est pas un statut Work. |
| Planning | Le plan peut prévoir ou ordonner des Actions. | Future et optionnelle | Planning possède les dates, Phases, Milestones et priorités planifiées. |
| People | Une personne peut être responsable ou contributrice d'une Action. | Future et optionnelle | People possède Business Identity, rôles et Affectations. |
| Decisions | Une décision peut autoriser, bloquer ou annuler une Action. | Optionnelle | Decisions possède l'acte ; Actions accepte seulement son effet autoritatif. |
| Deliverables | Un Result peut référencer un livrable produit. | Optionnelle | Deliverables possède le livrable et son evidence. |
| Intelligence | Une Recommendation peut proposer une Action. | Future et optionnelle | Une Recommendation n'est pas une Action tant qu'elle n'est pas explicitement admise. |
| Confidence | Une mesure peut qualifier un Result ou une proposition d'Action. | Future et optionnelle | Actions ne calcule pas Confidence. |
| Synthesis | Une Synthesis peut présenter Actions, Activities et Results. | Future et optionnelle en lecture | Synthesis ne modifie aucun statut Action. |
| Technical Agent | Une exécution technique peut contribuer à une Activity autoritative. | Optionnelle, après qualification | L'agent technique ne devient ni acteur People ni propriétaire de l'Action. |
| Runtime | Les faits techniques peuvent être qualifiés par un producteur métier. | Interdite comme équivalence implicite | Aucune commande ou transition Runtime n'est automatiquement une Action, Activity ou Result. |

## 7. Invariants

1. Toute Action possède une identité non ambiguë dans un Work.
2. Toute Action appartient à exactement un Work.
3. Une Action poursuit un but métier explicite compatible avec l'Objective du Work.
4. Une Action possède exactement un statut courant.
5. Toute transition respecte le graphe de statuts défini.
6. `COMPLETED` et `CANCELLED` sont terminaux.
7. Une Action `COMPLETED` possède un Result autoritatif ou une constatation explicite de l'issue attendue.
8. Une Command n'est ni une Activity, ni une Execution, ni un Result.
9. L'émission d'une Command ne prouve pas son exécution.
10. Une Activity atteste un fait passé et ne réécrit pas l'histoire.
11. Une Execution métier n'est pas une exécution Runtime par déduction.
12. Une Task ne peut pas poursuivre un but contradictoire avec son Action.
13. La complétion de Tasks ne complète pas automatiquement l'Action sans règle métier explicite.
14. Toute Dependency est explicite, orientée et sourcée.
15. Le graphe de dépendances entre Actions ne contient aucun cycle.
16. Une Recommendation Intelligence n'est pas une Action.
17. Une Decision n'est pas une Action.
18. Un CTA, une fixture, un événement technique ou une entrée d'audit n'est pas une Action.
19. Toute évolution d'une Action possède une provenance explicite.
20. L'absence de Result n'autorise aucun résultat par défaut.
21. Les associations à People, Planning, Deliverables et Decisions préservent leurs sources de vérité.

## 8. Événements métier

| Événement | Signification |
|---|---|
| `ActionProposed` | Une intention métier est formulée dans le contexte d'un Work. |
| `ActionAccepted` | L'Action devient admise à être réalisée. |
| `ActionStarted` | La réalisation métier commence. |
| `ActionBlocked` | Une condition explicite empêche la poursuite. |
| `ActionResumed` | Une Action bloquée reprend. |
| `ActionCompleted` | Le résultat attendu est constaté. |
| `ActionFailed` | L'exécution ne produit pas une issue acceptable. |
| `ActionCancelled` | L'Action est arrêtée définitivement sans achèvement. |
| `TaskAdded` | Une Task est ajoutée à la décomposition de l'Action. |
| `TaskRemoved` | Une Task cesse d'appartenir à l'Action courante. |
| `CommandIssued` | Une instruction métier relative à l'Action est émise. |
| `ActivityObserved` | Un fait de travail est constaté et rattaché à l'Action. |
| `ExecutionStarted` | Une occurrence d'exécution métier commence. |
| `ExecutionEnded` | Une occurrence d'exécution métier se termine avec une issue explicitée. |
| `ResultRecorded` | Le Result autoritatif de l'Action est établi. |
| `ActionDependencyDeclared` | Une dépendance explicite est ajoutée. |
| `ActionDependencyRemoved` | Une dépendance cesse de s'appliquer. |

## 9. Glossaire

| Terme | Définition officielle |
|---|---|
| Action | Intention métier identifiée visant un changement ou un résultat pour un Work. |
| Task | Unité subordonnée qui décompose une Action. |
| Command | Instruction métier demandant un changement, sans prouver son exécution. |
| Activity | Fait métier historique observé pendant la réalisation d'une Action. |
| Execution | Occurrence effective de réalisation métier. |
| Status | État métier courant de l'Action. |
| Result | Issue autoritative produite ou constatée par l'Action. |
| Dependency | Relation explicite de prérequis entre Actions. |
| Blocker | Condition explicitement identifiée empêchant temporairement la poursuite. |
| Provenance | Origine relisible d'une Action, d'un changement, d'une Activity ou d'un Result. |

## 10. Décisions d'architecture

### WP003-ADR-001 — Action est la racine métier

Chaque Action possède son propre cycle de vie et garantit la cohérence de ses Tasks, Commands, Activities, Executions et Results.

### WP003-ADR-002 — Intention, instruction, exécution et résultat sont distincts

Cette séparation empêche qu'une demande soit interprétée comme une réalisation ou qu'une trace technique soit interprétée comme un résultat métier.

### WP003-ADR-003 — Le statut Action possède son propre vocabulaire

Les statuts Actions ne sont ni des états Work, ni des états Mission, ni des états Planning.

### WP003-ADR-004 — Planning possède le temps planifié

Dates, Phases, Milestones et priorités planifiées restent dans Planning. Actions conserve uniquement son cycle métier.

### WP003-ADR-005 — People possède l'affectation humaine

Actions peut référencer un responsable ou un contributeur, mais ne crée ni identité ni rôle.

### WP003-ADR-006 — Decisions possède l'autorisation

Une décision peut produire un effet sur une Action ; elle ne devient pas une Command ou un Result Actions.

### WP003-ADR-007 — Les mécaniques Runtime ne sont pas réutilisées comme source métier

Recovery, audit, migration, orchestration et transitions techniques restent dans leurs domaines tant qu'aucun producteur Actions autoritatif ne les qualifie.

### WP003-ADR-008 — Aucune seconde source de résultat

Lorsqu'un Result référence un Deliverable ou une Decision, l'objet externe reste autoritatif. Actions conserve seulement l'association et le sens de l'issue.

## 11. Évolutions futures

Les évolutions futures pourront préciser :

- les catégories d'Actions et de Tasks ;
- les règles de commande et d'acceptation ;
- les catégories de Results ;
- les relations détaillées avec Planning ;
- les responsabilités People sur une Action ;
- les conditions métier de blocage et de reprise ;
- les règles de tentative ou de répétition ;
- les critères d'achèvement.

Elles devront :

- établir un producteur Actions autoritatif ;
- préserver le graphe de statuts ;
- conserver la séparation entre Action, Command, Activity, Execution et Result ;
- ne jamais dériver une Action d'une trace Runtime ou d'une interface ;
- conserver la provenance ;
- rester compatibles avec un Work sans Action ;
- ne créer aucune seconde source de vérité.

**Décision WP-003 : GO — blueprint métier Actions défini, sans autorisation d'implémentation.**
