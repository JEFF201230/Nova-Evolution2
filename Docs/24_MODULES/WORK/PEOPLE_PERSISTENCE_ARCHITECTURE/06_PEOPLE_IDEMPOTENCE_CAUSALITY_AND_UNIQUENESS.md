# PEOPLE — Idempotence, causalité et unicité

## Identifiants

- causationId : identité stable et globalement unique dans PEOPLE d’une intention métier ; elle correspond au businessCause de PeopleProvenance ;
- correlationId : regroupe plusieurs intentions d’un même parcours, sans contrainte d’unicité ;
- eventId : identité unique d’un fait ;
- requestFingerprint : empreinte sémantique versionnée de la commande ;
- revision : version de cohérence d’un agrégat ;
- streamSequence : ordre historique dans un agrégat.

Ni runId, ni SessionId, ni RuntimeEventId, ni identité d’agent ne devient causalité PEOPLE automatiquement.

## Empreinte canonique

L’empreinte MVP est SHA-256 sur UTF-8 d’une représentation JSON canonique versionnée contenant :

- commandType ;
- identité complète de la cible ;
- payload métier normalisé, tableaux dans leur ordre sémantique ou triés lorsque l’ordre n’a pas de sens ;
- authority, businessCause et effectiveAt de la provenance ;
- version de sérialisation de la commande.

Sont exclus : heure de réception, numéro de retry, connexion SQLite, logs et métadonnées de transport sans sens métier.

La même fingerprintVersion doit produire les mêmes octets sur tout redémarrage. Une évolution de canonicalisation incrémente la version ; un reçu existant reste comparable avec sa version d’origine.

## Reçu durable

people_command_receipt conserve de façon immuable :

- causalité, corrélation, commande et cible ;
- empreinte, algorithme et version ;
- provenance ;
- révision commitée ;
- événements produits ;
- résultat initial sérialisé et sa version ;
- date de commit.

Le reçu est écrit dans la transaction du changement. Une ligne de clé sans résultat final est interdite. Si un reçu pointe vers un head ou des événements manquants, il s’agit de corruption et non d’un replay valide.

## Comportement du replay

| Cas | Comportement |
|---|---|
| causalité inconnue | traiter comme nouvelle intention puis CAS |
| même causalité, cible/version/empreinte identiques | retourner le résultat initial REPLAYED |
| même causalité, cible ou payload différent | IDEMPOTENCY_CONFLICT |
| même causalité, reçu incohérent | HISTORY_CORRUPTED, fail closed |
| nouvelle causalité, état déjà atteint | erreur métier correspondante, sauf no-op contractuel |

Le replay exact est résolu avant expectedRevision. Il ne produit aucun événement, aucune nouvelle révision, aucun nouveau reçu et ne remplace pas committed_at.

Un échec de validation, un CAS obsolète ou une indisponibilité ne produit pas de reçu de succès. Les échecs peuvent être audités par le mécanisme gouverné approprié, sans être des événements de changement PEOPLE.

## Contraintes d’unicité durables

| Invariant | Barrière durable |
|---|---|
| BusinessPersonId unique | PRIMARY KEY people_business_person |
| WorkPeople unique | PRIMARY KEY composite project_identity, work_identity |
| WorkAssignmentId global unique | PRIMARY KEY people_work_assignment |
| un Assignment courant/personne/Work | UNIQUE partiel sur Work + personne pour ACTIVE/SUSPENDED |
| un RoleAssignment/rôle/Assignment | PRIMARY KEY composite |
| une période active/rôle/Assignment | UNIQUE partiel sur période ouverte |
| zéro ou un Owner actif/Work | UNIQUE partiel sur Work dans people_role_period pour OWNER ouvert |
| périodes non superposées | CHECK et triggers de chevauchement |
| événement unique | PRIMARY KEY event_id |
| ordre unique | index uniques de stream_sequence et revision/event_ordinal |
| causalité unique | PRIMARY KEY people_command_receipt.causation_id |
| migration unique | PRIMARY KEY version + nom/checksum vérifiés |

## Owner optionnel et unique

Un Work peut avoir zéro Owner. Aucun contrôle OWNER_REQUIRED ou LAST_OWNER_REMOVAL_FORBIDDEN n’est actif.

La garantie « au plus un » est double :

1. People Authority et WorkPeople valident l’invariant métier ;
2. l’index unique partiel par Work refuse la violation au commit.

La contrainte ne porte jamais sur work_assignment_id seul. Suspension ou retrait clôt la période OWNER dans le même commit ; reprise ouvre une nouvelle période uniquement après contrôle de l’unicité.

## Périodes

Les intervalles sont demi-ouverts [effectiveFrom, effectiveTo). Deux périodes adjacentes ne se chevauchent pas. Une fin NULL signifie période ouverte. Les triggers utilisent ces mêmes règles et refusent les chevauchements ; ils ne raccourcissent ni ne fusionnent une période implicitement.

## Erreurs

Les violations identifiées avant SQL utilisent les erreurs métier existantes. Une contrainte SQLite concurrente est traduite vers la même sémantique stable lorsque son index est identifié ; sinon DOMAIN_CONSTRAINT_VIOLATION. Aucun message SQL brut ne traverse le port.
