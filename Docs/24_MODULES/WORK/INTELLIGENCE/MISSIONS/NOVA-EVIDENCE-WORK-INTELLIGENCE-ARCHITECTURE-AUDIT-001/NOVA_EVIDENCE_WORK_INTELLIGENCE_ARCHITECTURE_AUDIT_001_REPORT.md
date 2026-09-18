# NOVA-EVIDENCE-WORK-INTELLIGENCE-ARCHITECTURE-AUDIT-001

## Rapport d'audit d'architecture Evidence -> Work -> Intelligence

Date d'audit : 2026-09-14  
Produit audité : NOVA  
Runtime owner certifié : `NOVA_CORE`  
Mode certifié : `LOCAL_SINGLE_MISSION`  
Dépendance Runtime CEREBRAU : `false`  
Dépendance Runtime VEEDDA : `false`  
Approbation humaine finale : obligatoire  
Branche observée : `feature/nova-runtime-foundation`  
HEAD observé : `190752c` — `fix(nova-runtime): harden Codex execution and mission context`  
Nature : `READ ONLY / AUDIT ONLY / ARCHITECTURE ONLY / MVP STRICT`  
Statut du document : décision d'audit, pas certification

## 0. Décision exécutive

Le domaine métier Evidence NOVA est **ABSENT**. NOVA possède plusieurs mécanismes nommés
« evidence », mais ils sont soit des preuves techniques de Mission et d'exécution, soit des
preuves de readiness Runtime/OS, soit des artefacts de gouvernance documentaire. Aucun ne
matérialise une autorité métier Evidence répondant aux exigences de WCF-004.

WCF-004 est donc **ABSENT**, malgré l'existence de `MissionReport.deliverableEvidence` et de
la lecture Work Deliverables : cette collection prouve des fichiers produits, mais ne possède
ni `EvidenceId` métier, ni lifecycle Evidence, ni autorité Evidence, ni statut de certification
porté ou résolu par une association Work générale.

Intelligence ne peut pas être ouvert. Son entrée stricte « Work autorisé + Evidence pour toute
affirmation factuelle » n'est pas constituable. En outre, aucun producteur, agrégat logiciel,
stockage, lifecycle exécutable, query interne ou association Work Intelligence n'existe.

Deux STOP CONDITIONS sont actives :

1. la création d'une architecture Evidence exige une décision humaine sur son propriétaire,
   son modèle, son lifecycle, sa relation à Certification et ses sources admissibles ;
2. la notion d'« action priorisée / Next Best Action » est demandée par Work et WCF-008 mais
   n'est pas définie comme concept dans le Blueprint Intelligence, qui distingue strictement
   Recommendation et Action. Une décision normative humaine est indispensable avant le contrat
   Intelligence.

Ces blockers ne justifient aucune modification pendant l'audit. PEOPLE, PLANNING et ACTIONS
restent certifiés et doivent être consommés par références et queries existantes, sans
réécriture substantielle.

**Verdict d'ouverture Intelligence : `NO_GO`.**

## 1. Périmètre, méthode et limites

### 1.1 Sources obligatoires examinées

- `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`
- `Docs/24_MODULES/WORK/WORK_PHASE2_CERTIFICATION.md`
- `Docs/24_MODULES/WORK/INTELLIGENCE_DOMAIN_BLUEPRINT.md`
- `Docs/24_MODULES/WORK/DINTEL_000_INTELLIGENCE_DECISION.md`
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_CAPABILITY_ROADMAP.md`
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md`
- `Docs/24_MODULES/WORK/DOMAIN_INTEGRATION_BACKLOG.md`
- `server/nova-core/mission-evidence-certifier.ts`
- `server/nova-core/mission-evidence-certifier.test.ts`
- `server/os-integration/runtime-evidence-consumption.ts`
- `server/os-integration/runtime-evidence-consumption.test.ts`

### 1.2 Sources complémentaires déterminantes

- `Docs/24_MODULES/WORK/WORK_PHASE1_CERTIFICATION.md`
- `Docs/24_MODULES/WORK/DINT_000_DELIVERABLES_RECONCILIATION_REPORT.md`
- `Docs/24_MODULES/WORK/DINT_001_WORK_DELIVERABLES_INTERNAL_READ_REPORT.md`
- `Docs/24_MODULES/WORK/DDEC_001_WORK_DECISIONS_INTERNAL_READ_REPORT.md`
- `Docs/24_MODULES/WORK/DINTEL_000_INTELLIGENCE_RECONCILIATION_REPORT.md`
- `Docs/24_MODULES/WORK/DINTEL_000_INTELLIGENCE_MATRIX.md`
- `Docs/24_MODULES/WORK/DINTEL_000_INTELLIGENCE_DUPLICATES.md`
- certifications et registres PEOPLE, PLANNING et ACTIONS sous `Docs/12_CERTIFICATION`
- implémentations Work, People, Planning et Actions sous `server/runtime/work` et
  `server/domain`
- `server/nova-core/nova-core.types.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.http.ts`
- `server/nova-core/certified-integration-service.ts`
- `server/nova-core/integration-runtime-repository.ts`
- `server/runtime/orchestrator/orchestrator-runtime.types.ts`
- `server/nova-core/nova-core.execution.ts`
- `Docs/19_PROGRAMS/PROGRAM-003_CONSTRUCTION/P3-WS-001_CONSTRUCTION_GOVERNANCE_AND_TRACEABILITY_SETUP/MO_004_EVIDENCE_AND_DOCUMENTARY_TEST_CONTROL.md`

### 1.3 Recherches globales exécutées

La recherche a couvert le workspace courant, code et documentation, y compris les fichiers
non suivis visibles, avec exclusion sémantique des artefacts CEREBRAU comme sources métier.
Les symboles suivants ont été recherchés explicitement :

`EvidenceAggregate`, `EvidenceAuthority`, `EvidenceRepository`, `EvidenceStore`,
`EvidenceCreated`, `EvidenceRecorded`, `createEvidence`, `recordEvidence`,
`persistEvidence`, `IntelligenceAssessment`, `AnalysisEstablished`,
`InsightEstablished`, `RecommendationIssued`, `EvidenceId`, `WorkReference`,
`projectId`, `workId`, `provenance`, `certificationStatus`.

Résultats structurants :

- aucun répertoire `server/domain/evidence`, `server/domain/intelligence`,
  `server/runtime/evidence` ou `server/runtime/intelligence` ;
- aucune occurrence des neuf symboles de modèle/producteur/persistance Evidence listés
  ci-dessus ;
- `AnalysisEstablished`, `InsightEstablished` et `RecommendationIssued` existent uniquement
  comme événements conceptuels dans `INTELLIGENCE_DOMAIN_BLUEPRINT.md`, pas dans le code ;
- les seuls fichiers de production dont le nom contient `evidence` sous `server` sont
  `mission-evidence-certifier.ts` et `runtime-evidence-consumption.ts` ;
- la recherche élargie a aussi retrouvé `EvidenceSubmission` et `submitEvidence`, analysés
  en section 4. Ils constituent une soumission de rapport Mission, pas un domaine Evidence.

### 1.4 Limites de l'audit

- Aucun test n'a été exécuté : la mission est un audit d'architecture read-only. Les résultats
  de tests cités sont ceux inscrits dans les rapports et certificats existants.
- Aucun stockage externe ni état de production distant n'a été interrogé. La conclusion porte
  sur l'architecture et les sources présentes dans le dépôt/workspace audité.
- Le worktree contient des artefacts non suivis préexistants, dont le répertoire de mission.
  Aucun n'a été promu en source métier. Le rapport présent est le seul livrable créé.
- Le rapport DINTEL-000 date du 2026-07-30. Ses conclusions Intelligence restent valides, mais
  son état historique People/Planning/Actions est remplacé dans le présent audit par les
  certifications courantes du registre.
- L'approbation humaine finale étant obligatoire, ce rapport ne fabrique ni certificat ni
  ouverture de lot.

## 2. Taxonomie obligatoire des Evidence

| Classe | Réalité observée | Producteur / propriétaire | Clés | Persistance / accès | Qualification |
|---|---|---|---|---|---|
| Runtime Evidence | faits de readiness et liens de traçabilité Runtime | Runtime Traceability et OS Integration | identifiants de composants et de liens | résultat composé en mémoire par `verifyRuntimeEvidenceConsumption` | Existe ; technique uniquement |
| Mission Technical Evidence | bundle de preuves d'une exécution Mission et décision technique | `MissionEvidenceCertifier`, alimenté par `CertifiedIntegrationService` | `missionId`, `runId`, `evidenceId`, `evidenceType` | records `EVIDENCE` et `CERTIFICATION` dans `IntegrationRuntimeRepository` | Existe ; certification technique uniquement |
| Deliverable Integrity Evidence | empreinte de fichiers produits dans un rapport Mission | mapper Nova Core puis `MissionReport` | `projectId`, `missionId`, `reportId`, `runId`, chemin, SHA-256 | report Runtime ; lecture Work Deliverables | Existe ; preuve technique de livrable, pas autorité Evidence générale |
| Governance Evidence | rapports, certificats, registres, preuves documentaires et outils de mission | Governance/Certification ; certains outils CEREBRAU hors produit | IDs de mission/lot, chemins, empreintes | documents et registres | Existe ; hors métier Evidence Work |
| Business Evidence | preuve métier admissible, identifiée, sourcée, cyclée, certifiable et associable à Work | domaine Evidence attendu | aucune clé matérialisée | aucune | **ABSENT** |

La présence d'un type ou d'une variable nommé `evidence` ne transfère pas son autorité vers le
domaine métier Evidence. Cette distinction est imposée par `WORK_DOMAIN_BLUEPRINT.md:135`,
qui exclut de Work la production ou certification d'une preuve, et par
`INTELLIGENCE_DOMAIN_BLUEPRINT.md:40,162,183`, qui interdit à Intelligence de créer ou modifier
Evidence.

## 3. Réponses obligatoires Q1 à Q8

### Q1 — Evidence existe-t-il réellement comme domaine métier NOVA ?

**FACT**  
Il n'existe aucun domaine métier Evidence matérialisé dans NOVA.

**EVIDENCE**

- `server/domain/evidence` et équivalents Runtime sont absents.
- Aucun Blueprint Evidence dédié n'existe.
- Aucun `EvidenceAggregate`, `EvidenceAuthority`, `EvidenceRepository`, `EvidenceStore`,
  événement de création/enregistrement ou commande de création/persistance Evidence n'a été
  trouvé.
- `WORK_DOMAIN_BLUEPRINT.md:135` désigne `Evidence / Certification` comme propriétaire externe.
- `WORK_DOMAIN_BLUEPRINT.md:479` ne définit encore que `Work | Evidence | FUTURE` avec zéro à
  plusieurs références.
- `NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md:18` désigne un producteur attendu `Evidence`, sans
  implémentation correspondante.

**ANALYSIS**  
Les mécanismes techniques existants ne satisfont pas ensemble identité métier, propriétaire,
agrégat, lifecycle, provenance métier, certification résolue et accès par Work. La documentation
nomme le domaine attendu, mais une frontière documentaire future ne constitue pas un domaine
existant.

**LIMIT**  
La conclusion ne nie pas l'existence de preuves techniques ou documentaires. Elle porte
strictement sur Business Evidence utilisable par WCF-004 et Intelligence.

**DECISION**  
`ABSENT`.

**NEXT ACTION**  
Décision humaine d'architecture Evidence avant toute implémentation ou association Work.

### Q2 — Quelle est aujourd'hui la source autoritative Evidence ?

**FACT**  
La source autoritative de Business Evidence est `NONE`.

**EVIDENCE**

| Attribut demandé | État actuel |
|---|---|
| domaine propriétaire | `NONE` |
| producteur | `NONE` |
| modèle | `NONE` |
| agrégat | `NONE` |
| stockage | `NONE` |
| lifecycle | `NONE` |
| provenance métier | `NONE` |
| identifiants métier | `NONE` |
| clé Mission | `NONE` pour Business Evidence |
| clé Work | `NONE` |
| API/query interne | `NONE` pour Business Evidence |

Les mécanismes voisins ont des clés différentes :

- `MissionEvidenceBundle` porte `missionId` et `runId`
  (`mission-evidence-certifier.ts:61-75`) ;
- `IntegrationPersistedRecord` porte `recordId`, `kind`, `missionId`, `runId`, `source` et
  `occurredAt` (`integration-runtime-repository.ts:21-36`) ;
- `RuntimeEvidenceConsumptionFact` porte un ID fermé de composant, `sourceReference` et
  `ready` (`runtime-evidence-consumption.ts:20-39`) ;
- `MissionReport.deliverableEvidence` porte chemin, taille, SHA-256, date et `runId`
  (`orchestrator-runtime.types.ts:140-177`).

**ANALYSIS**  
Aucun de ces modèles ne possède une clé Work ni une sémantique Business Evidence. Le record
technique `kind="EVIDENCE"` n'est pas un agrégat Evidence : son repository accepte aussi
SESSION, CERTIFICATION, HUMAN_APPROVAL et LOG, et son accès est indexé par kind/Mission/Run.

**LIMIT**  
`MissionReport.deliverableEvidence` reste autoritatif pour l'intégrité des livrables produits,
conformément à la certification Work Phase 1. Cette autorité bornée n'est pas généralisée.

**DECISION**  
`NONE`.

**NEXT ACTION**  
Établir une source Business Evidence unique ; ne pas renommer un store Runtime existant.

### Q3 — `mission-evidence-certifier` peut-il être réutilisé ?

**FACT**  
Le composant certifie un bundle technique de Mission. Il ne produit pas de Business Evidence.

**EVIDENCE**

- entrées : `missionId`, `runId`, décision d'autorité de gouvernance, statut de validation,
  trace de pipeline, artefacts manquants et preuves techniques
  (`mission-evidence-certifier.ts:36-46`) ;
- décisions : `GO | NO_GO | BLOCKED` techniques (`:20-21,48-52`) ;
- persistance : records Runtime `EVIDENCE` et `CERTIFICATION` (`:143-195`) ;
- production effective : exécution, résultat Runtime, Git provenance et isolation du prompt
  dans `certified-integration-service.ts:125-175` ;
- absence de `projectId`, `workId`, WorkReference, type de sujet métier ou lifecycle Evidence.

**ANALYSIS**  
Le promouvoir en Evidence métier déplacerait une responsabilité technique et créerait une
fausse autorité. Un éventuel futur mécanisme de qualification pourrait seulement référencer
un résultat technique comme source externe ; cette possibilité n'est ni définie ni requise
pour conclure le présent audit.

**LIMIT**  
La décision ne demande aucune suppression ni refactor du certifier. Il reste valide dans sa
frontière Mission/Certification technique.

**DECISION**  
`NOT_APPLICABLE` pour Business Evidence et WCF-004 ; action de conservation : `KEEP` dans son
domaine actuel.

**NEXT ACTION**  
Ne pas l'inclure comme producteur dans le futur Mission Order Evidence. Une référence technique
ne pourra être admise qu'après règle explicite de qualification, hors MVP obligatoire.

### Q4 — `runtime-evidence-consumption` peut-il être réutilisé ?

**FACT**  
Le composant produit une preuve de readiness OS à partir de faits et liens Runtime fermés.

**EVIDENCE**

- les seuls faits admis sont runtime-core, mission-runtime, workflow-runtime, agent-runtime,
  execution-engine et runtime-traceability (`runtime-evidence-consumption.ts:20-26,78-85`) ;
- les sorties de gouvernance sont readiness, coverage, execution/certification/archive
  readiness (`:28-33,98-104`) ;
- la fonction principale dépend de `verifyOsIntegrationFoundation` et
  `verifyRuntimeTraceabilityFoundation` (`:149-166`) ;
- aucun `projectId`, `missionId`, `workId`, contenu métier, statut de certification métier ou
  relation Work n'est présent.

**ANALYSIS**  
Il s'agit de Runtime Evidence transformée en Governance Evidence. Business Evidence est une
classe absente et sémantiquement distincte. Adapter ces booléens de readiness en faits métier
violerait l'interdiction de promouvoir une métrique ou un diagnostic technique.

**LIMIT**  
Le composant peut continuer à certifier la préparation du Runtime ; l'audit ne remet pas en
cause ses tests ni sa place dans OS Integration.

**DECISION**  
`NOT_APPLICABLE` pour Business Evidence et WCF-004 ; action de conservation : `KEEP`.

**NEXT ACTION**  
Aucun raccordement à Work ou Intelligence.

### Q5 — WCF-004 existe-t-il déjà sous une autre forme ?

**FACT**  
Aucune association autoritative Business Evidence -> `WorkReference(projectId, workId)` ou
équivalent sémantiquement complet n'existe.

**EVIDENCE**

- `WorkDeliverablesQuery` réalise Work -> Mission ->
  `MissionReport.deliverableEvidence` (`DINT_001...REPORT.md:36-55`) ;
- le service copie seulement `path`, `size`, `sha256`, `modifiedAt`, `runId` dans une lecture
  immuable (`work-deliverables.service.ts:53-71`) ;
- DINT-001 exclut explicitement `status` et `certificationStatus`
  (`DINT_001...REPORT.md:131-145`) ;
- `submitEvidence(projectId, missionId, EvidenceSubmission)` existe
  (`nova-core.service.ts:169-209`) et est exposé par POST
  `/api/v1/missions/{projectId}/{missionId}/evidence`
  (`nova-core.http.ts:201-205`), mais son payload contient deliverables, filesChanged, checks,
  blockers, errors et scopeConfirmed, puis devient un `MissionReport` ;
- aucun EvidenceId métier, lifecycle Evidence, association Work indépendante ou query par
  Evidence n'existe ;
- les fixtures, logs, diagnostics, Mission status, Runtime events, rapports libres et artefacts
  CEREBRAU ont été exclus conformément à la mission.

**ANALYSIS**  
La lecture Deliverables est une association Work vers des références de fichiers prouvés,
certifiée pour Deliverables. Elle constitue un input potentiel futur de Business Evidence,
mais ne satisfait pas WCF-004, qui exige identité de preuve, provenance et statut de
certification conservés sans seconde vérité. `submitEvidence` est un nom de route historique
pour soumettre le rapport d'une Mission, non un command handler d'un agrégat Evidence.

**LIMIT**  
Cette conclusion ne rétrograde pas DINT-001 : Work Deliverables reste certifié dans son
périmètre exact.

**DECISION**  
WCF-004 : `ABSENT`.

**NEXT ACTION**  
Créer d'abord l'autorité Evidence, puis une association Work ne stockant que les références et
la provenance de l'association ; résoudre les métadonnées Evidence à la lecture.

### Q6 — Le trou est-il Evidence Domain ou seulement Work Evidence Association ?

**FACT**  
Le producteur amont et l'association aval sont tous deux absents.

**EVIDENCE**

- la matrice canonique attend explicitement `Preuves autoritatives | Evidence` avant WCF-004
  (`NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md:18`) ;
- la roadmap donne à WCF-004 la dépendance d'entrée `Evidence`
  (`NOVA_WORK_CAPABILITY_ROADMAP.md:25,83-89`) ;
- aucune autorité Evidence n'a été trouvée ;
- aucune association générale Evidence/Work n'a été trouvée.

**ANALYSIS**  
Une association seule ne peut pas devenir autoritative si la référence cible n'a pas d'identité
ni de lifecycle. Implémenter uniquement WCF-004 produirait des identifiants sans propriétaire
ou recopierait les preuves techniques existantes, donc une seconde vérité.

**LIMIT**  
Le choix A n'affirme pas que l'association existe : il identifie le trou racine parmi les choix
imposés. WCF-004 reste un deuxième trou obligatoire.

**DECISION**  
`A — Evidence Domain manquant`.

**NEXT ACTION**  
Ordre obligatoire : décision Evidence -> fondation Evidence -> WCF-004 -> état Work composé.

### Q7 — Intelligence peut-il être ouvert maintenant ?

**FACT**  
Les gates d'entrée obligatoires d'Intelligence ne sont pas satisfaits.

**EVIDENCE**

- Phase 2 impose `Work ; Evidence pour toute affirmation factuelle`
  (`WORK_PHASE2_CERTIFICATION.md:139-146`) ;
- un producteur autoritatif explicite doit précéder toute consommation
  (`WORK_PHASE2_CERTIFICATION.md:187-205`) ;
- la roadmap fait dépendre WCF-008 de WCF-002 à WCF-007
  (`NOVA_WORK_CAPABILITY_ROADMAP.md:28,132-141`) ;
- WCF-004 est absent ;
- DINTEL-000 identifie `NONE_IDENTIFIED`, aucune persistance, clé Work ou query ;
- aucune implémentation Intelligence nouvelle n'a été trouvée depuis DINTEL-000.

**ANALYSIS**  
People, Planning et Actions sont désormais certifiés, mais ils ne compensent pas l'absence
d'Evidence. Ouvrir le producteur Intelligence obligerait soit à accepter des faits sans preuve,
soit à promouvoir une preuve Runtime/Governance, soit à implémenter Evidence dans le même lot.
Les trois voies violent les gates Phase 3.

**LIMIT**  
Le Blueprint Intelligence est certifié comme conception. Cette certification documentaire
n'est pas une certification de producteur et n'autorise pas l'implémentation lorsque les
préconditions manquent.

**DECISION**  
`NO_GO`.

**NEXT ACTION**  
Fermer les blockers Evidence et WCF-004, puis réévaluer l'entry gate Intelligence.

### Q8 — Plus petit correctif architectural conforme MVP

**FACT**  
Le correctif minimal ne peut pas être un adapter vers un composant existant ; il requiert une
nouvelle autorité métier Evidence puis deux associations read-only.

**EVIDENCE**

- Work ne peut ni produire ni certifier Evidence (`WORK_DOMAIN_BLUEPRINT.md:135`) ;
- Work conserve des références Evidence futures (`:479`) ;
- Intelligence référence Evidence sans la modifier
  (`INTELLIGENCE_DOMAIN_BLUEPRINT.md:162,183,236-238`) ;
- Work fournit l'état autorisé et Intelligence possède les résultats (`:155`) ;
- Phase 3 interdit une copie persistante d'une source externe et un domaine multiple par lot
  (`WORK_PHASE2_CERTIFICATION.md:191-205`).

**ANALYSIS**  
Le plus petit chemin conforme sépare quatre responsabilités : autorité Evidence, association
Work/Evidence, composition read-only de l'état Work autorisé, producteur/association
Intelligence. Il ne réécrit aucun producteur People, Planning ou Actions et ne dépend d'aucune
projection.

**LIMIT**  
Les objets et noms ci-dessous sont `PROPOSED`, pas certifiés. Leur sémantique finale dépend de
la décision humaine Evidence et de la clarification « action priorisée ».

**DECISION**  
Architecture minimale proposée :

```text
[Business Evidence Authority]                       PROPOSED
  Evidence identity + provenance + lifecycle
  Certification reference/status resolved from owner
                 |
                 | EvidenceReference
                 v
[Work Evidence Association]                         PROPOSED / WCF-004
  WorkReference(projectId, workId) + EvidenceId
  association provenance only; no copied Evidence
                 |
                 v
[Authorized Work State Composer]                    PROPOSED read-only composition
  Work Core + Deliverables + Decisions + People
  + Planning + Actions + resolved Evidence
                 |
                 v
[Intelligence Assessment Authority]                 blueprint-defined target
  source references + Analysis + Insights
  + Recommendations + Evaluations + Diagnostics
  + revisions/withdrawals + provenance
                 |
                 v
[Work Intelligence Read Association]                PROPOSED
  query by WorkReference; no copied Assessment
                 |
                 +--> Synthesis domain, after Intelligence certification
                 +--> Confidence domain, last in canonical order
```

**NEXT ACTION**  
Exécuter les lots proposés en section 9, après approbation humaine du lot de décision.

## 4. Qualification des composants Evidence voisins

### 4.1 `EvidenceSubmission` / `submitEvidence`

`EvidenceSubmission` contient uniquement `reportId?`, `reportType?`, `deliverables`,
`filesChanged`, `checks`, `blockers?`, `errors?` et `scopeConfirmed`
(`nova-core.types.ts:3-12`). `NovaCoreService.submitEvidence` valide ce payload, fait progresser
la Mission et construit un `MissionReport` (`nova-core.service.ts:169-209`). Il ne crée aucun
objet Evidence identifié. La route HTTP est une entrée Runtime historique, pas une API métier
Evidence.

Qualification : `KEEP` comme entrée Mission existante ; `NOT_APPLICABLE` comme autorité
Business Evidence.

### 4.2 `MissionReport.deliverableEvidence`

Le mapper collecte les fichiers créés/modifiés, exige une entrée déclarée `VALID`, recalcule le
SHA-256 et conserve chemin, taille, date et Run (`nova-core.execution.ts:649-692`). La
certification vérifie ensuite absence, périmètre et dérive (`nova-core.service.ts:638-661`).

Qualification : `KEEP` comme source autoritative de l'intégrité d'un livrable Mission ; entrée
candidate à référencer par une future Evidence Authority, jamais à recopier ou promouvoir
implicitement.

### 4.3 `MissionEvidenceCertifier`

Qualification : preuve et certification techniques de la chaîne Mission/Run. Feature flag OFF
par défaut dans son constructeur (`mission-evidence-certifier.ts:97-107`). Son repository est
générique à l'intégration et son record ne connaît pas Work.

Qualification : `KEEP`; réutilisation WCF-004 : `NOT_APPLICABLE`.

### 4.4 `runtime-evidence-consumption`

Qualification : agrégation immuable de readiness et de traçabilité Runtime/OS. Les tests
vérifient six faits, huit liens et cinq items de gouvernance, ainsi que les rejets de doublons,
topologies incohérentes et références non normalisées.

Qualification : `KEEP`; réutilisation WCF-004 : `NOT_APPLICABLE`.

### 4.5 MO-004 historique

`MO_004_EVIDENCE_AND_DOCUMENTARY_TEST_CONTROL.md:23-31` déclare définir des critères
obligatoires pour les livraisons de construction, créer uniquement des contrôles documentaires
de gouvernance et ne créer aucun code, API, architecture ou Blueprint.

Qualification : `NOT_APPLICABLE` à Business Evidence. Toute promotion violerait la séparation
CEREBRAU/NOVA et gouvernance/produit.

## 5. État réel des dépendances WCF

Les statuts ci-dessous sont reconstruits depuis le code et les certifications actuelles. Ils
ne reprennent pas les statuts historiques `PARTIAL/MISSING` de la roadmap.

| Lot sémantique actuel | Statut réel | Preuve code | Preuve de certification / décision | Analyse |
|---|---|---|---|---|
| WCF-001 — Work Core Foundation | **CERTIFIED** | `server/runtime/work/work-core-foundation.ts`, `work-lifecycle.ts`, `work-core.types.ts`, tests | `WORK_PHASE1_CERTIFICATION.md:53-70,437-443` | Identity, Mission link, Lifecycle, Progress, timestamps et provenance sont intégrés. |
| WCF-002 — Work Deliverables | **CERTIFIED** | `work-deliverables.*`; source `MissionReport.deliverableEvidence` | DINT-001 GO ; `WORK_PHASE1_CERTIFICATION.md:89-100,220-231,437-443` | Le lot sémantique Deliverables a été réalisé sous l'identifiant DINT-001. Aucun store secondaire. |
| WCF-003 — Work Planning | **CERTIFIED** | `server/domain/planning/*`; `server/domain/work/work-planning.*` | `P3-PLANNING-001G.certification.json` porte `Status=CERTIFIED`; registre idem | Le NO GO historique de `WCF_003_WORK_PLANNING_FOUNDATION_REPORT.md` est superseded par la Phase 3 certifiée, sans réécrire l'artefact historique. |
| WCF-004 — Work Sources and Evidence | **ABSENT** | aucun module Work Evidence ; aucun domaine Evidence | aucun certificat WCF-004 / Evidence | Les sources techniques partielles ne satisfont pas le lot. |
| WCF-005 — Work Decisions | **CERTIFIED** | `work-decisions.*`; `HumanApprovalWorkflow.history` | DDEC-001 GO ; `WORK_PHASE1_CERTIFICATION.md:104-113,233-245,437-443` | Association read-only de l'historique humain ; aucune décision principale inventée. |
| WCF-006 — Work People | **CERTIFIED** | `server/domain/people/*`; `server/runtime/work/work-people.*` | P3-PEOPLE-001H certifie B-G ; certificat et registre `CERTIFIED` | Query Work -> People unidirectionnelle avec états unavailable/absent/empty/available. |
| WCF-007 — Work Actions | **CERTIFIED** | `server/domain/actions/*`; `server/domain/work/work-actions.*` | `P3-ACTIONS-001G.certification.json` et registre portent `CERTIFIED` | Producteur, journal, accès interne et association Work sont certifiés. |
| WCF-008 — Work Intelligence | **ABSENT** | aucun module Intelligence ni query Work Intelligence | DINTEL-000 NO GO ; aucun certificat Phase 3 Intelligence | Blueprint seul ; producteur, persistance/recomposition, résultats et association absents. |

### 5.1 Collision historique des labels WCF

`WORK_PHASE1_CERTIFICATION.md:55-57` appelle historiquement WCF-002 « Work Objective » et
WCF-003 une recherche Planning. La roadmap canonique actuelle appelle WCF-002 Deliverables et
WCF-003 Planning. Le présent tableau classe les capacités sémantiques demandées par la mission,
pas les anciens numéros. Le module Work Objective reste `KEEP`; son ancien label ne constitue
ni un deuxième lot Deliverables ni une raison de modifier une source Phase 1.

### 5.2 Protection des domaines certifiés

| Domaine | État | Règle de protection |
|---|---|---|
| PEOPLE | certifié jusqu'à P3-PEOPLE-001H | aucune réécriture ; consommation par `WorkPeopleQuery` ou port interne certifié |
| PLANNING | certifié jusqu'à P3-PLANNING-001G | aucune réécriture ; consommation par `WorkPlanningQuery` / accès interne certifié |
| ACTIONS | certifié jusqu'à P3-ACTIONS-001G | aucune réécriture ; consommation par `WorkActionsQuery` / accès interne certifié |

Toute proposition imposant une refonte substantielle de ces domaines est classée
`ARCHITECTURAL_REGRESSION`. Aucun blocker démontré n'exige une telle refonte.

## 6. Audit détaillé du Blueprint Intelligence contre l'état réel

| Contrôle | Exigence canonique | État réel | Décision |
|---|---|---|---|
| Aggregate root | `Intelligence Assessment` (`INTELLIGENCE_DOMAIN_BLUEPRINT.md:86-109`) | aucun type/agrégat logiciel | **ABSENT** |
| Producteur autoritatif | Intelligence possède Analysis, Insights, Recommendations, Evaluations, Diagnostics, Learning | aucun producteur ; DINTEL-000 `NONE_IDENTIFIED` | **ABSENT** |
| Work input | Work fournit un état autorisé (`:155`) | queries séparées existent, mais aucun composer autorisé incluant Evidence | **PARTIAL** |
| Inputs opérationnels | Planning, Actions, People, Deliverables, Decisions optionnels en lecture (`:151-168`) | producteurs/queries présents ; pas d'adapter Intelligence | **PARTIAL** |
| Evidence | obligatoire lorsqu'un résultat affirme un fait (`:162`) | Business Evidence et WCF-004 absents | **BLOCKING ABSENCE** |
| Knowledge | référence autorisée, jamais copie (`:147-149,165`) | résolveurs existants mais qualifiés préparation/gouvernance ; aucune autorité Knowledge métier d'Intelligence établie | **NOT AVAILABLE AS AUTHORITY** |
| Provenance | sources, méthode, résultats, date et révisions (`:22-35,90-108`) | aucun modèle persistant ou recomposé | **ABSENT** |
| Lifecycle | révision/retrait et histoire requis (`:70-75,179-190,193-212`) | événements conceptuels documentés, mais aucun statut, state machine ou lifecycle logiciel | **ABSENT IN RUNTIME** |
| Persistence / recomposition | Phase 3 exige une persistance unique seulement si le lifecycle l'exige | aucune décision ni mécanisme ; DINTEL-000 l'exige comme prérequis | **UNDECIDED / BLOCKING** |
| Work association | relation déterministe pour tout Work Assessment (`:155,172`) | aucune clé Work ou query | **ABSENT** |
| Absence explicite | invariants 15 et 20 ; roadmap distingue sortie absente/producteur indisponible | aucun contrat d'état | **ABSENT** |
| Indisponibilité producteur | exigence WCF-008 | aucun contrat | **ABSENT** |
| Analysis | concept et événements définis | aucune production | **ABSENT** |
| Insight | doit être soutenu par une Analysis (`:175`) | aucune production | **ABSENT** |
| Recommendation | non impérative, ni Decision ni Action (`:131-133,177-178,240-242`) | aucune production | **ABSENT** |
| Action priorisée / Next Best Action | Work et WCF-008 attendent une action priorisée ; roadmap attribue la sélection à Intelligence | aucun concept explicite dans le Blueprint Intelligence ; Recommendation peut seulement proposer une Action | **NORMATIVE AMBIGUITY / STOP** |
| Confidence | Intelligence calcule selon le modèle Confidence (`:163,187,252-254`) | Blueprint Confidence existe ; aucun producteur/calcul | **ABSENT, FUTURE** |
| Synthesis | consommateur distinct, producteur attendu relevant d'Intelligence (`:164,256-258`) | Blueprint existe ; aucun producteur | **ABSENT, FUTURE** |

### 6.1 Frontières à conserver

- **Synthesis** : domaine consommateur distinct ; ne pas stocker une synthèse dans l'Assessment
  comme simple texte de report.
- **Work Actions** : une Recommendation n'est pas une Action. Une action recommandée doit être
  admise par l'acte métier Actions/Decision requis avant effet.
- **Planning** : la priorité planifiée appartient à Planning. Intelligence peut recommander une
  évolution mais ne modifie pas le plan.
- **Decisions** : Intelligence ne prend ni n'applique une Decision.
- **Deliverables** : Intelligence lit les références et Evidence ; le contenu et ses preuves
  restent chez leurs propriétaires.
- **Confidence** : Intelligence produit la mesure ; le modèle, l'échelle et les invariants
  appartiennent à Confidence.
- **Runtime** : log, readiness, diagnostic et métrique ne sont jamais des résultats métier
  implicites.

### 6.2 Blocker normatif « action priorisée »

**FACT**  
`WORK_DOMAIN_BLUEPRINT.md:433-438`, `NOVA_WORK_CAPABILITY_ARCHITECTURE.md:107,184,219` et
`NOVA_WORK_CAPABILITY_ROADMAP.md:117,123-126` attendent une action priorisée ou sélection de la
prochaine meilleure action issue d'Intelligence. `INTELLIGENCE_DOMAIN_BLUEPRINT.md` ne définit
pas de `PrioritizedAction`; il définit une Recommendation non impérative. Planning possède les
priorités de planification et Actions possède l'Action.

**EVIDENCE**  
Les lignes citées sont canoniques et aucune implémentation ne résout la sémantique.

**ANALYSIS**  
Deux modèles sont possibles mais non décidables par cet audit :

- `PROPOSED OPTION 1` : résultat Intelligence = Recommendation classée/rankée qui référence une
  Action existante, sans créer ni prioriser le Planning ;
- `PROPOSED OPTION 2` : la priorité est un objet Planning et Intelligence ne produit qu'une
  recommandation d'évolution.

**LIMIT**  
Choisir l'une de ces options serait une décision normative non autorisée.

**DECISION**  
`HUMAN_ARCHITECTURE_DECISION_REQUIRED` ; STOP avant contrat Intelligence.

**NEXT ACTION**  
Décision d'architecture humaine ; si un Blueprint doit être modifié, appliquer un lot
documentaire gouverné séparé avant toute implémentation.

## 7. CURRENT STATE, GAP et ROOT CAUSE

### A. CURRENT STATE

```text
Mission / Runtime / Certification
  |-- Mission technical evidence bundle + technical GO/NO_GO/BLOCKED
  |-- Runtime/OS readiness evidence
  `-- MissionReport.deliverableEvidence (file integrity)
             |
             `--> Work Deliverables internal read

Work Core -- certified
  |-- Deliverables -- certified internal read
  |-- Decisions ---- certified internal read
  |-- People ------- certified
  |-- Planning ----- certified
  |-- Actions ------ certified
  |-- Evidence ----- ABSENT
  `-- Intelligence - ABSENT
```

### B. GAP

Chaîne manquante exacte :

```text
Business Evidence authority
  -> Evidence identity/lifecycle/provenance/certification relation
  -> Work EvidenceReference association (WCF-004)
  -> authorized consolidated Work read
  -> Intelligence Assessment producer
  -> Work Intelligence read association
```

Synthesis et Confidence restent des domaines postérieurs, conformément à l'ordre Phase 3.

### C. ROOT CAUSE

La roadmap a déclaré Evidence comme domaine propriétaire attendu et WCF-004 comme consommateur,
mais aucun Blueprint Evidence, lot Phase 3 Evidence, agrégat, producteur ou source unique n'a été
établi. DINTEL-000 a correctement bloqué l'intégration Intelligence faute de producteur ; le
présent audit montre que le prérequis Evidence de ce producteur est lui-même non matérialisé.

La cause n'est pas une absence de données UI ni un manque d'adapter. Elle est une fondation
métier non décidée.

## 8. TARGET ARCHITECTURE minimale — PROPOSED

Cette section est une proposition d'architecture permettant de rédiger de futurs Mission
Orders. Elle ne remplace aucun Blueprint et n'autorise aucune implémentation.

### 8.1 Autorité Business Evidence — PROPOSED

Responsabilité minimale : enregistrer une preuve métier par référence à une source autorisée,
préserver son identité et sa provenance, exposer son état courant et sa relation à
Certification, sans copier le contenu source.

Contrat minimal à faire décider humainement :

- `EvidenceId` stable ;
- type/usage métier de la preuve ;
- référence de sujet ou de source ;
- domaine et producteur d'origine ;
- locator/référence et empreinte lorsque disponible ;
- date d'occurrence et date d'enregistrement ;
- lifecycle et règle de retrait/invalidation ;
- `CertificationReference` vers l'autorité Certification ;
- sémantique du statut de certification résolu ;
- stratégie de persistance unique ou preuve de recomposition déterministe ;
- queries par `EvidenceId` et références admissibles.

Interdictions : payload dupliqué, Work propriétaire du contenu, réutilisation du record Runtime
générique comme store métier, fallback sur fixture/log/report libre, dépendance CEREBRAU.

### 8.2 Association Work Evidence — PROPOSED / WCF-004

Work possède seulement :

- `WorkReference(projectId, workId)` ;
- `EvidenceId` ;
- provenance et date de l'association ;
- cardinalité et unicité de l'association ;
- états explicites `PRODUCER_UNAVAILABLE`, `AVAILABLE_EMPTY`, `AVAILABLE` au niveau de la query.

La query résout identité, provenance et certification depuis les propriétaires Evidence et
Certification. Elle ne persiste pas une copie de ces champs mutables.

### 8.3 État Work consolidé autorisé — PROPOSED read-only

Un composer interne lit les queries certifiées existantes : Work Core, Deliverables, Decisions,
People, Planning, Actions et Evidence. Il retourne un snapshot d'entrée daté avec références et
états de disponibilité. Il ne devient pas un nouvel agrégat ni une persistance concurrente.

### 8.4 Intelligence Assessment — cible déjà définie par le Blueprint

Le producteur Intelligence possède Assessment et résultats. Chaque Assessment Work doit porter
une WorkReference déterministe, la question, le périmètre des faits, les EvidenceIds,
KnowledgeReferences autorisées, méthode/critères, résultats, limites, date, provenance,
révision/retrait.

La persistance ou recomposition doit être décidée avant le code. Les invariants d'histoire des
révisions et retraits rendent une simple valeur en mémoire insuffisante sauf démonstration d'un
journal autoritatif existant qui ne crée aucune seconde vérité.

### 8.5 Association Work Intelligence — PROPOSED

Le sens minimal est Intelligence -> WorkReference. Une query Work liste les Assessments et
résultats autorisés par WorkReference. Work ne stocke pas de copie des Analysis, Insights ou
Recommendations.

### 8.6 Synthesis et Confidence

Ils ne doivent pas être implémentés dans le lot Intelligence :

1. Intelligence est certifié ;
2. Synthesis est ensuite produit dans son domaine ;
3. Confidence est ajouté en dernier selon le modèle Confidence.

WCF-008 ne peut être déclaré complètement certifié qu'après les associations de résultats
requises par sa portée. Une ouverture Intelligence n'autorise pas à fabriquer Synthesis ou
Confidence.

## 9. REQUIRED LOTS et EXECUTION ORDER — PROPOSED

Les identifiants ci-dessous sont proposés et non officiels.

### Lot 0 — `ARCH-EVIDENCE-001` — décision humaine Evidence

Périmètre : décision/Blueprint métier uniquement, aucune implémentation.

**ENTRY GATES**

- présent audit approuvé humainement ;
- propriétaires Evidence et Certification représentés ;
- sources techniques voisines classifiées et gelées dans leurs domaines.

**EXIT GATES**

- propriétaire Business Evidence unique ;
- agrégat ou modèle d'autorité nommé ;
- identité, provenance, lifecycle, invalidation et certification définis ;
- sources admissibles et sources interdites définies ;
- stratégie de persistance/recomposition décidée ;
- relation Mission/Work décidée ;
- absence de dépendance CEREBRAU confirmée ;
- sémantique « action priorisée » tranchée ou lot documentaire séparé ordonné ;
- approbation humaine.

### Lot 1 — `P3-EVIDENCE-001` — Evidence Foundation

Périmètre : fondation, producteur autoritatif, persistance si décidée, accès interne et tests ;
aucun Work integration, frontend ou BFF.

**ENTRY GATES**

- Lot 0 approuvé ;
- Blueprint Evidence certifié ;
- source de vérité unique et producteur démontrables ;
- aucun besoin de modifier une source Phase 1.

**EXIT GATES**

- EvidenceId, provenance et lifecycle testés ;
- création/enregistrement autorisé et rejets testés ;
- Certification référencée sans absorption ;
- persistance unique/recovery/idempotence démontrés si requis ;
- query interne par EvidenceId ;
- absence, indisponibilité et invalidation explicites ;
- aucune copie du contenu source ;
- certification humaine du lot.

### Lot 2 — `WCF-004` — Work Evidence Association

Périmètre : association read-only Work/Evidence et query ; aucune création/certification de
preuve dans Work.

**ENTRY GATES**

- Evidence Foundation certifiée ;
- WCF-001 toujours certifié ;
- WorkReference canonique confirmée ;
- accès Certification disponible par référence.

**EXIT GATES**

- association déterministe `(projectId, workId, EvidenceId)` ;
- identité, provenance et statut de certification résolus depuis les propriétaires ;
- aucune copie persistante créant une seconde vérité ;
- producer unavailable / empty / available distingués ;
- tests Work, Runtime, Core, frontières et régressions PASS ;
- PEOPLE, PLANNING et ACTIONS inchangés ;
- certification humaine du lot.

### Lot 3 — `WORK-AUTHORIZED-STATE-001` — composition d'entrée Intelligence

Périmètre : composer read-only interne. Il peut être un sous-lot de l'intégration Intelligence
si les règles de gouvernance l'autorisent, mais ne doit pas devenir un store.

**ENTRY GATES**

- WCF-004 certifié ;
- queries certifiées des domaines contributeurs disponibles.

**EXIT GATES**

- lecture déterministe par WorkReference ;
- date et provenance de chaque contribution ;
- états d'absence/indisponibilité conservés ;
- aucune mutation et aucune persistance miroir ;
- test de données contradictoires et de sources invalidées.

### Lot 4 — `P3-INTELLIGENCE-001` — Intelligence Foundation

Ce lot doit suivre la structure Phase 3 certifiée : contrat, foundation, producteur,
persistance si nécessaire, accès interne, Work integration, tests, certification. Ces étapes
peuvent être des sous-lots séquentiels ; elles ne doivent pas absorber Evidence, Synthesis ou
Confidence.

**ENTRY GATES**

- Lots 0 à 3 certifiés ;
- sémantique action priorisée décidée ;
- Assessment, lifecycle et persistance/recomposition spécifiés ;
- aucun changement de Blueprint requis par le contrat ;
- aucun producteur concurrent.

**EXIT GATES**

- Intelligence Assessment autoritatif ;
- Analysis traçable ; Insight soutenu ; Recommendation non impérative ;
- faits/hypothèses/interprétations distingués ;
- toute affirmation factuelle référence au moins une Evidence admissible ;
- contradictions et limites explicites ;
- révision et retrait historisés ;
- query par WorkReference ;
- Work lit les résultats sans les copier ;
- absence et producer unavailable explicites ;
- aucune Action, Decision, Planning, Synthesis ou Confidence implicite ;
- tests et certification humaine.

### Lot 5 — `P3-SYNTHESIS-001`

Ouverture uniquement après certification Intelligence. Produit Work Synthesis dans son domaine,
à partir de Work consolidé et de résultats Intelligence. Ne crée aucune priorité, Action ou
preuve.

### Lot 6 — `P3-CONFIDENCE-001`

Ouverture uniquement après Synthesis selon l'ordre de gouvernance canonique. Applique le modèle
Confidence à un sujet explicite, avec Evidence et provenance ; aucun score par défaut.

### Ordre strict

```text
ARCH-EVIDENCE-001
  -> P3-EVIDENCE-001
  -> WCF-004
  -> WORK-AUTHORIZED-STATE-001
  -> P3-INTELLIGENCE-001
  -> P3-SYNTHESIS-001
  -> P3-CONFIDENCE-001
  -> clôture complète WCF-008 / projections ultérieures
```

## 10. REUSE MATRIX

| Composant / famille | Décision | Usage autorisé | Usage interdit |
|---|---|---|---|
| Work Core WCF-001 | **KEEP** | identité, lifecycle, progression, WorkReference | ajout de contenu Evidence/Intelligence |
| Work Deliverables / `MissionReport.deliverableEvidence` | **KEEP** | référence de livrable et intégrité de fichier | autorité Evidence générale |
| Work Decisions / Human Approval | **KEEP** | décisions autoritatives en lecture | certification Evidence ou décision Intelligence |
| People certifié | **KEEP** | contexte optionnel par query | réécriture ou copie |
| Planning certifié | **KEEP** | contexte optionnel et priorité planifiée | priorité Intelligence écrite directement |
| Actions certifié | **KEEP** | actions et résultats autoritatifs | Recommendation transformée implicitement en Action |
| `MissionEvidenceCertifier` | **KEEP** | certification technique Mission | producteur Business Evidence ; réutilisation WCF-004 `NOT_APPLICABLE` |
| `CertifiedIntegrationService` | **KEEP** | chaîne technique d'intégration certifiée | producteur Intelligence |
| `IntegrationRuntimeRepository` | **KEEP** | records techniques existants | EvidenceRepository métier |
| `runtime-evidence-consumption` | **KEEP** | readiness Runtime/OS | Business Evidence ; réutilisation WCF-004 `NOT_APPLICABLE` |
| `EvidenceSubmission` / route Mission evidence | **KEEP** | soumission de rapport Mission existante | API Evidence métier |
| Knowledge resolvers et adapters NOVA | **KEEP** | préparation actuelle ; future référence seulement après autorité Knowledge explicite | Insight ou Evidence implicite |
| `CerebrauKnowledgeAdapter` et artefacts CEREBRAU | **NOT_APPLICABLE** | gouvernance de développement hors produit, selon leur frontière actuelle | source métier, dépendance Runtime NOVA |
| diagnostics Runtime, Risk Engine, KPI Engine, readiness | **KEEP** | domaine technique actuel | Intelligence, Confidence ou Evidence métier |
| projections React Work/Home | **ADAPT** ultérieurement | consommateurs après certification | source de vérité |
| fixtures insight/recommendation/reasoning/confidence | **REMOVE** ultérieurement | maintien temporaire hors source | entrée de domaine ; aucune suppression dans cet audit |
| MO-004 gouvernance documentaire | **NOT_APPLICABLE** | contrôle documentaire historique | Blueprint ou domaine Business Evidence |

Décisions `MERGE` : aucune.  
Décisions `REFACTOR` immédiates : aucune.  
Décisions `REMOVE` immédiates : aucune.

## 11. RISKS

| Risque | Niveau | Déclencheur | Contrôle obligatoire |
|---|---|---|---|
| Seconde source Evidence | CRITICAL | copier bundle Mission, report ou payload dans Work | EvidenceId + référence ; résolution chez le propriétaire |
| Store technique promu en store métier | CRITICAL | utiliser `IntegrationRuntimeRepository` comme EvidenceRepository | repository métier distinct seulement après décision ; aucun renommage |
| Duplication de certification | HIGH | stocker un statut copié dans Work | CertificationReference et résolution ; histoire chez Certification |
| Contamination Runtime/Métier | CRITICAL | readiness, log ou diagnostic devient un fait Business | qualification explicite par l'autorité Evidence ; fail closed |
| Contamination Governance/Métier | CRITICAL | certificat/rapport documentaire devient Business Evidence | classes séparées et sources interdites |
| Contamination CEREBRAU/NOVA | CRITICAL | adapter ou artefact CEREBRAU devient dépendance produit | aucune importation/dépendance/source ; contrôle de graphe |
| Régression Work | HIGH | enrichir l'agrégat Work avec copies de domaines | associations/query read-only ; WCF-001 inchangé |
| Régression PEOPLE/PLANNING/ACTIONS | CRITICAL | modifier leurs modèles pour Intelligence | ports certifiés en lecture ; `ARCHITECTURAL_REGRESSION` sinon |
| Confusion Priority | HIGH | Intelligence écrit une Priority Planning ou crée une Action | décision humaine préalable ; invariants de frontière |
| Recommendation impérative | HIGH | sortie Intelligence exécutée automatiquement | admission explicite par Actions/Decisions/Planning |
| Synthesis prématurée | HIGH | MissionReport ou texte généré renommé Synthesis | lot Synthesis postérieur et source Work/Intelligence |
| Confidence fabriquée | CRITICAL | progression/readiness/compte de validations converti en score | modèle Confidence, Evidence et provenance obligatoires |
| Lifecycle Intelligence perdu | HIGH | recomposition sans histoire de révisions/retraits | persistance/journal unique ou démonstration de recomposition complète |
| Dette MVP | MEDIUM | généraliser types, taxonomies et API avant cas minimal | un seul sujet Work, accès interne, aucune UI/BFF publique initiale |
| Label WCF ambigu | MEDIUM | confondre ancien WCF-002 Objective et WCF-002 Deliverables | Mission Orders citent capacité sémantique et preuves exactes |

## 12. Décision finale structurée

**FACT**  
PEOPLE, PLANNING et ACTIONS sont certifiés. Business Evidence, WCF-004 et le producteur
Intelligence sont absents.

**EVIDENCE**  
Certificats/registre `CERTIFIED` pour P3-PEOPLE-001H, P3-PLANNING-001G et P3-ACTIONS-001G ;
absence des répertoires et symboles Evidence/Intelligence ; DINTEL-000 `NO GO` ; dépendance
Evidence explicite des sources canoniques.

**ANALYSIS**  
Le prochain domaine de l'ordre canonique est bien Intelligence, mais l'ordre de gouvernance ne
supprime pas ses entry gates. Le trou amont impose une nouvelle fondation Evidence et WCF-004.
Une ouverture immédiate violerait la source unique, la provenance, la séparation des domaines et
la règle un domaine par lot.

**LIMIT**  
Le rapport propose un chemin et des gates, pas un modèle certifié ni une implémentation. Les noms
de lots proposés requièrent approbation humaine.

**DECISION**  
Architecture Q6 : `A — Evidence Domain manquant`.  
Ouverture Q7 : `NO_GO`.  
Verdict terminal : fondation architecturale manquante.

**NEXT ACTION**  
Soumettre `ARCH-EVIDENCE-001` à décision humaine. Aucun lot Intelligence, Synthesis, Confidence,
UI ou BFF ne doit être ouvert avant fermeture et certification des gates amont.

NO GO — ARCHITECTURAL FOUNDATION MISSING
