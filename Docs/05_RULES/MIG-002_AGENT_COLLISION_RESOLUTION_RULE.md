# MIG-002 - Agent Collision Resolution Rule

## Statut

**ACTIVE**

## Classification

**MIGRATION DOCTRINE**

## Programme

**NOVA ORCHESTRATOR**

## 1. Objectif

Definir la procedure officielle lorsqu'un actif documentaire migre depuis VEEDDA entre en collision avec un actif deja existant dans NOVA.

Cette regle garantit que la migration documentaire reste conforme aux principes suivants :

- COPY FIRST - NEVER DELETE ;
- conservation integrale du patrimoine documentaire ;
- absence d'ecrasement d'un actif NOVA ;
- absence de fusion automatique ;
- decision architecturale explicite avant resolution definitive.

## 2. Perimetre

Cette regle s'applique a toute migration documentaire depuis VEEDDA vers NOVA ORCHESTRATOR lorsque le chemin, le nom, l'identite fonctionnelle ou le role d'un document source entre en conflit avec un actif NOVA existant.

Elle s'applique notamment aux documents suivants :

- fiches agents ;
- doctrines ;
- regles de migration ;
- regles d'architecture ;
- documents de gouvernance ;
- index documentaires ;
- rapports de migration.

Cette regle ne remplace pas MIG-001.

Toute adaptation terminologique reste gouvernee par MIG-001.

## 3. Definition d'une collision

Une collision existe lorsqu'un actif VEEDDA a migrer ne peut pas etre copie vers son emplacement cible NOVA sans risquer au moins l'un des effets suivants :

- ecraser un actif NOVA existant ;
- masquer une version NOVA plus recente ;
- remplacer une doctrine deja active ;
- confondre deux actifs portant le meme nom mais des responsabilites differentes ;
- fusionner implicitement deux contenus non equivalents ;
- introduire une ambiguite sur la source de verite ;
- perdre l'historique ou le contexte d'origine d'un document.

Une collision est une divergence documentaire.

Toute divergence documentaire doit etre documentee avant decision.

## 4. Types de collisions

### 4.1 Document identique

Le document source VEEDDA et l'actif NOVA cible ont le meme contenu verifie par SHA-256.

Comportement :

- ne pas ecraser ;
- documenter l'equivalence ;
- conserver l'actif NOVA existant ;
- signaler que la migration est deja satisfaite.

### 4.2 Document plus recent

L'actif NOVA cible est plus recent que le document source VEEDDA ou porte un statut documentaire plus avance.

Comportement :

- ne pas ecraser ;
- isoler le document source ;
- documenter la difference ;
- reporter la decision a l'Architecte.

### 4.3 Document plus ancien

L'actif NOVA cible est plus ancien que le document source VEEDDA.

Comportement :

- ne pas ecraser ;
- isoler le document source ;
- documenter l'ecart de version ;
- reporter la decision a l'Architecte.

### 4.4 Document divergent

Le document source VEEDDA et l'actif NOVA cible portent le meme nom ou le meme emplacement cible, mais leur contenu, leur statut, leur mission ou leur responsabilite divergent.

Comportement :

- ne pas ecraser ;
- ne pas fusionner ;
- conserver les deux versions ;
- produire un rapport de collision ;
- reporter la decision a l'Architecte.

### 4.5 Agent deja existant

Une fiche agent migree depuis VEEDDA entre en conflit avec une fiche agent NOVA deja existante.

Comportement :

- ne pas remplacer l'agent NOVA ;
- ne pas creer un nouvel agent sans mission dediee ;
- isoler la fiche VEEDDA ;
- produire un rapport de collision ;
- reporter la decision a l'Architecte.

### 4.6 Doctrine deja existante

Une doctrine migree depuis VEEDDA entre en conflit avec une doctrine NOVA deja active.

Comportement :

- ne pas remplacer la doctrine NOVA ;
- ne pas fusionner les doctrines ;
- documenter le conflit ;
- reporter la decision a l'Architecte et a l'Executive lorsque la doctrine active est impactee.

## 5. Comportement obligatoire de la Migration Squad

Lorsqu'une collision est detectee, la Migration Squad doit appliquer les obligations suivantes :

- identifier le document source ;
- identifier l'actif NOVA existant ;
- calculer les SHA-256 disponibles ;
- qualifier le type de collision ;
- isoler le document source ;
- produire un rapport de collision ;
- poursuivre le batch automatiquement ;
- reporter la decision a l'Architecte.

Interdictions absolues :

- ecraser un actif NOVA ;
- supprimer un document VEEDDA ;
- supprimer un document NOVA ;
- deplacer un document VEEDDA ;
- fusionner automatiquement deux documents ;
- renommer automatiquement un actif ;
- creer un nouvel agent pour contourner la collision ;
- modifier une doctrine existante sans mission dediee.

## 6. Procedure officielle

Lors d'une collision, la procedure officielle est la suivante :

1. Isoler le document.
2. Creer un rapport de collision.
3. Conserver les deux versions.
4. Poursuivre automatiquement le batch.
5. Reporter la decision a l'Architecte.

Le rapport de collision doit contenir au minimum :

- mission ID ;
- chemin source VEEDDA ;
- chemin cible NOVA ;
- actif NOVA existant ;
- type de collision ;
- SHA-256 source ;
- SHA-256 cible existante ;
- synthese des differences ;
- decision de blocage local ;
- recommandation d'arbitrage ;
- statut GO / NO GO local.

## 7. Regles

### MIG-002-R001 - Non-interruption du batch

Le batch ne doit jamais etre interrompu par une collision documentaire.

La collision est isolee.

Le traitement des autres documents continue.

### MIG-002-R002 - Traitement independant

Chaque collision doit etre traitee independamment.

Une collision sur un document ne bloque pas la migration des autres documents.

### MIG-002-R003 - Conservation des versions

Les deux versions doivent etre conservees jusqu'a decision architecturale.

Aucune version ne peut etre supprimee pour resoudre une collision.

### MIG-002-R004 - Autorite de resolution

La resolution d'une collision appartient a l'Architecte.

Lorsque la collision impacte une doctrine active, l'Executive doit etre sollicite selon la gouvernance NOVA.

### MIG-002-R005 - Pas de speculation terminologique

Une collision ne justifie jamais une adaptation terminologique speculative.

Toute terminologie reste gouvernee par MIG-001.

### MIG-002-R006 - Source intacte

VEEDDA reste intact pendant toute la procedure.

Aucun fichier VEEDDA ne peut etre modifie, supprime ou deplace.

## 8. Criteres d'acceptation

La gestion d'une collision est acceptable lorsque :

- le document source VEEDDA existe ;
- l'actif NOVA existant est identifie ;
- aucun actif NOVA n'a ete ecrase ;
- aucun document VEEDDA n'a ete modifie ;
- aucun document n'a ete supprime ;
- aucun document n'a ete fusionne automatiquement ;
- le type de collision est qualifie ;
- les SHA-256 disponibles sont calcules ;
- le rapport de collision est produit ;
- le batch continue avec les autres documents ;
- la decision finale est reportee a l'Architecte.

## 9. Criteres d'arret

La Migration Squad doit arreter le traitement du document concerne lorsque :

- le document source est introuvable ;
- le SHA-256 ne peut pas etre calcule ;
- la cible NOVA existe deja et n'est pas strictement identique ;
- la collision implique une doctrine active ;
- une resolution necessite une decision d'architecture ;
- une resolution necessite une nouvelle terminologie non couverte par MIG-001 ;
- une action risquerait d'ecraser, supprimer, deplacer ou fusionner un actif.

Cet arret est local au document concerne.

Le batch global continue, sauf si une regle de gouvernance superieure impose l'arret complet de la mission.

## 10. References

- MIG-001 - Terminology Migration Rule
- NOVA Migration Governance
- NOVA Guiding Principles
- COPY FIRST - NEVER DELETE

---

Fin du document.
