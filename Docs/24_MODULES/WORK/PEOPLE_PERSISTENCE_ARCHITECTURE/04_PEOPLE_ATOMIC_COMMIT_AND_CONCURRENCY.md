# PEOPLE — Commit atomique et concurrence

## Frontière transactionnelle

BusinessPerson et WorkPeople sont les seules unités de commit métier.

- une commande BusinessPerson verrouille et modifie uniquement sa racine, son événement et son reçu ;
- une commande WorkPeople couvre le root, tous les Assignments/rôles/périodes affectés, tous les événements et le reçu ;
- la vérification des BusinessPerson référencées est une lecture dans la même transaction PEOPLE ;
- aucune transaction distribuée avec Work, Runtime ou un consommateur n’est créée.

## Contenu indivisible du commit

Selon la commande, une transaction contient obligatoirement :

- l’état courant nouveau ;
- la fermeture et/ou l’ouverture des périodes ;
- les événements métier dans l’ordre produit par People Authority ;
- causalité, corrélation et provenance ;
- empreinte de la commande et sa version ;
- reçu d’idempotence et résultat initial ;
- nouvelle révision et nouvelles séquences ;
- validation des foreign keys, CHECK, triggers et contraintes uniques.

Une publication vers des consommateurs éventuels se produit après commit depuis l’histoire canonique. Elle n’appartient pas à P3-PEOPLE-001D et ne peut rendre le commit partiel.

## Protocole SQLite

1. Configurer la connexion : foreign_keys=ON, WAL, synchronous=FULL et busy_timeout borné.
2. Exécuter BEGIN IMMEDIATE.
3. Résoudre d’abord l’idempotence.
4. Lire la racine et sa révision.
5. Comparer la révision avec expectedRevision.
6. Revalider les données reconstituées et la candidate People Authority.
7. Appliquer uniquement INSERT/UPDATE de clôture, jamais DELETE métier.
8. Insérer les événements contigus.
9. Insérer le reçu final.
10. Vérifier les compteurs de lignes et la cohérence de révision.
11. COMMIT ; toute exception avant commit provoque ROLLBACK.

BEGIN IMMEDIATE réserve l’écriture au début et évite que deux mutations ne valident simultanément le même head. Le CAS reste obligatoire et observable.

## expectedRevision et CAS

- expectedRevision = 0 signifie que l’appelant exige l’absence ;
- un agrégat existant possède une révision ≥ 1 ;
- UPDATE du head utilise WHERE revision = expectedRevision ;
- une création vérifie simultanément l’absence et expectedRevision = 0 ;
- zéro ligne modifiée ou une unicité concurrente déclenche CONCURRENT_PEOPLE_CHANGE ou l’erreur métier plus précise ;
- le repository calcule nextRevision ; l’appelant ne la choisit pas ;
- la révision est strictement monotone, sans saut et sans retour arrière.

## Sérialisation WorkPeople

Toutes les mutations d’un même WorkPeople sont sérialisées par la transaction SQLite et le CAS de la clé composite WorkReference. ChangeWorkOwner et ReplaceAssignedPerson ne sont pas scindés :

- ancien Owner clôturé et nouveau Owner ouvert dans un seul commit ;
- ancien Assignment et remplacement évoluent dans un seul commit ;
- aucun état intermédiaire n’est observable ;
- la contrainte unique durable sur WorkReference bloque un second Owner même si la validation mémoire est défaillante.

SQLite sérialise les writers du fichier entier au MVP. Ce coût est accepté car un seul service PEOPLE écrit et la charge MVP est faible.

## Conflits et retry

| Situation | Résultat |
|---|---|
| CAS obsolète | rollback complet, CONCURRENT_PEOPLE_CHANGE avec expected/actual |
| second Owner | rollback complet, OWNER_ALREADY_DEFINED |
| Assignment/rôle/période concurrent | rollback complet, erreur métier ou concurrence |
| même causalité/même empreinte | résultat REPLAYED, aucune écriture |
| même causalité/empreinte différente | rollback, IDEMPOTENCY_CONFLICT |
| base verrouillée au-delà du timeout | PERSISTENCE_UNAVAILABLE, état indéterminé seulement jusqu’à la relecture par causalité |

Après conflit métier ou CAS, aucun retry automatique n’est autorisé. L’appelant relit, réévalue avec People Authority et soumet une nouvelle intention. Après timeout ou perte de réponse, il répète la même causalité et la même empreinte afin de retrouver le reçu.

## Last-write-wins

Le last-write-wins est interdit pour toute donnée PEOPLE. Les timestamps ne sont jamais des jetons de concurrence et ne départagent ni Owner, ni rôle, ni période.

## Échecs

- validation avant écritures : aucune ligne nouvelle ;
- erreur au milieu des écritures : rollback de l’ensemble ;
- crash avant commit durable : SQLite récupère l’état précédent ;
- crash après commit durable : état, événements et reçu sont tous retrouvables ;
- erreur de publication aval : aucun rollback PEOPLE ; le consommateur reprend depuis l’histoire.
