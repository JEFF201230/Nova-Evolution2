# CEREBRAU Knowledge Operations Manual

Version : 1.0

Statut : Reference

---

# 1. Objet

Le present document constitue le manuel operationnel officiel du Knowledge System CEREBRAU.

Il definit les procedures quotidiennes permettant d'exploiter le systeme documentaire.

Il s'appuie sur les quatre fondations existantes :

- `KNOWLEDGE_INDEX_SCHEMA.md` ;
- `KNOWLEDGE_INDEX_ENGINE.md` ;
- `KNOWLEDGE_INDEX_STORAGE.md` ;
- `KNOWLEDGE_GOVERNANCE.md`.

Il ne cree pas une nouvelle architecture.

Il ne modifie pas les fondations existantes.

Il decrit uniquement les procedures d'exploitation.

Chaque procedure est independante.

Chaque procedure peut etre executee par un agent IA ou par un operateur humain dans le respect des droits documentaires applicables.

---

# 2. Principes d'exploitation

## 2.1 Regles generales

Toute operation documentaire doit :

- disposer d'un objectif explicite ;
- disposer d'un perimetre explicite ;
- identifier les documents sources utiles ;
- identifier les fichiers autorises ;
- respecter les statuts documentaires ;
- respecter les droits de lecture, creation, modification, validation, archivage et suppression logique ;
- maintenir la tracabilite ;
- mettre a jour les registres ou index lorsque la mission l'autorise ;
- s'arreter en cas de conflit non resolu.

## 2.2 Ordre de reference

Lorsqu'une operation utilise plusieurs references, l'ordre de consultation est :

1. mission courante ;
2. documents de gouvernance applicables ;
3. schema du Knowledge Index ;
4. moteur du Knowledge Index ;
5. stockage du Knowledge Index ;
6. registres ;
7. index ;
8. documents actifs ;
9. documents legacy ;
10. archives.

## 2.3 Regles d'arret

Une operation documentaire doit s'arreter si :

- le fichier cible n'est pas defini ;
- le perimetre est ambigu ;
- une action interdite est necessaire ;
- deux documents actifs sont contradictoires ;
- deux decisions incompatibles ne peuvent pas etre resolues ;
- une information obligatoire est absente ;
- une modification hors perimetre serait necessaire ;
- une validation d'autorite est requise mais absente.

## 2.4 Controle minimal commun

Chaque operation doit verifier :

- le nom exact du livrable ;
- le chemin exact du livrable ;
- le statut du document produit ou modifie ;
- les liens vers les references ;
- l'absence de fichier supplementaire ;
- l'absence de modification hors perimetre ;
- la coherence avec les fondations du Knowledge System.

---

# 3. Procedure - Creation d'un Programme

## 3.1 Prerequis

Avant de creer un Programme, verifier :

- l'existence d'un objectif de programme ;
- l'autorite emettrice ;
- l'identifiant `PROGRAM-XXX` disponible ;
- le perimetre du programme ;
- le registre `PROGRAM_REGISTER.md` si sa mise a jour est autorisee ;
- les EPIC ou lots deja connus ;
- les documents de vision ou decisions applicables.

## 3.2 Etapes

1. Lire la mission courante.
2. Identifier le nom du programme.
3. Identifier l'objectif du programme.
4. Attribuer ou confirmer l'identifiant `PROGRAM-XXX`.
5. Definir le statut initial.
6. Rattacher le programme a la vision ou a la decision applicable.
7. Identifier les EPIC associes si disponibles.
8. Identifier les lots associes si disponibles.
9. Produire ou mettre a jour le document autorise par la mission.
10. Renseigner le registre uniquement si la mission l'autorise.

## 3.3 Controles

Verifier :

- unicite de l'identifiant ;
- coherence du nom ;
- coherence du statut ;
- presence de l'objectif ;
- presence du responsable ou proprietaire ;
- liens vers la vision, les EPIC, les lots ou decisions ;
- absence de programme concurrent actif sur le meme perimetre.

## 3.4 Validation

Un Programme est validable si :

- son identifiant est unique ;
- son objectif est clair ;
- son perimetre est defini ;
- son statut est renseigne ;
- son proprietaire est identifie ;
- ses dependances sont explicites.

La validation officielle depend de l'autorite competente.

## 3.5 Cloture

Clore l'operation en indiquant :

- le programme cree ou mis a jour ;
- les fichiers produits ;
- les registres mis a jour si autorises ;
- les controles realises ;
- les blocages eventuels.

---

# 4. Procedure - Creation d'un EPIC

## 4.1 Prerequis

Avant de creer un EPIC, verifier :

- l'existence du programme parent ;
- l'identifiant `EPIC-XXX` disponible ;
- l'objectif de l'EPIC ;
- le perimetre fonctionnel ou strategique ;
- les lots associes si connus ;
- les decisions applicables.

## 4.2 Etapes

1. Lire la mission courante.
2. Identifier le programme parent.
3. Identifier le titre de l'EPIC.
4. Attribuer ou confirmer l'identifiant `EPIC-XXX`.
5. Definir l'objectif de l'EPIC.
6. Definir le statut initial.
7. Declarer les lots associes si disponibles.
8. Declarer les dependances.
9. Produire ou mettre a jour le document autorise par la mission.
10. Mettre a jour le registre EPIC uniquement si la mission l'autorise.

## 4.3 Controles

Verifier :

- existence du programme parent ;
- unicite de l'identifiant ;
- coherence du perimetre ;
- absence de doublon avec un EPIC actif ;
- relations avec les lots ;
- statut conforme.

## 4.4 Validation

Un EPIC est validable si :

- il depend d'un programme connu ;
- il possede un objectif unique ;
- son perimetre est stable ;
- ses lots associes sont connus ou declares absents ;
- son statut est renseigne.

## 4.5 Cloture

Clore l'operation en indiquant :

- l'EPIC cree ou mis a jour ;
- son programme parent ;
- les fichiers produits ;
- les registres mis a jour si autorises ;
- les controles realises.

---

# 5. Procedure - Creation d'un LOT

## 5.1 Prerequis

Avant de creer un LOT, verifier :

- l'identifiant `COS-XXX` disponible ;
- l'objectif unique du lot ;
- le perimetre autorise ;
- le perimetre interdit ;
- les livrables attendus ;
- les contraintes ;
- les criteres d'acceptation ;
- les criteres de rejet ;
- les references obligatoires.

## 5.2 Etapes

1. Lire la mission courante.
2. Identifier l'identifiant `COS-XXX`.
3. Confirmer le titre du lot.
4. Rediger l'objectif unique.
5. Rediger le contexte strictement necessaire.
6. Declarer les actions autorisees.
7. Declarer les fichiers autorises en lecture, creation ou modification.
8. Declarer les actions interdites.
9. Declarer les livrables attendus.
10. Declarer les contraintes.
11. Declarer les criteres d'acceptation.
12. Declarer les criteres de rejet.
13. Declarer la procedure de cloture si le modele applicable l'exige.
14. Produire uniquement le fichier de lot autorise.

## 5.3 Controles

Verifier :

- respect du format `COS-XXX` ;
- unicite de l'identifiant ;
- presence d'un seul objectif ;
- absence de livrable implicite ;
- coherence entre perimetre autorise et livrables ;
- coherence entre perimetre interdit et contraintes ;
- absence d'action non autorisee.

## 5.4 Validation

Un LOT est validable si :

- il respecte le modele applicable ;
- son perimetre est ferme ;
- ses livrables sont exacts ;
- ses criteres d'acceptation sont verifiables ;
- ses criteres de rejet sont explicites.

## 5.5 Cloture

Clore l'operation en indiquant :

- le lot cree ;
- le chemin exact ;
- les fichiers crees ;
- les fichiers modifies ;
- les controles realises ;
- les blocages eventuels.

---

# 6. Procedure - Creation d'une DECISION

## 6.1 Prerequis

Avant de creer une DECISION, verifier :

- le besoin decisionnel ;
- l'autorite competente ;
- l'identifiant `DECISION-XXX` disponible ;
- le perimetre impacte ;
- les documents concernes ;
- les alternatives ou conflits a resoudre si disponibles.

## 6.2 Etapes

1. Lire la mission courante.
2. Identifier l'objet de la decision.
3. Attribuer ou confirmer l'identifiant `DECISION-XXX`.
4. Identifier l'autorite decisionnelle.
5. Decrire le perimetre concerne.
6. Decrire la decision.
7. Decrire la justification factuelle si elle est fournie.
8. Identifier les impacts.
9. Relier la decision aux programmes, EPIC, lots, references ou architectures concernes.
10. Produire le document autorise.
11. Mettre a jour le registre de decisions uniquement si la mission l'autorise.

## 6.3 Controles

Verifier :

- existence de l'autorite decisionnelle ;
- unicite de l'identifiant ;
- absence de contradiction avec une decision superieure ;
- coherence du perimetre ;
- liens vers les objets impactes ;
- statut documente.

## 6.4 Validation

Une DECISION est validable si :

- l'autorite est identifiee ;
- la decision est explicite ;
- le perimetre est defini ;
- les impacts sont listes ;
- les liens documentaires sont presents ;
- le statut est renseigne.

## 6.5 Cloture

Clore l'operation en indiquant :

- la decision creee ;
- son identifiant ;
- les documents impactes ;
- les registres mis a jour si autorises ;
- les controles realises.

---

# 7. Procedure - Creation d'un document de reference

## 7.1 Prerequis

Avant de creer un document de reference, verifier :

- l'objectif du document ;
- le chemin cible ;
- la categorie applicable ;
- l'autorite ou proprietaire ;
- les fondations a respecter ;
- le statut initial ;
- les documents sources autorises.

## 7.2 Etapes

1. Lire la mission courante.
2. Identifier le chemin exact du document.
3. Identifier la categorie du document.
4. Identifier son role dans le Knowledge System.
5. Definir le statut initial.
6. Rediger le contenu dans le perimetre demande.
7. Ajouter les liens vers les references applicables.
8. Preciser la regle de stabilite si le document devient fondation ou reference permanente.
9. Produire uniquement le document autorise.
10. Mettre a jour les index uniquement si la mission l'autorise.

## 7.3 Controles

Verifier :

- chemin exact ;
- nom conforme ;
- categorie reconnue ;
- contenu limite au perimetre ;
- absence de code ou script si interdit ;
- absence de modification des fondations ;
- liens vers les references.

## 7.4 Validation

Un document de reference est validable si :

- son objet est clair ;
- son statut est renseigne ;
- son perimetre est respecte ;
- ses relations documentaires sont explicites ;
- sa stabilite est definie si necessaire.

## 7.5 Cloture

Clore l'operation en indiquant :

- le document cree ;
- les references utilisees ;
- les controles realises ;
- les fichiers non modifies qui devaient rester intacts.

---

# 8. Workflow - Draft vers Review vers Valide vers Actif

## 8.1 Prerequis

Avant de faire evoluer un statut, verifier :

- l'identifiant du document ;
- le statut courant ;
- l'autorite de validation ;
- les criteres de controle ;
- les liens et dependances ;
- la version concernee.

## 8.2 Passage Draft vers Review

Etapes :

1. Verifier que le document est complet pour relecture.
2. Verifier que les champs obligatoires sont presents.
3. Verifier que les liens principaux sont renseignes.
4. Marquer le document comme pret pour controle si la mission l'autorise.
5. Signaler les informations manquantes si elles bloquent la relecture.

Controles :

- objectif present ;
- perimetre present ;
- statut present ;
- proprietaire identifie ;
- version identifiee.

## 8.3 Passage Review vers Valide

Etapes :

1. Lire les retours de controle.
2. Verifier l'absence de conflit non resolu.
3. Verifier que l'autorite competente valide le document.
4. Rattacher la validation a une version.
5. Declarer le document comme Valide si la mission l'autorise.

Controles :

- validation explicite ;
- version explicite ;
- liens coherents ;
- dependances coherentes.

## 8.4 Passage Valide vers Actif

Etapes :

1. Verifier qu'aucun autre document actif ne couvre le meme perimetre.
2. Identifier les documents remplaces si disponibles.
3. Declarer le document comme reference active si la mission l'autorise.
4. Mettre a jour les index ou registres autorises.
5. Signaler les documents legacy ou archives associes.

Controles :

- unicite de la reference active ;
- statut coherent ;
- index mis a jour si autorise ;
- relations documentaires coherentes.

## 8.5 Cloture du workflow

Clore le workflow en indiquant :

- ancien statut ;
- nouveau statut ;
- autorite de validation ;
- version concernee ;
- index ou registres mis a jour si autorises.

---

# 9. Workflow - Actif vers Legacy vers Archive

## 9.1 Prerequis

Avant de sortir un document du flux actif, verifier :

- le document actif concerne ;
- la decision ou mission autorisant le changement ;
- le document successeur si disponible ;
- les index impactes ;
- les registres impactes ;
- les liens entrants et sortants.

## 9.2 Passage Actif vers Legacy

Etapes :

1. Identifier la reference active actuelle.
2. Identifier la nouvelle reference active si elle existe.
3. Verifier l'autorisation de changement de statut.
4. Declarer le document comme Legacy si la mission l'autorise.
5. Relier le document Legacy a son successeur actif si disponible.
6. Mettre a jour les index autorises.

Controles :

- existence d'une cause de changement ;
- successeur actif indique si disponible ;
- absence d'utilisation prioritaire par defaut ;
- liens historiques conserves.

## 9.3 Passage Legacy vers Archive

Etapes :

1. Verifier que le document Legacy n'est plus necessaire au flux courant.
2. Verifier l'autorisation d'archivage.
3. Conserver l'identifiant.
4. Conserver le lien vers l'origine.
5. Declarer le document comme Archive si la mission l'autorise.
6. Mettre a jour l'index Archive si autorise.

Controles :

- statut archive explicite ;
- origine conservee ;
- successeur actif conserve si disponible ;
- archive non prioritaire par defaut.

## 9.4 Cloture du workflow

Clore le workflow en indiquant :

- document concerne ;
- ancien statut ;
- nouveau statut ;
- successeur actif si disponible ;
- index ou registres mis a jour si autorises.

---

# 10. Procedure - Mise a jour des index

## 10.1 Quand mettre a jour

Les index doivent etre mis a jour lorsqu'une mission l'autorise et qu'un des evenements suivants survient :

- creation d'un document indexable ;
- modification d'un statut ;
- creation d'un programme ;
- creation d'un EPIC ;
- creation d'un lot ;
- creation d'une decision ;
- remplacement d'une reference active ;
- passage en Legacy ;
- passage en Archive ;
- ajout ou retrait d'une relation ;
- correction d'un lien casse.

## 10.2 Pourquoi mettre a jour

La mise a jour des index permet :

- de retrouver les documents ;
- de maintenir les relations ;
- de distinguer actif, legacy et archive ;
- de faciliter la recherche agent IA ;
- de detecter les incoherences ;
- de conserver la tracabilite.

## 10.3 Comment mettre a jour

Etapes :

1. Identifier l'index concerne.
2. Identifier l'entree documentaire.
3. Verifier l'identifiant.
4. Verifier le chemin.
5. Verifier le type.
6. Verifier le statut.
7. Verifier les liens et dependances.
8. Mettre a jour uniquement les champs autorises par la mission.
9. Verifier la coherence avec les index secondaires si disponibles.
10. Produire le compte-rendu de mise a jour.

## 10.4 Controles

Verifier :

- unicite de l'identifiant ;
- existence du chemin ;
- statut reconnu ;
- categorie reconnue ;
- absence de doublon ;
- coherence des liens ;
- absence de document archive utilise comme actif ;
- coherence entre index principal et index secondaire.

---

# 11. Procedure - Audit documentaire

## 11.1 Prerequis

Avant de lancer un audit documentaire, verifier :

- le perimetre de l'audit ;
- les documents autorises en lecture ;
- les registres autorises ;
- les index autorises ;
- les criteres d'audit ;
- les limites de la mission.

## 11.2 Verification des liens

Etapes :

1. Lister les liens sortants du perimetre.
2. Lister les liens entrants disponibles.
3. Verifier l'existence des cibles.
4. Verifier la coherence des references croisees.
5. Identifier les liens casses.
6. Identifier les liens ambigus.

## 11.3 Objets orphelins

Etapes :

1. Identifier les documents sans parent connu.
2. Identifier les entrees d'index sans document source.
3. Identifier les documents sources sans entree d'index lorsque l'indexation est attendue.
4. Distinguer les objets volontairement autonomes des incoherences.
5. Signaler les objets orphelins.

## 11.4 Doublons

Etapes :

1. Rechercher les identifiants dupliques.
2. Rechercher les titres identiques.
3. Rechercher les documents actifs couvrant le meme perimetre.
4. Rechercher les registres redondants.
5. Signaler les doublons sans les fusionner.

## 11.5 Coherence

Etapes :

1. Verifier les statuts.
2. Verifier les categories.
3. Verifier les niveaux hierarchiques.
4. Verifier les dependances.
5. Verifier les relations bidirectionnelles.
6. Verifier la distinction actif, legacy, archive.

## 11.6 Conformite

Etapes :

1. Verifier la conformite au schema.
2. Verifier la conformite au moteur.
3. Verifier la conformite au stockage.
4. Verifier la conformite a la gouvernance.
5. Classer les ecarts constates.
6. Produire un rapport factuel si la mission l'autorise.

---

# 12. Procedure - Cloture d'une operation documentaire

## 12.1 Controles finaux

Avant cloture, verifier :

- tous les livrables attendus sont produits ;
- aucun livrable supplementaire n'est produit ;
- aucun fichier hors perimetre n'est modifie ;
- aucun fichier hors perimetre n'est cree ;
- les documents de reference interdits sont restes inchanges ;
- les contraintes de format sont respectees ;
- les index ou registres sont mis a jour uniquement si autorises.

## 12.2 Validation

La validation de cloture requiert :

- la conformite du livrable ;
- la conformite du chemin ;
- la conformite du perimetre ;
- la conformite des controles ;
- l'absence de critere de rejet ;
- l'absence de conflit non resolu.

La validation officielle reste soumise a l'autorite competente.

## 12.3 Tracabilite

Le compte-rendu doit indiquer :

- les actions realisees ;
- les fichiers crees ;
- les fichiers modifies ;
- les fichiers de reference consultes ;
- les fichiers explicitement non modifies ;
- les controles realises ;
- les blocages eventuels.

## 12.4 Compte-rendu

Le compte-rendu doit rester factuel.

Il ne doit pas proposer une mission suivante.

Il ne doit pas anticiper un lot futur.

Il ne doit pas ajouter une recommandation non demandee.

## 12.5 Arret

Lorsque la cloture est produite :

- arreter l'operation ;
- ne creer aucun autre fichier ;
- ne modifier aucun autre fichier ;
- attendre une nouvelle mission.

---

# 13. Regle de stabilite

Le present document constitue le manuel officiel d'exploitation du Knowledge System CEREBRAU.

Toutes les futures operations documentaires devront etre compatibles avec ce manuel.

Les futurs lots peuvent :

- ajouter une procedure ;
- preciser une procedure existante ;
- ajouter un controle ;
- documenter un cas particulier ;
- clarifier une cloture operationnelle.

Les futurs lots ne doivent pas :

- remettre en cause les quatre fondations existantes ;
- creer une nouvelle architecture ;
- supprimer l'independance des procedures ;
- autoriser une operation hors perimetre ;
- supprimer la tracabilite ;
- supprimer les controles finaux ;
- rendre une archive prioritaire par defaut.

Cette regle garantit que le manuel peut evoluer sans casser le Knowledge System CEREBRAU.
