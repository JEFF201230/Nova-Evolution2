# PEOPLE Dependency Boundaries

## Autorisé

- PEOPLE domain model, value objects, entities, errors et People Authority ;
- un port de persistance PEOPLE ;
- un adaptateur SQLite interne ;
- un module de migration/recovery interne ;
- WorkReference en valeur métier ;
- tests et fixtures de persistance strictement locales.

## Interdit

- import de `NovaCoreExecutionEngine`, `RuntimeExecutionContract`, Mission Pipeline, RuntimeAgent ou ExecutionSession dans le domaine ;
- import de CEREBRAU, certification policy ou registre de preuves dans le domaine ;
- écriture directe par Work, BFF, UI ou API ;
- copie de Work, Mission, Decision, Deliverable, Session ou agent ;
- nouvelle source Owner/Participant hors Work People.

## Adaptation aux briques existantes

`server/nova-core/people-lot-runtime-execution-contract.adapter.ts` reste la seule frontière machine/runtime et ne doit pas être importée par la persistance métier. `server/nova-core/nova-core.store.ts`, `integration-runtime-repository.ts` et `execution-session-persistence.ts` restent des composants Runtime non réutilisés comme repositories PEOPLE.

## Work

Work pourra lire un port/query PEOPLE après certification des écritures et requêtes. Il ne stocke pas d’agrégat miroir et ne possède pas l’Owner People. L’absence de People reste explicite.

## CEREBRAU

CEREBRAU peut certifier le lot et conserver des preuves; il ne persiste pas les agrégats métier PEOPLE. La certification consomme des preuves, elle ne devient pas une dépendance de stockage.

## Frontières de fichiers

La mission P3-PEOPLE-001D doit autoriser uniquement les nouveaux modules sous `server/domain/people` ou un sous-répertoire persistence PEOPLE explicitement listé, leurs tests et migrations SQLite. Aucun fichier Framework, contrat certifié, BFF, UI ou certification ne doit être modifié.

