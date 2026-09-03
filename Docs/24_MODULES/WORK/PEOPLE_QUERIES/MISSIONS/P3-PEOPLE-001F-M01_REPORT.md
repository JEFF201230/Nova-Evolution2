# P3-PEOPLE-001F-M01 — PEOPLE INTERNAL QUERIES

## 1. Préconditions

- Contrat canonique lu : `Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md`, lot P3-PEOPLE-001F.
- `P3-PEOPLE-001C` : statut officiel `CERTIFIED`.
- `P3-PEOPLE-001D` : statut officiel `CERTIFIED`.
- `P3-PEOPLE-001E` : statut officiel `CERTIFIED`, avec `NextAuthorizedLot: P3-PEOPLE-001F`.
- Préflight `git status --short` exécuté avant toute écriture.
- Le worktree était déjà modifié, notamment sur la persistence PEOPLE, les certifications 001D/001E, les rapports 001D et le service Commands. Ces changements ont été capturés comme préexistants et n'ont fait l'objet d'aucun reset, stash, revert ou suppression.
- Aucun fichier `AGENTS.md` applicable n'a été trouvé.

## 2. Composants réutilisés

- `PeoplePersistencePorts`, `BusinessPersonRepository.load`, `WorkPeopleRepository.load` et `WorkPeopleRepository.readHistory`.
- `PeopleAggregatePersistenceStore` et les tables courantes certifiées de 001D.
- `BusinessPerson`, `WorkPeople`, `WorkAssignment`, `RoleAssignment` et les Value Objects PEOPLE.
- `WorkPeople.assignments`.
- `WorkAssignment.isParticipantAt(instant)`.
- `WorkAssignment.hasRoleAt(role, instant)`.
- `WorkAssignment.roleAssignments` et `WorkAssignment.provenanceTrail`.
- `RoleAssignment.provenanceTrail`.
- `BusinessRole.of` pour `OWNER`, `CONTRIBUTOR`, `REVIEWER` et `APPROVER`.
- `PeopleHistoryEvent` et la pagination certifiée `readHistory`.

Ni agrégat, ni règle métier, ni journal, ni commande, ni mécanisme de persistence n'ont été recréés.

## 3. Gap réellement constaté

Aucun service Query PEOPLE équivalent n'existait.

Les lectures par `BusinessPersonId` et `WorkReference`, les qualifications temporelles et l'historique Work People existaient déjà. Deux navigations internes manquaient : retrouver les têtes Work People propriétaires à partir d'un `BusinessPersonId`, et retrouver la tête propriétaire à partir d'un `WorkAssignmentId`.

La persistence certifiée contient déjà `people_work_assignment`, avec `business_person_id`, `work_assignment_id`, `project_identity` et `work_identity`. Cette table est synchronisée dans la transaction du commit Work People et vérifiée avec la tête et l'histoire lors de chaque `load`. Le gap ne nécessitait donc ni table, ni migration, ni projection, ni framework, ni source supplémentaire.

## 4. Fichiers créés ou modifiés

Créés :

- `server/domain/people/people-query-service.ts` ;
- `server/domain/people/people-query-service.test.ts` ;
- `Docs/24_MODULES/WORK/PEOPLE_QUERIES/MISSIONS/P3-PEOPLE-001F-M01_REPORT.md`.

Modifiés au titre de 001F :

- `server/domain/people/people-persistence-ports.ts` : ajout de `loadByPerson` et `loadByAssignment` au port interne Work People ;
- `server/domain/people/people-persistence-aggregate-store.ts` : résolution des WorkReference depuis les lignes autoritatives existantes, puis relecture systématique par `loadWorkPeople`.

Non modifiés : schéma, migrations, `server/domain/people/index.ts`, contrats, certifications, registry, Runtime, Core, BFF, Work, tools, apps et client.

## 5. Architecture finale du read path

```text
PeoplePersistencePorts
  ├─ BusinessPersonRepository.load
  └─ WorkPeopleRepository
       ├─ load
       ├─ loadByPerson ──> WorkReference ──> load vérifié contre l'histoire
       ├─ loadByAssignment ──> WorkReference ──> load vérifié contre l'histoire
       └─ readHistory
             ↓
      PeopleQueryService
             ↓
 résultat absent, présent ou qualifié
 + revision + lastEventSequence + PeopleProvenance
 + instant explicite pour les sélections temporelles
```

`PeopleQueryService` n'importe ni `PeopleAuthority`, ni `PeopleCommandService`, et n'appelle aucun `commit`. Aucun export n'a été ajouté à `server/domain/people/index.ts` : il n'existe aucune exposition publique/API/BFF.

## 6. Traitement exact de GetPersonAssignments

1. `BusinessPersonRepository.load` distingue d'abord la personne absente de la personne reconnue sans affectation.
2. `WorkPeopleRepository.loadByPerson` lit uniquement les couples WorkReference déjà présents dans `people_work_assignment` pour cette personne.
3. Chaque référence est rechargée par le chemin autoritatif `loadWorkPeople`, lequel compare la tête courante à sa réhydratation historique.
4. `PeopleQueryService` sélectionne dans `WorkPeople.assignments` les entités dont `personId` est le `BusinessPersonId` demandé.
5. Les filtres optionnels de statut et de chevauchement de période délèguent à `AssignmentStatus.equals` et `AssignmentPeriod.overlaps`.
6. Chaque ligne conserve son WorkReference, son WorkAssignment et la qualification de sa tête propriétaire.

Une personne reconnue sans affectation retourne `QUALIFIED` avec une collection vide. Une personne absente retourne `AGGREGATE_ABSENT`.

## 7. Preuve d'absence d'index autoritatif

Aucun index secondaire n'a été créé. La navigation utilise directement la relation déjà persistée dans l'état courant certifié de l'agrégat Work People. Elle ne retourne jamais une ligne comme vérité autonome : la ligne sert seulement à retrouver un WorkReference, puis la tête Work People est relue et vérifiée contre le journal canonique.

La relation est transactionnellement synchronisée dans le commit Work People existant. Elle est reconstructible par les mécanismes 001D de restauration/réhydratation de l'état depuis l'histoire. Le test 001F redémarre la base, recrée le store et retrouve les deux affectations de la personne depuis leurs agrégats propriétaires. Aucun cache, table, migration ou projection 001F n'existe à supprimer ou à reconstruire.

## 8. Matrice des neuf queries

| Query canonique | Source | Qualification / résultat | Preuve ciblée |
|---|---|---|---|
| GetBusinessPerson | `businessPersons.load` | `PRESENT` avec identité, provenance, revision et séquence ; ou `AGGREGATE_ABSENT` | présent, absent, état inchangé |
| GetWorkPeople | `workPeople.load` | tête cohérente avec provenance, revision et séquence ; ou absence | présent, absent, état inchangé |
| GetWorkOwner | Work People + `hasRoleAt(OWNER, instant)` | zéro ou un assignment, instant explicite | Owner avant/après début, Work sans Owner |
| GetWorkParticipants | Work People + `isParticipantAt(instant)` | collection qualifiée, vide autorisé | actifs seulement, vide, suspended et ended exclus |
| GetWorkContributors | Work People + `hasRoleAt(CONTRIBUTOR, instant)` | collection qualifiée | rôle exact et instant explicite |
| GetWorkReviewers | Work People + `hasRoleAt(REVIEWER, instant)` | collection qualifiée | avant/après prise d'effet |
| GetWorkApprovers | Work People + `hasRoleAt(APPROVER, instant)` | collection qualifiée | avant/après prise d'effet, aucune Decision |
| GetPersonAssignments | Business Person + têtes Work People propriétaires | absent ou collection qualifiée par tête | multi-Work, vide, après écriture, après redémarrage |
| GetAssignmentHistory | `loadByAssignment` + `readHistory` certifié | état/rôles/périodes/provenance courants et événements persistés, ordonnés et paginés | événement réel, eventId, séquence, causalité, pagination, absence |

Le prototype de `PeopleQueryService` contient exactement ces neuf méthodes, avec leurs noms canoniques, et aucune dixième query.

## 9. Tests exécutés

### Test ciblé 001F

```text
node --import tsx --test server/domain/people/people-query-service.test.ts
```

Résultat : PASS, 7/7 tests, 0 échec.

### Suite PEOPLE complète obligatoire

```text
node --import tsx --test server/domain/people/*.test.ts
```

Résultat final : PASS, 37/37 tests, 0 échec.

### Typecheck strict PEOPLE

```text
tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node <tous les fichiers server/domain/people/*.ts>
```

Résultat final : PASS, 0 erreur.

### Contrôles de frontière

- neuf méthodes `Get*` exactement : PASS ;
- aucune référence Query hors du service, de son test et du présent rapport : PASS ;
- aucun import/appel Authority, Commands ou `commit` dans le service : PASS ;
- aucune dépendance Runtime/Core/BFF/Work/apps/client : PASS ;
- aucun `new Date()` sans valeur d'entrée dans la sélection : PASS.

## 10. Résultats réels

- Les neuf queries sont opérationnelles.
- Les lectures simples conservent l'agrégat autoritatif et ses métadonnées de cohérence.
- Les résultats temporels utilisent toujours le `Date` fourni et les primitives du domaine.
- Une tête Work absente est distincte d'une tête présente avec Owner nul ou collection vide.
- Une source indisponible reste une erreur typée `PERSISTENCE_UNAVAILABLE`, distincte de `AGGREGATE_ABSENT`.
- Les neuf queries exécutées successivement ne changent ni `total_changes()`, ni le nombre d'événements, ni le nombre de receipts.
- L'historique d'affectation contient uniquement des événements réellement lus dans le journal certifié. Le filtrage conserve les groupes causaux présents dans la provenance autoritative de l'affectation et de ses rôles. Il est borné par `lastEventSequence` de la tête qualifiée.

## 11. Non-régressions

- Suite PEOPLE antérieure et nouvelle : PASS 37/37.
- Persistence 001D inchangée dans son schéma, ses migrations, son atomicité, son journal et ses règles.
- Commands 001E inchangées.
- Aucun événement, receipt ou mutation n'est produit par une Query.
- Aucun appel à PeopleAuthority n'est possible depuis `PeopleQueryService`, qui ne la connaît pas.
- Aucun composant hors `server/domain/people/` et du rapport autorisé n'a été modifié par cette mission.
- Les nombreux changements préexistants du worktree ont été préservés.

## 12. git diff --check

Commande exécutée après implémentation :

```text
git diff --check
```

Résultat : PASS, aucune erreur de whitespace. Les avertissements CRLF affichés concernent des fichiers préexistants et ne constituent pas des erreurs `diff --check`.

## 13. Risques résiduels

- La navigation personne→Works effectue un scan de la table courante en l'absence d'un index dont `business_person_id` serait le premier terme. C'est volontairement le mécanisme MVP minimal ; aucune exigence de volumétrie ne justifie une migration 001F.
- La cohérence globale entre plusieurs agrégats Work People n'est pas présentée comme transaction atomique unique. Chaque ligne de `GetPersonAssignments` expose explicitement la revision et la séquence de sa propre racine propriétaire, conformément au contrat.
- Les événements `OwnerChanged` ne portent pas de WorkAssignmentId dans le contrat d'événement. Leur appartenance à l'histoire d'une affectation est donc conservée par le groupe de causalité réellement présent dans les provenance trails, sans synthétiser d'événement.

## 14. Verdict unique

Les critères GO de M01 sont satisfaits : neuf queries exactes, source PEOPLE autoritative, aucune logique consommatrice ni exposition publique, distinctions absence/vide/indisponibilité, temporalité et provenance démontrées, recherche par personne sans seconde source de vérité, historique certifié, tests et typecheck verts.

GO — P3-PEOPLE-001F-M01
