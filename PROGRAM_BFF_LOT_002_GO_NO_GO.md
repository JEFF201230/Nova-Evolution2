# PROGRAM-BFF-LOT-002 — DÉCISION GO / NO GO

Date : `2026-07-28`

## Matrice de décision

| Critère | Preuve | Résultat |
|---|---|---|
| lot 001 prêt | rapports présents, `BFF_LOT_001_READY` | PASS |
| login | succès, échecs génériques, statuts utilisateurs, limite | PASS |
| logout | révocation, suppression, cookie clear, idempotence | PASS |
| lecture session | contrats anonyme/authentifié exacts | PASS |
| identité locale | port testable, scrypt, aucun clair | PASS |
| sessions serveur | store abstrait, version, rotation, expiration | PASS |
| store durable | mémoire explicitement non durable | RÉSERVE |
| readiness fidèle | roundtrip, identité, transport, durabilité production | PASS |
| rotation | login, périodique, changement de rôle | PASS |
| révocation | tombstone et refus ancien cookie | PASS |
| RBAC | quatre rôles, trois capacités seulement | PASS |
| CSRF | toutes mutations protégées | PASS |
| cookies | `__Host-`, HttpOnly, Secure, Strict, sans Domain | PASS |
| redaction | logs et erreurs testés | PASS |
| routes | six routes autorisées seulement | PASS |
| Runtime/React/Codex | aucun import, appel ou raccordement | PASS |
| compilation | BFF + typecheck Core | PASS |
| lint | TypeScript strict | PASS |
| tests | 561/561 | PASS |
| smoke réel | parcours session complet | PASS |
| packages | aucun ajout, lockfile identique | PASS |
| empreinte protégée | 281 fichiers, SHA-256 identique | PASS |

## Réserve acceptée

Le store livré est `NON_DURABLE`, comme explicitement permis pour ce MVP.
L’architecture expose un port remplaçable et le readiness annonce
`ready_non_durable` hors production. Il refuse READY en production tant qu’un
store durable n’est pas injecté. Aucun faux statut de production n’est donc
déclaré.

## Décision

BFF_LOT_002_READY
