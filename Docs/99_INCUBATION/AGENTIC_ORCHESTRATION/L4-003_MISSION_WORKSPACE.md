# L4-003 - Mission Workspace

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : L4-003

Objet : Fiche Mission comme centre de pilotage

Contrainte : pas de maquette, pas de composant React

---

# 1. Objet

Ce document definit le `Mission Workspace` de l'ORCHESTRATOR V1.

Le `Mission Workspace` remplace la notion de simple fiche Mission.

Il constitue le centre de pilotage operationnel d'une mission : un espace unique permettant de comprendre, executer, controler, arbitrer et cloturer une mission dans son perimetre gouverne.

Il doit permettre de repondre immediatement aux questions suivantes :

- quelle est la mission ;
- ou en est-elle ;
- qui en est responsable ;
- quel verrou protege son perimetre ;
- quelle action est attendue maintenant ;
- quels livrables sont attendus ou produits ;
- quels rapports et validations existent ;
- quel blocage, conflit ou arbitrage empeche l'avancement ;
- quelle preuve explique l'etat courant ;
- quelles actions sont autorisees pour mon role.

---

# 2. Sources de verite

Le `Mission Workspace` respecte :

1. `ORCHESTRATOR_CANONICAL_DICTIONARY_V1.md`
2. `ORCHESTRATOR_STATE_MODEL_V1.md`
3. `ORCH-0001-B_WORKFLOW.md`
4. `ORCHESTRATOR_RUNTIME_CONTRACT_V1.md`
5. `ORCHESTRATOR_API_SURFACE_V1.md`
6. `ORCHESTRATOR_INFORMATION_ARCHITECTURE_V1.md`
7. `ORCHESTRATOR_COGNITIVE_ERGONOMICS_V1.md`
8. `ORCHESTRATION_GOVERNANCE.md`

Le workspace ne cree aucun etat, role, transition ou autorite supplementaire.

---

# 3. Definition

## 3.1 Ce que le Mission Workspace est

Le `Mission Workspace` est :

- un poste de pilotage ;
- un espace de decision contextualisee ;
- un tableau de bord local a une mission ;
- une console de controle des transitions ;
- un point de convergence des verrous, rapports, validations, evenements et escalades ;
- une surface d'action gouvernee par role et par etat.

## 3.2 Ce que le Mission Workspace n'est pas

Le `Mission Workspace` n'est pas :

- une fiche descriptive passive ;
- une page de lecture documentaire ;
- une simple liste de champs ;
- un journal d'evenements brut ;
- une page d'administration ;
- une maquette graphique ;
- un substitut au Product Owner ou a l'Architecte.

---

# 4. Role operationnel

Le `Mission Workspace` concentre cinq fonctions.

| Fonction | Objectif |
| --- | --- |
| Comprendre | Identifier la mission, son objectif, son etat, son responsable et son perimetre |
| Piloter | Voir l'action attendue, les transitions possibles et les blocages |
| Controler | Verifier livrables, rapports, validations, verrous et conformite |
| Arbitrer | Exposer clairement les conflits, escalades et autorites requises |
| Cloturer | Rendre visible le chemin vers `ACCEPTED`, `REJECTED` ou `CANCELLED` |

---

# 5. Structure conceptuelle

Le workspace est organise en huit zones fonctionnelles.

| Zone | Role | Priorite |
| --- | --- | --- |
| Header mission | Identite, etat, responsabilite, criticite | Primaire |
| Action Center | Action attendue et transitions autorisees | Primaire |
| State Panel | Etat courant, etat precedent, prochaine transition | Primaire |
| Scope and Lock | Perimetre autorise, perimetre interdit, verrou actif | Primaire |
| Deliverables and Reports | Livrables attendus, rapports produits, pieces associees | Secondaire |
| Validation Hub | Validations technique, documentaire et humaine | Secondaire |
| Risk and Escalation | Blocages, conflits, arbitrages et dependances | Primaire si actif |
| Evidence Timeline | Evenements, preuves, correlation et audit | Tertiaire par defaut |

Regle :

Une zone secondaire peut devenir primaire si l'etat courant l'exige.

Exemples :

- en `SUBMITTED`, `Validation Hub` devient primaire ;
- en `LOCKED`, `Scope and Lock` devient primaire ;
- en `ESCALATED`, `Risk and Escalation` devient primaire ;
- en `FAILED`, `Risk and Escalation` et `Evidence Timeline` deviennent primaires.

---

# 6. Header mission

## 6.1 Informations obligatoires

Le header mission affiche conceptuellement :

- `project_id` ;
- `mission_id` ;
- titre ou objectif court ;
- etat canonique courant ;
- groupe d'etat ;
- agent principal ;
- autorite attendue si applicable ;
- verrou actif si applicable ;
- dernier evenement significatif ;
- indicateur de blocage si applicable.

## 6.2 Regles

Le header doit rester stable pendant toute la consultation de la mission.

Il ne doit pas etre remplace par un sous-objet comme un rapport, un verrou ou une validation.

Tout changement d'etat doit etre visible dans le header.

---

# 7. Action Center

## 7.1 Role

L'`Action Center` indique ce qu'il faut faire maintenant.

Il ne liste pas toutes les actions possibles comme une barre d'outils generique.

Il expose uniquement :

- l'action principale autorisee ;
- les actions secondaires utiles ;
- les actions bloquees avec leur raison ;
- l'autorite requise si l'action n'est pas disponible ;
- l'effet attendu sur l'etat.

## 7.2 Actions par etat

| Etat courant | Action principale attendue |
| --- | --- |
| `DRAFT` | Completer ou valider pour execution |
| `READY` | Affecter un agent |
| `ASSIGNED` | Demander ou confirmer le verrou |
| `LOCKED` | Demarrer l'execution |
| `RUNNING` | Produire, signaler blocage ou soumettre |
| `WAITING_INPUT` | Fournir l'information ou escalader |
| `WAITING_DEPENDENCY` | Relier la dependance ou escalader |
| `ESCALATED` | Arbitrer ou requalifier |
| `SUBMITTED` | Lancer le controle applicable |
| `TECHNICAL_VALIDATION` | Valider techniquement ou demander revision |
| `DOCUMENTARY_VALIDATION` | Valider documentairement ou demander revision |
| `HUMAN_VALIDATION` | Accepter, rejeter ou demander revision |
| `NEEDS_REVISION` | Reprendre la correction bornee |
| `FAILED` | Requalifier ou annuler |
| `ACCEPTED` | Lecture et audit |
| `REJECTED` | Lecture et audit |
| `CANCELLED` | Lecture et audit |

## 7.3 Regles

Une action interdite ne doit pas etre presentee comme disponible.

Une action masquee pour raison d'autorisation doit pouvoir etre expliquee.

Une action critique doit rappeler :

- l'etat source ;
- l'etat cible ;
- l'autorite ;
- l'impact sur le verrou ;
- l'evenement qui sera produit.

---

# 8. State Panel

## 8.1 Role

Le `State Panel` donne la comprehension instantanee du cycle de vie.

Il affiche :

- etat courant ;
- etat precedent ;
- transition qui a conduit a l'etat courant ;
- transitions sortantes autorisees ;
- transitions interdites pertinentes ;
- raison du blocage si l'etat est bloquant ;
- terminalite si l'etat est terminal.

## 8.2 Regle de reduction cognitive

Le State Panel ne doit pas afficher la machine a etats complete par defaut.

Il affiche seulement le voisinage utile de l'etat courant :

- d'ou vient la mission ;
- ou elle est maintenant ;
- ou elle peut aller ensuite.

---

# 9. Scope and Lock

## 9.1 Role

`Scope and Lock` protege le perimetre de mission.

Il expose :

- perimetre autorise ;
- perimetre interdit ;
- fichiers, dossiers ou domaines concernes ;
- verrou actif ;
- proprietaire du verrou ;
- condition de liberation ;
- conflit de verrou ;
- verrou orphelin si applicable.

## 9.2 Regles

Une mission en execution sans verrou doit etre signalee comme anomalie de pilotage.

Un conflit de verrou doit bloquer les actions concurrentes.

Une liberation de verrou doit etre reliee a une autorite ou a un etat terminal.

---

# 10. Deliverables and Reports

## 10.1 Role

Cette zone relie les attendus et les preuves de production.

Elle expose :

- livrables attendus ;
- livrables produits ;
- livrables manquants ;
- livrables supplementaires detectes ;
- rapports soumis ;
- agent auteur ;
- statut de controle du rapport ;
- pieces ou artefacts associes.

## 10.2 Regles

Un livrable supplementaire doit etre signale comme risque de perimetre.

Un rapport ne vaut pas acceptation.

Un livrable produit mais non valide reste distinct d'un livrable accepte.

---

# 11. Validation Hub

## 11.1 Role

Le `Validation Hub` concentre les controles de la mission.

Il expose :

- validation technique ;
- validation documentaire ;
- validation humaine ;
- validations manquantes ;
- revision demandee ;
- rejet ;
- autorite ou validateur responsable ;
- consequence sur l'etat.

## 11.2 Regles

`SUBMITTED` ne doit jamais etre presente comme `ACCEPTED`.

Une validation humaine positive est necessaire avant `ACCEPTED`.

Une validation negative doit indiquer si la mission passe en `NEEDS_REVISION`, `REJECTED`, `ESCALATED` ou `FAILED`.

---

# 12. Risk and Escalation

## 12.1 Role

Cette zone devient centrale lorsque la mission ne peut pas avancer nominalement.

Elle expose :

- type de blocage ;
- conflit detecte ;
- dependance manquante ;
- autorite requise ;
- question ouverte ;
- impact sur le verrou ;
- condition minimale de reprise ;
- decision attendue.

## 12.2 Types couverts

| Type | Information a afficher |
| --- | --- |
| Input manquant | Information attendue, demandeur, impact |
| Dependance manquante | Objet attendu, source, mission amont si connue |
| Escalade | Autorite requise, motif, arbitrage attendu |
| Echec | Cause factuelle, perimetre impacte, reprise possible |
| Conflit | Type, objets en conflit, regle concernee |
| Verrou concurrent | Verrou actif, proprietaire, condition de liberation |

## 12.3 Regle

Le workspace ne doit pas proposer de contournement d'un blocage.

Il doit rendre le blocage lisible et orienter vers l'escalade ou la reprise autorisee.

---

# 13. Evidence Timeline

## 13.1 Role

L'`Evidence Timeline` explique pourquoi la mission est dans son etat courant.

Elle expose :

- derniers evenements significatifs ;
- transitions d'etat ;
- operations de verrou ;
- depots de rapports ;
- validations ;
- escalades ;
- erreurs ;
- `request_id` ;
- `correlation_id`.

## 13.2 Regles

La timeline complete est secondaire par defaut.

Le dernier evenement significatif reste toujours accessible depuis le header ou le State Panel.

Une action critique doit produire un evenement visible dans la timeline.

---

# 14. Modes de lecture par role

| Role | Focus principal |
| --- | --- |
| Product Owner | Decision attendue, validation humaine, escalade, impact de cloture |
| Architecte | Perimetre, coherence documentaire, dependances, requalification |
| Orchestrator | Etat, agent, verrou, transitions, conflits |
| Agent | Objectif, perimetre, livrables, rapport a produire, blocage |
| Validator Technical | Rapport, schema, coherence technique, validation technique |
| Validator Documentary | Perimetre, sources, livrables, validation documentaire |
| Viewer | Lecture, etat, historique autorise |

Regle :

Le workspace adapte la priorite d'information au role sans modifier la verite canonique de la mission.

---

# 15. Etats du workspace

Le workspace possede un mode de pilotage derive de l'etat mission.

| Mode workspace | Etats mission | Intention |
| --- | --- | --- |
| Preparation | `DRAFT`, `READY`, `ASSIGNED` | Rendre la mission executable |
| Execution | `LOCKED`, `RUNNING` | Piloter la production |
| Blocage | `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED`, `FAILED` | Comprendre et lever l'arret |
| Controle | `SUBMITTED`, `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION` | Valider ou demander revision |
| Terminal | `ACCEPTED`, `REJECTED`, `CANCELLED` | Lire, auditer, capitaliser si prevu |

---

# 16. Relations avec les autres vues

| Depuis Mission Workspace | Vers | Usage |
| --- | --- | --- |
| Header | Mission Board | Retour collection |
| Scope and Lock | Lock Detail | Analyse du verrou |
| Deliverables and Reports | Report Detail | Lecture du rapport |
| Validation Hub | Validation Detail | Controle et decision |
| Risk and Escalation | Governance Center | Reference de regle ou autorite |
| Evidence Timeline | Event Timeline | Audit complet filtre mission |
| Action Center | API / Runtime transition | Mutation gouvernee |

Le `Mission Workspace` reste le point de retour apres consultation d'un sous-objet.

---

# 17. Donnees minimales requises

Le workspace ne peut pas etre considere complet sans :

- `project_id` ;
- `mission_id` ;
- objectif ;
- etat courant ;
- agent principal ou statut non assigne ;
- perimetre autorise ;
- livrables attendus ;
- dernier evenement significatif ;
- actions autorisees pour le role courant ;
- verrous associes ;
- validations associees ;
- rapports associes ;
- conflits ou blocages connus.

Si une donnee minimale manque, le workspace doit afficher un etat de mission incomplet plutot qu'inventer l'information.

---

# 18. Regles de conception

## 18.1 Priorite

La priorite d'information est :

1. blocage critique ;
2. mission et etat ;
3. action attendue ;
4. responsable ;
5. perimetre et verrou ;
6. livrables et validations ;
7. preuves et historique.

## 18.2 Densite

Le workspace peut etre dense, mais il doit rester scannable.

Les informations de preuve, audit et historique complet ne doivent pas occuper le niveau principal si aucune action ne les exige.

## 18.3 Terminologie

Tous les libelles operationnels doivent utiliser les termes canoniques.

Les synonymes comme "tache", "ticket" ou "job" ne doivent pas remplacer `Mission`.

## 18.4 Actions

Les actions sont contextuelles.

Elles dependent :

- du role ;
- de l'etat ;
- du verrou ;
- des validations ;
- des conflits ;
- du perimetre.

---

# 19. Anti-patterns

Sont interdits :

- une fiche Mission composee uniquement de champs descriptifs ;
- une page qui oblige a ouvrir cinq vues pour comprendre l'action attendue ;
- une timeline brute comme information principale permanente ;
- une liste d'actions non filtrees par role et etat ;
- une action de transition sans rappel de l'etat source et cible ;
- une validation presentee comme pure formalite ;
- un verrou cache dans une zone secondaire pendant execution ;
- un blocage presente sans condition de reprise ;
- une mission terminale avec actions de mutation visibles ;
- une confusion entre rapport soumis et mission acceptee.

---

# 20. Critere d'arret

La mission `L4-003` est complete lorsque le document definit :

- le role du `Mission Workspace` ;
- sa difference avec une simple fiche Mission ;
- les zones fonctionnelles ;
- les informations prioritaires ;
- les actions par etat ;
- les modes de lecture par role ;
- les relations avec les autres vues ;
- les donnees minimales requises ;
- les regles de conception ;
- les anti-patterns.

Statut propose : `DRAFT_VALIDABLE`.

