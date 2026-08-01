# PEOPLE Durable Data Model

## Décision de stockage

Une base SQLite dédiée, proposée sous `people.sqlite` dans le répertoire de données configuré par PEOPLE. Le chemin exact est à fixer par la mission d’implémentation; il ne doit pas être `.nova-data/runtime.json` ni un store Runtime.

## Tables canoniques

### `people_business_person`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `business_person_id` | TEXT | PK, stable, non vide |
| `status` | TEXT | valeur métier validée |
| `recognized_at` | TEXT | timestamp canonique |
| `provenance_json` | TEXT | NOT NULL, JSON canonique |
| `revision` | INTEGER | NOT NULL, >= 0 |
| `created_at` / `updated_at` | TEXT | NOT NULL |

### `people_work_people`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `work_reference` | TEXT | PK, représentation canonique Project + Work |
| `revision` | INTEGER | NOT NULL, >= 0 |
| `lifecycle_status` | TEXT | vocabulaire Work People fermé |
| `provenance_json` | TEXT | NOT NULL |
| `created_at` / `updated_at` | TEXT | NOT NULL |

### `people_work_assignment`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `work_assignment_id` | TEXT | PK |
| `work_reference` | TEXT | FK vers Work People |
| `business_person_id` | TEXT | FK vers Business Person |
| `status` | TEXT | ACTIVE/SUSPENDED/TERMINATED selon contrat |
| `effective_from` / `effective_to` | TEXT | périodes valides |
| `provenance_json` | TEXT | NOT NULL |

### `people_role_assignment`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `role_assignment_id` | TEXT | PK |
| `work_assignment_id` | TEXT | FK |
| `business_role` | TEXT | vocabulaire métier fermé |
| `status` | TEXT | actif/inactif selon modèle |
| `effective_from` / `effective_to` | TEXT | pas de période contradictoire |
| `provenance_json` | TEXT | NOT NULL |

### `people_event_history`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `event_id` | TEXT | PK global |
| `aggregate_type` / `aggregate_id` | TEXT | NOT NULL |
| `sequence` | INTEGER | unique par flux, monotone |
| `event_type` | TEXT | événement People typé |
| `payload_json` | TEXT | JSON canonique immuable |
| `causation_id` / `correlation_id` | TEXT | NOT NULL |
| `revision` | INTEGER | révision produite |
| `occurred_at` | TEXT | timestamp canonique |

### `people_idempotency_key`

| Colonne | Type logique | Contraintes |
|---|---|---|
| `causation_id` | TEXT | PK |
| `aggregate_type` / `aggregate_id` | TEXT | NOT NULL |
| `request_hash` | TEXT | NOT NULL |
| `result_json` | TEXT | résultat initial immuable |
| `created_at` | TEXT | NOT NULL |

## Contraintes

Foreign keys, `UNIQUE(work_reference)`, `UNIQUE(work_assignment_id)`, `UNIQUE(business_person_id)`, index de lecture par rôle, et une contrainte d’unicité logique garantissant au plus un Owner actif par Work doivent être activés dans SQLite. Les périodes qui se chevauchent doivent être rejetées par validation transactionnelle, pas corrigées silencieusement.

## Non-persistence

Participant, Owner courant, collections par rôle, responsabilités, caches et projections restent dérivés. Aucun enregistrement Work, Mission, RuntimeAgent, Session, Decision ou Deliverable n’est copié.

