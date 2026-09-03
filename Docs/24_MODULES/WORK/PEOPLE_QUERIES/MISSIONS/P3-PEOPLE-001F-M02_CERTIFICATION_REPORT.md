# P3-PEOPLE-001F-M02 — Rapport de certification finale People Queries

## 1. Préconditions

| Précondition | Résultat | Preuve |
|---|---|---|
| P3-PEOPLE-001E officiellement certifié | PASS | `P3-PEOPLE-001E.certification.json` porte `Status: CERTIFIED` et le registry référence 001E comme `CERTIFIED`. |
| Rapport P3-PEOPLE-001F-M01 présent | PASS | `Docs/24_MODULES/WORK/PEOPLE_QUERIES/MISSIONS/P3-PEOPLE-001F-M01_REPORT.md` existe. |
| Verdict terminal M01 conforme | PASS | Dernière ligne : `GO — P3-PEOPLE-001F-M01`. |
| Neuf Queries canoniques implémentées | PASS | Le prototype de `PeopleQueryService` contient exactement les neuf méthodes contractuelles ; le test d'énumération passe. |
| Aucun développement P3-PEOPLE-001G ouvert | PASS | Aucune référence 001G exécutable ni aucun changement Work/BFF/API/frontend ; les occurrences trouvées sont documentaires (plan, contrat et prompts). |

La chaîne officielle vérifiée est 001B `CERTIFIED` → 001C `CERTIFIED` → 001D `CERTIFIED` → 001E `CERTIFIED`. Les audits généraux de 001C, 001D et 001E n'ont pas été rejoués.

## 2. Matrice A — Neuf Queries

| Query | État | Preuve examinée |
|---|---|---|
| GetBusinessPerson | PASS | Lecture `businessPersons.load`, résultat présent ou `AGGREGATE_ABSENT`. |
| GetWorkPeople | PASS | Lecture `workPeople.load`, tête et qualification cohérentes ou absence. |
| GetWorkOwner | PASS | Filtre `hasRoleAt(OWNER, instant)`, résultat nul ou unique. |
| GetWorkParticipants | PASS | Filtre `isParticipantAt(instant)`. |
| GetWorkContributors | PASS | Filtre `hasRoleAt(CONTRIBUTOR, instant)`. |
| GetWorkReviewers | PASS | Filtre `hasRoleAt(REVIEWER, instant)`. |
| GetWorkApprovers | PASS | Filtre `hasRoleAt(APPROVER, instant)`. |
| GetPersonAssignments | PASS | Personne autoritative puis têtes WorkPeople propriétaires. |
| GetAssignmentHistory | PASS | Tête propriétaire puis journal PEOPLE persistant. |

Le test `PeopleQueryService exposes exactly the nine canonical internal queries` passe. Aucun dixième membre Query n'existe sur le prototype. Le service n'est pas exporté par `server/domain/people/index.ts`.

## 3. Matrice B — Source autoritative

PASS. Toutes les lectures passent par `PeoplePersistencePorts`. `loadByPerson` et `loadByAssignment` n'utilisent `people_work_assignment` que pour retrouver un `WorkReference`, puis appellent systématiquement `loadWorkPeople`. Cette lecture compare la tête courante à la réhydratation du journal PEOPLE et échoue en cas de divergence. Aucun cache, projection, table ou journal propre à 001F n'a été créé. La navigation demeure reconstructible à partir de l'état et de l'histoire PEOPLE certifiés.

## 4. Matrice C — Read only

PASS. `PeopleQueryService` ne connaît ni `PeopleAuthority`, ni `PeopleCommandService`, ni `commit`. Le test exécute les neuf Queries et constate l'égalité avant/après de `total_changes()`, du nombre d'événements et du nombre de command receipts. Aucun événement, reçu ou commande n'est produit et aucune seconde PeopleAuthority n'est introduite.

## 5. Matrice D — Absence, vide et indisponibilité

PASS.

- Agrégat absent : `AGGREGATE_ABSENT`.
- Agrégat présent sans résultat : `QUALIFIED` avec `assignment: null` ou collection vide.
- Personne reconnue sans affectation : `QUALIFIED` avec `assignments: []`.
- Source indisponible : l'erreur typée `PERSISTENCE_UNAVAILABLE` remonte sans être convertie en absence.

Aucune donnée absente n'est synthétisée.

## 6. Matrice E — Temporalité

PASS. Owner, Participants, Contributors, Reviewers et Approvers reçoivent un instant explicite validé. Les sélections délèguent exclusivement à `WorkAssignment.isParticipantAt` et `WorkAssignment.hasRoleAt`, cette dernière déléguant aussi à `RoleAssignment.isEffectiveAt`. Aucune règle de période ou de statut n'est dupliquée dans la couche Query.

## 7. Matrice F — Provenance et cohérence

PASS. Les résultats portent la révision de l'agrégat, sa dernière séquence événementielle et une `PeopleProvenance` issue de la tête réellement chargée. Les résultats temporels conservent en plus une copie validée de l'instant de qualification. Les assignments et rôles retournés conservent leurs propres périodes et provenance certifiées. Aucun indicateur artificiel n'est certifié.

## 8. Matrice G — GetPersonAssignments

PASS.

- Plusieurs assignments : une personne est retrouvée sur deux Works distincts.
- Aucun assignment : une personne reconnue retourne une collection vide qualifiée.
- Personne absente : `AGGREGATE_ABSENT`.
- Cohérence : chaque ligne provient de la tête WorkPeople propriétaire relue et vérifiée contre son histoire.
- Pas de seconde autorité : aucune projection 001F ; la table courante certifiée sert seulement à résoudre les références.
- Reconstruction : le test ferme et rouvre SQLite, recrée le store, puis retrouve les mêmes assignments depuis les têtes propriétaires.

## 9. Matrice H — GetAssignmentHistory

PASS. La Query résout l'affectation dans la tête WorkPeople, lit `workPeople.readHistory`, borne les événements à `lastEventSequence`, conserve les groupes de causalité issus des provenance trails certifiés et respecte l'ordre des `streamSequence`.

Le test observe des événements persistés réels (`PEOPLE_ASSIGNED`, `PARTICIPANT_ADDED`, `APPROVER_ASSIGNED`), vérifie leurs `eventId`, séquences et `causationId`, contrôle deux pages et qualifie correctement un identifiant absent. Aucun second journal n'existe.

## 10. Matrice I — Frontières

PASS. Les recherches dans le dépôt ne trouvent `PeopleQueryService` que dans son fichier, son test et la documentation 001F. Aucun export public, API, BFF, intégration Work, interface frontend, nouvelle commande, mutation Runtime ou CEREBRAU, ni fonctionnalité 001G n'est introduit.

## 11. Matrice J — Tests et commandes exécutées

Commandes réellement exécutées pendant M02 :

```text
node --import tsx --test server/domain/people/*.test.ts
```

Résultat réel : PASS, 37 tests, 37 réussites, 0 échec, 0 annulé, 0 ignoré.

```text
$peopleFiles = Get-ChildItem server/domain/people -Filter *.ts
.\node_modules\.bin\tsc.cmd --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node @peopleFiles
```

Résultat réel : PASS, 30 fichiers TypeScript contrôlés, 0 erreur.

Le gate 001F n'impose pas de suite plus large que la suite PEOPLE et son typecheck strict. Aucune autre commande n'est déclarée PASS.

## 12. Matrice K — Non-régression

PASS. Les 37 tests PEOPLE couvrent les tests Authority, commandes, persistence et Queries. Ils confirment notamment le producteur unique, l'Owner unique, les transactions atomiques, le CAS, l'idempotence, la durabilité, l'histoire append-only, la réhydratation, la causalité et l'absence de mutation par les lectures. Aucun composant antérieurement certifié n'a été modifié pendant M02 pour obtenir ce résultat.

## 13. Preuves examinées

- `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md`, notamment sections 3.4, 9, 16 et 17.
- Certifications officielles PEOPLE 001B, 001C, 001D et 001E, plus `certification-registry.json`.
- Rapport M01 et son verdict terminal.
- `people-query-service.ts` et `people-query-service.test.ts`.
- Ports et store de persistence pour `load`, `loadByPerson`, `loadByAssignment` et `readHistory`.
- Primitives `WorkAssignment` et `RoleAssignment` utilisées pour la temporalité.
- `server/domain/people/index.ts` et les références globales au service Query pour les frontières.
- Sorties réelles des tests, du typecheck et des contrôles Git.

## 14. Fichiers créés ou modifiés par M02

Créés :

- `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json` ;
- `Docs/24_MODULES/WORK/PEOPLE_QUERIES/MISSIONS/P3-PEOPLE-001F-M02_CERTIFICATION_REPORT.md`.

Modifié :

- `Docs/12_CERTIFICATION/certification-registry.json`, par ajout de l'entrée 001F uniquement.

Aucun autre fichier n'a été modifié par M02. Les nombreux changements préexistants du worktree ont été conservés.

## 15. État de la certification officielle et du registry

- Certification officielle 001F : créée selon le schéma existant, `Status: CERTIFIED`, `PreviousLot: P3-PEOPLE-001E`, `NextAuthorizedLot: P3-PEOPLE-001G`.
- Registry : entrée 001F ajoutée selon la convention existante, avec chemin, statut et chaînage cohérents.
- Aucun artefact 001G n'a été créé et 001G n'a pas été ouvert.

## 16. git diff --check et git status --short

`git diff --check` a été exécuté avant puis après la création des artefacts. Résultat final réel : PASS, code retour 0, aucune erreur de whitespace. Les avertissements de conversion LF/CRLF concernent des fichiers préexistants et ne sont pas des erreurs `diff --check`.

`git status --short` a été exécuté après les artefacts. Résultat réel : worktree non propre avec de nombreux changements préexistants, dont les certifications/persistence/commands/Queries PEOPLE non encore suivies ou modifiées ; la sortie montre aussi `?? Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001F.certification.json`, `?? Docs/24_MODULES/WORK/PEOPLE_QUERIES/` et le registry modifié. M02 n'a ni réinitialisé, ni masqué, ni altéré les changements préexistants. Sur le périmètre M02, les seuls effets sont les deux créations et l'ajout registry énumérés à la section 14.

## 17. Risques résiduels

- Le worktree global reste non propre et plusieurs artefacts de la chaîne PEOPLE, dont 001E et l'implémentation 001F, sont non suivis dans l'état Git observé. La décision certifie l'état matériel présent et testé, pas un commit ou un paquetage Git.
- `GetPersonAssignments` effectue un scan de la table courante lorsque l'index disponible ne commence pas par `business_person_id`. Cela affecte potentiellement la performance, pas l'autorité ni la correction, et aucune exigence volumétrique 001F n'impose une migration.
- L'histoire d'affectation conserve un groupe causal complet lorsqu'une même commande concerne plusieurs assignments ; ce comportement est conforme à l'exigence de causalité complète et ne fabrique aucun événement.

## 18. Décision unique

Toutes les préconditions, matrices A à K et validations obligatoires sont PASS. Aucun défaut nécessitant une modification fonctionnelle n'a été constaté.

GO — P3-PEOPLE-001F-M02 — P3-PEOPLE-001F CERTIFIED
