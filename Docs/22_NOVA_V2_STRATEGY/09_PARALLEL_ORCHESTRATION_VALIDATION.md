# Validation de l’Orchestration Parallèle NOVA V2

## Statut du document

STRATÉGIE APPROUVÉE.

## Objet

Ce document définit la stratégie de validation qui prouve que NOVA peut faire fonctionner plusieurs Program Delivery Squads simultanément sans perdre la gouvernance, la traçabilité, le contrôle des ressources, les preuves ni la discipline de certification.

## Contrainte de Base

Le roadmap v1.0.0 du Program Board indique qu’un seul nouveau Program peut passer de PLANNED à ACTIVE après approbation explicite. NOVA v2 peut recommander et valider l’orchestration parallèle, mais l’activation parallèle réelle de Programs requiert une future décision du Program Board et une gouvernance de portefeuille mise à jour.

## Objectif de Validation

Prouver que NOVA peut gérer une delivery concurrente sur des Programs indépendants ou partiellement dépendants tout en préservant :

- l’autorité ;
- les locks de scope ;
- l’allocation des ressources ;
- le séquencement des dépendances ;
- l’escalade des risques ;
- la mesure des KPI ;
- les preuves et la certification ;
- la visibilité dashboard ;
- la résolution des conflits.

## Modèle d’Exploitation Parallèle

| Contrôle | Comportement requis |
| --- | --- |
| Program Board | Approuve quels Programs peuvent s’exécuter en parallèle |
| Scheduler | Sélectionne le travail éligible et respecte les dépendances |
| Resource Manager | Empêche le sur-engagement de capacité |
| Lock Manager | Empêche la mutation conflictuelle de scope |
| Risk Engine | Escalade les conflits inter-programmes |
| KPI Engine | Mesure le débit, la qualité, le délai et le risque |
| Dashboard | Affiche le portefeuille, le Program, la mission, le risque, les ressources et la certification |
| Certification | Confirme chaque Program indépendamment et en portefeuille intégré |

## Scénarios Réels

| Scénario | Description | Résultat attendu |
| --- | --- | --- |
| Tracks commerciaux indépendants | API/Persistence et LLM Gateway s’exécutent en parallèle | Aucun conflit de fichier ou de contrat ; rapports indépendants |
| UI dépend de l’API | Mission Ops UI démarre pendant que l’API se stabilise | Les prototypes en lecture seule sont autorisés ; les mutations attendent la certification API |
| Conflit de ressource partagé | Deux Programs demandent le même architect | Le Resource Manager priorise la chaîne critique commerciale P0 |
| Changement de contrat partagé | VEEDDA integration demande un changement API pendant la certification API | Le changement passe par une décision de contrat, pas par une mutation directe |
| Conflit de preuves runtime | L’Observatory détecte des événements manquants dans les rapports de mission | Le Risk Engine escalade et bloque la certification |
| Blocage pilote client | Le pilote révèle un manque de politique de données pendant la delivery UI | La gate sécurité prime sur la vitesse roadmap |
| Certification parallèle | Deux Programs terminent la même semaine | La certification valide chaque package et l’alignement intégré du dashboard |
| Replan d’urgence | Un défaut critique bloque la release Mission Ops | Le Scheduler replanifie les travaux de priorité inférieure et Executive AI propose des options |

## Stress Testing

Tests de stress :

- 3 Programs concurrents ;
- 10 missions concurrentes ;
- 30 affectations d’agents actives ;
- 1000 entrées de timeline d’événements ;
- locks conflictuels sur le même scope ;
- soumission de mission dupliquée ;
- dépendance obsolète ;
- rapport d’agent en échec ;
- panne du fournisseur de modèles ;
- dépassement du plafond de coût ;
- preuves de certification manquantes ;
- inversion d’une décision du Program Board.

Métriques de stress :

- aucune transition d’état non autorisée ;
- aucun lock conflict ignoré ;
- aucun package de preuves perdu ;
- aucune fuite de données entre tenants ;
- aucun GO de certification sans preuves requises ;
- aucune allocation de ressources au-dessus de la capacité approuvée ;
- aucun risque critique non signalé.

## Résolution des Conflits

Classes de conflits :

- conflit de scope ;
- conflit d’autorité ;
- conflit de dépendance ;
- conflit de ressources ;
- conflit de contrat ;
- conflit de certification ;
- conflit d’engagement client ;
- conflit de fournisseur de modèles ;
- conflit de coût.

Ordre de résolution :

1. Appliquer la règle active explicite.
2. Utiliser les preuves de lock et de dépendance.
3. Router vers l’autorité responsable.
4. Escalader au Program Board si la priorité du Program ou le socle certifié est affecté.
5. Geler le scope en conflit jusqu’à résolution.

## Synchronisation

Points de synchronisation :

- snapshot quotidien de santé des Programs ;
- revue hebdomadaire du Program Board ;
- revue de release gate ;
- revue des contrats partagés ;
- revue de préparation à la certification ;
- revue des risques et blocages ;
- réconciliation intégrée du dashboard.

Chaque synchronisation doit produire :

- un statut mis à jour ;
- les dépendances modifiées ;
- les conflits ouverts ;
- l’état des ressources ;
- le delta de risque ;
- les demandes de décision ;
- le prochain travail autorisé.

## Critères d’Acceptation

L’orchestration parallèle est valide lorsque :

1. chaque Program actif a une approbation du Board ;
2. chaque mission dispose d’autorité, de scope, de livrables et de critères d’acceptation ;
3. aucun lock en conflit n’est actif sans escalade ;
4. les ressources partagées sont allouées par politique ;
5. les dépendances sont visibles et appliquées ;
6. les risques inter-programmes sont classés et assignés ;
7. les preuves KPI couvrent le débit, la qualité, le risque et le délai ;
8. l’état du dashboard correspond aux preuves source ;
9. les certifications restent indépendantes et intégrées ;
10. aucun socle v1.0.0 certifié n’est modifié sans autorité.

## Stratégie de Certification

Niveaux de certification :

| Niveau | Scope |
| --- | --- |
| Mission Certification | Preuves de mission, tests et clôture individuels |
| Program Certification | Preuves, rapports et clôture du Program |
| Parallel Execution Certification | Locks, ressources, risques et synchronisation inter-programmes |
| Release Certification | État intégré de release et risque résiduel |
| Portfolio Certification | Alignement Program Board et état roadmap |

## Décision de Validation

NOVA v2 peut viser l’exécution parallèle de Program Delivery Squads après que le MVP commercial a prouvé l’industrialisation en flux unique. L’exécution parallèle doit être introduite via le PROGRAM-026, avec d’abord une simulation, ensuite une exécution interne contrôlée, puis une gouvernance parallèle côté client uniquement après certification.

