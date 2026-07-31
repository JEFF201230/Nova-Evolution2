# WD-001 — Work Domain Blueprint

Date : 2026-07-30  
Phase : 2 — Conception métier  
Statut : **CANONICAL — GO**  
Nature : blueprint métier, sans conception logicielle

## 0. Autorité et portée

Ce document définit officiellement le domaine métier **Work** dans NOVA. Il est
la référence de la Phase 2 pour toute décision portant sur l'identité, l'état,
les responsabilités, les associations ou les futures extensions d'un Work.

Il respecte et ne remplace pas :

- [la certification Phase 1](WORK_PHASE1_CERTIFICATION.md) ;
- [l'architecture canonique SW-014](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_ARCHITECTURE.md) ;
- [la roadmap canonique](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_ROADMAP.md) ;
- [la matrice des dépendances](../0-UI-DESIGN/NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md).

Les sources autoritatives certifiées en Phase 1 restent inchangées. Le présent
blueprint ne définit ni classe, ni schéma, ni DTO, ni endpoint, ni stockage, ni
interface.

## 1. Définition métier officielle

### 1.1 Réponse à la question fondamentale

> Un **Work** est l'unité métier identifiable, ancrée dans un projet et dans une
> Mission canonique, qui porte un objectif et maintient un état Work courant,
> cohérent, daté et sourcé. Il associe les contributions autoritatives utiles à
> l'accomplissement de cet objectif sans posséder, recopier ou recalculer les
> objets des domaines qui les produisent.

Un Work donne une continuité métier aux faits issus de l'exécution. Il les
qualifie dans la frontière Work, conserve leur provenance et permet à plusieurs
consommateurs d'observer le même état cohérent.

Un Work n'est pas :

- la Mission qui exécute le travail ;
- le plan qui l'ordonne ;
- l'agent qui l'exécute ;
- la personne qui en serait responsable ;
- la décision qui l'autorise ;
- le livrable produit ;
- une projection UI ou un Read Model ;
- un moteur de recommandation ou de synthèse.

### 1.2 Objectif du domaine

Le domaine Work a pour objectif de maintenir une représentation métier commune
de l'avancement d'un objectif :

1. identifiable sans ambiguïté ;
2. rattachée à la Mission autoritative suivie ;
3. gouvernée par un cycle de vie Work propre ;
4. alimentée par des faits acceptés et sourcés ;
5. extensible par associations explicites ;
6. indépendante des besoins d'affichage et de transport.

### 1.3 Responsabilité centrale

La responsabilité centrale de Work est la **cohérence métier et la
traçabilité**, non la production des données contributrices.

Work :

- possède son identité et son cycle de vie ;
- accepte une progression autoritative sans la recalculer ;
- conserve l'objectif autoritatif ;
- rattache les références autoritatives admises ;
- distingue absence, optionnalité et producteur indisponible ;
- protège la frontière entre faits techniques et concepts métier.

### 1.4 Périmètre actuel

Le périmètre certifié contient :

- Identity ;
- Objective ;
- Lifecycle ;
- Progress ;
- Deliverables ;
- Decisions ;
- Technical Agent.

Planning, People, Actions, Intelligence, Synthesis et Confidence appartiennent à
la cible métier future, mais ne disposent pas tous d'un producteur autoritatif.
Leur rôle est défini dans ce document ; aucune donnée correspondante n'est pour
autant déclarée disponible.

## 2. Frontières

### 2.1 Ce qui appartient à Work

Work possède exclusivement :

1. l'identité Work dans son projet ;
2. le rattachement à la Mission canonique ;
3. le vocabulaire et l'état courant de son cycle de vie ;
4. les règles de cohérence de l'agrégat ;
5. la politique d'acceptation et de provenance des contributions ;
6. les associations explicites entre le Work et les objets autoritatifs
   externes ;
7. la distinction entre valeur absente, association vide et producteur
   indisponible.

### 2.2 Ce que Work accepte sans le posséder

| Contribution | Domaine propriétaire | Droit de Work |
|---|---|---|
| objectif de Mission | Missions | conserver la valeur autoritative et sa provenance |
| progression observée | Monitoring | accepter la mesure courante |
| livrables produits | Deliverables / Missions | associer les références exactes |
| décisions humaines | Decisions | associer l'historique exact |
| agent technique | Runtime / Agents | exposer l'affectation technique |
| plan futur | Planning | associer le plan et ses repères |
| personnes futures | People | associer identités et rôles |
| résultats futurs | Intelligence | accepter les résultats sourcés |
| synthèse future | Intelligence | accepter une synthèse datée et sourcée |
| confiance future | Intelligence | accepter une mesure et sa provenance |

### 2.3 Ce qui n'appartient pas à Work

| Responsabilité exclue | Propriétaire |
|---|---|
| créer, exécuter, suspendre, reprendre ou terminer techniquement une Mission | Missions / Runtime |
| orchestrer des agents | Runtime / Agents |
| gérer le registre des agents | Runtime / Agents |
| définir les phases, échéances et dépendances d'un plan | Planning |
| créer, prendre, appliquer ou approuver une décision | Decisions |
| gérer une identité humaine, un rôle ou une disponibilité | People |
| produire, versionner ou stocker le contenu d'un livrable | Deliverables |
| produire ou certifier une preuve | Evidence / Certification |
| collecter des événements et métriques techniques | Monitoring |
| calculer confiance, insight, recommandation ou priorité | Intelligence |
| produire une synthèse métier | Intelligence |
| définir un écran, une route, un DTO ou un transport | Frontend / BFF / API |

### 2.4 Frontières interdites

Il est interdit :

- d'utiliser une fixture comme source métier ;
- de transformer un timestamp technique en échéance ;
- de transformer un agent technique en personne ou responsable ;
- de transformer un événement ou un statut Mission en concept Work sans
  qualification explicite ;
- de transformer un diagnostic, une connaissance ou un gate en Intelligence ;
- de transformer un brief, report, log ou dernier événement en Synthesis ;
- de recopier un agrégat externe dans l'agrégat Work ;
- de créer une seconde source pour simplifier une projection.

## 3. Agrégat Work

### 3.1 Racine d'agrégat

La racine d'agrégat est **Work**.

Elle constitue la frontière de cohérence pour :

- l'identité ;
- l'objectif accepté ;
- le cycle de vie courant ;
- la progression acceptée ;
- les dates d'observation ;
- la provenance ;
- les associations autoritatives présentes et futures.

La racine ne contient pas les agrégats des autres domaines. Elle conserve des
associations et les informations minimales nécessaires pour en vérifier la
provenance et la cohérence.

### 3.2 Identifiants

| Identifiant | Rôle métier | Règle |
|---|---|---|
| Work Identity | identifier le Work | unique et non ambiguë dans un projet |
| Project Identity | définir le périmètre d'identité | obligatoire |
| Mission Reference | ancrer le Work dans l'exécution autoritative | obligatoire et explicite |

Dans la baseline Phase 1, l'identité Work est ancrée sur l'identité Mission
dans le projet. Introduire une identité indépendante, plusieurs Missions pour
un Work ou plusieurs Works pour une Mission serait une évolution normative et
ne peut pas être déduit de ce blueprint.

### 3.3 Composition conceptuelle

```text
Work (racine)
├── Identité et rattachement Mission            [possédés]
├── Objectif autoritatif                        [accepté]
├── Cycle de vie Work courant                   [possédé]
├── Progression autoritative                    [acceptée]
├── Dates et provenance                         [possédées pour la cohérence]
├── Associations Deliverables                   [références externes]
├── Associations Decisions                      [références externes]
├── Affectation Technical Agent                 [référence technique externe]
└── Associations futures
    ├── Planning
    ├── People
    ├── Actions
    ├── Intelligence
    ├── Synthesis
    └── Confidence
```

### 3.4 Relations internes

- Identity donne l'ancrage à toutes les autres familles.
- Objective qualifie ce que le Work cherche à accomplir.
- Lifecycle qualifie l'état métier courant du Work.
- Progress qualifie l'avancement observé sans fixer un plan.
- Les associations n'existent que par rapport à l'identité Work.
- La provenance relie chaque contribution à son producteur sans en transférer
  la propriété.

## 4. Cycle de vie

Le cycle de vie Work, certifié par WCF-001, est distinct du cycle technique de
Mission.

### 4.1 États

| État | Sens métier minimal |
|---|---|
| `CREATED` | le Work est identifié mais pas encore prêt à progresser |
| `READY` | le Work peut entrer en activité ou reprendre |
| `ACTIVE` | le Work est en cours |
| `WAITING` | le Work attend un fait nécessaire avant de continuer |
| `VALIDATING` | les résultats du Work sont en validation |
| `COMPLETED` | le Work est achevé |
| `FAILED` | le Work n'a pas atteint une continuité valide |
| `CANCELLED` | le Work est arrêté définitivement |

Ces sens restent minimaux. Ils n'ajoutent ni cause, ni acteur, ni droit
d'édition non certifié.

### 4.2 Transitions autorisées

```text
CREATED    → READY | CANCELLED
READY      → ACTIVE | CANCELLED
ACTIVE     → WAITING | VALIDATING | COMPLETED | FAILED | CANCELLED
WAITING    → ACTIVE | FAILED | CANCELLED
VALIDATING → ACTIVE | COMPLETED | FAILED | CANCELLED
FAILED     → READY | CANCELLED
COMPLETED  → aucun état
CANCELLED  → aucun état
```

### 4.3 Règles du cycle

- exactement un état est courant ;
- toute transition appartient au graphe autorisé ;
- `COMPLETED` et `CANCELLED` sont terminaux ;
- un échec peut être remis en état `READY` ou annulé ;
- aucun statut Mission n'est exposé comme état Work sans la décision de
  qualification WCF-001 ;
- chaque état conserve sa date d'observation et sa provenance.

## 5. Domaines intégrés

### 5.1 Identity

**Responsabilité métier**

Identifier le Work sans ambiguïté dans un projet et établir son rattachement à
la Mission canonique.

**Dépendances**

- projet ;
- Mission autoritative.

**Limites**

- ne crée pas une identité indépendante de la Mission dans la baseline ;
- ne représente ni un User, ni une personne, ni un agent ;
- ne définit aucun identifiant de transport ou d'affichage.

### 5.2 Objective

**Responsabilité métier**

Exprimer l'objectif autoritatif que le Work poursuit.

**Dépendances**

- Identity ;
- objectif fourni par Missions.

**Limites**

- un libellé autoritatif existe ;
- description, statut et identité Objective propres restent absents tant
  qu'aucun producteur ne les fournit ;
- Work ne reformule, ne priorise et n'enrichit pas l'objectif.

### 5.3 Lifecycle

**Responsabilité métier**

Maintenir exactement un état Work courant et n'accepter que les transitions
officielles.

**Dépendances**

- Identity ;
- faits Mission autorisés ;
- décision de cycle WCF-001.

**Limites**

- ne pilote pas l'exécution Mission ;
- ne remplace pas le statut technique de Mission ;
- ne crée pas un planning.

### 5.4 Progress

**Responsabilité métier**

Conserver la progression courante observée et sa provenance.

**Dépendances**

- Identity ;
- Monitoring autoritatif ;
- exécution Mission corrélée.

**Limites**

- ne calcule pas la progression ;
- ne déduit ni phase, ni échéance, ni prochaine étape ;
- ne convertit pas la progression en confiance.

### 5.5 Deliverables

**Responsabilité métier**

Associer au Work les livrables effectivement prouvés par la Mission.

**Dépendances**

- Identity et Mission Reference ;
- rapport Mission accepté ;
- evidence de livrable.

**Limites**

- zéro, un ou plusieurs livrables sont valides ;
- Work ne produit, ne nomme, ne versionne et ne certifie pas leur contenu ;
- aucun statut, owner, URL ou métadonnée métier n'est inventé ;
- l'ordre autoritatif est conservé.

### 5.6 Decisions

**Responsabilité métier**

Associer au Work les décisions humaines autoritatives correspondant à son
contexte Mission/Run.

**Dépendances**

- Identity et Mission Reference ;
- contexte d'exécution corrélé ;
- historique Decisions autoritatif.

**Limites**

- zéro, une ou plusieurs décisions sont valides ;
- Work ne prend, n'applique et ne modifie aucune décision ;
- aucune décision principale n'est déduite ;
- confiance, recommandation, impact et échéance n'appartiennent pas à cette
  association.

### 5.7 Technical Agent

**Responsabilité métier**

Identifier l'agent technique affecté à l'exécution de la Mission rattachée au
Work.

**Dépendances**

- Identity et Mission Reference ;
- affectation Runtime ;
- registre autoritatif des agents.

**Limites**

- l'association est optionnelle tant qu'aucun agent n'est affecté ;
- au plus un agent technique courant est exposé par la baseline ;
- l'agent n'est ni Owner, ni participant, ni employé, ni User ;
- cette famille ne constitue pas People.

## 6. Domaines futurs

Définir un rôle futur n'affirme ni l'existence d'une donnée, ni l'autorisation
d'un lot d'implémentation.

### 6.1 Planning

Planning devra posséder la sémantique du plan : phases, jalons, étapes,
dépendances et échéances métier. Work devra seulement rattacher le plan
autoritatif et exposer ses repères nécessaires à la cohérence du Work.

Planning ne pourra pas être dérivé de timestamps, de l'ordre de queue, de la
progression ou de fixtures.

### 6.2 People

People devra posséder les identités humaines métier, rôles, affectations,
participations et disponibilités. Work devra seulement conserver les
associations autoritatives utiles à son contexte.

People ne pourra pas être dérivé d'un compte BFF, d'une session, d'une identité
d'approbation ou d'un Technical Agent.

### 6.3 Actions

Actions devra représenter les actions métier rattachées au Work, notamment
actions courantes, différées et d'arrière-plan, avec origine et statut
autoritaires.

Work pourra posséder l'association et la cohérence des actions Work, mais ne
devra pas inventer une priorité, une échéance ou une prochaine action. Planning,
Decisions et Intelligence restent propriétaires de leurs contributions.

### 6.4 Intelligence

Intelligence devra produire des résultats métier sourcés : insight,
recommandation et action priorisée. Elle devra consommer seulement un état Work
autorisé et des preuves autoritatives.

Work acceptera ces résultats et leur provenance sans les calculer, les compléter
ou les remplacer par des diagnostics, connaissances ou textes UX.

### 6.5 Synthesis

Synthesis devra représenter une synthèse métier courante, datée et sourcée du
Work. Son producteur relève d'Intelligence et devra utiliser un état Work
consolidé.

Work pourra accepter la synthèse comme résultat optionnel. Il ne pourra pas
utiliser MissionBrief, MissionReport, un log, une métrique ou un dernier
événement comme substitut implicite.

### 6.6 Confidence

Confidence devra représenter une mesure métier bornée, datée et sourcée, dont
le calcul appartient à Intelligence.

Work pourra accepter la mesure et ses faits de provenance. Il ne pourra pas la
déduire de Progress, du nombre de validations, d'un statut ou d'une valeur de
fixture.

## 7. Relations entre domaines

### 7.1 Matrice de relations

| Source | Cible | Qualification | Cardinalité ou obligation | Règle |
|---|---|---|---|---|
| Project | Work | OBLIGATOIRE | un Project par identité Work | périmètre d'identité |
| Work | Mission | OBLIGATOIRE | une Mission canonique dans la baseline | ancrage explicite |
| Work | Objective | OBLIGATOIRE | un objectif autoritatif | aucune reformulation |
| Work | Lifecycle | OBLIGATOIRE | exactement un état courant | vocabulaire Work |
| Work | Progress | OBLIGATOIRE | une progression courante acceptée | mesure sourcée et bornée |
| Work | Deliverables | OPTIONNELLE | zéro à plusieurs | associations exactes |
| Work | Decisions | OPTIONNELLE | zéro à plusieurs | historique exact, aucune principale implicite |
| Work | Technical Agent | OPTIONNELLE | zéro ou un courant | identité technique seulement |
| Work | Planning | FUTURE | obligatoire dans la cible définie, indisponible actuellement | producteur préalable |
| Work | People | FUTURE | zéro à plusieurs dans la cible | producteur préalable |
| Work | Actions | FUTURE | zéro à plusieurs | origine et statut autoritatifs |
| Work | Intelligence | FUTURE | sorties optionnelles | producteur Intelligence préalable |
| Work | Synthesis | FUTURE ET OPTIONNELLE | zéro ou une courante | date et provenance obligatoires si présente |
| Work | Confidence | FUTURE ET OPTIONNELLE | zéro ou une mesure courante | calcul externe et sourcé |
| Work | Evidence | FUTURE | zéro à plusieurs références | Evidence reste propriétaire |
| Work | Monitoring | OBLIGATOIRE POUR PROGRESS | consommateur unidirectionnel | Work ne collecte pas |
| Work | Certification | OPTIONNELLE | Work consultable | Certification ne modifie pas Work |
| Work | Frontend/BFF/API | INTERDITE DANS LE DOMAINE | aucune dépendance métier | consommateurs externes seulement |
| Technical Agent | People | INTERDITE ACTUELLEMENT | aucune équivalence | décision métier future requise |
| Progress | Planning | INTERDITE PAR DÉDUCTION | aucune conversion | producteurs distincts |
| Mission Report | Synthesis | INTERDITE PAR DÉDUCTION | aucune conversion | rapport technique non équivalent |

### 7.2 Sens des qualifications

- **OBLIGATOIRE** : le Work ne peut être cohérent sans la relation.
- **OPTIONNELLE** : l'absence est un état valide et explicite.
- **FUTURE** : le rôle est défini, mais aucune valeur n'est admise avant
  certification du producteur.
- **INTERDITE** : la relation ne peut être créée par convention, calcul ou
  commodité d'implémentation.

### 7.3 Graphe métier

```text
Project ──obligatoire──> Work <──obligatoire── Mission
                           |
       +-------------------+--------------------+
       |                   |                    |
   Objective           Lifecycle            Progress
  obligatoire          obligatoire          obligatoire
                                               |
                                           Monitoring

       +-------------------+--------------------+
       |                   |                    |
  Deliverables         Decisions         Technical Agent
   optionnels          optionnelles         optionnel

       +------------------- FUTURE ---------------------------+
       |          |          |            |          |        |
   Planning     People     Actions   Intelligence  Synthesis Confidence
```

## 8. Invariants métier

Seuls les invariants démontrés par SW-014, WCF-001/WCF-002 et les
réconciliations certifiées sont retenus.

1. **Identité unique** — tout Work possède une identité non ambiguë dans un
   projet.
2. **Mission explicite** — tout Work est rattaché à la Mission canonique dont il
   suit les faits autorisés.
3. **Objectif obligatoire** — tout Work porte un objectif autoritatif non vide.
4. **État unique** — un Work possède exactement un état Lifecycle courant.
5. **Transitions bornées** — un changement d'état respecte le graphe WCF-001.
6. **Progression déterministe** — les mêmes faits autoritatifs produisent la
   même progression acceptée.
7. **Échelle bornée** — Progress et toute future Confidence en pourcentage sont
   compris entre 0 et 100.
8. **Provenance obligatoire** — toute contribution externe conserve producteur,
   source et date d'observation.
9. **Association explicite** — aucun plan, action, décision, personne,
   livrable, preuve ou résultat Intelligence n'appartient au Work sans
   association autoritative.
10. **Multiplicité des livrables** — un Work peut être associé à zéro, un ou
    plusieurs livrables ; Work ne les produit pas.
11. **Multiplicité des décisions** — un Work peut être associé à zéro, une ou
    plusieurs décisions humaines ; Work ne les prend pas.
12. **Décision principale non implicite** — au plus une décision pourra être
    principale, uniquement si son producteur la désigne explicitement.
13. **Agent technique qualifié** — un Work peut exposer au plus un Technical
    Agent courant dans la baseline ; cette association ne crée aucune identité
    People.
14. **People absent** — aucun Owner, participant, contributor, reviewer ou
    observateur humain n'appartient actuellement au Work.
15. **Absence non substituable** — une valeur absente, une collection vide et
    un producteur indisponible restent trois situations distinctes.
16. **Séparation technique/métier** — aucun fait technique ne devient un concept
    métier sans qualification autorisée.
17. **Intelligence non implicite** — Work ne fabrique ni score, ni insight, ni
    recommandation, ni priorité.
18. **Synthesis non implicite** — Work ne fabrique aucune synthèse de
    remplacement.
19. **Propriété externe préservée** — Work n'absorbe ni ne réplique les agrégats
    des domaines contributeurs.
20. **Lecture sans effet** — consulter ou projeter un Work ne modifie ni le Work
    ni ses producteurs.

## 9. Évolutions autorisées

### 9.1 Gate d'admission d'un nouveau domaine

Un domaine futur ne peut être admis dans Work que si les éléments suivants sont
établis avant intégration :

1. définition métier et responsabilité propriétaire ;
2. source autoritative unique ou règle explicite de pluralité ;
3. producteur autoritatif identifiable ;
4. relation déterministe avec l'identité Work ;
5. cardinalité et règles d'absence ;
6. cycle de vie des données contributrices ;
7. provenance relisible ;
8. invariants spécifiques ;
9. décision de réconciliation démontrant l'absence de seconde vérité ;
10. certification de l'association Work.

### 9.2 Forme d'évolution autorisée

Une évolution doit :

- ajouter une association ou un résultat sourcé ;
- préserver l'identité et le cycle existants ;
- conserver les sources Phase 1 inchangées ;
- rester compatible avec les Works où le nouveau producteur est indisponible ;
- distinguer le domaine propriétaire de Work ;
- être indépendante d'un écran ou d'un endpoint ;
- ne pas exiger de valeur métier par défaut.

### 9.3 Évolutions interdites

Une évolution ne peut pas :

- modifier une source autoritative Phase 1 pour satisfaire Work ;
- copier une source externe dans une nouvelle persistance Work ;
- inventer une valeur pour remplir un contrat consommateur ;
- modifier le sens d'une famille intégrée ;
- affaiblir la provenance ;
- confondre une association et une propriété ;
- déduire Planning, People, Intelligence, Synthesis ou Confidence de faits
  techniques ;
- utiliser la Phase 2 pour introduire transport, UI ou logique BFF dans le
  domaine.

### 9.4 Ordre de décision

```text
Définition métier
→ Réconciliation du patrimoine
→ Source et producteur autoritatifs
→ Invariants et cardinalités
→ Décision d'association Work
→ Certification
→ Projections consommatrices éventuelles
```

Une projection ne peut jamais précéder la disponibilité du concept métier
qu'elle prétend afficher.

## 10. Contrôles de cohérence

| Contrôle | Résultat |
|---|---|
| Définition officielle du Work | PASS |
| Frontière de propriété explicite | PASS |
| Racine, identifiants et relations décrits | PASS |
| Sept domaines intégrés respectés | PASS |
| Six domaines futurs bornés sans implémentation | PASS |
| Relations obligatoires, optionnelles, futures et interdites qualifiées | PASS |
| Invariants limités aux décisions démontrées | PASS |
| Sources Phase 1 inchangées | PASS |
| Base d'évolution Phase 2 définie | PASS |
| Modèle logiciel, API ou transport créé | NONE |

## 11. Décision

**VERDICT : GO**

Le domaine Work est officiellement défini. Sa frontière de cohérence, ses
responsabilités, son agrégat conceptuel, ses relations et ses invariants
constituent la base stable de la Phase 2.

Les domaines futurs sont reconnus comme responsabilités métier attendues, mais
restent indisponibles tant que leurs producteurs n'ont pas satisfait le gate
d'admission. Cette définition n'autorise aucune implémentation automatique.

