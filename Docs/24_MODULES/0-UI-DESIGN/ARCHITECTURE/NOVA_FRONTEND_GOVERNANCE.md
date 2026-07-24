# NOVA — Frontend Governance

**Statut :** règle officielle de gouvernance frontend dérivée de la Constitution UX

**Mission :** P37-MO-003 — NOVA Domain Documentation & Frontend Governance

**Autorité suprême :** [NOVA_USER_NAVIGATION_ARCHITECTURE.md](./NOVA_USER_NAVIGATION_ARCHITECTURE.md)

## 1. Objet

Ce document définit comment lire, faire évoluer, implémenter et certifier le frontend NOVA sans réinterpréter l'architecture UX. Il ne crée aucun écran, composant, parcours ou comportement.

Sources : Constitution §§1, 11, 12 et 15 ; `NOVA_INFORMATION_TRACEABILITY.md` §§1–7 ; `D18` Implementation Guide ; `D19` Pixel-Perfect Checklist ; `D20` Implementation Matrix.

## 2. Hiérarchie documentaire officielle

L'ordre d'autorité est strict :

1. `NOVA_USER_NAVIGATION_ARCHITECTURE.md` — Constitution UX et autorité de navigation.
2. Les autres documents de `ARCHITECTURE/` — vues spécialisées, matrices et gouvernance.
3. Les documents de `SOURCE/` — spécifications V6.1 et références associées.
4. Les captures de `NOVA-DESIGN-V7/` — validation d'un état visible, jamais preuve autonome d'une destination.
5. Les documents de domaine dans `DOMAINS/` — projections d'implémentation dérivées, jamais autorité supérieure.

Une source de rang inférieur ne peut ni annuler ni corriger silencieusement une source de rang supérieur.

## 3. Documents ARCHITECTURE et responsabilités

| Document | Responsabilité | Interdiction |
|---|---|---|
| `NOVA_USER_NAVIGATION_ARCHITECTURE.md` | Constitution, parcours, écrans, ambiguïtés | Réécriture sans procédure constitutionnelle |
| `NOVA_NAVIGATION_MAP.md` | Vue graphique globale et par domaine | Ajouter un lien absent de la Constitution |
| `NOVA_NAVIGATION_MATRIX.md` | Registre `T001–T100` des transitions | Attribuer une destination à un ND |
| `NOVA_SCREEN_DEPENDENCY_GRAPH.md` | Appelants, appelés, état, données | Déduire une dépendance technique non documentée |
| `NOVA_SHARED_COMPONENTS.md` | Catalogue et consommateurs | Inventer un composant ou résoudre une variante |
| `NOVA_DRAWER_ARCHITECTURE.md` | Six drawers démontrés | Imbriquer des drawers ou créer une route drawer |
| `NOVA_CTA_MATRIX.md` | Registre `C001–C105` | Implémenter un CTA ND comme action réelle |
| `NOVA_REUSE_MATRIX.md` | Frontières anti-duplication | Transformer une réutilisation en navigation |
| `NOVA_INFORMATION_TRACEABILITY.md` | Registres D/U/I/A et provenance | Utiliser une affirmation sans preuve |
| `NOVA_FRONTEND_GOVERNANCE.md` | Règles de changement et certification | Supplanter la Constitution |

Source : documents ARCHITECTURE ; `NOVA_INFORMATION_TRACEABILITY.md` §6.

## 4. Règles de modification

### 4.1 Principe

Toute modification doit être minimale, traçable et limitée au périmètre autorisé de la mission. Les fichiers hors périmètre sont considérés en lecture seule.

### 4.2 Modifications interdites sans autorité explicite

- Modifier la Constitution UX.
- Modifier un document SOURCE ou une capture UX.
- Résoudre un `ND` ou `CONFLIT` par préférence personnelle.
- Ajouter une route, un écran, un sous-écran, un modal, un drawer ou un menu.
- Modifier les Design Tokens pour adapter localement un écran.
- Dupliquer une primitive, une carte, un shell, un drawer ou un layout partagé.
- Introduire une dépendance externe sans mission spécifique.
- Profiter d'une mission locale pour refactorer un autre domaine.

Sources : Constitution §§1, 11, 12 et 15 ; `NOVA_REUSE_MATRIX.md` §§9–10.

### 4.3 Changements autorisés

Un changement est autorisé uniquement si :

1. sa mission nomme explicitement le périmètre ;
2. sa preuve figure dans la hiérarchie documentaire ;
3. ses transitions existent dans la matrice ou sont ajoutées après décision d'autorité ;
4. ses composants existent dans le catalogue ou font l'objet d'une décision tracée ;
5. ses tests et contrôles sont définis avant certification.

## 5. Règles de navigation

1. Toute transition doit posséder un identifiant `Txxx`, une origine, une action, une destination, un contexte, un retour, une source et un statut.
2. Les quatre destinations primaires restent Home, Work, Decisions et Deliverables. [Constitution §3.2]
3. Work reste un contexte à sept tabs partageant `activeWork`, WorkHeader et WorkTabs. [Constitution §3.3]
4. Decision Package reste le point de convergence des décisions démontrées. [Constitution §4.4]
5. Search reste un overlay global limité aux résultats Work et Decisions démontrés. [Constitution §4.5, A19]
6. Un drawer conserve son parent, n'a pas de route propre et ne peut pas imbriquer un autre drawer. [Constitution §§4.6, 5 ; A22]
7. WhyInline, ConfChip, filtres, accordéons et disclosures ne changent pas de page. [Constitution §§3.4, 5.3]
8. Les routes documentées et `setView()` restent en `CONFLIT`; aucune architecture de routing ne peut être canonisée sans décision. [A02/A03]
9. Les retours non définis, notamment l'origine du Decision Package, restent `ND`. [A07]
10. Une capture ne prouve pas qu'un contrôle est cliquable ni où il mène.

## 6. Règles de création d'écrans

La création d'un écran est interdite si l'écran n'existe pas dans la Constitution.

Avant d'implémenter un écran existant :

1. identifier son ID, sa route documentée et son parent ;
2. ouvrir le dossier `DOMAINS/<DOMAIN>/` correspondant ;
3. vérifier sa structure, ses transitions, ses CTA, ses données et ses surfaces ;
4. vérifier les appelants et appelés dans le dependency graph ;
5. relever tous ses `ND` et `CONFLIT` ;
6. établir les tests de navigation et d'accessibilité ;
7. établir la capture UX autorisée pour Pixel Perfect.

Un écran ne peut pas être créé pour donner une destination à Notifications, Help, Preferences, Profile, More, Pause, Create, Eye, Share, Export ou tout autre placeholder sans nouvelle preuve. [A16–A18]

## 7. Règles de création de composants

### 7.1 Recherche de réutilisation obligatoire

Avant tout nouveau composant :

1. consulter `NOVA_SHARED_COMPONENTS.md` ;
2. consulter `NOVA_REUSE_MATRIX.md` ;
3. consulter `D04`, `D09` et `D16` ;
4. rechercher les primitives et patterns déjà consommateurs du même rôle ;
5. documenter pourquoi une variante existante ne suffit pas.

### 7.2 Composants structurants

Les structures suivantes sont uniques et partagées :

- App shell et NavRail ;
- WorkView, WorkHeader et WorkTabs ;
- Drawer, DrawerSection et DrawerRow ;
- SearchOverlay ;
- Card et Btn ;
- NOVALabel, ConfChip, DeadlineBadge et StatusDot ;
- WhyInline ;
- DecisionCard, DeliverableCard, PersonCard, SourceCard et PhaseRow comme familles/patterns documentés.

Source : `NOVA_SHARED_COMPONENTS.md` §§1–4 ; `NOVA_REUSE_MATRIX.md` §§1–8.

### 7.3 Interdictions

- Un composant générique ne contient pas de logique métier d'un domaine.
- Un composant métier ne redéfinit pas un token ou une primitive.
- Un composant ne crée pas de navigation implicite.
- Une variante ne résout pas un conflit de dimensions, typo, couleur ou état.
- Un pattern inline documenté n'est pas présenté comme composant exporté sans preuve technique.

## 8. Règles de réutilisation

1. Réutiliser le shell Drawer pour DR01–DR06 ; seules les données et sections varient.
2. Réutiliser PhaseRow entre Plan Setup et Work Plan sans résoudre A10.
3. Réutiliser DecisionCard entre Home, Work et Global Decisions avec variantes documentées.
4. Réutiliser DeliverableCard entre Work et Global Deliverables sans inventer Global→Drawer.
5. Conserver WorkHeader et WorkTabs dans WorkView, pas dans chaque tab.
6. Conserver SearchOverlay global et unique.
7. Réutiliser les consequence grids, filter pills, badges, chips et disclosures.
8. Documenter toute exception avant implémentation.

Source : `NOVA_REUSE_MATRIX.md` §§2–10.

## 9. Gestion des ND

`ND` signifie que les sources ne permettent pas de conclure.

Règles :

- ne pas compléter la valeur ;
- ne pas choisir une destination par convention ;
- ne pas créer un comportement de secours non documenté ;
- conserver le marqueur dans le domaine, la matrice et les tests ;
- bloquer la partie dépendante si aucune implémentation neutre n'est possible ;
- demander une décision produit/design avec preuve écrite ;
- ajouter la décision au registre de traçabilité avant implémentation.

Une absence de capture Pixel Perfect est `ND` pour la validation UX, même si la structure est `DOC`.

Source : Constitution §§1.1, 11, 15 ; `NOVA_INFORMATION_TRACEABILITY.md` §§1, 5, 7.

## 10. Gestion des CONFLIT

`CONFLIT` signifie que deux autorités donnent des informations incompatibles et qu'aucune priorité interne ne permet de trancher.

Règles :

- conserver toutes les valeurs concurrentes et leurs sources ;
- ne pas fusionner les valeurs ;
- ne pas appliquer la capture la plus récente par supposition ;
- ne pas choisir la valeur la plus facile à implémenter ;
- obtenir une décision explicite de l'autorité produit/design ;
- enregistrer la décision, sa date, son auteur et les documents remplacés ;
- mettre à jour d'abord la Constitution, puis les vues spécialisées, puis les domaines.

Les conflits `A01–A30` restent le registre obligatoire. [NOVA_INFORMATION_TRACEABILITY §5]

## 11. Procédure officielle de changement

```text
Demande de changement
  ↓
Définir périmètre et domaine
  ↓
Identifier preuves D/U/I/T/C/A
  ↓
ND ou CONFLIT ? ── oui → décision autorisée et tracée
  ↓ non / décision acquise
Mettre à jour Constitution si navigation affectée
  ↓
Mettre à jour matrices ARCHITECTURE
  ↓
Mettre à jour documents DOMAINS
  ↓
Implémenter dans le périmètre
  ↓
Tests + accessibilité + Pixel Perfect
  ↓
Audit de diff et certification
```

### 11.1 Contenu minimal d'une décision

- identifiant de changement ;
- domaine et écrans affectés ;
- source d'autorité ;
- anciens et nouveaux comportements ;
- transitions/CTA/composants affectés ;
- ND ou CONFLIT résolu ;
- impact sur réutilisation ;
- tests et captures de validation ;
- approbateur produit/design.

## 12. Gates de certification

### Gate G1 — Autorité

- Constitution lue et inchangée sauf mission explicite.
- Domaine et documents spécialisés identifiés.
- Aucun document de rang inférieur ne contredit silencieusement un rang supérieur.

### Gate G2 — Navigation

- Toutes les transitions correspondent à un `Txxx`.
- Tous les CTA correspondent à un `Cxxx` ou restent explicitement ND.
- Aucun écran, route, drawer, overlay ou submenu nouveau.
- Retours et changements de contexte testés selon la matrice.

### Gate G3 — Composants et réutilisation

- Catalogue partagé consulté.
- Aucun shell, drawer, card ou pattern dupliqué.
- Aucun composant métier dans une primitive générique.
- Aucun token local inventé.

### Gate G4 — Données et état

- Propriétaires d'état conformes aux sources.
- Aucun store/API/cache/persistance supposé.
- `activeWork`, `activeDecision`, tab et états locaux respectés.
- Conservation non documentée maintenue ND.

### Gate G5 — Qualité

- Typecheck PASS.
- Build PASS.
- Tests PASS.
- `git diff --check` PASS.
- Tests navigation et interactions PASS.
- Accessibilité vérifiée selon `D13`.
- Aucune régression hors périmètre.

### Gate G6 — Pixel Perfect

- Tokens, couleurs, typo, layouts, motion et responsive viennent des sources.
- Capture UX correcte identifiée.
- Comparaison visuelle effectuée lorsque la capture existe.
- Absence de capture déclarée ND.
- Conflits visuels non résolus arbitrairement.

### Gate G7 — Traçabilité

- Chaque affirmation, transition et composant possède une preuve.
- Toute nouvelle décision est inscrite dans le registre.
- Les `ND` et `CONFLIT` restants sont listés dans le rapport.
- Le diff ne contient que les fichiers autorisés.

La certification est refusée dès qu'un gate obligatoire échoue.

## 13. Definition of Done frontend NOVA

Une mission frontend est DONE uniquement si :

1. le résultat correspond exactement à un écran/parcours existant ;
2. le périmètre de fichiers est respecté ;
3. la navigation est conforme aux matrices ;
4. aucun CTA ND n'a reçu de comportement inventé ;
5. aucun CONFLIT n'a été arbitrairement tranché ;
6. les composants partagés sont réutilisés ;
7. les données et états suivent leurs propriétaires documentés ;
8. drawers, overlays et disclosures suivent leur architecture ;
9. responsive et accessibilité sont vérifiés ;
10. Pixel Perfect est démontré par la capture autorisée ou déclaré ND ;
11. typecheck, build, tests et diff check passent ;
12. aucune régression ni modification hors périmètre n'est présente ;
13. la traçabilité et les documents de domaine restent cohérents ;
14. le rapport final énonce clairement SUCCESS/FAILURE et READY_FOR_REVIEW/BLOCKED.

## 14. Contrôle des domaines

Chaque domaine officiel contient exactement :

1. `01_DOMAIN_OVERVIEW.md`
2. `02_SCREEN_STRUCTURE.md`
3. `03_NAVIGATION.md`
4. `04_COMPONENTS.md`
5. `05_DRAWERS_AND_OVERLAYS.md`
6. `06_DATA_AND_STATE.md`
7. `07_INTERACTIONS_AND_EVENTS.md`
8. `08_DEPENDENCIES_AND_REUSE.md`
9. `09_VISUAL_AND_PIXEL_PERFECT.md`
10. `10_IMPLEMENTATION_CHECKLIST.md`

Domaines : HOME, CLARIFY, CANVAS, PLAN, CONFIRM, WORK, GLOBAL_DECISIONS, GLOBAL_DELIVERABLES, DECISION_PACKAGE, DECISION_PAUSE, DECISION_RECEIPT, ainsi que WORK/OVERVIEW, PLAN, ACTIVITY, PEOPLE, SOURCES, DECISIONS et DELIVERABLES.

## 15. Sources

- Constitution UX : §§1–15 et `A01–A30`.
- `NOVA_NAVIGATION_MATRIX.md` : `T001–T100`.
- `NOVA_CTA_MATRIX.md` : `C001–C105`.
- `NOVA_INFORMATION_TRACEABILITY.md` : `D01–D22`, `U01–U23`, `I001–I078`, `A01–A30`.
- `NOVA_SHARED_COMPONENTS.md` et `NOVA_REUSE_MATRIX.md`.
- `NOVA_DRAWER_ARCHITECTURE.md` : `DR01–DR06`.
- SOURCE `D05–D14`, `D18–D20` pour qualité, visuel, accessibilité et certification.
