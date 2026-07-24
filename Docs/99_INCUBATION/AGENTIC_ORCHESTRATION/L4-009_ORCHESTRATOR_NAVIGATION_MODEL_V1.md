# L4-009 - ORCHESTRATOR NAVIGATION MODEL V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : ORCH-UX-L4-009

Agent : Information Architecture & Navigation Architect

Objet : Modele de navigation global ORCHESTRATOR V1

Contrainte : pas de maquette, pas de wireframe, pas de composant React, pas d'implementation

---

# 1. Objet

Ce document definit le modele de navigation global de l'ORCHESTRATOR V1.

Il explique comment un Directeur de Programme, un Architecte, un Orchestrator, un Product Owner, un Validator ou un Agent passe d'un espace fonctionnel L4 a un autre sans perdre le contexte courant.

Il constitue la reference officielle de navigation pour les espaces :

- `Mission Control`
- `Project Workspace`
- `Mission Workspace`
- `Decision Center`
- `Agent Control Center`
- `Knowledge Center`
- `Runtime Observatory`
- `Program Planner`
- `Life Hub`

Ce document ne definit aucune interface graphique.

Il ne definit aucun composant, aucune API, aucun code et aucune implementation.

Il definit uniquement la logique de navigation.

---

# 2. Sources de verite

Le modele de navigation respecte :

1. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
2. `ORCHESTRATOR_STATE_MODEL_V1.md`
3. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
4. `ORCHESTRATOR_INFORMATION_ARCHITECTURE_V1.md`
5. `ORCHESTRATOR_COGNITIVE_ERGONOMICS_V1.md`
6. `L4-001 - Mission Control`
7. `L4-002 - Project Workspace`
8. `L4-003 - Mission Workspace`
9. `L4-004 - Decision Center`
10. `L4-005 - Agent Control Center`
11. `L4-006 - Knowledge Center`
12. `L4-007 - Runtime Observatory`
13. `L4-008 - Program Planner`
14. `ORCHESTRATION_GOVERNANCE.md`

Le modele de navigation ne cree aucun nouvel etat, role, evenement, commande, autorite ou regle metier.

---

# 3. Principes de navigation

## 3.1 Une seule source de contexte actif

A tout moment, la navigation possede un contexte actif principal.

Le contexte actif principal peut etre :

- un Programme ;
- un Projet ;
- une Mission ;
- une Decision ;
- un Agent ;
- un Verrou ;
- un Rapport ;
- une Validation ;
- un Evenement ;
- une Baseline ;
- un Document ;
- un RFC.

Un seul contexte principal pilote la lecture courante.

Les autres objets lies sont des contextes associes, pas des contextes concurrents.

## 3.2 Ne jamais perdre le contexte courant

Un changement de vue ne doit pas effacer :

- le Programme courant ;
- le Projet courant ;
- la Mission courante si elle existe ;
- la Decision courante si elle existe ;
- le filtre ou la cause de navigation ;
- le chemin de retour.

## 3.3 Trois changements de vue maximum

Une action importante ne doit jamais exiger plus de trois changements de vue depuis le contexte courant.

Exemples :

- depuis une mission, acceder a son verrou ;
- depuis une decision, acceder au rapport concerne ;
- depuis un projet, acceder a une mission bloquee ;
- depuis Mission Control, acceder a une validation humaine urgente.

## 3.4 Une decision est toujours accessible depuis son contexte

Toute decision doit etre accessible depuis :

- le Programme impacte ;
- le Projet impacte ;
- la Mission concernee si applicable ;
- le Rapport ou la Validation concernee si applicable ;
- le Runtime Observatory si la decision provient d'une anomalie Runtime.

## 3.5 Chaque objet possede un point d'entree unique

Chaque objet majeur possede un espace de reference :

| Objet | Point d'entree unique |
| --- | --- |
| Programme | `Program Planner` |
| Projet | `Project Workspace` |
| Mission | `Mission Workspace` |
| Decision | `Decision Center` |
| Agent | `Agent Control Center` |
| Document, baseline, RFC | `Knowledge Center` |
| Evenement, verrou, queue, run | `Runtime Observatory` |
| Rapport, validation | contexte de la Mission, avec detail contextuel |

Un objet peut etre accessible depuis plusieurs espaces, mais il doit toujours revenir vers son point d'entree unique.

## 3.6 Chaque chemin possede un retour explicite

Toute navigation contextuelle doit conserver un retour vers :

- la vue d'origine ;
- l'objet parent ;
- le dernier contexte decisionnel ;
- Mission Control si le contexte est perdu ou termine.

## 3.7 La navigation ne remplace pas la gouvernance

Une navigation peut exposer une action possible.

Elle ne doit jamais accorder une autorite absente, contourner un verrou, masquer un etat canonique ou transformer une validation en acceptation finale.

---

# 4. Navigation globale

## 4.1 Structure principale

La navigation globale suit une logique du portefeuille vers la preuve.

Structure conceptuelle :

| Espace source | Espaces accessibles directement | Intention |
| --- | --- | --- |
| `Mission Control` | `Program Planner`, `Project Workspace`, `Decision Center`, `Agent Control Center`, `Knowledge Center`, `Runtime Observatory` | Entrer dans la trajectoire, le projet, la decision, l'agent, la connaissance ou l'execution |
| `Program Planner` | `Project Workspace`, `Decision Center`, `Mission Workspace` | Relier roadmap, projets, missions et arbitrages |
| `Project Workspace` | `Mission Workspace`, `Decision Center`, `Agent Control Center`, `Knowledge Center`, `Runtime Observatory`, `Life Hub` | Piloter le projet et ses objets operationnels ou ouvrir la cible placeholder Life Hub |
| `Mission Workspace` | `Decision Center`, `Agent Control Center`, `Knowledge Center`, `Runtime Observatory`, details mission | Piloter la mission et consulter ses objets rattaches |
| `Decision Center` | `Mission Workspace`, `Program Planner`, `Project Workspace`, `Knowledge Center`, `Runtime Observatory` | Revenir au contexte et aux preuves d'une decision |
| `Agent Control Center` | `Mission Workspace`, `Runtime Observatory`, `Agent Detail` | Relier agents, missions et signaux d'execution |
| `Runtime Observatory` | `Mission Workspace`, `Project Workspace`, `Decision Center`, details Runtime | Relier signal Runtime, objet impacte et decision |
| `Knowledge Center` | `Mission Workspace`, `Project Workspace`, `Decision Center`, `Program Planner` | Relier document, baseline ou RFC a son usage |
| `Life Hub` | `Project Workspace` | Afficher une page placeholder sans donnees metier ni branchement operationnel |

## 4.2 Relations principales

| Relation | Sens | Role |
| --- | --- | --- |
| `Mission Control` vers `Program Planner` | portefeuille vers trajectoire | Comprendre la roadmap, les jalons, la capacite et les arbitrages programme |
| `Mission Control` vers `Project Workspace` | portefeuille vers projet | Lire l'etat d'un projet comme VEEDDA ou ORCHESTRATOR |
| `Mission Control` vers `Decision Center` | portefeuille vers decisions | Traiter les arbitrages et validations humaines prioritaires |
| `Mission Control` vers `Agent Control Center` | portefeuille vers agents | Comprendre charge, disponibilite et blocages agents |
| `Mission Control` vers `Runtime Observatory` | portefeuille vers execution | Investiguer sante Runtime, verrous, queues et evenements |
| `Project Workspace` vers `Mission Workspace` | projet vers mission | Piloter une mission dans son contexte projet |
| `Mission Workspace` vers details | mission vers objet | Inspecter rapport, validation, verrou, timeline ou preuve |
| `Decision Center` vers contexte source | decision vers origine | Comprendre et traiter une decision depuis ses preuves |
| `Knowledge Center` vers objet lie | connaissance vers usage | Relier document, baseline ou RFC aux missions et decisions |

## 4.3 Chemin nominal

Le chemin nominal de comprehension est :

Mission Control
> Program Planner
> Project Workspace
> Mission Workspace
> Report Detail
> Validation Detail
> Evidence

Le chemin nominal de decision est :

Mission Control
> Decision Center
> Decision Detail
> Mission Workspace ou Program Planner
> Evidence

Le chemin nominal d'investigation Runtime est :

Mission Control
> Runtime Observatory
> Event, Lock, Queue ou Run
> Mission Workspace
> Decision Center si arbitrage requis

---

# 5. Espaces permanents

Les espaces permanents doivent toujours etre accessibles depuis la navigation globale.

## 5.1 Mission Control

Role :

- donner l'etat du portefeuille ;
- exposer les decisions attendues ;
- remonter les risques ;
- afficher l'etat des programmes ;
- servir de retour universel.

Mission Control est l'espace de reprise par defaut lorsqu'aucun contexte plus precis n'est disponible.

## 5.2 Decision Center

Role :

- centraliser les decisions ouvertes ;
- separer validation humaine, arbitrage, requalification, revision et annulation ;
- fournir le chemin vers les preuves ;
- eviter les decisions dupliquees.

Toute decision actionnable doit etre visible depuis Decision Center.

## 5.3 Knowledge Center

Role :

- donner acces aux documents, baselines, RFC, decisions historiques et references ;
- relier une preuve documentaire a une mission, un projet ou un programme ;
- eviter la relecture hors contexte.

Le Knowledge Center ne doit pas devenir un stockage documentaire deconnecte des objets operationnels.

## 5.4 Notifications

Role :

- signaler les changements significatifs ;
- remonter les decisions urgentes ;
- signaler les blocages, validations, verrous critiques et anomalies Runtime ;
- ramener l'utilisateur vers le contexte source.

Une notification doit toujours pointer vers un objet canonique.

## 5.5 Recherche globale

Role :

- retrouver rapidement tout objet ;
- traverser les espaces sans connaitre leur emplacement ;
- ouvrir l'objet dans son point d'entree unique ;
- conserver le contexte precedent comme chemin de retour.

---

# 6. Espaces contextuels

Les espaces contextuels s'ouvrent uniquement depuis un contexte parent.

## 6.1 Mission Workspace

Ouverture :

- depuis Mission Control ;
- depuis Project Workspace ;
- depuis Program Planner ;
- depuis Decision Center ;
- depuis Agent Control Center ;
- depuis Runtime Observatory ;
- depuis Knowledge Center ;
- depuis la recherche globale.

Fermeture :

- retour vers le contexte source ;
- retour vers Project Workspace si la mission appartient a un projet actif ;
- retour vers Mission Control si la mission est ouverte depuis une recherche sans contexte.

Regle :

Le Mission Workspace reste le point de retour apres consultation d'un rapport, d'une validation, d'un verrou ou d'une timeline mission.

## 6.2 Report Detail

Ouverture :

- depuis Mission Workspace ;
- depuis Decision Center ;
- depuis Knowledge Center ;
- depuis Runtime Observatory si un evenement `ReportSubmitted` est inspecte.

Fermeture :

- retour vers Mission Workspace ;
- retour vers Decision Center si le rapport est ouvert pour une decision ;
- retour vers Knowledge Center si ouvert comme reference documentaire.

Regle :

Un rapport ne devient jamais le contexte principal durable. Il reste rattache a une mission.

## 6.3 Validation Detail

Ouverture :

- depuis Mission Workspace ;
- depuis Decision Center ;
- depuis Mission Control si validation urgente ;
- depuis Runtime Observatory si une anomalie de validation est observee.

Fermeture :

- retour vers Mission Workspace ;
- retour vers Decision Center si decision humaine attendue.

Regle :

La validation doit toujours afficher son type : `Technical`, `Documentary`, `Human` ou `Final`.

## 6.4 Lock Detail

Ouverture :

- depuis Mission Workspace ;
- depuis Runtime Observatory ;
- depuis Mission Control si verrou critique ;
- depuis Agent Control Center si le verrou bloque un agent.

Fermeture :

- retour vers Runtime Observatory pour investigation ;
- retour vers Mission Workspace pour pilotage local ;
- retour vers Decision Center si arbitrage de verrou requis.

Regle :

Un verrou ne doit jamais etre consulte sans afficher la mission, le projet et le perimetre concernes.

## 6.5 Agent Detail

Ouverture :

- depuis Agent Control Center ;
- depuis Mission Workspace ;
- depuis Project Workspace ;
- depuis Runtime Observatory.

Fermeture :

- retour vers Agent Control Center ;
- retour vers la mission source si l'agent a ete consulte depuis une mission.

Regle :

Agent Detail expose la charge et l'historique d'un agent, mais ne remplace pas Mission Workspace pour piloter une mission.

## 6.6 Event Detail et Evidence Detail

Ouverture :

- depuis Runtime Observatory ;
- depuis Mission Workspace ;
- depuis Evidence Timeline ;
- depuis Decision Center.

Fermeture :

- retour vers la timeline source ;
- retour vers l'objet explique par l'evenement.

Regle :

Une preuve doit expliquer un etat, une transition, une decision ou une anomalie. Elle ne doit pas devenir une impasse.

## 6.7 Life Hub

Ouverture :

- depuis Project Workspace avec un `project_id` actif.

Fermeture :

- retour vers Project Workspace.

Regle :

Life Hub fournit uniquement la route cible `/projects/{project_id}/life-hub` et une page placeholder.

Il ne doit charger, creer, modifier ou exposer aucune donnee metier.

Il ne doit brancher aucune API, service, runtime, source de verite ou action operationnelle.

---

# 7. Hierarchie de navigation

## 7.1 Niveaux officiels

| Niveau | Objet | Espace principal | Role |
| --- | --- | --- | --- |
| Niveau 1 | Programme | `Program Planner` et `Mission Control` | Lire la trajectoire, la sante et les arbitrages globaux |
| Niveau 2 | Projet | `Project Workspace` | Piloter VEEDDA, ORCHESTRATOR ou un projet futur |
| Niveau 3 | Mission | `Mission Workspace` | Piloter l'unite de travail canonique |
| Niveau 4 | Objet | Details contextuels | Lire rapport, validation, verrou, agent, decision ou document |
| Niveau 5 | Preuve | Timeline, evenement, audit | Expliquer l'etat, la transition ou la decision |

## 7.2 Regle de descente

La descente de navigation ajoute du contexte.

Exemple :

Programme > Projet > Mission > Validation > Evenement
Programme > Projet > Mission > Validation > Evenement

Chaque niveau inferieur doit conserver les identifiants des niveaux superieurs.

## 7.3 Regle de remontee

La remontee de navigation restitue la lecture precedente.

Exemple :

Validation > Mission > Projet > Programme > Mission Control

La remontee ne doit pas changer silencieusement de Programme, Projet ou Mission.

---

# 8. Navigation transverse

La navigation transverse permet de passer directement d'un objet a un objet lie sans revenir au niveau parent.

## 8.1 Raccourcis depuis Mission

| Depuis | Vers | Usage |
| --- | --- | --- |
| Mission | Agent | Comprendre le responsable, sa charge et son historique |
| Mission | Lock | Comprendre le perimetre protege ou le conflit |
| Mission | Runtime | Inspecter evenements, run, queue ou anomalie |
| Mission | Decision | Traiter arbitrage, validation ou requalification |
| Mission | Timeline | Voir les preuves et transitions |
| Mission | Knowledge | Lire source de verite, baseline, RFC ou document lie |
| Mission | Project | Replacer la mission dans le projet |
| Mission | Program | Lire l'impact programme |

## 8.2 Raccourcis depuis Decision

| Depuis | Vers | Usage |
| --- | --- | --- |
| Decision | Mission | Voir l'objet operationnel concerne |
| Decision | Report | Lire le livrable a valider |
| Decision | Validation | Comprendre l'etape de controle |
| Decision | Runtime | Voir anomalie ou sequence causale |
| Decision | Knowledge | Lire source documentaire ou baseline |
| Decision | Program Planner | Lire impact sur jalon, capacite ou roadmap |

## 8.3 Raccourcis depuis Runtime

| Depuis | Vers | Usage |
| --- | --- | --- |
| Runtime Event | Mission | Relier le signal a l'objet pilote |
| Lock | Mission | Voir l'impact du verrou |
| Queue | Mission list | Voir les missions affectees |
| Anomaly | Decision Center | Demander arbitrage ou investigation |
| Runtime Health | Mission Control | Revenir a l'impact portefeuille |

## 8.4 Regle de navigation transverse

Toute navigation transverse doit afficher pourquoi le lien existe.

Exemples :

- meme `mission_id` ;
- meme `project_id` ;
- meme `agent_id` ;
- meme `lock_id` ;
- meme `report_id` ;
- meme `event_id` ;
- meme `decision_ref` ;
- meme `correlation_id`.

---

# 9. Navigation de reprise

## 9.1 Objectif

La navigation de reprise permet a un utilisateur de reprendre une session apres interruption sans relire l'ensemble du portefeuille.

Elle doit repondre :

- ou revenir ;
- quoi afficher en priorite ;
- quels changements mettre en avant ;
- comment eviter de refaire une decision deja prise.

## 9.2 Point de retour

Le point de retour est determine par priorite :

1. decision critique encore ouverte ;
2. mission precedemment active et non terminale ;
3. projet precedemment consulte avec changement significatif ;
4. Programme courant ;
5. Mission Control.

## 9.3 Changements a mettre en avant

La reprise doit mettre en avant :

- nouvelles decisions requises ;
- decisions cloturees depuis la derniere session ;
- missions passees en `ESCALATED`, `FAILED`, `WAITING_INPUT` ou `WAITING_DEPENDENCY` ;
- validations humaines ouvertes ou cloturees ;
- rapports soumis ;
- verrous critiques, expires, suspects ou liberes ;
- changements de baseline ;
- anomalies Runtime ;
- changements de priorite programme.

## 9.4 Eviter les decisions dupliquees

Avant d'afficher une decision comme actionnable, le systeme de navigation doit verifier conceptuellement :

- si une decision equivalente existe deja ;
- si la decision a ete prise depuis la derniere session ;
- si l'etat canonique a change ;
- si la mission est terminale ;
- si l'autorite attendue est encore pertinente.

## 9.5 Reprise automatique

La reprise automatique ne doit pas ouvrir directement une action destructrice ou finale.

Elle doit ouvrir le contexte avec :

- la cause de retour ;
- les changements significatifs ;
- le chemin vers l'action ;
- le chemin de retour vers Mission Control.

---

# 10. Navigation en situation de crise

## 10.1 Principe

En situation de crise, la navigation doit reduire immediatement le champ d'attention.

Elle ne doit pas afficher plus de chemins que necessaire.

Elle doit orienter vers :

- l'objet critique ;
- l'autorite attendue ;
- la preuve ;
- l'action gouvernee.

## 10.2 Plusieurs missions bloquees

Point d'entree :

- Mission Control si impact portefeuille ;
- Decision Center si arbitrages requis ;
- Runtime Observatory si cause Runtime commune.

Priorite :

1. missions bloquant un jalon ou une baseline ;
2. missions en `ESCALATED` ;
3. missions en `FAILED` requalifiables ;
4. missions en attente ancienne ;
5. missions avec verrou critique.

Navigation cible :

Mission Control > Blocked Missions > Mission Workspace > Decision Center ou Runtime Observatory

## 10.3 Plusieurs projets en derive

Point d'entree :

- Mission Control ;
- Program Planner.

Priorite :

1. projet impactant le jalon le plus proche ;
2. projet avec decision humaine urgente ;
3. projet avec dependance transverse ;
4. projet avec sante Runtime degradee ;
5. projet avec baseline instable.

Navigation cible :

Mission Control > Program Planner > Project Workspace > Decision Center

## 10.4 Plusieurs agents indisponibles

Point d'entree :

- Agent Control Center ;
- Runtime Observatory si indisponibilite liee a queue, verrou ou anomalie.

Priorite :

1. agents responsables de missions critiques ;
2. agents bloquant validation ou livraison ;
3. agents avec surcharge ;
4. agents avec degradation qualite ;
5. agents disponibles pour reassignment gouverne.

Navigation cible :

Mission Control > Agent Control Center > Agent Detail > Mission Workspace

## 10.5 Plusieurs decisions urgentes

Point d'entree :

- Decision Center.

Priorite :

1. decisions bloquant etat terminal ou baseline ;
2. validations humaines en attente ;
3. arbitrages d'escalade ;
4. conflits de verrou ;
5. requalifications depuis `FAILED` ;
6. revisions bornes.

Navigation cible :

Decision Center > Decision Detail > Evidence > Action gouvernee

## 10.6 Regle de crise

En crise, l'utilisateur doit pouvoir revenir a la liste priorisee des objets critiques en un seul retour.

---

# 11. Navigation par role

## 11.1 Directeur de Programme

Espaces prioritaires :

1. Mission Control
2. Decision Center
3. Program Planner
4. Project Workspace
5. Runtime Observatory

Priorites :

- decisions ;
- risques ;
- sante programme ;
- jalons ;
- capacite ;
- baseline ;
- escalades.

## 11.2 Architecte

Espaces prioritaires :

1. Project Workspace
2. Mission Workspace
3. Knowledge Center
4. Decision Center
5. Runtime Observatory

Priorites :

- coherence architecture ;
- perimetre ;
- dependances ;
- conformite documentaire ;
- requalification ;
- source de verite.

## 11.3 Orchestrator

Espaces prioritaires :

1. Mission Control
2. Mission Workspace
3. Runtime Observatory
4. Agent Control Center
5. Decision Center

Priorites :

- etat canonique ;
- agent ;
- verrou ;
- contexte ;
- transition ;
- queue ;
- anomalie Runtime.

## 11.4 Product Owner

Espaces prioritaires :

1. Decision Center
2. Mission Control
3. Program Planner
4. Project Workspace
5. Knowledge Center

Priorites :

- validation humaine ;
- acceptation finale ;
- valeur programme ;
- arbitrage metier ;
- annulation ou reorientation.

## 11.5 Validator

Espaces prioritaires :

1. Mission Workspace
2. Validation Detail
3. Knowledge Center
4. Decision Center
5. Runtime Observatory

Priorites :

- rapport ;
- type de validation ;
- preuves ;
- conformite ;
- rejet corrigeable ou final ;
- demande de revision.

## 11.6 Agent

Espaces prioritaires :

1. Mission Workspace
2. Knowledge Center
3. Agent Control Center
4. Runtime Observatory limite au contexte mission

Priorites :

- objectif ;
- perimetre ;
- livrables ;
- criteres d'arret ;
- verrou ;
- rapport ;
- blocage.

## 11.7 Regle par role

La navigation peut prioriser differemment les espaces selon le role.

Elle ne doit jamais modifier :

- l'etat canonique ;
- la source de verite ;
- l'autorite requise ;
- les transitions autorisees ;
- les preuves affichees.

---

# 12. Recherche universelle

## 12.1 Objectif

La recherche universelle permet de retrouver un objet sans connaitre son espace d'origine.

Elle doit pouvoir retrouver :

- mission ;
- projet ;
- programme ;
- agent ;
- rapport ;
- decision ;
- evenement ;
- verrou ;
- document ;
- baseline ;
- RFC.

## 12.2 Comportement

La recherche doit :

- reconnaitre les identifiants canoniques ;
- distinguer les types d'objets ;
- ouvrir l'objet dans son point d'entree unique ;
- conserver le contexte precedent comme retour ;
- afficher les objets lies essentiels ;
- signaler les resultats ambigus.

## 12.3 Resultat ambigu

Si plusieurs objets correspondent a une recherche, la navigation doit distinguer :

- type d'objet ;
- projet ;
- programme ;
- etat ou statut ;
- derniere activite ;
- criticite ;
- contexte parent.

Elle ne doit pas ouvrir arbitrairement un resultat ambigu.

## 12.4 Recherche et synonymes

La recherche peut accepter des termes utilisateur non canoniques comme aide a la recuperation.

Mais l'objet ouvert doit toujours afficher le terme canonique.

Un terme non canonique ne doit jamais devenir un libelle operationnel.

---

# 13. Breadcrumbs

## 13.1 Role

Les breadcrumbs indiquent ou se trouve l'utilisateur dans la hierarchie.

Ils doivent rendre visibles :

- le Programme ;
- le Projet ;
- la Mission ;
- l'objet courant ;
- la preuve ou detail si applicable.

## 13.2 Format officiel

Format nominal :

Programme > Projet > Mission > Objet > Preuve
Programme > Projet > Mission > Objet > Preuve

Exemples :

Programme > VEEDDA > Mission > ORCH-004 > Validation
Programme > ORCHESTRATOR > Mission > L4-003 > Lock
Programme > ORCHESTRATOR > Runtime > Event > EVT-001
Programme > VEEDDA > Knowledge > Baseline > RFC-002

## 13.3 Regles

Un breadcrumb doit :

- etre stable pendant la consultation ;
- permettre de remonter a chaque niveau ;
- ne pas masquer le contexte source ;
- afficher les noms canoniques d'objets ;
- ne pas remplacer l'historique de navigation.

## 13.4 Breadcrumb transverse

Lorsqu'un objet est ouvert par navigation transverse, le breadcrumb affiche la hierarchie de l'objet, tandis que l'historique conserve la vue d'origine.

Exemple :

Breadcrumb : Programme > ORCHESTRATOR > Mission > ORCH-009 > Agent

Retour intelligent : Decision Center > Decision DEC-004

---

# 14. Historique de navigation

## 14.1 Retour intelligent

Le retour intelligent ramene vers la vue utile precedente, pas seulement vers le parent hierarchique.

Exemples :

- depuis un rapport ouvert via Decision Center, retour vers la decision ;
- depuis un verrou ouvert via Runtime Observatory, retour vers l'anomalie Runtime ;
- depuis une mission ouverte via Agent Detail, retour vers l'agent ;
- depuis un document ouvert via Mission Workspace, retour vers la mission.

## 14.2 Historique recent

L'historique recent conserve :

- missions consultees ;
- projets consultes ;
- decisions consultees ;
- agents consultes ;
- documents consultes ;
- verrous ou evenements investigues ;
- recherches recentes.

## 14.3 Favoris

Les favoris peuvent pointer vers :

- programmes ;
- projets ;
- missions ;
- agents ;
- baselines ;
- vues filtrees ;
- documents de reference.

Un favori ne doit pas figer une decision actionnable si celle-ci a change d'etat.

## 14.4 Elements recemment consultes

Les elements recemment consultes doivent afficher :

- type d'objet ;
- identifiant ;
- projet ou programme ;
- etat ou statut courant ;
- dernier changement significatif ;
- indicateur si l'objet a change depuis consultation.

## 14.5 Reprise automatique

La reprise automatique utilise :

- dernier contexte actif ;
- dernier objet critique ;
- decisions ouvertes ;
- changements depuis derniere session ;
- role utilisateur.

Elle doit preferer une reprise utile a une reprise strictement chronologique.

---

# 15. Navigation et Context Engine

## 15.1 Role du Context Engine

Le Context Engine accompagne la navigation en conservant, enrichissant ou abandonnant le contexte selon le changement de vue.

Il ne decide pas.

Il ne modifie pas les objets.

Il maintient la comprehension du chemin parcouru.

## 15.2 Contexte conserve

A chaque changement de vue, le Context Engine conserve :

- `program_id` si connu ;
- `project_id` si connu ;
- `mission_id` si connu ;
- `agent_id` si connu ;
- `decision_id` si connu ;
- `report_id` si connu ;
- `lock_id` si connu ;
- `event_id` si connu ;
- role utilisateur ;
- source de navigation ;
- raison de navigation ;
- chemin de retour.

## 15.3 Contexte enrichi

Le contexte est enrichi lorsqu'un objet lie devient necessaire.

Exemples :

- ouvrir un verrou ajoute `lock_id` et `scope` ;
- ouvrir un rapport ajoute `report_id` et type de rapport ;
- ouvrir une validation ajoute type de validation et autorite ;
- ouvrir un evenement ajoute `event_id`, `correlation_id` et sequence ;
- ouvrir un agent ajoute `agent_id`, charge et missions actives.

## 15.4 Contexte abandonne

Le contexte peut etre abandonne uniquement si :

- l'utilisateur revient explicitement a Mission Control ;
- l'objet courant est terminal et aucune action n'est ouverte ;
- l'utilisateur change de Programme explicitement ;
- une recherche ouvre un objet sans lien avec le contexte courant et confirme le changement ;
- la session est reprise sans contexte valide.

## 15.5 Changement de contexte explicite

Tout changement de Programme, Projet ou Mission doit etre explicite.

La navigation ne doit pas remplacer silencieusement :

- une mission courante par une autre ;
- un projet courant par un autre ;
- une decision en cours par une decision differente ;
- une baseline par une version differente.

## 15.6 Contexte et decisions

Une decision en cours doit etre protegee par le Context Engine.

Si l'utilisateur navigue ailleurs pendant une decision :

- la decision reste retrouvable ;
- le chemin de retour est conserve ;
- tout changement d'etat pertinent est signale ;
- une decision deja prise ne doit plus apparaitre comme ouverte.

---

# 16. Anti-patterns

Les anti-patterns suivants sont interdits.

## 16.1 Impasses de navigation

Aucune vue ne doit exiger de revenir a Mission Control pour continuer.

Chaque objet doit proposer un chemin vers son parent, son contexte source et ses objets lies essentiels.

## 16.2 Vues orphelines

Aucune vue ne doit exister sans :

- objet parent ;
- point d'entree ;
- chemin de retour ;
- role clair.

## 16.3 Doubles menus

La navigation ne doit pas proposer deux structures globales concurrentes.

Un espace peut avoir une navigation locale, mais elle ne doit pas redoubler la navigation globale.

## 16.4 Contextes perdus

Une transition entre espaces ne doit pas perdre le Programme, le Projet, la Mission, la Decision ou la raison de consultation.

## 16.5 Retours incoherents

Le retour ne doit pas ramener vers une liste generique si l'utilisateur venait d'une decision, d'une anomalie ou d'une recherche specifique.

## 16.6 Fenetres modales en cascade

Les details successifs ne doivent pas etre empiles comme une cascade de modalites.

Un detail profond doit devenir un contexte lisible avec breadcrumb et retour explicite.

## 16.7 Changements de contexte silencieux

Un clic ne doit pas changer de Projet, Mission, Decision ou Baseline sans signaler le changement.

## 16.8 Navigation par jargon technique

La navigation ne doit pas exposer des concepts techniques non utiles au role courant.

Le vocabulaire operationnel reste canonique.

## 16.9 Actions sans preuve

Une action critique ne doit pas etre accessible sans chemin vers les preuves qui la justifient.

## 16.10 Objets sans point d'entree unique

Un meme objet ne doit pas etre defini differemment selon l'espace d'ou il est ouvert.

---

# 17. Golden Rules

1. Le contexte est plus important que l'ecran.

2. Une navigation ne doit jamais faire perdre une decision en cours.

3. Chaque vue doit expliquer pourquoi elle existe.

4. Chaque objet possede un point d'entree unique.

5. Chaque objet possede un chemin de retour explicite.

6. Le Directeur de Programme doit toujours savoir ou il se trouve.

7. Mission Control est le retour universel, pas le seul chemin de navigation.

8. Decision Center centralise les decisions, mais chaque decision reste accessible depuis son contexte.

9. Mission Workspace est le point de retour local de tout detail mission.

10. Runtime Observatory explique les signaux, il ne remplace pas le pilotage mission.

11. Knowledge Center donne les preuves documentaires, il ne doit pas detacher les documents de leur usage.

12. Une recherche ouvre l'objet dans son point d'entree officiel.

13. Un breadcrumb explique la hierarchie ; l'historique explique le chemin reel.

14. Une crise doit reduire les chemins, pas les multiplier.

15. Aucun changement de contexte important ne doit etre silencieux.

16. Aucun objet critique ne doit etre une impasse.

17. Les etats canoniques restent visibles partout ou une mission est mentionnee.

18. Une mission terminale ne doit pas etre presentee comme actionnable.

19. Une validation humaine doit rester separee des controles techniques et documentaires.

20. La navigation doit soutenir la gouvernance, jamais la contourner.

---

# 18. Criteres d'acceptation

Le document `L4-009_ORCHESTRATOR_NAVIGATION_MODEL_V1.md` est complet si un UX Designer et un UI Designer peuvent concevoir les wireframes de l'ORCHESTRATOR sans redefinir :

- les principes de navigation ;
- la structure globale ;
- les espaces permanents ;
- les espaces contextuels ;
- les niveaux de navigation ;
- les chemins transverses ;
- la reprise de session ;
- la navigation en crise ;
- les priorites par role ;
- la recherche universelle ;
- les breadcrumbs ;
- l'historique ;
- le role du Context Engine ;
- les anti-patterns ;
- les regles d'or.

Le document est acceptable uniquement si :

- il ne contient aucune maquette ;
- il ne contient aucun wireframe ;
- il ne contient aucun design graphique ;
- il ne contient aucun composant React ;
- il ne contient aucun code ;
- il ne contient aucune API ;
- il ne cree aucune regle metier nouvelle ;
- il reste coherent avec les espaces L4-001 a L4-008.

---

# 19. Conclusion

Le modele de navigation ORCHESTRATOR V1 organise les espaces L4 en un systeme coherent.

Il permet de passer du portefeuille a la preuve, de la decision au contexte, de la mission au Runtime, de l'agent au blocage et du document a son usage sans perte de contexte.

Il donne une reference stable pour concevoir les wireframes futurs de l'ORCHESTRATOR sans inventer de nouvelles regles de navigation.

Statut propose : `DRAFT_VALIDABLE`.
