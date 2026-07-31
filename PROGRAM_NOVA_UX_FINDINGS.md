# PROGRAM NOVA — Findings de certification UX

## Échelle

- `CRITIQUE` : empêche de certifier l’intégration UX au chemin NOVA Core.
- `MAJEUR` : preuve d’un raccord incomplet ou d’une capacité non démontrée.
- `INFORMATIF` : caractérise l’emplacement ou la technologie sans constituer seul un blocage.

## Findings

### UX-001 — L’application historique est présente

**Sévérité :** INFORMATIF  
**Statut :** DÉMONTRÉ

`apps/nova-web/` contient un package React 18/Vite complet : `index.html`, `main.tsx`, `App.tsx`, 20 routes, composants, styles, tests, fixtures et `dist/`.

### UX-002 — La provenance NOVA Orchestrator est matériellement observable

**Sévérité :** INFORMATIF  
**Statut :** DÉMONTRÉ

L’archive `Docs/24_MODULES/NOVA-CONVERGENCE/nova-orchestrator.zip`, désignée `NOVA_ORCHESTRATOR` par `knowledge-index.json`, contient `nova-orchestrator/apps/nova-web/`. Sur les 167 fichiers comparables hors build et dépendances, 161 sont identiques, 6 diffèrent et aucun n’est manquant. L’archive et l’index sont non suivis; le package frontend courant est suivi et propre à HEAD.

### UX-003 — Le seul entrypoint racine ne lance pas l’application React

**Sévérité :** CRITIQUE  
**Statut :** OUVERT

Le seul script de démarrage racine est :

```text
npm run start:nova-core
```

Il lance `server/nova-core/nova-core.server.ts`. Aucun script racine `dev`, `start`, `build` ou `preview`, aucun workspace et aucune commande de lancement `nova-web` n’ont été trouvés.

### UX-004 — NOVA Core sert une autre interface

**Sévérité :** CRITIQUE  
**Statut :** OUVERT

`GET /` lit exclusivement `server/nova-core/public/index.html`. Cette page autonome porte le titre `NOVA Core` et appelle les endpoints de missions. Elle n’est pas présente dans l’archive Orchestrator comparée. Le serveur ne lit pas `apps/nova-web/dist/index.html`.

### UX-005 — Le build React n’est pas servi

**Sévérité :** CRITIQUE  
**Statut :** OUVERT

`apps/nova-web/dist/index.html`, un bundle JavaScript et une feuille CSS sont présents et suivis. Aucune référence exécutable à ce dossier n’a été trouvée dans le manifeste racine, `server/**` ou `tools/**`. La seule mention extérieure trouvée est documentaire.

### UX-006 — L’application React ne consomme pas l’API Core

**Sévérité :** CRITIQUE  
**Statut :** OUVERT

Les recherches dans les sources applicatives hors tests trouvent zéro occurrence de :

- `fetch(`;
- `XMLHttpRequest`;
- `WebSocket`;
- `EventSource`;
- `/api/`;
- `VITE_`;
- `import.meta.env`.

Les surfaces utilisent des fixtures locales.

### UX-007 — Les ports et chemins de test sont séparés

**Sévérité :** MAJEUR  
**Statut :** OUVERT

NOVA Core utilise par défaut `127.0.0.1:4100`. Vite et Playwright utilisent `127.0.0.1:5173`; Playwright lance `npm run dev`. Aucun proxy Vite vers le Core n’est déclaré dans `vite.config.ts`.

### UX-008 — Le Core possède une connaissance de validation du frontend

**Sévérité :** INFORMATIF  
**Statut :** DÉMONTRÉ

La matrice de validation associe les changements sous `apps/nova-web/**` à trois commandes obligatoires : tests, typecheck et build frontend. Le Runtime de reporting sait exécuter ces commandes dans le package `apps/nova-web`.

Ce lien est un lien de contrôle de code, pas un lien de service Web ou de données.

### UX-009 — Aucun serveur statique Express n’existe

**Sévérité :** INFORMATIF  
**Statut :** DÉMONTRÉ

Aucune dépendance ou import Express, aucun `express.static()`, aucune dépendance ou import `serve-static` n’ont été trouvés. NOVA Core utilise directement `node:http` et lit un seul fichier HTML.

### UX-010 — Les dépendances et imports TypeScript contrôlés sont cohérents

**Sévérité :** INFORMATIF  
**Statut :** PASS

`npm ls --depth=0` passe à la racine et dans le package frontend. Les typechecks sans émission passent pour `nova-web` et `nova-core`. Aucun package n’a été installé.

### UX-011 — Le build frontend existe mais n’a pas été reproduit pendant l’audit

**Sévérité :** MAJEUR  
**Statut :** NON EXÉCUTÉ PAR CONTRAINTE

Le script `vite build` existe et `dist/` est suivi. Le build n’a pas été lancé, car il réécrit `dist/` et aurait enfreint l’interdiction de modification. La mission certifie l’existence des artefacts, pas leur reproductibilité par une exécution présente.

### UX-012 — La configuration E2E ne possède aucun test E2E

**Sévérité :** MAJEUR  
**Statut :** OUVERT

`playwright.config.ts` et le script `test:e2e` existent, mais le répertoire configuré `apps/nova-web/src/tests/e2e` est absent et aucun fichier E2E n’a été trouvé.

### UX-013 — La documentation qualifie elle-même l’intégration backend d’ouverte

**Sévérité :** MAJEUR  
**Statut :** DÉMONTRÉ

Les documents Program-036 fixent une frontière frontend isolée et une intégration par contrats explicites. Ils déclarent les contrats backend incomplets, ouverts ou manquants. La Frontend Implementation Bible qualifie l’implémentation de partielle, avec backend et persistance manquants.

### UX-014 — Le worktree est sale, sans modification du frontend suivi

**Sévérité :** INFORMATIF  
**Statut :** DÉMONTRÉ

Avant les rapports, 21 entrées suivies étaient modifiées et 119 non suivies. Aucune entrée de `apps/nova-web/**` n’était sale. Le constat de non-raccordement existe aussi à HEAD : le routeur HTTP de HEAD lit `server/nova-core/public/index.html` et aucune référence de HEAD à `apps/nova-web/dist` n’a été trouvée dans le manifeste, le serveur ou les outils.

## Synthèse

| Catégorie | Nombre |
|---|---:|
| Findings critiques ouverts | 4 |
| Findings majeurs ouverts ou non exécutés | 4 |
| Findings informatifs démontrés/PASS | 6 |

La donnée discriminante n’est pas l’absence de l’UX, mais l’absence de raccord entre l’UX React historique et le chemin exécutable NOVA Core.

## Décision

UX_PRESENT_BUT_NOT_CONNECTED
