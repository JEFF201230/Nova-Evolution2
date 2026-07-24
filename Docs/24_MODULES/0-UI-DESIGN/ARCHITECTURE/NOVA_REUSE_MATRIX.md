# NOVA — Reuse Matrix

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

Objectif : rendre explicites les unités déjà partagées dans les sources afin qu'une future implémentation évite la duplication sans créer de nouvelle interaction.

Légende : `●` usage démontré ; `○` usage documentaire sans capture imposée ; `!` usage soumis à conflit ; `—` non démontré.

## 1. Matrice composants × domaines

| Composant/pattern | Home | Setup | Work | Global | Decision | Drawers/Search | Source |
|---|---:|---:|---:|---:|---:|---:|---|
| App state router | ● | ● | ● | ● | ● | ● | D16,D18 |
| NavRail/NavItem | ○ | ○ | ● | ○ | ●/! fullscreen | ○ Search parent | D03,D09,D16 |
| Btn | ○ | ○ | ● | ○ | ● | ○ | D04,D09,D16 |
| Card | ○ | ○ | ● | ○ | ● | — | D04,D09,D16 |
| NOVALabel | ○ | ○ | ● | ○ | ● | ○ | D04,D09,D16 |
| ConfChip | ○ | ● | ● | ○ | ● | — | D04,D09,D16 |
| DeadlineBadge | ○ | — | ● | ○ | ● | — | D04,D09,D16 |
| StatusDot | — | — | ● People | — | — | ○ Person data | D04,D09,D16 |
| WhyInline | ○ | ○ | ● | — | ● | — | D04,D09,D16 |
| Drawer shell | ● | — | ● | — | ● | ● | D04,D09,D10,D16 |
| DrawerSection | ● | — | ● | — | ● | ● | D04,D09,D10,D16 |
| DrawerRow | ● | — | ● | — | ● | ● | D04,D09,D10,D16 |
| SearchOverlay | ○ | ○ | ○ | ○ | ○/ND fullscreen | ● | D03,D09,D11,D16 |
| Divider | ○ | ○ | ● | ○ | ● | ● | D09 |
| FilterPill | — | — | ● Activity | ● | — | — | D06,D11 |
| ProgressBar | ○ | ○ | ● | ○ | ○ | ○ drawer metrics | D05,D08,D14 |
| OptionButton | — | ● Clarify/Confirm | — | — | ● Package/Pause | — | D09,D11 |
| Textarea/Input | ● | ● | ● Activity | — | ● | ● Search | D09,D11 |

## 2. Matrice des layouts

| Layout | Consommateurs | Éléments partagés | Variantes autorisées par les sources | Risque de duplication |
|---|---|---|---|---|
| App shell flex | Toutes vues non fullscreen | NavRail + Main + overlay global | NavRail 56/220 en conflit | Recréer un shell par page |
| Page full-width | Home, Work, Global Decisions, Global Deliverables | padding, contenu scrollable | Colonnes et max-width selon écran | Conteneurs quasi identiques divergents |
| Centered narrow | Clarify, Confirm, Decision Pause, Receipt | max-width, padding vertical | Largeurs 560/580/600/640 conflictuelles | Un wrapper par écran |
| Medium centered | Canvas, Plan Setup | header + contenu centré | grilles/phase list | Dupliquer header/back/CTA |
| Work shell | Sept onglets Work | breadcrumb, header, tabs, content | tab actif seulement | Répéter header et tabs dans chaque onglet |
| Two-column consequence | Work decision, Package, Pause, Receipt | approved/rejected | responsive une colonne | Refaire la grille et sa sémantique |
| Drawer overlay | Six drawers | backdrop, panel, header, body | contenu/sections uniquement | Six shells de drawer distincts |
| Search modal overlay | Search uniquement | backdrop + dialog | dimensions en conflit | Confondre avec drawer/modal métier |
| Card list | Active work, decisions, people, sources, deliverables | gap, Card rows | anatomie métier | Copier listes sans primitive commune |
| Phase list | Plan Setup, Work Plan | PhaseRow, statuses, contributions | interactivité Work en conflit | Deux modèles de phase divergents |

## 3. Matrice des sections

| Section/pattern | Écrans consommateurs | Drawers consommateurs | Données variables | Source |
|---|---|---|---|---|
| Page header | Home, vues globales | — | titre, sous-titre, actions | D03,D08 |
| Work header | Tous onglets Work | Visible sous drawer Work | WorkItem, confidence, phase, deadline | D01,D03,D08 |
| Work tab strip | Tous onglets Work | Visible sous backdrop | tab actif, counts | D01,D03,D08 |
| Section header uppercase | Tous domaines | Tous drawers | label | D07,D08,D10 |
| Summary | Receipt/briefs selon contenu | DR01–DR06 | texte métier | D10 |
| Why it matters | Home/WhyInline/decision | DR01–DR06 | impact métier | D10,D11 |
| What is blocking | Work/Deliverable/Decision | DR01,DR02,DR05,DR06 | alerts/uncertainty | D10 |
| Key evidence | Work metrics/decision | DR02–DR06 sauf DR01 | rows, bars, links | D10 |
| History | Activity/Receipt/versioning | DR02,DR04,DR05 | événements/versions | D10 |
| Technical details | détails métier | DR01,DR02,DR03,DR05,DR06 | rows/tags/experts | D10 |
| Later actions | Home/Work Overview | DR01 | action arrays | D02,D10 |
| Current reasoning | People NOVA, Activity NOVA | DR03 NOVA | novaState | D10,D18 |
| CTA row | Setup, Package, Pause, Receipt | — | primary/secondary | D08,D11 |
| Filter row | Activity, Global lists | — | options/counts | D01,D11 |

## 4. Matrice des cartes

| Carte | Home | Work | Global | Decision flow | Réutilisation canonique | États |
|---|---:|---:|---:|---:|---|---|
| Base Card | ● | ● | ● | ● | Primitive Card | static/clickable/hover |
| Hero Situation | ● | ● Overview | — | — | Gradient situation block | Why/Details selon contexte |
| DecisionCard | ● | ● Overview/Decisions | ● Decisions | contenu repris Package | Une famille avec densités | pending/waiting/decided |
| DeliverableCard | — | ● | ○ | — | Même carte Work/Global selon D03 | readiness/blocker |
| PersonCard | — | ● People | — | — | Même carte humain/NOVA | availability/pending/NOVA state |
| SourceCard | — | ● Sources | — | — | Même carte pour statuts source | available/stale/missing/conflict |
| PhaseRow | — | ● Plan | — | — | Partagé avec Plan Setup | complete/active/future ; open conflictuel |
| ActivityEvent | — | ● Activity | — | — | Même structure pour cinq filtres | human/ai/critical/source |
| Receipt card | — | — | — | ● Receipt | Spécifique au flux décision | immutable record |
| Review card | — | — | — | ● Pause Review | Pattern répété Decision/Recommended/etc. | statique |

## 5. Matrice headers, sidebars et listes

| Élément | Consommateurs | Réutilisation | États/dépendances |
|---|---|---|---|
| NavRail header/logo | Shell | Unique global | active view, badge counts |
| WorkBreadcrumb | Work et décision selon sources | Une définition | current title ; lien Work→Home documenté |
| WorkHeader | 7 tabs | Unique dans WorkView | WorkItem, ConfChip, Pause/More ND |
| DrawerHeader | 6 drawers | Unique dans Drawer | title, X |
| Decision checkpoint header | Pause Review/Decide | Partagé entre étapes | Review/Decide indicator |
| Progress sidebar | Work Overview | Spécifique Overview, réutilise bars/rows | health scores, Full analysis |
| Main/sidebar grid | Work Overview | Layout partagé interne | responsive |
| Activity list | 5 filtres d'une même liste | Une liste filtrée | ActivityEvent[] |
| People list | Work People | PersonCard[] | humains/NOVA |
| Source list | Work Sources | SourceCard[] | tri/statuts |
| Decision list | Work/Global/Home | DecisionCard variants | statut, contexte |
| Deliverable list | Work/Global | DeliverableCard[] | readiness, filters globaux |
| Drawer alert list | Home/Analysis/Deliverable drawers | Pattern commun | alert items |
| Drawer action/history list | Home/Analysis/Source/Deliverable | Pattern commun | actions, versions, history |
| Key-value list | Tous drawers structurés | DrawerRow[] | label/value/color |

## 6. Matrice badges, chips et indicateurs

| Élément | Consommateurs | Donnée | États | Conflit conservé |
|---|---|---|---|---|
| ConfChip | Home, Confirm, Work, Global, Package | pct, reasons, afterAction, positive, missing | closed/open, score colors | largeur/position/popover |
| DeadlineBadge | Home/Work/Global decision, Package | date/deadline | urgency colors | détails visuels selon sources |
| StatusDot | People | availability/status | active/away/offline ou booléen | trois statuts vs booléen |
| SourceStatusBadge | SourceCard | source.status | available/stale/missing/conflict | aucun conflit navigation |
| Risk label | Decision options | risk | low/medium/high | badge-only rules à respecter |
| Phase status | PhaseRow | status | complete/active/future | aucun nouveau CTA |
| Count badge | Nav Decisions, filters/tabs | count | 0/n | filtres nommés différemment |
| NOVALabel | contenus NOVA | size/context | compact/normal | 9/10 vs 11 px |
| Readiness percentage | DeliverableCard | score | semantic color | seuil drawer 70 documenté |

## 7. Matrice filtres et disclosures

| Élément | Écrans | Options/états | Effet | Navigation externe |
|---|---|---|---|---|
| Activity filters | Work Activity | All/Human/AI/Critical/Sources | filtre events | Non |
| Decision filters | Global Decisions | All, Pending/Needs my decision, Waiting, Decided/History | filtre decisions | Non |
| Deliverable filters | Global Deliverables | All/Drafts/In review/Published | filtre deliverables | Non |
| WhyInline | Home, Work Overview, Work Decisions, Package | fermé/ouvert | révèle justification | Non |
| Later & Background | Work Overview | fermé/ouvert | révèle actions | Non |
| Phase accordion | Plan Setup | une phase ouverte selon checklist | révèle contributions | Non |
| Work Plan phase | Work Plan | read-only ou accordion | conflit | Non |
| ConfChip popover | nombreux écrans | fermé/ouvert | révèle confiance | Non |

## 8. Matrice CTA réutilisés

| CTA/pattern | Consommateurs | Destination commune | Variation | Source |
|---|---|---|---|---|
| Back | Clarify, Canvas, Plan, Confirm, Package, Pause | Parent documentaire | destination dépend du flux | D01,D02,D11 |
| Details | Home, People, Sources, Deliverables | Drawer contextuel | contenu sélectionné | D10,D11 |
| Review and decide | Work decision, Package hero/bottom | Decision Package ou Pause selon point | libellé `&`/`and` | D02,D11 |
| Why | Home, Overview, Work Decisions, Package | WhyInline local | contenu | D09,D11 |
| Close X | Drawer, ConfChip | ferme surface | overlay concerné | D09,D10 |
| Filter | Activity, Global lists | état local | options métier | D01,D11 |
| Continue | Home/Clarify/Review | étape/page suivante | préconditions différentes | D02,D11 |
| Return to work | Receipt | Work | unique sortie transactionnelle | D01,D02 |

## 9. Frontières anti-duplication

```text
À partager                          À conserver comme variante/donnée
─────────────────────────────────  ─────────────────────────────────────
Drawer shell                       Sections propres à DR01–DR06
Work shell/header/tabs             Contenu de chaque tab
DecisionCard                       Densité Home/Work/Global
DeliverableCard                    Actions Work vs Global non prouvées
PhaseRow                           Interactivité Work non résolue
WhyInline/ConfChip                 Texte et métriques
FilterPill                         Options de chaque domaine
Approved/Rejected layout           Conséquences de chaque décision
```

## 10. Interdictions dérivées

- Ne pas créer un drawer par copie de shell.
- Ne pas dupliquer le header Work dans chaque onglet.
- Ne pas transformer une réutilisation de carte en transition non prouvée.
- Ne pas généraliser Search à des types de résultats absents.
- Ne pas résoudre les variantes visuelles conflictuelles dans cette matrice.
- Ne pas fusionner Search Overlay et Drawer : leurs positions, rôles et fermetures diffèrent.
- Ne pas créer de sous-menu ou drawer imbriqué.

## 11. Sources

Constitution §§5–8 et A01–A30 ; `D01`, `D03`, `D04`, `D06`, `D08`, `D09`, `D10`, `D11`, `D12`, `D16`, `D18`, `D20`; captures `U01–U23` selon la traçabilité.
