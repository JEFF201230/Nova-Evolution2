# PROGRAM-BFF-LOT-002 — RAPPORT D’IMPLÉMENTATION

Date : `2026-07-28`  
Lot : `SESSION AND IDENTITY`  
Service : `nova-secure-bff`

## Résultat

Le lot 002 complète le Secure BFF du lot 001 avec un fournisseur d’identité
local serveur, les routes de login/logout, la lecture de session authentifiée,
une politique de session centralisée et un RBAC limité aux rôles autorisés.

Aucun raccordement React, Runtime, Codex ou domaine métier n’a été ajouté.

## Prérequis

- `server/nova-bff/nova-bff.server.ts` : présent et opérationnel ;
- `server/nova-bff/nova-bff.app.ts` : présent et opérationnel ;
- quatre rapports du lot 001 : présents ;
- décision précédente : `BFF_LOT_001_READY`.

Commit observé avant et après mission :
`7db9658902adf0496a8f681afbfbd3f19d21d7cc`.

Le worktree contenait avant la mission de nombreuses modifications et créations
hors périmètre. Elles ont été conservées sans modification et enregistrées dans
l’empreinte initiale.

## Identité serveur

`bff.identity.ts` fournit :

- les seuls rôles `ADMIN`, `OPERATOR`, `APPROVER`, `VIEWER` ;
- les statuts `ACTIVE`, `DISABLED`, `LOCKED` ;
- le modèle minimal `UserIdentity` ;
- le port testable `IdentityProvider` ;
- l’implémentation remplaçable `LocalIdentityProvider` ;
- la désactivation et le verrouillage via `setStatus` ;
- une limitation locale des tentatives de login.

Les enregistrements locaux sont injectés par `BFF_LOCAL_IDENTITIES_JSON`.
Ils contiennent uniquement un sel et un hash `scrypt` encodés en base64url,
jamais un mot de passe en clair. L’absence d’identité configurée rend le
readiness négatif.

Les identités et mots de passe utilisés pour les tests sont confinés à
`bff.test-support.ts`. L’identité du smoke est générée en mémoire et injectée
par variable d’environnement ; elle n’est pas écrite dans le dépôt.

## Sessions serveur

`bff.session.ts` définit le port `SessionStore` avec :

- création et lecture ;
- renouvellement avec contrôle de version ;
- rotation atomique ;
- révocation ;
- suppression ;
- lecture des tombstones de révocation ;
- sonde de création/relecture/suppression ;
- déclaration explicite de durabilité.

`InMemorySessionStore` est explicitement `non_durable`. Il est borné,
mono-instance et remplaçable par une implémentation durable sans changement des
handlers HTTP. En production, le readiness refuse de déclarer READY tant que ce
store mémoire est utilisé.

La session authentifiée interne contient notamment :

```text
sessionId
userId
username
displayName
roles
authenticatedAt
lastActivityAt
expiresAt
csrfBinding
sessionVersion
```

Elle contient aussi les timestamps internes nécessaires à l’expiration absolue,
la rotation et la révocation. Ces champs internes ne sont jamais rendus dans le
JSON public.

## Politique centralisée

| Politique | Configuration | Défaut |
|---|---|---:|
| SESSION_IDLE_TIMEOUT | `BFF_SESSION_IDLE_TIMEOUT_MS` | 30 min |
| SESSION_ABSOLUTE_TIMEOUT | `BFF_SESSION_ABSOLUTE_TIMEOUT_MS` | 8 h |
| SESSION_ROTATION | `BFF_SESSION_ROTATION_MS` | 15 min |
| SESSION_REVOCATION | tombstone serveur + suppression active | active |
| SESSION_COOKIE_CLEAR | cookie expiré `Max-Age=0` | active |

`BFF_SESSION_TTL_MS` reste accepté comme alias de compatibilité pour le timeout
inactif du lot 001.

Le cookie reste :

```text
__Host-nova_session
Path=/
HttpOnly
Secure
SameSite=Strict
sans Domain
```

## Routes

Seules les routes suivantes existent :

```text
GET  /health
GET  /readiness
GET  /version
GET  /session
POST /session/login
POST /session/logout
```

`GET /session` place le jeton CSRF public dans le header `X-CSRF-Token` afin de
conserver les corps JSON stricts du contrat. Le `csrfBinding` interne n’est
jamais exposé.

## RBAC

La matrice interne ne contient que :

| Capacité | ADMIN | OPERATOR | APPROVER | VIEWER |
|---|---:|---:|---:|---:|
| SESSION_READ_SELF | OUI | OUI | OUI | OUI |
| SESSION_LOGIN | OUI | OUI | OUI | OUI |
| SESSION_LOGOUT | OUI | OUI | OUI | OUI |

Le middleware RBAC du lot 001 est réutilisé par `requireCapability`.

## Fichiers créés ou modifiés

Tous les changements d’implémentation et de test sont sous
`server/nova-bff/**` :

- création de `bff.identity.ts` pour le port/provider d’identité ;
- refonte de `bff.session.ts` pour la politique, la version, la rotation et la
  révocation ;
- extension de `bff.config.ts`, `bff.types.ts` et `nova-bff.app.ts` ;
- adaptation strictement nécessaire des middlewares session, CSRF,
  authentification, RBAC, JSON et journalisation ;
- adaptation des tests du lot 001 ;
- création de `nova-bff.session-identity.test.ts` pour les exigences du lot 002.

`package.json`, `package-lock.json`, les tsconfig, le frontend, le Runtime, le
Kernel et NOVA Core n’ont pas été modifiés par cette mission.

## Empreinte BFF

- fichiers sous `server/nova-bff` : `24` ;
- SHA-256 du manifeste trié `chemin + SHA-256 contenu` :
  `17127ad656db763bdd89c6786d60c835d1f989fa5cdecf0a7f2a2ad84c3fdec3`.

Résultat d’implémentation : `PASS`
