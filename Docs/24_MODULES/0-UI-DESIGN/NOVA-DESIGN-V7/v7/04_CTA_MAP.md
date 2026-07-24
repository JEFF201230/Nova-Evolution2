# 04 — CARTE DES CTAs
## NOVA V7 — Reconstruction à partir des maquettes existantes

> Règle : Aucune invention. Toute relation incertaine est marquée ⚠ À confirmer.
> Source de vérité : `/workspaces/default/code/src/app/App.tsx`

Légende des types :
- **primary** — Btn variant="primary" (fond bleu #1D4ED8)
- **secondary** — Btn variant="secondary" (fond blanc, bordure)
- **quiet** — Btn variant="quiet" (transparent)
- **link** — bouton inline stylisé comme lien texte
- **nav** — NavItem (NavRail)
- **card** — zone cliquable (Card avec onClick)
- **row** — rangée cliquable (div ou button de liste)
- **no-op** — présent visuellement, aucune action réelle

---

## NAVRAIL (présent sur 9 vues)

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Logo | — | Sparkles | nav | ⚠ À confirmer — pas de onClick dans le code |
| Home | Home | Home | nav | `setView("home")` |
| Work | Work | Briefcase | nav | `setView("work")` |
| Decisions | Decisions | Scale | nav | `setView("global-decisions")` |
| Deliverables | Deliverables | FileText | nav | `setView("global-deliverables")` |
| Search | — | Search | nav | `setSearchOpen(true)` |
| Bell | — | Bell | nav | no-op |
| Help | — | HelpCircle | nav | no-op |
| Settings | — | Settings | nav | no-op |
| User row | — | avatar | nav | no-op |

---

## HOME VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Suggestion pill | texte variable | — | row | popule le Composer textarea |
| Composer submit | "Ask NOVA" ou "Start" | Sparkles | primary | `setView("clarify")` |
| Composer attach | — | Paperclip | quiet | no-op |
| Composer mic | — | Mic | quiet | no-op |
| Composer cancel | "Cancel" | — | link | reset Composer (composerOpen=false) |
| Work item row | titre work | — | card | `setActiveWork(id)` + `setView("work")` |
| Work item "Details" | "Details" | — | secondary | `setDetailOpen(true)` (drawer) |
| Decision nudge "Review & decide" | "Review & decide" | ArrowRight | primary | `setActiveDecision(id)` + `setView("decision-package")` |

---

## CLARIFY VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Back | "Back" | — | link | `setView("home")` |
| Next (question non finale) | "Next" | — | primary | avance d'une question (step+1) |
| Next (dernière question) | "Next" | — | primary | `setView("canvas")` |
| Option radio | texte option | — | card | sélectionne une réponse |

---

## CANVAS VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Back | "Back" | — | link | `setView("clarify")` ⚠ À confirmer |
| Edit (carte) | — | Edit2 | quiet | passe la carte en mode édition |
| Save (carte en édition) | "Save" | — | primary | sauvegarde localement (état local) |
| Cancel edit | "Cancel" | — | link | annule l'édition (état local) |
| Continue | "Continue" | ArrowRight | primary | `setView("plan")` |

---

## PLAN VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Back | "Back" | — | link | `setView("canvas")` ⚠ À confirmer |
| Phase accordion toggle | — | ChevronDown | row | open/close phase (état local) |
| Confirm and start | "Confirm and start" | ArrowRight | primary | `setView("confirm")` |

---

## CONFIRM VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Back | "Back" | — | link | `setView("plan")` ⚠ À confirmer |
| Autonomy radio | "A0 — Supervise" etc. | — | card | sélectionne niveau (état local) |
| Start work | "Start work" | ArrowRight | primary | `setActiveWork(newId)` + `setView("work")` |

---

## WORK VIEW — BREADCRUMB ET HEADER

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Back (breadcrumb) | "← {nom work}" | ChevronLeft | link | `setView("home")` |
| Tab — overview | "Overview" | — | nav | `setTab("overview")` |
| Tab — plan | "Plan" | — | nav | `setTab("plan")` |
| Tab — activity | "Activity" | — | nav | `setTab("activity")` |
| Tab — people | "People" | — | nav | `setTab("people")` |
| Tab — sources | "Sources" | — | nav | `setTab("sources")` |
| Tab — decisions | "Decisions" | — | nav | `setTab("decisions")` |
| Tab — deliverables | "Deliverables" | — | nav | `setTab("deliverables")` |
| Overflow | — | MoreHorizontal | quiet | no-op |

---

## WORK — OVERVIEW TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Next Best Action — "Open" | "Open" | ArrowRight | primary | no-op |
| Full analysis | "Full analysis" | ChevronRight | link | `setDetailOpen(true)` (drawer) |
| Accordion phase toggle | — | ChevronDown | row | open/close (état local) |
| ConfChip (clic) | "{N}% confidence" | ChevronDown | quiet | ouvre popover (état local) |
| WhyInline (clic) | "Why" | ChevronDown | quiet | expanse inline (état local) |

---

## WORK — PLAN TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Accordion phase toggle | — | ChevronDown | row | open/close (état local) |

---

## WORK — ACTIVITY TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Filter "all" | "All" | — | row | filtre local |
| Filter "human" | "Human" | — | row | filtre local |
| Filter "ai" | "AI" | — | row | filtre local |
| Filter "critical" | "Critical" | — | row | filtre local |
| Filter "sources" | "Sources" | — | row | filtre local |
| "Post" (commentaire) | "Post" | Send | secondary | no-op |

---

## WORK — PEOPLE TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "Details" (personne) | "Details" | — | secondary | `setDrawer(person)` (drawer) |

---

## WORK — SOURCES TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "Add" (sources) | "Add" | Plus | secondary | no-op |
| "Add" (source manquante) | "Add" | Upload | secondary | no-op |
| "Refresh" (source stale) | "Refresh" | RefreshCw | secondary | no-op |
| "Details" (source) | "Details" | — | secondary | `setDrawer(source)` (drawer) |

---

## WORK — DECISIONS TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "Review & decide" | "Review & decide" | ArrowRight | primary | `setActiveDecision(id)` + `setView("decision-package")` |
| WhyInline | "Why" | ChevronDown | quiet | expanse inline |
| ConfChip | "{N}% confidence" | ChevronDown | quiet | ouvre popover |
| DeadlineBadge | "Due in N days" | Clock | — | non cliquable (affichage seul) |

---

## WORK — DELIVERABLES TAB

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Eye | — | Eye | quiet | no-op |
| "Details" | "Details" | — | secondary | `setDrawer(deliverable)` (drawer) |
| "Create" | "Create" | Plus | secondary | no-op |
| ConfChip | "{N}% confidence" | ChevronDown | quiet | ouvre popover |

---

## GLOBAL-DECISIONS VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Filter "All" | "All" | — | row | filtre local |
| Filter "pending" | "Needs my decision" | — | row | filtre local |
| Filter "waiting" | "Waiting" | — | row | filtre local |
| Filter "decided" | "History" | — | row | filtre local |
| Carte décision (pending/waiting) | — | — | card | `setActiveDecision(id)` + `setView("decision-package")` |
| Carte décision (decided) | — | — | card | non cliquable (onClick=undefined) |
| ConfChip | — | ChevronDown | quiet | ouvre popover |
| DeadlineBadge | — | Clock | — | non cliquable |

---

## GLOBAL-DELIVERABLES VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "Create" | "Create" | Plus | primary | no-op |
| Filter "all" | "All" | — | row | filtre local |
| Filter "draft" | "Drafts" | — | row | filtre local |
| Filter "review" | "In review" | — | row | filtre local |
| Filter "published" | "Published" | — | row | filtre local |
| Eye | — | Eye | quiet | no-op |
| Download | — | Download | secondary | no-op (visible sur published seulement) |
| ConfChip | — | ChevronDown | quiet | ouvre popover |

---

## DECISION-PACKAGE VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "← Back to work" | "Back to work" | ChevronLeft | link | `setView("work")` |
| "Review and decide" (hero) | "Review and decide" | ArrowRight | primary | `setView("decision-pause")` |
| "Full package" | "Full package" | ChevronRight | link | `setDetailOpen(true)` (drawer) |
| ConfChip | — | ChevronDown | quiet | ouvre popover |
| DeadlineBadge | — | Clock | — | non cliquable |
| Option radio | texte option | — | card | `setSel(opt.id)` / toggle null |
| WhyInline | "Why" | ChevronDown | quiet | expanse inline |
| "Review and decide" (bas) | "Review and decide" | ArrowRight | primary | `setView("decision-pause")` |

---

## DECISION-PAUSE VIEW — STEP 1

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "← Back" | "← Back" | — | link | `setView("decision-package")` |
| "I have reviewed — continue" | — | ArrowRight | primary | `setStep("decide")` |
| "Cancel" | "Cancel" | — | link | `setView("decision-package")` |

---

## DECISION-PAUSE VIEW — STEP 2

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Radio "Approve" | "Approve" | — | card | `setChoice("approve")` / toggle null |
| Radio "Request changes" | "Request changes" | — | card | `setChoice("changes")` |
| Radio "Reject" | "Reject" | — | card | `setChoice("reject")` |
| Radio "Defer" | "Defer" | — | card | `setChoice("defer")` |
| Textarea rationale | — | — | input | `setRationale(value)` |
| "Record — {choix}" | — | — | primary | 700ms loading → `setView("decision-receipt")` (désactivé si choice=null ou rationale vide) |
| "← Back" | "← Back" | — | link | `setStep("review")` |

---

## DECISION-RECEIPT VIEW

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| "Export" | "Export" | Download | link | no-op |
| "Return to work" | "Return to work" | ArrowRight | primary | `setView("work")` |
| "Share receipt" | "Share receipt" | — | secondary | no-op |

---

## SEARCH OVERLAY

| CTA | Label | Icône | Type | Destination / Effet |
|---|---|---|---|---|
| Input texte | placeholder | Search | input | `setQ(value)` (filtre local) |
| Résultat (work item) | titre work | — | row | `setActiveWork(id)` + `setView("work")` + close |
| Résultat (décision) | statement | — | row | `setActiveDecision(id)` + `setView("decision-package")` + close |
| Backdrop clic | — | — | overlay | `onClose()` |
| Escape (clavier) | — | — | keyboard | `onClose()` |

---

## CTAs GLOBAUX NON-NAVIGANTS (état local uniquement)

| Composant | CTA | Effet |
|---|---|---|
| ConfChip | clic | ouvre/ferme popover |
| ConfChip | X (dans popover) | ferme popover |
| WhyInline | clic | expanse/collapse inline |
| Drawer | X | `onClose()` |
| Drawer | backdrop | `onClose()` |
| Card (avec onClick) | clic | déclenche onClick défini |
| Accordion | toggle | open/close (état local) |

---

## RÉSUMÉ — ACTIONS NO-OP (stubs présents)

| Écran | CTA | Label |
|---|---|---|
| Composer | Paperclip | Attacher |
| Composer | Mic | Voix |
| Work header | MoreHorizontal | Overflow menu |
| WorkOverviewTab | "Open" | Prochaine action |
| WorkSourcesTab | "Add" (sources manquantes) | Ajouter source |
| WorkSourcesTab | "Refresh" | Rafraîchir source |
| WorkDeliverablesTab | Eye | Prévisualiser |
| WorkActivityTab | "Post" | Poster commentaire |
| DecisionReceiptView | "Share receipt" | Partager |
| DecisionReceiptView | "Export" | Exporter |
| NavRail | Bell | Notifications |
| NavRail | HelpCircle | Aide |
| NavRail | Settings | Paramètres |
| NavRail | User row | Profil |
| GlobalDeliverablesView | "Create" | Créer livrable |
| GlobalDeliverablesView | Eye | Prévisualiser |
| GlobalDeliverablesView | Download | Télécharger |
