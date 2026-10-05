# NOVA WORK — Real Data Discovery R08-R12

## Statut du document

Document de suivi factuel du chantier de raccordement des écrans Work aux données réelles.

Ce document ne remplace ni les contrats métier, ni les certifications WCF, ni les Mission Orders, ni les rapports officiels d'exécution.

Il conserve les découvertes nécessaires pour éviter de reconstruire des capacités déjà existantes.

---

## R08 — Work People

### Fait établi

Le domaine PEOPLE et son raccordement interne à Work existent déjà.

Chaîne certifiée identifiée :

PEOPLE persistence
→ PeopleQueryService.GetWorkParticipants
→ WorkPeopleQuery.get
→ export interne Work
→ consommateur interne Work

### Sources identifiées

- Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M01_REPORT.md
- Docs/24_MODULES/WORK/PEOPLE_WORK_INTEGRATION/MISSIONS/P3-PEOPLE-001G-M02_CERTIFICATION_REPORT.md
- Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/MISSIONS/P3-PEOPLE-001H_CERTIFICATION_REPORT.md
- server/runtime/work/work-people.query.ts
- server/runtime/work/work-people.test.ts
- server/nova-core/nova-core.service.ts
- server/domain/work/work-authorized-state.composer.ts

### Architecture constatée

WorkPeopleQuery est un consommateur read-only du domaine PEOPLE.

Le chemin certifié ne transfère pas à Work la propriété :
- des agrégats PEOPLE ;
- des rôles PEOPLE ;
- de l'Owner PEOPLE ;
- de l'historique PEOPLE ;
- de la persistence PEOPLE.

BusinessPerson, RuntimeAgent et Technical Agent restent des concepts distincts.

### État frontend constaté

Le frontend Work People utilise encore des types de fixture dans :

apps/nova-web/src/features/work/WorkPeoplePage.tsx

Types constatés :
- WorkPeopleFixture
- WorkPersonFixture

La présence du backend réel ne prouve donc pas encore le raccordement complet de l'écran Work People.

### Frontière R08 établie

L'investigation a établi que le chemin réel s'arrête actuellement à WorkPeopleQuery / NovaCoreService.

Aucun vertical slice Work People dédié n'a été identifié entre cette lecture interne et WorkPeoplePage.

Le raccordement R08 à construire est donc :

WorkPeopleQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service frontend
→ hook frontend
→ WorkSurface
→ WorkPeoplePage

Le pattern Work Plan R07 peut être réutilisé uniquement comme référence de transport et d'intégration.

Le domaine PEOPLE, WorkPeopleQuery et leurs responsabilités métier existantes ne doivent pas être reconstruits.

### Dépendance R08

RoadmapDependency: NOVA-R06

CerebrauDependsOn: NONE - NOVA-R06 has no official linked MissionId

La dépendance NOVA-R06 est une dépendance de roadmap actuellement non rattachée à un MissionId CEREBRAU officiel.

Aucun MissionId d'une autre mission, notamment Work Plan R07, ne doit être substitué ou inventé pour satisfaire artificiellement DependsOn.

Cette absence de rattachement doit rester explicite jusqu'à établissement d'une preuve officielle.
---

## Impact sur les chantiers suivants

### R09 — Work Decisions

Avant toute implémentation :
vérifier jusqu'où va réellement WorkDecisionsService/Query vers transport, BFF et UI.

Ne pas reconstruire le domaine Decisions si le producteur existe déjà.

### R10 — Work Deliverables

Avant toute implémentation :
vérifier jusqu'où va réellement WorkDeliverablesQuery vers transport, BFF et UI.

Ne pas reconstruire le domaine Deliverables si le producteur existe déjà.

### R11 — Work Sources / Evidence

Avant toute implémentation :
vérifier les producteurs WorkEvidence/Evidence existants et leur chemin réel vers l'écran Sources.

Ne pas créer un nouveau domaine Sources si Evidence fournit déjà l'autorité nécessaire.

### R12 — Suppression des fixtures Work restantes

R12 est un lot de convergence.

Il intervient après les raccordements R07, R08, R09, R10 et R11.

Il ne doit pas reconstruire leurs domaines.

Son objectif est de vérifier et supprimer les fixtures restantes après raccordement aux producteurs réels.

---

## Règle de travail R08-R12

Pour chaque chantier :

1. identifier le producteur autoritatif existant ;
2. identifier la Query/Service Work existante ;
3. vérifier le transport/API ;
4. vérifier le BFF ;
5. vérifier le client frontend ;
6. vérifier le composant UI consommateur ;
7. localiser exactement la rupture de chaîne ;
8. limiter la mission au delta réellement manquant ;
9. tester le chemin réel ;
10. produire les preuves runtime et de certification.

Principe :

EXISTANT
→ RÉUTILISATION
→ RÉPARATION MINIMALE
→ NOUVEAU DÉVELOPPEMENT uniquement si l'absence est démontrée.

---

## Point de reprise

R08 Work People.

Frontière établie :

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

Mission Order établi :

Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_R08_WORK_PEOPLE_REAL_PATH_MISSION_ORDER.md

MissionId :

NOVA-R08-WORK-PEOPLE-REAL-PATH-001

Périmètre R08 :

- transporter la capacité WCF-006 / WorkPeopleQuery existante jusqu'au frontend ;
- supprimer getWorkPeopleFixture() du chemin runtime Work People ;
- préserver strictement l'autorité PEOPLE ;
- ne pas reconstruire PEOPLE ;
- ne pas enrichir WorkPeopleQuery avec des données non présentes dans son contrat certifié ;
- ne pas inventer name, availability, workload, skills, trust score, reasoning ou toute autre donnée issue des fixtures ;
- conserver explicitement l'absence de producteur autoritatif pour les données UX enrichies non encore couvertes.

Dépendance roadmap :

RoadmapDependency: NOVA-R06

Dépendance CEREBRAU :

CerebrauDependsOn: NONE - NOVA-R06 has no official linked MissionId

Prochaine action autorisée :

générer la mission CEREBRAU NOVA-R08-WORK-PEOPLE-REAL-PATH-001 à partir du Mission Order établi, puis lancer R08.