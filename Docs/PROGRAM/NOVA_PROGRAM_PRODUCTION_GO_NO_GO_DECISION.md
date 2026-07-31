# NOVA Program Engine — Formal Production Decision

## Décision

**NO_GO_PRODUCTION**

Gate de sortie : **PROGRAM_PRODUCTION_NO_GO**

Date : 2026-07-28  
Autorité destinataire : PROGRAM DIRECTOR  
Nature : recommandation formelle fondée sur preuves observables

## Motifs déterminants

La décision `GO_PRODUCTION` est interdite car :

1. sept risques P1 restent ouverts ;
2. l’authentification de production est absente ;
3. le mécanisme et la rotation des secrets ne sont pas démontrés ;
4. les collisions de `ExecutionSessionId`, `MissionId` et `PromptPackageId` sont acceptées ;
5. un chemin workspace arbitraire est accepté ;
6. le raccord réel au service Runtime certifié concret n’est pas démontré ;
7. la recovery et la persistence d’une session en échec sont incomplètes ;
8. les composants certifiés sont non suivis par Git ;
9. la séparation entre données et instructions système n’est pas démontrée ;
10. le `ProductionReadinessEvaluator` retourne `NOT_READY` avec `productionActivationAllowed: false`.

## Éléments favorables non suffisants

- SUPER-WAVE A : 34/34 PASS.
- SUPER-WAVE B : 14/14 PASS.
- SUPER-WAVE C : 25/25 PASS.
- Runtime : 15/15 PASS.
- Suite complète : 424/424 PASS.
- TypeScript : PASS.
- Trois exécutions Codex réelles réussies au total.
- Deux missions réelles simultanées isolées dans le même workspace.
- Sandbox READ_ONLY et dépôt inchangé pendant les exécutions.
- Timeout et annulation propagés.

## Conditions nécessaires à une nouvelle décision

Une nouvelle certification ne pourra recommander GO qu’après preuve de fermeture de tous les P1, versionnement de la chaîne, authentification production, gouvernance des secrets, unicité/idempotence atomiques, confinement workspace, persistence/recovery des sessions, raccord complet aux composants certifiés et préparation opérationnelle.

Aucune remédiation n’a été exécutée dans cette mission.

NO_GO_PRODUCTION
