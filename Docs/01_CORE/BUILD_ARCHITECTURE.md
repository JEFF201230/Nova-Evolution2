# BUILD ARCHITECTURE

## Objectif

Décrire la stratégie officielle de compilation du dépôt.

## Runtime principal

Le runtime principal est limité aux éléments réellement montés par le serveur :

- server/index.ts
- server/routes.ts
- server/src/supabase/
- server/consistency/
- server/qf/validation/
- noyau Vigile réellement importé

## Sous-systèmes autonomes

CEREBRAU Context est un sous-système autonome de reconstruction de contexte. Il ne fait pas partie du runtime serveur principal.

CEREBRAU Runtime est un sous-système autonome d'exécution, de validation, de classification, de publication et de génération des registres de connaissance. Il possède son propre périmètre de compilation.

Robot est un sous-système autonome dédié aux traitements automatisés, notamment les traitements AT. Il ne doit pas être compilé par défaut dans le build principal.

Vigile API regroupe les endpoints et adapters Supabase dédiés à l'accès API du moteur Vigile. Il est distinct du noyau Vigile réellement importé par le runtime principal.

Legacy Auth regroupe les anciens contrôleurs, middlewares, routes et schémas d'authentification historiques. Il ne doit pas être inclus dans le build principal.

Prisma Legacy regroupe les anciens accès Prisma et les routes associées. Il ne fait pas partie du runtime principal Supabase.

Dev regroupe les scripts, runners et mémoires locales de développement. Il est exclu des builds de production.

## Principe de compilation

Un sous-système autonome ne doit pas être compilé par le build principal.

Chaque sous-système possède son propre périmètre de compilation.

## Builds prévus

| Build | Point d'entrée | Périmètre | tsconfig dédié (prévu) | Statut |
|---|---|---|---|---|
| Build Principal | server/index.ts | server/index.ts, server/routes.ts, server/src/supabase/, server/consistency/, server/qf/validation/, noyau Vigile réellement importé | tsconfig.server.json | Prévu |
| Build CEREBRAU Context | server/cerebrau-context/index.ts | server/cerebrau-context/ | tsconfig.cerebrau-context.json | Prévu |
| Build CEREBRAU Runtime | server/cerebrau-runtime/engine/engine.ts | server/cerebrau-runtime/ | tsconfig.cerebrau-runtime.json | Prévu |
| Build Robot | server/robot/robotPreComputeGate.ts | server/robot/ hors dev | tsconfig.robot.json | Prévu |
| Build Vigile | server/api/mes.vigile.ts | server/api/mes.vigile.ts, server/vigile/run-from-supabase.ts, server/vigile/adapters/supabase.adapter.ts, noyau Vigile | tsconfig.vigile.json | Prévu |
| Build Legacy | aucun point d'entrée runtime principal | Legacy Auth, Prisma Legacy, routes historiques | tsconfig.legacy.json | Prévu |
| Build Dev | runners et scripts dev | fichiers dev uniquement | tsconfig.dev.json | Prévu |

## Gouvernance

Aucun code legacy ne doit être compilé dans le build principal.

Aucun module autonome ne doit être compilé par défaut.

Chaque runtime possède son propre build.

Le build principal ne compile que les modules réellement montés.
