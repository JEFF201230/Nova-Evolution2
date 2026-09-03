# P3-PEOPLE-001D-M02 — Rapport

## Précondition M01

M01 est factuellement présent et cohérent avec son rapport : le schéma canonique, l'adaptateur SQLite, le commit atomique, l'histoire et la rehydration sont présents sous `server/domain/people/`.

Commande de vérification avant M02 :

- `node --import tsx --test server/domain/people/people-authority.test.ts server/domain/people/people-persistence-*.test.ts` : **PASS, 19/19**.

Verdict de précondition : **GO M01 confirmé**. M01 n'a pas été réimplémenté.

## Recherche de base PEOPLE existante

Recherche limitée aux chemins, appels et configurations capables d'identifier une persistance PEOPLE réelle :

- aucun fichier `*people*.sqlite`, `*people*.sqlite3` ou `*people*.db` trouvé dans le dépôt ;
- aucun chemin/configuration de base PEOPLE trouvé hors des tests ;
- aucun appel de production à `PeopleAggregatePersistenceStore`, `createPeopleSQLitePersistence` ou `PeoplePersistenceSchema` trouvé hors `server/domain/people/` ;
- les seuls fichiers durables ouverts par le code existant sont des fichiers temporaires de tests ;
- aucune source legacy PEOPLE réellement utilisée ou contenant des données n'est donc identifiée.

Conclusion : **aucune base PEOPLE legacy prouvée**. Aucune migration legacy fictive n'a été créée. Aucun Runtime, CEREBRAU, Work, fixture, projection ou frontend n'a été traité comme source PEOPLE.

## Fichiers M02

Créés :

- `server/domain/people/people-persistence-migrations.ts`
- `server/domain/people/people-persistence-migrations.test.ts`
- `server/domain/people/people-persistence-recovery.ts`
- `Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE/MISSIONS/P3-PEOPLE-001D-M02_REPORT.md`

Modifiés pour les seules responsabilités M02 :

- `server/domain/people/people-persistence-schema.ts`
- `server/domain/people/people-persistence-history.ts`
- `server/domain/people/people-persistence-aggregate-store.ts`

Les changements M01 et les changements préexistants hors périmètre ont été préservés.

## Migrations implémentées

Une seule migration réelle, initiale et non legacy :

| Version | Nom | Checksum SHA-256 |
|---|---|---|
| 1 | `people-canonical-v1` | `2cd700df99314f2bc1f8960dd31376897d64f78a4fde9adee49cb6ea0c47f0b4` |

La chaîne impose : versions entières contiguës, nom stable, checksum calculé depuis le SQL, enregistrement dans la même transaction `BEGIN IMMEDIATE`, registre immuable, replay idempotent, refus d'un checksum divergent, d'une version inconnue, d'un trou et d'objets PEOPLE non suivis.

L'injection de faute couvre `before-sql`, `after-sql`, `after-verification` et `after-record`. Chaque faute ramène la base à la version 0 sans table, index, trigger ni ligne de migration partiels ; une reprise applique ensuite la migration normalement.

## Intégrité et recovery

- Préflight : activation vérifiée des foreign keys, `quick_check`, `foreign_key_check`, contrôle du registre et des checksums avant DDL.
- Postflight/démarrage : présence des tables, index et triggers canoniques, `quick_check`, `integrity_check`, `foreign_key_check`, version/checksum exacts.
- Histoire : validation de chaque flux, versions d'événement, séquences, révisions, ordinaux, causalité, types/payloads et cibles.
- Reçus : contrôle exhaustif cible/métadonnées, bornes d'événements, révision, nombre, identifiants et résultat durable.
- Heads : replay exhaustif au volume MVP et comparaison canonique de chaque état courant à son histoire ; flux sans head refusé.
- Fail closed : toute divergence de schéma, checksum, FK, head, event ou receipt bloque l'ouverture du store et donc les écritures.
- Backup : API `node:sqlite` transactionnellement cohérente, destination neuve obligatoire, puis ouverture et vérification complète du backup.
- Restore : restauration uniquement vers un nouvel emplacement, jamais par écrasement d'une base active, suivie des mêmes contrôles.
- Reconstruction : copie vérifiée des événements et reçus immuables vers une nouvelle base, replay déterministe, reconstruction des heads/Assignments/rôles/périodes, puis audit complet et redémarrage.
- La base source corrompue n'est jamais réparée en place.

## Tests et résultats réels

- Tests ciblés M02 : `node --import tsx --test server/domain/people/people-persistence-migrations.test.ts` : **PASS, 6/6**.
- Tests de persistance M01 affectés : `node --import tsx --test server/domain/people/people-persistence-*.test.ts` : **PASS, 15/15**.
- Tous les tests PEOPLE : `node --import tsx --test server/domain/people/*.test.ts` : **PASS, 25/25**.
- Typecheck strict ciblé de tous les `server/domain/people/*.ts` via `node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node ...` : **PASS**.

Les preuves couvrent : base vide, migration initiale/idempotente, version/checksum, divergences refusées, interruption et rollback, foreign keys, quick/integrity checks, corruptions head/event/receipt, redémarrage, rehydration, backup/restore, reconstruction équivalente, conservation des BusinessPersonId, EventId, causations, reçus et de toute l'histoire.

## Contrôles impossibles ou non applicables

- Aucun emplacement de déploiement externe ni chemin de base PEOPLE opérationnelle n'est fourni ou configuré ; aucune base externe non désignée ne peut être inventoriée. Aucune base legacy n'a été identifiée par les appels/configurations du dépôt.
- Le backup pré-migration de données existantes n'est pas applicable à la seule migration initiale sur base vide. Le mécanisme cohérent est implémenté et prouvé pour toute future migration de données autorisée.
- Bascule opérationnelle de fichiers, quarantaine, chiffrement, droits d'accès, espace disque, RPO/RTO et répertoire de sauvegarde restent des responsabilités d'exploitation non configurées par cette mission.
- Aucune suite globale Runtime/Core/CEREBRAU n'a été lancée : aucune dépendance ni aucun fichier de ces périmètres n'a été modifié.

## Risques résiduels

- L'inventaire d'une base hors dépôt reste conditionné à la fourniture future de son chemin/configuration par l'exploitation.
- La reconstruction refuse toute histoire, tout reçu, toute FK ou tout fichier dont l'intégrité n'est pas démontrable ; une telle perte exige une sauvegarde intègre et une décision d'exploitation.
- Le mécanisme produit et valide un nouvel emplacement ; la bascule atomique spécifique à l'environnement de production reste à gouverner.

## Git diff check

- `git diff --check` : **PASS** (code sortie 0 ; avertissements de normalisation LF/CRLF uniquement).

## Verdict

GO — P3-PEOPLE-001D-M02
