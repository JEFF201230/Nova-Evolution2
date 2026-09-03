# PEOPLE — Modèle de données durable

## Principes

Le modèle logique est relationnel, versionné et propre à PEOPLE. Les noms ci-dessous sont canoniques pour l’implémentation MVP. Les types SQL exacts peuvent être adaptés sans changer leur sémantique.

- identifiants : TEXT, comparaison exacte, non vides ;
- WorkReference : deux colonnes, project_identity et work_identity ; aucun assemblage avec un séparateur ambigu ;
- instants métier : INTEGER epoch UTC en millisecondes, conformément à la précision Date du domaine ;
- révisions et séquences : INTEGER strictement positifs ;
- JSON : UTF-8 canonique, accompagné d’une version de schéma ;
- toutes les foreign keys et CHECK sont activés ;
- aucune table métier ne possède de voie de DELETE opérationnelle.

## Tables canoniques d’état courant

### people_business_person

| Colonne | Contrainte |
|---|---|
| business_person_id | PRIMARY KEY |
| revision | ≥ 1 |
| recognition_authority | non vide |
| recognition_causation_id | non vide, référence au reçu |
| recognized_at_epoch_ms | NOT NULL |
| state_schema_version | ≥ 1 |
| created_at_epoch_ms / updated_at_epoch_ms | NOT NULL |

Cette table n’accepte que l’insertion dans la Foundation. Aucune suppression physique.

### people_work_people

| Colonne | Contrainte |
|---|---|
| project_identity, work_identity | PRIMARY KEY composite |
| revision | ≥ 1 |
| latest_provenance_json | JSON canonique non nul |
| state_schema_version | ≥ 1 |
| created_at_epoch_ms / updated_at_epoch_ms | NOT NULL |

WorkPeople n’existe qu’à partir du premier Assignment et reste présent ensuite.

### people_work_assignment

| Colonne | Contrainte |
|---|---|
| work_assignment_id | PRIMARY KEY global |
| project_identity, work_identity | FK composite vers people_work_people |
| business_person_id | FK vers people_business_person |
| status | CHECK ACTIVE, SUSPENDED ou ENDED |
| effective_from_epoch_ms | NOT NULL |
| effective_to_epoch_ms | NULL ou strictement supérieur au début |
| provenance_trail_json | JSON canonique versionné, non vide |

Un index unique partiel garantit au plus une ligne ACTIVE ou SUSPENDED par project_identity, work_identity et business_person_id. Un trigger déterministe rejette tout chevauchement temporel entre Assignments de la même personne sur le même Work.

### people_role_assignment

| Colonne | Contrainte |
|---|---|
| work_assignment_id, business_role | PRIMARY KEY composite |
| business_role | CHECK dans le vocabulaire PEOPLE fermé |
| provenance_trail_json | JSON canonique versionné, non vide |

FK vers people_work_assignment. Une identité RoleAssignment demeure après révocation.

### people_role_period

| Colonne | Contrainte |
|---|---|
| work_assignment_id, business_role, period_ordinal | PRIMARY KEY |
| project_identity, work_identity | copie de clé de rattachement, vérifiée par FK composite vers l’Assignment |
| effective_from_epoch_ms | NOT NULL |
| effective_to_epoch_ms | NULL ou strictement supérieur au début |
| opened_by_causation_id / closed_by_causation_id | références de provenance |

Le rattachement Work est dénormalisé uniquement pour permettre une contrainte SQLite durable par Work. Il reste reconstructible et ne devient pas un objet Work.

Contraintes :

- unique partiel sur work_assignment_id, business_role lorsque effective_to est NULL ;
- unique partiel sur project_identity, work_identity lorsque business_role = OWNER et effective_to est NULL ;
- trigger de non-chevauchement pour les périodes d’un même RoleAssignment ;
- toute période de rôle est incluse dans la période de l’Assignment.

Lors d’une suspension, toute période de rôle rendue non effective est clôturée ; une reprise ouvre une nouvelle période après contrôle des invariants. Ainsi, l’index Owner représente exactement l’effectivité métier et autorise zéro Owner.

## Tables canoniques d’histoire et de commande

### people_event

| Colonne | Contrainte |
|---|---|
| event_id | PRIMARY KEY global |
| aggregate_type | BUSINESS_PERSON ou WORK_PEOPLE |
| business_person_id | présent uniquement pour BUSINESS_PERSON |
| project_identity, work_identity | présents uniquement pour WORK_PEOPLE |
| stream_sequence | ≥ 1, unique dans le flux ciblé |
| aggregate_revision | ≥ 1 |
| event_ordinal | ≥ 1, unique dans la révision |
| event_type | événement PEOPLE connu |
| event_schema_version | ≥ 1 |
| payload_json | JSON canonique immuable |
| causation_id | FK différée vers people_command_receipt |
| correlation_id | non vide |
| authority | non vide |
| effective_at_epoch_ms / recorded_at_epoch_ms | NOT NULL |

Deux index uniques conditionnels portent l’unicité de séquence : un pour BusinessPersonId et un pour la clé composite WorkReference. Plusieurs événements d’une même causation sont permis ; UNIQUE(causation_id) est interdit.

Les commandes multi-événements utilisent une même aggregate_revision et des event_ordinal contigus. Les stream_sequence sont également contiguës.

### people_command_receipt

| Colonne | Contrainte |
|---|---|
| causation_id | PRIMARY KEY global PEOPLE |
| correlation_id | non vide |
| target_type et clé cible | non vides et cohérents |
| command_type | commande PEOPLE connue |
| fingerprint_algorithm | SHA-256 |
| fingerprint_version | ≥ 1 |
| request_fingerprint | 64 caractères hexadécimaux |
| authority / effective_at_epoch_ms | provenance non vide |
| committed_revision | ≥ 1 |
| first_event_sequence / event_count | cohérents avec people_event |
| result_schema_version | ≥ 1 |
| result_json | résultat initial canonique immuable |
| committed_at_epoch_ms | NOT NULL |

Le reçu et ses événements sont liés dans la même transaction avec une contrainte différée. UPDATE et DELETE sont interdits après commit par l’adaptateur et des protections de schéma.

### people_schema_migration

| Colonne | Contrainte |
|---|---|
| version | PRIMARY KEY, strictement croissante |
| name | unique |
| checksum_sha256 | immuable |
| applied_at_epoch_ms | NOT NULL |
| application_version | traçable |

L’enregistrement de version est dans la transaction de migration.

## Révision et cohérence

- une création réussie produit la révision 1 ;
- chaque nouvelle commande acceptée produit exactement expectedRevision + 1 ;
- tous ses événements portent cette révision ;
- un replay n’incrémente rien ;
- la révision racine égale la dernière révision événementielle ;
- les enfants WorkPeople n’ont pas de révision indépendante ;
- une absence d’événement pour une nouvelle révision est interdite.

## Versionnement

Quatre versions indépendantes sont conservées :

1. version du schéma SQL ;
2. state_schema_version de l’état sérialisé ;
3. event_schema_version de chaque type d’événement ;
4. fingerprint_version et result_schema_version du reçu.

Une lecture refuse une version inconnue. Un upcaster d’événement, s’il devient nécessaire, est pur, versionné et testé ; il ne réécrit pas l’événement stocké.

## Données non persistées comme vérité

Participant, Owner courant, responsabilités, listes par rôle, vues API/BFF, caches et projections. L’index unique Owner et les clés de rattachement sont des mécanismes d’intégrité reconstructibles, pas une seconde source métier.

## Différences avec le schéma présent

L’implémentation devra faire évoluer le schéma existant sans le considérer comme baseline certifiée : clé Work composite, contrainte Owner par Work, RoleAssignment séparé de ses périodes, causalité multi-événements, reçus immuables, migrations chaînées et absence de DELETE opérationnel.
