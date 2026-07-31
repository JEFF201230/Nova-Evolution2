# NOVA SW-004 Runtime Report

**Mission :** NOVA Runtime Canonicalization  
**Date :** 2026-07-29  
**Mode :** Enterprise Architect / Zero Regression  
**Décision finale :** NO GO

## 1. Patrimoine exploité

La SW-004 utilise sans les recopier :

- le registre canonique, l'ownership et les statuts produits par la SW-003 ;
- les Rules existantes sous `Docs/05_RULES/` ;
- les architectures, index, rapports d'exécution et certifications des Programs ;
- la baseline certifiée NOVA v1.0.0 ;
- les README Runtime existants ;
- les tests et manifests de commande présents dans le dépôt.

## 2. Inventaire Runtime

| Mesure | Valeur |
|---|---:|
| Composants Runtime exécutables | 247 |
| Fichiers de tests/support identifiés | 170 |
| Domaines | 23 |
| Programs/périmètres | 15 |
| Dépendances internes | 594 |

## 3. Couvertures

| Couverture | Résultat |
|---|---:|
| Documentation canonique | 100,0 % |
| Domaine | 100,0 % |
| Propriétaire de gouvernance | 100,0 % |
| Rules | 100,0 % |
| Evidence | 100,0 % |
| Tests directs | 83,4 % |
| Certification | 100,0 % |
| Traçabilité complète | 83,4 % |

## 4. Composants orphelins

**0** composant(s) sans documentation canonique, domaine, propriétaire ou Rule.

La liste probante figure dans [NOVA_RUNTIME_COVERAGE_REPORT.md](NOVA_RUNTIME_COVERAGE_REPORT.md).

## 5. Dépendances non couvertes

- composants concernés : 0 ;
- références internes non résolues : 0 ;
- groupes cycliques détectés : 3.

Le détail figure dans [NOVA_RUNTIME_DEPENDENCY_GRAPH.md](NOVA_RUNTIME_DEPENDENCY_GRAPH.md).

## 6. Écarts de certification

- composants sans test direct identifié : 41 ;
- composants sans evidence directe ou de Program : 0 ;
- composants sans certification directe ou de Program : 0 ;
- composants partiellement tracés : 41.

Une preuve ou certification `PROGRAM` est conservée comme telle et n'est jamais présentée comme une certification fichier.

## 7. Risques

| Risque | Preuve | Impact |
|---|---|---|
| Couverture de test directe incomplète | 41 composants sans import de test ou paire exacte | empêche d'affirmer une traçabilité complète |
| Certification agrégée | des liens de niveau Program peuvent remplacer une citation de fichier | niveau de certification composant non prouvé |
| Analyse statique | imports dynamiques construits et interactions externes non observables | dépendances d'exécution possibles hors graphe |
| Ownership technique | le dépôt ne déclare pas un owner de code pour chaque fichier | le registre gouverne la traçabilité, pas l'autorité technique |

## 8. Régressions

| Contrôle | Résultat |
|---|---|
| Runtime modifié par SW-004 | 0 fichier |
| Program modifié par SW-004 | 0 fichier |
| Module modifié par SW-004 | 0 fichier |
| Agent modifié par SW-004 | 0 fichier |
| Rule/Doctrine/Service/API/code métier modifié par SW-004 | 0 fichier |
| Fichiers créés | 5 registres/rapports autorisés sous `Docs/00_GOVERNANCE/` |

## 9. Livrables

1. [NOVA_RUNTIME_REGISTRY.md](NOVA_RUNTIME_REGISTRY.md)
2. [NOVA_RUNTIME_TRACEABILITY_MATRIX.md](NOVA_RUNTIME_TRACEABILITY_MATRIX.md)
3. [NOVA_RUNTIME_DEPENDENCY_GRAPH.md](NOVA_RUNTIME_DEPENDENCY_GRAPH.md)
4. [NOVA_RUNTIME_COVERAGE_REPORT.md](NOVA_RUNTIME_COVERAGE_REPORT.md)
5. [NOVA_SW004_RUNTIME_REPORT.md](NOVA_SW004_RUNTIME_REPORT.md)

## 10. Décision GO / NO GO

Les critères demandent une documentation canonique, un domaine et une traçabilité complète pour chaque composant, sans orphelin ni dépendance non couverte.

- documentation canonique complète : PASS ;
- domaine complet : PASS ;
- traçabilité complète : FAIL ;
- aucun composant orphelin : PASS ;
- aucune dépendance interne non résolue : PASS ;
- aucun code source modifié par la mission : PASS.

**NO GO**

Cette décision ne déprécie, ne remplace et ne modifie aucun composant ou document source. Elle constate uniquement le niveau de traçabilité prouvé au moment du scan.
