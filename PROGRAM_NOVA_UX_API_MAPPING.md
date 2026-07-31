# PROGRAM NOVA — CARTOGRAPHIE API UX / RUNTIME

Mission : `PROGRAM-NOVA-UX-RUNTIME-INTEGRATION-001`  
Source principale : `server/nova-core/nova-core.http.ts`  
État : contrats observés, aucune exécution ni modification

## 1. Inventaire HTTP réel

Les paramètres `:projectId` et `:missionId` sont encodés dans le chemin. Les réponses JSON d'erreur utilisent la forme :

```json
{
  "error": {
    "code": "CODE_STABLE",
    "message": "Message",
    "details": {},
    "diagnostics": []
  }
}
```

`details` et `diagnostics` sont optionnels.

| Méthode et route | Entrée | Sortie observée | Auth HTTP observée | Usage UX |
|---|---|---|---|---|
| `OPTIONS *` | aucune | 204 | aucune | preflight CORS |
| `GET /` | aucune | HTML historique | aucune | interface legacy |
| `GET /health` | aucune | `{status, service, memory}` | aucune | santé/Cockpit |
| `GET /api/v1/projects` | aucune | `{projects:[{projectId,repositoryRoot}]}` | aucune | sélection de workspace |
| `GET /api/v1/projects/:projectId/preflight` | projet | `{project,git}` | aucune | état Git/Sources |
| `GET /api/v1/missions?projectId=` | filtre optionnel | `{missions:[RuntimeMissionView]}` | aucune | Home, Work, Missions |
| `POST /api/v1/missions` | `MissionDefinition` | 201/200 `{created,mission}` | aucune | création de mission, non sûre directement depuis React |
| `GET /api/v1/missions/:projectId/:missionId` | identifiants | `{mission,report,events,observabilityEvents,incompleteRuns}` | aucune | Work, Evidence, Monitoring |
| `GET .../:missionId/monitor` | identifiants | `{mission,events,incompleteRuns}` | aucune | Monitoring |
| `GET .../:missionId/monitor/stream` | identifiants | SSE `mission` | aucune | progression temps réel |
| `GET .../:missionId/events` | identifiants | `{events:[RuntimeEvent]}` | aucune | Activity, audit |
| `GET .../:missionId/certificate` | identifiants | `{certificate}` | aucune | consultation certification |
| `POST .../:missionId/assign` | `{agentId?}` | `{mission}` | aucune | assignation, non sûre directement depuis React |
| `POST .../:missionId/evidence` | `EvidenceSubmission` | `{report,mission}` | aucune | soumission de preuves, non sûre directement depuis React |
| `POST .../:missionId/execute` | `ExecutionRequest` optionnelle | `{report,mission}` | aucune | lancement, chemin v1 et non Program Production Entrypoint |
| `POST .../:missionId/cancel` | aucune | 202 `{runId,cancellationRequested:true}` | aucune | annulation, non sûre directement depuis React |
| `POST .../:missionId/technical-accept` | aucune | `{mission}` | aucune | validation technique, non sûre directement depuis React |
| `POST .../:missionId/certify` | `{runId,reportFingerprint,attestation}` | 201 `{certificate,mission}` | Bearer + autorité `CERTIFY` | certification ; secret serveur requis |
| `POST .../:missionId/recovery/:action` | `{runId}` | `{recovery,mission}` | Bearer + autorité `CERTIFY` | opération réservée |
| `POST .../:missionId/approve` | toute entrée | 410 `APPROVAL_ROUTE_REMOVED` | aucune avant rejet | inutilisable |
| autre route | — | 404 `ROUTE_NOT_FOUND` | — | — |

Actions recovery acceptées : `reconcile`, `resume`, `abandon`, `quarantine`, `recover`.

## 2. Contrats d'entrée

### 2.1 MissionDefinition

Champs obligatoires observés :

| Champ | Type |
|---|---|
| `projectId` | string |
| `missionId` | string |
| `missionType` | string |
| `objective` | string |
| `authority` | string |
| `scope.allowed` | string[] |
| `scope.forbidden` | string[] |
| `deliverables` | string[] |
| `stopCriteria` | string[] |
| `authorizedReferences` | string[] |

Champs optionnels : `requestedAgentId`, `priority`, `createdAt`.

Les champs inconnus sont rejetés. Le contexte React Work Setup ne contient que l'objectif, les réponses de clarification, les items de canvas et le niveau d'autonomie. Il ne suffit pas à construire ce contrat.

### 2.2 EvidenceSubmission

| Champ | Exigence |
|---|---|
| `reportId`, `reportType` | optionnels |
| `deliverables` | tableau obligatoire |
| `filesChanged` | tableau obligatoire |
| `checks` | tableau obligatoire |
| `blockers`, `errors` | optionnels |
| `scopeConfirmed` | doit valoir `true` |

### 2.3 ExecutionRequest

Corps optionnel avec :

- `profile` : `FAST`, `BUILD`, `ARCHITECTURE` ou `READ_ONLY` ;
- `prompt` ;
- `expectedBranch` ;
- `changesExpected` ;
- `humanReviewRequired` ;
- `timeoutMs`.

Cette requête appelle `NovaCoreService.executeWithNovaCore(...)`. Elle n'est pas le contrat `PromptPackage` du `ProgramProductionEntrypoint`.

### 2.4 Certification

Le corps exige :

- `runId` ;
- `reportFingerprint` ;
- `attestation`.

Le serveur authentifie l'autorité via Bearer, contrôle le rôle `CERTIFY`, puis vérifie la liaison et l'attestation cryptographique. Ce flux exige un composant serveur ; une application Vite ne doit pas contenir ces secrets.

## 3. Modèles de sortie

### 3.1 RuntimeMission v1

`RuntimeMission` étend la définition de mission avec notamment :

- état ;
- agent assigné ;
- lock, run, context et report IDs ;
- date de mise à jour.

La réponse HTTP ajoute `canonicalState`, projeté vers :

`CREATED`, `ASSIGNED`, `STARTED`, `RUNNING`, `VALIDATING`, `COMPLETED`, `FAILED`, `TIMEOUT`, `CANCELLED`, `CERTIFIED` ou `REJECTED`.

### 3.2 MissionReport

Le rapport contient notamment :

- identifiants mission, projet, agent et rapport ;
- type, livrables, fichiers modifiés et checks ;
- blockers, errors et confirmation de scope ;
- diagnostics ;
- empreintes et chemins de run ;
- provenance Git et résultat Codex ;
- preuves de livrables et certificat lorsque disponibles.

Le frontend attend des objets Deliverable détaillés. L'API v1 fournit principalement les données du rapport et ne fournit pas un catalogue de livrables avec endpoints de création, détail ou téléchargement.

### 3.3 RuntimeEvent

Champs observés :

- `eventId`, `eventName`, `projectId`, `missionId`, `runId` ;
- `correlationId`, `causationId`, `sequence` ;
- états source et cible ;
- producteur, timestamps, payload, métadonnées et hashes.

Événements couverts dans les types Runtime : création, acceptation et annulation de mission ; agent et locks ; attente, dépendance et escalade ; exécution, échec et timeout ; rapport ; validations technique, documentaire et humaine ; certification ; recovery ; output processus ; révision et rejet.

### 3.4 RuntimeObservabilityEvent

Champs observés :

- identifiants et séquence ;
- timestamp ;
- projet, mission, run et corrélation ;
- phase ;
- progression ;
- durée ;
- message, niveau et diagnostics.

Phases observées : `CREATED`, `ASSIGNED`, `STARTED`, `RUNNING`, `OUTPUT`, `VALIDATING`, `COMPLETED`, ainsi que les fins failure, cancellation, timeout et recovery.

### 3.5 Certificat

Le certificat Runtime contient :

- version de schéma ;
- algorithme HMAC-SHA256 ;
- liaison projet/mission/report/run et empreintes d'exécution ;
- décision certifiée et autorité ;
- fingerprint et signature.

## 4. Temps réel

| Mécanisme | Présence | Contrat |
|---|---|---|
| SSE | oui | `GET .../monitor/stream`, événement `mission`, JSON `RuntimeObservabilityEvent` |
| Rejeu initial SSE | oui | événements d'observabilité déjà stockés envoyés à la connexion |
| Heartbeat SSE | oui | commentaire toutes les 15 secondes |
| Désabonnement | oui | sur fermeture de la connexion |
| WebSocket | non trouvé | aucun contrat |
| Client SSE React | non trouvé | aucun `EventSource` dans `apps/nova-web/src` |

## 5. Erreurs et statuts HTTP

Statuts présents dans le routeur, le service ou ses tests :

- succès : 200, 201, 202, 204 ;
- requête/autorisation : 400, 401, 403, 404, 409, 410, 413, 422 ;
- service : 500, 503, 504.

Familles d'erreurs observées :

- JSON/payload/route/body trop volumineux ;
- projet, mission, conflit, état et cible Git ;
- preuve manquante ou insuffisante ;
- problèmes non résolus ;
- exécution, annulation et timeout ;
- authentification, autorisation, attestation, binding, dérive d'artefact ou de livrable ;
- recovery invalide.

Le client React devra préserver `error.code` comme discriminant stable, afficher `message` sans supposer la présence de `details`, et traiter explicitement 401, 403, 409, 410, 413, 422, 503 et 504.

## 6. Authentification et autorisation

| Opération | Contrôle constaté |
|---|---|
| lecture santé/projets/missions/events/monitor/certificate | aucun contrôle HTTP |
| create/assign/evidence/execute/cancel/technical-accept | aucun contrôle HTTP dans le routeur |
| certify | Bearer, type d'autorité autorisé, rôle `CERTIFY`, attestation |
| recovery | Bearer et politique d'autorité |
| Human Approval | aucune API disponible |

En complément, le dépôt contient un `ProductionAuthenticator` interne pour le transport certifié. Il lie opérateur, environnement, Runtime, transport Codex, autorisation `EXECUTE`, fenêtre temporelle et signature. Ce mécanisme n'est pas exposé par l'API HTTP.

## 7. Double modèle RuntimeMission

Deux contrats homonymes et incompatibles sont observés :

1. le `RuntimeMission` de l'orchestrateur HTTP, représentant la mission et son cycle de vie ;
2. le `RuntimeMission` du mapper Program Engine, contenant `missionId`, `prompt`, `validationStatus`, optimisation, prompt isolé et contexte de certification.

Une API d'intégration ne peut pas exposer le nom `RuntimeMission` sans version et sans schéma explicite.

## 8. Contrats manquants pour React

Contrats indispensables non trouvés :

- session utilisateur navigateur et autorisations par action ;
- façade HTTP du `ProgramProductionEntrypoint` ;
- préparation/validation d'un `PromptPackage` ;
- exposition des sessions durables, checkpoints et reconstruction ;
- Human Approval request, decision, history et receipt ;
- projections Home, Work, Plan, People, Sources, Decisions et Deliverables ;
- Settings ;
- catalogue Evidence et téléchargement contrôlé ;
- endpoints de détail Decision package/pause/receipt ;
- politique CORS de production limitée à l'origine attendue.

## 9. Compatibilité générale

| Domaine | API existante | Compatibilité React actuelle |
|---|---|---|
| santé | oui | compatible après ajout d'un client |
| projets/preflight | oui | compatible avec adaptation légère |
| missions liste/détail | oui | partielle, projection nécessaire |
| monitoring | oui, JSON + SSE | partielle, écran/client absents |
| événements | oui | partielle, adaptation de présentation |
| evidence | soumission + données du rapport | partielle, écran et catalogue absents |
| certification | lecture + mutation sécurisée | lecture adaptable ; mutation indirecte obligatoire |
| Human Approval | non | bloquant |
| Program Production Entrypoint | interne seulement | bloquant |
| Work/People/Sources/Deliverables | pas de contrats de vue | bloquant pour fidélité UX |

UX_RUNTIME_INTEGRATION_BLOCKED
