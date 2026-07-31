# DINTEL-000 — Intelligence Reconciliation Report

Date d'audit : 2026-07-30  
Mode : audit d'architecture, lecture seule, mode économique  
Verdict : **NO GO**

## 1. Objet

Cet audit recherche une source métier autoritative déjà existante pour une
future lecture interne `Work Intelligence`. Il ne qualifie pas comme
« Intelligence » un composant uniquement parce qu'il résout de la connaissance,
produit un diagnostic technique, évalue un gate ou affiche un texte de
recommandation.

## 2. Méthode économique

L'index initial a porté sur les racines demandées. Seule `server/` existe à la
racine du dépôt parmi `server/`, `modules/`, `packages/`, `legacy/`, `runtime/`,
`core/`, `engines/`, `shared/` et `common/`. Les recherches ont ensuite été
limitées aux candidats nommés par
`DOMAIN_RECONCILIATION_AUDIT.md` et aux fichiers contenant les concepts de la
mission. `node_modules`, `dist`, `build`, `coverage`, `.git`, snapshots et
artefacts générés ont été exclus.

Recherche exacte dans les sources non test de ces racines :

| Concept | Fichiers trouvés |
|---|---:|
| `MissionIntelligence` | 0 |
| `WorkIntelligence` | 0 |
| `Intelligence` | 0 |
| `KnowledgeBase` / `KnowledgeGraph` | 0 |
| `Learning` / `Reasoning` / `Recommendation` / `Suggestion` / `Insight` | 0 |
| `Observation` / `Finding` / `Diagnosis` / `CapabilityAnalysis` | 0 |
| `Diagnostic` | 8, tous dans la chaîne d'exécution technique |
| `Evaluation` | 3, certification/readiness/risque |
| `Assessment` | 1, récupération technique du Program Runtime |

Les fichiers de présentation Frontend ont été vérifiés séparément parce que les
audits antérieurs les identifiaient comme consommateurs potentiels. Leurs
contenus `insight`, `recommendation` et `reasoning` proviennent de fixtures.

## 3. Définition factuelle des usages trouvés

Le dépôt contient quatre usages voisins mais non interchangeables :

1. **Connaissance de préparation Mission** : index documentaires, sources
   autoritatives, dépendances, artefacts manquants et métadonnées Program.
2. **Synthèse de préparation** : `MissionContext`, `MissionBrief` et trace de
   préparation destinés à préparer une exécution.
3. **Diagnostic et évaluation techniques** : sorties de processus, erreurs,
   validations, readiness et certification.
4. **Pseudo-intelligence de présentation** : résumés, recommandations,
   confiance et raisonnements codés dans des fixtures React.

Aucun de ces usages ne constitue un état métier `Work Intelligence`.

## 4. Implémentations de connaissance

### 4.1 Sources et adaptation

- `CerebrauKnowledgeAdapter` dans
  `server/nova-core/cerebrau-knowledge-adapter.ts` transforme un index de
  métadonnées en sources, autorités et références Program.
- `NovaUxKnowledgeAdapter` dans
  `server/nova-core/nova-ux-knowledge-adapter.ts` transforme des métadonnées UX
  en domaines, routes, composants, dépendances et sources.
- `AuthorityResolver` dans `server/nova-core/authority-resolver.ts` classe ces
  sources comme autoritatives, de support ou rejetées pour un domaine
  d'autorité.

Ces composants consomment des métadonnées déjà fournies à la requête. Ils ne
produisent ni recommandation métier, ni insight, ni résultat d'analyse du Work.

### 4.2 Résolution

`ProgramKnowledgeResolver` dans
`server/nova-core/program-knowledge-resolver.ts` produit :

- Program, capability, epic, feature, lot et wave ;
- gates, prérequis et dépendances ;
- artefacts manquants ;
- identifiants de documents, services et PDS ;
- statut `RESOLVED`, `PARTIAL` ou `UNRESOLVED`.

Ce résultat est autoritatif pour la **résolution de métadonnées Program**,
pas pour Intelligence. Le champ `capability` est une métadonnée résolue, pas
une Capability métier.

`UxKnowledgeResolver` produit de façon analogue une résolution des écrans,
pages, routes, layouts, composants, tokens et sources UX.

### 4.3 Construction et consommation

La chaîne constatée est :

```text
CEREBRAU/NOVA UX metadata
→ Knowledge adapters
→ AuthorityResolver
→ ProgramKnowledgeResolver / UxKnowledgeResolver
→ MissionContextBuilder
→ MissionBriefBuilder
→ MissionPipeline
→ NovaOrchestrationBridge
→ PromptAssembler / RuntimeExecutionRequestBuilder / RuntimeExecutionGate
```

Les sorties sont des objets immuables en mémoire. Aucun repository, `append`,
`save`, base, cache persistant ou écriture de fichier n'est utilisé dans ces
composants. Les composants à feature flag ont `enabled: false` par défaut et
aucun branchement de production autonome n'a été trouvé en dehors d'une
composition explicite.

## 5. Diagnostics, évaluations et preuves

### 5.1 Diagnostics Runtime

`RuntimeDiagnostic`, défini dans
`server/runtime/orchestrator/orchestrator-runtime.types.ts`, expose notamment
phase, message, codes de sortie, stdout, stderr, commande, arguments, cwd,
runId et correlationId.

`NovaCoreExecutionEngine` dans `server/nova-core/nova-core.execution.ts`
produit ces diagnostics lors de l'exécution Codex. Ils sont projetés dans
`MissionReport.diagnostics`, puis persistés et publiés par
`OrchestratorRuntimeService.submitReport`.

Cette source est autoritative pour le **diagnostic technique d'une exécution**.
Elle ne contient aucun insight métier et n'est pas reliée à un Work autrement
que par la relation technique Work → Mission déjà établie.

### 5.2 Readiness, risque et certification

- `ProductionReadinessEvaluator` calcule un verdict d'intégration à partir de
  gates et d'anomalies techniques.
- `MissionEvidenceCertifier` construit et persiste des preuves et une décision
  technique de certification.
- `RiskEngine` et `KpiEngine` vérifient la présence de composants documentaires
  et leur readiness.
- `ProgramRuntimeOrchestrator.assessRecovery` évalue une possibilité de
  récupération technique.

Ces évaluations sont autoritatives dans leurs domaines respectifs. Les
promouvoir en Work Intelligence changerait leur sémantique et créerait une
source impropre.

## 6. Projections et Read Models

### Projections existantes

- `NovaOrchestrationPreparation` et `NovaOrchestrationPipelineTrace` :
  projection de préparation Mission ;
- `MissionReport.diagnostics` : projection de diagnostic d'exécution ;
- payloads `RuntimeEvent` et événements d'observabilité : projection technique ;
- `WorkOverviewPage`, `WorkSourcesPage`, `WorkPeoplePage`,
  `WorkDecisionsPage`, `PriorityInsight` et `BackgroundWorkSection` :
  projections UX.

### Read Models existants

- `CerebrauKnowledgeResult` ;
- `NovaUxKnowledgeResult` ;
- `AuthorityResolutionDecision` ;
- `ProgramKnowledgeResolution` ;
- `UxKnowledgeResolution` ;
- `MissionContext` ;
- `MissionBrief`.

Aucun `WorkIntelligence`, `MissionIntelligence`, `IntelligenceReadModel`,
`InsightReadModel` ou requête interne équivalente n'a été trouvé.

## 7. Données Frontend non autoritatives

Les données suivantes sont définies localement et importées directement par les
pages :

- `workOverviewFixture.ts` : `insight.summary`,
  `insight.recommendation`, `nextAction`, confiance et `novaUpdate` ;
- `workSourcesFixture.ts` : `insight` et estimations de confiance ;
- `workPeopleFixture.ts` : `reasoning`, `whyItMatters`, trust score et skills ;
- `workDecisionsFixture.ts` : recommandation et impacts simulés ;
- `homeFixture.ts` : `priorityInsight`, suggestions et activité en arrière-plan.

Elles ne sont reliées à aucun producteur Runtime. Elles ne peuvent donc pas être
désignées source de vérité.

## 8. Analyse métier

### Informations produites

- La chaîne Knowledge produit des faits de gouvernance et de préparation.
- La chaîne Runtime produit des diagnostics techniques et preuves d'exécution.
- Les évaluateurs produisent des verdicts techniques déterministes.
- Le Frontend affiche des textes simulés d'insight et de recommandation.

### Producteurs

Il existe des producteurs de connaissance, de diagnostic, de preuve et de
readiness. Il n'existe aucun producteur de résultat Work Intelligence.

### Consommateurs

Les consommateurs réels sont la préparation de Mission, l'assemblage de prompt,
les gates d'exécution, l'orchestrateur Runtime, la certification et les pages
React alimentées par fixtures.

### Persistance, calcul et dérivation

- Persisté : `MissionReport.diagnostics` et les preuves de certification.
- Calculé : statuts de résolution, readiness, risque et certification.
- Dérivé en mémoire : `MissionContext`, `MissionBrief`, préparation et trace.
- Statique : insights, recommandations et raisonnements Frontend.

### Relations

| Relation | Constat |
|---|---|
| Intelligence → Mission | aucune Intelligence ; connaissance et diagnostic sont liés à Mission |
| Intelligence → Work | aucune relation ni clé |
| Intelligence → RuntimeAgent | aucune ; seul `MissionReport.agentId` qualifie techniquement l'exécution |
| Producteur Intelligence → persistance | absent |
| Producteur Intelligence → consommateur Work | absent |

## 9. Source of Truth

**Nom exact :** aucune source `Work Intelligence` identifiée.  
**Chemin exact :** aucun.  
**Producteur autoritatif :** aucun.  
**Justification métier :** les composants trouvés décrivent des sources,
préparent une Mission, diagnostiquent une exécution ou évaluent un gate ; ils ne
produisent pas un résultat d'intelligence métier rattaché au Work.  
**Justification technique :** aucun type, service, workflow, repository,
persistance, clé Work ou requête Intelligence n'existe.  
**Décision de réutilisation :** conserver les composants existants dans leurs
frontières ; ne pas les fusionner et ne pas les renommer en Intelligence.

## 10. Décisions KEEP / MERGE / REFACTOR / REMOVE

- **KEEP** : chaîne Knowledge, préparation Mission, diagnostics, evidence,
  readiness, risque et KPI dans leurs domaines actuels.
- **MERGE** : aucun. Fusionner ces domaines produirait une ambiguïté de source.
- **REFACTOR** : projections React uniquement lorsqu'une future source
  autoritative existera ; aucune modification dans DINTEL-000.
- **REMOVE** : données fictives d'intelligence uniquement après remplacement
  traçable ; aucun retrait dans cet audit.

## 11. Risques

| Risque | Niveau | Preuve |
|---|---|---|
| Promouvoir `ProgramKnowledgeResolution` en Intelligence | HIGH | il ne contient que métadonnées et gaps de préparation |
| Promouvoir `RuntimeDiagnostic` en insight métier | HIGH | schéma limité aux informations d'exécution |
| Utiliser les fixtures comme source | CRITICAL | aucune provenance Runtime |
| Fusionner readiness, certification et Intelligence | HIGH | finalités et producteurs distincts |
| Créer DINTEL-001 comme simple adapter | CRITICAL | aucune source Work Intelligence à adapter |

## 12. Conclusion

L'hypothèse de réutilisation directe n'est pas démontrée. Le patrimoine
Knowledge est réutilisable comme **entrée factuelle** d'une éventuelle capacité
future ; les diagnostics et évaluations sont réutilisables dans leurs propres
domaines. Aucun d'eux n'est une source Work Intelligence.

DINTEL-001 ne peut donc pas être une intégration read-only sans création d'une
nouvelle source de vérité ou changement de sémantique. Le lot reste bloqué
jusqu'à l'existence d'un producteur métier autoritatif explicitement rattaché à
Work.

