# DINT-000 — Deliverables Reconciliation Matrix

## 1. Règles de lecture

- Chaque ligne porte exactement un statut de la taxonomie DINT-000.
- `KEEP`, `MERGE`, `REFACTOR` et `REMOVE` sont des décisions d'architecture,
  pas des mutations réalisées par cet audit.
- `Produit` décrit la donnée émise ; `Consomme` décrit ses entrées.

## 2. Matrice de réconciliation

| ID | Implémentation | Chemin exact | Module | Responsabilité | Produit | Consomme | Lecture / écriture | Cycle / nature | Statut | Décision | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D-001 | `MissionDefinition.deliverables` / `RuntimeMission.deliverables` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Orchestrator Runtime | Déclarer les livrables attendus d'une Mission | libellés attendus | requête de création Mission | écriture à la création, lecture ensuite | intention Mission active | `PRODUCER` | `KEEP` | conserve l'attendu, jamais le produit | P0 |
| D-002 | `validateMissionDefinition` | `server/nova-core/nova-core.http.ts` | Nova Core HTTP | Valider l'entrée Mission et sa liste | `MissionDefinition` validée | corps HTTP | lecture / validation | intake actif | `SERVICE` | `KEEP` | frontière d'entrée | P1 |
| D-003 | `RuntimeContext.deliverables` / `buildContext` | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | Propager l'attendu vers l'exécution | copie des libellés attendus | `RuntimeMission` | écriture de contexte, lecture exécution | transport actif | `SECONDARY` | `KEEP` | aucune autorité autonome | P1 |
| D-004 | `NovaCoreOfficialReport.OutputEvidence` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | Déclarer les preuves annoncées par le rapport officiel | entrées chemin/hash/statut | rapport officiel Codex | lecture | entrée de production active | `SECONDARY` | `KEEP` | doit être vérifiée avant autorité | P0 |
| D-005 | `collectDeliverableEvidence` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | Croiser delta Git, rapport et fichiers ; vérifier chemin/hash ; lier au run | `MissionReport.deliverableEvidence` | Git, `OutputEvidence`, filesystem, `runId` | lecture filesystem, production mémoire | producteur automatique actif | `PRODUCER` | `KEEP` | producteur des preuves réelles | P0 |
| D-006 | `MissionReport` accepté, dont `deliverableEvidence` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Orchestrator Runtime | Agréger le résultat accepté d'une Mission et ses preuves de sortie | report lié Mission/run | moteur ou soumission manuelle | lecture / écriture Runtime | résultat de Mission actif | `AUTHORITATIVE` | `KEEP` | source de vérité unique | P0 |
| D-007 | `OrchestratorRuntimeService.submitReport` / `getReport` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | Accepter, rattacher, stocker et relire le report | report accepté, événement `ReportSubmitted` | `MissionReport`, état Mission | écriture / lecture | service Runtime actif | `SERVICE` | `KEEP` | point d'acceptation canonique | P0 |
| D-008 | `RuntimeSnapshot.reports` | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | Porter la projection persistable des reports | collection de reports | store Runtime | lecture / écriture | snapshot actif | `AGGREGATE` | `KEEP` | durabilité de la source | P0 |
| D-009 | `JsonRuntimeSnapshotStore` | `server/nova-core/nova-core.store.ts` | Nova Core Persistence | Persister, attester, charger et restaurer le snapshot | enveloppe Runtime persistée | `RuntimeSnapshot` | lecture / écriture disque | persistance active | `SERVICE` | `KEEP` | intégrité et reprise | P0 |
| D-010 | `EvidenceSubmission` / `validateEvidenceRequest` | `server/nova-core/nova-core.types.ts`; `server/nova-core/nova-core.http.ts` | Nova Core HTTP | Recevoir une preuve déclarative manuelle | entrée validée | corps HTTP | lecture / validation | voie manuelle active | `PRODUCER` | `KEEP` | preuve moins forte, à qualifier | P1 |
| D-011 | `NovaCoreService.submitEvidence` | `server/nova-core/nova-core.service.ts` | Nova Core | Transformer la soumission manuelle en report accepté | `MissionReport` sans preuve fichier automatique | `EvidenceSubmission` | écriture Runtime | voie manuelle active | `SERVICE` | `MERGE` | convergence sémantique vers report accepté | P1 |
| D-012 | `NovaCoreExecutionEngine` / `mapOfficialReportToMissionReport` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | Produire le report automatique lié au run | `MissionReport` avec binding et preuves | Mission, rapport officiel, Git | lecture / production | moteur actif | `ENGINE` | `KEEP` | voie probante principale | P0 |
| D-013 | validation et certification Deliverables | `server/nova-core/nova-core.service.ts` | Nova Core Certification | Refuser preuve absente, hors dépôt, autre run ou dérivée | décision technique / certificat | report, fichiers, hash, binding | lecture | règle active | `RULE_ENGINE` | `KEEP` | garantit l'intégrité | P0 |
| D-014 | réponse GET Mission | `server/nova-core/nova-core.http.ts` | Nova Core HTTP | Exposer Mission, report et événements | vue technique Mission | `NovaCoreService` | lecture | API active | `READMODEL` | `KEEP` | exposition brute, non Work | P1 |
| D-015 | `MissionEvidenceCertifier` / `MissionEvidenceBundle` | `server/nova-core/mission-evidence-certifier.ts` | Nova Core Integration | Certifier des preuves génériques de pipeline | bundle et rapport de certification | evidence générique, missing artifacts | lecture / écriture repository optionnelle | moteur distinct, feature flag | `ENGINE` | `KEEP` | consommateur connexe, pas source Deliverables | P2 |
| D-016 | `MissionPackageBrief.expectedArtifacts` / `missingArtifacts` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | Porter les artefacts attendus ou manquants avant exécution | brief préparatoire | contexte et knowledge resolvers | lecture / production mémoire | préparation distincte | `SECONDARY` | `KEEP` | ne pas fusionner avec les sorties | P2 |
| D-017 | prompt, gate et pipeline des artifacts | `server/nova-core/prompt-composer.ts`; `server/nova-core/prompt-validator.ts`; `server/nova-core/runtime-execution-gate.ts`; `server/nova-core/mission-pipeline.ts` | Mission Preparation | Consommer les artifacts attendus/manquants | prompts, gates, préparation | `MissionBrief` | lecture | consommateurs actifs | `CONSUMER` | `KEEP` | périmètre préparatoire | P2 |
| D-018 | cockpit Core legacy | `server/nova-core/public/index.html` | Nova Core Cockpit | Saisir Mission/Evidence et afficher le report | requêtes et vue technique | API Nova Core | lecture / écriture HTTP | UI legacy active | `PROJECTION` | `KEEP` | aucune autorité propre | P2 |
| D-019 | `WorkDeliverablesFixture` | `apps/nova-web/src/features/work/workDeliverablesFixture.ts` | Frontend Work | Simuler cartes, confiance, publication, alertes et détails | données UX fictives | constantes locales | lecture seule | fixture active | `DUPLICATE` | `REMOVE` | seconde vérité silencieuse | P0 |
| D-020 | `WorkDeliverablesPage` | `apps/nova-web/src/features/work/WorkDeliverablesPage.tsx` | Frontend Work | Afficher liste, états et drawer Deliverables | rendu UX | fixture Work | lecture ; actions sans Runtime | projection active | `PROJECTION` | `REFACTOR` | conserver UI, remplacer source | P1 |
| D-021 | branche `work.deliverables` de `WorkSurface` | `apps/nova-web/src/components/routes/WorkSurface.tsx` | Frontend Routing | Sélectionner la fixture par `workId` | props de page | `getWorkDeliverablesFixture` | lecture | adapter fixture actif | `CONSUMER` | `REFACTOR` | futur point de raccordement | P1 |
| D-022 | sous-liste `WorkOverviewFixture.deliverables` | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Frontend Work | Simuler un résumé de livrables | id, titre, confiance fictifs | constantes locales | lecture seule | fixture active | `DUPLICATE` | `MERGE` | projection à dériver de la même lecture | P1 |
| D-023 | section Deliverables de `WorkOverviewPage` | `apps/nova-web/src/features/work/WorkOverviewPage.tsx` | Frontend Work | Afficher le résumé et le compteur | rendu UX | fixture Overview | lecture | projection active | `PROJECTION` | `REFACTOR` | aucune source Runtime | P2 |
| D-024 | `globalDeliverablesFixture` | `apps/nova-web/src/components/routes/globalRouteFixtures.ts` | Frontend Global | Dériver une liste globale et inventer un statut selon l'index | métadonnées et statuts fictifs | fixture Work | lecture / dérivation | fixture active | `DUPLICATE` | `REMOVE` | dérivation non autoritative | P0 |
| D-025 | `DeliverablesSurface` | `apps/nova-web/src/components/routes/DeliverablesSurface.tsx` | Frontend Global | Filtrer et afficher les livrables globaux | rendu UX et actions no-op | fixture globale | lecture / état local | projection active | `PROJECTION` | `REFACTOR` | conserver surface, remplacer source | P2 |
| D-026 | routes Deliverables | `apps/nova-web/src/routes/RouteDefinition.ts`; `apps/nova-web/src/routes/RouteRegistry.ts`; `apps/nova-web/src/components/routes/RouteSurface.tsx` | Frontend Routing | Déclarer `/deliverables` et `/work/:workId/deliverables` | navigation | registre de routes | lecture | infrastructure active | `CONSUMER` | `KEEP` | points d'entrée existants | P2 |
| D-027 | migration de snapshot Runtime | `server/nova-core/runtime-migration.ts` | Nova Core Persistence | Normaliser et préserver missions/reports lors des migrations | snapshot courant | anciennes enveloppes Runtime | lecture / écriture migration | support actif | `SERVICE` | `KEEP` | pas une source autonome | P2 |

## 3. Couverture par rôle

| Rôle recherché | Résultat |
|---|---|
| Producteurs | Mission intake, exécution automatique, soumission manuelle |
| Consommateurs | Runtime, validation, certification, API, cockpit, Frontend |
| Projections | API Mission brute, cockpit, Work Deliverables, Work Overview, Global Deliverables |
| Read Models dédiés | aucun |
| Services dédiés Deliverables | aucun |
| Repository dédié | aucun |
| Aggregate dédié | aucun ; le `MissionReport` porte aujourd'hui le résultat |
| Workflow dédié | aucun ; cycle porté par Mission |
| Engine dédié | aucun ; moteur d'exécution Nova Core réutilisé |
| Rule engine dédié | aucun ; règles réparties entre Orchestrator et certification |

## 4. Décision de source

La ligne **D-006** est l'unique `AUTHORITATIVE`.

Les lignes D-001 à D-004 décrivent l'attendu ou une déclaration à vérifier.
Les lignes D-005, D-007 à D-013 produisent, acceptent, persistent ou contrôlent
la source. Les lignes D-014 à D-027 sont des expositions, consommateurs,
projections ou doublons.
