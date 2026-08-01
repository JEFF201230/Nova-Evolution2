# PEOPLE Persistence Test Strategy

## Tests unitaires

Les agrégats existants et leurs invariants restent la première barrière : identité stable, rôles fermés, périodes, Owner unique, Assignment actif, séparation RuntimeAgent/Business Person et erreurs contractuelles.

## Tests repository/SQLite

Tester schéma, clés étrangères, contraintes uniques, sérialisation canonique, types invalides, migrations, lecture ABSENT/UNAVAILABLE, sauvegarde et restauration. Chaque test doit utiliser une base temporaire dédiée.

## Tests transactionnels

Tester commit atomique Business Person, commit atomique Work People, rollback injecté, absence d’événement partiel, validation de personne avant mutation Work et cohérence snapshot/histoire.

## Tests de concurrence

Deux connexions doivent couvrir double Owner, révision obsolète, changements de rôles concurrents, remplacement concurrent, verrou SQLite, retry et résultat déterministe après conflit.

## Tests d’histoire et replay

Comparer état sauvegardé et replay complet; vérifier ordre, causalité, corrélation, séquence, événements spécialisés non dupliqués et histoire non réécrite.

## Tests d’idempotence

Répétition exacte, causalité réutilisée avec payload différent, crash après commit puis retry, absence de doublon événementiel et résultat initial conservé.

## Tests de séparation

Prouver l’absence d’import Runtime/CEREBRAU dans le store PEOPLE, aucune copie Work, aucune conversion RuntimeAgent, aucun rôle RBAC et aucune dépendance vers Mission Pipeline.

## Non-régression

`server/domain/people/people-authority.test.ts`, tests Work, tests Runtime, tests Core, typecheck et validations CEREBRAU applicables doivent rester PASS. Les tests PEOPLE doivent être sélectionnés par fichiers réellement modifiés.

