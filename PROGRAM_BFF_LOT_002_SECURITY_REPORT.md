# PROGRAM-BFF-LOT-002 — RAPPORT DE SÉCURITÉ

Date : `2026-07-28`  
Périmètre : session et identité du NOVA Secure BFF

## Synthèse

Les contrôles de session et d’identité demandés sont actifs et testés. Les
frontières de sécurité du lot 001 sont conservées. Le store mémoire reste une
limitation explicitement déclarée et ferme le readiness de production.

## Identifiants

- dérivation par `crypto.scrypt` Node.js, sans package ni primitive maison ;
- sels et hashes uniquement, aucun stockage de mot de passe en clair ;
- comparaison par `timingSafeEqual` ;
- chemin cryptographique de même nature pour utilisateur inconnu et mot de
  passe incorrect ;
- réponse HTTP générique identique pour ces deux cas ;
- statuts `DISABLED` et `LOCKED` refusés avec message générique ;
- aucun username ni mot de passe écrit dans les événements d’échec ;
- limitation locale : 5 tentatives par paire adresse/username sur 60 secondes
  par défaut.

## Fixation, rotation, expiration et révocation

- une session anonyme et une preuve CSRF valides sont exigées avant login ;
- le login effectue une rotation atomique de l’identifiant et du binding CSRF ;
- l’ancien identifiant anonyme est supprimé ;
- un changement de niveau d’autorisation force aussi une rotation ;
- la rotation périodique renouvelle identifiant et binding CSRF ;
- l’expiration inactive et l’expiration absolue sont évaluées côté serveur ;
- chaque renouvellement utilise un contrôle optimiste `sessionVersion` ;
- le logout révoque, supprime la session active et conserve un tombstone
  minimal temporaire pour rendre un replay identique idempotent ;
- les sessions expirées, révoquées et les anciens cookies ne sont pas réutilisés.

## CSRF

Toutes les mutations conservent :

- rejet `Sec-Fetch-Site: cross-site` ;
- contrôle d’Origin lorsqu’il est présent ;
- session serveur préalable ;
- comparaison timing-safe du token ;
- binding renouvelé lors de toute rotation.

Le double logout avec l’ancien couple cookie/token est accepté uniquement si le
tombstone serveur prouve qu’il s’agit exactement de la session déjà révoquée.

## Contrat public

Les réponses de login et de lecture authentifiée ne contiennent que :

```text
authenticated
user.userId
user.username
user.displayName
user.roles
session.authenticatedAt
session.expiresAt
```

Les réponses anonymes et de logout contiennent uniquement
`{"authenticated":false}`.

Les tests interdisent notamment :

```text
sessionId
password
passwordHash
salt
csrfBinding
secret
attestationKey
```

## Cookie

Attributs testés :

```text
__Host-
HttpOnly
Secure
SameSite=Strict
Path=/
aucun Domain
```

Le logout remplace le cookie par un cookie vide avec `Max-Age=0`. La rotation
remplace l’ancien cookie dans le header au lieu d’émettre deux valeurs
concurrentes.

## Validation et erreurs

- objet JSON obligatoire pour login ;
- clés exactement `username` et `password` ;
- champs inattendus refusés ;
- types et longueurs bornés ;
- limite de taille appliquée avant et pendant le streaming ;
- messages d’authentification génériques ;
- erreurs inattendues converties en `500 INTERNAL_ERROR` sans stack ni détail ;
- Correlation ID présent dans les headers et erreurs ;
- logger limité aux métadonnées non sensibles.

## Readiness

Le readiness contrôle :

- disponibilité du provider d’identité ;
- disponibilité du store ;
- sonde réelle création/relecture/suppression ;
- configuration HTTPS/proxy ;
- durabilité requise en production.

Valeur réelle du store livré : `ready_non_durable` hors production. En
production, `productionDurability` devient `not_ready` avec le store mémoire.

## Frontières et non-régression

Périmètre protégé :

- `apps/nova-web` ;
- `server/runtime` ;
- `program-production-entrypoint.ts` ;
- `human-approval-workflow.ts` ;
- `certified-integration-service.ts` ;
- `mission-evidence-certifier.ts`.

```text
PROTECTED_FILE_COUNT: 281
FINGERPRINT_BEFORE: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_AFTER: 98d0cd82a16a9170da5e414edf65df4da809934c5f1a7062598e935b65efe06b
FINGERPRINT_UNCHANGED: YES
PACKAGE_ADDED: NO
LOCKFILE_MODIFIED: NO
FRONTEND_MODIFIED: NO
RUNTIME_MODIFIED: NO
PROGRAM_PRODUCTION_ENTRYPOINT_MODIFIED: NO
HUMAN_APPROVAL_MODIFIED: NO
EVIDENCE_MODIFIED: NO
CERTIFICATION_MODIFIED: NO
KERNEL_MODIFIED: NO
COMMIT: NO
PUSH: NO
```

SHA-256 `package-lock.json` avant/après :
`c852dc778948bd2720ada07634dc4ffc245f3803c5ffe2e2fc48da829a36891f`.

Résultat sécurité : `PASS`
