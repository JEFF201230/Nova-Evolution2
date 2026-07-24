# L4-005 - Agent Control Center

Version : 1.0

Statut : DRAFT

Niveau : L4 - Interface de pilotage

Perimetre : ORCHESTRATOR / CEREBRAU Operating System

Objet : voir tous les agents, leur activite, leurs attentes, leurs blocages, leur charge, leur qualite et leur historique.

---

# 1. Objectif

L'Agent Control Center est le cockpit de supervision des agents CEREBRAU.

Il repond a six questions operationnelles :

- quels agents existent ;
- qui travaille maintenant ;
- qui attend une information ou une dependance ;
- qui est bloque ou escalade ;
- quelle est la charge de chaque agent ;
- quelle est la qualite et l'historique de production de chaque agent.

Le Control Center ne donne pas d'autorite autonome aux agents. Il expose une lecture consolidee de l'activite a partir des missions, etats, rapports, verrous et journaux.

---

# 2. References d'autorite

Le Control Center doit rester conforme aux documents suivants :

- `Docs/09_CEREBRAU OPERATING SYSTEM/03_AGENTS/README.md`
- `Docs/09_CEREBRAU OPERATING SYSTEM/99_INCUBATION/AGENTIC_ORCHESTRATION/ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
- `Docs/09_CEREBRAU OPERATING SYSTEM/99_INCUBATION/AGENTIC_ORCHESTRATION/ORCHESTRATOR_STATE_MODEL_V1.md`
- `Docs/09_CEREBRAU OPERATING SYSTEM/99_INCUBATION/AGENTIC_ORCHESTRATION/ORCHESTRATOR_V1_ARCHITECTURE.md`
- `Docs/09_CEREBRAU OPERATING SYSTEM/05_RULES/ORCHESTRATION_GOVERNANCE.md`

---

# 3. Perimetre fonctionnel

## 3.1 Inclus

Le Control Center couvre :

- inventaire des agents officiels ;
- statut courant par agent ;
- missions actives, en attente, bloquees et terminees ;
- charge courante et charge historique ;
- qualite des livrables ;
- historique des missions, rapports, validations et blocages ;
- detection des verrous actifs ou conflictuels ;
- priorisation des blocages a traiter ;
- vues de synthese et vues detaillees.

## 3.2 Exclu

Le Control Center ne couvre pas :

- execution directe de missions ;
- modification directe d'un livrable agent ;
- validation finale automatique ;
- arbitrage Product Owner ou Architecte ;
- creation d'agents hors bibliotheque officielle ;
- communication directe agent-agent ;
- scoring opaque non explicable ;
- surveillance hors perimetre des missions.

---

# 4. Concepts affiches

## 4.1 Agent

Un agent est un role officiel de la bibliotheque CEREBRAU.

Champs minimaux :

| Champ | Definition |
| --- | --- |
| `agent_id` | identifiant canonique |
| `display_name` | nom lisible |
| `role_family` | architecture, backend, frontend, QA, etc. |
| `authority_level` | execution, controle, gouvernance si applicable |
| `allowed_scope` | perimetres autorises |
| `forbidden_scope` | perimetres interdits |
| `active_missions_count` | missions non terminales rattachees |
| `current_status` | statut derive depuis les missions |
| `load_score` | charge normalisee |
| `quality_score` | qualite normalisee |
| `last_activity_at` | derniere activite connue |

## 4.2 Mission agent

Une mission agent est une unite de travail bornee.

Champs minimaux :

| Champ | Definition |
| --- | --- |
| `mission_id` | identifiant unique |
| `agent_id` | agent principal |
| `state` | etat canonique ORCHESTRATOR |
| `mission_type` | architecture, implementation, audit, review, etc. |
| `priority` | priorite explicite si fournie |
| `scope` | perimetre verrouille ou autorise |
| `started_at` | demarrage |
| `updated_at` | derniere transition |
| `blocked_reason` | cause si attente ou blocage |
| `expected_deliverables` | livrables attendus |
| `report_id` | rapport produit si disponible |

## 4.3 Activite

Une activite est un evenement trace permettant de reconstruire l'historique.

Exemples :

- `AgentAssigned`
- `LockGranted`
- `AgentStarted`
- `InputRequired`
- `DependencyRequired`
- `EscalationRequested`
- `ReportSubmitted`
- `TechnicalValidationAccepted`
- `DocumentaryValidationRejectedRecoverable`
- `FinalValidationAccepted`

---

# 5. Statuts derives Agent Control Center

Le Control Center ne cree pas de nouveaux etats de mission. Il expose des statuts agents derives des etats canoniques.

| Statut agent | Etats mission sources | Reponse utilisateur |
| --- | --- | --- |
| `WORKING` | `RUNNING`, `LOCKED` | Qui travaille ? |
| `WAITING` | `WAITING_INPUT`, `WAITING_DEPENDENCY` | Qui attend ? |
| `BLOCKED` | `ESCALATED`, `FAILED` | Qui est bloque ? |
| `REVIEWING` | `SUBMITTED`, `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION` | Qui est en validation ou revision ? |
| `AVAILABLE` | aucune mission non terminale | Qui peut prendre une mission ? |
| `CLOSED` | seulement missions terminales recentes | Qui vient de terminer ? |

Regles :

- si un agent a plusieurs missions non terminales, le statut le plus critique prime ;
- ordre de criticite : `BLOCKED`, `WAITING`, `WORKING`, `REVIEWING`, `AVAILABLE`, `CLOSED` ;
- les etats terminaux `ACCEPTED`, `REJECTED`, `CANCELLED` alimentent l'historique, pas le statut actif ;
- `FAILED` est presente comme bloque requalifiable, pas comme cloture terminale.

---

# 6. Vues principales

## 6.1 Vue Overview

Objectif : voir l'etat global du systeme agentique.

Composition :

- bandeau KPI ;
- repartition par statut agent ;
- file des blocages critiques ;
- agents les plus charges ;
- agents avec qualite en baisse ;
- dernieres activites.

KPI minimum :

| KPI | Definition |
| --- | --- |
| Agents actifs | agents avec au moins une mission non terminale |
| Agents disponibles | agents sans mission non terminale |
| Missions en cours | missions `LOCKED` ou `RUNNING` |
| Missions en attente | missions `WAITING_INPUT` ou `WAITING_DEPENDENCY` |
| Missions bloquees | missions `ESCALATED` ou `FAILED` |
| Validation en cours | missions dans les etats de validation |

## 6.2 Vue Agents

Objectif : voir tous les agents.

Colonnes recommandees :

| Colonne | Role |
| --- | --- |
| Agent | nom, famille, role |
| Statut | statut derive |
| Mission active | mission principale actuelle |
| Charge | score + detail |
| Qualite | score + tendance |
| Blocages | nombre et criticite |
| Derniere activite | date relative et evenement |
| Historique | lien vers fiche agent |

Filtres :

- statut agent ;
- role family ;
- agent officiel ;
- charge ;
- qualite ;
- presence de blocage ;
- derniere activite.

## 6.3 Vue Workload

Objectif : comprendre la charge.

Affichages :

- matrice agents x missions ;
- file par agent ;
- charge par type de mission ;
- charge par perimetre ;
- evolution sur periode.

Indicateurs :

| Indicateur | Definition |
| --- | --- |
| `active_count` | nombre de missions non terminales |
| `running_count` | missions en execution |
| `waiting_count` | missions en attente |
| `blocked_count` | missions bloquees |
| `validation_count` | missions en validation |
| `weighted_load` | charge ponderee par etat et priorite |
| `staleness` | duree depuis derniere activite |

## 6.4 Vue Blockers

Objectif : traiter les blocages.

Groupes :

- attente input ;
- attente dependance ;
- escalade ;
- echec requalifiable ;
- conflit de verrou ;
- validation rejetee corrigeable.

Champs affiches :

- mission ;
- agent ;
- etat canonique ;
- cause ;
- autorite attendue ;
- dependance attendue ;
- age du blocage ;
- derniere tentative ;
- action recommandee.

Regles :

- un blocage sans cause explicite doit etre signale comme anomalie de reporting ;
- une attente ancienne doit remonter en priorite ;
- une escalade doit afficher l'autorite requise ;
- un conflit de verrou doit afficher le perimetre en conflit.

## 6.5 Vue Quality

Objectif : mesurer la qualite de production agent.

Dimensions :

| Dimension | Definition |
| --- | --- |
| Conformite schema | rapport conforme aux champs obligatoires |
| Conformite perimetre | absence de sortie hors mission |
| Livrables produits | livrables attendus presents |
| Taux de revision | corrections demandees |
| Taux de rejet | missions rejetees |
| Blocages causes par agent | blocages imputables a execution incomplete ou ambiguite creee |
| Delai de production | temps moyen de `RUNNING` a `SUBMITTED` |
| Lisibilite rapport | clarte, references, decision exploitable |

Scores :

- `quality_score` : score global 0-100 ;
- `compliance_score` : respect schema et perimetre ;
- `delivery_score` : production des livrables ;
- `revision_score` : stabilite apres controle ;
- `timeliness_score` : delais par rapport aux attentes ;
- `clarity_score` : lisibilite documentaire.

Regles :

- le score doit toujours etre explicable par dimensions ;
- aucun score ne remplace une validation humaine ;
- la qualite recente doit etre distinguee de la qualite historique ;
- les missions annulees ne penalise pas l'agent sauf cause agent prouvee.

## 6.6 Vue History

Objectif : reconstruire l'historique agent ou mission.

Niveaux :

- historique global ;
- historique par agent ;
- historique par mission ;
- historique par perimetre ;
- historique par type d'evenement.

Timeline minimum :

| Element | Role |
| --- | --- |
| timestamp | date de l'evenement |
| event_type | evenement canonique |
| mission_id | mission concernee |
| agent_id | agent concerne |
| state_before | etat precedent si connu |
| state_after | etat cible si connu |
| actor | producteur de l'evenement |
| reason | justification courte |
| artifact_ref | rapport, verrou, decision ou fichier |

---

# 7. Calcul de charge

## 7.1 Score de charge

Le score de charge est normalise de 0 a 100.

Formule conceptuelle :

```text
load_score =
  running_weight
  + waiting_weight
  + blocked_weight
  + validation_weight
  + priority_weight
  + staleness_weight
```

Ponderations de reference :

| Signal | Poids |
| --- | --- |
| Mission `RUNNING` | 30 |
| Mission `LOCKED` | 20 |
| Mission `WAITING_INPUT` | 12 |
| Mission `WAITING_DEPENDENCY` | 12 |
| Mission `ESCALATED` | 25 |
| Mission `FAILED` | 20 |
| Mission en validation | 10 |
| Priorite haute | +10 |
| Inactivite longue sur mission active | +5 a +15 |

Interpretation :

| Score | Niveau |
| --- | --- |
| 0 | disponible |
| 1-30 | faible charge |
| 31-60 | charge normale |
| 61-80 | charge haute |
| 81-100 | surcharge ou risque |

Regles :

- un agent bloque peut avoir une charge haute meme s'il ne travaille pas activement ;
- la charge mesure l'occupation operationnelle, pas la productivite ;
- la charge doit distinguer travail actif et attente externe.

## 7.2 Capacite

Chaque agent peut avoir une capacite de reference.

Champs :

- `max_parallel_missions` ;
- `preferred_mission_types` ;
- `restricted_mission_types` ;
- `cooldown_after_blocker` ;
- `requires_human_review`.

En V1, si aucune capacite explicite n'existe, la capacite par defaut est :

- 1 mission `RUNNING` ;
- missions en validation autorisees sans compter comme execution active ;
- attentes et blocages visibles mais non reutilises pour lancer automatiquement une nouvelle mission.

---

# 8. Calcul de qualite

## 8.1 Score global

Le score de qualite est normalise de 0 a 100.

Formule conceptuelle :

```text
quality_score =
  0.30 * compliance_score
  + 0.25 * delivery_score
  + 0.15 * revision_score
  + 0.15 * timeliness_score
  + 0.15 * clarity_score
```

## 8.2 Dimensions

### Compliance score

Mesure :

- schema de rapport complet ;
- statut canonique ;
- perimetre confirme ;
- absence de livrable supplementaire ;
- references autorisees.

### Delivery score

Mesure :

- tous les livrables attendus produits ;
- aucun livrable manquant ;
- format attendu respecte ;
- mission soumise dans un etat valide.

### Revision score

Mesure :

- nombre de revisions par mission ;
- severite des corrections ;
- recurrence des memes erreurs.

### Timeliness score

Mesure :

- delai de production ;
- delai de reponse apres revision ;
- age des blocages imputables a l'agent.

### Clarity score

Mesure :

- rapport comprehensible ;
- decisions et limites explicites ;
- fichiers crees ou modifies listables ;
- blocages factuels.

## 8.3 Qualite recent vs historique

Le Control Center expose deux lectures :

- `quality_recent` : missions des 10 dernieres executions ou periode recente ;
- `quality_lifetime` : historique complet disponible.

Regles :

- la qualite recente prime pour detecter une degradation ;
- la qualite historique aide a choisir un agent pour un nouveau type de mission ;
- le detail doit permettre de remonter aux missions qui expliquent le score.

---

# 9. Fiche agent

Chaque agent possede une fiche detaillee.

Sections :

1. Identite
2. Statut courant
3. Missions actives
4. Charge
5. Qualite
6. Blocages
7. Historique
8. Perimetres autorises et interdits
9. Rapports produits
10. Risques et recommandations

## 9.1 Identite

Champs :

- `agent_id` ;
- nom ;
- famille ;
- responsabilites ;
- perimetres ;
- criteres d'arret ;
- autorite ou limites.

## 9.2 Statut courant

Afficher :

- statut derive ;
- etat mission principal ;
- mission la plus critique ;
- age du statut ;
- prochaine action attendue.

## 9.3 Missions actives

Afficher :

- mission ;
- etat ;
- priorite ;
- verrou ;
- blocage ;
- dernier evenement ;
- livrables attendus.

## 9.4 Historique

Afficher :

- timeline ;
- table des missions terminees ;
- rapports ;
- validations ;
- revisions ;
- rejets ;
- blocages.

---

# 10. Modele d'information

## 10.1 Agent Registry View

```json
{
  "agent_id": "ARCHITECT_AGENT",
  "display_name": "Architect Agent",
  "role_family": "Architecture",
  "status": "WORKING",
  "active_missions_count": 1,
  "load_score": 45,
  "quality_score": 92,
  "last_activity_at": "YYYY-MM-DDTHH:MM:SSZ"
}
```

## 10.2 Agent Mission View

```json
{
  "mission_id": "L4-005",
  "agent_id": "PRODUCT_OWNER_AGENT",
  "state": "RUNNING",
  "derived_agent_status": "WORKING",
  "mission_type": "Architecture",
  "priority": "normal",
  "blocked_reason": null,
  "lock_id": "L4-005",
  "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
}
```

## 10.3 Agent Quality View

```json
{
  "agent_id": "QA_AGENT",
  "quality_score": 88,
  "quality_recent": 84,
  "quality_lifetime": 91,
  "compliance_score": 95,
  "delivery_score": 90,
  "revision_score": 82,
  "timeliness_score": 80,
  "clarity_score": 86
}
```

## 10.4 Blocker View

```json
{
  "mission_id": "ORCH-0001-B",
  "agent_id": "ARCHITECT_AGENT",
  "state": "ESCALATED",
  "blocked_since": "YYYY-MM-DDTHH:MM:SSZ",
  "blocked_reason": "Authority required",
  "required_authority": "Architect",
  "dependency_ref": null,
  "recommended_action": "Resolve escalation or requalify mission"
}
```

---

# 11. Actions autorisees

Le Control Center peut exposer des actions de pilotage, mais elles doivent rester conformes a la gouvernance.

Actions autorisees :

- ouvrir une fiche agent ;
- ouvrir une mission ;
- filtrer les agents ;
- consulter un rapport ;
- consulter un verrou ;
- consulter une timeline ;
- signaler un blocage ;
- demander une clarification ;
- demander une escalade ;
- preparer une requalification ;
- exporter une vue de supervision.

Actions interdites :

- accepter une mission sans autorite ;
- modifier directement un rapport agent ;
- changer l'etat canonique sans evenement ;
- reassigner un agent sans instruction explicite ;
- lancer plusieurs agents sur le meme perimetre sans orchestration ;
- masquer un blocage non resolu.

---

# 12. Regles UX

## 12.1 Priorite visuelle

Ordre d'affichage :

1. blocages critiques ;
2. attentes anciennes ;
3. missions en cours ;
4. validations en attente ;
5. agents disponibles ;
6. historique recent.

## 12.2 Codes visuels

| Situation | Badge |
| --- | --- |
| Agent travaille | `WORKING` |
| Agent attend | `WAITING` |
| Agent bloque | `BLOCKED` |
| Agent en validation | `REVIEWING` |
| Agent disponible | `AVAILABLE` |
| Mission verrouillee | `LOCKED` |

Regles :

- les badges agents sont derives, les badges missions restent canoniques ;
- l'utilisateur doit pouvoir passer d'un badge derive a l'etat mission source ;
- les blocages ne doivent pas etre seulement codes par couleur ;
- le temps depuis le dernier evenement doit etre visible pour les attentes et blocages.

## 12.3 Tables et timelines

La vue agents utilise une table dense.

La fiche agent utilise :

- une table pour les missions ;
- une timeline pour l'historique ;
- des cartes KPI pour charge et qualite ;
- un drawer ou panneau detail pour les rapports.

---

# 13. Alertes

Alertes de supervision :

| Alerte | Declencheur |
| --- | --- |
| `AGENT_OVERLOADED` | charge superieure a 80 |
| `AGENT_BLOCKED` | au moins une mission `ESCALATED` ou `FAILED` |
| `AGENT_WAITING_STALE` | attente au-dela du seuil |
| `QUALITY_DEGRADING` | qualite recente inferieure au seuil |
| `LOCK_CONFLICT` | conflit de verrou actif |
| `REPORT_MISSING` | mission soumise sans rapport localisable |
| `STATE_STALE` | mission active sans evenement recent |

Regles :

- une alerte doit pointer vers une mission ou un agent ;
- une alerte doit indiquer le signal declencheur ;
- une alerte ne modifie pas l'etat canonique ;
- une alerte resolue reste consultable dans l'historique.

---

# 14. Architecture logique

```text
Agent Control Center
|-- Agent Registry Reader
|-- Mission State Reader
|-- Lock Reader
|-- Report Reader
|-- Event Journal Reader
|-- Agent Status Deriver
|-- Workload Scorer
|-- Quality Scorer
|-- Blocker Prioritizer
|-- History Builder
`-- UX Views
    |-- Overview
    |-- Agents
    |-- Workload
    |-- Blockers
    |-- Quality
    `-- Agent Detail
```

## 14.1 Responsabilites

| Composant | Responsabilite |
| --- | --- |
| Agent Registry Reader | lire les agents officiels |
| Mission State Reader | lire les missions et etats canoniques |
| Lock Reader | lire les verrous actifs et conflits |
| Report Reader | lire les rapports et validations |
| Event Journal Reader | lire les evenements |
| Agent Status Deriver | calculer `WORKING`, `WAITING`, `BLOCKED`, etc. |
| Workload Scorer | calculer la charge |
| Quality Scorer | calculer la qualite |
| Blocker Prioritizer | classer les blocages |
| History Builder | construire timelines |
| UX Views | exposer les vues utilisateur |

---

# 15. Critere d'acceptation

Le livrable L4-005 est conforme si le Control Center permet de repondre sans interpretation externe a :

- voir tous les agents ;
- identifier qui travaille ;
- identifier qui attend ;
- identifier qui est bloque ;
- comprendre la charge par agent ;
- comprendre la qualite par agent ;
- consulter l'historique par agent ;
- remonter d'un statut derive vers l'etat canonique source ;
- distinguer attente, blocage, escalade et echec ;
- tracer les signaux de charge et de qualite ;
- respecter les interdictions de gouvernance.

---

# 16. Synthese

L'Agent Control Center est la vue de supervision agentique de NOVA ORCHESTRATOR.

Il ne remplace ni l'Orchestrator, ni le State Manager, ni les autorites de validation. Il consolide les agents, missions, etats, verrous, rapports et evenements pour rendre l'activite lisible :

- qui travaille ;
- qui attend ;
- qui est bloque ;
- quelle charge porte chaque agent ;
- quelle qualite produit chaque agent ;
- quel historique explique la situation courante.
