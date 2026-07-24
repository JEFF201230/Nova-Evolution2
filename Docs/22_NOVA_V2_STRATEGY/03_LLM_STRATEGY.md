# Stratégie LLM NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objectif Stratégique

NOVA doit rester indépendant des fournisseurs tout en délivrant rapidement des capacités IA fiables et maîtrisées en coût, assez vite pour une première version commerciale. La stratégie LLM est donc une abstraction multi-fournisseurs avec routage gouverné, surveillance d’usage et exécution hybride.

## Contrainte de Base

NOVA v1.0.0 ne certifie aucune API publique externe, aucun SDK, aucune interface de base de données, aucune UI, aucune marketplace ni aucune surface d’intégration produit. La couche LLM est un futur programme d’industrialisation produit et doit être introduite au-dessus du socle certifié, pas à l’intérieur des frontières protégées du Kernel ou du Runtime.

## Architecture Multi-Fournisseurs

| Composant | Responsabilité |
| --- | --- |
| Model Gateway | Point d’entrée interne unique pour tous les appels modèle |
| Provider Adapter | OpenAI, Azure OpenAI, Anthropic, Google, modèles locaux et futurs fournisseurs |
| Routing Policy Engine | Sélectionne le fournisseur/modèle selon la tâche, le coût, la sensibilité, la latence, la qualité et la disponibilité |
| Prompt Registry | Prompts versionnés, politiques système, templates de tâche et cas d’évaluation |
| Cost Ledger | Comptabilisation des tokens, de la latence, des retries, du cache et du coût fournisseur |
| Safety and Data Policy | Gestion des PII, restrictions tenant, redaction, rétention et listes allow/deny |
| Evaluation Harness | Tests de régression pour les prompts, les montées de version de modèle et les décisions de routage |
| Fallback Manager | Dégrade vers un modèle moins coûteux, local ou un workflow humain si nécessaire |

## Abstraction LLM

NOVA doit exposer des contrats de capacité internes plutôt que des appels directs au modèle :

- `summarize_evidence` ;
- `draft_mission_order` ;
- `classify_risk` ;
- `recommend_priority` ;
- `review_architecture_boundary` ;
- `generate_test_plan` ;
- `synthesize_decision_options` ;
- `extract_knowledge_graph_edges` ;
- `explain_runtime_anomaly` ;
- `draft_customer_report`.

Chaque contrat doit définir :

- le schéma d’entrée ;
- le schéma de sortie ;
- les exigences de source ;
- les modèles autorisés ;
- le niveau de sensibilité ;
- le coût maximal ;
- la latence maximale ;
- les citations ou preuves requises ;
- le comportement de repli ;
- le score de confiance.

## Stratégie de Routage

| Type de tâche | Préférence de routage | Raison |
| --- | --- | --- |
| Classification à faible risque | Modèle cloud peu coûteux ou local | Minimiser le coût |
| Extraction de preuves | Parser déterministe d’abord, modèle ensuite | Réduire les hallucinations |
| Raisonnement complexe | Modèle cloud approuvé de meilleure qualité | La précision prime |
| Génération de code | Modèle spécialisé en code avec contexte dépôt | Productivité |
| Données client sensibles | On-prem/local ou cloud privé | Contrôle des données |
| Revue de grand contexte | Modèle à fort contexte avec cache | Réduire les retours arrière |
| Assistance UI temps réel | Modèle à faible latence | Expérience utilisateur |
| Contrôles de certification | Règles d’abord, explication assistée par modèle ensuite | Gouvernance |

## Optimisation des Coûts

Le contrôle des coûts est une capacité commerciale, pas seulement une préoccupation d’infrastructure.

Mécanismes requis :

- plafonds budgétaires par tenant ;
- politiques de modèle par workflow ;
- tableaux de bord des tokens et des requêtes ;
- compression de prompts ;
- récupération contextuelle plutôt que replay de contexte complet ;
- cache pour les preuves stables ;
- traitement par lots pour les tâches non interactives ;
- routage vers des modèles moins coûteux pour les brouillons ;
- approbation des modèles coûteux pour les décisions à forte valeur uniquement ;
- reporting du coût par mission et par Program.

Le KPMG AI Pulse 2026 souligne que la valeur IA dépend de la gouvernance, de la responsabilité et de l’économie. NOVA doit utiliser la visibilité sur les coûts comme argument commercial.

Référence : https://kpmg.com/uk/en/insights/ai/ai-quarterly-pulse.html

## Modèles On-Prem

Les modèles on-prem ou private cloud sont requis pour :

- les clients régulés ;
- les programmes confidentiels ;
- les données sensibles RH, finance, juridique et secteur public ;
- les environnements déconnectés ;
- les clients ayant des exigences de souveraineté modèle.

Périmètre initial :

- synthèse de preuves ;
- classification ;
- retrieval augmentation ;
- rédaction à moindre risque ;
- redaction ;
- contrôles de politique.

Le on-prem n’est pas requis pour le premier pilote, sauf demande d’un design partner. L’architecture doit être prête, mais l’implémentation peut suivre la validation commerciale.

## Modèles Cloud

Les modèles cloud doivent être utilisés pour :

- les tâches à fort raisonnement ;
- la revue architecturale complexe ;
- l’assistance à la génération de code ;
- les tâches multimodales ou avancées futures ;
- le benchmark d’évaluation ;
- la capacité de repli.

Stratégie fournisseur :

- éviter de coder en dur un fournisseur dans la logique produit ;
- supporter au moins deux fournisseurs cloud de niveau entreprise avant le déploiement entreprise large ;
- supporter des allowlists fournisseur spécifiques au client ;
- supporter le repli en cas de panne fournisseur ;
- suivre la qualité et le coût par tâche.

## Exécution Hybride

L’exécution hybride combine :

- des contrôles déterministes locaux ;
- une récupération privée ;
- des modèles locaux ou privés pour le prétraitement sensible ;
- des modèles cloud pour le raisonnement avancé lorsque la politique l’autorise ;
- la validation humaine pour les décisions matérielles.

Flux recommandé :

1. Appliquer les règles et la validation de schéma.
2. Récupérer le contexte borné.
3. Redacter ou minimiser les données sensibles.
4. Router vers un modèle approuvé.
5. Valider la sortie structurée.
6. Lier la sortie aux preuves.
7. Enregistrer le coût et la confiance.
8. Router vers une approbation humaine si nécessaire.

## Indépendance Fournisseur

L’indépendance fournisseur est obligatoire pour la résilience stratégique.

Contrôles :

- aucun concept spécifique fournisseur dans les modèles de domaine produit ;
- des adaptateurs fournisseur derrière des contrats internes ;
- un registre de capacités modèle ;
- des erreurs et retries standardisés ;
- des tests de portabilité des prompts ;
- des portes de changement de modèle ;
- des benchmarks de coût et de qualité ;
- des contrôles contractuels de rétention des données ;
- un plan de sortie pour chaque fournisseur.

## Gouvernance des Modèles

Chaque capacité modèle doit avoir :

- un owner ;
- des classes de données autorisées ;
- une validation de sortie ;
- une suite d’évaluation ;
- une politique de rollback ;
- un plafond de coût ;
- un événement d’audit ;
- une version de release ;
- des limites connues.

## Premier Périmètre Commercial

La première version vendable doit inclure :

- la passerelle modèle ;
- deux adaptateurs fournisseur, un principal et un de secours ;
- le registre de coûts ;
- le registre de prompts ;
- la redaction et le tagging de sensibilité ;
- l’aide à la rédaction de missions ;
- la synthèse de preuves ;
- la classification des risques ;
- la synthèse d’options de décision ;
- la rédaction de rapports ;
- le workflow d’approbation humaine.

La première version ne doit pas inclure la négociation autonome de modèle à modèle, l’utilisation libre d’outils, le déploiement autonome en production ou des prompts auto-modifiants hors gouvernance de release.

## Décision Stratégie LLM

NOVA v2 doit construire la couche LLM comme un utilitaire d’entreprise gouverné. L’intelligence du modèle est importante, mais le différenciateur commercial est l’usage contrôlé, explicable, auditable et maîtrisé en coût des modèles au sein d’un système d’exploitation d’exécution certifié.
