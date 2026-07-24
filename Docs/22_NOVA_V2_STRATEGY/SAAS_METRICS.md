# NOVA V2 SaaS Metrics

## Document Status

BASE CASE METRICS.

## Purpose

This document defines the SaaS metrics used to interpret the base-case financial model.

## Formula Reference

```
CAC = (Sales and Marketing + pre-sales + launch cost) / new customers acquired
LTV = ARPA * Gross Margin / Churn
LTV/CAC = LTV / CAC
Gross Margin = (Revenue - Direct Costs) / Revenue
NRR = (1 - logo churn) * (1 + expansion rate)
Logo Retention = 1 - logo churn
Magic Number = ARR growth in year n / Sales and Marketing spend in year n-1
Rule of 40 = revenue growth rate + EBITDA margin
Payback = CAC / Monthly Gross Profit per customer
Expansion Revenue = Beginning ARR * expansion rate
```

## Assumptions Used for Metrics

| Assumption | Value | Source |
| --- | ---: | --- |
| Blended ARPA | USD 229k | Year 5 base-case model |
| Gross margin | 79.1% | Year 5 base-case model |
| Logo churn | 7.0% | Financial assumptions |
| Logo retention | 93.0% | Financial assumptions |
| Expansion rate | 30.0% | Financial assumptions |
| CAC | USD 135k | Blended enterprise acquisition cost |

## Core Metrics

| Metric | Value | How it is calculated |
| --- | ---: | --- |
| CAC | USD 135k | Sales and marketing plus pre-sales effort divided by new customers acquired |
| LTV | USD 2.58M | 229k x 79.1% / 7.0% |
| LTV/CAC | 19.1x | 2.58M / 135k |
| Gross Margin | 79.1% | From base-case Year 5 model |
| Net Revenue Retention | 120.9% | 93.0% x 130.0% |
| Logo Retention | 93.0% | 1 - 7.0% churn |
| Magic Number | 1.39x | Year 3 ARR growth of 6.80M divided by Year 2 S&M of 4.90M |
| Rule of 40 | 226.7% | Year 3 ARR growth 226.7% plus EBITDA margin 0.0%; this is an early-stage launch metric, not the primary decision gate |
| Payback | 8.8 months | 135k / (229k x 79.1% / 12) |
| Expansion Revenue | USD 18.0M gross opportunity | Year 5 beginning ARR 60.0M x 30.0% expansion rate; net expansion after 7.0% churn is 16.7M |

## Metric Interpretation

### CAC

The CAC assumption is intentionally enterprise-like. It includes sales effort, pre-sales work, pilot support, and launch friction. A lower CAC would only be credible if the product becomes much more self-serve than the current V2 strategy expects.

### LTV

LTV is high because the product is expected to have strong retention, a high ARPA mix, and a meaningful expansion motion. The formula assumes recurring revenue economics, not a one-off services business.

### LTV/CAC

An LTV/CAC ratio above 3x is healthy. The base case at 19.1x indicates a strong enterprise SaaS profile, but it also implies that the bigger risk is not unit economics; it is go-to-market execution and product-market fit timing.

### NRR and Logo Retention

The base case assumes 7% logo churn and 30% expansion on retained accounts. That produces 120.9% NRR, which is strong enough to support efficient growth if product quality and customer success remain high.

### Magic Number

The annual proxy Magic Number is calculated from the Year 2 to Year 3 ARR jump divided by Year 2 sales and marketing spend. A value above 1.0 suggests efficient growth. The base case is above that threshold.

### Rule of 40

The base-case model exceeds the Rule of 40 starting in Year 3. That reflects the intended profile of a high-growth enterprise SaaS platform with improving margin structure.

### Payback

An 8.8 month payback is consistent with enterprise software economics if the deal size is real and the product can retain and expand within the account.

## SaaS Metrics Validation

The metrics are coherent with the base-case financial model if:

- annual churn stays at or below 7%;
- average ARR per customer continues to increase through mix shift and upsell;
- services remain disciplined and reusable;
- model and infrastructure costs decline as a share of revenue;
- the commercial team scales without inflating CAC faster than ARPA.
