# Plan Directeur d’Exécution NOVA

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Ce plan directeur convertit la stratégie V2 en futurs Programs exécutables. Il n’active aucun Program à lui seul. L’activation des Programs reste sous l’autorité du Program Board NOVA.

## Doctrine d’Exécution

L’exécution NOVA v2 doit suivre :

```text
Approbation du Program Board
-> Program Charter
-> Program Index
-> Roadmap
-> Mission Orders
-> Campaigns
-> implémentation
-> tests
-> verification
-> certification
-> clôture
```

## Séquence des Programs

| Séquence | Program | Décision |
| --- | --- | --- |
| 1 | PROGRAM-014 V2 Productization Governance | Démarrer en premier |
| 2 | PROGRAM-015 Platform API, Persistence, Identity | Démarrer après 014 |
| 3 | PROGRAM-016 LLM Gateway and AI Cost Governance | Candidat parallèle avec 015 |
| 4 | PROGRAM-017 Mission Ops UI | Démarrer après la base de contrats API |
| 5 | PROGRAM-018 Decision and Evidence Center | Candidat parallèle avec 019 après la fondation 017 |
| 6 | PROGRAM-019 Agent Supervision and Runtime Observatory | Candidat parallèle avec 018 |
| 7 | PROGRAM-020 VEEDDA Reference Integration | Démarrer tôt le travail de contrat ; implémentation après 015-019 |
| 8 | PROGRAM-021 Pilote client et préparation commerciale | Préparer en parallèle ; exécuter après les gates MVP |
| 9 | PROGRAM-022 Enterprise Security and Deployment | Démarrer après stabilisation de l’architecture pilote |
| 10 | PROGRAM-023 Memory Engine | Démarrer après identification des vrais besoins du pilote |
| 11 | PROGRAM-024 Knowledge Graph and Impact Analysis | Démarrer après Memory et stabilisation du modèle de preuves |
| 12 | PROGRAM-025 Cognitive Planner, Reasoning, Consensus | Démarrer après graphe et mémoire |
| 13 | PROGRAM-026 Parallel Program Orchestration | Démarrer après maturité de la gouvernance entreprise et de la supervision des agents |
| 14 | PROGRAM-027 Developer Platform and SDK | Démarrer après stabilité API |
| 15 | PROGRAM-028 Plugin Certification and Marketplace | Démarrer après SDK et permissions plugin |
| 16 | PROGRAM-029 NOVA Studio | Démarrer après stabilisation des templates, du SDK et des politiques de gouvernance |
| 17 | PROGRAM-030 Sector Product Packs | Démarrer après la preuve VEEDDA et la demande partenaire |
| 18 | PROGRAM-031 Self-Evolution Executive AI | Démarrer après les contrôles v2.0/v2.1 et la politique d’autonomie du Board |

## Opportunités d’Exécution Parallèle

L’exécution parallèle nécessite une approbation du Program Board pour modifier la contrainte actuelle d’un seul Program actif.

Sets parallèles recommandés :

| Set parallèle | Programs | Conditions |
| --- | --- | --- |
| Set A | PROGRAM-015 et PROGRAM-016 | Workstreams disjoints API/platform et gateway LLM |
| Set B | PROGRAM-018 et PROGRAM-019 | Contrats mission partagés déjà stables |
| Set C | PROGRAM-020 et préparation de PROGRAM-021 | L’intégration et la readiness commerciale sont séparées |
| Set D | PROGRAM-023 et découverte PROGRAM-024 | Aucune dépendance production avant stabilisation des contrats mémoire |
| Set E | PROGRAM-027 et découverte des packs sectoriels | Implémentation SDK séparée de la découverte client |

Exécution parallèle interdite :

- deux Programs modifiant le même contrat public sans autorité contractuelle ;
- les workflows de mutation UI avant certification API ;
- la marketplace avant sécurité des plugins ;
- l’auto-évolution avant politique du Board et rollback ;
- les changements Kernel/Runtime sans Program de changement explicite.

## Futures Responsabilités de l’Executive AI

Avant v3.0, Executive AI peut :

- synthétiser la santé du portefeuille ;
- détecter de nouveaux candidats Program ;
- estimer valeur, coût, risque et durée ;
- proposer la priorisation ;
- rédiger des dossiers de décision du Program Board ;
- identifier les contradictions ;
- recommander continuer, rework, stop ou escalation.

Executive AI ne peut pas :

- approuver des Programs ;
- clôturer des Programs ;
- certifier des releases ;
- outrepasser la validation humaine ;
- modifier le socle certifié ;
- engager des contrats client.

## Décisions Automatiques du Program Board

Les décisions automatiques du Program Board sont une capacité future de v3.0 uniquement. Avant v3.0, NOVA peut automatiquement rédiger des dossiers de décision.

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
- exécuter une validation non-production ;
- recommander une réaffectation d’agent ;
- ouvrir une analyse rétrospective.

Décisions automatiques interdites :

- activer un nouveau Program stratégique ;
- livrer un changement côté client ;
- modifier le Kernel/Runtime certifiés ;
- approuver un traitement de données à haut risque ;
- changer les termes de prix ou de contrat.

## Future Auto-Évolution

Séquence d’évolution autonome :

1. Learning AI produit des propositions d’amélioration.
2. Knowledge Graph identifie les actifs impactés.
3. Reasoning Engine évalue les options.
4. Consensus Engine recueille les positions expertes.
5. Executive AI rédige le package Board.
6. Le Program Board approuve ou rejette.
7. Le Program approuvé s’exécute via la gouvernance normale.
8. Les résultats alimentent la mémoire d’apprentissage approuvée.

Ce n’est qu’après la certification v3.0 que des améliorations à faible risque pourront s’exécuter automatiquement sous politique du Board.

## Gates du Master Plan

| Gate | Preuve requise |
| --- | --- |
| Gate MVP commercial | Mission Ops end-to-end, UI, API, audit, coût LLM, pack pilote |
| Enterprise Gate | Sécurité, tenancy, déploiement, support, conformité |
| Cognitive Gate | Preuves mémoire, graphe, raisonnement, consensus |
| Parallel Gate | Stress tests, résolution des conflits, certification intégrée |
| Ecosystem Gate | SDK, permissions plugin, certification, sandbox |
| Self-Evolution Gate | Politique, rollback, audit, preuve d’autonomie à faible risque |

## Décision du Plan Directeur d’Exécution

L’exécution NOVA v2 doit commencer par une productisation gouvernée par le Program Board, livrer Mission Ops en premier, valider la traction commerciale, puis s’étendre vers l’orchestration cognitive d’entreprise et l’auto-évolution. C’est la voie crédible la plus rapide vers le revenu tout en préservant le socle certifié v1.0.0.
