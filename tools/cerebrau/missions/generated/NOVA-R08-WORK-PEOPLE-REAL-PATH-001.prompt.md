<CEREBRAU_MISSION_CONTRACT>
{
    "missionId":  "NOVA-R08-WORK-PEOPLE-REAL-PATH-001",
    "missionType":  "IMPLEMENTATION",
    "lot":  "NOVA-R08",
    "changesExpected":  true,
    "readOnly":  false,
    "architecturalDecision":  "WORK_PEOPLE_REAL_PATH"
}
</CEREBRAU_MISSION_CONTRACT>

MISSION_ID: NOVA-R08-WORK-PEOPLE-REAL-PATH-001
MISSION_TYPE: IMPLEMENTATION
LOT: NOVA-R08
CHANGES_EXPECTED: true
READ_ONLY: false
ARCHITECTURAL_DECISION: WORK_PEOPLE_REAL_PATH

# NOVA-R08 â€” WORK PEOPLE REAL PATH â€” MISSION ORDER

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

Raccorder l'Ã©cran Work People aux donnÃ©es PEOPLE rÃ©elles dÃ©jÃ  exposÃ©es au domaine Work.

Vertical slice cible :

PEOPLE persistence
â†’ PeopleQueryService.GetWorkParticipants
â†’ WorkPeopleQuery
â†’ NovaCoreService
â†’ Core HTTP
â†’ BFF authentifiÃ©
â†’ service frontend
â†’ hook frontend
â†’ WorkSurface
â†’ WorkPeoplePage

Supprimer l'utilisation de getWorkPeopleFixture() du chemin runtime Work People.

## 3. AutoritÃ© existante Ã  prÃ©server

Le domaine PEOPLE est dÃ©jÃ  propriÃ©taire des donnÃ©es People.

Le chemin interne certifiÃ© existant est :

PEOPLE persistence
â†’ PeopleQueryService.GetWorkParticipants
â†’ WorkPeopleQuery

Cette mission ne doit pas reconstruire cette capacitÃ©.

WorkPeopleQuery doit rester un consommateur read-only de PEOPLE.

Work ne doit devenir propriÃ©taire :
- ni des agrÃ©gats PEOPLE ;
- ni des rÃ´les PEOPLE ;
- ni de l'Owner PEOPLE ;
- ni de l'historique PEOPLE ;
- ni de la persistence PEOPLE.

Invariant obligatoire :

BusinessPerson != RuntimeAgent != TechnicalAgent.

Aucun fallback, mapping implicite ou promotion d'un agent technique en personne mÃ©tier n'est autorisÃ©.

## 4. Ã‰tat actuel vÃ©rifiÃ©

Backend existant :

server/runtime/work/work-people.query.ts

NovaCoreService instancie WorkPeopleQuery avec :

PeopleQueryService
â†’ PeopleAggregatePersistenceStore
â†’ peopleDatabasePath

Frontend actuel :

apps/nova-web/src/components/routes/WorkSurface.tsx

importe encore :

getWorkPeopleFixture

et utilise encore :

const people = workId ? getWorkPeopleFixture(workId) : undefined;

WorkPeoplePage utilise encore les types de fixture WorkPeopleFixture et WorkPersonFixture.

Aucun vertical slice HTTP/BFF/frontend Work People n'a Ã©tÃ© Ã©tabli dans l'inspection prÃ©alable.

## 5. Architecture de rÃ©fÃ©rence

Utiliser le vertical slice Work Plan dÃ©jÃ  implÃ©mentÃ© comme rÃ©fÃ©rence structurelle uniquement :

WorkPlanningQuery
â†’ NovaCoreService
â†’ Core HTTP
â†’ BFF
â†’ service frontend
â†’ hook frontend
â†’ WorkSurface
â†’ WorkPlanPage

RÃ©fÃ©rences existantes :

contracts/work-plan.contract.ts

server/nova-core/nova-core.http.ts

server/nova-bff/work-plan.gateway.port.ts
server/nova-bff/work-plan.gateway.ts
server/nova-bff/work-plan.route.ts

apps/nova-web/src/features/work/workPlan.service.ts
apps/nova-web/src/features/work/useWorkPlan.ts

apps/nova-web/src/components/routes/WorkSurface.tsx

Le contrat People ne doit PAS copier le modÃ¨le mÃ©tier Planning.

Seul le pattern de transport et d'intÃ©gration peut Ãªtre rÃ©utilisÃ©.

## 6. Travail autorisÃ©

Le lot peut :

1. dÃ©finir le contrat de transport Work People minimal nÃ©cessaire ;

2. exposer la lecture WorkPeopleQuery via NovaCoreService si aucune mÃ©thode publique adaptÃ©e n'existe ;

3. crÃ©er le endpoint Core HTTP read-only nÃ©cessaire ;

4. crÃ©er le gateway/route BFF Work People avec authentification ;

5. rÃ©soudre l'identitÃ© canonique projectId/workId selon le pattern Work existant ;

6. propager le correlation ID ;

7. valider strictement les rÃ©ponses du Runtime ;

8. crÃ©er le service frontend Work People ;

9. crÃ©er le hook frontend Work People ;

10. raccorder WorkSurface au hook rÃ©el ;

11. adapter WorkPeoplePage aux donnÃ©es rÃ©elles ;

12. supprimer getWorkPeopleFixture() du chemin runtime ;

13. adapter ou crÃ©er les tests strictement nÃ©cessaires au vertical slice R08.

## 7. Interdictions

Ne pas :

- reconstruire PEOPLE ;
- modifier la propriÃ©tÃ© mÃ©tier des donnÃ©es PEOPLE ;
- introduire une persistence PEOPLE dans Work ;
- copier les agrÃ©gats PEOPLE dans Work ;
- transformer RuntimeAgent ou TechnicalAgent en BusinessPerson ;
- inventer des personnes ;
- inventer des rÃ´les ;
- inventer des disponibilitÃ©s ;
- conserver un fallback silencieux vers workPeopleFixture ;
- modifier Work Plan ;
- modifier Work Decisions ;
- modifier Work Deliverables ;
- modifier Work Sources/Evidence ;
- supprimer les fixtures des autres Ã©crans Work ;
- entreprendre R09, R10, R11 ou R12 ;
- effectuer un refactoring gÃ©nÃ©ral hors pÃ©rimÃ¨tre.

## 8. Comportements attendus

Le frontend doit reprÃ©senter explicitement les Ã©tats rÃ©ellement fournis par le producteur People.

Les Ã©tats d'absence ou d'indisponibilitÃ© ne doivent jamais Ãªtre remplacÃ©s par des donnÃ©es fictives.

Les erreurs de transport doivent rester distinctes d'une absence mÃ©tier lorsque le contrat existant permet cette distinction.

L'identitÃ© retournÃ©e doit correspondre au Work demandÃ©.

## 9. SÃ©curitÃ© BFF

Le endpoint BFF Work People doit suivre les frontiÃ¨res dÃ©jÃ  appliquÃ©es au Work Plan :

- authentification obligatoire ;
- rÃ©solution canonique du Work ;
- propagation correlation ID ;
- timeout ;
- validation stricte de la rÃ©ponse Runtime ;
- normalisation des erreurs ;
- absence d'exposition des diagnostics internes non autorisÃ©s.

## 10. Tests obligatoires

Tester au minimum :

- lecture People rÃ©elle disponible ;
- Work inexistant ;
- People absent ;
- producteur People indisponible si cet Ã©tat existe dans le contrat source ;
- rÃ©ponse Runtime invalide ;
- identitÃ© incohÃ©rente ;
- BFF non authentifiÃ© ;
- timeout/runtime indisponible ;
- Ã©tat loading frontend ;
- Ã©tat ready frontend ;
- Ã©tat empty/absent frontend ;
- Ã©tat error frontend ;
- navigation vers /work/:workId/people ;
- absence de getWorkPeopleFixture dans le chemin runtime final.

ExÃ©cuter Ã©galement les suites de non-rÃ©gression Core, BFF et frontend applicables.

## 11. CritÃ¨res de sortie

R08 n'est clos que si le chemin suivant est dÃ©montrÃ© par tests et preuves runtime :

PeopleQueryService
â†’ WorkPeopleQuery
â†’ NovaCoreService
â†’ Core HTTP
â†’ BFF authentifiÃ©
â†’ service/hook frontend
â†’ WorkSurface
â†’ WorkPeoplePage

ET :

getWorkPeopleFixture n'est plus utilisÃ© par le chemin runtime Work People.

ET :

aucune donnÃ©e People fictive n'est utilisÃ©e comme fallback runtime.

ET :

les frontiÃ¨res certifiÃ©es du domaine PEOPLE sont prÃ©servÃ©es.

## 12. Preuves attendues

Le rapport final doit fournir :

- fichiers crÃ©Ã©s ;
- fichiers modifiÃ©s ;
- fichiers supprimÃ©s ;
- endpoints Core/BFF crÃ©Ã©s ou rÃ©utilisÃ©s ;
- contrat transport utilisÃ© ;
- rÃ©sultats des tests ciblÃ©s ;
- rÃ©sultats des tests Core ;
- rÃ©sultats des tests BFF ;
- rÃ©sultats des tests frontend ;
- typecheck ;
- build ;
- preuve de disparition du fallback fixture runtime ;
- preuve du vertical slice rÃ©el ;
- git diff --check ;
- git status final ;
- blockers Ã©ventuels.

## 13. Stop conditions

STOP sans contourner si :

- WorkPeopleQuery n'est pas rÃ©ellement exploitable depuis NovaCoreService ;
- la source PEOPLE autoritative est ambiguÃ« ;
- la mission nÃ©cessite de modifier la propriÃ©tÃ© mÃ©tier de PEOPLE ;
- le contrat People existant ne permet pas une projection fiable sans dÃ©cision mÃ©tier supplÃ©mentaire ;
- l'identitÃ© projectId/workId ne peut pas Ãªtre rÃ©solue sans ambiguÃ¯tÃ© ;
- une dÃ©pendance certifiÃ©e annoncÃ©e est absente ;
- le scope nÃ©cessaire dÃ©passe R08.

Dans ce cas produire les preuves du blocage et ne pas inventer de remplacement.

## 14. Principe directeur

EXISTANT
â†’ RÃ‰UTILISATION
â†’ RÃ‰PARATION MINIMALE
â†’ NOUVEAU DÃ‰VELOPPEMENT uniquement lorsque l'absence est dÃ©montrÃ©e.

R08 est un lot de raccordement UI/transport.

R08 n'est pas un nouveau lot mÃ©tier PEOPLE.

## 15. DÃ©cision attendue

Le rapport final doit conclure exclusivement par l'un des Ã©tats suivants :

READY_FOR_REVIEW
BLOCKED
FAILED

Aucune certification automatique n'est autorisÃ©e.
