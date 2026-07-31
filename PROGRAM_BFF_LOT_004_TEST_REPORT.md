# PROGRAM-BFF-LOT-004 — TEST_REPORT

Date : `2026-07-28`

## Résumé

| Contrôle | Résultat |
|---|---:|
| compilation BFF | PASS |
| lint TypeScript strict | PASS |
| tests ciblés route/Gateway/frontière | 21/21 PASS |
| suite BFF complète | 54/54 PASS |
| régression BFF/Gateway | aucune |
| fingerprint protégé | identique |

## Commandes

```text
npm.cmd run build:bff
npm.cmd run lint:bff
node --import tsx --test server/nova-bff/runtime-execute.route.test.ts server/nova-bff/runtime-gateway.test.ts server/nova-bff/nova-bff.boundary.test.ts
npm.cmd run test:bff
```

Toutes les commandes se terminent avec le code `0`.

## Tests obligatoires

| Exigence | Preuve | Résultat |
|---|---|---:|
| succès avec session valide | login LOT 002, CSRF valide, Gateway appelé une fois | PASS |
| absence de session | réponse 401 avant CSRF | PASS |
| CSRF invalide | réponse 403, Gateway non appelé | PASS |
| operation absente | réponse 400 | PASS |
| operation vide | réponse 400 | PASS |
| payload absent | réponse 400 | PASS |
| payload non objet | null et tableau rejetés en 400 | PASS |
| génération correlationId | UUID généré, propagé au Gateway/header/body | PASS |
| propagation correlationId | valeur fournie conservée partout | PASS |
| timeout Runtime | 504 `RUNTIME_TIMEOUT` | PASS |
| erreur Runtime contrôlée | 502 `RUNTIME_ERROR` | PASS |
| erreur interne | 500 `INTERNAL_ERROR` | PASS |
| absence de fuite | corps, stack, payload, logs et détails privés contrôlés | PASS |
| aucune route imprévue | inventaire 7 routes, route inconnue 404 | PASS |

## Tests supplémentaires

- JSON syntaxiquement invalide ;
- champs top-level inconnus ;
- champs payload inconnus ;
- opération inconnue en 422 ;
- méthode GET refusée sur la route POST ;
- projection stricte sans transmission de `operation` ;
- frontières d'import ;
- seul `RuntimeGatewayAdapter` appelle `entrypoint.execute` ;
- absence de transport HTTP direct dans le Gateway ;
- non-régression de toutes les suites BFF LOT 001 à 003.

## Matrice de statuts observée

| Cas | Attendu | Observé |
|---|---:|---:|
| succès | 200 | 200 |
| JSON/contrat invalide | 400 | 400 |
| session absente | 401 | 401 |
| CSRF invalide | 403 | 403 |
| opération inconnue | 422 | 422 |
| Runtime contrôlé | 502 | 502 |
| timeout | 504 | 504 |
| inattendu | 500 | 500 |

## Limite de la régression

Conformément au périmètre de lecture imposé, la wave n'a exécuté que la
compilation et les tests du module BFF, y compris les tests Gateway LOT 003.
Elle n'a pas ouvert ni exécuté les suites du Runtime métier ou de React.

La non-régression hors BFF est couverte par l'absence d'écriture hors
périmètre et par les empreintes inchangées des fichiers autorisés protégés.

## Empreintes

```text
LOT004_PROTECTED_BFF_FILES=27
LOT004_PROTECTED_BFF_SHA256=333290c3a58098565c3a847cddffe8aa4d038b0c8da00c4755651d32c6a394c7
PACKAGE_LOCK_SHA256=c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f
PACKAGE_JSON_SHA256=2ad7119183c177633d958aa53c112c55eb8f2b395cd83e1c4d8984e2874443ee
TSCONFIG_BFF_SHA256=65c2b53045f3a4e209b908fd02d401413abce89b5bd37c50ecba89b0173c49c6
```

Les valeurs protégées sont identiques avant et après le LOT 004.

Résultat tests : `PASS`
