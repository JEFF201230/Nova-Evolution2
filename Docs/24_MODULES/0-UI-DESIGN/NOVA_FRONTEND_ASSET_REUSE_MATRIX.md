# NOVA Frontend — Asset Reuse Matrix

## 0. Règles de classification

Chaque actif reçoit un statut unique :

| Statut | Sens |
|---|---|
| `REUSE_AS_IS` | indépendant du métier et réutilisable sans changement fonctionnel |
| `REUSE_WITH_ADAPTER` | UI conservable si les données lui sont fournies par une frontière dédiée |
| `REFACTOR` | responsabilité ou dépendance incompatible avec la convergence |
| `ISOLATE` | utile uniquement comme démonstration, fixture, legacy ou artefact généré |
| `DELETE` | actif mort ou doublon prouvé, à supprimer uniquement dans un lot autorisé |
| `UNKNOWN` | preuve insuffisante |

Cette matrice ne réalise aucune suppression.

## 1. Design system et primitives

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/styles/designTokens.css` | couleurs, typographie, espacements, dimensions, motion | CSS | aucune | `REUSE_AS_IS` | tokens centralisés et testés |
| `src/styles/globals.css` | reset et styles globaux | design tokens | aucune | `REUSE_AS_IS` | couche globale minimale |
| `src/components/shared/Badge.tsx` | badge de statut | CSS Module | aucune | `REUSE_AS_IS` | composant présentatif testé |
| `src/components/shared/Button.tsx` | bouton générique | CSS Module | aucune | `REUSE_AS_IS` | variantes et accessibilité testées |
| `src/components/shared/Progress.tsx` | barre de progression | CSS Module | valeur fournie par appelant | `REUSE_AS_IS` | aucun calcul métier |
| `src/components/shared/Skeleton.tsx` | état loading | CSS Module | aucune | `REUSE_AS_IS` | générique et testé |
| `src/components/shared/Spinner.tsx` | indicateur loading | CSS Module | aucune | `REUSE_AS_IS` | générique |
| `src/components/shared/Status.tsx` | point/libellé de statut | CSS Module | aucune | `REUSE_AS_IS` | aucun vocabulaire métier imposé |
| `src/components/drawer/Drawer.tsx` et `index.ts` | modal drawer, overlay, sections, listes | React portal, CSS Module | aucune | `REUSE_AS_IS` | gestion focus, Escape et overlay testée |
| `src/components/surfaces/Surface.tsx` | surface visuelle | CSS Module | aucune | `REUSE_AS_IS` | primitive |
| `src/components/surfaces/Card.tsx` | carte générique | Surface | aucune | `REUSE_AS_IS` | composition pure |
| `src/components/surfaces/Panel.tsx` | panneau générique | Surface | aucune | `REUSE_AS_IS` | composition pure |
| `src/components/surfaces/Section.tsx` | section titrée | CSS Module | aucune | `REUSE_AS_IS` | composition pure |
| `src/components/surfaces/PageContainer.tsx` | largeur et marges de page | CSS Module | aucune | `REUSE_AS_IS` | utilisé par Setup et Work |
| `src/components/surfaces/EmptyState.tsx` | états vides/erreurs | Surface, Button | aucune | `REUSE_AS_IS` | présentatif et testé |

## 2. Shell, navigation et routage

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/components/shell/AppShell.tsx` | structure sidebar/frame | CSS Module | aucune | `REUSE_AS_IS` | shell générique et responsive |
| `src/components/shell/ContentArea.tsx` | conteneur de contenu | CSS Module | aucune | `REUSE_AS_IS` | générique |
| `src/components/shell/ContentViewport.tsx` | viewport | CSS Module | aucune | `REUSE_AS_IS` | générique |
| `src/components/shell/NavigationItem.tsx` | lien de navigation | CSS Module | aucune | `REUSE_AS_IS` | composant accessible |
| `src/components/shell/NavigationSection.tsx` | groupe de navigation | CSS Module | aucune | `REUSE_AS_IS` | générique |
| `src/components/shell/SideNavigation.tsx` | structure de sidebar | CSS Module | aucune | `REUSE_AS_IS` | ne contient pas de donnée métier |
| `src/components/shell/ShellLogo.tsx` | marque NOVA | CSS Module | aucune | `REUSE_AS_IS` | présentatif |
| `src/components/shell/TopBar.tsx` | top bar composable | CSS Module | aucune | `REUSE_AS_IS` | présentatif |
| `src/components/shell/ShellDivider.tsx` | séparateur | CSS Module | utilisé uniquement dans `/shell` | `ISOLATE` | composant de laboratoire sans usage produit |
| `src/components/shell/ShellFooter.tsx` | footer technique | CSS Module | utilisé uniquement dans `/shell` | `ISOLATE` | hors UX certifiée |
| `src/components/shell/NavigationShell.tsx` | composition globale et choix des écrans | routeur, Home, Work Setup, fixture HOME | profil et `workId` fictifs | `REFACTOR` | mélange shell, identité, sélection Work et dispatch |
| `src/routes/RouteDefinition.ts` | noms, paramètres et types de routes | aucune | aucune | `REUSE_AS_IS` | les 20 routes canoniques sont déclarées |
| `src/routes/RouteRegistry.ts` | registre chemins/métadonnées | RouteDefinition | aucune | `REUSE_AS_IS` | définitions correctes ; l'erreur est dans le dispatch |
| `src/routes/routeResolver.ts` | résolution et génération des chemins | registre | aucune | `REUSE_AS_IS` | deep links et paramètres testés |
| `src/routes/NavigationController.ts` | History API | routeResolver | aucune | `REUSE_AS_IS` | navigation testée |
| `src/routes/NavigationProvider.tsx` | contexte de navigation | controller | aucune | `REUSE_AS_IS` | frontière propre |
| `src/routes/navigationEvents.ts` | événement de navigation | DOM | aucune | `REUSE_AS_IS` | utilitaire minimal |
| `src/hooks/useCurrentRoute.ts` | route courante | NavigationProvider | aucune | `REUSE_AS_IS` | hook mince |
| `src/hooks/useNavigation.ts` | navigation | NavigationProvider | aucune | `REUSE_AS_IS` | hook mince |
| `src/hooks/useRouteParams.ts` | paramètres Work/Decision | NavigationProvider | aucune | `REUSE_AS_IS` | hook mince |
| `src/components/routes/RouteSurface.tsx` | dispatch de surface | `surfaceRouteId` seulement | écrase les variantes Decision | `REFACTOR` | doit distinguer les routes dynamiques sans déplacer le routeur |
| `src/app/routeState.ts` | ancien ordre/résolution des routes primaires | routeur courant | utilisé uniquement par son test | `DELETE` | helper parallèle non utilisé en production |

## 3. HOME

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/features/home/HomePage.tsx` | composition HOME et états | fixture, navigation, drawer | données fictives | `REUSE_WITH_ADAPTER` | structure conforme, source à remplacer |
| `src/features/home/HomeHeader.tsx` | salutation et résumé | homeFixture | identité/compteurs fictifs | `REUSE_WITH_ADAPTER` | présentation conservable |
| `src/features/home/ObjectiveComposer.tsx` | saisie d'objectif | fixture, état local | Mission Preparation absente | `REUSE_WITH_ADAPTER` | interaction utile, soumission à raccorder |
| `src/features/home/PriorityInsight.tsx` | enveloppe d'insight | homeFixture, NextBestAction | Intelligence absente | `REUSE_WITH_ADAPTER` | composant de présentation |
| `src/features/home/NextBestAction.tsx` | gain, Why, CTA | fixture, état UI | recommandation fictive | `REUSE_WITH_ADAPTER` | interaction réutilisable, données à injecter |
| `src/features/home/PendingDecisionCard.tsx` | décision principale | fixture | Decisions absente | `REUSE_WITH_ADAPTER` | carte conservable |
| `src/features/home/ActiveWorkSection.tsx` | liste de Work | fixture | Work absent | `REUSE_WITH_ADAPTER` | mapping de collection à adapter |
| `src/features/home/ActiveWorkCard.tsx` | carte Work | Badge | classification couleur locale | `REUSE_WITH_ADAPTER` | rendu conservable ; statut/confiance doivent venir du modèle |
| `src/features/home/BackgroundWorkSection.tsx` | activité de fond | fixture | Intelligence absente | `REUSE_WITH_ADAPTER` | présentation conservable |
| `src/features/home/NovaSuggestionCard.tsx` | bandeau NOVA | Badge | aucune donnée interne | `REUSE_AS_IS` | reçoit déjà ses données par props |
| `src/features/situation-details/SituationDetailsDrawer.tsx` | détail de situation | Drawer | contenu métier codé dans le composant | `REFACTOR` | doit devenir présentatif avant raccordement |
| `src/features/home/homeFixture.ts` | données HOME de démonstration | aucune | source non autoritative | `ISOLATE` | conserver pour tests visuels jusqu'à remplacement |
| `src/components/routes/HomeSurface.tsx` | ancien placeholder HOME | RoutePlaceholder | masqué par NavigationShell | `DELETE` | branche produit remplacée par HomePage |
| `src/components/routes/RoutePlaceholder.tsx` | placeholder structurel | Panel, Section | utilisé par HomeSurface seulement | `DELETE` | aucun écran produit ne l'utilise |
| `src/components/routes/RouteDescription.tsx` | texte de route legacy | CSS | HomeSurface seulement | `DELETE` | dépend du placeholder mort |
| `src/components/routes/RouteTitle.tsx` | titre de route legacy | CSS | HomeSurface seulement | `DELETE` | dépend du placeholder mort |

## 4. Work Setup

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/features/work-setup/ClarifyPage.tsx` | wizard Clarify | contexte, fixtures | Mission Preparation absente | `REUSE_WITH_ADAPTER` | UI et navigation testées |
| `src/features/work-setup/CanvasPage.tsx` | Canvas | contexte | état local | `REUSE_WITH_ADAPTER` | UI conservable |
| `src/features/work-setup/PlanPage.tsx` | plan Setup | fixtures | Planning absent | `REUSE_WITH_ADAPTER` | UI conservable |
| `src/features/work-setup/ConfirmPage.tsx` | confirmation | contexte, navigation | aucun POST Mission | `REUSE_WITH_ADAPTER` | UI conservable, action non fonctionnelle |
| `src/features/work-setup/WorkSetupProvider.tsx` | état métier du wizard | useState, fixtures | mémoire volatile faisant autorité | `REFACTOR` | doit cesser d'être source métier |
| `src/features/work-setup/WorkSetupContext.tsx` | accès au contexte | Provider | couplage au modèle local | `REFACTOR` | frontière à conserver mais modèle à adapter |
| `src/features/work-setup/workSetupTypes.ts` | types locaux Setup | aucune | contrat implicite | `REFACTOR` | non certifiés comme contrat métier |
| `src/features/work-setup/workSetupFixtures.ts` | contenu et valeurs Setup | types locaux | données temporaires | `ISOLATE` | garder uniquement pour tests visuels |

## 5. Work

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/components/routes/WorkSurface.tsx` | sélection tab + injection des données | six fixtures, route params | source métier dans le routeur | `REFACTOR` | point de raccordement principal à découpler |
| `src/features/work/WorkPageHeader.tsx` | header et sept tabs | `WorkOverviewFixture` | type fixture transversal | `REUSE_WITH_ADAPTER` | UI testée, type à neutraliser |
| `src/features/work/WorkOverviewPage.tsx` | Overview | fixture type, primitives | WCF producteurs absents | `REUSE_WITH_ADAPTER` | patrimoine visuel fort, données à injecter |
| `src/features/work/WorkPlanPage.tsx` | Plan Work | deux types de fixture | Planning absent | `REUSE_WITH_ADAPTER` | UI testée |
| `src/features/work/WorkActivityPage.tsx` | lecture/mapping/rendu Activity | fetch Core, types serveur, types fixture | contourne BFF et mélange adapter/UI | `REFACTOR` | la chaîne Runtime est utile mais mal localisée |
| `src/features/work/WorkPeoplePage.tsx` | People et drawer | fixtures, Drawer | People absent | `REUSE_WITH_ADAPTER` | UI testée |
| `src/features/work/WorkSourcesPage.tsx` | Sources et drawer | fixtures, Drawer | Evidence absent | `REUSE_WITH_ADAPTER` | UI testée |
| `src/features/work/WorkDecisionsPage.tsx` | Decisions Work | fixtures, navigation | Decisions absent | `REUSE_WITH_ADAPTER` | UI testée |
| `src/features/work/WorkDeliverablesPage.tsx` | Deliverables et drawer | fixtures, Drawer | Deliverables partiel | `REUSE_WITH_ADAPTER` | UI testée |
| `src/features/work/workOverviewFixture.ts` | Work complet simulé et type partagé | aucune | source non autoritative | `ISOLATE` | garder pour tests ; ne pas promouvoir en contrat |
| `src/features/work/workPlanFixture.ts` | plan simulé | aucune | Planning fictif | `ISOLATE` | fixture de test uniquement |
| `src/features/work/workPeopleFixture.ts` | personnes simulées | aucune | People fictif | `ISOLATE` | fixture de test uniquement |
| `src/features/work/workSourcesFixture.ts` | sources simulées | aucune | Evidence fictive | `ISOLATE` | fixture de test uniquement |
| `src/features/work/workDecisionsFixture.ts` | décisions simulées | aucune | Decisions fictif | `ISOLATE` | fixture de test uniquement |
| `src/features/work/workDeliverablesFixture.ts` | livrables simulés | aucune | Deliverables fictif | `ISOLATE` | fixture de test uniquement |
| `src/features/work/workActivityFixture.ts:1-26` | types de vue Activity | page Activity | noms Fixture utilisés en production | `REFACTOR` | déplacer la responsabilité de typage hors des données mortes |
| `src/features/work/workActivityFixture.ts:27-145` | anciens événements Activity | aucune production | remplacés par SW-010 | `DELETE` | données mortes ; suppression à réaliser dans un lot autorisé |

## 6. Global, Decision et Search

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/components/routes/DecisionsSurface.tsx` | liste globale Decisions | fixture, navigation | Decisions absente | `REUSE_WITH_ADAPTER` | UI existante, données à injecter |
| `src/components/routes/DeliverablesSurface.tsx` | liste globale Deliverables | fixture | actions sans handlers | `REUSE_WITH_ADAPTER` | UI existante, données à injecter |
| `src/components/routes/GlobalRouteComponents.tsx` — `FilterTabs`, icônes | composants globaux | état local | aucune | `REUSE_AS_IS` | présentatifs |
| `GlobalRouteComponents.tsx` — `ConfidenceChip` | confiance + explication | valeur et texte générique | sémantique de confiance implicite | `REUSE_WITH_ADAPTER` | texte et provenance doivent être fournis |
| `src/components/routes/globalRouteFixtures.ts` | vues globales dérivées des fixtures Work | fixtures Work | duplication | `DELETE` | source dérivée non autoritative |
| Decision Package | aucun composant | — | unité UX D01 | `UNKNOWN` | actif absent |
| Decision Pause Review/Decide | aucun composant | — | unités UX D02.1/D02.2 | `UNKNOWN` | actifs absents |
| Decision Receipt | aucun composant | — | unité UX D03 | `UNKNOWN` | actif absent |
| Search Overlay | aucun composant | lien `#search` seulement | unité UX O01 | `UNKNOWN` | actif absent |
| Work Full Analysis Drawer | aucun composant | bouton sans handler | WCF-008 | `UNKNOWN` | actif absent |
| Full Package Drawer | aucun composant | Drawer générique seulement | Decision Package | `UNKNOWN` | actif absent |

## 7. Laboratoires, build et legacy

| Actif exact | Responsabilité | Dépendances | Legacy / métier | Statut | Justification |
|---|---|---|---|---|---|
| `src/components/lab/NOVAUIPlayground.tsx` | catalogue interne | primitives, RouteSurface | non produit | `ISOLATE` | utile pour validation visuelle |
| `src/components/shell/ShellPlayground.tsx` | démonstration shell | composants shell | non produit | `ISOLATE` | utile pour validation |
| `src/App.module.css` | ancien style d'application | aucun import | mort | `DELETE` | feuille sans import |
| `src/components/lab/CoreComponentsLab.module.css` | ancien style de laboratoire | aucun import | mort | `DELETE` | feuille sans import |
| `apps/nova-web/dist` | build généré | sources du 24/07 | en retard sur SW-010 | `ISOLATE` | ne pas utiliser comme preuve du source courant |
| `server/nova-core/public/index.html` | cockpit opérationnel legacy | NOVA Core direct | route approve 410 | `ISOLATE` | conserver comme secours jusqu'à convergence |

## 8. Synthèse de réutilisation

### Conserver sans modification fonctionnelle

- design tokens et styles globaux ;
- primitives partagées ;
- Drawer ;
- surfaces et états vides ;
- composants atomiques du shell ;
- cœur du routeur History API.

### Conserver avec adapter

- toutes les pages HOME ;
- les pages Work et Global ;
- les pages Work Setup ;
- les cartes, drawers métier et tabs Work.

### Refactorer

- `NavigationShell` ;
- `RouteSurface` ;
- `WorkSurface` ;
- `WorkActivityPage` ;
- `WorkSetupProvider` / types ;
- `SituationDetailsDrawer`.

### Isoler

- fixtures encore nécessaires aux tests visuels ;
- laboratoires `/lab` et `/shell` ;
- cockpit legacy ;
- build `dist` périmé.

### Supprimer dans un futur lot autorisé

- routeur auxiliaire `app/routeState.ts` ;
- ancienne chaîne placeholder HOME ;
- données Activity mortes ;
- fixture globale dérivée ;
- deux CSS sans import.

Le volume d'actifs `REUSE_AS_IS` et `REUSE_WITH_ADAPTER`, ainsi que 146 tests passants, exclut une justification factuelle de réécriture complète.
