# NOVA-R08 — WORK PEOPLE REAL PATH — MISSION ORDER

## 1. Mission

MissionId: NOVA-R08-WORK-PEOPLE-REAL-PATH-001
RoadmapLot: NOVA-R08
MissionType: IMPLEMENTATION
ExecutionMode: RUNTIME_MUTATION
Profile: BUILD
ChangesExpected: true
ReadOnly: false
RoadmapDependency: NOVA-R06
CerebrauDependsOn: NONE - NOVA-R06 has no official linked MissionId

## 2. Objective

Raccorder l'écran Work People aux données PEOPLE réelles déjà exposées au domaine Work.

Vertical slice cible :

PEOPLE persistence
→ PeopleQueryService.GetWorkParticipants
→ WorkPeopleQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service frontend
→ hook frontend
→ WorkSurface
→ WorkPeoplePage

Supprimer l'utilisation de getWorkPeopleFixture() du chemin runtime Work People.

## 3. Autorité existante à préserver

Le domaine PEOPLE est déjà propriétaire des données People.

Le chemin interne certifié existant est :

PEOPLE persistence
→ PeopleQueryService.GetWorkParticipants
→ WorkPeopleQuery

Cette mission ne doit pas reconstruire cette capacité.

WorkPeopleQuery doit rester un consommateur read-only de PEOPLE.

Work ne doit devenir propriétaire :
- ni des agrégats PEOPLE ;
- ni des rôles PEOPLE ;
- ni de l'Owner PEOPLE ;
- ni de l'historique PEOPLE ;
- ni de la persistence PEOPLE.

Invariant obligatoire :

BusinessPerson != RuntimeAgent != TechnicalAgent.

Aucun fallback, mapping implicite ou promotion d'un agent technique en personne métier n'est autorisé.

## 4. État actuel vérifié

Backend existant :

server/runtime/work/work-people.query.ts

NovaCoreService instancie WorkPeopleQuery avec :

PeopleQueryService
→ PeopleAggregatePersistenceStore
→ peopleDatabasePath

Frontend actuel :

apps/nova-web/src/components/routes/WorkSurface.tsx

importe encore :

getWorkPeopleFixture

et utilise encore :

const people = workId ? getWorkPeopleFixture(workId) : undefined;

WorkPeoplePage utilise encore les types de fixture WorkPeopleFixture et WorkPersonFixture.

Aucun vertical slice HTTP/BFF/frontend Work People n'a été établi dans l'inspection préalable.

## 5. Architecture de référence

Utiliser le vertical slice Work Plan déjà implémenté comme référence structurelle uniquement :

WorkPlanningQuery
→ NovaCoreService
→ Core HTTP
→ BFF
→ service frontend
→ hook frontend
→ WorkSurface
→ WorkPlanPage

Références existantes :

contracts/work-plan.contract.ts

server/nova-core/nova-core.http.ts

server/nova-bff/work-plan.gateway.port.ts
server/nova-bff/work-plan.gateway.ts
server/nova-bff/work-plan.route.ts

apps/nova-web/src/features/work/workPlan.service.ts
apps/nova-web/src/features/work/useWorkPlan.ts

apps/nova-web/src/components/routes/WorkSurface.tsx

Le contrat People ne doit PAS copier le modèle métier Planning.

Seul le pattern de transport et d'intégration peut être réutilisé.

## 6. Travail autorisé

Le lot peut :

1. définir le contrat de transport Work People minimal nécessaire ;

2. exposer la lecture WorkPeopleQuery via NovaCoreService si aucune méthode publique adaptée n'existe ;

3. créer le endpoint Core HTTP read-only nécessaire ;

4. créer le gateway/route BFF Work People avec authentification ;

5. résoudre l'identité canonique projectId/workId selon le pattern Work existant ;

6. propager le correlation ID ;

7. valider strictement les réponses du Runtime ;

8. créer le service frontend Work People ;

9. créer le hook frontend Work People ;

10. raccorder WorkSurface au hook réel ;

11. adapter WorkPeoplePage aux données réelles ;

12. supprimer getWorkPeopleFixture() du chemin runtime ;

13. adapter ou créer les tests strictement nécessaires au vertical slice R08.

## 7. Interdictions

Ne pas :

- reconstruire PEOPLE ;
- modifier la propriété métier des données PEOPLE ;
- introduire une persistence PEOPLE dans Work ;
- copier les agrégats PEOPLE dans Work ;
- transformer RuntimeAgent ou TechnicalAgent en BusinessPerson ;
- inventer des personnes ;
- inventer des rôles ;
- inventer des disponibilités ;
- conserver un fallback silencieux vers workPeopleFixture ;
- modifier Work Plan ;
- modifier Work Decisions ;
- modifier Work Deliverables ;
- modifier Work Sources/Evidence ;
- supprimer les fixtures des autres écrans Work ;
- entreprendre R09, R10, R11 ou R12 ;
- effectuer un refactoring général hors périmètre.

## 8. Comportements attendus

Le frontend doit représenter explicitement les états réellement fournis par le producteur People.

Les états d'absence ou d'indisponibilité ne doivent jamais être remplacés par des données fictives.

Les erreurs de transport doivent rester distinctes d'une absence métier lorsque le contrat existant permet cette distinction.

L'identité retournée doit correspondre au Work demandé.

## 9. Sécurité BFF

Le endpoint BFF Work People doit suivre les frontières déjà appliquées au Work Plan :

- authentification obligatoire ;
- résolution canonique du Work ;
- propagation correlation ID ;
- timeout ;
- validation stricte de la réponse Runtime ;
- normalisation des erreurs ;
- absence d'exposition des diagnostics internes non autorisés.

## 10. Tests obligatoires

Tester au minimum :

- lecture People réelle disponible ;
- Work inexistant ;
- People absent ;
- producteur People indisponible si cet état existe dans le contrat source ;
- réponse Runtime invalide ;
- identité incohérente ;
- BFF non authentifié ;
- timeout/runtime indisponible ;
- état loading frontend ;
- état ready frontend ;
- état empty/absent frontend ;
- état error frontend ;
- navigation vers /work/:workId/people ;
- absence de getWorkPeopleFixture dans le chemin runtime final.

Exécuter également les suites de non-régression Core, BFF et frontend applicables.

## 11. Critères de sortie

R08 n'est clos que si le chemin suivant est démontré par tests et preuves runtime :

PeopleQueryService
→ WorkPeopleQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service/hook frontend
→ WorkSurface
→ WorkPeoplePage

ET :

getWorkPeopleFixture n'est plus utilisé par le chemin runtime Work People.

ET :

aucune donnée People fictive n'est utilisée comme fallback runtime.

ET :

les frontières certifiées du domaine PEOPLE sont préservées.

## 12. Preuves attendues

Le rapport final doit fournir :

- fichiers créés ;
- fichiers modifiés ;
- fichiers supprimés ;
- endpoints Core/BFF créés ou réutilisés ;
- contrat transport utilisé ;
- résultats des tests ciblés ;
- résultats des tests Core ;
- résultats des tests BFF ;
- résultats des tests frontend ;
- typecheck ;
- build ;
- preuve de disparition du fallback fixture runtime ;
- preuve du vertical slice réel ;
- git diff --check ;
- git status final ;
- blockers éventuels.

## 13. Stop conditions

STOP sans contourner si :

- WorkPeopleQuery n'est pas réellement exploitable depuis NovaCoreService ;
- la source PEOPLE autoritative est ambiguë ;
- la mission nécessite de modifier la propriété métier de PEOPLE ;
- le contrat People existant ne permet pas une projection fiable sans décision métier supplémentaire ;
- l'identité projectId/workId ne peut pas être résolue sans ambiguïté ;
- une dépendance certifiée annoncée est absente ;
- le scope nécessaire dépasse R08.

Dans ce cas produire les preuves du blocage et ne pas inventer de remplacement.

## 14. Principe directeur

EXISTANT
→ RÉUTILISATION
→ RÉPARATION MINIMALE
→ NOUVEAU DÉVELOPPEMENT uniquement lorsque l'absence est démontrée.

R08 est un lot de raccordement UI/transport.

R08 n'est pas un nouveau lot métier PEOPLE.

## 15. Décision attendue

Le rapport final doit conclure exclusivement par l'un des états suivants :

READY_FOR_REVIEW
BLOCKED
FAILED

Aucune certification automatique n'est autorisée.
