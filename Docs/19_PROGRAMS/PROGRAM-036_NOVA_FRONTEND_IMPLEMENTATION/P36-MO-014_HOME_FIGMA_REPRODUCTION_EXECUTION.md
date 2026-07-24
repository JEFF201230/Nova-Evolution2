# P36-MO-014 — Home Figma Reproduction — Execution Record

## Mission control

| Field | Value |
|---|---|
| Mission Order | `P36-MO-014-HOME-FIGMA-REPRODUCTION` |
| Program | `PROGRAM-036` |
| Lot | `LOT-004A` |
| Reference | `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/NOVA-HOME-V7.png` |
| Reference dimensions | `1920 × 995` |
| Execution date | `2026-07-16` |
| Certification viewport | `1920 × 1080`, pending |
| Overall status | `IN PROGRESS` |

The browser is not required for implementation. Captures, overlays, pixel diff and final visual certification remain an independent phase.

## MC-001 — Sidebar

### Défauts constatés

- rail déclaré à `160px` au lieu des `176px` de la référence ;
- logo rendu comme une lettre `N` dans un carré de 32 px au lieu du pictogramme étoilé compact ;
- structure verticale non alignée sur la hauteur visible de la référence ;
- utilities non ancrées en bas ;
- avatar et profil trop grands et trop denses ;
- marque, espacements et métriques du wordmark non conformes à la référence observée.

### Capture concernée

`NOVA-HOME-V7.png`, zone `x=0..175`, `y=0..994`. La capture runtime après correction reste à produire.

### Composants concernés

- `AppShell` ;
- `SideNavigation` ;
- `ShellLogo` ;
- zone profil de `NavigationShell`.

### CSS concernés

- `AppShell.module.css` ;
- `SideNavigation.module.css` ;
- `ShellLogo.module.css` ;
- `NavigationShell.module.css`.

### JSX concernés

- `ShellLogo.tsx` ;
- `NavigationShell.tsx`, composition visuelle de la Sidebar uniquement.

### Corrections

- largeur de colonne portée à `176px` ;
- hauteur de composition desktop bornée à la hauteur source `995px`, avec fallback responsive ;
- grille Sidebar séparée en marque et zone de navigation extensible ;
- utilities poussées en bas et profil compact placé après leur groupe ;
- pictogramme NOVA remplacé par un SVG étoilé blanc sur carré violet `20 × 20px` ;
- wordmark, avatar, padding, séparateur et textes du profil densifiés selon la référence.

### Build

`PASS` — Vite, 109 modules transformés.

### Typecheck

`PASS` — `tsc --noEmit`.

### Tests

`PASS` — 14 fichiers, 41 tests.

### Auto-vérification du code

- format Prettier vérifié sur tous les fichiers modifiés ;
- aucune dépendance ajoutée ;
- aucune route, fixture Home, API ou logique métier modifiée ;
- le lint global n'est pas exploitable comme gate dans l'état courant : sa configuration analyse `dist` et ne parse pas TypeScript/TSX. Cette anomalie préexistante n'a pas été corrigée hors périmètre.

### Capture après correction

`PENDING` — navigateur indisponible ; phase de certification visuelle indépendante.

### Delta restant

Les deltas pixel, positions calculées, anticrénelage et états hover restent non mesurés. Aucun constat visuel final n'est formulé.

### Décision

`IMPLEMENTATION COMPLETE — VISUAL CERTIFICATION PENDING`

## MC-002 — Navigation

### Défauts constatés

- icônes Home, Work, Decisions et Deliverables absentes ;
- glyphes texte `⌕`, `•`, `?`, `⚙` différents des icônes V7 ;
- lignes trop hautes et trop espacées ;
- contour périphérique de l'item actif différent de l'accentuation latérale V7 ;
- gap icône–libellé, rayon et métriques typographiques non alignés sur la densité observée.

### Capture concernée

`NOVA-HOME-V7.png`, navigation principale et utilities de la Sidebar. La capture runtime après correction reste à produire.

### Composants concernés

- `NavigationShell` ;
- `NavigationItem` ;
- `NavigationSection`.

### CSS concernés

- `NavigationShell.module.css` ;
- `NavigationItem.module.css` ;
- `NavigationSection.module.css`.

### JSX concernés

- `NavigationShell.tsx` : icônes SVG visuelles et props `icon` ;
- `NavigationShell.test.tsx` : assertions de non-régression du Shell et des huit icônes.

### Corrections

- ajout de huit icônes SVG cohérentes et sans nouvelle dépendance ;
- conservation exacte des quatre routes, liens et handlers ;
- lignes fixées à une hauteur minimale de `30px`, gap de `8px` et icônes `14 × 14px` ;
- état actif converti en fond bleu clair avec accent latéral bleu ;
- suppression des gaps verticaux parasites entre items ;
- focus clavier conservé et distinct.

### Build

`PASS` — Vite, 109 modules transformés.

### Typecheck

`PASS` — `tsc --noEmit`.

### Tests

`PASS` — 14 fichiers, 41 tests. Les tests vérifient les huit icônes, les quatre icônes métier, l'état actif et la navigation existante.

### Auto-vérification du code

- format Prettier vérifié ;
- noms accessibles des liens inchangés ;
- `aria-current` et navigation clavier conservés ;
- aucune fonctionnalité Search, Notifications, Help ou Preferences ajoutée ;
- aucune donnée métier ni dépendance modifiée.

### Capture après correction

`PENDING` — navigateur indisponible ; phase de certification visuelle indépendante.

### Delta restant

Les coordonnées runtime, couleurs calculées, hover, overlay et pixel diff restent à mesurer. La présence du badge Decisions relève de MC-014 et n'a pas été anticipée.

### Décision

`IMPLEMENTATION COMPLETE — VISUAL CERTIFICATION PENDING`

## Next authorized work

MC-003 — Header. Aucune certification visuelle n'est revendiquée pour MC-001 ou MC-002.
