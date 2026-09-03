# P3-PEOPLE-001D-M01 — Rapport

## Fichiers modifiés

- `server/domain/people/people-authority.ts`
- `server/domain/people/people-persistence-ports.ts`
- `server/domain/people/people-persistence-schema.ts`
- `server/domain/people/people-persistence-sqlite-adapter.ts`
- `server/domain/people/people-persistence-aggregate-store.ts`
- `server/domain/people/people-persistence-history.ts`
- `server/domain/people/people-persistence-schema.test.ts`
- `server/domain/people/people-persistence-sqlite-adapter.test.ts`
- `server/domain/people/people-persistence-aggregate-store.test.ts`
- `server/domain/people/people-persistence-history.test.ts`
- `server/domain/people/people-persistence-idempotence.test.ts`

Fichier créé : ce rapport uniquement. Aucun fichier hors `server/domain/people/` et du présent rapport n'a été modifié par la mission.

## Réutilisations

- `node:sqlite` confirmé opérationnel sous Node `v24.16.0` ; aucun ORM ajouté.
- Agrégats `BusinessPerson` et `WorkPeople`, entités, Value Objects, `PeopleAuthority` et événements PEOPLE existants réutilisés.
- Les modules de persistance existants ont été complétés/remplacés dans leurs responsabilités actuelles ; aucun nouveau module de code créé.
- Suspension/reprise complétée dans `PeopleAuthority` afin de fermer/réouvrir les périodes de rôles requises par le modèle durable.

## Invariants prouvés

- Ownership PEOPLE et séparation durable des deux agrégats : tables, clés et repositories distincts, sans dépendance Runtime/Core/BFF.
- Commit unique `BEGIN IMMEDIATE` couvrant état complet, périodes, événements ordonnés, causalité, empreinte, reçu et révision ; rollback injecté sans état partiel.
- CAS strict sur `expectedRevision`, révision monotone sans saut, stale revision rejetée sur deux connexions ; aucun last-write-wins.
- WorkReference composite ; Owner actif unique par Work via index SQL partiel et validation agrégat.
- Assignments, rôles et périodes demi-ouvertes protégés par FK, CHECK, index et triggers de chevauchement/inclusion.
- Histoire append-only, séquences/révisions/ordinals contigus, causalité multi-événements conservée.
- Rehydration complète depuis l'histoire, comparaison état courant/histoire et redémarrage SQLite prouvés.
- Replay exact résolu avant CAS et sans écriture ; replay divergent rejeté ; reçu durable immuable.
- Aucun `DELETE` métier opérationnel ; triggers interdisant les suppressions physiques et les mutations d'événements/reçus.
- Divergence head/histoire détectée en `HISTORY_CORRUPTED` et écritures bloquées.

## Tests et résultats réels

- `node --import tsx --test server/domain/people/people-persistence-*.test.ts` : **PASS**, 9/9.
  - couvre création BusinessPerson/WorkPeople, modification, load complet, restart/rehydration, multi-événements, rollback injecté, deux connexions, stale revision, replay exact/divergent, idempotence, causalité, Owner unique, contraintes SQL directes et absence d'état partiel.
- `node --import tsx --test server/domain/people/people-authority.test.ts server/domain/people/people-persistence-*.test.ts` : **PASS**, 19/19.
- Typecheck strict ciblé de tous les `server/domain/people/*.ts` avec `tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node` : **PASS**.
- Suites Core/Runtime globales non exécutées : aucune dépendance concrète modifiée.

## Inconnues

- Aucune base PEOPLE externe au dépôt n'a été inventoriée ni migrée ; ce sujet appartient explicitement à M02.
- Les changements préexistants du worktree hors périmètre ont été préservés.

## Git diff check

- `git diff --check` : **PASS** (code sortie 0 ; avertissements de normalisation LF/CRLF uniquement).
- Aucun diff produit par la mission sous `server/runtime/`, `server/nova-core/`, `server/nova-bff/`, `tools/`, `apps/` ou `client/`.

## Verdict

GO — P3-PEOPLE-001D-M01
