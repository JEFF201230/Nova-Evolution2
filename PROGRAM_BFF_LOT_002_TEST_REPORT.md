# PROGRAM-BFF-LOT-002 — RAPPORT DE TESTS

Date : `2026-07-28`

## Résumé

| Groupe | Résultat |
|---|---:|
| compilation BFF | PASS |
| lint BFF strict | PASS |
| typecheck NOVA Core | PASS |
| tests BFF | 35/35 PASS |
| tests Kernel | 8/8 PASS |
| tests Runtime | 15/15 PASS |
| tests NOVA Core | 503/503 PASS |
| total | 561/561 PASS |
| smoke serveur réel | PASS |

## Commandes

```text
npm.cmd run build:bff
npm.cmd run lint:bff
npm.cmd run test:bff
npm.cmd run typecheck:nova-core
npm.cmd run test:kernel:bootstrap
npm.cmd run test:runtime
npm.cmd run test:core
node --import tsx server/nova-bff/nova-bff.server.ts
```

## Couverture fonctionnelle du lot 002

PASS :

- login valide ;
- mauvais mot de passe ;
- utilisateur inconnu ;
- réponse générique identique utilisateur inconnu/mauvais mot de passe ;
- utilisateur désactivé ;
- utilisateur verrouillé ;
- JSON invalide ;
- champ inattendu ;
- mot de passe absent ;
- rotation après login ;
- rotation après changement de niveau d’autorisation ;
- lecture de session authentifiée ;
- lecture de session anonyme ;
- logout ;
- double logout ;
- session expirée par inactivité/limite absolue ;
- session révoquée ;
- ancien cookie après rotation ;
- ancien cookie après logout ;
- limitation des tentatives.

## Couverture sécurité

PASS :

- cookie `__Host-` ;
- `HttpOnly` ;
- `Secure` ;
- `SameSite=Strict` ;
- `Path=/` ;
- absence de `Domain` ;
- CSRF refusé et CSRF valide ;
- absence du mot de passe, cookie et token CSRF dans les logs ;
- absence de sessionId et autres secrets internes dans les réponses ;
- limitation de taille JSON ;
- Correlation ID ;
- erreur interne redigée ;
- readiness fail-closed sans identité ;
- readiness fail-closed si le store est indisponible ;
- frontière de six routes uniquement ;
- absence d’import/appel Runtime, React, Codex ou domaine certifié.

## Smoke du serveur réel

Le véritable point d’entrée a été démarré dans un processus Node masqué avec :

```text
node --import tsx server/nova-bff/nova-bff.server.ts
```

Une identité éphémère avec hash `scrypt` a été injectée par environnement. Le
smoke a vérifié :

```text
SMOKE_REAL_SERVER=PASS
HEALTH=PASS
READINESS=PASS
VERSION_CAPABILITY=PASS
ANONYMOUS_SESSION=PASS
LOGIN=PASS
SESSION_READ=PASS
LOGOUT=PASS
DOUBLE_LOGOUT=PASS
STALE_COOKIE=PASS
ROUTE_BOUNDARY=PASS
SERVER_LOG_REDACTION=PASS
```

Les fichiers de log temporaires ont été supprimés après contrôle. Aucun secret
ou fixture de smoke n’a été écrit dans le dépôt.

## Non-régression

Minimum historique :

```text
BFF: 22/22
Kernel: 8/8
Runtime: 15/15
NOVA Core: 503/503
Total: 548
```

Résultat lot 002 :

```text
BFF: 35/35
Kernel: 8/8
Runtime: 15/15
NOVA Core: 503/503
Total: 561/561
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
