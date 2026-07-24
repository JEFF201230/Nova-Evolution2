# NSIOS Method Libraries

## 1. Framework library

Frameworks are selected by question. They do not create evidence and may not be stacked merely to appear comprehensive.

| Framework | Decision question | Inputs | Output | Use when | Do not use when / limit |
|---|---|---|---|---|---|
| Issue tree / MECE | What must be true to decide? | decision, constraints | structured questions | every non-trivial mission | artificial MECE hides interactions |
| Hypothesis ledger | What is believed and how can it fail? | issue tree | prioritized tests | uncertainty is material | assertion cannot be falsified |
| TAM/SAM/SOM | How large is accessible demand? | accounts, units, price, eligibility | market envelope | market/growth/pricing | unexplained top-down percentages |
| PESTEL | Which external forces matter? | policy, economy, society, tech, environment, law | change map | long-horizon external scan | static list without impact/time |
| Porter Five Forces | Where does industry profitability go? | buyers, suppliers, rivals, entrants, substitutes | structural attractiveness | defined industry | ecosystem boundary unstable |
| Strategic group map | Who competes on similar dimensions? | competitor variables | clusters/white spaces | many competitors | axes chosen to force conclusion |
| SWOT/TOWS | How do internal/external factors combine? | prior evidence | action options | synthesis | used as primary research |
| VRIO | Which capability can sustain advantage? | resources, evidence | parity/temporary/sustained advantage | capability strategy | capability not operationally proven |
| Ansoff | Which growth direction and risk? | markets/products | growth options | portfolio growth | without economics/capability tests |
| Blue Ocean / ERRC | Can value and cost curve be reconstructed? | non-customers, factors, costs | strategy canvas, ERRC | industry convergence | demand not validated |
| BCG Matrix | How allocate among business units? | share, growth, cash | portfolio roles | comparable established units | startups/markets with weak share data |
| GE/McKinsey Matrix | Which portfolio bets deserve resources? | attractiveness, strength | weighted portfolio | multi-business portfolio | weights/scores unsupported |
| McKinsey 7S | Is organization aligned? | strategy, structure, systems, skills, staff, style, shared values | alignment gaps | execution/change | market strategy discovery |
| Business Model Canvas | Is the model coherent? | segments through costs/revenues | model map | model design | financial validation absent |
| Value Proposition Canvas | Do pains/gains match offer? | jobs, pains, gains, features | fit hypotheses | discovery/positioning | treated as adoption proof |
| JTBD | What progress drives choice? | interviews/behavior | jobs and forces | innovation/product | demographic-only segmentation |
| Kano | Which attributes satisfy/delight? | customer research | feature categories | prioritization | no representative sample |
| RICE / WSJF | Which initiatives first? | reach/impact/confidence/effort or cost of delay | ranked backlog | execution portfolio | scores replace strategic gates |
| OKR | What measurable change this cycle? | strategy and baseline | objectives/key results | execution | objective used as task list |
| Balanced Scorecard | Is execution balanced? | financial/customer/process/learning | strategy measures | mature execution | excessive lag indicators |
| Scenario planning | What coherent futures alter choice? | critical uncertainties | scenarios/signposts | high uncertainty | simple +/- budget sensitivity |
| System dynamics | What feedback causes non-linear outcomes? | stocks, flows, loops, delays | causal/quantitative model | complex dynamic system | insufficient causal evidence |
| Real options | What is the value of staged commitment? | uncertainty, milestones, costs | stage/expand/abandon logic | reversible experiments | used to excuse indecision |
| DCF | What is present value of cash generation? | FCFF, WACC, terminal | EV/equity range | forecastable cash flows | early venture as sole method |
| Comparable multiples | How does market price similar assets? | normalized metrics/peers | valuation range | comparable economics | weak peer comparability |
| Cohort analysis | How behavior changes by start period? | event/customer data | retention/expansion curves | SaaS/product | aggregate data only |
| NIST CSF profile | What cyber outcomes exist/gap? | current/target evidence | gap profile | cyber governance | used as certification claim |
| OWASP ASVS | Which app controls are verifiable? | app/control evidence | requirement results | web app security | version omitted |

## 2. Matrix library

### 2.1 Claim–evidence matrix

| Claim ID | Atomic claim | Type | Evidence IDs | Contradiction | Calculation | Confidence | Decision impact |
|---|---|---|---|---|---|---|---|

### 2.2 Hypothesis test matrix

| Hypothesis | Why material | Confirming observation | Falsifying observation | Test | Owner | Deadline | Result |
|---|---|---|---|---|---|---|---|

### 2.3 Source reconciliation matrix

| Metric/claim | Source A | Source B | Definition gap | Date/scope gap | Retained value | Rationale |
|---|---|---|---|---|---|---|

### 2.4 Segment attractiveness matrix

| Segment | Accounts | Spend | Growth | Pain | WTP | CAC | Retention | Complexity | Regulation | Fit | Confidence |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|

### 2.5 Competitor matrix

| Competitor | Target | Business model | Price unit | Product depth | Distribution | Moat | Weakness | Threat | VEEDDA/NOVA implication | Coverage |
|---|---|---|---|---:|---:|---|---|---:|---|---:|

### 2.6 Functional benchmark matrix

| Feature ID | Domain/capability | Importance | Product | Evidence state | Depth | UX | Integration | Limitation | Source | Confidence |
|---|---|---:|---|---:|---:|---:|---:|---|---|---:|

### 2.7 Pricing architecture matrix

| Scenario | Unit | Entry | Mid | High | Minimum | Onboarding | Discount | COGS | GM | Conversion | Churn | Upsell | Risk |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|

### 2.8 Strategic alternatives matrix

| Alternative | Fit | Customer value | Economics | Feasibility | Time | Reversibility | Risk | Coverage | Critical gate | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|

### 2.9 Risk matrix

| Risk | Cause | Event | Consequence | Likelihood | Impact | Velocity | Detectability | Control | Residual | Owner | Trigger |
|---|---|---|---|---:|---:|---:|---:|---|---:|---|---|

### 2.10 Technology thesis matrix

| Commercial assumption | Required capability | Current evidence | Gap | Cost range | Time | Dependency | Thesis impact |
|---|---|---|---|---:|---:|---|---|

### 2.11 Scenario matrix

| Driver | Status quo | Base | Upside | Downside | Stress | Source/logic | Switching threshold |
|---|---:|---:|---:|---:|---:|---|---:|

### 2.12 Recommendation traceability matrix

| Recommendation | Finding IDs | Evidence IDs | Alternative rejected | Expected value | Cost | KPI | Kill criterion | Review date |
|---|---|---|---|---:|---:|---|---|---|

## 3. Checklist library

### 3.1 Mission start

- [ ] One decision and one named authority.
- [ ] Included/excluded scope and evidence cut-off.
- [ ] Materiality class M1–M4.
- [ ] Lead mode and supporting modes.
- [ ] Deliverable, deadline and acceptance criteria.
- [ ] Confidentiality, conflicts and access limits.
- [ ] Status quo and decision alternatives identified.

### 3.2 Research

- [ ] Search matrix includes aliases, former names and local languages.
- [ ] Primary sources used before aggregators.
- [ ] Publication date and access date recorded.
- [ ] Units, tax, currency, geography and period preserved.
- [ ] Copied sources deduplicated to common origin.
- [ ] Contradictory and negative evidence retained.
- [ ] Stop rule satisfied.

### 3.3 Market

- [ ] Boundary and buyer/user/payer defined.
- [ ] TAM/SAM/SOM bottom-up and reconciled.
- [ ] Segment economics and reachability measured.
- [ ] Demand drivers and inhibitors evidenced.
- [ ] Regulation status distinguished: enacted/proposed/commentary.
- [ ] Outside view and substitutes included.
- [ ] SOM capacity-constrained.

### 3.4 Competitor

- [ ] Direct, adjacent, substitutes and no-decision covered.
- [ ] Prices normalized with minima/options/term.
- [ ] Product claims separated from demonstrated features.
- [ ] Ownership, funding, acquisitions and partnerships dated.
- [ ] Reviews coded by recurrent pain, not anecdote count alone.
- [ ] Threat/partner/avoid/attack conclusion explicit.

### 3.5 Product and UX

- [ ] ICP and JTBD supported by behavior/interviews.
- [ ] Functional taxonomy atomic and non-overlapping.
- [ ] Feature evidence states used, not binary marketing claims.
- [ ] Activation, retention, adoption and exceptions assessed.
- [ ] Representative tasks and personas tested.
- [ ] Accessibility, support and migration included.
- [ ] Roadmap items excluded from current availability.

### 3.6 Technology

- [ ] Architecture diagram matches deployed system.
- [ ] Scale/performance claims tested against requirements.
- [ ] Code quality and debt linked to business impact.
- [ ] Data lineage, portability and quality sampled.
- [ ] SDLC, tests, release and incident evidence reviewed.
- [ ] Cloud concentration, COGS and exit assessed.
- [ ] Team capacity and bus factor reviewed.
- [ ] Remediation cost/time included in business case.

### 3.7 Cyber/AI

- [ ] Governance and risk appetite documented.
- [ ] Asset, data, identity and supplier inventories sampled.
- [ ] Control design distinguished from operation.
- [ ] Vulnerability, detection, incident and recovery evidence tested.
- [ ] NIST target/current profiles established where appropriate.
- [ ] ASVS version and requirement IDs recorded.
- [ ] AI models/data/prompts/evaluations/human escalation inventoried.
- [ ] Residual risks accepted only by named authority.

### 3.8 Finance and SaaS

- [ ] Source accounting data reconciled.
- [ ] Recurring and non-recurring revenue separated.
- [ ] ARR/MRR/churn/NRR/CAC definitions explicit.
- [ ] Cohorts and concentration analyzed.
- [ ] Revenue driven by operational volumes.
- [ ] P&L, cash and balance sheet consistent.
- [ ] Working capital, capex, tax and financing included.
- [ ] Base/upside/downside/stress calculated.
- [ ] Formula checks and sensitivity present.
- [ ] Valuation triangulated and terminal value disclosed.

### 3.9 Due diligence / investment committee

- [ ] Investment rationale and price/terms stated.
- [ ] Management plan independently reconstructed.
- [ ] Customer evidence includes losses and churn.
- [ ] Commercial upside linked to delivery capability.
- [ ] QoE, working capital and debt-like items assessed.
- [ ] Legal/tax/regulatory items escalated to qualified professionals.
- [ ] Bear case, return downside and liquidity modeled.
- [ ] Deal breakers, conditions precedent and 100-day actions explicit.
- [ ] Recommendation can be invest/pass/defer/conditional.

### 3.10 Final quality review

- [ ] Executive answer matches detailed evidence.
- [ ] Every material number has unit, period, formula and source.
- [ ] Facts, hypotheses, inference and recommendation visibly separated.
- [ ] Confidence and limitations stated.
- [ ] Rejected alternatives and contrary evidence included.
- [ ] No unsupported superlative or false precision.
- [ ] Links/files resolve and versions are frozen.
- [ ] Independent reviewer signed critical gates.

## 4. Indicator library

### 4.1 Evidence and quality

| Indicator | Formula / definition | Target |
|---|---|---:|
| Source coverage | material claims with evidence / material claims | 100 % |
| Triangulation rate | material claims with ≥2 independent routes / material claims | ≥80 % M2; ≥95 % M3/M4 |
| Primary-source ratio | claims supported by Tier A/B source / sourced claims | ≥70 % where available |
| Freshness compliance | unstable facts within freshness window / unstable facts | 100 % |
| Traceability coverage | recommendations linked to findings and evidence / recommendations | 100 % |
| Model reproducibility | sampled outputs independently reproduced / sampled outputs | 100 % critical outputs |
| Contradiction closure | resolved or disclosed contradictions / material contradictions | 100 % |
| Evidence coverage score | weighted fields with evidence / all weighted fields | reported, never hidden |

### 4.2 Market and commercial

| Indicator | Definition |
|---|---|
| Market growth | consistent-basis period growth, nominal/real stated |
| Penetration | active users or customers / eligible base |
| Win rate | wins / eligible closed decisions; no-decision separate |
| Sales velocity | opportunities × win rate × ACV / cycle length |
| Price realization | realized net price / list price |
| CAC | fully loaded acquisition spend / new logos |
| Payback | CAC / monthly gross profit from cohort |
| Pipeline coverage | qualified pipeline / target bookings |
| Concentration | top 1/5/10 revenue and HHI where useful |

### 4.3 Product and UX

| Indicator | Definition |
|---|---|
| Activation | accounts reaching defined first value / new accounts |
| Time-to-value | median time from start to value event |
| Feature adoption | active eligible users/accounts using feature |
| Task success | completed representative tasks / attempted tasks |
| Error/assistance | critical errors or help events per task |
| Retention | cohort active at period n / starting cohort |
| NRR | retained recurring revenue including expansion / opening recurring revenue |
| Support burden | support hours or tickets / active account |

### 4.4 Technology and cyber

| Indicator | Definition |
|---|---|
| Deployment frequency | production deployments per period |
| Lead time | commit-ready to production time |
| Change failure rate | deployments causing failure/remediation / deployments |
| MTTR | median restore time |
| Availability | successful service time / committed time, exclusions stated |
| Cost to serve | attributable hosting/support/third-party cost / account or revenue |
| Critical vulnerability age | days open by severity |
| Control operating coverage | controls with operating evidence / applicable controls |
| RTO/RPO test result | achieved recovery versus target |

### 4.5 Financial and investment

| Indicator | Definition |
|---|---|
| ARR/MRR | recurring contracted revenue normalized to year/month |
| Gross margin | revenue less attributable COGS / revenue |
| EBITDA margin | EBITDA / revenue, adjustments disclosed |
| FCF | cash from operations less capex, exact convention stated |
| Burn multiple | net burn / net new ARR |
| Runway | unrestricted cash / net monthly burn |
| LTV/CAC | gross-profit LTV / fully loaded CAC |
| Rule of 40 | revenue growth % + EBITDA margin % |
| MOIC | value realized/unrealized / invested capital |
| IRR | discount rate making investment cash-flow NPV zero |
| DSCR | cash available for debt service / debt service |
| Downside survival | months/covenant headroom under stress case |

## 5. Deliverable library

| Deliverable | Decision served | Mandatory sections | Maximum executive layer |
|---|---|---|---:|
| Rapid strategic brief | screen / orient | decision, facts, options, risks, next gate | 2 pages |
| Market intelligence report | enter / invest / prioritize | boundary, sizing, segments, trends, competition, scenarios | 5 pages |
| Competitive battlecard | sell / position | competitor, triggers, claims, proof, objections, traps | 2 pages each |
| Product benchmark | build / buy / differentiate | taxonomy, evidence state, coverage, critical gaps | 5 pages + matrix |
| Pricing study | package / price | WTP, benchmark, costs, architectures, elasticity, recommendation | 5 pages |
| Business plan | finance / execute | assumptions, revenue engine, P&L, cash, balance, scenarios, funding | 10 pages + model |
| CDD report | transact | thesis, market, customer, competition, plan, risks, value creation | 10 pages + appendix |
| TDD report | transact / remediate | architecture, product, data, SDLC, security, team, cost/roadmap | 10 pages + evidence |
| Investment memo | invest / pass | ask, thesis, company, market, product, team, economics, valuation, risks, returns | 10 pages |
| Banking case | lend | purpose, historic, forecast, debt service, collateral, covenants, downside | 8 pages |
| Decision memo | approve / reject | answer, rationale, alternatives, risks, conditions, owner | 3 pages |
| Value creation plan | execute | initiatives, baseline, value, owner, milestones, dependencies, KPI | 5 pages + tracker |
| Red-flag report | stop / escalate | critical finding, evidence, impact, required action | 2 pages |
| Post-decision review | learn | prediction, actual, variance, cause, method update | 3 pages |

## 6. Canonical investment memo outline

1. Decision requested and terms.
2. One-page thesis and recommendation.
3. Company, ownership, governance and team.
4. Market, segmentation and demand.
5. Customer evidence, concentration and retention.
6. Product, technology, cyber and roadmap.
7. Business model, unit economics and financial quality.
8. Plan reconstruction and scenarios.
9. Valuation, capital structure, return and exit.
10. Risks, bear case, deal breakers and mitigations.
11. Value creation plan and first 100 days.
12. Conditions, dissenting view and committee decision.
