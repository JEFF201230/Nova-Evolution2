# NOVA V2 Financial Assumptions

## Document Status

STRICT FINANCIAL BASELINE.

## Purpose

This document defines the assumptions used to build the NOVA financial model. Every number below is explicit and reproducible. No value is intended as a final market claim; all are directional planning assumptions tied back to the V2 strategy documents and the investment memorandum.

## Traceability

Primary sources:

- `Docs/22_NOVA_V2_STRATEGY/14_INVESTMENT_MEMORANDUM.md`
- `Docs/22_NOVA_V2_STRATEGY/13_MARKET_ANALYSIS.md`
- `Docs/22_NOVA_V2_STRATEGY/05_PRODUCT_STRATEGY.md`
- `Docs/22_NOVA_V2_STRATEGY/06_BUSINESS_MODEL.md`
- `Docs/22_NOVA_V2_STRATEGY/11_RELEASE_ROADMAP.md`

Market references used in the strategy pack:

- McKinsey generative AI value estimate, cited in the market analysis pack
- Gartner agentic AI market shift, cited in the market analysis pack
- KPMG AI Pulse governance and economics emphasis, cited in the market analysis pack

## Macroeconomic Assumptions

| Assumption | Value | Why it is used |
| --- | ---: | --- |
| Inflation | 3.0% | Planning baseline for SaaS pricing and operating cost inflation |
| Wage inflation | 4.5% | Commercial and product hiring inflation in enterprise software markets |
| Currency basis | USD | Matches the investment memo and pricing model |
| Discount rate | Not used in this model | The model is an operating case, not a DCF |
| Tax rate | Not used in EBITDA view | EBITDA is pre-tax |
| FX volatility | Ignored | Single-currency planning simplification |

## Market Assumptions

| Assumption | Value | Why it is used |
| --- | ---: | --- |
| Target segment growth | 25% CAGR | Market analysis positions governed agentic execution as a fast-growing category |
| Enterprise AI budget expansion | 15% to 20% annual growth | Buyers continue to spend, but require ROI proof |
| Adoption ramp | Design partner -> pilot -> enterprise -> platform | Matches the release roadmap |
| Sales cycle | 3 to 9 months | Enterprise pilot to annual contract timing |
| Procurement friction | Moderate | Governance-heavy product needs security and legal review |

## TAM / SAM / SOM Assumptions

| Assumption | Value | Why it is used |
| --- | ---: | --- |
| TAM | USD 180B | Midpoint directional estimate across AI governance, workflow automation, agentic execution, and adjacent enterprise AI operations |
| SAM | USD 18B | 10% of TAM, limited to reachable regulated mid-market and enterprise execution accounts in the first wave |
| SOM base case | USD 60M ARR | 0.33% of SAM after 5 years |
| SOM ambitious case | USD 120M ARR | 0.67% of SAM after 5 years |
| SOM exceptional case | USD 150M ARR | 0.83% of SAM after 5 years |

## Pricing Assumptions

| Product / Plan | Annual price assumption | Use in model |
| --- | ---: | --- |
| Pilot | USD 25k to 75k | Design partner entry point |
| Team | USD 60k to 150k | Small team commercial package |
| Enterprise | USD 180k to 500k | Main revenue band in base case |
| Regulated Enterprise | USD 500k+ | Upper-end deal band |
| Blended ARPA Year 1 | USD 120k | Early pilots and first annual contracts |
| Blended ARPA Year 5 | USD 229k | Mix shift to enterprise and regulated enterprise |
| Services attach rate Year 1 | USD 160k per new logo | High implementation effort at launch |
| Services attach rate Year 5 | USD 38k per new logo | Delivery reuse and packaging lower delivery cost |

## Growth Assumptions

### Customer Growth Formula

```
Customers_t = round(Customers_(t-1) * (1 - churn) + new_logos_t)
```

Assumed annual new logos in the base case:

- Year 1: 5
- Year 2: 16
- Year 3: 29
- Year 4: 80
- Year 5: 145

Assumed annual churn:

- Logo churn: 7.0%
- Logo retention: 93.0%

### Upsell Formula

```
NRR = (1 - logo_churn) * (1 + expansion_rate)
```

Assumptions:

- expansion rate on retained accounts: 30.0%
- base-case NRR: 120.9%

## Recruitment Assumptions

Commercial hiring is staged to match revenue growth and sales cycle length.

| Year | AEs | SDRs | Solutions Engineers | CSMs | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Year 1 | 1 | 1 | 1 | 1 | Founder-led selling plus first pilot coverage |
| Year 2 | 2 | 2 | 2 | 2 | Early repeatability and pilot conversion |
| Year 3 | 4 | 3 | 3 | 4 | Move toward enterprise pipeline coverage |
| Year 4 | 6 | 5 | 4 | 7 | Scale mid-market and enterprise closings |
| Year 5 | 10 | 7 | 6 | 12 | Multi-region scale and retention coverage |

Commercial efficiency assumptions:

- fully loaded AE cost: USD 180k to 240k per year
- fully loaded SDR cost: USD 90k to 130k per year
- fully loaded CSM cost: USD 140k to 180k per year
- fully loaded Solutions Engineer cost: USD 150k to 220k per year

## Infrastructure Assumptions

Infrastructure is modeled as direct cost and includes cloud, storage, observability, model routing overhead, and sandbox cost.

| Assumption | Year 1 | Year 5 | Notes |
| --- | ---: | ---: | --- |
| Cloud infrastructure per active customer | USD 6k | USD 4k | Scale and efficiency improve unit cost |
| Model / inference cost per active customer | USD 4k | USD 2k | Prompt compression, caching, routing, local fallback |
| Observability and logging overhead | USD 1k | USD 700 | Audit and traceability stay mandatory |
| Security / deployment overhead | USD 1k | USD 1.3k | Enterprise controls and compliance support |

## AI Assumptions

| Assumption | Value | Notes |
| --- | ---: | --- |
| Primary model strategy | Multi-provider | Vendor independence is mandatory |
| AI cost as share of revenue | 6% to 10% | Decreases as routing and caching improve |
| Prompt reuse rate | Increases annually | Standardization reduces token cost |
| Sensitive-workload routing | On-prem/private cloud where required | Required for regulated customers |
| Fallback behavior | Lower-cost model or human workflow | Avoids service outage as a hard blocker |

## Support Assumptions

| Assumption | Value | Notes |
| --- | ---: | --- |
| Onboarding / deployment support | High in Year 1, declining thereafter | Product packaging reduces hand-holding |
| Customer support load | 1 CSM per 20 to 30 active enterprise accounts | Enterprise-style support model |
| Escalation rate | Highest in Year 1, then declines | Learning curve and packaging improve |

## Services Assumptions

| Assumption | Value | Notes |
| --- | ---: | --- |
| Implementation fee | USD 25k to 160k per new logo | Depends on segment and deployment mode |
| Training fee | USD 10k to 50k per engagement | Optional, but likely in enterprise deals |
| Custom integration fee | USD 15k to 100k | Depends on system complexity |
| Services gross margin | 35% to 50% | Delivery requires labor but reuses assets |

## Cost Assumptions

### Direct Costs

| Cost type | Year 1 | Year 5 | Why it is used |
| --- | ---: | ---: | --- |
| Cloud infrastructure | USD 0.12M | USD 1.50M | Scales with usage |
| Model / inference | USD 0.08M | USD 1.20M | Scales with mission volume and context length |
| Direct support / onboarding | USD 0.15M | USD 1.80M | Enterprise pilots require direct help |
| Services delivery | USD 0.17M | USD 9.20M | Professional services to implement and configure |
| Total direct costs | USD 0.52M | USD 13.70M | Sum of direct costs |

### Operating Expenses

| Cost type | Year 1 | Year 5 | Why it is used |
| --- | ---: | ---: | --- |
| Sales and marketing | USD 1.8M | USD 12.0M | Customer acquisition and market creation |
| Product / R&D | USD 1.8M | USD 5.2M | Platform, UI, AI gateway, governance, integrations |
| G&A and compliance | USD 0.5M | USD 1.8M | Finance, legal, security, admin |
| Total operating expenses | USD 4.1M | USD 19.0M | Sum of operating expenses |

## Financial Formula Set

```
ARR_t = Customers_t * ARPA_t
MRR_t = ARR_t / 12
Revenue_t = ARR_t + Services_t
Gross Profit_t = Revenue_t - Direct Costs_t
Gross Margin_t = Gross Profit_t / Revenue_t
EBITDA_t = Gross Profit_t - Operating Expenses_t
Cash Burn_t = max(0, -EBITDA_t)
Runway Months_t = Cash Available / Monthly Burn
```

## Base-Case Assumptions Summary

| Metric | Value |
| --- | ---: |
| 5-year customers | 262 |
| 5-year ARR | USD 60.0M |
| 5-year services | USD 5.5M |
| 5-year revenue | USD 65.5M |
| 5-year gross margin | 79.1% |
| 5-year EBITDA simplified | USD 32.8M |
