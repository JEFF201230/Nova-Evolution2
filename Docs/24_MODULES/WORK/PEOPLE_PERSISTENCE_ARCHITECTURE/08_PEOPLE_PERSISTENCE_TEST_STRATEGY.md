# PEOPLE — Stratégie de tests de persistance

## Règle de certification

Les tests prouvent la sémantique par les ports et, séparément, les barrières SQLite. Les tests de durabilité utilisent un vrai fichier temporaire fermé puis rouvert. Les tests :memory: sont réservés aux contrôles unitaires sans redémarrage.

Chaque test vérifie l’état, la révision, les événements, le reçu et l’absence d’effet résiduel après erreur.

## Matrice minimale

| Domaine | Cas obligatoires | Preuve attendue |
|---|---|---|
| Création BusinessPerson | succès, doublon autre causalité, replay exact | révision 1, un événement, un reçu, identité stable |
| Création WorkPeople | premier Assignment, personne absente, Work sans Owner | racine complète, zéro ou un Owner, rollback des préconditions |
| Modification | rôle, retrait, suspension, reprise, changement Owner, remplacement | une révision par commande, événements contigus |
| Historique | toutes transitions et Assignments ENDED | append-only, ordre, aucune réécriture |
| Redémarrage | fermeture/réouverture après chaque classe de commit | même état, révision, histoire et reçu |
| Rehydration | état initial → flux complet et atRevision | égalité canonique avec état courant |
| Replay | replay d’événements et replay de commande | aucun nouvel événement ; résultat initial identique |
| Atomicité | faute injectée après chaque étape d’écriture | zéro état/reçu/événement partiel |
| Concurrence | deux connexions, même expectedRevision | un seul commit, perdant en conflit |
| Révision obsolète | BusinessPerson et WorkPeople | CONCURRENT_PEOPLE_CHANGE, aucun effet |
| Idempotence | retry avant/après redémarrage et après perte de réponse | REPLAYED malgré head plus récent |
| Causalité divergente | même id, payload/cible/version différents | IDEMPOTENCY_CONFLICT |
| Unicité générale | ids, Assignment courant, rôle actif, séquences | contrainte durable + erreur stable |
| Owner unique | deux Owners sur Assignments différents du même Work | un seul Owner commit, second rejeté |
| Owner optionnel | création/retrait sans Owner | état valide, aucune erreur inactive |
| Périodes | bornes, adjacence, chevauchement, rôle hors Assignment | demi-ouvert respecté, conflits rejetés |
| Migration | base vide, replay même checksum, checksum divergent, saut | déterminisme, no-op ou fail closed |
| Migration interrompue | faute à chaque étape | ancienne version intégrale et redémarrable |
| Recovery | crash avant/après commit, WAL, base verrouillée | ancien état ou reçu complet, jamais partiel |
| Corruption | payload, séquence, head, FK, reçu altérés | HISTORY_CORRUPTED et écriture bloquée |
| Restauration | backup cohérent puis restore | intégrité et replay identiques |
| Suppression | toutes opérations de sortie | aucune ligne métier/event/receipt supprimée |
| Frontières | analyse d’imports et tentative d’écriture externe | aucune dépendance/voie directe interdite |

## Tests spécifiques aux agrégats

BusinessPerson :

- reconnaissance avec provenance ;
- identité immuable et non réaffectable ;
- absence de suppression physique ;
- rehydration du seul événement Foundation.

WorkPeople :

- load restitue tous les Assignments, y compris ENDED ;
- ACTIVE exige un rôle effectif ;
- un seul Assignment courant par personne/Work ;
- rôle unique et périodes ordonnées ;
- changement Owner atomique ;
- remplacement sans transfert d’historique ;
- suspension clôt l’effectivité Owner et reprise la réouvre seulement sans conflit.

## Tests de commit multi-événements

Pour AssignPersonToWork, ChangeWorkOwner, RemovePersonFromWork, ReplaceAssignedPerson, Suspend et Resume :

- plusieurs événements avec la même causationId sont acceptés ;
- event_ordinal et stream_sequence sont contigus ;
- un seul reçu couvre le groupe ;
- une seule révision est créée ;
- faute au milieu du groupe : aucun événement ne subsiste.

Ce test empêche le retour de UNIQUE(causation_id) sur la table d’événements.

## Tests de contraintes SQLite

Les tests contournent volontairement la validation mémoire dans un fixture bas niveau afin de démontrer que la base refuse :

- un second Owner sur un autre Assignment du même Work ;
- un second Assignment courant ;
- un rôle actif dupliqué ;
- un chevauchement ;
- une FK cassée ;
- une révision invalide ;
- UPDATE/DELETE de people_event et people_command_receipt.

Le test Owner doit utiliser deux work_assignment_id distincts ; un test sur le même Assignment ne prouve pas l’invariant par Work.

## Concurrence

Deux connexions sur le même fichier SQLite, WAL actif :

- même head et expectedRevision ;
- deux tentatives Owner ;
- changement Owner contre suspension ;
- remplacement contre modification de rôle ;
- retry après busy_timeout ;
- lecture pendant commit et après commit.

Le résultat doit être sérialisable : aucune lecture ne voit un état partiel, et le perdant ne laisse ni reçu ni événement.

## Migration et recovery

Tester les migrations avec copies de bases représentant chaque version. Injecter une interruption avant/après DDL, backfill, vérification et insertion de version. Tester un checksum modifié et une version plus récente.

Pour recovery, altérer des copies seulement. Vérifier que la base originale n’est jamais « réparée » en place sans sauvegarde.

## Non-régression

Minimum avant certification :

- tous les tests server/domain/people ;
- suite People Authority et Foundation ;
- tests Work applicables ;
- tests Runtime applicables ;
- tests Core complets ;
- typecheck NOVA Core ;
- lint/typecheck des périmètres affectés ;
- contrôles CEREBRAU applicables, sans modifier CEREBRAU pour obtenir un PASS ;
- git diff --check.

Les nombres de tests ne sont pas figés dans l’architecture : la commande, le résultat et la portée réelle sont enregistrés lors de la mission d’implémentation.

## Critères de sortie

- 100 % des cas ci-dessus PASS ;
- aucune validation obligatoire échouée ;
- aucune divergence état/histoire ;
- aucun fichier hors périmètre de la mission d’implémentation ;
- P3-PEOPLE-001D reste non certifié tant que ces preuves ne sont pas produites.
