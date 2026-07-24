# Roadmap de Release NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Principe de Release

La planification des releases doit préserver le socle certifié v1.0.0 et introduire les nouvelles surfaces commerciales uniquement via de futurs Programs approuvés par le Program Board.

## Résumé des Releases

| Release | Cible | Résultat stratégique |
| --- | --- | --- |
| v1.0.1 | 2-3 semaines | Gouvernance de productisation et protection du socle |
| v1.1 | 16-20 semaines | Premier MVP commercial NOVA Mission Ops |
| v2.0 | 18-24 mois | Plateforme cognitive d’entreprise |
| v2.1 | 24-30 mois | Developer platform, Studio, intégrations, fondation marketplace |
| v3.0 | 36-48 mois | Cognitive Operating System gouverné et auto-évolutif |

## v1.0.1

Objectif : préparer l’industrialisation produit sans modifier le Kernel ou le Runtime certifiés.

Périmètre :

- package de décision Program Board V2 ;
- charte de productisation ;
- politique de protection du socle ;
- politique de nommage et de versioning ;
- scope du MVP commercial ;
- registre de contradictions ;
- première séquence de Programmes.

Gates de release :

- approbation du Program Board ;
- aucune modification Kernel/Runtime ;
- aucune surface publique introduite sans scope de Program ;
- alignement des documents roadmap et stratégie ;
- références au socle v1.0.0 préservées.

Certification :

- certification documentaire ;
- certification de préservation du socle ;
- preuve de décision du Program Board.

## v1.1

Objectif : première release NOVA Mission Ops commercialisable.

Périmètre :

- fondation d’API publique ;
- persistance ;
- modèle de tenancy ;
- RBAC ;
- audit ledger ;
- Mission Ops UI ;
- Mission Workspace ;
- Decision Center Lite ;
- Agent Control Center Lite ;
- Runtime Observatory Lite ;
- LLM Gateway ;
- cost ledger ;
- export de preuves ;
- intégration VEEDDA de référence ;
- pack d’onboarding pilote.

Gates de release :

- contrats API versionnés ;
- cycle de vie mission implémenté de bout en bout ;
- transitions d’état validées ;
- conflits de lock testés ;
- export de rapports et de preuves testé ;
- workflow d’approbation humaine actif ;
- routage des fournisseurs LLM et plafonds de coût actifs ;
- aucune contradiction avec le socle certifié ;
- conformité design system vérifiée ;
- revue sécurité complète pour le scope pilote.

Certification :

- certification des règles produit ;
- certification des frontières architecturales ;
- certification de conformité UX ;
- certification sécurité et tenancy ;
- certification de readiness pilote.

## v2.0

Objectif : plateforme cognitive de niveau entreprise.

Périmètre :

- sécurité entreprise ;
- packaging private cloud/on-prem ;
- Memory Engine ;
- Knowledge Graph ;
- Reasoning Engine ;
- Consensus Engine ;
- Cognitive Planner ;
- validation de l’orchestration parallèle ;
- dashboards KPI et risque avancés ;
- documentation de déploiement entreprise.

Gates de release :

- gouvernance mémoire testée ;
- binding source et analyse d’impact du graphe testés ;
- preuves de recommandations cognitives ;
- stress tests d’orchestration parallèle réussis ;
- politique de données client certifiée ;
- automatisation du déploiement certifiée ;
- harness d’évaluation modèle actif.

Certification :

- certification de readiness entreprise ;
- certification de l’architecture cognitive ;
- certification d’orchestration parallèle ;
- certification de gouvernance IA.

## v2.1

Objectif : expansion de l’écosystème plateforme.

Périmètre :

- Developer Platform ;
- SDK ;
- CLI ;
- sandbox ;
- certification de plugins ;
- fondation marketplace interne ;
- base NOVA Studio ;
- framework de packs sectoriels ;
- pack VEEDDA élargi ;
- package de faisabilité LifeHub.

Gates de release :

- politique de stabilité API active ;
- tests SDK réussis ;
- permissions plugin applicables ;
- désactivation de plugin testée ;
- Studio ne peut pas contourner la gouvernance ;
- marketplace limitée aux packages internes ou partenaires certifiés ;
- documentation partenaire complète.

Certification :

- certification SDK ;
- certification runtime des plugins ;
- certification gouvernance Studio ;
- certification d’intégration.

## v3.0

Objectif : NOVA auto-évolutif gouverné.

Périmètre :

- Executive AI pour les propositions automatiques de Programs ;
- auto-évolution bornée à faible risque ;
- génération autonome de demandes d’amélioration ;
- optimisation adaptative du portefeuille ;
- marketplace avancée ;
- économie de templates sectoriels ;
- routage hybride/on-prem mature.

Gates de release :

- enveloppe d’autonomie à faible risque définie ;
- les actions automatiques sont réversibles ou confinées ;
- la politique du Board gouverne l’autonomie ;
- les preuves d’auto-évolution sont complètes ;
- le rollback est testé ;
- les approbations légales, sécurité et conformité sont complètes ;
- aucune décision à fort impact n’est prise sans autorité humaine.

Certification :

- certification d’auto-évolution ;
- certification de sécurité de l’autonomie ;
- certification de la politique du Board ;
- certification de l’écosystème.

## Stratégie de Migration

Migration de v1.0.0 vers v1.1 :

- préserver le socle certifié ;
- ajouter une couche de productisation au-dessus des modules internes ;
- créer des contrats explicites d’API et de persistance ;
- éviter la mutation directe du Kernel/Runtime certifiés ;
- mapper les preuves internes vers des exports d’audit orientés produit ;
- versionner tous les contrats publics ;
- maintenir la matrice de compatibilité.

Migration de v1.1 vers v2.0 :

- introduire la mémoire et le graphe derrière la gouvernance ;
- ajouter des modes de déploiement privés ;
- étendre les rôles agents sous registre ;
- préserver les workflows mission de v1.1.

Migration de v2.0 vers v2.1 :

- exposer les surfaces développeur et plugin ;
- certifier les contrats d’extension ;
- garder la marketplace séparée de la gouvernance cœur.

Migration de v2.1 vers v3.0 :

- introduire l’auto-évolution uniquement après preuve de politique et de rollback ;
- maintenir l’autorité humaine pour les décisions à fort impact.

## Décision de Release

NOVA doit livrer v1.1 dès que le chemin Mission Ops est commercialement crédible, même si la mémoire, le graphe, la marketplace, Studio et l’auto-évolution profonde restent incomplets. Cela maximise le time to market tout en conservant la trajectoire long terme du Cognitive OS.
