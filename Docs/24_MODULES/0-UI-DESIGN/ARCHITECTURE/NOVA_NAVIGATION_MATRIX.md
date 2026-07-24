# NOVA — Navigation Matrix

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Convention :** `Txxx` identifie une transition ; `Dxx` et `Uxx` renvoient au registre de [NOVA_INFORMATION_TRACEABILITY.md](./NOVA_INFORMATION_TRACEABILITY.md). `—` signifie qu'aucune capture du corpus imposé ne valide directement la transition.

## 1. Navigation globale

| ID | Origine | Action | Destination | Type | Contexte | Retour | Source documentaire | Capture de validation | Statut |
|---|---|---|---|---|---|---|---|---|---|
| T001 | App initiale | Chargement | Home | Page | `view=home` | — | Constitution §9 ; D16 ; D18 | — | DOC |
| T002 | NavRail | Home | Home | Page | Remplace `view` | Nav autre | Constitution §3.2 ; D03 ; D11 | U16,U17,U22,U23 | DOC+UX |
| T003 | NavRail | Work | Work actif | Page | Conserve `activeWork` | Nav autre | Constitution §3.2 ; D03 ; D16 | U05–U10,U16–U18,U22,U23 | DOC+UX |
| T004 | NavRail | Decisions | Global Decisions | Page | Remplace `view` | Nav autre | Constitution §3.2 ; D01 ; D03 | — | DOC |
| T005 | NavRail | Deliverables | Global Deliverables | Page | Remplace `view` | Nav autre | Constitution §3.2 ; D01 ; D03 | — | DOC |
| T006 | NavRail | Search | Search Overlay | Overlay | Conserve vue sous-jacente | Escape/backdrop | Constitution §4.5 ; D02 ; D11 | — | DOC |
| T007 | Toute vue avec listener global | Cmd/Ctrl+K | Search Overlay | Overlay clavier | Conserve vue sous-jacente | Escape/backdrop | Constitution §4.5 ; D11 ; D18 | — | DOC |
| T008 | NavRail | Notifications | Destination inconnue | CTA utilitaire | — | — | Constitution A17 ; D03 ; D20 | U16,U17,U22,U23 | ND |
| T009 | NavRail | Help | Destination inconnue | CTA utilitaire | — | — | Constitution A17 ; D03 ; D20 | U16,U17,U22,U23 | ND |
| T010 | NavRail | Settings/Preferences | Destination inconnue | CTA utilitaire | — | — | Constitution A17 ; D03 ; D20 | U16,U17,U22,U23 | ND |
| T011 | NavRail | Profil utilisateur | Destination inconnue | CTA utilitaire | — | — | Constitution A17 ; D03 | U16,U17,U22,U23 | ND |

## 2. Home et Work Setup

| ID | Origine | Action | Destination | Type | Contexte | Retour | Source documentaire | Capture de validation | Statut |
|---|---|---|---|---|---|---|---|---|---|
| T012 | Home Composer replié | Clic | Composer développé | État local | Home conservée | Cancel | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T013 | Home | Clic suggestion | Composer développé prérempli | État local | Objectif mis à jour | Cancel | D02 ; D11 ; D18 | — | DOC |
| T014 | Home Composer développé | Cancel | Composer replié | État local | Valeur selon implémentation documentaire | Clic composer | D02 ; D11 | — | DOC |
| T015 | Home Composer | Continue ou Cmd/Ctrl+Enter avec objectif non vide | Clarify étape 1 | Page/flux | Démarre Work Setup | Back vers Home | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T016 | Home Hero | Open presentation | Work `w1`, Overview | Page | `activeWork=w1` | Nav/Breadcrumb | Constitution §4.2 ; D01 ; D11 | — | DOC |
| T017 | Home Active work | Clic ligne | Work sélectionné | Page | Change `activeWork` | Nav/Breadcrumb | Constitution §4.2 ; D01 ; D11 | — | DOC |
| T018 | Home Decision card | Clic | Decision Package `d1` | Page | Change `activeDecision` | Back to work documenté | Constitution §4.4 ; D01 ; D11 | — | DOC |
| T019 | Home Hero | Why | WhyInline ouvert/fermé | Disclosure | Home conservée | Toggle | D03 ; D11 ; D16 | — | DOC |
| T020 | Home Hero | Details | Home Situation Drawer | Drawer | Home conservée | X/backdrop | Constitution §5.1 ; D10 ; D11 | — | DOC |
| T021 | Home NOVA strip | Details | Home Situation Drawer | Drawer | Home conservée | X/backdrop | Constitution §5.1 ; D10 ; D11 | — | DOC |
| T022 | Clarify étape 1 | Continue/Skip | Clarify étape 2 | Étape locale | Réponses conservées | Back étape 1 | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T023 | Clarify étape 2 | Continue/Skip | Clarify étape 3 | Étape locale | Réponses conservées | Back étape 2 | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T024 | Clarify étape 3 | Continue/Skip | Canvas | Page/flux | Réponses transmises | Back vers Clarify | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T025 | Clarify étape 1 | Back | Home | Page | Quitte Work Setup | Composer | Constitution §4.1 ; D01 ; D11 | — | DOC |
| T026 | Clarify étape 2 ou 3 | Back | Étape précédente | Étape locale | Réponses antérieures conservées | Continue | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T027 | Clarify | Suggestion/texte/Why | État de réponse ou disclosure | État local | Étape conservée | Modification/toggle | D02 ; D11 | — | DOC |
| T028 | Canvas | Edit carte | Carte en édition | État local | Canvas conservé | Save | Constitution §3.1 ; D02 ; D11 | — | DOC |
| T029 | Canvas carte | Save | Carte en lecture | État local | Synthèse mise à jour | Edit | Constitution §3.1 ; D02 ; D11 | — | DOC |
| T030 | Canvas | Back | Clarify | Page/flux | Work Setup conservé | Continue | Constitution §4.1 ; D01 ; D11 | — | DOC |
| T031 | Canvas | Prepare a plan | Plan Setup | Page/flux | Même objectif | Back vers Canvas | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T032 | Plan Setup | Toggle phase | Phase ouverte/repliée | Accordion | Plan conservé | Toggle | Constitution §3.4 ; D02 ; D11 | — | DOC |
| T033 | Plan Setup | Back | Canvas | Page/flux | Même objectif | Prepare a plan | Constitution §4.1 ; D01 | — | DOC |
| T034 | Plan Setup | Review and start | Confirm | Page/flux | Plan conservé | Back vers Plan | Constitution §4.1 ; D02 ; D11 | — | DOC |
| T035 | Confirm | Sélection A0–A3 | Autonomie sélectionnée | État local | Confirm conservé | Nouvelle sélection | Constitution §3.4 ; D02 ; D11 | — | DOC |
| T036 | Confirm | Back | Plan Setup | Page/flux | Même objectif | Review and start | Constitution §4.1 ; D01 ; D11 | — | DOC |
| T037 | Confirm | Start work | Work Overview | Page/fin de flux | Définit `activeWork` | Nav/Breadcrumb | Constitution §4.1 ; D02 ; D11 | — | DOC |

## 3. Work et onglets

| ID | Origine | Action | Destination | Type | Contexte | Retour | Source documentaire | Capture de validation | Statut |
|---|---|---|---|---|---|---|---|---|---|
| T038 | Work Breadcrumb | Work | Home | Page | Quitte Work | Nav Work | Constitution §11 A29 ; D03 | U05–U10,U16–U18,U22,U23 | DOC+UX |
| T039 | Work | Onglet Overview | Work Overview | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U05–U10,U16–U18,U22,U23 | DOC+UX |
| T040 | Work | Onglet Plan | Work Plan | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U05 | DOC+UX |
| T041 | Work | Onglet Activity | Work Activity | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U06–U10 | DOC+UX |
| T042 | Work | Onglet People | Work People | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U15 | DOC+UX |
| T043 | Work | Onglet Sources | Work Sources | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U16,U17 | DOC+UX |
| T044 | Work | Onglet Decisions | Work Decisions | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U18 | DOC+UX |
| T045 | Work | Onglet Deliverables | Work Deliverables | Sous-page | `activeWork` conservé | Autre onglet | Constitution §3.3 ; D01 ; D03 | U22,U23 | DOC+UX |
| T046 | Work Header | ConfChip | Popover confiance | Popover | Work conservé | X | D04 ; D09 ; D16 | U05–U10,U16–U18,U22,U23 | DOC+UX |
| T047 | Work Header | Pause | Effet inconnu | CTA | Work | — | Constitution A16 ; D20 | U05,U16,U17,U18,U23 | ND |
| T048 | Work Header | More | Menu/destination inconnue | CTA/menu | Work | — | Constitution A16 ; D20 | U05,U16,U17,U18,U23 | ND |
| T049 | Work Overview | Open Next Best Action | Destination inconnue | CTA | Work Overview | — | Constitution §4.3 ; D11 ; D20 | — | ND |
| T050 | Work Overview | Why | WhyInline ouvert/fermé | Disclosure | Work Overview | Toggle | Constitution §4.3 ; D11 | — | DOC |
| T051 | Work Overview | Later & Background | Disclosure ouvert/fermé | Disclosure | Work Overview | Toggle | Constitution §4.3 ; D02 ; D11 | — | DOC |
| T052 | Work Overview | Clic décision pending | Decision Package | Page | Change `activeDecision` | Back to work | Constitution §4.4 ; D02 ; D11 | — | DOC |
| T053 | Work Overview | Full analysis | Work Full Analysis Drawer | Drawer | Work Overview conservé | X/backdrop | Constitution §5.1 ; D10 ; D11 | — | DOC |
| T054 | Work Plan | Interaction de phase | Lecture seule ou accordion | État local | Work Plan | — | Constitution A10 ; D03 ; D11 | U05 | CONFLIT |
| T055 | Work Activity | Filtre All/Human/AI/Critical/Sources | Liste filtrée | Filtre local | Work Activity | Autre filtre | Constitution §4.3 ; D02 ; D11 | U06–U10 | DOC+UX |
| T056 | Work Activity | Post comment | Effet inconnu | CTA | Work Activity | — | Constitution A18 ; D02 ; D20 | U06–U10 | ND |
| T057 | Work People | Invite | Effet inconnu | CTA | Work People | — | Constitution A18 ; D20 | U15 | ND |
| T058 | Work People | Details | Person Detail Drawer | Drawer | Person sélectionnée | X/backdrop | Constitution §5.1 ; D02 ; D10 | U11–U15 | DOC+UX |
| T059 | Work Sources | Add | Effet inconnu | CTA | Source/Work | — | Constitution A18 ; D02 ; D20 | U16,U17 | ND |
| T060 | Work Sources | Refresh | Effet inconnu | CTA | Source/Work | — | Constitution A18 ; D02 ; D20 | U17 | ND |
| T061 | Work Sources | Details | Source Detail Drawer | Drawer | Source sélectionnée | X/backdrop | Constitution §5.1 ; D02 ; D10 | U16,U17 | DOC+UX |
| T062 | Work Decisions | Why | WhyInline ouvert/fermé | Disclosure | Décision/Work conservés | Toggle | Constitution §4.3 ; D02 ; D11 | U18 | DOC+UX |
| T063 | Work Decisions | Review & decide | Decision Package | Page | Change `activeDecision` | Back to work | Constitution §4.4 ; D02 ; D11 | U18 | DOC+UX |
| T064 | Work Deliverables | Create | Effet inconnu | CTA | Work Deliverables | — | Constitution A18 ; D20 | U23 | ND |
| T065 | Work Deliverables | Eye | Effet inconnu | CTA | Livrable/Work | — | Constitution A18 ; D02 ; D20 | U23 | ND |
| T066 | Work Deliverables | Details | Deliverable Detail Drawer | Drawer | Livrable sélectionné | X/backdrop | Constitution §5.1 ; D02 ; D10 | U22,U23 | DOC+UX |

## 4. Vues globales, décision et recherche

| ID | Origine | Action | Destination | Type | Contexte | Retour | Source documentaire | Capture de validation | Statut |
|---|---|---|---|---|---|---|---|---|---|
| T067 | Global Decisions | Filtre | Liste filtrée | Filtre local | Vue conservée | Autre filtre | Constitution §3.4 ; D01 ; D03 | — | DOC |
| T068 | Global Decisions | Clic pending/waiting | Decision Package | Page | Change `activeDecision` | Retour d'origine ND | Constitution §4.4 ; D02 ; D11 | — | DOC |
| T069 | Global Decisions | Clic decided | Effet inconnu | CTA/carte | Vue globale | — | Constitution A18 ; D20 | — | ND |
| T070 | Global Deliverables | Filtre | Liste filtrée | Filtre local | Vue conservée | Autre filtre | Constitution §3.4 ; D01 | — | DOC |
| T071 | Global Deliverables | Ligne/action | Effet inconnu | CTA/carte | Vue globale | — | Constitution A12 ; D20 | — | ND |
| T072 | Decision Package | Back to work | Work | Page | `activeWork` existant | Package via décision | Constitution §4.4 ; D01 ; D11 | U04,U20,U21 | DOC+UX |
| T073 | Decision Package | ConfChip | Popover confiance | Popover | Décision conservée | X | D09 ; D16 | U04,U20,U21 | DOC+UX |
| T074 | Decision Package | Why | WhyInline ouvert/fermé | Disclosure | Décision conservée | Toggle | Constitution §4.4 ; D02 ; D11 | U21 | DOC+UX |
| T075 | Decision Package | Sélection option | Option locale sélectionnée | État local | Décision conservée | Autre option | Constitution §4.4 ; D02 ; D11 | U04,U20,U21 | DOC+UX |
| T076 | Decision Package | Full package | Full Package Drawer | Drawer | Décision conservée | X/backdrop | Constitution §5.1 ; D02 ; D10 | U01,U20 | DOC+UX |
| T077 | Decision Package | Review and decide, hero ou bas | Decision Pause Review | Page transactionnelle | `activeDecision` conservée | Cancel/Back | Constitution §4.4 ; D02 ; D11 | U04,U20,U21 | DOC+UX |
| T078 | Decision Pause Review | Cancel/Back | Decision Package | Page | Décision conservée | Review and decide | Constitution §4.4 ; D02 ; D11 | U03 | DOC+UX |
| T079 | Decision Pause Review | I have reviewed — continue | Decision Pause Decide | Étape | Décision conservée | Back vers Review | Constitution §4.4 ; D02 ; D11 | U03 | DOC+UX |
| T080 | Decision Pause Decide | Back | Decision Pause Review | Étape | Saisie selon état local | Continue | Constitution §4.4 ; D02 ; D11 | U02,U19 | DOC+UX |
| T081 | Decision Pause Decide | Sélection choix | Choix local | État local | Étape Decide | Autre choix | Constitution §4.4 ; D02 ; D11 | U02,U19 | DOC+UX |
| T082 | Decision Pause Decide | Saisie rationale | Rationale locale | État local | Étape Decide | Modification | Constitution §4.4 ; D02 ; D11 | U02,U19 | DOC+UX |
| T083 | Decision Pause Decide | Record avec choix+rationale | Decision Receipt après enregistrement | Page transactionnelle | Décision enrichie | Return to work | Constitution §4.4 ; D02 ; D11 | — | DOC |
| T084 | Decision Receipt | Return to work | Work | Page | Réutilise `activeWork` | — | Constitution §4.4 ; D01 ; D02 | — | DOC |
| T085 | Decision Receipt | Share receipt | Effet inconnu | CTA | Receipt | — | Constitution A18 ; D02 ; D20 | — | ND |
| T086 | Decision Receipt | Export | Effet inconnu | CTA | Receipt | — | Constitution A18 ; D01 ; D20 | — | ND |
| T087 | Search Overlay | Saisie de 0–1 caractère | Récents | État local | Vue sous-jacente conservée | Saisie/fermeture | Constitution §4.5 ; D02 ; D11 | — | DOC |
| T088 | Search Overlay | Saisie de 2+ caractères | Résultats Work+Decisions | État local | Vue sous-jacente conservée | Saisie/fermeture | Constitution §4.5 ; D02 ; D11 | — | DOC |
| T089 | Search Overlay | Clic résultat Work | Work sélectionné | Page + fermeture | Change `activeWork` | Nav | Constitution §4.5 ; D02 ; D16 | — | DOC |
| T090 | Search Overlay | Clic résultat Decision | Decision Package sélectionné | Page + fermeture | Change `activeDecision` | Back to work documenté | Constitution §4.5 ; D02 ; D16 | — | DOC |
| T091 | Search Overlay | Escape | Vue sous-jacente | Fermeture overlay | Contexte conservé | Search | Constitution §4.5 ; D11 ; D18 | — | DOC |
| T092 | Search Overlay | Backdrop | Vue sous-jacente | Fermeture overlay | Contexte conservé | Search | Constitution §4.5 ; D02 ; D11 | — | DOC |

## 5. Fermetures et comportements transverses

| ID | Origine | Action | Destination | Type | Contexte | Retour | Source documentaire | Capture de validation | Statut |
|---|---|---|---|---|---|---|---|---|---|
| T093 | Drawer quelconque | X | Parent sous-jacent | Fermeture drawer | Contexte conservé | Trigger initial | Constitution §4.6 ; D10 ; D11 | U11–U14,U16,U20,U22 | DOC+UX |
| T094 | Drawer quelconque | Backdrop | Parent sous-jacent | Fermeture drawer | Contexte conservé | Trigger initial | Constitution §4.6 ; D10 ; D11 | U16,U20,U22 | DOC+UX |
| T095 | Drawer quelconque | Escape | Comportement inconnu | Fermeture potentielle | — | — | Constitution A14 ; D10 | — | ND |
| T096 | Drawer quelconque | Restauration du focus | Comportement inconnu | Accessibilité | — | — | Constitution A14 ; D10 ; D13 | — | ND |
| T097 | ConfChip | X | Écran parent | Fermeture popover | Contexte conservé | Clic ConfChip | Constitution §5.3 ; D09 ; D18 | — | DOC |
| T098 | ConfChip | Clic extérieur | Popover reste ouvert selon checklist | Non-transition | Contexte conservé | X | D09 ; D18 | — | DOC |
| T099 | WhyInline | Toggle | Ouvert/fermé | Disclosure | Contexte conservé | Toggle | Constitution §5.3 ; D09 ; D11 | U21 | DOC+UX |
| T100 | Full Package Drawer | Clic source/personne | Destination inconnue | Lien apparent | Drawer conservé | — | Constitution §5.1 et A15 ; U20 | U20 | ND |

## 6. Contrôles de couverture

- `T001–T100` couvre navigation primaire, Work Setup, les sept onglets Work, les vues globales, le parcours de décision, Search, drawers, popovers, disclosures et CTAs sans destination.
- Les transitions `ND` restent sans destination inventée.
- `T054` conserve explicitement le conflit Work Plan.
- Les conflits structurants `A01–A30` restent régis par la Constitution ; ils sont reproduits dans la matrice de traçabilité.
- Une capture valide un état visuel, jamais à elle seule la destination d'un clic.
