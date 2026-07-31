# PROGRAM NOVA — Architecture UX observée

## 1. Architecture exécutable actuelle

```text
DEMARRER_NOVA.bat
        |
        v
npm run start:nova-core
        |
        v
server/nova-core/nova-core.server.ts
Node HTTP — 127.0.0.1:4100
        |
        +--> GET /
        |      |
        |      v
        |  server/nova-core/public/index.html
        |  tableau HTML/CSS/JS autonome
        |      |
        |      v
        |  /api/v1/projects
        |  /api/v1/missions/**
        |
        +--> GET /health
        |
        +--> API missions / monitoring / preuves / certification
```

Cette branche est effectivement Web : `GET /` renvoie un document HTML et le document appelle l’API du même serveur.

## 2. Architecture UX React présente mais séparée

```text
apps/nova-web/package.json
        |
        +--> npm run dev ----> Vite 127.0.0.1:5173
        +--> npm run build --> apps/nova-web/dist/**
        +--> npm run preview
        |
        v
index.html -> src/main.tsx -> src/App.tsx
        |
        v
NavigationProvider + WorkSetupProvider + NavigationShell
        |
        +--> 20 routes Home / Work / Decisions / Deliverables
        +--> composants shell / surfaces / drawers
        +--> données locales *Fixture.ts
```

Aucune arête d’exécution ou de données n’a été trouvée entre cette branche et le serveur 4100 :

```text
apps/nova-web/dist/**  - - - X - - ->  server/nova-core HTTP
apps/nova-web/src/**   - - - X - - ->  /api/v1/**
start:nova-core        - - - X - - ->  Vite / nova-web
```

## 3. Raccordement existant de validation

Une arête distincte existe pour la validation de modifications :

```text
changement sous apps/nova-web/**
        |
        v
server/nova-core/validation-matrix.ts
        |
        v
tools/nova-core-runtime/NovaCore.Reporting.psm1
        |
        +--> npm test          dans apps/nova-web
        +--> npm run typecheck dans apps/nova-web
        +--> npm run build     dans apps/nova-web
```

Cette arête traite le frontend comme cible de validation. Elle ne sert pas son build et ne transporte pas de données produit vers son interface.

## 4. Localisation de l’UX

| Élément | Localisation actuelle | Fonction observée |
|---|---|---|
| UX historique React/Vite | `apps/nova-web/` | application frontend autonome, routes et composants |
| Build historique présent | `apps/nova-web/dist/` | artefacts Vite suivis, non servis par le Core |
| UX réellement servie par Core | `server/nova-core/public/index.html` | tableau de pilotage autonome connecté à l’API mission |
| Source historique locale | `Docs/24_MODULES/NOVA-CONVERGENCE/nova-orchestrator.zip` | archive contenant `nova-orchestrator/apps/nova-web/` |
| Mapping de la source | `Docs/24_MODULES/0-UI-DESIGN/ARCHITECTURE/knowledge-index.json` | désigne l’archive comme `NOVA_ORCHESTRATOR` |

L’archive et son index sont non suivis dans le worktree. `apps/nova-web/**` est suivi et inchangé par rapport à HEAD.

## 5. Comparaison à l’architecture frontend documentée

L’architecture Program-036 fixe :

- `apps/nova-web/` comme frontière canonique frontend;
- `server/**` comme frontière backend;
- une intégration backend future par contrats de service explicites;
- une cible Program-036 frontend uniquement;
- des contrats backend encore ouverts ou manquants.

L’état observé possède les deux frontières, les sources frontend et un serveur backend. Il ne possède pas l’arête explicite de service, de déploiement ou de consommation API reliant l’application React au Core.

## 6. Caractérisation

| Question | Réponse factuelle |
|---|---|
| NOVA Core est-il headless ? | Non; il sert un tableau HTML. |
| L’UX historique est-elle absente ? | Non; elle est sous `apps/nova-web/`. |
| Le build React existe-t-il ? | Oui; il est sous `apps/nova-web/dist/`. |
| Le Core sert-il ce build ? | Non; il sert `server/nova-core/public/index.html`. |
| React consomme-t-il l’API Core ? | Aucun appel ou contrat n’a été trouvé dans ses sources. |
| Le moteur sait-il valider le frontend ? | Oui; la matrice de validation sélectionne tests, typecheck et build. |

## 7. Décision

UX_PRESENT_BUT_NOT_CONNECTED
