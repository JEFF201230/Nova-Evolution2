# CEREBRAU Knowledge Index Schema

Version : 1.0

Statut : MVP

---

# 1. Objet

Le CEREBRAU Knowledge Index MVP definit le schema officiel d'indexation des connaissances du projet.

Il permet a ChatGPT, Codex et OpenClaw de retrouver rapidement les documents, decisions, programmes, lots, references, documentations metier et informations techniques presents dans le projet.

Le Knowledge Index ne remplace pas les documents sources.

Il fournit une couche de reperage, de classification et de navigation.

---

# 2. Audit documentaire observe

Les familles documentaires observees dans l'arborescence `Docs` sont :

- documentation racine ;
- gouvernance ;
- legacy global ;
- syntheses ;
- bible d'erreurs ;
- patches et evolutions ;
- modules ;
- architecture ;
- roadmaps et feuilles de route ;
- decisions ;
- design system ;
- prompts ;
- references ;
- audits ;
- exports ;
- archives ;
- CEREBRAU Operating System ;
- lots ;
- programmes ;
- vision.

Ces familles constituent le perimetre documentaire initial du Knowledge Index MVP.

---

# 3. Categories officielles

Les categories officielles du Knowledge Index MVP sont :

| Categorie | Existence observee | Description |
|---|---|---|
| README | Oui | Document d'entree ou d'orientation d'un espace documentaire. |
| VISION | Oui | Document de vision, mission long terme et principes directeurs. |
| PROGRAM | Oui | Registre ou fiche de programme. |
| EPIC | Oui | Niveau de regroupement fonctionnel ou strategique entre programme et lots. |
| LOT | Oui | Unite de travail documentaire ou operationnelle. |
| ROADMAP | Oui | Feuille de route ou trajectoire projet. |
| DECISION | Oui | Decision structurante, arbitrage ou reference decisionnelle. |
| CODE | Oui | Fichier source, fragment technique, schema, diagramme ou artefact proche du code. |
| DOC | Oui | Documentation generale non couverte par une categorie plus precise. |
| GOVERNANCE | Oui | Document de gouvernance, validation, doctrine ou cadre projet. |
| SYNTHESIS | Oui | Synthese d'avancement, memoire projet ou resume transversal. |
| ERROR | Oui | Erreur connue, bible d'erreurs ou retour d'incident. |
| PATCH | Oui | Patch, evolution appliquee, adaptation ou correction documentee. |
| MODULE | Oui | Documentation rattachee a un module fonctionnel. |
| ARCHITECTURE | Oui | Architecture applicative, fonctionnelle, SQL, ledger ou systeme. |
| AUDIT | Oui | Analyse, audit ou qualification d'un existant. |
| REFERENCE | Oui | Reference transverse ou document d'appui. |
| PROMPT | Oui | Prompt de production ou d'execution. |
| DESIGN | Oui | Design system, specification UI, reference graphique ou maquette. |
| EXPORT | Oui | Documentation ou reference d'export PDF, Excel ou STAR. |
| ARCHIVE | Oui | Document historique conserve hors flux actif. |

---

# 4. Schema par categorie

## README

Role : point d'entree d'un espace documentaire.

Objectif : orienter le lecteur ou l'agent IA vers les documents principaux.

Contenu attendu : mission, perimetre, organisation et references principales.

Niveau hierarchique : entree locale ou globale.

Relations : peut pointer vers VISION, PROGRAM, LOT, DOC, GOVERNANCE et REFERENCE.

## VISION

Role : definir l'intention durable d'un systeme, module ou espace.

Objectif : stabiliser la direction, la mission long terme et les principes.

Contenu attendu : vision, mission, objectifs strategiques, perimetre et principes directeurs.

Niveau hierarchique : strategique.

Relations : alimente PROGRAM, EPIC, ROADMAP et DECISION.

## PROGRAM

Role : regrouper des travaux lies a une ambition commune.

Objectif : donner une unite de pilotage aux EPIC et aux LOT.

Contenu attendu : identifiant, nom, objectif, statut, responsable, EPIC associes, lots associes.

Niveau hierarchique : pilotage.

Relations : depend de VISION ; regroupe EPIC et LOT ; peut produire ROADMAP et DECISION.

## EPIC

Role : regrouper un ensemble coherent de lots.

Objectif : traduire un programme en blocs d'execution suivables.

Contenu attendu : identifiant, titre, objectif, programme parent, lots associes, statut.

Niveau hierarchique : intermediaire.

Relations : depend de PROGRAM ; contient LOT ; peut etre relie a ROADMAP, DECISION et DOC.

## LOT

Role : unite maximale d'execution.

Objectif : produire un ou plusieurs livrables explicitement definis.

Contenu attendu : identifiant, objectif, contexte, perimetre, livrables, contraintes, criteres d'acceptation et criteres de rejet.

Niveau hierarchique : execution.

Relations : depend de PROGRAM ou EPIC ; produit DOC, README, VISION, ROADMAP, REGISTER, DECISION ou REFERENCE.

## ROADMAP

Role : decrire une trajectoire projet ou module.

Objectif : organiser les priorites et etapes dans le temps.

Contenu attendu : objectifs, jalons, priorites, dependances et statut.

Niveau hierarchique : pilotage.

Relations : derive de VISION et PROGRAM ; oriente EPIC et LOT ; peut s'appuyer sur DECISION.

## DECISION

Role : consigner un arbitrage ou une position structurante.

Objectif : rendre une decision retrouvable, traçable et reliee a son contexte.

Contenu attendu : decision, justification, perimetre, impact, date, responsable et liens.

Niveau hierarchique : gouvernance ou architecture.

Relations : peut affecter PROGRAM, EPIC, LOT, ARCHITECTURE, CODE et DOC.

## CODE

Role : representer un artefact technique indexable.

Objectif : relier la documentation aux fichiers sources, schemas, scripts, diagrammes ou exemples techniques.

Contenu attendu : chemin, langage ou format, module concerne, role, dependances et documents lies.

Niveau hierarchique : implementation ou reference technique.

Relations : depend de DOC, ARCHITECTURE, DECISION ou LOT ; peut etre source d'AUDIT.

## DOC

Role : categorie documentaire generale.

Objectif : indexer les documents qui ne relevent pas d'une categorie plus specifique.

Contenu attendu : titre, sujet, perimetre, statut, liens et mots-cles.

Niveau hierarchique : variable.

Relations : peut etre lie a toutes les autres categories.

## GOVERNANCE

Role : porter le cadre de gouvernance du projet.

Objectif : conserver les doctrines, validations et documents de controle.

Contenu attendu : cadre, autorite, validation, regles de gouvernance et documents associes.

Niveau hierarchique : gouvernance.

Relations : encadre VISION, PROGRAM, LOT, DECISION et ROADMAP.

## SYNTHESIS

Role : condenser l'etat d'un projet, d'une periode ou d'un module.

Objectif : permettre une comprehension rapide d'un historique ou d'un avancement.

Contenu attendu : periode, resume, points cles, decisions, risques et liens.

Niveau hierarchique : transversal.

Relations : relie DOC, DECISION, ROADMAP, MODULE et ARCHIVE.

## ERROR

Role : documenter une erreur connue ou un probleme recurrent.

Objectif : faciliter le diagnostic et eviter les repetitions.

Contenu attendu : identifiant, symptome, contexte, cause demontree, impact et liens.

Niveau hierarchique : qualite.

Relations : peut pointer vers CODE, PATCH, DECISION, MODULE et DOC.

## PATCH

Role : documenter une correction, adaptation ou evolution.

Objectif : tracer une transformation appliquee ou planifiee.

Contenu attendu : objet, contexte, changement, impact, fichiers ou modules concernes.

Niveau hierarchique : evolution.

Relations : peut resoudre ERROR ; peut appliquer DECISION ; peut modifier CODE ou DOC.

## MODULE

Role : documenter un domaine fonctionnel ou applicatif.

Objectif : regrouper les connaissances relatives a un module.

Contenu attendu : perimetre module, fonctions, flux, dependances et references.

Niveau hierarchique : fonctionnel.

Relations : contient DOC, ARCHITECTURE, CODE, ERROR, PATCH, AUDIT et REFERENCE.

## ARCHITECTURE

Role : decrire une structure systeme, fonctionnelle, technique ou donnees.

Objectif : rendre les composants et relations comprehensibles.

Contenu attendu : composants, flux, dependances, frontieres, objets et liens.

Niveau hierarchique : conception.

Relations : relie MODULE, CODE, DECISION, AUDIT et REFERENCE.

## AUDIT

Role : analyser un existant.

Objectif : produire des constats exploitables sur un perimetre defini.

Contenu attendu : faits observes, risques, preuves, conclusions et liens.

Niveau hierarchique : analyse.

Relations : peut porter sur MODULE, CODE, DOC, ARCHITECTURE ou GOVERNANCE.

## REFERENCE

Role : fournir un document d'appui ou une source transversale.

Objectif : servir de base stable pour consultation ou indexation.

Contenu attendu : sujet, perimetre, statut, liens et mots-cles.

Niveau hierarchique : transverse.

Relations : peut etre utilisee par toutes les categories.

## PROMPT

Role : conserver une instruction de production ou d'execution.

Objectif : tracer les demandes ayant servi a produire une analyse, un design ou un document.

Contenu attendu : objectif, contexte, contraintes, livrable attendu et liens.

Niveau hierarchique : execution documentaire.

Relations : peut produire LOT, AUDIT, DOC, DESIGN ou CODE.

## DESIGN

Role : documenter une reference visuelle ou UI.

Objectif : relier les specifications visuelles aux modules ou livrables.

Contenu attendu : reference, perimetre UI, image ou maquette, contraintes et liens.

Niveau hierarchique : conception visuelle.

Relations : depend de MODULE, DOC, REFERENCE et parfois CODE.

## EXPORT

Role : documenter les exports et supports de restitution.

Objectif : indexer les references PDF, Excel, STAR ou captures associees.

Contenu attendu : type d'export, source, format, perimetre, version et liens.

Niveau hierarchique : restitution.

Relations : depend de MODULE, CODE, DESIGN, DOC et REFERENCE.

## ARCHIVE

Role : conserver les documents historiques.

Objectif : maintenir une trace sans en faire une source active par defaut.

Contenu attendu : origine, sujet, date, statut archive et liens eventuels.

Niveau hierarchique : historique.

Relations : peut documenter l'origine de DECISION, ROADMAP, MODULE ou DOC.

---

# 5. Champs d'indexation

## Champs obligatoires

| Champ | Role | Format attendu |
|---|---|---|
| identifiant | Identifier l'entree de maniere unique. | Texte stable. |
| nom | Donner le nom lisible de l'entree. | Texte court. |
| type | Associer l'entree a une categorie officielle. | Une categorie du Knowledge Index. |
| statut | Indiquer l'etat de l'entree. | DRAFT, ACTIF, VALIDE, ARCHIVE, OBSOLETE. |
| proprietaire | Identifier l'autorite ou le responsable documentaire. | Product Owner, Architecte, Codex, Module ou Equipe. |
| date | Donner la date de creation ou de reference. | AAAA-MM-JJ. |
| liens | Relier l'entree aux documents sources. | Liste de chemins ou references. |
| dependances | Declarer les entrees necessaires a la comprehension. | Liste d'identifiants ou chemins. |
| mots-cles | Faciliter la recherche agent IA. | Liste de termes. |
| version | Identifier l'etat versionne. | Texte ou nombre. |

## Champs facultatifs

| Champ | Role | Format attendu |
|---|---|---|
| resume | Fournir une description courte. | Texte court. |
| module | Rattacher a un module fonctionnel. | Nom de module. |
| programme | Rattacher a un programme. | Program ID. |
| epic | Rattacher a un EPIC. | Epic ID. |
| lot | Rattacher a un lot. | COS-XXX. |
| decision | Rattacher a une decision. | Identifiant decisionnel ou chemin. |
| code_associe | Rattacher a un artefact technique. | Chemin de fichier. |
| niveau_hierarchique | Preciser le niveau dans la navigation. | Strategie, pilotage, execution, reference, archive. |
| observations | Ajouter une note factuelle. | Texte court. |

---

# 6. Relations entre categories

Relations hierarchiques principales :

- VISION -> PROGRAM -> EPIC -> LOT -> livrables ;
- GOVERNANCE -> DECISION -> PROGRAM ou MODULE ;
- ROADMAP -> PROGRAM ou EPIC -> LOT ;
- MODULE -> ARCHITECTURE -> CODE ;
- ERROR -> PATCH -> CODE ou DOC ;
- AUDIT -> MODULE, CODE, DOC ou ARCHITECTURE ;
- REFERENCE -> toutes categories ;
- ARCHIVE -> categorie source historique.

Relations transverses principales :

- README oriente vers VISION, PROGRAM, LOT, GOVERNANCE et REFERENCE ;
- SYNTHESIS relie plusieurs categories dans une periode donnee ;
- PROMPT relie une demande a un livrable produit ;
- DESIGN relie une reference visuelle a un module ou a un export ;
- EXPORT relie une restitution a un module, un code ou une reference.

---

# 7. Navigation

## Vision vers programmes

Un agent IA part de VISION pour identifier les programmes correspondant a la mission long terme et aux objectifs strategiques.

## Programmes vers EPIC

Un agent IA utilise PROGRAM pour retrouver les EPIC associes et comprendre les blocs de travail.

## EPIC vers lots

Un agent IA utilise EPIC pour retrouver les lots executes ou a executer.

## Lots vers livrables

Un agent IA utilise LOT pour identifier les documents produits, modifies ou attendus.

## Decisions vers documentation

Un agent IA utilise DECISION pour comprendre les arbitrages qui expliquent l'etat actuel d'un document ou d'un module.

## Documentation vers code

Un agent IA utilise DOC, ARCHITECTURE ou MODULE pour retrouver les artefacts CODE associes.

## Code vers documentation

Un agent IA utilise CODE pour retrouver les documents d'architecture, audits, decisions, erreurs ou patchs associes.

---

# 8. Recherche agent IA

## Retrouver une decision

Regle de recherche :

1. rechercher le type DECISION ;
2. filtrer par mots-cles ;
3. verifier les liens vers PROGRAM, MODULE, ARCHITECTURE ou CODE ;
4. consulter les dependances.

## Retrouver un programme

Regle de recherche :

1. rechercher le type PROGRAM ;
2. filtrer par Program ID ou nom ;
3. lire les EPIC associes ;
4. lire les lots associes.

## Retrouver un lot

Regle de recherche :

1. rechercher le type LOT ;
2. filtrer par identifiant COS-XXX ;
3. lire les livrables produits ;
4. lire les dependances et observations.

## Retrouver une roadmap

Regle de recherche :

1. rechercher le type ROADMAP ;
2. filtrer par module, programme ou periode ;
3. verifier les objectifs et dependances ;
4. relier aux EPIC et LOT.

## Retrouver un document technique

Regle de recherche :

1. rechercher les types ARCHITECTURE, CODE, PATCH, AUDIT ou REFERENCE ;
2. filtrer par module ou technologie ;
3. verifier les liens vers CODE ;
4. verifier les decisions et erreurs associees.

## Retrouver une documentation metier

Regle de recherche :

1. rechercher les types MODULE, DOC, SYNTHESIS ou GOVERNANCE ;
2. filtrer par domaine metier ;
3. verifier les references et archives associees ;
4. relier aux programmes, lots ou decisions si disponibles.

---

# 9. Regles de validation du Knowledge Index

Une entree est valide si :

- elle possede tous les champs obligatoires ;
- son type appartient aux categories officielles ;
- ses liens pointent vers des documents ou artefacts existants ;
- ses dependances sont explicites ;
- ses mots-cles permettent une recherche directe ;
- sa version est renseignee.

Une categorie est valide si :

- elle possede un role ;
- elle possede un objectif ;
- elle possede un contenu attendu ;
- elle possede un niveau hierarchique ;
- elle possede au moins une relation avec une autre categorie.

Le Knowledge Index MVP est exploitable par un agent IA si :

- aucune categorie n'est orpheline ;
- aucune relation principale n'est contradictoire ;
- les parcours Vision, Programmes, EPIC, Lots, Decisions, Documentation et Code sont couverts ;
- les regles de recherche permettent de retrouver les objets cibles sans parcourir toute l'arborescence.

---

# 10. Statut MVP

Le present schema constitue le MVP du CEREBRAU Knowledge Index.

Il definit les categories, champs, relations et parcours minimaux permettant l'indexation documentaire initiale du projet.

Il ne contient aucun code applicatif.

Il ne deplace aucun document.

Il ne renomme aucun fichier.
