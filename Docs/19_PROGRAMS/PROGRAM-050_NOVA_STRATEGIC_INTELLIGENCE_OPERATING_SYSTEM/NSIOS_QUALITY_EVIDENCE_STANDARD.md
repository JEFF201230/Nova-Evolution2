# NSIOS Quality & Evidence Standard

## 1. Normative language

`MUST`, `MUST NOT`, `SHOULD`, `MAY` are normative. A mission is NSIOS-conformant only when all applicable MUST requirements pass or an explicit authorized waiver is recorded.

## 2. Statement classification

Every material statement MUST be classifiable as:

| Class | Definition | Required marker |
|---|---|---|
| FACT | directly stated/observed in evidence | source, date, scope |
| CALCULATED | deterministic transformation of inputs | formula, units, inputs |
| HYPOTHESIS | testable proposition not yet established | test and falsifier |
| INFERENCE | reasoned interpretation of facts/models | reasoning and confidence |
| RECOMMENDATION | proposed action | findings, alternatives and conditions |
| DECISION | action authorized by accountable human | authority and date |

An AI-generated statement is never a source. It inherits no higher status than its underlying evidence.

## 3. Confidence model

Score six dimensions from 0 to 4:

- **P — Provenance:** unknown → authoritative/direct.
- **I — Independence:** single interested source → multiple independent origins.
- **R — Recency:** outside freshness need → current at decision date.
- **D — Directness:** proxy → direct measurement/record.
- **C — Consistency:** materially contradicted → reconciled convergence.
- **V — Coverage:** anecdotal/gapped → representative/complete for scope.

```text
Confidence score = (P + I + R + D + C + V) / 24 × 100
```

Critical floor rule: if provenance or directness equals 0, confidence cannot exceed C1 regardless of average.

| Level | Score | Meaning | Decision use |
|---|---:|---|---|
| C0 | 0–19 | unknown/unsupported | cannot support action |
| C1 | 20–39 | weak | exploration only |
| C2 | 40–59 | partial | conditional option/experiment |
| C3 | 60–79 | decision-usable | action with controls |
| C4 | 80–100 | strong within scope | supports material decision |

Confidence is not probability of truth. It describes evidence strength for the defined claim and scope.

## 4. Freshness windows

| Information | Default window | Rule |
|---|---:|---|
| live price, executive, law in force, funding, product availability | 30 days | revalidate at delivery |
| SaaS pricing/packaging, competitor feature, security status | 90 days | official confirmation preferred |
| customer/review sentiment | 12 months | preserve review period/sample |
| audited annual financial | latest filing | note reporting lag |
| market size/demography | latest authoritative release | disclose reference year |
| stable framework/history | no fixed expiry | check version/supersession |

Mission context may shorten but not silently extend a freshness window.

## 5. Citation standard

Each material fact MUST cite the closest supporting source. Citation MUST point to the primary page/document where available, not a search result. For files: path, document title, page/sheet/section and version. For data: dataset/table/field/query and extraction date. For interviews: role, date, method and anonymization.

Quotes SHOULD be minimal; analysis MUST be original and source limits respected.

## 6. Quantitative quality

Every material number MUST expose:

- definition and business meaning;
- numerator/denominator;
- unit, currency, tax and nominal/real basis;
- period and cohort;
- source or formula;
- rounding;
- missing-data treatment;
- scenario and confidence.

Models MUST contain:

1. assumptions separated from formulas;
2. no unexplained hard-coded output;
3. unit/time consistency checks;
4. reconciliation to source totals;
5. independent reproduction of critical outputs;
6. sensitivity of decision-driving inputs;
7. version and owner;
8. limitations/model card.

## 7. Research quality gates

| Gate | PASS | FAIL |
|---|---|---|
| Scope | decision boundary explicit | broad topic without decision |
| Coverage | actor/source saturation and gaps disclosed | “exhaustive” without stop rule |
| Provenance | primary origin located where possible | aggregator used as sole material proof |
| Triangulation | independent routes for material claims | duplicate syndication counted twice |
| Contradiction | reconciled or disclosed | inconvenient source omitted |
| Recency | unstable facts refreshed | stale price/law/executive used as current |
| Sampling | population and bias disclosed | reviews/interviews generalized blindly |

## 8. Analytical quality gates

| Gate | PASS | FAIL |
|---|---|---|
| Causality | mechanism and alternatives tested | correlation narrated as cause |
| Framework fit | chosen framework answers question | framework inventory without decision value |
| Alternatives | status quo and credible options | predetermined recommendation |
| Economics | volumes, timing, cash and constraints | target-driven totals |
| Feasibility | product/technology/organization linked | commercial upside detached from delivery |
| Uncertainty | ranges, scenarios, switch points | one precise forecast |
| Adversarial | bear case and disconfirming evidence | advocacy memo |

## 9. Recommendation quality

A recommendation MUST answer:

- what exactly should be done or not done;
- why this dominates credible alternatives;
- what evidence supports it and at what confidence;
- what must be true;
- what it costs and when value arrives;
- who owns execution;
- dependencies and irreversible commitments;
- leading KPI, lagging KPI and review date;
- kill/pause/escalation criteria;
- what new evidence would reverse it.

Recommendations MUST NOT use “best”, “optimal”, “market-leading” or equivalent without declared comparison set, metric and proof.

## 10. Red-team protocol

For M3/M4, a reviewer independent of the main synthesis MUST:

1. restate the decision and thesis without consulting the recommendation conclusion;
2. identify the three strongest failure modes;
3. search for disconfirming evidence;
4. challenge source independence and missing actors;
5. reproduce critical model outputs;
6. run downside and parameter switching tests;
7. write the strongest case for the rejected alternative;
8. record unresolved dissent.

The mission lead may respond but MUST NOT delete the dissent record.

## 11. Bias controls

| Bias | Control |
|---|---|
| Confirmation | falsification tests and disconfirming search |
| Anchoring | independent bottom-up model before reviewing target forecast where possible |
| Availability | systematic universe and source map |
| Survivorship | failures, churned customers and no-decision included |
| Selection | sampling frame and response analysis |
| Base-rate neglect | outside view and reference class |
| Sunk cost | status quo/exit option and forward economics |
| Automation | human review, underlying source inspection, reproducibility |
| Precision | ranges, significant digits and confidence |
| Sponsor advocacy | explicit decision rights and reviewer independence |

## 12. Scoring and certification

Score ten domains 0–5: mandate, sources, fact base, market/customer, product/technology, finance/model, alternatives, uncertainty, traceability, decision/execution.

| Grade | Weighted score | Condition |
|---|---:|---|
| A — Committee-ready | ≥4.5 | no critical gate fail; M3/M4 independent review |
| B — Decision-ready | ≥4.0 | no critical fail; limitations controlled |
| C — Directional | ≥3.0 | usable only for reversible/conditional action |
| D — Incomplete | ≥2.0 | additional diligence required |
| E — Rejected | <2.0 | cannot support decision |

Any critical failure caps the mission at D regardless of average.

## 13. Critical rejection conditions

- fabricated or unverifiable source;
- material number without basis;
- current claim based on stale unverified data;
- hidden contradiction affecting decision;
- revenue/market/valuation reverse-engineered from desired result;
- fact and hypothesis deliberately conflated;
- material model cannot be reproduced;
- legal/cyber/accounting assurance claimed without authority;
- recommendation predetermined before alternatives;
- confidential or personal data used outside authorized scope;
- decision attributed to NOVA rather than accountable human.

## 14. Deliverable release checklist

- [ ] All applicable gates pass.
- [ ] Source and assumption registers frozen with version.
- [ ] Critical calculations independently reproduced.
- [ ] Links and file references resolve.
- [ ] Confidence and limitations appear in executive layer.
- [ ] Red-team dissent is closed or visible.
- [ ] Recommendation has owner, KPI, conditions and review date.
- [ ] Quality grade and reviewer are recorded.
- [ ] No statement exceeds the strength of its evidence.

## 15. Post-release correction

Corrections MUST be additive and versioned. Preserve original decision record, identify affected claims/models/recommendations, assess decision impact, notify authority and schedule re-decision when material.
