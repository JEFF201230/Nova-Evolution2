# NOVA Frontend — Convergence Recommendation

## 0. Verdict

**GO — STRATÉGIE B : `REUSE_WITH_CONTROLLED_REFACTOR`**

Une réécriture complète n'est pas justifiée :

- 24/31 unités UX possèdent déjà une UI React intégrée ;
- 14 pages/surfaces distinctes compilent ;
- 146/146 tests passent ;
- shell, routeur, design tokens, primitives, drawers et états visuels sont réutilisables ;
- les fixtures sont identifiables et concentrées dans dix fichiers ;
- Work Activity démontre qu'un raccordement incrémental est possible.

La reprise sans contrôle n'est pas acceptable :

- aucune chaîne ne passe par le BFF ;
- 23 unités restent alimentées uniquement par mocks/local ;
- quatre routes Decision rendent la mauvaise surface ;
- sept unités n'ont pas de composant ;
- les types de fixtures jouent le rôle de contrats implicites ;
- Work Activity mélange transport, mapping et rendu ;
- les producteurs Work restent absents.

## 1. Comparaison des stratégies

| Option | Preuves favorables | Preuves défavorables | Verdict |
|---|---|---|---|
| A — `REUSE_EXISTING` | UI et tests substantiels | architecture de données incompatible, fixtures silencieuses | rejetée |
| B — `REUSE_WITH_CONTROLLED_REFACTOR` | conserve 24 unités, shell, tests et styles ; permet les adapters progressifs | exige une discipline de frontières | **retenue** |
| C — `EXTRACT_COMPONENTS_ONLY` | primitives très solides | sacrifierait routes, pages et tests réutilisables | rejetée |
| D — `PARTIAL_REWRITE` | justifiée localement pour les sept unités absentes | trop large comme stratégie générale | seulement tactique pour les zones absentes |
| E — `FULL_REWRITE` | aucun avantage prouvé | détruirait 24 unités et 146 tests sans résoudre les Capabilities | rejetée |

## 2. Patrimoine à conserver

Sans modification fonctionnelle :

- tokens, typographie, espacements et CSS global ;
- Button, Badge, Progress, Skeleton, Spinner et Status ;
- Drawer et ses sous-composants ;
- Surface, Card, Panel, Section, PageContainer et EmptyState ;
- AppShell et composants atomiques de navigation ;
- route resolver, controller, provider et registres de chemins.

Avec adapter :

- HOME et tous ses blocs ;
- les sept pages Work ;
- les quatre pages Work Setup ;
- les surfaces Global ;
- les drawers Person, Source et Deliverable.

## 3. Patrimoine à adapter

| Zone | Adaptation nécessaire | Motif |
|---|---|---|
| `NavigationShell` | retirer identité et `workId` fixtures de l'orchestration | le shell ne doit pas choisir une ressource métier fictive |
| `RouteSurface` | dispatcher la route dynamique complète | les routes Decision sont actuellement aplaties |
| `WorkSurface` | remplacer l'injection de fixtures par des sources par tab | responsabilité de données dans le routeur |
| `WorkActivityPage` | extraire origine, client et mapping | couplage Core/type serveur/UI |
| pages Work | adapter les données aux props visuelles | préserver l'UI sans promouvoir les fixtures |
| `WorkSetupProvider` | cesser d'être source métier | état volatile et non autoritatif |
| `SituationDetailsDrawer` | recevoir du contenu sourcé | logique métier codée en dur |
| surfaces Global | remplacer les fixtures dérivées | duplication silencieuse |

## 4. Patrimoine à isoler ou supprimer

### Isoler

- cockpit legacy jusqu'à équivalence fonctionnelle démontrée ;
- `/lab` et `/shell` comme surfaces de validation ;
- fixtures comme données de test uniquement ;
- `dist` actuel, car il est périmé.

### Supprimer uniquement dans un lot ultérieur autorisé

- `app/routeState.ts`, doublon non utilisé ;
- `HomeSurface` et ses composants placeholder ;
- payload de `workActivityFixture` devenu mort ;
- `globalRouteFixtures.ts` après adapter ;
- `App.module.css` et `CoreComponentsLab.module.css`, sans import.

La suppression n'est pas un prérequis de WCF-001.

## 5. Comparaison des vertical slices

| Candidat | Valeur utilisateur | UX actuelle | Runtime disponible | Capability nécessaire | Complexité relative | Risque | Capacité E2E |
|---|---|---|---|---|---|---|---|
| Work Activity | historique d'exécution réel | présente et testée | Mission list + events | identité Work partielle | faible | faible à moyen | déjà démontrée en direct Core |
| HOME complète | cockpit priorisé et actionnable | présente avec mocks | sources fragmentaires | WCF-001 à WCF-008, Decisions, Preparation | très élevée | élevée | non |
| HOME minimale Active Work | entrée utilisateur et navigation | composants présents | Mission list + progression | WCF-001 | faible à moyenne | maîtrisable | oui après frontière de données |
| Work Overview | synthèse complète d'un Work | présente avec mocks | projection absente | WCF-001 à WCF-008 | très élevée | élevée | non avant producteurs |

## 6. Décisions de séquencement

### 6.1 Premier vertical slice

Work Activity est déjà le premier vertical slice Runtime factuel.

La première nouvelle tranche Frontend recommandée est **HOME minimale read-only — Active Work**, mais uniquement après WCF-001.

### 6.2 Priorité Runtime

**WCF-001 reste prioritaire.**

Il fournit l'identité Work, le cycle de vie, la progression et la provenance nécessaires pour ne pas reproduire le couplage `workId = fixture`.

### 6.3 HOME avant Work Overview

Oui, une HOME minimale peut être raccordée avant Work Overview :

- liste Active Work ;
- progression disponible ;
- états loading/empty/error ;
- navigation vers Work Activity.

Non, HOME complète ne peut pas précéder les producteurs de Decisions, Planning, Actions, Evidence et Intelligence.

## 7. Plus petit incrément livrable

Ordre recommandé :

1. **WCF-001 — Work Core Foundation** ;
2. tranche Frontend HOME minimale read-only ;
3. alignement du chemin de données avec une origine configurée et une frontière d'accès ;
4. retrait de `homeFixture.activeWork` du chemin de production ;
5. conservation explicite des blocs non alimentables dans un état indisponible, sans valeurs fictives ;
6. poursuite de la roadmap WCF avant Work Overview.

Ce plan ne demande aucune réécriture du shell ni des composants HOME.

## 8. Frontières à ne pas toucher dans le premier incrément

- Work Overview ;
- Decision Flow ;
- Search Overlay ;
- mutations Mission ;
- SSE ;
- confiance, recommandations et synthèses ;
- fixtures des autres écrans Work ;
- cockpit legacy ;
- Runtime hors WCF-001 ;
- Programs, Rules et Doctrines ;
- composants atomiques validés.

## 9. Risques de convergence et contrôles

| Risque | Niveau | Contrôle de convergence |
|---|---|---|
| afficher une fixture comme donnée réelle | `HIGH` | aucun fallback métier silencieux |
| dupliquer les types Runtime dans React | `HIGH` | adapter à la frontière, sans import interne |
| contourner durablement le BFF | `HIGH` | choix de frontière explicite avant généralisation |
| étendre WCF-001 pour satisfaire HOME complète | `HIGH` | maintenir le périmètre SW-014 |
| casser les 146 tests | `HIGH` | conserver les tests et ajouter seulement dans un futur lot autorisé |
| supprimer le cockpit trop tôt | `HIGH` | équivalence démontrée avant retrait |
| mélanger refactor UI et création Capability | `MEDIUM` | lots séparés |
| réutiliser `dist` périmé | `HIGH` | build certifié dans un lot de livraison, pas dans cet audit |

## 10. Réponse à la décision Program Director

Le développement from scratch doit être abandonné comme stratégie générale.

Le dépôt contient un Frontend de convergence viable : son patrimoine UX et ses tests ont une valeur supérieure au coût d'adaptation. Les lacunes les plus coûteuses sont dans les Capabilities et les producteurs Runtime ; une réécriture Frontend ne les résoudrait pas.

La stratégie correcte est de conserver l'UI, d'introduire des adapters contrôlés au fur et à mesure que les producteurs deviennent canoniques, et de limiter les créations aux sept unités réellement absentes.

## 11. Décision finale

| Décision | Valeur |
|---|---|
| Continuer la version existante | OUI |
| Repartir from scratch | NON |
| Stratégie | `B — REUSE_WITH_CONTROLLED_REFACTOR` |
| Premier lot à ouvrir | `WCF-001 — Work Core Foundation` |
| Première nouvelle tranche UI | HOME minimale read-only après WCF-001 |
| HOME complète avant Work Overview | NON |
| HOME minimale avant Work Overview | OUI |
| GO / NO GO | **GO** |
