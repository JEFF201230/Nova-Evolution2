# Agent C — constats journal, replay et reprise

Mission : `RUNTIME-NOVA-SQUAD-REMEDIATION-001`

## Périmètre

Ce lot couvre le reliquat de NRA-007 (traçabilité reconstructible), NRA-015
(journal autoritatif) et NRA-022 (détection/primitives de reprise). Aucun fichier
du runtime central, de CEREBRAU ou du moteur PowerShell n’a été modifié.

## État observé avant intégration

| Anomalie | Preuve dans le dépôt | État constaté |
|---|---|---|
| NRA-007 reliquat | `orchestrator-runtime.service.ts:701-714` exporte `runtime.json` depuis l’état mémoire | Les événements d’observabilité sont persistés comme une projection ; aucune chaîne de hachage append-only n’est une source autoritative. |
| NRA-015 | `nova-core.service.ts:262-300` sérialise les sauvegardes et `runtime.json` contient missions/événements | Il n’existe pas de journal durable séparé, de contrôle de rupture de chaîne, ni de replay après corruption du snapshot. |
| NRA-022 | `orchestrator-runtime.service.ts:684-685` expose seulement les runs `RUNNING` via `getIncompleteRuns` | La détection est utile mais aucune classification persistante (processus actif, rapport présent/absent, drift worktree, verrou orphelin), ni commandes reconcile/resume/abandon/quarantine/recover n’étaient disponibles. |

Les corrections précédentes (observabilité, `incompleteRuns`, sauvegarde atomique)
sont conservées. Le présent module les complète sans les remplacer.

## Artefact fourni

`server/runtime/journal/append-only-journal.ts` fournit une primitive autonome :

- événement versionné avec `eventId`, `sequence`, `projectId`, `missionId`,
  `runId`, `correlationId`, `eventType`, `payload`, `previousHash` et `eventHash` ;
- hachage SHA-256 sur JSON canonique (ordre des clés stable) ;
- append séquentiel et refus des séquences incohérentes ;
- `verifyIntegrity()` pour détecter version, trou de séquence, hash précédent ou
  contenu altéré ;
- `replay(initialState, reducer)` qui refuse tout journal invalide ;
- `classifyRunRecovery()` distinguant processus actif, rapport trouvé/absent,
  drift de worktree, verrou orphelin et états terminaux.

Le module n’écrit aucun fichier par lui-même : l’intégrateur choisit un stockage
append-only (fichier dédié, rotation et fsync) puis projette vers `runtime.json`.
Cette séparation évite une nouvelle double vérité et permet une migration
versionnée des snapshots existants.

## Tests et preuves

`server/runtime/journal/append-only-journal.test.ts` couvre :

1. chaîne de hachage et replay déterministe ;
2. altération d’un payload détectée et replay refusé ;
3. classification d’un run interrompu, d’un drift et d’un verrou orphelin.

Exécution vérifiée :

```text
node --import tsx --test server/runtime/journal/append-only-journal.test.ts
3 tests passed, 0 failed
```

## Intégration séquentielle requise

Le Squad Lead devra réserver les fichiers centraux puis :

1. instancier un journal par projet/runtime avec migration de `runtime.json` ;
2. publier chaque événement canonique une seule fois dans le journal avant sa
   projection ;
3. reconstruire la projection par replay lorsque l’intégrité du snapshot échoue ;
4. journaliser les décisions de reprise (`reconcile`, `resume`, `abandon`,
   `quarantine`, `recover`) avec l’`attempt` et le `runId` ;
5. persister le résultat de `classifyRunRecovery` sans modifier la machine d’état
   métier ni certifier automatiquement une mission.

Le module est volontairement non branché dans cette étape afin d’éviter une
modification concurrente des fichiers centraux réservés au Squad Lead.
