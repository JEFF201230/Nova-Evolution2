# NOVA — SW-010 W01.3 WORK ACTIVITY REPORT

## 1. Verdict

**GO — W01.3 WORK ACTIVITY READ-ONLY RACCORDE**

La route Work Activity consomme maintenant les lectures Core v1 existantes pour résoudre la mission
et afficher ses événements Runtime. Aucun endpoint, contrat métier, Service Core, schéma ou Runtime
n'a été créé ou modifié.

## 2. Confirmation du périmètre avant modification

| Élément obligatoire | Élément confirmé |
|---|---|
| Route exacte | `/work/:workId/activity` |
| Composant React principal | `apps/nova-web/src/features/work/WorkActivityPage.tsx` — `WorkActivityPage` |
| Responsable initial des données | `apps/nova-web/src/components/routes/WorkSurface.tsx` |
| Fixture initialement active | `getWorkActivityFixture(workId)` depuis `workActivityFixture.ts` |
| Contrat visuel existant | `WorkActivityFixture`, `WorkActivityEventFixture`, `WorkActivityFilter` |
| Contrats Runtime existants | `RuntimeMission`, `RuntimeEvent` dans `orchestrator-runtime.types.ts` |
| Liste des missions | `GET /api/v1/missions` |
| Événements | `GET /api/v1/missions/:projectId/:missionId/events` |
| Monitoring disponible | `GET /api/v1/missions/:projectId/:missionId/monitor` |
| SSE disponible | `GET /api/v1/missions/:projectId/:missionId/monitor/stream` |
| Service Core | `NovaCoreService.listMissions`, `NovaCoreService.getEvents` |
| Runtime atteint | `OrchestratorRuntimeService.listMissions`, `OrchestratorRuntimeService.getEvents` |
| Tests Frontend | `WorkActivityPage.test.tsx`, suite complète `apps/nova-web` |
| Tests Core/Runtime | `nova-core.http.test.ts`, `nova-core.service.test.ts`, `mission-event-publisher.test.ts`, `orchestrator-runtime.test.ts` |

Le PNG canonique examiné est
[`work-activity.png`](NOVA-DESIGN-V7/v7/screens/work-activity.png). La route, le Work Shell, le
header, les cinq filtres, la timeline et les états visuels existants sont conservés.

## 3. Fichiers examinés

Documentation et patrimoine :

- `NOVA_FRONT_RUNTIME_INTEGRATION_PLAN.md` ;
- `NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md` ;
- `NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md` ;
- `NOVA_DESIGN_V7_TRACEABILITY_MATRIX.md` ;
- PNG canonique Work Activity et variantes Activity.

Frontend :

- `RouteRegistry.ts` ;
- `WorkSurface.tsx` ;
- `WorkActivityPage.tsx` ;
- `workActivityFixture.ts` ;
- `WorkActivityPage.test.tsx` ;
- `WorkPageHeader.tsx` ;
- hooks de route existants ;
- tests de navigation et des autres tabs Work.

Core/Runtime :

- `nova-core.http.ts` ;
- `nova-core.server.ts` ;
- `nova-core.service.ts` ;
- `orchestrator-runtime.types.ts` ;
- `orchestrator-runtime.service.ts` ;
- tests HTTP, Service, Event Publisher et Orchestrator.

## 4. Fichiers modifiés

| Fichier | Modification strictement W01.3 |
|---|---|
| `apps/nova-web/src/components/routes/WorkSurface.tsx` | retrait de l'injection `getWorkActivityFixture`; transmission du `workId` existant à `WorkActivityPage` |
| `apps/nova-web/src/features/work/WorkActivityPage.tsx` | chargement read-only, résolution `missionId → projectId`, projection déterministe des champs `RuntimeEvent`, conservation des états et du Work header |
| `apps/nova-web/src/features/work/WorkActivityPage.test.tsx` | tests du raccordement GET, succès, vide, erreur, contrats invalides, absence de mutation et structure |
| `Docs/24_MODULES/0-UI-DESIGN/NOVA_SW010_W01_3_WORK_ACTIVITY_REPORT.md` | présent rapport |

Aucun autre fichier n'a été modifié par SW-010.

## 5. Route et composant exacts

```text
/work/:workId/activity
↓
RouteRegistry
↓
WorkSurface — branche activity
↓
WorkActivityPage(workId)
```

La navigation et la définition de route sont inchangées.

## 6. Fixture

Le fichier `workActivityFixture.ts` est **conservé** pour ne pas effectuer de suppression globale.

La fixture est **désactivée du chemin de production W01.3** :

- `WorkSurface.tsx` n'importe plus `getWorkActivityFixture` ;
- aucune référence de production à `getWorkActivityFixture` ou `workActivityFixtures` ne subsiste
  hors du fichier de fixture lui-même ;
- les événements affichés par le chemin raccordé proviennent exclusivement de l'API Core.

La fixture `workOverviewFixture` reste utilisée par le Work Shell pour le header existant. Elle ne
fournit aucun événement Work Activity et son remplacement appartient à une autre sous-tranche.

## 7. Endpoints utilisés

| Ordre | Méthode | Endpoint | Usage |
|---:|---|---|---|
| 1 | `GET` | `http://127.0.0.1:4100/api/v1/missions` | retrouver la `RuntimeMission` dont `missionId === workId` et obtenir son `projectId` |
| 2 | `GET` | `http://127.0.0.1:4100/api/v1/missions/:projectId/:missionId/events` | lire les `RuntimeEvent` de la mission |

L'origine correspond aux valeurs par défaut existantes de `nova-core.server.ts` :
`HOST=127.0.0.1`, `PORT=4100`.

Aucun endpoint de mutation n'est appelé.

## 8. Contrats utilisés

Contrats réutilisés sans création de contrat métier :

- `RuntimeMission` ;
- `RuntimeEvent` ;
- `WorkActivityFixture` ;
- `WorkActivityEventFixture` ;
- `WorkActivityFilter`.

La présentation reprend uniquement des champs Runtime traçables :

- `eventId` ;
- `eventName` ;
- `producer` ;
- `occurredAt` ;
- `sequence` ;
- `correlationId` ;
- `sourceState` ;
- `targetState`.

Une réponse sans tableau `missions` ou `events` est rejetée. Aucun fallback de données fictives
n'est utilisé.

## 9. Services Core atteints

```text
GET /api/v1/missions
→ NovaCoreService.listMissions
→ OrchestratorRuntimeService.listMissions

GET .../events
→ NovaCoreService.getEvents
→ OrchestratorRuntimeService.getEvents
→ journal d'événements Runtime
```

Aucun Service Core n'a été ajouté ou modifié.

## 10. SSE et monitoring

| Élément | Statut SW-010 |
|---|---|
| Endpoint monitoring | existant, non utilisé |
| Endpoint SSE | existant et rattaché par SW-009 |
| Contrat SSE | `RuntimeObservabilityEvent`, existant |
| Nécessaire à la première lecture W01.3 | non |
| Implémentation SW-010 | **NON UTILISÉE — HORS PÉRIMÈTRE** |

SW-009 ordonne la lecture HTTP avant le monitoring puis le SSE. La lecture HTTP suffit au
raccordement demandé ; aucun `EventSource` n'a été créé.

## 11. Tests exécutés

### 11.1 Contrôles obligatoires finaux

| Contrôle | Commande | Résultat |
|---|---|---|
| Typecheck Frontend | `npm.cmd run typecheck` | **PASS** |
| Tests ciblés W01.3 | `npm.cmd test -- --run src/features/work/WorkActivityPage.test.tsx` | **PASS — 10/10** |
| Non-régression Frontend | `npm.cmd test -- --run` | **PASS — 25 fichiers, 146/146 tests** |
| Core/Runtime ciblé | `node --import tsx --test server/nova-core/nova-core.http.test.ts server/nova-core/nova-core.service.test.ts server/nova-core/mission-event-publisher.test.ts server/runtime/orchestrator/orchestrator-runtime.test.ts` | **PASS — 30/30** |

### 11.2 Trace d'itération

La première exécution de la suite Frontend complète a produit 141/146 PASS et cinq échecs de
navigation : le header/tabs Work disparaissait pendant la nouvelle phase loading/error.

La correction a été limitée à `WorkActivityPage.tsx` : le `WorkPageHeader` et les onglets sont
désormais conservés dans les états loading, empty et error. La relance finale donne 146/146 PASS.

### 11.3 Smoke test

- tentative read-only sur `http://127.0.0.1:4100` : serveur non démarré ;
- script existant `Test-NovaCoreRuntimeE2E.ps1` : non exécuté, car il crée/exécute une mission et
  sort du périmètre read-only ;
- preuve de transport disponible : tests HTTP Core réels sur serveur isolé PASS et tests du client
  W01.3 sur les deux URL exactes PASS.

### 11.4 Contrôle supplémentaire

`npm.cmd run lint` n'est pas exploitable comme gate dans la baseline : ESLint analyse `dist` et ne
dispose pas du parser TypeScript/TSX, produisant 296 erreurs globales sur le patrimoine existant.
Le typecheck TypeScript et toutes les suites de tests applicables sont passants.

## 12. Couverture des tests W01.3

| Exigence | Preuve |
|---|---|
| chargement réussi | liste mission + deux événements Runtime affichés |
| liste vide | liste missions vide → état `No activity available` |
| événements vides | mission trouvée, événements vides → état vide |
| erreur API | HTTP 503 → état `Activity unavailable` |
| affichage des événements | `eventName` et `occurredAt` vérifiés |
| réponse invalide | rejet explicite, aucune fixture de secours |
| absence de mutation | deux appels exacts, méthode `GET`, aucun body |
| rendu structurel | Work Shell, header, onglet Activity, cinq filtres et navigation vérifiés |
| non-régression | 146/146 tests Frontend PASS |

## 13. Preuve d'absence de mutation

- le client W01.3 contient une seule déclaration de méthode HTTP : `method: 'GET'` ;
- aucune occurrence `POST`, `PUT`, `PATCH`, `DELETE` ou `EventSource` n'est introduite ;
- les tests vérifient `method === GET` et `body === undefined` pour chaque appel ;
- aucun endpoint create, assign, evidence, execute, cancel, technical-accept, certify, recovery ou
  approve n'est appelé ;
- aucun fichier Core, Runtime ou BFF n'est modifié.

## 14. Non-régression et périmètre non touché

Non-régression finale :

- typecheck : PASS ;
- Frontend : 146/146 PASS ;
- Core/Runtime ciblé : 30/30 PASS ;
- régression résiduelle détectée : 0.

Explicitement non touchés :

- autres tabs Work : Overview, Plan, People, Sources, Decisions, Deliverables ;
- Home, Clarify, Canvas, Plan Setup et Confirm ;
- Decision Flow et écrans globaux ;
- route et navigation ;
- PNG et matrices patrimoniales ;
- BFF et `ProgramProductionEntrypoint` ;
- Core, Runtime, schémas, Services et endpoints ;
- six autres unités `UI_ONLY` ;
- toutes les fixtures hors désactivation de l'import Activity dans `WorkSurface`.

## 15. Décision pour la prochaine sous-tranche

**NE PAS COMMENCER AUTOMATIQUEMENT UNE AUTRE SOUS-TRANCHE.**

W01.3 HTTP read-only est GO. Le monitoring/SSE reste une étape séparée prévue après certification
de la lecture ponctuelle. Son éventuelle activation exige une mission explicitement autorisée avec
tests de séquence, rejeu, reconnexion, déduplication et fermeture de connexion.
