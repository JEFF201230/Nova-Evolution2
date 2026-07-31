# PROGRAM-BFF-LOT-003 — RAPPORT DE TESTS

Date : `2026-07-28`

## Résumé

| Groupe | Résultat |
|---|---:|
| compilation BFF | PASS |
| lint BFF strict | PASS |
| typecheck NOVA Core | PASS |
| tests BFF | 44/44 PASS |
| tests Kernel | 8/8 PASS |
| tests Runtime | 15/15 PASS |
| tests NOVA Core | 503/503 PASS |
| total | 570/570 PASS |
| smoke serveur réel | PASS |

## Commandes exécutées

```text
npm.cmd run build:bff
npm.cmd run lint:bff
npm.cmd run test:bff
npm.cmd run typecheck:nova-core
npm.cmd run test:kernel:bootstrap
npm.cmd run test:runtime
npm.cmd run test:core
node --import tsx --input-type=module -
```

## Couverture Gateway

PASS :

- appel Gateway valide ;
- seul appel vers le port injecté de `ProgramProductionEntrypoint` ;
- mapping Request BFF vers Runtime ;
- copie profonde immuable de la Request ;
- mapping Response Runtime vers DTO BFF minimal ;
- cohérence mission/session ;
- certification `GO` obligatoire ;
- Correlation ID propagé dans le contexte d’appel ;
- contexte de corrélation nettoyé après l’appel ;
- timeout ;
- `AbortSignal` déclenché au timeout ;
- Runtime indisponible ;
- entrypoint désactivé ;
- erreur Runtime générique ;
- DTO invalides ;
- clés inattendues ;
- erreur HTTP 400 transformée ;
- erreur HTTP 403 transformée ;
- erreur HTTP 503 transformée ;
- erreur HTTP 504 transformée ;
- détails Runtime sensibles non propagés.

## Frontières

PASS :

- aucune nouvelle route ;
- `/runtime` retourne 404 au smoke ;
- aucun `fetch` Gateway ;
- aucun import `node:http` ou `node:https` Gateway ;
- aucun import Runtime direct ;
- aucun import React ;
- exactement un appel `entrypoint.execute`, dans l’adaptateur ;
- six routes historiques strictement inchangées.

## Smoke du serveur réel

Le véritable point d’entrée `startNovaBff` a été lancé sur un port loopback
éphémère avec la configuration réelle chargée par `loadBffConfig`.

```text
SMOKE_REAL_SERVER=PASS
HEALTH=200
VERSION=200
SESSION=200
READINESS_FAIL_CLOSED=503
RUNTIME_ROUTE=404
```

Le `503` readiness est le comportement attendu sans identité serveur configurée
et démontre le fail-closed. Le smoke a aussi vérifié le cookie de session,
le header CSRF et le Correlation ID.

## Non-régression

Référence lot 002 :

```text
BFF: 35/35
Kernel: 8/8
Runtime: 15/15
NOVA Core: 503/503
Total: 561/561
```

Résultat lot 003 :

```text
BFF: 44/44
Kernel: 8/8
Runtime: 15/15
NOVA Core: 503/503
Total: 570/570
Régression: 0
```

## Intégrité

```text
PROTECTED_FILE_COUNT: 281
FINGERPRINT_BEFORE: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_AFTER: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_UNCHANGED: YES
PACKAGE_LOCK_SHA256: c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f
PACKAGE_ADDED: NO
LOCKFILE_MODIFIED: NO
```

Résultat tests : `PASS`
