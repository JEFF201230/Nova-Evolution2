# PEOPLE — Histoire d’événements et rehydration

## Rôle de l’histoire

people_event est le journal métier append-only des changements acceptés par People Authority. Il conserve les événements définis par people-authority.events.ts et ne reçoit aucun RuntimeEvent.

L’histoire sert à :

- expliquer chaque révision ;
- auditer causalité, provenance et ordre ;
- reconstituer un agrégat après redémarrage ;
- vérifier ou reconstruire l’état courant ;
- reprendre une publication aval sans transformer cette publication en vérité.

## Règles append-only

- INSERT seulement en fonctionnement normal ;
- event_id globalement unique ;
- séquence strictement contiguë par agrégat ;
- révisions strictement contiguës ;
- événements d’une commande contigus et ordonnés par event_ordinal ;
- type et event_schema_version obligatoires ;
- payload et provenance immuables ;
- aucune correction en place : une correction métier est une nouvelle commande et de nouveaux événements ;
- aucun événement après PeopleRemoved pour le même WorkAssignmentId, sauf nouveau WorkAssignmentId explicitement créé.

Les protections de schéma et les permissions de l’adaptateur refusent UPDATE/DELETE. Une migration gouvernée peut transformer une copie ou ajouter une représentation, mais ne réécrit jamais silencieusement l’histoire certifiée.

## Ordre causal

Le repository persiste exactement l’ordre remis par People Authority. Il vérifie au minimum :

- BusinessIdentityRecognized précède toute affectation de la personne ;
- PeopleAssigned précède ParticipantAdded ;
- événements de rôles et OwnerChanged respectent l’ordre du contrat ;
- AssignmentResumed précède l’éventuel OwnerChanged et ParticipantAdded ;
- effets de clôture précèdent PeopleRemoved ;
- tous les événements d’un commit portent la même causalité, provenance et révision.

Le repository ne réordonne pas pour « réparer » un flux invalide ; il échoue avant commit.

## Rehydration

La rehydration est pure et n’émet aucun événement.

1. Lire et valider la version de schéma.
2. Lire le flux depuis la séquence 1 jusqu’à la révision demandée.
3. Vérifier identités, absence de trou/doublon, versions, ordinal et causalité.
4. Désérialiser les Value Objects PEOPLE.
5. Appliquer les événements par un reducer versionné.
6. Construire BusinessPerson ou WorkPeople avec les factories contrôlées du domaine.
7. Réexécuter les invariants des agrégats.
8. Comparer la révision et l’état obtenus aux tables courantes lorsqu’il s’agit de la dernière révision.

Un type ou une version inconnue, une séquence absente, un événement impossible ou une divergence produit HISTORY_CORRUPTED et bloque les écritures.

## État courant et replay

Le chemin normal load peut utiliser les tables courantes pour le coût MVP, à condition de :

- charger toute la racine ;
- reconstituer tous les Value Objects et trails ;
- vérifier la révision de head et la dernière révision événementielle ;
- appliquer les mêmes invariants que le replay.

Le replay complet constitue la preuve de reconstructibilité. Il doit donner le même état canonique sérialisé, la même révision, le même Owner dérivé et les mêmes Participants que le load courant.

Il n’existe pas de table people_aggregate_snapshot distincte dans le modèle minimal : les tables d’état courant sont déjà la matérialisation. Un snapshot additionnel ne sera justifié que par mesure de performance future.

## Redémarrage

À l’ouverture :

- SQLite récupère le WAL ;
- les migrations et checksums sont vérifiés ;
- quick_check et foreign_key_check sont exécutés selon le mode de démarrage ;
- un échantillon ou l’ensemble des heads, selon la taille MVP, est comparé à la dernière révision du journal ;
- aucun état en mémoire antérieur n’est utilisé.

Après redémarrage, un replay de causalité exacte retrouve le reçu initial. Une commande nouvelle charge la révision durable.

## Cohérence état/histoire

Les contrôles suivants sont obligatoires :

- head.revision = max(event.aggregate_revision) ;
- séquence terminale du head = max(stream_sequence) ;
- reçu.event_count et bornes correspondent aux événements ;
- chaque révision contient au moins un événement ;
- les clés d’entités de l’état existent dans les événements qui les ont créées ;
- les dérivations Owner/Participant concordent.

Une divergence n’est jamais résolue par « le dernier timestamp ». Les écritures sont arrêtées, la base est placée en recovery, puis l’état courant est reconstruit depuis une histoire intègre ou la base entière est restaurée depuis une sauvegarde validée.

## Historique temporel

La relecture d’une révision passée est en lecture seule. Les instants effectifs appartiennent au métier ; les instants recorded_at décrivent la persistance. L’ordre du flux est déterminé par stream_sequence, jamais par l’horloge.
