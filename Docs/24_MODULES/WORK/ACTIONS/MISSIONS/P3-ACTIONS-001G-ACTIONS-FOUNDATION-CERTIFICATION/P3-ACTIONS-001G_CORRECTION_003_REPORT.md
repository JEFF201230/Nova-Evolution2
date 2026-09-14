# P3-ACTIONS-001G — Correction 003 — Rapport de mission

## MissionId

`P3-ACTIONS-001G-CORRECTION-003`

## Problème initial

L'audit P3-ACTIONS-001G avait établi l'écart bloquant `ACTIONS-G-003` : la commande `RetryAction` réalisait bien la transition métier `FAILED -> READY`, mais `ActionsAuthority` émettait `ActionResumed` avec un payload `{ from: "FAILED", to: "READY" }`.

Cette production était incohérente avec la définition de `ActionResumed`, réservée à la reprise d'une Action `BLOCKED` et typée avec une origine exclusivement égale à `BLOCKED`.

## Cause racine

Deux défauts se combinaient :

1. le vocabulaire événementiel ACTIONS ne possédait pas de fait dédié à la nouvelle tentative après échec ;
2. le type interne `EventFact` associait tout `ActionsEventType` à un payload générique `Record<string, unknown>`. L'assertion finale vers `ActionsDomainEvent` masquait donc l'incompatibilité entre le discriminant `ActionResumed` et une origine `FAILED` au TypeScript strict.

## Exigence contractuelle appliquée

La correction doit préserver la commande `RetryAction` et sa transition `FAILED -> READY`, représenter explicitement la nouvelle tentative après échec sans détourner `ActionResumed`, et ne pas modifier la sémantique de `ResumeAction` :

- `RetryAction`, admise uniquement depuis `FAILED`, produit un fait de nouvelle tentative compatible avec `FAILED -> READY` ;
- `ResumeAction`, admise uniquement depuis `BLOCKED`, reste l'unique producteur de `ActionResumed` et conserve ses destinations explicites `READY` ou `IN_PROGRESS` ;
- le fait produit, son payload, sa provenance, sa causalité, sa révision, sa persistance et son replay restent cohérents.

Le contrat d'implémentation audité ne nommait pas de fait distinct pour `RetryAction`. La présente mission de correction demande explicitement d'introduire cette représentation métier. Le nom retenu est `ActionRetried`, au passé comme les autres faits de transition ACTIONS, avec le payload fermé `{ from: "FAILED", to: "READY" }`.

## Correction réellement réalisée

- Ajout de `ActionRetried` au vocabulaire `ACTION_EVENT_TYPES`.
- Ajout du payload typé `ActionRetried: { from: "FAILED"; to: "READY" }`.
- Renommage et export de la table de payloads en `ActionsEventPayloadByType` afin que la corrélation discriminant/payload soit réutilisable par le producteur.
- Remplacement du tuple permissif `EventFact = [ActionsEventType, Record<string, unknown>]` par une union mappée corrélant chaque type d'événement à son payload exact.
- Adaptation des gardes déjà existantes de `FailAction` et `CancelAction` en fonctions d'assertion TypeScript. Leur comportement métier et leurs transitions ne changent pas ; cette adaptation est uniquement nécessaire pour satisfaire le tuple événementiel renforcé.
- Remplacement, dans la branche `RetryAction`, de `ActionResumed` par `ActionRetried`, sans changer la précondition `FAILED` ni la destination `READY`.
- Aucun changement de `ResumeAction` : sa précondition `BLOCKED`, ses destinations et son événement `ActionResumed` sont conservés.
- Aucun changement de format ni de décodeur n'était nécessaire dans `ActionsJournal` : le journal persiste la commande et le receipt complet, puis le replay reconstruit le receipt via `ActionsAuthority`. La nouvelle production est ainsi persistée et reconstruite par le mécanisme canonique existant. Un test durable ciblé le prouve.

## Fichiers exacts créés ou modifiés

### Fichiers ACTIONS modifiés

- `server/domain/actions/action-authority.events.ts`
- `server/domain/actions/actions-authority.ts`
- `server/domain/actions/index.ts`
- `server/domain/actions/actions-authority.test.ts`

### Fichier de tests ACTIONS créé

- `server/domain/actions/actions-retry.test.ts`

### Rapport créé

- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001G-ACTIONS-FOUNDATION-CERTIFICATION/P3-ACTIONS-001G_CORRECTION_003_REPORT.md`

Aucun autre fichier n'a été modifié ou créé par cette mission. Le worktree comportait avant la mission de nombreux changements suivis et non suivis hors périmètre ; ils ont été préservés et ne sont pas attribués à cette correction.

## Tests ajoutés ou modifiés

### Trois tests ciblés ajoutés

1. `RetryAction emits ActionRetried, never ActionResumed, for FAILED to READY`
   - établit l'état `FAILED` ;
   - exécute la commande `RetryAction` inchangée ;
   - prouve la transition `FAILED -> READY`, les révisions 4 vers 5, l'absence de `ActionResumed`, la présence unique de `ActionRetried`, son payload exact, sa provenance et sa causalité.
2. `ResumeAction keeps ActionResumed reserved to a BLOCKED origin`
   - établit l'état `BLOCKED` ;
   - prouve que `ResumeAction` conserve `ActionResumed` avec `{ from: "BLOCKED", to: "IN_PROGRESS" }` ;
   - prouve que de nouvelles commandes `ResumeAction` depuis `IN_PROGRESS` et depuis `FAILED` sont rejetées sans évolution de révision.
3. `RetryAction persistence and deterministic replay preserve ActionRetried`
   - persiste un cycle jusqu'à `FAILED`, puis `RetryAction` ;
   - vérifie dans le document durable la commande `RetryAction`, l'état `READY`, `ActionRetried` et son payload ;
   - redémarre `ActionsAuthority`, vérifie l'historique canonique reconstruit, rejoue la même causalité et prouve l'identité du receipt ainsi que l'absence d'append.

### Test partagé adapté

- `all supported Command and Event names are explicit and no technical event is admitted`
  - attend désormais les 18 événements supportés, incluant `ActionRetried` ;
  - vérifie aussi la longueur et l'unicité du vocabulaire événementiel.

## Validations réellement exécutées

Toutes les commandes ont été exécutées depuis la racine du dépôt le 11 septembre 2026.

| Validation | Commande exacte | Résultat final réel |
|---|---|---|
| Tests ciblés Retry/Resume/replay | `node --import tsx --test server/domain/actions/actions-retry.test.ts` | **PASS** — 3 tests, 3 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo ; exit 0 |
| Tests ACTIONS complets | `node --import tsx --test server/domain/actions/*.test.ts` | **PASS** — 43 tests, 43 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo ; exit 0 |
| TypeScript strict ACTIONS | `.\node_modules\.bin\tsc.cmd -p server/domain/actions/tsconfig.json` | **PASS** — exit 0, 0 erreur |
| TypeScript strict NOVA Core | `npm.cmd run typecheck:nova-core` | **PASS** — exit 0, 0 erreur |
| Contrôle Git des espaces | `git diff --check` | **PASS** — exit 0, aucune erreur whitespace |

Une première vérification intermédiaire, avant l'adaptation des gardes typées et de l'assertion sur le format durable réel, avait échoué : TypeScript signalait 2 erreurs de réduction de type préexistantes rendues visibles par le tuple renforcé, et le fichier ciblé comptait 2 tests passés et 1 échoué à cause de noms de propriétés supposés dans l'assertion de sérialisation. Ces défauts de l'itération ont été corrigés. Les résultats finaux ci-dessus ont ensuite été réellement exécutés et sont tous passants.

## Non-régressions constatées

- Les 43 tests ACTIONS applicables passent, couvrant fondation, Authority, accès interne, persistance, concurrence, causalité, Result, complétion, graphe et nouvelle tentative.
- `RetryAction` conserve sa précondition `FAILED` et la transition autorisée `FAILED -> READY`.
- `ResumeAction` conserve sa précondition `BLOCKED`, ses destinations explicites et son fait `ActionResumed`.
- La recherche source finale ne trouve qu'une production de `ActionResumed`, dans la branche `ResumeAction`, avec `from: "BLOCKED"`.
- La recherche source finale trouve la production de `ActionRetried` uniquement dans la branche `RetryAction`, avec `from: "FAILED"` et `to: "READY"`.
- Le journal persiste le nouveau fait dans le receipt et le reconstruit de façon déterministe après redémarrage ; la répétition causale n'ajoute aucune entrée.
- Les typechecks stricts ACTIONS et NOVA Core passent sans erreur.
- Aucun fichier sous `server/domain/planning`, `server/domain/people`, `Docs/12_CERTIFICATION`, BFF, frontend ou registre canonique n'a été modifié par cette mission.

## Maintien des corrections ACTIONS-G-001 et ACTIONS-G-002

- `ACTIONS-G-001` est maintenu : la politique obligatoire `ActionsAdmissionPolicy`, le contrôle d'existence du Work à la proposition et les rejets sans mutation n'ont pas été modifiés. Les tests ACTIONS de proposition en mémoire et durable passent dans la régression 43/43.
- `ACTIONS-G-002` est maintenu : l'union exclusive de preuve de complétion, `completionObservationId`, les invariants de `Result`, les événements de complétion et leur décodeur durable n'ont pas été modifiés. Les tests de complétion avec Result, avec observation explicite, de refus sans preuve ou avec preuves conflictuelles, et les deux replays durables passent dans la régression 43/43.

Le renommage exporté de la table de payloads et le renforcement de `EventFact` couvrent l'ensemble des événements mais ne changent aucun payload ni aucune sémantique des corrections G-001/G-002.

## git diff --check

`git diff --check` a terminé avec le code 0 et sans erreur whitespace. Git a affiché des avertissements de future conversion LF vers CRLF sur neuf fichiers suivis préexistants hors périmètre, notamment PLANNING, frontend, NOVA Core et outils runtime. Ces avertissements ne sont pas des erreurs de `git diff --check` et aucun de ces fichiers n'a été touché par cette mission.

## Limites

- Le verdict porte uniquement sur `ACTIONS-G-003`, pas sur une relance ni sur une nouvelle certification complète de P3-ACTIONS-001G.
- P3-ACTIONS-001G n'a pas été relancée.
- Aucun certificat et aucun registre canonique n'a été modifié.
- Aucun test PEOPLE, PLANNING, WORK, Runtime complet, BFF ou frontend n'a été exécuté, ces périmètres étant exclus de la correction. Le typecheck NOVA Core demandé a été exécuté et passe.
- Le répertoire `server/domain/actions` et le répertoire de mission ACTIONS étaient déjà non suivis dans le worktree au début de la mission. `git diff --check` n'inspecte pas les fichiers non suivis tant qu'ils ne sont pas indexés ; cette limite Git est explicitement conservée dans l'interprétation de son résultat.
- Aucun scénario de migration d'un journal historique contenant l'ancien fait sémantiquement invalide `ActionResumed` pour `RetryAction` n'a été ajouté ni revendiqué. La validation durable porte sur les écritures produites par la représentation corrigée.

## Verdict final

**PASS pour ACTIONS-G-003.**

`RetryAction` conserve `FAILED -> READY` et produit désormais le fait métier explicite `ActionRetried` avec un payload compatible. `ActionResumed` reste exclusivement associé à `ResumeAction` depuis `BLOCKED`, et la persistance ainsi que le replay de la nouvelle tentative corrigée sont validés.
