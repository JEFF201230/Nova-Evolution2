# MISSION ORCHESTRATION ENGINE - CANONICAL MAPPING

MISSION_ID : P15-MO-004-MISSION-ORCHESTRATION-HARMONIZATION

PROGRAM : PROGRAM-015

MISSION_ORDER : P15-MO-004

PDS : PDS-005

DATE : 2026-07-09

SCOPE : MAPPING CANONIQUE ET RESOLUTION DES ECARTS

---

# 1. Regles de lecture

| Champ | Sens |
| --- | --- |
| Etat actuel | Terme ou concept present dans `MISSION_ORCHESTRATION_ENGINE.md` |
| Etat canonique | Cible conforme aux sources de verite existantes |
| Justification | Raison de mapping ou de rejet du mapping |
| Impact | Effet sur runtime, state, event, API, domain, planning |
| Risque | Risque d'implementation si non mappe |
| Priorite | P0, P1, P2 |
| Recommandation | Action de convergence |

---

# 2. Mapping complet

| Etat actuel | Etat canonique | Justification | Impact | Risque | Priorite | Recommandation |
| --- | --- | --- | --- | --- | --- | --- |
| `Portfolio` | `Programme` ou scope de pilotage programme | Le domaine V1 ne definit pas Portfolio ; le Program Planning Model porte la logique de pilotage | Domaine, planning, gouvernance | Ambiguite structurelle | P0 | Renommer ou isoler comme couche future non runtime |
| `Program` | `Programme` | Terme proche du domaine V1, mais lifecycle et responsabilites doivent suivre le modele de domaine | Domaine, planning, certification | Confusion programme / projet / mission | P0 | Conserver le terme seulement si mapping formel au `Programme` |
| `Mission Order` | `Project` ou package de missions | Le domaine V1 n'a pas d'objet canonique Mission Order ; la coordination porte sur Project et Mission | Runtime, API, planning | Impossible de persister sans modele | P0 | Choisir un seul mapping et documenter sa portee |
| `PDS` | `Mission` ou groupe d'execution mission | Le Runtime V1 orchestre des Missions, pas des squads autonomes | Runtime, state, events | Double modele d'execution | P0 | Requalifier PDS comme concept de pilotage, pas comme etat operationnel |
| `Campaign` | `Validation` / artefact de test / campagne programme | Aucun objet canonique Campaign dans le domaine V1 | Planning, certification, API | Faux niveau d'autorite | P0 | Isoler Campaign comme artefact programme ou le faire entrer au dictionnaire par mission dediee |
| `PLANNED` | `DRAFT` | Etat de formulation initiale le plus proche du dictionnaire V1 | State, events | Divergence de transition | P0 | Mapper a `DRAFT` si contexte mission ; sinon garder comme concept legacy |
| `ACTIVE` | `RUNNING` ou `READY` selon contexte | V1 distingue readiness, assignment, lock et execution active | State, API, events | Ambiguites de progression | P0 | Interdire `ACTIVE` comme etat operationnel direct |
| `BLOCKED` | `WAITING_INPUT` / `WAITING_DEPENDENCY` / `ESCALATED` / `FAILED` | V1 separe les causes du blocage | State, events, recovery | Blocage non diagnostique | P0 | Remplacer par cause canonique |
| `SUSPENDED` | `CANCELLED` ou `ESCALATED` selon gouvernance | V1 ne retient pas un suspend generalise pour les missions | State, events, recovery | Resume non gouverne | P0 | Requalifier selon cause |
| `COMPLETE` | `ACCEPTED` ou `CLOSED` selon couche | `ACCEPTED` est l'etat positif final V1 ; `CLOSED` n'existe pas pour mission V1 | State, certification | Faux terminus | P0 | Remplacer par acceptation finale mappee |
| `APPROVED` | `ACCEPTED` pour validation finale, ou `READY` pour autorisation d'execution | Le terme est trop large sans contexte | State, API | Sur-interpretation | P1 | Remplacer selon phase de cycle |
| `PREPARING` | `DRAFT` | Preparation de mission avant activation | State | Ambiguite d'amont | P1 | Reclasser vers formulation mission |
| `WAITING` | `WAITING_INPUT` ou `WAITING_DEPENDENCY` | V1 exige la cause du wait | State, events | Blocage non actionnable | P0 | Interdire wait generic |
| `COMPLETED` | `ACCEPTED` ou `SUBMITTED` selon phase | Completion ne suffit pas pour acceptance | State, certification | Confusion completion/acceptance | P0 | Remplacer par etat de validation adequat |
| `FAILED` | `FAILED` | Cible deja presente dans V1, mais la portee doit rester mission-level | State, recovery | Confusion terminalite | P1 | Conserver seulement si portee mission |
| `STOPPED` | `CANCELLED` ou `FAILED` selon cause | V1 ne definit pas STOPPED comme etat canonique mission | State, closure | Resume indecis | P0 | Supprimer comme etat operationnel direct |
| `OPEN` | `DRAFT` ou `READY` | Etat d'ouverture de campagne n'est pas canonique V1 | State | Divergence conceptuelle | P1 | Requalifier selon objet cible |
| `PASSED` | `ACCEPTED` ou `CLOSED` selon couche | Pas d'etat canonique V1 pour Campaign passed | State, certification | Acceptance implicite | P0 | Mapper a validation finale explicite |
| `CLOSED` | `CANCELLED`, `REJECTED`, `ACCEPTED` ou `CLOSED` de programme | V1 n'utilise pas CLOSED pour mission ; le domaine V1 l'utilise pour programme/concepts | State, lifecycle | Utilisation polymorphe | P0 | Distinguer par type d'entite |
| `PortfolioActivated` | `MissionAccepted`/`ProgramActivated` ou nouveau event V2 | Aucun event canonique existant | Events, replay | Rejet event bus | P0 | Mapper vers event existant ou ajouter au dictionnaire |
| `ProgramApproved` | `MissionAccepted` ou `Decision` non mission si programme | Aucun event canonique existant | Events, API | Rejet event bus | P0 | Ajouter uniquement par mission de dictionnaire |
| `ProgramActivated` | `MissionAccepted` ou `Program` event V2 | Event non canonique | Events | Replay impossible | P0 | Ajouter ou mapper |
| `MissionOrderPrepared` | `MissionCreated` / `MissionAccepted` | La preparation correspond a la creation/qualification de mission | Runtime, events | Double statut | P0 | Mapper vers cycle mission ou documenter event V2 |
| `MissionOrderActivated` | `AgentAssigned` / `LockGranted` / `AgentStarted` selon sens | Activation n'est pas un event canonique V1 | Runtime, events | Ambiguite de demarrage | P0 | Decouper par transition canonique |
| `PDSAllocated` | `AgentAssigned` ou `LockGranted` selon sens | Allocation est couverte par affectation/verrouillage V1 | Runtime, events | Faux semantique | P0 | Requalifier |
| `PDSWaiting` | `WAITING_INPUT` ou `WAITING_DEPENDENCY` | V1 exige une cause de wait | State, events | Wait genrique non actionnable | P0 | Remplacer par wait cause-specific |
| `PDSStarted` | `AgentStarted` | Demarrage d'execution correspond a `AgentStarted` dans V1 | Runtime, events | Double event model | P0 | Mapper a `AgentStarted` |
| `PDSBlocked` | `WAITING_INPUT` / `WAITING_DEPENDENCY` / `ESCALATED` | Blocage V1 est cause-specific | State, events | Ambiguite de reprise | P0 | Requalifier |
| `PDSCompleted` | `ReportSubmitted` puis `ACCEPTED` ou `SUBMITTED` selon phase | Completion d'execution n'est pas acceptation finale | Runtime, certification | Confusion completion/certification | P0 | Scinder en livraison et validation |
| `PDSStopped` | `CANCELLED` ou `FAILED` | STOPPED n'est pas canonique V1 | State, closure | Terminalite incertaine | P0 | Requalifier selon cause |
| `CampaignOpened` | `MissionCreated` ou event V2 | Event non canonique | Events | Reject bus | P0 | Ajouter ou mapper |
| `CampaignPassed` | `ACCEPTED` ou `FinalValidationAccepted` | Passage positif doit rester evidence-based | Certification | Positive closure implicite | P0 | Requalifier vers validation finale |
| `CampaignFailed` | `REJECTED` ou `FAILED` selon couche | `FAILED`/`REJECTED` deja canoniques, mais pas pour Campaign | Certification | Closure ambigue | P0 | Distinguer echec operationnel et rejet final |
| `CampaignStopped` | `CANCELLED` | Arret gouverne le plus proche | State, events | Stop sans cause | P1 | Mapper a annulation gouvernee |
| `ArtifactPropagated` | `ReportSubmitted` / `Event` / `Memory` / `Graph` selon nature | La propagation d'artefact est un principe, pas un event canonique V1 | Events, audit | Trace incomplete | P1 | Definir le support cible avant usage |
| `ConflictDetected` | `LockConflictDetected` ou `EscalationRequested` | V1 dispose d'un event de conflit de verrou | Events, state | Conflit generique non exploitable | P0 | Nommer la cause |
| `RecoveryRequested` | `EscalationRequested` ou event V2 | V1 ne le canonicalise pas | Events, state | Recovery sans autorite | P1 | Ajouter seulement si une politique de reprise existe |
| `RecoveryApplied` | `EscalationResolved` / `MissionRequalified` / `RevisionStarted` selon contexte | La reprise V1 se fait via etat et event nommes | Events, state | Replay ambivalent | P1 | Requalifier par type de recovery |
| `CertificationRecorded` | `FinalValidationAccepted` / `ValidationRejected` / Decision associee | Certification doit rester evidence-based | Certification, events | Faux event meta | P1 | Mapper vers la decision finale correcte |
| `EntityClosed` | `ACCEPTED` / `REJECTED` / `CANCELLED` ou `CLOSED` de programme | Fermeture varie selon le type d'entite | State, lifecycle | Closure polymorphe | P0 | Interdire un event global unique |

---

# 3. Mapping des regles

| Regle actuelle | Cible canonique | Justification | Impact | Risque | Priorite | Recommandation |
| --- | --- | --- | --- | --- | --- | --- |
| Parallel execution normative | Extension future seulement | `ORCHESTRATOR_V1_ARCHITECTURE` ne la rend pas normative | Architecture, runtime | Incoherence V1 | P0 | Isoler en V2 |
| Lock before active work | `LockGranted` puis `LOCKED` puis `AgentStarted` | Regle deja alignee avec V1 | Runtime | Faible si mappe | P1 | Conserver |
| Certification multi-niveaux | `SUBMITTED` -> validations -> `ACCEPTED` | V1 separe soumission et validation | Certification, state | Acceptance implicite | P0 | Requalifier par phase |
| Rollback and recovery | `EscalationRequested` / `MissionRequalified` / `RevisionStarted` | V1 n'autorise pas de rollback libre | Recovery | Evidence loss | P0 | Restreindre et tracer |
| Dependency chain | `WAITING_DEPENDENCY` + dependency event | V1 supporte dependances explicites | State, runtime | Cycles non resolus | P0 | Rendre cause-specific |

---

# 4. Synthese des actions

## A renommer

- `ACTIVE`
- `BLOCKED`
- `WAITING`
- `COMPLETED`
- `STOPPED`
- `PASSED`
- `OPEN`

## A supprimer

- toute utilisation operationnelle de `Portfolio` sans mapping ;
- toute utilisation operationnelle de `Mission Order` sans mapping ;
- toute utilisation operationnelle de `PDS` sans mapping ;
- toute utilisation operationnelle de `Campaign` sans mapping ;
- tout `Event` non canonique non mappe ;
- tout etat global `CLOSED` non typise par entite.

## A fusionner

- `COMPLETE` avec `ACCEPTED` si la couche cible reste mission-level ;
- `BLOCKED` avec etats d'attente causes ;
- `RecoveryRequested` avec `EscalationRequested` si aucune politique de reprise distincte n'existe.

## A conserver

- evidence chain ;
- immutable events ;
- lock discipline ;
- dependency gating ;
- explicit governance ;
- preserved traceability ;
- no silent conflict resolution.

## A ajouter

- canonical mapping addendum ;
- migration strategy ;
- implementation roadmap ;
- harmonization plan ;
- API extension plan si la cible garde PDS/Mission Order/Campaign.

