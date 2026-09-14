# PLANNING IMPLEMENTATION CONTRACT

## Statut documentaire

| Attribut | Valeur |
|---|---|
| Mission | P3-PLANNING-001A-IMPLEMENTATION-CONTRACT |
| DomainId | PLANNING |
| Parent lot | P3-PLANNING-001 — Planning Foundation |
| Lot | P3-PLANNING-001A |
| Nature | Contrat d'implémentation et admission documentaire |
| Autorité métier | `PLANNING_DOMAIN_BLUEPRINT.md` |
| Baseline Work | `WORK_DOMAIN_BLUEPRINT.md` |
| Gate Phase 3 | `WORK_PHASE2_CERTIFICATION.md` |
| Prérequis de gouvernance | P3-PEOPLE-001H — P3-PEOPLE-001 CERTIFIED |
| Implémentation produite | Aucune |
| Verdict | GO |

Ce contrat traduit le blueprint Planning certifié en décisions d'implémentation obligatoires. Il ne modifie pas le blueprint, ne crée aucun modèle logiciel, aucune persistance et aucun chemin exécutable Planning.

## 1. IMPLEMENTATION SCOPE

### 1.1 Fondation immédiate

P3-PLANNING-001 contient uniquement le noyau nécessaire pour établir et relire l'intention temporelle, séquentielle et contraignante autoritative d'un Work :

- un Planning rattaché à exactement un Work canonique ;
- zéro ou une version courante applicable par Work ;
- des versions antérieures immuables et relisibles ;
- les Phases et Milestones explicitement définis ;
- les Dependencies orientées et acycliques entre éléments identifiés ;
- le Schedule et ses seuls repères temporels métier ;
- les Priorities explicites dans un périmètre déclaré ;
- les Constraints avec source, portée et période d'effet ;
- la Timeline comme représentation dérivée du plan ;
- la provenance, la causalité et la révision de chaque changement accepté ;
- l'établissement, la révision et le retrait explicites du plan courant ;
- la lecture qualifiée par Work, sans copie autoritative.

Un Planning peut être établi sans relation People, Actions, Deliverables, Decisions, Intelligence, Confidence ou Synthesis. Ces relations demeurent optionnelles et ne peuvent rendre obligatoire aucune donnée de remplacement.

### 1.2 Décisions volontairement différées

Les éléments suivants restent soumis à une décision ultérieure parce que le blueprint les qualifie d'évolutions futures ou ne fournit pas leur règle opérationnelle :

- catégories de Phases et de Milestones ;
- vocabulaire fermé ou échelle des Priorities ;
- catégories et moteurs d'évaluation des Constraints ;
- règles métier constatant qu'un Milestone est atteint ;
- identité des sources autorisées à constater `MilestoneReached` ;
- comparaison calculée entre planifié et observé ;
- association détaillée de responsabilités People ;
- association à des Actions ou Deliverables ;
- effet détaillé d'une Decision d'arbitrage ;
- exposition publique, transport ou projection UX.

Le noyau conserve une qualification de priorité explicitement fournie, sa portée et sa provenance, mais n'invente ni valeur par défaut, ni ordre entre qualifications non définies. `MilestoneReached` reste un événement conceptuel du blueprint ; aucune commande de la Foundation ne peut l'émettre avant certification de sa source et de sa règle d'atteinte. Ces différés ne bloquent pas l'établissement, la révision, le retrait et la lecture d'un plan.

### 1.3 Hors périmètre

- Progress, Monitoring et calcul d'avancement ;
- Lifecycle, Objective et identité possédés par Work ;
- Actions, leur exécution, leur statut et leurs résultats ;
- Deliverables réellement produits ;
- Decisions et actes d'arbitrage ;
- Business Persons, rôles et Affectations People ;
- Runtime, Missions, agents, queues, schedulers et timers ;
- timestamps techniques, ordre d'exécution et ordre d'affichage comme données métier ;
- Intelligence, Synthesis et Confidence ;
- Timeline persistée ou productrice de faits ;
- Frontend, React, BFF, API, routes HTTP et transports ;
- fixtures, mocks, caches et projections comme sources ;
- SQL, migration et persistence dans le présent lot A ;
- toute implémentation TypeScript dans le présent lot A.

### 1.4 Fermeture du périmètre

Tout concept non supporté par le blueprint ou non retenu ci-dessus est absent. Une absence n'est jamais comblée par une date technique, une position d'affichage, une progression, une fixture ou une convention implicite.

## 2. MODULE BOUNDARY

### 2.1 Responsabilité unique

Le futur module Planning aura une responsabilité unique :

> accepter, préserver, versionner et exposer le plan métier d'un Work, avec ses éléments, relations, repères temporels, contraintes, priorités et provenance.

Il ne possède ni Work, ni l'observation de l'avancement, ni les objets référencés provenant d'autres domaines.

### 2.2 Dépendances autorisées

- la WorkReference canonique et la confirmation que le Work existe ;
- l'Objective autoritatif du Work, uniquement en lecture et sans reformulation ;
- une sémantique de temps métier explicitement qualifiée ;
- une provenance et une causalité métier explicites ;
- la lecture People certifiée pour une responsabilité optionnelle explicitement référencée ;
- une référence Actions, Deliverables ou Decisions seulement après certification du domaine propriétaire et d'une relation dédiée ;
- la source canonique Planning unique future ;
- des mécanismes techniques de persistence et d'horodatage uniquement comme infrastructure, jamais comme producteurs métier.

### 2.3 Dépendances interdites

- Progress ou Monitoring pour créer, compléter ou réviser un plan ;
- Lifecycle Work pour créer une Phase ;
- Runtime, Mission, RuntimeAgent ou Technical Agent ;
- queue, scheduler, timer, timestamp ou ordre d'exécution ;
- Frontend, React, BFF, API ou route HTTP ;
- fixture, mock, cache, index ou projection ;
- Timeline comme producteur ou stockage concurrent ;
- Actions, Deliverables, Decisions, Intelligence, Synthesis ou Confidence comme propriétaires d'une primitive Planning ;
- Session, authentification ou RBAC comme autorité métier Planning ;
- toute persistence Work miroir du Planning.

### 2.4 Sens des dépendances

| Source | Consommateur | Règle |
|---|---|---|
| Work Identity | Planning | Planning valide l'ancrage sans posséder Work. |
| Objective | Planning | Planning organise sa poursuite sans le copier ni le reformuler. |
| Planning | Work | Work lit une association Planning qualifiée sans écrire dans Planning. |
| People | Planning | Planning peut référencer une responsabilité certifiée sans créer acteur, rôle ou Affectation. |
| Planning | Actions | Actions pourra référencer l'intention planifiée ; aucune exécution n'est déduite. |
| Decisions | Planning | Une décision pourra autoriser une intention de révision ; Planning applique uniquement le changement explicitement accepté. |
| Planning | Timeline | Timeline est calculée depuis une version Planning et ne retourne aucune écriture. |
| Progress | Planning | Comparaison future possible en lecture ; déduction ou mutation interdite. |

### 2.5 Limite physique du module

La future implémentation interne appartient à une racine dédiée au domaine Planning. Les contrats Work exposés lors du sous-lot d'intégration restent des ports de lecture ; ils ne déplacent ni agrégat, ni règle, ni persistence Planning dans Work.

## 3. AUTHORITATIVE OWNERSHIP

### 3.1 Producteur autoritatif futur

Le producteur métier est nommé conceptuellement **Planning Authority**. `WORK_PHASE2_CERTIFICATION.md` exige explicitement une Autorité Planning, seule productrice des Phases, Milestones, Schedule, Dependencies, Priorities et Constraints.

Planning Authority sera l'unique point d'acceptation des intentions Planning. Ce nom désigne une responsabilité métier ; il n'impose ni framework, ni transport, ni classe dans le présent lot.

Elle devra :

- confirmer WorkReference et la disponibilité de l'Objective autoritatif ;
- établir au plus un plan courant pour ce Work ;
- remplacer le plan courant uniquement par une nouvelle version explicite ;
- retirer le plan sans effacer son histoire ;
- valider les identités, dates métier, scopes, relations et cycles ;
- exiger provenance, causalité et révision attendue ;
- refuser toute donnée technique utilisée comme substitut ;
- produire les événements Planning correspondant aux faits acceptés.

### 3.2 Matrice d'ownership

| Élément | Propriétaire unique | Source future | Écriture | Lecture | Duplication interdite |
|---|---|---|---|---|---|
| Plan courant | Agrégat Planning du Work | version courante acceptée par Planning Authority | commandes Planning uniquement | source Planning uniquement | aucun champ, document ou store Work concurrent |
| Versions historiques | Agrégat Planning du Work | histoire canonique append-only | création par révision ou retrait accepté | lecture par version ou histoire | aucune reconstruction autoritative depuis des projections |
| Phase | Agrégat Planning | version Planning concernée | changement de version | vue de la version | aucun état Lifecycle Work promu |
| Milestone | Agrégat Planning | version Planning concernée | changement de version | vue de la version | aucun événement Runtime promu |
| Dependency | Agrégat Planning | graphe de la version concernée | déclaration/retrait explicite dans une révision | graphe de la version | aucun ordre d'affichage ou de queue utilisé |
| Schedule | Agrégat Planning | repères métier de la version | révision explicite | vue de la version | aucun timestamp technique de remplacement |
| Priority | Agrégat Planning | qualification explicite, scope et provenance | révision explicite, aucune valeur par défaut | vue de la version | aucun ordre d'exécution ou score Intelligence |
| Constraint | Agrégat Planning | condition, source, portée et période d'effet | déclaration/release dans une révision | vue de la version | aucune limitation technique promue |
| Timeline | aucune autorité autonome | dérivation de la version Planning | aucune écriture directe | projection reconstructible | aucune persistence ou arbitrage parallèle |
| Progress | Work/Monitoring selon la baseline | source Phase 1 inchangée | aucune écriture Planning | comparaison future seulement | aucune copie dans Planning |

### 3.3 Règles d'écriture

- toute écriture entre par Planning Authority ;
- toute intention désigne WorkReference, causalité, provenance et révision attendue ;
- toute révision fournit explicitement la nouvelle version cohérente et les changements intentionnels ;
- l'acceptation valide l'agrégat complet avant émission d'événements ;
- un échec ne change rien et n'émet aucun événement métier ;
- une répétition de même causalité et même contenu conserve le résultat initial ;
- une causalité réutilisée avec un contenu différent est rejetée ;
- aucun consommateur inter-domaine n'écrit directement dans l'agrégat.

### 3.4 Règles de lecture

- toute lecture part de la source canonique Planning ;
- une projection est reconstructible et read-only ;
- aucune lecture ne répare, complète ou invente une valeur ;
- chaque résultat qualifie WorkReference, version, applicabilité et provenance ;
- producteur indisponible, plan absent, plan retiré et valeur absente restent distincts.

## 4. AGGREGATE MODEL

### 4.1 Décision d'ensemble

Un seul agrégat est retenu : **Planning d'un Work**. Sa clé métier est la WorkReference canonique ; aucun PlanningId parallèle n'est requis pour identifier la racine.

Cette frontière unique est nécessaire pour garantir atomiquement :

- au plus une version courante applicable ;
- la cohérence globale des Phases, Milestones, Dependencies, Schedule, Priorities et Constraints ;
- l'absence de cycle dans le graphe ;
- la création contiguë d'une nouvelle version et de son histoire ;
- le retrait sans effacement ;
- l'unicité de la provenance de la décision acceptée.

### 4.2 État de la racine

| Propriété conceptuelle | Décision |
|---|---|
| Identité | WorkReference canonique |
| Existence | absente avant `PlanningEstablished` ; conservée historiquement après retrait |
| Version courante | zéro ou une `PlanningVersion` applicable |
| Versions antérieures | collection immuable ordonnée par révision Planning |
| Contenu versionné | Phase, Milestone, Dependency, Schedule, Priority, Constraint et provenance |
| Timeline | dérivée à la demande depuis une version ; jamais stockée comme autorité |
| Frontière transactionnelle | totalité du Planning d'un Work |

### 4.3 Cycle de vie

```text
ABSENT --EstablishPlanning--> CURRENT
CURRENT --RevisePlanning----> CURRENT (nouvelle version, ancienne historique)
CURRENT --WithdrawPlanning--> WITHDRAWN (aucune version courante applicable)
WITHDRAWN --EstablishPlanning--> CURRENT (nouvelle version, histoire conservée)
```

`ABSENT` signifie qu'aucun Planning n'a jamais été établi. `WITHDRAWN` signifie qu'une histoire existe mais qu'aucun plan n'est actuellement applicable. Aucun de ces états ne vaut indisponibilité du producteur.

## 5. ENTITY MODEL

| Élément | Nature | Identité | Cycle | Invariants principaux |
|---|---|---|---|---|
| Planning d'un Work | racine d'agrégat | WorkReference | absent, courant, retiré ; histoire permanente | au plus un courant ; provenance ; versionnement non destructif |
| Planning Version | entité historique interne | PlanningVersion | créée une fois, éventuellement remplacée comme courante, jamais modifiée | contenu cohérent complet ; ordre de version strict ; applicabilité explicite |
| Phase | entité interne | PhaseId opaque dans le Planning | ajoutée, changée ou retirée par nouvelle version | n'est ni Lifecycle ni état Runtime ; finalité ou période explicite |
| Milestone | entité interne | MilestoneId opaque dans le Planning | planifié, changé ou retiré par nouvelle version | point métier explicite ; aucune durée implicite |
| Constraint | entité interne | ConstraintId opaque dans le Planning | déclarée puis éventuellement released par nouvelle version | source, portée et période d'effet obligatoires |

Dependency, Schedule et Priority sont des Value Objects versionnés. Ils n'ont pas de cycle autonome hors de la version Planning. Timeline n'est ni entité ni agrégat.

## 6. VALUE OBJECTS

| Value Object | Définition | Validité minimale | Propriétaire |
|---|---|---|---|
| WorkReference | référence au Work canonique dans son Project | Project Identity et Work Identity présentes ; existence Work confirmée | Work, référencé par Planning |
| PlanningVersion | révision métier immuable du Planning d'un Work | unique, strictement postérieure à la version remplacée, jamais réutilisée | Planning |
| PhaseId | identité opaque et stable d'une Phase | présente, unique dans le Planning, non réaffectable | Planning |
| MilestoneId | identité opaque et stable d'un Milestone | présente, unique dans le Planning, non réaffectable | Planning |
| ConstraintId | identité opaque et stable d'une Constraint | présente, unique dans le Planning, non réaffectable | Planning |
| PlanningElementReference | référence typée à une Phase ou un Milestone de la version | cible existante et non ambiguë | Planning |
| BusinessInstant | repère ponctuel portant une signification métier explicite | valeur, sémantique et provenance présentes ; jamais dérivé d'un timestamp technique | Planning |
| BusinessPeriod | intervalle métier explicite | bornes éventuelles cohérentes et sémantique d'inclusion déclarée ; aucune borne par défaut | Planning |
| Schedule | ensemble des instants, périodes et séquences métier retenus | chaque repère qualifié et sourcé ; cohérence avec les éléments référencés | Planning |
| Dependency | relation orientée de prérequis | source et cible identifiées, distinctes, présentes ; pas de cycle global | Planning |
| Priority | qualification d'importance relative | élément, périmètre de comparaison, qualification explicite et provenance ; aucune valeur par défaut | Planning |
| PlanningProvenance | origine d'une décision Planning | autorité, source, cause métier et date d'effet identifiables | Planning |
| CausalityId | identité stable de l'intention commandée | présente, non réutilisable avec un contenu différent | Planning |

La structure technique de sérialisation et le format des identifiants/dates ne sont pas prescrits. Aucune précision technique de temps ne crée une précision métier.

## 7. COMMANDS

### 7.1 Commandes canoniques

| Commande | Intention | Préconditions | Effet atomique | Événements possibles |
|---|---|---|---|---|
| EstablishPlanning | établir le premier plan applicable ou réétablir après retrait | Work existe ; Objective lisible ; aucune version courante ; proposition complète ; provenance, causalité et révision attendue | crée une version courante cohérente sans effacer l'histoire éventuelle | PlanningEstablished et événements granulaires décrivant le contenu initial |
| RevisePlanning | remplacer explicitement la version courante | version courante présente ; révision attendue exacte ; proposition complète ; changements explicites ; invariants globaux satisfaits | rend la nouvelle version courante et l'ancienne historique | PlanningRevised puis événements granulaires correspondant exactement aux changements |
| WithdrawPlanning | cesser l'applicabilité du plan courant sans remplacement | version courante présente ; révision attendue exacte ; motif et provenance explicites | retire le caractère courant ; conserve toutes les versions | PlanningWithdrawn |

Les intentions d'ajout/changement/retrait de Phase, Milestone, Dependency, Constraint, Schedule ou Priority sont normalisées vers `EstablishPlanning` ou `RevisePlanning`. Elles ne constituent pas des voies d'écriture concurrentes et n'autorisent aucune mutation en place.

### 7.2 Commande non admise dans la Foundation

`RecordMilestoneReached` n'est pas admise. Le blueprint réserve `MilestoneReached` à une constatation par une source autorisée, mais ne définit ni cette source ni la règle d'atteinte. L'activer pendant P3-PLANNING-001 inventerait une autorité observée et risquerait de fusionner Planning avec Progress, Actions ou Deliverables.

### 7.3 Contrat commun

Chaque commande porte WorkReference, CausalityId, PlanningProvenance et révision attendue. Les commandes d'établissement/révision portent une proposition de version complète afin que le graphe, le Schedule et les contraintes soient validables ensemble.

## 8. DOMAIN EVENTS

### 8.1 Principes

Tous les événements sont immuables, ordonnés dans l'agrégat du Work, liés à une causalité, porteurs de provenance et rattachés à la version résultante. Ils expriment un fait Planning, jamais une exécution technique.

### 8.2 Mapping canonique

| Événement | Déclencheur admis | Données métier minimales | Ordre |
|---|---|---|---|
| PlanningEstablished | EstablishPlanning accepté | WorkReference, nouvelle version, période d'applicabilité, provenance | premier événement de l'établissement |
| PlanningRevised | RevisePlanning accepté | WorkReference, ancienne/nouvelle version, motif, provenance | précède les événements granulaires de la révision |
| PlanningWithdrawn | WithdrawPlanning accepté | WorkReference, version retirée, date d'effet métier, motif, provenance | dernier fait de la version courante |
| PhaseAdded | présence nouvelle explicite | PhaseId, définition, repères, version, provenance | après événement racine |
| PhaseChanged | différence explicite | PhaseId, changement métier, version, provenance | après événement racine |
| PhaseRemoved | retrait explicite | PhaseId, date d'effet, version, provenance | après retrait des relations invalidées dans la même révision |
| MilestoneScheduled | présence nouvelle explicite | MilestoneId, condition/résultat planifié, repères, version, provenance | après événement racine |
| MilestoneChanged | différence explicite | MilestoneId, changement métier, version, provenance | après événement racine |
| MilestoneRemoved | retrait explicite | MilestoneId, date d'effet, version, provenance | après retrait des relations invalidées dans la même révision |
| MilestoneReached | aucune commande Foundation | MilestoneId, constat autorisé, date d'effet, provenance | réservé ; émission interdite jusqu'à décision dédiée |
| DependencyDeclared | relation nouvelle | source, cible, version, provenance | après existence des deux éléments |
| DependencyRemoved | relation supprimée | source, cible, version, provenance | avant suppression d'un élément concerné |
| ConstraintDeclared | contrainte nouvelle | ConstraintId, source, portée, période, version, provenance | après événement racine |
| ConstraintReleased | fin d'effet explicite | ConstraintId, date d'effet, version, provenance | après événement racine |
| ScheduleChanged | repères temporels modifiés | changements qualifiés, version, provenance | après événement racine |
| PriorityChanged | priorité modifiée | élément, scope, ancienne/nouvelle qualification éventuelle, version, provenance | après événement racine |

Une même différence métier ne produit qu'un événement granulaire. L'événement racine constate la nouvelle version ; les événements granulaires expliquent son contenu sans ouvrir une seconde écriture.

## 9. QUERIES

| Query | Objectif | Résultat qualifié |
|---|---|---|
| GetCurrentPlanning | lire le plan actuellement applicable d'un Work | indisponible, absent, retiré ou version courante complète avec provenance |
| GetPlanningVersion | relire une version précise | version immuable complète ou absence explicite |
| GetPlanningHistory | relire la succession des versions et retraits | histoire ordonnée, causalités, provenance et statut d'applicabilité |
| GetPlanningTimeline | représenter temporellement une version | Timeline dérivée avec version source ; aucune invention de date ou causalité |
| GetPlanningSchedule | lire les repères métier d'une version | Schedule exact, valeurs absentes explicites, provenance |

Les collections Phase, Milestone, Dependency, Priority et Constraint appartiennent au résultat de la version. Des filtres internes peuvent être ajoutés comme optimisations de lecture seulement s'ils restent reconstructibles, cohérents à une même version et non autoritatifs.

## 10. PERSISTENCE POLICY

### 10.1 Décision

**PERSISTENCE CANONIQUE UNIQUE REQUISE, MAIS CRÉATION INTERDITE AVANT P3-PLANNING-001D.**

Elle est requise par l'unicité durable du plan courant, l'historique obligatoire des versions remplacées, le retrait non destructif, la provenance, l'idempotence, la concurrence et la reprise après échec. Aucune commande opérationnelle n'est ouverte avant certification de cette source.

### 10.2 Contenu autoritatif

La persistence future contient uniquement :

- la racine par WorkReference ;
- la version courante éventuelle ;
- toutes les versions historiques et retraits ;
- les événements, causalités, provenances et révisions nécessaires à la relecture ;
- les reçus nécessaires à l'idempotence.

Elle ne persiste aucune copie de Work, Objective, Progress, People, Action, Deliverable, Decision, Runtime ou Timeline. Une référence externe reste une référence qualifiée.

### 10.3 Atomicité, concurrence et reprise

- état courant, nouvelle version, événements et reçu de commande sont commités atomiquement ;
- chaque écriture vérifie la révision attendue ;
- aucun « dernier écrit gagne » n'est admis ;
- une tentative conflictuelle échoue sans effet partiel ;
- une reprise relit la source canonique et réévalue les invariants ;
- aucune reconstruction autoritative depuis un cache, une Timeline ou Work n'est admise.

### 10.4 Historique et migration

- aucune version ni événement accepté n'est réécrit ou supprimé physiquement dans la Foundation ;
- un retrait est un fait métier, pas une suppression ;
- toute migration future préserve WorkReference, versions, ordre, provenance et causalité ;
- une migration rejette une ambiguïté plutôt que d'inventer une correction ;
- aucune migration ne transforme timestamps, fixtures, Progress ou ordre de queue en Planning ;
- la technologie, le schéma et la stratégie de migration seront décidés dans P3-PLANNING-001D sans modifier le présent modèle métier.

### 10.5 Projections

Index, caches et Timeline éventuels sont reconstructibles, ne reçoivent aucune commande métier directe et ne peuvent arbitrer un conflit avec la source canonique.

## 11. WORK INTEGRATION

### 11.1 Rattachement déterministe

Planning et Work partagent exactement la WorkReference canonique, composée de la Project Identity et de la Work Identity. La racine Planning n'introduit aucun identifiant Work ou Mission parallèle.

### 11.2 Direction

Planning vérifie Work et lit l'Objective nécessaire. Work consomme `GetCurrentPlanning` par un port interne certifié. Work n'écrit jamais directement dans Planning ; Planning ne modifie ni Identity, ni Objective, ni Lifecycle, ni Progress.

### 11.3 Données exposables

Work peut recevoir uniquement :

- WorkReference ;
- statut qualifié de disponibilité/absence ;
- PlanningVersion courante éventuelle ;
- période d'applicabilité ;
- références et repères Planning nécessaires à la cohérence ;
- provenance et révision de lecture.

Work ne conserve pas l'agrégat, l'histoire complète, le graphe, une Timeline autoritative ou une copie persistée de la version.

### 11.4 États d'absence

| État | Sens |
|---|---|
| PLANNING_UNAVAILABLE | le producteur ou la lecture canonique ne peut répondre |
| PLANNING_ABSENT | aucun Planning n'a été établi pour le Work |
| PLANNING_WITHDRAWN | une histoire existe mais aucun plan n'est applicable |
| PLANNING_AVAILABLE | une version courante qualifiée est lisible |

Une valeur absente à l'intérieur d'une version disponible reste une absence de valeur Planning et ne change pas le statut de disponibilité. Aucun de ces états n'est remplacé par une fixture.

### 11.5 Progress et Timeline

Progress reste possédé par Work/Monitoring et décrit l'observé. Planning ne le calcule ni ne le modifie. Work peut ultérieurement comparer deux lectures autoritatives, mais aucune des deux ne devient la source de l'autre. Timeline expose la version Planning source et n'est jamais stockée dans Work comme vérité parallèle.

## 12. INTERDOMAIN DEPENDENCIES

### 12.1 People

PEOPLE étant certifié, Planning peut lire une référence de responsabilité People explicite et certifiée. Il ne copie ni Business Person, ni rôle, ni Affectation, et ne fabrique aucun acteur. L'absence de People sur un élément planifié demeure valide.

### 12.2 Actions et Deliverables

Actions n'est pas commencé par ce contrat. Une future Action pourra réaliser un élément planifié et un Milestone pourra référencer un Deliverable attendu, mais Planning ne produit ni statut d'Action, ni résultat, ni livrable réel, ni atteinte de Milestone par déduction.

### 12.3 Decisions

Une Decision peut être citée comme source d'une intention ou d'un arbitrage. Planning conserve la référence et la provenance de l'effet explicitement accepté ; il ne crée, n'approuve et ne réinterprète pas la Decision.

### 12.4 Intelligence, Confidence et Synthesis

Ces domaines sont uniquement consommateurs ou proposants futurs. Une recommandation ne modifie pas Planning sans nouvelle intention acceptée. Confidence ne devient pas Priority. Synthesis ne devient pas Timeline ni source Planning.

## 13. ERROR MODEL

Toute erreur bloquante refuse la mutation complète, n'émet aucun événement de changement et ne déclenche aucune compensation implicite.

| Erreur | Condition |
|---|---|
| WORK_REFERENCE_NOT_FOUND | WorkReference ne désigne aucun Work autoritatif |
| OBJECTIVE_UNAVAILABLE | l'Objective requis ne peut être lu au moment de l'acceptation |
| PLANNING_ALREADY_CURRENT | établissement demandé alors qu'un plan courant existe |
| PLANNING_NOT_FOUND | révision ou retrait sans agrégat historique |
| PLANNING_NOT_CURRENT | révision ou retrait sans version applicable |
| PLANNING_VERSION_CONFLICT | révision attendue différente de la révision canonique |
| PLANNING_CAUSALITY_CONFLICT | causalité réutilisée avec un contenu différent |
| PLANNING_PROVENANCE_REQUIRED | provenance absente ou non relisible |
| PLANNING_ELEMENT_NOT_FOUND | Phase, Milestone ou Constraint ciblé absent |
| PLANNING_ELEMENT_DUPLICATE | identité réutilisée dans le Planning |
| INVALID_BUSINESS_TIME | repère sans sens métier, incohérent ou dérivé d'une source technique |
| INVALID_DEPENDENCY | source/cible absente, identique ou relation non explicite |
| DEPENDENCY_CYCLE | la proposition crée un cycle dans le graphe |
| PRIORITY_SCOPE_REQUIRED | Priority sans périmètre explicite ou avec valeur inventée |
| CONSTRAINT_QUALIFICATION_REQUIRED | Constraint sans source, portée ou période d'effet |
| TECHNICAL_PLANNING_SOURCE_FORBIDDEN | donnée Runtime, timestamp, queue, fixture ou projection utilisée comme source |
| MILESTONE_REACH_AUTHORITY_UNDEFINED | tentative d'émettre MilestoneReached avant admission de sa source/règle |

L'indisponibilité en lecture est un résultat qualifié, non une mutation et non une raison d'inventer un plan.

## 14. CONSISTENCY RULES

### 14.1 Transaction

La totalité du Planning d'un Work constitue la frontière transactionnelle. Une révision est entièrement acceptée ou entièrement rejetée.

### 14.2 Versionnement

Une mutation acceptée crée une nouvelle version ; aucune version existante n'est modifiée en place. Une seule version est courante, ou aucune après retrait.

### 14.3 Graphe et références

Toutes les références internes ciblent des éléments présents dans la version. Le graphe Dependency est orienté, explicite et acyclique. Retirer un élément exige le retrait explicite des relations qui le ciblent dans la même proposition.

### 14.4 Temps métier

Chaque repère porte sa sémantique et sa provenance. La persistence peut porter un instant technique de commit pour l'audit, mais cet instant ne devient jamais `BusinessInstant` ni Schedule.

### 14.5 Idempotence et concurrence

Même causalité et même contenu retournent le résultat initial. Même causalité et contenu différent échouent. Toute révision obsolète échoue et doit être relue avant nouvelle intention.

### 14.6 Cohérence inter-domaine

Work et Objective sont vérifiés sans être copiés. Toute référence externe conserve son propriétaire. L'indisponibilité d'une dépendance optionnelle n'altère pas un plan qui ne l'utilise pas.

### 14.7 Invariants non négociables

1. Tout Planning est rattaché à exactement un Work autoritatif par WorkReference.
2. Un Work possède au plus une version Planning courante applicable.
3. Toute version courante et toute mutation possèdent une provenance explicite.
4. Toute date Planning possède une signification métier démontrée.
5. Aucun timestamp, timer, scheduler, ordre de queue ou ordre d'exécution ne produit une date Planning.
6. Timeline reflète une version Planning et ne constitue jamais une source concurrente.
7. Un Milestone ne possède aucune durée implicite.
8. Une Phase n'est ni un Lifecycle Work, ni un état Runtime.
9. Toute Dependency est explicite, orientée, rattachée à des éléments identifiés et le graphe reste acyclique.
10. Toute Priority possède un périmètre et une qualification explicites ; aucune valeur par défaut n'est inventée.
11. Toute Constraint possède une source, une portée et une période d'effet.
12. Une révision ne réécrit ni ne supprime l'histoire.
13. Progress observé et Planning intentionnel restent deux vérités séparées et non déduites l'une de l'autre.
14. Plan absent, valeur absente et producteur indisponible restent des situations distinctes.
15. Une projection, une fixture, un cache ou Work ne produit aucun fait Planning.
16. Planning ne produit ni Action exécutée, ni Deliverable, ni Decision, ni Business Person.
17. Toute association externe conserve l'identité, la provenance et l'ownership de son domaine.
18. `MilestoneReached` ne peut être émis sans source et règle d'atteinte préalablement certifiées.

## 15. TEST CONTRACT

Le présent lot documentaire ne crée aucun test logiciel. Chaque sous-lot futur exécute les validations proportionnées à son périmètre.

| Catégorie | Couverture obligatoire |
|---|---|
| Tests d'invariants | WorkReference unique ; un courant au plus ; provenance ; temps métier ; Milestone sans durée implicite ; Phase distincte du Lifecycle ; graphe acyclique ; Priority sans défaut ; Constraint qualifiée ; histoire immuable |
| Tests d'agrégat | absence, établissement, révision, retrait, réétablissement, versions historiques et atomicité globale |
| Tests de Commands | EstablishPlanning, RevisePlanning, WithdrawPlanning ; succès, préconditions, erreurs, événements, idempotence et zéro effet en échec |
| Tests d'événements | mapping complet, données minimales, ordre racine/granulaire, causalité, provenance, absence de doublon et MilestoneReached interdit |
| Tests de Queries | courant, version, histoire, Timeline, Schedule, absence, retrait, indisponibilité, cohérence de version et read-only |
| Tests de persistence | source unique, commit atomique, CAS, replay, recovery, histoire append-only, receipts, migration et aucune Timeline autoritative |
| Tests de Dependency | source/cible absente, auto-dépendance, cycle direct/indirect, retrait coordonné et ordre d'affichage ignoré |
| Tests de temps | date métier qualifiée, absence permise, timestamp technique rejeté, ordre de queue/timer/scheduler rejeté |
| Tests d'intégration Work | WorkReference, Objective en lecture, quatre états, source Planning unique, aucune copie d'agrégat et provenance |
| Tests de séparation Progress | aucune création/révision depuis Progress ou Monitoring ; comparaison read-only seulement |
| Tests interdomaines | People optionnel sans copie ; Actions/Deliverables/Decisions non produits ; dépendances futures absentes acceptées |
| Tests de non-régression | Work Identity, Objective, Lifecycle, Progress, Deliverables, Decisions, Technical Agent, PEOPLE, Runtime et Core inchangés hors intégration autorisée |
| Typecheck | Planning et tous les périmètres réellement affectés sans erreur nouvelle |

### 15.1 TEST CONTRACT PAR SOUS-LOT

Les validations obligatoires sont attribuées explicitement à chaque sous-lot. Cette attribution prévaut pour la certification du sous-lot courant ; le tableau global de la section 15 définit la couverture complète exigée à la clôture P3-PLANNING-001G.

| Sous-lot | Validations obligatoires |
|---|---|
| P3-PLANNING-001B | Tests d'invariants ; Tests de Dependency ; Tests de temps ; Typecheck |
| P3-PLANNING-001C | Tests d'invariants applicables au producteur ; Tests d'agrégat applicables à Establish/Revise/Withdraw ; Tests de Commands ; Tests d'événements ; Tests de Dependency applicables à la validation des propositions ; Tests de temps applicables à la validation des propositions ; Tests de non-régression applicables ; Typecheck |
| P3-PLANNING-001D | Tests de persistence ; Tests d'idempotence applicables à la persistence ; Tests de concurrence applicables à la persistence ; Tests de non-régression applicables ; Typecheck |
| P3-PLANNING-001E | Tests de Commands sur le chemin applicatif interne ; Tests de Queries ; Tests d'événements applicables ; Tests de persistence applicables à l'accès canonique ; Tests de non-régression applicables ; Typecheck |
| P3-PLANNING-001F | Tests d'intégration Work ; Tests de séparation Progress ; Tests interdomaines ; Tests de non-régression ; Typecheck |
| P3-PLANNING-001G | Toutes les catégories du TEST CONTRACT global de la section 15 ; tests Planning, Work, PEOPLE, Runtime/Core applicables ; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Ordre retenu

| Ordre | Sous-lot | Objet | Livrable fonctionnel autorisé |
|---|---|---|---|
| 1 | P3-PLANNING-001B — Planning Foundation Model | matérialiser la frontière d'agrégat et les invariants structurels/temporels | racine, versions, entités, Value Objects, erreurs et tests du noyau, sans producteur opérationnel |
| 2 | P3-PLANNING-001C — Planning Authoritative Producer | établir Planning Authority comme unique acceptation métier | trois commandes canoniques, événements, provenance, causalité et validation des propositions, sans persistence |
| 3 | P3-PLANNING-001D — Planning Persistence | établir la source durable unique avant toute utilisation opérationnelle | état courant, versions historiques, événements, receipts, concurrence, recovery et migration |
| 4 | P3-PLANNING-001E — Planning Internal Access | ouvrir une seule frontière applicative interne sur la source certifiée | services internes Commands et Queries, Timeline dérivée et qualifications d'absence, sans transport public |
| 5 | P3-PLANNING-001F — Planning Work Integration | associer Work à la lecture Planning sans transfert d'ownership | port interne Work, quatre états, provenance et non-régression Progress/Work |
| 6 | P3-PLANNING-001G — Planning Foundation Certification | certifier l'ensemble de P3-PLANNING-001 | audit consolidé du contrat, des preuves et régressions ; décision de clôture et d'ouverture éventuelle d'Actions |

### 16.2 Justification Planning spécifique

Cette séquence n'est pas une copie de PEOPLE : Planning n'a qu'une racine par Work, exige une validation globale de versions, un graphe acyclique, un Schedule et une Timeline dérivée. Commands et Queries sont réunies dans un seul sous-lot d'accès interne après persistence parce qu'elles partagent la même frontière canonique et qu'aucune dépendance métier n'impose deux admissions successives. La séparation modèle → autorité → persistence reste nécessaire pour ne pas persister une sémantique non acceptée, puis l'intégration Work attend des écritures et lectures internes stables.

Aucun sous-lot ne commence automatiquement. P3-PLANNING-001B n'est qu'autorisable après admission officielle de ce contrat.

### 16.3 Règle d'ordre

Chaque sous-lot dépend du GO du précédent. Il ne crée aucun artefact du sous-lot suivant. Une exception exige une nouvelle décision de gouvernance et ne peut affaiblir les gates du présent contrat.

## 17. ENTRY AND EXIT GATES

### 17.1 Règles communes

Chaque sous-lot exige une mission distincte, le lot précédent certifié, un périmètre et une liste exacte de fichiers, des tests définis avant modification, un rapport unique, aucune régression et une décision explicite sur le suivant. Aucun Frontend, BFF, API, transport ou domaine suivant n'est admis.

### 17.2 Gates par sous-lot

| Sous-lot | Critères d'entrée | Fichiers autorisés à fixer dans la mission | Critères de sortie |
|---|---|---|---|
| P3-PLANNING-001B | P3-PLANNING-001A CERTIFIED ; blueprint et contrat inchangés ; source métier non substituée | uniquement futur noyau interne Planning et tests ciblés ; liste exacte obligatoire | un agrégat par Work, versions, entités, Value Objects, graphe, Schedule, Priority, Constraint et erreurs conformes ; aucun producteur, stockage, Work ou transport ; tests ciblés et non-régressions applicables PASS ; rapport GO |
| P3-PLANNING-001C | P3-PLANNING-001B CERTIFIED ; modèle certifié | uniquement Planning Authority interne, Commands/Events métier au niveau autorité et tests ; liste exacte obligatoire | producteur unique ; Establish/Revise/Withdraw ; validation globale ; provenance, causalité et ordre événementiel ; MilestoneReached non émissible ; aucun stockage/Work/API ; validations PASS ; rapport GO |
| P3-PLANNING-001D | P3-PLANNING-001C CERTIFIED ; nécessité de persistence reconfirmée | uniquement ports/adaptateur de persistence Planning, migration/recovery internes et tests ; liste exacte obligatoire | source durable unique ; courant et histoire atomiques ; CAS, idempotence, recovery et migration ; aucune copie Work/Progress/Timeline ; validations PASS ; rapport GO |
| P3-PLANNING-001E | P3-PLANNING-001D CERTIFIED ; source durable stable | uniquement accès applicatif interne Planning, Timeline reconstructible et tests ; liste exacte obligatoire | Commands routées vers Authority puis source canonique ; cinq Queries read-only ; absences qualifiées ; aucune règle consommatrice ni transport public ; validations PASS ; rapport GO |
| P3-PLANNING-001F | P3-PLANNING-001E CERTIFIED ; accès interne stable | uniquement intégration interne Work/Planning indispensable et tests ; aucun Frontend/BFF/API | Work lit Planning par WorkReference ; quatre états ; aucun agrégat ou store miroir ; Objective/Lifecycle/Progress inchangés ; provenance et non-régressions démontrées ; rapport GO |
| P3-PLANNING-001G | P3-PLANNING-001F CERTIFIED ; rapports B à F disponibles | uniquement rapport/certification Planning et corrections indispensables préalablement autorisées | conformité complète blueprint/contrat ; ownership unique ; tests Planning, Work, PEOPLE, Runtime/Core applicables et typechecks PASS ; aucune régression ; décision de clôture P3-PLANNING-001 et d'ouverture éventuelle d'Actions |

### 17.3 Entry gate du présent lot

| Condition | Résultat |
|---|---|
| WP-002 Planning certifié | PASS |
| P3-PEOPLE-001 certifié et Planning ouvert en gouvernance | PASS |
| Identifiants P3-PLANNING-001 et 001A décidés par l'autorité projet | PASS |
| Sources Work et Phase 2 cohérentes | PASS |
| Mission documentaire sans implémentation | PASS |

### 17.4 Exit gate du présent lot

| Contrôle P3-PLANNING-001A | Résultat |
|---|---|
| Ownership Planning unique et Planning Authority identifiable | PASS |
| Un agrégat et source future uniques | PASS |
| Relation Planning/Work déterministe | PASS |
| Planning/Progress séparés | PASS |
| Timeline non autoritative | PASS |
| primitives, Commands, Events et Queries définissables | PASS |
| inconnues non inventées et non bloquantes | PASS |
| persistence requise et séquencée avant opérations | PASS |
| Test Contract déterministe | PASS |
| séquence B à G justifiée et gouvernable | PASS |
| admission CEREBRAU générique possible | PASS |
| implémentation fonctionnelle réalisée | NONE |

### 17.5 NO GO

Tout sous-lot retourne NO GO si l'ownership devient ambigu, si une source concurrente est nécessaire, si Progress ou une donnée technique produit du Planning, si Timeline devient autoritative, si une référence externe est copiée comme propriété, si un invariant est affaibli, si les fichiers autorisés sont dépassés ou si une validation obligatoire échoue.

### 17.6 Décision et lot suivant

**VERDICT : GO**

**NEXT AUTHORIZABLE LOT AFTER REGISTRY ADMISSION: P3-PLANNING-001B — Planning Foundation Model**

Ce lot n'est pas commencé par le présent contrat.
