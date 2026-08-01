# PEOPLE Atomic Commit and Concurrency

## Atomicité

Toute commande Business Person est une transaction SQLite atomique sur son agrégat. Toute commande Work People qui vérifie une personne puis modifie assignment/rôles/histoire utilise une transaction unique. Un échec provoque rollback de toutes les lignes et aucun événement de changement partiel.

## Ordre de commit

1. ouvrir la transaction ;
2. charger la révision attendue et vérifier l’idempotence ;
3. charger Business Person si nécessaire ;
4. revalider invariants et périodes ;
5. écrire l’état d’agrégat ;
6. écrire les événements et la clé de causalité ;
7. incrémenter la révision ;
8. commit SQLite ;
9. retourner le résultat déjà persisté.

## Concurrence

Le contrôle primaire est optimiste : `UPDATE ... WHERE revision = expectedRevision`. Une ligne affectée nulle produit `STALE_REVISION`. Les mutations `ChangeWorkOwner` et `ReplaceAssignedPerson` sont sérialisées sur le Work People; SQLite `BEGIN IMMEDIATE` peut être utilisé par l’adaptateur pour cette frontière, sans exposer le mécanisme au domaine.

## Règles de conflit

- deux Owners actifs : rejet atomique ;
- assignment ou rôle concurrent : rejet si révision obsolète ou période contradictoire ;
- retry après conflit : relecture complète, réévaluation des invariants, nouvelle causalité si l’intention change ;
- timeout ou crash avant commit : aucune mutation visible ;
- crash après commit : le résultat est retrouvable par causalité.

## Preuves obligatoires

Tests multi-connexions doivent démontrer double Owner, révision obsolète, remplacement concurrent, absence d’événement partiel, rollback injecté, reprise après verrou et sérialisation des mutations Work People.

