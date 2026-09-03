# PEOPLE Persistence Architecture — Décision exécutive

## Statut

Décision d’architecture canonique préparatoire à P3-PEOPLE-001D. Ce document ne certifie aucune implémentation existante et n’autorise aucun lot ultérieur à P3-PEOPLE-001D.

## Décision

PEOPLE adopte, pour le MVP, une base SQLite dédiée et possédée par PEOPLE, accessible uniquement derrière deux ports métier : BusinessPersonRepository et WorkPeopleRepository.

La source de vérité est l’ensemble transactionnel cohérent formé par :

- l’état courant durable des agrégats BusinessPerson et WorkPeople ;
- leur historique d’événements append-only ;
- les provenances et causalités associées ;
- la révision monotone de chaque agrégat ;
- le reçu durable de chaque commande acceptée.

Un état courant sans l’histoire correspondante, ou une histoire incompatible avec l’état courant, est invalide. Les projections, caches et index sont reconstructibles et ne peuvent arbitrer une divergence.

## REUSE → COMPLETE → BUILD

### REUSE

Sont réutilisés :

- les agrégats, entités, Value Objects, erreurs, commandes et événements présents sous server/domain/people ;
- le choix déjà matérialisé de node:sqlite, fourni par Node 22 sans dépendance npm de base de données ;
- les principes PROGRAM-016 : ownership explicite, ports engine-neutral, transaction déclarée, verrouillage optimiste, migration et recovery gouvernés ;
- les idées de transaction immédiate, révision et stockage d’idempotence déjà visibles dans les fichiers people-persistence-*.

### COMPLETE

L’implémentation existante devra être alignée sur cette architecture. L’inspection statique établit notamment les écarts suivants :

- PeopleAggregateRepository est générique alors que les deux ports conceptuels exigés ne sont pas matérialisés ;
- le chargement WorkPeople ne reconstitue pas ses Assignments et Role Assignments ;
- uq_people_active_owner est indexé par work_assignment_id et ne garantit donc pas l’unicité par Work ;
- UNIQUE(causation_id) dans people_event_history interdit plusieurs événements issus d’une même commande ;
- persistWorkPeople exécute des DELETE sur les lignes d’Assignments et de rôles ;
- le reçu idempotent relit l’état courant au lieu de conserver le résultat initial immuable ;
- la migration version 1 est monolithique, sans checksum ni chaîne de versions, et son rollback détruit le schéma ;
- l’état, les événements et le reçu ne sont pas encore engagés par une primitive de commit unique.

Ces constats ne modifient aucun code dans la présente mission.

### BUILD

Ne construire que les éléments réellement absents : ports typés, commit atomique complet, contraintes durables correctes, reconstitution typée, runner de migrations versionnées, contrôles d’intégrité et recovery. Aucun store générique partagé, serveur de base de données, ORM, API ou projection n’est requis pour le MVP.

## Comparaison technologique

| Option pertinente | Atomicité/concurrence | Dépendances/exploitation | Tests et coût MVP | Décision |
|---|---|---|---|---|
| Adapter le snapshot JSON Runtime | Remplacement de fichier possible, mais contraintes relationnelles, CAS multi-écriture et commit état+histoire+reçu à construire | Couplage Runtime et risque de double vérité | Coût élevé et frontière interdite | Rejetée |
| SQLite dédiée via node:sqlite | ACID local, contraintes, transactions, CAS et recovery natifs ; écritures sérialisées | Aucune dépendance npm DB ; un fichier PEOPLE à sauvegarder | Tests temporaires simples ; coût minimal | Retenue |
| PostgreSQL dédié | Très bonne concurrence et exploitation distribuée | Nouveau service, driver, configuration et runbook | Surdimensionné pour un writer MVP | Rejetée pour le MVP, cible d’adaptation future possible |
| Event store externe | Historique natif, mais état, contraintes Owner et exploitation restent à construire | Nouvelle infrastructure et nouveaux contrats | Coût maximal sans brique existante | Rejetée |

## Profil SQLite décidé

- fichier distinct de tout store Runtime/CEREBRAU, chemin injecté par la composition PEOPLE ;
- foreign_keys activé sur chaque connexion ;
- mode WAL pour le fichier opérationnel ;
- synchronous=FULL ;
- busy_timeout borné et configurable ;
- BEGIN IMMEDIATE pour toute mutation ;
- un seul service PEOPLE écrivain au MVP ; plusieurs connexions de lecture sont permises ;
- sauvegarde cohérente par l’API SQLite, jamais par copie naïve d’un fichier ouvert ;
- aucune utilisation de :memory: pour les certifications de redémarrage ou de durabilité.

## Invariants protégés

- BusinessPersonId, WorkReference et WorkAssignmentId uniques ;
- zéro ou un Owner actif par Work, jamais deux ;
- un Assignment ACTIVE ou SUSPENDED au plus par personne et par Work ;
- un rôle actif au plus par rôle et Assignment ;
- périodes valides et non conflictuelles ;
- expectedRevision obligatoire et aucun last-write-wins ;
- replay exact sans nouvelle révision ni nouvel événement ;
- même causalité avec contenu différent rejetée ;
- histoire immuable et aucune suppression physique des données métier PEOPLE.

## Coût et impact MVP

Le coût est une convergence ciblée de la persistance PEOPLE existante. SQLite borne l’exploitation à un fichier et à un writer, ce qui est cohérent avec le MVP. Les ports restent engine-neutral : un futur adaptateur PostgreSQL pourra remplacer SQLite sans changer les agrégats ni les consommateurs.

## Gate

L’architecture est déterminée sur la source, le stockage, la transaction, l’atomicité, la concurrence, l’idempotence, la causalité, l’unicité, l’histoire, la migration et le recovery. L’implémentation existante reste à mettre en conformité et à certifier selon 08_PEOPLE_PERSISTENCE_TEST_STRATEGY.md.

## Décision terminale

La décision terminale unique est portée par PEOPLE_PERSISTENCE_ARCHITECTURE_MASTER_REPORT.md.
