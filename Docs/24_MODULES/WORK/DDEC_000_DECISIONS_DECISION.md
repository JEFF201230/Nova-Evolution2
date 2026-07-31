# DDEC-000 — Decisions Canonical Decision

## 1. Décision

**GO POUR DDEC-001**

Une source métier autoritative unique est désignée pour les décisions
d'approbation réutilisables par Work.

## 2. Source of Truth

### Nom exact

`HumanApprovalDecision`

### Point de production

`HumanApprovalWorkflow.decide`

### Persistance canonique

`IntegrationPersistedRecord` avec :

```text
kind = "HUMAN_APPROVAL"
payload = HumanApprovalDecision
```

persisté par `IntegrationRuntimeRepository`.

### Chemins exacts

- `server/nova-core/human-approval-workflow.ts`
- `server/nova-core/integration-runtime-repository.ts`

## 3. Justification technique

La source retenue :

1. porte un identifiant de décision ;
2. est liée à une Mission et un Run ;
3. conserve l'identité et le rôle du décideur ;
4. interdit l'auto-approbation ;
5. vérifie l'intégrité du bundle technique GO ;
6. conserve la justification et l'instant ;
7. est immuable ;
8. est persistée dans un journal append-only ;
9. est relisible après persistance ;
10. rejette les collisions d'identifiant incompatibles.

Aucune fixture, projection, gate, certification ou record Governance ne réunit
ces garanties pour le périmètre Work Decisions.

## 4. Justification métier

La décision canonique représente le choix explicite d'une autorité humaine
entre :

- `APPROVED` ;
- `REJECTED` ;
- `CHANGES_REQUESTED` ;
- `BLOCKED`.

Elle intervient après validation technique et commande l'évolution de la
Mission. Le flux est hybride, mais l'acte métier est humain.

## 5. Association Work

WCF-001 établit :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId = RuntimeMission.missionId
```

L'association future est :

```text
Work(projectId, workId)
  -> Mission(projectId, missionId = workId)
  -> Run
  -> HUMAN_APPROVAL records(missionId, runId)
```

Le record ne contient pas `projectId`. La jointure doit donc partir du Work
autoritatif et ne jamais être réalisée directement depuis une valeur UI.

## 6. Règle de multiplicité

Plusieurs décisions pour un même couple Mission/Run sont supportées et
persistées dans l'ordre.

La source canonique est **l'historique complet**.

Ne sont pas autorisées sans décision normative supplémentaire :

- sélection du premier record ;
- sélection du dernier record ;
- promotion de `readLatest` en décision principale ;
- préférence pour `APPROVED` ;
- préférence pour une décision certifiée ;
- écrasement d'une décision antérieure.

## 7. Frontières conservées

### KEEP

- `HumanApprovalDecision` ;
- `HumanApprovalWorkflow` ;
- `IntegrationRuntimeRepository` ;
- `NovaIntegrationService` ;
- `ProgramRuntimeOrchestrator` ;
- certification technique ;
- certificat Runtime ;
- workflows Governance ;
- gates et décisions kernel ;
- composants de projection Frontend ;
- routes décisionnelles.

### REFACTOR

Dans un lot Frontend ultérieur seulement :

- `WorkDecisionsPage` ;
- `DecisionsSurface` ;
- `PendingDecisionCard` ;
- projection décision de Work Overview.

Ces composants doivent devenir consommateurs ; aucun changement n'est réalisé
par DDEC-000.

### REMOVE

Après remplacement vérifié seulement :

- `workDecisionsFixtures` ;
- décisions de `workOverviewFixture` ;
- `globalDecisionsFixture` ;
- `homeFixture.pendingDecision`.

### MERGE

Aucun moteur ou modèle Runtime. Les périmètres sont différents.

## 8. Statut d'activation

`HumanApprovalWorkflow` est feature-flagged et sa composition doit être
explicite. Le chemin `ProgramProductionEntrypoint` actuel ne le compose pas.

Conséquences :

- la source existe et est persistable ;
- DDEC-001 peut la lire sans en créer une autre ;
- DDEC-001 doit retourner une absence contrôlée si aucun record n'existe ;
- DDEC-001 ne doit pas activer le producteur ;
- la couverture de production du workflow humain ne peut pas être déclarée par
  ce lot.

## 9. Contrat de DDEC-001

### Nom du prochain lot

**DDEC-001 — Work Decisions Internal Read Integration**

### Périmètre

- Runtime Work interne ;
- lecture seule ;
- association Work -> Mission -> Run ;
- lecture des records `HUMAN_APPROVAL` ;
- historique complet ;
- champs exacts de `HumanApprovalDecision` ;
- provenance Mission, Run, record et décideur ;
- absence explicite.

### Interdictions

- nouveau producteur ;
- nouveau repository ;
- nouvelle persistance ;
- endpoint HTTP ;
- BFF ;
- Frontend ;
- décision principale inventée ;
- statut UX inventé ;
- échéance, confiance, recommandation ou impact sans producteur ;
- modification de `HumanApprovalWorkflow.decide` ;
- modification de la certification ou de la gouvernance.

## 10. Conditions de NO GO pour DDEC-001

DDEC-001 devra s'arrêter sans implémentation si :

- le Work ne peut pas être lié à une Mission autoritative ;
- aucun Run autoritatif ne peut être désigné sans convention inventée ;
- la lecture exige de modifier le producteur ;
- la lecture exige une seconde persistance ;
- une collision Mission/Run ne peut pas être écartée par les identités
  canoniques ;
- le besoin réel exige une décision principale plutôt qu'un historique.

## 11. Conclusion

DDEC-001 est architecturalement ouvrable sans seconde source de vérité.
L'incrément viable minimal est une lecture historique interne. Le raccordement
UX et l'activation du producteur restent hors périmètre.
