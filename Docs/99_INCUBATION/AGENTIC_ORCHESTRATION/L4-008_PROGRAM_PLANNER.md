# L4-008 - Program Planner

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : L4-008

Objet : Program Planner comme surface de pilotage du futur Planning Engine

Contrainte : pas de maquette, pas de composant React, pas d'algorithme de planification

---

# 1. Objet

Ce document definit le `Program Planner` de l'ORCHESTRATOR.

Le `Program Planner` est la surface de pilotage conceptuelle permettant a un Directeur de Programme de lire, organiser, arbitrer et simuler la trajectoire d'un Programme.

Il prepare le futur `Planning Engine` sans en definir l'implementation.

Il doit permettre de repondre immediatement aux questions suivantes :

- quelle est la trajectoire du Programme ;
- quels jalons structurent cette trajectoire ;
- quels objectifs metier sont vises ;
- quelle capacite est disponible ou saturee ;
- quelles dependances menacent la trajectoire ;
- quels arbitrages sont necessaires ;
- quelles simulations peuvent eclairer une decision ;
- quels impacts une modification produit sur les projets, missions, jalons et objectifs ;
- quelles decisions ont ete prises pour ajuster la roadmap.

---

# 2. Sources de verite

Le `Program Planner` respecte :

1. `ORCHESTRATOR_PROGRAM_PLANNING_MODEL_V1.md`
2. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
3. `ORCHESTRATOR_STATE_MODEL_V1.md`
4. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
5. `ORCHESTRATOR_API_SURFACE_V1.md`
6. `ORCHESTRATOR_INFORMATION_ARCHITECTURE_V1.md`
7. `ORCHESTRATOR_EVENT_ARCHITECTURE_V1.md`
8. `ORCHESTRATION_GOVERNANCE.md`

Le `Program Planner` ne cree aucun concept supplementaire hors du Program Planning Model.

Il ne remplace pas le Directeur de Programme.

Il ne decide pas seul.

---

# 3. Definition

## 3.1 Ce que le Program Planner est

Le `Program Planner` est :

- une surface de lecture programme ;
- un centre de pilotage de roadmap ;
- un espace d'arbitrage capacitaire ;
- un analyseur de dependances ;
- une console de simulation prospective ;
- un point de convergence entre objectifs, jalons, projets, missions et decisions ;
- une preparation fonctionnelle du futur `Planning Engine`.

## 3.2 Ce que le Program Planner n'est pas

Le `Program Planner` n'est pas :

- un outil de gestion de taches ;
- un calendrier graphique ;
- un remplacement du `Mission Workspace` ;
- une liste passive de missions ;
- un moteur d'execution ;
- un systeme de decision autonome ;
- une implementation du `Planning Engine` ;
- une maquette graphique.

---

# 4. Role operationnel

Le `Program Planner` concentre six fonctions.

| Fonction | Objectif |
| --- | --- |
| Lire la trajectoire | Rendre visible la roadmap, les releases, les jalons et les objectifs |
| Controler l'alignement | Relier chaque projet et mission a un objectif ou a un jalon |
| Surveiller la capacite | Exposer charge, disponibilite, saturation et ressources critiques |
| Anticiper les impacts | Identifier les effets d'un retard, d'un blocage ou d'un changement |
| Simuler | Comparer plusieurs scenarios avant decision |
| Arbitrer | Preparer les decisions de priorisation, report, reallocation ou reorientation |

---

# 5. Structure conceptuelle

Le `Program Planner` est organise en huit zones fonctionnelles.

| Zone | Role | Priorite |
| --- | --- | --- |
| Program Header | Identite programme, vision, etat de sante, phase courante | Primaire |
| Roadmap Board | Trajectoire vivante, releases, jalons, objectifs et dependances | Primaire |
| Milestone Tracker | Jalons, criteres d'atteinte, statut, risques et impacts | Primaire |
| Objective Map | Objectifs metier, valeur attendue, criteres de succes et contributions | Primaire |
| Capacity Panel | Capacite disponible, charge, saturation, agents et projets consommateurs | Primaire |
| Simulation Lab | Scenarios prospectifs, hypotheses, impacts et comparaison | Secondaire par defaut |
| Decision Hub | Decisions a prendre, arbitrages proposes, autorites requises | Primaire si actif |
| Evidence Timeline | Evenements, changements, validations et traces d'arbitrage | Tertiaire par defaut |

Regle :

Une zone secondaire peut devenir primaire si l'etat du Programme l'exige.

Exemples :

- si un jalon est menace, `Milestone Tracker` devient prioritaire ;
- si une saturation capacitaire est detectee, `Capacity Panel` devient prioritaire ;
- si une decision est requise, `Decision Hub` devient prioritaire ;
- si une simulation est lancee, `Simulation Lab` devient prioritaire ;
- si une contestation survient, `Evidence Timeline` devient prioritaire.

---

# 6. Program Header

## 6.1 Informations obligatoires

Le header programme affiche conceptuellement :

- `program_id` ;
- nom du Programme ;
- vision rattachee ;
- phase courante ;
- etat de sante programme ;
- nombre de projets actifs ;
- nombre de missions actives ;
- jalon le plus proche ;
- objectif principal courant ;
- risque principal ;
- decision attendue si applicable.

## 6.2 Responsabilite

Le header donne une lecture immediate de la situation programme.

Il ne doit pas masquer les tensions.

Il doit rendre visibles :

- une trajectoire nominale ;
- une trajectoire degradee ;
- une saturation ;
- une dependance bloquante ;
- une decision en attente ;
- un ecart entre roadmap et capacite.

---

# 7. Roadmap Board

## 7.1 Definition

Le `Roadmap Board` represente la roadmap vivante du Programme.

Il ne s'agit pas d'un planning fige.

Il exprime une trajectoire gouvernee reliant :

- vision ;
- programme ;
- releases ;
- milestones ;
- objectives ;
- projects ;
- missions ;
- decisions ;
- risques ;
- dependances.

## 7.2 Contenu obligatoire

Une roadmap affiche conceptuellement :

- les releases planifiees ;
- les milestones rattaches ;
- les objectifs servis ;
- les projets contributeurs ;
- les missions critiques ;
- les dependances entrantes ;
- les dependances sortantes ;
- les risques actifs ;
- les decisions structurantes ;
- les hypotheses ouvertes.

## 7.3 Etats de roadmap

Une roadmap peut etre lue selon les etats conceptuels suivants :

| Etat | Signification |
| --- | --- |
| `ON_TRACK` | La trajectoire reste compatible avec les objectifs |
| `AT_RISK` | Un risque menace un jalon, un objectif ou une capacite |
| `BLOCKED` | Une dependance ou decision empeche la progression |
| `REPLAN_REQUIRED` | Une replanification explicite est necessaire |
| `SIMULATION_REQUIRED` | Une decision exige une comparaison de scenarios |
| `DECISION_REQUIRED` | Une autorite doit arbitrer |

Ces etats ne remplacent pas les etats canoniques de Mission.

Ils donnent une lecture programme.

---

# 8. Milestone Tracker

## 8.1 Definition

Un `Milestone` est un point de controle significatif dans la trajectoire du Programme.

Il marque une etape mesurable.

Il doit etre rattache a des criteres d'atteinte.

## 8.2 Informations obligatoires

Un milestone contient conceptuellement :

- `milestone_id` ;
- titre ;
- objectif rattache ;
- release rattachee si applicable ;
- projets contributeurs ;
- missions contributrices ;
- criteres d'atteinte ;
- dependances critiques ;
- risques actifs ;
- statut ;
- impact si retard ;
- decision requise si applicable.

## 8.3 Statuts conceptuels

| Statut | Signification |
| --- | --- |
| `PLANNED` | Le jalon est defini mais non engage |
| `IN_PROGRESS` | Des travaux contributeurs sont actifs |
| `AT_RISK` | Le jalon peut ne pas etre atteint |
| `BLOCKED` | Le jalon ne peut pas progresser sans resolution |
| `ACHIEVED` | Les criteres d'atteinte sont satisfaits |
| `CANCELLED` | Le jalon est annule par decision gouvernee |

## 8.4 Regles

Un milestone ne doit jamais etre considere atteint par simple avancement de taches.

Il est atteint uniquement lorsque ses criteres d'atteinte sont satisfaits.

Un milestone menace doit exposer :

- la cause ;
- les dependances touchees ;
- les objectifs affectes ;
- les scenarios possibles ;
- l'autorite attendue.

---

# 9. Objective Map

## 9.1 Definition

L'`Objective Map` relie la roadmap a la valeur attendue.

Elle empeche le Programme de devenir une succession d'activites sans finalite.

## 9.2 Informations obligatoires

Un objectif contient conceptuellement :

- `objective_id` ;
- titre ;
- valeur attendue ;
- criteres de succes ;
- programme rattache ;
- milestones contributeurs ;
- projets contributeurs ;
- missions contributrices ;
- indicateurs de progression ;
- risques de non atteinte ;
- decisions associees.

## 9.3 Lecture de progression

La progression d'un objectif ne doit pas etre calculee uniquement par volume de missions terminees.

Elle doit tenir compte :

- de la valeur livree ;
- de la qualite des livrables ;
- des validations obtenues ;
- des dependances restantes ;
- des risques ouverts ;
- de la stabilite documentaire ;
- des decisions non tranchees.

---

# 10. Capacity Panel

## 10.1 Definition

Le `Capacity Panel` rend visible la capacite disponible et la charge consommee par le Programme.

Il prepare les arbitrages de priorisation et de reallocation.

## 10.2 Capacite

La capacite represente ce que le systeme peut raisonnablement absorber.

Elle peut concerner :

- agents ;
- roles ;
- experts humains ;
- projets ;
- jalons ;
- temps de validation ;
- temps de review ;
- temps de decision ;
- fenetres de release.

## 10.3 Charge

La charge represente ce qui consomme la capacite.

Elle peut provenir :

- des missions actives ;
- des validations en attente ;
- des blocages a traiter ;
- des dependances a resoudre ;
- des simulations a produire ;
- des decisions a arbitrer ;
- des corrections de qualite ;
- de la dette documentaire.

## 10.4 Saturation

Une saturation existe lorsqu'une capacite critique ne permet plus de tenir la trajectoire.

Le `Capacity Panel` doit exposer :

- la capacite saturee ;
- les projets consommateurs ;
- les missions concernees ;
- les milestones menaces ;
- les objectifs impactes ;
- les options d'arbitrage.

## 10.5 Arbitrages capacitaires

Les arbitrages capacitaires possibles incluent :

- reordonner des missions ;
- retarder un jalon ;
- reduire le perimetre d'une release ;
- renforcer une capacite ;
- bloquer une nouvelle mission ;
- suspendre une trajectoire non prioritaire ;
- lancer une simulation avant decision.

---

# 11. Simulation Lab

## 11.1 Definition

Le `Simulation Lab` est une capacite conceptuelle permettant d'explorer les consequences possibles d'un changement avant de l'appliquer.

Il ne modifie pas la roadmap de production.

Il produit une lecture d'impact.

## 11.2 Scenarios supportes

Le `Simulation Lab` doit pouvoir representer conceptuellement :

- retard d'une mission ;
- blocage d'un projet ;
- indisponibilite d'un agent ;
- saturation d'une capacite ;
- changement de priorite ;
- ajout d'un objectif ;
- retrait d'un objectif ;
- report d'un milestone ;
- modification d'une dependance ;
- reduction d'une release.

## 11.3 Entrees conceptuelles

Une simulation peut recevoir :

- roadmap courante ;
- milestones ;
- objectifs ;
- projets ;
- missions ;
- dependances ;
- capacites ;
- risques ;
- hypotheses ;
- decision candidate.

## 11.4 Sorties conceptuelles

Une simulation peut produire :

- scenario compare ;
- jalons impactes ;
- objectifs impactes ;
- projets impactes ;
- missions impactees ;
- dependances nouvelles ou aggravees ;
- capacite liberee ou consommee ;
- risques ajoutes ;
- risques reduits ;
- decisions recommandees a l'arbitrage.

## 11.5 Limites

Une simulation ne doit pas :

- appliquer une decision ;
- modifier un etat canonique ;
- modifier une roadmap de production ;
- remplacer une validation humaine ;
- masquer ses hypotheses ;
- produire une certitude ;
- executer une mission.

---

# 12. Decision Hub

## 12.1 Definition

Le `Decision Hub` prepare les arbitrages programme.

Il rassemble les decisions qui conditionnent la roadmap, les milestones, les objectifs, la capacite ou les simulations.

## 12.2 Decisions supportees

Le `Program Planner` peut aider a preparer les decisions suivantes :

- confirmer une roadmap ;
- ajuster une roadmap ;
- reordonner des priorites ;
- repousser un milestone ;
- annuler un milestone ;
- renforcer une capacite ;
- suspendre une mission ;
- lancer une simulation ;
- accepter un risque ;
- escalader une dependance ;
- reduire le perimetre d'une release.

## 12.3 Autorite

Toute decision structurante doit afficher :

- l'autorite attendue ;
- le motif ;
- les options ;
- les impacts ;
- les preuves ;
- l'evenement de decision produit apres arbitrage.

---

# 13. Evidence Timeline

## 13.1 Definition

L'`Evidence Timeline` trace les evenements qui expliquent la trajectoire programme.

Elle donne la preuve des changements de roadmap, des arbitrages, des simulations et des validations.

## 13.2 Evenements visibles

La timeline peut exposer :

- creation de roadmap ;
- ajout de milestone ;
- modification de milestone ;
- ajout d'objectif ;
- changement de priorite ;
- detection de saturation ;
- lancement de simulation ;
- resultat de simulation ;
- decision d'arbitrage ;
- validation de milestone ;
- cloture d'objectif ;
- replanification.

---

# 14. Relation avec le futur Planning Engine

## 14.1 Positionnement

Le `Program Planner` est la surface de pilotage.

Le futur `Planning Engine` sera la capacite de calcul, d'analyse et de recommandation qui pourra alimenter cette surface.

Ce document definit la surface attendue et les objets manipules.

Il ne definit pas :

- les algorithmes ;
- les modeles de donnees physiques ;
- les endpoints ;
- les composants front-end ;
- les librairies ;
- les schemas SQL ;
- les heuristiques de calcul.

## 14.2 Responsabilites futures du Planning Engine

Le futur `Planning Engine` pourra conceptuellement :

- analyser une roadmap ;
- detecter les tensions capacitaires ;
- evaluer les impacts d'un retard ;
- comparer plusieurs scenarios ;
- identifier les milestones menaces ;
- identifier les objectifs menaces ;
- preparer des options d'arbitrage ;
- produire une lecture de sante programme ;
- alimenter la trace d'audit par evenements.

## 14.3 Limites futures du Planning Engine

Le futur `Planning Engine` ne devra pas :

- decider a la place de l'autorite humaine ;
- contourner la gouvernance ;
- modifier la roadmap sans decision ;
- masquer les hypotheses ;
- creer des missions hors perimetre ;
- replanifier automatiquement une mission verrouillee ;
- ignorer les etats canoniques du Runtime.

---

# 15. Regles d'or

1. Le `Program Planner` pilote une trajectoire, pas une liste de taches.
2. La roadmap est vivante mais gouvernee.
3. Un milestone est atteint par criteres, pas par impression d'avancement.
4. Un objectif mesure de la valeur, pas seulement du volume.
5. La capacite est une contrainte de pilotage, pas une information secondaire.
6. Une saturation doit etre visible avant de devenir un blocage.
7. Une simulation n'est jamais une decision.
8. Une simulation doit toujours exposer ses hypotheses.
9. Une decision structurante doit produire une trace.
10. Le futur `Planning Engine` soutient l'arbitrage, il ne remplace pas l'autorite.

---

# 16. Criteres d'acceptation

La mission `L4-008` est complete lorsque le document definit :

- le role du `Program Planner` ;
- son lien avec le futur `Planning Engine` ;
- la structure conceptuelle de la roadmap ;
- la gestion des milestones ;
- la gestion des objectifs ;
- la lecture de capacite ;
- la capacite de simulation ;
- le hub de decision ;
- les limites de responsabilite ;
- les regles d'or.

Le document est acceptable uniquement si :

- il ne definit aucune implementation ;
- il ne cree aucun composant React ;
- il ne cree aucun schema SQL ;
- il ne cree aucun endpoint ;
- il ne modifie aucune regle de gouvernance ;
- il reste coherent avec `ORCHESTRATOR_PROGRAM_PLANNING_MODEL_V1.md`.

---

# 17. Exclusions

Sont exclus de `L4-008` :

- maquette UI ;
- design graphique ;
- code front-end ;
- code back-end ;
- schema de base de donnees ;
- API ;
- algorithme de planification ;
- moteur de scoring ;
- migration ;
- integration runtime ;
- automatisation de decision.

---

# 18. Conclusion

Le `Program Planner` donne a l'ORCHESTRATOR une surface de pilotage programme lisible et gouvernee.

Il relie roadmap, milestones, objectifs, capacite, simulation et decisions dans une meme logique de pilotage.

Il constitue la definition fonctionnelle preparatoire du futur `Planning Engine`, sans engager d'implementation.
