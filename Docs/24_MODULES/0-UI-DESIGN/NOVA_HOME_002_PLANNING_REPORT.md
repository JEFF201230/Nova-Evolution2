# HOME-002 — HOME Planning

## VERDICT

**NO GO**

HOME-002 ne peut pas être implémenté sans dépasser son périmètre :

1. aucun bloc Planning autonome n'existe dans la page HOME actuelle ni dans le
   PNG HOME canonique ;
2. aucun hook, service ou adapter Planning HOME n'existe ;
3. le producteur métier autoritatif `Plan Work` est officiellement `MISSING` ;
4. WCF-003 — Planning n'est pas implémenté ;
5. créer un contrat ou une Query de transport avant le producteur autoritatif
   fabriquerait une surface sans source métier et ne raccorderait pas un bloc
   existant.

Aucun contrat, Query, endpoint, Gateway, service, hook ou composant n'a donc été
créé. Aucun fichier de code n'a été modifié.

## PLANNING COMPONENT

**ABSENT**

Route examinée : `/home`.

Composant racine :
`apps/nova-web/src/features/home/HomePage.tsx`.

Composants réellement rendus :

- `HomeHeader` ;
- `ObjectiveComposer` ;
- `PriorityInsight` ;
- `PendingDecisionCard` ;
- `ActiveWorkSection` ;
- `BackgroundWorkSection` ;
- `SituationDetailsDrawer`.

Aucun de ces composants n'est un bloc Planning :

| Élément proche | Propriétaire réel | Source actuelle | Classification |
|---|---|---|---|
| `ObjectiveComposer` | Mission Preparation / Work Setup | fixture éditoriale et `Local State` | hors HOME-002 ; composant éditable |
| `PriorityInsight` | Intelligence / WCF-008 | `Mock` dans `homeFixture.priorityInsight` | hors HOME-002 |
| `PendingDecisionCard` | Decisions / WCF-005 | `Mock` dans `homeFixture.pendingDecision` | hors HOME-002 |
| `ActiveWorkSection` | Work Core / WCF-001 | `Runtime` via HOME-001 | explicitement non modifiable |
| `BackgroundWorkSection` | Intelligence / Monitoring enrichi | `Mock` dans `homeFixture.background` | hors HOME-002 |

Les captures `HOME-REPLIE.png` et `Home-DEPLIE.png` montrent ces mêmes blocs et
ne désignent aucun bloc Planning autonome. Les anciennes échéances visibles
dans les cartes Active Work ont été supprimées par HOME-001 parce qu'elles
étaient fictives ; les réintroduire dans Active Work violerait à la fois
HOME-001 et l'interdiction de modifier ce bloc.

## READ CONTRACT

**NON CRÉÉ**

Aucun champ de rendu Planning HOME ne peut être dérivé d'un composant existant,
puisque ce composant est absent. Créer un contrat `{ planning: null }` ne
raccorderait aucun rendu existant et inventerait une nouvelle surface de
transport.

## RUNTIME QUERY

**NON CRÉÉE**

`WorkCoreFoundation` expose exclusivement :

- identité Work et Mission ;
- objectif ;
- cycle de vie ;
- progression Monitoring ;
- timestamps ;
- provenance.

Il n'expose aucun plan, phase métier, échéance métier ou dépendance Planning.
Les éléments nommés `runtime-scheduler`, `scheduleNext` ou `phase` trouvés dans
le Runtime relèvent de l'ordonnancement technique et de l'observabilité
d'exécution. Ils ne constituent pas le producteur métier `Plan Work`.

## RUNTIME SOURCE

**INDISPONIBLE**

Les sources canoniques établissent :

| Référence | Constat |
|---|---|
| `NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md`, WDEP-005 | producteur `Plan Work`, domaine `Planning`, statut `MISSING`, lot `WCF-003` |
| `NOVA_WORK_CAPABILITY_ROADMAP.md` | WCF-003 est postérieur à WCF-001 et exige WCF-001 + Planning |
| `NOVA_WORK_CAPABILITY_ARCHITECTURE.md` | plan, phases, échéance et dépendances appartiennent à Planning ; Planning est hors MVP WCF-001 |
| `server/runtime/work/work-core-foundation.ts` | consommation limitée aux Missions et événements Monitoring |

Missions et Monitoring ne sont pas autorisés à être interprétés comme un plan
métier. L'absence ne peut donc pas être comblée par composition ou calcul.

## ENDPOINTS

**AUCUN**

- endpoint Runtime Planning : absent et non créé ;
- endpoint BFF Planning : absent et non créé ;
- accès direct Frontend → Runtime : absent ;
- logique métier BFF : non introduite.

## MOCKS REMOVED

**AUCUN**

Aucun mock n'est identifié comme appartenant à un bloc Planning HOME existant.
Les fixtures restantes appartiennent aux blocs Mission Preparation,
Intelligence, Decisions et Background Work. Les supprimer ou les requalifier
aurait modifié des blocs explicitement hors périmètre.

## FILES CREATED

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_HOME_002_PLANNING_REPORT.md`

## FILES MODIFIED

**AUCUN**

En particulier, aucun fichier Frontend, BFF, Runtime, Core, contrat ou test n'a
été modifié.

## TESTS

Les suites existantes ont été exécutées sur le code inchangé :

| Suite | Résultat |
|---|---|
| Runtime | **24/24 PASS** |
| Core | **506/506 PASS** |
| BFF | **58/58 PASS** |
| Frontend | **149/149 PASS** dans 26 fichiers |
| Build Frontend | **PASS** |

Aucun test HOME-002 n'a été ajouté : aucun raccordement n'a été réalisé et
tester un contrat ou un composant inexistant aurait matérialisé une invention.

## TYPECHECK

| Cible | Résultat |
|---|---|
| NOVA Core / Runtime | **PASS** |
| BFF | **PASS** |
| Frontend | **PASS** |

## REGRESSIONS

**AUCUNE RÉGRESSION INTRODUITE**

- HOME Active Work n'a pas été modifié ;
- Work Activity et Work Overview n'ont pas été modifiés ;
- aucun autre bloc HOME n'a été modifié ;
- aucun design, layout, style ou mock voisin n'a été modifié ;
- aucune nouvelle Capability n'a été créée ;
- aucune donnée Planning n'a été simulée ou calculée.

La suite Frontend conserve un avertissement React `act(...)` dans le test
Work Setup qui maintient `/home` opérationnelle. Il n'entraîne aucun échec et
n'est pas causé par HOME-002, puisque le code est inchangé.

## Condition de réouverture

HOME-002 ne peut être réouvert factuellement qu'après :

1. identification canonique d'un bloc Planning HOME existant ou autorisation
   explicite de créer ce bloc sans modifier le design ;
2. disponibilité du producteur autoritatif Planning prévu par WCF-003.

Cette condition ne constitue pas une implémentation de WCF-003 et n'autorise
aucune extension de Work Core.
