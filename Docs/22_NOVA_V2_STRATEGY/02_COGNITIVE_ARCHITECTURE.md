# Architecture Cognitive NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Positionnement Architecturale

L’Architecture Cognitive se situe au-dessus du socle certifié NOVA v1.0.0 Operating System. Elle consomme les preuves certifiées du Kernel, du Runtime, de l’OS Integration, de la Governance, du Portfolio, du Scheduler, du Resource Manager, du Risk Engine, du KPI Engine, du Dashboard et de la Final Certification. Elle ne doit pas modifier les fondations certifiées du Kernel ou du Runtime sans une nouvelle autorité de changement approuvée par le Program Board.

## Principes de Conception

1. Valeur commerciale avant exhaustivité cognitive.
2. Approbation humaine pour les décisions à impact entreprise.
3. Gouvernance déterministe autour des sorties probabilistes des modèles.
4. Exécution des modèles indépendante des fournisseurs.
5. Conservation des preuves pour chaque recommandation IA.
6. Contrôles de scope, d’autorité et de lock avant l’exécution d’agents.
7. Apprentissage à travers des artefacts approuvés, pas par mutation silencieuse de politique.

## Pile Cognitive

| Couche | Responsabilité | Premier périmètre commercial |
| --- | --- | --- |
| Couche Expérience | Mission Control, Program Planner, Workspaces, Decisions, Observatory | Requis |
| Couche Gouvernance | Politique du Board, autorité, approbations, risque, KPI, certification | Requis |
| Couche Orchestration | Cycle de vie des missions, locks, files, dispatch, rapports | Requis |
| Couche Agent | Agents de rôle et capacités d’exécution | Limité |
| Couche Cognitive | Raisonnement, planification, consensus, mémoire, graphe de connaissances | Par étapes |
| Couche Modèles | Passerelle LLM multi-fournisseurs et adaptateurs de modèles locaux | Requis |
| Couche Preuves | Audit, rapports, tests, validations, citations, registre de coûts | Requis |

## Executive AI

Objectif : aider le Program Board et les dirigeants avec des recommandations au niveau portefeuille.

Responsabilités :

- synthétiser le statut des Programs, le risque, la valeur, le coût et les dépendances ;
- recommander de nouveaux Programs ou des reports ;
- préparer des options d’investissement et de feuille de route ;
- identifier les contradictions avec les socles certifiés ;
- rédiger des décisions de Board pour approbation humaine.

Restrictions :

- ne peut pas approuver seul de nouveaux Programs ;
- ne peut pas déclarer un Program terminé ;
- ne peut pas contourner les portes de certification ;
- ne peut pas modifier les engagements produit sans décision du Board.

## Planner AI

Objectif : convertir la stratégie en travail séquencé.

Responsabilités :

- décomposer les Programs en releases, jalons, ordres de mission et campagnes ;
- estimer la capacité, les dépendances, le risque, la complexité et la durée ;
- maintenir des variantes de plan pour le time to market et le ROI ;
- détecter les opportunités d’exécution en parallèle ;
- générer des propositions de replanification en cas de blocage.

Le premier périmètre de livraison est l’assistance à la planification et la simulation de roadmap, pas l’activation autonome du planning.

## Architect AI

Objectif : protéger l’intégrité architecturale.

Responsabilités :

- vérifier les frontières Kernel, Runtime, Product, Platform, UI, API, SDK et marketplace ;
- produire des architecture decision records ;
- détecter les violations du sens des dépendances ;
- faire respecter les règles produit et les contraintes du design system ;
- conseiller sur les contrats d’intégration.

Règle critique : Architect AI peut bloquer ou escalader, mais ne peut pas réécrire silencieusement une architecture certifiée.

## Developer AI

Objectif : implémenter des changements bornés dans des missions approuvées.

Responsabilités :

- générer du code dans les fichiers autorisés ;
- mettre à jour les tests et la documentation ;
- préserver le scope, le style et les patterns du dépôt ;
- produire des preuves d’implémentation.

Restrictions :

- aucune mutation de production sans autorité de mission ;
- aucun changement du Kernel ou du Runtime certifiés sans autorisation explicite ;
- aucune suppression ou refactorisation du travail utilisateur non lié ;
- aucune auto-approbation.

## Tester AI

Objectif : améliorer la qualité et la confiance de release.

Responsabilités :

- déduire des tests à partir des critères d’acceptation de mission ;
- exécuter les suites de tests configurées ;
- valider les régressions, la couverture, l’idempotence et la gestion des erreurs ;
- produire des preuves de test structurées.

Priorité commerciale initiale : génération de tests d’acceptation, orchestration de régression et reporting de release gate.

## Reviewer AI

Objectif : fournir une vérification indépendante et un support de certification.

Responsabilités :

- réaliser la revue de code et de documents ;
- vérifier les frontières architecturales ;
- valider la traçabilité ;
- classifier les défauts par sévérité et par risque ;
- recommander GO, REWORK, STOP ou ESCALATE.

Reviewer AI doit être distinct de Developer AI pour les changements matériels.

## Learning AI

Objectif : convertir l’historique d’exécution en propositions d’amélioration.

Responsabilités :

- analyser les rétrospectives, blocages, défauts et cycle times ;
- détecter les schémas d’échec répétés ;
- proposer des améliorations de templates, playbooks, tests et workflows ;
- générer des improvement requests pour approbation du Board.

Restrictions :

- aucune modification silencieuse de la gouvernance ;
- aucune mutation automatique de politique ;
- aucun entraînement sur des données client confidentielles sans contrat explicite.

## Memory Engine

Objectif : maintenir un contexte réutilisable et gouverné.

Types de mémoire :

| Type | Usage |
| --- | --- |
| Mémoire de mission à court terme | Contexte d’exécution courant et état récent |
| Mémoire de Program | Objectifs, contraintes, décisions, risques, dépendances |
| Mémoire produit | Règles produit, patterns UX, termes métier, contrats d’intégration |
| Mémoire entreprise | Politiques client, modèle organisationnel, contraintes de déploiement |
| Mémoire d’apprentissage | Leçons apprises approuvées et patterns réutilisables |

La mémoire doit préserver la source, le périmètre, la fraîcheur, la sensibilité, la rétention et la révocation.

## Knowledge Graph

Objectif : représenter les relations entre les objets NOVA.

Nœuds principaux :

- Program ;
- Release ;
- Milestone ;
- Mission ;
- Campaign ;
- Agent ;
- Decision ;
- Evidence ;
- Test ;
- Risk ;
- KPI ;
- Document ;
- Product ;
- Capability ;
- Model ;
- Customer.

Relations principales :

- depends_on ;
- authorizes ;
- produces ;
- verifies ;
- certifies ;
- blocks ;
- escalates_to ;
- consumes ;
- supersedes ;
- impacts ;
- belongs_to ;
- implements.

Premier usage commercial : analyse d’impact, navigation dans la source de vérité et traçabilité des preuves.

## Decision Engine

Objectif : convertir les preuves en recommandations gouvernées.

Entrées :

- politiques du Board ;
- règles produit ;
- scores de risque ;
- preuves KPI ;
- graphe de dépendances ;
- registre de coûts ;
- valeur client ;
- niveau de confiance.

Sorties :

- GO, REWORK, STOP, ESCALATE ;
- score de priorité ;
- justification de décision ;
- autorité requise ;
- package de preuves ;
- risque résiduel.

Les décisions matérielles nécessitent une approbation humaine jusqu’à ce qu’une enveloppe d’autonomie à faible risque soit explicitement certifiée.

## Reasoning Engine

Objectif : structurer l’analyse avant recommandation.

Méthodes :

- gating fondé sur règles pour les contraintes dures ;
- scoring pondéré pour la priorisation ;
- analyse de graphe de dépendances ;
- synthèse par modèle pour l’ambiguïté complexe ;
- revue contradictoire pour les incohérences ;
- calibration de confiance ;
- liaison des citations et des preuves.

Le Reasoning Engine doit distinguer les faits, les hypothèses, les recommandations et les décisions.

## Consensus Engine

Objectif : réconcilier plusieurs rôles experts.

Flux de consensus :

1. Capturer la proposition.
2. Lancer l’évaluation par rôle : stratégie, produit, architecture, revenu, risque, UX, sécurité, IA.
3. Détecter les objections et contradictions.
4. Tenter une résolution à l’aide des règles actives.
5. Noter la confiance.
6. Soumettre le package de décision.
7. Escalader les conflits non résolus.

Niveaux de consensus :

- informatif ;
- accord simple ;
- accord qualifié ;
- arbitrage exécutif ;
- approbation du Board.

## Décision d’Architecture Cognitive

NOVA v2 doit d’abord implémenter une couche cognitive commerciale légère : passerelle LLM, aide à la décision, assistance à la planification, guidage de l’exécution des missions et synthèse de preuves. La mémoire profonde, le graphe de connaissances, le consensus, l’apprentissage et l’auto-évolution sont séquencés après le premier revenu et les pilotes entreprise.
