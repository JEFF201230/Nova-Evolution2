# PROGRAM NOVA — DÉCISION EXÉCUTIVE UX / RUNTIME

Mission : `PROGRAM-NOVA-UX-RUNTIME-INTEGRATION-001`  
Date : `2026-07-28`  
Périmètre : état observé du dépôt, sans build ni modification de code

## Décision

L'intégration ne peut pas être déclarée prête.

## Preuves déterminantes

1. `apps/nova-web/src` ne contient aucun appel `fetch`, client HTTP, chemin `/api/`, `EventSource` ou `WebSocket`. Les écrans utilisent des fixtures ou de l'état local.
2. Le serveur HTTP compose `NovaCoreService`, pas `ProgramProductionEntrypoint`.
3. Hors tests, aucune instanciation du point d'entrée Program Engine certifié n'est présente.
4. Aucun contrat HTTP n'expose `PromptPackage`, `ExecutionSessionId`, les checkpoints durables ou `reconstruct`.
5. Le workflow Human Approval existe en interne, mais aucune API ne l'expose ; `/approve` renvoie HTTP 410.
6. La certification exige des secrets Bearer/HMAC qui doivent rester côté serveur ; aucune médiation navigateur sûre n'existe.
7. Plusieurs mutations v1 ne portent aucun contrôle d'autorité dans le routeur HTTP.
8. Les modèles React Home, Work, Plan, People, Sources, Decisions et Deliverables ne correspondent pas directement aux réponses v1.
9. Cockpit, Monitoring, Missions et Certification n'ont pas de surface React dédiée ; Settings et Evidence ne constituent pas des écrans raccordables complets.
10. Les routes Decision detail/package/pause/receipt réaffichent la surface globale Decisions.

## Ce qui est réutilisable

Les lectures health, projets, preflight, missions, événements, monitoring, SSE et certificat peuvent soutenir une première tranche React en lecture seule.

Cette possibilité ne lève pas les blocages : elle ne raccorde pas React au chemin Program Engine certifié et ne permet pas les workflows Human Approval/Certification de production.

## Condition de réexamen

Une nouvelle certification exigera au minimum :

- une façade HTTP versionnée composant le vrai `ProgramProductionEntrypoint` ;
- authentification et autorisation des mutations ;
- Human Approval exposé et auditable ;
- certification médiée côté serveur ;
- contrats de vue versionnés ;
- intégration React réelle ;
- tests de contrat, idempotence, restart/recovery et rollback legacy.

UX_RUNTIME_INTEGRATION_BLOCKED
