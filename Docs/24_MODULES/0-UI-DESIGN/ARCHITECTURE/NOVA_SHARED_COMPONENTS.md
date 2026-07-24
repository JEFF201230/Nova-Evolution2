# NOVA — Shared Components Architecture

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

Ce document dérive le catalogue de `D04`, `D09`, `D16` et de la Constitution. « Partagé » signifie qu'une définition ou un pattern est consommé par plusieurs surfaces dans les sources ; cela ne crée aucun nouveau composant.

## 1. Primitives partagées

| Nom | Rôle | Écrans consommateurs | Drawers consommateurs | Dépendances | États documentés |
|---|---|---|---|---|---|
| NOVALabel | Identifier une intervention ou identité NOVA | Home, Canvas, Plan, People, Decision Package | Person NOVA et sections narratives selon contenu | Icône Sparkles, tokens innovation, typographie | tailles documentées divergentes 9/10/11 px ; normal/compact |
| ConfChip | Afficher la confiance et ouvrir son explication | Home, Confirm, Work Header, Work Overview/Decisions/Deliverables, Global Decisions/Deliverables, Decision Package | Peut apparaître dans données, pas imposé au shell Drawer | `confColor`, reasons, positive, missing, afterAction | fermé/ouvert ; couleurs par score ; conflit de position/dimension |
| DeadlineBadge | Afficher une échéance critique | Home decision, Work decision, Global Decisions, Decision Package | Aucun usage de drawer requis | date, tokens critical/warning | date/urgence ; styles selon échéance |
| StatusDot | Afficher disponibilité/statut | Work People, Nav/états associés selon sources | Person Detail peut exposer la donnée sans imposer le composant | statut, couleurs sémantiques | trois statuts dans une source contre booléen dans une autre |
| Btn | Action standardisée | Tous les flux avec CTA | Close/actions éventuelles, sans imposer X comme Btn | variante, taille, icône, loading, disabled | primary/secondary/quiet/danger selon sources ; hover, disabled, loading |
| Card | Conteneur interactif ou statique | Home, Canvas, Work Overview/Decisions, Global Decisions, Receipt | Sections de drawer non décrites comme Card | surface, border, shadow, onClick optionnel | statique, hover seulement si cliquable, sélection selon variante |
| WhyInline | Expliquer sans quitter le contexte | Home, Clarify selon variante, Work Overview, Work Decisions, Decision Package | Aucun | trigger, contenu, chevron | fermé/ouvert |
| Divider | Séparer des zones | Search, listes, cards, drawers | Tous drawers via séparateurs/rows | border token | statique |
| IconButton | Pattern d'action iconique | Close, More, Eye, Search, Edit | X de tous drawers | icône, focus/hover | normal, hover, focus, disabled selon contexte |
| ProgressBar | Progression/confiance/readiness | Clarify, Work Header/Overview, Deliverables | Deliverable Detail expose valeurs mais barre non obligatoire | valeur, couleur sémantique | vide à complet ; couleurs santé/confiance |
| Badge/StatusBadge | Statut compact | Sources, décisions, phases, livrables | Source/Deliverable drawers via valeur textuelle | statut, color system | available/stale/missing/conflict ; phase/risk |
| FilterPill | Filtrer une liste sans changer de page | Work Activity, Global Decisions, Global Deliverables | Aucun | filter local | selected/unselected, hover |
| Radio/OptionButton | Sélection exclusive | Clarify suggestions, Decision Package options, Decision Pause choices, Confirm autonomy | Aucun | selected id | selected/unselected, disabled éventuel |
| Textarea/Input | Saisie | Home Composer, Clarify, Canvas edit, Activity comment, Decision rationale, Search input | Aucun | valeur, validation | empty/filled, focus, disabled/loading selon écran |

## 2. Composants structurels

| Nom | Rôle | Écrans consommateurs | Drawers consommateurs | Dépendances | États documentés |
|---|---|---|---|---|---|
| App | Orchestrer vue et sélections globales | Toutes vues | Tous via leur parent | `view`, `activeWork`, `activeDecision`, `searchOpen` | onze valeurs de `view`; conflit routes/setView |
| NavRail | Navigation primaire et utilitaire | Vues non fullscreen ; présence transactionnelle en conflit | Aucune | NavItem, active view, counts, onSearch | actif/inactif, badges, largeur 56/220 en conflit |
| NavItem | Entrée de navigation | NavRail | Aucun | icône, label, active, badge | normal, active, hover |
| WorkBreadcrumb | Retour de contexte | Work et écrans décision selon documents | Aucun | titre courant, onBack | sticky ; « Work » renvoie Home dans D03 |
| WorkView shell | Conserver header et onglets du Work | Sept sous-écrans Work | Quatre drawers Work | WorkItem, tab, WorkBreadcrumb, ConfChip | sept onglets ; activeWork |
| WorkHeader | Afficher identité, santé et commandes du Work | Sept sous-écrans Work | Reste sous backdrop lors d'un drawer | ConfChip, progress, Pause, More | sticky/persistant ; commandes ND |
| WorkTabs | Navigation secondaire | Sept sous-écrans Work | Reste sous backdrop | tab local | sept états actifs |
| SearchOverlay | Recherche globale contextuelle | Toutes vues du shell | Aucun | WORK_ITEMS, DECISIONS, q, active selectors | récent si q<2, résultats si q≥2, ouvert/fermé |
| Drawer | Backdrop + panneau latéral droit | Home, Work Overview/People/Sources/Deliverables, Decision Package | Base de tous les drawers | open, onClose, title, children | fermé/non rendu, ouvert ; dimensions conflictuelles |
| DrawerSection | Section narrative titrée | Tous drawers | Tous | label, children | contenu variable |
| DrawerRow | Ligne clé/valeur | People, Sources, Deliverables, Decision Package ; autres selon données | Tous drawers structurés | label, value, color | valeur normale/sémantique |

## 3. Composites d'écran et patterns réutilisés

| Nom/pattern | Rôle | Consommateurs | Dépendances | États |
|---|---|---|---|---|
| HomeView | Awareness + entrée Work Setup | Home | WorkItem, DecisionData, composer | composer fermé/ouvert, drawer fermé/ouvert |
| ClarifyView | Qualification séquentielle | Work Setup | CLARIFY_QS | step, current ; 3/4 en conflit |
| CanvasView | Validation de compréhension | Work Setup | CANVAS_ITEMS | lecture/édition par carte |
| PhaseRow / PhaseList | Présenter phases et contributions | Plan Setup, Work Plan | PLAN_PHASES | complete/active/future ; ouvert/replié en conflit pour Work |
| ConfirmView | Choisir autonomie | Work Setup | AUTONOMY_LEVELS, ConfChip | A0/A1/A2/A3 |
| WorkOverviewTab | Situation et prochaine action | Work | WorkItem, decisions, health | disclosures, drawer |
| WorkActivityTab | Timeline filtrable | Work | ActivityEvent[] | cinq filtres, comment local |
| WorkPeopleTab | Collaborateurs et experts | Work | PersonData[] | drawer personne sélectionnée |
| PersonCard | Résumer humain/NOVA | Work People | NOVALabel, StatusDot, PersonData | humain/NOVA, disponible/pending |
| WorkSourcesTab | Qualité/couverture des sources | Work | SourceData[] | drawer source sélectionnée |
| SourceCard | Résumer source et action | Work Sources | status badge, source data | available/stale/missing/conflict |
| DecisionCard | Résumer urgence et conséquences | Home, Work Overview, Work Decisions, Global Decisions | DeadlineBadge, ConfChip, WhyInline, DecisionData | pending/waiting/decided ; cliquabilité variable |
| DecisionPackageView | Brief décisionnel convergent | Decision flow | activeDecision, option, drawer | option sélectionnée, Why, drawer |
| DecisionPauseView | Revue et enregistrement immuable | Decision flow | activeDecision, choice, rationale | review/decide/loading/valid-invalid |
| DecisionReceiptView | Confirmer décision enregistrée | Decision flow | décision enrichie | statique ; Share/Export ND |
| WorkDeliverablesTab | Readiness des livrables | Work | DeliverableData[] | drawer sélectionné |
| DeliverableCard | Résumer readiness et blocage | Work Deliverables, Global Deliverables | ConfChip, progress, DeliverableData | niveaux de readiness, blocker optionnel |
| GlobalDecisionsView | Liste transverse filtrée | Nav Decisions | DECISIONS, filter | quatre filtres aux libellés conflictuels |
| GlobalDeliverablesView | Liste transverse filtrée | Nav Deliverables | deliverables de WORK_ITEMS | quatre filtres documentés, actions ND |
| ActivityEvent | Événement narratif | Work Activity | ActivityEvent data, NOVA box | human/ai/critical/source |
| NOVA reasoning box | Expliquer activité/raisonnement | Activity, People NOVA, Sources, décisions | NOVALabel/Sparkles, contenu | présent seulement si donnée disponible |
| If approved / If rejected grid | Comparer conséquences | Work decision cards, Decision Package, Decision Pause/Receipt | DecisionOption/DecisionData | deux colonnes desktop, responsive |
| Counter strip | Résumer états de sources | Work Sources | SourceData agrégées | counts dynamiques |
| Readiness card | Suivre publication | Work/Global Deliverables | progress, blocker, actions | normal/warning/critical |
| Section header | Hiérarchiser contenu | Tous écrans et drawers | typographie/tokens | statique |

## 4. Matrice de réutilisation par surface

Légende : `●` consommateur démontré ; `○` consommation décrite sans capture dédiée ; `—` non démontré.

| Élément | Home | Setup | Work Ovw | Plan | Activity | People | Sources | Work Decisions | Deliverables | Global | Package | Pause/Receipt | Drawers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| NavRail | ○ | ○ | ○ | ● | ● | ○ | ● | ● | ● | ○ | ● | —/! | — |
| Btn | ○ | ○ | ○ | ● | ● | ● | ● | ● | ● | ○ | ● | ● | ○ |
| Card | ○ | ○ | ○ | ● | ● | ● | ● | ● | ● | ○ | ● | ● | — |
| NOVALabel | ○ | ○ | ○ | ○ | ● | ● | ● | ● | ○ | ○ | ● | ○ | ○ |
| ConfChip | ○ | ● | ○ | ● | — | — | — | ● | ● | ○ | ● | — | — |
| DeadlineBadge | ○ | — | ○ | — | — | — | — | ● | — | ○ | ● | — | — |
| StatusDot | — | — | — | — | — | ● | — | — | — | — | — | — | ○ |
| WhyInline | ○ | ○ | ○ | — | — | — | — | ● | — | — | ● | — | — |
| Drawer shell | ● | — | ● | — | — | ● | ● | — | ● | — | ● | — | ● |
| DrawerSection/Row | ● | — | ● | — | — | ● | ● | — | ● | — | ● | — | ● |
| FilterPill | — | — | — | — | ● | — | — | — | — | ○ | — | — | — |
| PhaseRow | — | ● | — | ● | — | — | — | — | — | — | — | — | — |
| DecisionCard | ● | — | ● | — | — | — | — | ● | — | ● | ● dérivé | — | — |
| DeliverableCard | — | — | — | — | — | — | — | — | ● | ○ | — | — | ○ données |
| If/If rejected | — | — | ○ | — | — | — | — | ● | — | ○ | ● | ● | ○ |
| SearchOverlay | ○ | ○ | ○ | ● | ● | ○ | ● | ● | ● | ○ | ● | ND | — |

## 5. Règles anti-duplication dérivées

1. Un seul shell Drawer doit porter les six familles de contenu ; les variations résident dans les sections et données.
2. PhaseRow/PhaseList est partagé entre Plan Setup et Work Plan, tout en conservant le conflit d'interactivité non résolu.
3. DecisionCard doit porter ses variantes Home/Work/Global plutôt que trois structures indépendantes.
4. DeliverableCard doit couvrir Work et Global, sans inventer l'ouverture d'un drawer depuis Global.
5. WorkHeader et WorkTabs appartiennent au shell Work, pas à chaque onglet.
6. SearchOverlay reste global ; aucun écran de recherche dupliqué n'est démontré.
7. ConfChip, WhyInline, badges, filtres et progress bars restent des primitives/patterns partagés.
8. Les variantes Person humaine/NOVA utilisent le même PersonCard et le même Person Drawer avec sections conditionnelles.
9. Les conséquences approved/rejected utilisent un même pattern sur cartes, Package, Pause et Receipt.
10. Une future extraction de composant ne doit pas résoudre les conflits visuels listés dans la Constitution.

## 6. Conflits et limites conservés

- NOVALabel, Btn, StatusDot, ConfChip, Drawer et NavRail possèdent des spécifications divergentes ; aucune valeur n'est canonisée ici.
- Certains patterns sont inline dans `D16`; leur réutilisation documentaire ne prouve pas qu'ils sont exportés comme composants.
- Global Deliverables partage la carte mais pas nécessairement le drawer.
- Decision Pause/Receipt partagent le flux, mais la présence du shell reste en conflit.
- Tous les `A01–A30` de la Constitution s'appliquent.

## 7. Sources

Constitution §§5–8 et §11 ; `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D10`, `D11`, `D12`, `D13`, `D14`, `D16`, `D17`, `D18`, `D19`, `D20`; validation UX `U01–U23` selon la traçabilité.
