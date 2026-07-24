# PRODUCT-RULE-001 - Runtime Rules

MISSION_ID : NOVA-013

Agent : Product Rules Agent

Statut : Draft validable

Niveau : L1 - Product Rule

Applicabilite : produits metier, modules VEEDDA, surfaces applicatives, services d'execution, agents IA lorsqu'ils operent sur un livrable produit.

---

# 1. Objectif

Cette regle definit les conditions d'execution produit.

Elle encadre ce qui peut etre charge, execute, affiche, persiste, journalise ou bloque pendant l'utilisation d'un produit metier.

Elle complete les regles d'architecture sans les remplacer.

---

# 2. Principes runtime

- un runtime produit sert l'usage metier, pas la gouvernance interne ;
- toute execution doit etre rattachee a un contexte utilisateur ou systeme identifiable ;
- aucun traitement critique ne doit etre declenche sans entree validee ;
- aucun etat produit ne doit dependre d'une interpretation implicite d'un agent ;
- toute erreur bloquante doit etre visible sous forme metier exploitable ;
- les composants internes CEREBRAU et ORCHESTRATOR restent invisibles pour l'utilisateur final ;
- le runtime doit privilegier la coherence, la tracabilite et la reprise controlee.

---

# 3. Regles obligatoires

## PROD-RUN-001 - Contexte obligatoire

Toute execution produit doit disposer d'un contexte minimal :

- utilisateur ou acteur systeme ;
- organisation ou perimetre metier si applicable ;
- module concerne ;
- action demandee ;
- donnees d'entree validees ;
- droits applicables.

Sans contexte minimal, l'execution est refusee.

## PROD-RUN-002 - Validation avant execution

Les entrees doivent etre controlees avant toute mutation.

Sont interdites :

- mutation de donnees avec payload incomplet ;
- execution avec droits non verifies ;
- creation d'etat par defaut non documente ;
- correction silencieuse qui change le sens metier.

## PROD-RUN-003 - Idempotence des actions critiques

Toute action critique doit etre idempotente ou protegee contre les doubles executions.

Actions critiques minimales :

- paiement ;
- validation ;
- refus ;
- transfert ;
- cloture ;
- suppression ;
- generation d'ecriture comptable ;
- envoi de notification engageante.

## PROD-RUN-004 - Etat explicite

Un etat produit doit etre explicite, nomme et auditable.

Un etat ne doit pas etre deduit uniquement depuis l'affichage UI.

## PROD-RUN-005 - Gestion des erreurs

Une erreur runtime doit produire :

- un message utilisateur comprehensible ;
- une cause technique journalisable ;
- une action de reprise si elle existe ;
- aucune fuite de secret ou d'implementation interne.

## PROD-RUN-006 - Journalisation

Les actions sensibles doivent etre journalisees avec :

- acteur ;
- action ;
- cible ;
- date ou horodatage disponible ;
- resultat ;
- identifiant de correlation si disponible.

La journalisation ne doit pas exposer de donnees personnelles au-dela du besoin d'audit.

## PROD-RUN-007 - Degradation controlee

Si une dependance non critique est indisponible, le produit doit degrader l'experience sans bloquer les actions essentielles.

Si une dependance critique est indisponible, l'action doit etre bloquee avec explication metier.

## PROD-RUN-008 - Isolation des couches internes

Le runtime produit ne doit pas exposer :

- Context Engine ;
- Knowledge Center ;
- Agent Registry ;
- Validator ;
- Planning Engine ;
- Runtime interne ;
- ORCHESTRATOR ;
- CEREBRAU.

Toute capacite interne consommee doit passer par un contrat autorise et rester invisible comme composant produit.

---

# 4. Conditions de blocage

Une livraison produit est bloquee si :

- une action critique n'est pas idempotente ou protegee ;
- une mutation est possible sans controle des droits ;
- une erreur technique fuit vers l'utilisateur final ;
- un composant interne est visible dans le runtime produit ;
- une action sensible n'est pas tracable ;
- un etat produit est ambigu ou non auditable.

---

# 5. Critere de conformite

Un lot est conforme a `PRODUCT-RULE-001` si :

- le contexte d'execution est explicite ;
- les entrees sont validees avant mutation ;
- les actions critiques sont protegees ;
- les erreurs sont exploitables et non divulguantes ;
- les actions sensibles sont journalisees ;
- les couches internes restent invisibles ;
- les cas de degradation sont documentes.

Statut propose pour validation : `DRAFT_VALIDABLE`.
