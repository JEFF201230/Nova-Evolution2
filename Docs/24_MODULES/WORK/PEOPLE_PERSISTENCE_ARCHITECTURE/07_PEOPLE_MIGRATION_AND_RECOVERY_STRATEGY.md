# PEOPLE Migration and Recovery Strategy

## Migrations

Les migrations SQLite sont versionnées, monotones et exécutées avant l’ouverture opérationnelle. Chaque migration possède un identifiant, un checksum, un prérequis et une procédure de vérification. Une migration qui rencontre doublon, Owner multiple, période contradictoire ou référence inconnue échoue; elle ne corrige pas silencieusement.

## Première migration

La migration initiale crée les tables et index de `03_PEOPLE_DURABLE_DATA_MODEL.md`. Elle n’importe aucune fixture, compte, Session, agent ou source Runtime. Une Business Person n’est créée que par reconnaissance métier explicite.

## Réversibilité

Avant certification, une migration doit être testée sur copie, vérifiée par comptages/checksums et réversible ou accompagnée d’un rollback documenté. Deux persistances PEOPLE actives sont interdites.

## Sauvegarde

La base, son journal et son numéro de schéma sont sauvegardés ensemble. La sauvegarde conserve identité, révisions, histoire et provenance. Un export de projection n’est pas une sauvegarde canonique.

## Récupération

Après crash : ouvrir en mode de récupération, vérifier intégrité SQLite, vérifier la dernière transaction et reconstruire les agrégats depuis l’histoire si le snapshot est incohérent. Rejouer sans émission d’événement; bloquer l’écriture si une divergence persiste.

## Scénarios de reprise

Les tests doivent couvrir crash avant commit, crash après commit, journal tronqué, snapshot divergent, migration interrompue, restauration d’une sauvegarde et reprise après conflit de révision.

