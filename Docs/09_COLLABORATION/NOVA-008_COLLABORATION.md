# NOVA-008 - Collaboration

MISSION_ID : NOVA-008

AGENT : AGENT 08 - Collaboration

STATUT : DRAFT_VALIDABLE

DATE : 2026-07-02

OBJET : Architecture fonctionnelle de collaboration, dialogue IA, consensus, conflits, War Room et conversation VEEDDA

---

## 1. Objet

Ce document definit l'architecture fonctionnelle de la collaboration dans VEEDDA.

Il decrit :

- les conversations entre utilisateurs, domaines et agents IA ;
- les mecanismes de dialogue IA ;
- les regles de consensus ;
- la gestion des conflits ;
- les espaces de collaboration ;
- le modele War Room ;
- la tracabilite des decisions collectives.

Il ne definit pas :

- les composants UI ;
- les schemas de base de donnees ;
- les protocoles temps reel ;
- les modeles IA ;
- les prompts d'execution ;
- les details d'infrastructure.

---

## 2. Principe directeur

VEEDDA doit permettre a plusieurs acteurs de construire une decision fiable autour d'un objet metier.

La regle principale est la suivante :

- une conversation contextualise un travail ;
- une collaboration organise les contributions ;
- un conflit signale une divergence explicite ;
- un consensus acte une decision partagee ;
- une War Room accelere la resolution d'un sujet critique ;
- l'IA assiste la comprehension, la synthese et l'arbitrage, sans se substituer a la responsabilite humaine.

---

## 3. Perimetre fonctionnel

| Domaine | Role |
| --- | --- |
| Conversation | Porter les echanges contextualises autour d'un objet metier |
| Dialogue IA | Aider a comprendre, reformuler, synthetiser et proposer des options |
| Collaboration | Organiser les contributions, validations et responsabilites |
| Consensus | Transformer une discussion en accord explicite et tracable |
| Conflits | Identifier, qualifier et resoudre les divergences |
| War Room | Fournir un espace de crise pour decision rapide et suivie |
| Audit | Conserver la preuve des contributions, decisions et arbitrages |

---

## 4. Objets collaboratifs

### 4.1 Conversation

Une conversation est un fil d'echange rattache a un contexte stable.

Contextes possibles :

- dossier salarie ;
- demande de subvention ;
- document ;
- ligne budgetaire ;
- campagne ;
- anomalie de grand livre ;
- incident operationnel ;
- decision de gouvernance ;
- sujet libre rattache a un espace.

Une conversation doit toujours posseder :

- un objet cible ;
- une liste de participants ;
- un historique horodate ;
- un niveau de visibilite ;
- un statut ;
- une responsabilite courante.

### 4.2 Message

Un message porte une contribution unitaire.

Types de messages :

- commentaire ;
- question ;
- reponse ;
- proposition ;
- decision ;
- objection ;
- synthese ;
- action demandee ;
- alerte ;
- note IA.

Chaque message doit indiquer :

- son auteur ;
- son origine humaine ou IA ;
- sa date ;
- son rattachement conversationnel ;
- son eventuel lien avec une decision, une objection ou une action.

### 4.3 Decision collaborative

Une decision collaborative est un etat explicite issu d'une conversation.

Elle doit contenir :

- l'objet decide ;
- le texte de decision ;
- les participants consultes ;
- les accords ;
- les objections ;
- l'arbitre si necessaire ;
- la date d'effet ;
- les consequences attendues ;
- le lien vers les preuves.

---

## 5. Dialogue IA

### 5.1 Role de l'IA

L'IA intervient comme assistant de collaboration.

Elle peut :

- resumer une conversation ;
- extraire les points d'accord ;
- extraire les points de blocage ;
- proposer une reformulation neutre ;
- identifier les questions ouvertes ;
- detecter une contradiction entre messages ;
- proposer une liste d'options ;
- preparer une synthese de decision ;
- transformer une discussion en plan d'action ;
- aider a rechercher un precedent dans les documents disponibles.

Elle ne peut pas :

- valider seule une decision metier engageante ;
- masquer une objection humaine ;
- supprimer une divergence ;
- modifier le sens d'une contribution ;
- remplacer un vote ou une validation formelle ;
- contourner les droits d'acces.

### 5.2 Modes de dialogue IA

| Mode | Objectif | Sortie attendue |
| --- | --- | --- |
| Clarification | Comprendre un sujet confus | Questions structurees |
| Synthese | Reduire une conversation longue | Resume, accords, objections |
| Mediation | Reformuler une divergence | Positions neutres et options |
| Decision support | Preparer l'arbitrage | Options, impacts, risques |
| Action planning | Transformer l'accord en execution | Actions, responsables, echeances |
| Retrospective | Comprendre une resolution | Enseignements et points a surveiller |

### 5.3 Transparence IA

Toute contribution IA doit etre identifiable.

Une synthese IA doit distinguer :

- faits constates ;
- interpretations ;
- hypotheses ;
- points non verifies ;
- recommandations.

Si l'IA propose un consensus, ce consensus reste une proposition tant qu'il n'a pas ete valide par les acteurs autorises.

---

## 6. Consensus

### 6.1 Definition

Un consensus est un accord suffisant, explicite et tracable pour permettre l'action.

Il ne signifie pas necessairement unanimite.

Il signifie que :

- les participants requis ont ete consultes ;
- les objections critiques ont ete traitees ou documentees ;
- les impacts sont compris ;
- une decision peut etre executee ;
- la responsabilite est claire.

### 6.2 Niveaux de consensus

| Niveau | Signification | Usage |
| --- | --- | --- |
| Information | Aucun accord requis | Diffusion, suivi, notification |
| Accord simple | Absence d'objection bloquante | Decisions operationnelles courantes |
| Accord qualifie | Validation de roles requis | Budget, droits, documents sensibles |
| Arbitrage | Decision par responsable designe | Conflit persistant ou urgence |
| Vote | Decision collective formalisee | Gouvernance, comite, assemblee |

### 6.3 Cycle de consensus

1. Ouverture du sujet.
2. Identification des participants requis.
3. Collecte des contributions.
4. Synthese des positions.
5. Identification des objections.
6. Resolution ou qualification des objections.
7. Proposition de decision.
8. Validation selon le niveau requis.
9. Publication de la decision.
10. Suivi des actions.

### 6.4 Objection

Une objection est une contribution qui empeche ou limite l'accord.

Elle doit etre qualifiee :

- bloquante ;
- majeure ;
- mineure ;
- informative ;
- hors perimetre.

Une objection bloquante doit toujours produire :

- une raison explicite ;
- un impact ;
- une condition de levee ;
- un responsable de traitement.

---

## 7. Conflits

### 7.1 Definition

Un conflit est une divergence persistante entre acteurs, regles, donnees ou decisions.

Types de conflits :

- conflit d'interpretation ;
- conflit de priorite ;
- conflit de responsabilite ;
- conflit de donnees ;
- conflit budgetaire ;
- conflit documentaire ;
- conflit de droits ;
- conflit de calendrier ;
- conflit de gouvernance.

### 7.2 Detection

Un conflit peut etre declare par :

- un utilisateur ;
- un responsable metier ;
- une regle de controle ;
- une alerte systeme ;
- une analyse IA ;
- une War Room.

L'IA peut signaler un risque de conflit, mais la qualification finale appartient aux roles autorises.

### 7.3 Cycle de resolution

1. Declaration.
2. Qualification.
3. Gel eventuel des actions sensibles.
4. Collecte des faits.
5. Identification des positions.
6. Identification des regles applicables.
7. Proposition d'options.
8. Mediation ou arbitrage.
9. Decision.
10. Journalisation.
11. Suivi post-resolution.

### 7.4 Etats d'un conflit

| Etat | Description |
| --- | --- |
| Signale | Divergence detectee mais non qualifiee |
| Qualifie | Nature et criticite connues |
| En mediation | Recherche d'accord entre parties |
| En arbitrage | Decision transferee a un responsable |
| Resolue | Decision prise et appliquee |
| Cloture | Resolution auditee et archivee |
| Reouverte | Nouvel element impactant la resolution |

---

## 8. Collaboration

### 8.1 Espaces collaboratifs

VEEDDA distingue plusieurs espaces de collaboration.

| Espace | Usage |
| --- | --- |
| Conversation contextuelle | Echange autour d'un objet metier |
| Salon d'equipe | Coordination recurrente |
| Comite | Validation formelle et gouvernance |
| War Room | Resolution urgente ou critique |
| Revue documentaire | Discussion autour d'un document |
| Revue financiere | Analyse d'ecarts, budgets, ledger |
| Revue dossier | Decision autour d'un dossier salarie ou subvention |

### 8.2 Roles collaboratifs

| Role | Responsabilite |
| --- | --- |
| Participant | Contribuer a la discussion |
| Demandeur | Ouvrir le sujet et formuler le besoin |
| Responsable | Porter la resolution |
| Arbitre | Trancher si le consensus echoue |
| Observateur | Suivre sans pouvoir valider |
| Expert | Apporter une analyse specialisee |
| Assistant IA | Synthese, clarification et aide a la decision |
| Auditeur | Verifier la conformite du processus |

### 8.3 Actions collaboratives

Actions standards :

- commenter ;
- mentionner ;
- assigner ;
- demander validation ;
- proposer decision ;
- objecter ;
- lever objection ;
- escalader ;
- arbitrer ;
- cloturer ;
- archiver.

Chaque action significative doit etre historisee.

---

## 9. War Room

### 9.1 Definition

Une War Room est un espace collaboratif temporaire dedie a un sujet critique.

Elle doit etre creee lorsqu'un sujet combine :

- urgence ;
- impact metier ;
- besoin de coordination multi-role ;
- risque de blocage ;
- besoin d'arbitrage rapide ;
- necessite de preuve.

### 9.2 Declencheurs

Declencheurs possibles :

- incident financier ;
- blocage de campagne ;
- anomalie de subvention ;
- conflit de droits ;
- erreur documentaire critique ;
- risque de non-conformite ;
- blocage budgetaire ;
- decision urgente de gouvernance ;
- interruption d'un flux operationnel.

### 9.3 Structure

Une War Room doit contenir :

- sujet ;
- criticite ;
- objectif de resolution ;
- horodatage d'ouverture ;
- responsable ;
- participants requis ;
- faits connus ;
- hypotheses ;
- decisions prises ;
- actions ;
- echeances ;
- statut ;
- journal de cloture.

### 9.4 Etats

| Etat | Description |
| --- | --- |
| Ouverte | War Room creee, participants identifies |
| Active | Investigation et decisions en cours |
| Sous arbitrage | Decision attendue d'un role autorise |
| Stabilisee | Risque immediat maitrise |
| Cloturee | Sujet resolu et journalise |
| Archivee | Dossier historise pour audit et retour d'experience |

### 9.5 Sorties attendues

Une War Room ne doit pas se terminer par une simple discussion.

Elle doit produire :

- une decision ;
- une correction ;
- une action de suivi ;
- une escalade ;
- ou une justification explicite d'absence d'action.

---

## 10. Conversation et memoire

### 10.1 Memoire courte

La memoire courte correspond au contexte actif d'une conversation.

Elle sert a :

- repondre correctement dans le fil ;
- conserver les points ouverts ;
- rappeler les decisions recentes ;
- eviter les repetitions.

### 10.2 Memoire longue

La memoire longue correspond aux decisions et enseignements conserves apres cloture.

Elle peut alimenter :

- les precedents ;
- les bases de connaissance ;
- les regles de gouvernance ;
- les modeles de resolution ;
- les retrospectives.

### 10.3 Regle de conservation

Tout ne doit pas devenir memoire longue.

Doivent etre conserves :

- decisions ;
- arbitrages ;
- objections bloquantes ;
- actions engageantes ;
- incidents critiques ;
- enseignements validables.

Ne doivent pas etre conserves comme reference durable :

- brouillons ;
- messages redondants ;
- opinions non tranchees ;
- hypotheses invalidees ;
- conversations informelles sans impact.

---

## 11. Droits et confidentialite

### 11.1 Principe

La collaboration respecte les droits de l'objet metier.

Un utilisateur ne doit pas obtenir par conversation ou IA une information qu'il ne peut pas consulter dans le domaine source.

### 11.2 Visibilite

Niveaux de visibilite :

- prive ;
- equipe ;
- domaine ;
- comite ;
- organisation ;
- audit ;
- War Room restreinte.

### 11.3 Donnees sensibles

Les conversations rattachees a des salaries, documents, subventions ou elements financiers doivent appliquer les restrictions du domaine source.

L'IA doit respecter les memes frontieres d'acces.

---

## 12. Audit

### 12.1 Evenements auditables

Evenements a historiser :

- creation de conversation ;
- ajout ou retrait de participant ;
- message de decision ;
- objection ;
- changement de statut ;
- escalade ;
- arbitrage ;
- ouverture de War Room ;
- cloture de War Room ;
- synthese IA utilisee pour decision ;
- validation de consensus.

### 12.2 Preuve de decision

Une decision doit pouvoir etre relue avec :

- le contexte ;
- les participants ;
- les contributions determinantes ;
- les objections ;
- les validations ;
- la decision finale ;
- les actions derivees.

---

## 13. Integration avec les domaines VEEDDA

| Domaine | Usage collaboratif |
| --- | --- |
| RH | Discussions autour des dossiers salaries et donnees de population |
| QF et droits | Resolution des divergences d'eligibilite |
| Subvention | Instruction collective et arbitrage de demandes |
| Finance | Analyse d'ecarts, budget, grand livre, paiements |
| Documentaire | Revue, validation et archivage de pieces |
| Communication | Preparation et validation de messages collectifs |
| Audit | Preuve des decisions et controle des processus |
| Gouvernance | Comites, votes, arbitrages, regles collectives |

---

## 14. Regles structurantes

1. Toute conversation engageante doit etre rattachee a un objet metier.
2. Toute decision doit etre distinguee d'un simple commentaire.
3. Toute contribution IA doit etre identifiable comme IA.
4. Une objection bloquante ne peut pas etre masquee par une synthese.
5. Un consensus doit indiquer son niveau et ses participants requis.
6. Une War Room doit avoir un responsable unique.
7. Une War Room doit produire une sortie explicite.
8. Les droits d'acces du domaine source priment sur la conversation.
9. L'audit doit permettre de reconstruire une decision.
10. La collaboration ne doit pas creer de responsabilite implicite non assignee.

---

## 15. Anti-patterns

Sont interdits :

- discussion sans objet cible pour une decision metier ;
- decision cachee dans un commentaire ;
- synthese IA presentee comme decision humaine ;
- consensus sans participants requis ;
- War Room permanente sans cloture ;
- conflit ferme sans justification ;
- objection bloquante ignoree ;
- droits conversationnels plus larges que les droits metier ;
- multiplication de fils concurrents pour le meme incident ;
- absence d'audit sur arbitrage.

---

## 16. Criteres de validation

Le livrable NOVA-008 est validable si :

- le perimetre collaboration est separe des modules metier ;
- les conversations sont rattachees aux objets metier ;
- le role de l'IA est assiste et non souverain ;
- le consensus est explicite, qualifie et tracable ;
- les conflits ont un cycle de resolution clair ;
- la War Room est temporaire, responsablee et auditable ;
- les droits d'acces sont preserves ;
- les decisions peuvent etre relues et justifiees.

