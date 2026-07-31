# WORK PHASE 2 CERTIFICATION

## Statut documentaire

| Attribut | Valeur |
|---|---|
| Mission | WORK-PHASE2-CLOSURE |
| Objet | Certification de l'architecture métier Work Phase 2 |
| Portée | People, Planning, Actions, Intelligence, Synthesis, Confidence |
| Nature | Certification documentaire, sans implémentation |
| Verdict | GO |

## 1. PHASE 2 CERTIFICATION

### 1.1 Références canoniques

La présente certification repose exclusivement sur les documents suivants :

| Rôle | Document |
|---|---|
| Baseline Phase 1 | `WORK_PHASE1_CERTIFICATION.md` |
| Définition canonique Work | `WORK_DOMAIN_BLUEPRINT.md` |
| WP-001 — People | `PEOPLE_DOMAIN_BLUEPRINT.md` |
| WP-002 — Planning | `PLANNING_DOMAIN_BLUEPRINT.md` |
| WP-003 — Actions | `ACTIONS_DOMAIN_BLUEPRINT.md` |
| WP-004 — Intelligence | `INTELLIGENCE_DOMAIN_BLUEPRINT.md` |
| WP-005 — Synthesis | `SYNTHESIS_DOMAIN_BLUEPRINT.md` |
| WP-006 — Confidence | `CONFIDENCE_DOMAIN_BLUEPRINT.md` |

### 1.2 Statut de chaque blueprint

| Lot | Domaine | Verdict du blueprint | Contrôle de structure | Statut certifié |
|---|---|---|---|---|
| WP-001 | People | GO | définition, frontières, acteurs, responsabilités, cycle, relations, invariants et événements établis | CERTIFIED |
| WP-002 | Planning | GO | les onze sections obligatoires sont présentes ; les primitives Planning sont définies | CERTIFIED |
| WP-003 | Actions | GO | les onze sections obligatoires sont présentes ; intention, exécution et résultat sont séparés | CERTIFIED |
| WP-004 | Intelligence | GO | les onze sections obligatoires sont présentes ; faits et résultats raisonnés sont séparés | CERTIFIED |
| WP-005 | Synthesis | GO | les onze sections obligatoires sont présentes ; restitution et sources sont séparées | CERTIFIED |
| WP-006 | Confidence | GO | les onze sections obligatoires sont présentes ; mesure, Evidence et Validation sont séparées | CERTIFIED |

### 1.3 Cohérence avec Work

Les six blueprints respectent les règles de `WORK_DOMAIN_BLUEPRINT.md` :

- Work conserve son identité, son Objective, son Lifecycle et son Progress ;
- les nouveaux domaines restent des propriétaires métier distincts ;
- Work ne fabrique ni plan, ni action, ni acteur, ni Intelligence, ni Synthesis, ni Confidence ;
- toute relation avec Work exige un rattachement déterministe ;
- l'absence d'un domaine futur reste un état valide tant que son producteur n'est pas certifié ;
- aucune projection, fixture ou donnée technique ne devient une source métier ;
- les sources autoritatives Phase 1 restent inchangées ;
- toute association future conserve la provenance et la propriété du domaine source.

### 1.4 Cohérence avec People

Les cinq blueprints postérieurs à WP-001 respectent `PEOPLE_DOMAIN_BLUEPRINT.md` :

- Planning peut référencer des responsabilités People sans créer d'identité ou de rôle ;
- Actions peut référencer un responsable ou un Contributor sans posséder l'Affectation ;
- Intelligence peut consommer des faits People autorisés sans inférer une identité ou une participation ;
- Synthesis peut présenter des acteurs et responsabilités sans les produire ;
- Confidence ne déduit aucun score général d'une Personne, d'un rôle ou d'une activité ;
- aucun domaine ne confond une Business Identity avec un Technical Agent ;
- authentification, Session, sécurité, RBAC et comptes techniques restent hors People.

### 1.5 Absence de seconde source de vérité

Chaque blueprint désigne un propriétaire métier unique :

| Information | Propriétaire unique |
|---|---|
| Business Identity, rôle, responsabilité, Affectation et Participation | People |
| Plan, Timeline, Phase, Milestone, Schedule, priorité et contrainte | Planning |
| Action, Task, Command métier, Activity, Execution métier et Result | Actions |
| Analysis, Insight, Recommendation, Evaluation, Diagnostic et Learning candidate | Intelligence |
| Summary, Executive Summary, Conclusion, Narrative, Digest et Recap | Synthesis |
| Confidence Assessment, Certainty, Trust et Reliability contextuels | Confidence |

Les relations interdomaines sont des références ou des consommations autorisées. Elles ne permettent ni copie autoritative, ni agrégat concurrent, ni persistance miroir.

### 1.6 Absence de contradiction avec la Phase 1

Les NO GO de Phase 1 constataient l'absence de producteurs métier pour Planning, People, Intelligence et Synthesis, ainsi que l'absence de domaine Confidence et de Work Actions autoritatif.

La Phase 2 ne contredit pas ces constats :

- elle définit les domaines futurs ;
- elle ne prétend pas que leurs producteurs existent ;
- elle ne requalifie aucun composant Phase 1 ;
- elle ne crée aucune valeur métier ;
- elle ne modifie aucune source certifiée ;
- elle ne réalise aucune implémentation.

Le Technical Agent, les Deliverables, les Decisions, Objective, Lifecycle et Progress certifiés en Phase 1 conservent intégralement leur sens et leur propriété.

### 1.7 Résultat de certification

| Contrôle | Résultat |
|---|---|
| Six blueprints référencés | PASS |
| Six verdicts GO vérifiés | PASS |
| Cohérence avec Work | PASS |
| Cohérence avec People | PASS |
| Propriétaires métier uniques | PASS |
| Absence de seconde source de vérité | PASS |
| Absence de contradiction Phase 1 | PASS |
| Absence d'implémentation Phase 2 | PASS |

**PHASE 2 : CERTIFIED**

## 2. DOMAIN INVENTORY

| Domaine | Blueprint canonique | Définition | Frontière principale | Agrégat attendu | Producteur autoritatif futur | Dépendances métier | Statut |
|---|---|---|---|---|---|---|---|
| People | `PEOPLE_DOMAIN_BLUEPRINT.md` | Identités humaines métier, rôles, responsabilités, Affectations et Participations sur Work | Ne possède ni RuntimeAgent, ni Session, ni authentification, ni sécurité, ni objet des domaines consommateurs | People, structuré autour de Business Identity et Assignment historisée | Autorité People à établir, seule habilitée à reconnaître Business Identity et à produire les Affectations | Work obligatoire pour toute Affectation ; autres domaines optionnels consommateurs | DESIGNED / NOT IMPLEMENTED |
| Planning | `PLANNING_DOMAIN_BLUEPRINT.md` | Organisation temporelle, séquentielle et contraignante autoritative d'un Work | Ne possède ni Progress, ni Action, ni exécution Runtime, ni date technique | Planning d'un Work, avec plan courant et versions historiques | Autorité Planning à établir, seule productrice des Phases, Milestones, Schedule, dépendances, priorités et contraintes | Work et Objective ; People et Actions optionnels ; Decisions pour les arbitrages éventuels | DESIGNED / NOT IMPLEMENTED |
| Actions | `ACTIONS_DOMAIN_BLUEPRINT.md` | Unités intentionnelles de travail visant un changement ou un résultat métier | Ne possède ni Planning, ni People, ni Decision, ni exécution technique | Action, avec Tasks, Commands métier, Activities, Executions métier, Result et dépendances | Producteur Work Actions à établir, seul autorisé à créer et faire évoluer l'Action métier | Work obligatoire ; Planning, People, Decisions et Deliverables optionnels | DESIGNED / NOT IMPLEMENTED |
| Intelligence | `INTELLIGENCE_DOMAIN_BLUEPRINT.md` | Production de résultats métier raisonnés et sourcés à partir de faits, Evidence et Knowledge autorisés | Ne crée ni faits, ni Evidence, ni Action, ni Decision, ni Validation, ni Synthesis | Intelligence Assessment portant question, sources, Analysis et résultats | Producteur Work Intelligence à établir, seul autorisé à produire Analysis, Insights, Recommendations, Evaluations et Diagnostics | Work ; Evidence lorsque le résultat affirme un fait ; Knowledge ; domaines opérationnels optionnels | DESIGNED / NOT IMPLEMENTED |
| Synthesis | `SYNTHESIS_DOMAIN_BLUEPRINT.md` | Restitution consolidée, intelligible, datée et sourcée de l'état d'un Work | Ne crée, ne corrige et ne remplace aucun fait ou Outcome | Work Synthesis, avec au plus une version courante et un historique | Producteur Synthesis relevant d'Intelligence, utilisant un état Work consolidé | Work et Intelligence obligatoires dans la cible ; autres domaines en lecture | DESIGNED / NOT IMPLEMENTED |
| Confidence | `CONFIDENCE_DOMAIN_BLUEPRINT.md` | Qualification bornée, contextuelle, datée et sourcée du degré de confiance accordé à un sujet | Ne possède ni Evidence, ni Validation, ni Certification, ni Progress ; ne décide pas | Confidence Assessment, unique par sujet et contexte pour sa version courante | Producteur Intelligence autorisé, appliquant le modèle et les invariants Confidence | Intelligence obligatoire dans la cible ; Evidence et Provenance ; Validation optionnelle | DESIGNED / NOT IMPLEMENTED |

### 2.1 Sources de vérité futures

Les futures sources de vérité sont fixées au niveau métier :

1. **People** — Business Identity et historique des Assignments People.
2. **Planning** — Planning courant et versions historiques d'un Work.
3. **Actions** — Action et son cycle de vie autoritatif.
4. **Intelligence** — Intelligence Assessment et résultats raisonnés associés.
5. **Synthesis** — Work Synthesis courante et versions historiques.
6. **Confidence** — Confidence Assessment courant et réévaluations historiques.

Ces sources n'existent pas encore par effet de cette certification. Chaque source devra être établie par son lot Phase 3, après démonstration du producteur autoritatif et, si nécessaire, de la persistance canonique unique.

## 3. DEPENDENCY ORDER

### 3.1 Dépendances strictes et relations optionnelles

| Domaine | Dépendances strictes avant implémentation | Relations optionnelles utiles |
|---|---|---|
| People | Work comme contexte d'Affectation ; blueprint People certifié | Planning, Actions, Intelligence, Synthesis, Confidence |
| Planning | Work et Objective | People pour les responsabilités ; Actions pour la réalisation ; Decisions pour l'arbitrage |
| Actions | Work | Planning pour l'intention planifiée ; People pour les acteurs ; Decisions et Deliverables |
| Intelligence | Work ; Evidence pour toute affirmation factuelle | Planning, Actions, People, Deliverables, Decisions, Knowledge |
| Synthesis | Work consolidé ; Intelligence | Planning, Actions, People, Deliverables, Decisions, Confidence |
| Confidence | Intelligence comme producteur ; Evidence et Provenance | Validation, Certification, Planning, Actions, Deliverables, Decisions, Synthesis |

### 3.2 Ordre Phase 3 retenu

| Ordre | Domaine | Justification |
|---|---|---|
| 1 | People | Domaine autonome et fondation des acteurs métier. Il doit exister avant que Planning ou Actions puissent attribuer des responsabilités sans identité fictive. |
| 2 | Planning | Structure l'intention temporelle du Work. Il peut utiliser People sans en devenir dépendant pour chaque plan. |
| 3 | Actions | Porte la réalisation métier ; il peut alors référencer le plan et les acteurs déjà stabilisés. |
| 4 | Intelligence | Analyse un Work enrichi de faits People, Planning et Actions, tout en restant compatible avec leur absence explicite. |
| 5 | Synthesis | Dépend explicitement d'Intelligence et d'un état Work consolidé. Elle peut être stabilisée sans Confidence, qui reste optionnelle. |
| 6 | Confidence | Dépend explicitement d'un producteur Intelligence et d'Evidence. Elle est ajoutée en dernier comme mesure optionnelle sans modifier la Synthesis déjà autoritative. |

**Ordre canonique : People → Planning → Actions → Intelligence → Synthesis → Confidence.**

### 3.3 Justification de Synthesis avant Confidence

Synthesis et Confidence sont deux branches consommatrices d'Intelligence :

- Synthesis exige Intelligence ;
- Confidence exige Intelligence ;
- Synthesis peut présenter Confidence, mais cette relation est optionnelle ;
- Confidence ne dépend pas de Synthesis.

L'ordre retenu est donc une séquence de gouvernance, pas une fausse dépendance métier. Synthesis est stabilisée d'abord sur les faits et résultats Intelligence ; Confidence est ensuite admise comme source optionnelle supplémentaire. Aucun score provisoire ne peut être créé pour satisfaire Synthesis.

### 3.4 Gate séquentiel

Un domaine suivant ne peut être ouvert qu'après certification du domaine précédent selon l'ordre canonique.

Une exception exigerait une nouvelle décision de certification démontrant :

- l'absence de dépendance ;
- l'absence de risque de seconde source ;
- l'absence de modification des blueprints ;
- la préservation de tous les gates Phase 3.

La présente certification n'accorde aucune exception.

## 4. PHASE 3 ENTRY RULES

### 4.1 Règles communes obligatoires

Chaque domaine Phase 3 respecte les règles suivantes :

1. **Un seul domaine par lot.**
2. **Un périmètre borné par son blueprint canonique.**
3. **Un producteur autoritatif explicite avant toute consommation.**
4. **Une seule source de vérité métier.**
5. **Une persistance canonique unique uniquement si le cycle de vie métier l'exige.**
6. **Aucune copie persistante d'une source appartenant à un autre domaine.**
7. **Aucun remplacement ni enrichissement des sources Phase 1.**
8. **Une relation Work déterministe.**
9. **Une provenance relisible pour tout fait produit.**
10. **Une sémantique explicite pour absence, collection vide et producteur indisponible.**
11. **Aucune valeur métier par défaut.**
12. **Aucun écran, BFF ou transport public avant stabilisation et certification du noyau métier.**
13. **Aucun domaine suivant avant validation du précédent.**
14. **Aucune fixture, projection ou donnée technique promue en source autoritative.**
15. **Aucune implémentation hors du domaine du lot.**

### 4.2 Règles spécifiques People

- aucun couplage avec `RuntimeAgent` ou le Technical Agent ;
- aucune dérivation depuis User, Session, compte, authentification, RBAC ou identité d'approbation ;
- Business Identity, Role, Responsibility, Assignment et Participation restent distincts ;
- un Work peut continuer d'exister sans acteur People ;
- un Owner reste optionnel et unique lorsqu'il existe ;
- aucun rôle People ne confère une permission technique.

### 4.3 Validation obligatoire de chaque lot

Avant certification, chaque lot doit fournir :

- tests ciblés du domaine ;
- tests ciblés des invariants et transitions ;
- tests d'absence et de provenance ;
- tests Work ;
- tests Runtime ;
- tests Core ;
- typecheck du domaine et de tous les périmètres affectés ;
- contrôle du périmètre des fichiers ;
- contrôle d'absence de seconde source ;
- contrôle d'absence de régression.

Les erreurs préexistantes hors périmètre sont documentées et démontrées comme telles. Elles ne justifient ni un élargissement du lot, ni une correction non autorisée.

### 4.4 Conditions de NO GO

Un lot retourne NO GO sans contourner le blueprint si :

- le producteur autoritatif n'est pas démontrable ;
- deux sources concurrentes subsistent ;
- la relation Work est ambiguë ;
- une valeur doit être inventée ou déduite d'un fait technique ;
- la persistance nécessaire ne peut être unique ;
- une source Phase 1 doit être modifiée pour satisfaire le domaine ;
- un écran, un BFF ou un contrat public est nécessaire avant le noyau ;
- un autre domaine doit être implémenté dans le même lot ;
- un invariant certifié serait affaibli ;
- les validations obligatoires échouent du fait du lot.

Un NO GO conforme préserve le code et identifie le prérequis manquant.

## 5. IMPLEMENTATION LOT STRUCTURE

Chaque domaine suit obligatoirement les huit étapes ci-dessous. Une étape peut conclure qu'aucun artefact n'est nécessaire, mais elle ne peut pas être omise sans justification.

### A. Foundation

Établir le noyau métier minimal :

- concepts du blueprint ;
- agrégat et frontières ;
- identités et cardinalités ;
- invariants ;
- cycle de vie ;
- événements métier ;
- règles d'absence ;
- provenance attendue.

La Foundation ne crée aucun transport public et ne fabrique aucune donnée.

### B. Authoritative producer

Établir le producteur unique qui :

- crée les faits du domaine ;
- respecte les invariants ;
- rattache les faits au Work de manière déterministe ;
- porte la provenance ;
- distingue création, évolution, retrait et absence.

Aucun consommateur ne précède ce producteur.

### C. Persistence, uniquement si nécessaire

Une persistance n'est admise que si l'histoire ou le cycle de vie du domaine ne peut pas être garanti autrement.

Elle doit :

- être unique ;
- conserver la provenance ;
- préserver l'histoire requise ;
- ne recopier aucune source externe ;
- ne devenir ni cache miroir, ni projection consommatrice.

L'absence de besoin démontré impose l'absence de persistance.

### D. Internal command/write path

Le chemin interne d'écriture :

- applique uniquement les décisions du domaine ;
- contrôle les invariants ;
- ne modifie aucun autre agrégat ;
- ne devient pas une API publique ;
- ne contourne pas le producteur autoritatif.

Pour un domaine sans écriture métier justifiée, cette étape conclut explicitement `NOT REQUIRED`.

### E. Internal read/query path

La lecture interne :

- lit la source canonique ;
- ne recalcule pas le métier ;
- ne crée aucun fait ;
- respecte les règles d'absence ;
- conserve la provenance ;
- ne devient pas un Read Model d'interface.

### F. Work integration

L'intégration Work :

- ajoute uniquement une association ou un résultat sourcé ;
- conserve Work comme frontière de cohérence ;
- préserve les sources Phase 1 ;
- n'absorbe pas l'agrégat du nouveau domaine ;
- reste compatible avec les Works où le domaine est absent.

### G. Tests

Le lot exécute les tests ciblés du domaine, Work, Runtime et Core, ainsi que les typechecks applicables. Les tests couvrent invariants, erreurs, absences, provenance, non-duplication et non-régression.

### H. Certification

La certification vérifie :

- conformité au blueprint ;
- unicité de la source ;
- producteur autoritatif ;
- frontières ;
- persistance éventuelle ;
- relations Work ;
- tests et typechecks ;
- absence de régression ;
- autorisation ou refus de l'étape suivante.

## 6. FIRST IMPLEMENTATION

### 6.1 Désignation

**Premier lot Phase 3 : `P3-PEOPLE-001 — People Foundation`.**

Ce lot correspond exclusivement à l'étape **A. Foundation** du domaine People. Il ne préjuge pas du producteur, de la persistance ou de l'intégration Work qui feront l'objet de gates ultérieurs.

### 6.2 Objectif

Établir le noyau métier minimal et cohérent de People conformément à `PEOPLE_DOMAIN_BLUEPRINT.md` :

- Business Identity ;
- Role ;
- Responsibility ;
- Assignment ;
- Participation ;
- acteurs métier certifiés ;
- cardinalités ;
- cycle de vie ;
- invariants ;
- événements métier ;
- provenance conceptuelle ;
- sémantique d'absence.

### 6.3 Périmètre

Le lot porte uniquement sur :

- la Foundation People ;
- les règles métier internes du domaine ;
- la vérification de leur cohérence ;
- les tests ciblés nécessaires à cette Foundation ;
- son rapport de certification.

Le lot ne produit encore aucune Affectation autoritative et ne rend People consommable par une interface externe.

### 6.4 Dépendances

Les seules dépendances documentaires et métier autorisées sont :

- `WORK_PHASE1_CERTIFICATION.md` ;
- `WORK_DOMAIN_BLUEPRINT.md` ;
- `PEOPLE_DOMAIN_BLUEPRINT.md` ;
- la présente certification ;
- l'identité Work comme contexte futur d'une Assignment.

Le lot ne dépend ni du RuntimeAgent, ni de Session, ni du BFF, ni d'un écran.

### 6.5 Interdictions

`P3-PEOPLE-001` ne peut pas :

- créer le producteur People autoritatif ;
- créer une persistance ;
- créer une migration ;
- créer une API, un BFF, un endpoint ou un contrat public ;
- modifier Work, Runtime, Mission ou Technical Agent ;
- relier Business Identity à une identité technique ;
- dériver une personne d'un User, compte, principal, Session ou décision ;
- implémenter Planning, Actions, Intelligence, Synthesis ou Confidence ;
- créer une valeur People par défaut ;
- affaiblir les invariants de WP-001.

### 6.6 Critères d'entrée

Le lot peut s'ouvrir uniquement si :

- Phase 2 est certifiée GO ;
- `PEOPLE_DOMAIN_BLUEPRINT.md` reste canonique et inchangé ;
- le périmètre Foundation est explicitement accepté ;
- les concepts et leurs frontières sont repris sans extension ;
- les invariants WP-001 sont traçables vers les validations prévues ;
- aucun fichier Frontend, BFF ou Runtime n'est placé dans le périmètre ;
- le lot confirme qu'il ne crée pas encore une source de vérité People.

### 6.7 Critères de sortie

Le lot est GO uniquement si :

- la Foundation représente exactement WP-001 ;
- Business Identity et Technical Identity restent séparées ;
- Assignment et Participation restent distinctes ;
- les rôles et responsabilités respectent les cardinalités certifiées ;
- Owner reste optionnel et unique lorsqu'il existe ;
- aucun couplage RuntimeAgent n'est introduit ;
- aucune source autoritative fictive n'est créée ;
- aucun autre domaine n'est modifié ;
- les tests ciblés People passent ;
- les tests Work, Runtime et Core passent ;
- les typechecks applicables passent ;
- aucune régression n'est détectée ;
- une certification autorise ou refuse explicitement l'étape **B. Authoritative producer**.

## 7. DÉCISION FINALE

### 7.1 Clôture Phase 2

Les six domaines métier de la Phase 2 sont conçus, bornés et cohérents avec Work, People et la Phase 1.

La Phase 2 est close. Aucun de ses blueprints ne constitue une implémentation ou une source de données active.

### 7.2 Ouverture Phase 3

La Phase 3 est autorisée sous conditions :

- seul `P3-PEOPLE-001 — People Foundation` est ouvert en premier ;
- les domaines suivants restent fermés ;
- chaque étape et chaque domaine restent soumis aux gates de la présente certification ;
- aucune exposition Frontend ou BFF n'est autorisée avant stabilisation et certification du noyau concerné.

### 7.3 Verdict

**VERDICT : GO**

**PHASE 2 : CERTIFIED AND CLOSED**

**PHASE 3 : AUTHORIZED — FIRST LOT `P3-PEOPLE-001` ONLY**
