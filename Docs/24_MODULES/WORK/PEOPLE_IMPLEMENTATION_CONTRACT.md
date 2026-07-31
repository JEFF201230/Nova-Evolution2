# PEOPLE IMPLEMENTATION CONTRACT

## Statut documentaire

| Attribut | Valeur |
|---|---|
| Lot | P3-PEOPLE-001A |
| Phase | Phase 3 — People Foundation |
| Nature | Contrat de conception d'implémentation |
| Autorité métier | `PEOPLE_DOMAIN_BLUEPRINT.md` |
| Baseline Work | `WORK_DOMAIN_BLUEPRINT.md` |
| Gate Phase 3 | `WORK_PHASE2_CERTIFICATION.md` |
| Implémentation produite | Aucune |
| Verdict | GO |

Ce contrat traduit le blueprint People en décisions d'implémentation obligatoires. Il ne crée aucun modèle logiciel, aucune persistance et aucun chemin exécutable.

## 1. IMPLEMENTATION SCOPE

### 1.1 Fondation immédiate

People Foundation contient uniquement les concepts nécessaires pour protéger les invariants de WP-001 :

- Business Person et Business Identity ;
- rattachement canonique à Work ;
- Work Assignment ;
- Business Role ;
- Role Assignment ;
- Responsibility définie par le rôle ;
- Assignment Period ;
- Assignment Status ;
- provenance des reconnaissances et des affectations ;
- qualité de Participant dérivée d'une Affectation active ;
- unicité du Owner actif ;
- affectation au rôle Approver, distincte de toute Decision ;
- cycle d'entrée, suspension, reprise, évolution, remplacement et retrait ;
- histoire immuable des changements People.

La fondation ne contient aucune donnée de profil non exigée par WP-001. En particulier, nom d'affichage, coordonnées, organisation, préférences, disponibilité, compétences et attributs RH ne sont pas nécessaires à P3-PEOPLE-001.

### 1.2 Extensions futures

Restent des extensions soumises à une nouvelle décision :

- profil métier enrichi ;
- organisation et appartenance organisationnelle ;
- disponibilité et capacité ;
- compétences ;
- délégation ;
- séparation de responsabilités supplémentaire ;
- catégories de rôles autres que celles de WP-001 ;
- responsabilités personnalisées indépendantes d'un rôle ;
- relation explicite entre Business Person et identité technique ;
- archivage ou retrait d'une Business Person ;
- règles d'autorité déterminant qui peut émettre une commande People ;
- exposition aux domaines Planning, Actions, Deliverables, Decisions, Intelligence, Synthesis et Confidence au-delà des associations prévues.

### 1.3 Hors périmètre

Sont hors périmètre de toute la Foundation :

- RuntimeAgent et Technical Agent ;
- Mission Assignment technique ;
- authentification, Session, compte et User ;
- sécurité, permissions et RBAC ;
- HumanApprovalDecision ;
- Planning, Actions, Deliverables, Decisions, Intelligence, Synthesis et Confidence ;
- Frontend, BFF, API et transports ;
- projection UX et Read Model d'écran ;
- import de fixtures ou de données legacy non réconciliées ;
- création ou modification de Work ;
- implémentation de la persistance, des commandes, des requêtes et de l'intégration Work dans le lot A.

### 1.4 Fermeture du périmètre

Tout concept non listé dans la fondation immédiate est absent, même s'il semble utile à une future interface. Son absence ne peut pas être comblée par une valeur par défaut ou une donnée technique.

## 2. MODULE BOUNDARY

### 2.1 Responsabilité unique

Le futur module People aura une responsabilité unique :

> établir et préserver les Business Identities, les Affectations d'une personne à un Work, les rôles et responsabilités portés par ces Affectations, ainsi que leur histoire.

Il ne possédera aucun objet produit par un autre domaine.

### 2.2 Dépendances autorisées

People pourra dépendre conceptuellement de :

- la référence canonique d'un Work ;
- la confirmation que ce Work existe ;
- une notion de temps métier nécessaire aux périodes d'effet ;
- une provenance autoritative ;
- ses propres règles de rôles et responsabilités ;
- sa source canonique future.

Cette dépendance à Work est limitée à son identité. People n'accède ni au Lifecycle, ni au Progress, ni à l'Objective, ni à la Mission, sauf future décision explicite distincte.

### 2.3 Dépendances interdites

People ne dépendra jamais, pour établir un fait métier, de :

- RuntimeAgent ;
- Technical Agent ;
- registre des agents ;
- orchestrateur ;
- Session ;
- authentification ;
- User ou compte ;
- sécurité, permission ou RBAC ;
- identité portée par HumanApprovalDecision ;
- Frontend, BFF ou API ;
- fixture, mock ou projection ;
- Planning, Actions, Deliverables, Intelligence, Synthesis ou Confidence ;
- résultat de Decision pour fabriquer rétrospectivement un Approver.

### 2.4 Sens des dépendances

Les dépendances suivent le sens suivant :

| Source | Consommateur | Règle |
|---|---|---|
| Work Identity | People | People valide le contexte de l'Affectation sans posséder Work. |
| People | Work | Work pourra lire des associations People certifiées, sans écrire dans People. |
| People | Planning et Actions | Ces domaines pourront référencer des acteurs People, sans les créer. |
| People | Decisions | Decisions pourra vérifier une affectation Approver ; People ne produira pas la Decision. |
| People | Deliverables, Intelligence, Synthesis et Confidence | Ces domaines pourront lire des faits autorisés ; People ne dépendra pas de leurs résultats. |

Les écritures People entrent exclusivement par le futur producteur People. Aucun domaine consommateur ne modifie directement un agrégat People.

### 2.5 Relation avec Work

People utilise la référence métier canonique constituée de la Project Identity et de la Work Identity. Il ne crée ni identifiant Work parallèle, ni relation directe à Mission comme substitut.

Work conserve une association vers People. Il n'embarque ni l'agrégat Business Person, ni l'agrégat Work People, ni leur histoire.

### 2.6 Séparations techniques obligatoires

- Business Person n'est pas RuntimeAgent.
- Business Person n'est pas Technical Agent.
- Business Role n'est pas un rôle RBAC.
- Work Assignment People n'est pas RuntimeMission Assignment.
- Approver n'est pas une identité de Session et n'est pas une Decision.

## 3. AUTHORITATIVE OWNERSHIP

### 3.1 Producteur autoritatif futur

Le producteur métier futur est nommé conceptuellement **People Authority**.

People Authority sera l'unique point d'acceptation des changements People. Ce nom désigne une responsabilité métier, pas un composant logiciel imposé par le présent document.

Il devra :

- reconnaître une Business Identity ;
- créer et faire évoluer les Work Assignments ;
- appliquer les règles de rôles ;
- préserver l'unicité du Owner ;
- maintenir l'histoire ;
- rejeter toute source technique utilisée comme substitut ;
- émettre les événements People correspondant aux changements acceptés.

Le sous-lot P3-PEOPLE-001C devra établir ce producteur. Aucun autre lot ou consommateur ne pourra produire des faits People.

### 3.2 Matrice d'ownership

| Élément | Propriétaire | Source de vérité future | Règle d'écriture | Règle de lecture | Interdiction de duplication |
|---|---|---|---|---|---|
| Business Identity | Agrégat Business Person | État et histoire du Business Person acceptés par People Authority | Reconnaissance explicite ; identité stable ; aucune dérivation technique | Lecture depuis Business Person uniquement | Aucun annuaire, compte, Session ou agent ne devient copie autoritative. |
| People Assignment | Agrégat Work People | Work Assignment contenu dans Work People | Toute création ou évolution passe par People Authority et les invariants Work People | Lecture depuis le Work People du Work concerné | Aucun Assignment miroir dans Work, BFF ou un autre domaine. |
| Business Role — définition | Politique métier People certifiée par WP-001 et ce contrat | Vocabulaire fermé Owner, Contributor, Reviewer, Approver, Observer, Requester, Sponsor | Modification interdite sans nouvelle décision de blueprint | Lecture comme définition immuable People | Aucun rôle RBAC ou libellé UX ne redéfinit le rôle métier. |
| Business Role — affectation | Agrégat Work People | Role Assignment interne au Work Assignment | Commande People explicite ; contrôle du rôle et de la période | Lecture depuis l'Affectation canonique | Aucun rôle parallèle dans Work ou Decisions. |
| Responsibility — définition | Politique métier People | Responsabilités canoniques de chaque Business Role | Modification interdite dans P3-PEOPLE-001 | Lecture par résolution du rôle canonique | Aucune responsabilité libre recopiée dans l'Affectation. |
| Work Participation | Agrégat Work People | Existence d'un Work Assignment `ACTIVE` | Elle résulte uniquement de l'activation d'une Affectation valide | Lecture dérivée de l'état canonique, sans stockage séparé | Aucun registre Participant autonome. |
| Work Ownership | Agrégat Work People | Role Assignment `OWNER` actif et unique | Changement atomique par commande People | Lecture du Owner courant depuis Work People | Aucun champ Owner autoritatif dans Work. |
| Business approval assignment | Agrégat Work People | Role Assignment `APPROVER` actif | Affectation explicite ; ne produit aucune Decision | Lecture du rôle Approver courant | HumanApprovalDecision et identité de Session ne deviennent pas source People. |

### 3.3 Règles générales d'écriture

- une écriture People est commandée par une intention métier explicite ;
- le producteur vérifie la Business Person et le Work concernés ;
- la provenance est obligatoire ;
- l'état attendu de l'agrégat est vérifié avant changement ;
- les invariants sont validés avant toute acceptation ;
- un échec n'émet aucun événement de changement ;
- une répétition idempotente ne crée aucun doublon.

### 3.4 Règles générales de lecture

- toute lecture part de la source canonique People ;
- une lecture ne complète aucune donnée ;
- les résultats dérivés, notamment Participant et Owner, sont calculés uniquement depuis l'état People canonique ;
- un index de lecture éventuel reste reconstructible et non autoritatif ;
- l'absence de données, une collection vide et l'indisponibilité de People restent distinguées.

## 4. AGGREGATE MODEL

### 4.1 Décision d'ensemble

Deux agrégats sont retenus :

1. **Business Person** ;
2. **Work People**.

Cette séparation permet :

- à une Business Person d'exister indépendamment d'un Work ;
- à une personne de participer à plusieurs Works ;
- de protéger dans une seule frontière transactionnelle toutes les Affectations d'un Work ;
- de garantir atomiquement l'unicité du Owner ;
- d'éviter une cohérence distribuée entre plusieurs Work Assignments concurrents.

### 4.2 Agrégat Business Person

| Propriété | Décision |
|---|---|
| Nom canonique | Business Person |
| Responsabilité | Porter la Business Identity stable et sa reconnaissance autoritative. |
| Identité | BusinessPersonId |
| Racine d'agrégat | Business Person |
| Invariants protégés | identité unique ; indépendance technique ; provenance de reconnaissance ; identité non réaffectable. |
| Relations autorisées | Référence depuis Work Assignment par BusinessPersonId. |
| Relations interdites | Compte, Session, User, RuntimeAgent, Technical Agent ou HumanApprovalDecision comme identité constitutive. |
| Cycle de vie immédiat | reconnaissance puis maintien de l'identité ; aucun retrait ou effacement dans la Foundation. |

La Foundation ne définit ni profil, ni coordonnées, ni organisation, ni statut de personne. Toute évolution de ces éléments exige un contrat ultérieur.

### 4.3 Agrégat Work People

| Propriété | Décision |
|---|---|
| Nom canonique | Work People |
| Responsabilité | Garantir la cohérence de toutes les Affectations People d'un Work. |
| Identité | Work Reference canonique ; aucun identifiant Work People parallèle. |
| Racine d'agrégat | Work People |
| Invariants protégés | un seul Owner actif ; une Affectation active ou suspendue au plus par personne ; aucun rôle actif dupliqué ; périodes non conflictuelles ; historique conservé. |
| Relations autorisées | Work Identity ; BusinessPersonId ; Work Assignments ; Role Assignments ; provenance. |
| Relations interdites | Mission Assignment, RuntimeAgent, identité technique, Decision, profil utilisateur. |
| Cycle de vie | inexistant avant le premier fait People ; établi au premier Assignment ; conservé même sans Participant actif ; jamais supprimé avec son histoire. |

### 4.4 Évaluation de Work Assignment

**Décision : entité interne à Work People, pas racine d'agrégat.**

Un Work Assignment isolé ne pourrait pas protéger l'unicité du Owner ou les conflits entre personnes. Work People doit donc être la frontière de cohérence.

Work Assignment possède :

- une identité WorkAssignmentId ;
- une BusinessPersonId ;
- un AssignmentPeriod ;
- un AssignmentStatus ;
- un ou plusieurs Role Assignments lorsqu'il est actif ;
- une provenance ;
- une histoire.

### 4.5 Évaluation de Role Assignment

**Décision : entité interne à Work Assignment.**

Role Assignment représente l'attribution temporelle d'un Business Role dans une Affectation. Son identité métier est la combinaison stable du Work Assignment et du Business Role. Il conserve ses périodes d'effet et son histoire.

Un Role Assignment n'existe jamais sans Work Assignment parent.

### 4.6 Évaluation de Responsibility Assignment

**Décision : non retenu comme agrégat ni comme entité dans la Foundation.**

Les responsabilités sont définies par le Business Role canonique. Les recopier dans une entité `Responsibility Assignment` créerait une seconde source et permettrait des divergences.

Une future responsabilité personnalisée nécessitera une décision de blueprint distincte.

## 5. ENTITY MODEL

| Entité | Responsabilité | Identité | Propriétaire | Cycle de vie | Agrégat parent | Invariants | Mutabilité autorisée |
|---|---|---|---|---|---|---|---|
| Business Person | Porter une Business Identity reconnue | BusinessPersonId | People | reconnue puis maintenue ; aucun effacement Foundation | Racine Business Person | identité unique, stable, indépendante des identités techniques | provenance complétable uniquement selon une règle future ; identité immuable |
| Work People | Protéger la cohérence People d'un Work | Work Reference | People | établi au premier fait, conservé avec son histoire | Racine Work People | Owner unique, Affectations non conflictuelles, sources People uniques | évolution uniquement par commandes People |
| Work Assignment | Relier une Business Person à un Work avec période, statut et rôles | WorkAssignmentId | Work People | ACTIVE, éventuellement SUSPENDED, puis ENDED ; un Assignment ENDED ne reprend pas | Work People | personne existante, période valide, au moins un rôle actif lorsque ACTIVE, pas de conflit | statut, période de fin et rôles selon transitions autorisées |
| Role Assignment | Porter un Business Role et ses périodes d'effet | WorkAssignmentId + BusinessRole | Work Assignment | accordé, éventuellement révoqué, éventuellement accordé de nouveau par une nouvelle période | Work Assignment | rôle autorisé, pas de doublon actif, période incluse dans l'Affectation | périodes d'effet et état courant, jamais l'identité du rôle |

### 5.1 Éléments non retenus comme entités

- Participant : qualité relationnelle dérivée ;
- Owner : rôle actif, pas entité ;
- Approver : rôle actif, pas entité ;
- Responsibility : Value Object défini par le rôle ;
- Technical Agent : objet d'un autre domaine ;
- Role Catalog : aucune entité modifiable dans la Foundation, le vocabulaire étant fermé par WP-001.

## 6. VALUE OBJECTS

### 6.1 Décisions

| Value Object évalué | Décision | Motif |
|---|---|---|
| BusinessPersonId | Retenu | identité stable de la racine Business Person |
| WorkAssignmentId | Retenu | identité stable de l'entité Work Assignment |
| BusinessRole | Retenu | vocabulaire métier fermé et immuable |
| Responsibility | Retenu | sens métier stable associé au rôle |
| AssignmentStatus | Retenu | cycle de vie minimal de l'Affectation |
| ParticipationType | Non retenu | Participant est une qualité dérivée ; un type parallèle dupliquerait BusinessRole ou AssignmentStatus |
| AssignmentPeriod | Retenu | borne les effets métier de l'Affectation |
| WorkReference | Retenu | référence externe canonique à Project Identity et Work Identity |
| PeopleProvenance | Retenu | rend reconnaissance et changements relisibles |

### 6.2 Contrat des Value Objects

| Value Object | Définition | Règles de validité | Immutabilité | Égalité | Sérialisation conceptuelle | Propriétaire |
|---|---|---|---|---|---|---|
| BusinessPersonId | Identité opaque et stable d'une Business Person | présent, non ambigu, non réaffectable | totale | même identité métier canonique | valeur logique et contexte d'autorité, sans format imposé | People |
| WorkAssignmentId | Identité stable d'une Affectation historique | présent, unique dans People, non réutilisable | totale | même identité d'Affectation | valeur logique sans encodage de personne, rôle ou Work imposé | People |
| BusinessRole | Titre métier porté sur un Work | une des valeurs Owner, Contributor, Reviewer, Approver, Observer, Requester, Sponsor ; Participant interdit comme rôle | totale | même rôle canonique | nom sémantique canonique, format technique non prescrit | People |
| Responsibility | Obligation métier attachée à un BusinessRole | sens explicite, rôle propriétaire connu, aucune permission technique | totale | même responsabilité canonique dans le même rôle | identité sémantique et définition, sans structure technique imposée | People |
| AssignmentStatus | État courant d'un Work Assignment | ACTIVE, SUSPENDED ou ENDED ; transitions ACTIVE vers SUSPENDED ou ENDED, SUSPENDED vers ACTIVE ou ENDED ; ENDED terminal | totale | même état canonique | nom sémantique canonique | People |
| AssignmentPeriod | Période d'effet métier | début d'effet connu ; fin éventuelle postérieure au début ; absence de chevauchement interdit | totale | mêmes bornes et même sémantique d'inclusion | bornes métier et règle d'inclusion explicitée, aucun format de date imposé | People |
| WorkReference | Référence au Work canonique dans son Project | Project Identity et Work Identity présentes ; Work démontré | totale | même identité Work dans le même Project | identités canoniques Work, sans identifiant People parallèle | Work, référencé par People |
| PeopleProvenance | Origine d'un fait People | autorité, cause métier et date d'effet identifiables | totale | mêmes origine, cause et date d'effet | faits de provenance, sans format de transport imposé | People |

### 6.3 AssignmentStatus et Participation

Un Work Assignment est :

- Participant actif uniquement lorsque son statut est `ACTIVE` ;
- non participant actif lorsqu'il est `SUSPENDED` ;
- historique uniquement lorsqu'il est `ENDED`.

Participation n'est jamais stockée comme vérité séparée.

## 7. COMMANDS

### 7.1 Autorité d'émission

Les commandes sont émises par une **autorité métier People habilitée**, dont la règle d'habilitation devra être établie par P3-PEOPLE-001C.

Le présent contrat n'assimile pas cette autorité à un compte, un rôle RBAC ou une Session.

### 7.2 Commandes retenues

| Commande | Intention | Préconditions | Acteur métier | Agrégat cible | Effets | Événements attendus | Erreurs possibles | Idempotence attendue |
|---|---|---|---|---|---|---|---|---|
| CreateBusinessPerson | Reconnaître une nouvelle Business Identity | identité non existante ; provenance valide ; aucune identité technique utilisée comme source | autorité People | Business Person | crée la reconnaissance autoritative | BusinessIdentityRecognized | BUSINESS_PERSON_ALREADY_EXISTS, TECHNICAL_IDENTITY_SOURCE_FORBIDDEN | même causalité et même identité : même résultat, aucun second événement |
| AssignPersonToWork | Créer une Affectation explicite avec rôles initiaux | personne et Work existants ; aucun Assignment actif ou suspendu ; période valide ; au moins un rôle ; Owner non conflictuel | autorité People | Work People | crée Work Assignment et rôles initiaux ; active la participation si effet immédiat | PeopleAssigned puis ParticipantAdded si actif | BUSINESS_PERSON_NOT_FOUND, WORK_REFERENCE_NOT_FOUND, PERSON_ALREADY_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, ROLE_NOT_ALLOWED, OWNER_ALREADY_DEFINED, ASSIGNMENT_CONFLICT | répétition de la même causalité : même Assignment ; nouvelle causalité équivalente : PERSON_ALREADY_ASSIGNED |
| RemovePersonFromWork | Mettre fin à l'Affectation | Assignment actif ou suspendu ; période de fin valide | autorité People | Work People | termine les rôles et l'Assignment ; retire la participation active | événements de rôle requis, ParticipantRemoved si actif, PeopleRemoved ; OwnerChanged si le Owner devient non attribué | PERSON_NOT_ASSIGNED, WORK_ASSIGNMENT_NOT_FOUND, INVALID_ASSIGNMENT_PERIOD | répétition même causalité : aucun nouvel événement ; autre retrait d'un Assignment ENDED : PERSON_NOT_ASSIGNED |
| AssignBusinessRole | Ajouter un rôle à une Affectation non terminée | Assignment existant ; rôle autorisé ; rôle non actif ; période compatible ; Owner non conflictuel | autorité People | Work People | crée une période de Role Assignment | RoleGranted, ou événement spécialisé OwnerChanged, ApproverAssigned ou ObserverAdded | WORK_ASSIGNMENT_NOT_FOUND, ROLE_NOT_ALLOWED, ROLE_ALREADY_ASSIGNED, OWNER_ALREADY_DEFINED, ASSIGNMENT_CONFLICT | même causalité : aucun doublon ; autre commande équivalente : ROLE_ALREADY_ASSIGNED |
| RevokeBusinessRole | Retirer un rôle actif | Assignment existant ; rôle actif ; au moins un autre rôle reste actif ; sinon RemovePersonFromWork doit être utilisé | autorité People | Work People | clôt la période du rôle | RoleRevoked, ou OwnerChanged pour Owner | WORK_ASSIGNMENT_NOT_FOUND, ROLE_NOT_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, ASSIGNMENT_CONFLICT | même causalité : aucun doublon ; autre révocation : ROLE_NOT_ASSIGNED |
| ChangeWorkOwner | Établir, remplacer ou retirer explicitement le Owner | cible éventuelle déjà Participant actif ; au plus un résultat Owner ; période valide | autorité People | Work People | retire l'ancien rôle Owner et accorde le nouveau de façon atomique, ou laisse le Work sans Owner | OwnerChanged | BUSINESS_PERSON_NOT_FOUND, PERSON_NOT_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, ASSIGNMENT_CONFLICT | même ancien Owner, nouveau Owner et causalité : un seul changement |
| AssignApprover | Accorder explicitement le rôle Approver | personne Participant ; rôle non actif ; période valide | autorité People | Work People | accorde le rôle sans produire de Decision | ApproverAssigned | PERSON_NOT_ASSIGNED, ROLE_ALREADY_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, ASSIGNMENT_CONFLICT | identique à AssignBusinessRole pour Approver, aucune seconde voie d'écriture |
| ReplaceAssignedPerson | Remplacer explicitement une personne par une autre | personne source affectée ; cible reconnue ; rôles et périodes de transfert explicités ; aucun conflit | autorité People | Work People | termine ou modifie l'ancienne Affectation et crée ou modifie la nouvelle atomiquement ; ne transfère aucun historique | OwnerChanged si concerné ; événements de rôles ; ParticipantRemoved, PeopleRemoved, PeopleAssigned et ParticipantAdded selon les changements | BUSINESS_PERSON_NOT_FOUND, PERSON_NOT_ASSIGNED, PERSON_ALREADY_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, OWNER_ALREADY_DEFINED, ASSIGNMENT_CONFLICT | même causalité : remplacement unique ; aucune répétition des événements |
| SuspendWorkAssignment | Suspendre temporairement la participation | Assignment ACTIVE ; période d'effet valide ; devenir du Owner explicitement accepté si ce rôle est porté | autorité People | Work People | statut SUSPENDED ; rôles conservés historiquement mais non effectifs pendant la suspension | OwnerChanged si nécessaire, puis AssignmentSuspended et ParticipantRemoved | WORK_ASSIGNMENT_NOT_FOUND, PERSON_NOT_ASSIGNED, INVALID_ASSIGNMENT_PERIOD, ASSIGNMENT_CONFLICT | même causalité : aucun doublon ; autre suspension : ASSIGNMENT_CONFLICT |
| ResumeWorkAssignment | Réactiver une Affectation suspendue | Assignment SUSPENDED ; rôles valides ; absence de conflit Owner ; période valide | autorité People | Work People | statut ACTIVE ; rôles de nouveau effectifs selon leurs périodes ; participation rétablie | AssignmentResumed, OwnerChanged si le rôle Owner redevient effectif, puis ParticipantAdded | WORK_ASSIGNMENT_NOT_FOUND, OWNER_ALREADY_DEFINED, INVALID_ASSIGNMENT_PERIOD, ASSIGNMENT_CONFLICT | même causalité : aucun doublon ; autre reprise : ASSIGNMENT_CONFLICT |

### 7.3 Commandes évaluées mais non retenues comme voies distinctes

| Commande | Intention | Préconditions | Acteur métier | Agrégat cible | Effet autorisé | Événements attendus | Erreurs possibles | Idempotence attendue | Décision |
|---|---|---|---|---|---|---|---|---|---|
| AddParticipant | Faire entrer une personne dans la participation active | identiques à AssignPersonToWork ou ResumeWorkAssignment selon qu'une Affectation existe | autorité People | Work People | aucun effet direct ; intention normalisée vers la commande canonique | ceux de AssignPersonToWork ou ResumeWorkAssignment, sans événement supplémentaire | erreurs de la commande canonique choisie | portée exclusivement par la commande canonique | non retenue comme commande indépendante, car Participant est une qualité dérivée |
| RemoveParticipant | Faire cesser la participation active | identiques à RemovePersonFromWork ou SuspendWorkAssignment selon le caractère définitif ou temporaire | autorité People | Work People | aucun effet direct ; intention normalisée vers la commande canonique | ceux de RemovePersonFromWork ou SuspendWorkAssignment, sans événement supplémentaire | erreurs de la commande canonique choisie | portée exclusivement par la commande canonique | non retenue comme commande indépendante, car la fin de participation résulte du statut Assignment |

Ces intentions peuvent être des formulations métier adressées au producteur, mais elles doivent être normalisées vers les commandes canoniques et ne peuvent produire une seconde écriture.

### 7.4 Règle d'événement unique

Un changement d'état ne doit pas être compté deux fois. Pour un rôle spécialisé :

- `OwnerChanged` remplace les événements génériques de grant/revoke du rôle Owner ;
- `ApproverAssigned` remplace `RoleGranted` pour Approver ;
- `ObserverAdded` remplace `RoleGranted` pour Observer ;
- `RoleGranted` et `RoleRevoked` couvrent les autres changements unitaires ;
- `RoleChanged` couvre un remplacement atomique d'ensemble de rôles, sans dupliquer chaque changement unitaire.

## 8. DOMAIN EVENTS

### 8.1 Principes

Tous les événements People sont :

- des faits historiques ;
- immuables après acceptation ;
- ordonnés dans leur agrégat source ;
- rattachés à une causalité métier ;
- porteurs d'une provenance ;
- sans donnée technique d'authentification ou d'agent ;
- non reproducteurs des agrégats d'autres domaines.

### 8.2 Mapping canonique

| Événement | Déclencheur | Source | Données métier minimales | Causalité | Consommateurs possibles | Règle d'ordre | Historique |
|---|---|---|---|---|---|---|---|
| BusinessIdentityRecognized | acceptation de CreateBusinessPerson | Business Person | BusinessPersonId, date d'effet, provenance | commande de reconnaissance | People Authority, futures lectures People | précède toute Affectation de cette personne | permanent |
| PeopleAssigned | création d'un Work Assignment | Work People | WorkReference, WorkAssignmentId, BusinessPersonId, rôles initiaux, période, provenance | AssignPersonToWork ou remplacement | People history, Work integration future | précède ParticipantAdded ; rôles initiaux ne génèrent pas d'événements dupliqués | permanent |
| ParticipantAdded | activation d'une Affectation | Work People | WorkReference, WorkAssignmentId, BusinessPersonId, date d'effet, provenance | affectation ou reprise | Work, Planning et Actions futurs | après PeopleAssigned ou AssignmentResumed | permanent |
| RoleGranted | ajout d'un rôle non spécialisé | Work People | WorkAssignmentId, BusinessPersonId, BusinessRole, période, provenance | AssignBusinessRole | consommateurs People et domaines autorisés | après l'existence de l'Assignment | permanent |
| RoleRevoked | retrait d'un rôle non spécialisé | Work People | WorkAssignmentId, BusinessPersonId, BusinessRole, date d'effet, provenance | RevokeBusinessRole ou retrait | consommateurs People et domaines autorisés | avant PeopleRemoved si le retrait clôt l'Assignment | permanent |
| RoleChanged | remplacement atomique d'un ensemble de rôles | Work People | WorkAssignmentId, anciens rôles, nouveaux rôles, date d'effet, provenance | remplacement explicite | People history, domaines autorisés | un seul événement pour le changement d'ensemble | permanent |
| OwnerChanged | établissement, remplacement, suspension, reprise ou retrait du Owner | Work People | WorkReference, ancien BusinessPersonId éventuel, nouveau BusinessPersonId éventuel, date d'effet, provenance | ChangeWorkOwner, suspension, reprise, remplacement ou retrait | Work, Planning, gouvernance métier future | atomique dans Work People ; aucun état à deux Owners | permanent |
| ApproverAssigned | attribution du rôle Approver | Work People | WorkAssignmentId, BusinessPersonId, période, provenance | AssignApprover ou rôle spécialisé | Decisions futur, People history | après participation active ; ne précède aucune Decision automatiquement | permanent |
| ObserverAdded | attribution du rôle Observer | Work People | WorkAssignmentId, BusinessPersonId, période, provenance | AssignBusinessRole spécialisé | consommateurs autorisés | après l'existence de l'Assignment | permanent |
| AssignmentSuspended | suspension d'une Affectation | Work People | WorkAssignmentId, BusinessPersonId, date d'effet, provenance | SuspendWorkAssignment | Work et domaines consommateurs futurs | précède ParticipantRemoved causé par la suspension | permanent |
| AssignmentResumed | reprise d'une Affectation | Work People | WorkAssignmentId, BusinessPersonId, date d'effet, provenance | ResumeWorkAssignment | Work et domaines consommateurs futurs | précède ParticipantAdded | permanent |
| ParticipantRemoved | fin de participation active | Work People | WorkReference, WorkAssignmentId, BusinessPersonId, date d'effet, motif métier, provenance | suspension ou retrait | Work et domaines consommateurs futurs | après AssignmentSuspended ou avant PeopleRemoved selon causalité | permanent |
| PeopleRemoved | clôture définitive d'un Work Assignment | Work People | WorkReference, WorkAssignmentId, BusinessPersonId, date de fin, provenance | RemovePersonFromWork ou remplacement | People history, Work integration future | dernier événement propre à l'Assignment, après conséquences de rôle | permanent |

### 8.3 Ordre causal

L'ordre est total à l'intérieur de chaque agrégat. Aucun ordre total global entre Business Person et Work People n'est exigé.

La causalité doit néanmoins démontrer :

1. BusinessIdentityRecognized avant toute Affectation ;
2. PeopleAssigned avant l'entrée en participation ;
3. tout changement de rôle après la création de l'Assignment ;
4. OwnerChanged atomiquement par rapport aux autres changements du même Work People ;
5. OwnerChanged précède AssignmentSuspended lorsque la suspension retire le Owner effectif ;
6. AssignmentResumed précède OwnerChanged et ParticipantAdded lorsque le rôle Owner redevient effectif ;
7. ParticipantRemoved précède PeopleRemoved lors d'une clôture active ;
8. aucun événement après l'état ENDED d'un Work Assignment.

## 9. QUERIES

### 9.1 Principes de lecture

Une requête People :

- lit la source autoritative ;
- ne déclenche aucun changement ;
- ne répare aucune incohérence ;
- ne fabrique aucune valeur absente ;
- expose la provenance et le moment de cohérence nécessaires ;
- distingue People indisponible, agrégat absent et résultat vide ;
- peut utiliser un index reconstructible sans lui transférer l'autorité.

### 9.2 Requêtes futures

| Requête | Objectif | Source autoritative | Filtre | Résultat métier | Dépendances | Cohérence attendue |
|---|---|---|---|---|---|---|
| GetBusinessPerson | retrouver une Business Identity reconnue | agrégat Business Person | BusinessPersonId | Business Person minimale et provenance | aucune source technique | état cohérent de la racine lue |
| GetWorkPeople | lire l'état People courant d'un Work | agrégat Work People | WorkReference, date d'observation éventuelle | Affectations courantes, rôles, responsabilités canoniques, Owner éventuel et provenance | existence Work pour qualifier l'absence | vue cohérente d'une même révision Work People |
| GetWorkOwner | retrouver le Owner actif éventuel | agrégat Work People | WorkReference, date d'observation | zéro ou un Owner avec Assignment et provenance | aucune autre source Owner | unicité garantie par l'agrégat |
| GetWorkParticipants | retrouver toutes les participations actives | agrégat Work People | WorkReference, date d'observation | collection d'Assignments ACTIVE | aucune projection Frontend | même révision Work People ; aucun ordre métier implicite |
| GetWorkContributors | lire les Participants portant Contributor | agrégat Work People | WorkReference, rôle Contributor, date d'observation | collection de personnes et Affectations actives | BusinessRole canonique | filtre exact, aucun rôle déduit |
| GetWorkReviewers | lire les Participants portant Reviewer | agrégat Work People | WorkReference, rôle Reviewer, date d'observation | collection de personnes et Affectations actives | BusinessRole canonique | filtre exact, aucun Approver implicite |
| GetWorkApprovers | lire les Participants portant Approver | agrégat Work People | WorkReference, rôle Approver, date d'observation | collection d'affectations Approver actives | aucune Decision requise | rôle People uniquement, aucun historique de décision |
| GetPersonAssignments | retrouver les Affectations d'une Business Person | agrégats Work People | BusinessPersonId, état ou période optionnels | références Work, Assignments, statuts, rôles et provenance | index reconstructible autorisé | chaque ligne issue de l'agrégat Work People propriétaire |
| GetAssignmentHistory | relire toute l'histoire d'une Affectation | agrégat Work People et histoire canonique | WorkAssignmentId | états, périodes, rôles, événements et provenance | aucune source externe | ordre causal complet et immuable |

### 9.3 Résultats dérivés autorisés

Sont dérivés sans devenir de nouvelles sources :

- Participant depuis AssignmentStatus `ACTIVE` ;
- Owner depuis le Role Assignment `OWNER` actif ;
- collections par rôle depuis les Role Assignments actifs ;
- responsabilités depuis la définition canonique du BusinessRole.

Aucune de ces dérivations n'est persistée comme vérité concurrente.

## 10. PERSISTENCE POLICY

### 10.1 Décision

**PERSISTENCE CANONIQUE REQUISE, MAIS CRÉATION BLOQUÉE JUSQU'À P3-PEOPLE-001D.**

La persistance est justifiée par :

- la stabilité de Business Identity ;
- l'histoire obligatoire des Affectations ;
- les périodes d'effet ;
- l'unicité durable du Owner ;
- l'idempotence des commandes ;
- la reprise après échec ;
- l'audit des rôles et remplacements ;
- la nécessité d'une source People indépendante des systèmes techniques.

P3-PEOPLE-001A ne crée aucune persistance. P3-PEOPLE-001D devra démontrer que la politique ci-dessous est respectée avant toute commande opérationnelle.

### 10.2 Agrégats persistés

La persistance canonique future porte uniquement :

- l'agrégat Business Person ;
- l'agrégat Work People ;
- l'histoire nécessaire à leur reconstitution et à leur audit ;
- leur provenance ;
- leur révision de cohérence conceptuelle.

Elle ne persiste pas de copie de Work, Mission, RuntimeAgent, Technical Agent, Session, Decision ou Deliverable.

### 10.3 Atomicité et cohérence

- une mutation Business Person est atomique dans cet agrégat ;
- une mutation Work People, y compris un changement de Owner ou un remplacement, est atomique pour tout le Work ;
- aucun état intermédiaire à deux Owners n'est observable ;
- aucun changement partiel de rôles n'est accepté ;
- la vérification d'existence de Business Person précède la mutation Work People ;
- Business Person ne pouvant pas être supprimée physiquement, une référence acceptée reste stable.

### 10.4 Historique et suppression

- l'histoire des Affectations, rôles, suspensions, reprises et remplacements est conservée ;
- un Work Assignment terminé reste relisible ;
- aucune suppression physique d'une Business Person référencée n'est autorisée ;
- aucune suppression physique de Work People ou de son histoire n'est autorisée ;
- la sortie d'un Work est une clôture métier, jamais une suppression ;
- un futur retrait de Business Person exigera une décision distincte et restera logique.

### 10.5 Unicité

La persistance doit garantir :

- unicité de BusinessPersonId ;
- unicité de Work People par WorkReference ;
- unicité de WorkAssignmentId ;
- au plus un Assignment ACTIVE ou SUSPENDED pour une même personne et un même Work ;
- au plus un Role Assignment actif par rôle dans un Assignment ;
- au plus un Owner actif par Work ;
- absence de périodes actives contradictoires.

### 10.6 Concurrence

- toute écriture vérifie la révision attendue de l'agrégat ;
- une concurrence conflictuelle échoue sans événement partiel ;
- une reprise relit l'état courant et réévalue tous les invariants ;
- ChangeWorkOwner et ReplaceAssignedPerson sont sérialisés au niveau Work People ;
- une commande répétée avec la même causalité conserve son résultat initial.

Le présent contrat ne prescrit aucun mécanisme technique de verrouillage.

### 10.7 Politique de migration

Toute future migration devra :

- être explicitement autorisée ;
- préserver identités, périodes, provenance et ordre historique ;
- être vérifiable et réversible avant certification ;
- rejeter les doublons et conflits plutôt que les corriger silencieusement ;
- ne jamais créer une Business Person depuis un compte, une Session ou un agent sans reconnaissance métier explicite ;
- ne jamais importer une fixture comme source ;
- ne jamais maintenir deux persistances People actives.

### 10.8 Interdiction de duplication

Index, caches et projections éventuels :

- restent reconstructibles ;
- ne reçoivent aucune écriture métier directe ;
- ne survivent pas comme source concurrente ;
- ne sont pas utilisés pour arbitrer un conflit avec la persistance canonique.

## 11. WORK INTEGRATION

### 11.1 Identifiant de rattachement

People se rattache à Work par **WorkReference**, composée conceptuellement de :

- Project Identity ;
- Work Identity canonique.

Cette référence respecte l'ancrage Work–Mission de Phase 1 sans recopier Mission Reference dans People et sans créer un identifiant Work parallèle.

### 11.2 Direction de dépendance

- People valide que le Work référencé existe.
- People possède les Affectations et rôles.
- Work consomme les lectures People certifiées.
- Work n'envoie aucune écriture directe dans People.
- People ne modifie aucun état Work.

Cette direction évite un cycle de propriété : Work possède son identité ; People possède ses associations humaines.

### 11.3 Source autoritative

Pour Work, la seule source People est :

- Business Person pour l'identité ;
- Work People pour les Affectations, rôles, Owner et participation ;
- politique People pour les responsabilités de rôle.

Work ne consulte ni Session, ni BFF, ni HumanApprovalDecision, ni RuntimeAgent pour compléter People.

### 11.4 Données exposables à Work

Après P3-PEOPLE-001G, Work pourra recevoir uniquement :

- BusinessPersonId ;
- WorkAssignmentId ;
- AssignmentStatus ;
- AssignmentPeriod nécessaire au contexte ;
- BusinessRoles actifs ;
- responsabilités canoniques correspondantes ;
- Owner éventuel ;
- Participant actif ou non actif selon le statut ;
- provenance ;
- moment ou révision de cohérence.

### 11.5 Données interdites dans Work

Work ne contient pas :

- agrégat Business Person ;
- agrégat Work People ;
- historique complet People ;
- credentials, Session ou identité technique ;
- permissions ou rôles RBAC ;
- profil enrichi ;
- RuntimeAgent ou Technical Agent présenté comme personne ;
- décision d'approbation ;
- copie persistée des Affectations ;
- rôle ou responsabilité calculé localement.

### 11.6 Comportement d'absence

Work distingue explicitement :

1. **People indisponible** — le producteur ou la lecture People ne peut pas répondre ;
2. **People disponible, aucun Work People** — aucun fait People n'a été établi pour ce Work ;
3. **Work People disponible, zéro Participant actif** — l'histoire existe, mais aucune Affectation n'est active ;
4. **Participants disponibles** — les associations courantes sont lues depuis People.

Work ne transforme aucun de ces états en Owner, Participant ou collection simulée.

### 11.7 Compatibilité Phase 1

L'intégration People ne modifie pas les sept domaines intégrés :

| Domaine Phase 1 | Règle de compatibilité |
|---|---|
| Identity | Work Identity reste inchangée et propriétaire du rattachement. |
| Objective | aucun rôle People ne reformule l'objectif. |
| Lifecycle | l'arrivée ou le retrait d'une personne ne change pas automatiquement l'état Work. |
| Progress | la présence ou l'activité People ne calcule pas la progression. |
| Deliverables | People peut fournir une attribution future ; Deliverables reste propriétaire du livrable. |
| Decisions | Approver Assignment ne remplace ni la Decision ni son historique autoritatif. |
| Technical Agent | aucune équivalence, conversion ou dérivation avec Business Person. |

## 12. TECHNICAL AGENT SEPARATION

### 12.1 Règle canonique

**Business Person ≠ RuntimeAgent ≠ Technical Agent.**

Cette règle est non négociable pour tous les sous-lots People.

### 12.2 Conséquences

1. Aucune conversion implicite n'est autorisée.
2. Aucun identifiant n'est partagé par défaut.
3. Aucun Work Assignment People n'est dérivé de `assignedAgentId`.
4. Aucune Business Identity n'est dérivée d'un registre d'agents.
5. Aucun rôle People ne confère une permission technique.
6. Aucun rôle métier n'est déduit d'une affectation d'agent.
7. Aucun Technical Agent n'est Owner, Contributor, Reviewer, Approver, Observer, Requester ou Sponsor par sa seule affectation.
8. Une personne ne devient pas exécutant technique par sa seule Affectation People.
9. La provenance People ne cite pas une source agent comme autorité métier.
10. Work conserve séparément ses associations People et Technical Agent.

### 12.3 Relation future éventuelle

Une future relation entre Business Person et identité technique sera possible uniquement si :

- un blueprint distinct la définit ;
- le mapping est explicite ;
- chaque côté conserve son identifiant ;
- la cardinalité est définie ;
- le producteur autoritatif du mapping est établi ;
- la provenance est conservée ;
- aucune fusion d'agrégats n'est réalisée ;
- l'absence de mapping reste valide.

Ce mapping est hors P3-PEOPLE-001.

## 13. ERROR MODEL

### 13.1 Règle commune

Toute erreur bloquante :

- refuse la mutation complète ;
- interdit l'émission de tout événement de changement ;
- ne modifie ni l'agrégat ni son historique ;
- conserve les informations nécessaires à une correction métier ;
- ne déclenche aucun comportement de compensation inventé.

### 13.2 Catalogue

| Erreur | Condition | Portée | Bloquante | Événement interdit | Correction attendue |
|---|---|---|---|---|---|
| BUSINESS_PERSON_NOT_FOUND | BusinessPersonId non reconnu | commande ou lecture ciblée | oui pour écriture ; résultat absent contrôlé pour lecture | tout événement Assignment ou rôle | reconnaître la personne ou corriger l'identité |
| BUSINESS_PERSON_ALREADY_EXISTS | tentative de reconnaissance d'une identité déjà attribuée par une causalité différente | Business Person | oui | BusinessIdentityRecognized | relire l'identité existante ou corriger la demande |
| WORK_REFERENCE_NOT_FOUND | WorkReference ne correspond pas à un Work autoritatif | Work People | oui | tout événement People du Work | corriger la référence ou établir le Work dans son domaine |
| WORK_ASSIGNMENT_NOT_FOUND | WorkAssignmentId absent du Work People attendu | Work People | oui pour mutation | événement de rôle, suspension, reprise ou retrait | corriger l'Assignment ciblé |
| PERSON_ALREADY_ASSIGNED | un Assignment ACTIVE ou SUSPENDED existe déjà pour la personne sur le Work | Work People | oui | PeopleAssigned | modifier l'Assignment existant ou utiliser la commande appropriée |
| PERSON_NOT_ASSIGNED | aucune Affectation courante ne correspond à la personne | Work People | oui pour retrait ou rôle | ParticipantRemoved, PeopleRemoved et événements de rôle | cibler l'Assignment correct ou créer une Affectation |
| OWNER_ALREADY_DEFINED | un autre Owner est actif et la commande n'est pas ChangeWorkOwner | Work People | oui | événement accordant un second Owner | utiliser ChangeWorkOwner |
| OWNER_REQUIRED | tentative d'imposer la présence obligatoire d'un Owner | règle globale | **erreur inactive et interdite dans la baseline** | aucun événement ; cette erreur elle-même ne doit pas être levée | retirer le contrôle ; WP-001 rend Owner optionnel |
| ROLE_NOT_ALLOWED | rôle hors vocabulaire People, Participant utilisé comme rôle, ou rôle technique fourni | Work People | oui | tout événement de rôle | utiliser un BusinessRole canonique |
| ROLE_ALREADY_ASSIGNED | même rôle déjà actif dans l'Assignment | Work People | oui hors répétition idempotente | RoleGranted ou événement spécialisé | relire l'état ou corriger l'intention |
| ROLE_NOT_ASSIGNED | rôle ciblé non actif | Work People | oui | RoleRevoked ou OwnerChanged | cibler un rôle actif |
| INVALID_ASSIGNMENT_PERIOD | période absente, inversée, incohérente ou hors de l'Assignment parent | Work People | oui | tout événement portant la période invalide | fournir une période métier valide |
| ASSIGNMENT_CONFLICT | chevauchement, rôle contradictoire, reprise impossible ou concurrence non résolue | Work People | oui | tout événement du changement conflictuel | relire l'agrégat et soumettre une intention cohérente |
| LAST_OWNER_REMOVAL_FORBIDDEN | tentative d'interdire le retrait du dernier Owner | règle globale | **erreur inactive et interdite dans la baseline** | aucun événement ; cette erreur elle-même ne doit pas être levée | autoriser le Work sans Owner, conformément à WP-001 |
| TECHNICAL_IDENTITY_SOURCE_FORBIDDEN | compte, Session, RuntimeAgent ou Technical Agent utilisé comme Business Identity autoritative | Business Person ou Work People | oui | BusinessIdentityRecognized et tout événement Assignment | obtenir une reconnaissance métier indépendante |
| ASSIGNMENT_ENDED | tentative de modifier ou reprendre un Assignment terminal | Work People | oui | événement de rôle, reprise ou changement | créer une nouvelle Affectation explicite si justifiée |
| CONCURRENT_PEOPLE_CHANGE | révision attendue différente de l'état courant | agrégat concerné | oui | tout événement de la tentative perdante | relire, réévaluer les invariants et resoumettre |

### 13.3 Optionalité du Owner

`OWNER_REQUIRED` et `LAST_OWNER_REMOVAL_FORBIDDEN` sont évaluées et rejetées comme erreurs actives.

Un Work peut avoir zéro Owner. La Foundation interdit uniquement plusieurs Owners actifs.

## 14. CONSISTENCY RULES

### 14.1 Cohérence transactionnelle

- Business Person est une frontière transactionnelle.
- Work People est une frontière transactionnelle.
- toutes les Affectations et tous les rôles d'un Work changent atomiquement dans Work People ;
- ChangeWorkOwner et ReplaceAssignedPerson ne laissent aucun état intermédiaire ;
- une commande échouée ne modifie rien et n'émet aucun événement.

### 14.2 Cohérence interdomaines

- Work est vérifié avant la première mutation de Work People ;
- Business Person est vérifiée avant toute Affectation ;
- une référence acceptée reste stable ;
- les domaines consommateurs reçoivent des événements ou des lectures, jamais une écriture directe ;
- People n'attend pas un résultat Decisions, Planning ou Actions pour préserver ses invariants.

### 14.3 Concurrence

- chaque mutation s'applique à une révision attendue ;
- une seule mutation Work People conflictuelle peut être acceptée ;
- l'unicité du Owner est évaluée à la révision commitée ;
- les retries relisent et réévaluent l'intention ;
- aucune stratégie « dernier écrit gagne » n'est admise pour Owner, rôles ou périodes.

### 14.4 Idempotence et répétition

- chaque intention commandée possède une causalité stable ;
- répéter la même causalité et le même contenu retourne le même résultat ;
- répéter la même causalité avec un contenu différent est un conflit ;
- une nouvelle causalité qui demande un état déjà atteint reçoit l'erreur métier correspondante, sauf règle explicite de no-op ;
- aucun événement historique n'est dupliqué.

### 14.5 Ordre des événements

- l'ordre est strict par agrégat ;
- les événements d'une commande atomique sont contigus ;
- BusinessIdentityRecognized précède l'Affectation ;
- PeopleAssigned précède ParticipantAdded ;
- les effets de rôle précèdent la clôture de l'Assignment ;
- aucun événement ne suit PeopleRemoved pour le même WorkAssignmentId.

### 14.6 Reprise après échec

- une mutation incomplète n'est jamais visible ;
- la reprise utilise la même causalité lorsque l'intention est identique ;
- l'état canonique est relu avant reprise ;
- aucune reconstruction depuis un cache ou une projection n'est autorisée ;
- une compensation métier n'est exécutée que par une nouvelle commande explicite.

### 14.7 Invariants non négociables

1. Business Identity est indépendante de toute identité technique.
2. Toute participation provient d'un Work Assignment explicite.
3. Un Assignment ACTIVE porte au moins un BusinessRole actif.
4. Un Work possède au plus un Owner actif.
5. Les rôles ne produisent aucune permission technique.
6. Approver Assignment ne produit aucune Decision.
7. L'histoire n'est jamais réécrite.
8. Aucun rôle actif dupliqué n'existe dans un Assignment.
9. Toute mutation possède une provenance.
10. Participant n'est pas une source stockée distincte.
11. Work ne duplique aucun agrégat People.
12. Aucune fixture ou projection ne produit un fait People.

## 15. TEST CONTRACT

Le présent lot ne crée aucun test. Les sous-lots futurs doivent respecter le contrat suivant.

| Catégorie | Couverture obligatoire |
|---|---|
| Tests d'invariants | identité stable ; rôle valide ; Owner unique ; Assignment actif avec rôle ; périodes ; historique ; séparation technique |
| Tests d'agrégats | Business Person ; Work People ; Work Assignment ; Role Assignment ; frontières et atomicité |
| Tests de commandes | succès, préconditions, erreurs, effets, événements et absence d'effet en échec pour chaque commande retenue |
| Tests d'événements | données métier minimales, causalité, ordre, événement spécialisé non dupliqué, caractère historique |
| Tests de requêtes | résultats courants, filtres par rôle, Owner optionnel, collections vides, histoire, source autoritative |
| Tests d'idempotence | répétition exacte, causalité réutilisée avec contenu différent, absence de doublon événementiel |
| Tests de concurrence | double Owner, affectations concurrentes, rôles concurrents, remplacement, révision obsolète |
| Tests d'intégration Work | WorkReference, zéro People, People indisponible, participants, Owner, non-duplication et provenance |
| Tests de séparation RuntimeAgent | aucune conversion, aucun identifiant partagé, aucune affectation dérivée, aucune permission technique |
| Tests de non-régression Work | Identity, Objective, Lifecycle, Progress, Deliverables, Decisions et Technical Agent inchangés |
| Tests de non-régression Runtime | Mission, RuntimeAgent, agent assignment et orchestration inchangés |
| Tests Core | suites Core applicables intégralement passantes |
| Typecheck | People et tous les périmètres affectés sans erreur nouvelle |

### 15.1 Exigences par cas

Les tests futurs doivent couvrir au minimum :

- Business Person inconnue ;
- Work inconnu ;
- première Affectation ;
- Affectation dupliquée ;
- Work sans Owner ;
- tentative de second Owner ;
- changement et retrait du Owner ;
- cumul de rôles ;
- rôle dupliqué ou inconnu ;
- Participant fourni illégalement comme rôle ;
- suspension, reprise et clôture ;
- remplacement de personne ;
- périodes invalides ou concurrentes ;
- Approver sans Decision produite ;
- source RuntimeAgent rejetée ;
- répétition idempotente ;
- conflit concurrent ;
- requêtes par rôle ;
- histoire complète ;
- absence de suppression physique.

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Ordre retenu

L'ordre candidat est confirmé :

| Ordre | Sous-lot | Objet | Livrable fonctionnel autorisé |
|---|---|---|---|
| 1 | P3-PEOPLE-001B — People Foundation Model | matérialiser uniquement le noyau métier défini par ce contrat | agrégats, entités, Value Objects, invariants et erreurs internes |
| 2 | P3-PEOPLE-001C — People Authoritative Producer | établir People Authority comme producteur unique | acceptation autoritative des intentions People, sans exposition publique |
| 3 | P3-PEOPLE-001D — People Persistence | établir la persistance canonique requise | source durable unique, histoire, atomicité et concurrence |
| 4 | P3-PEOPLE-001E — People Commands | ouvrir le chemin interne d'écriture | commandes métier et événements canoniques |
| 5 | P3-PEOPLE-001F — People Queries | ouvrir le chemin interne de lecture | requêtes canoniques sans logique consommatrice |
| 6 | P3-PEOPLE-001G — Work Integration | associer People à Work | lecture interne Work, absence explicite, aucune duplication |
| 7 | P3-PEOPLE-001H — People Certification | certifier tout P3-PEOPLE-001 | décision GO ou NO GO de clôture People Foundation |

### 16.2 Justification

- le modèle précède tout producteur ;
- le producteur précède la persistance afin que celle-ci conserve une sémantique déjà autoritative ;
- la persistance précède l'ouverture des commandes opérationnelles ;
- les commandes précèdent les requêtes pour que toute lecture possède une source réellement produite ;
- l'intégration Work suit la stabilisation des écritures et lectures internes ;
- la certification clôt le domaine avant Planning ;
- aucun sous-lot ne commence automatiquement.

### 16.3 Interdiction d'anticipation

Un sous-lot ne peut créer un artefact appartenant au sous-lot suivant. Les seules exceptions sont les éléments de test strictement nécessaires au périmètre courant et explicitement autorisés.

## 17. ENTRY AND EXIT GATES

### 17.1 Règles communes

Chaque sous-lot exige :

- verdict GO du lot précédent ;
- mission distincte ;
- périmètre fermé ;
- liste exacte des fichiers autorisés ;
- liste exacte des fichiers interdits ;
- tests obligatoires définis avant modification ;
- absence de régression ;
- rapport final unique ;
- décision explicite sur le lot suivant.

### 17.2 Gates par sous-lot

| Sous-lot | Critères d'entrée | Fichiers autorisés à fixer dans la mission | Critères de sortie |
|---|---|---|---|
| P3-PEOPLE-001B | P3-PEOPLE-001A GO ; trois références et présent contrat inchangés ; périmètre Foundation accepté | uniquement futur noyau interne People et tests ciblés correspondants ; liste exacte obligatoire | deux agrégats conformes ; entités et Value Objects décidés ; invariants et erreurs protégés ; aucun producteur, stockage, commande publique, query, Work ou Runtime modifié ; tests ciblés, Work, Runtime, Core et typecheck PASS ; rapport GO |
| P3-PEOPLE-001C | P3-PEOPLE-001B GO ; modèle certifié | uniquement futur producteur interne People et tests ciblés ; liste exacte obligatoire | People Authority unique ; aucune source technique ; provenance et causalité établies ; aucun stockage, API, BFF ou Work modifié ; validations PASS ; rapport GO |
| P3-PEOPLE-001D | P3-PEOPLE-001C GO ; nécessité de persistance reconfirmée ; ownership unique démontré | uniquement persistance People, adaptation interne indispensable et tests ; liste exacte obligatoire | Business Person et Work People durables ; atomicité, histoire, unicité, concurrence et migration conformes ; aucune copie externe ; validations PASS ; rapport GO |
| P3-PEOPLE-001E | P3-PEOPLE-001D GO ; source durable certifiée | uniquement commandes internes People, événements et tests ; liste exacte obligatoire | commandes du contrat disponibles ; erreurs, idempotence et ordre événementiel démontrés ; aucune API/BFF/Work ; validations PASS ; rapport GO |
| P3-PEOPLE-001F | P3-PEOPLE-001E GO ; écritures et événements certifiés | uniquement requêtes internes People, index reconstructible éventuel et tests ; liste exacte obligatoire | neuf requêtes du contrat qualifiées ; zéro logique métier consommatrice ; absences et cohérence démontrées ; aucune exposition publique ; validations PASS ; rapport GO |
| P3-PEOPLE-001G | P3-PEOPLE-001F GO ; source, écritures et lectures stables | uniquement intégration interne Work/People indispensable et tests ; aucun Frontend/BFF/API | Work lit People sans duplication ; quatre états d'absence respectés ; sept domaines Phase 1 inchangés ; séparation Technical Agent démontrée ; validations PASS ; rapport GO |
| P3-PEOPLE-001H | P3-PEOPLE-001G GO ; tous les rapports B à G disponibles | uniquement rapport de certification et corrections strictement indispensables préalablement autorisées | conformité complète au blueprint et au contrat ; tests ciblés, Work, Runtime, Core et typechecks PASS ; aucune régression ; décision sur l'ouverture de Planning |

### 17.3 NO GO

Tout sous-lot retourne NO GO et n'autorise pas le suivant si :

- son producteur ou sa source est ambigu ;
- un agrégat supplémentaire devient nécessaire sans révision du contrat ;
- une donnée technique doit être promue ;
- la persistance devient concurrente ;
- une API, un BFF ou un écran est requis prématurément ;
- un invariant WP-001 est affaibli ;
- une régression est causée ;
- la liste de fichiers n'est pas respectée ;
- une validation obligatoire échoue.

### 17.4 Décision du présent lot

| Contrôle P3-PEOPLE-001A | Résultat |
|---|---|
| Cohérence avec People Blueprint | PASS |
| Cohérence avec Work Blueprint | PASS |
| Cohérence avec Phase 2 Certification | PASS |
| Périmètre Foundation fermé | PASS |
| Deux agrégats explicitement décidés | PASS |
| Ownership et producteur futur définis | PASS |
| Entités et Value Objects définis | PASS |
| Commandes et requêtes définies | PASS |
| Événements et erreurs définis | PASS |
| Persistance décidée sans être créée | PASS |
| Intégration Work définie | PASS |
| Séparation Technical Agent absolue | PASS |
| Séquence B à H ordonnée | PASS |
| Implémentation réalisée | NONE |

**VERDICT : GO**

**NEXT AUTHORIZED LOT : P3-PEOPLE-001B — People Foundation Model**

Ce lot suivant n'est pas commencé automatiquement.
