# P3-ACTIONS-001E — ACTIONS INTERNAL ACCESS — TECHNICAL REPORT

## Mission

| Attribut | Valeur |
|---|---|
| DomainId | `ACTIONS` |
| LotId | `P3-ACTIONS-001E` |
| Mission | `P3-ACTIONS-001E-IMPLEMENTATION-001` |
| Mode | `IMPLEMENTATION`, `DELTA-ONLY`, local single mission |
| Previous lot requis | `P3-ACTIONS-001D — CERTIFIED` |
| Approbation finale | Humaine, obligatoire |

Ce rapport contient des preuves techniques. Il ne certifie pas le lot et ne modifie pas le registre de certification.

## Delta exact de la mission

### Fichiers créés

- `server/domain/actions/actions-internal-access.ts`
- `server/domain/actions/actions-internal-access.test.ts`
- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001E-ACTIONS-INTERNAL-ACCESS/P3-ACTIONS-001E_ACTIONS_INTERNAL_ACCESS_REPORT.md`

### Fichiers modifiés

- `server/domain/actions/actions-authority.ts`
- `server/domain/actions/index.ts`

Aucun autre fichier n'a été modifié par cette mission. Le workspace contenait avant la mission des changements entrants hors périmètre, dont `Docs/12_CERTIFICATION/certification-registry.json`; ils n'ont été ni modifiés, ni restaurés, ni nettoyés, ni normalisés par cette mission.

## Implémentation

### Frontière interne Commands

`ActionsInternalCommands.execute(command)` transmet la même instance de `ActionsCommand` à `ActionsAuthority.accept(command)` et retourne directement son `ActionsAuthorityReceipt`. La frontière ne contient aucune règle de transition, mutation d'agrégat, opération de journal ou sémantique Result/Dependency dupliquée.

Preuves :

- test avec `RecordingAuthority`: identité objet de la Command préservée ;
- `commandId`, `causalityId`, provenance, révision attendue et éventuelle révision graphe restent portés par la Command transmise sans transformation ;
- receipt autoritatif, révisions et provenance événementielle retournés sans adaptation ;
- scan structurel : l'unique appel de mutation dans le service est `authority.accept(command)`.

`ActionsAuthority` demeure donc l'unique frontière de mutation métier.

### Frontière interne Queries

`ActionsInternalQueries` expose strictement les lectures contractuelles suivantes :

- `getAction` ;
- `listActionsByWork` ;
- `getActionHistory` ;
- `getActionActivities` ;
- `getActionExecutions` ;
- `getActionResult` ;
- `getActionDependencies`.

Les résultats sont qualifiés par `ActionReference`, révision Action et révision graphe. L'absence d'Action est `null`, une liste vide est admise et l'absence de Result sur une Action existante est une valeur `null` qualifiée. Les collections et enveloppes retournées sont immuables.

La modification minimale de `ActionsAuthority` ajoute `readCanonicalState()`. Cette lecture :

- expose uniquement des `Action` immuables, leurs révisions et leurs événements ordonnés ;
- reconstruit d'abord l'état depuis `ActionsJournal` lorsque le durable est configuré ;
- n'accepte aucune Command et n'ajoute aucun fait ;
- ne fournit aucune capacité d'écriture au service Query.

### Source, persistence et idempotence

`ActionsInternalAccess.inMemory()` partage une unique instance d'Authority entre Commands et Queries. `ActionsInternalAccess.durable(journal)` partage également une unique Authority, configurée avec l'`ActionsJournal` certifié en 001D. Aucun store, cache, repository, index persistant, miroir ou projection autoritative n'a été ajouté.

Les tests prouvent que :

- une Command interne durable est écrite dans le journal canonique existant ;
- après redémarrage, Query lit l'Action et son historique reconstruits depuis ce journal ;
- des Queries répétées laissent le contenu du journal strictement identique ;
- le replay exact retourne le receipt initial et ne crée aucune entrée durable supplémentaire ;
- une réutilisation divergente de causalité produit `ACTION_CAUSALITY_CONFLICT` et laisse le journal identique ;
- les CAS Action et graphe, le commit atomique, le replay déterministe et le fail-closed corruption restent couverts par la suite 001D inchangée.

## Séparation et exclusions

Le scan structurel et la revue du delta confirment :

- aucune API, BFF, route, endpoint, controller, frontend, UI ou transport public ;
- aucun scheduler, queue ou service externe ;
- aucun transfert d'ownership Work, Objective, Lifecycle, Progress, Planning, PEOPLE, Decisions, Deliverables ou Runtime ;
- aucun contenu d'agrégat externe copié dans ACTIONS ;
- aucune source durable secondaire et aucune projection autoritative ;
- aucun port Work/Actions, aucune projection Work, aucun calcul Progress et aucune sémantique trois états de P3-ACTIONS-001F.

`WorkReference` est seulement utilisée comme attribut canonique existant et critère d'une Query interne ACTIONS. P3-ACTIONS-001F n'est pas commencé.

## Validations

### Définition préalable des tests

`actions-internal-access.test.ts` a été créé avant toute modification fonctionnelle. Son exécution initiale a échoué comme attendu sur l'export absent de `ActionsInternalAccess` : 0 PASS, 1 FAIL fichier. L'implémentation a ensuite été réalisée.

### Commandes et résultats exacts

1. Tests ACTIONS 001B/001C/001D inchangés et tests 001E :

   ```text
   node --import tsx --test server/domain/actions/action-foundation.test.ts server/domain/actions/actions-authority.test.ts server/domain/actions/actions-persistence.test.ts server/domain/actions/actions-internal-access.test.ts
   ```

   Résultat : **PASS — 33 tests, 33 PASS, 0 FAIL**.

   Détail : 001B `9/9`, 001C `11/11`, 001D `7/7`, 001E `6/6`.

2. TypeScript strict ACTIONS :

   ```text
   npx tsc -p server/domain/actions/tsconfig.json
   ```

   Résultat : **PASS — 0 erreur** (`strict: true`, `noEmit: true`).

3. TypeScript NOVA Core directement vérifié :

   ```text
   npm run typecheck:nova-core
   ```

   Résultat : **PASS — 0 erreur**.

4. Non-régression Core applicable :

   ```text
   npm run test:core
   ```

   Résultat : **PASS — 541 tests, 541 PASS, 0 FAIL**.

5. Contrôle Git :

   ```text
   git diff --check
   ```

   Résultat : **PASS — code retour 0**. Git a seulement signalé des avertissements LF/CRLF sur des fichiers entrants hors mission ; aucune erreur whitespace n'a été produite.

6. Scan de séparation ciblé :

   ```text
   rg -n "from .*?(work|planning|people|decisions|deliverables|runtime|nova-bff)|\b(Http|Controller|Router|Endpoint|Bff|Frontend|Scheduler|Queue|WorkActionsPort|WorkProgress|WorkLifecycle)\b" server/domain/actions/actions-internal-access.ts server/domain/actions/actions-authority.ts server/domain/actions/index.ts
   ```

   Résultat : **PASS — aucune correspondance** (`rg` code 1 signifiant zéro match).

## Inconnues et travail différé

- L'intégration Work/Actions, ses trois états, sa projection/liste Work-owned et toute sémantique Progress restent intégralement différées à P3-ACTIONS-001F après certification humaine de 001E.
- Aucun transport public n'est décidé ou implémenté.
- La certification canonique et toute modification du registre restent à la charge du processus d'approbation humaine.
- Aucun blocage technique résiduel n'a été identifié dans le périmètre 001E.

TECHNICAL GO — P3-ACTIONS-001E — READY FOR HUMAN APPROVAL
