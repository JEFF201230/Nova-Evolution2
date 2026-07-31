# NOVA Governance Manifest

**Statut documentaire :** CANONICAL ENTRY POINT  
**Périmètre :** NOVA Core MVP  
**Mode :** fédération et navigation uniquement

## 1. Fonction

Ce manifeste est le point d'entrée documentaire de la gouvernance NOVA. Il ne remplace, ne déplace et ne reproduit aucune doctrine, règle, décision, spécification, preuve ou baseline. L'autorité et le statut restent portés par chaque source liée.

La couverture d'un répertoire indiquée ci-dessous est récursive : elle inclut tous ses fichiers et sous-répertoires. Les fichiers sans index local restent donc accessibles par leur domaine, sans création d'un catalogue parallèle.

## 2. Hiérarchie documentaire existante

| Priorité de consultation | Patrimoine | Point d'entrée |
|---|---|---|
| 1 | Fondation, doctrine et plan directeur | [Manifest CEREBRAU](../00_FOUNDATION/NOVA_CEREBRAU_MANIFEST.md), [Kernel Doctrine](../00_FOUNDATION/NOVA_KERNEL_DOCTRINE.md), [Product Charter](../00_FOUNDATION/NOVA_PRODUCT_CHARTER.md), [Guiding Principles](../00_FOUNDATION/NOVA_GUIDING_PRINCIPLES.md), [NOVA Master Plan](../00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md) |
| 2 | Règles explicites et registres approuvés | [Rules](../05_RULES/), [Decision Register](../02_PROJECT_MANAGEMENT/DECISION_REGISTER.md), [Program Register](../02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md), [Lot Register](../02_PROJECT_MANAGEMENT/LOT_REGISTER.md), [Epic Register](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md) |
| 3 | Programs, lots, missions et actifs d'exécution | [Programs](../19_PROGRAMS/), [BFF Programs](../00_PROGRAMS/), [Mission Orders](../16_MISSION_ORDERS/), [Operations](../15_OPERATIONS/) |
| 4 | Références, connaissances et actifs réutilisables | [Reference](../06_REFERENCE/), [Agents](../07_AGENTS/), [Plugins](../11_PLUGINS/), [Project Knowledge Library](../00_PROJECT_KNOWLEDGE_LIBRARY/) |
| 5 | Preuves, rapports, certification et décisions GO/NO-GO | [Execution Reports](../17_EXECUTION_REPORTS/), [Certification](../12_CERTIFICATION/), [Program Evidence](../PROGRAM/NOVA_PROGRAM_PRODUCTION_EVIDENCE_INDEX.md), [rapports Runtime à la racine](../../) |
| 6 | Baselines, archives, incubation et historique | [Baselines](../21_BASELINES/), [Program Archives](../18_PROGRAM_ARCHIVES/), [Workstream Archives](../20_WORKSTREAM_ARCHIVES/), [Incubation](../99_INCUBATION/) |

Cette hiérarchie est une route de lecture. Elle ne change le statut d'aucune source et ne crée aucune règle métier ou technique.

## 3. Cartographie exhaustive

| Domaine documentaire | Couverture récursive | Entrée principale existante | Propriété ou autorité explicitement observable |
|---|---|---|---|
| Fondation et plan directeur | [00_FOUNDATION](../00_FOUNDATION/), [00_NOVA_FOUNDATION](../00_NOVA_FOUNDATION/) | [NOVA_CEREBRAU_MANIFEST](../00_FOUNDATION/NOVA_CEREBRAU_MANIFEST.md), [NOVA_MASTER_PLAN](../00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md) | Statut porté par chaque source FOUNDATION ; aucun propriétaire transversal distinct n'est déclaré |
| Gouvernance et orchestration | [00_GOVERNANCE](./) | [Program Orchestrator Reference Architecture](PROGRAM_ORCHESTRATOR_REFERENCE_ARCHITECTURE.md) | NOVA Program Board, déclaré dans la source |
| Registres et pilotage projet | [02_PROJECT_MANAGEMENT](../02_PROJECT_MANAGEMENT/) | [Decision Register](../02_PROJECT_MANAGEMENT/DECISION_REGISTER.md), [Program Register](../02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md), [Lot Register](../02_PROJECT_MANAGEMENT/LOT_REGISTER.md), [Epic Register](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md) | Autorité de chaque entrée ; Program Board pour le pilotage selon le Master Plan |
| Architecture, domaine et workflows | [01_CORE](../01_CORE/), [02_PRODUCT_ARCHITECTURE](../02_PRODUCT_ARCHITECTURE/), [03_DOMAIN_MODEL](../03_DOMAIN_MODEL/), [04_WORKFLOWS](../04_WORKFLOWS/) | Sources du domaine ; aucun index transversal existant | Propriété non consolidée dans un registre unique |
| Règles et références | [05_RULES](../05_RULES/), [06_REFERENCE](../06_REFERENCE/) | [Rules](../05_RULES/), [Knowledge Index](../06_REFERENCE/KNOWLEDGE_INDEX.md) | Autorité portée par chaque règle ou référence |
| Programs, BFF et portfolio | [00_PROGRAMS](../00_PROGRAMS/), [19_PROGRAMS](../19_PROGRAMS/), [20_NOVA_PORTFOLIO](../20_NOVA_PORTFOLIO/), [PROGRAM](../PROGRAM/) | [Portfolio Index](../20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md), index locaux des Programs, [Program Evidence Index](../PROGRAM/NOVA_PROGRAM_PRODUCTION_EVIDENCE_INDEX.md) | Program Board et autorité propre à chaque Program |
| Bibliothèque de connaissance projet | [00_PROJECT_KNOWLEDGE_LIBRARY](../00_PROJECT_KNOWLEDGE_LIBRARY/) | [Doctrine proposée](../00_PROJECT_KNOWLEDGE_LIBRARY/PROJECT_KNOWLEDGE_LIBRARY_DOCTRINE.md), registres locaux | Statut `PROPOSITION_CANONIQUE` dans la source ; aucune promotion d'autorité par ce manifeste |
| Agents, collaboration et plugins | [07_AGENTS](../07_AGENTS/), [09_COLLABORATION](../09_COLLABORATION/), [11_PLUGINS](../11_PLUGINS/) | [Agent Platform](../07_AGENTS/NOVA-007_AGENT_PLATFORM/README.md), [Agent Library](../07_AGENTS/library/README.md), [Plugin Platform](../11_PLUGINS/NOVA-011_PLUGIN_PLATFORM.md) | Propriété non consolidée dans un registre unique |
| Produit, UX et Modules | [10_NOVA](../10_NOVA/), [24_MODULES](../24_MODULES/) | Sources du domaine et [Navigation Map](../24_MODULES/0-UI-DESIGN/ARCHITECTURE/NOVA_NAVIGATION_MAP.md) | Propriété portée par les sources de module |
| Exécution, mission et certification | [12_CERTIFICATION](../12_CERTIFICATION/), [15_OPERATIONS](../15_OPERATIONS/), [16_MISSION_ORDERS](../16_MISSION_ORDERS/), [17_EXECUTION_REPORTS](../17_EXECUTION_REPORTS/) | [System Engine MVP Certification](../12_CERTIFICATION/SYSTEM_ENGINE_MVP_CERTIFICATION.md), [Mission Order Template](../16_MISSION_ORDERS/MISSION_ORDER_TEMPLATE.md), [Execution Report Template](../17_EXECUTION_REPORTS/EXECUTION_REPORT_TEMPLATE.md) | Delivery Squads et certification selon le Master Plan |
| Baselines immuables | [21_BASELINES](../21_BASELINES/) | Manifestes de baseline locaux | Autorité portée par chaque manifeste de baseline |
| Archives et incubation | [18_PROGRAM_ARCHIVES](../18_PROGRAM_ARCHIVES/), [20_WORKSTREAM_ARCHIVES](../20_WORKSTREAM_ARCHIVES/), [99_INCUBATION](../99_INCUBATION/) | Index et manifestes d'archive locaux ; README d'incubation | Patrimoine historique ou non canonique selon son emplacement et son statut |
| Stratégie, adoption et plan métier | [22_NOVA_V2_STRATEGY](../22_NOVA_V2_STRATEGY/), [23_LEVEL3_INSTITUTIONAL_ADOPTION](../23_LEVEL3_INSTITUTIONAL_ADOPTION/), [25_VEEDDA_BUSINESS_PLAN](../25_VEEDDA_BUSINESS_PLAN/) | Sources du domaine | Autorité portée par chaque source ; aucun propriétaire transversal déclaré |
| Documents directement sous `Docs` | [README](../README.md), [Master Execution Specification](../MASTER_EXECUTION_SPECIFICATION.md), [Lot Template](../LOT_TEMPLATE.md) | Les trois sources liées | Autorité portée par chaque source |
| Rapports et spécifications Runtime à la racine | [Racine du dépôt](../../) | Fichiers `RUNTIME_*`, `MISSION_*`, `PROGRAM_*` et décisions associées | Autorité portée par chaque fichier et sa décision associée |
| Runtime, applications et outils | [server](../../server/), [apps](../../apps/), [tools](../../tools/) | [Runtime README](../../server/nova-core/README.md), [Runtime tools README](../../tools/nova-core-runtime/README.md) | Hors autorité documentaire de ce manifeste ; compatibilité seulement |

## 4. Graphe de navigation

```text
NOVA_GOVERNANCE_MANIFEST
├── Fondation et Master Plan
├── Règles et registres
├── Programs, portfolio et missions
├── Architecture, Runtime, Modules, Agents et Plugins
├── Preuves et certification
└── Baselines, archives et incubation
```

Les branches pointent vers le patrimoine existant. Elles n'en créent ni copie ni variante.

## 5. Maintenance

- Mettre à jour l'information dans sa source d'autorité.
- Le présent manifeste ne change que lorsqu'un point d'entrée ou un domaine est ajouté, déplacé ou retiré par son processus d'autorité propre.
- Une baseline, une archive, une preuve ou un rapport reste conservé à son emplacement ; sa duplication éventuelle n'est pas fusionnée sans validation explicite de ses références et de sa traçabilité.
- Les lacunes de propriété sont signalées comme telles et ne sont pas comblées par hypothèse.
