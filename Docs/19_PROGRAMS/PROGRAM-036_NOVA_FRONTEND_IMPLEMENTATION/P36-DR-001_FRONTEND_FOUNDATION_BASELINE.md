# 1. Document Control

| Field | Value |
|---|---|
| Decision Record ID | `P36-DR-001_FRONTEND_FOUNDATION_BASELINE` |
| Program | `PROGRAM-036 — NOVA Frontend Implementation` |
| Decision type | Architecture Decision Record |
| Scope | Frontend baseline for LOT 001 |
| Repository | `C:\DEV\nova-orchestrator` |
| Status | Final |

# 2. Decision Identity

This document establishes the canonical frontend baseline for PROGRAM-036.

It removes the LOT 001 blockage identified in `P36-MO-000_PROGRAM_READINESS.md` by defining a single executable direction for:

- frontend stack;
- frontend directory;
- routing mechanism;
- CSS strategy;
- testing strategy;
- initial directory tree;
- required configuration files.

# 3. Context

Relevant normative inputs:

- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-MO-000_PROGRAM_READINESS.md`
- `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK_CERTIFICATION.md`
- `package.json`
- `package-lock.json`
- repository tree as inspected in the working copy

Observed repository facts used in this decision:

- no executable frontend application exists yet;
- the repository root is currently oriented around the kernel/server codebase;
- `package.json` only exposes `test:kernel:bootstrap`;
- `npm` is the package manager currently evidenced by `package-lock.json`;
- the Playbook is certified with conditions and does not block LOT 000 / LOT 001;
- the program architecture is already established for PROGRAM-036.

# 4. Problem Statement

LOT 001 needs a canonical technical baseline before implementation can begin.

The baseline must be specific enough to avoid local arbitrage, but narrow enough to remain compatible with the existing repository and the normative documents.

# 5. Sources Reviewed

| Source | What it informed |
|---|---|
| `PROGRAM_036_PROGRAM_ARCHITECTURE.md` | program structure, lot order, gates, governance, conflict model |
| `P36-MO-000_PROGRAM_READINESS.md` | readiness blockers, repository baseline, open dependencies |
| `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | implementation contracts, directory guidance, state/routing model, testing model |
| `NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md` | execution conventions, governance, React/TypeScript/CSS/testing rules |
| `NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK_CERTIFICATION.md` | certification status and non-blocking conditions |
| `package.json` | current toolchain evidence |
| `package-lock.json` | package manager evidence |
| repository tree | current filesystem reality |

# 6. Constraints

- no code may be produced in this decision mission;
- no existing source document may be modified;
- no dependency may be installed;
- no package manifest may be modified;
- no frontend folder may be created in this mission;
- no deferred “to decide later” answer is allowed;
- every choice must stay traceable to the reviewed sources or the repository baseline.

# 7. Options Evaluated

| Domain | Options evaluated | Decision basis |
|---|---|---|
| Stack | React 18 + TypeScript + Vite / Next.js / other SPA frameworks | the sources already describe a React/TypeScript frontend; Vite is the lightest compatible build baseline |
| Directory | `apps/nova-web/` / `frontend/` / `client/` / `web/` | the repo needs isolation from `server/`; `apps/` provides the clearest boundary |
| Routing | internal route-state controller / third-party router | the source set already supports state-driven navigation; an internal controller avoids unnecessary dependency churn |
| CSS | CSS Modules + global token entry / Tailwind-first / CSS-in-JS-first | the Playbook requires source-bound styling; CSS Modules are stable, explicit, and low-risk |
| Tests | Vitest + React Testing Library + Playwright / Jest-only / no E2E baseline | the implementation and certification model require unit, integration, accessibility, and visual coverage |
| Conventions | explicit functional React + typed contracts / looser component conventions | the Playbook and NFIB require traceable, typed, minimal conventions |

# 8. Frontend Stack Decision

Decision: React 18 + TypeScript + Vite.

Rationale:

- directly aligned with the NFIB and Playbook execution model;
- small operational surface for a new frontend baseline;
- strong fit for incremental delivery;
- good testability and performance characteristics for a shell-first build;
- minimal maintenance overhead compared with a heavier framework;
- compatible with the repository’s current absence of a frontend app, because it can be added as a self-contained workspace package.

Rejected alternatives:

- Next.js: unnecessary application-server coupling for the current program scope;
- Vue / Svelte / other framework families: inconsistent with the normative frontend references;
- plain non-bundled static implementation: too weak for the expected certified frontend lifecycle.

Decision status: APPROVED WITH CONDITIONS

Conditions:

- the stack is implemented as an isolated frontend workspace package;
- the root kernel/server package remains untouched;
- later dependency installation must remain confined to the frontend package boundary.

# 9. Frontend Directory Decision

Canonical directory: `apps/nova-web/`

Rationale:

- isolates the frontend from `server/` and from the documentation tree;
- supports an explicit application boundary;
- is compatible with a future multi-app workspace without renaming the frontend later;
- keeps ownership clear for implementation, tests, and certification artifacts.

Isolation rules:

- frontend implementation lives under `apps/nova-web/**`;
- backend code remains under `server/**`;
- documentation remains under `Docs/**`;
- no frontend source file may be created outside the canonical app directory except approved workspace-level configuration if later required by governance.

Rejected alternatives:

- `frontend/`: too generic and weaker for a multi-app repository;
- `client/`: too ambiguous relative to network clients or SDKs;
- root-level app files: would pollute the existing repository boundary.

# 10. Routing Decision

Routing mechanism: internal route-state controller using the browser History API and `URLSearchParams`.

Reasoning:

- preserves the source-described state-driven navigation model;
- avoids unnecessary third-party router coupling in the first foundation lot;
- allows canonical deep links without overcommitting to a heavy routing dependency;
- supports tab restoration and drawer deep links without changing the product model.

Canonical routes:

- `/home`
- `/work/:workId`
- `/work/:workId?tab=overview`
- `/work/:workId?tab=plan`
- `/work/:workId?tab=activity`
- `/work/:workId?tab=people`
- `/work/:workId?tab=sources`
- `/work/:workId?tab=decisions`
- `/work/:workId?tab=deliverables`
- `/decisions`
- `/decisions/:decisionId`
- `/decisions/:decisionId/review`
- `/decisions/:decisionId/decide`
- `/decisions/:decisionId/receipt`
- `/deliverables`
- `/deliverables/:deliverableId`

Supported route parameters:

- `tab`
- `drawer`
- `itemId`
- `decisionId`
- `deliverableId`

Fallback behavior:

- unknown routes resolve to `/home`;
- invalid object identifiers resolve to the nearest valid parent view with an explicit empty/error state if needed;
- no silent redirect to an unrelated screen.

Return behavior:

- browser back/forward must preserve the current view state;
- Work tab restoration is supported through the `tab` parameter;
- drawer state may be restored when opened through a deep link;
- scroll restoration is supported only when it does not conflict with the source-defined view behavior.

Rejected alternatives:

- React Router as the primary baseline: unnecessary dependency for LOT 001 and less aligned with the current state-driven source model;
- hash routing: weaker canonical URL quality;
- no routing at all: insufficient for deep-linkable work and decision surfaces.

# 11. CSS Decision

CSS strategy: CSS Modules for component and feature scope, plus one global CSS entry for tokens, resets, and base layout rules.

Rationale:

- explicit and maintainable;
- avoids style collision in a new frontend area;
- supports source-bound tokens and semantic color rules;
- compatible with a shell-driven incremental implementation;
- simpler to certify than a mixed inline/global/Tailwind approach.

Style policy:

- tokens and semantic variables are exposed centrally;
- shared primitives consume those tokens;
- feature-specific styles remain scoped to the feature folder;
- global styles are limited to resets, typography baseline, layout baseline, and token definitions;
- responsive behavior must use documented source constraints only.

Interdictions:

- no Tailwind-first baseline;
- no uncontrolled global CSS sprawl;
- no styling system split across multiple competing paradigms;
- no visual value that has no source justification.

Rejected alternatives:

- Tailwind as primary baseline: not selected because it would add a second implementation language and complicate source traceability;
- CSS-in-JS as primary baseline: not selected because the repository does not need that level of runtime styling complexity for LOT 001.

# 12. Testing Decision

Test baseline:

- Vitest for unit and component tests;
- React Testing Library for component and integration-level UI behavior;
- Playwright for navigation, accessibility, and visual/pixel-oriented checks.

Rationale:

- the NFIB requires contracts, integration, accessibility, and visual evidence;
- Vitest fits Vite naturally;
- React Testing Library supports behavior-first assertions;
- Playwright gives a stable browser-level validation path for certified frontends.

Test scope:

- unit tests for state, helpers, and adapters;
- component tests for shared and feature components;
- integration tests for shell, routing, and flows;
- accessibility tests for keyboard, focus, labels, and dialogs;
- end-to-end tests for critical entry and decision paths;
- visual checks for certified screens and drawers.

Rejected alternatives:

- Jest-only: acceptable in principle, but not the best fit for a Vite-first baseline here;
- no browser-level tests: incompatible with pixel-perfect and navigation certification expectations.

# 13. Code Convention Decision

Frontend conventions:

- functional React components only;
- explicit and typed props;
- clear separation of shared components, layout components, and feature components;
- hooks used only for reusable UI logic, not hidden product decisions;
- services used for I/O, persistence, and adapters;
- no placeholder action may be delivered as functional;
- all critical mutations must remain explicit and testable;
- no silent fallback may mask a source conflict.

TypeScript conventions:

- strict typing for component contracts, state, services, and navigation payloads;
- explicit unions for UI states;
- no `any` unless later documented in a local exception;
- source distinctions such as confidence, completion, coverage, readiness, and probability must remain separate types or fields.

Naming conventions:

- PascalCase for components;
- camelCase for hooks, helpers, and local variables;
- kebab-case only for file and folder names where conventional;
- feature folders named by domain, not by implementation detail.

# 14. Initial Directory Tree

Canonical initial tree for LOT 001:

```text
apps/nova-web/
├─ index.html
├─ package.json
├─ public/
└─ src/
   ├─ app/
   ├─ routes/
   ├─ layouts/
   ├─ components/
   │  ├─ shared/
   │  ├─ layout/
   │  └─ forms/
   ├─ features/
   │  ├─ home/
   │  ├─ work/
   │  ├─ decisions/
   │  └─ deliverables/
   ├─ hooks/
   ├─ services/
   ├─ styles/
   ├─ types/
   ├─ tests/
   └─ assets/
```

Notes:

- this tree is intentionally minimal for LOT 001;
- feature subfolders may be extended only when the lot scope requires it;
- no new top-level frontend directory may be added outside `apps/nova-web/`.

# 15. Required Configuration Files

Files expected to be created during LOT 001:

- `apps/nova-web/package.json`
- `apps/nova-web/vite.config.ts`
- `apps/nova-web/tsconfig.json`
- `apps/nova-web/tsconfig.app.json`
- `apps/nova-web/tsconfig.node.json`
- `apps/nova-web/eslint.config.js`
- `apps/nova-web/prettier.config.cjs`
- `apps/nova-web/vitest.config.ts`
- `apps/nova-web/playwright.config.ts`
- `apps/nova-web/index.html`
- `apps/nova-web/src/styles/globals.css`

Not required for this baseline unless later source decisions demand them:

- PostCSS config;
- Tailwind config;
- Storybook config.

# 16. Dependency Policy

- the frontend baseline must not reuse the root kernel dependency model as a hidden shortcut;
- the frontend app may own its own package manifest when LOT 001 is executed;
- shared repository dependencies must remain explicit and isolated;
- no dependency may be introduced without a traceable reason tied to the selected stack.

# 17. Legacy Isolation Strategy

The frontend baseline is isolated from legacy and non-frontend areas by design:

- no frontend code is allowed under `server/`;
- no build artifact may be committed into documentation folders;
- the frontend workspace is responsible only for UI implementation;
- backend integration happens through explicit service contracts, not shared implementation shortcuts;
- the root package remains untouched in this decision mission.

This strategy addresses the current absence of a frontend tree without forcing a rewrite of existing server or governance artifacts.

# 18. Accessibility Baseline

Accessibility baseline for LOT 001:

- keyboard operability from the first implementation slice;
- visible focus for all interactive elements;
- accessible labels for buttons, tabs, drawers, dialogs, and form fields;
- no reliance on color alone for critical meaning;
- dialog and drawer focus management must be present when those primitives are introduced;
- error messages must be connected to the affected control.

This baseline is consistent with the UX audit and the certified Playbook.

# 19. Responsive Baseline

Responsive baseline for LOT 001:

- desktop-first implementation;
- no invented breakpoints;
- no unsupported mobile promise;
- layout compression only where the source corpus allows it;
- responsive behavior is verified as a compatibility constraint, not as a redesign.

If later certified sources define additional responsive rules, they must be adopted by decision record, not by local preference.

# 20. Pixel-Perfect Baseline

Pixel-perfect baseline for LOT 001:

- source-bound dimensions, spacing, radius, shadow, and color tokens only;
- reproducible comparison method required later in certification;
- no average-value approximation for source conflicts;
- no invented visual tolerance that changes intent;
- no decorative deviation from validated surfaces.

# 21. Risks

| Risk | Impact | Severity | Control |
|---|---|---|---|
| No frontend exists yet | implementation could start on a blank baseline incorrectly | High | isolate the app under `apps/nova-web/` |
| Root package is kernel-oriented | accidental mixing of frontend and runtime concerns | High | keep the root package untouched |
| Route model remains source-driven | bad router choice could create later rework | Medium | use the internal route-state controller baseline |
| CSS strategy drift | style collisions or non-traceable styling | Medium | CSS Modules + global token entry only |
| Test strategy under-specification | certification evidence becomes weak | Medium | Vitest + RTL + Playwright |
| Missing Figma native data | exact geometry and some technical details remain unavailable | Medium | preserve the documented gaps; do not invent values |
| Backend contracts incomplete | integration details can still block later lots | Medium | keep service boundaries explicit |

# 22. Conflicts

| Conflict ID / issue | Impact | Decision | Residual blockage | Control strategy |
|---|---|---|---|---|
| Absence of current frontend application | LOT 001 cannot build on an existing app tree | resolved by selecting a new isolated workspace baseline | none for baseline definition; implementation still required | create `apps/nova-web/` as the canonical app boundary |
| Root `package.json` oriented to kernel bootstrap | risk of mixed concerns | resolved by keeping the frontend package separate | none for this decision | do not alter root package in this mission |
| Routing source model tension | route support must not contradict state-driven navigation | resolved by internal route-state controller + History API | none for LOT 001 baseline | preserve URL state without introducing unnecessary router coupling |
| CSS baseline choice | multiple CSS paradigms would increase drift | resolved by choosing CSS Modules + global token entry | none for LOT 001 baseline | ban mixed paradigms as primary strategy |
| Testing breadth | certification requires more than unit tests | resolved by selecting Vitest + RTL + Playwright | none for LOT 001 baseline | keep the three-layer test baseline |
| Figma native data absence | exact native fidelity remains unavailable | open | yes, at the source level | do not invent missing geometry or assets |
| Backend contracts incomplete | later integration points may remain open | open | potentially for later lots | keep service interfaces explicit and isolated |

# 23. Rejected Options

Rejected stack options:

- Next.js as the primary baseline;
- Vue or Svelte as the baseline family;
- static-only frontend without a bundler;
- Tailwind-first styling baseline;
- Jest-only testing baseline;
- third-party router as the primary foundation for LOT 001.

Reason for rejection:

- each option either adds unnecessary complexity, diverges from the normative execution documents, or increases the risk of later rework.

# 24. Consequences

Positive consequences:

- LOT 001 can now start from a single canonical direction;
- implementation boundaries are explicit;
- certification evidence can be designed around a known stack;
- later governance decisions can reference one baseline instead of re-litigating the stack.

Operational consequences:

- the frontend package must be created as a separate app boundary;
- the initial implementation must respect the route-state controller model;
- the first lot must create the app package and its local configuration files;
- the root kernel package stays untouched.

# 25. LOT 001 Entry Impact

Impact on LOT 001:

- the stack is now fixed: React 18 + TypeScript + Vite;
- the frontend directory is now fixed: `apps/nova-web/`;
- the routing baseline is now fixed: internal route-state controller using the History API;
- the CSS baseline is now fixed: CSS Modules + global token entry;
- the testing baseline is now fixed: Vitest + React Testing Library + Playwright;
- the initial directory tree is now fixed;
- the required configuration files are now listed.

Residual open items that do not block the baseline:

- native Figma gaps;
- backend contract incompleteness;
- later responsive clarifications if a certified source updates them.

# 26. Final Decision

Decision: APPROVED WITH CONDITIONS

Non-blocking conditions:

1. the frontend must be implemented under `apps/nova-web/`;
2. the root kernel/server package must remain untouched;
3. routing must remain source-bound and state-preserving;
4. CSS must remain module-scoped with a single global token entry;
5. tests must cover unit, component, integration, accessibility, and browser-level validation;
6. no new product rule may be invented during implementation.

LOT 001 may be re-evaluated: OUI

