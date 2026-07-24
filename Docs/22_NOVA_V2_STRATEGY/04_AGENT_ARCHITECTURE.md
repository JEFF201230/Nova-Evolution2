# Architecture des Agents NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Ce document définit l’architecture multi-agents NOVA v2 pour l’industrialisation commerciale et l’évolution cognitive de long terme. Il étend le modèle de preuves certifié du Agent Runtime, de l’Execution Engine, de la Governance, du Scheduler, du Resource Manager, du Risk Engine, du KPI Engine et du Dashboard v1.0.0 sans rouvrir les fondations certifiées du Kernel ou du Runtime.

## Positionnement Architecturale

Les agents ne remplacent pas la gouvernance. Ils exécutent, analysent, testent, relisent, expliquent et recommandent dans des frontières d’autorité explicites.

```text
Program Board
-> Gouvernance et politiques de décision
-> Scheduler et Resource Manager
-> Mission Runtime et Agent Runtime
-> Agent Registry
-> Exécution des agents
-> Rapports, preuves, tests, revue, certification
```

## Familles d’Agents

| Famille | Rôle principal | Premier périmètre commercial |
| --- | --- | --- |
| Executive Agents | Support du Board, priorisation, options d’investissement | Recommandation uniquement |
| Planning Agents | Décomposition des Programs, planification des missions, scénarios de capacité | Planification assistée |
| Architecture Agents | Contrôles de frontière, revues de design, validation des dépendances | Requis |
| Product Agents | Exigences, critères d’acceptation, impact produit | Requis |
| Developer Agents | Implémentation dans le scope de mission | Limité, supervisé |
| Tester Agents | Planification des tests, support d’exécution, preuves de régression | Requis |
| Reviewer Agents | Revue indépendante et support de certification | Requis |
| Documentation Agents | Rapports, release notes, documents de traçabilité | Requis |
| Knowledge Agents | Récupération, mémoire, extraction de graphe | Par étapes |
| Integration Agents | Contrôles d’intégration produit/API/plugin | Par étapes |
| Security Agents | RBAC, tenancy, politique de données, secrets, audit | Requis avant release entreprise |
| Finance/Cost Agents | Coûts d’usage IA, ROI, impact budgétaire | Requis pour le lancement LLM |

## Cycle de Vie d’un Agent

| État | Signification | Porte |
| --- | --- | --- |
| Draft | Définition d’agent proposée | Revue du registre |
| Registered | Identité, capacités et scope enregistrés | Approbation gouvernance |
| Available | L’agent peut recevoir des missions | Contrôles de capacité et de politique |
| Assigned | L’agent est sélectionné pour une mission | L’autorité de mission existe |
| Locked | L’agent dispose d’un lock de scope | Le Lock Manager confirme l’absence de conflit |
| Running | L’agent exécute le travail autorisé | Runtime et capture de preuves |
| Submitted | L’agent a produit le rapport et les livrables | Validation du rapport |
| Reviewing | La sortie est sous validation technique, documentaire ou humaine | Séparation du reviewer |
| Accepted | La sortie est acceptée par l’autorité | Certification et clôture |
| Suspended | L’agent est bloqué, désactivé ou signalé à risque | Escalade |
| Retired | L’agent sort de l’usage actif | Audit et plan de remplacement |

## Modèle de Capacité d’Agent

Chaque agent doit déclarer :

- `agent_id` ;
- la famille de rôle ;
- les types de mission autorisés ;
- les scopes autorisés ;
- les scopes interdits ;
- le niveau d’autorité ;
- les exigences de modèle/fournisseur ;
- les outils autorisés ;
- les classes de sensibilité autorisées ;
- la politique de coût ;
- l’historique de qualité ;
- l’owner ;
- la version ;
- la condition de mise à la retraite.

Aucun agent ne peut être inféré à partir d’un prompt seul. Les agents de production doivent exister dans le registre.

## Modèle de Délégation

La délégation est autorisée uniquement lorsque :

1. l’autorité de mission existe ;
2. la tâche déléguée est dans le scope d’origine ;
3. l’agent destinataire dispose de la capacité et des permissions adéquates ;
4. les locks ne sont pas en conflit ;
5. les obligations de dépendance et de reporting sont explicites ;
6. la mission parente reste responsable.

Types de délégation :

- délégation séquentielle pour les tâches dépendantes ;
- délégation parallèle pour les scopes disjoints ;
- délégation de revue pour le contrôle qualité indépendant ;
- délégation d’escalade vers un rôle d’autorité supérieur ;
- délégation spécialisée pour une expertise technique ou produit étroite.

## Modèle d’Escalade

L’escalade est obligatoire lorsque :

- le scope est ambigu ;
- l’autorité est absente ;
- le socle certifié peut être affecté ;
- le plafond de coût est dépassé ;
- la politique de données sensibles est incertaine ;
- la sortie d’un agent contredit l’autorité source ;
- aucun consensus ne peut être atteint ;
- un blocage empêche l’acceptation ;
- une décision à impact utilisateur ou entreprise est requise.

Chemin d’escalade :

```text
Agent
-> Orchestrator
-> Architect / Product Owner / Security / Finance
-> Recommandation Executive AI
-> Décision de l’humain exécutif / Program Board
```

## Consensus

NOVA utilise le consensus multi-agents pour les recommandations, pas pour l’autorité non bornée.

Flux de consensus :

1. Définir la question et la frontière de décision.
2. Recueillir les positions par rôle.
3. Lier chaque position à une preuve.
4. Détecter les contradictions.
5. Évaluer confiance, impact, risque, coût et réversibilité.
6. Produire les options.
7. Soumettre l’option recommandée à l’autorité requise.

Le consensus ne peut pas approuver :

- l’activation d’un nouveau Program ;
- la modification certifiée du Kernel ou du Runtime ;
- un engagement contractuel client ;
- une décision à impact juridique, financier, RH ou sécurité ;
- la certification de release.

## Règles de Communication

Communication autorisée :

- agent vers runtime via le contexte de mission ;
- agent vers le store de rapports via des rapports structurés ;
- agent vers la récupération de connaissance via des références bornées ;
- agent vers le decision center via des packages de recommandation ;
- agent vers l’humain via des surfaces UI approuvées.

Communication interdite :

- mutation incontrôlée agent-à-agent ;
- décisions cachées par canal secondaire ;
- usage d’outil non journalisé ;
- partage direct de données client entre tenants ;
- contournement de l’état Mission Runtime ;
- modification directe du socle certifié sans autorité.

## Sécurité

La sécurité des agents requiert :

- isolation des tenants ;
- identifiants bornés ;
- aucun secret partagé dans les prompts ;
- allowlists d’outils ;
- allowlists de modèles/fournisseurs ;
- restrictions par classe de données ;
- redaction avant les appels modèle ;
- événements d’audit pour les actions sensibles ;
- approbation humaine pour les actions irréversibles ou matérielles ;
- procédures de désactivation et de rollback.

## Gouvernance

La gouvernance des agents doit s’intégrer avec :

- l’autorité du Program Board ;
- la gouvernance des Mission Orders ;
- la gouvernance des Campaigns ;
- l’Approval Workflow ;
- le Decision Workflow ;
- le Scheduler ;
- le Resource Manager ;
- le Risk Engine ;
- le KPI Engine ;
- la certification.

Chaque action d’agent doit tracer :

```text
Program -> Mission -> Agent -> Action -> Evidence -> Review -> Decision -> Certification
```

## Périmètre Agent du MVP Commercial

La première version vendable doit inclure :

- le registre des agents ;
- les agents architecture, reviewer, tester, documentation et product comme assistants gouvernés ;
- un ou deux developer agents sous scope de mission strict ;
- un Agent Control Center lite ;
- le suivi des coûts et de la qualité ;
- des approbations humaines pour toutes les décisions matérielles.

Elle doit différer :

- la création autonome d’agents dans les environnements clients ;
- les agents tiers ouverts ;
- les agents auto-modifiants ;
- le déploiement autonome en production ;
- l’approbation autonome de Programs.

## Décision d’Architecture des Agents

NOVA v2 doit utiliser les agents comme rôles d’exécution gouvernés à l’intérieur du cycle de vie de mission certifié. La stratégie maximise la vitesse de mise sur le marché en livrant d’abord des agents supervisés, tout en préservant l’architecture nécessaire à une autonomie plus profonde après maturation des contrôles de gouvernance, sécurité, coût et certification.
