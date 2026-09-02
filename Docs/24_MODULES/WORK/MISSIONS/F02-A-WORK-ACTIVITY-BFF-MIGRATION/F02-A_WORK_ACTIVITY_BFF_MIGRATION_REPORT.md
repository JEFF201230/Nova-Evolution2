# F02-A — Work Activity BFF Migration — Rapport

## Verdict

**GO**

Le chemin Work Activity implémenté est désormais :

`NOVA Web → BFF authentifié → Work Activity Gateway → NOVA Core read-only`.

Le code source navigateur et le build de contrôle ne contiennent plus d’accès direct à
`http://127.0.0.1:4100`, `GET /api/v1/missions` ou
`GET /api/v1/missions/{projectId}/{missionId}/events` pour Work Activity.

## État initial constaté

- `WorkActivityPage.tsx` importait directement `RuntimeMission` et `RuntimeEvent` depuis le serveur.
- Le navigateur appelait directement `http://127.0.0.1:4100/api/v1/missions`, résolvait localement
  le `projectId`, puis appelait directement l’endpoint Core `events`.
- `contracts/work-activity.contract.ts` était un brouillon non suivi. Sa structure principale était
  exploitable, mais la cohérence de chaque événement avec l’identité de mission et l’ordre des
  séquences n’étaient pas validés.
- `server/nova-bff/work-activity.gateway.port.ts` existait comme fichier vide non suivi.
- Aucune route, aucun gateway HTTP et aucune injection Work Activity n’existaient dans le BFF.
- `WorkSurface.tsx` n’injectait pas de fixture Activity ; il transmettait déjà le `workId` de route.
- `workActivityFixture.ts` contenait les types de présentation et des données de démonstration, mais
  `getWorkActivityFixture` n’alimentait plus le chemin connecté audité.
- Core et Runtime exposaient déjà `listMissions` et `getEvents` en lecture seule avec le type
  canonique `RuntimeEvent`. Aucune anomalie bloquante n’a été trouvée.

## Fichiers modifiés

- `contracts/work-activity.contract.ts`
- `server/nova-bff/work-activity.gateway.port.ts`
- `server/nova-bff/work-activity.gateway.ts`
- `server/nova-bff/work-activity.route.ts`
- `server/nova-bff/work-activity.route.test.ts`
- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `apps/nova-web/src/features/work/WorkActivityPage.tsx`
- `apps/nova-web/src/features/work/WorkActivityPage.test.tsx`
- le présent rapport

`WorkSurface.tsx`, `workActivityFixture.ts`, NOVA Core et Runtime ont été audités puis laissés
inchangés.

## Architecture finale

1. Le navigateur construit exclusivement la capability BFF avec `workActivityPath(workId)`.
2. La route dynamique BFF reconnaît exclusivement `GET /api/work/{workId}/activity`.
3. `requireAuthentication` est exécuté avant l’accès au gateway.
4. `HttpWorkActivityGateway` appelle en GET la liste Core des missions afin de résoudre une mission
   Runtime réelle et unique dont `missionId === workId`.
5. Le `projectId` provient exclusivement de cette mission réelle.
6. Le gateway appelle ensuite en GET l’endpoint Core `events` de cette mission.
7. Le contrat strict est validé avant retour au navigateur puis revalidé au frontend.

Aucun proxy BFF générique n’a été créé. La route BFF `/api/v1/missions` reste fermée avec
`ROUTE_NOT_FOUND`.

## Endpoints

### Endpoint navigateur

`GET /api/work/{workId}/activity`

La requête est relative à l’origine Web/BFF, utilise `credentials: include` et ne contient aucun
secret.

### Endpoints Core

- `GET /api/v1/missions`
- `GET /api/v1/missions/{projectId}/{missionId}/events`

Ils sont appelés uniquement par `HttpWorkActivityGateway`, avec `Accept: application/json` et le
`X-Correlation-ID` BFF. Aucun POST ou autre mutation Runtime n’est utilisé.

## Authentification et sécurité

- La route appelle l’authentification BFF existante `requireAuthentication`.
- Une requête sans session retourne 401 `AUTHENTICATION_REQUIRED`.
- Le gateway n’est pas appelé en cas de 401.
- Aucun bypass DEV, affaiblissement de session ou changement CSRF/IAM n’a été introduit.
- Aucun secret, Human Approval, `/approve` ou `POST /api/runtime/execute` n’a été touché.

## Contrat de données

La réponse contient uniquement :

- `workIdentity` avec `workId === missionId` et le `projectId` Runtime ;
- `mission` avec le couple Runtime réel `projectId/missionId` ;
- les événements Runtime factuels : identité, nom, producteur, timestamps, séquence, corrélation,
  états, payload, metadata et champs techniques optionnels existants.

La validation refuse les enveloppes ou champs événementiels supplémentaires, les identités
incohérentes, les timestamps invalides, les séquences invalides ou non strictement croissantes et
les événements appartenant à une autre mission. La projection UI conserve le producteur, le nom,
la date, la transition d’état, la séquence et la corrélation. Aucune donnée métier fictive n’est
ajoutée et aucune fixture ne sert de fallback en cas d’erreur.

## Tests exécutés et résultats

| Contrôle | Résultat |
|---|---|
| `npm.cmd run lint:bff` | PASS |
| `npm.cmd run test:bff` | PASS — 63/63 |
| `npm.cmd run typecheck` dans `apps/nova-web` | PASS |
| `npm.cmd test -- --run src/features/work/WorkActivityPage.test.tsx` | PASS — 9/9 |
| `npm.cmd run build -- --outDir node_modules/.cache/f02a-web-build --emptyOutDir` | PASS — 153 modules |
| Recherche source/build de contrôle : port 4100 et endpoints Core directs | PASS — aucune occurrence |
| `git diff --check` | PASS |

Les tests prouvent notamment ready, loading, empty, error, absence de fallback fictif, conservation
des cinq filtres, navigation, session obligatoire, 401 avant gateway, GET Core uniquement,
propagation du correlation ID, validation stricte, rejet d’un `workId` ambigu et maintien de la
fermeture du proxy générique.

## Éléments hors scope laissés inchangés

- Work Overview, Plan, People, Sources, Decisions et Deliverables ;
- les fixtures de ces surfaces et la fixture Overview utilisée par le shell/header ;
- NOVA Core, Runtime, SSE et monitor snapshot ;
- Home, Clarify, Canvas, Plan Setup, Confirm et Decision Flow ;
- IAM, sessions, CSRF, secrets, Human Approval et toutes les mutations Runtime ;
- les travaux PEOPLE/PLANNING et autres changements préexistants du working tree.

## Git status pertinent

Les fichiers source existants modifiés par la mission sont `WorkActivityPage.tsx`, son test,
`nova-bff.app.ts`, `nova-bff.server.ts` et `nova-bff.boundary.test.ts`. Le contrat, le port, le
gateway, la route, le test BFF et ce rapport sont de nouveaux fichiers non suivis. Aucun fichier n’a
été ajouté à l’index, aucun commit et aucun push n’ont été effectués.

Les changements préexistants, notamment PEOPLE/PLANNING et `apps/nova-web/dist`, n’ont pas été
nettoyés ou écrasés.

## Limitations restantes

- Aucun test E2E avec processus BFF et NOVA Core réels simultanément n’a été exécuté ; les tests de
  route utilisent le vrai serveur HTTP BFF et un gateway injecté, et les tests gateway simulent le
  transport Core.
- Un même `missionId` présent dans plusieurs projets est refusé explicitement par 409
  `WORK_ID_AMBIGUOUS` ; aucune identité synthétique n’est choisie.
- `apps/nova-web/dist` était déjà modifié et contenait un bundle antérieur avant cette mission. Les
  documents d’architecture du dépôt classent ce répertoire comme artefact généré isolé et non comme
  preuve du source courant. Pour ne pas écraser ce travail préexistant, le build de validation a été
  produit dans `node_modules/.cache/f02a-web-build`; son bundle utilise la route BFF et ne contient
  ni origine Core ni endpoint missions direct.
