# P3-ACTIONS-001G — Correction 002 — Rapport

## MissionId

`P3-ACTIONS-001G-CORRECTION-002`

## Problème corrigé

L'écart bloquant `ACTIONS-G-002` établi par l'audit P3-ACTIONS-001G empêchait de représenter une Action `COMPLETED` lorsque l'accomplissement métier était explicitement constaté mais qu'aucun `Result` n'existait.

Avant cette correction :

- `CompleteAction` exigeait toujours un `ActionResult` ;
- l'agrégat refusait tout état `COMPLETED` dont `resultHistory` était vide ;
- `ActionCompleted` et le replay ne savaient représenter que la forme accompagnée de `ResultRecorded`.

## Cause racine

La commande, l'invariant d'agrégat et le décodeur du journal avaient été implémentés avec une précondition plus restrictive que le contrat : `Result` était la seule preuve de complétion admise. Le modèle possédait déjà `Activity`, fait métier observé, immuable et sourcé, mais aucune commande ni référence d'agrégat ne qualifiait une telle Activity comme constatation explicite de complétion.

## Exigences de la correction

La correction devait :

1. conserver la complétion avec `Result` explicite ;
2. admettre la complétion sans `Result` avec une constatation métier explicite ;
3. refuser toute complétion sans l'une de ces deux preuves ;
4. ne jamais transformer une constatation en `Result`, ni créer de seconde vérité du `Result` ;
5. préserver provenance, causalité, révision, idempotence, ordre des événements, persistance et replay ;
6. préserver autant que possible la forme durable historique de la complétion avec `Result` ;
7. ne pas corriger `ACTIONS-G-003` relatif à `RetryAction` ;
8. ne modifier aucune zone interdite par la mission.

## Correction réellement réalisée

- `CompleteAction` est désormais une union exclusive :
  - `result: ActionResult`, sans `completionObservation` ; ou
  - `completionObservation: Activity`, sans `result`.
- La voie constatation réutilise strictement le concept ACTIONS existant `Activity`. Aucun nouveau modèle de `Result` n'a été créé.
- L'agrégat porte, uniquement pour cette voie, `completionObservationId`, référence vers une Activity qu'il possède. L'invariant vérifie que la référence désigne effectivement cette Activity et qu'elle ne peut attester qu'un état `COMPLETED`.
- Une complétion constatée sans `Result` produit atomiquement et dans cet ordre :
  1. `ActivityObserved`, avec l'Activity explicite et sa provenance métier ;
  2. `ActionCompleted`, avec `completionObservationId`.
- Une complétion avec `Result` conserve sa forme existante : `ResultRecorded` puis `ActionCompleted`, sans champ de constatation ajouté.
- Une commande sans les deux preuves échoue avec `ACTION_RESULT_REQUIRED` sans évolution ni événement.
- Une commande contenant les deux preuves échoue avec `ACTION_RESULT_CONFLICT`.
- Une constatation ne peut pas remplacer un `Result` déjà présent : la commande est refusée avec `ACTION_RESULT_CONFLICT`.
- Le journal décode les deux variantes exclusives de `CompleteAction`. La variante historique avec `result` reste inchangée ; aucun changement de format du journal n'a été introduit.
- Le fingerprint causal couvre naturellement la variante et son contenu. Un replay identique restitue le receipt initial sans append supplémentaire.
- `Action.currentResult` reste exclusivement dérivé de `resultHistory`. La constatation n'y est jamais injectée. Si un `Result` est enregistré ultérieurement selon le comportement ACTIONS existant, il devient l'unique valeur retournée par `currentResult`, tandis que l'Activity reste seulement la preuve historique de la complétion.

## Fichiers exacts modifiés ou créés

### Modèle et production ACTIONS

- `server/domain/actions/action.aggregate.ts`
- `server/domain/actions/action-authority.commands.ts`
- `server/domain/actions/action-authority.events.ts`
- `server/domain/actions/actions-authority.ts`
- `server/domain/actions/actions-journal.ts`

### Tests ACTIONS

- `server/domain/actions/action-foundation.test.ts`
- `server/domain/actions/actions-authority.test.ts`
- `server/domain/actions/actions-persistence.test.ts`

### Rapport créé

- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001G-ACTIONS-FOUNDATION-CERTIFICATION/P3-ACTIONS-001G_CORRECTION_002_REPORT.md`

Aucun autre fichier n'a été modifié ou créé par cette correction. Le worktree contenait avant mission de nombreux changements suivis et non suivis hors périmètre ; ils ont été préservés et ne sont pas attribués à cette mission.

## Tests ajoutés ou modifiés

### Tests ajoutés

- `completion without Result records one explicit business observation before completion`
  - prouve `COMPLETED` sans Result avec Activity explicite ;
  - vérifie `ActivityObserved` avant `ActionCompleted`, ordinal, révision, provenance, absence de Result et référence de constatation ;
  - vérifie qu'un Result enregistré ensuite reste l'unique `currentResult`.
- `completion without Result and without explicit observation is rejected atomically`
  - prouve `ACTION_RESULT_REQUIRED` lorsque les deux preuves sont absentes et l'absence de mutation ;
  - prouve aussi `ACTION_RESULT_CONFLICT` lorsque les deux preuves sont fournies ensemble.
- `an observation cannot replace an authoritative Result already owned by the Action`
  - prouve le refus `ACTION_RESULT_CONFLICT` et la préservation du Result existant.
- `the explicit completion observation is persisted and deterministically replayed`
  - prouve la sérialisation de l'Activity, l'absence de Result implicite, le replay identique et l'absence d'append idempotent.
- `Result-backed completion keeps its existing durable shape and replay semantics`
  - prouve la forme durable historique avec `result`, la séquence d'événements inchangée, l'absence des nouveaux champs et le replay identique.

### Test modifié

- `Result has zero-or-one derived current value and a single append-only history`
  - conserve les preuves structurelles du Result ;
  - ajoute la validité d'un agrégat `COMPLETED` avec Activity de constatation explicite et sans Result ;
  - conserve le refus d'un agrégat `COMPLETED` sans aucune preuve.

### Test existant renforcé

- `Result remains one derived current value and completion records it before completion`
  - vérifie en plus l'absence d'Activity et de `completionObservationId` dans la voie avec Result.

## Validations réellement exécutées

Toutes les commandes ci-dessous ont été exécutées depuis la racine du dépôt le 2026-09-11.

| Validation | Commande exacte | Résultat réel |
|---|---|---|
| Tests ACTIONS finaux | `node --import tsx --test server/domain/actions/*.test.ts` | PASS — 40 tests, 40 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo ; exit 0 |
| TypeScript strict ACTIONS | `.\node_modules\.bin\tsc.cmd -p server/domain/actions/tsconfig.json` | PASS — exit 0, 0 erreur |
| TypeScript strict NOVA Core | `npm run typecheck:nova-core` | PASS — exit 0, 0 erreur |
| Contrôle Git des espaces | `git diff --check` | PASS — exit 0, aucune erreur d'espace |

Une exécution intermédiaire antérieure au dernier test de compatibilité durable a également passé 39/39 tests ACTIONS et le TypeScript strict ACTIONS. Le verdict repose sur l'exécution finale à 40/40 ci-dessus.

## Non-régressions constatées

- Les 40 tests ACTIONS applicables passent, y compris fondation, Authority, accès interne, persistance, concurrence, causalité, Result et graphe.
- La complétion avec Result reste valide et conserve `ResultRecorded` avant `ActionCompleted` dans une même révision.
- La forme durable avec Result ne reçoit ni `completionObservation` dans la commande, ni `completionObservationId` dans l'agrégat ou l'événement.
- La constatation explicite reste une `Activity` historique ; elle ne renseigne jamais `resultHistory` et ne devient jamais `currentResult`.
- Le replay de chacune des deux formes est déterministe et l'idempotence n'ajoute aucune entrée.
- La provenance propre de l'Activity constatée et la provenance/causalité de la commande restent présentes dans les événements.
- Les compilations TypeScript strictes ACTIONS et NOVA Core passent sans erreur.
- Aucun fichier sous `server/domain/planning`, `server/domain/people`, `Docs/12_CERTIFICATION`, BFF, frontend ou registre canonique n'a été modifié par cette mission.

## git diff --check

`git diff --check` a terminé avec le code 0 et sans erreur d'espace. Git a seulement affiché des avertissements de future conversion LF vers CRLF sur des fichiers suivis préexistants hors périmètre, notamment PLANNING, frontend, NOVA Core et outils runtime. Ces avertissements ne proviennent pas des fichiers de cette correction et n'ont pas été masqués.

## Limites

- Le verdict porte uniquement sur `ACTIONS-G-002`, pas sur la certification complète du lot P3-ACTIONS-001G.
- Aucun test WORK, PEOPLE, PLANNING, Runtime complet, BFF ou frontend n'a été exécuté, ces domaines étant hors périmètre de la correction demandée. Le typecheck NOVA Core a cependant été exécuté et passe.
- Aucun fichier de certification canonique n'a été modifié et aucune auto-certification n'a été effectuée.
- Le répertoire `server/domain/actions` était déjà non suivi dans le worktree au début de la mission. La commande obligatoire `git diff --check` a bien été exécutée, mais Git n'inclut pas les fichiers non suivis dans son diff tant qu'ils ne sont pas indexés.

## Confirmation explicite concernant ACTIONS-G-003

`ACTIONS-G-003` reste entièrement hors périmètre. Aucune correction ni modification sémantique de `RetryAction` ou de son événement n'a été réalisée dans cette mission.

## Verdict final

**PASS pour ACTIONS-G-002.**

La complétion d'une Action exige désormais toujours une preuve explicite : soit un `Result` autoritatif, soit, en l'absence de Result, une Activity de constatation métier explicite. Aucun Result implicite, second modèle de Result ou duplication de vérité n'a été introduit.
