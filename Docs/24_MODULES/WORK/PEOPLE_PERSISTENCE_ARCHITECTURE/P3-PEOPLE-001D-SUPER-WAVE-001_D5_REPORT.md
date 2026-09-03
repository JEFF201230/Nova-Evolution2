# P3-PEOPLE-001D-SUPER-WAVE-001 — D5

- D exécuté : D5 — idempotence, causation, correlation, request hash et duplicate protection.
- Fichiers créés : `server/domain/people/people-persistence-idempotence.test.ts`.
- Fichiers modifiés : adaptateur SQLite et event history PEOPLE, uniquement pour les contrôles de causalité/idempotence.
- Fichiers supprimés : aucun.
- Tests exécutés : suite D1 à D5 — PASS (14/14).
- Retry exact : PASS.
- Idempotence : PASS.
- Duplicate divergent : PASS (rejet explicite).
- History causale : PASS.
- Typecheck : PASS.
- `git diff --check` : PASS.
- Gate D5 : **GO**.

