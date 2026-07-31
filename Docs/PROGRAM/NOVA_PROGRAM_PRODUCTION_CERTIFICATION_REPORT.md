# NOVA Program Engine — Production Certification Report

Date d’audit : 2026-07-28  
Mode : READ_ONLY / AUDIT / CERTIFICATION / NO REMEDIATION  
Branche observée : `feature/nova-core-manager`  
HEAD observé : `7db9658902adf0496a8f681afbfbd3f19d21d7cc`

## 1. Executive Summary

La recommandation de certification est **NO_GO_PRODUCTION**.

Les gates fonctionnelles préalables sont démontrées : packaging de mission, pipeline d’intégration et exécution Codex réelle. Les tests ciblés, TypeScript, le Runtime et la suite complète passent. Deux missions Codex indépendantes ont également été exécutées réellement et simultanément dans le même workspace, avec des résultats correctement isolés.

Ces succès ne suffisent pas à autoriser la production. Des preuves observables établissent plusieurs écarts P1 :

- l’identité Human Approval est explicitement `NOT_AUTHENTICATED_BY_PRODUCTION_AUTH` ;
- l’authentification Codex observée est une session interactive ChatGPT, sans mécanisme de production ni rotation démontrés ;
- les collisions simultanées de `ExecutionSessionId`, `MissionId` et `PromptPackageId` sont acceptées ;
- un workspace arbitraire (`C:\Windows`) est accepté par l’adaptateur ;
- le chemin réel passe par un port structurel `IntegrationServicePort`, sans raccord concret démontré au `NovaIntegrationService` certifié ;
- une exécution en erreur ne produit pas d’`ExecutionSession` persistée et reconstruisible ;
- les composants du périmètre sont non suivis par Git et absents du HEAD certifié ;
- la séparation entre données utilisateur et instructions système n’est pas démontrée.

Le `ProductionReadinessEvaluator` confirme `NOT_READY`, avec `productionActivationAllowed: false`.

## 2. Périmètre certifié

Le contrôle couvre :

`Knowledge Layer → MissionContextBuilder → MissionBriefBuilder → PromptComposer → PromptValidator → PromptOptimizer → PromptPackage → MissionPackageRuntimeMapper → IntegrationPipeline → CodexExecutionAdapter → ExecutionSession → Integration Service → Runtime Orchestrator → Runtime Repository → Human Approval Workflow → Mission Evidence Certifier → Production Readiness Evaluator`.

Tous les composants nommés étaient présents. La continuité nominale jusqu’au relais Runtime est démontrée. La continuité avec le `NovaIntegrationService` concret et sa persistence certifiée n’est pas démontrée par l’exécution réelle.

## 3. Environnement de validation

| Élément | Valeur observée |
|---|---|
| OS | Microsoft Windows NT 10.0.26200.0 |
| Architecture | x64 |
| CPU déclaré | Intel64 Family 6 Model 170 Stepping 4, GenuineIntel |
| Node.js | v24.16.0 |
| npm | 11.13.0 |
| Git | 2.54.0.windows.1 |
| Codex CLI | 0.145.0 |
| Authentification Codex | Logged in using ChatGPT |
| Sandbox réel | `read-only` |
| Session Codex | `--ephemeral` |
| Configuration utilisateur | `--ignore-user-config` |
| Approbation CLI | `approval_policy="never"` |

Aucune valeur de secret ou de jeton n’a été lue ou reproduite.

## 4. Gates préalables

| Gate | Preuve | Résultat |
|---|---|---|
| MISSION_PACKAGE_READY | 34/34 tests SUPER-WAVE A et package `VALID` | PASS |
| INTEGRATION_PIPELINE_READY | 14/14 tests SUPER-WAVE B | PASS |
| REAL_EXECUTION_VALIDATED | Codex exit 0, réponse `REAL_EXECUTION_OK`, Runtime `RESULT_RECEIVED` | PASS |

## 5. Résultats par axe

| Axe | Synthèse | Résultat |
|---|---|---|
| 1 — Intégrité pipeline | Contrats et mapping nominaux valides ; raccord concret au service certifié et unicité globale non démontrés | FAIL |
| 2 — Sécurité | READ_ONLY réel validé ; authentification production, workspace allowlist et séparation d’instructions absents | FAIL |
| 3 — Résilience | Timeout et annulation prouvés ; recovery de l’ExecutionSession réelle et interruption brutale non prouvés | FAIL |
| 4 — Concurrence | Deux missions distinctes isolées ; collisions d’identifiants acceptées | FAIL |
| 5 — Observabilité | Identifiants, temps, durée et brut présents en succès ; erreurs et reconstruction persistée incomplètes | FAIL |
| 6 — Données/traçabilité | Mapping sans perte et preuves certifiées immuables ; sessions réelles non persistées | FAIL |
| 7 — Performance | Mesures produites, sans seuil de production inventé | PASS |
| 8 — Stabilité | Toutes les validations passent ; provenance Git de la chaîne non certifiable | FAIL |
| 9 — Exploitation | Feature flags disponibles ; secrets, auth, supervision, alertes et procédures manquants | FAIL |
| 10 — Multi-projet | Capacité partielle du Runtime ; pipeline réel sans `projectId` ni garanties multi-workspace | BLOCKED |

## 6. Tests exécutés

| Validation | Résultat | Durée observée |
|---|---:|---:|
| SUPER-WAVE A | 34/34 PASS | 201.727 ms |
| SUPER-WAVE B | 14/14 PASS | 135.189 ms |
| SUPER-WAVE C | 25/25 PASS | 161.339 ms |
| Runtime certifié | 15/15 PASS | 152.179 ms |
| TypeScript | PASS | commande terminée avec code 0 |
| Suite complète | 424/424 PASS | 9 025.796 ms |
| Packages installés | 3 dépendances de développement attendues | PASS |

Versions observées : `@types/node@22.20.1`, `tsx@4.23.0`, `typescript@5.9.3`.

## 7. Résultats sécurité

- **PASS** — aucune signature de secret en clair de forme `sk-*` dans les 15 composants ciblés.
- **PASS** — prompt transmis par stdin ; commande Codex composée d’arguments fixes.
- **PASS** — sandbox `read-only`, session éphémère, configuration utilisateur ignorée.
- **PASS** — feature flags OFF retournent avant traitement dans les composants testés.
- **FAIL P1** — identité Human Approval explicitement non authentifiée par un système de production.
- **FAIL P1** — aucune stratégie de secret production ni rotation de credentials démontrée.
- **FAIL P1** — `workingDirectory` accepte factuellement `C:\Windows` sans allowlist ni contrôle de containment.
- **FAIL P1** — aucune séparation structurée entre données utilisateur et instructions système.
- **BLOCKED P2** — permissions ACL de fichiers et politique processus hôte non certifiées.
- **BLOCKED P2** — perte d’authentification réelle non provoquée ; seule la propagation injectée est testée.

## 8. Résultats résilience

- Timeout réel à 1 ms : `CodexExecutionTimeoutError`, code `CODEX_TIMEOUT`, propagé.
- Annulation précoce : objet erreur utilisateur propagé sans altération.
- Erreurs Codex, connexion, authentification et Runtime : propagation injectée testée.
- Repository : corruption, écriture interrompue, restart, recovery et concurrence couverts par tests.
- Runtime : annulation, timeout, interruption, locks et replay couverts par tests.
- **FAIL P1** — aucune `ExecutionSession` terminale n’est produite/persistée quand le transport lève une erreur.
- **FAIL P1** — relance et double exécution non prévenues avant l’appel Codex.
- **BLOCKED P2** — arrêt brutal réel du processus Codex et absence de descendant orphelin non démontrés.

## 9. Résultats concurrence

Deux missions Codex réelles ont été lancées simultanément dans le même workspace :

| Mission | Session | Package | Durée | Sortie | Isolation |
|---|---|---|---:|---|---|
| CERT-CONCURRENT-A | EXEC-CONCURRENT-A | PACKAGE-CONCURRENT-A | 3 373 ms | `REAL_PARALLEL_A_OK` | PASS |
| CERT-CONCURRENT-B | EXEC-CONCURRENT-B | PACKAGE-CONCURRENT-B | 3 003 ms | `REAL_PARALLEL_B_OK` | PASS |

Durée murale : 3 374 ms. Les deux sorties étaient distinctes et conformes. Le dépôt est resté inchangé.

Contrôle négatif :

- deux appels concurrents portant le même `ExecutionSessionId`, le même `MissionId` et le même `PromptPackageId` ont tous deux terminé ;
- deux missions distinctes partageant un même `PromptPackageId` ont toutes deux terminé.

La prévention des collisions et de la double exécution est donc **FAIL P1**.

## 10. Résultats observabilité

Présents en succès : `MissionId`, `PromptPackageId`, `RuntimeMissionId`, `ExecutionSessionId`, timestamps, durée, statut, code de sortie dans le brut JSONL, résultat brut Codex et résultat du relais Runtime.

Écarts :

- l’étape courante n’est pas portée par `ExecutionSession` ;
- les erreurs propagées ne sont pas liées à une session terminale persistée ;
- aucune corrélation `projectId` n’existe dans le `PromptPackage` ou l’`ExecutionSession` ;
- le chemin réel audité ne journalise pas l’`ExecutionSession` dans le repository certifié ;
- une mission en échec ne peut pas être reconstruite de bout en bout à partir des seules preuves conservées.

## 11. Résultats performance

Méthode : chronométrage `performance.now()`, échauffement de 200 passages, données en mémoire, 5 000 itérations par étape, 1 000 passages IntegrationPipeline. Aucun seuil de production n’a été défini.

| Étape | Itérations | Total | Moyenne |
|---|---:|---:|---:|
| MissionContext | 5 000 | 10.473 ms | 0.002095 ms |
| MissionBrief | 5 000 | 11.620 ms | 0.002324 ms |
| PromptComposer | 5 000 | 10.117 ms | 0.002023 ms |
| PromptValidator | 5 000 | 14.849 ms | 0.002970 ms |
| PromptOptimizer | 5 000 | 8.909 ms | 0.001782 ms |
| RuntimeMapper | 5 000 | 0.996 ms | 0.000199 ms |
| IntegrationPipeline sans Codex | 1 000 | 0.706 ms | 0.000706 ms |
| Bout en bout local sans Codex | 5 000 | 57.399 ms | 0.011480 ms |

Exécutions Codex observées : 6 361 ms pour la gate initiale ; 3 373 ms et 3 003 ms pour les deux exécutions parallèles. La consommation mémoire process a montré un delta de -2 858 288 octets entre deux observations ; cette valeur n’est pas une mesure de pic, le GC n’ayant pas été forcé.

Limites : machine unique, prompts minimaux, réseau local du moment, aucun test de charge durable, aucune distribution percentile, aucun seuil SLO.

## 12. Résultats multi-projet

| Capacité | État factuel |
|---|---|
| Multi-projet séquentiel | PARTIAL — Runtime possède des notions de projet, pas la nouvelle chaîne complète |
| Multi-projet concurrent | PARTIAL — deux missions distinctes passent, sans `projectId` de bout en bout |
| Multi-workspace | BLOCKED — aucune allowlist ; chemin arbitraire accepté |
| Orchestration autonome multi-projet | MISSING — priorité, quotas, allocation et capacité non démontrés |

Le moteur ne peut pas être déclaré pleinement multi-projet.

## 13. Risques ouverts

Dix risques ouverts sont détaillés dans le registre : sept P1 et trois P2, sans remédiation dans cet audit. Les risques dominants concernent l’authentification production, les collisions, le workspace arbitraire, le raccord concret au service certifié, le recovery, la provenance Git et la séparation des instructions.

## 14. Prérequis manquants

| Prérequis | Classement |
|---|---|
| Configuration production | MISSING |
| Mécanisme de secrets production | MISSING |
| Authentification Codex production | MISSING |
| Rotation des credentials | MISSING |
| Workspace autorisé/allowlist | MISSING |
| Isolation projet de bout en bout | PARTIAL |
| Journalisation de l’ExecutionSession réelle | MISSING |
| Sauvegarde et restauration opérationnelles | PARTIAL |
| Supervision et alertes | MISSING |
| Arrêt d’urgence | PARTIAL |
| Rollback et reprise documentés | MISSING |
| Ownership et escalade | MISSING |
| Désactivation par Feature Flag | READY |

## 15. Écarts bloquants

1. Authentification production absente.
2. Secrets et rotation non démontrés.
3. Collisions d’identifiants et double exécution acceptées.
4. Workspace arbitraire accepté.
5. Raccord concret au service Runtime certifié non démontré par le cycle réel.
6. Recovery et persistence de l’ExecutionSession réelle incomplets.
7. Composants de la chaîne non suivis par Git.
8. Séparation instructions/données non démontrée.
9. `ProductionReadinessEvaluator` retourne `NOT_READY` et interdit l’activation.

## 16. Décision recommandée

**NO_GO_PRODUCTION**

Gate de sortie recommandée : **PROGRAM_PRODUCTION_NO_GO**.

## 17. Conditions de GO

Sans effectuer de remédiation pendant cet audit, une future certification devra démontrer :

- une identité et une authentification de production ;
- un mécanisme de secrets et de rotation auditable ;
- l’unicité atomique et l’idempotence des identifiants ;
- une allowlist de workspaces avec containment canonique ;
- le raccord réel au service, repository, Human Approval et certifier concrets ;
- une session terminale persistée pour succès et échec ;
- une reprise et un arrêt brutal sans processus ni lock orphelin ;
- une séparation explicite entre instructions et données ;
- une release versionnée, suivie par Git et reproductible ;
- des procédures opérationnelles de supervision, alerte, sauvegarde, rollback et escalade ;
- la réexécution intégrale de cette matrice sans P0/P1 ouvert.

## 18. Preuves et empreintes

Les preuves sont indexées dans `NOVA_PROGRAM_PRODUCTION_EVIDENCE_INDEX.md`.

- Empreinte initiale `git status` : `E7D504B7254000EA8FF8329F485CDB9B952F169047B5C81556F2B8E33FDD246D`
- Empreinte initiale `git diff --binary` : `FB527BC9083D8649DA611B3B5C6C696D9C60DAA3C0A9F9A0FECE68521DE3602D`
- Branche : `feature/nova-core-manager`
- HEAD : `7db9658902adf0496a8f681afbfbd3f19d21d7cc`
- État initial : 21 modifiés, 81 non suivis, 0 supprimé, 0 renommé.

## 19. État Git

Le worktree était déjà sale avant l’audit. Les 15 composants principaux inspectés sont non suivis par Git. Cette situation n’a pas été causée ni corrigée par l’audit, mais elle empêche une certification de provenance depuis HEAD.

La seule modification autorisée par cette mission est la création des cinq rapports de certification. Aucun code, Runtime, Kernel, package, configuration ou fichier existant n’a été modifié. Aucun commit, push ou branche n’a été créé.

## 20. Conclusion

Les capacités MVP locales et READ_ONLY sont démontrées, y compris l’exécution Codex réelle et une concurrence nominale de deux missions. L’aptitude à la production n’est toutefois pas démontrée. Les critères explicites de GO relatifs à l’authentification, aux secrets, à la recovery, à la traçabilité complète, à l’intégrité Git et à l’absence de P1 ouvert ne sont pas satisfaits.

NO_GO_PRODUCTION
