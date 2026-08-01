# PEOPLE Repository Ports Contract

## Règle de frontière

Les ports appartiennent à `server/domain/people` ou à un module de persistance PEOPLE dépendant du domaine. Ils ne réexportent aucun type SQLite, Node SQL, Runtime, CEREBRAU ou API.

## Ports proposés

Les noms ci-dessous sont des décisions de conception, absentes du dépôt à ce jour.

```text
PeoplePersonRepository
  load(businessPersonId)
  save(expectedRevision, aggregate, commandContext)

PeopleWorkPeopleRepository
  load(workReference)
  save(expectedRevision, aggregate, commandContext)

PeopleEventHistory
  append(transaction, events)
  readStream(aggregateType, aggregateId)

PeopleTransaction
  execute(work)

PeoplePersistenceHealth
  check()
```

## Contrat de résultat

`load` retourne l’agrégat rehydraté, sa révision, son dernier événement et un état explicite `FOUND`/`ABSENT`/`UNAVAILABLE`. `save` retourne la nouvelle révision, les événements acceptés et la causalité idempotente. Un conflit de révision retourne une erreur contractuelle sans effet partiel.

## Adaptateur SQLite

Un seul adaptateur concret connaît SQLite et les noms de tables. Il traduit les lignes vers les agrégats existants (`business-person.aggregate.ts`, `work-people.aggregate.ts`, entités et value objects) sans placer de logique métier dans SQL.

## Contrats existants réutilisables

`server/nova-core/integration-runtime-repository.ts` et `execution-session-persistence.ts` démontrent des patterns de persistance Runtime, mais leurs interfaces et leurs données restent hors du domaine PEOPLE. Aucun port existant ne doit être détourné.

