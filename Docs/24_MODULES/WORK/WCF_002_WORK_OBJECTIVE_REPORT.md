# WCF-002 — Authoritative Work Objective

## VERDICT

**GO**

Work Objective existe désormais comme sous-domaine interne, read-only, de la
Capability Runtime Work. Il réutilise exclusivement l'objectif autoritatif
porté par la Mission et ne crée ni endpoint, ni DTO public, ni projection, ni
Read Model UI.

## OBJECTIVE MODEL

Modèle interne : `WorkObjective`.

Fichier :
`server/runtime/work/work-objective.types.ts`.

Le modèle contient exclusivement :

- identité Objective explicitement absente tant qu'aucune source ne la produit ;
- rattachement au Work ;
- libellé autoritatif ;
- description explicitement absente ;
- statut explicitement absent ;
- date de création lorsqu'elle existe dans la Mission ;
- date de mise à jour explicitement absente ;
- provenance Mission.

Le modèle est profondément immuable pour le Work associé et la provenance.
`createWorkObjective` refuse :

- les identifiants vides ;
- les libellés vides ;
- les timestamps invalides ;
- toute provenance autre que `MISSIONS / ORCHESTRATOR_RUNTIME` ;
- toute valeur non nulle injectée dans un champ dont la source est absente.

## OBJECTIVE TYPES

Types créés :

- `WorkObjective` ;
- `WorkObjectiveProvenance` ;
- `WorkObjectiveFailureCode` ;
- `WorkObjectiveFailure`.

Codes d'erreur internes :

- `WOBJ-ERR-001` : modèle ou valeur Objective invalide ;
- `WOBJ-ERR-002` : source non autoritative.

Aucun type HTTP, BFF, Frontend, projection ou DTO public n'a été créé.

## OBJECTIVE QUERY

Query interne : `WorkObjectiveQuery`.

Fichier :
`server/runtime/work/work-objective.query.ts`.

Signature interne utilisée :

```text
get(projectId, workId) → WorkObjective
```

Chaîne :

```text
WorkObjectiveQuery
  ↓
WorkCoreFoundation
  ↓
WorkObjectiveService
  ↓
WorkObjective
```

La Query ne possède aucune dépendance HTTP, BFF, Frontend ou projection. Elle
ne déclenche aucune mutation.

## WORK INTEGRATION

L'intégration à la Capability Work est limitée au barrel interne
`server/runtime/work/work-core.ts`, qui exporte :

- `createWorkObjective` ;
- `WorkObjectiveService` ;
- `WorkObjectiveQuery` ;
- les types et erreurs Objective.

WCF-001 n'a reçu aucun nouveau champ et sa logique n'a pas été modifiée.
Work Objective consomme le Work constitué par WCF-001 ; il ne modifie ni son
identité, ni son lifecycle, ni sa progression.

## AUTHORITATIVE SOURCES

| Donnée | Source |
|---|---|
| Rattachement Work | `WorkCoreAggregate.identity` |
| Libellé Objective | `RuntimeMission.objective` propagé dans l'identité WCF-001 |
| Date de création | `RuntimeMission.createdAt` lorsqu'elle existe |
| Provenance | provenance d'identité WCF-001, domaine `MISSIONS`, producteur `ORCHESTRATOR_RUNTIME` |

Ni le lifecycle Work, ni la progression Monitoring ne sont interprétés comme
un statut Objective. Aucune donnée n'est calculée à partir du Frontend, du BFF,
d'une fixture ou d'un défaut métier.

## FIELDS PROVIDED

| Champ | Disponibilité |
|---|---|
| `work.projectId` | fournie |
| `work.workId` | fournie |
| `label` | fournie par la Mission |
| `createdAt` | fournie si `RuntimeMission.createdAt` existe, sinon `null` |
| `provenance.sourceDomain` | `MISSIONS` |
| `provenance.producer` | `ORCHESTRATOR_RUNTIME` |
| `provenance.sourceId` | identifiant source Mission |
| `provenance.observedAt` | timestamp d'observation autoritatif |

## FIELDS ABSENT

| Champ | Valeur | Motif |
|---|---|---|
| `objectiveId` | `null` | aucun identifiant Objective distinct n'existe |
| `description` | `null` | aucune description distincte du libellé n'existe |
| `status` | `null` | aucun producteur de statut Objective n'existe |
| `updatedAt` | `null` | aucun timestamp de modification Objective n'existe |

Sont également absents du modèle : KPI, priorité, score, IA, recommandation,
planning, échéance, sous-objectif, commentaire et historique.

## FILES CREATED

- `server/runtime/work/work-objective.types.ts`
- `server/runtime/work/work-objective.model.ts`
- `server/runtime/work/work-objective.service.ts`
- `server/runtime/work/work-objective.query.ts`
- `server/runtime/work/work-objective.test.ts`
- `Docs/24_MODULES/WORK/WCF_002_WORK_OBJECTIVE_REPORT.md`

## FILES MODIFIED

- `server/runtime/work/work-core.ts` — exports internes Objective uniquement.

Aucun fichier Frontend, BFF, HOME, Core HTTP, contrat public, Work Activity,
Work Overview ou Session n'a été modifié.

## TESTS

| Contrôle | Résultat |
|---|---|
| Tests WCF-002 ciblés | **8/8 PASS** |
| Suite Runtime existante | **24/24 PASS** |
| Suite Core complète | **506/506 PASS** |
| Création du modèle | PASS |
| Récupération par Query | PASS |
| Rattachement Work | PASS |
| Provenance Mission | PASS |
| Statut absent explicite | PASS |
| Données absentes explicites | PASS |
| Rejet d'une provenance non autoritative | PASS |
| Rejet d'une valeur inventée | PASS |

## TYPECHECK

| Cible | Résultat |
|---|---|
| Runtime | **PASS** |
| Core | **PASS** |

Le typecheck `tsconfig.nova-core.json` couvre conjointement
`server/runtime/work` et `server/nova-core`.

## REGRESSIONS

**AUCUNE RÉGRESSION DÉTECTÉE**

- aucun endpoint HTTP créé ;
- aucun BFF ou Frontend modifié ;
- aucune Capability Decisions, Planning, Deliverables ou Intelligence créée ;
- aucun Read Model ou projection créé ;
- aucune donnée métier inventée ;
- WCF-001 inchangé hors export d'intégration dans son barrel ;
- toutes les validations demandées passent.
