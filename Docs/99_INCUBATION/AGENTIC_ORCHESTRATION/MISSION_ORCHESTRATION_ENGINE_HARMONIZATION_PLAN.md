# MISSION ORCHESTRATION ENGINE - HARMONIZATION PLAN

MISSION_ID : P15-MO-004-MISSION-ORCHESTRATION-HARMONIZATION

PROGRAM : PROGRAM-015

MISSION_ORDER : P15-MO-004

PDS : PDS-005

DATE : 2026-07-09

DOCUMENT CIBLE : `MISSION_ORCHESTRATION_ENGINE.md`

STATUT : PLAN DE CONVERGENCE

---

# 1. Objectif

Definir le plan officiel de convergence permettant de faire evoluer `MISSION_ORCHESTRATION_ENGINE.md` vers une specification certifiable, sans modifier les documents d'architecture existants.

Ce plan se base sur la verite de reference fournie par PDS-004 :

- certification initiale : NON CERTIFIE ;
- etats non canoniques ;
- evenements non canoniques ;
- entites non definies ;
- API absente ;
- mapping Runtime / State / Event absent ;
- compatibilite partielle avec PROGRAM-014 ;
- compatibilite partielle avec PROGRAM-015.

---

# 2. Perimetre de convergence

Documents compares :

- `MISSION_ORCHESTRATION_ENGINE.md`
- `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
- `ORCHESTRATOR_STATE_MODEL_V1.md`
- `ORCHESTRATOR_EVENT_ARCHITECTURE_V1.md`
- `ORCHESTRATOR_API_SURFACE_V1.md`
- `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
- `ORCHESTRATOR_V1_ARCHITECTURE.md`

Contraintes :

- aucun document existant ne peut etre modifie ;
- aucun code ne peut etre modifie ;
- aucun runtime ne peut etre modifie ;
- seules les documents de convergence peuvent etre crees.

---

# 3. Synthese des ecarts

| Domaine | Etat actuel | Etat cible | Severite |
| --- | --- | --- | --- |
| Entites | Portfolio, Program, Mission Order, PDS, Campaign | Domain Model + Planning Model canoniques ou aliases explicites | P0 |
| Etats | PLANNED, ACTIVE, BLOCKED, SUSPENDED, COMPLETE, APPROVED, PREPARING, WAITING, COMPLETED, STOPPED, OPEN, PASSED, CLOSED | Etats canoniques V1 ou mapping formel | P0 |
| Evenements | PortfolioActivated, PDSStarted, CampaignPassed, etc. | Evenements canoniques V1 ou mapping formel | P0 |
| API | Aucune surface publique definie | Routes, commands, responses, errors, authz | P0 |
| Runtime | Orchestration multi-entites implicite | Runtime V1 + extension future isolee | P0 |
| Planning | Melange runtime / pilotage programme | Separation claire execution / planning | P1 |
| Recovery | Rollback / resume generiques | Reprise gouvernee et certifiable | P1 |
| Migration | Absente | Strategie par etapes et certification intermediaire | P0 |

---

# 4. Principes de convergence

1. Aucun nouveau concept ne devient canonique sans mapping explicite.
2. Aucun etat ou evenement non canonique ne doit rester operationnel sans evolution du dictionnaire.
3. Le Runtime V1 reste la source de verite pour la mission, l'etat, l'evenement et la validation.
4. Le pilotage programme peut etre cible future, mais il ne doit pas remplacer le contrat V1.
5. Chaque etape de convergence doit etre certifiable independamment.
6. La compatibilite PROGRAM-014 et PROGRAM-015 doit etre preservee par migration, pas par reinterpretation.

---

# 5. Axe de convergence

## 5.1 Renommage

Renommer seulement ce qui peut etre traduit sans perte de sens et sans nouvelle semantique.

Exemples de cibles :

- `Program` vers `Programme` si rattachement au Domain Model V1 ;
- `Campaign` vers objet de validation ou d'execution de programme si mapping explicite ;
- `Mission Order` vers paquet de missions ou `Project` si le contenu le permet ;
- `PDS` vers Mission Delivery Unit ou sous-ensemble mission si la structure le permet.

## 5.2 Suppression

Supprimer du futur contrat toutes les notions qui ne peuvent pas etre mappees proprement vers :

- Dictionary V1 ;
- State Model V1 ;
- Event Architecture V1 ;
- API Surface V1 ;
- Domain Model V1 ;
- Program Planning Model V1.

## 5.3 Fusion

Fusionner les concepts qui decrivent la meme realite operationnelle sous des noms differents.

Exemples :

- `ACTIVE` / `RUNNING` si un seul etat de runtime doit rester visible ;
- `BLOCKED` / `WAITING_INPUT` / `WAITING_DEPENDENCY` / `ESCALATED` si le futur contrat exige un seul blocage canonique par cause ;
- `COMPLETE` / `ACCEPTED` si la validation finale doit rester la seule fermeture positive.

## 5.4 Conservation

Conserver les principes deja alignes :

- evidence first ;
- immutable events ;
- lock discipline ;
- traceability ;
- dependency gating ;
- explicit governance ;
- no silent conflict resolution.

## 5.5 Ajout

Ajouter uniquement les artefacts de convergence :

- mapping canonique ;
- roadmap de convergence ;
- migration strategy ;
- harmonization plan.

---

# 6. Parcours certifiable

Le document cible ne doit pas etre certifie en bloc.

Le parcours certifiable est :

1. produire le mapping canonique ;
2. definir la strategie de migration ;
3. definir la roadmap de convergence ;
4. isoler les etapes independantes et certifiables ;
5. seulement ensuite, demander une nouvelle certification du document cible.

---

# 7. Decision de plan

Decision : GO.

Motif :

- les ecarts sont identifies ;
- les dependances sont connues ;
- le trajet de convergence est faisable sans modifier les documents sources ;
- la migration peut etre organisee en jalons certifiables.

