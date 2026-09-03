# P3-PEOPLE-001G-M01 â€” Work / PEOPLE Internal Integration

## 1. PrÃ©conditions

ContrÃ´les effectuÃ©s avant toute Ã©criture :

| ContrÃ´le | RÃ©sultat observÃ© |
|---|---|
| `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` existe | PASS â€” `Test-Path` a retournÃ© `True` |
| `LotId` | PASS â€” `P3-PEOPLE-001F` |
| `Status` | PASS â€” `CERTIFIED` |
| `NextAuthorizedLot` | PASS â€” `P3-PEOPLE-001G` |

Le contrat canonique `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md`, notamment sa section 11 et les gates 001G, a Ã©tÃ© lu avant implÃ©mentation.

## 2. Ã‰tat Git initial

`git status --short` a Ã©tÃ© exÃ©cutÃ© avant Ã©criture. Le worktree Ã©tait dÃ©jÃ  sale.

Ã‰lÃ©ments prÃ©existants constatÃ©s :

- certifications/registre : deux fichiers suivis modifiÃ©s et les certifications 001E/001F non suivies ;
- architecture PEOPLE Persistence : treize documents suivis modifiÃ©s, plusieurs rapports et missions non suivis ;
- `server/domain/people` : onze fichiers suivis modifiÃ©s et huit fichiers Commands/Migrations/Queries/Recovery non suivis ;
- rapports racine non suivis ;
- `tools/cerebrau/`, `tools/nova-core-runtime/mission.json` et `tools/nova-core-runtime/reports/` non suivis ;
- `Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01_PROMPT.md` prÃ©existait comme seul fichier de ce rÃ©pertoire d'intÃ©gration.

Aucun stash, reset, checkout ou revert n'a Ã©tÃ© exÃ©cutÃ©. Aucun de ces changements prÃ©existants n'a Ã©tÃ© modifiÃ© ou nettoyÃ© par la mission.

## 3. Composants PEOPLE rÃ©utilisÃ©s

- `PeopleQueryService.GetWorkParticipants` : unique read path mÃ©tier utilisÃ© ;
- `WorkReference` : rattachement canonique Project Identity / Work Identity ;
- rÃ©sultats certifiÃ©s `QualifiedAssignments`, `AggregateAbsent` et `TemporalPeopleQueryQualification` ;
- identifiants portÃ©s par les `WorkAssignment` retournÃ©s par PEOPLE ;
- qualification temporelle, rÃ©vision, sÃ©quence et provenance produites par PEOPLE.

Aucune des neuf Queries PEOPLE n'a Ã©tÃ© recrÃ©Ã©e. Aucun port de persistance PEOPLE n'est appelÃ© directement par le code Work.

## 4. Composants Work inspectÃ©s

- `server/runtime/work/work-core.ts` ;
- `work-core-foundation`, `work-core.types` et leurs tests ;
- Objective ;
- Lifecycle et Progress ;
- Deliverables ;
- Decisions ;
- Technical Agent.

La liste de compatibilitÃ© canonique des sept domaines est : Identity, Objective, Lifecycle, Progress, Deliverables, Decisions, Technical Agent.

## 5. Gap rÃ©ellement constatÃ©

Avant cette mission, `server/runtime/work` ne possÃ©dait aucune frontiÃ¨re interne permettant de lire PEOPLE. `work-core.ts` n'exportait aucun composant PEOPLE. Le read path PEOPLE certifiÃ© existait dÃ©jÃ  et suffisait ; aucun changement PEOPLE n'Ã©tait nÃ©cessaire.

## 6. Architecture finale

Chemin rÃ©alisÃ© :

`People Persistence -> PeopleQueryService.GetWorkParticipants -> WorkPeopleQuery -> consommateur interne Work`

`WorkPeopleQuery` :

- reÃ§oit `{ projectId, workId }` et un `qualifiedAt` explicite ;
- dÃ©pend uniquement du membre `GetWorkParticipants` de `PeopleQueryService` ;
- transforme uniquement le rÃ©sultat certifiÃ© en vue Work minimale ;
- ne porte ni commande, ni Ã©vÃ©nement, ni cache, ni persistance ;
- est exportÃ© par la frontiÃ¨re interne existante `work-core.ts` ;
- n'implÃ©mente aucune rÃ¨gle Owner, Participant, rÃ´le, pÃ©riode ou effectivitÃ©.

La vue participant contient uniquement `businessPersonId` et `workAssignmentId`. La qualification contient la source `PEOPLE`, la rÃ©vision, la derniÃ¨re sÃ©quence, l'instant qualifiÃ© et la provenance PEOPLE.

## 7. Liste exacte des fichiers crÃ©Ã©s/modifiÃ©s

CrÃ©Ã©s :

- `server/runtime/work/work-people.query.ts` ;
- `server/runtime/work/work-people.types.ts` ;
- `server/runtime/work/work-people.test.ts` ;
- `Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01_REPORT.md`.

ModifiÃ© :

- `server/runtime/work/work-core.ts`, uniquement pour exporter la nouvelle frontiÃ¨re interne et ses types.

Aucun fichier sous `server/domain/people`, `server/nova-core`, `server/nova-bff`, `tools`, `apps` ou `client` n'a Ã©tÃ© modifiÃ© par cette mission.

## 8. Preuve des quatre Ã©tats

| Ã‰tat contractuel | Discriminant Work | DonnÃ©es fabriquÃ©es | Preuve |
|---|---|---|---|
| PEOPLE indisponible | `PEOPLE_UNAVAILABLE` | aucune collection, aucun participant | T1 PASS |
| PEOPLE disponible, WorkPeople absent | `WORK_PEOPLE_ABSENT` | aucun participant | T2 PASS |
| WorkPeople prÃ©sent, zÃ©ro Participant actif | `NO_ACTIVE_PARTICIPANTS` | collection vide valide issue d'une Query qualifiÃ©e | T3 PASS |
| Participants disponibles | `PARTICIPANTS_AVAILABLE` | projection minimale des Assignments qualifiÃ©es par PEOPLE | T4 PASS |

Les quatre cas ont des discriminants distincts. L'indisponibilitÃ© n'est jamais transformÃ©e en absence ou en collection vide.

## 9. Preuve Business Person â‰  Technical Agent

- la Query n'importe aucun modÃ¨le `RuntimeAgent` ou Technical Agent ;
- son constructeur n'accepte qu'une source PEOPLE limitÃ©e Ã  `GetWorkParticipants` ;
- la projection participant ne contient aucun `agentId`, scope ou Mission technique ;
- T8 utilise volontairement un Technical Agent portant la mÃªme chaÃ®ne d'identifiant qu'une Business Person : lorsque PEOPLE est indisponible, le rÃ©sultat reste `PEOPLE_UNAVAILABLE` et aucun fallback n'est produit ;
- tous les tests Work Technical Agent existants restent PASS.

## 10. Preuve d'absence de duplication PEOPLE

- aucune table, migration, repository, cache, snapshot ou index n'a Ã©tÃ© ajoutÃ© cÃ´tÃ© Work ;
- aucune copie de `BusinessPerson`, `WorkPeople`, `WorkAssignment` ou `RoleAssignment` n'est stockÃ©e ;
- les Assignments retournÃ©es sont immÃ©diatement rÃ©duites aux deux identifiants nÃ©cessaires ;
- aucune responsabilitÃ© ni aucun rÃ´le n'est recalculÃ© ;
- T7 compare l'Ã©tat Business Person, l'Ã©tat WorkPeople et l'histoire avant/aprÃ¨s lecture : ils sont identiques.

## 11. Matrice des tests

| Test | Objet | RÃ©sultat final observÃ© |
|---|---|---|
| T1 | PEOPLE indisponible | PASS |
| T2 | WorkPeople absent | PASS |
| T3 | zÃ©ro Participant actif | PASS |
| T4 | Participants disponibles | PASS |
| T5 | Owner | N/A â€” Owner ne fait pas partie de la lecture minimale requise ; aucune logique Owner Work n'a Ã©tÃ© crÃ©Ã©e |
| T6 | temporalitÃ© explicite Ã  deux instants | PASS |
| T7 | read-only, zÃ©ro commande/Ã©vÃ©nement/copie | PASS |
| T8 | Business Person â‰  Technical Agent, zÃ©ro fallback | PASS |
| T9 | non-rÃ©gression Work | PASS â€” 51/51 |
| PEOPLE | non-rÃ©gression du domaine et du read path importÃ© | PASS â€” 37/37 |
| TypeScript | `tsconfig.nova-core.json` | PASS |

## 12. Commandes rÃ©ellement exÃ©cutÃ©es

Commandes de validation finales :

```text
node --import tsx --test server/runtime/work/work-people.test.ts
node --import tsx --test server/runtime/work/*.test.ts
node --import tsx --test server/domain/people/*.test.ts
.\node_modules\.bin\tsc.cmd -p tsconfig.nova-core.json --noEmit
git diff --check
git status --short
```

ContrÃ´les d'inspection exÃ©cutÃ©s : `git status --short`, `Test-Path`/lecture JSON de la certification, lecture du contrat canonique, inventaires `rg --files`, lectures ciblÃ©es des sources et tests Work/PEOPLE, scans `rg` de la nouvelle frontiÃ¨re.

Incidents intermÃ©diaires consignÃ©s :

- `npx tsc -p tsconfig.nova-core.json --noEmit` n'a pas dÃ©marrÃ©, car PowerShell interdit le chargement de `npx.ps1` ; le binaire `.cmd` a ensuite Ã©tÃ© utilisÃ© ;
- un premier typecheck via `.cmd` a dÃ©tectÃ© TS2322 sur le type du tableau vide ; le type a Ã©tÃ© corrigÃ© sans modifier le comportement ;
- une commande d'inspection contenant `||` a Ã©tÃ© rejetÃ©e par le parseur PowerShell avant exÃ©cution ; elle a Ã©tÃ© relancÃ©e avec une syntaxe PowerShell valide.

## 13. RÃ©sultats rÃ©els

- tests ciblÃ©s finaux : 8 tests, 8 PASS, 0 FAIL ;
- suite Work finale : 51 tests, 51 PASS, 0 FAIL ;
- suite PEOPLE finale : 37 tests, 37 PASS, 0 FAIL ;
- typecheck final : exit code 0, aucune sortie d'erreur ;
- aucun test non exÃ©cutÃ© n'est dÃ©clarÃ© PASS.

## 14. Non-rÃ©gressions

La suite PEOPLE 37/37 couvre l'Authority, la Persistence, les Commands et les neuf Queries. La suite Work 51/51 couvre Identity/Core Foundation, Objective, Lifecycle/Progress, Deliverables, Decisions, Technical Agent et la nouvelle intÃ©gration. Aucun comportement existant n'a Ã©tÃ© modifiÃ© dans ces domaines.

Aucune route HTTP, API, BFF, UI, infrastructure CEREBRAU/NOVA ou workflow OFFER n'a Ã©tÃ© crÃ©Ã© ou modifiÃ©.

## 15. `git diff --check`

RÃ©sultat observÃ© avant rÃ©daction du rapport : PASS, exit code 0. Git a seulement Ã©mis des avertissements de normalisation LF/CRLF sur des fichiers suivis dÃ©jÃ  modifiÃ©s dans le worktree, sans erreur de whitespace.

Le contrÃ´le a Ã©tÃ© rÃ©exÃ©cutÃ© aprÃ¨s crÃ©ation du rapport : PASS, exit code 0, avec les mÃªmes avertissements LF/CRLF non bloquants.

## 16. Risques rÃ©siduels

- le worktree reste fortement sale Ã  cause de changements prÃ©existants hors mission ; leur intÃ©gritÃ© a Ã©tÃ© prÃ©servÃ©e mais leur contenu n'est pas certifiÃ© par ce rapport ;
- la frontiÃ¨re qualifie volontairement toute exception du read path PEOPLE comme `PEOPLE_UNAVAILABLE` sans exposer de dÃ©tail technique ;
- Owner et les lectures par rÃ´le ne sont pas exposÃ©s, car aucun consommateur Work de cette mission ne les exige ; ils devront, si nÃ©cessaire ultÃ©rieurement, dÃ©lÃ©guer aux Queries PEOPLE certifiÃ©es correspondantes ;
- aucun cache n'existe : la disponibilitÃ© de la lecture dÃ©pend directement de PEOPLE, conformÃ©ment au contrat.

## 17. Verdict unique

Tous les critÃ¨res de sortie de P3-PEOPLE-001G-M01 sont satisfaits. Ce rapport ne certifie pas P3-PEOPLE-001G et n'ouvre aucun lot suivant.

GO — P3-PEOPLE-001G-M01

