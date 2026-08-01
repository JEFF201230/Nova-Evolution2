# PEOPLE Idempotence, Causality and Uniqueness

## Causalité

Chaque intention porte `causation_id`, `correlation_id`, source, acteur métier, timestamp et hash de requête. La causalité est une donnée de provenance; elle ne doit pas être confondue avec `runId`, `ExecutionSessionId`, agent technique ou événement Runtime.

## Idempotence

`causation_id` est unique. Une répétition exacte retourne le résultat initial sans nouvelle révision ni nouvel événement. La même causalité avec un hash différent est rejetée (`IDEMPOTENCY_KEY_REUSED`). La clé et le résultat sont écrits dans la transaction de mutation.

## Unicités durables

- BusinessPersonId unique ;
- WorkReference unique ;
- WorkAssignmentId unique ;
- au plus un Assignment ACTIVE ou SUSPENDED pour une personne et un Work ;
- au plus un Role Assignment actif par rôle et Assignment ;
- au plus un Owner actif par Work ;
- périodes actives non contradictoires ;
- event_id, aggregate sequence et causation_id uniques.

## Validation

Les contraintes SQLite constituent la dernière barrière, mais la validation métier précède l’écriture. Toute violation retourne une erreur contractuelle stable, sans correction implicite ni événement résiduel.

## Résultat conflictuel

Un conflit d’unicité ou de causalité n’est pas un retry transparent. Le port retourne la nature du conflit, l’agrégat concerné et la révision observée; le producteur décide d’une nouvelle intention explicite.

