# LOT TEMPLATE

Version : [VERSION DU LOT]

Statut : [DRAFT | EN COURS | LIVRE | VALIDE | REJETE]

---

# 1. Identification du lot

Identifiant du lot : [COS-XXX]

Titre du lot : [TITRE EXACT DU LOT]

Autorite emettrice : [PRODUCT OWNER | ARCHITECTE]

Executant : Codex

Document de reference obligatoire : MASTER_EXECUTION_SPECIFICATION v1.0

Regle d'identification :

- l'identifiant du lot est unique ;
- l'identifiant respecte le format COS-XXX ;
- l'identifiant est definitif ;
- l'identifiant ne peut jamais etre reutilise ;
- le titre decrit uniquement la mission du lot.

---

# 2. Objectif

Objectif unique du lot :

[DECRIRE L'OBJECTIF UNIQUE, FACTUEL ET VERIFIABLE DU LOT]

Regles applicables :

- le lot contient un seul objectif ;
- l'objectif ne peut pas etre modifie par Codex ;
- l'objectif ne peut pas etre elargi ;
- l'objectif ne peut pas etre interprete ;
- toute information manquante entraine un arret et une demande de clarification.

---

# 3. Contexte

Contexte fourni :

[DECRIRE UNIQUEMENT LE CONTEXTE NECESSAIRE A L'EXECUTION DU LOT]

References autorisees :

- [CHEMIN EXACT DU DOCUMENT OU FICHIER DE REFERENCE 1]
- [CHEMIN EXACT DU DOCUMENT OU FICHIER DE REFERENCE 2]

Regles applicables :

- le contexte ne cree aucun perimetre implicite ;
- seules les references explicitement listees peuvent etre utilisees ;
- Codex ne complete jamais le contexte par supposition ;
- Codex ne cree jamais une mission supplementaire a partir du contexte.

---

# 4. Perimetre autorise

Actions autorisees :

- [ACTION AUTORISEE 1]
- [ACTION AUTORISEE 2]

Fichiers autorises en lecture :

- [CHEMIN EXACT 1]
- [CHEMIN EXACT 2]

Fichiers autorises en modification :

- [CHEMIN EXACT 1]
- [CHEMIN EXACT 2]

Fichiers autorises en creation :

- [CHEMIN EXACT 1]
- [CHEMIN EXACT 2]

Regles applicables :

- Codex agit uniquement dans le perimetre autorise ;
- aucun fichier hors perimetre ne peut etre modifie ;
- aucun fichier hors perimetre ne peut etre cree ;
- aucune action non listee ne peut etre executee.

---

# 5. Perimetre interdit

Actions interdites :

- elargir le perimetre ;
- interpreter une consigne ;
- anticiper un lot futur ;
- proposer ou appliquer une amelioration non demandee ;
- modifier l'architecture ;
- modifier la doctrine ;
- modifier la gouvernance ;
- modifier la feuille de route ;
- modifier les priorites ;
- creer un fichier non demande ;
- creer un dossier non demande ;
- modifier un fichier hors perimetre ;
- supprimer un fichier sans autorisation explicite ;
- executer une migration sans autorisation explicite ;
- effectuer un commit sans autorisation explicite ;
- pousser des modifications sans autorisation explicite.

Fichiers et zones interdits :

- [CHEMIN EXACT OU ZONE INTERDITE 1]
- [CHEMIN EXACT OU ZONE INTERDITE 2]

Regle d'arret :

Si l'execution exige une action interdite ou non listee, Codex s'arrete immediatement et signale le blocage.

---

# 6. Livrables attendus

Livrables obligatoires :

- [CHEMIN EXACT DU LIVRABLE 1]
- [CHEMIN EXACT DU LIVRABLE 2]

Format attendu :

- [FORMAT EXACT DU LIVRABLE 1]
- [FORMAT EXACT DU LIVRABLE 2]

Contenu attendu :

- [CONTENU FACTUEL ATTENDU 1]
- [CONTENU FACTUEL ATTENDU 2]

Regles applicables :

- seuls les livrables listes peuvent etre produits ;
- chaque livrable respecte son nom exact ;
- chaque livrable respecte son chemin exact ;
- chaque livrable respecte son format exact ;
- chaque livrable respecte son contenu attendu ;
- aucun livrable supplementaire n'est autorise.

---

# 7. Contraintes d'execution

Contraintes permanentes :

- appliquer strictement le MASTER_EXECUTION_SPECIFICATION v1.0 ;
- executer uniquement la mission du lot ;
- ne jamais elargir le perimetre ;
- ne jamais interpreter une consigne ;
- ne jamais supposer une information manquante ;
- ne jamais prendre de decision d'architecture, de doctrine, de gouvernance ou de priorite ;
- ne jamais produire de livrable supplementaire ;
- ne jamais modifier un fichier hors perimetre ;
- ne jamais executer plusieurs lots simultanement ;
- s'arreter immediatement lorsque tous les livrables sont produits.

Contraintes specifiques au lot :

- [CONTRAINTE SPECIFIQUE 1]
- [CONTRAINTE SPECIFIQUE 2]

Gestion des erreurs :

- toute erreur detectee interrompt l'action en cours ;
- Codex ne contourne jamais une erreur ;
- Codex ne remplace jamais une solution par une autre ;
- Codex ne corrige jamais une erreur de sa propre initiative ;
- si la cause n'est pas demontree, Codex indique : **Cause non determinee.**

---

# 8. Criteres d'acceptation

Le lot est acceptable uniquement si :

- tous les livrables attendus sont produits ;
- aucun livrable supplementaire n'est produit ;
- aucun fichier hors perimetre n'est modifie ;
- aucun fichier hors perimetre n'est cree ;
- aucune action interdite n'est executee ;
- aucune regle du MASTER_EXECUTION_SPECIFICATION v1.0 n'est violee ;
- chaque livrable respecte le nom exact demande ;
- chaque livrable respecte le chemin exact demande ;
- chaque livrable respecte le format demande ;
- chaque livrable respecte le contenu attendu ;
- le perimetre autorise est integralement respecte ;
- le perimetre interdit est integralement respecte.

Criteres specifiques au lot :

- [CRITERE D'ACCEPTATION SPECIFIQUE 1]
- [CRITERE D'ACCEPTATION SPECIFIQUE 2]

---

# 9. Criteres de rejet

Le lot est rejete si :

- Codex cree un fichier non demande ;
- Codex cree un dossier non demande ;
- Codex modifie un element hors perimetre ;
- Codex execute une action non prevue par le lot ;
- Codex interprete une consigne ;
- Codex elargit le perimetre ;
- Codex anticipe un lot futur ;
- Codex propose ou applique une amelioration non demandee ;
- Codex modifie l'objectif du lot ;
- Codex fonde une decision sur une hypothese ;
- Codex produit un livrable supplementaire ;
- Codex viole une regle du MASTER_EXECUTION_SPECIFICATION v1.0.

Criteres de rejet specifiques au lot :

- [CRITERE DE REJET SPECIFIQUE 1]
- [CRITERE DE REJET SPECIFIQUE 2]

Consequence :

Un lot rejete est considere comme non livre. Il ne peut etre repris qu'apres emission d'une nouvelle instruction du Product Owner.

---

# 10. Procedure de cloture

La cloture du lot est autorisee uniquement lorsque :

- tous les livrables attendus sont produits ;
- aucun depassement de perimetre n'a ete constate ;
- les criteres d'acceptation sont satisfaits ;
- aucun critere de rejet n'est constate.

Procedure obligatoire :

1. verifier les livrables produits ;
2. verifier les fichiers modifies ;
3. verifier l'absence de fichier cree hors perimetre ;
4. verifier l'absence de modification hors perimetre ;
5. produire le compte-rendu d'execution ;
6. arreter immediatement le travail.

Interdiction de cloture :

- ne pas commencer un autre lot ;
- ne pas proposer une mission suivante ;
- ne pas ajouter d'analyse complementaire ;
- ne pas produire de livrable non demande.

---

# 11. Compte-rendu d'execution

Le compte-rendu d'execution doit contenir uniquement :

- le resume factuel des modifications realisees ;
- la liste exacte des fichiers modifies ;
- la confirmation qu'aucun autre fichier n'a ete modifie ;
- la mention des livrables produits ;
- la mention des criteres d'acceptation satisfaits ;
- le signalement factuel de tout blocage, si un blocage est survenu.

Format obligatoire du compte-rendu :

Resume des modifications :

- [RESUME FACTUEL 1]
- [RESUME FACTUEL 2]

Fichiers modifies :

- [CHEMIN EXACT 1]
- [CHEMIN EXACT 2]

Fichiers crees :

- [CHEMIN EXACT 1]
- [CHEMIN EXACT 2]

Confirmation :

Aucun autre fichier n'a ete modifie.

Blocage :

[AUCUN | DESCRIPTION FACTUELLE DU BLOCAGE]
