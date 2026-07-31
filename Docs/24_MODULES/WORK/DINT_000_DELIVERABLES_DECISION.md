# DINT-000 — Deliverables Canonical Decision

## 1. Décision

**GO POUR DINT-001**

Une source canonique existante est désignée. DINT-001 devra la réutiliser sans
créer de store, producteur ou agrégat concurrent.

## 2. Source of Truth

### Nom exact

`MissionReport` accepté par
`OrchestratorRuntimeService.submitReport`.

### Collection canonique des sorties produites

`MissionReport.deliverableEvidence`.

### Chemins

- `server/runtime/orchestrator/orchestrator-runtime.types.ts`
- `server/runtime/orchestrator/orchestrator-runtime.service.ts`
- `server/nova-core/nova-core.execution.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.store.ts`

## 3. Sémantique canonique

| Concept | Source | Autorité |
|---|---|---|
| livrable attendu | `RuntimeMission.deliverables` | autoritatif pour l'intention Mission |
| livrable déclaré dans un report | `MissionReport.deliverables` | déclaratif ; ne prouve pas un fichier |
| sortie réellement produite | `MissionReport.deliverableEvidence` | autoritatif après acceptation du report |
| delta technique | `MissionReport.filesChanged` | observation technique, pas identité Deliverable |
| artifact attendu/manquant | `MissionBrief` | préparation, pas production |
| certification | `MissionReport.certificate` et vérifications Nova Core | atteste le report et ses preuves |

Il n'existe donc pas deux sources concurrentes : l'attendu reste dans Mission ;
le produit accepté reste dans le report.

## 4. Pourquoi cette source

Le report accepté :

1. est lié au projet et à la Mission ;
2. est lié au run ;
3. est soumis dans un état Runtime contrôlé ;
4. est rattaché à la Mission par `reportId` ;
5. est persisté et restauré dans le snapshot ;
6. expose les fichiers vérifiés avec chemin, taille et SHA-256 ;
7. est consommé par la validation et la certification ;
8. détecte les dérives après le run.

Aucune fixture, vue, entrée HTTP ou liste de fichiers ne réunit ces garanties.

## 5. Décisions KEEP / MERGE / REFACTOR / REMOVE

### KEEP

- `RuntimeMission.deliverables` comme intention ;
- `RuntimeContext.deliverables` comme transport ;
- `MissionReport` et `deliverableEvidence` comme résultat accepté ;
- `collectDeliverableEvidence` ;
- `submitReport`, `getReport`, snapshot et store ;
- vérification et certification ;
- routes et composants UX existants ;
- `MissionBrief`, `MissionEvidenceBundle` et `filesChanged` dans leurs rôles
  distincts.

### MERGE

- convergence logique des voies manuelle et automatique vers le
  `MissionReport` accepté, sans prétendre qu'elles ont le même niveau de preuve ;
- lecture commune future pour Work Deliverables, Work Overview et Global
  Deliverables.

### REFACTOR

- adapters d'alimentation des trois projections Frontend ;
- séparation explicite entre attendu, déclaré et produit ;
- association en lecture avec Work.

### REMOVE

Après remplacement vérifié uniquement :

- données de `workDeliverablesFixture.ts` ;
- sous-listes Deliverables de `workOverviewFixture.ts` ;
- `globalDeliverablesFixture` et ses statuts déduits.

Aucune suppression n'est réalisée par DINT-000.

## 6. Association Work

WCF-001 établit actuellement :

```text
WorkIdentity.workId = RuntimeMission.missionId
WorkIdentity.projectId = RuntimeMission.projectId
```

La jointure minimale vérifiable est donc :

```text
Work(projectId, workId)
        ↓ workId = missionId
RuntimeMission(projectId, missionId)
        ↓ reportId
MissionReport(projectId, missionId, reportId)
        ↓
deliverableEvidence
```

DINT-001 doit effectuer cette association sans recopier le report et sans
ajouter un `workId` artificiel au producteur historique.

## 7. Contraintes obligatoires de DINT-001

- lecture seule ;
- aucune mutation du report ;
- aucun second repository ;
- aucun champ sans producteur ;
- aucune promotion de `MissionReport.deliverables` en sortie prouvée ;
- aucune promotion de `filesChanged` en Deliverable canonique ;
- absence explicite si `deliverableEvidence` est absent ;
- provenance conservant projet, Mission, report et run ;
- ordre déterministe fondé sur les données existantes, sans priorité métier
  inventée ;
- aucune confiance, readiness, publication, statut, action suivante, owner,
  historique ou score sans source autoritative.

## 8. Prochain lot

**DINT-001 — Work Deliverables Internal Read Integration**

Périmètre minimal recommandé par les preuves :

1. lire Work et sa Mission associée ;
2. lire le `MissionReport` accepté ;
3. exposer en interne les entrées `deliverableEvidence` existantes avec leur
   provenance ;
4. retourner explicitement l'absence de report ou de preuve ;
5. ne créer aucune persistance Deliverables.

Le raccordement HTTP, BFF et Frontend n'appartient pas à cette décision et doit
rester un lot ultérieur explicitement borné.

## 9. Condition de blocage

DINT-001 doit être `NO GO` si son implémentation exige :

- une nouvelle donnée métier ;
- une identité Deliverable inventée ;
- une copie persistée du report ;
- l'assimilation d'un libellé attendu à un résultat produit ;
- la reconstruction des champs présents uniquement dans les fixtures.

## 10. Régression

Aucun code ni document existant n'a été modifié. Cette décision formalise
uniquement la réutilisation du patrimoine actif.
