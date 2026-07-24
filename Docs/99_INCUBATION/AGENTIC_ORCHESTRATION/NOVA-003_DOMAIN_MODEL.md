# NOVA-003 - Domain Model

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : NOVA-003

Agent : Agent 03 - Domain Model

Objet : Description canonique des objets metier NOVA / ORCHESTRATOR

---

# 1. Objectif

Ce document decrit les objets metier necessaires au pilotage NOVA / ORCHESTRATOR.

Il fixe le vocabulaire conceptuel des objets suivants :

- Programme ;
- Projet ;
- Mission ;
- Decision ;
- Agent ;
- Conversation ;
- Memory ;
- Graph ;
- Simulation ;
- Plugin ;
- Runtime ;
- Executive.

Ce document ne decrit pas une implementation technique, une base de donnees, une API ou une interface graphique. Il definit les responsabilites, attributs conceptuels, relations, cycles de vie et invariants metier.

---

# 2. Principes du modele

## 2.1 Objet metier identifiable

Tout objet metier possede un identifiant stable.

Un identifiant ne doit pas etre reutilise pour un autre objet, meme si l'objet initial est archive, annule ou remplace.

## 2.2 Separation pilotage / execution

Les objets de pilotage definissent l'intention, la trajectoire, les arbitrages et la gouvernance.

Les objets d'execution transforment une intention bornee en livrable, rapport, evenement ou validation.

## 2.3 Tracabilite

Toute action significative doit etre rattachable a :

- un Programme ou un Projet ;
- une Mission lorsque l'action est executable ;
- une Decision lorsque l'action modifie une trajectoire, un perimetre, une priorite ou une autorite ;
- un Agent ou un Executive responsable ;
- une Conversation, une Memory ou un Graph lorsque l'action depend d'un contexte cognitif.

## 2.4 Non-substitution

Aucun objet ne remplace un autre objet.

Une Mission n'est pas un Projet.

Une Decision n'est pas une Conversation.

Une Memory n'est pas une preuve.

Un Plugin n'est pas le Runtime.

Un Agent n'est pas l'Executive.

## 2.5 Source de verite explicite

Chaque objet doit indiquer sa source de verite :

- registre ;
- fichier de mission ;
- rapport ;
- journal d'evenements ;
- conversation ;
- graphe de connaissances ;
- decision de gouvernance.

---

# 3. Vue d'ensemble

| Objet | Role principal | Niveau |
| --- | --- | --- |
| Programme | Piloter une trajectoire strategique composee de plusieurs projets | Pilotage |
| Projet | Coordonner un resultat operationnel ou produit | Coordination |
| Mission | Executer un objectif borne et validable | Execution |
| Decision | Fixer un arbitrage, une autorite ou un changement de trajectoire | Gouvernance |
| Agent | Produire, analyser, valider ou superviser dans un perimetre donne | Execution / Expertise |
| Conversation | Porter l'echange contextualise entre humain, executive, runtime et agents | Interaction |
| Memory | Conserver un contexte reutilisable et gouverne | Connaissance |
| Graph | Relier les objets, dependances, preuves et impacts | Representation |
| Simulation | Evaluer une hypothese, une trajectoire ou un impact avant decision | Analyse |
| Plugin | Etendre les capacites disponibles sans modifier le coeur du modele | Extension |
| Runtime | Executer les missions selon un cycle d'etat gouverne | Execution technique |
| Executive | Porter l'autorite de pilotage, d'arbitrage et de validation finale | Direction |

---

# 4. Programme

## 4.1 Definition

Un Programme est une unite de pilotage strategique.

Il regroupe plusieurs projets, objectifs, releases, jalons, risques, decisions, dependances et capacites autour d'une vision commune.

## 4.2 Responsabilites

Le Programme :

- maintient l'alignement avec la vision ;
- structure la trajectoire globale ;
- arbitre les priorites transverses ;
- surveille la coherence des projets ;
- gere les risques et dependances majeurs ;
- porte la lecture capacitaire globale ;
- maintient la tracabilite des decisions structurantes.

## 4.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `program_id` | Identifiant stable du programme |
| `name` | Nom canonique |
| `vision_ref` | Reference a la vision ou intention strategique |
| `status` | Etat de pilotage : draft, active, suspended, closed, archived |
| `executive_id` | Executive responsable |
| `objectives` | Objectifs strategiques suivis |
| `roadmap_ref` | Trajectoire officielle |
| `risk_profile` | Synthese des risques majeurs |
| `decision_refs` | Decisions structurantes associees |

## 4.4 Relations

Un Programme contient ou pilote :

- plusieurs Projets ;
- plusieurs Decisions ;
- plusieurs Simulations ;
- plusieurs Graphs de pilotage ;
- plusieurs Missions indirectement via ses Projets.

## 4.5 Cycle de vie

1. `DRAFT` : programme formule mais non encore pilote.
2. `ACTIVE` : programme en cours de pilotage.
3. `SUSPENDED` : programme suspendu par decision explicite.
4. `CLOSED` : programme termine comme trajectoire active.
5. `ARCHIVED` : programme conserve comme reference historique.

## 4.6 Invariants

- Un Programme actif doit avoir un Executive responsable.
- Un Programme ne peut pas etre clos sans Decision de cloture.
- Un Programme ne doit pas contenir deux Projets portant le meme objectif sans distinction explicite.

---

# 5. Projet

## 5.1 Definition

Un Projet est une unite de coordination orientee resultat.

Il transforme une intention operationnelle en ensemble organise de missions, livrables, dependances, validations et decisions.

## 5.2 Responsabilites

Le Projet :

- coordonne les missions contribuant a un resultat ;
- organise les livrables attendus ;
- expose les dependances et risques operationnels ;
- maintient la coherence avec le Programme ;
- remonte les arbitrages necessaires.

## 5.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `project_id` | Identifiant stable du projet |
| `program_id` | Programme de rattachement |
| `name` | Nom canonique |
| `status` | Etat de coordination |
| `scope` | Perimetre autorise |
| `objective_refs` | Objectifs servis |
| `mission_refs` | Missions rattachees |
| `dependency_refs` | Dependances explicites |
| `decision_refs` | Decisions applicables |

## 5.4 Relations

Un Projet appartient a un Programme.

Un Projet contient des Missions.

Un Projet peut consommer des Plugins, publier des evenements Runtime et alimenter une Memory ou un Graph.

## 5.5 Cycle de vie

1. `DRAFT`
2. `READY`
3. `ACTIVE`
4. `BLOCKED`
5. `DELIVERED`
6. `CLOSED`
7. `ARCHIVED`

## 5.6 Invariants

- Un Projet ne peut pas etre actif sans Programme ou exception explicite.
- Toute Mission executable doit appartenir a un Projet.
- Un changement de perimetre Projet exige une Decision.

---

# 6. Mission

## 6.1 Definition

Une Mission est une unite d'execution bornee, assignee a un agent ou a un groupe d'agents, produisant un resultat validable.

## 6.2 Responsabilites

La Mission :

- porte un objectif executable ;
- fixe un perimetre limite ;
- definit les livrables attendus ;
- designe un agent principal ;
- suit un etat canonique ;
- produit un rapport, une preuve, une decision preparee ou un livrable.

## 6.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `mission_id` | Identifiant unique de mission |
| `project_id` | Projet de rattachement |
| `program_id` | Programme herite ou explicite |
| `agent_id` | Agent principal |
| `status` | Etat canonique de mission |
| `scope` | Perimetre autorise |
| `deliverables` | Livrables attendus |
| `acceptance_criteria` | Criteres de validation |
| `context_refs` | Conversations, Memory, Graph ou documents injectes |
| `decision_refs` | Decisions applicables ou produites |

## 6.4 Relations

Une Mission appartient a un Projet.

Une Mission est executee par un Agent via le Runtime.

Une Mission peut :

- consommer une Conversation ;
- lire une Memory autorisee ;
- mettre a jour un Graph ;
- produire une Decision preparee ;
- declencher une Simulation ;
- utiliser un Plugin.

## 6.5 Cycle de vie

Le cycle de vie Mission suit les etats canoniques ORCHESTRATOR :

1. `DRAFT`
2. `READY`
3. `ASSIGNED`
4. `LOCKED`
5. `RUNNING`
6. `WAITING_INPUT`
7. `WAITING_DEPENDENCY`
8. `ESCALATED`
9. `SUBMITTED`
10. `TECHNICAL_VALIDATION`
11. `DOCUMENTARY_VALIDATION`
12. `HUMAN_VALIDATION`
13. `NEEDS_REVISION`
14. `ACCEPTED`
15. `REJECTED`
16. `FAILED`
17. `CANCELLED`

## 6.6 Invariants

- Une Mission ne definit jamais seule la strategie.
- Une Mission ne peut pas modifier son perimetre sans Decision ou requalification explicite.
- Une Mission terminale ne doit plus etre executee.

---

# 7. Decision

## 7.1 Definition

Une Decision est un arbitrage explicite qui modifie, confirme ou verrouille une orientation, un perimetre, une priorite, une autorite, une validation ou une trajectoire.

## 7.2 Responsabilites

La Decision :

- rend un choix explicite ;
- documente son contexte et ses motifs ;
- fixe son autorite ;
- expose les impacts ;
- devient une reference opposable pour les Missions, Projets et Programmes.

## 7.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `decision_id` | Identifiant stable |
| `decision_type` | Type : arbitrage, validation, rejet, requalification, cloture, exception |
| `authority_id` | Executive ou autorite responsable |
| `scope` | Objet(s) concernes |
| `rationale` | Motif de decision |
| `impact_refs` | Objets impacts |
| `effective_at` | Date logique d'application |
| `status` | Proposed, accepted, rejected, superseded, archived |

## 7.4 Relations

Une Decision peut s'appliquer a :

- un Programme ;
- un Projet ;
- une Mission ;
- un Agent ;
- une Simulation ;
- un Runtime ;
- un Plugin ;
- une Memory ou un Graph.

## 7.5 Cycle de vie

1. `PROPOSED`
2. `UNDER_REVIEW`
3. `ACCEPTED`
4. `REJECTED`
5. `SUPERSEDED`
6. `ARCHIVED`

## 7.6 Invariants

- Une Decision acceptee doit avoir une autorite identifiee.
- Une Decision structurante doit expliciter ses impacts.
- Une Decision remplacee doit pointer vers la Decision qui la supersede.

---

# 8. Agent

## 8.1 Definition

Un Agent est une capacite d'execution, d'analyse, de validation ou de supervision mobilisable par le Runtime dans un perimetre autorise.

## 8.2 Responsabilites

L'Agent :

- execute les Missions affectees ;
- respecte le perimetre et les sources autorisees ;
- produit un rapport ou un livrable ;
- signale les blocages, dependances et besoins de decision ;
- n'exerce pas d'autorite finale sauf delegation explicite.

## 8.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `agent_id` | Identifiant stable de l'agent |
| `agent_type` | Role : architect, domain_model, runtime, qa, security, documentation, etc. |
| `capabilities` | Capacites declarees |
| `authority_level` | Niveau d'autorite autorise |
| `allowed_scopes` | Perimetres consultables ou modifiables |
| `runtime_status` | Disponible, affecte, suspendu, desactive |
| `plugin_refs` | Plugins utilisables |

## 8.4 Relations

Un Agent execute des Missions.

Un Agent peut lire des Conversations, Memory et Graphs si la Mission l'autorise.

Un Agent peut proposer une Decision, mais ne la valide pas sans autorite.

## 8.5 Cycle de vie

1. `REGISTERED`
2. `AVAILABLE`
3. `ASSIGNED`
4. `RUNNING`
5. `WAITING`
6. `DISABLED`
7. `RETIRED`

## 8.6 Invariants

- Un Agent ne communique pas directement avec un autre Agent sans mediation Runtime ou artefact partage.
- Un Agent ne doit pas lire le depot complet si la Mission ne l'autorise pas.
- Un Agent ne doit pas modifier un objet hors perimetre.

---

# 9. Conversation

## 9.1 Definition

Une Conversation est un fil d'interaction contextualise entre utilisateur, Executive, Runtime et Agents.

Elle porte les demandes, clarifications, instructions, hypotheses, validations et arbitrages verbaux avant leur transformation eventuelle en Mission, Decision ou Memory.

## 9.2 Responsabilites

La Conversation :

- conserve le contexte d'echange ;
- rattache les consignes a leur source ;
- distingue instruction, information, hypothese et decision ;
- fournit une trace consultable pour reconstruire l'intention.

## 9.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `conversation_id` | Identifiant stable |
| `participants` | Humains, Executive, Agents ou Runtime impliques |
| `project_id` | Projet actif si applicable |
| `mission_id` | Mission associee si applicable |
| `messages` | Echanges ordonnes |
| `decision_candidates` | Decisions candidates issues de l'echange |
| `memory_candidates` | Informations candidates a retention |
| `status` | Active, paused, closed, archived |

## 9.4 Relations

Une Conversation peut creer ou enrichir :

- une Mission ;
- une Decision ;
- une Memory ;
- un Graph ;
- une Simulation.

## 9.5 Cycle de vie

1. `OPEN`
2. `ACTIVE`
3. `WAITING`
4. `CLOSED`
5. `ARCHIVED`

## 9.6 Invariants

- Une Conversation ne vaut pas Decision tant qu'elle n'est pas formalisee comme Decision.
- Une instruction conversationnelle critique doit etre rattachee a une Mission ou Decision.
- Une Conversation archivee ne doit pas etre modifiee.

---

# 10. Memory

## 10.1 Definition

Une Memory est une information persistante, qualifiee et reutilisable par le systeme pour maintenir la continuite de comprehension.

Elle n'est pas une preuve brute. Elle est un contexte gouverne.

## 10.2 Responsabilites

La Memory :

- conserve les faits, preferences, decisions stabilisees ou contextes reutilisables ;
- indique sa provenance ;
- declare sa portee ;
- expire ou se remplace lorsqu'elle devient obsolete ;
- evite la repetition de contexte entre Missions.

## 10.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `memory_id` | Identifiant stable |
| `memory_type` | Fact, preference, rule, context, lesson, decision_summary |
| `source_ref` | Conversation, Decision, Mission, document ou Graph source |
| `scope` | Global, Programme, Projet, Mission, Agent |
| `confidence` | Niveau de confiance |
| `validity` | Active, stale, superseded, archived |
| `expires_at` | Date ou condition d'expiration si applicable |

## 10.4 Relations

Une Memory peut etre produite depuis une Conversation, une Mission, une Decision ou un Graph.

Une Mission peut consommer une Memory uniquement si son scope l'autorise.

## 10.5 Cycle de vie

1. `CANDIDATE`
2. `VALIDATED`
3. `ACTIVE`
4. `STALE`
5. `SUPERSEDED`
6. `ARCHIVED`

## 10.6 Invariants

- Une Memory doit avoir une source.
- Une Memory ne doit pas contredire une Decision acceptee.
- Une Memory sensible doit etre scopee et protegee.

---

# 11. Graph

## 11.1 Definition

Un Graph est une representation relationnelle des objets, dependances, preuves, impacts et chemins de comprehension.

Il rend navigables les liens entre Programme, Projet, Mission, Decision, Agent, Memory, Simulation, Plugin et Runtime.

## 11.2 Responsabilites

Le Graph :

- materialise les relations ;
- expose les dependances et impacts ;
- supporte la navigation et l'analyse ;
- permet de reconstruire une trajectoire de decision ou d'execution ;
- distingue relation factuelle, relation inferree et relation proposee.

## 11.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `graph_id` | Identifiant stable |
| `graph_type` | Knowledge, dependency, impact, execution, decision |
| `nodes` | Objets representes |
| `edges` | Relations qualifiees |
| `scope` | Programme, Projet, Mission ou transversal |
| `source_refs` | Sources alimentant le graphe |
| `status` | Draft, active, stale, archived |

## 11.4 Relations

Le Graph relie tous les objets metier, mais ne remplace aucun objet source.

Une relation Graph doit pointer vers une source ou etre marquee comme inference.

## 11.5 Cycle de vie

1. `DRAFT`
2. `ACTIVE`
3. `ENRICHED`
4. `STALE`
5. `ARCHIVED`

## 11.6 Invariants

- Un noeud Graph doit pointer vers un objet existant ou une reference externe explicite.
- Une relation critique doit avoir une source.
- Une inference ne doit pas etre presentee comme fait.

---

# 12. Simulation

## 12.1 Definition

Une Simulation est une evaluation structuree d'une hypothese, d'une trajectoire, d'une decision ou d'un impact avant execution ou arbitrage.

## 12.2 Responsabilites

La Simulation :

- formule une hypothese ;
- declare ses parametres ;
- produit un resultat interpretable ;
- expose ses limites ;
- aide une Decision sans la remplacer.

## 12.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `simulation_id` | Identifiant stable |
| `scenario` | Hypothese testee |
| `scope` | Programme, Projet, Mission ou Decision concernee |
| `inputs` | Parametres d'entree |
| `assumptions` | Hypotheses explicites |
| `outputs` | Resultats produits |
| `confidence` | Niveau de confiance |
| `decision_ref` | Decision alimentee si applicable |

## 12.4 Relations

Une Simulation peut etre rattachee a un Programme, Projet, Mission ou Decision.

Elle peut lire un Graph ou une Memory autorisee.

## 12.5 Cycle de vie

1. `REQUESTED`
2. `CONFIGURED`
3. `RUNNING`
4. `COMPLETED`
5. `INVALIDATED`
6. `ARCHIVED`

## 12.6 Invariants

- Une Simulation doit lister ses hypotheses.
- Une Simulation ne prend pas de Decision.
- Une Simulation invalidee ne doit plus servir de base sans requalification.

---

# 13. Plugin

## 13.1 Definition

Un Plugin est une extension gouvernee qui apporte une capacite additionnelle au systeme sans redefinir le modele metier central.

## 13.2 Responsabilites

Le Plugin :

- expose une capacite identifiable ;
- declare ses entrees, sorties et permissions ;
- respecte le Runtime et le perimetre Mission ;
- ne modifie pas les objets metier sans commande ou autorite explicite.

## 13.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `plugin_id` | Identifiant stable |
| `name` | Nom canonique |
| `capability` | Capacite fournie |
| `version` | Version du plugin |
| `permissions` | Droits requis |
| `input_contract` | Entrees attendues |
| `output_contract` | Sorties produites |
| `status` | Registered, enabled, disabled, deprecated, retired |

## 13.4 Relations

Un Plugin peut etre utilise par un Agent ou le Runtime dans le cadre d'une Mission.

Un Plugin peut alimenter une Conversation, une Memory, un Graph ou une Simulation selon ses permissions.

## 13.5 Cycle de vie

1. `REGISTERED`
2. `ENABLED`
3. `DISABLED`
4. `DEPRECATED`
5. `RETIRED`

## 13.6 Invariants

- Un Plugin ne peut pas changer un etat Mission directement.
- Un Plugin doit etre versionne.
- Un Plugin doit declarer ses permissions avant usage.

---

# 14. Runtime

## 14.1 Definition

Le Runtime est le composant conceptuel qui execute les Missions selon un cycle d'etat gouverne.

Il transforme une demande de mission en execution bornee, tracee, verrouillee et validable.

## 14.2 Responsabilites

Le Runtime :

- cree et accepte les Missions ;
- affecte les Agents ;
- injecte le contexte autorise ;
- gere les verrous ;
- applique les transitions d'etat ;
- publie les evenements ;
- recoit les rapports ;
- orchestre les validations ;
- maintient un etat reconstructible.

## 14.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `runtime_id` | Identifiant de l'instance runtime |
| `project_id` | Projet execute ou contexte courant |
| `mission_queue` | Missions a traiter |
| `state_store` | Etat courant reconstructible |
| `event_store` | Evenements publies |
| `agent_registry` | Agents disponibles |
| `plugin_registry` | Plugins disponibles |
| `lock_registry` | Verrous actifs |
| `status` | Available, running, degraded, suspended, retired |

## 14.4 Relations

Le Runtime execute des Missions pour des Projets.

Il mobilise des Agents et Plugins.

Il lit le contexte autorise depuis Conversation, Memory et Graph.

Il publie des evenements consultables par le Graph et les vues de pilotage.

## 14.5 Cycle de vie

1. `AVAILABLE`
2. `RUNNING`
3. `DEGRADED`
4. `SUSPENDED`
5. `RETIRED`

## 14.6 Invariants

- Le Runtime n'est pas une autorite produit ou metier.
- Le Runtime ne doit pas contourner un verrou.
- Le Runtime ne doit pas executer une Mission hors etat autorise.

---

# 15. Executive

## 15.1 Definition

L'Executive est l'autorite de pilotage responsable des arbitrages, validations finales, priorites, exceptions et decisions structurantes.

Il peut representer un role humain, une instance de gouvernance ou une autorite deleguee explicitement.

## 15.2 Responsabilites

L'Executive :

- porte la responsabilite du Programme ou d'un perimetre delegue ;
- valide les Decisions structurantes ;
- arbitre les tensions entre Projets ;
- autorise les exceptions ;
- cloture les Programmes, Projets ou Missions lorsque le niveau d'autorite le requiert ;
- garantit la coherence entre execution et intention.

## 15.3 Attributs conceptuels

| Attribut | Description |
| --- | --- |
| `executive_id` | Identifiant stable |
| `name` | Nom ou role |
| `authority_scope` | Perimetre d'autorite |
| `delegations` | Autorites deleguees |
| `decision_rights` | Types de Decisions autorisees |
| `status` | Active, delegated, suspended, retired |

## 15.4 Relations

L'Executive pilote des Programmes.

Il valide ou refuse des Decisions.

Il peut intervenir sur une Mission en validation humaine, escalade, annulation ou cloture.

Il peut mandater un Agent, mais ne devient pas Agent pour autant.

## 15.5 Cycle de vie

1. `ACTIVE`
2. `DELEGATED`
3. `SUSPENDED`
4. `RETIRED`

## 15.6 Invariants

- Une Decision finale doit pointer vers l'Executive ou l'autorite equivalente.
- Une delegation doit etre explicite.
- Un Executive ne doit pas masquer l'Agent responsable de l'execution.

---

# 16. Relations canoniques

## 16.1 Hierarchie de pilotage

```text
Executive
  -> Programme
    -> Projet
      -> Mission
        -> Agent
        -> Runtime
```

## 16.2 Contexte cognitif

```text
Conversation
  -> Memory
  -> Graph
  -> Mission
  -> Decision
```

## 16.3 Analyse et arbitrage

```text
Graph
  -> Simulation
  -> Decision
  -> Programme / Projet / Mission
```

## 16.4 Extension et execution

```text
Runtime
  -> Agent
  -> Plugin
  -> Mission
  -> Event / Report / Validation
```

---

# 17. Matrice des relations

| Source | Relation | Cible |
| --- | --- | --- |
| Executive | pilote | Programme |
| Executive | valide | Decision |
| Programme | contient | Projet |
| Programme | arbitre via | Decision |
| Projet | contient | Mission |
| Mission | est executee par | Agent |
| Mission | est orchestree par | Runtime |
| Mission | utilise | Plugin |
| Mission | consomme | Conversation / Memory / Graph |
| Mission | produit | Rapport / Decision candidate / Memory candidate |
| Decision | impacte | Programme / Projet / Mission / Runtime / Plugin |
| Conversation | alimente | Mission / Decision / Memory |
| Memory | contextualise | Conversation / Mission / Graph |
| Graph | relie | Tous objets metier |
| Simulation | evalue | Hypothese / Decision / Trajectoire |
| Plugin | etend | Agent / Runtime |
| Runtime | publie | Evenement |

---

# 18. Regles de coherence

1. Toute Mission doit etre rattachee a un Projet.
2. Tout Projet actif doit etre rattache a un Programme ou disposer d'une exception explicite.
3. Toute Decision structurante doit declarer son autorite et ses impacts.
4. Toute Memory doit avoir une source et une portee.
5. Tout Graph doit distinguer fait, inference et proposition.
6. Toute Simulation doit declarer ses hypotheses.
7. Tout Plugin doit declarer ses permissions et sa version.
8. Tout Runtime doit appliquer les etats canoniques de Mission.
9. Tout Agent doit respecter le perimetre Mission.
10. Tout Executive doit avoir un perimetre d'autorite explicite.

---

# 19. Limites V1

Ce modele ne tranche pas :

- le schema physique de stockage ;
- les endpoints API ;
- le format exact des messages ;
- le moteur de graphe ;
- le moteur de simulation ;
- le mecanisme de persistance des conversations ;
- les droits detailles par organisation ;
- la representation UI.

Ces sujets doivent etre traites par des missions dediees.

---

# 20. Verdict Agent 03

Les objets metier demandes sont definis.

Le modele distingue clairement :

- pilotage strategique : Executive, Programme, Projet, Decision ;
- execution gouvernee : Mission, Agent, Runtime, Plugin ;
- contexte cognitif : Conversation, Memory, Graph ;
- analyse prospective : Simulation.

Le document est utilisable comme base de dictionnaire de domaine, de future modelisation de donnees, de conception API et de specification UX.
