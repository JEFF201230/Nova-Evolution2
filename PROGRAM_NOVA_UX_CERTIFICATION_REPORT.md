# PROGRAM NOVA — Certification d’intégration UX

## 1. Identification

| Champ | Valeur observée |
|---|---|
| Mission | `PROGRAM-NOVA-UX-INTEGRATION-CERTIFICATION-001` |
| Dépôt audité | `C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp` |
| Date | 2026-07-28 |
| Branche | `feature/nova-core-manager` |
| HEAD | `7db9658902adf0496a8f681afbfbd3f19d21d7cc` |
| Empreinte de l’arbre frontend à HEAD | `e838f48f177e2754b4f3396a7f4985b55bd73f88` |
| Mode | Lecture seule stricte, hors création des cinq rapports autorisés |

Le worktree était déjà sale avant la création des rapports : 21 entrées suivies modifiées et 119 entrées non suivies. `apps/nova-web/**` ne comportait aucune entrée dans `git status`; son contenu observé correspond donc à l’arbre frontend de HEAD. Les fichiers `server/nova-core/nova-core.http.ts`, `server/nova-core/nova-core.server.ts` et `server/nova-core/public/index.html` étaient déjà modifiés. Le service de `server/nova-core/public/index.html` à la racine HTTP est néanmoins également présent à HEAD.

## 2. Conclusion

L’UX historique NOVA est présente dans le dépôt sous `apps/nova-web/`. La comparaison en lecture seule avec l’archive locale désignée comme source `NOVA_ORCHESTRATOR` montre que les 167 fichiers hors `dist/` et `node_modules/` de l’application courante ont tous un homologue dans l’archive : 161 sont identiques et 6 diffèrent. Aucun fichier de cet ensemble n’est absent d’un côté ou de l’autre.

Cette application n’est pas raccordée au chemin réel `npm run start:nova-core` :

- le script racine lance exclusivement `server/nova-core/nova-core.server.ts`;
- le serveur écoute par défaut sur `127.0.0.1:4100`;
- `GET /` lit exclusivement `server/nova-core/public/index.html`;
- aucune référence exécutable à `apps/nova-web/dist` n’a été trouvée dans `package.json`, `server/**` ou `tools/**`;
- l’application React/Vite est configurée séparément sur `127.0.0.1:5173`;
- aucun `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, chemin `/api/`, variable `VITE_` ou `import.meta.env` n’a été trouvé dans ses sources applicatives hors tests;
- ses surfaces lisent des fichiers de fixtures locaux.

NOVA Core n’est donc pas strictement headless : il expose un tableau de pilotage HTML distinct, directement relié à ses endpoints de mission. Ce tableau n’est pas l’application React/Vite issue de NOVA Orchestrator.

## 3. Inventaire obligatoire

### 3.1 Répertoires recherchés

Recherche récursive hors `.git`, `node_modules`, `.nova-data` et `.nova-data-backup` :

| Nom exact recherché | Résultat observé |
|---|---|
| `client/` | absent |
| `frontend/` | absent |
| `web/` | absent comme nom exact de répertoire |
| `ui/` | absent |
| `app/` | présent uniquement sous `apps/nova-web/src/app/` |
| `src/` | présent sous `apps/nova-web/src/` |
| `public/` | présent sous `server/nova-core/public/` |
| `dist/` | présent sous `apps/nova-web/dist/` |

Le conteneur `apps/` existe et contient `apps/nova-web/`.

### 3.2 Manifestes

Deux manifestes seulement ont été trouvés hors dépendances :

- `package.json`, package racine `nova-core-mvp`;
- `apps/nova-web/package.json`, package frontend privé `nova-web`.

Le manifeste racine ne déclare ni workspace npm ni dépendance frontend.

### 3.3 Technologies

| Technologie | Preuve observée |
|---|---|
| React | `react` et `react-dom` déclarés dans `apps/nova-web/package.json`; montage dans `src/main.tsx` |
| Vite | scripts `dev`, `build`, `preview`; `vite.config.ts`; `@vitejs/plugin-react` |
| TypeScript/TSX | `main.tsx`, `App.tsx`, 85 fichiers `.tsx`, configuration stricte sans émission |
| Vue | aucune déclaration ou signature de configuration trouvée hors dépendances |
| Angular | aucune déclaration ou signature de configuration trouvée hors dépendances |
| Next | aucune déclaration et aucun `next.config.*` trouvé |
| Remix | aucune déclaration ou signature trouvée |
| Astro | aucune déclaration ou signature trouvée |
| Svelte | aucune déclaration ou signature trouvée |
| Electron | aucune déclaration ou signature trouvée |
| Webpack | aucune déclaration et aucun `webpack.*` trouvé |

### 3.4 Entrées et configurations trouvées

- `apps/nova-web/index.html`
- `apps/nova-web/src/main.tsx`
- `apps/nova-web/src/App.tsx`
- `apps/nova-web/vite.config.ts`
- `apps/nova-web/dist/index.html`
- `server/nova-core/public/index.html`

Aucun `main.jsx`, `webpack.*` ou `next.config.*` n’a été trouvé hors dépendances.

## 4. Chemin de démarrage réellement exposé

`package.json:11` définit :

```text
start:nova-core = node --import tsx server/nova-core/nova-core.server.ts
```

Le manifeste racine ne contient aucun script nommé `dev`, `start`, `build` ou `preview`.

`server/nova-core/nova-core.server.ts:8-9` sélectionne par défaut le port 4100 et l’hôte `127.0.0.1`. `DEMARRER_NOVA.bat:42-44` ouvre `http://127.0.0.1:4100` puis appelle `npm run start:nova-core`.

`server/nova-core/nova-core.http.ts:49-53` traite `GET /` en lisant :

```text
./public/index.html
```

La page renvoyée porte le titre `NOVA Core`, contient son CSS et son JavaScript dans le même fichier et n’a aucune référence à un asset externe. Elle appelle notamment :

- `GET /api/v1/projects`;
- `GET /api/v1/missions`;
- `POST /api/v1/missions`;
- `GET /api/v1/missions/{projectId}/{missionId}`;
- `POST /api/v1/missions/{projectId}/{missionId}/execute`;
- les actions de validation et de preuve du même espace `/api/v1/missions`.

Le test existant `server/nova-core/nova-core.http.test.ts:45-47` vérifie que `GET /` répond 200 et contient `NOVA Core`.

## 5. Service statique et endpoints UI

Le serveur utilise `node:http` et `node:fs/promises`. Les recherches ciblées ont produit :

| Recherche | Résultat |
|---|---:|
| dépendance ou import Express | 0 |
| `express.static()` | 0 |
| dépendance ou import `serve-static` | 0 |
| référence statique serveur hors `server/nova-core/public/index.html` | 0 |
| référence exécutable à `apps/nova-web/dist` hors documentation | 0 |

Il ne s’agit pas d’un serveur générique d’assets frontend. Un seul document HTML autonome est lu pour `GET /`.

## 6. Application historique React/Vite

`apps/nova-web/index.html` monte `/src/main.tsx`. `main.tsx` monte `App` avec React 18. `App.tsx` utilise `NavigationProvider`, `WorkSetupProvider` et `NavigationShell`, avec deux surfaces techniques additionnelles `/lab` et `/shell`.

Le registre déclare 20 routes :

- Home, Work, Decisions, Deliverables;
- Clarify, Canvas, Plan, Confirm;
- Work detail et sept onglets;
- Decision detail, package, pause et receipt.

L’arbre `apps/nova-web/src` contient 156 fichiers : 85 TSX, 29 TS et 42 CSS. Il contient 10 fichiers nommés `*Fixture*` et 25 fichiers de tests unitaires ou composants.

Les données utilisées par les surfaces Home, Work, Decisions et Deliverables proviennent notamment de :

- `homeFixture.ts`;
- `workOverviewFixture.ts`;
- `workPlanFixture.ts`;
- `workActivityFixture.ts`;
- `workPeopleFixture.ts`;
- `workSourcesFixture.ts`;
- `workDecisionsFixture.ts`;
- `workDeliverablesFixture.ts`;
- `globalRouteFixtures.ts`;
- `workSetupFixtures.ts`.

Aucune intégration réseau n’a été trouvée dans les sources applicatives hors tests.

## 7. Build et artefacts

Le package frontend possède ses propres scripts :

- `dev = vite`;
- `build = vite build`;
- `preview = vite preview`;
- `typecheck = tsc -p tsconfig.json --noEmit`;
- `test = vitest run`;
- `test:e2e = playwright test`.

Le dossier suivi `apps/nova-web/dist/` contient :

| Fichier | Taille | SHA-256 |
|---|---:|---|
| `index.html` | 540 octets | `E8D85F17A21353F9AF01C4A5D1E8E1B2AC0F87390EFA168CA49F7D15CA4A3106` |
| `assets/index-CtJbXox0.css` | 70 377 octets | `CDD9698D284D230F5B02AE95296D7D70825A82379E1BD41D0F1D610EF884962A` |
| `assets/index-D__HoCSZ.js` | 253 543 octets | `83DAC32C39A3959A885AB2B1EA235119C1B5CDDF9386C7FED291B08E3A66282B` |

`dist/index.html` référence bien les deux assets hachés. Le build n’a pas été relancé pendant cette mission, car `vite build` réécrit `dist/` et aurait violé le mode lecture seule. Le fait certifié est donc la présence d’artefacts suivis et d’un script de build local, pas la reproductibilité d’un build exécuté pendant cette mission.

Le `playwright.config.ts` lance `npm run dev` sur le port 5173. Son répertoire déclaré `src/tests/e2e` est absent et aucun fichier E2E n’a été trouvé.

## 8. Imports et modules

Contrôles exécutés sans installation :

| Contrôle | Résultat |
|---|---|
| `npm ls --depth=0` à la racine | PASS, code 0 |
| `npm ls --depth=0` dans `apps/nova-web` | PASS, code 0 |
| `npm run typecheck` dans `apps/nova-web` | PASS, code 0, `--noEmit` |
| `npm run typecheck:nova-core` | PASS, code 0, `tsconfig.nova-core.json` contient `noEmit: true` |

Aucune dépendance directe manquante ni import TypeScript cassé n’a été détecté par ces contrôles. Aucun package n’a été installé.

## 9. Provenance NOVA Orchestrator

L’archive observée est :

```text
Docs/24_MODULES/NOVA-CONVERGENCE/nova-orchestrator.zip
SHA-256 C644DE8E0D5E5A1CFBF75997FC67D669012E52447D3272F66A138A37C2CBC278
```

Elle est non suivie dans le worktree. Le fichier également non suivi `Docs/24_MODULES/0-UI-DESIGN/ARCHITECTURE/knowledge-index.json:13-14` la désigne comme racine `NOVA_ORCHESTRATOR`. L’archive contient `nova-orchestrator/apps/nova-web/`.

Comparaison binaire en lecture seule, hors `node_modules/` et `dist/` :

| Mesure | Résultat |
|---|---:|
| fichiers applicatifs/configuration dans l’archive | 167 |
| fichiers applicatifs/configuration dans le dépôt courant | 167 |
| identiques | 161 |
| différents | 6 |
| absents dans l’archive | 0 |
| absents dans le dépôt courant | 0 |

Les six fichiers différents sont :

- `src/components/shell/AppShell.module.css`;
- `src/components/shell/NavigationShell.module.css`;
- `src/components/shell/NavigationShell.test.tsx`;
- `src/components/shell/NavigationShell.tsx`;
- `src/features/work/WorkOverviewPage.module.css`;
- `src/features/work/WorkOverviewPage.tsx`.

`apps/nova-web/package.json`, `src/main.tsx` et `src/App.tsx` sont identiques à leurs homologues de l’archive. En revanche, `server/nova-core/nova-core.server.ts`, `server/nova-core/nova-core.http.ts` et `server/nova-core/public/index.html` n’existent pas dans cette archive. Les deux interfaces observées ont donc des emplacements et des chemins d’exécution distincts.

## 10. Raccordement partiel au moteur

NOVA Core connaît le package frontend pour la validation de changements :

- `server/nova-core/validation-matrix.ts:11-16` associe tout changement `apps/nova-web/**` aux tests, au typecheck et au build `nova-web`;
- `tools/nova-core-runtime/NovaCore.Reporting.psm1:216-218` définit les trois commandes dans `apps/nova-web`;
- les règles de gouvernance autorisent des scopes sous `apps/nova-web/src/**`.

Ce raccordement est un raccordement de validation de code. Les recherches ne montrent ni service des artefacts, ni lancement du frontend, ni contrat API consommé par l’application React.

## 11. Comparaison avec l’architecture documentée

Les documents présents établissent les frontières suivantes :

- `P36-DR-001_FRONTEND_FOUNDATION_BASELINE.md:117-131` fixe `apps/nova-web/` comme répertoire frontend canonique, séparé de `server/**`;
- le même document, lignes 349-359, exige une intégration backend par contrats de service explicites;
- ses lignes 406 et 418 marquent les contrats backend comme incomplets et les points d’intégration ultérieurs comme ouverts;
- `PROGRAM_036_PROGRAM_ARCHITECTURE.md:26` fixe une cible frontend uniquement;
- ses lignes 1288 et 1302 déclarent ouverts ou manquants les contrats backend;
- `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md:610` liste backend, API, authentification, permissions et persistance parmi les informations techniques manquantes;
- son verdict aux lignes 649-657 qualifie l’implémentation de partielle, avec backend et persistance manquants.

L’état exécutable observé respecte la séparation physique frontend/backend, mais ne matérialise pas le contrat d’intégration explicite prévu par cette architecture.

## 12. Matrice de certification

| Point obligatoire | Verdict | Preuve synthétique |
|---|---|---|
| Répertoires frontend recherchés | PASS | `apps/nova-web/src`, `dist`; `server/nova-core/public` |
| `package.json` frontend | PASS | `apps/nova-web/package.json` |
| Framework frontend | PASS | React 18 + Vite |
| Entrées frontend | PASS | `index.html`, `main.tsx`, `App.tsx`, `vite.config.ts` |
| Routes statiques Core | PASS | `GET /` lit `server/nova-core/public/index.html` |
| Express `static()` | ABSENT | aucun import, package ou appel |
| `serve-static` | ABSENT | aucun import ou package |
| Endpoints UI | PASS pour le tableau Core | page autonome reliée aux endpoints mission |
| UI générée par build | PRÉSENTE | `apps/nova-web/dist` suivi; build non réexécuté |
| Runtime expose une interface Web | OUI | tableau Core sur le port 4100 |
| Runtime uniquement headless | NON | `GET /` répond en HTML |
| Références NOVA Orchestrator | OUI | archive, index de connaissance, documentation et sources comparées |
| Imports cassés | NON DÉTECTÉS | typechecks PASS |
| Modules absents | NON DÉTECTÉS | `npm ls` PASS |
| Migration UX commencée | OUI | 167/167 fichiers homologues à l’archive |
| UX raccordée à l’entrypoint Core | NON | aucun service/lancement de `apps/nova-web`; page distincte |
| UX raccordée aux données Core | NON | aucun marqueur réseau; fixtures locales |
| E2E frontend disponibles | NON | configuration présente, répertoire de tests absent |

## 13. Décision

UX_PRESENT_BUT_NOT_CONNECTED
