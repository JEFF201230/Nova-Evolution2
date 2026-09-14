# P3-PLANNING-001D — PLANNING PERSISTENCE — RAPPORT

## Identification

- MissionId : `P3-PLANNING-001D-IMPLEMENTATION-001`
- Sous-lot : `P3-PLANNING-001D — Planning Persistence`
- Domaine : `PLANNING`
- Branche d'exécution : `feature/nova-runtime-foundation`
- Nature du verdict : verdict technique uniquement, sans certification du lot

## Périmètre réalisé

Le sous-lot établit la persistence canonique durable interne de Planning :

- port de repository unique indexé par la `WorkReference` certifiée ;
- adaptateur SQLite synchrone interne ;
- tête courante unique et nullable ;
- versions Planning complètes, ordonnées et append-only ;
- événements métier complets et ordonnés ;
- receipts immuables d'idempotence ;
- CAS sur une révision technique monotone du stream ;
- relecture et rehydration par l'Authority Planning certifiée ;
- migration versionnée, checksummée, atomique et fail-closed ;
- backup, restore et reconstruction des têtes depuis l'histoire immuable ;
- tests de persistence, atomicité, idempotence, concurrence, recovery et migration.

Aucune API, route, BFF, projection UX ni ouverture de P3-PLANNING-001E n'a été ajoutée.

## Fichiers créés

- `server/domain/planning/planning-persistence-ports.ts`
- `server/domain/planning/planning-persistence-codec.ts`
- `server/domain/planning/planning-persistence-migrations.ts`
- `server/domain/planning/planning-persistence-sqlite-adapter.ts`
- `server/domain/planning/planning-persistence-recovery.ts`
- `server/domain/planning/planning-persistence.test.ts`
- `server/domain/planning/tsconfig.json`
- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001D-PLANNING-PERSISTENCE/P3-PLANNING-001D_PLANNING_PERSISTENCE_REPORT.md`

## Fichiers modifiés

- `server/domain/planning/index.ts` : exports internes de la persistence Planning.
- `server/domain/planning/planning-authority.test.ts` : l'assertion transitoire 001C qui interdisait tout fichier de persistence dans le répertoire a été resserrée sur l'invariant durable pertinent : l'Authority certifiée ne dépend pas de la persistence. Aucun code ni comportement métier de l'Authority n'a été modifié.

## Architecture de persistence retenue

SQLite est utilisé comme mécanisme durable transactionnel local. Le schéma canonique v1 contient exclusivement :

- `planning_root` : une tête par couple Project Identity / Work Identity, une révision CAS et une version Planning courante nullable ;
- `planning_version` : contenu complet de chaque version métier immuable ;
- `planning_event` : histoire ordonnée des faits acceptés ;
- `planning_command_receipt` : preuve immuable d'une intention et de son résultat exact ;
- `planning_schema_migration` : ledger immuable des migrations.

Les contraintes SQLite, clés uniques, clés étrangères et triggers append-only protègent l'unicité, la monotonie et la non-destruction. Au chargement, les versions sont reconstruites avec les value objects certifiés, puis les événements racines sont rejoués par `PlanningAuthority`. Les événements stockés sont comparés aux faits déterministes régénérés par l'Authority. Une divergence de tête, version, métadonnée, séquence, événement ou receipt échoue fermée.

## Source canonique

La source canonique durable unique est le stream SQLite Planning identifié par la `WorkReference` canonique (`projectIdentity`, `workIdentity`). `planning_root` ne contient qu'un pointeur courant ; la vérité complète est conservée par les versions et événements immuables du même stream transactionnel.

Aucune copie de Work, Objective, Progress, People, Action, Deliverable, Decision, Runtime ou Timeline n'est persistée. Les deux composantes de `WorkReference` sont seulement la référence externe qualifiée imposée par le contrat.

## Garanties d'atomicité

Chaque commit utilise `BEGIN IMMEDIATE` puis écrit, dans une transaction unique :

1. la création ou l'avancement CAS de la tête ;
2. la nouvelle version éventuelle ;
3. tous les événements du changement ;
4. le receipt et son résultat exact.

Toute exception entraîne `ROLLBACK`. Un point d'injection de panne placé après les écritures de tête/version/événements et avant le receipt démontre que les quatre tables restent inchangées après interruption.

## CAS et concurrence

`PlanningVersion` reste exclusivement la version métier certifiée. Une révision technique de stream distincte augmente de un à chaque écriture acceptée, y compris lors d'un retrait qui ne crée pas de version métier.

Le commit compare l'`expectedRevision` au stream durable sous transaction `BEGIN IMMEDIATE`. Une révision obsolète produit `CONCURRENT_PLANNING_CHANGE` sans effet partiel. Aucun comportement « dernier écrit gagne » n'existe. Le test de deux révisions concurrentes issues de la même tête démontre que la première gagne et que la seconde échoue sans altérer la vérité canonique.

## Idempotence et receipts

Le receipt est identifié par `WorkReference + causationId` et lie :

- le type de commande ;
- un fingerprint SHA-256 canonique versionné ;
- la corrélation ;
- la révision attendue et la révision commitée ;
- la plage exacte d'événements ;
- les identifiants d'événements ;
- la version courante et le nombre de versions résultants ;
- l'instant technique de commit, sans promotion en temps métier.

Un rejeu strictement identique retourne `REPLAYED` et le résultat historique d'origine, même si l'`expectedRevision` présenté au rejeu diffère. Toute réutilisation de causalité avec un fingerprint ou type différent échoue avec `PLANNING_IDEMPOTENCY_CONFLICT`. Les receipts sont append-only et leur cohérence avec les événements est revérifiée au démarrage.

## Recovery

Trois mécanismes internes sont fournis :

- backup SQLite validé avant et après copie ;
- restore vers une destination obligatoirement nouvelle ;
- rebuild vers une destination nouvelle depuis les versions, événements et receipts immuables.

Le rebuild ne copie pas la tête mutable : il la recalcule depuis le dernier fait racine du stream, puis réexécute toutes les validations de rehydration. Une tête volontairement corrompue est rejetée au redémarrage et correctement reconstruite depuis l'histoire sans fabrication ni perte de version, événement ou receipt.

## Migration

La migration `planning-canonical-v1` est :

- ordonnée et contiguë ;
- liée au SHA-256 exact de son SQL ;
- inscrite dans un ledger immuable ;
- appliquée dans une transaction unique ;
- idempotente après application ;
- vérifiée par inventaire exact des objets SQLite, `quick_check` et `foreign_key_check`.

Une base contenant des objets `planning_*` sans ledger est refusée comme ambiguë. Une interruption injectée avant le SQL, après le SQL, après vérification ou après inscription du ledger restaure systématiquement une base v0 vide. Aucun timestamp, fixture, Progress ou ordre technique n'est transformé en donnée Planning.

## Tests exécutés et résultats exacts

### Tests Planning complets

Commande :

```text
node --import tsx --test server/domain/planning/*.test.ts
```

Résultat final :

```text
tests 40
pass 40
fail 0
cancelled 0
skipped 0
todo 0
exit code 0
```

Ces 40 tests couvrent les 34 tests certifiés de Foundation/Authority et les 6 scénarios de persistence 001D.

### Tests de persistence 001D isolés

Commande :

```text
node --import tsx --test server/domain/planning/planning-persistence.test.ts
```

Résultat final :

```text
tests 6
pass 6
fail 0
cancelled 0
skipped 0
todo 0
exit code 0
```

### Non-régression Runtime/Core

Commande :

```text
npm.cmd test
```

Résultat final :

```text
tests 541
pass 541
fail 0
cancelled 0
skipped 0
todo 0
exit code 0
```

## Typecheck

Typecheck strict du module Planning :

```text
npx.cmd tsc -p server/domain/planning/tsconfig.json
exit code 0
```

Typecheck NOVA Core existant :

```text
npm.cmd run typecheck:nova-core
exit code 0
```

## Non-régressions

- Fondation Planning : PASS.
- Planning Authority : PASS.
- Runtime/Work/NOVA Core : PASS, 541/541.
- Modèle métier certifié : inchangé.
- Producteur autoritatif : inchangé et toujours indépendant de la persistence.
- Aucun fichier `server/domain/people/**` modifié.

## Vérification des interdictions

- Seconde source de vérité Planning : absente.
- Copie de Planning dans Work : absente.
- Progress persisté comme vérité Planning : absent.
- Timeline persistée ou autoritative : absente.
- API publique, BFF ou frontend : absents.
- Modification de `apps/**` : aucune dans ce sous-lot.
- Modification de `server/domain/people/**` : aucune.
- Modification manuelle de certification : aucune.
- Auto-certification de P3-PLANNING-001D : non réalisée.
- Ouverture ou implémentation de P3-PLANNING-001E : non réalisée.

## Écarts ou réserves

Aucun écart technique bloquant identifié dans le périmètre 001D. La validation humaine finale et la certification restent explicitement hors de ce verdict technique.

## Verdict technique

**GO technique** pour `P3-PLANNING-001D — Planning Persistence` : source durable unique, courant et histoire atomiques, CAS, idempotence, recovery, migration fail-closed et non-régressions sont implémentés et démontrés.

Ce verdict ne certifie pas le lot et n'ouvre pas P3-PLANNING-001E.
