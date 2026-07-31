# PEOPLE DOMAIN BLUEPRINT

## Statut documentaire

| Attribut | Valeur |
|---|---|
| Identifiant | WP-001 |
| Phase | Phase 2 — Conception métier |
| Statut | CANONICAL |
| Portée | Domaine métier People |
| Nature | Blueprint métier, non exécutable |
| Référence amont | `WORK_DOMAIN_BLUEPRINT.md` |

## 0. Objet et autorité

Ce document définit officiellement le domaine métier **People** de NOVA.

Il répond aux questions suivantes :

- qui peut intervenir sur un Work ;
- à quel titre cette personne intervient ;
- quelles responsabilités métier lui sont confiées ;
- comment cette participation commence, évolue et se termine ;
- quelles relations People entretient avec Work et ses domaines associés.

Il constitue la référence canonique des futurs lots People. Il ne décrit ni une implémentation, ni un Runtime, ni une API, ni une persistance.

Le présent blueprint respecte les acquis de la Phase 1 :

- aucun domaine People autoritatif n'existe dans le patrimoine certifié ;
- aucune identité humaine ne peut être déduite d'une session, d'un compte, d'une décision d'approbation ou d'un agent technique ;
- `RuntimeAgent` et le Technical Agent de Work restent strictement distincts d'une Personne métier ;
- un Work Phase 1 peut exister sans acteur métier People.

---

## 1. Définition officielle

### 1.1 Personne métier

Une **Personne métier** est une identité humaine reconnue dans le contexte métier de NOVA, susceptible d'assumer une ou plusieurs responsabilités sur un ou plusieurs Works.

Son existence métier ne dépend pas :

- d'un compte technique ;
- d'une authentification ;
- d'une session active ;
- d'un rôle de sécurité ;
- d'un `RuntimeAgent` ;
- d'un acte ponctuel d'approbation.

Une Personne métier n'intervient pas automatiquement sur un Work. Son intervention résulte d'une **Affectation** explicite.

### 1.2 Identité métier

La **Business Identity** distingue durablement une Personne métier des autres personnes reconnues par NOVA.

Elle permet :

- de rattacher sans ambiguïté une Affectation à une personne ;
- de conserver l'attribution historique des responsabilités et contributions ;
- de reconnaître une même personne sur plusieurs Works ;
- de distinguer la personne de ses identités et moyens techniques éventuels.

L'identité métier ne confère, à elle seule, aucun rôle sur un Work et aucun droit technique.

### 1.3 Rôle métier

Un **Rôle** qualifie le titre auquel une Personne métier intervient dans le périmètre d'un Work.

Le rôle :

- est contextualisé par le Work ;
- porte un ensemble défini de responsabilités métier ;
- ne vaut ni permission technique, ni rôle de sécurité ;
- n'est pas déduit d'un comportement, d'une contribution ou d'une identité technique ;
- peut être cumulé avec d'autres rôles, sous réserve des invariants du présent blueprint.

### 1.4 Responsabilité

Une **Responsabilité** est une obligation ou une attente métier attachée à un rôle dans le contexte d'un Work.

Elle précise ce dont l'acteur doit répondre ou à quoi il doit contribuer. Elle ne décrit pas un droit d'accès, une commande logicielle ou une tâche technique.

### 1.5 Participation

La **Participation** est la relation métier effective entre une Personne métier et un Work.

`Participant` désigne donc tout acteur possédant une Affectation active sur le Work. Il s'agit de la qualité générique de la relation, et non d'un rôle spécialisé concurrent de `Owner`, `Contributor`, `Reviewer`, `Approver`, `Observer`, `Requester` ou `Sponsor`.

### 1.6 Affectation

Une **Assignment** est l'acte métier explicite qui rattache :

- une Business Identity ;
- un Work ;
- un ou plusieurs rôles métier ;
- une période d'effet ;
- une provenance.

L'Affectation est la seule base admise pour déclarer qu'une Personne métier intervient sur un Work.

Elle porte la participation et ses rôles ; elle ne crée ni le Work, ni la Personne, ni les objets produits par les autres domaines.

---

## 2. Frontières du domaine

### 2.1 Ce qui appartient à People

Le domaine People possède la définition métier et le cycle de vie de :

- la Business Identity ;
- la relation de Participation à un Work ;
- l'Affectation d'une personne à un Work ;
- les rôles People portés dans cette Affectation ;
- les responsabilités associées à ces rôles ;
- les périodes d'effet des Affectations et des rôles ;
- la provenance des décisions d'affectation ;
- l'historique métier des entrées, évolutions, remplacements et sorties.

### 2.2 Ce qui n'appartient pas à People

People ne possède pas :

- l'identité, l'objectif, le cycle de vie ou la progression du Work ;
- le contenu et l'état du Planning ;
- le contenu, l'exécution ou l'état des Actions ;
- le contenu, la validation ou la certification des Deliverables ;
- la production, le résultat ou l'historique des Decisions ;
- le calcul de Confidence ;
- la production d'Intelligence ;
- la production de Synthesis ;
- l'exécution de Mission ;
- l'orchestration du Runtime.

People peut qualifier les personnes associées à ces objets lorsque leurs domaines propriétaires l'autorisent. Il ne devient pas propriétaire de ces objets.

### 2.3 Exclusions explicites

Sont extérieurs au domaine People :

- `RuntimeAgent` ;
- le Technical Agent de Work ;
- l'authentification ;
- les sessions ;
- la sécurité ;
- le RBAC technique ;
- les permissions techniques ;
- les comptes techniques ;
- les identités de service ;
- les credentials ;
- les mécanismes d'autorisation ;
- les identités transitoires attachées à une requête ou à une session ;
- les fixtures, mocks et projections d'interface.

Aucune équivalence automatique n'est autorisée entre une Business Identity et l'un de ces éléments.

---

## 3. Types d'acteurs métier

### 3.1 Modèle de classification

Un Work n'est pas obligé de posséder un acteur People. Cette règle préserve les Works Phase 1 et les Works exécutés sans participation humaine métier modélisée.

Dès qu'une personne possède une Affectation active, elle est un `Participant`. Elle porte au moins un des rôles métier spécialisés ci-dessous.

| Catégorie | Nature | Présence sur un Work | Cardinalité active | Cumul avec d'autres rôles | Décision et justification |
|---|---|---|---|---|---|
| Participant | Qualité générique de participation | Conditionnelle à une Affectation active | 0..n personnes | Sans objet : les rôles spécialisés qualifient le Participant | Évite de confondre la relation au Work avec une responsabilité spécialisée. |
| Owner | Rôle métier | Optionnelle | 0..1 | Oui | Un Work peut fonctionner sans Owner People en Phase 1. Lorsqu'il existe, un seul Owner actif garantit une responsabilité globale non ambiguë. |
| Contributor | Rôle métier | Optionnelle | 0..n | Oui | Plusieurs personnes peuvent contribuer, et une contribution n'exclut pas une autre responsabilité. |
| Reviewer | Rôle métier | Optionnelle | 0..n | Oui | Une revue peut mobiliser plusieurs expertises ; le rôle ne vaut pas approbation. |
| Approver | Rôle métier | Optionnelle | 0..n | Oui | Plusieurs approbateurs peuvent être affectés selon le contexte. Le rôle qualifie l'acteur ; Decisions reste propriétaire de toute décision prise. |
| Observer | Rôle métier | Optionnelle | 0..n | Oui | L'observation ne confère aucune autorité de modification ou de décision. |
| Requester | Rôle métier | Optionnelle | 0..n | Oui | Une demande peut avoir plusieurs représentants. Le rôle exprime l'origine métier sans devenir propriétaire de l'Objective. |
| Sponsor | Rôle métier | Optionnelle | 0..n | Oui | Le soutien ou le mandat métier peut être partagé. Ce rôle n'implique ni propriété, ni approbation automatique. |

### 3.2 Règle de cumul

Les rôles sont cumulables parce qu'ils décrivent des responsabilités métier distinctes.

Le cumul ne crée aucune responsabilité implicite. Par exemple :

- un Owner n'est pas automatiquement Approver ;
- un Contributor n'est pas automatiquement Reviewer ;
- un Reviewer n'est pas automatiquement Approver ;
- un Sponsor n'est pas automatiquement Owner ;
- un Requester n'est pas automatiquement Owner.

Le présent blueprint ne crée aucune incompatibilité générale entre rôles. Toute séparation de responsabilités supplémentaire devra être justifiée par le domaine métier concerné avant d'être ajoutée.

---

## 4. Responsabilités métier

### 4.1 Participant

Tout Participant :

- intervient uniquement dans le périmètre de son Affectation ;
- assume les responsabilités des rôles qui lui sont attribués ;
- reste identifiable dans l'histoire du Work ;
- ne reçoit aucune autorité non explicitement portée par ses rôles.

### 4.2 Owner

Le Owner :

- porte la responsabilité métier globale de continuité du Work ;
- veille à ce que les responsabilités métier soient explicitement attribuées ;
- représente le point d'escalade métier du Work ;
- assure la cohérence de la participation des acteurs.

Le Owner ne devient pas automatiquement exécutant technique, contributeur, reviewer ou approbateur.

### 4.3 Contributor

Le Contributor :

- fournit une contribution métier au Work ;
- répond de la contribution qui lui est attribuée ;
- coopère avec les autres acteurs dans les limites de son rôle.

Le domaine propriétaire de l'objet produit reste responsable de son contenu et de son cycle de vie.

### 4.4 Reviewer

Le Reviewer :

- examine un élément du Work selon les critères métier applicables ;
- formule un constat ou une revue lorsque le domaine concerné le prévoit ;
- reste distinct de la personne qui prend une décision d'approbation.

Une revue ne constitue pas, par elle-même, une décision.

### 4.5 Approver

Le Approver :

- est la personne métier affectée pour intervenir dans un acte d'approbation ;
- assume la responsabilité métier de l'acte lorsqu'il le réalise ;
- reste identifiable dans la décision produite.

People possède l'Affectation au rôle `Approver`. Le domaine Decisions possède l'acte de décision, son résultat et son historique.

### 4.6 Observer

Le Observer :

- suit le Work au titre d'un besoin métier légitime ;
- reçoit les informations prévues par son périmètre de participation ;
- ne modifie, ne valide et n'approuve rien par le seul fait de son rôle.

### 4.7 Requester

Le Requester :

- exprime ou représente le besoin à l'origine du Work ;
- fournit le contexte métier de la demande ;
- peut contribuer à la clarification du besoin.

Le domaine Objective reste propriétaire de l'objectif autoritatif.

### 4.8 Sponsor

Le Sponsor :

- porte ou soutient le mandat métier du Work ;
- facilite les arbitrages organisationnels relevant de son périmètre ;
- peut soutenir la mobilisation des moyens métier.

Le rôle ne confère pas automatiquement la propriété du Work ni le pouvoir d'approuver ses décisions.

---

## 5. Cycle de vie métier

### 5.1 Entrée

Une personne entre dans le périmètre People d'un Work lorsqu'une Affectation explicite devient effective.

L'entrée exige :

- une Business Identity reconnue ;
- un Work identifié ;
- au moins un rôle métier ;
- une provenance explicite ;
- une date ou période d'effet connue.

L'entrée ne peut pas être déduite d'une connexion, d'une session, d'un événement technique ou de l'activité d'un RuntimeAgent.

### 5.2 Évolution

Une participation peut évoluer par :

- ajout d'un rôle ;
- retrait d'un rôle ;
- changement de rôle ;
- évolution explicite d'une responsabilité ;
- suspension puis reprise de l'Affectation ;
- changement de période d'effet.

Toute évolution produit un nouvel état effectif sans effacer l'état antérieur.

### 5.3 Sortie et retrait

La sortie met fin à l'Affectation active de la personne sur le Work.

Elle :

- retire les responsabilités futures ;
- ne supprime pas la Business Identity ;
- ne supprime pas les contributions, revues ou décisions historiquement attribuées ;
- conserve la provenance et la période pendant laquelle la participation était effective.

Une personne dont le dernier rôle actif est retiré cesse d'être Participant du Work.

### 5.4 Remplacement

Un remplacement est composé de deux changements explicites :

- la fin ou la modification de l'Affectation de la personne remplacée ;
- le début ou la modification de l'Affectation de la personne remplaçante.

Le remplacement n'est jamais inféré.

Pour `Owner`, le passage de responsabilité doit préserver l'invariant d'au plus un Owner actif à un instant donné.

### 5.5 Historisation

L'historique métier conserve :

- l'identité concernée ;
- le Work concerné ;
- les rôles et responsabilités effectifs ;
- leurs périodes d'effet ;
- la nature du changement ;
- la provenance du changement.

L'historique ne transforme pas une ancienne participation en participation active.

---

## 6. Relations avec les autres domaines

| Domaine relié | Nature de la relation | Statut | Règle de frontière |
|---|---|---|---|
| Work | Une Affectation relie une Business Identity à un Work. | FUTURE, optionnelle pour Work ; obligatoire pour toute Affectation People | Work possède son identité et son cycle de vie. People possède acteurs, rôles et Affectations. |
| Planning | Les acteurs pourront être associés aux responsabilités prévues par un plan. | FUTURE, optionnelle | Planning possède phases, séquences, jalons et échéances. People ne crée ni n'ordonne le plan. |
| Actions | Un acteur pourra être désigné responsable ou contributeur d'une Action. | FUTURE, optionnelle | Actions possède l'action et son état. People garantit l'identité, le rôle et l'Affectation. |
| Deliverables | Des Contributors, Reviewers ou autres acteurs pourront être attribués à un livrable. | FUTURE, optionnelle | Deliverables possède le livrable, ses preuves et son cycle de vie. People ne les produit ni ne les valide. |
| Decisions | Un Approver ou autre acteur pourra être rattaché à un acte de décision. | FUTURE, optionnelle | Decisions possède la décision autoritative. People possède l'identité et le rôle de l'acteur, jamais le résultat. |
| Confidence | Des faits People autorisés pourront être consommés comme contexte. | FUTURE, optionnelle en lecture | Confidence possède tout calcul et résultat. People ne calcule ni score ni confiance. |
| Intelligence | Intelligence pourra consommer des faits People explicitement autorisés. | FUTURE, optionnelle en lecture | Intelligence ne peut ni inventer une identité, ni attribuer un rôle, ni modifier une Affectation. |
| Synthesis | Une synthèse pourra référencer les acteurs et responsabilités effectifs. | FUTURE, optionnelle en lecture | Synthesis agrège ou présente ; People reste la source des faits de participation. |
| Technical Agent | Le Work peut posséder un agent d'exécution et des acteurs métier indépendants. | Relation d'équivalence INTERDITE | Aucun Technical Agent n'est une Personne métier par déduction ; aucune Personne métier n'est un Technical Agent par déduction. |
| Authentification, Session, Sécurité, RBAC | Ces domaines peuvent, à l'avenir, résoudre ou contrôler un accès technique. | Appartenance au domaine People INTERDITE | Un compte, une session, un principal ou un rôle technique n'établit jamais une Participation métier. |

### 6.1 Cardinalités métier

- un Work peut posséder zéro, une ou plusieurs Personnes métier ;
- une Personne métier peut participer à zéro, un ou plusieurs Works ;
- une Affectation concerne exactement une Personne métier et exactement un Work ;
- une Affectation active porte au moins un rôle ;
- un Work possède au plus un Owner actif ;
- les autres rôles peuvent être portés par plusieurs personnes.

---

## 7. Invariants métier

1. Une Business Identity identifie une seule Personne métier.
2. La Business Identity est indépendante de toute identité technique.
3. Une Personne métier n'intervient sur un Work que par une Affectation explicite.
4. Une Affectation concerne exactement un Work et une Business Identity.
5. Une Affectation active porte au moins un rôle métier actif.
6. Tout acteur affecté activement à un Work est un Participant de ce Work.
7. Un Work peut exister sans acteur People.
8. Une Personne métier peut participer à plusieurs Works.
9. Un Work peut posséder plusieurs Participants.
10. Un Work possède au plus un Owner actif à un instant donné.
11. Chaque rôle possède des responsabilités métier explicites.
12. Les rôles ne produisent aucune permission technique implicite.
13. Aucun rôle spécialisé n'est déduit d'un autre rôle.
14. Le rôle Approver ne produit pas une décision ; Decisions reste propriétaire de l'acte de décision.
15. Une participation n'est jamais déduite d'une session, d'un compte, d'un rôle de sécurité, d'une identité d'approbation ou d'un RuntimeAgent.
16. Le Technical Agent et la Personne métier restent deux concepts indépendants.
17. Un changement de rôle ou d'Affectation ne réécrit pas rétroactivement l'histoire.
18. Le retrait d'une personne ne supprime pas l'attribution historique de ses contributions, revues ou décisions.
19. Deux Affectations actives ne peuvent pas attribuer simultanément le même rôle à la même personne sur le même Work.
20. Toute création ou évolution d'Affectation possède une provenance explicite.
21. L'absence de Participant est distincte de l'impossibilité de déterminer les Participants.
22. Aucune fixture, projection d'interface ou donnée simulée ne peut établir un fait People autoritatif.

---

## 8. Événements métier conceptuels

Les événements ci-dessous décrivent la sémantique métier attendue. Ils ne prescrivent aucune représentation logicielle.

| Événement | Signification métier |
|---|---|
| `BusinessIdentityRecognized` | Une identité humaine est reconnue comme Business Identity dans le domaine People. |
| `PeopleAssigned` | Une Affectation explicite entre une Business Identity et un Work est établie. |
| `ParticipantAdded` | L'Affectation devient effective et la personne entre dans la participation active du Work. |
| `RoleGranted` | Un rôle métier devient effectif pour un Participant sur un Work. |
| `RoleRevoked` | Un rôle métier cesse d'être effectif sans effacer son historique. |
| `RoleChanged` | L'ensemble des rôles effectifs d'un Participant évolue explicitement. |
| `OwnerChanged` | La responsabilité de Owner passe explicitement d'une personne à une autre, ou devient non attribuée. |
| `ApproverAssigned` | Le rôle Approver devient effectif pour un Participant ; aucune décision n'est produite par cet événement. |
| `ObserverAdded` | Le rôle Observer devient effectif pour un Participant. |
| `AssignmentSuspended` | Une Affectation cesse temporairement de produire une participation active, sans être clôturée définitivement. |
| `AssignmentResumed` | Une Affectation suspendue redevient effective. |
| `ParticipantRemoved` | La personne cesse de participer activement au Work. |
| `PeopleRemoved` | L'Affectation est clôturée ; les attributions historiques restent conservées. |

Un même changement métier ne doit pas être compté plusieurs fois sous des noms différents. Les événements spécialisés précisent la nature du changement ; ils ne créent pas des Affectations parallèles.

---

## 9. Glossaire officiel

| Terme | Définition |
|---|---|
| Owner | Participant portant la responsabilité métier globale de continuité du Work. Au plus un Owner est actif par Work. |
| Participant | Personne métier reliée activement à un Work par une Affectation. |
| Contributor | Participant chargé de fournir une contribution métier au Work. |
| Reviewer | Participant chargé d'examiner un objet du Work sans produire automatiquement une approbation. |
| Approver | Participant affecté pour intervenir dans un acte d'approbation dont Decisions reste propriétaire. |
| Observer | Participant autorisé à suivre le Work sans autorité implicite de modification ou de décision. |
| Requester | Participant qui exprime ou représente le besoin à l'origine du Work. |
| Sponsor | Participant qui porte ou soutient le mandat métier du Work. |
| Assignment / Affectation | Relation métier explicite et historisée reliant une Business Identity, un Work, un ou plusieurs rôles, une période d'effet et une provenance. |
| Responsibility / Responsabilité | Obligation ou attente métier attachée à un rôle dans le contexte d'un Work. |
| Role / Rôle | Titre métier sous lequel une Personne intervient sur un Work et assume des responsabilités définies. |
| Business Identity / Identité métier | Identité humaine stable reconnue par le domaine People, indépendante des moyens techniques d'accès ou d'exécution. |
| Technical Identity / Identité technique | Identité utilisée par un système, une session, un compte, un service ou un agent pour des finalités techniques ; elle n'est pas une Business Identity par déduction. |
| Technical Agent | Agent Runtime chargé de l'exécution technique d'une Mission ; il n'est pas un acteur People. |
| Participation | État effectif de la relation entre une Personne métier et un Work par une Affectation active. |

---

## 10. Décisions d'architecture métier

### WP-ADR-001 — People est un domaine métier autonome

**Décision :** People possède la Business Identity, les rôles, responsabilités, Affectations, participations et leur histoire.

**Justification :** ces concepts possèdent leurs propres invariants et leur propre cycle de vie. Ils sont partagés par plusieurs domaines sans appartenir à l'un d'eux.

### WP-ADR-002 — People est indépendant du Runtime

**Décision :** l'existence d'une Personne métier et de ses Affectations ne dépend pas de l'exécution Runtime.

**Justification :** une responsabilité métier peut exister avant, pendant ou après une exécution technique. Le démarrage, l'arrêt ou l'absence d'un Runtime ne définit pas la participation humaine.

### WP-ADR-003 — People est indépendant du Technical Agent

**Décision :** aucune équivalence automatique n'existe entre Business Identity et Technical Agent.

**Justification :** le Technical Agent représente l'exécutant technique autoritatif de Mission. Une Personne métier représente une responsabilité humaine. Leurs identités, responsabilités et cycles de vie sont distincts.

### WP-ADR-004 — L'Affectation est la source de la participation

**Décision :** seule une Affectation explicite établit la relation Personne–Work.

**Justification :** cette règle empêche de déduire une participation à partir de traces techniques, de sessions, d'actes ponctuels ou de conventions implicites.

### WP-ADR-005 — Participant est une qualité relationnelle

**Décision :** `Participant` désigne toute personne affectée au Work ; les responsabilités sont portées par les rôles spécialisés.

**Justification :** cette séparation évite un doublon entre le fait de participer et le titre auquel la personne participe.

### WP-ADR-006 — Owner est optionnel et unique lorsqu'il existe

**Décision :** un Work peut ne posséder aucun Owner People ; il ne peut pas en posséder plusieurs simultanément.

**Justification :** l'optionalité respecte les Works Phase 1 sans domaine People. L'unicité évite une responsabilité globale ambiguë.

### WP-ADR-007 — Les rôles People sont distincts des rôles techniques

**Décision :** aucun rôle People ne confère une permission technique, et aucun rôle RBAC ne crée un rôle People.

**Justification :** responsabilité métier et contrôle d'accès répondent à des finalités différentes et relèvent de domaines différents.

### WP-ADR-008 — Decisions reste propriétaire des décisions

**Décision :** People possède l'Affectation au rôle Approver ; Decisions possède la décision prise.

**Justification :** une habilitation ou une responsabilité d'approbation n'est pas le résultat autoritatif d'un acte de décision.

### WP-ADR-009 — L'histoire People n'est pas effaçable par un changement courant

**Décision :** les entrées, rôles, remplacements et sorties conservent leurs périodes d'effet et leur provenance.

**Justification :** les responsabilités et attributions passées doivent rester interprétables après l'évolution du Work.

### WP-ADR-010 — Aucune implémentation sans producteur People autoritatif

**Décision :** les futurs lots d'implémentation devront établir une source autoritative de Business Identity et d'Affectation avant toute exposition ou projection.

**Justification :** la Phase 1 a démontré qu'aucune source existante ne peut être réutilisée sans créer une fausse source de vérité.

### WP-ADR-011 — Les interfaces et transports restent hors du modèle métier

**Décision :** ce blueprint ne prescrit ni contrat, ni endpoint, ni schéma, ni projection.

**Justification :** le modèle People doit rester indépendant des modes d'accès et des représentations techniques.

---

## 11. Conditions d'évolution

Un futur domaine ou une future relation People ne pourra être ajouté qu'en respectant simultanément les conditions suivantes :

- ne pas redéfinir la Business Identity ;
- ne pas créer une seconde source d'Affectation ;
- préserver la distinction entre rôle métier et autorisation technique ;
- préserver la distinction entre Personne métier et Technical Agent ;
- respecter les domaines propriétaires des objets reliés ;
- conserver les périodes d'effet et la provenance ;
- ne pas déduire un fait People d'une projection, d'une fixture ou d'un comportement technique ;
- introduire toute nouvelle responsabilité par une décision métier explicite.

Les futures implémentations devront être précédées de la définition des producteurs autoritatifs nécessaires. Elles ne devront pas remettre en cause les sources de vérité certifiées de la Phase 1.

---

## 12. Décision finale

| Contrôle | Résultat |
|---|---|
| Définition officielle de People | PASS |
| Réponse à « qui intervient, à quel titre et selon quelles règles » | PASS |
| Frontières métier explicites | PASS |
| Exclusion du Runtime et du Technical Agent | PASS |
| Acteurs, rôles et responsabilités définis | PASS |
| Cycle de vie défini | PASS |
| Relations interdomaines qualifiées | PASS |
| Invariants métier cohérents avec Work Phase 1 | PASS |
| Événements conceptuels définis | PASS |
| Absence de prescription d'implémentation | PASS |

**VERDICT : GO**

Le domaine People est défini comme un domaine métier autonome. Il fournit une base stable aux futurs lots de conception et d'implémentation sans contredire le patrimoine certifié ni introduire de dépendance au Runtime.
