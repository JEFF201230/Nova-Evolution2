# RUNTIME-NOVA-RELEASE-TRAIN-001 — Rapport de vague 1

Date : 25 juillet 2026  
Vague : 1 — Finalisation du runtime  
Verdict : **SUCCESS — anomalies d'exécution CLOSED**

## Périmètre traité

La vague ferme les anomalies restantes relatives au preflight Git, au contrôle du
processus Codex, aux issues terminales d'exécution et à la sélection des validations.
Aucun composant métier, aucune interface Pixel Perfect et aucun fichier CEREBRAU
n'a été modifié.

## Réalisations

### Preflight Git complet

Le moteur exécute désormais un preflight structuré avant la préparation du run puis
une seconde fois immédiatement avant le spawn. Le spawn est refusé si les deux
observations divergent.

Contrôles couverts :

- version Git valide ;
- worktree réel et non bare ;
- top-level exact égal à la racine d'exécution ;
- HEAD existant et valide ;
- rejet explicite d'une branche unborn ;
- rejet explicite d'un detached HEAD ;
- branche active conforme à la branche attendue ;
- empreinte du worktree stable entre les deux contrôles ;
- sous-modules récursifs présents, sans conflit et sur la révision attendue.

Les preuves du premier preflight sont incluses dans le manifeste et le binding
persiste la branche et le HEAD.

### Timeout, annulation et arbre de processus

- timeout configurable par requête (`timeoutMs`) ;
- timeout runtime configurable par `NOVA_EXECUTION_TIMEOUT_MS` ;
- limite de sortie configurable par `NOVA_EXECUTION_MAX_OUTPUT_BYTES` ;
- capture stdout/stderr concurrente et bornée ;
- arrêt récursif Windows via `taskkill /T /F` avec fallback contrôlé ;
- arrêt du groupe de processus sur les plateformes POSIX ;
- endpoint `POST /api/v1/missions/:projectId/:missionId/cancel` ;
- issue `CANCELLED` persistée pour une annulation demandée ;
- issue `TIMEOUT` persistée pour une expiration ;
- statut du run, événement canonique, observabilité et libération du verrou alignés.

### Validation fondée sur le delta réel

Le manifeste déclare une politique `actual-git-delta`. Après calcul du delta Git,
le runtime PowerShell sélectionne les suites depuis les fichiers réellement créés,
modifiés, supprimés ou renommés :

- `apps/nova-web/**` → tests, typecheck et build web ;
- `server/**`, manifestes npm et tsconfig → tests et typecheck NOVA Core ;
- `tools/nova-core-runtime/**` → syntaxe et E2E du runtime PowerShell.

Le consommateur TypeScript recalcule indépendamment les validations requises et
bloque le rapport lorsqu'une validation dynamique est absente ou en échec.

## Tests et contrôles

| Contrôle | Résultat |
|---|---:|
| `npm.cmd test` | PASS — 10 runtime + 26 core |
| `npm.cmd run typecheck:nova-core` | PASS |
| `Test-NovaCoreSyntax.ps1` | PASS |
| `Test-NovaCoreReporting.ps1` | PASS — 18/18 |
| `Test-NovaCoreRuntimeE2E.ps1` | PASS — 15/15 |
| Kill réel parent + descendant | PASS |
| Timeout configurable | PASS |
| Annulation contrôlée | PASS |
| Detached HEAD / unborn / sous-module invalide / drift | PASS |
| Matrice dynamique fichiers → tests | PASS |
| `git diff --check` | PASS |
| Recherche de secrets sur le périmètre runtime | PASS — aucun motif |

## Contrôles Git et gouvernance

- HEAD initial : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`
- HEAD à la sortie : `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`
- commit créé : **NON**
- remote configuré : **NON**
- push réalisé : **NON**
- modification CEREBRAU : **NON**

## Anomalies

| Domaine | Statut |
|---|---|
| Preflight Git incomplet | CLOSED |
| Absence de double vérification avant spawn | CLOSED |
| Absence de timeout configurable | CLOSED |
| Absence d'annulation contrôlée | CLOSED |
| Absence de kill d'arbre de processus | CLOSED |
| Absence d'issues `CANCELLED` / `TIMEOUT` durables | CLOSED |
| Validation dérivée du scope déclaré plutôt que du delta réel | CLOSED |

## Points ouverts

Aucun point ouvert ne bloque la sortie de la vague 1.

