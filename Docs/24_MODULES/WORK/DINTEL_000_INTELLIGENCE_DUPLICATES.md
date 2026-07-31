# DINTEL-000 — Intelligence Duplicates

Verdict : **NO GO**

## 1. Règle de qualification

Un homonyme n'est pas automatiquement un doublon. Les composants Knowledge,
diagnostic, evidence et readiness sont conservés séparément lorsqu'ils ont des
entrées, des responsabilités et des consommateurs différents.

Un doublon est retenu lorsqu'une même information de présentation est répétée
sans provenance autoritative ou lorsqu'une vue locale prétend représenter le
même fait métier qu'une autre fixture.

## 2. Doublons démontrés

### DUP-INT-001 — Priority Insight Home / Work Overview

| Élément | Preuve |
|---|---|
| Origine A | `apps/nova-web/src/features/home/homeFixture.ts` |
| Origine B | `apps/nova-web/src/features/work/workOverviewFixture.ts` |
| Responsabilité déclarée | situation prioritaire et recommandation |
| Recouvrement | même blocage par commentaires/source CRM et même progression de confiance 76 % → 92 % |
| Source | constantes locales |
| Risque | deux copies peuvent diverger sans événement métier |
| Décision | REMOVE des données fictives après disponibilité d'une source ; garder les composants visuels |

### DUP-INT-002 — Pending Decision Home / Work Decisions / Work Overview

| Élément | Preuve |
|---|---|
| Origine A | `homeFixture.pendingDecision` |
| Origine B | `workDecisionsFixtures['work-001']` |
| Origine C | `workOverviewFixtures['work-001'].pendingDecision` |
| Responsabilité déclarée | décision en attente et confiance |
| Recouvrement | décision `decision-001`, budget Q3, confiance 82 % |
| Source | constantes locales |
| Risque | concurrence avec la source Human Approval déjà réconciliée par DDEC-001 |
| Décision | ne pas fusionner avec Intelligence ; remplacer chaque projection par sa source canonique de décision |

### DUP-INT-003 — Deliverables Overview / Deliverables Fixture

| Élément | Preuve |
|---|---|
| Origine A | `workOverviewFixture.ts` |
| Origine B | `workDeliverablesFixture.ts` |
| Responsabilité déclarée | livrables et confiance |
| Source | constantes locales |
| Risque | concurrence avec `MissionReport.deliverableEvidence` déjà réconcilié par DINT-001 |
| Décision | ne pas promouvoir en Intelligence ; retirer les copies après raccordement Deliverables |

### DUP-INT-004 — Confidence transversale des fixtures

| Élément | Preuve |
|---|---|
| Origines | Overview, Sources, Decisions, Deliverables, Activity et Home |
| Responsabilité déclarée | niveau de confiance et variation attendue |
| Source | constantes locales et textes narratifs |
| Différence | aucun modèle commun ni producteur Runtime |
| Risque | apparence d'un score métier autoritatif sans source |
| Décision | aucune fusion ; conserver hors source jusqu'à existence d'un producteur qualifié |

### DUP-INT-005 — Reasoning / insight narratifs

| Élément | Preuve |
|---|---|
| Origines | `workPeopleFixture.ts`, `workSourcesFixture.ts`, `workOverviewFixture.ts`, `homeFixture.ts` |
| Responsabilité déclarée | expliquer, recommander ou suggérer |
| Source | textes hardcodés |
| Différence | textes spécifiques à chaque écran |
| Risque | décisions implicites, absence de provenance et incohérence temporelle |
| Décision | ne pas fusionner ; retirer localement lors de futurs raccordements autoritatifs |

## 3. Faux doublons explicitement rejetés

### Knowledge vs Intelligence

`ProgramKnowledgeResolver` ne duplique pas Work Intelligence. Il résout des
métadonnées Program, des dépendances, des sources et des gaps. Décision : KEEP.

### Mission Brief vs Intelligence

`MissionBrief` assemble un paquet de préparation pour une exécution. Il ne
constitue ni un insight ni une recommandation métier. Décision : KEEP.

### Runtime Diagnostic vs Intelligence

`RuntimeDiagnostic` décrit une phase, une commande, un cwd, des sorties et des
codes d'erreur. Le convertir en finding métier serait une transformation
nouvelle. Décision : KEEP dans Observability.

### Readiness / Risk / KPI vs Intelligence

Ces composants évaluent des gates techniques ou documentaires. Leurs verdicts
ne sont pas des conclusions Work. Décision : KEEP sans fusion.

### Evidence / Certification vs Intelligence

La certification atteste des preuves et produit une décision technique. Elle ne
produit pas d'analyse métier du Work. Décision : KEEP sans fusion.

## 4. Décision globale sur les doublons

| Action | Nombre | Périmètre |
|---|---:|---|
| KEEP | composants de domaine | Knowledge, préparation, diagnostic, evidence, readiness |
| MERGE | 0 | aucune fusion sûre démontrée |
| REFACTOR | 6 projections | uniquement après existence d'une source |
| REMOVE | 5 sources de fixture | uniquement après remplacement traçable |

Le doublon principal n'est pas une concurrence entre deux moteurs Intelligence.
Il s'agit de répétitions UX non autoritatives. Il n'existe donc aucun moteur à
fusionner et aucune source existante à sélectionner entre plusieurs candidats.

