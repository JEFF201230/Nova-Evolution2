# NOVA — CTA Matrix

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

La matrice inclut boutons, liens d'action, cartes cliquables, onglets, filtres, disclosures et commandes clavier. Une destination `ND` est conservée sans invention.

## 1. Shell et Home

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C001 | Home | NavRail | Global | Home | Aucune | Nav autre | NavRail, App view | T002 ; D03,D11 |
| C002 | Work | NavRail | Global | Work actif | activeWork disponible ; cas absent ND | Nav autre | NavRail, App view, WorkView | T003 ; D03,D16 |
| C003 | Decisions | NavRail | Global | Global Decisions | Aucune | Nav autre | NavRail, App view | T004 ; D01,D03 |
| C004 | Deliverables | NavRail | Global | Global Deliverables | Aucune | Nav autre | NavRail, App view | T005 ; D01,D03 |
| C005 | Search | NavRail | Global | Search Overlay | Aucune | Escape/backdrop | NavRail, SearchOverlay | T006 ; D02,D11 |
| C006 | Cmd/Ctrl+K | Global | Toute vue avec listener | Search Overlay | Raccourci clavier | Escape/backdrop | App, SearchOverlay | T007 ; D11,D18 |
| C007 | Notifications | NavRail | Utilitaire | ND | Aucune connue | ND | NavRail | T008 ; Constitution A17 |
| C008 | Help | NavRail | Utilitaire | ND | Aucune connue | ND | NavRail | T009 ; Constitution A17 |
| C009 | Preferences | NavRail | Utilitaire | ND | Aucune connue | ND | NavRail | T010 ; Constitution A17 |
| C010 | User profile | NavRail | Utilitaire | ND | Aucune connue | ND | NavRail | T011 ; Constitution A17 |
| C011 | Composer | Home | Composer replié | Développer | Aucune | Cancel | HomeView, textarea | T012 ; D02,D11 |
| C012 | Suggestion objective | Home | Composer | Préremplir et développer | Suggestion choisie | Cancel | HomeView objective | T013 ; D02,D11 |
| C013 | Cancel composer | Home | Composer développé | Replier | Composer ouvert | Clic composer | HomeView | T014 ; D11 |
| C014 | Continue objective | Home | Composer développé | Clarify 1 | Objectif non vide | Back Home | Btn, HomeView, ClarifyView | T015 ; D02,D11 |
| C015 | Cmd/Ctrl+Enter objective | Home | Composer développé | Clarify 1 | Objectif non vide | Back Home | HomeView, ClarifyView | T015 ; D11 |
| C016 | Open presentation | Home Hero | Situation | Work w1 Overview | Work w1 documenté | Nav/Breadcrumb | Btn, activeWork, WorkView | T016 ; D01,D11 |
| C017 | Why? | Home Hero | Situation | Expansion inline | Aucune | Toggle | WhyInline | T019 ; D03,D11 |
| C018 | Details | Home Hero | Situation | Home Situation Drawer | Aucune | X/backdrop | Drawer shell/content | T020 ; D10,D11 |
| C019 | Active work row | Home | In progress | Work sélectionné | WorkItem id | Nav/Breadcrumb | activeWork, WorkView | T017 ; D01,D11 |
| C020 | Decision card | Home | Urgence | Decision Package | Decision id | Back to work documenté | activeDecision, DecisionPackage | T018 ; D01,D11 |
| C021 | Details | Home NOVA strip | Background | Home Situation Drawer | Aucune | X/backdrop | Drawer shell/content | T021 ; D10,D11 |

## 2. Work Setup

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C022 | Back | Clarify étape 1 | Work Setup | Home | Étape 1 | Composer | ClarifyView, App view | T025 ; D01,D11 |
| C023 | Back | Clarify étape 2/3 | Work Setup | Étape précédente | Étape >1 | Continue | ClarifyView step | T026 ; D02,D11 |
| C024 | Suggestion | Clarify | Question courante | Sélection réponse | Suggestion disponible | Modifier | ClarifyView current | T027 ; D02,D11 |
| C025 | Why does this matter? | Clarify | Question courante | Disclosure | Aucune | Toggle | Why/disclosure | T027 ; D01,D03 |
| C026 | Continue | Clarify | Étape 1/2 | Étape suivante | Réponse selon règles documentées | Back | ClarifyView step | T022,T023 ; D02,D11 |
| C027 | Continue/Submit | Clarify | Dernière étape | Canvas | Dernière étape documentaire | Back Clarify | App view, CanvasView | T024 ; D02,D11 |
| C028 | Skip | Clarify | Étape courante | Étape suivante/Canvas | Aucune | Back | ClarifyView step | T022–T024 ; D02,D11 |
| C029 | Back | Canvas | Work Setup | Clarify | Aucune | Continue | App view, ClarifyView | T030 ; D01,D11 |
| C030 | Edit | Canvas Card | Compréhension | Mode édition | Carte sélectionnée | Save | CanvasView editing, textarea | T028 ; D02,D11 |
| C031 | Save | Canvas Card | Mode édition | Mode lecture | Carte en édition | Edit | CanvasView editing | T029 ; D02,D11 |
| C032 | Prepare a plan | Canvas | Work Setup | Plan Setup | Aucune autre précondition donnée | Back Canvas | App view, PlanView | T031 ; D02,D11 |
| C033 | Back | Plan Setup | Work Setup | Canvas | Aucune | Prepare a plan | App view, CanvasView | T033 ; D01 |
| C034 | Phase toggle | Plan Setup | Phase | Ouvrir/replier | Phase choisie | Toggle | PlanView exp, PhaseRow | T032 ; D02,D11 |
| C035 | Review and start | Plan Setup | Work Setup | Confirm | Plan disponible | Back Plan | App view, ConfirmView | T034 ; D02,D11 |
| C036 | Back | Confirm | Work Setup | Plan Setup | Aucune | Review and start | App view, PlanView | T036 ; D01 |
| C037 | A0/A1/A2/A3 | Confirm | Autonomie | Sélection locale | Niveau disponible | Nouvelle sélection | ConfirmView aut, detail card | T035 ; D02,D11 |
| C038 | Start work | Confirm | Fin Work Setup | Work Overview | Niveau sélectionné par défaut ou utilisateur | Nav/Breadcrumb | activeWork, WorkView | T037 ; D02,D11 |

## 3. Work shell et Overview

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C039 | Work breadcrumb | Work | Header/breadcrumb | Home | Aucune | Nav Work | WorkBreadcrumb, App view | T038 ; D03 |
| C040 | ConfChip | Work Header | Work actif | Popover confiance | Données confiance | X | ConfChip | T046 ; D09,D16 |
| C041 | Pause | Work Header | Work actif | ND | ND | ND | Btn, Work state inconnu | T047 ; Constitution A16 |
| C042 | More | Work Header | Work actif | Menu/destination ND | ND | ND | IconButton, menu inconnu | T048 ; Constitution A16 |
| C043 | Overview | Work tabs | Work actif | Work Overview | Aucune | Autre tab | WorkTabs, WorkView tab | T039 ; D01,D03 |
| C044 | Plan | Work tabs | Work actif | Work Plan | Aucune | Autre tab | WorkTabs, WorkView tab | T040 ; D01,D03 |
| C045 | Activity | Work tabs | Work actif | Work Activity | Aucune | Autre tab | WorkTabs, WorkView tab | T041 ; D01,D03 |
| C046 | People | Work tabs | Work actif | Work People | Aucune | Autre tab | WorkTabs, WorkView tab | T042 ; D01,D03 |
| C047 | Sources | Work tabs | Work actif | Work Sources | Aucune | Autre tab | WorkTabs, WorkView tab | T043 ; D01,D03 |
| C048 | Decisions | Work tabs | Work actif | Work Decisions | Aucune | Autre tab | WorkTabs, WorkView tab | T044 ; D01,D03 |
| C049 | Deliverables | Work tabs | Work actif | Work Deliverables | Aucune | Autre tab | WorkTabs, WorkView tab | T045 ; D01,D03 |
| C050 | Open | Work Overview | Next Best Action | ND | ND | ND | Btn, action data | T049 ; D11,D20 |
| C051 | Why | Work Overview | Next Best Action | Expansion inline | Aucune | Toggle | WhyInline | T050 ; D11 |
| C052 | Later & Background | Work Overview | Actions secondaires | Disclosure | Aucune | Toggle | details/disclosure | T051 ; D02,D11 |
| C053 | Pending decision card | Work Overview | Décision | Decision Package | Decision id | Back to work | activeDecision, DecisionPackage | T052 ; D02,D11 |
| C054 | Full analysis | Work Overview | Progress sidebar | Work Full Analysis Drawer | WorkItem actif | X/backdrop | Drawer, health data | T053 ; D10,D11 |

## 4. Work tabs métiers

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C055 | Phase row | Work Plan | Phase | Lecture seule ou accordion | Phase présente | ND | PhaseRow | T054 ; Constitution A10 |
| C056 | All | Work Activity | Filtres | Tous événements | Aucune | Autre filtre | FilterPill, event list | T055 ; D02,D11 |
| C057 | Human | Work Activity | Filtres | Événements humains | Aucune | Autre filtre | FilterPill, event list | T055 ; U10 |
| C058 | AI | Work Activity | Filtres | Événements NOVA | Aucune | Autre filtre | FilterPill, event list | T055 ; U06 |
| C059 | Critical | Work Activity | Filtres | Événements critiques | Aucune | Autre filtre | FilterPill, event list | T055 ; U08 |
| C060 | Sources | Work Activity | Filtres | Événements sources | Aucune | Autre filtre | FilterPill, event list | T055 ; U07 |
| C061 | Post | Work Activity | Comment composer | ND | Texte éventuel ; règle non fournie | ND | Btn, textarea, events | T056 ; D02,D20 |
| C062 | Invite | Work People | People header | ND | ND | ND | Btn, people data | T057 ; U15 |
| C063 | Details | Work People | PersonCard | Person Drawer | Person sélectionnée | X/backdrop | PersonCard, drawer state | T058 ; D02,D10 |
| C064 | Add | Work Sources | Source/global | ND | ND | ND | Btn, sources | T059 ; D02,D20 |
| C065 | Refresh | Work Sources | Source stale | ND | Source stale visible | ND | Btn, source data | T060 ; D02,D20 |
| C066 | Details | Work Sources | SourceCard | Source Drawer | Source sélectionnée | X/backdrop | SourceCard, drawer state | T061 ; D02,D10 |
| C067 | Why | Work Decisions | DecisionCard | Expansion inline | Aucune | Toggle | WhyInline | T062 ; D02,D11 |
| C068 | Review & decide | Work Decisions | DecisionCard | Decision Package | Decision id | Back to work | activeDecision, DecisionPackage | T063 ; D02,D11 |
| C069 | Create | Work Deliverables | Header | ND | ND | ND | Btn, deliverables | T064 ; U23 |
| C070 | Eye | Work Deliverables | DeliverableCard | ND | Livrable | ND | IconButton, deliverable | T065 ; D20,U23 |
| C071 | Details | Work Deliverables | DeliverableCard | Deliverable Drawer | Livrable sélectionné | X/backdrop | DeliverableCard, drawer state | T066 ; D02,D10 |

## 5. Vues globales et décision

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C072 | Decision filter | Global Decisions | Liste transverse | Liste filtrée | Filtre choisi | Autre filtre | FilterPill/tabs, list | T067 ; D01,D03 |
| C073 | Decision card pending/waiting | Global Decisions | Liste transverse | Decision Package | Decision id et statut cliquable | Retour d'origine ND | activeDecision, DecisionPackage | T068 ; D02,D11 |
| C074 | Decision card decided | Global Decisions | Historique | ND | Statut decided | ND | Card | T069 ; D20 |
| C075 | Deliverable filter | Global Deliverables | Liste transverse | Liste filtrée | Filtre choisi | Autre filtre | Filter tabs, list | T070 ; D01 |
| C076 | Deliverable row/action | Global Deliverables | Liste transverse | ND | Livrable | ND | DeliverableCard | T071 ; Constitution A12 |
| C077 | Back to work | Decision Package | Header | Work | activeWork existant | Decision trigger | App view, WorkView | T072 ; D01,D11 |
| C078 | ConfChip | Decision Package | Hero | Popover confiance | Données confiance | X | ConfChip | T073 ; D09,D16 |
| C079 | Why | Decision Package | Hero | Expansion inline | Aucune | Toggle | WhyInline | T074 ; D02,D11 |
| C080 | Option | Decision Package | Options | Sélection locale | Option disponible | Autre option | OptionButton, sel | T075 ; D02,D11 |
| C081 | Full package | Decision Package | Hero | Full Package Drawer | Décision active | X/backdrop | Drawer, DecisionData | T076 ; D02,D10 |
| C082 | Review and decide hero | Decision Package | Hero | Decision Pause Review | Décision active | Back/Cancel | Btn, App view | T077 ; D02,D11 |
| C083 | Review and decide bottom | Decision Package | Bas page | Decision Pause Review | Décision active | Back/Cancel | Btn, App view | T077 ; D02,D11 |
| C084 | Cancel/Back | Decision Pause Review | Transaction | Decision Package | Review active | Review and decide | Btn/link, App view | T078 ; D02,D11 |
| C085 | I have reviewed — continue | Decision Pause Review | Transaction | Decide | Review active | Back | Btn, step | T079 ; D02,D11 |
| C086 | Back | Decision Pause Decide | Transaction | Review | Decide active | Continue | Btn/link, step | T080 ; D02,D11 |
| C087 | Approve | Decision Pause Decide | Choix | Sélection locale | Aucune | Autre choix | OptionButton, choice | T081 ; D02,U02,U19 |
| C088 | Request changes | Decision Pause Decide | Choix | Sélection locale | Aucune | Autre choix | OptionButton, choice | T081 ; D02,U02,U19 |
| C089 | Reject | Decision Pause Decide | Choix | Sélection locale | Aucune | Autre choix | OptionButton, choice | T081 ; D02,U02,U19 |
| C090 | Defer | Decision Pause Decide | Choix | Sélection locale | Aucune | Autre choix | OptionButton, choice | T081 ; D02,U02,U19 |
| C091 | Record — choice | Decision Pause Decide | Transaction | Decision Receipt | Choix + rationale non vide | Return to work | Btn loading, DecisionData | T083 ; D02,D11 |
| C092 | Return to work | Decision Receipt | Fin transaction | Work | activeWork | — | Btn, App view, WorkView | T084 ; D01,D02 |
| C093 | Share receipt | Decision Receipt | Reçu | ND | Reçu disponible | ND | Btn | T085 ; D02,D20 |
| C094 | Export | Decision Receipt | Reçu | ND | Reçu disponible | ND | Btn | T086 ; D01,D20 |

## 6. Search, drawers et disclosures transverses

| ID | Nom | Écran | Contexte | Destination/effet | Préconditions | Retour | Composants impactés | Source |
|---|---|---|---|---|---|---|---|---|
| C095 | Search result Work | Search Overlay | Résultats | Work sélectionné + close | Résultat Work | Nav/Search | activeWork, WorkView, SearchOverlay | T089 ; D02,D16 |
| C096 | Search result Decision | Search Overlay | Résultats | Decision Package + close | Résultat Decision | Back to work documenté | activeDecision, Package, SearchOverlay | T090 ; D02,D16 |
| C097 | Escape | Search Overlay | Overlay ouvert | Fermer | Overlay ouvert | Search | SearchOverlay | T091 ; D11,D18 |
| C098 | Backdrop | Search Overlay | Overlay ouvert | Fermer | Overlay ouvert | Search | SearchOverlay | T092 ; D02,D11 |
| C099 | X | Drawer | Drawer ouvert | Fermer vers parent | Drawer ouvert | Trigger initial | Drawer onClose | T093 ; D10,D11 |
| C100 | Backdrop | Drawer | Drawer ouvert | Fermer vers parent | Drawer ouvert | Trigger initial | Drawer onClose | T094 ; D10,D11 |
| C101 | Escape | Drawer | Drawer ouvert | ND | ND | ND | Drawer/accessibility | T095 ; Constitution A14 |
| C102 | X | ConfChip | Popover ouvert | Fermer | Popover ouvert | Trigger | ConfChip | T097 ; D09,D18 |
| C103 | Clic extérieur | ConfChip | Popover ouvert | Reste ouvert selon checklist | Popover ouvert | X | ConfChip | T098 ; D09,D18 |
| C104 | Why toggle | Tout WhyInline | Disclosure | Ouvrir/fermer | Aucune | Toggle | WhyInline | T099 ; D09,D11 |
| C105 | Source/expert apparent | Full Package Drawer | Key evidence | ND | Élément affiché | ND | Drawer content | T100 ; Constitution A15 |

## 7. Contrôle

- Les CTA `C001–C105` renvoient aux transitions `T001–T100` lorsque celles-ci existent.
- Les quatre choix de décision sont inventoriés séparément.
- Les deux emplacements Review and decide sont inventoriés séparément mais convergent vers la même transition démontrée.
- Les actions placeholder restent `ND`.
- Les préconditions absentes des sources restent `ND`; aucune validation n'est ajoutée par supposition.
