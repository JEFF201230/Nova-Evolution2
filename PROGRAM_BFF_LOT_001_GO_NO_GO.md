# PROGRAM-BFF-LOT-001 — DÉCISION GO / NO GO

Date : `2026-07-28`

## Matrice de décision

| Critère | Preuve | Résultat |
|---|---|---|
| le BFF démarre | test du module serveur et smoke du script réel | PASS |
| aucune régression Runtime | Kernel 8/8, Runtime 15/15, Core 503/503 | PASS |
| authentification prête | session serveur, rotation et middleware testés | PASS |
| RBAC prêt | rôles bornés, allow/deny testés | PASS |
| CSRF prêt | token, Origin et Fetch Metadata testés | PASS |
| cookies sécurisés | `__Host-`, HttpOnly, Secure, Strict, Path `/`, sans Domain | PASS |
| Correlation ID actif | propagation, génération et filtrage testés | PASS |
| journalisation active | logs JSON corrélés et statuts réels testés | PASS |
| validation JSON active | MIME, parsing, objet et taille testés | PASS |
| gestion des erreurs active | codes sûrs, corrélation, aucune stack | PASS |
| endpoints techniques | health, readiness, version et session PASS | PASS |
| aucune route métier | routes Runtime/API/execute renvoient 404 | PASS |
| React non raccordé | empreinte `apps/nova-web` inchangée | PASS |
| Runtime et domaines certifiés non modifiés | empreinte protégée identique avant/après | PASS |
| aucun package ajouté | package-lock inchangé | PASS |

## Réserves

Le store de session du LOT 001 est volontairement mémoire et mono-instance. Le fournisseur d'identité, le proxy Runtime et les routes métier restent absents. Ces éléments sont hors périmètre et leur absence ferme les capacités métier au lieu de créer un bypass.

## Décision

BFF_LOT_001_READY
