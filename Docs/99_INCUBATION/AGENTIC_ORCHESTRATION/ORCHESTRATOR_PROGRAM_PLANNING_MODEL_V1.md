# ORCHESTRATOR PROGRAM PLANNING MODEL V1

Version : 1.0

Statut : DRAFT_VALIDABLE

Mission : ORCH-FOUNDATION-003

Agent : Program Planning Architect

Objet : Modele conceptuel de planification des programmes ORCHESTRATOR

---

# 1. Objet

Ce document definit le modele officiel de planification des programmes pour l'ORCHESTRATOR.

Il constitue la reference conceptuelle du futur Planning Engine.

Il ne fait pas partie du Runtime V1.

Il ne decrit aucune implementation, aucun algorithme, aucune technologie et aucun mode de representation graphique.

Son objectif est de definir les concepts metier necessaires pour piloter des programmes, des projets, des missions, des agents, des decisions, des dependances, des jalons, des objectifs, des capacites et des impacts.

---

# 2. Positionnement

L'ORCHESTRATOR n'est pas un outil de gestion de taches.

L'ORCHESTRATOR est un Mission Control Center permettant a un Directeur de Programme de piloter simultanement :

- plusieurs programmes ;
- plusieurs projets ;
- plusieurs roadmaps ;
- plusieurs releases ;
- plusieurs jalons ;
- plusieurs objectifs ;
- plusieurs missions ;
- plusieurs agents IA ;
- plusieurs decisions critiques ;
- plusieurs dependances transverses.

Le Program Planning Model definit la structure de pilotage qui permet de passer d'une activite agentique locale a une vision programme globale.

---

# 3. Pourquoi un Program Planning Model

## 3.1 Limite du pilotage par mission

Une mission est une unite d'execution.

Elle permet a un agent de produire un resultat limite, contextualise et validable.

Elle ne suffit pas a piloter :

- une strategie ;
- une sequence de transformation ;
- un arbitrage entre projets ;
- une trajectoire de release ;
- une capacite disponible ;
- une dette accumulee ;
- un impact sur des objectifs metier ;
- une decision a l'echelle programme.

Piloter uniquement par mission expose le systeme a plusieurs risques :

- optimisation locale au detriment du programme ;
- multiplication d'actions sans alignement strategique ;
- perte de comprehension des dependances ;
- validation de livrables sans evaluation de valeur ;
- incapacite a arbitrer entre plusieurs projets ;
- absence de lecture des impacts en cascade.

## 3.2 Mission, Projet, Programme

Mission, Projet et Programme sont trois niveaux distincts.

Ils ne portent pas la meme responsabilite.

## 3.3 Mission

Une Mission est une unite d'execution assignee a un agent ou a un groupe d'agents.

Elle a pour responsabilite de produire un resultat defini dans un perimetre borne.

Une Mission peut contribuer a un objectif, a un projet, a un jalon ou a une decision.

Une Mission ne definit jamais la strategie.

Une Mission ne porte pas seule la responsabilite d'un resultat programme.

## 3.4 Projet

Un Projet est une unite de coordination orientee resultat.

Il regroupe des missions, des livrables, des dependances, des decisions et des validations permettant d'atteindre un objectif ou un ensemble d'objectifs.

Un Projet a pour responsabilite de transformer une intention operationnelle en resultats organises.

Un Projet peut etre autonome ou lie a d'autres projets.

Un Projet ne pilote pas seul le programme lorsqu'il existe des arbitrages transverses.

## 3.5 Programme

Un Programme est une unite de pilotage strategique.

Il regroupe plusieurs projets, objectifs, releases, jalons, risques, decisions et dependances autour d'une vision commune.

Un Programme a pour responsabilite de maintenir :

- l'alignement avec la vision ;
- la coherence des projets ;
- la progression vers les objectifs ;
- la priorisation des arbitrages ;
- la gestion des risques ;
- la maitrise des dependances ;
- la lecture globale de la capacite ;
- la stabilite documentaire ;
- la tracabilite des decisions.

Un Programme pilote les projets.

Un Programme arbitre lorsque plusieurs projets entrent en tension.

---

# 4. Hierarchie Officielle

La hierarchie officielle du Program Planning Model est la suivante :

Vision

Programme

Roadmap

Release

Milestone

Objective

Project

Mission

Task

Deliverable

Cette hierarchie exprime une relation de pilotage et de contribution.

Elle ne doit pas etre interpretee comme une simple decomposition administrative.

## 4.1 Vision

La Vision exprime l'intention strategique de plus haut niveau.

Elle definit pourquoi un ou plusieurs programmes existent.

Elle oriente les priorites, les arbitrages et les criteres de valeur.

La Vision ne decrit pas les travaux a realiser.

Elle donne le cadre de sens dans lequel les programmes doivent produire de la valeur.

Responsabilites de la Vision :

- definir l'ambition ;
- clarifier la finalite ;
- fixer les grandes contraintes ;
- guider les arbitrages ;
- donner une direction stable.

## 4.2 Programme

Le Programme traduit une Vision en trajectoire pilotee.

Il organise plusieurs projets autour d'objectifs coherents et d'une roadmap commune.

Responsabilites du Programme :

- porter la coherence globale ;
- structurer la roadmap ;
- organiser les releases ;
- surveiller la sante globale ;
- gerer les dependances transverses ;
- arbitrer les priorites ;
- qualifier les impacts des decisions ;
- maintenir la tracabilite programme.

## 4.3 Roadmap

La Roadmap est l'objet metier qui exprime la trajectoire vivante du Programme.

Elle ordonne les jalons, objectifs, releases, dependances, risques, priorites, decisions et hypotheses.

La Roadmap n'est pas une liste fixe.

Elle evolue lorsque le programme apprend, lorsqu'une decision change, lorsqu'un risque apparait, lorsqu'une dependance se deplace ou lorsqu'une capacite devient indisponible.

## 4.4 Release

Une Release est une unite de livraison programme.

Elle regroupe un ensemble coherent de livrables, objectifs ou capacites devant etre rendus disponibles ensemble.

Une Release sert a organiser la valeur livree.

Elle ne se limite pas a une livraison technique.

Responsabilites d'une Release :

- regrouper une valeur livrable ;
- fixer un perimetre attendu ;
- relier des jalons a une livraison ;
- exposer les dependances critiques ;
- permettre une decision de go, no-go ou ajustement.

## 4.5 Milestone

Un Milestone est un jalon significatif de progression.

Il marque l'atteinte d'un etat attendu, d'une decision importante, d'une validation structurante ou d'un niveau de maturite programme.

Un Milestone mesure la progression, pas l'activite.

## 4.6 Objective

Un Objective est un objectif metier ou programme exprimant une valeur attendue.

Il definit ce qui doit etre obtenu, pour quelle valeur, et selon quels criteres de succes.

Un Objective peut etre contribue par plusieurs projets et plusieurs missions.

## 4.7 Project

Un Project est une unite de coordination operationnelle permettant d'atteindre un ou plusieurs objectifs.

Il regroupe des missions, des livrables, des dependances, des risques et des validations.

Un Project peut contribuer a plusieurs objectifs si sa valeur est transverse.

## 4.8 Mission

Une Mission est une unite d'execution gouvernee par le Runtime.

Elle transforme une intention limitee en livrable, analyse, validation, rapport ou decision preparee.

Elle doit toujours etre rattachee a un contexte superieur lorsqu'elle contribue a un programme.

## 4.9 Task

Une Task est une action elementaire ou un sous-effort necessaire a l'accomplissement d'une mission.

Elle n'est pas un objet de pilotage strategique.

Elle sert a organiser l'execution locale.

Une Task ne doit pas porter une decision programme.

## 4.10 Deliverable

Un Deliverable est un resultat produit, verifiable et exploitable.

Il peut etre documentaire, analytique, decisionnel, fonctionnel, operationnel ou de validation.

Un Deliverable doit pouvoir etre relie a la mission qui le produit, a l'objectif qu'il sert, et au jalon ou a la release qu'il peut alimenter.

---

# 5. Cycle de Vie d'un Programme

## 5.1 Creation

La creation d'un Programme etablit son existence comme unite de pilotage.

Elle definit :

- la vision rattachee ;
- le perimetre initial ;
- les objectifs initiaux ;
- les projets pressentis ;
- les parties prenantes ;
- les contraintes majeures ;
- les hypotheses fondatrices ;
- les risques connus ;
- les principes de gouvernance.

La creation ne suppose pas que toute la roadmap soit connue.

Elle fixe le cadre initial de pilotage.

## 5.2 Planification

La planification structure la trajectoire du Programme.

Elle definit :

- les releases attendues ;
- les jalons ;
- les objectifs ;
- les projets contributeurs ;
- les dependances ;
- les risques ;
- les priorites ;
- les decisions attendues ;
- les capacites disponibles ;
- les hypotheses de travail.

La planification est un acte de cadrage, pas une garantie d'execution lineaire.

## 5.3 Execution

L'execution correspond a la mise en mouvement des projets, missions, agents et validations.

Elle observe :

- la progression des missions ;
- la production des livrables ;
- la consommation de capacite ;
- l'apparition de blocages ;
- la stabilite des dependances ;
- la qualite des resultats ;
- l'alignement avec les objectifs.

L'execution doit toujours rester lisible au niveau programme.

## 5.4 Suivi

Le suivi maintient une comprehension continue de l'etat du Programme.

Il porte sur :

- la progression ;
- les risques ;
- les dependances ;
- les validations ;
- les blocages ;
- la charge ;
- la disponibilite ;
- la dette ;
- la stabilite documentaire ;
- les decisions recentes ;
- les impacts en cascade.

Le suivi n'est pas un simple reporting.

Il sert a preparer l'arbitrage.

## 5.5 Adaptation

L'adaptation permet au Programme de rester coherent lorsque la situation change.

Elle peut etre declenchee par :

- un retard ;
- une decision ;
- une dependance modifiee ;
- un agent indisponible ;
- une capacite saturee ;
- un risque accru ;
- une hypothese invalidee ;
- un objectif redefini ;
- une release recomposee ;
- une validation refusee.

L'adaptation doit conserver la tracabilite des raisons, impacts et arbitrages.

## 5.6 Cloture

La cloture etablit que le Programme a atteint son terme operationnel.

Elle verifie :

- les objectifs atteints ou abandonnes ;
- les livrables produits ;
- les jalons franchis ;
- les decisions finales ;
- les risques residuels ;
- les dettes transferees ;
- les validations finales ;
- les apprentissages documentes.

Un Programme peut etre cloture meme si certains objectifs ont ete abandonnes, a condition que cette decision soit explicite et tracee.

## 5.7 Archivage

L'archivage conserve le Programme comme reference historique.

Il fige :

- la trajectoire finale ;
- les decisions ;
- les impacts ;
- les livrables ;
- les jalons ;
- les risques ;
- les hypotheses ;
- les arbitrages ;
- les raisons de cloture.

Un Programme archive ne doit plus etre pilote comme actif.

Il peut servir de source d'apprentissage, de comparaison ou de precedent.

---

# 6. Roadmap Vivante

## 6.1 Definition

La Roadmap est un objet metier vivant.

Elle represente la trajectoire actuelle et explicite du Programme.

Elle relie ce qui est prevu, ce qui est en cours, ce qui est incertain, ce qui est bloque, ce qui est valide et ce qui doit etre arbitre.

La Roadmap n'est pas un planning fige.

Elle est la representation conceptuelle de la trajectoire de valeur du Programme.

## 6.2 Contenu Obligatoire

Une Roadmap doit pouvoir contenir :

- des jalons ;
- des objectifs ;
- des dependances ;
- des risques ;
- des priorites ;
- des decisions ;
- des hypotheses.

## 6.3 Jalons dans la Roadmap

Les jalons structurent les points de progression significatifs.

Ils permettent de comprendre ce que le Programme doit atteindre avant de continuer, livrer, decider ou changer de phase.

## 6.4 Objectifs dans la Roadmap

Les objectifs clarifient la valeur attendue.

Ils empechent la Roadmap de devenir une simple suite d'activites.

## 6.5 Dependances dans la Roadmap

Les dependances rendent visibles les relations entre projets, missions, livrables, decisions, agents, capacites ou validations.

Elles permettent d'identifier les impacts potentiels d'un changement.

## 6.6 Risques dans la Roadmap

Les risques qualifient les evenements ou conditions pouvant menacer la trajectoire.

Ils doivent etre relies a leurs impacts potentiels sur les objectifs, jalons, releases ou projets.

## 6.7 Priorites dans la Roadmap

Les priorites expriment l'ordre d'importance programme.

Elles ne doivent pas etre confondues avec l'urgence locale.

Une priorite programme doit etre justifiee par la valeur, le risque, la dependance, la criticite ou l'impact.

## 6.8 Decisions dans la Roadmap

Les decisions structurent la trajectoire.

Une decision peut confirmer, retarder, annuler, reorienter ou debloquer un element de Roadmap.

Toute decision significative doit etre reliee a son impact programme.

## 6.9 Hypotheses dans la Roadmap

Les hypotheses sont des affirmations temporaires acceptees pour permettre la planification.

Elles doivent rester visibles tant qu'elles ne sont pas confirmees, invalidees ou remplacees.

Une hypothese critique non validee doit etre consideree comme un risque de planification.

---

# 7. Milestones

## 7.1 Definition d'un Jalon

Un jalon est un point de controle metier qui represente l'atteinte d'un etat significatif du Programme.

Il ne mesure pas le volume d'activite.

Il mesure la progression utile.

## 7.2 Criteres d'Atteinte

Un jalon doit disposer de criteres d'atteinte explicites.

Ces criteres peuvent porter sur :

- une validation obtenue ;
- un livrable accepte ;
- un objectif atteint ;
- une dependance resolue ;
- un risque ramene a un niveau acceptable ;
- une decision prise ;
- une release prete ;
- une stabilite documentaire acquise.

Un jalon sans critere d'atteinte explicite ne peut pas servir de point de pilotage fiable.

## 7.3 Dependances d'un Jalon

Un jalon peut dependre :

- d'autres jalons ;
- d'objectifs ;
- de projets ;
- de missions ;
- de livrables ;
- de decisions ;
- d'agents ;
- de validations ;
- d'hypotheses ;
- de capacites disponibles.

Les dependances d'un jalon doivent permettre d'identifier ce qui peut empecher son atteinte.

## 7.4 Etat d'un Jalon

L'etat d'un jalon exprime sa situation de pilotage.

Les etats conceptuels possibles doivent distinguer au minimum :

- non prepare ;
- planifie ;
- en progression ;
- a risque ;
- bloque ;
- atteint ;
- abandonne ;
- remplace.

Ces etats sont conceptuels et ne redefinissent pas les etats Runtime des missions.

## 7.5 Impact d'un Jalon

L'impact d'un jalon exprime les consequences de son atteinte, de son retard, de son abandon ou de sa modification.

L'impact peut concerner :

- une release ;
- un objectif ;
- un projet ;
- une mission ;
- une decision ;
- une dependance ;
- une capacite ;
- un risque ;
- le Programme lui-meme.

---

# 8. Objectives

## 8.1 Definition d'un Objectif Metier

Un objectif metier exprime un resultat attendu ayant une valeur identifiable pour le Programme.

Il repond a la question : quelle valeur doit etre obtenue ?

Un objectif n'est pas une activite.

Un objectif n'est pas une liste de taches.

## 8.2 Valeur Attendue

La valeur attendue decrit pourquoi l'objectif est important.

Elle peut etre :

- strategique ;
- operationnelle ;
- documentaire ;
- decisionnelle ;
- organisationnelle ;
- economique ;
- qualitative ;
- de reduction de risque ;
- de stabilisation ;
- de capacite.

## 8.3 Criteres de Succes

Les criteres de succes definissent comment reconnaitre que l'objectif est atteint.

Ils doivent etre observables, verifiables et relies a la valeur attendue.

Un objectif sans critere de succes risque de devenir une intention non pilotable.

## 8.4 Missions Contributrices

Une mission contributrice produit un element necessaire a l'atteinte d'un objectif.

Plusieurs missions peuvent contribuer au meme objectif.

Une meme mission peut contribuer a plusieurs objectifs si son impact est transverse.

La contribution d'une mission doit etre explicite.

Une mission terminee ne signifie pas automatiquement que l'objectif est atteint.

---

# 9. Program Health

## 9.1 Definition

Le Program Health est une evaluation globale de la sante d'un Programme.

Il doit aider le Directeur de Programme a comprendre si la trajectoire est stable, menacee, bloquee, surchargee ou mal alignee.

Le Program Health n'est pas une formule imposee.

Il est un cadre conceptuel d'evaluation.

## 9.2 Dimensions Alimentant le Program Health

Le Program Health peut etre alimente par les dimensions suivantes :

- progression ;
- risques ;
- dependances ;
- qualite ;
- blocages ;
- dette ;
- validations ;
- stabilite documentaire ;
- charge des agents ;
- capacite disponible.

## 9.3 Progression

La progression mesure l'avancement utile vers les jalons, objectifs et releases.

Elle ne doit pas se limiter au nombre de missions terminees.

## 9.4 Risques

Les risques mesurent les menaces identifiees sur la trajectoire programme.

Ils doivent etre observes selon leur criticite, probabilite conceptuelle, proximite, impact et niveau de mitigation.

Aucune formule mathematique n'est imposee.

## 9.5 Dependances

Les dependances mesurent la stabilite des relations entre elements du Programme.

Une dependance non resolue, instable ou mal comprise peut degrader fortement la sante du Programme.

## 9.6 Qualite

La qualite mesure la fiabilite des livrables, decisions, analyses, validations et documents produits.

Une progression rapide avec une qualite faible ne doit pas etre consideree comme saine.

## 9.7 Blocages

Les blocages mesurent les obstacles empechant la progression.

Ils peuvent etre lies a une decision, une dependance, une validation, une capacite, une information manquante ou un conflit.

## 9.8 Dette

La dette represente les compromis accumules qui fragilisent le Programme.

Elle peut etre documentaire, decisionnelle, organisationnelle, fonctionnelle, de validation, de qualite ou de gouvernance.

## 9.9 Validations

Les validations mesurent l'etat des approbations necessaires.

Une accumulation de validations en attente peut indiquer une tension de gouvernance ou une saturation decisionnelle.

## 9.10 Stabilite Documentaire

La stabilite documentaire mesure la coherence, la maturite et la fiabilite des sources de verite.

Une documentation instable peut rendre la planification incertaine.

## 9.11 Charge des Agents

La charge des agents mesure l'effort demande aux agents par rapport a leur capacite disponible et a la criticite des missions.

Une charge excessive peut provoquer ralentissement, erreurs, derivation ou conflits de priorite.

## 9.12 Capacite Disponible

La capacite disponible mesure la possibilite reelle de prendre en charge de nouveaux travaux ou d'absorber un changement.

Une capacite insuffisante limite l'adaptation du Programme.

---

# 10. Impact Analysis

## 10.1 Definition

L'Impact Analysis est l'evaluation conceptuelle des consequences d'une decision, d'un changement, d'un retard, d'un blocage ou d'une indisponibilite sur le Programme.

Elle permet de comprendre ce qui change, ce qui est menace, ce qui doit etre replanifie et ce qui doit etre arbitre.

## 10.2 Impact sur les Missions

Une decision peut affecter une mission en modifiant :

- son objectif local ;
- son contexte ;
- sa priorite ;
- ses dependances ;
- son agent ;
- son statut de validation ;
- son livrable attendu ;
- son besoin de clarification ;
- sa pertinence.

## 10.3 Impact sur les Projets

Une decision peut affecter un projet en modifiant :

- son perimetre ;
- ses priorites ;
- ses dependances ;
- sa capacite ;
- ses risques ;
- ses livrables ;
- ses validations ;
- ses objectifs contributeurs ;
- son niveau de criticite.

## 10.4 Impact sur les Jalons

Une decision peut affecter un jalon en modifiant :

- sa date cible conceptuelle ;
- ses criteres d'atteinte ;
- ses dependances ;
- son etat ;
- son impact sur une release ;
- son besoin de validation ;
- sa pertinence.

Ce document ne definit aucun mecanisme de calcul de date.

## 10.5 Impact sur les Objectifs

Une decision peut affecter un objectif en modifiant :

- sa valeur attendue ;
- ses criteres de succes ;
- ses missions contributrices ;
- son niveau de priorite ;
- son niveau de risque ;
- sa relation avec d'autres objectifs.

## 10.6 Impact sur le Programme

Une decision peut affecter le Programme en modifiant :

- la roadmap ;
- le Program Health ;
- les priorites ;
- les releases ;
- les dependances transverses ;
- la capacite globale ;
- la dette ;
- la stabilite documentaire ;
- la gouvernance ;
- les arbitrages futurs.

## 10.7 Exigence de Tracabilite

Toute decision significative doit pouvoir etre reliee a :

- son contexte ;
- son motif ;
- ses options considerees ;
- son arbitrage ;
- ses impacts attendus ;
- ses impacts constates ;
- les elements modifies ;
- les validations associees.

---

# 11. Simulation

## 11.1 Definition

La Simulation est une capacite conceptuelle future permettant d'explorer les consequences possibles d'un changement avant de l'appliquer.

Ce document ne definit aucun algorithme de simulation.

Il definit uniquement les objets et relations necessaires pour rendre la simulation pensable.

## 11.2 Question de Retard de Mission

Pour repondre plus tard a la question "Que se passe-t-il si une mission est retardee ?", le modele doit connaitre :

- la mission concernee ;
- ses livrables attendus ;
- ses dependances entrantes ;
- ses dependances sortantes ;
- les projets affectes ;
- les objectifs contribues ;
- les jalons lies ;
- les releases concernees ;
- les decisions dependantes ;
- les agents mobilises.

## 11.3 Question d'Indisponibilite d'Agent

Pour repondre plus tard a la question "Que se passe-t-il si un agent devient indisponible ?", le modele doit connaitre :

- les missions assignees a l'agent ;
- les missions critiques ;
- les competences ou roles portes par l'agent ;
- les dependances liees a ses productions ;
- les validations attendues ;
- les projets touches ;
- les jalons exposes ;
- la capacite alternative disponible.

## 11.4 Question de Changement de Dependance

Pour repondre plus tard a la question "Que se passe-t-il si une dependance change ?", le modele doit connaitre :

- la dependance concernee ;
- son origine ;
- sa destination ;
- sa criticite ;
- les elements qu'elle bloque ;
- les elements qu'elle alimente ;
- les risques associes ;
- les decisions qui l'ont creee ou modifiee.

## 11.5 Question d'Impact sur les Jalons

Pour repondre plus tard a la question "Quels jalons sont impactes ?", le modele doit connaitre :

- les jalons relies directement ;
- les jalons relies indirectement ;
- les criteres d'atteinte concernes ;
- les projets contributeurs ;
- les missions contributrices ;
- les livrables attendus ;
- les validations necessaires ;
- les dependances critiques.

## 11.6 Limites Conceptuelles

Une simulation ne doit pas etre confondue avec une decision.

Elle prepare l'arbitrage.

Elle expose des consequences possibles.

Elle ne remplace pas la responsabilite du Directeur de Programme.

---

# 12. Capacity Planning

## 12.1 Definition

Le Capacity Planning est le cadre conceptuel permettant de comparer ce que le Programme demande avec ce que les agents, equipes, roles ou ressources peuvent raisonnablement absorber.

Il permet d'identifier la surcharge, la disponibilite, les arbitrages et les risques de saturation.

## 12.2 Capacite

La capacite represente l'aptitude disponible pour realiser, analyser, valider, coordonner ou arbitrer un travail.

Elle peut concerner :

- un agent ;
- un groupe d'agents ;
- une equipe ;
- un role ;
- une instance de validation ;
- une capacite documentaire ;
- une capacite de decision.

## 12.3 Charge

La charge represente le volume et la criticite des travaux demandes.

Elle ne doit pas etre mesuree uniquement par quantite.

Elle doit tenir compte :

- de la complexite ;
- de la criticite ;
- des dependances ;
- du besoin de validation ;
- du niveau d'incertitude ;
- de la simultaneite ;
- du risque d'erreur.

## 12.4 Disponibilite

La disponibilite represente la part de capacite reellement mobilisable.

Une capacite theorique peut etre indisponible si elle est deja engagee, bloquee, limitee par une validation, contrainte par une priorite superieure ou exposee a un conflit.

## 12.5 Saturation

La saturation apparait lorsque la charge approche ou depasse la capacite disponible.

Elle peut provoquer :

- ralentissement ;
- retard ;
- baisse de qualite ;
- augmentation des risques ;
- accumulation de validations ;
- conflits de priorites ;
- blocages ;
- dette.

La saturation doit etre consideree comme un signal programme, pas comme un simple probleme local.

## 12.6 Arbitrage

L'arbitrage de capacite consiste a choisir ce qui doit etre fait, differe, reduit, delegue, replanifie, suspendu ou abandonne.

Il doit etre guide par :

- la valeur programme ;
- la criticite ;
- les dependances ;
- le risque ;
- la proximite des jalons ;
- les engagements de release ;
- la stabilite documentaire ;
- la disponibilite reelle.

---

# 13. Multi-Projets

## 13.1 Definition

Le pilotage multi-projets permet de comprendre comment plusieurs projets coexistent dans un meme Programme.

Il expose leurs relations, tensions, dependances et ressources partagees.

## 13.2 Projets Independants

Des projets sont independants lorsqu'ils peuvent progresser sans dependance directe significative l'un envers l'autre.

Ils peuvent toutefois rester lies par la Vision, le Programme, la capacite disponible ou une release commune.

L'independance n'exclut pas l'arbitrage programme.

## 13.3 Projets Lies

Des projets sont lies lorsqu'un changement dans l'un peut affecter l'autre.

Le lien peut etre fonde sur :

- un objectif commun ;
- une release commune ;
- un livrable partage ;
- une dependance documentaire ;
- une decision commune ;
- une validation commune ;
- une capacite partagee ;
- un risque transverse.

## 13.4 Dependances Croisees

Une dependance croisee existe lorsque plusieurs projets s'influencent mutuellement.

Elle peut creer des risques de blocage, de boucle d'attente, de priorisation contradictoire ou de propagation d'impact.

Une dependance croisee doit etre rendue explicite au niveau programme.

## 13.5 Ressources Partagees

Une ressource partagee peut etre un agent, une equipe, une competence, une capacite de validation, une source documentaire, une decision ou une fenetre de livraison.

Les ressources partagees doivent etre pilotees au niveau programme lorsqu'elles peuvent creer une tension entre projets.

---

# 14. Planning Engine - Future Capability

## 14.1 Definition

Le Planning Engine est une capacite future de l'ORCHESTRATOR.

Il aura pour role d'exploiter le Program Planning Model afin d'aider le Directeur de Programme a comprendre, anticiper et arbitrer la trajectoire des programmes.

Ce document ne definit aucune implementation du Planning Engine.

## 14.2 Responsabilites Futures

Le Planning Engine pourra avoir les responsabilites conceptuelles suivantes :

- maintenir la coherence de la hierarchie de planification ;
- exposer les dependances programme ;
- evaluer les impacts conceptuels ;
- soutenir la lecture du Program Health ;
- detecter les tensions de capacite ;
- signaler les risques de jalon ;
- relier decisions et consequences ;
- preparer des scenarios de simulation ;
- aider a prioriser les arbitrages ;
- distinguer urgence locale et criticite programme.

## 14.3 Entrees Conceptuelles

Les entrees conceptuelles du Planning Engine pourront inclure :

- vision ;
- programmes ;
- roadmaps ;
- releases ;
- jalons ;
- objectifs ;
- projets ;
- missions ;
- taches ;
- livrables ;
- dependances ;
- risques ;
- decisions ;
- hypotheses ;
- validations ;
- capacites ;
- disponibilites ;
- blocages ;
- dette ;
- etat documentaire.

## 14.4 Sorties Conceptuelles

Les sorties conceptuelles du Planning Engine pourront inclure :

- lecture de sante programme ;
- impacts attendus ;
- elements exposes ;
- dependances critiques ;
- tensions de capacite ;
- jalons a risque ;
- decisions a arbitrer ;
- objectifs menaces ;
- hypotheses critiques ;
- recommandations de clarification ;
- besoins de validation ;
- scenarios de replanification conceptuelle.

## 14.5 Decisions Supportees

Le Planning Engine pourra aider a preparer les decisions suivantes :

- prioriser un projet ;
- retarder une mission ;
- suspendre un objectif ;
- recomposer une release ;
- reaffecter une capacite ;
- escalader un risque ;
- valider un jalon ;
- invalider une hypothese ;
- accepter une dette ;
- cloturer ou archiver un programme.

Le Planning Engine ne remplace pas le Directeur de Programme.

Il soutient la decision, mais ne porte pas l'autorite finale lorsque l'arbitrage est critique.

## 14.6 Limites

Le Planning Engine ne doit pas :

- definir la Vision ;
- remplacer la gouvernance ;
- masquer l'incertitude ;
- transformer une hypothese en certitude ;
- considerer l'activite comme preuve de progression ;
- confondre priorite locale et priorite programme ;
- imposer une decision sans tracabilite ;
- redefinir les concepts du Runtime ;
- redefinir les sources de verite certifiees.

---

# 15. Golden Rules

## 15.1 Regles d'Or

1. Une mission ne definit jamais la strategie.

2. Un programme pilote les projets.

3. Un projet coordonne des missions, mais ne remplace pas le Programme.

4. Une roadmap est un objet vivant.

5. Les jalons mesurent la progression, pas l'activite.

6. Un objectif exprime une valeur attendue, pas une liste de taches.

7. Une decision doit toujours etre reliee a son impact sur le Programme.

8. Une mission terminee ne signifie pas automatiquement qu'un objectif est atteint.

9. Une release organise une valeur livrable, pas seulement une livraison technique.

10. Une dependance non explicite est un risque de planification.

11. Une hypothese critique non validee doit rester visible.

12. Le Program Health ne doit pas etre reduit a un taux d'avancement.

13. La capacite disponible prime sur la capacite theorique.

14. La saturation est un signal programme.

15. Un retard local doit etre analyse selon ses impacts en cascade.

16. Une decision rapide sans contexte d'impact peut degrader la trajectoire programme.

17. La roadmap doit relier objectifs, jalons, risques, dependances, decisions et hypotheses.

18. Une validation attendue est un element de planification, pas un detail administratif.

19. Un Programme archive ne doit plus etre pilote comme actif.

20. Le Planning Engine futur doit soutenir l'arbitrage, pas remplacer la responsabilite du Directeur de Programme.

---

# 16. Criteres de Reference

Ce document est suffisant comme reference conceptuelle lorsque les conditions suivantes sont remplies :

- Mission, Projet et Programme sont clairement distingues ;
- la hierarchie officielle de planification est definie ;
- le cycle de vie du Programme est explicite ;
- la Roadmap est definie comme objet metier vivant ;
- les jalons disposent de criteres, dependances, etats et impacts ;
- les objectifs sont relies a la valeur et aux missions contributrices ;
- le Program Health est decrit par dimensions sans formule imposee ;
- l'Impact Analysis relie decisions et consequences ;
- la Simulation est definie comme capacite conceptuelle future ;
- le Capacity Planning distingue capacite, charge, disponibilite, saturation et arbitrage ;
- le multi-projets distingue projets independants, projets lies, dependances croisees et ressources partagees ;
- le futur Planning Engine est cadre par responsabilites, entrees, sorties, decisions et limites ;
- les regles d'or empechent la confusion entre execution locale et pilotage programme.

---

# 17. Exclusions

Ce document exclut explicitement :

- toute implementation ;
- tout algorithme ;
- toute technologie ;
- tout code ;
- toute formule mathematique imposee ;
- tout diagramme de planification ;
- toute representation de type Gantt ;
- toute representation de type PERT ;
- toute specification d'interface ;
- toute maquette ;
- tout wireframe ;
- tout prototype ;
- tout composant ;
- toute proposition React.

---

# 18. Conclusion

Le Program Planning Model etablit le cadre conceptuel permettant a l'ORCHESTRATOR de piloter des programmes plutot que des missions isolees.

Il relie la Vision aux livrables par une hierarchie officielle, une Roadmap vivante, des jalons mesurables, des objectifs orientes valeur, une analyse d'impact, une lecture de sante programme, une planification de capacite et une comprehension multi-projets.

Il fournit les fondations metier necessaires pour concevoir ulterieurement un Planning Engine sans redefinir les concepts fondamentaux de planification.
