<CEREBRAU_MISSION_CONTRACT>
{
    "missionId":  "NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001",
    "missionType":  "REMEDIATION",
    "lot":  "NOVA-R06",
    "changesExpected":  true,
    "readOnly":  false,
    "architecturalDecision":  "WORK_PLAN_REAL_PATH_REMEDIATION"
}
</CEREBRAU_MISSION_CONTRACT>

MISSION_ID: NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001
MISSION_TYPE: REMEDIATION
LOT: NOVA-R06
CHANGES_EXPECTED: true
READ_ONLY: false
ARCHITECTURAL_DECISION: WORK_PLAN_REAL_PATH_REMEDIATION

# NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001

## IDENTITÉ DE MISSION

MissionId: NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001

Program: NOVA-AS-BUILT-COMPLETION

Lot: NOVA-R06

MissionType: REMEDIATION

ArchitecturalDecision: WORK_PLAN_REAL_PATH_REMEDIATION

## CONTEXTE

La mission NOVA-R06-WORK-PLAN-REAL-PATH-001 a implémenté avec succès le vertical slice réel :

WorkPlanningQuery
→ NovaCoreService
→ Core HTTP
→ BFF authentifié
→ service/hook frontend
→ Work Plan

Les validations fonctionnelles et techniques ont réussi :

- Core complet : 547/547
- Runtime/WCF : 24/24
- BFF complet : 96/96
- Frontend complet : 162/162
- Typecheck Core : PASS
- Typecheck frontend : PASS
- BFF lint/typecheck strict : PASS
- Build BFF : PASS
- Build Vite : PASS
- Tests ciblés Planning/Core : 10/10
- Tests ciblés Work Plan/Overview/Activity : 17/17
- git diff --check : PASS

La mission a néanmoins été rejetée par CEREBRAU pour des incohérences de contrat de preuve et de scope, et non pour un défaut fonctionnel du vertical slice.

## CAUSES EXACTES DU REJET PRÉCÉDENT

1. Le manifeste précédent exigeait à tort :

apps/nova-web/src/features/work/WorkPlanRealPath.test.tsx

Ce fichier n'a pas été créé car la couverture runtime réelle est intégrée dans :

apps/nova-web/src/features/work/WorkPlanPage.test.tsx

avec notamment :

describe('Work Plan runtime path', ...)

2. Les fichiers R06 légitimes suivants avaient été modifiés/créés mais n'étaient pas inclus dans AllowedPaths :

apps/nova-web/src/features/work/WorkActivityPage.test.tsx
apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx
apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx
apps/nova-web/src/features/work/WorkPageHeader.tsx
server/nova-core/work-plan.http.test.ts

3. Le build Vite avait généré temporairement apps/nova-web/dist/**, ce qui a été détecté comme hors scope. Ces artefacts ne doivent pas rester dans le diff final.

## OBJECTIF DE REMÉDIATION

Recertifier l'implémentation R06 existante avec un périmètre gouverné exact.

Ne pas reconstruire le vertical slice depuis zéro.

Ne pas modifier les domaines Planning/Work certifiés sauf nécessité technique démontrée.

Ne pas introduire de fixture ou fallback silencieux.

Ne pas inventer de données UI absentes du contrat Planning.

Ne pas créer WorkPlanRealPath.test.tsx uniquement pour satisfaire l'ancien manifeste.

## CONTRAT FONCTIONNEL À PRÉSERVER

Le contrat Planning canonique conserve exactement les états :

PLANNING_AVAILABLE
PLANNING_ABSENT
PLANNING_WITHDRAWN
PLANNING_UNAVAILABLE

Le transport Work Plan doit continuer à exposer leurs équivalents contrôlés sans fabrication de :

- probability
- tasks
- warning
- title de phase synthétique
- dates synthétiques
- données fixture

Le frontend doit rester branché sur le chemin réel :

GET /api/work/:workId/plan

avec :

WorkSurface
→ useWorkPlan
→ workPlan.service
→ contrat work-plan
→ BFF
→ Core HTTP
→ NovaCoreService.getWorkPlanning()
→ WorkPlanningQuery

## TRAVAUX AUTORISÉS

1. Vérifier l'état actuel du worktree R06 sans supprimer les changements existants.

2. Vérifier que tous les fichiers R06 légitimes sont cohérents avec le vertical slice réel.

3. Corriger uniquement les défauts nécessaires pour obtenir les validations finales.

4. Préserver les changements légitimes suivants :

contracts/work-plan.contract.ts

server/nova-core/nova-core.http.ts
server/nova-core/work-plan.http.test.ts

server/nova-bff/nova-bff.app.ts
server/nova-bff/nova-bff.server.ts
server/nova-bff/nova-bff.boundary.test.ts
server/nova-bff/work-plan.gateway.port.ts
server/nova-bff/work-plan.gateway.ts
server/nova-bff/work-plan.route.ts
server/nova-bff/work-plan.route.test.ts

apps/nova-web/src/components/routes/WorkSurface.tsx
apps/nova-web/src/features/work/WorkPageHeader.tsx
apps/nova-web/src/features/work/WorkPlanPage.tsx
apps/nova-web/src/features/work/WorkPlanPage.module.css
apps/nova-web/src/features/work/WorkPlanPage.test.tsx
apps/nova-web/src/features/work/workPlan.service.ts
apps/nova-web/src/features/work/useWorkPlan.ts
apps/nova-web/src/features/work/WorkActivityPage.test.tsx
apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx
apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx

5. Ne pas créer :

apps/nova-web/src/features/work/WorkPlanRealPath.test.tsx

sauf si une nécessité technique nouvelle et démontrée apparaît.

6. Les artefacts :

apps/nova-web/dist/**

peuvent être produits temporairement par le build mais doivent être absents du diff final.

## INTERDICTIONS

Ne pas modifier :

server/domain/planning/**
server/domain/work/work-planning.query.ts
server/domain/work/work-planning.types.ts
server/runtime/**

Ne pas modifier des modules Work hors nécessité directe R06.

Ne pas restaurer ou supprimer arbitrairement les changements existants.

Ne pas créer de commit.

Ne pas pousser sur Git.

Ne pas modifier tools/cerebrau/**.

## VALIDATIONS OBLIGATOIRES

Exécuter et rapporter :

- tests Core complets
- tests Runtime/WCF
- tests BFF complets
- tests frontend complets
- typecheck Core
- typecheck frontend
- lint/typecheck strict BFF
- build BFF
- build Vite
- tests ciblés Planning/Core
- tests ciblés Work Plan/Overview/Activity
- git diff --check

Vérifier en fin de mission que :

- aucun fichier apps/nova-web/dist/** ne reste dans le diff ;
- aucun fallback getWorkPlanFixture n'existe dans le chemin runtime ;
- aucun fichier interdit n'a été modifié ;
- aucune donnée Planning fictive n'a été introduite ;
- aucun commit n'a été créé.

## SORTIE ATTENDUE

Produire une synthèse finale contenant :

- statut technique ;
- fichiers réellement modifiés ;
- fichiers réellement créés ;
- validations exécutées et résultats ;
- preuve d'absence de fallback fixture ;
- preuve d'absence de modifications des domaines interdits ;
- preuve d'absence d'artefacts dist dans le diff final ;
- git status final ;
- git diff --check ;
- recommandation READY_FOR_REVIEW uniquement si toutes les validations gouvernées passent.
