# NOVA — SW-013 WORK OVERVIEW READ MODEL IMPLEMENTATION REPORT

## 1. VERDICT

**NO GO — GATE D'ENTRÉE SW-012 NON SATISFAIT**

L'implémentation n'a pas été engagée.

La spécification canonique identifie les responsabilités métier attendues, mais elle établit
également que leurs producteurs ne sont pas présents dans le Runtime exposé audité. Le dépôt
confirme cette absence. Créer le Read Model et son endpoint avec des valeurs dérivées, des
fixtures, un producteur en mémoire ou un nouveau stockage aurait violé le contrat SW-012.

## 2. Sources obligatoires examinées

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_OVERVIEW_READMODEL_SPECIFICATION.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_WORK_OVERVIEW_RUNTIME_GAP_REPORT.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md` ;
- `Docs/00_GOVERNANCE/NOVA_SW006_RUNTIME_ACTIVATION_REPORT.md`.

Les contrats et services Runtime/Core/BFF concernés ont également été contrôlés.

## 3. Blocage contractuel

### 3.1 Preuve dans SW-012

La spécification SW-012 impose :

- un producteur autoritatif pour chaque champ classé `ABSENT` ;
- l'absence de valeur inventée ou de fixture de secours ;
- une réponse `409 WORK_OVERVIEW_NOT_READY` lorsqu'un producteur obligatoire manque ;
- la disponibilité des producteurs comme gate d'entrée du lot.

Elle indique explicitement que les producteurs de synthèse Work/Intelligence, phase et échéance
Work, décision principale, résumés Deliverable et résumés People ne sont pas présents dans le
Runtime exposé audité.

Le Runtime Gap Report confirme :

- agrégat Runtime Work : absent ;
- projection Runtime Overview : absente ;
- données métier Overview : partielles ou absentes ;
- producteurs autoritatifs des champs métier absents : non disponibles.

### 3.2 Preuve dans le code

Les recherches exhaustives hors documentation ne trouvent aucun producteur serveur pour :

- `WorkItem.confPct` ;
- `WorkItem.phaseNum` et `WorkItem.phaseTotal` ;
- `WorkItem.deadline` ;
- `heroSentence` et `heroGain` ;
- la Next Best Action ;
- `laterActions` et `backgroundActions` ;
- une décision métier Work principale ;
- un propriétaire fonctionnel Work ;
- des livrables identifiés avec confiance ;
- des personnes avec disponibilité ;
- une synthèse NOVA qualifiée pour le Work.

Les seules occurrences de la forme Work Overview se trouvent dans le Frontend et ses fixtures.
Elles ne constituent pas des producteurs Runtime autoritatifs.

## 4. Données Runtime effectivement disponibles

| Service ou contrat | Données disponibles | Limite contractuelle |
|---|---|---|
| `RuntimeMission` | `projectId`, `missionId`, `objective`, `updatedAt`, livrables textuels | ne fournit pas les champs métier Overview absents |
| `MissionReport` | rapport, agent technique, livrables textuels, `submittedAt` | agent technique non équivalent au propriétaire fonctionnel |
| `RuntimeObservabilityEvent` | `progression`, `timestamp`, phase technique | phase technique non équivalente à la phase Work |
| `NovaCoreService.getMission` | lecture de la mission | source partielle uniquement |
| `NovaCoreService.getReport` | lecture du rapport | source partielle uniquement |
| `NovaCoreService.getObservabilityEvents` | progression technique et timestamps | ne produit aucune donnée métier manquante |
| `NovaCoreService.getEvents` | événements techniques | les payloads libres ne peuvent pas devenir des données métier implicites |

`HumanApprovalWorkflow`, `RuntimeMissionCertificate`, `MissionProgressModel` et le Runtime Gateway
ont été exclus conformément à SW-012 : ils ne sont pas sémantiquement équivalents aux producteurs
Work requis.

## 5. Read Model créé

**Aucun.**

Créer uniquement l'interface TypeScript sans disposer des producteurs nécessaires aurait livré
une implémentation partielle incapable de produire un snapshot `200` conforme. Créer un
producteur de remplacement aurait ajouté une capacité et un contrat source non autorisés.

## 6. Endpoint GET créé

**Aucun.**

L'endpoint cible reste :

```text
GET /api/v1/missions/:projectId/:missionId/overview
```

Il n'a pas été ajouté, car aucun chemin de production ne peut actuellement construire
`WorkOverviewReadModel` conformément aux invariants SW-012. Un endpoint retournant
systématiquement `409` ne constitue pas l'implémentation demandée.

La spécification exclut explicitement tout endpoint BFF supplémentaire. Aucun fichier BFF n'a
donc été modifié.

## 7. Contrats utilisés

Contrats existants inspectés :

- `RuntimeMission` ;
- `MissionReport` ;
- `RuntimeEvent` ;
- `RuntimeObservabilityEvent` ;
- `NovaCoreError`.

Aucun nouveau contrat n'a été créé ou modifié.

## 8. Producteurs métier utilisés

**Aucun producteur métier Work Overview disponible.**

Les lectures techniques de `NovaCoreService` et `OrchestratorRuntimeService` ont été vérifiées,
mais elles ne couvrent que les données `DIRECT` et `COMPOSITION` partielles définies par SW-012.
Elles ne peuvent pas produire les champs `ABSENT` sans invention ou extension de domaine.

## 9. Fichiers modifiés

Un seul fichier a été créé :

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_SW013_WORK_OVERVIEW_READMODEL_IMPLEMENTATION_REPORT.md`.

Aucun fichier Runtime, Core, BFF, Frontend, test, configuration, Program, Module ou autre document
n'a été modifié par SW-013.

## 10. Tests exécutés

Les contrôles ont été exécutés sur l'état initial afin de qualifier la non-régression et de
distinguer le blocage de données d'un échec technique.

| Contrôle | Commande | Résultat |
|---|---|---|
| typecheck Core | `npm.cmd run typecheck:nova-core` | PASS |
| typecheck BFF | `npm.cmd run lint:bff` | PASS |
| typecheck Frontend | `npm.cmd run typecheck --prefix apps/nova-web` | PASS |
| suite Runtime/Core | `npm.cmd run test:core` | PASS — 503/503 |
| suite BFF | `npm.cmd run test:bff` | PASS — 54/54 |
| suite Frontend | `npm.cmd run test --prefix apps/nova-web` | PASS — 146/146 |
| intégration du nouvel endpoint GET | non exécutée | BLOQUÉE — endpoint non créé |

## 11. Régressions

- régression détectée : **0** ;
- échec de typecheck : **0** ;
- échec dans les suites existantes : **0** ;
- modification d'un autre domaine : **0** ;
- modification de Work Activity : **0** ;
- mutation introduite : **0**.

## 12. Respect du périmètre SW-012

| Règle | Preuve |
|---|---|
| aucun champ supplémentaire | aucun Read Model créé |
| aucune donnée inventée | aucun mapping de substitution |
| aucune fixture Runtime | aucun code Runtime ajouté |
| aucune mutation | aucun endpoint ou service modifié |
| aucun POST/PUT/PATCH/DELETE | aucune route ajoutée |
| aucun SSE ou monitoring | aucun fichier concerné modifié |
| aucun autre écran ou domaine | aucun fichier Frontend modifié |
| aucun endpoint BFF supplémentaire | aucun fichier BFF modifié |
| fail-closed | arrêt avant implémentation au gate des producteurs |

## 13. Condition objective de reprise

SW-013 peut être repris sans nouvel arbitrage du Read Model lorsque des producteurs Runtime
concrets, autoritatifs et lisibles sont disponibles pour tous les groupes obligatoires définis par
SW-012 :

```text
WORK_CONFIDENCE
WORK_PHASE
WORK_SCHEDULE
WORK_INSIGHT
WORK_NEXT_ACTION
WORK_DECISION
WORK_PROGRESS
WORK_DELIVERABLES
WORK_PEOPLE
WORK_NOVA_UPDATE
```

Leur simple désignation sémantique ne suffit pas : un contrat ou service existant doit permettre
leur lecture sans mutation et sans valeur de substitution.

## 14. Décision finale

**SW-013 NO GO**

Le dépôt est techniquement non régressé, mais le gate d'entrée canonique n'est pas satisfait.
L'implémentation complète du Read Model ne peut pas être réalisée dans le périmètre autorisé sans
créer les producteurs métier absents, ce qui constituerait une extension interdite de SW-013.
