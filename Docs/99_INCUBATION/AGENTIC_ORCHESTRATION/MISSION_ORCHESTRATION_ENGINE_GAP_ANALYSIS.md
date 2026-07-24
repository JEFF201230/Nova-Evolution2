# MISSION ORCHESTRATION ENGINE - GAP ANALYSIS

MISSION_ID : P15-MO-003-MISSION-ORCHESTRATION-ENGINE-CERTIFICATION-V2

DATE : 2026-07-09

DOCUMENT AUDITE : `MISSION_ORCHESTRATION_ENGINE.md`

VERDICT GAP : ECARTS BLOQUANTS

---

# 1. Objet

Ce rapport liste les ecarts entre `MISSION_ORCHESTRATION_ENGINE.md` et les sources d'architecture ORCHESTRATOR/NOVA existantes.

Les ecarts sont classes par severite :

- P0 : bloquant pour certification ;
- P1 : reserve majeure ;
- P2 : clarification requise.

---

# 2. Synthese des gaps P0

| ID | Gap | Source d'autorite contredite | Severite |
| --- | --- | --- | --- |
| GAP-001 | Etats operationnels non canoniques | Canonical Dictionary, State Model | P0 |
| GAP-002 | Evenements non canoniques | Canonical Dictionary, Event Architecture | P0 |
| GAP-003 | Entites canoniques non definies | Domain Model, Program Planning Model | P0 |
| GAP-004 | Absence de mapping vers Mission Runtime V1 | Runtime Contract, State Model | P0 |
| GAP-005 | Parallel execution normative contre architecture V1 | ORCHESTRATOR_V1_ARCHITECTURE | P0 |
| GAP-006 | Surface API non couverte | ORCHESTRATOR_API_SURFACE_V1 | P0 |
| GAP-007 | Certification chain non mappee aux validations V1 | Runtime Contract, Workflow | P0 |

Conclusion : le document ne peut pas etre certifie tel quel.

---

# 3. Gaps detailles

## GAP-001 - Etats operationnels non canoniques

Severite : P0

Constat :

Le document audite utilise des etats comme `PLANNED`, `ACTIVE`, `BLOCKED`, `SUSPENDED`, `COMPLETE`, `APPROVED`, `PREPARING`, `WAITING`, `COMPLETED`, `STOPPED`, `OPEN`, `PASSED`, `CLOSED`.

Reference :

- `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md` autorise seulement 17 etats.
- `ORCHESTRATOR_STATE_MODEL_V1.md` interdit les nouveaux etats sans evolution du modele.
- `ORCHESTRATOR_STATE_MODEL_V1.md` classe `ACTIVE`, `BLOCKED`, `COMPLETED` comme termes legacy ou non canoniques selon contexte.

Impact :

- State Store incoherent.
- Transitions non reconstructibles.
- API `State` et `Transition` non conformes.
- Event replay impossible avec source/target state non canoniques.

Correction attendue :

- Definir un mapping vers les etats canoniques existants.
- Ou creer une mission dediee de mise a jour du State Model et du Canonical Dictionary.

---

## GAP-002 - Evenements non canoniques

Severite : P0

Constat :

Les evenements requis par le document ne figurent pas dans la liste officielle :

- `PortfolioActivated`
- `ProgramApproved`
- `MissionOrderPrepared`
- `PDSStarted`
- `PDSCompleted`
- `CampaignPassed`
- `ArtifactPropagated`
- `RecoveryApplied`
- `CertificationRecorded`
- `EntityClosed`

Reference :

- `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md` liste les evenements officiels.
- `ORCHESTRATOR_EVENT_ARCHITECTURE_V1.md` rejette les evenements non canoniques pour toute transition.

Impact :

- Event Bus devrait rejeter ces evenements.
- Audit Log enregistrerait des erreurs `InvalidEvent`.
- Replay ne pourrait pas reconstruire l'etat.

Correction attendue :

- Mapper vers `MissionCreated`, `MissionAccepted`, `AgentAssigned`, `LockGranted`, `AgentStarted`, `ReportSubmitted`, validations, `FinalValidationAccepted`, etc.
- Ajouter les nouveaux evenements uniquement par evolution du dictionnaire.

---

## GAP-003 - Entites canoniques non definies

Severite : P0

Constat :

Le document audite declare `Portfolio`, `Mission Order`, `PDS`, `Campaign` comme entites canoniques.

Reference :

- `NOVA-003_DOMAIN_MODEL.md` definit Programme, Projet, Mission, Decision, Agent, Conversation, Memory, Graph, Simulation, Plugin, Runtime, Executive.
- `ORCHESTRATOR_PROGRAM_PLANNING_MODEL_V1.md` definit Vision, Programme, Roadmap, Release, Milestone, Objective, Project, Mission, Task, Deliverable.

Impact :

- Aucun attribut canonique.
- Aucune relation canonique.
- Aucun cycle de vie reconnu.
- Aucune route API.
- Aucune regle de persistance.

Correction attendue :

- Decider si ces termes sont :
  - nouvelles entites V2 ;
  - aliases de Project/Mission/Task/Deliverable ;
  - artefacts de programme non runtime ;
  - concepts PROGRAM-014/015 uniquement.

---

## GAP-004 - Absence de mapping vers Mission Runtime V1

Severite : P0

Constat :

Le document orchestre PDS et Mission Order, mais le Runtime V1 orchestre des Missions.

Reference :

- Runtime Contract : cycle `CreateMission -> MissionCreated -> ... -> FinalValidationAccepted`.
- State Model : une mission possede un seul etat canonique.
- Workflow : mission unique, agent responsable unique, rapport et validations.

Impact :

- Ambiguite : un PDS est-il une Mission, un Agent, une equipe, une Task ou un Project ?
- Ambiguite : Mission Order est-il une Mission, un Project ou un conteneur de Missions ?
- Ambiguite : Campaign est-elle une validation, une mission de test ou un groupement documentaire ?

Correction attendue :

- Table de mapping obligatoire :

| Concept document audite | Mapping possible | Statut |
| --- | --- | --- |
| Mission Order | Project ou Mission package | A definir |
| PDS | Mission, Agent group ou Task | A definir |
| Campaign | Validation Mission ou Test Campaign | A definir |
| Portfolio | Programme group ou Vision scope | A definir |

---

## GAP-005 - Parallel execution normative contre architecture V1

Severite : P0

Constat :

Le document audite impose des regles de parallel execution.

Reference :

`ORCHESTRATOR_V1_ARCHITECTURE.md` indique que V1 ne definit pas d'execution parallele multi-agent et qu'une parallelisation future doit etre autorisee par une architecture ulterieure.

Impact :

- Contradiction directe avec le baseline V1.
- Risque d'implementation prematuree dans Runtime Core Sprint 2.

Correction attendue :

- Requalifier le document comme extension post-V1, par exemple `ORCHESTRATOR_PROGRAM_EXECUTION_ENGINE_V2`.
- Ou produire un addendum d'architecture qui supersede explicitement la restriction V1.

---

## GAP-006 - Surface API non couverte

Severite : P0

Constat :

Le document exige des operations non exposees :

- approve/activate Program ;
- prepare/activate Mission Order ;
- allocate/start/block/complete/stop PDS ;
- open/pass/fail/close Campaign ;
- propagate artifacts ;
- record certification ;
- request/apply recovery ;
- close entity.

Reference :

`ORCHESTRATOR_API_SURFACE_V1.md` expose uniquement Project, Mission, Agent, State, Transition, Lock, Report, Event, Context, Validation.

Impact :

- Aucun contrat REST/CLI/SDK.
- Aucun RBAC/ABAC.
- Aucune enveloppe d'erreur.
- Aucune version API.

Correction attendue :

- Ajouter une API extension spec avant toute certification.
- Ou mapper les operations vers `missions`, `transitions`, `reports`, `validations`, `events`.

---

## GAP-007 - Certification chain non mappee aux validations V1

Severite : P0

Constat :

Le document exige certification PDS, Mission Order, Program, Portfolio.

Reference :

Runtime Contract et State Model separent :

- `SUBMITTED`
- `TECHNICAL_VALIDATION`
- `DOCUMENTARY_VALIDATION`
- `HUMAN_VALIDATION`
- `ACCEPTED`
- `REJECTED`

Impact :

- `PDS COMPLETED` peut etre confondu avec `ACCEPTED`.
- `Campaign PASSED` peut etre confondu avec validation finale.
- `Program COMPLETE` peut etre atteint sans mapping vers decision Executive.

Correction attendue :

- Preciser si chaque certification produit `FinalValidationAccepted`, une `Decision`, un `Report`, ou un evenement nouveau.

---

# 4. Gaps P1

## GAP-008 - Rollback et recovery trop generiques

Severite : P1

Le document exige rollback/recovery mais ne definit pas :

- quelles entites sont rollbackables ;
- quelles transitions inverses sont interdites ;
- comment preserver un event store immutable ;
- comment gerer un downstream PDS deja active ;
- quelle autorite peut autoriser recovery.

## GAP-009 - Idempotence manquante

Severite : P1

Le document definit des triggers automatiques et scheduling cycles mais ne precise pas :

- cle d'idempotence ;
- gestion des repetitions ;
- sequence d'evenements ;
- deduplication ;
- republication apres crash.

## GAP-010 - Autorisation et responsabilite non mappees

Severite : P1

Les roles API V1 ne sont pas appliques aux nouvelles actions :

- Program Board approval ;
- governed stop ;
- explicit resume authorization ;
- certification policy ;
- artifact overwrite authorization.

## GAP-011 - Stores et persistance absents

Severite : P1

Le document ne precise pas les stores :

- Portfolio Store ;
- Program Store ;
- Mission Order Store ;
- PDS Store ;
- Campaign Store ;
- Artifact Propagation Store ;
- Certification Store.

Il ne dit pas si ces donnees se reconstruisent depuis Event Store ou depuis documents programme.

## GAP-012 - Resource locking incomplet

Severite : P1

Le document impose locks sur ressources, mais ne definit pas :

- types de verrou officiels ;
- lien avec `project_id` ;
- renouvellement ;
- expiration ;
- passage obligatoire a `ESCALATED` en cas d'expiration non terminale ;
- liberation forcee RBAC.

---

# 5. Gaps P2

## GAP-013 - Normative language sans version

Severite : P2

Le document indique qu'il doit etre versionne, mais il ne contient pas de version effective dans son statut initial.

## GAP-014 - Encoding a corriger

Severite : P2

La section Resume Conditions contient `entityâ€™s`, signe d'encodage non propre.

## GAP-015 - Acyclic dependencies en SHOULD

Severite : P2

Le document dit qu'une dependency chain SHOULD be acyclic puis que les cycles MUST block. Pour un moteur deterministic, l'acyclicite devrait etre une regle MUST sur les dependances actives.

## GAP-016 - Completion criteria avec STOPPED ambigu

Severite : P2

Le document autorise une mission complete si les PDS sont `COMPLETED` ou `STOPPED` sous regles de closure. Les conditions de closure d'un PDS stopped ne sont pas assez detaillees.

---

# 6. Transitions manquantes ou incoherentes

| Entite | Transition manquante/incoherente | Commentaire |
| --- | --- | --- |
| Portfolio | `PLANNED -> REJECTED` dans diagramme, absent liste 7.1 | Contradiction interne |
| Portfolio | `SUSPENDED -> COMPLETE` dans diagramme, absent liste 7.1 | Completion depuis suspension non expliquee |
| Program | `BLOCKED -> SUSPENDED` absent | Cas de stop gouverne apres blocage |
| Program | `APPROVED -> REJECTED` absent | Rejet apres approval non decrit |
| Mission Order | `READY -> REJECTED` absent | Rejet avant activation non decrit |
| PDS | `FAILED -> STOPPED` absent | Echec non terminal ou terminal non precise |
| PDS | `FAILED -> READY/ACTIVE` absent | Recovery d'un PDS failed non mappee |
| Campaign | `FAILED -> RUNNING` absent | Retry de campaign failed non decrit |
| Campaign | `BLOCKED -> STOPPED` absent | Stop pendant blocage non decrit |

---

# 7. Evenements manquants

Evenements requis par les transitions mais absents ou incomplets :

- `PortfolioBlocked`
- `PortfolioSuspended`
- `PortfolioResumed`
- `PortfolioCompleted`
- `ProgramBlocked`
- `ProgramSuspended`
- `ProgramCompleted`
- `MissionOrderBlocked`
- `MissionOrderSuspended`
- `MissionOrderCompleted`
- `PDSRecovered`
- `PDSCertified`
- `CampaignBlocked`
- `CampaignClosed`
- `ArtifactConflictDetected`
- `DependencyCycleDetected`
- `DependencySatisfied`
- `LockExpired`
- `LockConflictDetected` sous nom canonique
- `RollbackRequested`
- `RollbackApplied`

Note : plusieurs existent deja sous noms canoniques V1 pour les missions. Le gap porte sur le manque de mapping.

---

# 8. Invariants manquants

Invariants a ajouter avant certification :

1. Toute entite programme doit etre rattachee a un `project_id` ou `program_id` canonique.
2. Tout PDS doit etre mappe a une Mission, Agent group ou Task avant execution.
3. Aucun evenement non canonique ne peut modifier le State Store V1.
4. Toute certification non mission doit pointer vers une Decision ou Validation canonique.
5. Toute propagation d'artefact doit conserver `source_project_id`, `source_mission_id`, `report_id` et `event_id`.
6. Une Campaign failed closed ne peut pas certifier positivement un Program sans Decision explicite.
7. Un rollback ne peut pas supprimer ni reecrire un evenement publie.
8. Un downstream PDS ne peut pas consommer un artefact rollbacked sans revalidation.
9. Toute exception de dependance doit etre portee par une Decision.
10. Tout Program closed doit conserver une trace Program Health / risks / residual debt si le Program Planning Model est applicable.

---

# 9. Compatibilite PROGRAM-014

| Besoin PROGRAM-014 | Couverture document audite | Gap |
| --- | --- | --- |
| Concurrence PDS | Oui | Non mappe a V1 |
| Dependency scheduling | Oui | Events non canoniques |
| Conflict STOP | Oui | STOPPED non canonique mission |
| Failure isolation | Partiel | Recovery failed PDS incomplet |
| Portfolio consistency | Oui | Portfolio non defini dans Domain Model |
| Certification chain | Oui | Validation V1 non mappee |

Verdict : compatible fonctionnellement avec les scenarios PROGRAM-014, mais non conforme au baseline documentaire V1.

---

# 10. Compatibilite PROGRAM-015

| Besoin PROGRAM-015 | Couverture document audite | Gap |
| --- | --- | --- |
| PDS-001 produit bootstrap | Oui | PDS non canonique |
| PDS-002 consomme PDS-001 | Oui | Artifact propagation non API |
| Productization boundary | Partiel | Boundary Project/Program absent |
| Certified baseline protection | Oui | Preserve baseline sans mapping Decision |
| Future campaigns | Oui | Campaign non canonique |

Verdict : compatible comme modele cible, non certifiable comme baseline PROGRAM-015 sans normalisation.

---

# 11. Priorisation de remediation

1. Produire un `MISSION_ORCHESTRATION_ENGINE_CANONICAL_MAPPING.md`.
2. Modifier par mission dediee le Canonical Dictionary si Portfolio/Mission Order/PDS/Campaign deviennent officiels.
3. Ajouter un addendum State Model pour etats programme non mission, ou interdire leur usage operationnel.
4. Ajouter un addendum Event Architecture pour les evenements programme, ou mapper vers evenements mission.
5. Ajouter une API Surface V2 ou extension route par route.
6. Definir les stores et schemas conceptuels.
7. Definir RBAC/ABAC des nouvelles operations.
8. Requalifier le document comme V2/future layer tant que les etapes ci-dessus ne sont pas faites.

---

# 12. Conclusion

Les gaps identifies sont structurels et non seulement editoriaux.

Le document ne peut pas etre certifie comme contrat ORCHESTRATOR/NOVA courant tant que les P0 restent ouverts.

Statut gap analysis : NO GO.

