# PRODUCT-RULE-004 - UX Rules

MISSION_ID : NOVA-013

Agent : Product Rules Agent

Statut : Draft validable

Niveau : L1 - Product Rule

Applicabilite : interfaces produit, parcours utilisateur, contenus visibles, composants UI, messages, navigation, formulaires, exports et rapports metier.

---

# 1. Objectif

Cette regle definit les conditions UX minimales applicables aux produits metier.

Elle garantit que les interfaces restent comprehensibles, coherentes, accessibles, stables et centrees sur l'usage metier.

---

# 2. Principes UX

- l'utilisateur voit un produit metier, jamais l'architecture interne ;
- chaque ecran doit porter une intention claire ;
- chaque action doit avoir un resultat comprehensible ;
- le langage doit etre metier, direct et non technique ;
- l'interface doit prevenir les erreurs avant de les expliquer ;
- les etats vides, chargements, erreurs et succes sont des etats de produit a part entiere ;
- la coherence prime sur l'effet visuel.

---

# 3. Regles obligatoires

## PROD-UX-001 - Intention d'ecran

Chaque ecran doit repondre a une intention utilisateur identifiable :

- consulter ;
- comparer ;
- saisir ;
- verifier ;
- decider ;
- suivre ;
- exporter ;
- administrer dans un perimetre autorise.

Un ecran sans intention claire est non conforme.

## PROD-UX-002 - Navigation

La navigation doit etre :

- stable ;
- previsible ;
- limitee aux fonctions produit autorisees ;
- formulee en langage metier ;
- sans entree vers CEREBRAU, ORCHESTRATOR ou composants internes.

## PROD-UX-003 - Hierarchie visuelle

La hierarchie visuelle doit permettre de distinguer :

- contexte ;
- information principale ;
- actions principales ;
- actions secondaires ;
- alertes ;
- aide ou details.

Une action destructrice ne doit jamais etre presentee comme action neutre.

## PROD-UX-004 - Formulaires

Tout formulaire doit fournir :

- libelles explicites ;
- formats attendus ;
- validation avant soumission ;
- messages d'erreur localises ;
- conservation des donnees saisies en cas d'erreur recuperable ;
- action de validation claire.

## PROD-UX-005 - Messages

Les messages visibles doivent etre :

- comprehensibles sans connaissance technique ;
- actionnables lorsque l'utilisateur peut agir ;
- non accusatoires ;
- non divulgants ;
- coherents avec le vocabulaire produit.

## PROD-UX-006 - Etats obligatoires

Les composants et pages critiques doivent prevoir :

- chargement ;
- vide ;
- succes ;
- erreur ;
- acces interdit ;
- donnees partielles ;
- indisponibilite temporaire.

## PROD-UX-007 - Accessibilite minimale

Toute surface produit doit respecter :

- contraste lisible ;
- focus clavier visible ;
- libelles pour champs et actions ;
- alternatives textuelles lorsque necessaire ;
- ordre de lecture coherent ;
- absence d'information portee uniquement par la couleur.

## PROD-UX-008 - Coherence composants

Les composants doivent reutiliser les patterns existants lorsqu'ils couvrent le besoin.

La creation d'un nouveau pattern UX est autorisee uniquement si :

- aucun pattern existant ne convient ;
- l'usage est recurrent ou critique ;
- le comportement est documente ;
- l'impact mobile et desktop est verifie.

## PROD-UX-009 - Donnees sensibles

Les donnees sensibles doivent etre affichees uniquement si :

- l'utilisateur a le droit de les voir ;
- l'affichage sert une action ou une comprehension metier ;
- le niveau de detail est necessaire ;
- l'export ou la copie est controle.

## PROD-UX-010 - Confirmation

Une confirmation est obligatoire pour :

- suppression ;
- validation irreversible ;
- paiement ;
- transfert ;
- cloture ;
- action de masse ;
- modification ayant un impact legal, financier ou RH.

La confirmation doit indiquer l'impact reel de l'action.

---

# 4. Conditions de blocage

Une interface est bloquee si :

- elle expose un terme interne reserve ;
- elle rend possible une action critique sans confirmation ;
- elle masque une erreur bloquante ;
- elle affiche une donnee sensible sans justification ;
- elle ne permet pas de comprendre l'etat courant ;
- elle introduit un pattern incoherent avec le produit ;
- elle viole une frontiere d'architecture ou de vocabulaire.

---

# 5. Critere de conformite

Un lot est conforme a `PRODUCT-RULE-004` si :

- chaque ecran a une intention claire ;
- la navigation reste metier et autorisee ;
- les formulaires sont validables et recuperables ;
- les messages sont comprehensibles ;
- les etats critiques sont couverts ;
- l'accessibilite minimale est respectee ;
- les donnees sensibles sont protegees ;
- les actions critiques sont confirmees ;
- aucune terminologie interne n'est visible dans le produit.

Statut propose pour validation : `DRAFT_VALIDABLE`.
