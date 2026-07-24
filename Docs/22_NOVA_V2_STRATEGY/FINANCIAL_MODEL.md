# NOVA V2 Financial Model

## Document Status

BASE CASE MODEL.

## Purpose

This model turns the assumptions into a reproducible 5-year financial view. Every number below is derived from explicit assumptions in `FINANCIAL_ASSUMPTIONS.md`.

## Formula Reference

```
Customers_t = round(Customers_(t-1) * (1 - churn) + new_logos_t)
ARR_t = Customers_t * ARPA_t
MRR_t = ARR_t / 12
Revenue_t = ARR_t + Services_t
Gross Profit_t = Revenue_t - Direct Costs_t
Gross Margin_t = Gross Profit_t / Revenue_t
EBITDA_t = Gross Profit_t - Operating Expenses_t
Cash Burn_t = max(0, -EBITDA_t)
Runway Months_t = Cash Available / Monthly Burn
Funding Need = max cumulative negative cash + safety buffer
```

## Base-Case Customer Build

| Year | New logos | Churn | Ending customers | Blended ARPA |
| --- | ---: | ---: | ---: | ---: |
| Year 1 | 5 | 7.0% | 5 | USD 120k |
| Year 2 | 16 | 7.0% | 20 | USD 150k |
| Year 3 | 29 | 7.0% | 49 | USD 200k |
| Year 4 | 80 | 7.0% | 126 | USD 222k |
| Year 5 | 145 | 7.0% | 262 | USD 229k |

Ending customers are rounded from the formula in the assumptions pack.

## 5-Year Financial Table

All monetary values are in USD millions unless stated otherwise.

| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Customers | 5 | 20 | 49 | 126 | 262 |
| ARR | 0.60 | 3.00 | 9.80 | 28.00 | 60.00 |
| MRR | 0.05 | 0.25 | 0.82 | 2.33 | 5.00 |
| Services | 0.80 | 1.20 | 2.00 | 3.50 | 5.50 |
| Total Revenue | 1.40 | 4.20 | 11.80 | 31.50 | 65.50 |
| Direct Costs | 0.52 | 1.10 | 2.90 | 7.20 | 13.70 |
| Gross Profit | 0.88 | 3.10 | 8.90 | 24.30 | 51.80 |
| Gross Margin | 62.9% | 73.8% | 75.4% | 77.1% | 79.1% |
| Sales and Marketing | 1.80 | 2.60 | 4.90 | 7.50 | 12.00 |
| Product / R&D | 1.80 | 2.30 | 3.00 | 4.00 | 5.20 |
| G&A / Compliance | 0.50 | 0.80 | 1.00 | 1.30 | 1.80 |
| Operating Expenses | 4.10 | 5.70 | 8.90 | 12.80 | 19.00 |
| EBITDA simplified | -3.22 | -2.60 | 0.00 | 11.50 | 32.80 |
| Cash Burn | 3.22 | 2.60 | 0.00 | 0.00 | 0.00 |

## Runway and Financing

### Runway Formula

```
Runway Months = Cash Available / Monthly Burn
Monthly Burn = Cash Burn / 12
```

### Funding Case

Assumption:

- initial cash reserve or financing package: USD 10.0M
- target safety buffer: 25%

### Runway Calculation

| Year | Annual burn | Monthly burn | Remaining cash after burn on USD 10M | Runway months after burn |
| --- | ---: | ---: | ---: | ---: |
| Year 1 | 3.22 | 0.27 | 6.78 | 25.1 |
| Year 2 | 2.60 | 0.22 | 4.18 | 19.0 |
| Year 3 | 0.00 | 0.00 | 4.18 | n/a |
| Year 4 | 0.00 | 0.00 | 4.18 | n/a |
| Year 5 | 0.00 | 0.00 | 4.18 | n/a |

### Funding Need

Simplified funding need:

- cumulative negative EBITDA through break-even: USD 5.82M
- safety buffer at 25%: USD 1.46M
- launch and working capital reserve: USD 2.00M
- recommended financing need: USD 9.28M
- rounded planning budget: USD 10.0M

## Base-Case Interpretation

The base case reaches EBITDA break-even in Year 3 and ends Year 5 with a strongly positive simplified EBITDA profile. The model assumes controlled direct costs, repeatable implementation, and a high-margin software mix by Year 5.

