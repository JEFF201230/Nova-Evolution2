# NOVA-R09 — WORK DECISIONS REAL PATH — MISSION ORDER

Status: DRAFT_PENDING_AUTHORITY

## 1. Mission

MissionId: NOVA-R09-WORK-DECISIONS-REAL-PATH-001
RoadmapLot: NOVA-R09
MissionType: IMPLEMENTATION
ExecutionMode: RUNTIME_MUTATION
Profile: BUILD
ChangesExpected: true
ReadOnly: false
RoadmapDependency: NOVA-R06
CerebrauDependsOn: NONE - NOVA-R06 has no official linked MissionId

This Mission Order is assembled from existing governed NOVA sources. Its presence does not constitute automatic authorization or certification. Launch remains subject to NOVA authority/admission controls.

## 2. Objective

Raccorder l'écran Work Decisions à la capacité read-only Work Decisions existante, sans reconstruire le domaine Decisions et sans créer de seconde source de vérité.

Vertical slice cible :

HumanApprovalDecision
→ HumanApprovalWorkflow.history
→ WorkDecisionsQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service frontend
→ hook frontend
→ WorkSurface
→ WorkDecisionsPage

Supprimer l'utilisation de workDecisionsFixture du chemin runtime Work Decisions.

## 3. Autorité existante à préserver

Source of Truth :

HumanApprovalDecision

Producteur canonique :

HumanApprovalWorkflow.decide

Persistance canonique :

IntegrationPersistedRecord
kind = "HUMAN_APPROVAL"
payload = HumanApprovalDecision

Read model canonique :

HumanApprovalWorkflow.history(missionId, runId)

Source de lecture Work existante :

WorkDecisionsQuery.get(projectId, workId)

Work Decisions reste un consommateur read-only.

Cette mission ne doit pas activer, remplacer, réimplémenter ou contourner HumanApprovalWorkflow.

## 4. Sources gouvernées

- Docs/24_MODULES/WORK/DDEC_000_DECISIONS_DECISION.md
- Docs/24_MODULES/WORK/DDEC_000_DECISIONS_MATRIX.md
- Docs/24_MODULES/WORK/DDEC_001_WORK_DECISIONS_INTERNAL_READ_REPORT.md
- Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_WORK_REAL_DATA_DISCOVERY_R08_R12.md
- .nova-data/project-tracking/NOVA_WORK_REFERENTIAL_CURRENT_STATE.json
- Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_ROADMAP_GANTT_2026-09-29.xlsx

## 5. État actuel vérifié

Runtime Work Decisions existant :

- server/runtime/work/work-decisions.types.ts
- server/runtime/work/work-decisions.model.ts
- server/runtime/work/work-decisions.service.ts
- server/runtime/work/work-decisions.query.ts
- server/runtime/work/work-decisions.test.ts

DDEC-001 établit le chemin interne réel :

WorkDecisionsQuery.get(projectId, workId)
→ WorkCoreFoundation.load(projectId, workId)
→ WorkIdentity.mission
→ WorkProgression.provenance.runId
→ HumanApprovalWorkflow.history(missionId, runId)
→ HumanApprovalDecision[]
→ WorkDecisionsService
→ WorkDecisions

Aucun vertical slice Work Decisions dédié n'a été identifié dans :

- server/nova-core pour un endpoint Work Decisions ;
- server/nova-bff pour un gateway/route Work Decisions.

Frontend existant :

- apps/nova-web/src/features/work/WorkDecisionsPage.tsx
- apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx
- apps/nova-web/src/features/work/workDecisionsFixture.ts

Le frontend Work Decisions repose encore sur une fixture.

CURRENT STATE :

WORK_DECISIONS
→ roadmapLot = NOVA-R09
→ runtimeImplemented = true
→ coreImplemented = false
→ bffImplemented = false
→ frontendImplemented = true
→ decision = CONNECT_EXISTING

## 6. Architecture de référence

Réutiliser uniquement le pattern de transport déjà établi par Work Plan / Work People :

Work Query existante
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service frontend
→ hook frontend
→ WorkSurface
→ page Work

La mission ne doit pas copier le modèle métier Planning ou People.

Le contrat métier Decisions reste celui de DDEC-000 / DDEC-001.

## 7. Travail autorisé

Le lot peut :

1. définir le contrat de transport Work Decisions minimal nécessaire ;
2. exposer WorkDecisionsQuery via NovaCoreService si aucune méthode publique adaptée n'existe ;
3. créer le endpoint Core HTTP read-only nécessaire ;
4. créer le gateway/route BFF Work Decisions avec authentification ;
5. résoudre l'identité canonique projectId/workId selon les patterns Work existants ;
6. propager le correlation ID ;
7. valider strictement les réponses Runtime/Core ;
8. créer le service frontend Work Decisions ;
9. créer le hook frontend Work Decisions ;
10. raccorder WorkSurface au hook réel ;
11. adapter WorkDecisionsPage au contrat réel DDEC-001 ;
12. supprimer workDecisionsFixture du chemin runtime Work Decisions ;
13. adapter ou créer les tests strictement nécessaires au vertical slice R09.

## 8. Scope / Allowed paths

Chemins de production autorisables pour le delta R09 :

- contracts/work-decisions.contract.ts
- server/nova-core/nova-core.service.ts
- server/nova-core/nova-core.http.ts
- server/nova-core/work-decisions*.ts
- server/nova-bff/nova-bff.app.ts
- server/nova-bff/nova-bff.server.ts
- server/nova-bff/nova-bff.boundary.test.ts
- server/nova-bff/work-decisions*.ts
- apps/nova-web/src/components/routes/WorkSurface.tsx
- apps/nova-web/src/features/work/WorkDecisionsPage.tsx
- apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx
- apps/nova-web/src/features/work/workDecisions.service.ts
- apps/nova-web/src/features/work/useWorkDecisions.ts
- apps/nova-web/src/features/work/workDecisionsFixture.ts

Les fichiers Runtime Work Decisions existants peuvent être lus et testés comme références autoritatives. Ils ne doivent être modifiés que si une incompatibilité démontrée empêche l'exposition read-only et qu'une décision d'autorité supplémentaire l'autorise.

## 9. Forbidden paths / frontières protégées

Ne pas modifier dans R09 :

- server/nova-core/human-approval-workflow.ts
- server/nova-core/integration-runtime-repository.ts
- le format IntegrationPersistedRecord
- les certifications WORK existantes
- les sources DDEC-000 / DDEC-001 comme moyen de réécrire l'autorité
- Work Plan
- Work People
- Work Deliverables
- Work Sources/Evidence
- Decisions globales
- Home pendingDecision
- R10
- R11
- R12

Ne pas créer :

- nouveau producteur Decisions ;
- nouveau repository Decisions ;
- nouvelle persistence Decisions ;
- nouvelle décision principale ;
- fallback silencieux vers fixture ;
- champ UX sans producteur autoritatif.

## 10. Champs métier interdits à inventer

DDEC-001 interdit de fabriquer notamment :

- title
- label
- reason
- comment
- actorName
- actorDisplayName
- dueDate
- priority
- confidence
- category
- businessImpact
- certificationStatus
- validationStatus
- statut UX
- décision principale
- recommandation
- impact d'acceptation ou de rejet

Le seul texte de motif canonique est justification.

## 11. Comportements attendus

Le frontend doit représenter uniquement les données réellement fournies par WorkDecisions.

Les états d'absence doivent être explicites.

Un Work sans Run autoritatif retourne une collection vide conformément à DDEC-001.

Un historique absent retourne une collection vide.

Les erreurs Work canoniques et les erreurs de transport restent distinctes.

L'ordre retourné par HumanApprovalWorkflow.history doit être préservé.

Aucune sélection premier/dernier/latest/APPROVED n'est autorisée.

## 12. Sécurité BFF

Le endpoint BFF Work Decisions doit suivre les frontières Work existantes :

- authentification obligatoire ;
- résolution canonique du Work ;
- propagation correlation ID ;
- timeout ;
- validation stricte de la réponse Core/Runtime ;
- normalisation des erreurs ;
- absence d'exposition de diagnostics internes non autorisés.

## 13. Tests obligatoires

Tester au minimum :

- lecture Decisions réelle disponible ;
- Work inconnu ;
- Work sans Run autoritatif ;
- historique vide ;
- une décision ;
- plusieurs décisions et ordre canonique ;
- réponse Runtime/Core invalide ;
- identité incohérente ;
- BFF non authentifié ;
- timeout/runtime indisponible ;
- état loading frontend ;
- état ready frontend ;
- état empty frontend ;
- état error frontend ;
- navigation vers /work/:workId/decisions ;
- absence de workDecisionsFixture dans le chemin runtime final ;
- aucune donnée Decisions fictive utilisée comme fallback.

Exécuter également les suites de non-régression Core, BFF et frontend applicables.

## 14. Critères d'acceptation

R09 n'est clos que si le chemin suivant est démontré :

HumanApprovalWorkflow.history
→ WorkDecisionsQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service/hook frontend
→ WorkSurface
→ WorkDecisionsPage

ET :

workDecisionsFixture n'est plus utilisé par le chemin runtime Work Decisions.

ET :

aucun champ métier ou UX absent de DDEC-001 n'est inventé.

ET :

HumanApprovalDecision demeure la source métier autoritative unique.

ET :

aucun producteur, workflow ou format persistant Decisions n'est modifié.

## 15. Expected artifacts / preuves attendues

Le rapport final doit fournir :

- fichiers créés ;
- fichiers modifiés ;
- fichiers supprimés ;
- endpoint Core créé ou réutilisé ;
- endpoint BFF créé ou réutilisé ;
- contrat transport utilisé ;
- résultats des tests Work Decisions ciblés ;
- résultats des tests Core ;
- résultats des tests BFF ;
- résultats des tests frontend ;
- typecheck ;
- build ;
- preuve de disparition du fallback fixture runtime ;
- preuve du vertical slice réel ;
- git diff --check ;
- git status final ;
- blockers éventuels ;
- rapport officiel d'exécution ;
- runtime evidence ;
- traceability/correlation ID applicable.

## 16. Risks

- confusion entre Human Approval, certification technique et Governance Decision ;
- invention de champs UX absents du contrat canonique ;
- sélection arbitraire d'une décision principale ;
- activation implicite de HumanApprovalWorkflow ;
- modification accidentelle du producteur ou du journal persistant ;
- fallback silencieux vers fixture ;
- extension de scope vers Decisions globales/Home/R10-R12.

## 17. Stop conditions

STOP sans contourner si :

- WorkDecisionsQuery n'est pas réellement exploitable depuis NovaCoreService ;
- la source HumanApprovalDecision devient ambiguë ;
- l'exposition nécessite de modifier HumanApprovalWorkflow.decide ;
- l'exposition nécessite une seconde persistence ;
- le besoin UI exige des champs absents de DDEC-001 ;
- l'identité projectId/workId/Mission/Run ne peut pas être résolue sans ambiguïté ;
- une dépendance autoritative annoncée est absente ;
- l'activation du producteur Human Approval devient nécessaire pour satisfaire le lot ;
- le scope nécessaire dépasse R09.

Dans ce cas produire les preuves du blocage et ne pas inventer de remplacement.

## 18. Principe directeur

EXISTANT
→ RÉUTILISATION
→ RÉPARATION MINIMALE
→ NOUVEAU DÉVELOPPEMENT uniquement lorsque l'absence est démontrée.

R09 est un lot de raccordement read-only UI/transport.

R09 n'est pas un nouveau lot métier Decisions.

## 19. Décision attendue

Le rapport final doit conclure exclusivement par l'un des états suivants :

READY_FOR_REVIEW
BLOCKED
FAILED

Aucune certification automatique n'est autorisée.

## 20. Gate d'autorité avant lancement

Ce document reste DRAFT_PENDING_AUTHORITY tant que l'autorité NOVA n'a pas confirmé :

- MissionId ;
- scope final ;
- allowed paths ;
- forbidden paths ;
- critères d'acceptation ;
- dépendance effective ;
- admission au Launch.

CEREBRAU peut préparer le packaging à partir de ce document, mais ne doit pas lancer automatiquement R09 tant que ce gate n'est pas résolu.
