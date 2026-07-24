# Plan Directeur UI/UX NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Ce document transforme les références UX existantes en plan directeur d’implémentation. Il ne redessine ni les maquettes ni les spécifications fonctionnelles. Il préserve l’architecture de l’information, les responsabilités d’écran, le modèle d’état, la logique des composants et les contraintes du design system.

## Références UX Source

Références principales :

- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/L4-003_MISSION_WORKSPACE.md`
- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/L4-005_AGENT_CONTROL_CENTER.md`
- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/L4-007_RUNTIME_OBSERVATORY.md`
- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/L4-008_PROGRAM_PLANNER.md`
- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/L4-009_ORCHESTRATOR_NAVIGATION_MODEL_V1.md`
- `Docs/99_INCUBATION/AGENTIC_ORCHESTRATION/ORCH-UX-005_DESIGN_SYSTEM_ARCHITECTURE.md`
- `Docs/05_RULES/PRODUCT-RULE-004_UX_RULES.md`

## Stratégie UX

La première release UI doit implémenter NOVA Mission Ops, un cockpit d’exécution IA gouverné. L’utilisateur doit comprendre immédiatement :

- quelle mission est active ;
- dans quel état elle se trouve ;
- qui ou quel agent la possède ;
- quelle action est autorisée ensuite ;
- ce qui est bloqué ;
- quelles preuves existent ;
- quelle décision est requise.

## Catalogue d’Écrans

| Écran | Rôle | Priorité MVP |
| --- | --- | --- |
| Mission Control | Point d’entrée opérationnel au niveau portefeuille | P0 |
| Mission Workspace | Écran principal d’exécution de mission | P0 |
| Decision Center Lite | Validation humaine, rejet, révision, escalade | P0 |
| Agent Control Center Lite | Agents disponibles, en cours, en attente, bloqués | P0 |
| Runtime Observatory Lite | Événements, locks, queue, santé runtime | P0 |
| Report Detail | Revue structurée d’un rapport de mission | P0 |
| Validation Detail | Validation technique, documentaire et humaine | P0 |
| Lock Detail | Lock de scope, owner, conflit, condition de libération | P0 |
| Evidence Timeline | Événements de mission, preuves, corrélation | P0 |
| Knowledge Center Lite | Documents source et références de socle | P1 |
| Program Planner Baseline | Roadmap, jalons, capacité, décisions | P1 |
| Project Workspace | Contexte projet, missions, décisions, preuves | P1 |
| Runtime Event Detail | Inspection approfondie d’un événement/run/anomalie | P1 |
| Admin Settings | Tenancy, RBAC, providers, politique de coût | P1 |
| Plugin Diagnostics | Diagnostics et observabilité d’un plugin de référence | P1 |
| Simulation Lab | Planification de scénarios | P2 |
| Marketplace Admin | Certification et publication de plugins | P2 |
| Studio | Authoring de workflows, agents et templates | P2 |

## Implémentation du Mission Workspace

Zones issues de la référence UX :

| Zone | Exigence d’implémentation | Priorité |
| --- | --- | --- |
| Header Mission | ID mission, objectif, état, autorité, owner, priorité | P0 |
| Action Center | Une action principale suivante et les transitions valides | P0 |
| State Panel | État courant, état précédent, prochaine transition | P0 |
| Scope and Lock | Scope autorisé, scope interdit, lock actif | P0 |
| Deliverables and Reports | Livrables attendus et rapports produits | P0 |
| Validation Hub | Validation technique, documentaire, humaine | P0 |
| Risk and Escalation | Blocages, conflits, autorité requise | P0 |
| Evidence Timeline | Événements, corrélation, preuve d’audit | P0 |

Règle d’implémentation : le Mission Workspace ne doit pas devenir un dashboard générique. C’est la surface d’exécution principale pour une mission unique.

## Catalogue de Composants

| Composant | Nécessaire pour | Priorité |
| --- | --- | --- |
| Page Shell | Tous les écrans | P0 |
| Sidebar Navigation | Navigation globale | P0 |
| Breadcrumb | Conservation du contexte | P0 |
| State Badge | Visibilité de l’état mission et agent | P0 |
| Lock Badge | Sécurité du scope et de la concurrence | P0 |
| Action Toolbar | Transitions de mission approuvées | P0 |
| Primary Action Button | Prochaine action autorisée | P0 |
| Mission Table | Listes de missions et vues Board | P0 |
| Agent Status Table | Agent Control Center | P0 |
| KPI Strip | Mission Control et Observatory | P0 |
| Timeline | Preuves et événements runtime | P0 |
| Drawer Workflow | Détails de rapports, validation, lock, événements | P0 |
| Alert/Blocking Banner | Blocages et escalades actifs | P0 |
| Empty State | Aucune mission, aucune preuve, aucun agent | P0 |
| Skeleton Loading | Dimensions stables de chargement | P0 |
| Cost Indicator | Coût d’usage LLM et contrôle budgétaire | P1 |
| Dependency Map | Program Planner | P1 |
| Capacity Panel | Program Planner et Agent Control | P1 |
| Simulation Card | Comparaison de scénarios | P2 |
| Plugin Permission Matrix | Marketplace et administration | P2 |

## Navigation

Hiérarchie de navigation officielle :

| Niveau | Objet | Écran principal |
| --- | --- | --- |
| 1 | Program | Mission Control / Program Planner |
| 2 | Project | Project Workspace |
| 3 | Mission | Mission Workspace |
| 4 | Détail d’objet | Report, Validation, Lock, Agent, Decision |
| 5 | Evidence | Timeline, Event, Audit |

Règles de navigation :

- un seul contexte actif à la fois ;
- jamais perdre le contexte de mission courant ;
- maximum trois changements de vue pour atteindre un objet lié ;
- chaque décision renvoie à sa mission ou à son Program ;
- chaque événement renvoie à la mission affectée ;
- chaque écran a un chemin de retour explicite.

## Design System

L’implémentation doit utiliser le design system partagé existant :

- UI opérationnelle sobre ;
- tables denses mais lisibles ;
- surfaces neutres ;
- primaire teal `#0F5962` ;
- accents retenus ;
- badges sémantiques de statut ;
- base d’espacement 4 px ;
- radius standard 8 px ;
- faible élévation ;
- icônes linéaires ;
- dimensions stables pour le chargement et le contenu dynamique ;
- aucun statut ne doit être communiqué par la couleur seule ;
- contrôles accessibles au clavier ;
- fallback responsive pour les écrans plus petits.

Aucune refonte décorative n’est autorisée par ce plan directeur.

## Ordre d’Implémentation

| Ordre | Travail | Raison |
| --- | --- | --- |
| 1 | Tokens de design et primitives de composants | Prévenir la dérive UI |
| 2 | Page shell, navigation, breadcrumbs | Préserver le contexte |
| 3 | Contrats de données mission et badges d’état | Rendre la vérité runtime visible dans l’UI |
| 4 | Mission Workspace | Valeur vendable principale |
| 5 | Detail drawers de rapport, validation, lock, evidence | Chemin de clôture |
| 6 | Mission Control | Point d’entrée opérationnel |
| 7 | Decision Center Lite | Approbation humaine |
| 8 | Agent Control Center Lite | Confiance et supervision des agents |
| 9 | Runtime Observatory Lite | Auditabilité et diagnostic |
| 10 | Paramètres de coût/provider admin | Gouvernance IA entreprise |
| 11 | Program Planner Baseline | Extension exécutive |
| 12 | Diagnostics plugin VEEDDA | Première preuve d’intégration |
| 13 | Simulation, marketplace, Studio | Extensions ultérieures |

## Dépendances

| Travail UI | Dépendance |
| --- | --- |
| Mission Workspace | API mission, modèle d’état, modèle de lock, modèle de rapport |
| Decision Center | Approval workflow, decision workflow, états de validation |
| Agent Control Center | Registre d’agents, mapping agent-mission |
| Runtime Observatory | Flux d’événements, locks, files, santé runtime |
| Cost Indicators | LLM Gateway et Cost Ledger |
| Program Planner | Données de roadmap, jalons, ressources, dépendances |
| Plugin Diagnostics | Registre de plugins et contrats d’observabilité |

## Priorité Go-To-Market

| Priorité GTM | Capacité UI | Valeur acheteur |
| --- | --- | --- |
| Critique | Mission Workspace | Montre un vrai travail IA contrôlé |
| Critique | Decision Center Lite | Préserve la responsabilité humaine |
| Critique | Evidence Timeline | Soutient l’audit et la confiance |
| Critique | Agent Control Lite | Rend les agents gouvernables |
| Haute | Runtime Observatory Lite | Rend le runtime explicable |
| Haute | Cost Controls | Répond à l’économie IA |
| Moyenne | Program Planner | Extension vers les exécutifs |
| Moyenne | Plugin Diagnostics | Soutient la première intégration |
| Plus tard | Marketplace et Studio | Passage à l’échelle de l’écosystème |

## Décision UI/UX

NOVA v2 doit implémenter les références UX existantes comme surface produit opérationnelle, en commençant par Mission Ops. Aucune refonte n’est autorisée. La trajectoire d’implémentation privilégie les écrans nécessaires pour vendre une exécution d’agents IA contrôlée, observable et auditable.
