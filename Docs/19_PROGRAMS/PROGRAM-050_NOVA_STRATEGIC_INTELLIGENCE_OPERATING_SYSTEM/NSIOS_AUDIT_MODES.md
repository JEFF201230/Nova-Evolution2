# NSIOS Audit Modes

## 1. Mode selection

Every mission declares one lead mode and zero or more supporting modes. `Audit Due Diligence` is an orchestration mode; it does not replace specialist workstreams.

| Mode | Lead decision | Default materiality |
|---|---|---:|
| Audit Strategy | choose where/how to win | M2 |
| Audit Market | enter, invest or prioritize | M2 |
| Audit Product | build, buy, improve or retire | M2 |
| Audit Finance | fund, forecast or restructure | M3 |
| Audit UX | improve a journey or conversion | M2 |
| Audit Technology | invest, scale, migrate or remediate | M3 |
| Audit Cyber | accept, remediate or block risk | M3/M4 |
| Audit Business Plan | approve and finance a plan | M3 |
| Audit SaaS | judge recurring model quality | M3 |
| Audit Pricing | choose unit, architecture and levels | M2/M3 |
| Audit Competitive Intelligence | attack, defend, avoid or partner | M2 |
| Audit Due Diligence | invest, acquire, sell or pass | M4 |

## 2. Audit Strategy

**Objective:** select a coherent choice of where to play, how to win, required capabilities and exclusions.

**Inputs:** mandate, performance baseline, market/customer evidence, capabilities, economics, constraints, stakeholder map.

**Method:** decision tree → external/internal fact base → strategic alternatives → capability/economic tests → scenarios → choice → execution system.

**Validation:** at least three real alternatives; status quo; explicit trade-offs; capability and financial feasibility; weight sensitivity; contrary view.

**Deliverables:** strategy decision memo, choice cascade, capability gaps, strategic roadmap, scorecard.

**Evidence:** M2 minimum; no SWOT-only conclusion; recommendation confidence ≥C3 or conditional.

## 3. Audit Market

**Objective:** quantify and explain accessible demand and market evolution.

**Inputs:** market definition, official statistics, company/account universe, prices/spend, adoption, regulation, primary research.

**Method:** boundary → top-down and bottom-up sizing → segmentation → demand drivers → maturity/profit pools → competition/substitutes → SOM capacity → scenarios.

**Validation:** TAM≥SAM≥SOM; no arbitrary SOM share; units/time/currency reconciled; source coverage; sensitivity to eligibility, price and penetration.

**Deliverables:** market fact book, sizing model, segment matrix, trend/regulation map, entry recommendation.

**Evidence:** material size claims triangulated; confidence by segment, not one global label.

## 4. Audit Product

**Objective:** determine whether product value, adoption and roadmap support strategy and economics.

**Inputs:** product analytics, interviews, roadmap, support, contracts, benchmark, architecture dependencies.

**Method:** ICP/JTBD → journey → atomic capability taxonomy → evidence-state benchmark → adoption/cohorts → economics → moat → roadmap feasibility.

**Validation:** claimed/current/roadmap separated; critical jobs observed; unknown features not scored zero; adoption and retention linked to economic value.

**Deliverables:** product diligence report, feature matrix, gap heatmap, roadmap priorities, build/buy/partner decisions.

**Evidence:** production or reproducible demo for “available”; behavioral data for “proven”.

## 5. Audit Finance

**Objective:** assess financial integrity, sustainability, liquidity and value.

**Inputs:** ledger, statements, contracts, billing, bank, tax, payroll, budget, debt, cap table, operational drivers.

**Method:** source reconciliation → QoE → revenue/margin cohorts → working capital/debt-like → driver forecast → scenarios → funding → valuation.

**Validation:** P&L/cash/balance consistency; formulas and checks; normalized vs reported bridge; downside liquidity; valuation triangulation.

**Deliverables:** financial diligence report, model, QoE bridge, cash/funding plan, valuation range.

**Evidence:** M3; legal/accounting opinions escalated to qualified professionals.

## 6. Audit UX

**Objective:** identify journey failures that materially affect adoption, conversion, efficiency, trust or accessibility.

**Inputs:** personas, analytics, session evidence, task scripts, support, accessibility requirements, benchmark.

**Method:** journey map → task testing → heuristic/accessibility review → funnel/error analysis → severity → prototype/test → KPI baseline.

**Validation:** representative tasks/personas; observed behavior separated from expert judgment; severity reproducible; proposed fix retested.

**Deliverables:** UX audit, evidence captures, issue backlog, prioritized experiments, measurement plan.

**Evidence:** M2; screenshots alone do not prove usability.

## 7. Audit Technology

**Objective:** determine whether technology can securely and economically deliver the business thesis.

**Inputs:** architecture, code, repos, cloud, data, observability, incidents, roadmap, team, costs, vendor contracts.

**Method:** thesis-to-capability map → architecture/code/data/SDLC/scale/team review → debt and resilience → cost/remediation → roadmap.

**Validation:** deployed reality sampled; growth assumptions load-tested or bounded; remediation cost/timing; business impact for every red flag.

**Deliverables:** TDD report, architecture maps, maturity scorecard, red flags, remediation and investment plan.

**Evidence:** M3; no pass based on interviews alone.

## 8. Audit Cyber

**Objective:** measure current and target cyber posture and decide residual-risk treatment.

**Inputs:** policies, assets, data, IAM, configs, vulnerabilities, logs, incidents, continuity, suppliers, insurance, regulatory scope.

**Method:** risk context → NIST CSF current/target profiles → control design/implementation/operation → ASVS sampling → threat scenarios → remediation.

**Validation:** evidence of operating controls; scope and sampling stated; critical exposures verified; residual risk accepted by authority.

**Deliverables:** cyber risk assessment, profile gap, control evidence matrix, remediation plan, executive risk decision.

**Evidence:** M3/M4; NSIOS output is not certification or penetration-test attestation.

## 9. Audit Business Plan

**Objective:** determine whether the plan is operationally derived, financeable and resilient.

**Inputs:** prices, funnel, cohorts, capacity, hiring, costs, cash, financing, market and product evidence.

**Method:** reconstruct revenue from drivers → COGS/gross margin → workforce/capacity → cash/BFR → scenarios → point mort → funding → milestones.

**Validation:** no target-driven revenue; churn/discount/impayés/timing included; hiring triggers; monthly first 24 months; stress survival.

**Deliverables:** investor/bank business plan, integrated model, assumptions register, funding plan, scenario dashboard.

**Evidence:** M3; every material assumption sourced or marked hypothesis with validation plan.

## 10. Audit SaaS

**Objective:** assess recurring revenue quality, unit economics and scalability.

**Inputs:** contracts, billing, product events, cohorts, support/cloud, sales/marketing, renewals, pipeline.

**Method:** normalize ARR/MRR → cohort churn/NRR → CAC/payback/LTV → gross margin/cost to serve → growth efficiency → concentration → runway.

**Validation:** definitions consistent; annual prepayments separated from revenue; services excluded from ARR; cohorts reconcile to ledger/billing.

**Deliverables:** SaaS quality report, metric dictionary, cohort pack, unit-economics model, value/risk drivers.

**Evidence:** M3; LTV capped or scenario-tested when cohort history is short.

## 11. Audit Pricing

**Objective:** select value metric, packaging, price levels, discounts and monetization rules.

**Inputs:** customer value, WTP research, realized prices, competitors, costs, usage, segments, churn/win-loss.

**Method:** value metric candidates → segmentation/WTP → competitive normalization → cost floor → ≥5 architectures → elasticity → unit economics → governance.

**Validation:** each price justified by value, benchmark, cost, margin, conversion, churn, upsell and competitive risk; grandfathering/discount rules.

**Deliverables:** pricing study, package grid, price waterfall, sensitivity, migration and test plan.

**Evidence:** M2/M3; list prices are not realized prices; conjoint/Gabor-Granger outputs require sampling disclosure.

## 12. Audit Competitive Intelligence

**Objective:** identify real competitors and determine attack, defend, avoid or partner posture.

**Inputs:** official materials, pricing, product tests, customer evidence, filings, funding, hiring, partnerships, reviews.

**Method:** universe → strategic groups → canonical profiles → normalized benchmark → battle map → likely moves → response options.

**Validation:** substitutes/no-decision included; claim vs proof separated; dated profiles; coverage score; competitor not inferred from name recognition.

**Deliverables:** landscape, profiles, matrix, battlecards, early-warning indicators, strategic posture.

**Evidence:** M2; low-confidence actors remain radar items, not scored facts.

## 13. Audit Due Diligence

**Objective:** support an invest/acquire/sell/pass decision and price/terms under information asymmetry.

**Inputs:** data room, management plan, contracts, customers, market, product, technology, cyber, financials, legal/tax specialist outputs.

**Method:** investment thesis → critical questions → integrated CDD/PDD/TDD/FDD/cyber/operations → business-plan reconstruction → valuation/returns → downside → conditions → 100-day plan.

**Validation:** independent plan; customer and technology evidence cross-linked; QoE and cash; bear case; deal breakers; reviewer dissent; information gaps priced or conditioned.

**Deliverables:** red-flag flash, full diligence report, investment memo, model, risk/conditions schedule, value creation plan.

**Evidence:** M4; formal committee record; specialist sign-off where regulated.

## 14. Proof levels

| Level | Meaning | Permitted wording |
|---:|---|---|
| P0 | no evidence | “unknown” |
| P1 | single indirect/marketing source | “claimed/reported” |
| P2 | corroborated documentary evidence | “supported” |
| P3 | direct reproducible or operational evidence | “demonstrated” |
| P4 | longitudinal/independent operating evidence | “proven within scope” |

Critical M4 findings require P3 where access permits. If access prevents P3, the report must convert the gap into a condition, price adjustment, holdback, limitation or no-go—not silently raise confidence.
