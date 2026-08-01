# PEOPLE Persistence Architecture — Executive Decision

## Décision

P3-PEOPLE-001D adopte une persistance SQLite dédiée à PEOPLE, encapsulée derrière des ports de repository propres au domaine. SQLite est un choix d’implémentation de ce dossier; le `PERSISTENCE_CONTRACT.md` de PROGRAM-016 reste volontairement engine-neutral.

## Source canonique

La source de vérité est l’état persistant et l’histoire acceptée par `People Authority` pour deux agrégats seulement : `Business Person` et `Work People`. Les événements Runtime, les missions, les comptes, les agents, les sessions, les décisions, les fixtures et les projections ne sont jamais des sources PEOPLE.

## Réutilisation constatée

L’audit `tools/cerebrau/P3-PEOPLE-INFRASTRUCTURE-REUSE-AUDIT-001.md` ne fournit aucun repository/store/event store PEOPLE compatible. `NovaCoreStore`, `IntegrationRuntimeRepository`, `ExecutionSessionPersistence` et les journaux Runtime sont réutilisables uniquement comme références de qualité ou infrastructure technique séparée, jamais comme vérité métier PEOPLE.

## Décisions non négociables

- deux frontières d’agrégat : Business Person et Work People ;
- un Owner actif au maximum par Work ;
- révision optimiste obligatoire ;
- transaction SQLite unique pour toute mutation Work People ;
- histoire append-only et rehydratation déterministe ;
- idempotence par causalité ;
- aucune suppression physique d’une identité ou d’un historique référencé ;
- aucun import automatique depuis Runtime/CEREBRAU/fixtures ;
- aucun changement du Framework, des contrats certifiés ou du Mission Pipeline dans P3-PEOPLE-001D.

## Hypothèses explicitement nouvelles

Le dépôt ne contient pas de contrat technique SQLite PEOPLE, de nom de fichier de base, de schéma ou de migration. Les noms `people.sqlite`, tables et modules proposés dans les documents suivants sont donc des décisions d’architecture à valider au démarrage de l’implémentation, pas des composants existants.

## Gate d’implémentation

L’implémentation peut commencer uniquement après validation de ce dossier, avec une mission fermée autorisant exclusivement les fichiers de persistance PEOPLE et leurs tests. La certification P3-PEOPLE-001D reste NO GO jusqu’aux preuves de durabilité, atomicité, histoire, unicité, concurrence, migration et récupération.

