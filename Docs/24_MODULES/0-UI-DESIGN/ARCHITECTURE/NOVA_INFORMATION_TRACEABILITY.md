# NOVA — Information Traceability

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

Ce registre fournit les identifiants de preuve utilisés par tous les documents de P37-MO-002. Une absence de capture n'invalide pas une preuve `DOC`; elle interdit seulement de la qualifier `UX` ou `DOC+UX`.

## 1. Niveaux de preuve

| Niveau | Définition |
|---|---|
| DOC | Affirmation explicite dans un document SOURCE ou dans la Constitution |
| UX | État directement visible dans une capture ; aucune destination de clic déduite |
| DOC+UX | Affirmation documentaire et état visuel concordant |
| ND | Information non déterminée ; aucune conclusion ajoutée |
| CONFLIT | Sources incompatibles sans autorité de résolution |

## 2. Registre documentaire D01–D22

| ID | Fichier source | Sections utilisées | Informations couvertes |
|---|---|---|---|
| D01 | `01_SCREEN_INVENTORY.md.txt` | Screen Hierarchy ; Screens 1–11 ; Workflow Maps | routes, écrans, sections, triggers, workflows |
| D02 | `# 02 — USER FLOW.txt` | Flows 1–16 ; Error/Edge States | enchaînements, retours, préconditions, filtres, décision, Search |
| D03 | `# 03 — INFORMATION ARCHITECTURE.txt` | Top-Level Layout ; NavRail ; Screen Containers ; Overlays ; Data Hierarchy | niveaux, parents, shell, sous-vues, overlays, état global |
| D04 | `# 04 — COMPONENT LIBRARY.txt` | Primitive Components ; Composite Components ; Data Types | noms, rôles, props et consommateurs des composants |
| D05 | `# 05 — DESIGN TOKENS.txt` | tokens, spacing, radii, shadows, z-index, motion | dépendances visuelles ; divergences de valeurs |
| D06 | `# 06 — COLOR SYSTEM.txt` | Semantic Mapping ; Interactive States ; badges/status | états sémantiques des composants |
| D07 | `07_TYPOGRAPHY.md.txt` | inventaire par écran ; drawers ; composants globaux | hiérarchie textuelle et variantes conflictuelles |
| D08 | `# 08 — LAYOUT SYSTEM.txt` | Root/Page Containers ; Work ; Drawer ; Search ; écrans | layouts partagés, niveaux, dimensions conflictuelles |
| D09 | `# 09 — COMPONENT SPECIFICATIONS.txt` | composants NOVALabel à App | états, comportements, structure, fullscreen |
| D10 | `# 10 — DRAWER SPECIFICATIONS.txt` | Overview ; Drawers 1–6 ; Common Specs | parents, triggers, sections, données, fermeture, single stack |
| D11 | `# 11 — INTERACTION SPECIFICATIONS.txt` | Global ; Home ; Setup ; Work ; Decision ; Search | actions, destinations, toggles, placeholders |
| D12 | `# 12 — RESPONSIVE SPECIFICATIONS.txt` | breakpoints et adaptations par composant | continuité responsive ; navigation mobile incomplète |
| D13 | `# 13 — ACCESSIBILITY.txt` | keyboard ; focus ; screen reader ; recommendations | comportements documentés et manques focus/drawer |
| D14 | `# 14 — CSS REFERENCE.txt` | layout/component selectors et états | validation des patterns visuels, aucune route nouvelle |
| D15 | `15_JSX_REFERENCE.md` | document entier | contenu CEREBRAU hors sujet ; aucune preuve NOVA exploitable |
| D16 | `# 16 — REACT COMPONENT TREE.txt` | Definitions ; Runtime Tree ; State Ownership ; Data Flow | arbre consommateurs, état, appels, 4 questions statiques |
| D17 | `# 17 — DEPENDENCY GRAPH.txt` | Internal Dependencies ; Static Data ; Component Graph | dépendances de données/composants |
| D18 | `# 18 — IMPLEMENTATION GUIDE.txt` | Steps 6–11 ; Pitfalls ; View Type ; Checklist | setView, no href, root state, comportements testés |
| D19 | `# 19 — PIXEL-PERFECT CHECKLIST.txt` | Nav ; Work ; Drawers ; Decisions ; Motion ; Search | validation attendue, variations et animation |
| D20 | `# 20 — IMPLEMENTATION MATRIX.txt` | Component/Feature/Interaction matrices ; Placeholder Inventory | couverture, placeholders, conflit fullscreen |
| D21 | `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | Sections 1–23 ; conflits source | synthèse, indisponibilités, conflits non résolus |
| D22 | `HOME_PIXEL_PERFECT_SPEC.txt` | Home structure/interactions/layout | Home, hero, composer, Details ; variations Home |

## 3. Registre UX U01–U23

| ID | Capture | Domaine | Information visuellement validée |
|---|---|---|---|
| U01 | `WORK/DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png` | Decision Drawer | Full Package Drawer isolé, sections et X |
| U02 | `WORK/NOVA-RECORD-YOUR-DECISION-V7.png` | Decision Pause | étape Decide fullscreen, quatre choix, rationale, Back |
| U03 | `WORK/NOVA-REVIEW-DECISION-V7.png` | Decision Pause | étape Review fullscreen, stepper, cards, Continue, Cancel |
| U04 | `WORK/NOVA-REVIEW-V7.png` | Decision Package | NavRail 220, Back to work, hero, options, CTAs |
| U05 | `PLAN/NOVA-WORK-PLAN.png` | Work Plan | shell Work, sept onglets, Plan actif, phases visibles |
| U06 | `Activity/NOVA_ACTIVITY_AI.png` | Activity | filtre AI actif et liste NOVA |
| U07 | `Activity/NOVA_ACTIVITY_SOURCES.png` | Activity | filtre Sources actif |
| U08 | `Activity/NOVA-ACTIVITY_CRITICAL.png` | Activity | filtre Critical actif |
| U09 | `Activity/NOVA-WORK-ACTIVITY_All-V7.png` | Activity | filtre All et événements mixtes |
| U10 | `Activity/NOVA-WORK-ACTIVITY-HUMAN-V7.png` | Activity | filtre Human et événements humains |
| U11 | `People/DRAWER_MARIE_DUPONT_PEOPLE.png` | People Drawer | variante Marie, sections et rows |
| U12 | `People/DRAWER_Thomas_Vidal_People.png` | People Drawer | variante Thomas, pending/trust/expertise |
| U13 | `People/DRAWER-Sarah_Chen_People.png` | People Drawer | variante Sarah, charge/trust/expertise |
| U14 | `People/DRAXER-NOVA-People.png` | People Drawer | variante NOVA, Current reasoning |
| U15 | `People/nova-PEOPLE&EXPERT-V7.png` | Work People | quatre PersonCards, Invite, Details ; shell absent de l'export |
| U16 | `SOURCES/NOVA-SOURCE-DETAIL-V7.png` | Work Sources | Source Drawer sur Work grisé |
| U17 | `SOURCES/NOVA-SOURCE-V7.png` | Work Sources | tab Sources, Add/Refresh/Details, status cards |
| U18 | `DECISIONS/1_NOVA_DESCISIONS.png` | Work Decisions | tab Decisions, Why, Review & decide ; chrome Figma |
| U19 | `DECISIONS/NOVA-DECISION-YOUR-DECISION.png` | Decision Pause | étape Decide ; chrome Figma |
| U20 | `DECISIONS/NOVA-REVIEW-YOUR-DECISION-DECISION-PACKAGE-V7.png` | Decision Package | Full Package Drawer sur Package grisé |
| U21 | `DECISIONS/NOVA-REVIEW-YOUR-DECISION-WHY-V7.png` | Decision Package | WhyInline ouvert |
| U22 | `DELIVBERABLES/NOVA-DELIVERABLES-DETAIL-V7.png` | Work Deliverables | Deliverable Drawer sur Work grisé |
| U23 | `DELIVBERABLES/NOVA-DELIVERABLES-V7.png` | Work Deliverables | tab Deliverables, Create/Eye/Details |

## 4. Matrice des affirmations architecturales

| ID | Information utilisée | Document source et section | Capture | Écran concerné | Preuve |
|---|---|---|---|---|---|
| I001 | Home est le point d'entrée initial | Constitution §9 ; D16 State Ownership ; D18 Root App | — | Home | DOC |
| I002 | Quatre entrées de nav primaire | D01 Screen Hierarchy ; D03 NavRail | U04–U10,U16–U18,U22,U23 | Shell | DOC+UX |
| I003 | Search s'ouvre par nav ou Cmd/Ctrl+K | D02 Flow 16 ; D11 Global ; D18 Root App | — | Global/Search | DOC |
| I004 | Notifications/Help/Preferences/Profile sans destination | Constitution A17 ; D03 NavRail ; D20 placeholders | U16,U17,U22,U23 | Shell | ND |
| I005 | Routes `/home`, setup, Work, globals et décisions | D01 Screen Hierarchy | — | Toutes pages | DOC |
| I006 | Navigation interne `setView()` sans href | D18 Pitfall 9 et View Type | — | App | DOC |
| I007 | Contrat URL/state/historique absent | Constitution A02,A03 ; D01 vs D18 | — | App | CONFLIT/ND |
| I008 | Composer replié/développé | D01 Home ; D02 Flow 1 ; D11 Home | — | Home | DOC |
| I009 | Objectif non vide requis avant Clarify | D02 Flow 1 ; D11 Composer CTA | — | Home | DOC |
| I010 | Hero/active Work ouvrent Work | D01 Home ; D11 Home | — | Home/Work | DOC |
| I011 | Home decision ouvre Package | D01 Home ; D11 Home | — | Home/Package | DOC |
| I012 | Deux Details Home ouvrent le même drawer | D10 Drawer 1 ; D11 Home | — | Home/DR01 | DOC |
| I013 | Work Setup linéaire Home→Clarify→Canvas→Plan→Confirm→Work | D01 Workflow ; D02 Flows 1–5 | — | Setup | DOC |
| I014 | Clarify documenté en trois étapes | D01 Screen 2 ; D02 Flow 2 | — | Clarify | DOC |
| I015 | CLARIFY_QS contient quatre questions | D16 Static Data | — | Clarify | DOC |
| I016 | Contradiction 3/4 Clarify | Constitution A06 ; D01,D02,D16 | — | Clarify | CONFLIT |
| I017 | Canvas edit/save local | D01 Screen 3 ; D02 Flow 3 ; D11 Canvas | — | Canvas | DOC |
| I018 | Plan Setup phase accordion | D02 Flow 4 ; D03 Plan ; D11 Plan | — | Plan Setup | DOC |
| I019 | Confirm sélection A0–A3 | D01 Screen 5 ; D02 Flow 5 | — | Confirm | DOC |
| I020 | Work possède sept onglets ordonnés | D01 Screen 6 ; D03 Work | U05–U10,U16–U18,U22,U23 | Work | DOC+UX |
| I021 | Work conserve activeWork/header/tabs | D03 Work/Data ; D16 State/Data Flow | U05–U10,U16–U18,U22,U23 | Work | DOC+UX |
| I022 | Onglets Work sans sous-routes explicites | Constitution §3.3 ; D16 tab local | — | Work | ND URL |
| I023 | Breadcrumb Work renvoie Home | D03 Work Breadcrumb ; Constitution A29 | U05–U10,U16–U18,U22,U23 | Work | DOC+UX |
| I024 | Pause/More sans effet documenté | D20 Placeholder ; Constitution A16 | U05,U16,U17,U18,U23 | Work | ND |
| I025 | Overview décision ouvre Package | D02 Flow 6 ; D11 Overview | — | Work Overview | DOC |
| I026 | Overview Full analysis ouvre DR02 | D10 Drawer 2 ; D11 Overview | — | Work Overview | DOC |
| I027 | Open Next Action sans destination | D11 Overview ; D20 Placeholder | — | Work Overview | ND |
| I028 | Work Plan lecture seule | D11 Work Plan | U05 | Work Plan | DOC+UX |
| I029 | Work Plan accordion/phases multiples divergent | Constitution A10 ; D03,D11 ; U05 | U05 | Work Plan | CONFLIT |
| I030 | Activity possède cinq filtres locaux | D02 Flow 7 ; D11 Activity | U06–U10 | Work Activity | DOC+UX |
| I031 | Post comment sans effet produit | D02 Flow 7 ; D20 Placeholder | U06–U10 | Work Activity | ND |
| I032 | People Details ouvre Person Drawer | D02 Flow 8 ; D10 Drawer 3 | U11–U15 | Work People | DOC+UX |
| I033 | Invite People sans effet | D20 Placeholder | U15 | Work People | ND |
| I034 | Sources Details ouvre Source Drawer | D02 Flow 9 ; D10 Drawer 4 | U16,U17 | Work Sources | DOC+UX |
| I035 | Add/Refresh Sources sans effet final | D02 Flow 9 ; D20 Placeholder | U17 | Work Sources | ND |
| I036 | Work Decision Review & decide ouvre Package | D02 Flow 10 ; D11 Decisions | U18 | Work Decisions | DOC+UX |
| I037 | Deliverable Details ouvre Drawer depuis Work | D02 Flow 11 ; D10 Drawer 5 | U22,U23 | Work Deliverables | DOC+UX |
| I038 | Create/Eye Deliverable sans destination | D20 Placeholder ; Constitution A18 | U23 | Work Deliverables | ND |
| I039 | Global Decisions existe et filtre quatre états | D01 Screen 7 ; D03 Global Views | — | Global Decisions | DOC |
| I040 | Libellés filtres Decisions divergent | Constitution A11 ; D01 vs D03 | — | Global Decisions | CONFLIT |
| I041 | Pending/waiting ouvre Package | D02 Decision flow ; D11 Global Decisions | — | Global Decisions | DOC |
| I042 | Global Deliverables existe avec quatre filtres | D01 Screen 8 | — | Global Deliverables | DOC |
| I043 | Actions/drawer Global Deliverables non prouvés | Constitution A12 ; D20 | — | Global Deliverables | ND |
| I044 | Captures Deliverables montrent l'onglet Work | Constitution A28 | U22,U23 | Work Deliverables | UX |
| I045 | Package converge depuis 5 origines | Constitution §4.4 ; D01,D02,D16 | U04,U18,U20,U21 | Decision Package | DOC+UX |
| I046 | Package Back renvoie Work | D01 Screen 9 ; D11 Package | U04,U20,U21 | Package/Work | DOC+UX |
| I047 | Retour d'origine Home/Global/Search absent | Constitution A07 ; D01,D11 | — | Decision flow | ND |
| I048 | Option Package locale non requise pour Review | D02 Flow 12 ; D11 Package | U04,U20,U21 | Package | DOC+UX |
| I049 | Full package ouvre DR06 | D02 Flow 12 ; D10 Drawer 6 | U01,U20 | Package/DR06 | DOC+UX |
| I050 | Why Package est inline | D02 Flow 12 ; D11 Package | U21 | Package | DOC+UX |
| I051 | Review→Decide est un flux à deux étapes | D01 Screen 10 ; D02 Flows 13–14 | U02,U03,U19 | Decision Pause | DOC+UX |
| I052 | Decide propose quatre choix | D02 Flow 14 | U02,U19 | Decision Pause | DOC+UX |
| I053 | Record exige choix+rationale | D02 Flow 14 ; D11 Pause | U02,U19 | Decision Pause | DOC+UX |
| I054 | Record mène au Receipt après loading documenté | D02 Flow 14 ; D16 state loading | — | Pause/Receipt | DOC |
| I055 | Receipt retourne Work | D01 Screen 11 ; D02 Flow 15 | — | Receipt/Work | DOC |
| I056 | Share/Export sans effet défini | D02 Flow 15 ; D20 Placeholder | — | Receipt | ND |
| I057 | Pause/Receipt sont fullscreen sans NavRail selon App/captures | D09 App Fullscreen ; D16 tree | U02,U03,U19 | Pause/Receipt | DOC+UX |
| I058 | Matrice indique NavRail sur fullscreen | D20 Component Screen Matrix | — | Pause/Receipt | DOC |
| I059 | Présence NavRail fullscreen contradictoire | Constitution A05 ; D09,D16,D20 | U02,U03,U19 | Pause/Receipt | CONFLIT |
| I060 | Search q<2 récents, q≥2 Work+Decision | D02 Flow 16 ; D03 Search ; D11 Search | — | Search | DOC |
| I061 | Search result change active entity et ferme | D02 Flow 16 ; D16 Data Flow | — | Search/Work/Package | DOC |
| I062 | Search ferme par Escape/backdrop | D02 Flow 16 ; D11 Global/Search | — | Search | DOC |
| I063 | Search autres types non démontrés | Constitution A19 | — | Search | ND |
| I064 | Six familles de drawers | D10 Drawers 1–6 | U01,U11–U17,U20,U22 | Drawers | DOC+UX |
| I065 | Drawer X/backdrop et single stack | D10 Overview/Common ; D11 close | U11–U14,U16,U20,U22 | Drawers | DOC+UX |
| I066 | Drawer Escape/focus non défini | Constitution A14 ; D10,D13 | — | Drawers | ND |
| I067 | Aucun drawer imbriqué | D10 Overview ; Constitution A22 | — | Drawers | DOC |
| I068 | Liens internes drawer sans destination | Constitution A15 ; D10 Drawer 6 | U20 | DR06 | ND |
| I069 | ConfChip popover et Why disclosure restent locaux | D09 ConfChip/Why ; D11 | U21 | Transverse | DOC+UX |
| I070 | Aucun sous-menu en cascade | Constitution A21 ; inventaires D01–D03 | — | Global | DOC absence corpus |
| I071 | Aucune modale métier hors Search | Constitution A20 ; D03 Overlays | — | Global | ND pour toute autre |
| I072 | Responsive ne crée pas de destination | D12 ; Constitution §10 | — | Tous | DOC |
| I073 | Navigation mobile précise non déterminée | Constitution A24 ; D12 | — | Responsive | ND |
| I074 | Layout/composants sont réutilisés | D03,D04,D08,D09,D16 | U05–U23 | Tous | DOC+UX |
| I075 | D15 est hors sujet | D15 entier ; D21 indisponibilités | — | Référentiel | DOC anomalie |
| I076 | Docs V6.1 vs captures V7 | en-têtes D01–D20 ; dossier UX | U01–U23 | Référentiel | CONFLIT |
| I077 | Chrome Figma est un artefact | Constitution §1.2 | U06/U08/U09/U10/U18/U19 selon captures | Activity/Decision | UX artefact |
| I078 | Dossier Deliverables mal orthographié | Constitution A28 ; inventaire filesystem | U22,U23 | Référentiel | UX/fichier |

## 5. Conservation intégrale des ambiguïtés A01–A30

| ID Constitution | Sujet | Provenance | Écrans/documents dérivés concernés | Statut conservé |
|---|---|---|---|---|
| A01 | Docs V6.1 vs captures V7 | Constitution §11 ; D01–D22 ; U01–U23 | Tous | CONFLIT |
| A02 | Routes vs `setView()` | D01,D18 | Map, Matrix, Graph | CONFLIT |
| A03 | Historique/deep links | Absence D01–D20 | Map, Matrix, Graph | ND |
| A04 | NavRail 56 vs 220 | D03,D08,D09,D21 ; U04–U10,U16–U18,U22,U23 | Map, Shared, Reuse | CONFLIT |
| A05 | NavRail sur fullscreen | D09,D16,D20 ; U02,U03,U19 | Map, Graph, Shared | CONFLIT |
| A06 | Clarify 3 vs 4 | D01,D02,D16 | Map, Matrix, Graph, CTA | CONFLIT |
| A07 | Retour Package selon origine | D01,D02,D11 | Map, Matrix, Graph, CTA | ND |
| A08 | Work sans activeWork | D03,D16 | Map, Matrix, Graph, CTA | ND |
| A09 | URL des tabs Work | D01,D16 | Map, Matrix, Graph | ND |
| A10 | Work Plan read-only/accordion | D03,D11 ; U05 | Map, Matrix, Shared, Reuse | CONFLIT |
| A11 | Filtres Global Decisions | D01,D03 | Map, Shared, Reuse | CONFLIT |
| A12 | Global Deliverables incomplet | D01,D03,D20 ; U22,U23 non globales | Map, Matrix, Graph, CTA | ND |
| A13 | Home Drawer sans capture imposée | D10,D11 | Map, Drawer | DOC sans UX |
| A14 | Drawer Escape/focus | D10,D13 | Matrix, Drawer, CTA | ND |
| A15 | Liens de drawers | D10 ; U20 | Matrix, Drawer, CTA | ND |
| A16 | Pause/More | D20 ; U05,U16–U18,U23 | Matrix, Graph, CTA | ND |
| A17 | Utilitaires NavRail | D03,D20 ; U16,U17,U22,U23 | Map, Matrix, CTA | ND |
| A18 | Actions placeholder | D02,D11,D20 | Matrix, Graph, CTA | ND |
| A19 | Types Search limités | D02,D03,D11 | Map, Matrix, Graph | ND |
| A20 | Autres modales | D03 | Map, Drawer | ND |
| A21 | Sous-menus imbriqués | D01–D03 | Map | Absence corpus |
| A22 | Drawers imbriqués | D10 | Map, Drawer | Absence corpus |
| A23 | Auth/permissions/errors | Absence corpus | Map, Graph | ND |
| A24 | Responsive navigation | D12 | Map, Reuse | ND |
| A25 | Dimensions overlays | D08,D09,D10,D21 | Map, Shared, Drawer | CONFLIT |
| A26 | D15 contaminé | D15,D21 | Traceability | Source inexploitable |
| A27 | Chrome Figma | U06,U08,U09,U10,U18,U19 | Map, Traceability | Artefact exclu |
| A28 | `DELIVBERABLES` | U22,U23 et chemin | Map, Traceability | Ambiguïté classement |
| A29 | Breadcrumb Work→Home | D03 ; U05–U10,U16–U18,U22,U23 | Map, Matrix, Graph, CTA | DOC |
| A30 | Conservation état exact | Absence contrat D02,D11,D16 | Matrix, Drawer | ND |

## 6. Traçabilité des livrables P37-MO-002

| Livrable | Registres utilisés | Couverture principale |
|---|---|---|
| `NOVA_NAVIGATION_MAP.md` | I001–I078 ; A01–A30 | représentation graphique et domaines |
| `NOVA_NAVIGATION_MATRIX.md` | T001–T100 reliés à D/U | transitions exhaustives |
| `NOVA_SCREEN_DEPENDENCY_GRAPH.md` | I001–I075 ; D16,D17 | appels, appelants, état et composants |
| `NOVA_SHARED_COMPONENTS.md` | D04,D09,D16 ; I064,I069,I074 | composants, consommateurs, états |
| `NOVA_DRAWER_ARCHITECTURE.md` | D10 ; I012,I026,I032,I034,I037,I049,I064–I068 | six drawers |
| `NOVA_CTA_MATRIX.md` | C001–C105 reliés aux T et D/U | actions, conditions, destinations |
| `NOVA_REUSE_MATRIX.md` | D03,D04,D08–D10,D16 ; I074 | anti-duplication |
| `NOVA_INFORMATION_TRACEABILITY.md` | D01–D22, U01–U23, I001–I078, A01–A30 | provenance complète |

## 7. Règle d'utilisation

Une future mission doit :

1. partir de la Constitution, puis de la vue spécialisée pertinente ;
2. suivre l'identifiant `T`, `C`, `I`, `D` ou `U` jusqu'à sa preuve ;
3. ne jamais convertir un `ND` en comportement sans nouvelle autorité ;
4. ne jamais choisir un côté d'un `CONFLIT` sans décision produit/design tracée ;
5. ajouter toute nouvelle preuve à ce registre avant de modifier une vue spécialisée.
