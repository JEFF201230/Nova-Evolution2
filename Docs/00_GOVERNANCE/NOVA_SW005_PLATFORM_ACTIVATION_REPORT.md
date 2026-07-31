# NOVA SW-005 Platform Activation Report

**Mission :** Platform Activation  
**Date :** 2026-07-29  
**Mode :** Enterprise Architect / Zero Regression  
**Décision finale :** GO

## 1. Résultat

La chaîne Capability → Interface → BFF/API → Service → Engine → Runtime → Evidence → Certification est tracée pour 49 capabilities existantes. Les absences ne sont pas masquées : elles sont classées `STUB`, `PARTIAL`, `INTERNAL` ou `DEPRECATED`.

| Mesure | Valeur |
|---|---:|
| Capabilities | 49 |
| ACTIVE | 6 |
| IMPLEMENTED | 12 |
| PARTIAL | 1 |
| STUB | 14 |
| INTERNAL | 15 |
| DEPRECATED | 1 |
| Sans Interface | 29 |
| Interfaces sans Capability | 2, toutes justifiées |
| APIs sans Interface | 17 |
| Services sans Runtime | 15 |
| Activables immédiatement | 12 |

## 2. État d'activation

- NOVA Core possède la chaîne exécutable la plus complète : dashboard, API, Service, moteur, Runtime, preuves et certification.
- Le BFF Security/Session et ses probes sont exécutables, mais sans Interface React.
- Le BFF Runtime Execute est le raccordement le plus avancé mais non activé : route, contrat, gateway, mappers et entrypoint existent ; l'injection production manque.
- Le frontend React est une couche de surfaces testées alimentées exclusivement par fixtures.
- Les Programs 005 à 014 constituent une chaîne interne testée et certifiée, non hébergée par le Runtime opérationnel.

## 3. Plan d'activation priorisé

Ce plan ne crée aucune fonctionnalité ; il ordonne uniquement les raccordements d'éléments existants. Aucune étape n'est exécutée par SW-005.

| Priorité | Raccordement | Actifs existants | Condition de sortie |
|---|---|---|---|
| P0 | BFF Runtime Execute → Runtime production | `RuntimeExecuteCommand`, `RuntimeGateway`, `RuntimeGatewayAdapter`, `ProgramProductionEntrypoint`, `IntegrationPipeline` | `startNovaBff` fournit un gateway activé et le probe n'annonce plus `configured_not_connected` |
| P0 | Résoudre le point d'entrée de certification du dashboard | bouton `approve`, route `certify`, contrat d'attestation existant | aucune Interface n'appelle la route 410 |
| P1 | Consommer les APIs BFF Session depuis une Interface existante | routes `/session`, `/session/login`, `/session/logout` et shell React | session/CSRF utilisés sans nouveau contrat |
| P1 | Relier les surfaces de mission compatibles au point d'entrée existant | Work Setup, BFF Runtime Execute, API NOVA Core Mission | mapping de payload prouvé par un contrat existant ; sinon maintien `STUB` |
| P2 | Exposer les APIs NOVA Core déjà IMPLEMENTED dans les vues nécessaires | preflight, cancel, monitoring, certificate, certify, recovery | chaque activation réutilise l'API actuelle sans nouveau comportement |
| P3 | Décider l'hébergement des Programs 005 à 014 | chaîne interne Program certifiée | activation uniquement si un contrat Runtime existant est désigné ; sinon statut `INTERNAL` conservé |

## 4. Risques

| Risque | Impact |
|---|---|
| Confondre certification de composant et raccordement production | fausse déclaration d'activation |
| Brancher React sur des contrats incompatibles | création implicite de fonctionnalité interdite |
| Activer ProgramProductionEntrypoint sans dépendances durables | échec immédiat ou perte de traçabilité |
| Exposer les moteurs internes sans autorité Program | rupture des frontières existantes |

## 5. Régressions

| Contrôle | Résultat |
|---|---|
| Runtime modifié | 0 fichier |
| Code métier/API/Service modifié | 0 fichier |
| Program/Module/Agent/Rule/Doctrine modifié | 0 fichier |
| Fichiers créés | 5 artefacts autorisés sous `Docs/00_GOVERNANCE/` |

## 6. Livrables

1. [NOVA_CAPABILITY_REGISTRY.md](NOVA_CAPABILITY_REGISTRY.md)
2. [NOVA_PLATFORM_ACTIVATION_MATRIX.md](NOVA_PLATFORM_ACTIVATION_MATRIX.md)
3. [NOVA_INTERFACE_MAPPING.md](NOVA_INTERFACE_MAPPING.md)
4. [NOVA_PLATFORM_COVERAGE_REPORT.md](NOVA_PLATFORM_COVERAGE_REPORT.md)
5. [NOVA_SW005_PLATFORM_ACTIVATION_REPORT.md](NOVA_SW005_PLATFORM_ACTIVATION_REPORT.md)

## 7. Contrôle GO / NO GO

| Critère | Résultat |
|---|---|
| Chaque Capability reliée à un Runtime ou explicitement qualifiée | PASS |
| Chaque Interface associée ou justifiée | PASS |
| Aucun composant activable sans point d'entrée | PASS |
| Aucune modification du code métier | PASS |

**GO**

Le GO porte sur la complétude et l'exploitabilité du système d'activation. Il ne transforme pas les statuts `STUB`, `PARTIAL` ou `INTERNAL` en capabilities actives.
