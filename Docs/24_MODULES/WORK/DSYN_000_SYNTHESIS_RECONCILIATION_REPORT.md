# DSYN-000 — Synthesis Reconciliation Report

Date d'audit : 2026-07-30  
Mode : audit d'architecture, lecture seule, mode économique  
Verdict : **NO GO**

## 1. Objet

Cet audit détermine si le dépôt contient déjà une source métier autoritative
permettant une lecture interne `Work Synthesis` sans créer une nouvelle source
de vérité.

Un brief de préparation, un rapport d'exécution, un journal technique ou un
texte de présentation n'est qualifié de Synthesis que s'il satisfait déjà la
définition canonique Work.

## 2. Méthode économique

L'index initial a porté sur les racines demandées. Seule `server/` existe à la
racine parmi `server/`, `modules/`, `packages/`, `legacy/`, `runtime/`, `core/`,
`engines/`, `shared/` et `common/`. La lecture a ensuite été limitée :

- aux candidats `MissionBrief` et `MissionReport` désignés par
  `DOMAIN_RECONCILIATION_AUDIT.md` ;
- aux producteurs, consommateurs et persistances de ces candidats ;
- aux modèles de résultat, timeline, log, métriques et evidence voisins ;
- aux projections Work/Home qui emploient `summary` ou `synthesis`.

`node_modules`, `dist`, `build`, `coverage`, `.git`, snapshots de test et
artefacts générés ont été exclus.

## 3. Résultat des recherches

Dans les sources backend non test :

| Concept | Résultat |
|---|---:|
| `MissionSynthesis` | 0 |
| `WorkSynthesis` | 0 |
| `SynthesisEngine` | 0 |
| `SummaryEngine` | 0 |
| `MissionSummary` / `ExecutionSummary` | 0 |
| `MissionReportSummary` / `ReportSummary` | 0 |
| `ResultSummary` / `CompletionSummary` | 0 |
| `ExecutiveSummary` / `MissionConclusion` | 0 |
| `EvidenceSummary` / `KnowledgeSummary` | 0 |
| `NarrativeBuilder` | 0 |

Les occurrences lexicales de `outcome` correspondent soit au résultat technique
`PersistedExecutionOutcome`, soit à l'authentification BFF. Les occurrences de
`digest` sont des opérations cryptographiques. Elles ne représentent pas une
synthèse métier.

Les seuls types backend contenant explicitement `Summary` sont
`MissionBriefAuthoritySummary` et `MissionBriefUxSummary`. Ils résument des
sources de préparation, pas l'état métier courant d'un Work.

## 4. Définition canonique de Synthesis

`NOVA_WORK_CAPABILITY_ARCHITECTURE.md` définit la Synthesis comme une
**synthèse métier courante, datée et sourcée**, optionnelle et future. Le
producteur attendu appartient au domaine Intelligence et consomme un état Work
consolidé.

La même architecture fixe deux invariants bloquants :

- un état, une phase, un agent ou un événement technique de Mission ne devient
  jamais implicitement une synthèse Work ;
- Work ne fabrique pas une synthèse de remplacement.

`NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md` classe cette dépendance `MISSING`.
DINTEL-000 a par ailleurs démontré l'absence de producteur Work Intelligence.

## 5. Candidat 1 — MissionBrief

### Producteur

`MissionBriefBuilder`, dans
`server/nova-core/mission-brief-builder.ts`, construit un
`MissionPackageBrief` immuable à partir de `MissionContext`.

### Données produites

- mission, objectif et métadonnées Program ;
- contraintes, dépendances et critères d'acceptation ;
- connaissances et artefacts requis/manquants ;
- périmètre et fichiers autorisés/interdits ;
- `authoritySummary` et `uxSummary`.

### Consommateurs

La chaîne de consommation observée est :

```text
MissionContext
→ MissionBriefBuilder
→ MissionPipeline
→ NovaOrchestrationBridge
→ PromptAssembler
→ RuntimeExecutionRequestBuilder
→ RuntimeExecutionGate
→ CodexRequestBuilder / RuntimeExecutorAdapter
```

### Persistance et cycle de vie

Le brief est construit avant exécution, en mémoire. Aucun repository, `append`,
`save`, cache persistant ou store du brief n'est présent dans cette chaîne. Les
composants concernés sont désactivés par défaut et nécessitent une composition
explicite.

### Qualification

`MissionBrief` est autoritatif pour le paquet de **préparation** d'une Mission.
Il n'est pas :

- un résultat d'exécution ;
- un état Work courant ;
- une synthèse datée après exécution ;
- une sortie du domaine Intelligence.

Il ne peut pas être la source Work Synthesis.

## 6. Candidat 2 — MissionReport

### Producteur

La fonction `mapOfficialReportToMissionReport`, dans
`server/nova-core/nova-core.execution.ts`, transforme le rapport officiel
d'exécution en `MissionReport`.

### Données produites

Le contrat `MissionReport`, défini dans
`server/runtime/orchestrator/orchestrator-runtime.types.ts`, contient :

- identités project, Mission, report, agent et run ;
- type de rapport ;
- livrables, fichiers modifiés, checks, blockers et errors ;
- confirmation de scope ;
- diagnostics et provenance technique ;
- preuves de livrables ;
- certificat éventuel.

Il ne contient aucun champ `summary`, `synthesis`, `conclusion`, `narrative` ou
équivalent métier.

### Acceptation et persistance

`OrchestratorRuntimeService.submitReport` valide le scope et la présence de
livrables, stocke le rapport, rattache `mission.reportId`, termine le run et
publie `ReportSubmitted`.

Le rapport est inclus dans `RuntimeSnapshot.reports`. La lecture
`getReport(projectId, missionId)` utilise le `reportId` rattaché à la Mission ;
la sélection est déterministe.

### Consommateurs

- `NovaCoreService` et la route GET de détail Mission ;
- validation technique, documentaire, humaine et certification ;
- `WorkDeliverablesQuery` pour le sous-ensemble déjà réconcilié ;
- cockpit legacy via `renderReport` ;
- snapshot et restauration Runtime.

### Qualification

`MissionReport` est autoritatif pour le **résultat technique accepté d'une
Mission**. Le transformer en synthèse Work exigerait au minimum de décider :

- quels champs constituent la synthèse ;
- comment produire un texte ou une conclusion métier ;
- comment consolider plusieurs familles Work ;
- quelle date représente la synthèse ;
- quelle provenance métier, distincte de la provenance d'exécution, s'applique.

Ces décisions n'existent pas. Exposer le rapport sans transformation resterait
une lecture de rapport, pas une Synthesis.

## 7. Candidats secondaires

### Résultat normalisé

`RuntimeResultNormalizer` produit `NormalizedRuntimeResult`, qui conserve un
`result: unknown`, un statut Runtime, une erreur et des métadonnées. Il normalise
un transport ; il ne synthétise pas le métier.

### Résultat d'intégration

`NovaIntegrationResult` agrège session, payload, résultat Codex, résultat
normalisé, timeline, métriques, log, evidence et décision humaine. L'agrégat
complet n'est pas persisté comme Synthesis. Seuls des records `SESSION` et `LOG`
sont écrits par cette chaîne.

### Timeline, log et métriques

- `MissionTimelineModel` ordonne des événements Mission ;
- `MissionLogModel` recopie ces événements et leur trace ;
- `MissionMetricsModel` calcule comptages, durée et progression ;
- le record `LOG` persiste le journal.

Ce sont des Read Models d'observabilité. Aucun ne produit une synthèse métier.

### Evidence et certification

`MissionEvidenceBundle` et les rapports de certification attestent des preuves
et des gates techniques. Ils ne concluent pas sur l'état métier courant du
Work.

### Kernel reporting

`KernelReportingFlowReport` est un rapport interne de readiness du kernel. Il
n'est pas exporté, n'a aucun consommateur de production trouvé et ne porte
aucune donnée Work.

## 8. Projections Frontend

Les projections suivantes affichent des résumés sans source Synthesis :

- `workOverviewFixture.ts` : insight, « NOVA synthesis draft » et résumés de
  livrables ;
- `workDeliverablesFixture.ts` : `detail.summary` ;
- `workPeopleFixture.ts` : `details.summary` ;
- `workSourcesFixture.ts` : compteurs et `detail.summary` ;
- `homeFixture.ts` : résumés Header, priorité et activité de fond ;
- `workActivityFixture.ts` : résumés d'événements simulés.

Les pages associées consomment directement ces fixtures. `WorkActivityPage`
possède aussi une projection Runtime réelle, mais son champ `summary` est
simplement `event.eventName`. Il reste explicitement un libellé d'événement
technique.

## 9. Analyse métier

### Ce que représente Synthesis dans NOVA

Selon la doctrine Work, Synthesis est un résultat métier courant, daté, sourcé,
produit par Intelligence à partir d'un état Work consolidé.

### Qui produit une synthèse

Aucun producteur conforme n'existe. `MissionBriefBuilder` produit un paquet de
préparation et le mapper d'exécution produit un rapport technique.

### Sources consommées

Aucune chaîne existante ne consomme l'état Work consolidé pour produire une
synthèse.

### Consommateurs

Il existe des consommateurs de briefs, rapports, logs et textes de fixtures.
Il n'existe aucun consommateur d'un objet Synthesis autoritatif.

### Persistance et recalcul

- `MissionBrief` : dérivé en mémoire avant exécution ;
- `MissionReport` : persisté dans le snapshot Runtime après acceptation ;
- `MissionLog` : persisté comme record `LOG` ;
- `MissionMetrics` : recalculé à partir de timeline/progression ;
- textes UX : statiques.

### Relations

| Relation | Constat |
|---|---|
| Synthesis → Mission | aucune ; seuls brief/report/log sont liés à Mission |
| Synthesis → Work | aucune clé ni association |
| Synthesis → Runtime | aucune source Synthesis ; rapports et logs seulement |
| Synthesis → Intelligence | dépendance canonique, producteur absent |

## 10. Source of Truth

**Nom exact :** aucune source `Work Synthesis` identifiée.  
**Chemin exact :** aucun.  
**Producteur autoritatif :** aucun.  
**Justification métier :** ni le brief préparatoire ni le rapport technique ne
représente la synthèse métier courante définie par Work.  
**Justification technique :** aucun modèle, producteur, record, service ou
query Synthesis n'existe ; aucun candidat ne consomme un état Work consolidé.  
**Décision de réutilisation :** conserver `MissionBrief`, `MissionReport`,
timeline, log et métriques comme sources factuelles de leurs domaines, mais ne
pas les renommer ni les fusionner en Synthesis.

## 11. Décisions KEEP / MERGE / REFACTOR / REMOVE

- **KEEP** : préparation Mission, rapport Runtime, observabilité, evidence,
  certification et leurs consommateurs actuels.
- **MERGE** : aucun ; préparation, exécution et synthèse ont des cycles de vie
  distincts.
- **REFACTOR** : projections UX uniquement lorsqu'une source Synthesis
  autoritative existera.
- **REMOVE** : données de résumé fictives uniquement après remplacement
  traçable ; aucune suppression dans cet audit.

## 12. Risques

| Risque | Niveau | Preuve |
|---|---|---|
| Renommer `MissionReport` en Synthesis | CRITICAL | aucune conclusion métier dans le contrat |
| Fusionner brief pré-exécution et report post-exécution | HIGH | producteurs et cycles de vie distincts |
| Utiliser le dernier événement comme synthèse | CRITICAL | invariant technique/métier de SW-014 |
| Promouvoir un log ou une métrique | HIGH | observabilité seulement |
| Utiliser les résumés de fixtures | CRITICAL | aucune provenance Runtime |

## 13. Conclusion

Le patrimoine contient des entrées factuelles réutilisables, mais aucune source
Work Synthesis. Le candidat persistant le plus proche, `MissionReport`, reste un
rapport d'exécution structuré et ne satisfait pas la définition canonique.

DSYN-001 ne peut donc pas être ouvert comme intégration read-only sans inventer
une sémantique de synthèse ou créer un producteur. Le verdict est **NO GO**.

