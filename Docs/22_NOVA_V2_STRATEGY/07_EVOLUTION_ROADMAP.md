# Feuille de Route d’Évolution NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Principe de Feuille de Route

La roadmap privilégie la vitesse de première release commerciale tout en préservant la vision long terme du Cognitive Operating System. Les futurs Programs doivent être approuvés par le Program Board avant activation. Tous les Programs ci-dessous sont des recommandations planifiées, pas une autorité d’exécution automatique.

## Portefeuille de Futurs Programs

| Program | Nom | Objectif | Priorité | Durée |
| --- | --- | --- | --- | --- |
| PROGRAM-015 | V2 Productization Governance | Établir l’autorité de productisation commerciale, le scope, la politique de release et la protection du socle | P0 | 2-3 semaines |
| PROGRAM-016 | Platform API, Persistence, Identity | API publique, stockage, tenancy, RBAC, audit, fondation admin | P0 | 6-8 semaines |
| PROGRAM-017 | LLM Gateway and AI Cost Governance | Passerelle modèle multi-fournisseurs, routage, registre de coûts, registre de prompts | P0 | 4-6 semaines |
| PROGRAM-018 | Mission Ops UI | Implémentation de Mission Control et Mission Workspace à partir des références UX existantes | P0 | 8-10 semaines |
| PROGRAM-019 | Decision and Evidence Center | Validation humaine, escalade, export de preuves, reporting de certification | P0 | 5-7 semaines |
| PROGRAM-020 | Agent Supervision and Runtime Observatory | Registre d’agents, Agent Control Center lite, observabilité des événements/locks/files | P0 | 6-8 semaines |
| PROGRAM-021 | VEEDDA Reference Integration | Pack d’intégration `veedda.core` et pilote design partner | P0 | 6-8 semaines |
| PROGRAM-022 | Pilote client et préparation commerciale | Onboarding, données démo, support, package légal/sécurité, premiers pilotes payants | P0 | 4-8 semaines |
| PROGRAM-023 | Enterprise Security and Deployment | SSO, durcissement RBAC, packaging private cloud/on-prem, conformité | P1 | 8-12 semaines |
| PROGRAM-024 | Memory Engine | Mémoire de contexte gouvernée, rétention, scope, fraîcheur, réutilisation | P1 | 8-10 semaines |
| PROGRAM-025 | Knowledge Graph and Impact Analysis | Graphe des Programs, missions, décisions, preuves, risques et dépendances | P1 | 8-12 semaines |
| PROGRAM-026 | Cognitive Planner, Reasoning, Consensus | Planification structurée, raisonnement, recommandations de consensus multi-rôle | P1 | 10-14 semaines |
| PROGRAM-027 | Parallel Program Orchestration | Plusieurs Program Delivery Squads avec locks, ressources, conflits, synchronisation | P1 | 8-12 semaines |
| PROGRAM-028 | Developer Platform and SDK | API stable, SDK, CLI, docs d’intégration, sandbox | P2 | 8-12 semaines |
| PROGRAM-029 | Plugin Certification and Marketplace | Registre de plugins, certification, distribution partenaire, partage de revenu | P2 | 10-14 semaines |
| PROGRAM-030 | NOVA Studio | Environnement d’authoring pour workflows, agents, templates et Programs | P2 | 12-16 semaines |
| PROGRAM-031 | Sector Product Packs | Extension VEEDDA, option LifeHub, packs sectoriels entreprise | P2 | 12-20 semaines |
| PROGRAM-032 | Self-Evolution Executive AI | Propositions d’amélioration automatiques et évolution bornée à faible risque | P3 | 16-24 semaines |
| PROGRAM-035 | Multi-Expert Review and Consensus Engine | Orchestrer plusieurs experts IA spécialisés, confronter leurs analyses, détecter les contradictions, consolider les preuves et produire une recommandation traçable sous validation humaine | P1 | Prototype UX : 5-10 jours ; MVP NOVA : 2-4 semaines ; V1 transverse : 6-10 semaines ; capability industrielle : 4-8 mois |

## Matrice de Priorisation

Les scores utilisent High, Medium, Low. Le coût et le revenu sont directionnels.

| Program | Valeur business | Valeur technique | Valeur entreprise | TTM | ROI | Complexité | Risque | Dépendances | Priorité commerciale | Priorité stratégique | Coût d’implémentation | Impact revenu attendu | Confiance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- |
| PROGRAM-015 | High | High | High | High | High | Low | Low | v1.0.0 | Critical | Critical | USD 100K-200K | Débloque tout le revenu | High |
| PROGRAM-016 | High | High | High | Medium | High | Medium | Medium | 014 | Critical | Critical | USD 500K-900K | Enablement ARR de 1M-5M | High |
| PROGRAM-017 | High | High | High | High | High | Medium | Medium | 014 | Critical | Critical | USD 300K-600K | Offre IA à coût maîtrisé | High |
| PROGRAM-018 | High | Medium | High | High | High | Medium | Medium | 015 | Critical | High | USD 600K-1.0M | Premier produit vendable | High |
| PROGRAM-019 | High | Medium | High | High | High | Medium | Low | 015,017 | Critical | High | USD 350K-650K | Confiance entreprise et pilotes | High |
| PROGRAM-020 | High | High | High | Medium | High | Medium | Medium | 015,017 | Critical | High | USD 450K-800K | Différenciation Mission Ops | Medium-High |
| PROGRAM-021 | High | Medium | Medium | Medium | High | Medium | Medium | 015-019 | Critical | High | USD 400K-900K | Première preuve verticale | Medium-High |
| PROGRAM-022 | High | Low | High | High | High | Low | Medium | 015-020 | Critical | Medium | USD 250K-600K | Pilotes payants | High |
| PROGRAM-023 | High | High | High | Medium | Medium | High | Medium | 015-021 | High | High | USD 800K-1.5M | Extension entreprise | Medium |
| PROGRAM-024 | Medium | High | High | Medium | Medium | Medium | Medium | 015,016 | Medium | High | USD 600K-1.0M | Rétention et profondeur | Medium |
| PROGRAM-025 | Medium | High | High | Medium | Medium | Medium | Medium | 024 | Medium | High | USD 700K-1.3M | Upsell et différenciation | Medium |
| PROGRAM-026 | High | High | High | Medium | Medium | High | High | 024,025 | Medium | Critical | USD 900K-1.8M | Différenciation V2 | Medium |
| PROGRAM-027 | High | High | High | Medium | High | High | High | 020,023 | High | Critical | USD 800K-1.5M | Passage à l’échelle entreprise | Medium |
| PROGRAM-028 | Medium | High | Medium | Medium | Medium | Medium | Medium | 016,023 | Medium | High | USD 600K-1.2M | Revenu intégrateur | Medium |
| PROGRAM-029 | Medium | Medium | Medium | Low | Medium | High | High | 028 | Low-Medium | Medium | USD 900K-1.6M | Revenu marketplace plus tard | Low-Medium |
| PROGRAM-030 | Medium | High | Medium | Low | Medium | High | Medium | 024-029 | Low-Medium | High | USD 1.0M-2.0M | Expansion ARR | Low-Medium |
| PROGRAM-031 | High | Medium | High | Medium | Medium | High | Medium | 021,023,028 | Medium | High | USD 1.2M-2.5M | Croissance ARR sectorielle | Medium |
| PROGRAM-032 | Medium | High | High | Low | Medium | High | High | 024-027 | Low | Critical | USD 1.5M-3.0M | Moat de long terme | Low-Medium |

## Mapping Releases

| Release | Programs |
| --- | --- |
| v1.0.1 | PROGRAM-015 |
| v1.1 | PROGRAM-016 à PROGRAM-022 |
| v2.0 | PROGRAM-023 à PROGRAM-027 |
| v2.1 | PROGRAM-028 à PROGRAM-031 |
| v3.0 | PROGRAM-032 et extensions avancées de marketplace/self-evolution |

## Opportunités d’Exécution Parallèle

L’exécution parallèle nécessite une approbation du Program Board pour modifier la contrainte actuelle d’un seul Program actif.

Sets parallèles recommandés :

| Set parallèle | Programs | Conditions |
| --- | --- | --- |
| Set A | PROGRAM-016 et PROGRAM-017 | Workstreams disjoints API/platform et passerelle LLM |
| Set B | PROGRAM-019 et PROGRAM-020 | Contrats mission partagés déjà stabilisés |
| Set C | PROGRAM-021 et préparation de PROGRAM-022 | Séparation entre intégration et readiness commerciale |
| Set D | PROGRAM-024 et PROGRAM-025 discovery | Aucune dépendance de production avant stabilisation des contrats de mémoire |
| Set E | PROGRAM-028 et découverte des packs sectoriels | Implémentation SDK séparée de la découverte client |

Exécution parallèle interdite :

- deux Programs modifiant le même contrat public sans autorité contractuelle ;
- workflows de mutation UI avant certification API ;
- marketplace avant sécurité des plugins ;
- self-evolution avant politique du Board et rollback ;
- changements Kernel/Runtime sans Program de changement explicite.

## Futures Responsabilités de l’Executive AI

Avant v3.0, Executive AI peut :

- synthétiser la santé du portefeuille ;
- détecter de nouveaux candidats Program ;
- estimer valeur, coût, risque et durée ;
- proposer la priorisation ;
- rédiger des décisions de Program Board ;
- identifier les contradictions ;
- recommander continuer, rework, stop ou escalade.

Executive AI ne peut pas :

- approuver des Programs ;
- clôturer des Programs ;
- certifier des releases ;
- outrepasser la validation humaine ;
- modifier le socle certifié ;
- engager des contrats client.

## Décisions Automatiques du Program Board

Les décisions automatiques du Program Board sont une capacité future de v3.0 uniquement. Avant v3.0, NOVA peut seulement rédiger des packages de décision.

Les futures décisions automatiques doivent être limitées par :

- le scope de politique ;
- le seuil de valeur ;
- le seuil de risque ;
- le seuil de coût ;
- la réversibilité ;
- l’audit ;
- le rollback ;
- l’override humain.

Les futures auto-décisions autorisées peuvent inclure :

- créer une improvement request à faible risque ;
- planifier un nettoyage documentaire ;
- exécuter une validation non production ;
- recommander une réaffectation d’agent ;
- ouvrir une analyse rétrospective.

Décisions automatiques interdites :

- activer un nouveau Program stratégique ;
- livrer un changement client-facing ;
- modifier le Kernel/Runtime certifiés ;
- approuver un traitement de données à haut risque ;
- changer les termes de prix ou de contrat.

## Future Auto-Évolution

Séquence d’évolution autonome :

1. Learning AI produit des propositions d’amélioration.
2. Knowledge Graph identifie les actifs impactés.
3. Reasoning Engine évalue les options.
4. Consensus Engine recueille les positions expertes.
5. Executive AI rédige le dossier de Board.
6. Le Program Board approuve ou rejette.
7. Le Program approuvé s’exécute via la gouvernance normale.
8. Les résultats alimentent la mémoire d’apprentissage approuvée.

Ce n’est qu’après la certification v3.0 que les améliorations à faible risque pourront s’exécuter automatiquement sous politique du Board.

## Portes de Master Plan

| Porte | Preuve requise |
| --- | --- |
| Gate MVP commercial | Mission Ops end-to-end, UI, API, audit, coût LLM, pack pilote |
| Enterprise Gate | Sécurité, tenancy, déploiement, support, conformité |
| Cognitive Gate | Preuves de mémoire, graphe, raisonnement, consensus |
| Parallel Gate | Stress tests, résolution de conflits, certification intégrée |
| Ecosystem Gate | SDK, permissions plugin, certification, sandbox |
| Self-Evolution Gate | Politique, rollback, audit, preuve d’autonomie à faible risque |

## Décision Master Plan d’Exécution

L’exécution NOVA v2 doit commencer par une productisation gouvernée par le Program Board, livrer Mission Ops en premier, valider la traction commerciale, puis s’étendre vers l’orchestration cognitive d’entreprise et l’auto-évolution. C’est la voie crédible la plus rapide vers le revenu tout en préservant le socle certifié v1.0.0.
