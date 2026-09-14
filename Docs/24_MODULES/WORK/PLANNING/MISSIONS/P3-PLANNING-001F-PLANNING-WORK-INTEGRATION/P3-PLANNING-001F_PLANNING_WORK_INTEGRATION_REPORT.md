# P3-PLANNING-001F — Planning Work Integration — Rapport d'implémentation

## Identification

- MissionId : `P3-PLANNING-001F-IMPLEMENTATION-001`
- Sous-lot : `P3-PLANNING-001F — Planning Work Integration`
- Nature : `IMPLEMENTATION`
- Branche : `feature/nova-runtime-foundation`
- Verdict technique final : **GO**

Ce rapport constitue une preuve d'implémentation. Il ne certifie pas le sous-lot.

## Entry gate

L'entry gate est **PASS**. L'artefact canonique
`Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001E.certification.json` porte :

- `LotId: P3-PLANNING-001E` ;
- `Status: CERTIFIED` ;
- une preuve officielle valide ;
- `NextAuthorizedLot: P3-PLANNING-001F` dans les résultats certifiés.

## Autorités et implémentations lues

Les sources suivantes ont été lues avant la clôture de l'implémentation :

- `Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md` ;
- `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md` ;
- `Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001E.certification.json` ;
- le prompt canonique de la mission 001F ;
- le rapport d'implémentation 001E ;
- `server/domain/planning/index.ts` ;
- `server/domain/planning/planning.errors.ts` ;
- `server/domain/planning/planning.value-objects.ts` ;
- `server/domain/planning/planning.entities.ts` ;
- `server/domain/planning/planning.aggregate.ts` ;
- `server/domain/planning/planning-authority.commands.ts` ;
- `server/domain/planning/planning-authority.events.ts` ;
- `server/domain/planning/planning-authority.ts` ;
- `server/domain/planning/planning-persistence-ports.ts` ;
- `server/domain/planning/planning-persistence-codec.ts` ;
- `server/domain/planning/planning-persistence-migrations.ts` ;
- `server/domain/planning/planning-persistence-sqlite-adapter.ts` ;
- `server/domain/planning/planning-persistence-recovery.ts` ;
- `server/domain/planning/planning-internal-access.ts` et son test ;
- `server/runtime/work/work-core.types.ts` ;
- `server/runtime/work/work-core-foundation.ts` ;
- `server/runtime/work/work-core.ts` ;
- `server/runtime/work/work-lifecycle.ts` ;
- `server/runtime/work/work-objective.types.ts` ;
- `server/runtime/work/work-objective.model.ts` ;
- `server/runtime/work/work-objective.query.ts` ;
- `server/runtime/work/work-objective.service.ts` ;
- `server/runtime/work/work-people.types.ts`, `work-people.query.ts` et `work-people.test.ts`.

Ces lectures identifient les contrats effectivement utilisés par Work : Objective provient de
Mission via Work Core, Lifecycle demeure produit par `WorkLifecycleProducer`, et Progress demeure
la progression observée issue de l'observabilité Runtime/Monitoring.

## Fichiers créés

- `server/domain/work/work-planning.types.ts` ;
- `server/domain/work/work-planning.query.ts` ;
- `server/domain/work/work-planning.test.ts` ;
- `server/domain/work/index.ts` ;
- `server/domain/work/tsconfig.json` ;
- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001F-PLANNING-WORK-INTEGRATION/P3-PLANNING-001F_PLANNING_WORK_INTEGRATION_REPORT.md`.

## Fichiers modifiés

Aucun fichier préexistant n'a été modifié par ce sous-lot. L'état dirty antérieur a été préservé.

## Architecture d'intégration retenue

`WorkPlanningQuery` est un adaptateur interne read-only du domaine Work. Son unique dépendance est
le port minimal `WorkPlanningReadSource`, limité à `getCurrentPlanning`. Le port est satisfait par
la frontière certifiée `PlanningQueries` de 001E.

```text
WorkPlanningReference
  -> WorkReference.of(projectId, workId)
  -> PlanningQueries.getCurrentPlanning(WorkReference)
  -> qualification Work des quatre états
```

L'adaptateur ne possède aucune commande, aucun événement, aucun agrégat, aucun historique, aucun
cache, aucun repository et aucune persistence Planning. Il n'expose pas le contenu complet de la
version (Phases, Milestones, Dependencies, Schedule, Priorities ou Constraints). Il expose seulement
la qualification nécessaire : référence Work, statut, révision canonique, version éventuelle,
applicabilité éventuelle et provenance.

## Source de vérité et ownership

Planning reste l'unique source de vérité et l'unique propriétaire du plan. La lecture nominale des
tests traverse réellement `PlanningQueries` puis `PlanningSQLiteRepository`. Work ne reconstruit
aucune vérité Planning et n'écrit jamais dans la persistence Planning.

La lecture est sans effet : l'historique canonique avant et après `WorkPlanningQuery.get` est
strictement identique. Aucune synchronisation bidirectionnelle et aucune compensation implicite
n'existent.

## Mécanisme WorkReference

L'entrée Work `{ projectId, workId }` est transformée directement par le Value Object canonique
`WorkReference.of(projectId, workId)`. Le résultat Planning doit retourner une WorkReference égale
à celle demandée. Une référence différente ou structurellement invalide donne
`PLANNING_UNAVAILABLE / PLANNING_READ_INCONSISTENT`. Aucun `PlanningId`, `MissionId` ou identifiant
concurrent n'est créé.

## Quatre états effectivement utilisés

| État Work | État de la frontière Planning | Sens |
|---|---|---|
| `PLANNING_UNAVAILABLE` | `UNAVAILABLE`, exception de lecture ou incohérence | La lecture canonique ne peut fournir une vérité qualifiée. Aucun plan synthétique n'est exposé. |
| `PLANNING_ABSENT` | `ABSENT` | Aucun Planning n'a été établi pour la WorkReference. |
| `PLANNING_WITHDRAWN` | `WITHDRAWN` | Une histoire existe, mais aucun plan n'est applicable. La dernière version, la révision et la provenance sont conservées. |
| `PLANNING_AVAILABLE` | `CURRENT` | La version courante qualifiée est lisible avec révision, applicabilité et provenance. |

Il n'existe pas de cinquième état. Une absence n'est jamais transformée en Planning vide.

## Preuve de provenance

Pour `PLANNING_AVAILABLE` et `PLANNING_WITHDRAWN`, le résultat conserve directement le
`PlanningProvenance` produit par la lecture canonique. Pour l'état disponible, l'applicabilité est
également le `BusinessPeriod` canonique et conserve ses provenances de temps métier. Le test ciblé
vérifie l'identité de ces objets au cours d'une même lecture, ainsi que la version et la révision.

Une provenance absente, forgée structurellement ou incohérente ne devient jamais valide : elle est
qualifiée `PLANNING_UNAVAILABLE / PLANNING_READ_INCONSISTENT`.

## Séparation Objective / Lifecycle / Progress

`WorkPlanningQuery` ne dépend d'aucun contrat Objective, Lifecycle, Progress ou Monitoring. Son
entrée ne contient que la référence Work et sa sortie ne contient aucun de ces champs. Le test de
séparation prend un instantané de ces trois vérités, exécute la lecture Planning et prouve leur
égalité stricte après lecture.

- Objective reste produit depuis Mission ;
- Lifecycle reste produit par Work ;
- Progress reste observé depuis Monitoring ;
- aucun état Progress n'est déduit de Planning ;
- Planning ne modifie ni Objective ni Lifecycle.

## Tests exécutés et résultats exacts

### Résultats finaux

| Catégorie | Commande | Résultat final |
|---|---|---|
| Intégration Work, séparation Progress et interdomaines | `node --import tsx --test server/domain/work/work-planning.test.ts` | **PASS** — 8 tests, 8 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |
| Non-régression Planning | `node --import tsx --test server/domain/planning/*.test.ts` | **PASS** — 50 tests, 50 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |
| Non-régression Work | `node --import tsx --test server/runtime/work/*.test.ts` | **PASS** — 51 tests, 51 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |
| Non-régression Runtime | `npm test` / étape `test:runtime` | **PASS** — 24 tests, 24 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |
| Vérification ciblée du test Core instable | `node --import tsx --test server/nova-core/process-runner.test.ts` | **PASS** — 3 tests, 3 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |
| Non-régression NOVA Core, rerun final | `npm run test:core` | **PASS** — 541 tests, 541 pass, 0 fail, 0 skipped, 0 cancelled, 0 todo |

Les huit tests 001F prouvent les quatre états, la WorkReference unique, l'utilisation de la source
SQLite Planning canonique, la conservation de la provenance et de l'applicabilité, le fail-closed
sur indisponibilité/incohérence, l'absence de miroir et la séparation Objective/Lifecycle/Progress.

### Historique des exécutions non masqué

- Le premier passage de la suite ciblée a produit 6 pass / 1 fail. L'échec venait d'une assertion
  de référence objet entre deux relectures SQLite distinctes ; les valeurs étaient identiques mais
  correctement réhydratées dans deux instances. Le test a été corrigé pour vérifier la transmission
  par une même lecture canonique. Le passage final étendu est 8/8 PASS.
- Le premier `npm test` a donné Runtime 24/24 PASS puis Core 540/541 avec un échec temporel isolé
  de `process-runner.test.ts` (`Missing expected rejection`). Aucun fichier concerné n'a été modifié.
  Le test isolé a ensuite donné 3/3 PASS et le rerun Core complet final 541/541 PASS.

## Typecheck

Commande finale :

`npx tsc -p server/domain/work/tsconfig.json; npx tsc -p server/domain/planning/tsconfig.json; npm run typecheck:nova-core`

Résultat : **PASS**, exit code 0, aucune erreur TypeScript dans Work 001F, Planning ou NOVA Core.

## Non-régressions

Les validations finales démontrent :

- Work existant : 51/51 PASS ;
- Planning certifié : 50/50 PASS ;
- Runtime applicable : 24/24 PASS ;
- Core applicable : 541/541 PASS ;
- Objective, Lifecycle et Progress inchangés ;
- aucune écriture Planning déclenchée par Work ;
- aucun changement Frontend, BFF, API, HTTP, IAM, PEOPLE, Actions ou persistence Planning.

## Écarts et limites

- Le premier run Core a exposé une instabilité temporelle préexistante, documentée ci-dessus ; le
  test isolé et le rerun complet final sont PASS.
- L'intégration est volontairement interne et read-only. Aucun transport public ni projection UX
  n'est ajouté.
- La certification humaine et canonique de 001F reste une étape postérieure séparée.

## Verdict

**GO technique** — l'intégration Work/Planning minimale est implémentée via WorkReference et la
frontière Planning certifiée ; les quatre états et la provenance sont conservés ; les séparations
d'ownership sont maintenues ; toutes les catégories obligatoires ont un résultat final PASS.

Aucune certification, aucun fichier `*.certification.json` et aucun registre de certification n'a
été écrit ou modifié par cette mission. P3-PLANNING-001G n'a pas été ouvert.
