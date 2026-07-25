# Agent D — Validation, Git, scopes et sécurité des entrées

Mission : `RUNTIME-NOVA-SQUAD-REMEDIATION-001`  
Périmètre : NRA-012, NRA-013, NRA-016, NRA-017, NRA-018, NRA-019, NRA-020.

## État constaté avant intégration

L’audit est fondé sur le code TypeScript présent dans `server/nova-core` et sur les tests existants. Les missions Observability et Transaction Integrity n’ont pas supprimé ces écarts : elles ajoutent des diagnostics, SSE, run records et atomicité, mais ne définissent pas de grammaire de scopes ni de validation d’entrée.

| Anomalie | Preuve actuelle | État |
|---|---|---|
| NRA-012 | `selectProfile()` classe `AUDIT` et `INSPECTION` dans `FAST`; `REVIEW`/`ANALYSIS` ne sont pas routés explicitement en `READ_ONLY`. | OPEN |
| NRA-013 | `changesExpected` est dérivé de `profile !== READ_ONLY` ou d’une valeur de requête; aucune interdiction centralisée des mutations READ_ONLY. | OPEN |
| NRA-016 | `selectValidations()` utilise des `startsWith("apps/nova-web")`/`startsWith("server/")`; aucune matrice versionnée chemin → tests et aucun calcul depuis les fichiers effectivement modifiés. | OPEN |
| NRA-017 | Le preflight appelle seulement `git branch --show-current`; pas de contrôle top-level, HEAD, detached/unborn, worktree, submodule, version Git ni second contrôle avant spawn. | OPEN |
| NRA-018 | Les scopes sont transmis tels quels dans le manifeste; un répertoire sans glob n’est pas normalisé en `/**`, et TS/PowerShell n’utilisent pas une grammaire commune. | PARTIAL |
| NRA-019 | `safeName()` remplace les caractères par `_`; il n’existe pas de suffixe d’identité hashée dans le chemin d’exécution actuel. | PARTIAL |
| NRA-020 | `readJson()` effectue `JSON.parse` sans schéma versionné, limites de taille, types, chemins, priorités ou conflit allowed/forbidden. | OPEN |

## Primitives ajoutées

`server/nova-core/scope-validation.ts` fournit une base isolée, sans modification des fichiers centraux :

- normalisation des séparateurs Windows/POSIX et conversion d’un répertoire existant vers `/**` ;
- rejet des chemins absolus et des segments `..` ;
- containment canonique avec frontières de séparateur (`repo` ne recouvre pas `repository`) ;
- détection parent/enfant et glob/exact ;
- rejet des recouvrements `allowed`/`forbidden` dans un payload versionné ;
- slug lisible avec suffixe SHA-256 stable d’identité.

Tests dédiés : `server/nova-core/scope-validation.test.ts` (5/5 passés).

Ces primitives ne sont volontairement pas branchées dans `nova-core.execution.ts`, `nova-core.service.ts` ou `nova-core.http.ts` afin de respecter la réservation des fichiers centraux et d’éviter une modification concurrente. Leur intégration doit être sérialisée par le Squad Lead.

## Cas couverts par les tests

- répertoire fourni sans glob ;
- séparateurs Windows ;
- containment et dépôt frère préfixé ;
- scope parent/enfant ;
- conflit allowed/forbidden ;
- deux identifiants produisant un slug lisible mais distinct.

Les scénarios detached HEAD, unborn branch, payload HTTP volumineux/malformé et audit modifiant un fichier restent à implémenter dans les tests d’intégration de l’Agent E/du Squad Lead.

## Intégration recommandée

1. Appeler `validateScopePayload()` à la frontière HTTP puis persister le payload normalisé.
2. Utiliser la même sortie normalisée pour le manifeste PowerShell et les contrôles de fichiers modifiés.
3. Remplacer progressivement `safeName()` par `stableIdentitySlug()` ou le module run-binding déjà présent, après décision unique sur l’identité canonique.
4. Ajouter un preflight Git dédié et un second contrôle immédiatement avant le spawn ; ne pas modifier CEREBRAU.

## Limites et risque résiduel

Le module ne résout pas les symlinks (ce contrôle doit être effectué par l’intégrateur lors du containment réel) et ne prétend pas valider les commandes Git/Codex. Les anomalies restent donc `OPEN` ou `PARTIAL` jusqu’à intégration et preuve par tests d’exécution.
