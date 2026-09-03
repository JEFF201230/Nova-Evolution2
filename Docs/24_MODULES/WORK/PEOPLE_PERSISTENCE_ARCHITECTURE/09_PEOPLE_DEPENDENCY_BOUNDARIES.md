# PEOPLE — Frontières de dépendances

## Règle

PEOPLE dépend de ses contrats métier et de son port de stockage. L’adaptateur SQLite dépend des ports PEOPLE. Aucun composant consommateur ou technique ne se trouve sur le chemin de décision d’un fait PEOPLE.

Sens autorisé :

    consommateur → façade/query PEOPLE → ports PEOPLE → adaptateur SQLite PEOPLE
                              ↑
                     People Authority + agrégats

Les flèches inverses vers Runtime, CEREBRAU, Work, Mission Engine, API, BFF, frontend ou projection sont interdites.

## Matrice

| Composant | Peut consommer | Ne peut jamais |
|---|---|---|
| Runtime | événements/lectures explicitement publiés après les lots prévus | posséder la DB, convertir RuntimeAgent, écrire un agrégat |
| CEREBRAU | preuves de tests et certification | être repository, migrer ou restaurer les données métier |
| Work | vérifier/lire WorkReference, Participants/Owner via frontière future | stocker un miroir, écrire Owner/Assignment |
| Mission Engine | références autorisées futures | fabriquer une BusinessPerson depuis Mission/agent |
| API | appeler une application PEOPLE future | accéder à SQLite ou définir la sémantique |
| BFF | consommer une API/query future | écrire les tables ou conserver une copie canonique |
| frontend | afficher des DTO | fixture/projection → fait PEOPLE |
| projections | recevoir/rejouer des événements commités | arbitrer un conflit ou servir au recovery canonique |

## Dépendances PEOPLE autorisées

- BusinessPerson, WorkPeople, WorkAssignment, RoleAssignment ;
- Value Objects, erreurs, commandes, événements et People Authority ;
- port engine-neutral de vérification WorkReference, limité à l’existence/stabilité ;
- horloge injectée pour recorded_at, distincte de effectiveAt fourni par le métier ;
- bibliothèque standard Node, dont node:sqlite, uniquement dans l’adaptateur ;
- système de fichiers via un locator/configuration injecté à l’adaptateur ;
- primitives cryptographiques standard pour SHA-256.

## Interdictions d’import

Le domaine et les ports ne doivent importer aucun fichier de :

- server/runtime ;
- server/nova-core fournissant RuntimeSnapshot, RuntimeEvent, IntegrationRuntimeRepository, JsonRuntimeSnapshotStore ou Mission Engine ;
- server/nova-bff ;
- tools/cerebrau ;
- apps ou client ;
- fixtures ou projections.

La composition applicative peut instancier l’adaptateur, mais ne reçoit pas de primitive SQL permettant une écriture directe.

## Frontière Work

PEOPLE stocke WorkReference sous deux valeurs canoniques. Il ne stocke ni lifecycle, objective, progress, mission, deliverable ou Decision de Work.

La première création WorkPeople requiert une preuve d’existence obtenue par un port. Une fois acceptée, la référence stable n’est pas requalifiée à chaque load. La persistance ne met aucune FK vers une table Work externe et n’ouvre aucune transaction distribuée.

## Frontière BusinessPerson

Une BusinessPerson n’est jamais dérivée de User, compte, RBAC, Session, HumanApprovalDecision, RuntimeAgent ou Technical Agent. Une relation future avec une identité technique doit être décidée par un contrat distinct et ne remplace pas BusinessPersonId.

## Frontière des événements

people_event ne contient que PeopleDomainEvent. Une projection peut conserver son checkpoint, mais ce checkpoint appartient au consommateur. L’échec du consommateur ne rollback pas PEOPLE ; le replay repart du flux PEOPLE.

RuntimeEvent et les journaux Runtime restent des données Runtime. Même si leurs mécanismes de hash/replay inspirent des tests, ils ne sont ni adaptés ni enveloppés comme event store PEOPLE.

## Audit de réutilisation

Le fichier exact RUNTIME-PEOPLE-PERSISTENCE-REUSE-AUDIT-001_REPORT.md n’a pas été trouvé.

tools/cerebrau/P3-PEOPLE-INFRASTRUCTURE-REUSE-AUDIT-001.md est un prompt READ ONLY demandant un rapport, pas une preuve de résultat. Les conclusions antérieures ont donc été revérifiées directement :

| Élément | Responsabilité réelle | Décision PEOPLE |
|---|---|---|
| IntegrationRuntimeRepository | persiste RuntimeSnapshot/RuntimeEvent pour l’intégration Runtime | INCOMPATIBLE comme source ; aucun adapter PEOPLE |
| JsonRuntimeSnapshotStore | fichier JSON Runtime signé/atomique | INCOMPATIBLE pour contraintes et ownership PEOPLE |
| RuntimeSnapshot / RuntimeEvent | état et faits d’orchestration Runtime | INCOMPATIBLE sémantiquement |
| append-only-journal Runtime | intégrité du journal Runtime | référence de test seulement |
| registres CEREBRAU | pilotage, preuves et certification | INCOMPATIBLE comme store métier |
| fixtures frontend | données d’affichage/test | TEST_ONLY, jamais importées |
| projections Work/Runtime | lectures reconstructibles | non autoritatives |
| people-persistence-* | implémentation SQLite PEOPLE partielle existante | REUSE_WITH_EXTENSION et corrections obligatoires |

## Prévention de double vérité

- un seul fichier SQLite PEOPLE opérationnel par environnement ;
- pas de dual write ;
- pas de fallback vers JSON/Runtime si SQLite est indisponible ;
- une migration bascule après vérification et ferme l’ancienne source ;
- cache/projection jetable et reconstruit depuis people_event ;
- backup inactif tant qu’il n’est pas restauré et validé.
