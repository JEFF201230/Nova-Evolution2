# NOVA — Drawer Architecture

**Autorité de navigation :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

**Autorité de contenu drawer :** `D10 — DRAWER SPECIFICATIONS`, sous réserve des conflits conservés par la Constitution.

## 1. Architecture commune

```text
Écran parent
└── Drawer open
    ├── Backdrop plein écran
    └── Panel droit
        ├── Header
        │   ├── Title
        │   └── Close X
        └── Body scrollable
            └── DrawerSection × N
                ├── paragraphe / alert list / action list / tags
                └── DrawerRow × N
```

| Propriété | Règle démontrée | Preuve | Statut |
|---|---|---|---|
| Position | Overlay à droite avec backdrop | D03,D08,D09,D10 ; U16,U20,U22 | DOC+UX |
| Empilement | Un seul drawer ; aucun nesting | Constitution §4.6 ; D10 | DOC |
| Contexte | Parent visible et conservé sous backdrop | Constitution §5 ; U16,U20,U22 | DOC+UX |
| Fermeture | X ou clic backdrop | D10,D11 ; U11–U14,U16,U20,U22 | DOC+UX |
| Escape | Non défini pour les drawers V6.1 | Constitution A14 | ND |
| Focus return/trap | Non défini | Constitution A14 ; D13 | ND |
| Scroll | Body du panel indépendant | D08,D09,D10 | DOC |
| Animation | Aucune dans D10, note d'ajout possible ; autres sources divergent | D10,D11,D19 | CONFLIT |
| Largeur/paddings | Plusieurs valeurs documentées | Constitution A25 ; D08,D09,D10,D21 | CONFLIT |
| Route | Aucune route propre démontrée | Constitution §5 ; D16 | DOC |

## 2. Matrice des drawers

| ID | Drawer | Parent | Déclencheur | Retour | Fermeture | Écrans utilisateurs | Validation UX |
|---|---|---|---|---|---|---|---|
| DR01 | Home Situation Details | Home | Details du hero ou du NOVA strip | Home même état | X/backdrop ; Escape/focus ND | Home | — |
| DR02 | Work Full Analysis | Work Overview | Full analysis de la sidebar Progress | Work Overview | X/backdrop ; Escape/focus ND | Work Overview | — |
| DR03 | Person Detail | Work People | Details d'une PersonCard | Work People, même personne/Work | X/backdrop ; Escape/focus ND | Work People | U11–U15 |
| DR04 | Source Detail | Work Sources | Details d'une SourceCard | Work Sources, même source/Work | X/backdrop ; Escape/focus ND | Work Sources | U16,U17 |
| DR05 | Deliverable Detail | Work Deliverables | Details d'une DeliverableCard | Work Deliverables, même livrable/Work | X/backdrop ; Escape/focus ND | Work Deliverables | U22,U23 |
| DR06 | Full Package | Decision Package | Full package dans le hero | Decision Package, même décision | X/backdrop ; Escape/focus ND | Decision Package | U01,U20 |

Global Deliverables n'est pas ajouté comme consommateur de DR05 : la carte est partagée, mais cette transition n'est pas démontrée. Les liens de sources/experts dans DR06 n'appellent aucun drawer secondaire prouvé.

## 3. DR01 — Home Situation Details

| Champ | Définition |
|---|---|
| Parent | Home |
| Déclencheurs | Details du hero ; Details du NOVA background strip |
| État/dépendance | `HomeView.detailOpen: boolean`; WORK_ITEMS agrégés |
| Titre | Situation details |
| Composants | Drawer, DrawerSection, DrawerRow, paragraphes, AlertTriangle list, action rows |
| Retour | Home sans changement de route démontré |
| Preuve | D10 Drawer 1 ; D11 Home interactions ; Constitution §5.1 |

Sections et données :

1. **Summary** — priorité board presentation, complétion, blocages, gain de confiance.
2. **Why it matters** — dépendance CFO et échéance du board.
3. **What is blocking** — trois alertes : commentaires revenue, CRM Pipeline Export manquant, Product Roadmap obsolète.
4. **Later actions** — concaténation `laterActions` et `backgroundActions` des WorkItems.
5. **Technical details** — documents analysés, sources validées, temps gagné, conflits détectés.

Validation UX imposée : aucune capture Home/Situation dans les sept dossiers de la mission. Le contenu est `DOC`, sans validation `UX` dans ce corpus.

## 4. DR02 — Work Full Analysis

| Champ | Définition |
|---|---|
| Parent | Work Overview, sidebar Progress |
| Déclencheur | Full analysis |
| État/dépendance | `WorkOverviewTab.detailOpen: boolean`; WorkItem et métriques santé |
| Titre | Full analysis |
| Composants | Drawer, DrawerSection, alert list, health bars, history rows |
| Retour | Work Overview, même `activeWork` |
| Preuve | D10 Drawer 2 ; D11 Work Overview ; Constitution §5.1 |

Sections et données :

1. **Summary** — statut, contexte de blocage, estimation.
2. **Why it matters** — dépendance CFO et chemin critique.
3. **What is blocking** — commentaires revenue, CRM export, Product Roadmap conflict.
4. **Key evidence** — Planning, Budget, Risks, Sources, Decisions, Documentation, Team.
5. **History** — actions et impacts : CRM, roadmap, CFO package, consistency check.
6. **Technical details** — source quality, expert validation, coverage, freshness, consistency.

Validation UX : aucune capture dédiée dans les dossiers imposés. Statut `DOC`.

## 5. DR03 — Person Detail

| Champ | Définition |
|---|---|
| Parent | Work People |
| Déclencheur | Details sur une personne |
| État/dépendance | `WorkPeopleTab.drawer: PersonData ou null` |
| Titre | `person.name` |
| Composants | Drawer, DrawerSection, DrawerRow, expertise tags, NOVA reasoning conditionnel |
| Retour | Work People, personne et Work conservés |
| Preuve | D10 Drawer 3 ; U11–U15 |

Sections et données :

1. **Summary** — contribution, requêtes en attente, response time ; texte différent humain/NOVA.
2. **Why it matters** — validations et sign-off humain, ou rôle de validation cross-source de NOVA.
3. **Current reasoning** — uniquement si `person.novaState` n'est pas nul.
4. **Key evidence** — availability, workload, response time, docs reviewed, validations, trust score conditionnel.
5. **Technical details** — expertise tags.

Variantes UX validées : Sarah Chen `U13`, Thomas Vidal `U12`, Marie Dupont `U11`, NOVA `U14`. La vue People `U15` prouve le trigger Details, mais exporte le contenu sans shell Work visible.

## 6. DR04 — Source Detail

| Champ | Définition |
|---|---|
| Parent | Work Sources |
| Déclencheur | Details sur une source |
| État/dépendance | `WorkSourcesTab.drawer: SourceData ou null` |
| Titre | `source.name` |
| Composants | Drawer, DrawerSection, DrawerRow, valeurs de confiance |
| Retour | Work Sources, source et Work conservés |
| Preuve | D10 Drawer 4 ; U16,U17 |

Sections et données :

1. **Summary** — évaluation NOVA `aiComment`.
2. **Why it matters** — décisions supportées, livrables référents, ou absence de référence.
3. **Key evidence** — type, quality score, reliability, evidence score, conflicts.
4. **History** — last verified, freshness, usage.

La capture `U16` valide le drawer sur le contexte Work Sources grisé. Aucun clic vers une décision ou un livrable depuis le drawer n'est démontré.

## 7. DR05 — Deliverable Detail

| Champ | Définition |
|---|---|
| Parent | Work Deliverables uniquement démontré |
| Déclencheur | Details sur un livrable |
| État/dépendance | `WorkDeliverablesTab.drawer: DeliverableData ou null` |
| Titre | `deliverable.name` |
| Composants | Drawer, DrawerSection, DrawerRow, alerts, history rows |
| Retour | Work Deliverables, livrable et Work conservés |
| Preuve | D10 Drawer 5 ; U22,U23 |

Sections et données :

1. **Summary** — `aiSummary`.
2. **Why it matters** — audience, publication score, readiness avec seuil documentaire de 70.
3. **What is blocking** — items `missingInfo`.
4. **Key evidence** — evidence coverage, completeness, publication score, pending comments, outstanding reviews.
5. **History** — version, date, note.
6. **Technical details** — generated by, reviewed by, validated by, format, audience.

`U22` valide le drawer avec Work Deliverables sous backdrop. Global Deliverables comme parent reste `ND`.

## 8. DR06 — Full Package

| Champ | Définition |
|---|---|
| Parent | Decision Package |
| Déclencheur | Full package |
| État/dépendance | `DecisionPackageView.detailOpen: boolean`; activeDecision |
| Titre | Decision package |
| Composants | Drawer, DrawerSection, DrawerRow, source-like links, expert list |
| Retour | Decision Package, décision et option locale conservées selon comportement non contractualisé |
| Preuve | D10 Drawer 6 ; U01,U20 |

Sections et données :

1. **Summary** — recommendation + rationale.
2. **Why it matters** — business impact.
3. **What is blocking** — uncertainty et dissent conditionnels.
4. **Key evidence** — financial impact, risk impact, liste de sources.
5. **Technical details** — experts consulted, si présents.

Les sources apparaissent comme liens colorés dans `U20`, mais aucune destination n'est définie. Elles ne doivent pas ouvrir DR04 sans nouvelle preuve.

## 9. Matrice des composants de contenu

| Composant/pattern | DR01 | DR02 | DR03 | DR04 | DR05 | DR06 |
|---|---:|---:|---:|---:|---:|---:|
| Drawer shell/header/body | ● | ● | ● | ● | ● | ● |
| DrawerSection | ● | ● | ● | ● | ● | ● |
| DrawerRow | ● | métriques | ● | ● | ● | ● |
| Summary paragraph | ● | ● | ● | ● | ● | ● |
| Why it matters | ● | ● | ● | ● | ● | ● |
| What is blocking | ● | ● | — | — | ● | ● |
| Key evidence | — | ● | ● | ● | ● | ● |
| History | — | ● | — | ● | ● | — |
| Later actions | ● | — | — | — | — | — |
| Current reasoning | — | — | NOVA seulement | — | — | — |
| Technical details | ● | ● | ● | — dans D10 | ● | conditionnel |
| Alert list | ● | ● | — | — | ● | uncertainty/dissent |
| Health/progress rows | — | ● | — | — | valeurs | — |
| Tags | — | — | ● | — | — | — |

## 10. Fermeture et conservation

| Action | Résultat canonique | Statut |
|---|---|---|
| X | Ferme le drawer et révèle le parent | DOC+UX |
| Backdrop | Ferme le drawer et révèle le parent | DOC+UX |
| Escape | Non défini | ND |
| Retour focus au trigger | Non défini | ND |
| Ouvrir un second drawer | Interdit par le modèle single drawer ; aucun cas démontré | DOC |
| Changer de route à la fermeture | Aucun changement démontré | DOC |
| Conserver scroll/filtres/disclosures exacts | Non contractualisé | ND |

## 11. Sources

Constitution §§4.6, 5, 6 et A13–A15/A25/A30 ; `D03`, `D04`, `D08`, `D09`, `D10`, `D11`, `D13`, `D16`, `D18`, `D19`, `D20`, `D21`; `U01`, `U11–U17`, `U20`, `U22–U23`.
