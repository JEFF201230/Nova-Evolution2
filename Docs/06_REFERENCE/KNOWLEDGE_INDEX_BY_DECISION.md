# KNOWLEDGE_INDEX_BY_DECISION

Version : 1.0
Statut : ACTIVE
Date de generation : 2026-06-29
Source principale : `Docs/09_CEREBRAU OPERATING SYSTEM/02_PROJECT_MANAGEMENT/DECISION_REGISTER.md`

---

## Objet

Index secondaire par decision.

Cet index permet de retrouver les decisions documentees et les entrees Knowledge directement impactees.

---

## Index

| Identifiant | Decision | Titre | Type | Statut | Autorite | Chemin | Impact | Mots-cles |
|---|---|---|---|---|---|---|---|---|
| DECISION-200 | DECISION-200 | Context Engine comme couche d'orchestration de contexte pour le chantier Context Engine / Knowledge | DECISION | ACTIVE | CEREBRAU Runtime Agent | [COS-200.md](../02_PROJECT_MANAGEMENT/COS-200.md), [KNOWLEDGE_INDEX.md](KNOWLEDGE_INDEX.md), [CEREBRAU_CONTEXT_ENGINE_MVP_V1.md](CEREBRAU_CONTEXT_ENGINE_MVP_V1.md), [context.service.ts](../../../server/cerebrau-context/context.service.ts) | Providers officiels, registres CEREBRAU, Knowledge Index, reconstruction automatique du contexte projet VEEDDA | Context Engine, Knowledge Index, providers, CEREBRAU Runtime |
| DECISION-201 | DECISION-201 | Qualification des anomalies revelees par Build V2 | DECISION | APPROVED | CEREBRAU Runtime Agent | [BUILD_ARCHITECTURE.md](../01_CORE/BUILD_ARCHITECTURE.md), [BUILD_MIGRATION_PLAN.md](../01_CORE/BUILD_MIGRATION_PLAN.md), [EPIC_REGISTER.md](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md) | Les erreurs detectees lors de l'execution des builds specialises sont rattachees a leur module fonctionnel d'origine sans remettre en cause l'architecture Build V2. | Build V2, anomalies, Legacy, Robot, Vigile, EPIC |
| DECISION-202 | DECISION-202 | Qualification des anomalies revelees par Build V2 | DECISION | APPROVED | CEREBRAU Runtime Agent | [BUILD_ARCHITECTURE.md](../01_CORE/BUILD_ARCHITECTURE.md), [BUILD_MIGRATION_PLAN.md](../01_CORE/BUILD_MIGRATION_PLAN.md), [EPIC_REGISTER.md](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md) | Les anomalies detectees lors de l'execution des builds specialises sont rattachees a leur module fonctionnel d'origine ; les corrections sont pilotees par EPIC-201, EPIC-202 et EPIC-203. | Build V2, anomalies, EPIC-201, EPIC-202, EPIC-203 |

## Entrees Knowledge rattachees

| Identifiant | Decision | Nom | Type | Statut | Chemin | Domaine | Mots-cles |
|---|---|---|---|---|---|---|---|
| KNOWLEDGE-INDEX-V2 | DECISION-200 | Knowledge Index V2 | INDEX | ACTIVE | [KNOWLEDGE_INDEX_V2.md](../../KNOWLEDGE/KNOWLEDGE_INDEX_V2.md) | Knowledge | Knowledge Index, index global, documentation |
| KNOWLEDGE-AUDIT | DECISION-200 | Knowledge Audit | AUDIT | ACTIVE | [KNOWLEDGE_AUDIT.md](../../KNOWLEDGE/KNOWLEDGE_AUDIT.md) | Knowledge | audit, couverture, registres |
| KNOWLEDGE-FUNCTIONAL-REGISTER | DECISION-200 | Functional Register | REGISTER | ACTIVE | [FUNCTIONAL_REGISTER.md](../../KNOWLEDGE/FUNCTIONAL_REGISTER.md) | Functional | fonctionnel, domaines, modules |
| KNOWLEDGE-DATABASE-REGISTER | DECISION-200 | Database Register | REGISTER | ACTIVE | [DATABASE_REGISTER.md](../../KNOWLEDGE/DATABASE_REGISTER.md) | Database | database, SQL, Supabase |
| KNOWLEDGE-API-REGISTER | DECISION-200 | API Register | REGISTER | ACTIVE | [API_REGISTER.md](../../KNOWLEDGE/API_REGISTER.md) | API | API, routes, backend |
