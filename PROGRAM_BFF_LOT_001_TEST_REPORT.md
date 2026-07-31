# PROGRAM-BFF-LOT-001 — RAPPORT DE TESTS

Date : `2026-07-28`  
Node : `v24.16.0`  
npm : `11.13.0`  
TypeScript : `5.9.3`

## Résumé

| Groupe | Résultat |
|---|---|
| compilation BFF | PASS |
| lint statique BFF | PASS |
| tests BFF | 22/22 PASS |
| typecheck NOVA Core | PASS |
| Kernel | 8/8 PASS |
| Runtime | 15/15 PASS |
| NOVA Core | 503/503 PASS |
| smoke `start:bff` | PASS |
| total des tests exécutés | 548 PASS, 0 FAIL |

## Commandes et résultats

### Compilation

```text
npm.cmd run build:bff
```

Résultat : PASS.  
Commande effective : `tsc -p tsconfig.nova-bff.json`.

### Lint

```text
npm.cmd run lint:bff
```

Résultat : PASS.

Le dépôt ne contient pas ESLint et aucun package n'a été ajouté. Le lint du lot repose sur le compilateur TypeScript strict avec :

- `noUnusedLocals` ;
- `noUnusedParameters` ;
- `noFallthroughCasesInSwitch` ;
- `noUncheckedIndexedAccess` ;
- `strict`.

### Tests BFF

```text
npm.cmd run test:bff
```

Résultat : 22 PASS, 0 FAIL.

Couverture fonctionnelle :

- dépendances interdites et frontière des modules ;
- quatre routes autorisées seulement ;
- démarrage du module serveur ;
- health ;
- readiness ;
- readiness fail-closed lorsque le session store est indisponible ;
- version ;
- session ;
- cookies ;
- absence de route métier ;
- méthode non autorisée ;
- authentification ;
- RBAC ;
- validation JSON ;
- limite de corps ;
- configuration de production fail-closed ;
- proxy HTTPS de confiance ;
- origin Runtime interne ;
- HTTPS obligatoire ;
- CSRF token, Origin et Fetch Metadata ;
- rotation de session ;
- Correlation ID.

### Non-régression

```text
npm.cmd run typecheck:nova-core
npm.cmd run test:kernel:bootstrap
npm.cmd run test:runtime
npm.cmd run test:core
```

Résultats :

- typecheck NOVA Core : PASS ;
- Kernel : 8 PASS ;
- Runtime : 15 PASS ;
- NOVA Core : 503 PASS.

## Smoke test réel

Le script réel a été lancé dans un processus masqué :

```text
node --import tsx server/nova-bff/nova-bff.server.ts
```

Résultat final :

```text
HEALTH=ok
READINESS=ready
VERSION_SERVICE=nova-secure-bff
SESSION_STATUS=200
SESSION_COOKIE_SECURE=True
```

Le processus a été arrêté à la fin du contrôle.

Deux essais préliminaires de collecte du header `Set-Cookie` n'ont pas produit de verdict produit à cause du client PowerShell local (`Invoke-WebRequest`, puis assembly `System.Net.Http` non chargé). Le harnais final a explicitement chargé l'assembly et a passé tous les contrôles. Aucun fichier n'a été créé par ces essais.

## Vérification des endpoints

| Test | Statut attendu | Résultat |
|---|---:|---|
| GET `/health` | 200 | PASS |
| GET `/readiness` | 200 | PASS |
| GET `/version` | 200 | PASS |
| GET `/session` | 200 | PASS |
| POST `/health` avec session et CSRF valides | 405 | PASS |
| GET `/api/v1/missions` | 404 | PASS |
| GET `/api/v2/missions` | 404 | PASS |
| POST `/api/v2/missions` avec session et CSRF valides | 404 | PASS |
| GET `/runtime` | 404 | PASS |
| GET `/execute` | 404 | PASS |

## Vérification des cookies

Attributs observés et testés :

- nom `__Host-nova_session` ;
- `Path=/` ;
- `HttpOnly` ;
- `Secure` ;
- `SameSite=Strict` ;
- `Max-Age` ;
- aucune directive `Domain`.

La rotation après authentification invalide l'ancien ID et émet un nouveau cookie.

## Vérification de l'intégrité du périmètre

### Lot BFF

- fichiers : 24 ;
- empreinte : `488cf1ea8086a1efae69bbe929d6673f31a63f72757795a14576dbfad89d78d9`.

### Zones interdites

- fichiers : 281 ;
- empreinte avant : `aba2419ba9d8964c70802b2cee67dd86f9bfb31de5f499eb8ecb704961d113b4` ;
- empreinte après : `aba2419ba9d8964c70802b2cee67dd86f9bfb31de5f499eb8ecb704961d113b4`.

### Dépendances

- `package-lock.json` inchangé ;
- SHA-256 : `c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f` ;
- package ajouté : 0.

Résultat tests : `PASS`
