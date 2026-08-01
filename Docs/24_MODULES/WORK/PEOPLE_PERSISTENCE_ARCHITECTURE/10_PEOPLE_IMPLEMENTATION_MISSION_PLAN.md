# PEOPLE Implementation Mission Plan — P3-PEOPLE-001D

## Préconditions

- P3-PEOPLE-001B et P3-PEOPLE-001C restent GO ;
- `PeopleAuthority`, agrégats, événements et contrats existants sont inchangés ;
- liste exacte des fichiers autorisés établie avant chaque mission ;
- Framework, contrats certifiés, Mission Pipeline et certification JSON interdits.

## Micro-missions

### D1 — SQLite schema and migrations

Créer la base dédiée, tables, foreign keys, indexes, version de schéma et migration initiale. GO : migration répétable, checksums, contraintes et rollback testés.

### D2 — Repository ports and SQLite adapter

Créer les ports, transactions et mapping vers les agrégats existants. GO : aucun type SQLite dans le domaine, load/save déterministes, ABSENT/UNAVAILABLE distingués.

### D3 — Atomic aggregate persistence

Persister Business Person et Work People avec révision optimiste, commit atomique, Owner unique et périodes. GO : rollback et conflits sans effet partiel.

### D4 — Event history, replay and recovery

Ajouter histoire append-only, rehydratation, snapshots reconstructibles et récupération. GO : replay égal état courant, séquences cohérentes, crash/migration recovery PASS.

### D5 — Causality and idempotence

Ajouter clés de causalité, hash de requête et résultat initial. GO : retry exact idempotent, payload divergent rejeté, aucun doublon.

### D6 — Persistence certification evidence

Exécuter tests PEOPLE, Work, Runtime, Core, typecheck, `git diff --check`, produire preuves et rapport de lot. GO : toutes les exigences P3-D couvertes; seulement ensuite soumettre la certification.

## Dépendances

`D1 → D2 → D3 → D4 → D5 → D6`. Aucun parallélisme fonctionnel sans risque; les tests de chaque étape peuvent être parallélisés après stabilisation de l’étape.

## Fichiers interdits

`server/nova-core/*`, `server/runtime/*`, `server/nova-bff/*`, `apps/*`, `Docs/12_CERTIFICATION/*`, blueprints et contrats existants, sauf lecture ou rapport explicitement autorisé.

## Gate commun

Chaque mission doit fournir un rapport unique, typecheck PASS, tests ciblés PASS, tests de non-régression applicables PASS, absence de dépendance inverse, `git diff --check` PASS et décision GO/NO GO. Un NO GO bloque immédiatement la suivante.

