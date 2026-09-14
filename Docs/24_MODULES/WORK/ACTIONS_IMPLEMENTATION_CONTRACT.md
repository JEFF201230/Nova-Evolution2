# ACTIONS IMPLEMENTATION CONTRACT

## Statut documentaire

| Attribut | Valeur |
|---|---|
| Mission | P3-ACTIONS-001A-IMPLEMENTATION-CONTRACT |
| DomainId | ACTIONS |
| Parent lot | P3-ACTIONS-001 — Actions Foundation |
| Lot | P3-ACTIONS-001A |
| Nature | Contrat d'implémentation et admission documentaire |
| Autorité métier | `ACTIONS_DOMAIN_BLUEPRINT.md` |
| Baseline Work | `WORK_DOMAIN_BLUEPRINT.md` |
| Prérequis | P3-PLANNING-001G — P3-PLANNING-001 CERTIFIED |
| Implémentation produite | Aucune |
| Décision technique | GO — approbation humaine finale requise |

Ce contrat traduit le blueprint Actions en décisions d'implémentation obligatoires. Il ne modifie aucune doctrine métier et ne crée ni modèle logiciel, ni persistence, ni accès opérationnel Actions.

## 1. IMPLEMENTATION SCOPE

### 1.1 Fondation immédiate

P3-ACTIONS-001 contient uniquement :

- une Action identifiée sans ambiguïté dans exactement un Work canonique ;
- un but explicite contribuant à l'Objective sans le remplacer ;
- exactement un statut Action courant et le graphe du blueprint ;
- des Tasks subordonnées éventuelles ;
- des Commands métier, Activities historiques et Executions métier distinctes ;
- zéro ou un Result autoritatif courant, avec son histoire et ses références éventuelles ;
- des Dependencies explicites, orientées, sourcées et acycliques ;
- provenance, causalité et révision attendue pour chaque mutation ;
- une source durable unique avec idempotence, concurrence et recovery ;
- des Commands et Queries internes, sans transport public ;
- une association Work en lecture, sans store miroir.

### 1.2 Décisions différées et inconnues

Le blueprint ne détermine pas les catégories d'Actions, Tasks et Results, les règles détaillées d'acceptation et d'achèvement, les politiques de tentative, les conditions détaillées de blocage/reprise, les responsabilités People, les associations Planning, l'effet d'une Decision, la qualification d'un fait Runtime, ni l'exposition publique.

La portée inter-Work des Dependencies est également inconnue. La Foundation n'admet donc que des Dependencies entre Actions du même Work tant qu'une décision normative ne qualifie pas une portée plus large. Ce report prudent n'établit pas une interdiction définitive.

### 1.3 Hors périmètre

- Work Identity, Project Identity, Mission Reference, Objective, Lifecycle et Progress ;
- Planning, Plan, Timeline, Phase, Milestone, Schedule, Priority planifiée et Constraint ;
- Business Identity, rôles et Affectations People ;
- autorisation et approbation Decisions ;
- production, contenu, version, evidence et certification Deliverables ;
- Intelligence, Confidence et Synthesis ;
- Mission Runtime, Agent Runtime, queues, schedulers, timers et Monitoring technique ;
- Frontend, NOVA Web, BFF, API publique, IAM et RBAC ;
- fixtures, mocks, caches, projections, logs et audits comme sources métier ;
- toute persistence ou implémentation TypeScript dans P3-ACTIONS-001A.

### 1.4 Fermeture

Tout concept non établi est absent. Une absence n'est jamais comblée par une donnée technique, une convention d'interface ou une propriété d'un autre domaine.

## 2. MODULE BOUNDARY

### 2.1 Responsabilité unique

Le futur module Actions accepte et conserve les intentions Actions, contrôle leur cycle, atteste leur réalisation métier et établit leur Result autoritatif. L'agrégat Action est sa frontière de cohérence. Il ne possède aucun objet externe référencé.

### 2.2 Dépendances autorisées

- la WorkReference canonique et la vérification read-only de l'existence du Work ;
- l'Objective autoritatif uniquement pour vérifier la compatibilité explicite du but ;
- la source canonique Actions unique future ;
- une provenance, une causalité et une révision attendue explicites ;
- des références d'Actions existantes pour les Dependencies ;
- des références Planning, People, Decisions ou Deliverables après certification d'une relation dédiée ;
- des mécanismes techniques de persistence et transaction comme infrastructure seulement.

### 2.3 Dépendances interdites

- Work, Lifecycle ou Progress comme producteur d'une Action, d'un statut, d'une Activity, d'une Execution ou d'un Result ;
- Planning comme producteur Actions ou propriétaire de dates et priorités dans Actions ;
- People comme propriétaire Actions, ou Actions comme propriétaire de Business Identity, rôles et Affectations ;
- Decisions comme Command ou Result Actions, et Actions comme source d'autorisation ;
- Runtime, Mission, agent, queue, scheduler, timer, log, trace ou audit comme équivalent métier implicite ;
- Frontend, NOVA Web, BFF, API, Session, IAM ou RBAC comme autorité métier ;
- fixture, mock, cache, index, projection ou store miroir comme source autoritative ;
- toute écriture directe par Work, Planning, People, Decisions, Runtime, un agent technique ou le frontend.

### 2.4 Limite physique

L'implémentation future réside sous une racine interne dédiée à Actions. Les ports interdomaines restent des ports de référence ou de lecture et ne déplacent ni agrégat, ni règle, ni persistence.

## 3. AUTHORITATIVE OWNERSHIP

### 3.1 Producteur autoritatif

Le producteur métier futur est nommé conceptuellement **Actions Authority**. Le blueprint exige qu'un producteur Actions autoritatif qualifie les faits acceptés et interdit qu'un fait technique devienne implicitement Action, Activity ou Result. Actions Authority est donc l'unique frontière d'acceptation de toute mutation ; ce nom n'impose ni classe, ni framework, ni transport.

Elle valide l'Action complète, WorkReference, transition, Dependency, provenance, causalité et révision attendue avant tout changement, puis produit exactement les événements correspondants. Une mutation refusée ne change rien et n'émet aucun événement.

### 3.2 Ownership

| Élément | Propriétaire unique | Règle |
|---|---|---|
| Action, but et statut | agrégat Action | mutation via Actions Authority seulement |
| Task | Action parente | subordonnée, sans cycle autonome |
| Command enregistrée | Action | demande distincte de l'exécution |
| Activity | Action | fait historique, jamais état courant |
| Execution métier | Action | jamais exécution Runtime par déduction |
| Result Actions | Action | issue unique ; références externes sans transfert |
| Dependency | Action source | cible référencée ; graphe validé par la source Actions |
| WorkReference et Objective | Work | références/lectures seulement |
| temps et priorités planifiés | Planning | absents d'Actions |
| identités, rôles, Affectations | People | références futures seulement |
| autorisation | Decisions | effet futur explicitement accepté seulement |
| Deliverable et evidence | Deliverables | référence optionnelle depuis Result |

### 3.3 Accès

Toute écriture entre par Actions Authority. Toute lecture provient de la source canonique ou d'une projection reconstructible read-only. Aucun consommateur ne répare, complète ou arbitre l'état Actions.

## 4. AGGREGATE MODEL

### 4.1 Racine et identité

La racine est **Action**. Son identité canonique compose la WorkReference existante et un ActionId opaque, stable et unique dans ce Work. Aucun identifiant Work ou Mission parallèle n'est créé.

L'Action garantit atomiquement son but, son statut, ses Tasks, Commands, Activities, Executions, son Result éventuel, ses Dependencies sortantes, sa provenance et son histoire. L'acyclicité exige une lecture cohérente du graphe canonique sans créer un nouvel agrégat métier.

### 4.2 Concepts

| Concept | Nature contractuelle |
|---|---|
| Action | intention métier visant un changement ou résultat utile au Work |
| Task | décomposition bornée et subordonnée |
| Command | instruction métier ; ni acceptation, ni preuve d'exécution |
| Activity | fait métier passé, immuable et observé |
| Execution | occurrence effective de réalisation métier |
| Result | issue autoritative de l'Action |
| Dependency | prérequis explicite, orienté et sourcé porté par une autre Action |

### 4.3 Cycle

```text
PROPOSED    → READY | CANCELLED
READY       → IN_PROGRESS | CANCELLED
IN_PROGRESS → BLOCKED | COMPLETED | FAILED | CANCELLED
BLOCKED     → READY | IN_PROGRESS | FAILED | CANCELLED
FAILED      → READY | CANCELLED
COMPLETED   → aucun statut
CANCELLED   → aucun statut
```

Le statut Action n'est ni Lifecycle Work, ni Progress, ni statut Mission, ni état Planning. `COMPLETED` et `CANCELLED` sont terminaux.

## 5. RESULT, PROVENANCE AND CAUSALITY

### 5.1 Result

Une Action possède zéro ou un Result autoritatif courant. `COMPLETED` exige ce Result ou une constatation explicite de l'issue attendue portée par la complétion. L'absence n'autorise aucune valeur par défaut.

Si un Result référence un Deliverable, une Decision ou un autre fait, Actions conserve seulement la référence, le sens de l'issue et la provenance. L'objet externe reste autoritatif. Aucun store ou événement externe ne devient une seconde source du Result. Toute évolution est un nouveau fait historique, jamais une réécriture.

### 5.2 Provenance et causalité

Chaque création et mutation porte une source métier identifiable, une cause relisible, une date d'effet métier et un CausalityId stable. Même causalité et même contenu retournent le résultat initial sans nouvel événement ; même causalité et contenu différent produisent `ACTION_CAUSALITY_CONFLICT`.

## 6. COMMANDS

| Commande interne | Effet admis |
|---|---|
| ProposeAction | crée une Action `PROPOSED` dans un Work existant |
| AcceptAction | `PROPOSED → READY` |
| StartAction | `READY → IN_PROGRESS` |
| BlockAction | `IN_PROGRESS → BLOCKED` avec condition explicite |
| ResumeAction | `BLOCKED → READY` ou `IN_PROGRESS`, destination explicite |
| CompleteAction | `IN_PROGRESS → COMPLETED` avec Result ou constatation explicite |
| FailAction | `IN_PROGRESS` ou `BLOCKED → FAILED` avec issue explicitée |
| CancelAction | transition autorisée vers `CANCELLED` avec motif |
| RetryAction | `FAILED → READY`, sans tentative technique implicite |
| AddTask / RemoveTask | modifie la décomposition sans complétion automatique |
| IssueActionCommand | enregistre une instruction sans prouver son exécution |
| ObserveActivity | ajoute un fait historique qualifié |
| StartExecution / EndExecution | ouvre ou clôt une Execution métier identifiée |
| RecordResult | établit l'issue sans créer l'objet externe référencé |
| DeclareActionDependency / RemoveActionDependency | modifie le graphe après validation globale |

Ces noms expriment uniquement les intentions déjà établies par le blueprint. Aucune commande d'intégration Planning, People, Decisions ou Runtime n'est admise dans la Foundation.

## 7. DOMAIN EVENTS

Les événements sont exactement : `ActionProposed`, `ActionAccepted`, `ActionStarted`, `ActionBlocked`, `ActionResumed`, `ActionCompleted`, `ActionFailed`, `ActionCancelled`, `TaskAdded`, `TaskRemoved`, `CommandIssued`, `ActivityObserved`, `ExecutionStarted`, `ExecutionEnded`, `ResultRecorded`, `ActionDependencyDeclared`, `ActionDependencyRemoved`.

Ils sont immuables, ordonnés par Action, rattachés à WorkReference, ActionId, causalité, provenance et révision. Une commande atomique produit des événements contigus. `ActionCompleted` ne peut précéder le fait établissant son Result ou sa constatation explicite. Aucun événement Runtime n'est traduit automatiquement.

## 8. QUERIES AND INTERNAL ACCESS

| Query | Résultat |
|---|---|
| GetAction | état courant complet ou absence explicite |
| ListActionsByWork | collection autoritative, vide permise, sans Progress calculé |
| GetActionHistory | faits ordonnés, causalités et provenances |
| GetActionActivities | Activities historiques exactes |
| GetActionExecutions | Executions métier exactes |
| GetActionResult | Result courant ou absence explicite |
| GetActionDependencies | graphe pertinent et références exactes |

Les index sont reconstructibles et non autoritatifs. Les lectures n'ont aucun effet et n'inventent ni prochaine Action, ni Priority, ni Schedule.

## 9. PERSISTENCE POLICY

### 9.1 Décision

**PERSISTENCE CANONIQUE DURABLE UNIQUE REQUISE, MAIS CRÉATION INTERDITE AVANT P3-ACTIONS-001D.**

Elle est imposée par l'état courant, l'histoire non réécrite, le Result autoritatif, le graphe acyclique, la provenance, l'idempotence, la concurrence et le recovery. Les sources n'imposent aucune technologie.

### 9.2 Propriétés

- identité WorkReference + ActionId et état courant ;
- histoire append-only des Activities, Executions, Results et événements ;
- receipts de causalité ;
- commit atomique état, événements et receipt ;
- contrôle de révision, sans « dernier écrit gagne » ;
- validation cohérente et sérialisable des Dependencies ;
- replay et recovery depuis la source canonique ;
- provenance sans copie d'agrégats externes.

## 10. CONCURRENCY AND RECOVERY

Toute mutation exige la révision Action attendue. Une mutation de Dependency vérifie aussi une révision cohérente du graphe afin que deux écritures concurrentes ne créent pas de cycle. Après conflit ou échec, la source canonique est relue et l'intention réévaluée ; aucune compensation métier n'est inventée.

## 11. INTERDOMAIN RELATIONS

### 11.1 Actions / Work

Chaque Action référence exactement un Work par la WorkReference canonique composée de Project Identity et Work Identity. Actions vérifie Work et peut lire Objective pour la cohérence du but, sans créer ni copier Identity, Objective, Lifecycle ou Progress.

Work peut lire `ListActionsByWork` par port interne et conserver une association qualifiée, jamais l'agrégat ou un store miroir. `ACTIONS_UNAVAILABLE`, `ACTIONS_AVAILABLE_EMPTY` et `ACTIONS_AVAILABLE` distinguent producteur indisponible, collection vide et non vide. Aucun statut Action ne change automatiquement Lifecycle ou Progress.

### 11.2 Actions / Progress

Activities, Executions, Tasks, statut et Result ne calculent ni ne modifient Progress. Progress reste la mesure observée acceptée par Work depuis Monitoring.

### 11.3 Actions / Planning

Planning conserve Plan, Timeline, Phase, Milestone, Schedule, Priority planifiée et Constraint. La relation future et optionnelle n'est pas indispensable à la Foundation et est différée. Une Action n'acquiert aucune date ni priorité Planning.

### 11.4 Actions / People

People conserve Business Identity, rôles et Affectations. Les responsabilités détaillées étant futures, aucune association People propriétaire n'est créée. Un Technical Agent ne devient jamais Business Person.

### 11.5 Actions / Decisions

Decisions conserve l'autorisation. L'intégration est différée tant que l'effet autoritatif n'est pas suffisamment matérialisé. Une Decision n'est ni Action, ni Command, ni Result ; Actions ne s'auto-autorise pas.

### 11.6 Actions / Deliverables

Un Result peut référencer un Deliverable autoritatif. Deliverables conserve contenu, version et evidence ; Actions ne crée aucune copie ni substitut.

### 11.7 Actions / Runtime

Command, Activity et Execution Actions restent métier. Runtime, Mission, agents, queues, logs et recovery restent techniques. Un fait technique ne contribue à une Activity qu'après qualification explicite par Actions Authority selon une règle future certifiée.

## 12. ERROR MODEL

Toute erreur bloquante refuse la mutation complète, n'émet aucun événement et ne déclenche aucune compensation implicite.

| Erreur | Condition |
|---|---|
| WORK_REFERENCE_NOT_FOUND | WorkReference sans Work autoritatif |
| ACTION_NOT_FOUND | Action ciblée absente |
| ACTION_ALREADY_EXISTS | identité réutilisée dans le Work |
| ACTION_PURPOSE_REQUIRED | but absent ou substitué à Objective |
| ACTION_STATUS_TRANSITION_INVALID | transition hors graphe |
| ACTION_TERMINAL | mutation de cycle après état terminal |
| ACTION_RESULT_REQUIRED | complétion sans Result ni constatation explicite |
| ACTION_RESULT_CONFLICT | seconde issue concurrente ou réécriture |
| ACTION_PROVENANCE_REQUIRED | provenance absente ou illisible |
| ACTION_CAUSALITY_CONFLICT | causalité réutilisée avec contenu différent |
| ACTION_REVISION_CONFLICT | révision attendue obsolète |
| TASK_NOT_FOUND / TASK_DUPLICATE | Task absente ou identité réutilisée |
| TASK_PURPOSE_CONFLICT | Task contradictoire avec l'Action |
| EXECUTION_NOT_FOUND / EXECUTION_STATE_INVALID | Execution absente ou cycle incohérent |
| INVALID_ACTION_DEPENDENCY | référence absente, identique, non qualifiée ou inter-Work non admise |
| ACTION_DEPENDENCY_CYCLE | cycle direct ou indirect |
| EXTERNAL_AUTHORITY_NOT_ADMITTED | relation interdomaine non certifiée |
| TECHNICAL_ACTION_SOURCE_FORBIDDEN | source technique, UI, fixture ou projection promue |

## 13. CERTIFICATION RULES

Un sous-lot est GO seulement si son périmètre exact est respecté, toutes ses validations passent, aucune source concurrente n'apparaît, les preuves sont reliées à la bonne mission et aucune régression Work, PEOPLE, PLANNING, Runtime ou Core applicable n'est introduite. La revue humaine finale reste obligatoire.

## 14. CONSISTENCY RULES

### 14.1 Transaction

Une commande est entièrement acceptée ou rejetée. Les changements de Dependency préservent l'acyclicité globale.

### 14.2 Histoire

Activities, Executions, Results et événements ne sont ni réécrits ni supprimés physiquement. Un retrait de Dependency ou Task est historique.

### 14.3 Séparation des faits

Une Command ne prouve ni Activity, ni Execution, ni Result. Une Activity ne remplace pas le statut. Une Execution métier n'est pas un run technique. Les Tasks ne complètent pas automatiquement l'Action.

### 14.4 Références externes

Toute référence conserve identité, ownership et provenance de sa source. Son indisponibilité ne produit aucune donnée de remplacement.

### 14.5 Idempotence

Une répétition exacte retourne le receipt initial ; un contenu divergent sous la même causalité échoue ; aucun événement n'est dupliqué.

### 14.6 Concurrence

Chaque écriture utilise compare-and-swap ou une garantie équivalente. Les invariants sont réévalués sur l'état commitable.

### 14.7 Invariants non négociables

1. Toute Action possède une identité non ambiguë dans exactement un Work canonique.
2. Le but Action est explicite, compatible avec Objective et ne le remplace jamais.
3. Toute Action possède exactement un statut courant et toute transition respecte le graphe.
4. `COMPLETED` et `CANCELLED` sont terminaux.
5. Une Action `COMPLETED` possède un Result autoritatif ou une constatation explicite.
6. Command, Activity, Execution et Result restent distincts.
7. Une Task reste subordonnée, non contradictoire et sans complétion automatique.
8. Toute Dependency est explicite, orientée, sourcée et le graphe reste acyclique.
9. Toute évolution possède provenance, causalité et révision attendue.
10. L'absence de Result n'autorise aucun défaut et aucune seconde source de Result n'existe.
11. Work conserve Identity, Objective, Lifecycle et Progress ; Actions ne les copie ni ne les modifie.
12. Planning conserve temps planifié, Phase, Milestone, Schedule, Priority et Constraint.
13. People conserve Business Identity, rôles et Affectations ; Decisions conserve l'autorisation.
14. Deliverables conserve le livrable et son evidence.
15. Runtime, agents, queues, timers, logs, audits, fixtures, UI et projections ne produisent aucun fait Actions implicite.
16. Toute mutation est acceptée uniquement par Actions Authority et persistée dans une source durable unique.

## 15. TEST CONTRACT

| Catégorie | Couverture obligatoire |
|---|---|
| Tests d'invariants et d'agrégat | identité, Work, but, statuts, Tasks, distinctions et histoire |
| Tests de Commands | succès, préconditions, erreurs, atomicité et zéro effet en échec |
| Tests d'événements | mapping, ordre, données, provenance, causalité et absence de doublon |
| Tests de Result | absence, enregistrement, complétion, référence externe et seconde source rejetée |
| Tests de Dependency | cible, auto-dépendance, portée, cycles, retrait et concurrence |
| Tests de provenance et causalité | source obligatoire, répétition exacte, divergence et histoire |
| Tests de concurrence | révision, mutations, Result et graphe concurrents |
| Tests de persistence | source unique, atomicité, CAS, receipts, replay, recovery et migration |
| Tests de Queries | état, histoire, Activities, Executions, Result, Dependencies, vide et read-only |
| Tests d'intégration Work | WorkReference, Work absent, trois états, zéro miroir, Objective/Lifecycle/Progress inchangés |
| Tests de séparation | Planning, PEOPLE, Decisions, Deliverables et Runtime non producteurs |
| Tests de non-régression | Work, PEOPLE, PLANNING, Runtime et Core applicables |
| Typecheck | Actions et périmètres affectés sans erreur nouvelle |

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| P3-ACTIONS-001B | Tests d'invariants et d'agrégat ; Tests de Result structurels ; Tests de Dependency structurels ; Tests de séparation ; Typecheck |
| P3-ACTIONS-001C | Tests de Commands ; Tests d'événements ; Tests de provenance et causalité ; Tests de Result ; Tests de Dependency ; Tests de concurrence applicables ; Typecheck |
| P3-ACTIONS-001D | Tests de persistence ; Tests de concurrence ; Tests de provenance et causalité ; Tests de Result et Dependency durables ; Tests de non-régression ; Typecheck |
| P3-ACTIONS-001E | Tests de Commands internes ; Tests de Queries ; Tests d'idempotence ; Tests de persistence applicables ; Tests de séparation ; Typecheck |
| P3-ACTIONS-001F | Tests d'intégration Work ; Tests de Queries par Work ; Tests de séparation Work/Progress, Planning, PEOPLE et Runtime ; Tests de non-régression ; Typecheck |
| P3-ACTIONS-001G | Toutes les catégories du TEST CONTRACT ; suites Actions, Work, PEOPLE, PLANNING, Runtime/Core applicables ; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Ordre retenu

| Ordre | Sous-lot | Objet | Livrable fonctionnel autorisé |
|---|---|---|---|
| 1 | P3-ACTIONS-001B — Actions Foundation Model | matérialiser l'agrégat et ses distinctions | Action, statuts, Tasks, Commands enregistrées, Activities, Executions, Result, Dependency, erreurs et invariants, sans producteur |
| 2 | P3-ACTIONS-001C — Actions Authoritative Producer | établir l'unique frontière d'acceptation | Actions Authority, commandes, événements, graphe, provenance, causalité et concurrence en mémoire, sans persistence |
| 3 | P3-ACTIONS-001D — Actions Persistence | établir la source durable unique | état, histoire, événements, Results, receipts, CAS, graphe cohérent, replay et recovery |
| 4 | P3-ACTIONS-001E — Actions Internal Access | ouvrir Commands et Queries internes | services internes et lectures qualifiées, sans transport public |
| 5 | P3-ACTIONS-001F — Actions Work Integration | matérialiser l'association obligatoire | port Work/Actions, liste par Work, trois états, zéro miroir et séparation Progress |
| 6 | P3-ACTIONS-001G — Actions Foundation Certification | certifier P3-ACTIONS-001 | audit consolidé, ownership, preuves, non-régressions et décision humaine finale |

### 16.2 Justification spécifique

Le modèle stabilise d'abord les sept concepts et le graphe. L'Authority précède la persistence pour que seule une sémantique acceptée devienne durable. La persistence précède l'accès opérationnel car Result, histoire, idempotence et concurrence ne tolèrent pas de source transitoire. Commands et Queries partagent une frontière interne. L'intégration Work attend cette lecture stable afin d'exposer zéro à plusieurs Actions sans miroir. La certification consolide enfin l'acyclicité, le Result unique et toutes les séparations.

## 17. ENTRY AND EXIT GATES

### 17.1 Règles communes

Chaque sous-lot exige une mission distincte, le précédent certifié, un périmètre fermé, une liste exacte de fichiers, les tests définis avant modification, un rapport unique, aucune régression et une décision explicite sur le suivant.

### 17.2 Gates par sous-lot

| Sous-lot | Critères d'entrée | Fichiers autorisés à fixer dans la mission | Critères de sortie | Régressions interdites | PreviousLot | NextAuthorizedLot |
|---|---|---|---|---|---|---|
| P3-ACTIONS-001B | P3-ACTIONS-001A CERTIFIED ; sources inchangées | futur noyau interne Actions et tests ciblés uniquement | agrégat et concepts conformes ; aucun producteur, stockage, Work ou transport ; validations B PASS ; rapport GO | modification Work/PEOPLE/PLANNING/Runtime ; fusion des concepts ; primitive non sourcée | P3-ACTIONS-001A | P3-ACTIONS-001C |
| P3-ACTIONS-001C | P3-ACTIONS-001B CERTIFIED ; modèle certifié | Actions Authority, Commands/Events et tests uniquement | producteur unique ; transitions, Result, graphe, provenance et causalité conformes ; aucune persistence/Work/API ; validations C PASS | second producteur ; écriture directe ; événement technique promu ; affaiblissement des invariants B | P3-ACTIONS-001B | P3-ACTIONS-001D |
| P3-ACTIONS-001D | P3-ACTIONS-001C CERTIFIED ; besoin durable reconfirmé | persistence, migration/recovery et tests uniquement | source unique ; état, histoire, Result, événements et receipts atomiques ; CAS, replay/recovery ; validations D PASS | store concurrent ; histoire réécrite ; last-write-wins ; copie d'agrégat externe | P3-ACTIONS-001C | P3-ACTIONS-001E |
| P3-ACTIONS-001E | P3-ACTIONS-001D CERTIFIED ; source stable | accès applicatif interne et tests uniquement | Commands vers Authority/source ; Queries read-only ; aucune API/BFF/frontend ; validations E PASS | contournement Authority ; query mutante ; projection autoritative ; transport public | P3-ACTIONS-001D | P3-ACTIONS-001F |
| P3-ACTIONS-001F | P3-ACTIONS-001E CERTIFIED ; accès stable | intégration interne Work/Actions et tests uniquement | lecture par WorkReference ; trois états ; zéro miroir ; Work/Progress inchangés ; validations F PASS | mutation Actions par Work ; store miroir ; calcul Lifecycle/Progress ; transfert Planning/People | P3-ACTIONS-001E | P3-ACTIONS-001G |
| P3-ACTIONS-001G | P3-ACTIONS-001F CERTIFIED ; rapports B à F disponibles | rapport/certification et corrections préautorisées uniquement | conformité complète ; ownership, source, Result et graphe uniques ; validations G PASS ; décision humaine de clôture | modification fonctionnelle non autorisée ; preuve croisée ; régression Work/PEOPLE/PLANNING/Runtime/Core | P3-ACTIONS-001F | null |

### 17.3 Entry gate P3-ACTIONS-001A

| Condition | Résultat |
|---|---|
| Blueprint Actions suffisamment déterministe | PASS |
| Planning certifié jusqu'à P3-PLANNING-001G | PASS |
| Identifiants P3-ACTIONS-001 et 001A décidés | PASS |
| Mission strictement documentaire | PASS |

### 17.4 Exit gate P3-ACTIONS-001A

| Contrôle | Résultat |
|---|---|
| ownership et Actions Authority uniques | PASS |
| exactement un Work sans seconde identité | PASS |
| Objective, Lifecycle, Progress, Planning, PEOPLE, Decisions et Runtime préservés | PASS |
| Result unique et références externes sans transfert | PASS |
| persistence requise sans technologie inventée | PASS |
| Commands, Events, Queries, erreurs, idempotence et concurrence déterminés | PASS |
| inconnues explicitement différées | PASS |
| séquence B à G et gates déterministes | PASS |
| admission CEREBRAU générique démontrée | PASS |
| implémentation fonctionnelle | NONE |

### 17.5 Admission CEREBRAU

Après approbation humaine, l'acte minimal est une seule entrée `P3-ACTIONS-001A` dans `Docs/12_CERTIFICATION/certification-registry.json`, pointant vers ce contrat, `PreviousLot=null`, `NextAuthorizedLot=P3-ACTIONS-001B`, `Status=CERTIFIED`. `Resolve-DomainContext` retrouvera alors contrat et blueprint ; `Resolve-CurrentLot` déduira B comme premier lot absent. Aucun lot B à G ne sera précréé et aucun spécial-case CEREBRAU n'est requis.

### 17.6 Décision technique

**VERDICT : GO**

**CERTIFICATION CANONIQUE : PENDING HUMAN APPROVAL**

**NEXT LOT AFTER APPROVAL: P3-ACTIONS-001B — Actions Foundation Model**

P3-ACTIONS-001B n'est pas commencé.
