# F04-A Global Deliverables Partial Read — rapport d'implémentation

## État final

**READY_FOR_REVIEW**

L'intégration F04-A est implémentée et ses suites BFF/frontend passent. L'approbation humaine finale reste requise. Le typecheck BFF global demeure en échec sur une modification locale Work Activity antérieure et hors scope, documentée ci-dessous; elle n'a pas été altérée pour contourner le contrôle.

## Architecture finale

La chaîne effective est :

`NOVA Web /deliverables` → `GET /api/global/deliverables` → BFF authentifié → `HttpGlobalDeliverablesGateway` → `GET /api/v1/missions` → `GET /api/v1/missions/{projectId}/{missionId}` → `MissionReport.deliverableEvidence`.

Le navigateur ne contacte pas NOVA Core `:4100`. Le routeur BFF n'expose pas `/api/v1/*`; un test confirme que `/api/v1/missions` reste fermé avec 404. Aucun changement NOVA Core ou Orchestrator Runtime n'a été nécessaire. `server/runtime/work/work-core.ts` n'a pas été modifié par F04-A.

## Contrat exposé

Le contrat partagé `GlobalDeliverablesResponse` contient uniquement :

- `deliverables[]`
- `projectId`
- `missionId`
- `reportId`
- `path`
- `size`
- `sha256`
- `modifiedAt`
- `runId`

Il ne contient aucun `deliverableId`, titre métier, statut, confidence, readiness, publication score, URL de téléchargement, owner, deadline ou classification inventée. L'ordre Runtime des missions et des preuves est conservé; aucun tri ou dédoublonnage silencieux n'est appliqué.

## Validation fail-closed

Le gateway :

1. valide strictement l'enveloppe de liste et les clés autorisées de chaque mission;
2. ignore uniquement, conformément au contrat, les missions dont `reportId` est `null`, sans créer d'entrée;
3. refuse avant lecture des détails deux missions d'un même projet déclarant le même `reportId`;
4. valide strictement l'enveloppe du détail, la mission, le rapport et chaque preuve;
5. exige l'égalité des `projectId`, `missionId` et `reportId` entre la liste, la mission détaillée et le rapport;
6. transforme toute incohérence en `502 RUNTIME_RESPONSE_INVALID`;
7. transforme une indisponibilité en `503 RUNTIME_UNAVAILABLE`, un timeout en `504 RUNTIME_TIMEOUT` et un rejet Runtime en erreur BFF contrôlée;
8. propage `X-Correlation-ID` sur chaque lecture Runtime.

Un rapport sans `deliverableEvidence` produit légitimement zéro preuve. Toute erreur partielle interrompt la réponse complète; aucun succès silencieux n'est produit.

## Comportement frontend

La page globale `/deliverables` possède quatre rendus explicites : loading, empty, error et success. En succès elle affiche le chemin de preuve, les trois identités de provenance, la taille, le SHA-256, la date de modification et le run. Elle ne présente aucun CTA Create, View ou Download.

La dépendance `globalDeliverablesFixture` et ses types métier ont été retirés de `globalRouteFixtures.ts`. Les trois fixtures Global Decisions et leur comportement restent présents sans modification fonctionnelle. Les fixtures Work Deliverables, hors chaîne globale concernée, restent intactes.

## Fichiers créés

- `contracts/global-deliverables.contract.ts`
- `server/nova-bff/global-deliverables.gateway.port.ts`
- `server/nova-bff/global-deliverables.gateway.ts`
- `server/nova-bff/global-deliverables.route.ts`
- `server/nova-bff/global-deliverables.route.test.ts`
- `apps/nova-web/src/features/global-deliverables/globalDeliverables.service.ts`
- `apps/nova-web/src/features/global-deliverables/useGlobalDeliverables.ts`
- `apps/nova-web/src/features/global-deliverables/GlobalDeliverablesSurface.test.tsx`
- ce rapport

## Fichiers modifiés

- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `apps/nova-web/src/components/routes/DeliverablesSurface.tsx`
- `apps/nova-web/src/components/routes/GlobalRoutes.module.css`
- `apps/nova-web/src/components/routes/RouteSurface.test.tsx`
- `apps/nova-web/src/components/routes/globalRouteFixtures.ts`

Les nombreux autres fichiers déjà modifiés/non suivis au début de la mission sont hors périmètre F04-A. Aucun registre CEREBRAU, fichier PEOPLE/PLANNING, fichier Core/Runtime ou outil Runtime n'a été modifié par cette implémentation. Après le build demandé, les chemins et l'état Git des artefacts `apps/nova-web/dist` préexistants ont été rétablis afin de ne pas les embarquer dans F04-A.

## Vérifications exécutées

- `npm run test:bff` : **SUCCESS**, 74 tests, 74 réussis, 0 échec.
- `npm run test --prefix apps/nova-web` : **SUCCESS**, 27 fichiers de tests, 149 tests réussis, 0 échec.
- `npm run typecheck --prefix apps/nova-web` : **SUCCESS**.
- `npm run build --prefix apps/nova-web` : **SUCCESS**, 152 modules transformés, build Vite terminé en 888 ms lors du build F04-A.
- `git diff --check` : **SUCCESS**, code retour 0; seuls des avertissements informatifs de conversion LF/CRLF ont été émis.
- `npm run build:bff` (`tsc -p tsconfig.nova-bff.json`) : **NO GO global préexistant**, code retour 1, 7 diagnostics tous issus de l'incohérence locale Work Activity : `work-activity.gateway.port.ts` déclare `get(...)` alors que le gateway, la route et leurs tests utilisent `read(...)`. Le diff Git prouve que le changement `read` → `get` dans ce port précédait F04-A. Le port Work Activity a été strictement préservé.

Les tests F04-A couvrent : authentification obligatoire, réponse valide, aucune mission, mission sans rapport, rapport sans preuve, plusieurs missions, incohérences des trois identités, collision de report ID, structure invalide, Runtime indisponible, rejet Runtime, timeout, corrélation, GET uniquement, absence de proxy générique, loading/empty/error/success, absence de données inventées, absence de CTA fonctionnels et conservation de Global Decisions.

## Garanties de périmètre

- Aucune mutation Runtime, persistance ou création de mission.
- Aucun proxy Core générique.
- Aucun index global canonique ou fictif.
- Aucun workflow de publication ou cycle métier Deliverable.
- Aucune inférence Decisions depuis les événements Runtime.
- Aucun changement d'authentification, CSRF, session ou cookies.
- Aucune certification CEREBRAU créée ou modifiée.

## Limitations connues

`GET /api/v1/missions` n'est ni paginé ni limité. Cette projection MVP effectue ensuite une lecture de détail séquentielle pour chaque mission possédant un rapport. Elle n'est donc ni un index Global Deliverables scalable, ni un domaine métier complet, ni une architecture définitive. Aucune pagination frontend/BFF artificielle n'a été ajoutée.

## Conclusion

F04-A est techniquement implémenté, testé et prêt pour revue humaine. F04 complet reste **NO GO**. Le passage à GO final requiert l'approbation humaine prévue et la résolution indépendante de l'incohérence Work Activity si un typecheck BFF global vert est exigé.
