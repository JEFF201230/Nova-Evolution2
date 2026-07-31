# DINT-001 — Work Deliverables Internal Read Report

## 1. Verdict

**GO**

Work Deliverables est disponible comme lecture interne, read-only et immuable
du module Work Runtime. La capacité consomme le `MissionReport` déjà sélectionné
par l'Orchestrator et normalise exclusivement
`MissionReport.deliverableEvidence`.

Aucun producteur, endpoint, contrat HTTP, BFF, Frontend, cache, repository,
snapshot, migration ou structure persistée n'a été ajouté ou modifié.

## 2. Source autoritative utilisée

### Agrégat

`MissionReport`

### Collection

`MissionReport.deliverableEvidence`

### Entrée canonique existante

`OrchestratorRuntimeService.submitReport`

### Accès read-only existant

`OrchestratorRuntimeService.getReport(projectId, missionId)`

La query DINT-001 ne lit ni `MissionReport.deliverables`, ni `filesChanged`
comme livrables produits.

## 3. Chaîne de lecture exacte

```text
WorkDeliverablesQuery.get(projectId, workId)
        ↓
WorkCoreFoundation.load(projectId, workId)
        ↓
WorkIdentity.mission
        ↓
WorkDeliverablesSource.getReport(projectId, missionId)
        ↓
RuntimeMission.reportId
        ↓
MissionReport
        ↓
MissionReport.deliverableEvidence
        ↓
WorkDeliverablesService
        ↓
WorkDeliverables immuable
```

## 4. Relation Work → Mission

La relation WCF-001 est conservée sans adaptation :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId    = RuntimeMission.missionId
WorkIdentity.mission   = { projectId, missionId }
```

La query reçoit `projectId` et `workId`, constitue le Work par
`WorkCoreFoundation`, puis utilise exclusivement la Mission portée par
`WorkIdentity.mission`.

Un Work détaché d'une Mission n'est pas un état représentable par WCF-001.
Une source Mission `undefined` ou `null` propage donc le comportement Work
canonique `WorkCoreFailure` / `WCF-ERR-001`; aucun format d'erreur DINT
concurrent n'est utilisé pour ce cas.

## 5. Règle de sélection du report

La règle existante est univoque :

1. `RuntimeMission` porte un seul `reportId: string | null` ;
2. `OrchestratorRuntimeService.submitReport` stocke le report, puis assigne son
   identifiant à `mission.reportId` ;
3. l'acceptation fait sortir la Mission de l'état `RUNNING` ;
4. un second `submitReport` est alors refusé par la machine d'état ;
5. `getReport(projectId, missionId)` ne parcourt pas la collection et ne trie
   rien : il résout exclusivement le `reportId` porté par la Mission.

DINT-001 délègue cette règle à `getReport`. Il ne choisit ni le premier, ni le
dernier, ni le plus récent, ni le report certifié.

Un test avec le Runtime réel vérifie qu'un second report est refusé et que la
query lit le report désigné par `RuntimeMission.reportId`.

## 6. Contrat interne

### Query

```ts
WorkDeliverablesQuery.get(
  projectId: string,
  workId: string,
): WorkDeliverables
```

### Réponse

```ts
interface WorkDeliverables {
  projectId: string;
  workId: string;
  missionId: string;
  deliverables: readonly WorkDeliverable[];
  provenance: WorkDeliverablesProvenance;
}
```

### Champs par livrable

Les seuls champs exposés sont les champs existants de
`MissionReport.deliverableEvidence` :

- `path` ;
- `size` ;
- `sha256` ;
- `modifiedAt` ;
- `runId`.

L'ordre de la collection persistée est conservé. Aucun tri n'est exécuté.

## 7. Champs volontairement absents

DINT-001 n'expose et ne fabrique aucun des champs suivants :

- `deliverableId` ;
- `title` ;
- `description` ;
- `type` ;
- `status` ;
- `version` ;
- `owner` ;
- `dueDate` ;
- `completedAt` ;
- `validationStatus` ;
- `certificationStatus` ;
- `downloadUrl` ;
- `attachmentUrl` ;
- métadonnée métier ;
- confiance ;
- readiness ;
- publication ;
- priorité ;
- prochaine action.

Aucune valeur n'est dérivée du nom de fichier, d'un timestamp technique, de
`filesChanged`, d'un composant React ou d'une fixture.

## 8. Provenance

La provenance réutilise la forme de base `WorkProvenance` de WCF-001 et
l'étend uniquement avec les références nécessaires à la source :

- `sourceDomain: "MISSIONS"` ;
- `producer: "ORCHESTRATOR_RUNTIME"` ;
- `sourceId` ;
- `observedAt` ;
- `missionId` ;
- `reportId` ;
- `runId` ;
- `evidenceSource: "MissionReport.deliverableEvidence"`.

Avec report, `sourceId` identifie `projectId/missionId/reportId` et
`observedAt` reprend `MissionReport.submittedAt`.

Sans report, `reportId` et `runId` sont `null`; la provenance conserve la
Mission demandée et l'observation WCF-001. Aucune provenance fictive de report
n'est créée.

## 9. Gestion des cas vides

| Cas | Comportement |
|---|---|
| Work inconnu | `WorkCoreFailure` canonique `WCF-ERR-001` |
| Work détaché de Mission | état impossible sous WCF-001 ; même erreur canonique |
| Mission sans `reportId` / sans report sélectionné | collection vide |
| `MissionReport` sans `deliverableEvidence` | collection vide |
| `deliverableEvidence: []` | collection vide |
| un élément | élément normalisé sans enrichissement |
| plusieurs éléments | ordre source conservé |
| report d'une autre Mission | rejet `WDEL-ERR-002` |
| preuve liée à un autre run que le report | rejet `WDEL-ERR-002` |

## 10. Conventions WCF réutilisées

- fichiers `types`, `model`, `service`, `query`, `test` dans
  `server/runtime/work/` ;
- export unique par `work-core.ts` ;
- query synchrone interne `get(projectId, workId)` ;
- `WorkCoreFoundation` comme constitution canonique du Work ;
- contrats read-only et objets profondément gelés ;
- source port injectée ;
- provenance fondée sur `WorkProvenance` ;
- erreurs codifiées de domaine pour les incohérences propres au modèle ;
- propagation de `WorkCoreFailure` pour un Work indisponible ;
- absence de dépendance HTTP, BFF, Frontend ou projection.

## 11. Fichiers créés

- `server/runtime/work/work-deliverables.types.ts`
- `server/runtime/work/work-deliverables.model.ts`
- `server/runtime/work/work-deliverables.service.ts`
- `server/runtime/work/work-deliverables.query.ts`
- `server/runtime/work/work-deliverables.test.ts`
- `Docs/24_MODULES/WORK/DINT_001_WORK_DELIVERABLES_INTERNAL_READ_REPORT.md`

## 12. Fichiers modifiés

- `server/runtime/work/work-core.ts`
  - ajout exclusif des exports internes Work Deliverables.

Aucun autre fichier n'a été modifié par DINT-001.

## 13. Preuves d'absence de nouvelle source

- aucun repository Work Deliverables ;
- aucune persistance ;
- aucun cache ;
- aucune mutation de `MissionReport` ;
- aucune mutation de `RuntimeMission` ;
- aucune modification de `submitReport` ou `getReport` ;
- aucune structure de snapshot ;
- aucun producteur ;
- aucune API ;
- aucun import Frontend, BFF ou fixture ;
- snapshot Runtime strictement identique avant et après la query dans le test
  d'intégration ciblé.

## 14. Tests

### DINT-001 ciblé

Commande :

```text
node --import tsx --test server/runtime/work/work-deliverables.test.ts
```

Résultat : **8/8 PASS**.

Couverture :

- Work inconnu ;
- Work sans Mission constituable ;
- Mission sans report ;
- report sans `deliverableEvidence` ;
- un livrable ;
- plusieurs livrables ;
- ordre persistant ;
- champs exacts et champs absents ;
- rattachement projet/Work/Mission ;
- provenance ;
- immutabilité ;
- sélection par `RuntimeMission.reportId` ;
- rejet d'un second report ;
- absence d'écriture persistante.

### Régression Work

Commande :

```text
node --import tsx --test \
  server/runtime/work/work-core-foundation.test.ts \
  server/runtime/work/work-objective.test.ts \
  server/runtime/work/work-deliverables.test.ts
```

Résultat : **25/25 PASS**.

### Runtime

Commande :

```text
npm.cmd run test:runtime
```

Résultat : **24/24 PASS**.

### Core

Commande :

```text
npm.cmd run test:core
```

Résultat : **506/506 PASS**.

## 15. Typecheck et contrôles

### Typecheck Runtime/Core

Commande :

```text
npm.cmd run typecheck:nova-core
```

Résultat : **PASS**.

Une première exécution a détecté dans le nouveau test une phase Monitoring
`SUBMITTED`, absente du vocabulaire canonique. Le test a été corrigé pour
utiliser `COMPLETED`; la relance est PASS. Cette correction n'a touché aucun
producteur.

### Diff check

Commande :

```text
git diff --check
```

Résultat : **PASS**.

Les nouveaux fichiers, non suivis dans l'index Git courant, ont également été
contrôlés directement : **0 ligne avec espace terminal**.

### Frontières

Contrôle des imports : **PASS**.

Les seules mentions de `apps/nova-web` et `server/nova-bff` figurent dans le
scope interdit de la fixture de test Runtime. Aucun module de production ne
les importe.

## 16. Régressions

**Aucune régression détectée.**

- DINT-001 ciblé : PASS ;
- WCF-001/WCF-002 : PASS ;
- Runtime : PASS ;
- Core : PASS ;
- typecheck : PASS ;
- diff/whitespace : PASS ;
- aucun fichier Frontend ou BFF modifié ;
- aucun producteur ou format persistant modifié.

Le worktree contenait avant DINT-001 des modifications non liées dans
`server/nova-core/nova-core.execution.ts` et
`server/nova-core/nova-core.service.ts`. Elles ont été préservées et n'ont pas
été touchées par ce lot.

## 17. Décision finale

**GO**

Work Deliverables lit réellement
`MissionReport.deliverableEvidence` à travers la règle de sélection canonique
du Runtime. La capacité est interne, read-only, sans donnée inventée et sans
seconde source de vérité.

## 18. Next step

Aucune autre implémentation n'est lancée automatiquement.

Le prochain arbitrage peut borner séparément une éventuelle exposition
read-only vers API/BFF/Frontend. Ce futur lot devra consommer
`WorkDeliverablesQuery` sans ajouter de champ ni de persistance.
