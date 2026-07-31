# PROGRAM NOVA — UX GO / NO-GO

## Périmètre

Certification de l’intégration de l’UX historique NOVA dans le chemin exécutable NOVA Core observé le 2026-07-28, branche `feature/nova-core-manager`, HEAD `7db9658902adf0496a8f681afbfbd3f19d21d7cc`.

## Gates

| Gate | Résultat | Preuve observée |
|---|---|---|
| UX présente dans le dépôt | PASS | `apps/nova-web/`, React/Vite, 156 fichiers sous `src` |
| Provenance Orchestrator identifiable | PASS | 167 homologues dans l’archive; 161 identiques, 6 différents |
| Package frontend autonome | PASS | manifeste, lockfile, scripts dev/build/preview/test |
| Dépendances directes disponibles | PASS | `npm ls --depth=0`, code 0 |
| Imports TypeScript résolus | PASS | typecheck frontend et Core, code 0 |
| Artefacts frontend présents | PASS | `apps/nova-web/dist/index.html` et deux assets hachés suivis |
| Raccordement au script racine | FAIL | `start:nova-core` lance exclusivement le serveur Core |
| Service du build React par NOVA Core | FAIL | aucune référence à `apps/nova-web/dist` |
| Consommation de l’API Core par React | FAIL | aucun marqueur réseau ou `/api/`; données de fixtures |
| Même chemin UX en développement et production Core | FAIL | Vite/Playwright sur 5173; Core sur 4100 |
| E2E du frontend disponibles | FAIL | `src/tests/e2e` absent |
| Runtime Web non headless | PASS | page autonome `server/nova-core/public/index.html` servie à `/` |
| Interface servie = UX React historique | FAIL | le serveur lit une page distincte absente de l’archive comparée |

## Fait déterminant

La présence physique de l’UX et son intégration aux validations NOVA Core ne constituent pas un raccordement d’exécution. Le seul entrypoint racine sert le tableau HTML de NOVA Core; il ne lance ni ne sert l’application React/Vite. Réciproquement, l’application React n’appelle aucun endpoint du Core.

## Décision

UX_PRESENT_BUT_NOT_CONNECTED
