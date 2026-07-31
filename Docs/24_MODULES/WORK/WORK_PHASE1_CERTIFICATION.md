# WORK-PHASE1-CLOSURE — Work Reconciliation Certification

Date de certification : 2026-07-30  
Phase : Work Reconciliation — Phase 1  
Verdict : **GO**  
Statut : **PHASE 1 CLOSED — PHASE 2 AUTHORIZED**

## 1. Objet et autorité

Ce document clôt officiellement la Phase 1 de réconciliation du domaine Work.
Il devient le point d'entrée unique avant toute ouverture de la Phase 2.

Il consolide les décisions déjà démontrées par les audits, les rapports
d'intégration et le code Runtime existant. Il ne remplace pas leurs preuves
détaillées, ne crée aucune règle métier et n'autorise aucune réinterprétation
d'une source.

La frontière certifiée est la suivante :

- sept familles sont intégrées ou possédées par Work ;
- quatre domaines audités restent absents faute de producteur autoritatif ;
- aucune source technique ou fixture ne peut être promue implicitement ;
- aucune persistance, API, BFF, projection UX ou contrat public n'est créée par
  cette certification.

## 2. Chronologie complète

### 2.1 Établissement de la cause racine et de l'architecture

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 1 | SW-011 | Raccorder Work Overview aux endpoints existants | NO GO | les lectures Core ne fournissaient qu'une partie de l'écran et aucune projection complète | ne modifier ni Frontend ni Runtime |
| 2 | SW-011A | Qualifier le blocage Work Overview | AUDIT CONCLUANT | projection, contrat, mapping et exposition Work Overview absents ; composition complète impossible | ouvrir un lot Runtime dédié plutôt qu'inventer un contrat Frontend |
| 3 | SW-012 | Spécifier le Read Model minimal Work Overview | GO DOCUMENTAIRE | informations, gaps, contrat et endpoint futurs bornés sans code | spécification utilisable comme gate, sous réserve des producteurs |
| 4 | SW-013 | Implémenter le Read Model SW-012 | NO GO | producteurs identifiés sémantiquement mais absents du Runtime exposé | aucune implémentation spéculative |
| 5 | SW-013A | Auditer les producteurs Work Overview | CAUSE RACINE CERTIFIÉE | absence systémique d'une Capability Work suffisamment riche | construire d'abord la fondation métier Work |
| 6 | SW-014 | Définir l'architecture canonique Work | GO | frontières, invariants, producteurs et roadmap définis | WCF-001 désigné premier incrément viable |

Preuves :

- [SW-011](../0-UI-DESIGN/NOVA_SW011_W01_1_WORK_OVERVIEW_REPORT.md)
- [SW-011A](../0-UI-DESIGN/NOVA_SW011A_WORK_OVERVIEW_BLOCKER_ANALYSIS.md)
- [SW-012 — Read Model](../0-UI-DESIGN/NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md)
- [SW-012 — Gap](../0-UI-DESIGN/NOVA_WORK_OVERVIEW_RUNTIME_GAP_REPORT.md)
- [SW-013](../0-UI-DESIGN/NOVA_SW013_WORK_OVERVIEW_READMODEL_IMPLEMENTATION_REPORT.md)
- [SW-013A](../0-UI-DESIGN/NOVA_WORK_OVERVIEW_PRODUCER_AUDIT.md)
- [SW-014 — Architecture](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_ARCHITECTURE.md)
- [SW-014 — Roadmap](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_ROADMAP.md)
- [SW-014 — Dépendances](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md)

### 2.2 Fondation Work

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 7 | WCF-001 | Créer le socle Identity, Mission link, Lifecycle, Progress, timestamps et provenance | GO | `WorkCoreFoundation`, `WorkLifecycleProducer`, types et tests existent dans `server/runtime/work` | socle interne canonique ; aucune API publique |
| 8 | WCF-002 | Ajouter Work Objective read-only | GO | objectif repris exclusivement de l'identité Mission ; absences conservées comme `null` | conserver le sous-domaine interne |
| 9 | WCF-003 | Rechercher puis intégrer Planning si un producteur existe | NO GO CONFORME | aucun jalon, échéance, phase, étape ou dépendance métier autoritative liée au Work | aucun modèle, service ou query Planning créé |

Preuves :

- [Work Core types](../../../server/runtime/work/work-core.types.ts)
- [Work Core Foundation](../../../server/runtime/work/work-core-foundation.ts)
- [Work Lifecycle](../../../server/runtime/work/work-lifecycle.ts)
- [Tests WCF-001](../../../server/runtime/work/work-core-foundation.test.ts)
- [WCF-002](WCF_002_WORK_OBJECTIVE_REPORT.md)
- [WCF-003](WCF_003_WORK_PLANNING_FOUNDATION_REPORT.md)

WCF-001 ne possède pas de rapport autonome dans le répertoire Work. Sa
certification repose sur les types, producteurs, exports et tests réellement
présents. Cette absence documentaire n'est pas remplacée par une supposition.

### 2.3 Audit transversal du patrimoine

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 10 | DOMAIN-AUDIT-002 | Retrouver les domaines Work existants sous leurs noms Runtime/legacy | GO | producteurs, consommateurs, duplications et dette d'intégration cartographiés | intégrer Deliverables en premier, puis Decisions ; ne pas recréer les sources |

Preuves :

- [Audit](DOMAIN_RECONCILIATION_AUDIT.md)
- [Reuse matrix](DOMAIN_REUSE_MATRIX.md)
- [Producer catalog](DOMAIN_PRODUCER_CATALOG.md)
- [Integration backlog](DOMAIN_INTEGRATION_BACKLOG.md)

### 2.4 Deliverables

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 11 | DINT-000 | Réconcilier les implémentations Deliverables | GO | `MissionReport.deliverableEvidence` accepté par `submitReport` est la collection canonique des fichiers produits | dériver une lecture Work, sans second store |
| 12 | DINT-001 | Intégrer Work Deliverables en lecture interne | GO | query immuable fondée sur Work → Mission → rapport courant → evidence | capacité interne certifiée ; aucun producteur/persistance/API ajouté |

Preuves :

- [DINT-000 report](DINT_000_DELIVERABLES_RECONCILIATION_REPORT.md)
- [DINT-000 matrix](DINT_000_DELIVERABLES_MATRIX.md)
- [DINT-000 duplicates](DINT_000_DELIVERABLES_DUPLICATES.md)
- [DINT-000 decision](DINT_000_DELIVERABLES_DECISION.md)
- [DINT-001](DINT_001_WORK_DELIVERABLES_INTERNAL_READ_REPORT.md)

### 2.5 Decisions

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 13 | DDEC-000 | Réconcilier le patrimoine Decisions | GO | `HumanApprovalDecision` persistant, produit par `HumanApprovalWorkflow.decide`, est la décision humaine canonique | conserver autres gates dans leurs domaines |
| 14 | DDEC-001 | Intégrer Work Decisions en lecture interne | GO | `history(missionId, runId)` lit exclusivement les records `HUMAN_APPROVAL` dans leur ordre canonique | historique Work read-only ; aucune décision principale inventée |

Preuves :

- [DDEC-000 report](DDEC_000_DECISIONS_RECONCILIATION_REPORT.md)
- [DDEC-000 matrix](DDEC_000_DECISIONS_MATRIX.md)
- [DDEC-000 duplicates](DDEC_000_DECISIONS_DUPLICATES.md)
- [DDEC-000 decision](DDEC_000_DECISIONS_DECISION.md)
- [DDEC-001](DDEC_001_WORK_DECISIONS_INTERNAL_READ_REPORT.md)

### 2.6 People et affectation technique

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 15 | DPEO-000 | Désigner une source People métier | NO GO | User, session, identité décisionnelle et agent Runtime ne portent aucune propriété/participation humaine liée à Work | DPEO-001 interdit |
| 16 | MWA-000 | Démontrer l'affectation actuelle d'une Mission | GO AUDIT | relation déterministe `RuntimeMission.assignedAgentId → RuntimeAgent.agentId`, persistée en snapshot | qualifier cette relation comme strictement technique |
| 17 | MWA-001 | Exposer l'agent technique dans Work | GO | types, service, query, export et tests existent ; lecture exacte du snapshot agent | intégrer `Technical Agent`, sans créer People |

Preuves :

- [DPEO-000 report](DPEO_000_PEOPLE_RECONCILIATION_REPORT.md)
- [DPEO-000 matrix](DPEO_000_PEOPLE_MATRIX.md)
- [DPEO-000 duplicates](DPEO_000_PEOPLE_DUPLICATES.md)
- [DPEO-000 decision](DPEO_000_PEOPLE_DECISION.md)
- [MWA-000 report](MWA_000_MISSION_ASSIGNMENT_REPORT.md)
- [MWA-000 matrix](MWA_000_ASSIGNMENT_MATRIX.md)
- [MWA-000 decision](MWA_000_ASSIGNMENT_DECISION.md)
- [MWA-001 query](../../../server/runtime/work/work-technical-agent.query.ts)
- [MWA-001 types](../../../server/runtime/work/work-technical-agent.types.ts)
- [MWA-001 tests](../../../server/runtime/work/work-technical-agent.test.ts)

MWA-001 ne possède pas de rapport autonome dans le répertoire Work. Le statut
GO est prouvé par l'implémentation interne, son export via `work-core.ts` et ses
tests. Il ne modifie pas le NO GO People.

### 2.7 Intelligence

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 18 | DINTEL-000 | Réconcilier Knowledge, diagnostic, evaluation et pseudo-insights UX | NO GO | aucun `WorkIntelligence`, producteur, persistance ou rattachement Work ; les candidats appartiennent à d'autres domaines | DINTEL-001 interdit ; conserver Knowledge et diagnostics dans leurs frontières |

Preuves :

- [Report](DINTEL_000_INTELLIGENCE_RECONCILIATION_REPORT.md)
- [Matrix](DINTEL_000_INTELLIGENCE_MATRIX.md)
- [Duplicates](DINTEL_000_INTELLIGENCE_DUPLICATES.md)
- [Decision](DINTEL_000_INTELLIGENCE_DECISION.md)

### 2.8 Synthesis

| Ordre | Lot | Objectif | Verdict | Justification | Décision |
|---:|---|---|---|---|---|
| 19 | DSYN-000 | Réconcilier briefs, reports, logs, metrics et résumés UX | NO GO | `MissionBrief` prépare ; `MissionReport` rapporte l'exécution ; aucun producteur ne crée une synthèse métier courante, datée et sourcée | DSYN-001 interdit ; ne pas renommer un rapport en synthèse |

Preuves :

- [Report](DSYN_000_SYNTHESIS_RECONCILIATION_REPORT.md)
- [Matrix](DSYN_000_SYNTHESIS_MATRIX.md)
- [Duplicates](DSYN_000_SYNTHESIS_DUPLICATES.md)
- [Decision](DSYN_000_SYNTHESIS_DECISION.md)

## 3. Domaines intégrés

### 3.1 Identity

| Attribut | Certification |
|---|---|
| Source autoritative | `RuntimeMission` via `getMission(projectId, missionId)` |
| Producteur | `OrchestratorRuntimeService` / Mission Runtime |
| Consommateur Work | `WorkCoreFoundation.load` |
| Provenance | `MISSIONS`, producteur `ORCHESTRATOR_RUNTIME`, source `projectId/missionId`, observation Mission |
| Statut | **INTEGRATED — READ-ONLY** |

`workId` est la clé Mission canonique utilisée par WCF-001. Aucun identifiant
alternatif n'est inventé.

### 3.2 Objective

| Attribut | Certification |
|---|---|
| Source autoritative | `WorkIdentity.objective`, lui-même issu de `RuntimeMission.objective` |
| Producteur | `ORCHESTRATOR_RUNTIME` |
| Consommateur Work | `WorkObjectiveQuery` → `WorkObjectiveService` |
| Provenance | provenance Identity conservée, domaine `MISSIONS` |
| Statut | **INTEGRATED — READ-ONLY** |

`objectiveId`, description, statut et date de mise à jour restent `null` faute
de producteur. Aucune valeur de remplacement n'est autorisée.

### 3.3 Lifecycle

| Attribut | Certification |
|---|---|
| Source factuelle | `RuntimeMission.state` |
| Producteur métier Work | `WorkLifecycleProducer` |
| Décision canonique | `WCF-001-LIFECYCLE-001` |
| Consommateur | `WorkCoreFoundation` |
| Provenance | domaine `WORK`, producteur `WCF-001-LIFECYCLE-001`, observation `mission.updatedAt` |
| Statut | **INTEGRATED — WORK-OWNED** |

Le vocabulaire Work est distinct du statut technique brut de Mission, avec un
mapping explicite et testé.

### 3.4 Progress

| Attribut | Certification |
|---|---|
| Source autoritative | `RuntimeObservabilityEvent.progression` |
| Producteur | `ORCHESTRATOR_OBSERVABILITY` |
| Consommateur Work | `WorkCoreFoundation.selectCurrentProgression` |
| Provenance | domaine `MONITORING`, event id, sequence, correlationId, runId et observedAt |
| Statut | **INTEGRATED — READ-ONLY** |

La progression n'est ni recalculée par Work ni déduite de timestamps.

### 3.5 Deliverables

| Attribut | Certification |
|---|---|
| Source autoritative | `MissionReport.deliverableEvidence` |
| Producteur | mapper du rapport Nova Core ; acceptation `OrchestratorRuntimeService.submitReport` |
| Consommateur Work | `WorkDeliverablesQuery` → `WorkDeliverablesService` |
| Provenance | Mission, reportId, runId, `MissionReport.deliverableEvidence` |
| Statut | **INTEGRATED — INTERNAL READ** |

Work ne crée ni identifiant, titre, statut, URL, owner ou métadonnée métier de
livrable.

### 3.6 Decisions

| Attribut | Certification |
|---|---|
| Source autoritative | `HumanApprovalDecision` dans `IntegrationPersistedRecord(kind="HUMAN_APPROVAL")` |
| Producteur | `HumanApprovalWorkflow.decide` |
| Read Model canonique | `HumanApprovalWorkflow.history(missionId, runId)` |
| Consommateur Work | `WorkDecisionsQuery` → `WorkDecisionsService` |
| Provenance | `HUMAN_APPROVAL_WORKFLOW`, Mission, runId, history, record kind et binding WCF-001 |
| Statut | **INTEGRATED — INTERNAL READ** |

Work expose l'historique humain exact. Il ne choisit pas une décision
principale et n'ajoute ni confiance, recommandation, échéance ou impact.

### 3.7 Technical Agent

| Attribut | Certification |
|---|---|
| Source autoritative | `RuntimeMission.assignedAgentId` → `RuntimeAgent` |
| Producteur | `ORCHESTRATOR_RUNTIME` |
| Consommateur Work | `WorkTechnicalAgentQuery` → `WorkTechnicalAgentService` |
| Provenance | Mission, `RuntimeMission.assignedAgentId`, registre `RuntimeAgent` |
| Statut | **INTEGRATED — TECHNICAL READ** |

Cette famille n'est pas People. Aucun Owner, Employee, User, participant,
reviewer ou autre identité humaine n'est créé.

## 4. Domaines audités mais absents

### 4.1 Planning

| Attribut | Certification |
|---|---|
| Audits | WCF-003 ; DOMAIN-AUDIT-002 |
| Preuve | seuls scheduling technique, timestamps, progression et fixtures existent |
| Manque | jalon, échéance, phase, étape, séquence ou dépendance métier liée au Work |
| Producteur autoritatif | **ABSENT** |
| Décision | **NO GO — aucun composant Planning créé** |

### 4.2 People

| Attribut | Certification |
|---|---|
| Audits | DOMAIN-AUDIT-002 ; DPEO-000 ; MWA-000 |
| Preuve | identités de compte/session/décision et agents techniques sans affectation humaine Work |
| Manque | personne métier, rôle, propriété, participation et clé Work persistée |
| Producteur autoritatif | **ABSENT** |
| Décision | **NO GO — Technical Agent reste hors People** |

### 4.3 Intelligence

| Attribut | Certification |
|---|---|
| Audits | DOMAIN-AUDIT-002 ; DINTEL-000 |
| Preuve | Knowledge prépare une Mission ; diagnostics et readiness sont techniques ; insights UX sont des fixtures |
| Manque | résultat Work Intelligence, producteur, persistance, provenance et clé Work |
| Producteur autoritatif | **ABSENT** |
| Décision | **NO GO — DINTEL-001 non autorisé** |

### 4.4 Synthesis

| Attribut | Certification |
|---|---|
| Audits | DOMAIN-AUDIT-002 ; DINTEL-000 ; DSYN-000 |
| Preuve | `MissionBrief` est pré-exécution ; `MissionReport` est un résultat technique sans synthèse métier |
| Manque | synthèse courante, date métier, provenance et producteur Intelligence |
| Producteur autoritatif | **ABSENT** |
| Décision | **NO GO — DSYN-001 non autorisé** |

## 5. Inventaire complet des sources autoritatives

| Domaine | Source | Producteur | Consommateurs | Runtime | Décision |
|---|---|---|---|---|---|
| Identity | `RuntimeMission` | Orchestrator Runtime | Work Core, Objective, queries Work | actif | KEEP / INTEGRATED |
| Objective | `RuntimeMission.objective` via Work Identity | Orchestrator Runtime | Work Objective | actif | KEEP / INTEGRATED |
| Lifecycle | faits `RuntimeMission.state` + décision Work `WCF-001-LIFECYCLE-001` | `WorkLifecycleProducer` | Work Core | actif | KEEP / WORK-OWNED |
| Progress | `RuntimeObservabilityEvent.progression` | Orchestrator Observability | Work Core | actif | KEEP / INTEGRATED |
| Deliverables | `MissionReport.deliverableEvidence` | Nova Core report mapper + `submitReport` | Work Deliverables, validation, certification | actif | KEEP / INTERNAL READ |
| Decisions | `HumanApprovalDecision` / record `HUMAN_APPROVAL` | `HumanApprovalWorkflow.decide` | `history`, Work Decisions, orchestrateurs existants | actif | KEEP / INTERNAL READ |
| Technical Agent | `RuntimeMission.assignedAgentId` → `RuntimeAgent` | Orchestrator Runtime | Work Technical Agent, exécution | actif | KEEP / TECHNICAL READ |

## 6. Inventaire des domaines inexistants

| Domaine | Pourquoi absent | Ce qui manque | Décision |
|---|---|---|---|
| Planning | aucune primitive métier ; sources trouvées techniques ou fictives | producteur Planning et rattachement Work | NO GO |
| People | aucune affectation humaine métier | modèle/personne, rôle, participation, clé et provenance Work | NO GO |
| Intelligence | connaissances, diagnostics et UX non équivalents | producteur de résultats Intelligence Work | NO GO |
| Synthesis | brief/report/log non équivalents à une synthèse Work | producteur Intelligence de synthèse courante, datée et sourcée | NO GO |

## 7. Architecture finale Phase 1

```text
                         SOURCES AUTORITATIVES EXISTANTES

 RuntimeMission -------------------------------+
   | objective                                  |
   | state                                      |
   | assignedAgentId                            |
   +------------------+-------------------------+
                      |
 RuntimeObservabilityEvent.progression --------+
                      |
 MissionReport.deliverableEvidence ------------+
                      |
 HumanApprovalWorkflow.history ----------------+
                      |
 RuntimeSnapshot.agents -----------------------+
                      |
                      v
              +----------------------+
              | WORK CORE FOUNDATION |
              | WCF-001              |
              +----------------------+
              | Identity             |
              | Mission binding      |
              | Lifecycle            |
              | Progress             |
              | Timestamps           |
              | Provenance           |
              +----------+-----------+
                         |
         +---------------+----------------+------------------+
         |               |                |                  |
         v               v                v                  v
  Work Objective   Work Deliverables  Work Decisions  Work Technical Agent
    WCF-002           DINT-001          DDEC-001          MWA-001
   read-only          read-only         read-only         technical read

                         EXPLICITLY UNAVAILABLE

           Planning        People        Intelligence        Synthesis
             NO GO          NO GO            NO GO             NO GO
               \____________ no implicit substitution ____________/
```

### 7.1 Propriété des données

Work ne devient propriétaire ni :

- de l'exécution Mission ;
- de l'observabilité ;
- du contenu `MissionReport` ;
- du workflow d'approbation ;
- du registre des agents ;
- des futurs domaines Planning, People, Intelligence ou Synthesis.

Work possède uniquement son identité, son vocabulaire Lifecycle et les
associations/projections internes explicitement certifiées.

### 7.2 Règles de frontière figées

1. Une lecture Work ne crée jamais un second producteur.
2. La provenance de chaque source externe est conservée.
3. Une absence de source reste une absence explicite.
4. Aucun timestamp technique ne devient une échéance.
5. Aucun agent technique ne devient une personne.
6. Aucun diagnostic ou knowledge result ne devient Intelligence.
7. Aucun brief, report, log ou dernier événement ne devient Synthesis.
8. Aucun champ de fixture ou de layout ne devient un champ métier.
9. Aucun endpoint, BFF ou contrat public ne fait partie de la Phase 1.
10. Les queries Work restent read-only et sans persistance propre.

### 7.3 Éléments connexes non promus

Actions et Confidence restent hors de l'état Phase 1. DOMAIN-AUDIT-002 et
SW-014 les qualifient sans producteur disponible ; ils ne sont ni intégrés ni
implicitement couverts par Decisions, Progress ou Technical Agent.

## 8. Traçabilité des artefacts de Phase 1

| Lot | Artefacts de référence |
|---|---|
| SW-011 à SW-014 | rapports, spécifications et matrices listés en section 2.1 |
| WCF-001 | types, foundation, lifecycle, exports et tests `server/runtime/work` |
| WCF-002 | `WCF_002_WORK_OBJECTIVE_REPORT.md` + module Objective |
| WCF-003 | `WCF_003_WORK_PLANNING_FOUNDATION_REPORT.md` |
| DOMAIN-AUDIT-002 | audit, reuse matrix, producer catalog, integration backlog |
| DINT-000 | report, matrix, duplicates, decision |
| DINT-001 | rapport d'intégration + module Work Deliverables |
| DDEC-000 | report, matrix, duplicates, decision |
| DDEC-001 | rapport d'intégration + module Work Decisions |
| DPEO-000 | report, matrix, duplicates, decision |
| MWA-000 | report, matrix, decision |
| MWA-001 | types, model, service, query, export et tests |
| DINTEL-000 | report, matrix, duplicates, decision |
| DSYN-000 | report, matrix, duplicates, decision |

## 9. Contrôles de certification

| Contrôle | Résultat | Preuve |
|---|---|---|
| Chronologie complète | PASS | 19 lots/décisions référencés |
| Domaines intégrés | PASS | 7 familles avec source, producteur, consommateur et provenance |
| Domaines absents | PASS | 4 domaines avec NO GO démontré |
| Sources autoritatives | PASS | inventaire section 5 |
| Absence de seconde source | PASS | intégrations read-only et domaines absents non substitués |
| Frontière patrimoine/nouveaux domaines | PASS | architecture et règles section 7 |
| Runtime modifié par la clôture | PASS | aucun |
| Code/contrat/API modifié | PASS | aucun |
| Document existant modifié | PASS | aucun |

## 10. Décision officielle

### Phase 1

**CLOSED — GO**

La Phase 1 a atteint son objectif : le patrimoine réutilisable est intégré sans
duplication, et les domaines inexistants sont démontrés sans implémentation
spéculative.

### Phase 2

**AUTHORIZED**

Cette autorisation :

- clôt la réconciliation ;
- permet d'ouvrir des lots Phase 2 bornés ;
- ne donne pas GO automatique à Planning, People, Intelligence ou Synthesis ;
- exige un producteur autoritatif avant toute intégration de ces domaines ;
- interdit de modifier les sources Phase 1 pour satisfaire une projection UX ;
- impose de conserver les provenances et frontières certifiées ici.

Toute évolution contraire nécessite une nouvelle décision d'architecture
explicite. Aucun lot Phase 2 n'est commencé par ce document.

