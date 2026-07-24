# EPIC-005_SECURITY_AND_ACCESS

## Titre

Security and Access

## Mission

DOCUMENT-EPIC-005

## Objectif

Definir le perimetre documentaire de securite et d'acces couvrant :

- ACL ;
- permissions ;
- RLS ;
- confidentiality ;
- visibility ;
- ownership ;
- audit access.

Cet EPIC doit structurer les lots de travail necessaires pour etablir une gouvernance claire des droits, des acces, de la confidentialite, de la visibilite et de la tracabilite.

## Perimetre

L'EPIC-005 couvre la definition fonctionnelle et documentaire des regles de securite et d'acces.

Il doit permettre de clarifier :

- qui peut voir quoi ;
- qui peut modifier quoi ;
- qui possede quoi ;
- qui valide quoi ;
- qui peut auditer quoi ;
- quelles informations sont confidentielles ;
- quelles informations sont visibles selon les roles, projets, missions et contextes ;
- comment les acces sont controles, justifies et tracables.

## Hors perimetre

L'EPIC-005 ne couvre pas :

- l'implementation technique ;
- le code applicatif ;
- les migrations ;
- la configuration d'un outil specifique ;
- la definition de secrets ;
- la gestion d'infrastructure ;
- les mecanismes cryptographiques detailles.

## Principes directeurs

Les principes de securite et d'acces sont :

- acces minimal necessaire ;
- separation des responsabilites ;
- visibilite explicite ;
- confidentialite par defaut lorsque le doute existe ;
- ownership identifiable ;
- permission justifiee par un role, un contexte ou une mission ;
- auditabilite de toute action sensible ;
- absence de droit implicite non documente ;
- alignement entre permissions, visibility et confidentiality.

## Decoupage LOT

### LOT-005A - Access Control Model

Objectif :

Definir le modele general de controle d'acces.

Contenu attendu :

- typologie des sujets d'acces ;
- typologie des objets proteges ;
- principes d'autorisation ;
- distinction lecture, ecriture, validation, administration et audit ;
- relation entre role, mission, projet et permission ;
- regles d'heritage ou de non-heritage des droits ;
- cas de refus explicite.

Livrables attendus :

- modele conceptuel ACL ;
- matrice de principes d'acces ;
- regles de resolution des conflits d'acces ;
- criteres de conformite documentaire.

### LOT-005B - Permissions

Objectif :

Definir les permissions fonctionnelles necessaires au systeme.

Contenu attendu :

- permissions de lecture ;
- permissions de creation ;
- permissions de modification ;
- permissions de suppression ou d'archivage ;
- permissions de validation ;
- permissions d'escalade ;
- permissions d'audit ;
- permissions d'administration ;
- permissions exceptionnelles.

Livrables attendus :

- dictionnaire des permissions ;
- classification des permissions sensibles ;
- regles d'attribution ;
- regles de retrait ;
- regles de revue periodique.

### LOT-005C - RLS

Objectif :

Definir le modele conceptuel de Row Level Security.

Contenu attendu :

- isolation par projet ;
- isolation par mission ;
- isolation par ownership ;
- acces par role ;
- acces par appartenance ;
- acces par delegation ;
- acces par contexte de validation ;
- restrictions sur les donnees confidentielles ;
- comportement attendu en cas d'absence de contexte.

Livrables attendus :

- principes RLS ;
- regles de segmentation des donnees ;
- cas d'acces autorise ;
- cas d'acces refuse ;
- criteres d'audit RLS.

### LOT-005D - Confidentiality

Objectif :

Definir les niveaux de confidentialite et leurs effets.

Contenu attendu :

- classification des informations ;
- niveaux de confidentialite ;
- donnees publiques internes ;
- donnees restreintes ;
- donnees sensibles ;
- donnees critiques ;
- donnees auditables uniquement ;
- regles de propagation de la confidentialite ;
- traitement des donnees mixtes.

Livrables attendus :

- modele de classification ;
- regles de manipulation ;
- regles de declassement ;
- regles de masquage ;
- criteres de violation de confidentialite.

### LOT-005E - Visibility

Objectif :

Definir ce qui est visible selon les roles, contextes et perimetres.

Contenu attendu :

- visibilite par role ;
- visibilite par projet ;
- visibilite par mission ;
- visibilite par programme ;
- visibilite des statuts ;
- visibilite des decisions ;
- visibilite des livrables ;
- visibilite des erreurs ;
- visibilite des audits ;
- visibilite partielle et masquee.

Livrables attendus :

- regles de visibilite ;
- niveaux de visibilite ;
- cas de masquage ;
- cas de visibilite restreinte ;
- criteres de coherence entre visibilite et permission.

### LOT-005F - Ownership

Objectif :

Definir la notion d'ownership sur les objets, decisions et responsabilites.

Contenu attendu :

- owner d'un projet ;
- owner d'une mission ;
- owner d'un livrable ;
- owner d'une decision ;
- owner d'une validation ;
- owner d'un document ;
- transfert d'ownership ;
- ownership temporaire ;
- ownership delegue ;
- conflit d'ownership.

Livrables attendus :

- modele d'ownership ;
- regles de responsabilite ;
- regles de transfert ;
- regles de delegation ;
- criteres de conflit.

### LOT-005G - Audit Access

Objectif :

Definir l'acces aux traces, historiques, evenements et actions sensibles.

Contenu attendu :

- acces aux logs d'audit ;
- acces aux historiques de decision ;
- acces aux evenements ;
- acces aux changements de permissions ;
- acces aux validations ;
- acces aux refus d'acces ;
- acces aux escalades ;
- acces aux actions administratives ;
- separation entre observation, audit et administration.

Livrables attendus :

- modele d'audit access ;
- typologie des traces auditables ;
- permissions d'audit ;
- regles de consultation ;
- regles de retention documentaire ;
- criteres de non-repudiation documentaire.

### LOT-005H - Security Governance

Objectif :

Definir la gouvernance globale de securite et d'acces.

Contenu attendu :

- roles responsables ;
- autorites de validation ;
- processus de revue d'acces ;
- processus d'exception ;
- processus de retrait ;
- gestion des conflits ;
- traitement des violations ;
- documentation des decisions de securite.

Livrables attendus :

- modele de gouvernance securite ;
- regles d'exception ;
- regles de revue ;
- regles d'escalade ;
- criteres de certification documentaire.

## Dependances

L'EPIC-005 depend des documents de reference suivants lorsqu'ils existent :

- dictionnaire canonique ;
- gouvernance ;
- modele d'etats ;
- modele Runtime ;
- architecture evenementielle ;
- modele de planification ;
- regles documentaires communes.

Aucun LOT de l'EPIC-005 ne doit contredire une source de verite superieure.

## Criteres d'acceptation

L'EPIC-005 est acceptable lorsque :

- les ACL sont definies ;
- les permissions sont classees ;
- les principes RLS sont documentes ;
- les niveaux de confidentiality sont explicites ;
- les regles de visibility sont definies ;
- l'ownership est attribuable et transferable ;
- l'audit access est separe des permissions operationnelles ;
- les exceptions sont gouvernees ;
- les conflits d'acces sont traitables ;
- chaque LOT produit un livrable documentaire identifiable.

## Livrables globaux

Livrables attendus :

- modele ACL ;
- dictionnaire des permissions ;
- modele RLS ;
- classification confidentiality ;
- modele visibility ;
- modele ownership ;
- modele audit access ;
- gouvernance security and access ;
- matrice de conflits ;
- criteres de certification documentaire.
