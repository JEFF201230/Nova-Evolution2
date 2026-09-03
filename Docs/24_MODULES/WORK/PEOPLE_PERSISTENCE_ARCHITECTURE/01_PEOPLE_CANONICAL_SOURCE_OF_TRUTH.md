# PEOPLE — Source de vérité canonique

## Règle normative

PEOPLE possède ses données métier. People Authority est l’unique producteur autorisé à accepter une intention et à produire un nouvel état PEOPLE. La persistance PEOPLE conserve le résultat accepté ; elle ne crée ni ne corrige de fait métier.

La source de vérité n’est pas « SQLite » en soi. Elle est le contenu PEOPLE validé et engagé dans la transaction canonique, SQLite étant l’adaptateur retenu pour le MVP.

## Contenu canonique

| Agrégat | Identité | Données canoniques |
|---|---|---|
| BusinessPerson | BusinessPersonId | identité stable, provenance de reconnaissance, révision, événement BusinessIdentityRecognized |
| WorkPeople | WorkReference = Project Identity + Work Identity | WorkAssignments, BusinessPersonId référencés, statuts, périodes, RoleAssignments, périodes de rôle, trails de provenance, révision et événements |

WorkAssignment est une entité de WorkPeople. RoleAssignment est une entité de WorkAssignment. Aucun des deux n’est un agrégat ou un repository indépendant.

## Invariants existants vérifiés

L’inspection du domaine établit :

- BusinessPerson est immuable et porte BusinessPersonId et recognitionProvenance ;
- WorkPeople est la frontière qui vérifie les identifiants d’Assignment uniques, l’absence de deux Assignments courants pour une personne et l’unicité du Owner observé ;
- un WorkAssignment exige au moins un rôle historique et une provenance, et ACTIVE exige un rôle effectif ;
- AssignmentStatus est limité à ACTIVE, SUSPENDED et ENDED, ENDED étant terminal ;
- un RoleAssignment porte des périodes ordonnées, non superposées et rattachées à l’Assignment ;
- les rôles sont limités à OWNER, CONTRIBUTOR, REVIEWER, APPROVER, OBSERVER, REQUESTER et SPONSOR ;
- PeopleProvenance contient authority, businessCause et effectiveAt ;
- People Authority produit zéro à plusieurs événements ordonnés pour une commande et utilise businessCause comme causalité métier.

La persistance doit reconstituer ces objets par leurs factories contrôlées, réexécuter leurs invariants et ne jamais hydrater un objet invalide par contournement.

## État, histoire et données reconstructibles

Sont canoniques dans une même base et un même commit :

- les lignes d’état courant nécessaires à une lecture déterministe ;
- le flux d’événements immuable expliquant chaque révision ;
- le reçu de commande accepté et sa provenance.

Sont reconstructibles :

- Participant, dérivé d’un Assignment ACTIVE à la date observée ;
- Owner, dérivé du rôle OWNER effectif ;
- collections par rôle et responsabilités ;
- index de recherche, caches et projections ;
- l’état courant, reconstructible par replay de l’histoire complète.

Les tables d’état courant sont une matérialisation transactionnelle canonique pour les lectures opérationnelles, mais elles ne constituent pas une vérité concurrente : une divergence avec l’histoire est une corruption, pas un arbitrage. La recovery reconstruit ces tables depuis l’histoire ou restaure une sauvegarde validée.

## Ownership

| Élément | Propriétaire | Écriture |
|---|---|---|
| Agrégats et histoire PEOPLE | PEOPLE / People Authority | uniquement via les repositories PEOPLE |
| WorkReference | Work, référencé par PEOPLE | vérifié avant première mutation ; jamais copié comme objet Work |
| Fichier SQLite PEOPLE et migrations | adaptateur de persistance PEOPLE | uniquement par le composant de persistance/migration PEOPLE |
| Projections consommatrices | domaine consommateur | alimentées après commit, jamais écrites dans la transaction métier PEOPLE |

La vérification d’existence de Work est une précondition inter-domaine. Elle ne crée pas de transaction distribuée : la référence acceptée est stockée par valeur et reste stable. La vérification de BusinessPerson précédant une affectation s’effectue dans la transaction SQLite PEOPLE, sur la même source.

## Dépendances interdites

La vérité PEOPLE ne peut dépendre de Runtime, CEREBRAU, Work au-delà de WorkReference et de sa vérification, Mission Engine, API, BFF, frontend, fixtures, comptes, Sessions, RBAC, RuntimeAgent, Technical Agent, Decision, projections ou caches.

Ces composants ne peuvent :

- créer ou modifier une ligne PEOPLE directement ;
- fournir une identité métier par conversion technique ;
- arbitrer une révision ou un conflit ;
- restaurer PEOPLE depuis leur propre état ;
- devenir une réplication active ou une source secondaire.

## Suppression et rétention

- aucune suppression physique de BusinessPerson n’est permise dans la Foundation ;
- aucune suppression physique de WorkPeople, WorkAssignment, RoleAssignment, période, événement ou reçu accepté n’est permise ;
- quitter un Work clôt l’Assignment avec ENDED et une date de fin ;
- un WorkPeople sans participant demeure avec son histoire ;
- un futur retrait logique de BusinessPerson exige une décision contractuelle ultérieure ;
- aucune durée de purge PEOPLE n’est définie par les contrats inspectés : par défaut, conservation indéfinie dans le MVP.

## Absence et indisponibilité

Une lecture distingue obligatoirement :

- ABSENT : aucun agrégat n’a jamais été accepté pour cette identité ;
- FOUND : agrégat reconstitué et validé ;
- UNAVAILABLE : stockage inaccessible ;
- CORRUPTED : stockage lisible mais incohérent.

Une collection vide est un résultat FOUND, jamais un synonyme d’ABSENT ou d’UNAVAILABLE.
