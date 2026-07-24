# PROGRAM-018 Product Studio V1 — Screen Specification

## Status

COMPLETE — FIGMA-READY STRUCTURAL SPECIFICATION

## Production Contract

This specification translates the certified V0 inventory into 32 buildable screen contracts. Frame names SHALL follow `Sxx / Viewport / State / Mode`. Public copy uses objective, work, decision, source and result; internal governance vocabulary is hidden outside Expert detail.

Shared responsive rule: desktop uses a 12-column shell with persistent navigation; tablet uses 8 columns and collapsible navigation; mobile uses 4 columns, one content column and bottom navigation. Tables become labeled records unless horizontal comparison is essential. All screens support keyboard operation, 320 px reflow, 200% text zoom, visible focus, semantic headings and status announcements.

Shared states: loading preserves structure; empty explains value and offers one start action; errors state impact, retained work and recovery; AI work is labeled and stoppable; critical action defaults to no decision. Variants listed below are mandatory.

## S01 — Welcome / Start

- **Objective:** turn an intention into a first action without exposing product structure.
- **Sections:** global header; greeting; “What would you like to achieve?”; compact objective composer; outcome examples; returning-user Continue/Needs attention; privacy note.
- **Components:** AppShell, ObjectiveComposer, ExampleCard, AttentionSummary, WorkCard, PrivacyLink.
- **Variants:** first use; returning; voice available; no voice.
- **Responsive:** desktop examples in four columns; tablet two; mobile two-column buttons then returning content.
- **Interactions:** autofocus composer on first use; example populates composer; attention opens exact object; voice always has text alternative.
- **States:** new; active work; critical attention; composer loading/error; offline draft preserved.

## S02 — Objective Composer

- **Objective:** capture an approximate desired outcome in the user's own words.
- **Sections:** label; helper; multiline input; attachments; voice; Continue; Use an example.
- **Components:** Composer, AttachmentItem, VoiceControl, Button, InlineError, PrivacyHint.
- **Variants:** empty; typing; attachment; validation error.
- **Responsive:** centered 8-column desktop canvas; full-width mobile; actions stack below 360 px.
- **Interactions:** explicit submit; Enter inserts line break; attach/remove/retry; preserve input after failure.
- **States:** idle; focused; uploading; submitting; blank error; unsupported file; offline.

## S03 — Clarification

- **Objective:** resolve only path-changing ambiguity.
- **Sections:** short progress text; editable objective; one question; rationale; suggestions; free text; Back/Skip/Continue.
- **Components:** ObjectiveSummary, QuestionCard, ChoiceChip, TextField, RationaleDisclosure, StepActions.
- **Variants:** Guided; Standard; optional question skipped.
- **Responsive:** question max-width 720 px; chips wrap; mobile actions remain visible without obscuring content.
- **Interactions:** select or type; explain why; edit objective; maximum three questions before canvas.
- **States:** answered; optional; required error; saving; unavailable suggestion.

## S04 — Mission Canvas Review

- **Objective:** confirm NOVA's understanding before planning.
- **Sections:** outcome; importance/audience; success; constraints; assumptions; people/authority; Prepare a plan.
- **Components:** MissionCanvas, EditableSection, AssumptionFlag, PersonIdentity, Button.
- **Variants:** default; edited; unresolved assumptions.
- **Responsive:** two-column review desktop; single-column tablet/mobile; edit drawers become full-screen mobile sheets.
- **Interactions:** inline edit; resolve/challenge assumption; ask another question; prepare plan.
- **States:** saved; unsaved; save error; conflict; incomplete authority.

## S05 — Plan Preview

- **Objective:** preview a credible path and its consequences before commitment.
- **Sections:** outcome; phase timeline; first actions; experts; deliverables; future decisions; assumptions/risks; estimate; actions.
- **Components:** PhaseTimeline, ActionList, ExpertCard, DeliverableCard, DecisionCard, ConfidencePanel.
- **Variants:** create; recover; analyze; decide; produce.
- **Responsive:** timeline horizontal desktop and vertical mobile; supporting cards move below plan.
- **Interactions:** inspect phase; edit plan; open risk/source; continue to work-mode review.
- **States:** generating; partial; estimate unavailable; contradiction; ready.

## S06 — Start Confirmation

- **Objective:** set explicit scope, autonomy and permissions.
- **Sections:** scope; A0–A3 selector with public labels; will/will ask lists; data/access; notifications; Start work.
- **Components:** AutonomySelector, PermissionSummary, AccessPreview, NotificationChoice, ConfirmationActions.
- **Variants:** A0–A3; permission conflict.
- **Responsive:** selector cards 2×2 desktop, stacked mobile; summary precedes confirmation.
- **Interactions:** select level; inspect limits; resolve permission; start; return to plan.
- **States:** allowed; policy-disabled with reason; checking permission; conflict; starting.

## S07 — Home

- **Objective:** show what needs attention and the shortest useful next action.
- **Sections:** greeting; start action; Needs attention; Continue (max three); recent outcomes; authorized portfolio summary.
- **Components:** StartWork, AttentionSummary, MissionCard, OutcomeCard, PortfolioSnapshot.
- **Variants:** new; active; attention; all-clear.
- **Responsive:** desktop attention/continue split; single prioritized mobile feed; portfolio collapses after personal work.
- **Interactions:** start; continue; resolve attention; dismiss noncritical update; filter portfolio.
- **States:** loading skeleton; empty new; all-clear; stale portfolio; critical alert.

## S08 — Work List

- **Objective:** find and compare ongoing work.
- **Sections:** title/start; search; filters/sort; results; Expert saved views.
- **Components:** SearchField, FilterChip, MissionCard, DataTable, SortMenu, EmptyState.
- **Variants:** cards; Expert table; empty; filtered.
- **Responsive:** cards below 768 px; essential comparison table may scroll with instruction.
- **Interactions:** filter/sort/search; switch view; open work; save view in Expert mode.
- **States:** loading; no work; no filtered result; permission-limited; error.

## S09 — Work Overview

- **Objective:** communicate health, next action, blockers and outcomes in one view.
- **Sections:** work header/local nav; outcome/success; attention; phase/next action; progress narrative; decisions; contributions; deliverables; confidence.
- **Components:** WorkHeader, LocalNav, HealthBadge, NextAction, ProgressNarrative, DecisionCard, ConfidencePanel.
- **Variants:** active; blocked; at risk; completed.
- **Responsive:** desktop main/detail columns; mobile local nav selector and attention first.
- **Interactions:** act on blocker; navigate tabs; expand confidence; open decision/deliverable; pause work.
- **States:** refreshing; partial; blocked; complete; permission-limited.

## S10 — Plan

- **Objective:** understand phases, ownership and dependencies and request controlled changes.
- **Sections:** phase/list switch; phase groups; action rows; change action; impact preview.
- **Components:** SegmentedControl, PlanPhase, ActionRow, DependencyLink, ChangeImpactDialog.
- **Variants:** phases; list; dependency; empty.
- **Responsive:** vertical phases mobile; action rows become labeled cards.
- **Interactions:** expand; filter owner/state; propose change; keyboard reorder/menu alternative; confirm impact.
- **States:** loading; empty; dependency blocked; unsaved change; conflict.

## S11 — Activity

- **Objective:** provide a trustworthy human/AI history and collaboration stream.
- **Sections:** filters; grouped chronological feed; contribution composer; load older.
- **Components:** FilterTabs, ActivityEvent, IdentityLabel, Composer, PaginationButton.
- **Variants:** feed; filtered; empty; loading.
- **Responsive:** feed max-width 800 px; metadata wraps without truncating actor/action.
- **Interactions:** filter; comment; open referenced object; load older; copy link.
- **States:** posting; failed post retained; deleted reference; AI-labeled event.

## S12 — People & Experts

- **Objective:** request bounded human or AI expertise with visible access and cost.
- **Sections:** current people; invite; recommended expertise; directory; contribution drawer; access preview.
- **Components:** PersonCard, AgentIdentity, ExpertCard, DirectoryFilter, ContributionDrawer, AccessPreview.
- **Variants:** directory; contribution request; access warning.
- **Responsive:** directory cards; drawer right-side desktop/full-screen mobile.
- **Interactions:** search expert; inspect identity/access; invite; request contribution; cancel.
- **States:** available; unavailable; pending invite; restricted access; request error.

## S13 — Sources

- **Objective:** expose source coverage, use, freshness and contradictions.
- **Sections:** coverage; add; filters; source list; detail; claims/sections using source.
- **Components:** CoverageMeter, SourceCard, SourceReference, FilterChip, DetailPanel, ContradictionAlert.
- **Variants:** list; detail; contradiction; missing source.
- **Responsive:** master/detail desktop; sequential list/detail mobile.
- **Interactions:** add/review; filter; open claim; mark stale; resolve contradiction.
- **States:** indexing; available; stale; missing; contradictory; access denied.

## S14 — Work Decisions

- **Objective:** surface pending, upcoming and completed decisions for one work item.
- **Sections:** pending callout; upcoming; history; filters/owner; start package.
- **Components:** DecisionCard, DeadlineBadge, OwnerFilter, DecisionHistory, Button.
- **Variants:** pending; decided; no decisions.
- **Responsive:** list cards mobile; history table only on wide screens.
- **Interactions:** open; assign; filter; create package; inspect receipt.
- **States:** urgent; waiting; decided; empty; loading.

## S15 — Work Deliverables

- **Objective:** manage outputs from draft through publication.
- **Sections:** create; drafts; in review; published; audience/version metadata.
- **Components:** DeliverableCard, StatusTabs, VersionBadge, AudienceLabel, CreateButton.
- **Variants:** drafts; review; published; empty.
- **Responsive:** three columns desktop; one column mobile.
- **Interactions:** create; open; submit for review; compare version; publish when authorized.
- **States:** generating; draft; review; changes requested; published; export failed.

## S16 — Recovery Intake

- **Objective:** capture a troubled situation while separating facts, reports and unknowns.
- **Sections:** situation; existing work upload/link; symptoms; constraints/deadlines; authority; fact/reported/missing summary; Diagnose.
- **Components:** RecoveryComposer, FileItem, SymptomSelector, ConstraintForm, EvidenceTriage, SensitiveDataAlert.
- **Variants:** files added; missing context; sensitive-data warning.
- **Responsive:** form and triage side-by-side desktop, sequential mobile.
- **Interactions:** upload/link; classify statement; add person; acknowledge data warning; diagnose.
- **States:** uploading; incomplete; scanning; sensitive; diagnosis queued; error.

## S17 — Recovery Diagnosis

- **Objective:** explain health, threats and a safe stabilization path.
- **Sections:** health/confidence; threats; likely causes; contradictions; gaps; 72-hour actions; recovery phases; Review plan.
- **Components:** HealthSummary, ConfidencePanel, ThreatCard, CauseMap, ContradictionAlert, StabilizationList.
- **Variants:** low confidence; contradictions; recovery ready.
- **Responsive:** threats and actions prioritized above analysis on mobile.
- **Interactions:** challenge cause; supply missing info; assign action; review recovery plan.
- **States:** analyzing; partial; low confidence; blocked by missing data; ready.

## S18 — Research Workspace

- **Objective:** synthesize inquiry without conflating facts, hypotheses and recommendations.
- **Sections:** question/audience; question map; coverage; classified findings; contradictions; open questions; synthesis preview.
- **Components:** QuestionMap, CoverageMeter, FindingCard, KnowledgeTypeBadge, ContradictionPanel, SynthesisPreview.
- **Variants:** question map; findings; gaps; synthesis ready.
- **Responsive:** view selector replaces multi-panel layout on mobile.
- **Interactions:** add question/source; classify finding; link evidence; compare contradiction; prepare synthesis.
- **States:** researching; no sources; source gap; conflict; ready.

## S19 — Decision Package

- **Objective:** enable informed choice with recommendation, dissent and uncertainty visible.
- **Sections:** statement/authority/deadline; summary; options; recommendation; criteria/tradeoffs; risks/affected parties; uncertainty; dissent; sources; change history.
- **Components:** DecisionHeader, OptionComparison, RecommendationCard, RiskMatrix, ConfidencePanel, DissentPanel, SourceReference.
- **Variants:** default; dissent; insufficient basis; updated version.
- **Responsive:** comparison becomes labeled option cards mobile; sticky Review decision action.
- **Interactions:** compare; inspect basis; request option; review decision; view previous version.
- **States:** basis insufficient; stale source; changed; ready; access restricted.

## S20 — Decision Pause

- **Objective:** secure explicit, informed human authority for consequential decisions.
- **Sections:** Review step (decision, option, consequences, affected domains, reversibility, uncertainty, authority); Decide step (Approve/Changes/Reject/Defer, rationale).
- **Components:** DecisionPause, ConsequenceSummary, AuthorityIdentity, ChoiceGroup, RationaleField, Reauthentication.
- **Variants:** approve; reject; request changes; defer; critical.
- **Responsive:** distraction-reduced single column at every size; no swipe decisions.
- **Interactions:** review then decide; no preselection; cancel without loss; reauthenticate only by policy.
- **States:** untouched; acknowledgement required; invalid authority; expired; submitting; duplicate prevented.

## S21 — Decision Receipt

- **Objective:** provide an immutable, understandable record and next actions.
- **Sections:** outcome; who/when/scope; rationale; resulting actions; Expert reference; return/share.
- **Components:** ReceiptHeader, IdentityLabel, ScopeSummary, ActionList, CopyableReference, ShareButton.
- **Variants:** approved; rejected; changes requested; deferred.
- **Responsive:** printable centered record; actions stack mobile.
- **Interactions:** return; open resulting action; share/download if authorized; copy reference.
- **States:** recording; recorded; share restricted; download error.

## S22 — Deliverable Setup

- **Objective:** define output format, audience and governance before generation.
- **Sections:** format; audience; purpose; locale; confidentiality; deadline; source scope; Prepare outline.
- **Components:** FormatCard, AudiencePicker, PurposeField, LocaleSelect, ConfidentialityChoice, SourceScope.
- **Variants:** document; presentation; dashboard; summary.
- **Responsive:** format 4-up desktop, 2-up tablet, stacked mobile.
- **Interactions:** select format; configure audience/sources; validate; prepare outline.
- **States:** incomplete; permission warning; unavailable format; saving; ready.

## S23 — Deliverable Outline

- **Objective:** agree structure and evidence coverage before drafting.
- **Sections:** audience/purpose; reorderable outline; coverage by section; gaps; edit controls; Create draft.
- **Components:** OutlineTree, OutlineItem, CoverageBadge, GapAlert, AddSection, ReorderMenu.
- **Variants:** default; source gaps; edited.
- **Responsive:** outline first, coverage below on mobile; no drag-only operation.
- **Interactions:** add/remove/edit/reorder; link source; acknowledge gap; create draft.
- **States:** pristine; edited; saving; conflict; blocking gap; ready.

## S24 — Deliverable Review

- **Objective:** review content, provenance, accessibility and unresolved issues before export.
- **Sections:** preview/navigation; issue summary; comments; source/assumption toggles; versions; approval actions.
- **Components:** DeliverablePreview, IssueSummary, CommentThread, ProvenanceToggle, VersionHistory, ApprovalBar.
- **Variants:** comments; unresolved issue; ready.
- **Responsive:** desktop preview + review rail; mobile switches Preview/Issues/Comments.
- **Interactions:** annotate; resolve/request change; inspect source; compare version; approve for export.
- **States:** rendering; partial preview; unresolved blocking issue; ready; approval failed.

## S25 — Export & Share

- **Objective:** release the approved version to the correct audience safely.
- **Sections:** version/state; format/settings; recipients; confidentiality; lineage; accessibility; final preview; Export/Share.
- **Components:** VersionSummary, ExportFormat, RecipientPicker, ConfidentialityAlert, AccessibilityChecklist, Progress.
- **Variants:** permission; confidentiality; export progress; success.
- **Responsive:** settings then preview mobile; desktop two columns.
- **Interactions:** configure; validate recipients; preview; export/share; cancel background job.
- **States:** permission denied; warning; processing; failed with retry; success.

## S26 — Global Decisions

- **Objective:** consolidate decisions requiring or awaiting action across work.
- **Sections:** Needs my decision; Waiting; Upcoming; History; filters.
- **Components:** DecisionQueue, DecisionCard, RiskFilter, DeadlineFilter, EmptyState.
- **Variants:** needs me; waiting; history; empty.
- **Responsive:** queues as tabs mobile; desktop summary counts plus list.
- **Interactions:** filter; open package; delegate if permitted; inspect receipt.
- **States:** urgent; overdue; waiting; empty; loading.

## S27 — Global Deliverables

- **Objective:** find, create and track outputs across work.
- **Sections:** create; Drafts/In review/Published; search/filter; result list.
- **Components:** StatusTabs, SearchField, DeliverableCard, DataTable, FilterMenu.
- **Variants:** drafts; review; published; empty.
- **Responsive:** cards mobile; table optional desktop Expert view.
- **Interactions:** search/filter; open; create; compare version; export authorized output.
- **States:** loading; no deliverables; no result; restricted; stale.

## S28 — Search / Command

- **Objective:** reach any permitted object or action without learning menus.
- **Sections:** input; recent actions; grouped results; permitted commands; context/snippet.
- **Components:** CommandDialog, SearchInput, ResultGroup, SearchResult, CommandItem, ShortcutHint.
- **Variants:** initial; results; no result; recent.
- **Responsive:** centered overlay desktop; full-screen mobile.
- **Interactions:** type; arrow navigate; Enter open; Escape close/restore focus; command requires permission.
- **States:** searching; results; empty; offline limited; permission filtered.

## S29 — Notifications

- **Objective:** explain actionable changes and deep-link to resolution.
- **Sections:** Needs action; Updates; Earlier; mark read; preferences.
- **Components:** NotificationGroup, NotificationItem, PriorityBadge, MarkRead, PreferenceLink.
- **Variants:** grouped; empty; critical alert.
- **Responsive:** popover desktop with full-page route; full page mobile.
- **Interactions:** open exact object; mark one/all; mute category; preferences.
- **States:** unread; read; critical; stale target; empty.

## S30 — Preferences

- **Objective:** let users control mode, explanation, accessibility, notifications and AI limits.
- **Sections:** experience mode; depth; locale; text/contrast/motion; notifications; autonomy; memory/context; save.
- **Components:** SettingsSection, RadioGroup, Select, Switch, AutonomySelector, OrganizationLimit, SaveStatus.
- **Variants:** mode; language; accessibility; AI controls.
- **Responsive:** sidebar sections desktop; in-page anchored list mobile.
- **Interactions:** edit; preview display; reset section; save; explain organization limit.
- **States:** unchanged; unsaved; saving; saved; policy-locked; error.

## S31 — Error & Recovery

- **Objective:** restore progress with a clear account of impact and retained work.
- **Sections:** what happened; impact; retained work; next action; support; Expert error detail.
- **Components:** ErrorSummary, RetainedWorkPanel, RecoveryActions, OfflineBadge, CopyableCode.
- **Variants:** recoverable; partial; offline; permission denied.
- **Responsive:** centered readable panel; related retained content below.
- **Interactions:** retry; save draft; continue with partial; request access; get help.
- **States:** connection lost; partial result; denied; unavailable source; failed action; service unavailable.

## S32 — Help & Support

- **Objective:** provide contextual self-service and a reliable human escalation route.
- **Sections:** contextual answer; common tasks; human support; accessibility support; report AI issue; diagnostic reference.
- **Components:** ContextualHelp, TaskLink, SupportChannel, IssueReport, DiagnosticReference.
- **Variants:** contextual help; human support; report problem.
- **Responsive:** context/task columns desktop; stacked mobile with human support always reachable.
- **Interactions:** search help; open task; contact support; report unsafe result; copy reference.
- **States:** answer found; no answer; channel unavailable; report sending/sent/error.

## Cross-Screen Acceptance

- All 32 desktop frames SHALL exist. S01, S04, S07, S09, S19, S20, S24 and S31 SHALL also exist at tablet and mobile reference sizes.
- Prototype paths SHALL preserve state for Create, Recover, Research, Decide, Deliver, Monitor, Collaborate and Error Recovery.
- Every asynchronous, empty, error, approval and critical-decision state SHALL use the shared semantic components and never rely on color alone.
- Screen structure is certified for professional visual design; this document does not authorize React implementation.
