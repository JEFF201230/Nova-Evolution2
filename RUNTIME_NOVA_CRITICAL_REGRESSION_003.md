# RUNTIME-NOVA-CRITICAL-PARTIAL-CLOSURE-003 — Non-régression

Date : 2026-07-25

## Campagnes

| Contrôle | Résultat |
| --- | --- |
| Typecheck NOVA Core | PASS |
| Tests Node historiques | 47/47 conservés |
| Tests Node actuels | 59/59 PASS |
| Tests Node complémentaires journal/état | 5/5 PASS |
| Tests PowerShell obligatoires historiques | 33/33 conservés |
| Tests PowerShell obligatoires actuels | 34/34 PASS |
| Tests PowerShell complémentaires | 71/71 PASS |
| Syntaxe PowerShell | PASS |
| Bootstrap `npm ci` offline jetable | PASS |
| Tests skip/todo ajoutés | Aucun |

## Contrôles de périmètre

| Contrôle | Résultat |
| --- | --- |
| Fichier ou document CEREBRAU modifié | Aucun |
| Dépendance active vers un runtime CEREBRAU | Aucune ; les occurrences restantes sont historiques, tests ou documentation d’autonomie |
| Fichier `apps/nova-web` / Pixel Perfect modifié | Aucun |
| Fonctionnalité métier NOVA nouvelle | Aucune |
| Route de certification parallèle | Aucune ; une seule route POST `/certify` |
| Certification automatique | Aucune |
| Seconde autorité du journal | Aucune ; projection dérivée et vérifiée |
| Test désactivé ou marqué skip | Aucun |
| Secret, token ou clé privée ajoutés | Aucun motif sensible détecté |
| Sauvegarde runtime non atomique ajoutée | Aucune |
| Commit | Aucun |
| Push | Aucun remote configuré ; aucune commande push exécutée |

## Non-régression des 11 NRA figées

- NRA-002 : aucun `ReportSubmitted` après FAILED, TIMEOUT, CANCELLED ou REJECTED.
- NRA-003 : les verrous restent libérés après les terminaisons techniques.
- NRA-004 : rollback de mutation et sauvegarde atomique restent couverts.
- NRA-005/NRA-006 : diagnostics, stdout/stderr et SSE restent actifs.
- NRA-008 : recherche bornée au run et report binding exact conservés.
- NRA-010 : identité/version/hash/politique Codex conservés.
- NRA-012 : validations dynamiques et preuves de livrables conservées.
- NRA-016 : double preflight, detached/unborn/submodules/drift conservés.
- NRA-019 : containment segmentaire et slug hashé conservés.
- NRA-020 : validation stricte des payloads conservée.

## État Git

Le worktree était déjà non propre avant cette mission. Il n’a pas été nettoyé ni réécrit. Les quatre seuls nouveaux livrables de cette mission sont ceux portant le suffixe `_003`.

Le HEAD de référence est resté :

```text
d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7
```

La vérification finale de `git diff --check`, du statut et du HEAD est consignée dans le rapport principal.
