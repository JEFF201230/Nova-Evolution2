<CEREBRAU_MISSION_CONTRACT>
{
    "missionId":  "NOVA-R06-WORK-PLAN-REAL-PATH-001",
    "missionType":  "IMPLEMENTATION",
    "lot":  "NOVA-R06",
    "changesExpected":  true,
    "readOnly":  false,
    "architecturalDecision":  "WORK_PLAN_REAL_PATH"
}
</CEREBRAU_MISSION_CONTRACT>

MISSION_ID: NOVA-R06-WORK-PLAN-REAL-PATH-001
MISSION_TYPE: IMPLEMENTATION
LOT: NOVA-R06
CHANGES_EXPECTED: true
READ_ONLY: false
ARCHITECTURAL_DECISION: WORK_PLAN_REAL_PATH

# NOVA â€” R06 â€” WORK PLAN REAL PATH

## IDENTITÃ‰ DE MISSION

MissionId: `NOVA-R06-WORK-PLAN-REAL-PATH-001`

Program: `NOVA-AS-BUILT-COMPLETION`

Lot: NOVA-R06

MissionType: `IMPLEMENTATION`

ExecutionMode: `GOVERNED_WRITE`

Profile: `ARCHITECTURE`

Repository attendu:

`C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp`

Branche attendue:

`feature/nova-runtime-foundation`

StratÃ©gie obligatoire:

`EXISTANT â†’ REUSE â†’ REPAIR MINIMUM â†’ IMPLEMENT MINIMUM`


# 1. CONTEXTE CERTIFIÃ‰

NOVA dispose dÃ©jÃ  du domaine Planning et de la capacitÃ© de lecture WORK correspondante.

Le but de cette mission n'est PAS de crÃ©er un nouveau moteur Planning.

Le but est de raccorder le Work Plan existant au chemin runtime rÃ©el.

Ã‰tat as-built dÃ©jÃ  constatÃ© :

- `WorkPlanningQuery` existe.
- `WorkPlanningReadResult` existe.
- `NovaCoreService` possÃ¨de dÃ©jÃ  la capacitÃ© `getWorkPlanning(projectId, workId)`.
- le frontend Work Plan existe.
- `WorkSurface.tsx` utilise encore `getWorkPlanFixture(workId)` sur le chemin produit.
- `WorkPlanPage.tsx` dÃ©pend encore de types nommÃ©s `WorkPlanFixture` / `WorkPlanPhaseFixture`.
- Work Overview et Work Activity disposent dÃ©jÃ  de chemins rÃ©els HTTP/BFF/frontend et constituent les patterns d'intÃ©gration Ã  examiner et rÃ©utiliser lorsque pertinent.
- `workId = missionId` reste l'identitÃ© canonique acquise par R05.

R02 et R05 sont des acquis.

Ne pas reconstruire leurs responsabilitÃ©s.

---

# 2. OBJECTIF UNIQUE

Obtenir le chemin produit rÃ©el suivant :

`WorkPlanningQuery existant`

â†’ `NovaCoreService`

â†’ `Core HTTP`

â†’ `BFF authentifiÃ©`

â†’ `contrat/service frontend`

â†’ `Work Plan`

et supprimer `getWorkPlanFixture(workId)` du chemin runtime officiel de la page Work Plan.

La page :

`/work/:workId/plan`

doit lire les donnÃ©es Planning rÃ©elles correspondant au Work demandÃ©.

---

# 3. INSPECTION OBLIGATOIRE AVANT MODIFICATION

Avant toute Ã©criture :

1. vÃ©rifier le HEAD et la branche rÃ©ellement prÃ©sents ;
2. vÃ©rifier que le worktree permet l'exÃ©cution gouvernÃ©e sans Ã©craser de modifications Ã©trangÃ¨res ;
3. inspecter les implÃ©mentations actuelles exactes ;
4. confirmer les contrats dÃ©jÃ  disponibles ;
5. confirmer les patterns Overview/Activity actuels ;
6. rechercher une implÃ©mentation existante avant de crÃ©er tout nouveau fichier ;
7. Ã©tablir le gap minimal rÃ©el.

Ne jamais modifier un fichier uniquement parce que ce prompt suppose qu'il doit l'Ãªtre.

Le code courant fait autoritÃ© sur toute hypothÃ¨se de ce prompt.

Si une capacitÃ© demandÃ©e existe dÃ©jÃ , la rÃ©utiliser.

---

# 4. FICHIERS / ZONES Ã€ INSPECTER

Inspection minimale obligatoire :

`server/nova-core/nova-core.service.ts`

`server/nova-core/nova-core.http.ts`

domaine WORK / Planning contenant :

`WorkPlanningQuery`

`WorkPlanningReadResult`

BFF existant :

`server/nova-bff/`

notamment les patterns :

`work-overview.*`

`work-activity.*`

et leur cÃ¢blage dans :

`nova-bff.app.ts`

`nova-bff.server.ts`

Frontend :

`apps/nova-web/src/components/routes/WorkSurface.tsx`

`apps/nova-web/src/features/work/WorkPlanPage.tsx`

`apps/nova-web/src/features/work/workPlanFixture.ts`

ainsi que les services/hooks/contracts/tests Overview et Activity pertinents.

Inspecter Ã©galement les contrats partagÃ©s existants avant d'en crÃ©er un nouveau.

---

# 5. IMPLÃ‰MENTATION ATTENDUE

## 5.1 Core

RÃ©utiliser exclusivement la vÃ©ritÃ© Planning existante.

La lecture doit partir de :

`WorkPlanningQuery`

via la capacitÃ© dÃ©jÃ  prÃ©sente dans `NovaCoreService`.

CrÃ©er ou complÃ©ter uniquement l'exposition HTTP minimale nÃ©cessaire si elle n'existe pas dÃ©jÃ .

Aucune duplication de Planning.

Aucun second read model mÃ©tier concurrent.

Aucune copie persistÃ©e spÃ©cifique Ã  l'UI.

---

## 5.2 Contrat transport

DÃ©finir ou rÃ©utiliser un contrat transport strict pour Work Plan.

Le contrat doit :

- conserver l'identitÃ© `workId`;
- reprÃ©senter uniquement les donnÃ©es nÃ©cessaires Ã  Work Plan ;
- prÃ©server explicitement les Ã©tats mÃ©tier disponibles ;
- ne jamais transformer une indisponibilitÃ© producteur en donnÃ©es fictives ;
- ne pas exposer de dÃ©tails internes inutiles ;
- Ãªtre validÃ© aux frontiÃ¨res.

RÃ©utiliser un contrat existant s'il satisfait dÃ©jÃ  ces exigences.

---

## 5.3 BFF

CrÃ©er ou complÃ©ter le chemin BFF minimal pour la lecture Work Plan.

Pattern attendu :

`GET /api/work/:workId/plan`

sauf si le repo possÃ¨de dÃ©jÃ  une convention canonique diffÃ©rente qu'il faut rÃ©utiliser.

Le BFF doit respecter les conventions existantes Overview/Activity :

- authentification ;
- correlation ID ;
- validation stricte ;
- propagation contrÃ´lÃ©e vers Core ;
- rÃ©ponse rÃ©duite ;
- normalisation des erreurs ;
- absence de fuite de chemins locaux, stdout/stderr ou dÃ©tails internes.

Ne pas crÃ©er une seconde architecture BFF.

---

## 5.4 Frontend

Le chemin produit `/work/:workId/plan` doit cesser d'utiliser :

`getWorkPlanFixture(workId)`

comme source runtime.

Mettre en place le minimum nÃ©cessaire, conformÃ©ment aux patterns rÃ©els Overview/Activity :

- service HTTP ;
- hook ou mÃ©canisme de chargement appropriÃ© ;
- Ã©tats loading ;
- ready ;
- empty/not-found selon le contrat rÃ©el ;
- unavailable/error.

`WorkPlanPage` doit recevoir le modÃ¨le rÃ©el ou un modÃ¨le UI dÃ©rivÃ© explicitement du contrat transport.

Les anciens noms `Fixture` ne doivent pas rester dans le chemin produit uniquement par commoditÃ© s'ils reprÃ©sentent dÃ©sormais un modÃ¨le runtime.

Cependant :

NE PAS effectuer un refactor esthÃ©tique global.

Les fixtures peuvent rester disponibles pour les tests isolÃ©s si elles sont encore utiles.

La condition impÃ©rative est :

**aucun fallback fixture silencieux sur le chemin produit Work Plan.**

---

# 6. SÃ‰MANTIQUE OBLIGATOIRE

PrÃ©server les distinctions du domaine Planning.

Ne jamais convertir automatiquement :

- producteur indisponible ;
- Work inexistant ;
- Planning disponible mais vide ;
- erreur transport ;

en un mÃªme Ã©tat gÃ©nÃ©rique si les contrats existants permettent de les distinguer.

Ne jamais fabriquer de phases, tÃ¢ches, dates, progression ou statuts pour remplir l'interface.

Si le Planning rÃ©el est vide, l'interface doit reprÃ©senter honnÃªtement cet Ã©tat.

---

# 7. HORS PÃ‰RIMÃˆTRE ABSOLU

NE PAS raccorder dans cette mission :

- Work People ;
- Work Sources/Evidence ;
- Work Decisions ;
- Work Deliverables ;
- Global Decisions ;
- Global Deliverables.

NE PAS :

- crÃ©er un nouveau domaine Planning ;
- crÃ©er un nouvel aggregate Planning ;
- modifier les rÃ¨gles mÃ©tier Planning certifiÃ©es sans preuve d'un dÃ©faut bloquant ;
- modifier PEOPLE ;
- modifier EVIDENCE ;
- modifier DECISIONS ;
- modifier DELIVERABLES ;
- introduire `WorkAuthorizedState` comme nouvelle API publique globale ;
- crÃ©er une deuxiÃ¨me autoritÃ© Work ;
- modifier R05 Confirm/Mission sauf rÃ©gression directement provoquÃ©e et prouvÃ©e ;
- modifier l'UX ou le design Work Plan sans nÃ©cessitÃ© d'intÃ©gration ;
- effectuer de refactor global ;
- remplacer des composants certifiÃ©s fonctionnels ;
- ajouter de fallback fixture au chemin production ;
- inventer des donnÃ©es pour satisfaire les tests.

---

# 8. COMPATIBILITÃ‰ R05

La mission doit prÃ©server intÃ©gralement le parcours acquis :

Home

â†’ Clarify

â†’ Canvas

â†’ Plan

â†’ Confirm

â†’ Mission rÃ©elle

â†’ Execute

â†’ Work rÃ©el

â†’ `/work/{missionId}/overview`

Puis :

`/work/{missionId}/plan`

doit pouvoir lire le Planning rÃ©el associÃ© au mÃªme Work.

IdentitÃ© obligatoire :

`workId = missionId`

Ne pas introduire un deuxiÃ¨me identifiant Work artificiel.

---

# 9. TESTS MINIMUMS OBLIGATOIRES

Ajouter ou adapter uniquement les tests nÃ©cessaires pour prouver :

### Core

- Work Planning rÃ©el accessible pour un Work valide ;
- identitÃ© projectId/workId respectÃ©e ;
- Ã©tat disponible prÃ©servÃ© ;
- Ã©tat disponible-vide prÃ©servÃ© si applicable ;
- Work absent correctement reprÃ©sentÃ© ;
- producteur Planning indisponible correctement reprÃ©sentÃ©.

### BFF

- authentification obligatoire ;
- Work ID validÃ© ;
- appel Core correct ;
- correlation ID respectÃ© ;
- rÃ©ponse valide ;
- not-found/empty/unavailable correctement traduits ;
- erreurs internes non divulguÃ©es.

### Frontend

- `/work/:workId/plan` appelle le service rÃ©el ;
- le `workId` de l'URL est utilisÃ© ;
- loading affichÃ© ;
- donnÃ©es rÃ©elles rendues ;
- Ã©tat vide rendu ;
- erreur/unavailable rendu ;
- absence de fallback vers `getWorkPlanFixture`;
- double chargement ou requÃªtes parasites Ã©vitÃ©s si le pattern existant les prÃ©vient.

---

# 10. NON-RÃ‰GRESSION

ExÃ©cuter les suites pertinentes :

- tests Work Plan ;
- tests frontend Work ;
- tests BFF ;
- tests Core concernÃ©s ;
- tests Overview/Activity affectÃ©s par les contrats ou le routing ;
- build/typecheck/lint applicables au pÃ©rimÃ¨tre.

Ne pas masquer une rÃ©gression prÃ©existante.

Distinguer clairement :

- rÃ©gression crÃ©Ã©e par R06 ;
- Ã©chec prÃ©existant hors pÃ©rimÃ¨tre.

---

# 11. CRITÃˆRES D'ACCEPTATION

R06 est ACCEPTABLE uniquement si toutes les conditions suivantes sont prouvÃ©es :

1. `WorkPlanningQuery` existant reste la source mÃ©tier.
2. Aucun nouveau moteur Planning n'est crÃ©Ã©.
3. Le Core expose rÃ©ellement la lecture nÃ©cessaire.
4. Le BFF expose une lecture Work Plan authentifiÃ©e et bornÃ©e.
5. `/work/:workId/plan` utilise le chemin rÃ©el.
6. `getWorkPlanFixture(workId)` n'est plus utilisÃ© par le chemin produit Work Plan.
7. Aucun fallback fixture silencieux n'existe.
8. `workId = missionId` est prÃ©servÃ©.
9. Les Ã©tats d'indisponibilitÃ©/absence/vide ne sont pas transformÃ©s en fausses donnÃ©es.
10. Overview et Activity restent fonctionnels.
11. R05 reste fonctionnel.
12. Les tests pertinents passent.
13. Le build pertinent passe.
14. Aucun domaine hors pÃ©rimÃ¨tre n'est modifiÃ© sans justification bloquante et preuve explicite.
15. Le diff final reste minimal et directement traÃ§able Ã  R06.

---

# 12. PREUVES DE SORTIE

Le rapport officiel doit contenir au minimum :

- branche ;
- HEAD initial ;
- HEAD final ;
- Ã©tat worktree initial ;
- Ã©tat worktree final ;
- fichiers crÃ©Ã©s ;
- fichiers modifiÃ©s ;
- fichiers supprimÃ©s ;
- architecture rÃ©ellement rÃ©utilisÃ©e ;
- gap rÃ©ellement trouvÃ© ;
- endpoint Core final ;
- endpoint BFF final ;
- source frontend finale ;
- preuve de disparition de la fixture du chemin produit ;
- commandes de tests exÃ©cutÃ©es ;
- rÃ©sultats exacts ;
- build/typecheck/lint ;
- rÃ©gressions observÃ©es ;
- Ã©lÃ©ments hors pÃ©rimÃ¨tre volontairement laissÃ©s intacts ;
- dÃ©cision finale.

---

# 13. FAIL-CLOSED

ArrÃªter la mission et produire un rapport explicite au lieu d'improviser si :

- la branche n'est pas celle attendue ;
- le repository n'est pas celui attendu ;
- le Work Planning rÃ©el n'existe plus contrairement Ã  la baseline ;
- le contrat rÃ©el contredit matÃ©riellement les faits certifiÃ©s utilisÃ©s pour cette mission ;
- une modification importante d'un domaine certifiÃ© devient nÃ©cessaire ;
- le worktree contient des modifications Ã©trangÃ¨res qu'il faudrait Ã©craser ;
- la seule maniÃ¨re de faire fonctionner l'Ã©cran consiste Ã  inventer des donnÃ©es ;
- le scope doit s'Ã©tendre Ã  People, Evidence, Decisions ou Deliverables.

Dans ces cas :

**NE PAS Ã©largir automatiquement la mission.**

Produire les preuves et demander une dÃ©cision d'autoritÃ©.

---

# 14. DÃ‰CISION ATTENDUE

DÃ©cision finale autorisÃ©e :

`ACCEPTED`

uniquement si le vertical slice rÃ©el Work Plan est prouvÃ©.

Sinon :

`REJECTED`

ou statut gouvernÃ© Ã©quivalent nÃ©cessitant dÃ©cision humaine.

Aucun succÃ¨s ne doit Ãªtre dÃ©clarÃ© uniquement parce que le code compile.

Le succÃ¨s exige la preuve du chemin rÃ©el :

`WorkPlanningQuery â†’ Core â†’ BFF â†’ Work Plan`.
