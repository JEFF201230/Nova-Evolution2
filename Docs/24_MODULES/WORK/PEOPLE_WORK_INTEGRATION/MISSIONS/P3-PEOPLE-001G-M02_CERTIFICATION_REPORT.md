# P3-PEOPLE-001G-M02 — Certification finale Work / PEOPLE Integration

## 1. Préconditions

| Précondition obligatoire | Preuve observée | Résultat |
|---|---|---|
| P3-PEOPLE-001F officiellement certifié | Le certificat 001F et son entrée unique dans le registre portent `Status: CERTIFIED`. | PASS |
| Certificat 001F présent | `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` existe et est un JSON lisible. | PASS |
| 001G autorisé | Le certificat 001F et le registre portent tous deux `NextAuthorizedLot: P3-PEOPLE-001G`. | PASS |
| Rapport M01 présent | `P3-PEOPLE-001G-M01_REPORT.md` existe. | PASS |
| Verdict terminal M01 exact | Dernière ligne non vide : `GO — P3-PEOPLE-001G-M01` ; le séparateur est le point de code U+2014 et les octets UTF-8 `E2 80 94`. | PASS |
| Fichiers d'intégration présents | Les quatre fichiers TypeScript annoncés et le rapport M01 existent réellement. | PASS |
| Lot suivant non ouvert par M01 | Aucun fichier dont le nom contient `P3-PEOPLE-001H` n'existe ; 001H apparaît seulement comme lot futur dans les sources documentaires. | PASS |

Toutes les préconditions obligatoires sont satisfaites.

## 2. État Git initial

`git status --short` a été exécuté avant toute écriture M02. Le worktree était déjà fortement sale.

État préexistant observé :

- certifications : `P3-PEOPLE-001D.certification.json` et `certification-registry.json` modifiés ; certificats 001E et 001F non suivis ;
- architecture PEOPLE Persistence : treize documents suivis modifiés, plus des missions et rapports non suivis ;
- domaine PEOPLE : onze fichiers de persistance/Authority suivis modifiés et des fichiers Commands, Queries, Migrations et Recovery non suivis ;
- M01 : `work-core.ts` modifié, `work-people.query.ts`, `work-people.types.ts`, `work-people.test.ts` et le rapport M01 non suivis ;
- autres éléments hors mission : rapports racine, `tools/cerebrau/`, `tools/nova-core-runtime/mission.json` et `tools/nova-core-runtime/reports/` non suivis.

Ces changements ont été considérés comme préexistants. Aucun `reset`, `checkout`, `restore`, `stash` ou revert n'a été exécuté. M02 ne modifie aucun fichier hors de sa liste d'écriture autorisée.

## 3. Sources canoniques examinées

- `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md`, lu intégralement, notamment les sections 2, 3, 9, 11, 12, 15, 16 et 17 ;
- `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` ;
- `Docs/12_CERTIFICATION/certification-registry.json` ;
- `Docs/12_CERTIFICATION/LOT_CERTIFICATION_CONTRACT.md` pour le schéma officiel ;
- `Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01_REPORT.md` ;
- implémentation et tests M01 réels ;
- read path PEOPLE et primitives de qualification temporelle ;
- fichiers `work-technical-agent.*`.

Le contrat canonique a prévalu sur les déclarations du rapport M01.

## 4. Fichiers M01 réellement contrôlés

| Fichier | État Git observé avant M02 | Contrôle |
|---|---|---|
| `server/runtime/work/work-people.query.ts` | non suivi | lu intégralement |
| `server/runtime/work/work-people.types.ts` | non suivi | lu intégralement |
| `server/runtime/work/work-people.test.ts` | non suivi | lu intégralement et exécuté |
| `server/runtime/work/work-core.ts` | suivi, modifié | diff contrôlé : exactement 15 lignes additives d'exports Work/People |
| `P3-PEOPLE-001G-M01_REPORT.md` | non suivi | contenu, encodage et verdict terminal contrôlés |

Git ne permet pas d'attribuer historiquement les fichiers non suivis à un commit M01. La concordance est donc établie par l'état Git, le diff suivi, le contenu réel et la liste explicite du rapport M01, sans prétendre à une preuve de commit inexistante.

## 5. Matrice A — chemin de lecture

PASS.

Chemin réel contrôlé :

`People persistence certifiée -> PeopleQueryService.GetWorkParticipants -> WorkPeopleQuery.get -> export interne work-core.ts -> consommateur interne Work`

`WorkPeopleReadSource` est exactement un `Pick<PeopleQueryService, "GetWorkParticipants">`. La méthode d'intégration appelle cette seule Query, laquelle charge `persistence.workPeople` puis délègue la qualification Participant à `WorkAssignment.isParticipantAt`. Aucun autre fichier de production hors `server/runtime/work` ne référence la frontière. Aucune seconde voie autoritative PEOPLE n'est créée.

## 6. Matrice B — read only

PASS.

- `WorkPeopleQuery` ne reçoit aucun agrégat Work mutable et ne modifie aucun état Work ;
- elle n'appelle aucune Command PEOPLE et n'importe aucun Command Service ;
- elle n'émet aucun événement et ne crée aucun command receipt ;
- elle n'appelle que `GetWorkParticipants`, dont le test PEOPLE compare avant/après les nombres d'événements, de receipts et `total_changes()` ;
- T7 compare l'agrégat Business Person, l'agrégat WorkPeople et l'histoire avant/après la lecture ;
- aucune persistence, table, migration, cache, snapshot ou index n'existe dans les fichiers M01 de production ;
- les résultats sont des vues gelées non autoritatives.

## 7. Matrice C — quatre états contractuels

| État | Discriminant réel | Preuve d'implémentation | Preuve exécutée |
|---|---|---|---|
| C1 — PEOPLE indisponible | `PEOPLE_UNAVAILABLE` | une exception de la Query produit uniquement l'état d'indisponibilité, sans participants | T1 PASS |
| C2 — WorkPeople absent | `WORK_PEOPLE_ABSENT` | `AGGREGATE_ABSENT` est conservé comme absence distincte | T2 PASS |
| C3 — WorkPeople présent, zéro Participant actif | `NO_ACTIVE_PARTICIPANTS` | un résultat `QUALIFIED` vide conserve qualification et provenance | T3 PASS |
| C4 — Participants disponibles | `PARTICIPANTS_AVAILABLE` | projection des seuls Assignments retournés par PEOPLE | T4 PASS |

Aucun fallback ne fusionne ces états. C1 et C2 n'exposent pas de collection simulée ; C3 expose une collection vide valide et qualifiée ; C4 ne fabrique aucun Participant.

## 8. Matrice D — Owner et rôles

PASS.

La frontière M01 expose uniquement les Participants. Elle n'expose ni Owner, ni Contributors, ni Reviewers, ni Approvers. La qualification Participant vient exclusivement de `PeopleQueryService.GetWorkParticipants`. Les Queries PEOPLE certifiées conservent séparément `GetWorkOwner`, `GetWorkContributors`, `GetWorkReviewers` et `GetWorkApprovers`. Aucune règle locale de rôle, Assignment, période, statut, Owner unique ou effectivité n'existe dans Work.

## 9. Matrice E — temporalité

PASS.

L'instant `qualifiedAt` est obligatoire, explicitement fourni et validé avant lecture. Une copie déterministe de cet instant est transmise à la Query PEOPLE. La sélection temporelle reste dans `WorkAssignment.isParticipantAt` et `AssignmentPeriod.contains`, côté PEOPLE. T6 contrôle deux instants et le test d'entrée invalide prouve le rejet avant consultation de PEOPLE. Aucune horloge implicite ni règle temporelle parallèle n'est introduite dans Work.

## 10. Matrice F — Business Person, RuntimeAgent et Technical Agent

PASS.

`Business Person ≠ RuntimeAgent ≠ Technical Agent` est préservé :

- la vue PEOPLE contient seulement `businessPersonId` et `workAssignmentId` ;
- elle ne contient aucun `agentId`, `missionTypes`, `authorizedScopes` ou identité technique enrichie ;
- `work-technical-agent.query.ts` résout exclusivement `RuntimeMission.assignedAgentId` dans le registre `RuntimeAgent` ;
- `work-technical-agent.service.ts` refuse une association technique incohérente et n'importe aucun concept PEOPLE ;
- aucun Technical Agent ne reçoit Owner, Participant ou Business Person ;
- T8 utilise volontairement la même chaîne pour un identifiant technique et métier : l'indisponibilité PEOPLE reste C1, sans fallback ni conversion ;
- les huit tests `work-technical-agent` inclus dans la suite Work passent.

## 11. Matrice G — ownership et duplication

PASS.

PEOPLE reste propriétaire de BusinessPerson, WorkPeople, WorkAssignment, RoleAssignment, rôles, temporalité et provenance. Work ne conserve qu'une projection éphémère de deux identifiants et une qualification de lecture. Aucun agrégat, table, snapshot autoritatif, cache persistant, journal, index ou repository PEOPLE n'est ajouté dans Work.

## 12. Matrice H — Work Phase 1

PASS.

Le seul fichier Work suivi modifié par M01, `work-core.ts`, reçoit 15 lignes d'exports additives. Aucun comportement existant n'est remplacé. La suite Work passe 51/51 et couvre Identity/Core Foundation, Objective, Lifecycle, Progress, Deliverables, Decisions, Technical Agent et l'intégration PEOPLE. La suite Runtime passe 24/24 et la suite Core passe 541/541.

## 13. Matrice I — frontières

PASS.

Les scans de références ne trouvent l'intégration de production que dans `work-people.query.ts`, `work-people.types.ts` et les exports de `work-core.ts`. Aucun usage n'est trouvé dans `server/nova-bff`, `server/nova-core`, `apps` ou `client`. 001G n'ajoute aucune API publique, route HTTP, BFF, DTO public, interface frontend, page, dashboard, persistence, modification CEREBRAU/NOVA Core ou fonctionnalité 001H.

## 14. Matrice J — OFFER

PASS.

`git status --short` ne contient aucun chemin OFFER et aucun fichier M01 ne se situe dans un workflow OFFER. Aucun import, type ou comportement OFFER n'est présent dans l'intégration Work/People.

## 15. Matrice K — tests et non-régression

PASS. Toutes les validations obligatoires réellement exécutées sont passantes.

| Commande réellement exécutée | Résultat réel |
|---|---|
| `node --import tsx --test server/runtime/work/work-people.test.ts` | PASS — 8/8, 0 fail |
| `node --import tsx --test server/runtime/work/*.test.ts` | PASS — 51/51, 0 fail |
| `node --import tsx --test server/domain/people/*.test.ts` | PASS — 37/37, 0 fail |
| `.\node_modules\.bin\tsc.cmd -p tsconfig.nova-core.json --noEmit` | PASS — exit code 0, aucune erreur |
| `npm.cmd run test:runtime` | PASS — 24/24, 0 fail |
| `npm.cmd run test:core` | PASS — 541/541, 0 fail |
| `git diff --check` | PASS — exit code 0 |
| `git diff --check -- server/runtime/work/work-core.ts` | PASS — exit code 0 |

Les avertissements Git LF/CRLF concernent des fichiers suivis déjà modifiés ; aucune erreur de whitespace n'a été signalée. Le contrôle global porte sur les différences suivies du worktree et n'inclut pas les fichiers non suivis. Le contrôle ciblé porte exactement sur le seul fichier M01 suivi, `work-core.ts` ; il n'est pas présenté comme une preuve des fichiers non suivis.

Un diagnostic supplémentaire a ensuite été exécuté sur chaque artefact 001G non suivi avec `git diff --no-index --check -- NUL <fichier>`. Le code 1 signifie seulement que le fichier diffère du flux vide `NUL`. Résultats exacts :

- `work-people.query.ts`, `work-people.types.ts`, `work-people.test.ts`, le certificat 001G et le présent rapport M02 : exit code 1 attendu, zéro diagnostic whitespace ;
- rapport M01 : exit code 3, diagnostic `new blank line at EOF` à la ligne 185.

Ce diagnostic supplémentaire ne remet pas en cause le PASS du contrôle Git obligatoire sur les différences suivies. La ligne vide finale du rapport M01 est une anomalie documentaire non fonctionnelle et non ambiguë ; M02 ne l'a pas réécrite, conformément à l'interdiction explicite de modifier un fichier M01.

Une tentative non mutante de timestamp, `Get-Date -AsUTC -Format o`, a échoué parce que la version PowerShell ne possède pas le paramètre `AsUTC`. Le timestamp réel a ensuite été obtenu avec `[DateTime]::UtcNow.ToString('o')`. Cet incident ne concerne aucune validation fonctionnelle.

## 16. État de l'encodage du rapport M01

Le diagnostic strict établit :

- décodage UTF-8 strict : PASS ;
- BOM UTF-8 : présent ;
- caractères de remplacement U+FFFD : zéro ;
- le corps contient réellement du mojibake, par exemple `critÃ¨res` au lieu de `critères` ; il ne s'agit donc pas uniquement d'un affichage console ;
- le verdict terminal n'est pas corrompu : `GO — P3-PEOPLE-001G-M01`, avec U+2014 encodé `E2 80 94` ;
- les identifiants, commandes, résultats, nombres et preuves restent exploitables sans ambiguïté.

Conclusion : risque documentaire non bloquant. Le rapport M01 n'a pas été réécrit.

## 17. Fichiers créés/modifiés par M02

- créé : `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001G.certification.json` ;
- modifié : `Docs/12_CERTIFICATION/certification-registry.json`, uniquement par ajout de l'entrée 001G ;
- créé : `Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M02_CERTIFICATION_REPORT.md`.

Aucun fichier TypeScript ni fichier M01 n'a été modifié par M02.

## 18. État de la certification officielle

`P3-PEOPLE-001G.certification.json` est créé selon les dix propriétés exactes du contrat officiel : identité, statut `CERTIFIED`, timestamp UTC réel, preuves, tests réels, `Regressions: NONE`, précédent 001F et prochain lot explicitement défini par le contrat canonique.

Le contrat, sections 16.1 et 17.2, identifie explicitement `P3-PEOPLE-001H` comme lot immédiatement suivant. Le champ `NextAuthorizedLot: P3-PEOPLE-001H` enregistre cette continuité ; aucun artefact ni mission 001H n'est créé ou ouvert par M02.

## 19. État du registry

Le registre conserve `SchemaVersion: 1`. Une seule entrée 001G est ajoutée avec les six propriétés conventionnelles, le chemin du certificat, `Status: CERTIFIED`, `PreviousLot: P3-PEOPLE-001F` et `NextAuthorizedLot: P3-PEOPLE-001H`. Aucune entrée antérieure n'est modifiée par M02.

## 20. Risques résiduels

- le worktree demeure fortement sale avec des changements préexistants hors 001G ; ils ont été préservés mais ne sont pas certifiés par M02 ;
- les fichiers M01 non suivis ne disposent pas d'une attribution historique par commit ; leur contrôle repose sur leur état réel, leur contenu, le diff suivi et le rapport M01 ;
- le rapport M01 contient du mojibake réel non bloquant ; son verdict et ses preuves techniques restent non ambigus ;
- le diagnostic Git supplémentaire sur le rapport M01 signale une ligne vide finale ; elle est non fonctionnelle et le fichier M01 est volontairement préservé ;
- le `git diff --check` global ne contrôle pas les fichiers non suivis, limite explicitement conservée dans le présent rapport.

Aucun risque résiduel identifié ne remet en cause le contrat fonctionnel 001G.

## 21. Décision terminale unique

Toutes les préconditions, matrices A à K, validations obligatoires et preuves requises sont satisfaites. Aucune correction fonctionnelle n'a été nécessaire ou effectuée. Le lot suivant n'est pas ouvert.

GO — P3-PEOPLE-001G-M02 — P3-PEOPLE-001G CERTIFIED
