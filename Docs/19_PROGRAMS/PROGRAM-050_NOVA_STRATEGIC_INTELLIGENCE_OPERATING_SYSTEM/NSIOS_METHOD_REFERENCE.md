# NSIOS Method Reference

## 1. Universal analytical protocol

### Step 1 — Frame the decision

Convert the request into one decision sentence: `Should [authority] do [action] for [scope] by [date], given [constraints]?`

Define success, status quo, irreversibility, decision deadline, evidence cut-off and excluded questions. A broad topic such as “analyze the market” is not a valid decision.

### Step 2 — Build the issue tree

- decompose the decision into mutually exclusive, collectively sufficient branches where possible;
- distinguish necessary conditions from desirable conditions;
- identify 3–7 priority hypotheses;
- assign a proof test and decision impact to each hypothesis;
- rank by `decision impact × uncertainty ÷ effort`.

### Step 3 — Design the evidence plan

For each hypothesis define: evidence needed, preferred primary source, independent corroboration, sample, freshness, extraction method, fallback and stop rule.

### Step 4 — Establish the fact base

Extract atomic facts, preserve units and dates, reconcile conflicts, record missing data and never mix facts with interpretation in the same field.

### Step 5 — Analyze and model

Apply only frameworks that answer a branch of the issue tree. Build transparent models from operational drivers, not target outputs.

### Step 6 — Generate alternatives

Include status quo, minimum viable action, recommended action and at least one structurally different alternative. For M3/M4, include “do not proceed”.

### Step 7 — Challenge

Run sensitivity, scenario, pre-mortem, contradiction review, outside-view benchmark and red-team questions. Define what evidence would reverse the recommendation.

### Step 8 — Decide and operationalize

State one recommendation, conditions, rejected options, leading KPIs, owner, cost, benefits, dependencies, kill criteria and review date.

## 2. Research and evidence method

### 2.1 Source sequence

1. authoritative internal records and signed documents;
2. regulator, law, official registry, audited filing;
3. official vendor/product/investor documentation;
4. peer-reviewed or recognized standard body;
5. reputable independent press and disclosed-method research;
6. interviews, surveys, expert calls;
7. reviews, forums and communities as pain-point signals only.

### 2.2 Search protocol

- Create a query matrix by entity × topic × document type × geography × date.
- Search aliases, former names, parent/subsidiary and local language.
- Capture negative evidence: unavailable price, discontinued feature, contradictory claim.
- Follow source links to the primary document.
- Stop only when incremental searches add no material actor, claim or contradiction across three consecutive search families.

### 2.3 Triangulation

A material conclusion should combine at least two of:

- authoritative/official evidence;
- independent secondary evidence;
- primary research;
- internal operational data;
- model-derived evidence.

Two sites copying the same press release count as one origin.

### 2.4 Contradiction protocol

1. Preserve both claims.
2. Compare scope, metric definition, geography, currency, tax, period and publication date.
3. Locate the earliest common origin.
4. Prefer direct, recent, audited and scope-matched evidence.
5. If unresolved, present a range or branches and reduce confidence.

### 2.5 Primary research

| Method | Best use | Minimum control |
|---|---|---|
| Customer interview | JTBD, decision process, pain | script, sample logic, verbatim notes, saturation |
| Expert interview | niche market and regulation | conflict disclosure, corroboration |
| Survey | prevalence and segmentation | sampling frame, question order, response bias |
| Win/loss review | competitor and pricing | include losses/no-decision, standardized coding |
| Mystery shopping | packaging and sales process | legal/ethical review, identical scenario |
| Product test | functionality and UX | reproducible task script and evidence capture |

## 3. Market intelligence

### 3.1 Market definition

Define need, customer, buyer, use case, product boundary, geography, channel, price basis and time. Distinguish market, ecosystem, adjacent market and theoretical universe.

### 3.2 TAM / SAM / SOM

Use at least two methods when material:

- **top-down:** authoritative population × eligible rate × annual spend;
- **bottom-up:** count of target accounts × operational units/account × price;
- **value theory:** quantified customer value × capturable share;
- **capacity constrained SOM:** leads × conversion × delivery capacity × retention.

Required reconciliation:

```text
TAM ≥ SAM ≥ SOM
SOM ≤ addressable accounts × realistic penetration
SOM revenue = customers × units/customer × net price × active fraction
```

Never apply an unexplained percentage to TAM to create SOM.

### 3.3 Segmentation

Segments must be measurable, reachable, economically distinct and actionable. Score each on size, growth, urgency, willingness to pay, competitive intensity, CAC, retention, delivery complexity, regulation and strategic fit.

### 3.4 Maturity and dynamics

Assess adoption curve, standardization, switching cost, channel power, consolidation, regulation, technology substitution and profit pool migration. Use leading indicators, not only historical CAGR.

### 3.5 Regulation, innovation and AI

For each change: effective date, jurisdiction, affected actor, obligation, enforcement, technical dependency, cost, opportunity and confidence. Separate enacted rule, proposed rule and commentary.

AI analysis must cover data rights, model dependency, evaluation, human oversight, unit cost, latency, security, hallucination impact, regulation and fallback.

## 4. Competitive intelligence

### 4.1 Competitor universe

Classify direct, adjacent, substitute, internal/manual, partner-coopetitor and emerging entrant. “No purchase” is a competitor when it explains lost decisions.

### 4.2 Canonical competitor record

| Domain | Required fields |
|---|---|
| Identity | legal entity, brands, history, countries, ownership, governance, leaders |
| Scale | revenue, funding, headcount, customers, users, geography, source/date |
| Business model | buyer, user, payer, revenue streams, unit, contract, channel |
| Product | architecture visible, modules, workflows, mobile, API, integrations, AI |
| Trust | security claims, certifications, privacy, SLA, incidents |
| Commercial | public/list/realized price, discount, onboarding, minimum, term |
| Customer | segments, references, adoption, reviews, recurrent pain points |
| Ecosystem | partners, marketplace, acquisitions, distribution |
| Strategy | positioning, moat, roadmap signals, strengths, weaknesses |
| Implication | threat, opportunity, easy/hard to beat, avoid/partner/attack |

### 4.3 Pricing normalization

Normalize currency, tax, period, billing unit, included capacity, minimum, onboarding, mandatory options, commitment and discount. Show both contractual invoice and comparable economic unit. Never convert “on request” into a price estimate without a labeled model.

### 4.4 Competitive scoring

Score evidence-backed dimensions 0–5 and show weights. Do not average unknowns as zero. Report coverage separately:

```text
Weighted score = Σ(score × weight) / Σ(weights with evidence)
Coverage = Σ(weights with evidence) / Σ(all weights)
```

## 5. Product intelligence and large-scale functional benchmark

### 5.1 Taxonomy for hundreds of features

Use a five-level hierarchy:

`Domain → Capability → Workflow → Feature → Atomic requirement`.

Each atomic requirement has: ID, persona, job, trigger, input, rule, output, exception, permission, evidence, maturity and importance.

### 5.2 Evidence states

| State | Meaning |
|---|---|
| 0 Unknown | no reliable evidence |
| 1 Claimed | marketing statement only |
| 2 Demonstrated | reproducible demo/documentation |
| 3 Available | production access and normal workflow |
| 4 Proven | usage/adoption/performance evidence |
| 5 Differentiating | proven and materially superior |

Do not encode features only as yes/no. Capture quality, depth, limits, configuration, integration, UX and proof level.

### 5.3 Functional benchmark schema

`FEATURE-ID | taxonomy | JTBD | importance | competitor | evidence state | depth 0–5 | UX 0–5 | integration 0–5 | limits | source | date | confidence`

Aggregate only after reporting coverage and critical gaps. A broad shallow suite must not outrank a narrow excellent product without explicit weights.

### 5.4 Product diligence

- problem and ICP evidence;
- activation and time-to-value;
- usage depth/frequency and cohort retention;
- roadmap credibility and discovery process;
- build/buy/partner dependencies;
- accessibility, localization and support;
- defensibility through data, workflow, network, switching and learning;
- product economics and support load.

## 6. UX intelligence

Use task-based evaluation with representative personas. Measure success, time, errors, abandonment, assistance, accessibility and perceived confidence. Combine heuristic inspection with observed behavior; a heuristic score alone is not user evidence.

Minimum journey: discovery → evaluation → onboarding → core job → exception → support → renewal/exit. Record severity as frequency × impact × persistence.

## 7. Technology and architecture intelligence

Assess:

1. strategic fit and roadmap linkage;
2. architecture boundaries and coupling;
3. scalability, performance and resilience;
4. code quality, testability and technical debt;
5. data architecture, lineage, quality and portability;
6. SDLC, release, observability and incident learning;
7. cloud/hosting economics and concentration;
8. integrations and API lifecycle;
9. organization, skills, bus factor and governance;
10. remediation cost, sequence and impact on thesis.

Every red flag must include business effect and remediation range. “Legacy” is not a finding without a measurable consequence.

## 8. Cyber, privacy and AI intelligence

Use NIST CSF 2.0 outcome families and OWASP ASVS requirements appropriate to the application. Examine governance, asset/data inventory, IAM, secure development, vulnerability management, logging/detection, incident response, recovery, supplier risk, privacy, insurance and evidence of control operation.

Distinguish design, implementation and operating effectiveness. A policy document proves design intent, not control operation.

AI-specific checks: model/data inventory, lawful basis, evaluation set, prompt/data leakage, output controls, model drift, red teaming, human escalation, provider exit and incident response.

## 9. Financial intelligence

### 9.1 Model discipline

- separate assumptions, calculations and outputs;
- one unit and one time basis per line;
- revenue driven by price × volume × timing × retention;
- cash separated from revenue recognition;
- balance sheet, P&L and cash flow reconciled where applicable;
- base, upside, downside and stress cases;
- model checks visible and zero-balanced.

### 9.2 SaaS formulas

```text
MRR = Σ recurring monthly contract value of active customers
ARR = 12 × MRR, excluding non-recurring revenue
Logo churn = lost customers / opening customers
Gross revenue churn = lost recurring revenue / opening recurring revenue
NRR = (opening MRR − churn − contraction + expansion) / opening MRR
ARPA = recurring revenue / average active accounts
Gross margin = (revenue − directly attributable COGS) / revenue
CAC = fully loaded acquisition spend / new customers
CAC payback months = CAC / monthly gross profit from new customer
LTV = ARPA × gross margin / monthly revenue churn
Burn rate = cash operating outflows − cash operating inflows
Runway months = unrestricted cash / net monthly burn
Rule of 40 = revenue growth % + EBITDA margin %
```

Disclose whether CAC is blended/new/paid/channel, whether churn is logo or revenue, and whether LTV assumes constant retention. Never compare inconsistent definitions.

### 9.3 Business plan

Minimum drivers: leads, funnel, cycle, new customers, retention, price/mix, expansion, services, headcount, compensation, COGS, cloud/AI, working capital, capex, financing, tax and cash. Recruitment must be triggered by capacity or milestone, not inserted only to fit growth.

### 9.4 DCF and valuation

```text
FCFF = EBIT × (1 − tax rate) + D&A − capex − ΔNWC
Terminal value (perpetuity) = FCFF(n+1) / (WACC − g)
Enterprise value = PV(FCFF) + PV(terminal value)
Equity value = enterprise value + cash − debt − debt-like items
```

Triangulate DCF with market multiples and transaction/financing reality. Disclose WACC, terminal growth, terminal share of EV, dilution, net debt, liquidity discounts and sensitivity. IFRS 13 is a fair-value framework, not permission to label a startup model “IFRS valuation”.

### 9.5 Quality of earnings

Reconcile reported EBITDA to normalized EBITDA; separate recurring/non-recurring, owner adjustments, run-rate changes, capitalized costs, revenue recognition, concentration, deferred revenue, working capital, debt-like and off-balance-sheet items.

## 10. Strategic intelligence

### 10.1 Choice architecture

Strategy is a coherent set of choices: where to play, how to win, capabilities required, management systems and what not to do. A list of initiatives is not a strategy.

### 10.2 Framework selection

- Porter for industry structure, not internal capability.
- PESTEL for external change, not prioritization by itself.
- SWOT only after evidence; convert to actions.
- VRIO for resources/capabilities and durability.
- Ansoff for growth direction and risk.
- Blue Ocean for non-customers/value curve, not market proof.
- BCG/GE for portfolio allocation when comparable units exist.
- 7S for organizational alignment.
- JTBD/VPC for customer problem and value.
- BMC for business-model coherence.
- OKR/Balanced Scorecard for execution, not strategy discovery.

### 10.3 Recommendation logic

Rank alternatives against explicit criteria: strategic fit, customer value, economics, feasibility, time, reversibility, risk, capabilities and option value. Show weights, raw scores, evidence coverage and sensitivity to weights. The highest score does not automatically win if a critical gate fails.

## 11. Scenario, sensitivity and uncertainty

### 11.1 Definitions

- **Sensitivity:** changes one input to measure output response.
- **Scenario:** coherent joint state of multiple drivers.
- **Stress test:** extreme but plausible condition testing survival.
- **Simulation:** distribution of outcomes from parameter distributions.

### 11.2 Required cases

| Case | Purpose |
|---|---|
| Status quo | opportunity cost and natural trajectory |
| Base | most defensible central path |
| Upside | feasible outperformance with stated triggers |
| Downside | weaker demand/execution |
| Stress | survival, liquidity and covenant constraints |

Show switching variables: the threshold at which the preferred option changes.

## 12. Synthesis and communication

Use answer-first structure:

1. decision and recommendation;
2. three to five governing reasons;
3. evidence and economics;
4. risks and disconfirming evidence;
5. actions, owners and gates.

Every page/section has one message title. Tables show units, period, source and definitions. Appendices preserve detail; they do not hide critical caveats.

## 13. Learning and post-decision review

Record predicted outcomes, confidence, assumptions and signposts. At the review date compare actual vs predicted, attribute variance to data, model, execution or external change, and update the method—not the historical record.
