# PLANNING DOMAIN BLUEPRINT

## 1. Définition métier

Le domaine **Planning** définit l'organisation temporelle et séquentielle autoritative d'un Work.

Un Planning exprime :

- ce qui doit être atteint dans le temps ;
- dans quel ordre les éléments planifiés doivent être considérés ;
- quelles dépendances conditionnent leur déroulement ;
- quelles contraintes bornent le plan ;
- quels jalons rendent l'avancement planifié observable.

Planning ne décrit pas ce qui s'est techniquement exécuté. Il établit une intention métier explicite, distincte de la progression observée, des événements Runtime et des dates techniques.

Dans la cible définie par `WORK_DOMAIN_BLUEPRINT.md`, Planning devient le propriétaire de toute sémantique de plan rattachée au Work. Tant qu'un producteur Planning autoritatif n'est pas certifié, l'absence de Planning reste l'état réel et aucune valeur de remplacement n'est admise.

## 2. Frontières

### Appartient à Planning

- le plan métier courant ;
- les versions métier successives du plan ;
- les Phases ;
- les Milestones ;
- les dépendances planifiées ;
- le Schedule métier ;
- les priorités de planification ;
- les contraintes explicites ;
- les repères temporels métier ;
- la provenance de chaque décision de planification.

### N'appartient pas à Planning

- l'identité, l'objectif, le cycle de vie et la progression observée du Work ;
- l'exécution technique d'une Mission ;
- les files d'attente, schedulers, timers et délais techniques ;
- les Actions et leur résultat ;
- les Decisions qui autorisent ou refusent un choix ;
- les Affectations People ;
- la production des Deliverables ;
- les recommandations Intelligence ;
- les scores Confidence ;
- les timelines d'événements, journaux et traces Runtime.

Les éléments suivants ne constituent jamais, à eux seuls, une donnée Planning :

- `createdAt` ou `updatedAt` ;
- un timestamp d'événement ;
- l'ordre d'insertion dans une file ;
- une progression Monitoring ;
- une position d'affichage ;
- une fixture ou une donnée simulée ;
- une convention implicite.

## 3. Responsabilités

Planning est responsable de :

1. rattacher un plan autoritatif à un Work identifié ;
2. maintenir un seul plan courant pour ce Work ;
3. définir les Phases, Milestones, dépendances, priorités et contraintes qui composent le plan ;
4. conserver l'ordre et les repères temporels explicitement décidés ;
5. distinguer une date métier d'une date technique ;
6. rendre toute révision du plan explicite et traçable ;
7. préserver l'historique des plans remplacés ;
8. signaler l'absence de plan ou d'information plutôt que la compenser ;
9. fournir aux autres domaines des repères planifiés sans absorber leurs objets.

Planning n'est pas responsable de :

- décider si une Action a réellement été exécutée ;
- calculer la progression du Work ;
- déterminer la confiance dans le plan ;
- affecter une Personne ;
- prendre une décision d'arbitrage ;
- produire une recommandation ;
- certifier un résultat.

## 4. Agrégats

### Agrégat Planning

La racine d'agrégat est le **Planning d'un Work**.

Elle garantit la cohérence entre :

- le Work concerné ;
- le plan courant ;
- sa période de validité ;
- ses Phases ;
- ses Milestones ;
- ses dépendances ;
- son Schedule ;
- ses priorités ;
- ses contraintes ;
- sa provenance ;
- ses versions antérieures.

Un Work admis dans le domaine Planning possède au plus un Planning courant. Une révision remplace explicitement la version courante sans effacer les versions antérieures.

### Entités et objets conceptuels internes

- une **Phase** structure une portion cohérente du plan ;
- un **Milestone** représente un point de contrôle métier sans durée propre ;
- une **Dependency** exprime une relation de prérequis explicite ;
- un **Schedule** porte les repères temporels métier du plan ;
- une **Priority** exprime un ordre d'importance dans un périmètre défini ;
- une **Constraint** borne ce qui est admissible dans le plan ;
- une **Timeline** ordonne la représentation temporelle des éléments du Planning.

Timeline et Schedule sont des composantes du même agrégat. Ils ne sont pas des sources de vérité concurrentes.

## 5. Concepts

### Planning

Ensemble cohérent et autoritatif des intentions temporelles, séquentielles et contraignantes applicables à un Work.

### Timeline

Représentation ordonnée des éléments temporels du Planning. Elle expose les repères déjà portés par le plan et n'invente ni date, ni événement, ni causalité.

### Milestone

Point métier significatif permettant de constater qu'une condition ou un résultat planifié a été atteint. Un Milestone ne possède pas de durée implicite.

### Phase

Regroupement cohérent d'éléments planifiés partageant une finalité ou une période métier. Une Phase n'est ni un statut Work, ni un état Runtime.

### Dependency

Relation orientée selon laquelle un élément planifié dépend explicitement d'un autre. Une dépendance ne peut pas être déduite d'un ordre d'affichage ou d'une proximité temporelle.

### Schedule

Ensemble des dates, périodes et séquences métier explicitement retenues pour le Planning. Toute valeur temporelle du Schedule possède une signification métier et une provenance.

### Priority

Qualification explicite de l'importance relative d'un élément dans un périmètre de planification donné. Une priorité n'est ni un ordre d'exécution technique, ni une recommandation Intelligence.

### Constraint

Condition explicite que le Planning doit respecter. Une contrainte possède une source, une portée et une période d'effet ; elle n'est jamais déduite d'une limitation technique.

## 6. Relations

| Domaine | Relation | Qualification | Frontière |
|---|---|---|---|
| Work | Le Planning est rattaché à exactement un Work. | Obligatoire pour tout Planning ; future dans Work jusqu'au producteur certifié | Work possède identité, Objective, Lifecycle et Progress ; Planning possède le plan. |
| Objective | Le Planning organise la poursuite de l'objectif autoritatif. | Obligatoire en lecture | Planning ne reformule et ne remplace jamais l'Objective. |
| Lifecycle | Le cycle Work fournit un contexte d'état. | Optionnelle en lecture | Un état Work ne devient pas une Phase. |
| Progress | La progression peut être comparée au plan. | Optionnelle en lecture | Progress n'est jamais calculé par Planning et ne crée aucune échéance. |
| People | Des Participants peuvent être associés à des responsabilités planifiées. | Future et optionnelle | People possède identités, rôles et Affectations ; Planning ne crée aucun acteur. |
| Actions | Des Actions peuvent réaliser des éléments planifiés. | Future et optionnelle | Actions possède leur statut et leur résultat ; Planning ne déclare pas leur exécution. |
| Deliverables | Un Milestone peut référencer un livrable attendu. | Optionnelle | Deliverables possède les livrables réellement produits. |
| Decisions | Une décision peut autoriser une révision ou un arbitrage du plan. | Optionnelle | Decisions possède l'acte de décision ; Planning en applique seulement l'effet planifié explicitement accepté. |
| Intelligence | Une recommandation peut proposer une évolution du plan. | Future et optionnelle | Une recommandation ne modifie jamais le Planning sans décision métier explicite. |
| Confidence | Une mesure peut qualifier la confiance accordée au plan. | Future et optionnelle | Confidence possède la mesure ; Planning ne la calcule pas. |
| Synthesis | Une synthèse peut présenter les repères du plan. | Future et optionnelle en lecture | Synthesis ne devient pas une source Planning. |
| Runtime | Aucune relation de propriété. | Interdite comme source implicite | Queue, scheduler, timer et timestamp techniques ne produisent pas le Planning. |

## 7. Invariants

1. Tout Planning est rattaché à exactement un Work autoritatif.
2. Un Work possède au plus un Planning courant.
3. Un Planning courant possède une provenance explicite.
4. Toute date Planning possède une signification métier démontrée.
5. Aucun timestamp technique ne devient une date Planning.
6. Une Timeline reflète le Planning ; elle ne constitue pas une seconde source.
7. Un Milestone est un point métier explicite et ne possède aucune durée implicite.
8. Une Phase n'est ni un état Work, ni un état Runtime.
9. Toute Dependency est explicite, orientée et rattachée à des éléments identifiés.
10. Le graphe des dépendances Planning ne contient aucun cycle.
11. Une Priority n'existe que dans un périmètre de comparaison explicite.
12. Aucune priorité par défaut n'est inventée.
13. Toute Constraint possède une source, une portée et une période d'effet.
14. Une révision du Planning ne réécrit pas son histoire.
15. Progress et Planning restent deux vérités distinctes : observé pour l'un, planifié pour l'autre.
16. L'absence de Planning, l'absence d'une valeur dans un Planning et l'indisponibilité du producteur sont trois situations distinctes.
17. Une recommandation Intelligence ne modifie pas le Planning sans décision métier explicite.
18. Une projection, une interface ou une fixture ne peut devenir source Planning.
19. Planning ne produit ni Action exécutée, ni Deliverable, ni Decision.
20. Toute association externe conserve la propriété de son domaine d'origine.

## 8. Événements métier

| Événement | Signification |
|---|---|
| `PlanningEstablished` | Le premier Planning autoritatif d'un Work devient courant. |
| `PlanningRevised` | Une nouvelle version métier remplace explicitement le plan courant. |
| `PlanningWithdrawn` | Le plan courant cesse d'être applicable sans être remplacé. |
| `PhaseAdded` | Une Phase est introduite dans le Planning. |
| `PhaseChanged` | La définition ou les repères métier d'une Phase évoluent. |
| `PhaseRemoved` | Une Phase cesse d'appartenir au plan courant sans être effacée de l'histoire. |
| `MilestoneScheduled` | Un Milestone et ses repères métier sont introduits. |
| `MilestoneChanged` | Un Milestone planifié est révisé explicitement. |
| `MilestoneReached` | L'atteinte métier du Milestone est constatée par une source autorisée. |
| `DependencyDeclared` | Une dépendance explicite est ajoutée au Planning. |
| `DependencyRemoved` | Une dépendance cesse de s'appliquer. |
| `ConstraintDeclared` | Une contrainte métier devient applicable au Planning. |
| `ConstraintReleased` | Une contrainte cesse de produire effet. |
| `ScheduleChanged` | Les repères temporels métier du Planning sont révisés. |
| `PriorityChanged` | La priorité explicite d'un élément évolue dans son périmètre. |

Ces événements expriment des faits métier conceptuels. Ils ne prescrivent aucun mécanisme d'exécution.

## 9. Glossaire

| Terme | Définition officielle |
|---|---|
| Planning | Organisation métier autoritative du temps, de la séquence et des contraintes d'un Work. |
| Plan courant | Version du Planning actuellement applicable au Work. |
| Timeline | Représentation temporelle ordonnée des éléments déjà définis par le Planning. |
| Milestone | Point de contrôle métier sans durée implicite. |
| Phase | Regroupement cohérent d'éléments planifiés. |
| Dependency | Relation de prérequis explicite entre deux éléments planifiés. |
| Schedule | Ensemble des repères temporels métier du Planning. |
| Priority | Importance relative explicite d'un élément dans un périmètre donné. |
| Constraint | Condition sourcée que le Planning doit respecter. |
| Révision | Remplacement explicite du plan courant par une nouvelle version historisée. |
| Date métier | Repère temporel dont la signification appartient au domaine Planning. |

## 10. Décisions d'architecture

### WP002-ADR-001 — Planning possède toute sémantique de plan

Phases, Milestones, dépendances, échéances, priorités et contraintes appartiennent exclusivement à Planning. Cette décision empêche leur déduction depuis Work, Monitoring ou Runtime.

### WP002-ADR-002 — Un seul plan courant

Un Work possède au plus un Planning courant. Les versions antérieures sont historiques, jamais concurrentes.

### WP002-ADR-003 — Timeline est une représentation

Timeline reflète le Schedule et les éléments du Planning. Elle n'est pas un agrégat autoritatif parallèle.

### WP002-ADR-004 — Progress et Planning restent séparés

Progress décrit l'avancement observé ; Planning décrit l'intention. Aucun des deux n'est dérivé automatiquement de l'autre.

### WP002-ADR-005 — Les mécaniques techniques ne sont pas métier

Queues, schedulers, timers, timestamps et ordres d'exécution restent hors Planning tant qu'une décision métier ne les qualifie pas explicitement.

### WP002-ADR-006 — Les associations préservent les propriétaires

Planning peut référencer People, Actions, Deliverables, Decisions, Intelligence et Confidence sans absorber leurs objets.

### WP002-ADR-007 — Aucun producteur de remplacement

Le blueprint définit le métier mais ne transforme aucune source Phase 1 en producteur Planning. Une future admission exigera une source autoritative, une relation Work déterministe et une provenance certifiée.

## 11. Évolutions futures

Les évolutions futures pourront préciser :

- les catégories de Phases ;
- les catégories de Milestones ;
- le vocabulaire de priorité ;
- les catégories de contraintes ;
- les règles de révision et de clôture ;
- les relations détaillées avec Actions et People ;
- les règles métier d'atteinte d'un Milestone ;
- la comparaison entre prévu et observé.

Elles devront :

- préserver l'unicité du Planning courant ;
- conserver la distinction entre planifié et observé ;
- ne jamais promouvoir une date technique en date métier ;
- ne pas imposer de valeur par défaut ;
- établir le producteur et la provenance de chaque primitive ;
- rester compatibles avec les Works sans Planning ;
- ne créer aucune seconde source de vérité.

**Décision WP-002 : GO — blueprint métier Planning défini, sans autorisation d'implémentation.**
