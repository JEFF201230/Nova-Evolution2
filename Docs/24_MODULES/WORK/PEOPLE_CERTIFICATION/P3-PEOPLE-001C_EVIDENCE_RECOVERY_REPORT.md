# P3-PEOPLE-001C — EVIDENCE RECOVERY REPORT

> This is a retrospective evidence-recovery document. It is not the original P3-PEOPLE-001C execution report and does not alter the historical certification.

## 1. Nature et périmètre

Ce document consolide, le 2026-08-08, la certification historique C et les observations reproductibles sur l'état courant. Il ne prétend pas rejouer P3-PEOPLE-001C et ne crée aucune donnée historique manquante.

Source historique officielle : `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001C.certification.json`.

## 2. Certification historique

| Champ | Valeur enregistrée | Qualification |
|---|---|---|
| `MissionId` | `P3-PEOPLE-001C-CERTIFICATION` | HISTORICALLY_RECORDED |
| `DomainId` | `PEOPLE` | HISTORICALLY_RECORDED |
| `LotId` | `P3-PEOPLE-001C` | HISTORICALLY_RECORDED |
| `Status` | `CERTIFIED` | HISTORICALLY_RECORDED |
| `CertifiedAt` | `2026-07-30T21:51:55.8462856+00:00` | HISTORICALLY_RECORDED |
| `Regressions` | `NONE` | HISTORICALLY_RECORDED |
| `PreviousLot` | `P3-PEOPLE-001B` | HISTORICALLY_RECORDED |
| `NextAuthorizedLot` | `P3-PEOPLE-001D` | HISTORICALLY_RECORDED |

La chaîne B → C → D est cohérente avec les entrées courantes du registre. Aucune valeur du JSON C n'a été modifiée.

## 3. Exigences contractuelles C

Le contrat définit C comme le **People Authoritative Producer** : `PeopleAuthority` doit être le producteur unique des faits People, accepter les intentions canoniques, imposer provenance et causalité, émettre les événements prévus, sans persistance, query, API, BFF ou modification Work dans le périmètre historique de C.

## 4. Matrice des preuves

| Affirmation `Evidence` | Classement | Corroboration ou qualification actuelle |
|---|---|---|
| Cinq fichiers Authority vérifiés | BOTH | Les cinq chemins existent. `people-authority.ts` porte une modification préexistante non produite par cette mission ; elle est donc observée comme état courant uniquement. |
| `PeopleAuthority` est l'unique frontière d'acceptation des écritures People | BOTH | Une seule classe `PeopleAuthority` est définie ; le service de commande ultérieur lui délègue les transitions, les queries et l'intégration Work restent en lecture. |
| 10/10 points d'entrée canoniques | BOTH | Dix types de commande et dix méthodes publiques correspondantes sont présents. |
| 13/13 types d'événements immuables | BOTH | Treize types composent `PeopleDomainEvent`, chacun fondé sur des types `Readonly`. |
| Constructeurs privés et accès Foundation obligatoire | BOTH | Les quatre constructeurs sont privés et leurs fabriques exigent `PeopleAuthorityAccess`. |
| Aucune référence externe directe de construction d'agrégat | HISTORICALLY_RECORDED | L'affirmation est enregistrée historiquement. Elle n'est plus littéralement vraie sur tout le dépôt courant : le module ultérieur D de réhydratation reconstruit des agrégats depuis l'histoire persistée. Ce chemin ne produit pas de nouveau fait métier. |
| Authority dépend de Foundation ; Foundation ne dépend pas d'Authority ; index pur | BOTH | Sens des imports confirmé et test courant d'index PASS. |
| Persistance, query, read model, projection, API et dépendances agents absents | HISTORICALLY_RECORDED | L'absence historique est enregistrée. Le dépôt courant contient légitimement persistance et queries des lots D/F ; les cinq artefacts C restent eux-mêmes exempts de ces responsabilités. |
| Provenance autoritative, idempotence et faits immuables ordonnés | BOTH | Contrôles présents dans `PeopleAuthority` et scénarios courants PASS. |

Les deux qualifications dues aux lots ultérieurs ne contredisent pas la portée historique de C. Elles interdisent en revanche de transformer l'état courant du dépôt en photographie historique de C.

## 5. Vérifications actuelles

### 5.1 Artefacts Authoritative Producer

| Artefact | Observation actuelle |
|---|---|
| `people-authority.guard.ts` | Obtient le jeton Foundation canonique et réexporte l'assertion/type. |
| `people-authority.commands.ts` | 10 commandes : créer, affecter, retirer, attribuer/révoquer un rôle, changer Owner, affecter Approver, remplacer, suspendre, reprendre. |
| `people-authority.events.ts` | 13 événements canoniques immuables. |
| `people-authority.ts` | Une classe producteur, constructeur privé, validation d'autorité, causalité/idempotence, transitions et événements. |
| `people-authority.test.ts` | 10 scénarios historiques encore présents dans le fichier ; tous passent dans la campagne People courante. |

La modification Git préexistante de `people-authority.ts` ferme et rouvre les périodes de rôle lors de suspension/reprise. Cette mission ne l'a ni créée ni modifiée. Les tests courants confirment la cohérence actuelle, sans attribuer ce changement à C.

### 5.2 CURRENT VERIFICATION

| Commande actuelle | Résultat exact |
|---|---|
| `node --import tsx --test server/domain/people/*.test.ts` | PASS ; 37 tests, 37 pass, 0 fail, code 0. |
| `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node <tous les fichiers server/domain/people/*.ts>` | PASS ; aucun diagnostic, code 0. |
| `npm.cmd run typecheck:nova-core` | PASS ; code 0. |
| `git diff --check` avant écriture | PASS ; code 0. |

Ces résultats sont des **CURRENT VERIFICATION**, exécutées entre `2026-08-08T02:05:10.0863956+02:00` et `2026-08-08T02:05:17.2434425+02:00`. Ils ne sont pas les tests historiques de C.

## 6. Preuves historiques enregistrées mais non rejouées

Le JSON C enregistre : typecheck strict People PASS, compilation ciblée de 13 fichiers PASS, tests People 10/10, typecheck NOVA Core PASS, tests Runtime 24/24, tests Core 506/506, tests CEREBRAU certification 24/24 et `git diff --check` PASS. Ces mentions sont `HISTORICALLY_RECORDED` uniquement. Aucun résultat historique brut n'a été inventé ou reproduit sous une date passée.

## 7. Cohérence Foundation → People Authority

- Foundation conserve exactement les deux agrégats attendus.
- Foundation n'importe ni Authority, ni Runtime, ni agent technique, ni persistance, ni query.
- Authority consomme les primitives Foundation et reste le point d'acceptation des intentions métier.
- Les services D–G observés sont des adaptateurs de persistance, commande ou lecture ; aucune seconde classe productrice de faits People n'a été trouvée.
- La réhydratation D reconstruit un état depuis l'histoire ; elle ne vaut pas acceptation concurrente d'une intention métier.

## 8. Éléments non reconstructibles

- commandes et sorties brutes historiques ;
- timestamps individuels des validations ;
- contexte Git exact et auteur de l'exécution C ;
- chemin et contenu d'un rapport d'exécution C original ;
- démonstration historique indépendante de l'absence de tout artefact ultérieur.

Ces éléments restent `UNKNOWN`.

## 9. Conclusion documentaire

La certification C est cohérente et ses affirmations structurantes restent corroborées, avec les qualifications transparentes imposées par les lots D–G et le worktree préexistant. Le présent document est un dossier de récupération recevable comme synthèse de preuve, mais il n'est pas le rapport final GO original de C.
