# Stratégie Produit NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Thèse Produit

NOVA v2 doit commercialiser l’exécution assistée par IA et gouvernée avant d’essayer de vendre le Cognitive Operating System complet. Le premier acheteur n’a pas besoin de tous les futurs moteurs cognitifs. Le premier acheteur a besoin d’un travail assisté par IA, contrôlé, observable et auditable, qui améliore le time to execution sans créer de risque de gouvernance.

## Stratégie de Portefeuille

| Ligne produit | Rôle | Timing |
| --- | --- | --- |
| NOVA Mission Ops | Premier cockpit d’exploitation commercial pour les missions, agents, décisions et preuves | Immédiat |
| NOVA Platform | API, runtime, gouvernance, tenancy, persistance, passerelle modèle | Fondation immédiate |
| VEEDDA Integration Pack | Première preuve métier et première intégration produit de référence | Pilote |
| NOVA Enterprise Cockpit | Vue exécutive sur portefeuille, KPI, risque, certification et planification | v1.1-v2.0 |
| NOVA Cognitive Layer | Mémoire, graphe de connaissances, raisonnement, consensus, apprentissage | v2.0 |
| NOVA Developer Platform | SDK, contrats API, CLI, docs d’intégration, templates | v2.0-v2.1 |
| NOVA Studio | Environnement d’auteur pour workflows, agents, templates et Programs | v2.1 |
| NOVA Marketplace | Plugins, packs sectoriels, agents et templates certifiés | v2.1-v3.0 |
| LifeHub | Future famille produit utilisant les patterns d’orchestration NOVA | Après preuve plateforme |
| Future Products | Produits d’exploitation sectoriels construits au-dessus de NOVA | Après intégrations répétables |

## Premier Produit Commercial

Le premier produit doit être NOVA Mission Ops.

Promesse vendable :

un travail d’agents IA contrôlé, observable et auditable, depuis la demande jusqu’au livrable validé.

Capacités minimales vendables :

- créer une mission ;
- définir le scope, l’autorité, les livrables et les critères d’arrêt ;
- affecter un agent ou une équipe approuvés ;
- verrouiller le scope d’exécution ;
- exécuter ou suivre le travail ;
- capturer le rapport et les preuves ;
- valider techniquement, documentairement et humainement ;
- escalader les blocages ;
- exporter les preuves d’audit et de certification ;
- surveiller le statut des agents et la santé du runtime ;
- suivre le coût IA et l’usage des modèles.

## Stratégie Plateforme

La plateforme doit exposer des capacités sans divulguer les internes certifiés.

Surfaces de plateforme requises :

- API publique ;
- API de service interne ;
- couche de persistance ;
- identité et RBAC ;
- frontière de tenant ;
- registre d’audit ;
- passerelle LLM ;
- flux d’événements ;
- store de preuves ;
- frontière plugin ;
- console d’administration ;
- packaging de déploiement.

La première version de plateforme doit soutenir l’industrialisation produit et les pilotes, pas un scale large d’écosystème développeur.

## Stratégie VEEDDA

VEEDDA est la première preuve métier, pas une dépendance à l’intérieur du Kernel ou du Runtime NOVA.

L’intégration VEEDDA doit valider :

- le contrat plugin ;
- l’ingestion de contexte métier ;
- l’intégration de reporting en lecture seule ;
- des emplacements de diagnostic et d’observabilité ;
- des commandes gouvernées uniquement après les barrières de sécurité ;
- l’export d’audit et de preuves ;
- la séparation entre les utilisateurs produit métier et les opérateurs NOVA.

Les domaines VEEDDA restent détenus par VEEDDA :

- CSE ;
- employee space ;
- administration ;
- DMS ;
- cockpit et reporting ;
- budget, subvention, QF, ledger, paiements, audit.

NOVA ne doit pas embarquer la logique métier VEEDDA dans le Kernel, le Runtime ou les primitives de plateforme.

## Stratégie LifeHub

LifeHub doit rester une future option produit tant que NOVA n’a pas démontré une orchestration répétable à travers Mission Ops et VEEDDA.

Rôle recommandé :

- produit d’exploitation orienté consommateur ou collaborateur ;
- utilise NOVA pour la gouvernance des workflows et l’assistance IA ;
- ne pilote pas l’architecture de plateforme initiale.

## Stratégie Cockpit

NOVA Cockpit doit avoir deux sens :

- Mission Ops cockpit pour les opérateurs et équipes de delivery ;
- Enterprise Cockpit pour les exécutifs qui suivent la santé du portefeuille, le risque, le ROI et la certification.

La première version doit livrer le Mission Ops cockpit. L’Enterprise Cockpit mûrit après l’existence de vraies données de mission et de Program.

## Stratégie Marketplace

La marketplace est stratégiquement importante mais commercialement prématurée.

Séquence :

1. Registre interne de plugins.
2. Plugin de référence `veedda.core`.
3. Modèle de pack d’intégration certifié.
4. Certification des plugins partenaires.
5. Marketplace payante.

La marketplace ne doit pas être lancée avant :

- la stabilisation des contrats API ;
- la certification de l’isolation des tenants ;
- l’application des permissions plugin ;
- la disponibilité de l’observabilité plugin ;
- la preuve de désactivation et de rollback.

## Stratégie Studio

NOVA Studio est la future surface d’authoring pour :

- templates de Programmes ;
- templates de missions ;
- définitions d’agents ;
- politiques de workflow ;
- manifests de plugins ;
- packs d’évaluation ;
- playbooks de certification.

Studio doit suivre les pilotes réussis. Il ne doit pas bloquer la première version commerciale.

## Developer Platform

La Developer Platform doit inclure :

- REST API ;
- contrats d’événements ;
- SDK ;
- CLI ;
- schéma de manifest plugin ;
- sandbox ;
- test harness ;
- exemples ;
- checklist de certification ;
- documentation de gouvernance.

Le périmètre initial de la Developer Platform doit être interne et réservé aux design partners.

## Packaging Produit

| Package | Cible | Inclus |
| --- | --- | --- |
| Pilot | Design partners | Mission Ops, setup guidé, une intégration, agents limités |
| Team | Petites équipes d’exécution | Cycle de vie mission, agents, décisions, preuves, contrôles de coût LLM |
| Enterprise | Organisations régulées | SSO, tenancy, audit, contrôles de déploiement, rapports de gouvernance |
| Platform | Intégrateurs et équipes produit | API, SDK, registre de plugins, templates |
| Sector Pack | Acheteurs métier | VEEDDA, future LifeHub et templates verticaux |

## Décision de Stratégie Produit

NOVA doit entrer sur le marché comme une console d’exécution IA gouvernée, puis s’étendre vers la plateforme, la couche cognitive, les intégrations, le studio et la marketplace. Cela préserve la vision de portefeuille de long terme tout en maximisant le time to market et la probabilité de revenu à court terme.
