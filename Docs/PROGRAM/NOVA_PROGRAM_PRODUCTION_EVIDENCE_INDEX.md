# NOVA Program Engine — Production Evidence Index

Cet index ne contient aucune valeur de secret, token ou credential.

| EvidenceId | Type | Source/méthode | Résultat factuel | Utilisation |
|---|---|---|---|---|
| EV-001 | Git initial | `git branch`, `rev-parse`, `status`, `diff --binary` | Branche, HEAD, 21 modifiés, 81 non suivis, aucun delete/rename | Intégrité et provenance |
| EV-002 | Inventaire | Présence de 15 chemins ciblés | Tous présents | Périmètre |
| EV-003 | Tests A | Node test, 5 suites | 34/34 PASS, 201.727 ms | Packaging/context |
| EV-004 | Tests B | Node test, mapper + pipeline | 14/14 PASS, 135.189 ms | Mapping/intégration |
| EV-005 | Tests C | Node test, adapter + session + pipeline | 25/25 PASS, 161.339 ms | Exécution/erreurs |
| EV-006 | Tests Runtime | `npm run test:runtime` | 15/15 PASS, 152.179 ms | Runtime/locks/replay |
| EV-007 | TypeScript | `npm run typecheck:nova-core` | PASS, code 0 | Contrats |
| EV-008 | Suite complète | `npm test` | 424/424 PASS, 9 025.796 ms | Stabilité globale |
| EV-009 | Codex réel initial | Pipeline complet READ_ONLY | Exit 0, `REAL_EXECUTION_OK`, session COMPLETED, 6 361 ms | Gate réelle |
| EV-010 | Codex réel concurrent | Deux missions `Promise.all` même workspace | Deux sorties isolées, 3 374 ms muraux, dépôt inchangé | Concurrence nominale |
| EV-011 | Résilience réelle | Timeout 1 ms + AbortSignal précoce | `CODEX_TIMEOUT`; erreur annulation identique | Timeout/annulation |
| EV-012 | Collision | Deux appels concurrents en mémoire | Trois identifiants dupliqués acceptés ; package partagé accepté | P1 unicité |
| EV-013 | Workspace arbitraire | Adaptateur avec transport contrôlé | `C:\Windows` accepté et transmis | P1 sécurité |
| EV-014 | Authentification | `codex login status`, contrat Human Approval | CLI ChatGPT ; identité non production | P1 auth |
| EV-015 | Secret scan | Recherche ciblée de signature, sans afficher de valeur | 0 fichier correspondant | Secrets en clair |
| EV-016 | Revue source ciblée | Imports et contrats des 15 composants | Port structurel, double chemin prompt, session succès seulement | Intégrité/observabilité |
| EV-017 | Exploitation | Versions, présence de fichiers sans lecture, recherche mots-clés | Pas de preuve rotation/monitoring/rollback/ownership | Prérequis |
| EV-018 | Performance | `performance.now`, 5 000/1 000 itérations | Mesures par étape et heap process | Performance |
| EV-019 | Readiness native | `ProductionReadinessEvaluator.evaluate` | `NOT_READY`, 4 raisons, activation false | Décision |
| EV-020 | Packages | `npm ls --depth=0` | 3 devDependencies attendues | Absence installation |

## Empreintes initiales

- `git status` SHA-256 : `E7D504B7254000EA8FF8329F485CDB9B952F169047B5C81556F2B8E33FDD246D`
- `git diff --binary` SHA-256 : `FB527BC9083D8649DA611B3B5C6C696D9C60DAA3C0A9F9A0FECE68521DE3602D`
- HEAD : `7db9658902adf0496a8f681afbfbd3f19d21d7cc`

## Limites de preuve

- L’authentification réelle en échec n’a pas été provoquée afin de ne pas altérer les credentials.
- Un SIGINT et un kill brutal de l’arbre Codex n’ont pas été exécutés.
- Les ACL et politiques OS complètes ne sont pas certifiées.
- La charge longue durée et les percentiles de latence ne sont pas mesurés.
- La chaîne réelle n’a pas persisté sa session via le repository concret.
- Le worktree initial sale est conservé comme baseline, pas interprété comme propre.

NO_GO_PRODUCTION
