# RUNTIME-NOVA-CERTIFICATION-CLOSURE-001 — Rapport de non-régression

Date de qualification finale : 2026-07-25T15:33:39+02:00

Révision contrôlée : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`

Branche : `main`

## Baseline et méthode

Le worktree était déjà non propre au début de la mission et contenait les changements suivis/non suivis provenant des vagues et de l'audit précédents. Cette situation n'a pas été masquée ni nettoyée. Les trois présents rapports sont les seuls nouveaux livrables de cette mission.

Les tests utilisent uniquement le dépôt réel et des répertoires temporaires jetables pour les processus, snapshots et migrations. Aucun résultat n'est repris d'un rapport antérieur.

## Qualification obligatoire

| Commande exacte | Code retour | Résultat |
|---|---:|---|
| `npm.cmd run typecheck:nova-core` | 0 | TypeScript SUCCESS |
| `npm.cmd test` | 0 | 47/47 : orchestrateur 12/12, NOVA Core 35/35 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreReporting.ps1` | 0 | 18/18 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-NovaCoreRuntimeE2E.ps1` | 0 | 15/15 |
| Total PowerShell obligatoire | 0 | 33/33 |
| `git diff --check` | 0 | SUCCESS |

Durée observée de la commande finale typecheck + Node : 5,7 s.

Durée observée de la campagne finale PowerShell 33 tests : 15 s.

## Suites de non-régression supplémentaires

| Suite | Code retour | Résultat |
|---|---:|---|
| `Test-NovaCoreSyntax.ps1` | 0 | Tous les fichiers PowerShell parsés sans erreur |
| `Test-NovaCoreExceptionCapture.ps1` | 0 | 13/13 |
| `Test-NovaCoreGovernance.ps1` | 0 | 25/25 |
| `Test-NovaCoreContextAssembly.ps1` | 0 | 23/23 |
| `Test-NovaCoreContextRuntime.ps1` | 0 | 10/10 |

## Contrôles de périmètre

| Contrôle | Résultat |
|---|---|
| HEAD final | `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`, inchangé |
| Nombre de commits sur la branche | 1, inchangé pendant la mission |
| Remote Git | Aucun |
| Push | Impossible sans remote ; aucun push exécuté |
| Commit | Aucun commit exécuté |
| Fichiers CEREBRAU modifiés | Aucun |
| Documents CEREBRAU modifiés | Aucun |
| `apps/nova-web` / Pixel Perfect modifié | Aucun |
| Secret scan ciblé | Aucun match de clé privée, token OpenAI/GitHub/AWS ou JWT |
| `git diff --check` | SUCCESS ; warnings LF/CRLF non bloquants uniquement |

## Non-régression des NRA figées

- NRA-002 : FAILED/TIMEOUT/CANCELLED ne produisent toujours pas `ReportSubmitted`.
- NRA-003 : les verrous sont toujours libérés après les fins terminales.
- NRA-004 : rollback des mutations et sauvegarde atomique toujours couverts.
- NRA-008 : rapport toujours recherché dans le dossier du run et binding stale refusé.
- NRA-016 : preflight Git et seconde vérification avant spawn toujours couverts par leurs tests.

## Conclusion de non-régression

Aucune régression n'a été détectée dans les campagnes exécutées. Aucun point `OPEN` ou `PARTIAL` ne subsiste dans la matrice de correction.

Ce document rapporte exclusivement les corrections et preuves. Il n'émet aucun certificat et ne formule aucune décision `GO`.
