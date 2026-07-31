# PROGRAM-BFF-LOT-001 — RAPPORT D'IMPLÉMENTATION

Date : `2026-07-28`  
Lot : `SECURITY FOUNDATION`  
Service : `nova-secure-bff`

## Résultat

Le premier lot du NOVA Secure BFF est implémenté comme un service Node/TypeScript autonome sous `server/nova-bff`.

Il ne contient aucune route métier, aucun import du Runtime, aucun import de NOVA Core et aucun raccordement à React.

## Périmètre livré

### Serveur

- point d'entrée : `server/nova-bff/nova-bff.server.ts` ;
- application et pipeline middleware : `server/nova-bff/nova-bff.app.ts` ;
- serveur HTTP interne ou HTTPS direct selon configuration ;
- arrêt contrôlé sur `SIGINT` et `SIGTERM` ;
- scripts `start:bff`, `build:bff`, `lint:bff` et `test:bff`.

### Modules

| Module | Responsabilité |
|---|---|
| `bff.config.ts` | validation fail-closed de la configuration |
| `bff.session.ts` | sessions serveur, rotation, cookies et jetons CSRF |
| `bff.logger.ts` | logs JSON structurés |
| `bff.errors.ts` | erreurs stables et sûres |
| `bff.http.ts` | réponses JSON sans cache |
| `bff.types.ts` | contexte et composition des middlewares |
| `middleware/correlation-id.ts` | validation ou génération du Correlation ID |
| `middleware/security.ts` | HTTPS/proxy de confiance et headers de sécurité |
| `middleware/session.ts` | résolution de session serveur |
| `middleware/csrf.ts` | contrôle token, Origin et Fetch Metadata |
| `middleware/authentication.ts` | exigence d'une session authentifiée |
| `middleware/rbac.ts` | autorisation par rôle |
| `middleware/json-body.ts` | Content-Type, taille et objet JSON |
| `middleware/request-logger.ts` | journal de fin de requête |
| `middleware/error-handler.ts` | réponse d'erreur corrélée sans stack |

## Endpoints exposés

| Méthode | Route | Contrat |
|---|---|---|
| GET | `/health` | liveness `{status, service}` |
| GET | `/readiness` | session store, sécurité et configuration du proxy |
| GET | `/version` | version, commit et build time publics |
| GET | `/session` | état authentifié, principal public, jeton CSRF, expiration et corrélation |

Toute autre route renvoie `404 ROUTE_NOT_FOUND`.

Une méthode différente de GET sur une route technique renvoie `405 METHOD_NOT_ALLOWED`, après validation CSRF pour les méthodes mutantes.

## Sessions

- stockage serveur via l'interface asynchrone `SessionStore` ;
- implémentation LOT 001 : `InMemorySessionStore`, adaptée à une instance unique ;
- capacité bornée et purge des sessions expirées ;
- identifiant et jeton CSRF générés par `crypto.randomBytes(32)` ;
- expiration glissante configurable ;
- rotation de l'identifiant lors du passage à une identité authentifiée ;
- ancien identifiant supprimé du store ;
- l'identifiant de session n'est jamais retourné dans le JSON.

Le store est remplaçable sans changer les middlewares. Aucun store distribué n'est introduit dans ce lot.

## Cookies

Nom : `__Host-nova_session`

Attributs systématiques :

```text
Path=/
HttpOnly
Secure
SameSite=Strict
Max-Age=<durée de session>
```

Aucun attribut `Domain` n'est émis.

## HTTPS et proxy interne

Deux modes sont supportés :

1. TLS direct avec `BFF_TLS_KEY_FILE` et `BFF_TLS_CERT_FILE` ;
2. terminaison TLS par un reverse proxy explicitement approuvé avec `BFF_TRUST_PROXY=true`.

Le header `X-Forwarded-Proto` n'est accepté que si l'adresse réseau du proxy appartient à `BFF_TRUSTED_PROXY_ADDRESSES`.

En production :

- l'origine publique doit être HTTPS ;
- le serveur refuse de démarrer si HTTPS est exigé sans TLS direct ni proxy approuvé ;
- un origin Runtime en HTTP n'est accepté que sur loopback.

`BFF_RUNTIME_ORIGIN` est validé et conservé comme configuration interne. Aucune route ne l'utilise encore et aucun appel Runtime n'est effectué.

## Configuration

| Variable | Valeur par défaut | Contrôle |
|---|---|---|
| `BFF_ENV` | `development` | development/test/production |
| `BFF_HOST` | `127.0.0.1` | adresse d'écoute |
| `BFF_PORT` | `4200` | entier 0–65535 |
| `BFF_PUBLIC_ORIGIN` | `https://localhost:4200` | origin HTTP(S), HTTPS obligatoire en production |
| `BFF_RUNTIME_ORIGIN` | `http://127.0.0.1:4100` | HTTP loopback ou HTTPS |
| `BFF_REQUIRE_HTTPS` | true en production | booléen strict |
| `BFF_TRUST_PROXY` | false | booléen strict |
| `BFF_TRUSTED_PROXY_ADDRESSES` | loopback IPv4/IPv6 | liste exacte |
| `BFF_TLS_KEY_FILE` | absent | indissociable du certificat |
| `BFF_TLS_CERT_FILE` | absent | indissociable de la clé |
| `BFF_SESSION_TTL_MS` | 30 minutes | 1 minute à 24 heures |
| `BFF_MAX_SESSIONS` | 10 000 | capacité bornée |
| `BFF_MAX_JSON_BODY_BYTES` | 65 536 | 1 024 à 1 000 000 |
| `BFF_VERSION` | `0.1.0` | valeur publique filtrée |
| `BFF_COMMIT` | `development` | valeur publique filtrée |
| `BFF_BUILD_TIME` | null | ISO-8601 |

## Scripts

```text
npm run start:bff
npm run build:bff
npm run lint:bff
npm run test:bff
```

La compilation est volontairement `noEmit` : le lot valide TypeScript sans laisser d'artefact généré dans le dépôt.

## Frontières respectées

- `apps/nova-web` : non modifié et non importé ;
- `server/runtime` : non modifié et non importé ;
- `ProgramProductionEntrypoint` : non modifié et non importé ;
- Human Approval : non modifié et non importé ;
- Evidence : non modifié et non importé ;
- Certification : non modifié et non importé ;
- `package-lock.json` : inchangé ;
- package ajouté : aucun ;
- route métier : aucune.

## Empreinte

Le périmètre `package.json`, `tsconfig.nova-bff.json` et `server/nova-bff/**` contient 24 fichiers.

SHA-256 du manifeste trié `chemin + SHA-256 du contenu` :

`488cf1ea8086a1efae69bbe929d6673f31a63f72757795a14576dbfad89d78d9`

Résultat d'implémentation : `PASS`
