# PROGRAM-BFF-LOT-001 — RAPPORT DE SÉCURITÉ

Date : `2026-07-28`  
Périmètre : fondations du NOVA Secure BFF

## Synthèse

Les contrôles de sécurité prévus par le lot sont présents, actifs et testés. Ils sont indépendants du Runtime et précèdent toute future route métier.

## Matrice des contrôles

| Contrôle | Implémentation | Preuve |
|---|---|---|
| HTTPS | TLS direct ou proxy HTTPS local approuvé ; fail-closed en production | tests configuration et transport |
| session serveur | interface `SessionStore`, store mémoire borné, expiration | tests `/session` et rotation |
| cookie HttpOnly | attribut systématique | test du header `Set-Cookie` |
| cookie Secure | attribut systématique | test du header et smoke test |
| SameSite Strict | attribut systématique | test du header |
| cookie `__Host-` | nom imposé, Path `/`, aucun Domain | test du header |
| fixation de session | rotation après authentification, suppression de l'ancien ID | test dédié |
| CSRF token | token aléatoire lié à la session et comparaison timing-safe | tests missing/invalid/valid |
| CSRF Origin | rejet d'une origine différente | test wrong-origin |
| Fetch Metadata | rejet explicite `Sec-Fetch-Site: cross-site` | test cross-site |
| authentification | middleware refusant toute session sans principal | test unitaire |
| RBAC | rôles bornés et middleware `requireAnyRole` | tests allow/deny |
| Correlation ID | valeur entrante filtrée ou UUID généré | tests valid/invalid |
| logs | JSON structuré, méthode, path sans query, statut, durée, corrélation | tests de journalisation |
| erreurs | code stable, message sûr, corrélation ; aucune stack | tests HTTP |
| JSON | type MIME, limite de taille, parsing, objet obligatoire | tests middleware |
| headers | CSP, COOP, CORP, Permissions-Policy, Referrer-Policy, nosniff, DENY, HSTS si HTTPS | tests HTTP/HTTPS |
| cache | `Cache-Control: no-store` | test endpoint |
| frontière Runtime | aucun import ni appel réseau | test de frontière et routes |

## Authentification

Le lot ne crée volontairement aucun endpoint de login.

Le mécanisme prêt pour le prochain lot est :

1. une session anonyme est créée par `/session` ;
2. un futur adaptateur d'identité vérifie l'utilisateur côté serveur ;
3. `SessionManager.createAuthenticated(...)` remplace la session anonyme ;
4. le nouvel ID est émis dans un cookie sécurisé ;
5. l'ancien ID est supprimé ;
6. les middlewares d'authentification et RBAC contrôlent les futures routes.

Rôles BFF disponibles :

- `OBSERVER` ;
- `OPERATOR` ;
- `APPROVER` ;
- `CERTIFIER` ;
- `ADMIN`.

Aucun de ces rôles n'est relié au Runtime dans ce lot.

## CSRF

Les méthodes GET, HEAD et OPTIONS sont considérées sûres.

Pour toute autre méthode, le pipeline exige :

- absence de contexte `cross-site` ;
- `Origin` égal à `BFF_PUBLIC_ORIGIN` lorsqu'il est présent ;
- session serveur existante ;
- `X-CSRF-Token` identique au token de session.

Le token CSRF est fourni dans la réponse JSON de `/session`. Le cookie de session reste illisible par JavaScript.

## Journalisation

Chaque requête terminée produit un enregistrement JSON avec :

- timestamp ;
- niveau ;
- service ;
- event ;
- Correlation ID ;
- méthode ;
- chemin sans query string ;
- statut HTTP ;
- durée ;
- état authentifié booléen.

Les headers `Cookie`, `Authorization`, le jeton CSRF, l'identifiant de session et le corps JSON ne sont jamais journalisés.

Les erreurs ajoutent uniquement code, statut et corrélation. La stack et les détails internes ne sont pas renvoyés.

## JSON

- corps maximum configurable ;
- rejet anticipé via `Content-Length` ;
- limite également contrôlée pendant le streaming ;
- `Content-Type: application/json` obligatoire en présence d'un corps ;
- JSON invalide rejeté ;
- tableaux, primitives et null rejetés ;
- aucun endpoint actuel ne consomme un corps métier.

## Frontière réseau

Le BFF ne contient aucun `fetch`, aucun client HTTP Runtime et aucune route proxy.

`BFF_RUNTIME_ORIGIN` :

- prépare la configuration du futur proxy interne ;
- refuse HTTP hors loopback ;
- n'est pas exposé par `/version` ou `/session` ;
- apparaît dans `/readiness` uniquement comme état générique `configured_not_connected`.

## Risques résiduels explicitement hors LOT 001

| Sujet | État |
|---|---|
| fournisseur d'identité | non connecté, conformément à l'absence de route login |
| store de session durable | différé ; interface prête, store mémoire pour instance unique |
| proxy métier Runtime | non implémenté |
| ProgramProductionEntrypoint | non importé |
| Human Approval | non importé |
| Evidence et Certification | non importés |
| rate limiting | non demandé dans ce lot |
| React | non connecté |

Ces absences ne créent pas de bypass : aucune route métier n'existe.

## Non-régression des domaines protégés

Empreinte avant et après le lot, sur 281 fichiers protégés :

`aba2419ba9d8964c70802b2cee67dd86f9bfb31de5f499eb8ecb704961d113b4`

Périmètre :

- `apps/nova-web` ;
- `server/runtime` ;
- `program-production-entrypoint.ts` ;
- `human-approval-workflow.ts` ;
- `certified-integration-service.ts` ;
- `mission-evidence-certifier.ts`.

Résultat sécurité : `PASS`
