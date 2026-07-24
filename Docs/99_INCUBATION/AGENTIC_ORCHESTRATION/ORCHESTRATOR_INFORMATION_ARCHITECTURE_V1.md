# ORCHESTRATOR INFORMATION ARCHITECTURE V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : ORCH-UX-003

Agent : Information Architecture

Objet : Architecture de navigation ORCHESTRATOR V1

---

# 1. Objet

Ce document definit l'architecture de navigation de la future interface ORCHESTRATOR V1.

Il couvre :

- les espaces fonctionnels ;
- les vues principales ;
- les vues secondaires ;
- les relations entre vues ;
- les niveaux de navigation ;
- les acces rapides ;
- les breadcrumbs ;
- les filtres globaux.

Il fournit les livrables suivants :

- Sitemap ;
- Navigation Tree ;
- Taxonomie ;
- Architecture des informations.

Ce document ne contient pas de maquette.

---

# 2. Sources de verite

L'architecture d'information respecte les documents suivants :

1. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
2. `ORCHESTRATOR_STATE_MODEL_V1.md`
3. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
4. `ORCHESTRATOR_API_SURFACE_V1.md`
5. `ORCH-0001-B_WORKFLOW.md`
6. `ORCHESTRATION_GOVERNANCE.md`

Aucune vue ne doit introduire un etat, un role, une transition ou une autorite non defini par les sources de verite.

---

# 3. Principes d'architecture d'information

## 3.1 Navigation par pilotage

La navigation est organisee autour du pilotage des missions, et non autour de la structure technique interne.

L'utilisateur doit pouvoir repondre rapidement aux questions suivantes :

- quelles missions sont actives ;
- quelles missions sont bloquees ;
- quelles validations sont attendues ;
- quels verrous existent ;
- quels conflits ou escalades demandent une decision ;
- quel historique explique l'etat courant.

## 3.2 Navigation par projet

Le `project_id` est le premier niveau de contexte.

Toutes les vues operationnelles sont filtrees par projet actif.

Une action de mutation ne doit pas etre disponible sans projet courant explicite.

## 3.3 Separation operation / gouvernance

Les vues operationnelles pilotent les missions, verrous, rapports et validations.

Les vues de gouvernance exposent les roles, autorisations, sources de verite et regles applicables.

Une vue operationnelle ne doit pas masquer une contrainte de gouvernance.

## 3.4 Lecture avant action

Toute action critique doit etre accessible depuis une vue qui presente d'abord :

- l'objet concerne ;
- son etat courant ;
- son perimetre ;
- son verrou eventuel ;
- les transitions autorisees ;
- les risques ou blocages connus.

---

# 4. Espaces fonctionnels

| Espace | Role | Utilisateurs principaux | Objets dominants |
| --- | --- | --- | --- |
| Pilotage | Vue d'ensemble des missions et blocages | Product Owner, Architecte, Orchestrator | Mission, State, Validation, Lock |
| Missions | Creation, suivi, detail et cycle de vie des missions | Orchestrator, Architecte, Agents | Mission, Transition, Report |
| Verrous | Supervision des perimetres verrouilles | Orchestrator, Architecte | Lock, Scope, Conflict |
| Validations | Controle technique, documentaire et humain | Validators, Architecte, Product Owner | Validation, Report, Mission |
| Rapports | Consultation des livrables agents | Agents, Validators, Architecte | Report, Deliverable |
| Evenements | Audit et reconstruction chronologique | Architecte, Orchestrator, Auditor | Event, StateChange |
| Gouvernance | Roles, autorites, regles et sources de verite | Product Owner, Architecte | Role, Permission, Source |
| Life Hub | Page placeholder de destination, sans donnees metier | Non defini pour le placeholder | Aucun objet metier |
| Administration | Configuration future de projets et integrations | Service admin | Project, Integration, Token |

---

# 5. Vues principales

| Vue principale | Route logique | Description |
| --- | --- | --- |
| Dashboard | `/projects/{project_id}/dashboard` | Synthese operationnelle du projet courant |
| Mission Board | `/projects/{project_id}/missions` | Liste pilotee des missions |
| Mission Detail | `/projects/{project_id}/missions/{mission_id}` | Fiche complete d'une mission |
| Lock Center | `/projects/{project_id}/locks` | Supervision des verrous |
| Validation Queue | `/projects/{project_id}/validations` | File des validations attendues |
| Report Library | `/projects/{project_id}/reports` | Bibliotheque des rapports |
| Event Timeline | `/projects/{project_id}/events` | Journal d'evenements |
| Governance Center | `/projects/{project_id}/governance` | Roles, regles et sources d'autorite |
| Life Hub | `/projects/{project_id}/life-hub` | Route cible placeholder sans branchement metier |
| Admin Center | `/admin` | Administration transversale future |

---

# 6. Vues secondaires

## 6.1 Dashboard

Vues secondaires :

- Missions actives ;
- Missions bloquees ;
- Validations attendues ;
- Verrous critiques ;
- Escalades ouvertes ;
- Evenements recents.

Relations :

- une mission active pointe vers `Mission Detail` ;
- une validation attendue pointe vers `Validation Detail` ;
- un verrou critique pointe vers `Lock Detail` ;
- une escalade pointe vers la mission concernee et son historique.

## 6.2 Mission Board

Vues secondaires :

- Liste toutes missions ;
- Missions par etat ;
- Missions par agent ;
- Missions bloquees ;
- Missions en validation ;
- Missions terminales.

Relations :

- chaque ligne ouvre `Mission Detail` ;
- les filtres d'etat reposent sur les etats canoniques ;
- les missions bloquees relient vers les conflits, dependances ou escalades.

## 6.3 Mission Detail

Vues secondaires :

- Synthese ;
- Perimetre ;
- Livrables ;
- Etat et transitions ;
- Agent et attribution ;
- Verrou ;
- Rapports ;
- Validations ;
- Evenements ;
- Decisions et escalades.

Relations :

- `Etat et transitions` relie au State Model ;
- `Verrou` relie a `Lock Detail` ;
- `Rapports` relie a `Report Detail` ;
- `Validations` relie a `Validation Detail` ;
- `Evenements` relie a `Event Timeline` filtre sur la mission.

## 6.4 Lock Center

Vues secondaires :

- Verrous actifs ;
- Verrous par mission ;
- Verrous par perimetre ;
- Conflits de verrou ;
- Verrous orphelins ;
- Historique de liberation.

Relations :

- un verrou pointe vers sa mission ;
- un conflit de verrou pointe vers les missions concurrentes ;
- un verrou orphelin pointe vers une escalade.

## 6.5 Validation Queue

Vues secondaires :

- Validations techniques ;
- Validations documentaires ;
- Validations humaines ;
- Revisions demandees ;
- Rejets ;
- Historique de validation.

Relations :

- une validation pointe vers la mission et le rapport ;
- une revision demandee pointe vers `Mission Detail` et `Report Detail` ;
- une validation humaine positive peut mener vers l'etat `ACCEPTED`.

## 6.6 Report Library

Vues secondaires :

- Rapports par mission ;
- Rapports par agent ;
- Rapports soumis ;
- Rapports rejetes ;
- Rapports acceptes ;
- Artefacts associes.

Relations :

- un rapport pointe vers sa mission ;
- un rapport pointe vers ses validations ;
- un artefact pointe vers son perimetre documentaire.

## 6.7 Event Timeline

Vues secondaires :

- Evenements projet ;
- Evenements mission ;
- Transitions d'etat ;
- Operations de verrou ;
- Operations de validation ;
- Erreurs et conflits ;
- Audit par acteur.

Relations :

- un evenement pointe vers l'objet concerne ;
- une transition pointe vers l'etat source et l'etat cible ;
- une erreur pointe vers le code d'erreur canonique.

## 6.8 Governance Center

Vues secondaires :

- Roles et permissions ;
- Sources de verite ;
- Regles d'orchestration ;
- Etats canoniques ;
- Transitions autorisees ;
- Matrice d'autorisation ;
- Conflits et escalades.

Relations :

- un role pointe vers ses operations autorisees ;
- une source de verite pointe vers le document de reference ;
- une transition pointe vers le State Model et le Workflow.

## 6.9 Admin Center

Vues secondaires futures :

- Projets ;
- Integrations ;
- Tokens de service ;
- Parametres d'audit ;
- Limites d'appel ;
- Exports.

Ces vues sont futures et ne doivent pas devenir necessaires pour l'execution V1 minimale.

## 6.10 Life Hub

Vue placeholder :

- Page cible Life Hub.

Relations :

- aucune relation metier ;
- aucune donnee metier ;
- aucun branchement API, service, runtime ou source de verite ;
- aucun filtre, sous-etat ou action metier.

---

# 7. Sitemap

```text
/projects
  /{project_id}
    /dashboard
    /missions
      /new
      /{mission_id}
        /summary
        /scope
        /deliverables
        /state
        /agent
        /lock
        /reports
          /{report_id}
        /validations
          /{validation_id}
        /events
        /escalations
    /locks
      /{lock_id}
    /validations
      /technical
      /documentary
      /human
      /{validation_id}
    /reports
      /{report_id}
    /events
      /{event_id}
    /governance
      /roles
      /permissions
      /sources
      /states
      /transitions
      /authorization
      /conflicts
    /life-hub
/admin
  /projects
  /integrations
  /service-tokens
  /audit
```

---

# 8. Navigation Tree

```text
Project Selector
  Dashboard
  Missions
    All Missions
    Active Missions
    Blocked Missions
    In Validation
    Terminal Missions
    Mission Detail
      Summary
      Scope
      Deliverables
      State
      Agent
      Lock
      Reports
      Validations
      Events
      Escalations
  Locks
    Active Locks
    Lock Conflicts
    Orphan Locks
    Lock History
  Validations
    Technical
    Documentary
    Human
    Revision Requested
    Validation History
  Reports
    By Mission
    By Agent
    Submitted
    Accepted
    Rejected
  Events
    Project Timeline
    Mission Timeline
    State Changes
    Lock Events
    Validation Events
    Error Events
  Governance
    Roles
    Permissions
    Sources of Truth
    Canonical States
    Allowed Transitions
    Authorization Matrix
    Conflict Rules
  Life Hub
    Placeholder
  Admin
    Projects
    Integrations
    Service Tokens
    Audit Settings
```

---

# 9. Taxonomie

## 9.1 Entites de navigation

| Terme | Definition | Parent |
| --- | --- | --- |
| Project | Contexte d'isolation operationnelle | Racine |
| Mission | Unite de travail gouvernee | Project |
| Agent | Role responsable ou contributeur | Mission |
| State | Etat canonique d'une mission | Mission |
| Transition | Passage autorise entre deux etats | State |
| Lock | Verrou de perimetre | Mission ou Project |
| Scope | Perimetre autorise ou verrouille | Mission ou Lock |
| Report | Rapport produit par un agent | Mission |
| Deliverable | Element attendu ou produit | Mission ou Report |
| Validation | Controle technique, documentaire ou humain | Mission ou Report |
| Event | Trace immuable d'une operation | Project ou Mission |
| Escalation | Blocage soumis a autorite | Mission |
| Conflict | Incompatibilite de perimetre, verrou, priorite ou autorite | Mission ou Lock |
| Source of Truth | Document d'autorite | Governance |
| Role | Capacite operationnelle d'un acteur | Governance |
| Permission | Operation autorisee | Role |

## 9.2 Etats utilises comme facettes

Les etats canoniques servent de facettes de navigation :

- `DRAFT`
- `READY`
- `ASSIGNED`
- `LOCKED`
- `RUNNING`
- `WAITING_INPUT`
- `WAITING_DEPENDENCY`
- `ESCALATED`
- `SUBMITTED`
- `TECHNICAL_VALIDATION`
- `DOCUMENTARY_VALIDATION`
- `HUMAN_VALIDATION`
- `NEEDS_REVISION`
- `ACCEPTED`
- `REJECTED`
- `FAILED`
- `CANCELLED`

## 9.3 Groupes d'etats pour navigation

| Groupe | Etats inclus |
| --- | --- |
| Preparation | `DRAFT`, `READY`, `ASSIGNED` |
| Execution | `LOCKED`, `RUNNING` |
| Blocage | `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED`, `FAILED` |
| Validation | `SUBMITTED`, `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION` |
| Terminal | `ACCEPTED`, `REJECTED`, `CANCELLED` |

## 9.4 Types de validation

| Type | Objet |
| --- | --- |
| Technical | Controle de schema, structure, contrat, coherence technique |
| Documentary | Controle de perimetre documentaire, sources et coherence |
| Human | Decision par autorite competente |

## 9.5 Types de conflits

| Type | Objet |
| --- | --- |
| Scope Conflict | Perimetres incompatibles |
| Authority Conflict | Autorite manquante ou contradictoire |
| Priority Conflict | Priorites concurrentes |
| Lock Conflict | Verrou concurrent |
| Deliverable Conflict | Livrable absent, supplementaire ou contradictoire |
| Documentary Conflict | Sources incompatibles |
| Dependency Conflict | Dependance absente ou ambigue |
| Validation Conflict | Controle ou validation contradictoire |

---

# 10. Niveaux de navigation

| Niveau | Nom | Description | Exemple |
| --- | --- | --- | --- |
| N0 | Projet | Selection du contexte d'isolation | `VEEDDA` |
| N1 | Espace fonctionnel | Domaine de travail principal | Missions, Locks, Validations |
| N2 | Collection | Liste filtree d'objets | Missions bloquees |
| N3 | Detail objet | Fiche d'un objet unique | Mission Detail |
| N4 | Section detail | Sous-section de l'objet | Verrou, Rapports, Events |
| N5 | Action contextuelle | Action autorisee par role et etat | Demander transition |

Regle :

Une action N5 ne doit jamais etre exposee sans les informations N3 ou N4 necessaires a sa comprehension.

---

# 11. Relations entre vues

| Vue source | Relation | Vue cible |
| --- | --- | --- |
| Dashboard | Mission active | Mission Detail |
| Dashboard | Validation attendue | Validation Detail |
| Dashboard | Verrou critique | Lock Detail |
| Dashboard | Escalade ouverte | Mission Detail / Escalations |
| Mission Board | Selection mission | Mission Detail |
| Mission Detail | Verrou associe | Lock Detail |
| Mission Detail | Rapport associe | Report Detail |
| Mission Detail | Validation associee | Validation Detail |
| Mission Detail | Historique | Event Timeline filtre mission |
| Lock Center | Mission verrouillee | Mission Detail |
| Lock Center | Conflit de verrou | Missions concurrentes |
| Validation Queue | Mission a valider | Mission Detail |
| Validation Queue | Rapport a verifier | Report Detail |
| Report Library | Mission source | Mission Detail |
| Event Timeline | Objet concerne | Mission, Lock, Report ou Validation |
| Governance Center | Source de verite | Document de reference |

---

# 12. Acces rapides

## 12.1 Acces rapides globaux

| Acces rapide | Cible | Condition |
| --- | --- | --- |
| Nouvelle mission | Mission creation | Role autorise a creer une mission |
| Missions bloquees | Mission Board filtre blocage | Projet actif |
| Validations en attente | Validation Queue | Projet actif |
| Verrous actifs | Lock Center | Projet actif |
| Escalades ouvertes | Mission Board filtre escalade | Projet actif |
| Timeline projet | Event Timeline | Projet actif |

## 12.2 Acces rapides depuis Mission Detail

| Acces rapide | Cible |
| --- | --- |
| Voir verrou | Section Lock ou Lock Detail |
| Voir rapports | Section Reports |
| Voir validations | Section Validations |
| Voir evenements | Event Timeline filtre mission |
| Voir transitions possibles | Section State |
| Voir escalades | Section Escalations |

## 12.3 Acces rapides depuis Validation Queue

| Acces rapide | Cible |
| --- | --- |
| Ouvrir mission | Mission Detail |
| Ouvrir rapport | Report Detail |
| Voir historique | Event Timeline filtre mission |
| Voir sources | Governance / Sources |

---

# 13. Breadcrumbs

## 13.1 Regle generale

Le breadcrumb suit la hierarchie :

```text
Project > Espace > Collection > Objet > Section
```

## 13.2 Modeles

| Vue | Breadcrumb |
| --- | --- |
| Dashboard | `Project > Dashboard` |
| Mission Board | `Project > Missions` |
| Mission Detail | `Project > Missions > {mission_id}` |
| Mission Section | `Project > Missions > {mission_id} > {section}` |
| Report Detail | `Project > Reports > {report_id}` |
| Report depuis mission | `Project > Missions > {mission_id} > Reports > {report_id}` |
| Lock Detail | `Project > Locks > {lock_id}` |
| Validation Detail | `Project > Validations > {validation_id}` |
| Event Detail | `Project > Events > {event_id}` |
| Governance Role | `Project > Governance > Roles > {role_id}` |
| Governance Source | `Project > Governance > Sources > {source_id}` |
| Life Hub | `Project > Life Hub` |
| Admin Project | `Admin > Projects > {project_id}` |

## 13.3 Regles de retour

Le retour primaire suit le breadcrumb.

Le retour secondaire peut pointer vers la collection filtree d'origine si elle est connue.

Exemple :

- depuis une mission ouverte via `Missions bloquees`, retour primaire vers `Missions`, retour secondaire vers filtre `Blocked`.

---

# 14. Filtres globaux

## 14.1 Filtres persistants

| Filtre | Portee | Obligatoire |
| --- | --- | --- |
| Project | Toutes vues operationnelles | Oui |
| State group | Missions, Dashboard, Events | Non |
| State | Missions, Events | Non |
| Agent | Missions, Reports, Events | Non |
| Role | Governance, Events | Non |
| Lock status | Dashboard, Locks, Missions | Non |
| Validation type | Validations, Reports, Events | Non |
| Date range | Events, Reports, Validations | Non |
| Conflict type | Dashboard, Missions, Locks | Non |
| Search | Collections principales | Non |

## 14.2 Filtres par espace

| Espace | Filtres specifiques |
| --- | --- |
| Missions | Etat, groupe d'etat, agent, priorite, verrou, blocage, validation |
| Verrous | Statut verrou, perimetre, mission, conflit, expiration |
| Validations | Type, statut, validateur, mission, date |
| Rapports | Mission, agent, statut, type de livrable |
| Evenements | Type evenement, acteur, objet, date, correlation_id |
| Gouvernance | Role, permission, source, niveau d'autorite |
| Life Hub | Aucun filtre metier |

## 14.3 Regles de filtres

Le filtre `Project` ne doit jamais etre implicite dans une operation de mutation.

Un filtre ne doit pas masquer un conflit ou une escalade critique sur le Dashboard.

Les filtres appliques doivent etre visibles et reinitialisables.

Une URL partageable doit pouvoir reconstruire les filtres principaux.

---

# 15. Architecture des informations

## 15.1 Mission Detail

Information prioritaire :

1. identifiant mission ;
2. objectif ;
3. etat courant ;
4. agent responsable ;
5. perimetre autorise ;
6. livrables attendus ;
7. verrou actif ;
8. blocages ou conflits ;
9. transitions possibles ;
10. validations ;
11. rapports ;
12. evenements.

## 15.2 Lock Detail

Information prioritaire :

1. identifiant verrou ;
2. mission associee ;
3. perimetre verrouille ;
4. proprietaire ;
5. statut ;
6. condition de liberation ;
7. conflits eventuels ;
8. historique.

## 15.3 Validation Detail

Information prioritaire :

1. identifiant validation ;
2. type de validation ;
3. mission associee ;
4. rapport concerne ;
5. validateur ;
6. resultat ;
7. commentaire ou motif ;
8. transition possible ;
9. date ;
10. evenement associe.

## 15.4 Report Detail

Information prioritaire :

1. identifiant rapport ;
2. mission associee ;
3. agent auteur ;
4. livrables declares ;
5. fichiers ou artefacts concernes ;
6. statut de validation ;
7. conflits signales ;
8. evenements associes.

## 15.5 Event Detail

Information prioritaire :

1. identifiant evenement ;
2. type evenement ;
3. acteur ;
4. objet concerne ;
5. horodatage ;
6. etat source si applicable ;
7. etat cible si applicable ;
8. resultat ;
9. request_id ;
10. correlation_id.

---

# 16. Regles d'acces aux vues

| Role | Acces principal |
| --- | --- |
| Product Owner | Dashboard, Missions, Validations humaines, Governance |
| Architecte | Dashboard, Missions, Locks, Validations, Events, Governance |
| Orchestrator | Dashboard, Missions, Locks, Events |
| Agent | Missions assignees, Reports, Events autorises |
| Validator Technical | Validation Queue technique, Reports, Events autorises |
| Validator Documentary | Validation Queue documentaire, Reports, Governance sources |
| Viewer | Lecture des vues autorisees par projet |
| Service Admin | Admin Center, audit technique autorise |

Une vue peut etre visible en lecture sans rendre ses actions disponibles.

---

# 17. Critere d'arret

La mission `ORCH-UX-003` est complete lorsque le document definit :

- les espaces fonctionnels ;
- les vues principales ;
- les vues secondaires ;
- les relations entre vues ;
- les niveaux de navigation ;
- les acces rapides ;
- les breadcrumbs ;
- les filtres globaux ;
- le Sitemap ;
- le Navigation Tree ;
- la Taxonomie ;
- l'Architecture des informations.

Statut propose : `DRAFT_VALIDABLE`.
