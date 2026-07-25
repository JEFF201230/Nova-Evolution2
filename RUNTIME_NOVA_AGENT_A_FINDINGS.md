# Agent A — constats NRA-008 à NRA-011

## Périmètre et intégration

Le module `server/nova-core/run-binding.ts` fournit des primitives pures, sans effet de bord :

- `createRunIdentity` : identifiant unique d’exécution et identité stable ;
- `identitySlug` : slug lisible suffixé d’un hash d’identité (évite les collisions de `safeName`) ;
- `canonicalJson`, `sha256`, `hashValue` : sérialisation et empreintes déterministes ;
- `buildRunBinding` : hashes du prompt, de l’ExecutionRequest et du manifeste ;
- `fingerprintReport` et `reportBindingMismatches` : rattachement exact d’un rapport au run ;
- `runDirectory` : chemin exact `.nova-data/runs/<runId>` (avec rejet des séparateurs de chemin).

Le module est volontairement autonome afin de ne pas modifier les fichiers centraux réservés (`nova-core.execution.ts`, `nova-core.service.ts`, types et runtime orchestrateur). L’agent d’intégration devra appeler ces primitives lors de la création de la mission, persister les artefacts dans le dossier retourné et refuser tout rapport dont l’un des champs attendus diffère.

## État observé dans le code

| Anomalie | Preuve vérifiable | État constaté |
|---|---|---|
| NRA-008 — liaison rapport/run | `server/nova-core/nova-core.execution.ts:114-193,393-411` | `runId` est ajouté au manifeste, mais les répertoires restent `dataRoot/missions/<safeName>` et `dataRoot/reports/<safeName>`. Le rapport est choisi par `mtimeMs` (`findNewestOfficialReport`), sans comparaison exacte run/prompt/manifeste. Un ancien rapport peut donc être repris. |
| NRA-009 — déterminisme des artefacts | `nova-core.execution.ts:114-128,498-500` | `safeName` remplace les caractères non alphanumériques par `_` et peut produire des collisions. Le prompt et le manifeste sont écrits, mais aucun hash d’artefact ni ExecutionRequest complète persistée n’est actuellement associé au rapport. |
| NRA-010 — configuration Codex | `nova-core.execution.ts:94-106,170-181` | Le moteur utilise `NOVA_POWERSHELL`/`powershell.exe` et un script runtime partagé ; la version, le chemin du binaire Codex et son hash ne sont pas vérifiés ou persistés par le binding. |
| NRA-011 — robustesse de processus | `nova-core.execution.ts:393-454` | Les flux stdout/stderr sont lus concurremment, mais aucune limite, annulation, timeout, kill d’arbre ou statut explicite TIMEOUT/CANCELLED n’est exposé dans ce module d’exécution. |

Les missions précédentes ont ajouté le `runId` au contexte et des diagnostics observables, mais n’ont pas rendu la sélection de rapport liée cryptographiquement au run. Ces constats restent donc ouverts jusqu’à intégration des primitives ci-dessus dans le chemin d’exécution.

## Contrat d’intégration recommandé

1. Générer le `RunIdentity` avant toute écriture d’artefact ; utiliser `runDirectory(dataRoot, runId)` comme racine exclusive du run.
2. Écrire `prompt.md`, `execution-request.json` et `manifest.json`, puis construire `RunBinding` avec leur contenu exact et les métadonnées Git/Codex.
3. Inclure les six champs d’identité (`projectId`, `missionId`, `runId`, `promptHash`, `executionRequestHash`, `manifestHash`) dans le rapport officiel ou son enveloppe NOVA.
4. À la lecture, appeler `reportBindingMismatches`; un tableau non vide doit produire une erreur explicite et empêcher `ReportSubmitted`.
5. Calculer `reportFingerprint` sur le rapport validé et le conserver avec le binding.
6. Les timeouts/annulations doivent compléter ce contrat avec un statut de processus ; ils ne doivent pas contourner la vérification de binding.

## Tests

`server/nova-core/run-binding.test.ts` couvre :

- invariance de la sérialisation et des hashes à l’ordre des propriétés ;
- slug lisible avec suffixe stable et distinction des identifiants collisionnels ;
- construction d’un run et de son dossier dédié ;
- rejet d’un ancien `runId` ou d’un manifeste altéré.

Validation exécutée :

```text
npm.cmd run typecheck:nova-core                 PASS
node --import tsx --test server/nova-core/run-binding.test.ts  PASS (4/4)
```

## Risques résiduels

Le module n’impose pas encore les écritures atomiques ni le contrôle du processus : cette responsabilité appartient aux agents propriétaires des fichiers centraux et doit être intégrée séquentiellement. Aucun changement CEREBRAU ou métier n’est requis.
