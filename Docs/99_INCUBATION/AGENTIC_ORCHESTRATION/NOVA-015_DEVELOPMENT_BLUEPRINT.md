# NOVA-015 - Development Blueprint

MISSION_ID : NOVA-015

AGENT : AGENT 15 - Development Blueprint

STATUT : DRAFT_VALIDABLE

DATE : 2026-07-02

OBJET : Transformation des 14 EPIC precedents en backlog de developpement organise en 6 sprints

---

## 1. Objectif

Ce document transforme les cadrages NOVA precedents en backlog de developpement executable.

Il sert de passerelle entre :

- la vision produit ;
- l'architecture cible ;
- le modele de domaine ;
- les agents officiels ;
- les regles produit ;
- les surfaces ORCHESTRATOR ;
- les travaux de developpement, validation et livraison.

Le blueprint ne remplace pas les sources d'autorite. Il ordonne les travaux sous forme de sprints, lots, stories, criteres d'acceptation et dependances.

---

## 2. Sources utilisees

| Reference | Source locale | Role dans le backlog |
| --- | --- | --- |
| NOVA-001 | `Docs/01_PRODUCT_VISION/` | Vision produit, personas, use cases, business model, principes produit |
| NOVA-002 | `Docs/14_ENTERPRISE_ARCHITECTURE/01_PRODUCT_ARCHITECTURE/NOVA-002_PRODUCT_ARCHITECTURE.md` | Architecture produit cible |
| NOVA-003 | `NOVA-003_DOMAIN_MODEL.md` | Modele canonique des objets Programme, Projet, Mission, Decision, Agent, Conversation, Memory, Graph, Simulation, Plugin, Runtime, Executive |
| NOVA-004 | `ORCHESTRATOR_API_SURFACE_V1.md` | Surface API, CLI, SDK, UI future, authentification, autorisation |
| NOVA-005 | `Docs/09_CEREBRAU OPERATING SYSTEM/03_AGENTS/EXECUTIVE_AGENT.md` | Executive Agent, consensus, arbitrage, decision, confiance |
| NOVA-006 | `ORCHESTRATOR_STATE_MODEL_V1.md`, `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`, `ORCH-0001-B_WORKFLOW.md` | Etats, transitions, contrat runtime, workflow d'execution |
| NOVA-007 | `Docs/09_CEREBRAU OPERATING SYSTEM/03_AGENTS/NOVA-007_AGENT_PLATFORM/` | Plateforme agents et agents specialises |
| NOVA-008 | `L4-003_MISSION_WORKSPACE.md` | Mission Workspace |
| NOVA-009 | `L4-005_AGENT_CONTROL_CENTER.md` | Agent Control Center |
| NOVA-010 | `L4-007_RUNTIME_OBSERVATORY.md` | Runtime Observatory |
| NOVA-011 | `L4-008_PROGRAM_PLANNER.md` | Program Planner |
| NOVA-012 | `L4-009_ORCHESTRATOR_NAVIGATION_MODEL_V1.md`, `ORCHESTRATOR_INFORMATION_ARCHITECTURE_V1.md` | Navigation et architecture de l'information |
| NOVA-013 | `Docs/09_CEREBRAU OPERATING SYSTEM/05_RULES/PRODUCT-RULE-*.md` | Regles produit runtime, executive, agents et UX |
| NOVA-014 | `ORCHESTRATION_GOVERNANCE.md`, `ARCH-RULE-*.md`, `KNOWLEDGE_GOVERNANCE.md` | Gouvernance, conformite architecture, knowledge governance |

Note de tracabilite : certaines missions NOVA ne disposent pas d'un fichier portant directement leur identifiant. Le rattachement ci-dessus utilise les livrables locaux disponibles et leur role fonctionnel dans la chaine NOVA.

---

## 3. Backlog EPIC

| EPIC | Titre | Objectif de developpement | Priorite | Sprint cible |
| --- | --- | --- | --- | --- |
| EPIC-01 | Product Vision Runtime | Traduire vision, personas et use cases en exigences produit testables | P0 | Sprint 1 |
| EPIC-02 | Product Architecture Baseline | Poser les modules, frontieres, contrats et contraintes architecture | P0 | Sprint 1 |
| EPIC-03 | Domain Model Core | Implementer les objets Programme, Projet, Mission, Decision, Agent et Executive | P0 | Sprint 1-2 |
| EPIC-04 | API Surface | Exposer les premiers contrats REST/CLI/SDK pour lecture et mutation gouvernee | P0 | Sprint 2 |
| EPIC-05 | Executive Agent | Implementer consolidation, arbitrage, decision et confiance | P1 | Sprint 3 |
| EPIC-06 | Runtime State Engine | Implementer et verifier les etats, transitions, verrous, rapports et arrets | P0 | Sprint 2 |
| EPIC-07 | Agent Platform | Declarer, charger et superviser la bibliotheque agents officielle | P0 | Sprint 2-3 |
| EPIC-08 | Mission Workspace | Construire la surface de travail mission avec contexte, livrables, etats et rapport | P1 | Sprint 3 |
| EPIC-09 | Agent Control Center | Superviser agents, charge, blocages, qualite et historique | P1 | Sprint 4 |
| EPIC-10 | Runtime Observatory | Observer executions, evenements, anomalies, reprises et sante runtime | P1 | Sprint 4 |
| EPIC-11 | Program Planner | Piloter roadmap, jalons, objectifs, capacite, dependances et simulations | P2 | Sprint 5 |
| EPIC-12 | Navigation Model | Unifier navigation, information architecture et parcours de pilotage | P1 | Sprint 5 |
| EPIC-13 | Product Rules Compliance | Appliquer les regles runtime, executive, agents et UX dans les livraisons | P0 | Sprint 1-6 |
| EPIC-14 | Governance & Knowledge | Garantir gouvernance, architecture compliance, knowledge index et auditabilite | P0 | Sprint 1-6 |

---

## 4. Sprint 1 - Fondation produit et architecture

### Objectif

Rendre le programme developpable : perimetre, architecture, modele minimal, standards de qualite et premiere definition de done.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S1-L01 | EPIC-01 | Formaliser les exigences produit issues de NOVA-001 | Catalogue d'exigences produit P0/P1 | Chaque exigence est reliee a un persona, un use case ou un principe produit |
| S1-L02 | EPIC-02 | Etablir l'architecture baseline developpement | Architecture cible executable et frontieres de modules | Aucune story technique ne traverse une frontiere sans contrat |
| S1-L03 | EPIC-03 | Definir les schemas conceptuels minimum | Contrats `Program`, `Project`, `Mission`, `Decision`, `Agent`, `Executive` | Identifiants, statuts, relations et source de verite presents |
| S1-L04 | EPIC-13 | Integrer les regles produit comme quality gates | Checklist runtime, agents, executive, UX | Toute story Sprint 2+ reference les gates applicables |
| S1-L05 | EPIC-14 | Installer la gouvernance backlog | Template story, template decision, template rapport, traceability matrix | Toute story possede source, statut, owner, criteres d'acceptation |

### Definition of Done Sprint 1

- Backlog initial cree et priorise.
- Concepts metier P0 stables.
- Regles produit et gouvernance references dans les stories.
- Aucun developpement runtime n'est lance sans contrat minimal.

---

## 5. Sprint 2 - Runtime core et API minimale

### Objectif

Construire le noyau executable : mission, etat, transition, verrou, rapport, API minimale et registre agents.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S2-L01 | EPIC-06 | Implementer le state engine mission | Transitions canoniques et validations d'etat | Transition invalide refusee avec erreur explicite |
| S2-L02 | EPIC-06 | Implementer lock manager et criteres d'arret | Verrous, blocages, arrets et liberation controlee | Deux mutations concurrentes ne corrompent pas l'etat |
| S2-L03 | EPIC-04 | Exposer l'API minimale mission | Endpoints creer, lire, transitionner, rapporter | Toute mutation passe par validation schema, scope et transition |
| S2-L04 | EPIC-07 | Charger la bibliotheque agents officielle | Registry agents versionne | Agent inconnu refuse ; agent connu expose perimetre autorise/interdit |
| S2-L05 | EPIC-03 | Persister les objets core | Stockage ou repository minimal pour missions, agents, decisions | Lecture apres ecriture verifiee par tests |

### Definition of Done Sprint 2

- Une mission peut etre creee, transitionnee, verrouillee et cloturee.
- L'API minimale respecte separation lecture/mutation.
- Les agents officiels sont consultables depuis un registre.
- Les tests couvrent transitions valides, transitions invalides, verrous et erreurs.

---

## 6. Sprint 3 - Execution agentique et Mission Workspace

### Objectif

Rendre l'execution mission exploitable par agents et humains : contexte, livrables, rapport, executive decision et espace mission.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S3-L01 | EPIC-08 | Construire le Mission Workspace | Vue mission : contexte, statut, agent, livrables, rapport | Une mission active est lisible sans consulter plusieurs fichiers |
| S3-L02 | EPIC-07 | Executer une mission avec agent assigne | Dispatch agent controle | Agent hors perimetre bloque avant execution |
| S3-L03 | EPIC-05 | Produire une decision executive | Consensus, conflits, ponderation, decision, confiance | Decision contient option, motif, conditions, risques et autorite |
| S3-L04 | EPIC-06 | Valider le rapport agent | Report validator conforme au schema | Rapport incomplet refuse avec raison actionnable |
| S3-L05 | EPIC-13 | Appliquer les regles UX et agents | Gates UX/agents integrees au workflow | Aucun composant interne CEREBRAU expose comme fonctionnalite utilisateur finale |

### Definition of Done Sprint 3

- Le cycle mission -> agent -> rapport -> validation -> decision est demonstrable.
- Les erreurs sont comprehensibles et journalisables.
- Le Mission Workspace ne court-circuite pas le runtime.
- L'Executive Agent n'arbitre que dans son mandat.

---

## 7. Sprint 4 - Supervision, observabilite et qualite runtime

### Objectif

Donner une vision operationnelle du systeme : agents, activite, blocages, qualite, evenements, anomalies et reprise.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S4-L01 | EPIC-09 | Construire l'Agent Control Center | Liste agents, statuts, charge, blocages, historique | Les agents actifs, bloques et disponibles sont distinguables |
| S4-L02 | EPIC-10 | Construire l'event timeline runtime | Evenements mission, transitions, erreurs, reprises | Chaque mutation sensible produit un evenement auditable |
| S4-L03 | EPIC-10 | Implementer indicateurs de sante runtime | Etat de sante, anomalies, latence logique, erreurs | Une anomalie est reliee a mission, agent, etat ou API |
| S4-L04 | EPIC-09 | Ajouter qualite et historique agent | Scores explicables, historique rapports, blocages recurrents | Aucun score opaque sans detail explicatif |
| S4-L05 | EPIC-14 | Auditer conformite architecture et knowledge | Rapport de conformite sprint | Toute divergence est classee : bloquante, reserve, dette |

### Definition of Done Sprint 4

- Les missions et agents ne sont plus des boites noires.
- Les blocages sont visibles et priorisables.
- Les evenements critiques sont traces.
- La qualite agent est explicable et non punitive par defaut.

---

## 8. Sprint 5 - Pilotage programme et navigation

### Objectif

Passer du pilotage mission au pilotage programme : roadmap, jalons, objectifs, dependances, capacite, simulation et navigation transversale.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S5-L01 | EPIC-11 | Construire le Program Planner baseline | Program header, roadmap, milestones, objectives | Chaque projet ou mission visible est relie a un objectif ou jalon |
| S5-L02 | EPIC-11 | Ajouter dependances et capacite | Capacity panel et dependency map | Saturation ou dependance critique visible avant arbitrage |
| S5-L03 | EPIC-11 | Ajouter simulation prospective | Scenarios, hypotheses, impacts, comparaison | Une simulation ne modifie aucune source de verite |
| S5-L04 | EPIC-12 | Implementer navigation transverse | Parcours Program -> Project -> Mission -> Agent -> Decision | L'utilisateur peut revenir a la source de verite depuis toute vue |
| S5-L05 | EPIC-12 | Aligner information architecture et libelles | Menu, sections, etats vides, detail views | Aucun concept non canonique n'est introduit par l'UI |

### Definition of Done Sprint 5

- Un directeur de programme peut lire trajectoire, risques, charge et decisions.
- Les simulations sont separees des decisions.
- La navigation suit le modele canonique.
- Les libelles UI respectent le dictionnaire et les regles produit.

---

## 9. Sprint 6 - Durcissement, certification et release candidate

### Objectif

Transformer le prototype gouverne en release candidate : tests, securite, audit, documentation, migration, certification et plan de livraison.

### Lots

| Lot | EPIC | Story | Sortie attendue | Acceptance criteria |
| --- | --- | --- | --- | --- |
| S6-L01 | EPIC-13 | Executer certification product rules | Rapport de conformite runtime/executive/agents/UX | Aucun blocage P0 ouvert |
| S6-L02 | EPIC-14 | Executer certification gouvernance et architecture | Rapport architecture compliance et knowledge governance | Toute exception possede decision ou dette documentee |
| S6-L03 | EPIC-04 | Stabiliser API/CLI/SDK contracts | Contrats versionnes, erreurs standardisees | Breaking changes documentes ou refuses |
| S6-L04 | EPIC-06 | Tests resilience runtime | Tests reprises, verrous, idempotence, erreurs | Les actions critiques sont idempotentes ou protegees |
| S6-L05 | EPIC-01 | Validation produit finale | Trace use cases -> stories -> tests -> livrables | Les use cases P0 sont couverts par demonstrations ou tests |
| S6-L06 | EPIC-14 | Preparer release candidate | Release notes, risques residuels, go/no-go | Decision finale : GO, GO_AVEC_RESERVES, NO_GO ou ESCALADE |

### Definition of Done Sprint 6

- Les parcours P0 sont demonstrables.
- Les contrats API et runtime sont stabilises.
- Les risques residuels sont explicites.
- Une decision de release candidate est possible.

---

## 10. Dependances majeures

| Dependence | Impact | Gestion |
| --- | --- | --- |
| Modele de domaine avant API | L'API expose des objets qui doivent etre stables | Sprint 1 verrouille le noyau conceptuel |
| Runtime avant Workspace | Le Workspace ne doit pas porter la logique metier canonique | Sprint 2 livre state engine et API minimale |
| Agent Registry avant Control Center | Le Control Center supervise des agents officiels uniquement | Sprint 2 livre registry, Sprint 4 supervise |
| Observabilite avant certification | La certification exige traces et preuves | Sprint 4 livre timeline et audit |
| Program Planner apres missions | Le planner depend des missions, objectifs et decisions | Sprint 5 seulement apres runtime et workspace |
| Regles produit transverses | Les gates s'appliquent a tous les sprints | EPIC-13 reste actif de Sprint 1 a 6 |

---

## 11. Risques et garde-fous

| Risque | Niveau | Garde-fou |
| --- | --- | --- |
| Confondre mission, projet et programme | Eleve | Tests de navigation et validation du modele canonique |
| Mettre de la logique metier dans l'UI | Eleve | API/runtime comme source de verite des mutations |
| Creer des agents hors bibliotheque officielle | Moyen | Registry versionne et refus des agents inconnus |
| Transformer simulation en decision | Eleve | Separation stricte simulation, recommandation, decision |
| Exposer CEREBRAU a l'utilisateur final VEEDDA | Eleve | Regle d'isolation des couches internes |
| Certification documentaire sans preuve runtime | Moyen | Evidence timeline et rapport de conformite obligatoire |

---

## 12. Backlog initial normalise

Format recommande pour chaque story :

```text
ID :
EPIC :
Sprint :
Titre :
Objectif :
Source :
Type : Feature | Tech | Test | Doc | Governance
Priorite : P0 | P1 | P2
Owner :
Dependances :
Criteres d'acceptation :
Tests attendus :
Definition of Done :
Statut :
```

Statuts autorises :

- `BACKLOG`
- `READY`
- `IN_PROGRESS`
- `BLOCKED`
- `REVIEW`
- `DONE`
- `DEFERRED`

---

## 13. Critere de validation NOVA-015

NOVA-015 est validable si :

- les 14 EPIC precedents sont representes dans le backlog ;
- chaque EPIC possede un sprint cible ;
- les dependances structurantes sont explicites ;
- chaque sprint a un objectif, des lots et une definition of done ;
- les regles produit et gouvernance restent transverses ;
- aucune implementation n'est exigee avant stabilisation des contrats minimaux ;
- les incertitudes de tracabilite sont indiquees sans inventer de source absente.
