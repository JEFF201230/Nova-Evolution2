# ORCHESTRATOR CANONICAL DICTIONARY V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : ORCH-FOUNDATION-001

Agent : Canonical Language Architect

Niveau : Level 0 - Source of Truth

---

# 1. Objectif

Ce document definit le vocabulaire officiel de l'ORCHESTRATOR V1.

Il constitue la source de verite terminologique de niveau 0.

Son objectif est d'empecher :

- la definition concurrente d'un meme terme dans plusieurs documents ;
- l'introduction de synonymes operationnels ;
- l'usage ambigu d'un etat, evenement, commande, reponse, type ou code d'erreur ;
- l'interpretation libre du langage d'orchestration.

Ce document ne decrit aucune implementation, ne contient aucun code et ne cree aucune regle metier nouvelle.

---

# 2. Principes Terminologiques

## 2.1 Terme canonique unique

Un concept operationnel possede un seul nom canonique.

Un autre nom peut exister uniquement comme terme legacy, non operationnel, et doit etre mappe explicitement dans un document de migration ou de compatibilite.

## 2.2 Aucune synonymie operationnelle

Deux termes differents ne doivent pas declencher la meme action ou representer le meme etat.

## 2.3 Nom stable

Un terme canonique ne doit pas changer de signification entre deux documents.

## 2.4 Niveau de langage

Le vocabulaire est classe par niveau :

- Level 0 : dictionnaire canonique ;
- Level 1 : state model, architecture, workflow, gouvernance ;
- Level 2 : missions, rapports, specifications ;
- Level 3 : implementation future.

## 2.5 Verification automatique

Tout futur document ORCHESTRATOR doit pouvoir etre controle en verifiant :

- que les termes operationnels existent dans ce dictionnaire ;
- que les etats et transitions utilisent les noms canoniques ;
- qu'aucun synonyme operationnel n'est introduit.

---

# 3. Etats

## 3.1 Liste Officielle

Les etats canoniques officiels sont :

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

Aucun autre nom ne doit etre utilise comme etat operationnel.

## 3.2 Definitions

| Etat | Definition | Utilisation | Niveau | Terminal | Transitions autorisees |
| --- | --- | --- | --- | --- | --- |
| `DRAFT` | Mission en cours de formulation. | Preparation avant execution. | Mission | Non | `READY`, `CANCELLED` |
| `READY` | Mission complete et eligible a l'attribution. | Mission executable mais non encore affectee. | Mission | Non | `ASSIGNED`, `CANCELLED` |
| `ASSIGNED` | Mission affectee a un agent principal. | Responsabilite agent fixee avant verrouillage. | Mission | Non | `LOCKED`, `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED`, `CANCELLED` |
| `LOCKED` | Mission protegee par un verrou actif. | Protection du perimetre avant demarrage. | Mission / Lock | Non | `RUNNING`, `WAITING_DEPENDENCY`, `ESCALATED`, `CANCELLED` |
| `RUNNING` | Mission en cours d'execution. | Travail agent actif dans le perimetre autorise. | Mission | Non | `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED`, `FAILED`, `SUBMITTED`, `CANCELLED` |
| `WAITING_INPUT` | Mission suspendue en attente d'information ou decision. | Blocage reprenable par information. | Mission | Non | `RUNNING`, `ESCALATED`, `FAILED`, `CANCELLED` |
| `WAITING_DEPENDENCY` | Mission suspendue en attente de dependance. | Blocage reprenable par disponibilite d'une dependance. | Mission | Non | `RUNNING`, `ESCALATED`, `FAILED`, `CANCELLED` |
| `ESCALATED` | Mission suspendue pour arbitrage. | Blocage gouverne par autorite. | Mission / Governance | Non | `RUNNING`, `READY`, `FAILED`, `REJECTED`, `CANCELLED` |
| `SUBMITTED` | Livrables produits et soumis au controle. | Separation production / validation. | Mission / Report | Non | `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION`, `REJECTED` |
| `TECHNICAL_VALIDATION` | Controle technique ou structurel en cours. | Validation de format, schema, artefacts. | Validation | Non | `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION`, `WAITING_INPUT`, `ESCALATED`, `REJECTED` |
| `DOCUMENTARY_VALIDATION` | Controle documentaire en cours. | Validation de coherence documentaire. | Validation | Non | `HUMAN_VALIDATION`, `NEEDS_REVISION`, `WAITING_INPUT`, `ESCALATED`, `REJECTED` |
| `HUMAN_VALIDATION` | Validation par autorite competente. | Decision humaine avant cloture finale. | Validation | Non | `ACCEPTED`, `NEEDS_REVISION`, `REJECTED`, `WAITING_INPUT`, `ESCALATED` |
| `NEEDS_REVISION` | Correction bornee demandee. | Reprise dans le meme perimetre. | Mission / Validation | Non | `RUNNING`, `ESCALATED`, `REJECTED`, `CANCELLED` |
| `ACCEPTED` | Mission acceptee par autorite finale. | Cloture positive. | Terminal | Oui | Aucune |
| `REJECTED` | Mission refusee. | Cloture negative. | Terminal | Oui | Aucune |
| `FAILED` | Mission impossible dans le perimetre autorise. | Blocage factuel requalifiable. | Mission | Non | `READY`, `CANCELLED` |
| `CANCELLED` | Mission abandonnee par autorite competente. | Cloture par annulation. | Terminal | Oui | Aucune |

---

# 4. Evenements

## 4.1 Liste Officielle

Les evenements canoniques officiels sont :

- `MissionCreated`
- `MissionAccepted`
- `MissionRejected`
- `MissionCancelled`
- `MissionRequalified`
- `AgentAssigned`
- `AgentStarted`
- `AgentStopped`
- `InputRequired`
- `InputProvided`
- `DependencyRequired`
- `DependencyAvailable`
- `DependencyUnavailable`
- `EscalationRequested`
- `EscalationResolved`
- `EscalationFailed`
- `LockGranted`
- `LockRenewed`
- `LockReleased`
- `LockExpired`
- `LockConflictDetected`
- `ReportSubmitted`
- `TechnicalValidationStarted`
- `TechnicalValidationAccepted`
- `TechnicalValidationRejectedRecoverable`
- `TechnicalValidationRejectedFinal`
- `DocumentaryValidationStarted`
- `DocumentaryValidationAccepted`
- `DocumentaryValidationRejectedRecoverable`
- `DocumentaryValidationRejectedFinal`
- `HumanValidationStarted`
- `HumanApproved`
- `HumanRejected`
- `FinalValidationAccepted`
- `FinalValidationRejected`
- `ValidationRejected`
- `RevisionRequested`
- `RevisionStarted`
- `RevisionRejected`
- `ExecutionFailed`
- `BlockingUnresolved`

## 4.2 Definitions

| Evenement | Definition | Producteur | Consommateur | Parametres | Declencheur |
| --- | --- | --- | --- | --- | --- |
| `MissionCreated` | Creation d'une mission en `DRAFT`. | Product Owner, Architecte, Orchestrator | State Manager | `mission_id`, `mission_type`, `authority` | Formulation initiale |
| `MissionAccepted` | Mission jugee complete pour execution. | Mission Intake, Architecte | State Manager | `mission_id` | Passage vers `READY` |
| `MissionRejected` | Mission refusee avant execution. | Autorite competente | Orchestrator | `mission_id`, `reason` | Rejet d'une mission non executable |
| `MissionCancelled` | Annulation par autorite competente. | Product Owner, Architecte | State Manager, Lock Manager | `mission_id`, `reason` | Abandon volontaire |
| `MissionRequalified` | Requalification sans changement d'objectif. | Product Owner, Architecte | State Manager | `mission_id`, `reason` | Reprise depuis `FAILED` ou `ESCALATED` |
| `AgentAssigned` | Agent principal designe. | Orchestrator | State Manager, Dispatcher | `mission_id`, `agent_id` | Affectation |
| `AgentStarted` | Agent demarre la mission verrouillee. | Agent principal, Orchestrator | State Manager | `mission_id`, `agent_id` | Demarrage dans `LOCKED` |
| `AgentStopped` | Agent arrete son execution. | Agent principal, Orchestrator | State Manager | `mission_id`, `agent_id`, `reason` | Arret non terminal ou terminal |
| `InputRequired` | Information ou decision requise. | Agent, Validator, Orchestrator | State Manager, Authority | `mission_id`, `input_type`, `reason` | Blocage par information |
| `InputProvided` | Information attendue recue. | Autorite, demandeur | State Manager, Agent | `mission_id`, `input_ref` | Reprise depuis `WAITING_INPUT` |
| `DependencyRequired` | Dependance explicite requise. | Agent, Orchestrator | State Manager | `mission_id`, `dependency_ref` | Blocage par dependance |
| `DependencyAvailable` | Dependance attendue disponible. | Orchestrator, responsable dependance | State Manager, Agent | `mission_id`, `dependency_ref` | Reprise depuis `WAITING_DEPENDENCY` |
| `DependencyUnavailable` | Dependance definitivement indisponible. | Orchestrator, responsable dependance | State Manager | `mission_id`, `dependency_ref`, `reason` | Echec de dependance |
| `EscalationRequested` | Arbitrage requis. | Agent, Orchestrator, Validator | Authority, State Manager | `mission_id`, `reason`, `authority` | Conflit ou autorite manquante |
| `EscalationResolved` | Arbitrage leve le blocage. | Autorite competente | State Manager, Agent | `mission_id`, `decision_ref` | Reprise apres arbitrage |
| `EscalationFailed` | Arbitrage constate l'impossibilite. | Autorite competente | State Manager | `mission_id`, `decision_ref` | Echec apres escalade |
| `LockGranted` | Verrou accorde. | Lock Manager | State Manager, Orchestrator | `mission_id`, `lock_id`, `scope` | Acquisition du verrou |
| `LockRenewed` | Verrou renouvele. | Lock Manager | State Manager, Orchestrator | `mission_id`, `lock_id`, `scope` | Confirmation de perimetre actif |
| `LockReleased` | Verrou libere. | Lock Manager, autorite | State Manager, Orchestrator | `mission_id`, `lock_id`, `reason` | Etat terminal ou instruction explicite |
| `LockExpired` | Verrou expire. | Lock Manager | State Manager, Orchestrator | `mission_id`, `lock_id`, `reason` | Condition d'expiration explicite |
| `LockConflictDetected` | Conflit de verrou detecte. | Lock Manager, Orchestrator | State Manager, Authority | `mission_id`, `lock_id`, `conflict_scope` | Collision de verrou |
| `ReportSubmitted` | Rapport ou livrables soumis. | Agent principal | Report Store, State Manager | `mission_id`, `report_id` | Fin de production agent |
| `TechnicalValidationStarted` | Controle technique demarre. | Validator | State Manager | `mission_id`, `report_id` | Debut controle technique |
| `TechnicalValidationAccepted` | Controle technique positif. | Validator | State Manager | `mission_id`, `report_id` | Validation technique |
| `TechnicalValidationRejectedRecoverable` | Rejet technique corrigeable. | Validator | State Manager, Agent | `mission_id`, `reason` | Correction technique possible |
| `TechnicalValidationRejectedFinal` | Rejet technique final. | Validator | State Manager | `mission_id`, `reason` | Non-conformite non corrigeable |
| `DocumentaryValidationStarted` | Controle documentaire demarre. | Documentation Agent, Architecte | State Manager | `mission_id`, `report_id` | Debut controle documentaire |
| `DocumentaryValidationAccepted` | Controle documentaire positif. | Documentation Agent, Architecte | State Manager | `mission_id`, `report_id` | Validation documentaire |
| `DocumentaryValidationRejectedRecoverable` | Rejet documentaire corrigeable. | Documentation Agent, Architecte | State Manager, Agent | `mission_id`, `reason` | Correction documentaire possible |
| `DocumentaryValidationRejectedFinal` | Rejet documentaire final. | Documentation Agent, Architecte | State Manager | `mission_id`, `reason` | Non-conformite non corrigeable |
| `HumanValidationStarted` | Autorite humaine saisie. | Orchestrator | Autorite, State Manager | `mission_id`, `authority` | Passage en validation humaine |
| `HumanApproved` | Approbation humaine. | Autorite competente | State Manager | `mission_id`, `authority`, `decision_ref` | Accord humain |
| `HumanRejected` | Refus humain. | Autorite competente | State Manager | `mission_id`, `authority`, `decision_ref` | Refus humain |
| `FinalValidationAccepted` | Validation finale acceptee. | Autorite finale | State Manager, Lock Manager | `mission_id`, `decision_ref` | Passage vers `ACCEPTED` |
| `FinalValidationRejected` | Validation finale refusee. | Autorite finale | State Manager, Lock Manager | `mission_id`, `decision_ref` | Passage vers `REJECTED` |
| `ValidationRejected` | Rejet par controle ou arbitrage. | Validator, autorite | State Manager | `mission_id`, `reason` | Rejet fonde |
| `RevisionRequested` | Revision bornee demandee. | Validator, autorite | Agent, State Manager | `mission_id`, `reason` | Correction possible |
| `RevisionStarted` | Reprise de correction demarree. | Agent principal | State Manager | `mission_id` | Retour vers execution |
| `RevisionRejected` | Revision refusee ou impossible. | Validator, autorite | State Manager | `mission_id`, `reason` | Correction impossible |
| `ExecutionFailed` | Execution impossible dans le perimetre. | Agent principal, Orchestrator | State Manager | `mission_id`, `reason` | Echec non contournable |
| `BlockingUnresolved` | Blocage non resolu. | Orchestrator, autorite | State Manager | `mission_id`, `reason` | Passage vers `FAILED` |

---

# 5. Commandes

Une commande est une intention explicite adressee a l'orchestrateur ou a un composant conceptuel.

| Commande | Definition | Entree minimale | Sortie attendue |
| --- | --- | --- | --- |
| `CreateMission` | Creer une mission en `DRAFT`. | `mission_id`, objectif, autorite | `MissionCreated` |
| `AcceptMission` | Marquer une mission comme executable. | `mission_id` | `MissionAccepted` |
| `AssignMission` | Affecter un agent principal. | `mission_id`, `agent_id` | `AgentAssigned` |
| `StartMission` | Demarrer une mission verrouillee. | `mission_id`, `agent_id` | `AgentStarted` |
| `PauseMission` | Suspendre une mission. | `mission_id`, cause | `InputRequired`, `DependencyRequired` ou `EscalationRequested` |
| `ResumeMission` | Reprendre une mission suspendue. | `mission_id`, cause levee | `InputProvided`, `DependencyAvailable` ou `EscalationResolved` |
| `CancelMission` | Annuler une mission. | `mission_id`, autorite, motif | `MissionCancelled` |
| `RequalifyMission` | Requalifier une mission bloquee ou echouee. | `mission_id`, autorite, motif | `MissionRequalified` |
| `SubmitReport` | Soumettre un rapport. | `mission_id`, `report_id` | `ReportSubmitted` |
| `ValidateReport` | Lancer une validation de rapport. | `mission_id`, `report_id`, type validation | Evenement de validation |
| `ApproveMission` | Approuver la mission en validation finale. | `mission_id`, autorite | `FinalValidationAccepted` |
| `RejectMission` | Rejeter la mission. | `mission_id`, autorite, motif | `FinalValidationRejected` ou `ValidationRejected` |
| `RequestRevision` | Demander une correction bornee. | `mission_id`, motif | `RevisionRequested` |
| `StartRevision` | Demarrer une correction. | `mission_id` | `RevisionStarted` |
| `AcquireLock` | Demander un verrou. | `mission_id`, perimetre | `LockGranted` ou `Conflict` |
| `RenewLock` | Renouveler un verrou. | `mission_id`, `lock_id` | `LockRenewed` |
| `ReleaseLock` | Liberer un verrou. | `mission_id`, `lock_id`, motif | `LockReleased` |
| `EscalateMission` | Demander un arbitrage. | `mission_id`, autorite, motif | `EscalationRequested` |
| `ResolveEscalation` | Resoudre une escalade. | `mission_id`, decision | `EscalationResolved` ou `EscalationFailed` |

---

# 6. Reponses

| Reponse | Definition | Usage |
| --- | --- | --- |
| `Success` | Commande executee avec resultat attendu. | Reponse generique positive. |
| `Accepted` | Demande acceptee pour traitement ou validation finale positive selon contexte. | Reponse a une commande ou decision. |
| `Rejected` | Demande refusee. | Reponse negative definitive. |
| `Retry` | Operation retentable sans changement de mission. | Reponse temporaire. |
| `Conflict` | Conflit detecte. | Verrou, perimetre, priorite, autorite. |
| `Timeout` | Delai atteint. | Attente ou dependance non resolue dans le temps prevu. |
| `Forbidden` | Action non autorisee. | Perimetre, role ou autorite insuffisante. |
| `Locked` | Perimetre deja verrouille. | Tentative concurrente. |
| `AlreadyExists` | Ressource deja existante. | Mission, rapport, verrou, reference. |
| `NotFound` | Ressource introuvable. | Mission, agent, rapport, verrou. |
| `InvalidState` | Etat courant incompatible avec la commande. | Transition interdite. |
| `InvalidEvent` | Evenement non reconnu ou non autorise. | Transition non canonique. |
| `InvalidScope` | Perimetre absent, ambigu ou interdit. | Controle de mission. |
| `MissingAuthority` | Autorite requise absente. | Validation, arbitrage, exception. |
| `MissingDependency` | Dependance requise absente. | Attente ou echec de dependance. |
| `InvalidReport` | Rapport non conforme. | Validation de rapport. |

---

# 7. Types de Validation

| Type | Definition | Etat associe |
| --- | --- | --- |
| `Technical` | Controle structurel, schema, format ou artefact. | `TECHNICAL_VALIDATION` |
| `Documentary` | Controle documentaire, references, coherence et statut. | `DOCUMENTARY_VALIDATION` |
| `Business` | Controle d'adequation au besoin metier ou mission. | `HUMAN_VALIDATION` ou validation specifique autorisee |
| `Human` | Controle par autorite competente. | `HUMAN_VALIDATION` |
| `Final` | Decision finale d'acceptation ou rejet. | `ACCEPTED` ou `REJECTED` |

---

# 8. Types de Verrou

| Type | Definition |
| --- | --- |
| `Mission` | Verrou portant sur une mission. |
| `File` | Verrou portant sur un fichier. |
| `Directory` | Verrou portant sur un dossier. |
| `Registry` | Verrou portant sur un registre. |
| `Decision` | Verrou portant sur une decision de gouvernance. |
| `Project` | Verrou portant sur un projet ou sous-projet. |
| `Exclusive` | Verrou interdisant toute autre execution concurrente sur le meme perimetre. |
| `Shared` | Verrou partage autorise uniquement si le plan d'orchestration le prevoit explicitement. |

---

# 9. Types de Mission

| Type | Definition |
| --- | --- |
| `Architecture` | Mission de conception ou specification d'architecture. |
| `Implementation` | Mission de modification ou creation technique. |
| `Documentation` | Mission documentaire. |
| `Audit` | Mission d'analyse critique factuelle. |
| `Review` | Mission de revue qualitative ou conformite. |
| `Synchronization` | Mission d'alignement entre documents ou artefacts. |
| `Migration` | Mission de transfert controle d'un modele vers un autre. |
| `Validation` | Mission de controle d'acceptation. |
| `Testing` | Mission de verification par tests ou scenarios. |
| `Certification` | Mission de decision de conformite baseline. |

---

# 10. Types de Rapport

| Type | Definition |
| --- | --- |
| `Audit Report` | Rapport d'audit critique et factuel. |
| `Review Report` | Rapport de revue avec constats et verdict. |
| `Implementation Report` | Rapport de modifications realisees. |
| `Validation Report` | Rapport de validation ou rejet. |
| `Sync Report` | Rapport de synchronisation documentaire ou terminologique. |
| `Certification Report` | Rapport de certification baseline. |
| `Blocking Report` | Rapport de blocage factuel. |
| `Conflict Report` | Rapport de conflit et escalade. |

---

# 11. Codes d'Erreur

Nomenclature officielle :

Format : `ORCH-ERR-XXX`

| Code | Signification | Reponse recommandee |
| --- | --- | --- |
| `ORCH-ERR-001` | Mission introuvable. | `NotFound` |
| `ORCH-ERR-002` | Mission deja existante. | `AlreadyExists` |
| `ORCH-ERR-003` | Etat courant invalide. | `InvalidState` |
| `ORCH-ERR-004` | Transition interdite. | `InvalidState` |
| `ORCH-ERR-005` | Evenement non canonique. | `InvalidEvent` |
| `ORCH-ERR-006` | Agent introuvable. | `NotFound` |
| `ORCH-ERR-007` | Agent non autorise pour la mission. | `Forbidden` |
| `ORCH-ERR-008` | Perimetre absent. | `InvalidScope` |
| `ORCH-ERR-009` | Perimetre ambigu. | `InvalidScope` |
| `ORCH-ERR-010` | Perimetre interdit. | `Forbidden` |
| `ORCH-ERR-011` | Verrou deja actif. | `Locked` |
| `ORCH-ERR-012` | Verrou introuvable. | `NotFound` |
| `ORCH-ERR-013` | Conflit de verrou. | `Conflict` |
| `ORCH-ERR-014` | Verrou expire. | `Timeout` |
| `ORCH-ERR-015` | Autorite manquante. | `MissingAuthority` |
| `ORCH-ERR-016` | Dependence manquante. | `MissingDependency` |
| `ORCH-ERR-017` | Rapport introuvable. | `NotFound` |
| `ORCH-ERR-018` | Rapport invalide. | `InvalidReport` |
| `ORCH-ERR-019` | Livrable manquant. | `InvalidReport` |
| `ORCH-ERR-020` | Livrable supplementaire non autorise. | `InvalidReport` |
| `ORCH-ERR-021` | Validation technique echouee. | `Rejected` |
| `ORCH-ERR-022` | Validation documentaire echouee. | `Rejected` |
| `ORCH-ERR-023` | Validation humaine refusee. | `Rejected` |
| `ORCH-ERR-024` | Blocage non resolu. | `Timeout` |
| `ORCH-ERR-025` | Escalade requise. | `Conflict` |
| `ORCH-ERR-026` | Terme non canonique. | `InvalidEvent` |
| `ORCH-ERR-027` | Synonyme operationnel detecte. | `InvalidEvent` |
| `ORCH-ERR-028` | Source de verite absente. | `NotFound` |
| `ORCH-ERR-029` | Reference documentaire incoherente. | `Conflict` |
| `ORCH-ERR-030` | Action interdite par critere d'arret. | `Forbidden` |

---

# 12. Glossaire

## Agent

Role d'execution ou de controle agissant dans le perimetre d'une mission.

## Agent Principal

Agent responsable du livrable principal d'une mission.

## Agent Secondaire

Agent intervenant uniquement si la mission ou le plan d'orchestration l'autorise explicitement.

## Architecture

Description structurante des composants, responsabilites, dependances et interfaces.

## Audit

Analyse critique factuelle d'un perimetre donne.

## Baseline

Etat documentaire de reference pouvant servir de base a des missions futures.

## Command

Intention explicite demandant une action a l'orchestrateur ou a un composant conceptuel.

## Context

Ensemble borne d'informations autorisees pour comprendre ou executer une mission.

## Decision

Arbitrage formel par une autorite competente.

## Dispatcher

Composant conceptuel qui transmet une mission bornee a l'agent designe.

## Event

Fait nomme qui declenche ou justifie une transition.

## Improvement Request

Demande d'amelioration conservee sans execution automatique.

## Lock

Protection logique d'un perimetre contre les executions concurrentes non autorisees.

## Mission

Unite de travail bornee, identifiee et associee a un objectif unique.

## Planner

Composant conceptuel qui ordonne les etapes autorisees d'une mission.

## Queue

Ensemble ordonne de missions en attente de traitement.

## Report

Artefact produit en sortie d'une mission.

## Response

Resultat standardise d'une commande ou operation.

## RFC

Request For Comments. Demande de commentaires ou de revue avant decision.

## State

Position canonique courante d'une mission dans son cycle de vie.

## State Model

Modele officiel des etats, transitions et evenements.

## Synchronization

Alignement controle de plusieurs documents ou artefacts sur une source de verite.

## Validator

Agent ou composant conceptuel qui controle la conformite d'un rapport, artefact ou document.

## Workflow

Sequence officielle d'etats et transitions d'une mission.

---

# 13. Critere de Conformite Terminologique

Un document ORCHESTRATOR est conforme au dictionnaire si :

- tout etat operationnel utilise un etat liste en section 3 ;
- tout evenement operationnel utilise un evenement liste en section 4 ;
- toute commande utilise un nom liste en section 5 ;
- toute reponse utilise un nom liste en section 6 ;
- tout type de validation, verrou, mission ou rapport utilise un type officiel ;
- tout code d'erreur respecte la nomenclature `ORCH-ERR-XXX` ;
- aucun synonyme operationnel n'est introduit ;
- aucun terme structurant n'est redefini localement.

---

# 14. Regle d'Usage Future

Toute nouvelle specification ORCHESTRATOR doit referencer ce dictionnaire avant d'utiliser un terme operationnel.

Un terme absent de ce dictionnaire doit etre ajoute par mission dediee avant usage operationnel.
