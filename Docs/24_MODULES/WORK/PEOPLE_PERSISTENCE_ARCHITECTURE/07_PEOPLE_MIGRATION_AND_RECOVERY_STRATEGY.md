# PEOPLE — Stratégie de migration et de recovery

## Objectifs

Toute évolution de la persistance PEOPLE est versionnée, déterministe, vérifiable, idempotente et récupérable. Elle préserve identités, périodes, provenance, causalité, révisions et ordre historique. Elle ne fabrique aucune BusinessPerson depuis une source technique.

## Chaîne de migrations

- une migration possède version entière, nom stable, checksum SHA-256 et code de vérification ;
- les versions s’appliquent une par une, sans saut ;
- chaque migration et l’insertion de sa ligne people_schema_migration sont dans une même transaction BEGIN IMMEDIATE ;
- rejouer une version déjà appliquée avec le même checksum est un no-op validé ;
- même version avec checksum différent, trou de version ou schéma plus récent que le binaire : démarrage refusé ;
- une migration ne corrige jamais silencieusement un doublon, un Owner multiple, une période contradictoire ou une référence invalide ;
- aucune seconde persistance PEOPLE active n’est maintenue pendant une migration.

La version initiale ne doit importer ni RuntimeSnapshot, RuntimeEvent, compte, Session, agent, fixture, projection, registre CEREBRAU ou données Work autres que les WorkReferences déjà acceptées par PEOPLE.

## Stratégie de changement

### Changement additif

Créer la structure, vérifier, enregistrer la version, commit. Le retour arrière peut utiliser une migration down si elle est sans perte et testée.

### Transformation de données

Employer expand → backfill déterministe → vérification → bascule → contract. Le backfill lit exclusivement la source PEOPLE précédente et conserve les anciennes données jusqu’au gate de vérification.

### Changement destructif ou non réversible

Interdit sans sauvegarde cohérente validée, procédure de restauration, ancien binaire compatible et autorisation explicite. Le rollback est alors « restauration de la sauvegarde + ancien binaire », pas une tentative de recréer les données perdues.

## Migration de l’état présent

L’implémentation tracked de version 1 n’est pas considérée comme certifiée et P3-PEOPLE-001D est PENDING_EVIDENCE. La convergence doit :

1. inventorier toute base PEOPLE réellement déployée ; aucune n’est prouvée par le dépôt ;
2. si aucune donnée opérationnelle n’existe, appliquer une nouvelle chaîne initiale propre sur base vide ;
3. si des données existent, créer une migration explicite qui détecte collisions de WorkReference, plusieurs Owners par Work, causalités multi-événements impossibles, doublons et DELETE/rewrite antérieurs ;
4. arrêter avec rapport d’écart si une sémantique ne peut être conservée ;
5. ne jamais déclarer automatiquement les tables existantes conformes.

## Préflight de migration

- sauvegarde SQLite cohérente et test d’ouverture ;
- espace disque suffisant ;
- aucun writer concurrent ;
- version et checksums connus ;
- quick_check et foreign_key_check PASS ;
- comptages par table, révisions terminales et bornes de séquence enregistrés ;
- dry-run sur copie pour toute transformation.

## Postflight

- integrity_check et foreign_key_check PASS ;
- checksums de migration exacts ;
- comptages et identités conservés ;
- zéro Owner multiple, zéro Assignment/rôle actif dupliqué, zéro période chevauchée ;
- chaque head concorde avec histoire et reçu ;
- replay complet ou échantillonnage exhaustif au volume MVP ;
- redémarrage avec le nouveau binaire.

## Recovery par scénario

| Incident | Comportement |
|---|---|
| crash avant COMMIT | récupération WAL ; transaction absente ; retry avec même causalité |
| crash après COMMIT, réponse perdue | reçu retrouvé ; retour REPLAYED |
| écriture interrompue | rollback SQLite ; aucune ligne partielle visible |
| migration interrompue | rollback transactionnel ; version non enregistrée ; reprise après checks |
| base locked au démarrage | attente bornée puis indisponibilité ; aucun fallback vers un autre store |
| état courant divergent, histoire intègre | mode recovery, reconstruction des tables courantes sur copie, vérification, bascule atomique |
| histoire ou fichier corrompu | fail closed, quarantaine, restauration de la dernière sauvegarde intègre, validation puis reprise |
| checksum de migration divergent | démarrage bloqué et investigation ; aucune réapplication |
| version de schéma inconnue | démarrage bloqué ; aucun downgrade implicite |

## Sauvegarde et restauration

- employer l’API de backup SQLite ou un mécanisme produisant une image transactionnellement cohérente ;
- ne pas copier seulement le fichier principal pendant qu’il est ouvert en WAL ;
- inclure schéma, état, événements, reçus et migrations ;
- chiffrage, contrôle d’accès et emplacement relèvent de l’exploitation gouvernée ;
- chaque restauration est faite vers un nouvel emplacement, vérifiée, puis basculée ; jamais écrasée sur une base active ;
- après restauration, exécuter intégrité, foreign keys, checksums, replay et test de redémarrage.

## Retention et objectifs opérationnels

Le contrat PEOPLE interdit la suppression physique et ne fixe ni RPO, ni RTO, ni fréquence de backup. Décision MVP : conservation indéfinie des données PEOPLE ; sauvegarde cohérente obligatoire avant migration et avant toute opération de recovery.

La fréquence opérationnelle régulière, le RPO/RTO et le répertoire de sauvegarde restent des paramètres d’exploitation à fixer avant mise en production. Ils ne changent ni le modèle, ni le moteur, ni le protocole de recovery.

## Corruption

Une corruption détectée n’est jamais réparée par une projection, Runtime ou CEREBRAU. Les écritures restent fermées jusqu’à restauration ou reconstruction vérifiée. Toute perte d’événement sans sauvegarde intègre est une perte de vérité et impose une escalade, pas une invention d’historique.
