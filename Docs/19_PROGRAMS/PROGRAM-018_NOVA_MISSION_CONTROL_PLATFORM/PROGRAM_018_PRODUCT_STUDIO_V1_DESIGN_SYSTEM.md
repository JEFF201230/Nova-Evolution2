# PROGRAM-018 Product Studio V1 — Design System MVP

## Status

COMPLETE — FIGMA-READY FOUNDATION

## 1. Principles

NOVA is calm, explicit and outcome-led. Neutral surfaces dominate; color communicates action or meaning, never AI identity. Components reveal complexity progressively, preserve human authority and expose provenance at the point of consequence. Public labels avoid internal governance vocabulary.

## 2. Figma Variables and Token Naming

Use collections `Primitive`, `Semantic`, `Component`, modes `Light`, `Dark`, `High Contrast`, and naming `category/role/state`. Components consume semantic tokens only.

### 2.1 Color primitives

| Token | Value |
| --- | --- |
| `neutral/0` | `#FFFFFF` |
| `neutral/25` | `#FCFCFD` |
| `neutral/50` | `#F8FAFC` |
| `neutral/100` | `#F1F5F9` |
| `neutral/200` | `#E2E8F0` |
| `neutral/300` | `#CBD5E1` |
| `neutral/500` | `#64748B` |
| `neutral/600` | `#475569` |
| `neutral/700` | `#334155` |
| `neutral/800` | `#1E293B` |
| `neutral/900` | `#0F172A` |
| `neutral/950` | `#020617` |
| `blue/50` | `#EFF6FF` |
| `blue/100` | `#DBEAFE` |
| `blue/600` | `#2563EB` |
| `blue/700` | `#1D4ED8` |
| `blue/800` | `#1E40AF` |
| `green/50` | `#F0FDF4` |
| `green/700` | `#15803D` |
| `green/800` | `#166534` |
| `amber/50` | `#FFFBEB` |
| `amber/700` | `#B45309` |
| `amber/800` | `#92400E` |
| `red/50` | `#FEF2F2` |
| `red/700` | `#B91C1C` |
| `red/800` | `#991B1B` |
| `violet/50` | `#F5F3FF` |
| `violet/700` | `#6D28D9` |

### 2.2 Light semantic colors

| Token | Value / use |
| --- | --- |
| `bg/canvas` | `neutral/50` |
| `bg/surface` | `neutral/0` |
| `bg/subtle` | `neutral/100` |
| `text/primary` | `neutral/900` |
| `text/secondary` | `neutral/600` |
| `text/disabled` | `neutral/500` (not for essential low-contrast text) |
| `border/default` | `neutral/300` |
| `border/strong` | `neutral/500` |
| `action/primary` | `blue/700` |
| `action/primary-hover` | `blue/800` |
| `action/on-primary` | `neutral/0` |
| `focus/ring` | `blue/600`, 3 px plus 2 px white offset |
| `status/info-bg` / `status/info` | `blue/50` / `blue/800` |
| `status/success-bg` / `status/success` | `green/50` / `green/800` |
| `status/warning-bg` / `status/warning` | `amber/50` / `amber/800` |
| `status/critical-bg` / `status/critical` | `red/50` / `red/800` |
| `knowledge/innovation-bg` / `knowledge/innovation` | `violet/50` / `violet/700` |

Verified normal-text pairs: `#0F172A/#FFFFFF` 17.85:1; `#475569/#FFFFFF` 7.58:1; `#FFFFFF/#1D4ED8` 6.70:1; `#1E40AF/#EFF6FF` 8.59:1; `#166534/#F0FDF4` 7.12:1; `#92400E/#FFFBEB` 7.06:1; `#991B1B/#FEF2F2` 8.29:1. Interactive borders and focus indicators SHALL meet 3:1 against adjacent colors. High Contrast mode uses `#000000` text/border on `#FFFFFF`, action `#0000CC`, and 3 px outlines.

Dark mode maps canvas `#020617`, surface `#0F172A`, subtle `#1E293B`, primary text `#F8FAFC`, secondary `#CBD5E1`, border `#475569`, primary action `#60A5FA` with dark on-action text `#0F172A`. Contrast SHALL be checked in Figma before release.

## 3. Typography

Font family: `Inter`, fallback `system-ui, -apple-system, "Segoe UI", sans-serif`. IDs/code: `Roboto Mono`, fallback monospace. Use tabular numerals for financial and timeline data.

| Style | Size/line | Weight | Use |
| --- | --- | --- | --- |
| Display | 48/56 | 650 | rare start-page statement |
| H1 | 36/44 | 650 | one page heading |
| H2 | 28/36 | 650 | major section |
| H3 | 22/30 | 600 | subsection/card group |
| H4 | 18/26 | 600 | card heading |
| Body | 16/24 | 400 | default prose/control |
| Body Strong | 16/24 | 600 | emphasis |
| Small | 14/20 | 400 | supporting content |
| Label | 14/20 | 600 | form/control labels |
| Caption | 12/16 | 500 | nonessential metadata only |
| Code/ID | 13/20 | 500 | Expert references |

Prose max-width is 72ch. Never encode hierarchy by color alone. At 200% text zoom, controls wrap and fixed-height containers grow.

## 4. Spacing, Radius, Elevation and Grid

Spacing tokens: `space/0=0`, `1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`, `10=40`, `12=48`, `16=64`, `20=80`. Component minimum target is 44×44 px; compact expert controls may be 32 px only where spacing satisfies WCAG 24×24 minimum.

Radius: `radius/1=4`, `2=8`, `3=12`, `4=16`, `pill=999`. Elevation: `none`; `raised=0 1px 3px rgba(15,23,42,.12)`; `overlay=0 12px 32px rgba(15,23,42,.18)`. Borders, not shadows, define routine grouping.

| Viewport | Columns | Margin | Gutter | Shell |
| --- | ---: | ---: | ---: | --- |
| Desktop 1440 | 12 | 48 | 24 | 240 rail + fluid content |
| Compact 1200 | 12 | 32 | 20 | 80 collapsed rail permitted |
| Tablet 834 | 8 | 24 | 16 | overlay/collapsed nav |
| Mobile 390 | 4 | 16 | 12 | bottom nav |
| Minimum 320 | 4 | 16 | 8 | one column |

Content max-width is 1280 px; readable panels 720 px; dialogs 480/640/800 px. Avoid more than two nested card levels.

## 5. Iconography

Use a single outlined 24 px icon set, 2 px stroke, rounded joins; 20 px inside compact controls, 16 px only beside text. Required semantic icons: Home, Work, Decision, Deliverable, Search, Notification, Help, Settings, Person, AI agent (spark/circuit plus text “NOVA”), Source, Link, Upload, Download, Edit, Add, Close, More, Chevron, Check, Info, Warning, Critical, Blocked, Complete, Clock, Lock, Visibility, Undo, Stop. Icons never replace accessible names or status text.

## 6. Core Components

Every interactive component includes default, hover, focus-visible, pressed, disabled and loading where applicable.

- **Button:** primary, secondary, quiet, destructive; heights 44/36; horizontal padding 16/12; spinner preserves label width.
- **IconButton:** 44 square default; tooltip on hover/focus; visible or accessible label mandatory.
- **Input/Textarea/Composer:** 44 px minimum; label always visible; helper/error linked; variants attachment, voice, submitting, read-only.
- **Select/Combobox:** search/no-result/error; keyboard listbox semantics; native fallback allowed.
- **Checkbox/Radio/Switch:** 20–24 px control in 44 px target; checked, indeterminate, error, disabled.
- **Tabs/Segmented:** active state uses text + indicator; overflow becomes labeled selector, never clipped.
- **NavigationItem:** icon+label, active, badge, collapsed; minimum 44 px.
- **Card:** Work, Decision, Deliverable, Expert, Source, Example; default, hover, focus, selected, critical. Card may be one link; nested actions remain separate focus targets.
- **StatusBadge:** neutral, active, attention, blocked, complete; icon+plain text, never color-only.
- **Alert:** inline/banner; info, success, warning, critical; optional bounded actions.
- **Toast:** success/info only; 6 s minimum or persistent; keyboard dismiss; critical content is never toast-only.
- **Dialog:** standard/destructive/critical; focus trap, Escape except critical confirmation, return focus.
- **Drawer:** detail/filter/contribution; 480 px desktop, full-screen mobile.
- **Table:** sortable/selectable/loading/empty; real headers and captions; stacked record alternative.
- **Accordion/Disclosure:** heading button; expanded state programmatic.
- **Tooltip:** enhancement only; hover/focus; no required content.
- **Skeleton:** text/card/list; `aria-hidden`, paired with one announced loading status.
- **EmptyState:** first-use, filtered, permission-limited; title, explanation, one action.

## 7. Product Pattern Components

### 7.1 Mission Card

Anatomy: outcome title; plain mission type; health icon+label; owner; next action; last meaningful update. Variants `active`, `attention`, `blocked`, `complete`, `selected`; compact and full densities. Mobile keeps outcome and next action visible; metadata wraps. Clicking opens work; secondary overflow actions do not nest inside the primary link.

### 7.2 Timeline and Plan Phase

Anatomy: phase name; intended outcome; state; owner; dates/range; actions; dependencies. Variants `future`, `active`, `complete`, `blocked`, `changed`. Desktop may be horizontal; mobile is vertical. Determinate progress appears only with real data. Dependency connections include text alternatives; reorder has keyboard/menu controls.

### 7.3 AI Interaction

- **AgentIdentity:** explicit `NOVA — AI` or named human; AI is never identified by color alone.
- **ObjectiveComposer:** text, attachment, voice, send, stop, privacy/help.
- **AIResponse:** direct response; rationale; assumptions/uncertainty; sources; one next action; Why/Detail disclosures.
- **AIWorking:** plain current activity, Stop, elapsed time only when useful, no fabricated percentage.
- **ConfidencePanel:** Low/Medium/High; basis; assumptions count; open questions; improvement action. Confidence never means approval.
- **RecommendationCard:** recommendation label, rationale, alternatives, sources; never preselected in a decision.
- **HumanControlBar:** Edit, Challenge, Undo, Pause, Ask human, Approve where authorized.

### 7.4 Decision Components

DecisionCard exposes statement, authority, deadline, risk and next action. OptionComparison supports neutral/recommended/selected/rejected without biasing selection. DecisionPause is two-step, distraction-reduced, defaults to no choice and records rationale. DecisionReceipt exposes outcome, identity, timestamp, scope and immutable Expert reference.

### 7.5 Source and Knowledge Components

SourceReference variants: available, stale, missing, contradictory, restricted. KnowledgeTypeBadge uses text `Fact`, `Hypothesis`, `Interpretation`, `Recommendation`, `Innovation`. ContradictionPanel displays both claims, basis, affected conclusion and resolution state. No “verified” status exists without named validation basis.

### 7.6 Notifications

Notification anatomy: priority icon+label; outcome-oriented title; reason received; time; exact target; action. Groups: Needs action, Updates, Earlier. Critical remains persistent until acknowledged; noncritical supports mark read. Badge counts actionable unread items, capped visually at `99+` with full accessible count.

### 7.7 Forms and Errors

Form errors appear in an error summary linked to invalid fields and inline below labels. Input is retained. ErrorSummary states what failed, impact, retained work, next action and support path. Async actions use polite live regions; critical results use assertive announcement without moving focus unexpectedly.

## 8. Responsive Component Behavior

- Global rail becomes overlay tablet and four-item bottom navigation mobile: Home, Work, Decisions, Deliverables; utilities remain in More/profile.
- Work-local tabs become a labeled selector when they do not fit.
- Two-column summary/detail becomes sequential content or list→detail navigation.
- Drawers become full-screen sheets; dialogs use 16 px viewport margin.
- Tables become cards; essential comparison may scroll horizontally with instruction and frozen first label.
- Sticky actions account for safe area and never obscure focused content or bottom navigation.
- Hover-only affordances are prohibited. Touch, focus and keyboard equivalents are mandatory.

## 9. Motion

Tokens: `motion/instant=0`, `fast=120ms`, `standard=200ms`, `slow=300ms`; easing `standard=cubic-bezier(.2,0,0,1)`, `exit=cubic-bezier(.4,0,1,1)`. Use opacity/transform for overlays and state continuity. No essential meaning relies on motion. Reduced Motion mode removes translation/parallax and uses instant or 100 ms fades. Loading indicators pause when hidden; no celebratory blocking animation.

## 10. Content Rules

Buttons name outcomes (`Prepare outline`, `Start work`). Status is plain and actionable. Sentences use simple public language, active voice and one idea. Explain unfamiliar terms at first use. Dates, numbers, names and currencies localize. Truncation never hides the only statement of outcome, risk, authority or error.

## 11. Accessibility Definition of Done

- WCAG 2.2 AA contrast: 4.5:1 normal text, 3:1 large text and UI graphics.
- Semantic name, role, value/state; logical heading and landmark order.
- Full keyboard use, visible unobscured focus and focus restoration.
- 320 px reflow, 200% text zoom, 400% browser zoom verification.
- Preferred 44×44 targets; minimum WCAG target rule respected.
- No color/sensory-only meaning; alternative to drag and gesture.
- Errors connected to controls; entered data preserved; redundant entry avoided.
- Live status is announced without stealing focus; timeout is disclosed/extendable.
- Critical legal, financial, destructive and data actions require review and explicit confirmation.
- Charts include text summary and accessible data; media includes captions/transcript.

## 12. Figma Component Naming and Release Gate

Naming: `Component/Variant/Size`, properties `State`, `Type`, `Size`, `Density`, `Icon`, `Label`, `Mode`. Use Auto Layout, semantic variables, text styles and documented slots. Each component set includes anatomy, usage, prohibited use, content guidance, keyboard behavior, responsive transformation and accessibility annotation.

Release requires: all listed states; Light and High Contrast modes; dark-mode contrast check before use; responsive examples; keyboard/focus notes; screen-reader naming; no detached instances in production frames; and mapping to all 32 screens. This design system authorizes Figma production only and contains no React implementation.
