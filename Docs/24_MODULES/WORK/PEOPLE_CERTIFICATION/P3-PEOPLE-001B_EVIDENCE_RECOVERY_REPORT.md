# P3-PEOPLE-001B — EVIDENCE RECOVERY REPORT

> This is a retrospective evidence-recovery document. It is not the original P3-PEOPLE-001B execution report and does not alter the historical certification.

## 1. Nature et périmètre

Ce document consolide, le 2026-08-08, les informations historiquement enregistrées dans la certification officielle B et les observations reproductibles sur l'état courant du dépôt. Il ne reconstitue ni une exécution historique, ni une commande, ni un auteur, ni un timestamp absent.

Source historique officielle : `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001B.certification.json`.

Sources actuelles principales : contrat People, blueprint People, blueprint Work, certification Work Phase 2 et artefacts Foundation sous `server/domain/people/`.

## 2. Certification historique

| Champ | Valeur enregistrée | Qualification |
|---|---|---|
| `MissionId` | `P3-PEOPLE-001B-CERTIFICATION` | HISTORICALLY_RECORDED |
| `DomainId` | `PEOPLE` | HISTORICALLY_RECORDED |
| `LotId` | `P3-PEOPLE-001B` | HISTORICALLY_RECORDED |
| `Status` | `CERTIFIED` | HISTORICALLY_RECORDED |
| `CertifiedAt` | `2026-07-30T21:44:42.6236893+00:00` | HISTORICALLY_RECORDED |
| `Regressions` | `NONE` | HISTORICALLY_RECORDED |
| `PreviousLot` | `P3-PEOPLE-001A` | HISTORICALLY_RECORDED |
| `NextAuthorizedLot` | `P3-PEOPLE-001C` | HISTORICALLY_RECORDED |

La chaîne A → B → C est cohérente avec les entrées courantes du registre. Aucune valeur de la certification n'a été modifiée par cette mission.

## 3. Exigences contractuelles B

Le contrat canonique définit B comme le **People Foundation Model**. Les exigences structurantes sont : deux agrégats `BusinessPerson` et `WorkPeople`, les entités `WorkAssignment` et `RoleAssignment`, les Value Objects et erreurs internes, la protection des invariants, et l'absence dans ce lot de producteur, persistance, commande publique, query, modification Work ou dépendance Runtime/Technical Agent.

## 4. Matrice des preuves

La colonne « historique » signifie uniquement que l'affirmation figure dans le JSON officiel. La colonne « actuel » résulte de l'inspection ou des tests du 2026-08-08.

| Affirmation `Evidence` | Classement | Corroboration actuelle |
|---|---|---|
| Huit fichiers Foundation vérifiés | BOTH | Les huit chemins existent ; aucun n'était modifié dans le préflight Git. |
| Agrégats `BusinessPerson`, `WorkPeople` | BOTH | Deux classes racines avec constructeurs privés et état immuable sont présentes. |
| Entités `WorkAssignment`, `RoleAssignment` | BOTH | Les deux classes existent, sont internes aux frontières attendues et protègent périodes, rôles et provenance. |
| Huit Value Objects annoncés | BOTH | `BusinessPersonId`, `WorkAssignmentId`, `BusinessRole`, `Responsibility`, `AssignmentStatus`, `AssignmentPeriod`, `WorkReference` et `PeopleProvenance` sont présents. |
| Frontière `PeopleAuthorityAccess` / `assertPeopleAuthorityAccess` | BOTH | Les créations Foundation exigent le jeton d'accès canonique ; un faux jeton est rejeté par le test courant. |
| Absence de `ParticipationType` et `ResponsibilityAssignment` | BOTH | Recherche textuelle courante sans résultat dans `server/domain/people`. |
| Foundation sans import Authority ; Authority consomme Foundation ; index Foundation pur | BOTH | Aucun import Authority/persistence/query/command/runtime n'est présent dans les huit artefacts B ; le test d'index passe. |
| Immutabilité, Owner courant unique, assignments canoniques, provenance autoritative, absence de dépendance agent technique | BOTH | Contrôles statiques présents dans les agrégats/entités et scénarios courants People PASS. |

Aucune affirmation structurante indispensable de la certification B n'est contredite par les artefacts actuels examinés.

## 5. Vérifications actuelles

### 5.1 Artefacts

| Artefact | Observation actuelle |
|---|---|
| `business-person.aggregate.ts` | `BusinessPerson`, constructeur privé, reconnaissance gardée, objet gelé. |
| `work-people.aggregate.ts` | `WorkPeople`, assignments canoniques, contrôle des doublons, conflits par personne et Owner unique. |
| `work-assignment.entity.ts` | Statut, période, rôles, provenance causale et cohérence ACTIVE/SUSPENDED/ENDED. |
| `role-assignment.entity.ts` | Périodes ordonnées non chevauchantes et bornes reliées à la provenance. |
| `people.value-objects.ts` | Vocabulaire fermé de sept rôles, trois statuts et huit Value Objects annoncés. |
| `people.errors.ts` | Erreurs métier People typées. |
| `people-foundation-access.ts` | Jeton Foundation canonique et assertion d'identité du jeton. |
| `index.ts` | Exports Foundation uniquement ; aucun export des artefacts Authority. |

Les fichiers de persistance, commandes et queries actuellement présents appartiennent aux lots postérieurs D, E et F. Leur présence actuelle n'est pas présentée comme une preuve de leur présence ou absence historique au moment de B. Les huit artefacts B eux-mêmes ne portent aucune persistance ni query et ne dépendent ni de RuntimeAgent ni de Technical Agent.

### 5.2 CURRENT VERIFICATION

| Commande actuelle | Résultat exact |
|---|---|
| `node --import tsx --test server/domain/people/*.test.ts` | PASS ; 37 tests, 37 pass, 0 fail, code 0. |
| `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node <tous les fichiers server/domain/people/*.ts>` | PASS ; aucun diagnostic, code 0. |
| `npm.cmd run typecheck:nova-core` | PASS ; code 0. |
| `git diff --check` avant écriture | PASS ; code 0. |

Ces résultats sont des **CURRENT VERIFICATION**. Ils ne sont pas les tests historiques de B et ne remplacent pas les valeurs `Tests` enregistrées dans la certification.

## 6. Preuves historiques enregistrées mais non rejouées

Le JSON enregistre : typecheck strict People PASS, compilation ciblée de 13 fichiers PASS, tests People 10/10, typecheck NOVA Core PASS, tests Runtime 24/24, tests Core 506/506 et `git diff --check` PASS. Ces mentions sont `HISTORICALLY_RECORDED` uniquement. La certification ne donne pas les commandes exactes de toutes ces exécutions, leurs sorties brutes, leur environnement, leur timestamp individuel ou leur rapport d'exécution original.

## 7. Éléments non reconstructibles

- commande historique exacte pour chaque ligne de test ;
- sortie brute historique ;
- timestamp individuel des tests ;
- identité de l'auteur ou de l'exécutant ;
- contenu et chemin d'un rapport d'exécution B original ;
- contexte Git exact de l'exécution ayant conduit à la certification.

Ces éléments restent `UNKNOWN`.

## 8. Conclusion documentaire

La certification officielle B est cohérente et ses affirmations structurantes sont suffisamment corroborées par l'état courant pour produire le présent dossier de récupération sans invention. Ce document rend les preuves B lisibles, mais il ne constitue pas le « rapport GO » original exigé comme livrable du lot par le contrat et ne peut être présenté comme tel.
