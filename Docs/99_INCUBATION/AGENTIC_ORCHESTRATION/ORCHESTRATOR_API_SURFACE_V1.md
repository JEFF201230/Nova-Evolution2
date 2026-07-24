# ORCHESTRATOR API SURFACE V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Agent : API Architect

Mission : AGENT-4

Objet : REST API, CLI, SDK, Future UI, Authentication, Authorization

---

# 1. Objet

Ce document definit la surface d'acces officielle de l'ORCHESTRATOR V1.

Il construit l'architecture cible des interfaces suivantes :

- REST API ;
- CLI ;
- SDK ;
- Future UI ;
- Authentication ;
- Authorization.

Il ne decrit pas une implementation technique finale.

Il fixe les contrats, les responsabilites, les frontieres de securite et les objets manipulables par les interfaces futures.

---

# 2. Sources de verite

Les interfaces definies par ce document doivent respecter, par ordre d'autorite :

1. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
2. `ORCHESTRATOR_STATE_MODEL_V1.md`
3. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
4. `ORCHESTRATOR_V1_ARCHITECTURE.md`
5. `ORCH-0001-B_WORKFLOW.md`
6. `ORCHESTRATION_GOVERNANCE.md`

Aucune interface ne peut creer un etat, une transition, un role, une autorite ou un livrable non defini par ces documents.

---

# 3. Principes d'interface

## 3.1 API first

La REST API est la surface canonique.

La CLI, le SDK et la Future UI consomment la REST API ou un contrat equivalent expose par le Runtime.

Ils ne doivent pas acceder directement aux stores internes si cela contourne les controles de gouvernance.

## 3.2 Governance first

Chaque operation doit etre gouvernee par :

- une identite authentifiee ;
- un projet cible ;
- une autorisation explicite ;
- un perimetre verifie ;
- un verrou lorsque l'operation modifie un etat actif ;
- une trace d'evenement.

## 3.3 Separation lecture / mutation

Les operations de lecture peuvent exposer l'etat, les rapports, les verrous et l'historique autorises.

Les operations de mutation doivent passer par les controles suivants :

1. authentification ;
2. autorisation ;
3. validation du schema ;
4. validation du perimetre ;
5. verification de verrou ;
6. validation de transition ;
7. emission d'evenement ;
8. persistance.

## 3.4 Clients substituables

La CLI, le SDK et la Future UI sont des clients substituables.

Aucun client ne porte une regle metier canonique qui n'existe pas cote Runtime ou REST API.

---

# 4. Objets exposes

| Objet | Description | Lecture | Mutation |
| --- | --- | --- | --- |
| `Project` | Projet isole, par exemple `VEEDDA` | Oui | Admin uniquement |
| `Mission` | Unite de travail gouvernee | Oui | Oui selon role |
| `Agent` | Role officiel capable d'executer une mission | Oui | Gouvernance uniquement |
| `State` | Etat canonique courant d'une mission | Oui | Via transition uniquement |
| `Transition` | Passage autorise entre deux etats | Oui | Oui selon role |
| `Lock` | Verrou de perimetre | Oui | Oui selon role |
| `Report` | Rapport produit par un agent | Oui | Agent responsable ou validator |
| `Event` | Trace immuable d'une operation | Oui | Runtime uniquement |
| `Context` | Contexte injecte dans une mission | Oui | Runtime ou Orchestrator |
| `Validation` | Resultat de controle technique, documentaire ou humain | Oui | Validator ou autorite |

---

# 5. REST API

## 5.1 Prefixe

Prefixe canonique :

```text
/api/orchestrator/v1
```

Toutes les routes doivent etre versionnees.

Une rupture de contrat doit creer une nouvelle version majeure.

## 5.2 Conventions

| Element | Convention |
| --- | --- |
| Format | JSON |
| Authentification | `Authorization: Bearer <token>` |
| Idempotence mutation | `Idempotency-Key` recommande |
| Correlation | `X-Correlation-Id` recommande |
| Projet | `project_id` dans le path ou le body selon operation |
| Erreurs | Enveloppe d'erreur normalisee |
| Pagination | `limit`, `cursor` |
| Horodatage | ISO 8601 UTC |

## 5.3 Enveloppe de reponse

```json
{
  "data": {},
  "meta": {
    "request_id": "req_...",
    "correlation_id": "corr_...",
    "project_id": "VEEDDA"
  }
}
```

## 5.4 Enveloppe d'erreur

```json
{
  "error": {
    "code": "LOCK_CONFLICT",
    "message": "Operation blocked by active lock.",
    "details": {},
    "request_id": "req_...",
    "correlation_id": "corr_..."
  }
}
```

## 5.5 Codes d'erreur canoniques

| Code | HTTP | Description |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Identite absente ou token invalide |
| `FORBIDDEN` | 403 | Identite authentifiee mais non autorisee |
| `PROJECT_NOT_FOUND` | 404 | Projet inconnu ou inaccessible |
| `MISSION_NOT_FOUND` | 404 | Mission inconnue ou inaccessible |
| `VALIDATION_ERROR` | 422 | Payload non conforme |
| `SCOPE_VIOLATION` | 422 | Perimetre non autorise |
| `INVALID_TRANSITION` | 409 | Transition non autorisee |
| `LOCK_CONFLICT` | 409 | Verrou actif incompatible |
| `AUTHORITY_REQUIRED` | 409 | Arbitrage ou validation d'autorite requis |
| `DEPENDENCY_MISSING` | 409 | Dependance attendue indisponible |
| `RATE_LIMITED` | 429 | Limite d'appel atteinte |
| `INTERNAL_ERROR` | 500 | Erreur interne non exposee |

## 5.6 Routes Project

| Methode | Route | Objet |
| --- | --- | --- |
| `GET` | `/projects` | Lister les projets accessibles |
| `GET` | `/projects/{project_id}` | Lire un projet |

La creation ou suppression de projet n'est pas exposee en V1 sans mission d'administration dediee.

## 5.7 Routes Mission

| Methode | Route | Objet |
| --- | --- | --- |
| `POST` | `/projects/{project_id}/missions` | Creer une mission en `DRAFT` ou `READY` selon payload |
| `GET` | `/projects/{project_id}/missions` | Lister les missions accessibles |
| `GET` | `/projects/{project_id}/missions/{mission_id}` | Lire une mission |
| `PATCH` | `/projects/{project_id}/missions/{mission_id}` | Mettre a jour les champs preparatoires autorises |
| `POST` | `/projects/{project_id}/missions/{mission_id}/assign` | Affecter un agent |
| `POST` | `/projects/{project_id}/missions/{mission_id}/submit` | Soumettre les livrables au controle |
| `POST` | `/projects/{project_id}/missions/{mission_id}/cancel` | Annuler une mission |

`PATCH` est interdit sur une mission terminale.

## 5.8 Routes State et Transition

| Methode | Route | Objet |
| --- | --- | --- |
| `GET` | `/projects/{project_id}/missions/{mission_id}/state` | Lire l'etat courant |
| `GET` | `/projects/{project_id}/missions/{mission_id}/transitions` | Lister les transitions possibles |
| `POST` | `/projects/{project_id}/missions/{mission_id}/transitions` | Demander une transition |

Le Runtime refuse toute transition non definie par le State Model ou le Workflow.

## 5.9 Routes Lock

| Methode | Route | Objet |
| --- | --- | --- |
| `GET` | `/projects/{project_id}/locks` | Lister les verrous accessibles |
| `GET` | `/projects/{project_id}/locks/{lock_id}` | Lire un verrou |
| `POST` | `/projects/{project_id}/missions/{mission_id}/locks` | Demander un verrou |
| `POST` | `/projects/{project_id}/locks/{lock_id}/renew` | Renouveler un verrou |
| `POST` | `/projects/{project_id}/locks/{lock_id}/release` | Liberer un verrou |

Une liberation forcee requiert une autorite explicite.

## 5.10 Routes Report

| Methode | Route | Objet |
| --- | --- | --- |
| `POST` | `/projects/{project_id}/missions/{mission_id}/reports` | Deposer un rapport |
| `GET` | `/projects/{project_id}/missions/{mission_id}/reports` | Lister les rapports d'une mission |
| `GET` | `/projects/{project_id}/reports/{report_id}` | Lire un rapport |

Un rapport ne peut etre depose que par l'agent responsable, un agent secondaire autorise ou un validator explicitement designe.

## 5.11 Routes Validation

| Methode | Route | Objet |
| --- | --- | --- |
| `POST` | `/projects/{project_id}/missions/{mission_id}/validations/technical` | Ajouter une validation technique |
| `POST` | `/projects/{project_id}/missions/{mission_id}/validations/documentary` | Ajouter une validation documentaire |
| `POST` | `/projects/{project_id}/missions/{mission_id}/validations/human` | Ajouter une validation humaine |
| `GET` | `/projects/{project_id}/missions/{mission_id}/validations` | Lire les validations |

La validation humaine positive est requise avant `ACCEPTED`.

## 5.12 Routes Event

| Methode | Route | Objet |
| --- | --- | --- |
| `GET` | `/projects/{project_id}/events` | Lister les evenements accessibles |
| `GET` | `/projects/{project_id}/missions/{mission_id}/events` | Lister les evenements d'une mission |

Les evenements sont immuables.

Aucune route publique ne modifie directement un evenement.

---

# 6. CLI

## 6.1 Nom canonique

Nom cible :

```text
cerebrau-orch
```

## 6.2 Principes CLI

La CLI sert aux operations controlees de pilotage, diagnostic et execution locale.

Elle ne doit pas contourner :

- l'authentification ;
- l'autorisation ;
- les verrous ;
- les transitions canoniques ;
- la validation des schemas.

## 6.3 Commandes

| Commande | Objet |
| --- | --- |
| `cerebrau-orch auth login` | Obtenir une session |
| `cerebrau-orch auth status` | Afficher l'identite courante |
| `cerebrau-orch project list` | Lister les projets accessibles |
| `cerebrau-orch mission create` | Creer une mission depuis JSON ou flags |
| `cerebrau-orch mission get <mission_id>` | Lire une mission |
| `cerebrau-orch mission list` | Lister les missions |
| `cerebrau-orch mission assign <mission_id>` | Affecter un agent |
| `cerebrau-orch mission transition <mission_id>` | Demander une transition |
| `cerebrau-orch mission submit <mission_id>` | Soumettre une mission |
| `cerebrau-orch mission cancel <mission_id>` | Annuler une mission |
| `cerebrau-orch lock list` | Lister les verrous |
| `cerebrau-orch lock acquire <mission_id>` | Demander un verrou |
| `cerebrau-orch lock release <lock_id>` | Liberer un verrou |
| `cerebrau-orch report submit <mission_id>` | Deposer un rapport |
| `cerebrau-orch validate technical <mission_id>` | Deposer une validation technique |
| `cerebrau-orch validate documentary <mission_id>` | Deposer une validation documentaire |
| `cerebrau-orch validate human <mission_id>` | Deposer une validation humaine |
| `cerebrau-orch events <mission_id>` | Lire le journal d'evenements |

## 6.4 Formats CLI

La CLI doit supporter :

- `--json` pour sortie machine ;
- `--project <project_id>` pour isoler le projet ;
- `--file <path>` pour payload ;
- `--dry-run` pour validation sans mutation lorsque supporte ;
- `--correlation-id <id>` pour audit.

Une commande de mutation sans projet explicite doit echouer si plusieurs projets sont accessibles.

---

# 7. SDK

## 7.1 Cible

Le SDK expose une API programmee stable pour integrer l'orchestrateur dans des outils internes, tests, scripts ou futures interfaces.

SDK cible initial :

- TypeScript.

Autres SDK futurs possibles :

- Python ;
- REST OpenAPI generated client.

## 7.2 Client racine

```ts
const orchestrator = createOrchestratorClient({
  baseUrl: "https://example.com/api/orchestrator/v1",
  tokenProvider,
  projectId: "VEEDDA",
});
```

## 7.3 Modules SDK

| Module | Responsabilite |
| --- | --- |
| `auth` | Session, token provider, identite |
| `projects` | Lecture projets |
| `missions` | Creation, lecture, affectation, soumission, annulation |
| `states` | Lecture et transitions |
| `locks` | Acquisition, renouvellement, liberation |
| `reports` | Depot et lecture de rapports |
| `validations` | Depot et lecture des validations |
| `events` | Lecture du journal |

## 7.4 Exemple d'usage

```ts
await orchestrator.missions.create({
  objective: "Define governance rules",
  agent_id: "governance-designer",
  deliverables: ["ORCHESTRATION_GOVERNANCE.md"],
  stop_criteria: "Doctrine validable",
});

await orchestrator.missions.assign(missionId, {
  agent_id: "api-architect",
});

await orchestrator.locks.acquire(missionId, {
  scope: ["Docs/09_CEREBRAU OPERATING SYSTEM/99_INCUBATION/AGENTIC_ORCHESTRATION"],
});
```

## 7.5 Regles SDK

Le SDK doit :

- typer les etats canoniques ;
- typer les codes d'erreur ;
- propager `request_id` et `correlation_id` ;
- refuser les appels de mutation sans token ;
- exposer `dryRun` lorsque la REST API le supporte ;
- ne pas masquer les erreurs de gouvernance.

Le SDK ne doit pas :

- simuler une transition interdite ;
- recreer la logique de validation canonique ;
- ecrire directement dans les stores internes ;
- transformer un `FORBIDDEN` en simple warning.

---

# 8. Future UI

## 8.1 Role

La Future UI est une interface de pilotage et de controle.

Elle ne devient pas une autorite autonome.

Elle doit rendre visibles :

- missions ;
- agents ;
- etats ;
- verrous ;
- rapports ;
- validations ;
- conflits ;
- escalades ;
- evenements.

## 8.2 Vues minimales

| Vue | Objet |
| --- | --- |
| Dashboard | Synthese projets, missions actives, blocages, validations attendues |
| Mission Board | Liste et filtres par etat, agent, priorite, verrou |
| Mission Detail | Objectif, perimetre, livrables, etat, transitions disponibles |
| Lock Center | Verrous actifs, conflits, expirations, liberations autorisees |
| Report Viewer | Rapports agents, pieces associees, controles |
| Validation Queue | Validations techniques, documentaires et humaines en attente |
| Event Timeline | Journal chronologique auditable |
| Admin Governance | Roles, permissions, projets, politiques d'acces |

## 8.3 Actions UI autorisees

La Future UI peut declencher uniquement les actions exposees par la REST API :

- creer une mission ;
- affecter une mission ;
- demander un verrou ;
- demander une transition ;
- soumettre un rapport ;
- valider selon role ;
- annuler selon role ;
- lire les evenements.

Chaque action de mutation doit afficher le resultat ou l'erreur canonique.

## 8.4 Garde-fous UI

La UI doit :

- masquer ou desactiver les actions non autorisees ;
- afficher les raisons d'indisponibilite ;
- demander confirmation pour annulation, rejet et liberation de verrou ;
- afficher les conflits avant mutation ;
- conserver la trace `correlation_id`.

La UI ne doit pas :

- permettre une mutation hors role ;
- permettre une transition interdite ;
- modifier directement un store ;
- presenter une mission bloquee comme livree.

---

# 9. Authentication

## 9.1 Modele

Le modele d'authentification V1 repose sur des tokens porteurs.

Format HTTP :

```text
Authorization: Bearer <access_token>
```

Le fournisseur d'identite peut etre remplace tant que le Runtime recoit une identite verifiee et des claims normalises.

## 9.2 Claims minimaux

| Claim | Description |
| --- | --- |
| `sub` | Identifiant stable du sujet |
| `actor_type` | `human`, `agent`, `service` |
| `project_ids` | Projets accessibles |
| `roles` | Roles globaux ou projet |
| `agent_id` | Agent associe si acteur agent |
| `exp` | Expiration |
| `iat` | Emission |
| `iss` | Emetteur |
| `aud` | Audience attendue |

## 9.3 Types d'acteurs

| Type | Description |
| --- | --- |
| `human` | Product Owner, Architecte, validateur, utilisateur autorise |
| `agent` | Agent officiel executant une mission |
| `service` | Automate technique ou integration systeme |

## 9.4 Regles d'authentification

Une requete sans identite valide recoit `UNAUTHENTICATED`.

Un token expire est refuse.

Un token valide mais sans acces au projet recoit `FORBIDDEN`.

Une identite agent doit etre rattachee a un `agent_id`.

Une identite service doit etre limitee a des scopes explicites.

---

# 10. Authorization

## 10.1 Modele RBAC + ABAC

L'autorisation combine :

- RBAC : role de l'acteur ;
- ABAC : attributs de projet, mission, agent responsable, etat, verrou, perimetre.

Une autorisation est accordee uniquement si les deux controles sont compatibles.

## 10.2 Roles canoniques

| Role | Capacites principales |
| --- | --- |
| `product_owner` | Arbitrer, valider final, annuler, autoriser exceptions |
| `architect` | Structurer, affecter, requalifier, valider documentaire |
| `orchestrator` | Affecter, verrouiller, sequencer, escalader |
| `agent` | Lire et executer ses missions, deposer ses rapports |
| `validator_technical` | Controler schema, runtime, coherence technique |
| `validator_documentary` | Controler perimetre documentaire et references |
| `viewer` | Lire les objets autorises |
| `service_admin` | Administrer l'infrastructure autorisee |

## 10.3 Matrice d'autorisation

| Operation | product_owner | architect | orchestrator | agent | validator_technical | validator_documentary | viewer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lire mission | Oui | Oui | Oui | Si assigne | Si autorise | Si autorise | Oui selon projet |
| Creer mission | Oui | Oui | Oui si mandate | Non | Non | Non | Non |
| Affecter agent | Oui | Oui | Oui | Non | Non | Non | Non |
| Demander verrou | Oui | Oui | Oui | Si assigne | Non | Non | Non |
| Liberer verrou | Oui | Oui | Oui selon propriete | Si proprietaire et autorise | Non | Non | Non |
| Transition RUNNING | Non | Oui si reprise | Oui | Si assigne | Non | Non | Non |
| Deposer rapport | Non | Oui si auteur | Non | Si assigne | Non | Non | Non |
| Validation technique | Non | Non | Non | Non | Oui | Non | Non |
| Validation documentaire | Oui | Oui | Non | Non | Non | Oui | Non |
| Validation humaine | Oui | Oui si delegue | Non | Non | Non | Non | Non |
| Annuler mission | Oui | Oui | Oui si mandate | Non | Non | Non | Non |
| Lire evenements | Oui | Oui | Oui | Si assigne | Si autorise | Si autorise | Oui selon projet |

## 10.4 Regles ABAC

Une operation doit etre refusee si :

- `project_id` n'appartient pas aux projets autorises ;
- l'acteur agent n'est pas assigne a la mission ;
- la mission est terminale et l'operation est une mutation ;
- le verrou appartient a un autre acteur sans autorite de liberation ;
- la transition demandee n'est pas autorisee depuis l'etat courant ;
- le perimetre vise n'est pas inclus dans la mission ;
- une validation humaine est tentee par l'agent executant sans delegation explicite.

## 10.5 Autorisation par etat

| Etat | Mutations typiques autorisees |
| --- | --- |
| `DRAFT` | Completer, annuler |
| `READY` | Affecter, annuler |
| `ASSIGNED` | Verrouiller, attendre input, annuler |
| `LOCKED` | Demarrer, escalader, annuler |
| `RUNNING` | Soumettre, escalader, attendre, echouer |
| `WAITING_INPUT` | Reprendre, escalader, annuler |
| `WAITING_DEPENDENCY` | Reprendre, escalader, annuler |
| `ESCALATED` | Arbitrer, requalifier, annuler, rejeter |
| `SUBMITTED` | Controler, demander revision, rejeter |
| `TECHNICAL_VALIDATION` | Valider technique, demander revision, escalader |
| `DOCUMENTARY_VALIDATION` | Valider documentaire, demander revision, escalader |
| `HUMAN_VALIDATION` | Accepter, rejeter, demander revision |
| `NEEDS_REVISION` | Reprendre, escalader, rejeter |
| `FAILED` | Requalifier, annuler |
| `ACCEPTED` | Lecture uniquement |
| `REJECTED` | Lecture uniquement |
| `CANCELLED` | Lecture uniquement |

---

# 11. Contrat OpenAPI cible

Une specification OpenAPI devra etre produite avant implementation.

Elle devra couvrir :

- schemas request/response ;
- schemas erreur ;
- security schemes ;
- exemples ;
- codes HTTP ;
- pagination ;
- headers ;
- tags par domaine ;
- version API.

Le document OpenAPI ne doit pas redefinir les regles de gouvernance.

Il doit les encoder sous forme de contrats techniques.

---

# 12. Observabilite et audit

Toute mutation doit produire :

- `event_id` ;
- `request_id` ;
- `correlation_id` ;
- `actor_id` ;
- `project_id` ;
- `mission_id` si applicable ;
- operation ;
- resultat ;
- horodatage.

Les logs ne doivent pas exposer :

- tokens ;
- secrets ;
- contenu confidentiel non necessaire ;
- donnees hors perimetre projet.

---

# 13. Critere d'arret

La mission AGENT-4 est complete lorsque ce document definit :

- la REST API ;
- la CLI ;
- le SDK ;
- la Future UI ;
- l'Authentication ;
- l'Authorization ;
- les objets exposes ;
- les erreurs canoniques ;
- les garde-fous de gouvernance ;
- les conditions minimales d'OpenAPI future.

Statut propose : `DRAFT_VALIDABLE`.

