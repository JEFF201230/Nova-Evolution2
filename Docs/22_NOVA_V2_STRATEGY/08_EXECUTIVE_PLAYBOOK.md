# Guide Exécutif NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Ce guide définit la manière dont NOVA gouverne l’auto-évolution, les recommandations automatiques de Programmes, la priorisation, l’orchestration, l’escalade, l’optimisation du portefeuille et les politiques de décision.

## Directive Principale

NOVA doit maximiser le time to market, le ROI, la valeur client, l’adoption entreprise et la maintenabilité sans violer les socles v1.0.0 certifiés ni l’autorité de gouvernance.

## Modèle d’Autorité

| Autorité | Peut décider | Ne peut pas décider |
| --- | --- | --- |
| Program Board | Approbation, activation, clôture des Programs, autorité de roadmap | Sauter les preuves ou la certification |
| Executive AI | Recommandations, options, analyse de risque | Approbation finale |
| Planner AI | Séquence proposée et plan de capacité | Activation d’un Program |
| Architect AI | Recommandation de conformité de frontière | Arbitrage business seul |
| Product Owner | Scope produit et valeur client | Changements seuls du socle certifié |
| Security/Compliance | Gate sécurité et politique de données | Priorité roadmap seule |
| Certification | État de preuves GO/NO GO | Création de nouveau scope |

## Création Automatique de Programmes

NOVA peut rédiger automatiquement une proposition de Program lorsqu’un des cas suivants apparaît :

- un blocage répété apparaît sur au moins trois missions ;
- la demande client correspond à un écart produit stratégique ;
- le Risk Engine identifie un problème systémique ;
- le KPI Engine détecte une dégradation persistante de delivery ;
- un socle certifié doit être étendu de manière contrôlée ;
- la demande marketplace ou intégration dépasse la capacité actuelle.

Les propositions automatiques doivent inclure :

- objectif ;
- scope ;
- scope exclu ;
- dépendances ;
- valeur business ;
- valeur technique ;
- valeur entreprise ;
- risque ;
- coût estimé ;
- revenu attendu ;
- durée ;
- confiance ;
- autorité requise ;
- contrôle de contradiction.

La création automatique signifie la création de proposition uniquement. L’activation reste de la compétence du Program Board jusqu’à ce qu’une autonomie à faible risque de niveau V3.0 soit certifiée séparément.

## Priorisation Automatique

Score de priorité :

```text
Priority =
  0.20 Business Value
+ 0.15 Customer Value
+ 0.15 Time To Market
+ 0.10 ROI
+ 0.10 Enterprise Value
+ 0.10 Priorité stratégique
+ 0.08 Technical Value
+ 0.05 Revenue Potential
+ 0.04 Dependency Unlock
+ 0.03 Confidence
- 0.10 Complexity
- 0.10 Risk
- 0.05 Implementation Cost
```

Overrides durs :

- les risques de sécurité, de légalité ou d’intégrité des données priment sur la croissance ;
- les violations du socle certifié arrêtent l’exécution ;
- les engagements de revenu face au client priment sur l’autonomie spéculative ;
- les décisions du Program Board priment sur les recommandations du modèle.

## Orchestration Automatique

NOVA peut orchestrer automatiquement le travail uniquement dans des bornes approuvées.

Autorisé avant V3.0 :

- suggérer la décomposition des missions ;
- assigner des agents approuvés lorsque la politique le permet ;
- détecter les conflits de lock ;
- router les tâches de validation ;
- générer des rapports ;
- mettre à jour les dashboards ;
- recommander un replan.

Interdit avant V3.0 :

- activer des Programs ;
- modifier le Kernel ou le Runtime certifiés ;
- approuver des releases ayant un impact client ;
- exécuter des opérations de données client irréversibles ;
- contourner les gates de décision humaine.

## Escalade Automatique

L’escalade est déclenchée par :

- l’absence d’autorité ;
- l’ambiguïté du scope ;
- le dépassement du plafond de coût ;
- un risque de sévérité high ou critical ;
- des documents source contradictoires ;
- une contradiction dans la sortie d’un agent ;
- un échec de gate de certification ;
- un échec répété de mission ;
- un conflit d’exécution parallèle ;
- un risque d’engagement client.

Package d’escalade :

- problème ;
- scope impacté ;
- preuves ;
- options ;
- recommandation ;
- décision requise ;
- délai ;
- action de rollback ou de confinement.

## Optimisation du Portefeuille

L’optimisation du portefeuille équilibre :

- le revenu le plus rapide ;
- la réutilisabilité plateforme ;
- la préparation entreprise ;
- la réduction du risque ;
- la preuve client ;
- le moat cognitif de long terme.

Règles d’optimisation :

- financer la trajectoire commerciale P0 avant la marketplace P2 ou l’auto-évolution P3 ;
- préférer le travail plateforme réutilisable aux personnalisations client ponctuelles ;
- n’accepter un service tactique que s’il accélère l’apprentissage produit ;
- mesurer chaque Program par la valeur client et la preuve d’adoption ;
- geler les travaux cognitifs spéculatifs si la conversion des pilotes est faible.

## Politiques de Décision

| Type de décision | Preuve requise | Autorité |
| --- | --- | --- |
| Création de Program | Proposition, valeur, risque, dépendances | Program Board |
| Activation de mission | Ordre de mission, scope, autorité, livrables | Gouvernance de mission |
| Affectation d’agent | Capacité, scope autorisé, disponibilité | Scheduler/Resource Manager |
| Release GO | Tests, certification, risque, points connus | Autorité de release |
| Mise à jour de modèle | Évaluation, coût, qualité, sécurité | Gouvernance IA |
| Approbation de plugin | Manifest, permissions, tests, observabilité | Certification plugin |
| Déploiement client | Sécurité, tenancy, support, contrat | Enterprise release board |
| Auto-évolution | Politique, enveloppe à faible risque, rollback | Program Board |

## Gouvernance

Règles de gouvernance :

1. Pas d’exécution cachée.
2. Pas d’autorité par inférence de modèle.
3. Pas d’autonomie d’agent non bornée.
4. Pas de changement du socle certifié sans Program explicite.
5. Pas d’usage de données client hors contrat.
6. Pas de release sans preuves.
7. Pas de plugin marketplace sans certification.
8. Pas d’auto-évolution sans politique et rollback.

## Décision du Guide Exécutif

NOVA doit utiliser l’IA pour recommander, rédiger, prioriser et orchestrer, mais pas pour contourner la gouvernance. La trajectoire commerciale favorise aujourd’hui une autonomie guidée et plus tard une auto-évolution bornée.
