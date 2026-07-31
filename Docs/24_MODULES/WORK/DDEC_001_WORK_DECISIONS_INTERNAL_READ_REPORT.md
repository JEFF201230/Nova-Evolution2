# DDEC-001 — Work Decisions Internal Read Report

## 1. Verdict

**GO**

Work Decisions est disponible comme capacité interne, read-only et immuable du
module Work Runtime. La query lit le read model canonique
`HumanApprovalWorkflow.history` et n'expose que les décisions humaines issues
des records `HUMAN_APPROVAL`.

Aucun producteur, workflow, endpoint, contrat HTTP, BFF, Frontend, cache,
repository, snapshot, migration ou format persistant n'a été ajouté ou
modifié.

## 2. Source autoritative utilisée

### Modèle

`HumanApprovalDecision`

### Producteur canonique existant

`HumanApprovalWorkflow.decide`

### Persistance canonique existante

```text
IntegrationPersistedRecord
kind = "HUMAN_APPROVAL"
payload = HumanApprovalDecision
```

### Read model existant

`HumanApprovalWorkflow.history(missionId, runId)`

DDEC-001 ne lit ni `ProgramRuntimeOrchestrator`, ni
`NovaIntegrationService`, ni une certification, ni une fixture comme source
de décision.

## 3. Chaîne de lecture exacte

```text
WorkDecisionsQuery.get(projectId, workId)
        ↓
WorkCoreFoundation.load(projectId, workId)
        ↓
WorkIdentity.mission
        ↓
WorkProgression.provenance.runId
        ↓
HumanApprovalWorkflow.history(missionId, runId)
        ↓
IntegrationPersistedRecord(kind = "HUMAN_APPROVAL")
        ↓
HumanApprovalDecision[]
        ↓
WorkDecisionsService
        ↓
WorkDecisions immuable
```

La query ne contourne pas le workflow et n'accède pas directement au
repository.

## 4. Clé Work / Mission / Decision

La relation utilise exclusivement les identités établies par WCF-001 :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId    = RuntimeMission.missionId
WorkIdentity.mission   = { projectId, missionId }
```

Le Run est celui de la progression autoritative WCF-001 :

```text
WorkProgression.provenance.runId
  = RuntimeObservabilityEvent.runId sélectionné par WCF-001
```

Le rattachement d'une décision est ensuite vérifié par :

```text
HumanApprovalDecision.request.missionId
  = WorkIdentity.mission.missionId

HumanApprovalDecision.request.runId
  = WorkProgression.provenance.runId
```

`projectId` n'est pas ajouté au record historique. La query part du Work
chargé par `(projectId, workId)`, puis utilise sa Mission et son Run. Aucune
jointure par date, texte, statut, proximité ou identifiant calculé n'est
réalisée.

Si le Run WCF-001 est `null`, aucun appel à `history` n'est effectué et la
collection est vide.

## 5. Ordre canonique

`HumanApprovalWorkflow.history` :

1. appelle `IntegrationRuntimeRepository.readAll` ;
2. conserve l'ordre du journal ;
3. filtre par `kind`, `missionId` et `runId` ;
4. applique `map` sans tri.

DDEC-001 préserve strictement la collection retournée. Aucun tri par date,
statut, acteur, valeur ou identifiant n'est exécuté. Aucune décision
« courante » ou « principale » n'est sélectionnée.

Un test fournit volontairement `DECISION-Z` avant `DECISION-A`, avec des dates
en ordre inverse, et confirme que cet ordre reste inchangé.

## 6. Query interne

```ts
WorkDecisionsQuery.get(
  projectId: string,
  workId: string,
): Promise<WorkDecisions>
```

La query est asynchrone uniquement parce que le read model existant
`HumanApprovalWorkflow.history` est asynchrone.

Son constructeur reçoit :

- un `WorkCoreSource` ;
- un `Pick<HumanApprovalWorkflow, "history">` ;
- le service interne, injectable selon la convention du module Work.

## 7. Contrat interne

```ts
interface WorkDecisions {
  projectId: string;
  workId: string;
  decisions: readonly HumanApprovalDecision[];
  provenance: WorkDecisionsProvenance;
}
```

Le contrat est interne au Runtime et ne constitue ni un DTO HTTP, ni un contrat
BFF, ni une projection UI.

## 8. Champs réellement exposés

Chaque élément de `decisions` conserve exactement les champs persistés du
modèle canonique :

- `decisionId` ;
- `request` :
  - `requestId` ;
  - `missionId` ;
  - `runId` ;
  - `requestedBy` ;
  - `requiredRole` ;
  - `requestedAt` ;
  - `bundleFingerprint` ;
  - `technicalDecision` ;
- `identity` :
  - `subjectId` ;
  - `roles` ;
  - `identityContextStatus` ;
  - `productionAuthenticationStatus` ;
- `decision` ;
- `justification` ;
- `decidedAt` ;
- `bundleFingerprint`.

`decisionId` n'est jamais créé par DDEC-001 : il est recopié exclusivement
depuis `HumanApprovalDecision`. Une décision sans ce champ est rejetée.

## 9. Champs volontairement absents

DDEC-001 n'expose et ne fabrique aucun des champs suivants :

- `title` ;
- `label` ;
- `reason` ;
- `comment` ;
- `actorName` ;
- `actorDisplayName` ;
- `dueDate` ;
- `priority` ;
- `confidence` ;
- `category` ;
- `businessImpact` ;
- `certificationStatus` ;
- `validationStatus` ;
- métadonnée métier ;
- statut UX ;
- décision principale ;
- recommandation ;
- impact d'acceptation ou de rejet.

Le seul texte de motif exposé est `justification`, parce qu'il appartient au
modèle canonique. Il n'est pas renommé en `reason` ou `comment`.

## 10. Règle de filtrage

Le filtrage est conservé dans son propriétaire existant :

```ts
record.kind === "HUMAN_APPROVAL"
&& record.missionId === missionId
&& record.runId === runId
```

Cette règle est exécutée par `HumanApprovalWorkflow.history`. DDEC-001 ne
duplique pas le filtrage dans un second repository ou workflow.

Le test d'intégration utilise le vrai workflow sur un repository contenant :

1. un record `SESSION` ;
2. un record `HUMAN_APPROVAL`.

Seule la décision du second record est retournée.

## 11. Provenance

La provenance réutilise la base `WorkProvenance` de WCF-001 et l'étend
uniquement avec les références nécessaires :

- `sourceDomain: "MISSIONS"` ;
- `producer: "HUMAN_APPROVAL_WORKFLOW"` ;
- `sourceId: projectId/missionId/runId`, ou `projectId/missionId` sans Run ;
- `observedAt` provenant de l'observation WCF-001 qui porte le Run ;
- `missionId` ;
- `runId` ;
- `historySource: "HumanApprovalWorkflow.history"` ;
- `persistenceSource: "IntegrationPersistedRecord"` ;
- `recordKind: "HUMAN_APPROVAL"` ;
- `workBindingSource: "WCF-001"`.

`observedAt` n'est pas utilisé pour trier ou désigner une décision. Chaque
décision conserve son propre `decidedAt`.

## 12. Gestion des cas

| Cas | Comportement |
|---|---|
| Work inconnu | `WorkCoreFailure` canonique `WCF-ERR-001` |
| Work sans Mission constituable | même erreur canonique WCF-001 |
| Work sans Run autoritatif | collection vide, aucun appel à `history` |
| Mission/Run sans historique | collection vide |
| historique avec d'autres kinds | exclus par `HumanApprovalWorkflow.history` |
| une décision | champs canoniques exacts et immuables |
| plusieurs décisions | toutes retournées dans l'ordre de `history` |
| décision incomplète | rejet `WDEC-ERR-001`, aucun champ fabriqué |
| Mission ou Run incohérent | rejet `WDEC-ERR-002` |

La relation WCF-001 ne permet pas plusieurs Missions pour un même Work : le
`workId` est le `missionId`. Aucun choix arbitraire n'est effectué.

## 13. Immutabilité et absence d'écriture

Le modèle retourne des objets gelés à tous les niveaux :

- réponse ;
- collection ;
- décision ;
- request ;
- identity ;
- rôles ;
- provenance.

Le test d'intégration compare `IntegrationRuntimeRepository.readAll()` avant
et après la query. Les deux snapshots logiques sont strictement identiques.

Les seules écritures du test servent à préparer le repository temporaire avant
l'appel. Aucun module DDEC-001 de production n'importe ni n'appelle
`append`, `save`, `writeFile`, `submitReport`, `decide` ou `applyDecision`.

## 14. Fichiers créés

- `server/runtime/work/work-decisions.types.ts`
- `server/runtime/work/work-decisions.model.ts`
- `server/runtime/work/work-decisions.service.ts`
- `server/runtime/work/work-decisions.query.ts`
- `server/runtime/work/work-decisions.test.ts`
- `Docs/24_MODULES/WORK/DDEC_001_WORK_DECISIONS_INTERNAL_READ_REPORT.md`

## 15. Fichiers modifiés

- `server/runtime/work/work-core.ts`
  - ajout exclusif des exports internes Work Decisions.

Aucun autre fichier n'a été modifié par DDEC-001.

## 16. Tests

### DDEC-001 ciblé

```text
node --import tsx --test server/runtime/work/work-decisions.test.ts
```

Résultat : **10/10 PASS**.

Couverture :

- Work inconnu ;
- Work sans Mission ;
- Work sans Run ;
- Mission/Run sans historique ;
- une décision ;
- plusieurs décisions ;
- ordre canonique ;
- filtrage des autres kinds avec le vrai workflow ;
- champs exacts et champs absents ;
- décision incomplète ;
- incohérence Mission/Run ;
- rattachement projet/Work/Mission/Run ;
- provenance ;
- immutabilité ;
- absence d'écriture persistante.

### Module Work

```text
node --import tsx --test server/runtime/work/*.test.ts
```

Résultat : **35/35 PASS**.

### Runtime

```text
npm.cmd run test:runtime
```

Résultat : **24/24 PASS**.

### Core

```text
npm.cmd run test:core
```

Résultat : **506/506 PASS**.

## 17. Typecheck et contrôles

### Typecheck Runtime/Core

```text
npm.cmd run typecheck:nova-core
```

Résultat final : **PASS**.

La première exécution ciblée avait déjà 10/10 tests PASS, mais le typecheck a
détecté une phase Monitoring `WAITING` absente du vocabulaire Runtime dans la
nouvelle fixture de test. Cette valeur a été remplacée par la phase canonique
existante `VALIDATING`. Aucun fichier de production ou contrat n'a été touché
par cette correction.

### Diff check

```text
git diff --check
```

Résultat : **PASS**.

Les nouveaux fichiers, non suivis dans l'index Git courant, ont également été
contrôlés directement : **0 ligne avec espace terminal**.

### Frontières

Contrôle des imports de production : **PASS**.

- aucun import Frontend ;
- aucun import BFF ;
- aucune fixture ;
- aucune API ;
- aucune primitive d'écriture ;
- aucune modification du workflow ou du repository.

Les mentions `apps/nova-web` et `server/nova-bff` dans le test appartiennent
uniquement au scope interdit de la Mission de test.

## 18. Régressions

**Aucune régression détectée.**

- DDEC-001 ciblé : PASS ;
- WCF-001, WCF-002 et DINT-001 : PASS dans les 35 tests Work ;
- Runtime : PASS ;
- Core : PASS ;
- typecheck : PASS ;
- diff et whitespace : PASS ;
- aucun Frontend ou BFF modifié ;
- aucun producteur, workflow ou format persistant modifié.

Le worktree contenait avant DDEC-001 de nombreux changements non liés,
notamment le module Work existant non suivi dans l'index Git. Ils ont été
préservés.

## 19. Décision finale

**GO**

Work Decisions lit réellement `HumanApprovalWorkflow.history`, préserve son
ordre, n'expose que les décisions humaines persistées sous
`kind = "HUMAN_APPROVAL"` et n'introduit aucune seconde source de vérité.

## 20. Next step

Aucun autre lot n'est lancé automatiquement.

Un futur lot séparé pourra auditer l'exposition read-only de
`WorkDecisionsQuery`. Il devra conserver le contrat interne exact, tenir compte
du fait que Human Approval n'est pas composé dans l'entrypoint de production
autonome et ne pourra ajouter aucun champ UX sans producteur autoritatif.
