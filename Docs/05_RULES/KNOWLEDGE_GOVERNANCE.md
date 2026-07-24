# CEREBRAU Knowledge Governance

Version : 1.0

Statut : Reference

---

# 1. Objet

Le present document definit les regles permanentes de gouvernance du Knowledge System CEREBRAU.

Il constitue la reference officielle indiquant qui peut creer, modifier, valider, archiver et utiliser la connaissance.

Il complete les trois fondations existantes :

- `KNOWLEDGE_INDEX_SCHEMA.md` ;
- `KNOWLEDGE_INDEX_ENGINE.md` ;
- `KNOWLEDGE_INDEX_STORAGE.md`.

Il ne modifie pas le modele documentaire.

Il ne modifie pas le moteur logique.

Il ne modifie pas la couche de stockage.

Il definit uniquement la gouvernance du systeme de connaissance.

---

# 2. Principes de gouvernance

La gouvernance du Knowledge System CEREBRAU repose sur les principes suivants :

- la connaissance doit etre tracable ;
- la connaissance doit etre rattachee a une autorite ;
- la connaissance active doit etre distinguee du legacy et des archives ;
- une decision explicite prime sur une interpretation ;
- un document valide prime sur un document draft ;
- un document actif prime sur un document legacy ;
- un document legacy prime sur une archive pour comprendre l'historique ;
- aucune information manquante ne doit etre inventee ;
- aucune modification documentaire ne doit etre faite hors perimetre autorise ;
- chaque agent doit respecter son role, ses droits et ses limites.

La gouvernance garantit que la connaissance reste :

- fiable ;
- exploitable ;
- stable ;
- verifiable ;
- compatible avec ChatGPT, Codex, OpenClaw et les futurs agents.

---

# 3. Acteurs officiels

Les acteurs officiels du Knowledge System CEREBRAU sont :

| Acteur | Role general |
|---|---|
| Product Owner | Autorite decisionnelle finale |
| Architecte | Autorite de structuration et specification |
| ChatGPT | Agent de consultation, synthese et raisonnement documentaire |
| Codex | Agent d'execution controlee des lots et livrables |
| OpenClaw | Agent d'exploitation documentaire et navigation indexee |
| Futurs agents | Agents specialises soumis aux memes regles de gouvernance |
| Utilisateur | Demandeur, lecteur ou contributeur selon le perimetre autorise |

Un acteur ne possede que les droits explicitement definis par son role ou par une mission valide.

---

# 4. Responsabilites

## 4.1 Product Owner

Le Product Owner est responsable :

- de la vision ;
- des arbitrages ;
- des validations finales ;
- des decisions structurantes ;
- de l'autorisation des changements de gouvernance ;
- de la validation des exceptions.

Le Product Owner est l'autorite finale en cas de conflit documentaire ou decisionnel.

## 4.2 Architecte

L'Architecte est responsable :

- de la traduction des decisions en specifications ;
- de la coherence des lots ;
- de la coherence des fondations documentaires ;
- de la structuration des registres, index et workflows ;
- de la qualification des impacts ;
- de la preparation des criteres de validation.

L'Architecte peut proposer une evolution.

L'Architecte ne remplace pas la validation finale du Product Owner.

## 4.3 ChatGPT

ChatGPT est responsable :

- de consulter les connaissances disponibles ;
- de produire des syntheses ;
- d'identifier les documents pertinents ;
- de distinguer faits, risques et recommandations lorsque cela est demande ;
- de signaler les contradictions detectees ;
- de ne pas inventer une information absente.

ChatGPT ne valide pas officiellement un document.

ChatGPT ne modifie pas directement les fichiers.

## 4.4 Codex

Codex est responsable :

- d'executer les missions documentaires autorisees ;
- de respecter le perimetre exact d'un lot ;
- de creer ou modifier uniquement les fichiers autorises ;
- de lire uniquement les references autorisees par la mission ;
- de signaler les blocages ;
- de produire le compte-rendu d'execution demande.

Codex ne decide pas.

Codex ne valide pas.

Codex n'elargit pas le perimetre.

## 4.5 OpenClaw

OpenClaw est responsable :

- d'exploiter le Knowledge Index ;
- de naviguer dans les index et registres ;
- de retrouver les relations entre objets documentaires ;
- de distinguer actif, legacy et archive ;
- d'assister les recherches multi-agents ;
- de signaler les incoherences d'indexation.

OpenClaw ne remplace pas les autorites humaines.

OpenClaw ne doit pas transformer une relation implicite en fait valide.

## 4.6 Futurs agents

Les futurs agents sont responsables :

- de respecter les fondations existantes ;
- de respecter la gouvernance ;
- de declarer leur perimetre ;
- de ne pas agir hors droits explicites ;
- de produire des sorties tracables ;
- de signaler les conflits ou informations manquantes.

Un futur agent doit etre rattache a un role, un perimetre et un niveau de droit avant exploitation.

## 4.7 Utilisateur

L'Utilisateur est responsable :

- de formuler une demande claire ;
- de fournir les contraintes applicables ;
- de valider ou refuser les livrables lorsque cette responsabilite lui revient ;
- de signaler les corrections attendues ;
- de ne pas considerer une proposition comme validation officielle sans autorite competente.

L'Utilisateur peut etre demandeur, lecteur, contributeur ou validateur selon le contexte.

---

# 5. Autorites

## 5.1 Qui decide

Le Product Owner decide :

- des orientations ;
- des arbitrages ;
- des priorites ;
- des validations finales ;
- des exceptions.

## 5.2 Qui propose

L'Architecte peut proposer :

- une structure ;
- une evolution ;
- une clarification ;
- un lot ;
- une regle ;
- un registre ;
- un index.

ChatGPT, Codex, OpenClaw ou un futur agent peuvent signaler un besoin de clarification lorsque la mission les y autorise.

## 5.3 Qui valide

Le Product Owner valide les decisions finales.

L'Architecte peut qualifier la conformite technique ou documentaire.

Codex, ChatGPT, OpenClaw et les futurs agents ne valident pas officiellement par defaut.

## 5.4 Qui execute

Codex execute les lots et productions documentaires autorises.

OpenClaw execute les consultations et exploitations indexees lorsque son perimetre le prevoit.

ChatGPT produit des analyses, syntheses ou formulations lorsque son perimetre le prevoit.

Les futurs agents executent uniquement les actions autorisees par leur role.

## 5.5 Qui controle

Le controle peut etre assure par :

- le Product Owner pour la validation finale ;
- l'Architecte pour la coherence documentaire ;
- Codex pour le respect du perimetre d'execution ;
- OpenClaw pour la coherence d'indexation ;
- ChatGPT pour l'analyse documentaire ;
- un futur agent specialise si son perimetre l'autorise.

Un controle automatique ou agentique ne remplace pas une validation d'autorite lorsqu'elle est requise.

---

# 6. Droits documentaires

## 6.1 Lecture

La lecture est autorisee lorsque :

- le document est dans le perimetre de la mission ;
- le document est une reference explicite ;
- le document est necessaire a la consultation autorisee ;
- le document n'est pas soumis a restriction specifique.

Les agents doivent privilegier les documents actifs.

Les documents legacy et archives sont consultes uniquement pour historique, audit ou compatibilite.

## 6.2 Creation

La creation est autorisee uniquement si :

- le fichier attendu est explicitement demande ;
- le chemin est explicitement defini ;
- le type de document est autorise ;
- le contenu reste dans le perimetre ;
- la mission autorise la production.

Codex ne cree jamais de fichier supplementaire.

## 6.3 Modification

La modification est autorisee uniquement si :

- le fichier est explicitement autorise en modification ;
- l'objectif de modification est defini ;
- les fondations applicables sont respectees ;
- la modification ne cree pas de refonte implicite.

Un agent ne modifie pas un document de gouvernance sans mission explicite.

## 6.4 Validation

La validation officielle appartient au Product Owner sauf delegation explicite.

Une validation doit etre :

- explicite ;
- tracable ;
- rattachee au document ;
- rattachee a une version ;
- rattachee a une date.

## 6.5 Archivage

L'archivage est autorise uniquement lorsqu'une decision ou une mission explicite l'autorise.

Un document archive doit conserver :

- son identifiant ;
- son chemin d'origine si connu ;
- sa date d'archivage si disponible ;
- son motif si disponible ;
- son successeur actif si disponible.

## 6.6 Suppression logique

La suppression logique retire un document du flux actif.

Elle ne supprime pas physiquement le fichier.

Elle doit etre indiquee par un statut, une entree d'index ou une decision.

La suppression logique doit rester reversible par consultation historique.

---

# 7. Cycle de validation

## 7.1 Draft

Le statut Draft designe un document en preparation.

Un document Draft n'est pas une reference officielle.

Il peut etre consulte avec prudence.

## 7.2 Review

Le statut Review designe un document en cours de controle.

Un document Review attend une verification ou une validation.

Il ne doit pas primer sur un document actif.

## 7.3 Valide

Le statut Valide designe un document accepte par l'autorite competente.

Un document Valide peut devenir Actif.

Un document Valide doit etre rattache a une version.

## 7.4 Actif

Le statut Actif designe une reference courante applicable.

Un document Actif est prioritaire dans la consultation.

Un document Actif peut etre remplace uniquement par decision ou lot explicite.

## 7.5 Legacy

Le statut Legacy designe une reference historique encore utile.

Un document Legacy n'est pas prioritaire par defaut.

Il peut expliquer une evolution, une compatibilite ou une decision ancienne.

## 7.6 Archive

Le statut Archive designe un document sorti du flux actif.

Une archive conserve la memoire documentaire.

Une archive ne doit pas etre utilisee comme reference active.

---

# 8. Tracabilite

La tracabilite documentaire repose sur :

- l'historique ;
- l'auteur ;
- la version ;
- la justification ;
- les liens vers les decisions ;
- les liens vers les lots ;
- les liens vers les registres ;
- les liens vers les index.

Chaque document de reference doit permettre d'identifier :

- son nom ;
- son statut ;
- son role ;
- son emplacement ;
- sa version ;
- son autorite ou proprietaire.

Une evolution documentaire doit etre rattachee a une justification lorsque cette justification existe.

Une decision structurante doit etre reliee aux documents qu'elle affecte.

---

# 9. Gestion des conflits

## 9.1 Deux documents contradictoires

En presence de deux documents contradictoires, l'ordre de resolution est :

1. document explicitement designe par la mission courante ;
2. document de gouvernance actif ;
3. document de reference actif ;
4. document valide ;
5. document draft ou review ;
6. document legacy ;
7. archive.

Si le conflit reste non resolu, l'agent doit signaler le conflit.

## 9.2 Deux decisions incompatibles

En presence de deux decisions incompatibles, l'ordre de resolution est :

1. decision validee par le Product Owner ;
2. decision la plus recente si les deux ont meme autorite ;
3. decision rattachee au perimetre exact de la mission ;
4. decision documentee dans un registre officiel.

Si l'autorite ne peut pas etre determinee, l'agent s'arrete et signale le blocage.

## 9.3 Deux versions concurrentes

En presence de deux versions concurrentes, l'ordre de resolution est :

1. version marquee Actif ;
2. version marquee Valide ;
3. version rattachee a la mission courante ;
4. version la plus recente si le statut est identique ;
5. version legacy uniquement pour historique.

Une version concurrente ne doit pas etre fusionnee sans mission explicite.

---

# 10. Compatibilite multi-agents

## 10.1 Regle generale

Les agents IA cooperent par consultation des memes references, registres et index.

Ils ne doivent pas produire des verites concurrentes.

Ils doivent respecter les statuts documentaires et les autorites.

## 10.2 ChatGPT

ChatGPT exploite la connaissance pour :

- comprendre ;
- synthetiser ;
- comparer ;
- expliquer ;
- signaler.

ChatGPT ne modifie pas directement le referentiel.

## 10.3 Codex

Codex exploite la connaissance pour :

- executer ;
- produire ;
- verifier ;
- respecter le perimetre ;
- signaler les blocages.

Codex ne doit pas depasser les fichiers autorises.

## 10.4 OpenClaw

OpenClaw exploite la connaissance pour :

- rechercher ;
- naviguer ;
- indexer ;
- relier ;
- detecter les incoherences.

OpenClaw ne doit pas faire autorite a la place du Product Owner ou de l'Architecte.

## 10.5 Futurs agents

Les futurs agents doivent declarer :

- leur role ;
- leur perimetre ;
- leurs droits ;
- leurs entrees autorisees ;
- leurs sorties autorisees ;
- leurs limites.

Un futur agent ne peut pas contourner la gouvernance existante.

---

# 11. Regles d'evolution

La gouvernance peut evoluer uniquement si :

- l'evolution est demandee explicitement ;
- l'autorite competente est identifiee ;
- le perimetre est defini ;
- les impacts sont connus ;
- les trois fondations existantes ne sont pas remises en cause.

Les trois fondations a preserver sont :

- le schema du Knowledge Index ;
- le moteur logique du Knowledge Index ;
- la couche de stockage du Knowledge Index.

Une evolution peut :

- ajouter un role ;
- preciser une responsabilite ;
- ajouter un statut ;
- clarifier un droit documentaire ;
- renforcer une regle de conflit ;
- preciser une cooperation multi-agents.

Une evolution ne doit pas :

- supprimer la separation entre modele, moteur, stockage et gouvernance ;
- rendre un agent IA autorite decisionnelle finale ;
- autoriser les modifications hors perimetre ;
- rendre les archives prioritaires par defaut ;
- supprimer la tracabilite ;
- remplacer les decisions explicites par des interpretations.

---

# 12. Regle de stabilite

Le present document constitue la reference officielle de gouvernance du Knowledge System CEREBRAU.

Les futurs lots peuvent enrichir cette gouvernance.

Les futurs lots ne doivent pas remettre en cause :

- les autorites definies ;
- la distinction entre decision, proposition, validation, execution et controle ;
- les droits documentaires ;
- le cycle Draft, Review, Valide, Actif, Legacy, Archive ;
- la tracabilite ;
- la resolution des conflits ;
- la compatibilite multi-agents ;
- les trois fondations existantes.

Cette regle garantit que la gouvernance peut evoluer sans casser le Knowledge System CEREBRAU.
