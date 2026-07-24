# PROGRAM-036 — LOT 004A — HOME PIXEL PERFECT DEFECT REGISTER

## 1. Contrôle

| Champ | Valeur |
|---|---|
| Mission ID | `P36-MO-011-HOME-PIXEL-PERFECT-DEFECT-REGISTER` |
| Type | Audit / defect registration |
| Phase | PHASE 1 — Inventaire statique |
| Statut | `NON CERTIFIABLE — PHASE 2 REQUISE` |
| Référence | `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/NOVA-HOME-V7.png` |
| Code corrigé | Aucun |
| Défauts | 144 défauts élémentaires |

## 2. Sources consultées

- Home V7 officielle : image native 1920×995, utilisée à échelle 1:1 ;
- JSX et CSS de `apps/nova-web/src/components/shell/` ;
- JSX et CSS de `apps/nova-web/src/features/home/` ;
- composants Surface, Card, Section, PageContainer, Badge et Button ;
- `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` ;
- `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` ;
- `NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md` ;
- `P36_LOT_004A_HOME_PIXEL_PERFECT_PROGRAM.md`.

Aucune capture runtime officielle 1920×1080 n’est disponible en Phase 1. `CONFIRMÉ` signifie que l’écart est démontré directement par la structure JSX/CSS et la référence V7. `À MESURER` signifie qu’un écart potentiel élémentaire est enregistré, mais que sa confirmation, sa correction ou sa suppression exige la Phase 2. Aucun défaut `À MESURER` ne peut autoriser une correction avant validation métrique.

## 3. Registre des défauts élémentaires

### DEF-001

**Titre**  
Top bar présente sur Home

**Description**  
`NavigationShell` fournit toujours `<TopBar>` à `AppShell`, alors que Home V7 ne comporte aucune barre supérieure.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`TopBar`

**Fichier**  
`NavigationShell.tsx`, `AppShell.tsx`

**Nature**  
Présence/absence

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-001

**Validation**  
Aucun nœud TopBar visible sur Home et hauteur calculée du slot égale à 0 px.

**Etat**  
CONFIRMÉ

### DEF-002

**Titre**  
Logo NOVA dupliqué dans la top bar

**Description**  
Le JSX rend `ShellLogo` dans la Sidebar et une seconde fois dans la TopBar ; V7 ne montre qu’un logo dans la Sidebar.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`TopBar`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Présence/absence

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Une seule occurrence visible du logo NOVA, dans la Sidebar.

**Etat**  
CONFIRMÉ

### DEF-003

**Titre**  
Libellé PRIMARY absent de V7

**Description**  
Le heading `Primary` est rendu par le code mais n’existe pas sur Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationSection`

**Fichier**  
`NavigationShell.tsx`, `NavigationSection.tsx`

**Nature**  
Contenu parasite

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Le texte `PRIMARY` est absent de la capture après correction.

**Etat**  
CONFIRMÉ

### DEF-004

**Titre**  
Texte Structure only absent de V7

**Description**  
La description `Structure only.` est rendue dans la navigation mais absente de V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationSection`

**Fichier**  
`NavigationShell.tsx`, `NavigationSection.tsx`

**Nature**  
Contenu parasite

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Le texte `Structure only.` est absent du DOM visible et de la capture.

**Etat**  
CONFIRMÉ

### DEF-005

**Titre**  
Libellé UTILITIES absent de V7

**Description**  
Le heading `Utilities` est rendu par le code mais n’existe pas sur Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationSection`

**Fichier**  
`NavigationShell.tsx`, `NavigationSection.tsx`

**Nature**  
Contenu parasite

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Le texte `UTILITIES` est absent de la capture.

**Etat**  
CONFIRMÉ

### DEF-006

**Titre**  
Texte Source-only shell utilities absent de V7

**Description**  
La description `Source-only shell utilities.` est visible dans NOVA et absente de V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationSection`

**Fichier**  
`NavigationShell.tsx`, `NavigationSection.tsx`

**Nature**  
Contenu parasite

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Le texte technique est absent du DOM visible et de la capture.

**Etat**  
CONFIRMÉ

### DEF-007

**Titre**  
Rôle utilisateur non conforme

**Description**  
NOVA affiche `Program owner` tandis que Home V7 affiche `Standard`.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Contenu

**Priorité**  
MAJOR

**Mini-Projet**  
MC-001

**Validation**  
Le rôle visible est exactement `Standard`.

**Etat**  
CONFIRMÉ

### DEF-008

**Titre**  
Décalage vertical induit par la top bar

**Description**  
La grille `frame` réserve une ligne `auto` à la TopBar ; V7 commence le contenu sans cette ligne.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`AppShell.module.css`, `TopBar.module.css`

**Nature**  
Position

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-001

**Validation**  
Le premier repère Home possède la coordonnée verticale V7 et aucun espace de TopBar n’est réservé.

**Etat**  
CONFIRMÉ

### DEF-009

**Titre**  
Largeur Sidebar non conforme

**Description**  
Le CSS déclare `grid-template-columns: 160px 1fr`; la référence V7 mesure 176 px.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Sidebar`

**Fichier**  
`AppShell.module.css`

**Nature**  
Dimension

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-002

**Validation**  
`getBoundingClientRect().width` de la Sidebar vaut 176 px.

**Etat**  
CONFIRMÉ

### DEF-010

**Titre**  
Hauteur Sidebar à valider

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur totale de la Sidebar entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Sidebar`

**Fichier**  
`AppShell.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la hauteur totale de la Sidebar sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-011

**Titre**  
Padding supérieur Sidebar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding supérieur de la navigation entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`SideNavigation`

**Fichier**  
`SideNavigation.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le padding supérieur de la navigation sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-012

**Titre**  
Padding gauche Sidebar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding gauche de la navigation entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`SideNavigation`

**Fichier**  
`SideNavigation.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le padding gauche de la navigation sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-013

**Titre**  
Padding droit Sidebar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding droit de la navigation entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`SideNavigation`

**Fichier**  
`SideNavigation.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le padding droit de la navigation sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-014

**Titre**  
Padding inférieur Sidebar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding inférieur de la navigation entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`SideNavigation`

**Fichier**  
`SideNavigation.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le padding inférieur de la navigation sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-015

**Titre**  
Pictogramme logo non conforme

**Description**  
NOVA rend la lettre `N` dans un carré en gradient ; V7 montre un pictogramme étoilé blanc dans un carré violet.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.tsx`, `ShellLogo.module.css`

**Nature**  
Forme

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Le pictogramme, sa forme et son fond correspondent pixel par pixel à V7.

**Etat**  
CONFIRMÉ

### DEF-016

**Titre**  
Largeur du mark logo

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la largeur du carré logo entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la largeur du carré logo sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-017

**Titre**  
Hauteur du mark logo

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur du carré logo entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la hauteur du carré logo sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-018

**Titre**  
Rayon du mark logo

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon du carré logo entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le rayon du carré logo sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-019

**Titre**  
Position X du logo

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X du logo entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la coordonnée X du logo sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-020

**Titre**  
Position Y du logo

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du logo entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la coordonnée Y du logo sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-021

**Titre**  
Gap mark–wordmark

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’espace horizontal entre pictogramme et texte NOVA entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer l’espace horizontal entre pictogramme et texte NOVA sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-022

**Titre**  
Taille du wordmark NOVA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du wordmark entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la taille de police du wordmark sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-023

**Titre**  
Graisse du wordmark NOVA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la graisse du wordmark entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ShellLogo`

**Fichier**  
`ShellLogo.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la graisse du wordmark sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-024

**Titre**  
Hauteur des lignes principales

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de chaque ligne Home/Work/Decisions/Deliverables entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la hauteur de chaque ligne Home/Work/Decisions/Deliverables sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-025

**Titre**  
Padding horizontal des lignes

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding horizontal de chaque ligne de navigation entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le padding horizontal de chaque ligne de navigation sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-026

**Titre**  
Gap entre lignes principales

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’intervalle vertical entre lignes principales entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationSection`

**Fichier**  
`NavigationSection.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer l’intervalle vertical entre lignes principales sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-027

**Titre**  
Rayon de l’item actif

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon de l’item Home actif entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le rayon de l’item Home actif sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-028

**Titre**  
Bordure périphérique de l’item actif

**Description**  
NOVA applique une bordure sur tout le périmètre de l’item actif ; V7 utilise une accentuation latérale et un fond sans ce contour périphérique équivalent.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Bordure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Le contour actif reproduit exactement la bordure visible de V7.

**Etat**  
CONFIRMÉ

### DEF-029

**Titre**  
Fond de l’item actif

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la couleur calculée du fond Home actif entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Couleur

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la couleur calculée du fond Home actif sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-030

**Titre**  
Icône Home absente

**Description**  
L’entrée Home ne reçoit aucune prop `icon`; V7 affiche une icône maison.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Une icône Home conforme V7 est visible et correctement alignée.

**Etat**  
CONFIRMÉ

### DEF-031

**Titre**  
Icône Work absente

**Description**  
L’entrée Work ne reçoit aucune icône; V7 affiche une mallette.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Une icône Work conforme V7 est visible.

**Etat**  
CONFIRMÉ

### DEF-032

**Titre**  
Icône Decisions absente

**Description**  
L’entrée Decisions ne reçoit aucune icône; V7 affiche une balance.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Une icône Decisions conforme V7 est visible.

**Etat**  
CONFIRMÉ

### DEF-033

**Titre**  
Icône Deliverables absente

**Description**  
L’entrée Deliverables ne reçoit aucune icône; V7 affiche un document.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Une icône Deliverables conforme V7 est visible.

**Etat**  
CONFIRMÉ

### DEF-034

**Titre**  
Glyph Search non conforme

**Description**  
NOVA emploie le caractère `⌕`; V7 affiche une icône de recherche tracée.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
L’icône Search correspond à la forme, taille et stroke V7.

**Etat**  
CONFIRMÉ

### DEF-035

**Titre**  
Glyph Notifications non conforme

**Description**  
NOVA emploie le caractère `•`; V7 affiche une cloche.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
L’icône Notifications correspond à V7.

**Etat**  
CONFIRMÉ

### DEF-036

**Titre**  
Glyph Help non conforme

**Description**  
NOVA emploie `?`; V7 affiche une icône Help cerclée.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
L’icône Help correspond à V7.

**Etat**  
CONFIRMÉ

### DEF-037

**Titre**  
Glyph Preferences non conforme

**Description**  
NOVA emploie le caractère `⚙`; V7 utilise une icône de réglages cohérente avec le set.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationShell.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
L’icône Preferences correspond à V7.

**Etat**  
CONFIRMÉ

### DEF-038

**Titre**  
Utilities non ancrées en bas

**Description**  
`.sideNavigation` et `.sections` sont des grilles de contenu sans distribution vers le bas ; V7 place les utilities au bas du rail.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`SideNavigation`

**Fichier**  
`SideNavigation.module.css`

**Nature**  
Alignement

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-002

**Validation**  
Le groupe Search–Preferences possède les coordonnées Y de V7 et reste ancré au bas.

**Etat**  
CONFIRMÉ

### DEF-039

**Titre**  
Espacement icône–libellé

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le gap horizontal entre chaque icône et son libellé entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le gap horizontal entre chaque icône et son libellé sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-040

**Titre**  
Séparateur du profil

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la position, largeur, couleur et épaisseur du séparateur profil entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Bordure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la position, largeur, couleur et épaisseur du séparateur profil sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-041

**Titre**  
Taille de l’avatar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la largeur et la hauteur de l’avatar entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la largeur et la hauteur de l’avatar sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-042

**Titre**  
Padding du profil

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paddings haut/droit/bas/gauche du profil entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer les paddings haut/droit/bas/gauche du profil sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-043

**Titre**  
Marge basse du profil

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la distance entre le profil et le bord inférieur entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la distance entre le profil et le bord inférieur sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-044

**Titre**  
Taille du nom Sarah Chen

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du nom entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la taille de police du nom sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-045

**Titre**  
Taille du rôle Standard

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du rôle entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`UserProfile`

**Fichier**  
`NavigationShell.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer la taille de police du rôle sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-046

**Titre**  
Hover des items Sidebar

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le fond, la bordure et la couleur de l’état hover entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NavigationItem`

**Fichier**  
`NavigationItem.module.css`

**Nature**  
Interaction

**Priorité**  
MINOR

**Mini-Projet**  
MC-002

**Validation**  
Phase 2 : mesurer le fond, la bordure et la couleur de l’état hover sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-047

**Titre**  
Largeur maximale Home excessive

**Description**  
NOVA déclare `--n-home-max-width: 880px`; la colonne dominante V7 mesure 620 px.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PageContainer`

**Fichier**  
`PageContainer.module.css`

**Nature**  
Dimension

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-003

**Validation**  
La largeur visible de la colonne et de ses cartes vaut 620 px.

**Etat**  
CONFIRMÉ

### DEF-048

**Titre**  
Padding horizontal PageContainer superflu

**Description**  
Le conteneur ajoute 16 px de chaque côté, produisant une largeur utile différente de V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PageContainer`

**Fichier**  
`PageContainer.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Les bords de `.page` et des cartes coïncident avec x=738 et x=1358.

**Etat**  
CONFIRMÉ

### DEF-049

**Titre**  
Axe gauche de la colonne Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X gauche de la colonne Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer la coordonnée X gauche de la colonne Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-050

**Titre**  
Axe droit de la colonne Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X droite de la colonne Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer la coordonnée X droite de la colonne Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-051

**Titre**  
Centrage horizontal de Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le centre horizontal de la colonne Home dans la zone principale entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`HomePage.module.css`

**Nature**  
Centrage

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer le centre horizontal de la colonne Home dans la zone principale sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-052

**Titre**  
Padding supérieur ContentArea

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding supérieur du contenu entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ContentArea`

**Fichier**  
`ContentArea.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer le padding supérieur du contenu sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-053

**Titre**  
Padding gauche ContentArea

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding gauche du contenu entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ContentArea`

**Fichier**  
`ContentArea.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer le padding gauche du contenu sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-054

**Titre**  
Gap global uniforme inadapté

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les intervalles verticaux successifs entre zones Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer les intervalles verticaux successifs entre zones Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-055

**Titre**  
Position verticale globale Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du premier contenu Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer la coordonnée Y du premier contenu Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-056

**Titre**  
Chaîne de centrage imbriquée

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’alignement résultant ContentViewport → ContentArea → PageContainer → page entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ContentViewport`

**Fichier**  
`ContentViewport.module.css`, `ContentArea.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-003

**Validation**  
Phase 2 : mesurer l’alignement résultant ContentViewport → ContentArea → PageContainer → page sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-057

**Titre**  
Position X Home Header

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X du Home Header entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la coordonnée X du Home Header sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-058

**Titre**  
Position Y Home Header

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du Home Header entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la coordonnée Y du Home Header sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-059

**Titre**  
Taille du greeting

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du greeting entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la taille de police du greeting sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-060

**Titre**  
Graisse du greeting

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la graisse du greeting entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la graisse du greeting sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-061

**Titre**  
Line-height du greeting

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de ligne du greeting entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la hauteur de ligne du greeting sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-062

**Titre**  
Gap greeting–summary

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’espace vertical greeting–summary entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer l’espace vertical greeting–summary sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-063

**Titre**  
Couleur du summary

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la couleur calculée du summary entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomeHeader`

**Fichier**  
`HomePage.module.css`

**Nature**  
Couleur

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la couleur calculée du summary sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-064

**Titre**  
Position Y Objective Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du composer entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la coordonnée Y du composer sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-065

**Titre**  
Hauteur Objective Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur du rectangle principal du composer entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la hauteur du rectangle principal du composer sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-066

**Titre**  
Padding Objective Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paddings du rectangle principal entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer les paddings du rectangle principal sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-067

**Titre**  
Icône Composer non conforme

**Description**  
NOVA rend le caractère `✦` sur un carré en gradient ; V7 montre une petite icône bleue dans un fond bleu très clair.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`ObjectiveComposer.tsx`, `HomePage.module.css`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
L’icône, son fond et son container correspondent à V7.

**Etat**  
CONFIRMÉ

### DEF-068

**Titre**  
Taille du container icône Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la largeur et la hauteur du container icône entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la largeur et la hauteur du container icône sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-069

**Titre**  
Taille du titre Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du titre Composer entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la taille de police du titre Composer sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-070

**Titre**  
Contraste de la description Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la couleur et l’opacité de la description entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la couleur et l’opacité de la description sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-071

**Titre**  
Suggestions placées dans la Card

**Description**  
Le JSX place `composerFooter` à l’intérieur de `Card`; V7 place `Try` et les suggestions sous le rectangle principal.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`ObjectiveComposer.tsx`

**Nature**  
Structure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-004

**Validation**  
Le groupe Try/suggestions est hors du rectangle du composer aux coordonnées V7.

**Etat**  
CONFIRMÉ

### DEF-072

**Titre**  
Hauteur des chips Composer

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de chaque chip de suggestion entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`, `Badge.module.css`

**Nature**  
Dimension

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer la hauteur de chaque chip de suggestion sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-073

**Titre**  
Padding horizontal des chips

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding horizontal de chaque chip entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`, `Badge.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer le padding horizontal de chaque chip sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-074

**Titre**  
Gap entre chips

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’intervalle horizontal et vertical entre chips entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ObjectiveComposer`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-004

**Validation**  
Phase 2 : mesurer l’intervalle horizontal et vertical entre chips sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-075

**Titre**  
Position Y Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y de Priority Insight entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la coordonnée Y de Priority Insight sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-076

**Titre**  
Hauteur Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de Priority Insight entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la hauteur de Priority Insight sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-077

**Titre**  
Padding Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paddings du bloc entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer les paddings du bloc sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-078

**Titre**  
Rayon Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon du bloc entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer le rayon du bloc sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-079

**Titre**  
Bordure Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’épaisseur et la couleur de bordure entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Bordure

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer l’épaisseur et la couleur de bordure sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-080

**Titre**  
Ombre Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paramètres d’ombre du bloc entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Ombre

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer les paramètres d’ombre du bloc sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-081

**Titre**  
Gradient Priority Insight

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les couleurs et l’angle du fond entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PriorityInsight`

**Fichier**  
`HomePage.module.css`

**Nature**  
Fond

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer les couleurs et l’angle du fond sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-082

**Titre**  
Dimensions badge NOVA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur et le padding du badge NOVA entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`, `Badge.module.css`

**Nature**  
Dimension

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la hauteur et le padding du badge NOVA sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-083

**Titre**  
Situation now rendue comme badge action

**Description**  
NOVA rend `Situation · now` dans un composant Badge; V7 l’affiche comme texte secondaire simple après le badge NOVA.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`NextBestAction.tsx`

**Nature**  
Structure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
`Situation · now` est visuellement un texte secondaire conforme V7, sans capsule action.

**Etat**  
CONFIRMÉ

### DEF-084

**Titre**  
Taille du texte d’introduction

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de `heroSummary` entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la taille de `heroSummary` sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-085

**Titre**  
Contraste du texte d’introduction

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la couleur/opacité de `heroSummary` entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`

**Nature**  
Couleur

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la couleur/opacité de `heroSummary` sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-086

**Titre**  
Taille du titre principal NBA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de `heroGain` entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la taille de `heroGain` sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-087

**Titre**  
Line-height du titre principal NBA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de ligne de `heroGain` entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la hauteur de ligne de `heroGain` sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-088

**Titre**  
Wrapping du titre principal NBA

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les points de retour à la ligne du titre entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`HomePage.module.css`

**Nature**  
Texte

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer les points de retour à la ligne du titre sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-089

**Titre**  
Hauteur CTA Open presentation

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur du CTA primaire entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`Button.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer la hauteur du CTA primaire sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-090

**Titre**  
Padding CTA Open presentation

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding horizontal du CTA entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`Button.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-005

**Validation**  
Phase 2 : mesurer le padding horizontal du CTA sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-091

**Titre**  
Why rendu comme bouton de 40 px

**Description**  
`Why?` utilise le composant Button taille md; V7 présente un lien textuel compact.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`NextBestAction.tsx`, `Button.module.css`

**Nature**  
Structure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
`Why?` possède la géométrie et le style de lien V7.

**Etat**  
CONFIRMÉ

### DEF-092

**Titre**  
Details regroupé avec les boutons

**Description**  
Le JSX place `Details` dans `heroActions` avec CTA et Why; V7 l’aligne à l’extrémité droite du bloc.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NextBestAction`

**Fichier**  
`NextBestAction.tsx`, `Button.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-005

**Validation**  
Le bord droit de Details coïncide avec l’axe V7.

**Etat**  
CONFIRMÉ

### DEF-093

**Titre**  
Position Y Decision Card

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y de la Decision Card entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la coordonnée Y de la Decision Card sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-094

**Titre**  
Hauteur Decision Card

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de la Decision Card entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la hauteur de la Decision Card sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-095

**Titre**  
Padding Decision Card

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paddings de la carte entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer les paddings de la carte sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-096

**Titre**  
Rayon Decision Card

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon de la carte entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer le rayon de la carte sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-097

**Titre**  
Épaisseur bordure rouge gauche

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’épaisseur de l’accent rouge entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Bordure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer l’épaisseur de l’accent rouge sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-098

**Titre**  
Ombre Decision Card

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paramètres d’ombre entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Ombre

**Priorité**  
MINOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer les paramètres d’ombre sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-099

**Titre**  
Icône décision absente

**Description**  
Le JSX ne rend aucun container d’icône, tandis que V7 affiche une icône balance à gauche.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`PendingDecisionCard.tsx`

**Nature**  
Icône

**Priorité**  
MAJOR

**Mini-Projet**  
MC-006

**Validation**  
L’icône décision et son fond correspondent à V7.

**Etat**  
CONFIRMÉ

### DEF-100

**Titre**  
Hauteur badge Due

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur du badge d’échéance entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`Badge.module.css`, `HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MINOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la hauteur du badge d’échéance sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-101

**Titre**  
Hauteur indicateur Confidence

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de la présentation confidence entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`Badge.module.css`, `HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MINOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la hauteur de la présentation confidence sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-102

**Titre**  
Alignement horizontal des badges

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’axe et l’intervalle entre Due et confidence entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer l’axe et l’intervalle entre Due et confidence sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-103

**Titre**  
Densité du titre décision

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille, graisse et line-height du titre entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la taille, graisse et line-height du titre sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-104

**Titre**  
Densité du texte conséquence

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille, line-height et couleur de la conséquence entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-006

**Validation**  
Phase 2 : mesurer la taille, line-height et couleur de la conséquence sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-105

**Titre**  
Bouton Open decision absent de V7

**Description**  
NOVA rend un bouton secondaire textuel `Open decision`; V7 n’affiche aucun bouton textuel dans cette carte.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`PendingDecisionCard.tsx`

**Nature**  
Présence/absence

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-006

**Validation**  
Aucun bouton textuel `Open decision` n’est visible.

**Etat**  
CONFIRMÉ

### DEF-106

**Titre**  
Flèche de navigation droite manquante

**Description**  
V7 affiche une flèche à droite; le JSX actuel n’en rend aucune.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`PendingDecisionCard`

**Fichier**  
`PendingDecisionCard.tsx`

**Nature**  
Présence/absence

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-006

**Validation**  
Une flèche conforme V7 est visible à droite avec le même handler accessible.

**Etat**  
CONFIRMÉ

### DEF-107

**Titre**  
Position Y du label ACTIVE WORK

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du label de section entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkSection`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la coordonnée Y du label de section sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-108

**Titre**  
Taille du label ACTIVE WORK

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police du label entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkSection`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la taille de police du label sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-109

**Titre**  
Hauteur Active Work ligne 1

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de la première ligne entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la hauteur de la première ligne sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-110

**Titre**  
Hauteur Active Work ligne 2

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de la deuxième ligne entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la hauteur de la deuxième ligne sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-111

**Titre**  
Hauteur Active Work ligne 3

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de la troisième ligne entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la hauteur de la troisième ligne sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-112

**Titre**  
Gap lignes 1–2

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’intervalle vertical entre lignes 1 et 2 entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer l’intervalle vertical entre lignes 1 et 2 sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-113

**Titre**  
Gap lignes 2–3

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’intervalle vertical entre lignes 2 et 3 entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer l’intervalle vertical entre lignes 2 et 3 sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-114

**Titre**  
Padding horizontal des lignes

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le padding horizontal des trois lignes entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer le padding horizontal des trois lignes sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-115

**Titre**  
Rayon des lignes Active Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon des trois lignes entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer le rayon des trois lignes sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-116

**Titre**  
Bordure des lignes Active Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’épaisseur et la couleur des bordures entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Bordure

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer l’épaisseur et la couleur des bordures sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-117

**Titre**  
Indicateurs gauche uniformes

**Description**  
Le CSS applique le même `border-medium` aux trois points; V7 distingue notamment le deuxième indicateur en vert.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`ActiveWorkCard.tsx`, `HomePage.module.css`

**Nature**  
Indicateur

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Chaque indicateur possède la couleur et la forme de sa ligne V7.

**Etat**  
CONFIRMÉ

### DEF-118

**Titre**  
Taille titres Active Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille de police des titres entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la taille de police des titres sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-119

**Titre**  
Contraste textes secondaires Active Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la couleur/opacité des descriptions entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Couleur

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la couleur/opacité des descriptions sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-120

**Titre**  
Confidence rendue en Badge

**Description**  
Chaque score utilise un Badge à fond coloré; V7 affiche un score et son libellé sous forme de texte compact sans capsule équivalente.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`ActiveWorkCard.tsx`, `Badge.module.css`

**Nature**  
Structure

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Les trois confidences reproduisent la présentation textuelle V7.

**Etat**  
CONFIRMÉ

### DEF-121

**Titre**  
Axe des scores confidence

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X commune des scores entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la coordonnée X commune des scores sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-122

**Titre**  
Axe des dates

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X commune des dates entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer la coordonnée X commune des dates sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-123

**Titre**  
Gap score–date

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’intervalle horizontal score–date entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer l’intervalle horizontal score–date sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-124

**Titre**  
Hover Active Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de border, shadow et translation de l’état hover entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`ActiveWorkCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Interaction

**Priorité**  
MINOR

**Mini-Projet**  
MC-007

**Validation**  
Phase 2 : mesurer border, shadow et translation de l’état hover sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-125

**Titre**  
Position Y Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée Y du bandeau entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Position

**Priorité**  
MAJOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer la coordonnée Y du bandeau sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-126

**Titre**  
Hauteur du bandeau Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur du bandeau entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Dimension

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer la hauteur du bandeau sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-127

**Titre**  
Padding du bandeau Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de les paddings du bandeau entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Espacement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer les paddings du bandeau sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-128

**Titre**  
Rayon Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon du bandeau entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer le rayon du bandeau sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-129

**Titre**  
Bordure Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’épaisseur et la couleur de bordure entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Bordure

**Priorité**  
MINOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer l’épaisseur et la couleur de bordure sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-130

**Titre**  
Densité du résumé Background Work

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la taille, line-height et wrapping du résumé entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer la taille, line-height et wrapping du résumé sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-131

**Titre**  
Alignement de Details Background

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la coordonnée X et la baseline de Details entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`NovaSuggestionCard`

**Fichier**  
`HomePage.module.css`

**Nature**  
Alignement

**Priorité**  
MAJOR

**Mini-Projet**  
MC-008

**Validation**  
Phase 2 : mesurer la coordonnée X et la baseline de Details sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-132

**Titre**  
Items secondaires visibles sous Background Work

**Description**  
Le JSX rend deux `BackgroundWorkItem` sous le bandeau; Home V7 ne montre aucun item secondaire à ce niveau.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`BackgroundWorkSection`

**Fichier**  
`BackgroundWorkSection.tsx`

**Nature**  
Présence/absence

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-008

**Validation**  
Zéro `BackgroundWorkItem` visible au premier niveau de Home.

**Etat**  
CONFIRMÉ

### DEF-133

**Titre**  
Bloc CRM source reconciliation absent de V7

**Description**  
Le bloc `CRM source reconciliation` est visible dans NOVA mais absent de Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`BackgroundWorkItem`

**Fichier**  
`BackgroundWorkItem.tsx`

**Nature**  
Présence/absence

**Priorité**  
MAJOR

**Mini-Projet**  
MC-008

**Validation**  
Le bloc n’est pas visible sur Home.

**Etat**  
CONFIRMÉ

### DEF-134

**Titre**  
Bloc Open comment review absent de V7

**Description**  
Le bloc `Open comment review` est visible dans NOVA mais absent de Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`BackgroundWorkItem`

**Fichier**  
`BackgroundWorkItem.tsx`

**Nature**  
Présence/absence

**Priorité**  
MAJOR

**Mini-Projet**  
MC-008

**Validation**  
Le bloc n’est pas visible sur Home.

**Etat**  
CONFIRMÉ

### DEF-135

**Titre**  
Police Inter réellement utilisée

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la famille de police calculée pour Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`globals.css`, `designTokens.css`

**Nature**  
Typographie

**Priorité**  
MAJOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer la famille de police calculée pour Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-136

**Titre**  
Line-height global du body

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de ligne héritée du body entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`globals.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer la hauteur de ligne héritée du body sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-137

**Titre**  
Graisse globale des badges Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la graisse calculée des badges visibles entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Badge`

**Fichier**  
`Badge.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer la graisse calculée des badges visibles sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-138

**Titre**  
Line-height global des badges Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la hauteur de ligne calculée des badges entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Badge`

**Fichier**  
`Badge.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer la hauteur de ligne calculée des badges sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-139

**Titre**  
Graisse globale des boutons Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de la graisse calculée des boutons entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Button`

**Fichier**  
`Button.module.css`

**Nature**  
Typographie

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer la graisse calculée des boutons sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-140

**Titre**  
Rayon global des boutons Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon calculé des boutons Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Button`

**Fichier**  
`Button.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer le rayon calculé des boutons Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-141

**Titre**  
Rayon générique Surface appliqué à Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de le rayon effectif de chaque Surface Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Surface`

**Fichier**  
`Surface.module.css`

**Nature**  
Rayon

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer le rayon effectif de chaque Surface Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-142

**Titre**  
Ombre générique Surface appliquée à Home

**Description**  
La Phase 1 ne démontre pas l’égalité métrique de l’ombre effective de chaque Surface Home entre le rendu NOVA et Home V7.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`Surface`

**Fichier**  
`Surface.module.css`

**Nature**  
Ombre

**Priorité**  
MINOR

**Mini-Projet**  
MC-009

**Validation**  
Phase 2 : mesurer l’ombre effective de chaque Surface Home sur la capture runtime 1920×1080 et la référence V7 à échelle 1:1 ; égalité à ±1 px ou valeur visuelle exacte requise.

**Etat**  
À MESURER

### DEF-143

**Titre**  
Overlay global non produit

**Description**  
Aucun overlay entre la capture runtime officielle 1920×1080 et Home V7 n’est disponible en Phase 1.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`Aucun fichier de code`

**Nature**  
Preuve

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-010

**Validation**  
Phase 2 : produire overlay 50 %, diff absolu et heatmap sur le masque comparable ; aucun écart bloquant ou majeur.

**Etat**  
À MESURER

### DEF-144

**Titre**  
Baseline Home non certifiable

**Description**  
Le registre statique ne peut pas certifier les métriques ni le rendu final sans capture runtime officielle.

**Capture concernée**  
Home V7 officielle + état statique NOVA Phase 1 ; capture runtime 1920×1080 requise pour toute entrée `À MESURER`.

**Composant**  
`HomePage`

**Fichier**  
`Aucun fichier de code`

**Nature**  
Certification

**Priorité**  
CRITICAL

**Mini-Projet**  
MC-010

**Validation**  
Tous les défauts À MESURER sont confirmés, corrigés ou supprimés et les dix mini-chantiers satisfont les Gates.

**Etat**  
À MESURER

## 4. Statistiques

| Indicateur | Nombre |
|---|---:|
| Total | 144 |
| CRITICAL | 17 |
| MAJOR | 78 |
| MINOR | 49 |
| CONFIRMÉ | 35 |
| À MESURER | 109 |

### Répartition par mini-chantier

| Mini-chantier | Défauts |
|---|---:|
| `MC-001` | 8 |
| `MC-002` | 38 |
| `MC-003` | 10 |
| `MC-004` | 18 |
| `MC-005` | 18 |
| `MC-006` | 14 |
| `MC-007` | 18 |
| `MC-008` | 10 |
| `MC-009` | 8 |
| `MC-010` | 2 |

### Répartition par composant

| Composant | Défauts |
|---|---:|
| `ActiveWorkCard` | 16 |
| `ActiveWorkSection` | 2 |
| `BackgroundWorkItem` | 2 |
| `BackgroundWorkSection` | 1 |
| `Badge` | 2 |
| `Button` | 2 |
| `ContentArea` | 2 |
| `ContentViewport` | 1 |
| `HomeHeader` | 7 |
| `HomePage` | 10 |
| `NavigationItem` | 15 |
| `NavigationSection` | 5 |
| `NextBestAction` | 11 |
| `NovaSuggestionCard` | 7 |
| `ObjectiveComposer` | 11 |
| `PageContainer` | 2 |
| `PendingDecisionCard` | 14 |
| `PriorityInsight` | 7 |
| `ShellLogo` | 9 |
| `Sidebar` | 2 |
| `SideNavigation` | 5 |
| `Surface` | 2 |
| `TopBar` | 2 |
| `UserProfile` | 7 |

### Répartition par fichier

Un défaut peut citer plusieurs fichiers potentiellement concernés ; cette table compte les citations de fichiers.

| Fichier | Citations |
|---|---:|
| `ActiveWorkCard.tsx` | 2 |
| `AppShell.module.css` | 3 |
| `AppShell.tsx` | 1 |
| `Aucun fichier de code` | 2 |
| `BackgroundWorkItem.tsx` | 2 |
| `BackgroundWorkSection.tsx` | 1 |
| `Badge.module.css` | 8 |
| `Button.module.css` | 6 |
| `ContentArea.module.css` | 3 |
| `ContentViewport.module.css` | 1 |
| `designTokens.css` | 1 |
| `globals.css` | 2 |
| `HomePage.module.css` | 70 |
| `NavigationItem.module.css` | 7 |
| `NavigationSection.module.css` | 1 |
| `NavigationSection.tsx` | 4 |
| `NavigationShell.module.css` | 6 |
| `NavigationShell.tsx` | 15 |
| `NextBestAction.tsx` | 3 |
| `ObjectiveComposer.tsx` | 2 |
| `PageContainer.module.css` | 2 |
| `PendingDecisionCard.tsx` | 3 |
| `ShellLogo.module.css` | 9 |
| `ShellLogo.tsx` | 1 |
| `SideNavigation.module.css` | 5 |
| `Surface.module.css` | 2 |
| `TopBar.module.css` | 1 |

## 5. Séquence de traitement

Les plages sont continues et exclusives :

- MC-001 : DEF-001 à DEF-008
- MC-002 : DEF-009 à DEF-046
- MC-003 : DEF-047 à DEF-056
- MC-004 : DEF-057 à DEF-074
- MC-005 : DEF-075 à DEF-092
- MC-006 : DEF-093 à DEF-106
- MC-007 : DEF-107 à DEF-124
- MC-008 : DEF-125 à DEF-134
- MC-009 : DEF-135 à DEF-142
- MC-010 : DEF-143 à DEF-144

Aucun mini-chantier ne peut traiter un défaut rattaché à un autre mini-chantier. MC-001 est le premier mini-chantier autorisé, sous réserve d’un Mission Order conforme au programme.

## 6. Phase 2 obligatoire

La Phase 2 exige un navigateur ou une capture runtime officielle 1920×1080. Pour chaque défaut `À MESURER`, elle doit enregistrer la mesure NOVA, la mesure V7, le delta, la preuve et une décision : `CONFIRMÉ`, `CORRIGÉ` ou `SUPPRIMÉ`. Les entrées `CONFIRMÉ` de Phase 1 doivent également être vérifiées sur la capture runtime.

Le registre devient `CERTIFIABLE` uniquement lorsque toutes les entrées sont clôturées, que l’overlay global est produit et que MC-010 satisfait les Gates du programme.

