# PROGRAM RC1 — Rapport de smoke test

Date : 2026-07-28  
Plateforme : Windows, Node `v24.16.0`, npm `11.13.0`, Codex CLI `0.145.0`  
Décision : `RC1_NO_GO_MVP_PRODUCTION`

## Environnement

- service lié à `127.0.0.1`;
- données, exécutions et logs redirigés sous le répertoire temporaire système;
- clé d'attestation éphémère non réelle;
- profil `READ_ONLY`;
- sandbox `read-only`;
- un seul run;
- aucun retry;
- tous les fichiers temporaires supprimés.

## Résultats des quatorze contrôles

| # | Contrôle | Résultat | Preuve |
|---:|---|---|---|
| 1 | Démarrage RC | PASS PARTIEL | serveur source via `tsx` démarré; pas d'artefact |
| 2 | Santé | PASS | `/health` = `ok` |
| 3 | Exécution réelle READ_ONLY | FAIL | `CONTEXT_ASSEMBLY_FAILED` |
| 4 | Session durable | PARTIAL | mission/RunId/ReportId persistés; pas de DurableExecutionSession certifiée |
| 5 | Véritable entrypoint production | FAIL | `nova-core.server.ts` historique, pas `ProgramProductionEntrypoint` |
| 6 | Un seul appel Codex | FAIL | compteur démarré = 0; transport jamais atteint |
| 7 | Un seul appel Runtime | PARTIAL | Runtime PowerShell = 1; Runtime certifié = 0 |
| 8 | Preuve persistée | FAIL | aucune preuve de livrable |
| 9 | Certification persistée | FAIL | aucune certification |
| 10 | Replay sans nouvel appel | NON DÉMONTRÉ | reconstruction seulement, aucun replay COMPLETED |
| 11 | Redémarrage | PASS | service restauré sain |
| 12 | Reconstruction session | PARTIAL | mission `SUBMITTED`, même RunId/ReportId |
| 13 | Journaux | PARTIAL | 47 entrées Runtime; chaîne opérateur minimale incomplète |
| 14 | Feature Flag OFF | PASS TESTS | entrypoint OFF inerte en unit test; non exposé en production |

## Chronologie du run réel

1. mission créée et assignée;
2. run `RUN-NOVA-CORE-RC1-REAL-READ-ONLY-1785244962921`;
3. bootstrap, gouvernance, lock et profil : PASS;
4. capture Git initiale : PASS;
5. input evidence : PASS;
6. context assembly : FAIL;
7. transport Codex : non commencé;
8. transcript vide persisté;
9. capture Git finale : PASS;
10. delta Git : zéro;
11. classification officielle : FAILED;
12. rapport généré;
13. lock libéré.

Cause :

```text
NOVA_CORE_CONTEXT_SOURCE_OUT_OF_SCOPE:MISSION_ORDER:<fichier mission temporaire>
```

Le moteur place légitimement la mission sous le stockage d'exécution temporaire, mais l'assemblage de contexte la refuse parce qu'elle est hors racine repository. Ce défaut empêche le chemin réel configuré par le serveur d'atteindre Codex.

## Compteurs

| Compteur | Valeur |
|---|---:|
| Runs API | 1 |
| Runtime PowerShell lancé | 1 |
| `CODEX_EXECUTION_STARTED` | 0 |
| `CODEX_EXECUTION_FINISHED` | 1 synthétique FAILURE |
| Appels Codex réels | 0 |
| Appels Runtime certifiés | 0 |
| Retry | 0 |
| Fichiers modifiés par le smoke | 0 |

L'empreinte textuelle de `git status --porcelain=v1` avant et après est identique :

```text
f0ad3907b1b223b71eee2b2ef8be848ebb85e8677c2eceb129c991a4645afb5b
```

## Démarrage/reconstruction sans transport

Un contrôle séparé a :

- créé et assigné une mission temporaire;
- persisté `runtime.json`;
- arrêté puis redémarré le serveur;
- retrouvé la mission dans le même état `LOCKED`;
- réalisé 0 appel Codex et 0 appel Runtime.

## Sauvegarde/restauration locale

- copie état + ancre + exécution : 29 ms;
- restauration locale : 21 ms;
- santé restaurée : PASS;
- MissionId, RunId et ReportId : conservés;
- état : `SUBMITTED`;
- journal : 47 entrées;
- aucun nouvel appel.

Cette restauration ne valide pas la reprise d'une session interrompue.

## E2E complémentaires

| Suite | Résultat |
|---|---|
| Runtime PowerShell E2E | 15/15 PASS avec faux Codex contrôlé |
| Web Playwright | NON DISPONIBLE, aucun scénario |

## Conclusion

Le smoke obligatoire est FAIL et interdit un GO.

RC1_NO_GO_MVP_PRODUCTION
