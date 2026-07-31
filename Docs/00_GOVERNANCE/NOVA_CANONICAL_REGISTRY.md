# NOVA Canonical Registry

**Statut :** CANONICAL  
**Périmètre :** gouvernance documentaire uniquement  
**Autorité de maintenance :** NOVA Program Board

## 1. Fonction

Ce registre désigne un point de référence canonique par domaine documentaire. Il ne remplace, ne fusionne, ne déprécie et ne modifie aucune source.

Une « référence canonique de domaine » est le point de résolution utilisé pour orienter une consultation ou un conflit documentaire. Les autres documents conservent intégralement leur autorité locale, leur portée, leur statut et leur valeur de preuve.

Les candidats sont identifiés sans duplication dans [NOVA_DOCUMENT_CATALOG.md](NOVA_DOCUMENT_CATALOG.md) par le filtre `Domaine + Catégorie=CANONICAL`. Les domaines sans candidat classé CANONICAL utilisent le point d'entrée existant le plus explicite ; cette désignation vaut uniquement pour la navigation documentaire.

## 2. Règle de résolution

1. Résoudre le domaine du document.
2. Consulter la référence canonique désignée ci-dessous.
3. Conserver les sources spécialisées comme autorités de leur propre périmètre.
4. Ne jamais déduire qu'un document non sélectionné est supprimable, déprécié ou remplacé.
5. En cas de contradiction métier ou technique, retourner vers l'autorité de la source ; le présent registre ne tranche pas le fond.

## 3. Registre canonique des domaines

| Domaine | Candidats CANONICAL SW-002 | Référence canonique de domaine | Pourquoi plusieurs candidats existent | Statut des autres candidats | Preuve de sélection |
|---|---:|---|---|---|---|
| FOUNDATION | 6 | [NOVA_CEREBRAU_MANIFEST.md](../00_FOUNDATION/NOVA_CEREBRAU_MANIFEST.md) | Doctrine, charte, principes, migration et backlog ont des responsabilités distinctes | Autorités locales conservées | Statut FOUNDATION et fonction de manifest/source of truth déclarée |
| GOVERNANCE | 8 | [NOVA_GOVERNANCE_MANIFEST.md](NOVA_GOVERNANCE_MANIFEST.md) | Registres, portfolio et décisions sont canoniques dans des périmètres différents | Autorités locales conservées | Statut CANONICAL ENTRY POINT et couverture récursive |
| ARCHITECTURE | 0 | [ARCHITECTURE_BASELINE.md](../21_BASELINES/NOVA_v1.0.0/ARCHITECTURE_BASELINE.md) | Les documents actifs d'architecture ne portent pas tous un statut canonique global | Références spécialisées conservées | Baseline certifiée NOVA v1.0.0 |
| PROGRAMS | 219 | [NOVA_MASTER_PLAN.md](../00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md) | Chaque Program, lot, mission et campagne possède sa propre autorité et ses preuves finales | Autorités de Program conservées | Plan directeur `OFFICIAL REFERENCE` et autorité portfolio transverse |
| MODULES_PRODUCT | 3 | [COMPONENT_CATALOG.md](../21_BASELINES/NOVA_v1.0.0/COMPONENT_CATALOG.md) | Les candidats canoniques sont contextualisés par écran, domaine ou certification frontend | Autorités de module conservées | Catalogue de composants certifié de la baseline |
| RULES | 7 | [ARCH-RULE-003_ARCHITECTURE_COMPLIANCE.md](../05_RULES/ARCH-RULE-003_ARCHITECTURE_COMPLIANCE.md) | Chaque Rule est canonique pour une contrainte distincte | Toutes les Rules restent normatives dans leur portée | Foundation Rule L0 dédiée à la conformité |
| KNOWLEDGE_REFERENCE | 0 | [KNOWLEDGE_GOVERNANCE.md](../05_RULES/KNOWLEDGE_GOVERNANCE.md) | Les index, schémas, moteurs et stockages sont des vues complémentaires | Toutes les références restent disponibles | Source `Reference` gouvernant le Knowledge System ; l'index historique n'est pas promu |
| AGENTS | 0 | [library/README.md](../07_AGENTS/library/README.md) | Deux bibliothèques d'agents coexistent sans décision de remplacement | Les deux bibliothèques restent intactes | La source se déclare « Bibliothèque officielle » |
| COLLABORATION | 0 | [NOVA-008_COLLABORATION.md](../09_COLLABORATION/NOVA-008_COLLABORATION.md) | Un seul actif de domaine existe et reste `DRAFT_VALIDABLE` | Statut WORKING conservé | Unicité du document dans le domaine |
| PLUGINS | 0 | [NOVA-011_PLUGIN_PLATFORM.md](../11_PLUGINS/NOVA-011_PLUGIN_PLATFORM.md) | Un seul actif de domaine existe et reste `DRAFT_VALIDABLE` | Statut WORKING conservé | Unicité du document dans le domaine |
| CERTIFICATION | 0 | [CERTIFICATION_MATRIX.md](../21_BASELINES/NOVA_v1.0.0/CERTIFICATION_MATRIX.md) | La certification active et les preuves de baseline couvrent des objets distincts | Preuves locales conservées | Matrice certifiée NOVA v1.0.0 |
| OPERATIONS | 3 | [NOVA_EXECUTION_MODEL.md](../15_OPERATIONS/NOVA_EXECUTION_MODEL.md) | Execution Model, Program Governance et Migration Squad couvrent trois responsabilités | Autorités locales conservées | Statut ACTIVE et plus forte centralité entrante du domaine |
| BASELINES | 3 | [NOVA_VERSION_1_0_0.md](../21_BASELINES/NOVA_v1.0.0/NOVA_VERSION_1_0_0.md) | Architecture, certification et release notes sont canoniques dans la même baseline | Baselines et preuves restent immuables | Baseline Status CERTIFIED et autorité Program Board |
| ARCHIVES | 0 | [NOVA_GOVERNANCE_MANIFEST.md](NOVA_GOVERNANCE_MANIFEST.md) | Les archives possèdent des manifestes locaux mais aucune autorité active globale | Manifestes d'archive conservés | Branche de navigation canonique vers toutes les archives |
| CEREBRAU_INCUBATION | 0 | [AGENTIC_ORCHESTRATION/README.md](../99_INCUBATION/AGENTIC_ORCHESTRATION/README.md) | Le domaine est historique et ne doit pas être promu comme architecture active | Tous les actifs restent HISTORICAL | Point d'entrée local unique de l'incubation |
| STRATEGY_ADOPTION | 1 | [15_NOVA_EXECUTION_MASTER_PLAN.md](../22_NOVA_V2_STRATEGY/15_NOVA_EXECUTION_MASTER_PLAN.md) | Stratégie, adoption et benchmark métier sont complémentaires | Autorités locales conservées | Statut `STRATÉGIE APPROUVÉE` et fonction de plan directeur |
| DOCS_ROOT | 0 | [MASTER_EXECUTION_SPECIFICATION.md](../MASTER_EXECUTION_SPECIFICATION.md) | Les documents racine couvrent exécution, template et lecture historique | Sources racine conservées | Spécification d'exécution transversale existante |

## 4. Couverture

| Mesure | Valeur |
|---|---:|
| Domaines physiques SW-002 | 17 |
| Domaines avec référence canonique désignée | 17 |
| Couverture canonique | 100 % |
| Sources supprimées, fusionnées ou déplacées | 0 |

## 5. Limite d'autorité

La sélection d'une référence canonique de domaine ne modifie pas le statut source d'un document. Lorsqu'une référence sélectionnée est WORKING, HISTORICAL ou externe au domaine physique, ce statut et cette position restent visibles dans [NOVA_DOCUMENT_STATUS.md](NOVA_DOCUMENT_STATUS.md) et [NOVA_DOCUMENT_OWNERSHIP.md](NOVA_DOCUMENT_OWNERSHIP.md).
